<?php

namespace App\Services\Templates;

use App\Models\Speaker;
use Filament\Forms\Components\Repeater;
use Filament\Forms\Components\Select;
use Filament\Forms\Components\Textarea;
use Filament\Forms\Components\TextInput;
use Filament\Schemas\Components\Component;
use Filament\Schemas\Components\Fieldset;

/**
 * Convert a JSON Schema (exported from Zod via the template manifest) into a
 * list of Filament v4 form/schema components suitable for rendering inside a
 * Schema instance.
 *
 * Terminal field state paths are NOT set by the mapper — Filament resolves
 * state paths by walking the component tree. Callers are expected to wrap the
 * mapper output in a Fieldset/container with the appropriate `statePath()` so
 * the scalar fields bind to e.g. `data.content.hero.headline`.
 *
 * The mapper surfaces `required` via the presence of a required indicator,
 * but only enforces server-side validation on fields explicitly marked
 * `$enforceRequired = true` (off by default) — editors frequently save
 * partial drafts and we do not want to block them with validation.
 */
class FilamentSchemaMapper
{
    public function __construct(
        private bool $enforceRequired = false,
    ) {}

    /**
     * @param  array<string, mixed>  $schema  JSON Schema subtree (expects `type: object`).
     * @param  ?string  $summitId  For special-casing speaker ID arrays; pass the funnel's summit id.
     * @return array<int, Component>
     */
    public function map(array $schema, ?string $summitId = null): array
    {
        if (($schema['type'] ?? null) !== 'object' || empty($schema['properties'])) {
            return [];
        }

        /** @var array<int, string> $required */
        $required = $schema['required'] ?? [];
        $out = [];

        foreach ($schema['properties'] as $name => $propSchema) {
            $isRequired = in_array($name, $required, true);
            $out[] = $this->mapProperty((string) $name, (array) $propSchema, $isRequired, $summitId);
        }

        return $out;
    }

    /**
     * @param  array<string, mixed>  $schema
     */
    private function mapProperty(string $name, array $schema, bool $required, ?string $summitId): Component
    {
        // Zod's `.nullable()` / `.optional().nullable()` exports as
        // `anyOf: [<real schema>, {type: null}]`. Unwrap to the real branch so
        // enums (and other typed schemas) still map to their proper widgets.
        $schema = $this->unwrapNullableAnyOf($schema);

        $label = $this->humanizeLabel($name);
        $type = $schema['type'] ?? null;
        $enforceRequired = $required && $this->enforceRequired;

        // Speaker UUID arrays become a multi-select populated from the summit's speakers.
        if ($this->isSpeakerIdArray($name, $schema) && $summitId !== null) {
            $options = Speaker::query()
                ->where('summit_id', $summitId)
                ->get()
                ->mapWithKeys(fn (Speaker $s) => [
                    $s->id => trim("{$s->first_name} {$s->last_name}") !== '' ? "{$s->first_name} {$s->last_name}" : 'Unnamed',
                ])
                ->all();

            $select = Select::make($name)
                ->label($label)
                ->multiple()
                ->options($options)
                ->required($enforceRequired);

            if (isset($schema['maxItems'])) {
                $select->maxItems((int) $schema['maxItems']);
            }

            return $select;
        }

        // Enum -> Select.
        if (isset($schema['enum']) && is_array($schema['enum'])) {
            $enumValues = $schema['enum'];
            $options = array_combine($enumValues, $enumValues) ?: [];

            return Select::make($name)
                ->label($label)
                ->options($options)
                ->required($enforceRequired);
        }

        // Array-of-objects -> Repeater with nested fields.
        if ($type === 'array' && isset($schema['items']) && is_array($schema['items']) && ($schema['items']['type'] ?? null) === 'object') {
            $repeater = Repeater::make($name)
                ->label($label)
                ->schema($this->map($schema['items'], $summitId));

            if (isset($schema['maxItems'])) {
                $repeater->maxItems((int) $schema['maxItems']);
            }
            if ($enforceRequired) {
                $repeater->required();
            }

            return $repeater;
        }

        // Array-of-scalars -> Repeater with a single `value` TextInput per item.
        if ($type === 'array') {
            $repeater = Repeater::make($name)
                ->label($label)
                ->simple(
                    TextInput::make('value')->label(''),
                );

            if (isset($schema['maxItems'])) {
                $repeater->maxItems((int) $schema['maxItems']);
            }

            return $repeater;
        }

        // Nested object -> Fieldset with recursed children.
        if ($type === 'object') {
            return Fieldset::make($label)
                ->schema($this->map($schema, $summitId));
        }

        // Scalar strings: Textarea when long, TextInput otherwise.
        $maxLength = isset($schema['maxLength']) ? (int) $schema['maxLength'] : null;
        $minLength = isset($schema['minLength']) ? (int) $schema['minLength'] : null;

        $component = ($maxLength !== null && $maxLength > 200)
            ? Textarea::make($name)->rows(4)
            : TextInput::make($name);

        $component->label($label)->required($enforceRequired);

        if ($maxLength !== null) {
            $component->maxLength($maxLength);
        }
        if (($schema['format'] ?? null) === 'date') {
            $component->placeholder('YYYY-MM-DD');
        }

        return $component;
    }

    /**
     * @param  array<string, mixed>  $schema
     */
    private function isSpeakerIdArray(string $name, array $schema): bool
    {
        if (! str_contains(strtolower($name), 'speaker')) {
            return false;
        }
        if (($schema['type'] ?? null) !== 'array') {
            return false;
        }
        $items = $schema['items'] ?? null;
        if (! is_array($items)) {
            return false;
        }

        return ($items['format'] ?? null) === 'uuid';
    }

    /**
     * @param  array<string, mixed>  $schema
     * @return array<string, mixed>
     */
    private function unwrapNullableAnyOf(array $schema): array
    {
        $anyOf = $schema['anyOf'] ?? null;
        if (! is_array($anyOf) || count($anyOf) !== 2) {
            return $schema;
        }

        $nonNull = null;
        foreach ($anyOf as $branch) {
            if (! is_array($branch)) {
                return $schema;
            }
            if (($branch['type'] ?? null) === 'null') {
                continue;
            }
            $nonNull = $branch;
        }

        return is_array($nonNull) ? $nonNull : $schema;
    }

    private function humanizeLabel(string $name): string
    {
        // Insert a space between camelCase and convert underscores / hyphens.
        $withSpaces = preg_replace('/([a-z0-9])([A-Z])/', '$1 $2', $name) ?? $name;
        $clean = str_replace(['_', '-'], ' ', $withSpaces);

        return ucwords(strtolower($clean));
    }
}
