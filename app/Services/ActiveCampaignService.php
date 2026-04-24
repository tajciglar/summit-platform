<?php

namespace App\Services;

use Illuminate\Http\Client\RequestException;
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
        if ($id = $this->findTagId($tagName)) {
            return $id;
        }

        try {
            $created = $this->request('POST', '/api/3/tags', [
                'tag' => [
                    'tag' => $tagName,
                    'tagType' => 'contact',
                ],
            ]);

            return (string) $created['tag']['id'];
        } catch (RequestException $e) {
            // AC returns 422 "Duplicate entry" when the tag already exists but
            // our search missed it (e.g. multi-word names where AC's search
            // tokenizer doesn't produce an exact match). Re-resolve via the
            // paginated list and return the existing ID.
            if ($e->response?->status() === 422 && str_contains((string) $e->response?->body(), 'Duplicate entry')) {
                if ($id = $this->findTagId($tagName)) {
                    return $id;
                }
            }
            throw $e;
        }
    }

    /**
     * Case-insensitive exact-match lookup against /api/3/tags. Uses Laravel's
     * query-array encoding (spaces → %20), which AC's search endpoint needs
     * for multi-word tag names — `urlencode()` emits `+` and AC treats that
     * as a literal character, silently missing any tag with spaces in it.
     */
    private function findTagId(string $tagName): ?string
    {
        $response = $this->request('GET', '/api/3/tags', ['search' => $tagName, 'limit' => 100]);

        foreach ($response['tags'] ?? [] as $tag) {
            if (strcasecmp((string) ($tag['tag'] ?? ''), $tagName) === 0) {
                return (string) $tag['id'];
            }
        }

        return null;
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
