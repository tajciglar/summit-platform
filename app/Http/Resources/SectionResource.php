<?php

namespace App\Http\Resources;

use Illuminate\Http\Request;
use Illuminate\Http\Resources\Json\JsonResource;

/**
 * Single block-builder section as consumed by Next.js. The shape mirrors
 * next-app/src/lib/blocks/types.ts::Section. Inputs come from raw JSON
 * columns (landing_page_drafts.sections / .blocks), so every field is
 * defensively normalized — unknown or malformed sections are still returned
 * with sensible defaults rather than crashing the response.
 */
class SectionResource extends JsonResource
{
    /**
     * @param  array<string, mixed>|mixed  $resource
     */
    public function __construct($resource)
    {
        parent::__construct($resource);
    }

    public function toArray(Request $request): array
    {
        $data = is_array($this->resource) ? $this->resource : [];

        return [
            'id' => isset($data['id']) ? (string) $data['id'] : '',
            'type' => isset($data['type']) ? (string) $data['type'] : 'unknown',
            'jsx' => isset($data['jsx']) ? (string) $data['jsx'] : '',
            'fields' => is_array($data['fields'] ?? null) ? array_values($data['fields']) : [],
            'css' => isset($data['css']) ? (string) $data['css'] : null,
            'status' => in_array($data['status'] ?? null, ['ready', 'regenerating', 'failed'], true)
                ? $data['status']
                : 'ready',
            'regeneration_note' => isset($data['regeneration_note']) ? (string) $data['regeneration_note'] : null,
            'source_section_id' => isset($data['source_section_id']) ? (string) $data['source_section_id'] : null,
        ];
    }
}
