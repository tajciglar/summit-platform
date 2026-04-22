<?php

namespace App\Services\Templates;

use App\Models\Summit;

/**
 * Generates placeholder content for a section's JSON Schema so a just-created
 * step renders in preview without the operator having to fill every required
 * field by hand.
 *
 * Handles:
 *   - strings → humanized field-name placeholder ("Your headline here")
 *   - strings with `enum` → first enum value
 *   - strings with `format: date` → today's ISO date
 *   - arrays of strings with `format: uuid` → real summit speaker IDs
 *   - arrays of objects → N items (minItems, min 1) by recursing into `items`
 *   - objects → recurse into nested `required` properties
 *
 * Only required fields are populated; non-required fields stay absent so the
 * operator can see which slots matter most.
 */
class SectionPlaceholderFiller
{
    /**
     * @param  array<string, mixed>  $sectionSchema
     * @param  list<string>  $speakerIds  Real summit speaker UUIDs used to satisfy `format: uuid` requirements.
     * @param  array<int, list<string>>  $speakersByDay  Speaker IDs grouped by day_number; used to expand multi-day speaker arrays.
     * @return array<string, mixed>
     */
    public function fill(array $sectionSchema, array $speakerIds = [], array $speakersByDay = []): array
    {
        if (($sectionSchema['type'] ?? null) !== 'object') {
            return [];
        }

        return $this->fillObject($sectionSchema, $speakerIds, $speakersByDay);
    }

    /**
     * Build a same-shaped array that fills placeholders for every enabled
     * kebab-case section on the step.
     *
     * @param  array<string, array<string, mixed>>  $sectionSchemas
     * @param  list<string>  $enabledSections
     * @param  list<string>  $speakerIds
     * @param  array<int, list<string>>  $speakersByDay
     * @return array<string, array<string, mixed>>
     */
    public function fillEnabled(array $sectionSchemas, array $enabledSections, array $speakerIds = [], array $speakersByDay = []): array
    {
        $out = [];
        foreach ($enabledSections as $key) {
            $schema = $sectionSchemas[$key] ?? null;
            if (! is_array($schema)) {
                continue;
            }
            $out[$key] = $this->fill($schema, $speakerIds, $speakersByDay);
        }

        return $out;
    }

    /** @return list<string> */
    public static function speakerIdsFor(?string $summitId, int $limit = 6): array
    {
        if (! $summitId) {
            return [];
        }

        $summit = Summit::query()->find($summitId);
        if (! $summit) {
            return [];
        }

        return $summit->speakers()
            ->limit($limit)
            ->pluck('speakers.id')
            ->all();
    }

    /**
     * Speaker UUIDs grouped by pivot `day_number` — used to expand multi-day
     * speakers arrays (e.g. ochre-ink's `speakersByDay`). Speakers not yet
     * slotted to a day on this summit are excluded; callers fall back to
     * the flat `speakerIdsFor()` list when the returned map is empty.
     *
     * @return array<int, list<string>>
     */
    public static function speakersByDayFor(?string $summitId): array
    {
        if (! $summitId) {
            return [];
        }

        $summit = Summit::query()->find($summitId);
        if (! $summit) {
            return [];
        }

        return $summit->speakers()
            ->wherePivotNotNull('day_number')
            ->reorder()
            ->orderByPivot('day_number')
            ->orderByPivot('sort_order')
            ->get()
            ->groupBy(fn ($s) => (int) $s->pivot->day_number)
            ->map(fn ($speakers) => $speakers->pluck('id')->all())
            ->all();
    }

    /**
     * @param  array<string, mixed>  $schema
     * @param  list<string>  $speakerIds
     * @param  array<int, list<string>>  $speakersByDay
     * @return array<string, mixed>
     */
    private function fillObject(array $schema, array $speakerIds, array $speakersByDay = []): array
    {
        /** @var list<string> $required */
        $required = $schema['required'] ?? [];
        /** @var array<string, array<string, mixed>> $properties */
        $properties = $schema['properties'] ?? [];

        $out = [];
        foreach ($required as $name) {
            $propSchema = $properties[$name] ?? null;
            if (! is_array($propSchema)) {
                continue;
            }

            $value = $this->placeholderFor((string) $name, $propSchema, $speakerIds, $speakersByDay);
            if ($value !== null) {
                $out[$name] = $value;
            }
        }

        return $out;
    }

    /**
     * @param  array<string, mixed>  $schema
     * @param  list<string>  $speakerIds
     * @param  array<int, list<string>>  $speakersByDay
     */
    private function placeholderFor(string $name, array $schema, array $speakerIds, array $speakersByDay = []): mixed
    {
        $type = $schema['type'] ?? null;

        if (isset($schema['enum']) && is_array($schema['enum']) && $schema['enum'] !== []) {
            return $schema['enum'][0];
        }

        return match ($type) {
            'string' => $this->placeholderString($name, $schema),
            'integer', 'number' => $this->placeholderNumber($schema),
            'boolean' => false,
            'array' => $this->placeholderArray($name, $schema, $speakerIds, $speakersByDay),
            'object' => $this->fillObject($schema, $speakerIds, $speakersByDay),
            default => null,
        };
    }

    /** @param array<string, mixed> $schema */
    private function placeholderNumber(array $schema): int|float
    {
        $min = $schema['minimum'] ?? 0;

        return is_numeric($min) ? $min + 0 : 0;
    }

    /** @param array<string, mixed> $schema */
    private function placeholderString(string $name, array $schema): string
    {
        $format = $schema['format'] ?? null;

        if ($format === 'date') {
            return now()->format('Y-m-d');
        }

        if ($format === 'date-time') {
            return now()->toIso8601String();
        }

        if ($format === 'uri' || $format === 'url') {
            return 'https://example.com';
        }

        if ($format === 'uuid') {
            return '00000000-0000-0000-0000-000000000000';
        }

        $humanized = $this->humanize($name);
        $min = (int) ($schema['minLength'] ?? 0);
        $max = (int) ($schema['maxLength'] ?? 0);

        // Honor tight length caps (e.g. initials `maxLength: 4`).
        if ($max > 0 && $max <= 4) {
            return strtoupper(substr($humanized, 0, max(1, $max)));
        }

        $value = "Your {$humanized} here";

        return $min > strlen($value) ? str_pad($value, $min, '.') : $value;
    }

    /**
     * @param  array<string, mixed>  $schema
     * @param  list<string>  $speakerIds
     * @param  array<int, list<string>>  $speakersByDay
     * @return list<mixed>
     */
    private function placeholderArray(string $name, array $schema, array $speakerIds, array $speakersByDay = []): array
    {
        $items = $schema['items'] ?? null;
        if (! is_array($items)) {
            return [];
        }

        $minItems = max(1, (int) ($schema['minItems'] ?? 1));
        $maxItems = (int) ($schema['maxItems'] ?? 0);

        // Arrays of speaker UUIDs — pull real IDs from the summit.
        if (($items['type'] ?? null) === 'string' && ($items['format'] ?? null) === 'uuid') {
            if ($speakerIds === []) {
                return [];
            }

            $count = min(count($speakerIds), $maxItems > 0 ? $maxItems : count($speakerIds));
            $count = max($minItems, $count);

            return array_slice($speakerIds, 0, max(1, $count));
        }

        // Multi-day speakers array (e.g. ochre-ink `speakersByDay`): items are
        // objects with a uuid-array `speakerIds` and a `dayLabel` string.
        // Expand one entry per assigned day rather than seeding a single stub.
        if ($this->looksLikeDayGroupedSpeakers($items) && $speakersByDay !== []) {
            $out = [];
            foreach ($speakersByDay as $day => $ids) {
                $entry = $this->fillObject($items, $speakerIds, $speakersByDay);
                $entry['speakerIds'] = $ids;
                $entry['dayLabel'] = "Day {$day}";
                $out[] = $entry;
            }

            return $out;
        }

        $out = [];
        for ($i = 0; $i < $minItems; $i++) {
            if (($items['type'] ?? null) === 'object') {
                $out[] = $this->fillObject($items, $speakerIds, $speakersByDay);
            } else {
                $value = $this->placeholderFor($name.'Item', $items, $speakerIds, $speakersByDay);
                $out[] = $value;
            }
        }

        return $out;
    }

    /**
     * @param  array<string, mixed>  $items
     */
    private function looksLikeDayGroupedSpeakers(array $items): bool
    {
        if (($items['type'] ?? null) !== 'object') {
            return false;
        }

        $props = $items['properties'] ?? [];
        $speakerIdsProp = $props['speakerIds'] ?? null;
        if (! is_array($speakerIdsProp) || ($speakerIdsProp['type'] ?? null) !== 'array') {
            return false;
        }

        $itemsOfArray = $speakerIdsProp['items'] ?? [];
        $isUuidArray = ($itemsOfArray['type'] ?? null) === 'string'
            && ($itemsOfArray['format'] ?? null) === 'uuid';
        if (! $isUuidArray) {
            return false;
        }

        return isset($props['dayLabel']) || isset($props['dayDate']) || isset($props['dayNumber']);
    }

    private function humanize(string $name): string
    {
        $withSpaces = preg_replace('/([a-z0-9])([A-Z])/', '$1 $2', $name) ?? $name;
        $lowered = strtolower(str_replace(['_', '-'], ' ', $withSpaces));

        return trim($lowered);
    }
}
