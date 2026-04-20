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
        $this->baseUrl = rtrim(config('services.activecampaign.url', ''), '/');
        $this->apiKey = config('services.activecampaign.key', '');
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

            Log::info('ActiveCampaign contact synced', ['email' => $email, 'tags' => $tagIds]);

            return (string) $contactId;
        } catch (\Throwable $e) {
            Log::error('ActiveCampaign sync failed', ['email' => $email, 'error' => $e->getMessage()]);

            return '';
        }
    }

    private function findOrCreateContact(string $email, string $name): int
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

    private function addTag(int $contactId, int|string $tagId): void
    {
        $this->request('POST', '/api/3/contactTags', [
            'contactTag' => [
                'contact' => $contactId,
                'tag' => $tagId,
            ],
        ]);
    }

    private function request(string $method, string $path, array $data = []): array
    {
        $response = Http::withHeaders(['Api-Token' => $this->apiKey])
            ->$method($this->baseUrl.$path, $data);

        $response->throw();

        return $response->json();
    }
}
