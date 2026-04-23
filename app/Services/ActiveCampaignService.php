<?php

namespace App\Services;

use Illuminate\Support\Facades\Http;
use Illuminate\Support\Facades\Log;

class ActiveCampaignService
{
    private string $baseUrl;

    private string $apiKey;

    public function __construct()
    {
        $this->baseUrl = rtrim((string) config('services.activecampaign.url'), '/');
        $this->apiKey = (string) config('services.activecampaign.key');
    }

    /**
     * Find or create a contact by email, then apply tags.
     */
    public function syncContactWithTags(string $email, string $name, array $tagIds): string
    {
        if (! $this->baseUrl || ! $this->apiKey) {
            Log::warning('ActiveCampaign not configured — skipping sync.');

            return '';
        }

        try {
            $contactId = $this->findOrCreateContact($email, $name);

            foreach ($tagIds as $tagId) {
                $this->addTag($contactId, $tagId);
            }

            Log::info('ActiveCampaign contact synced', ['email_hash' => self::hashEmail($email), 'tags' => $tagIds]);

            return (string) $contactId;
        } catch (\Throwable $e) {
            Log::error('ActiveCampaign sync failed', ['email_hash' => self::hashEmail($email), 'error' => $e->getMessage()]);

            return '';
        }
    }

    public function findOrCreateContact(string $email, string $name): int
    {
        $parts = explode(' ', $name, 2);
        $firstName = $parts[0] ?? '';
        $lastName = $parts[1] ?? '';

        $response = $this->request('POST', '/api/3/contact/sync', [
            'contact' => [
                'email' => $email,
                'firstName' => $firstName,
                'lastName' => $lastName,
            ],
        ]);

        return $response['contact']['id'];
    }

    public function addTag(int $contactId, int|string $tagId): void
    {
        $this->request('POST', '/api/3/contactTags', [
            'contactTag' => [
                'contact' => $contactId,
                'tag' => $tagId,
            ],
        ]);
    }

    public function findOrCreateTagByName(string $tagName): string
    {
        $response = $this->request('GET', '/api/3/tags?search='.urlencode($tagName));

        foreach ($response['tags'] ?? [] as $tag) {
            if (strcasecmp($tag['tag'], $tagName) === 0) {
                return (string) $tag['id'];
            }
        }

        $created = $this->request('POST', '/api/3/tags', [
            'tag' => [
                'tag' => $tagName,
                'tagType' => 'contact',
            ],
        ]);

        return (string) $created['tag']['id'];
    }

    public function addContactToList(string $contactId, string $listId): void
    {
        $this->request('POST', '/api/3/contactLists', [
            'contactList' => [
                'contact' => $contactId,
                'list' => $listId,
                'status' => 1,
            ],
        ]);
    }

    public function request(string $method, string $path, array $data = []): array
    {
        $response = Http::withHeaders(['Api-Token' => $this->apiKey])
            ->$method($this->baseUrl.$path, $data);

        $response->throw();

        return $response->json();
    }

    /**
     * Deterministic, non-reversible identifier for log correlation. We use a
     * hash instead of the raw email so logs shipped to Railway / external
     * services don't carry PII, while still letting us trace a single
     * contact's sync events by matching the hash.
     */
    private static function hashEmail(string $email): string
    {
        return substr(hash('sha256', strtolower(trim($email))), 0, 16);
    }
}
