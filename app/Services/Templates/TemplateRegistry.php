<?php

namespace App\Services\Templates;

class TemplateRegistry
{
    /** @var array<string, array{key:string, label:string, thumbnail:string, tags:array, jsonSchema:array}> */
    private array $templates;

    public function __construct(?string $manifestPath = null)
    {
        $path = $manifestPath ?? base_path('next-app/public/template-manifest.json');
        if (! is_file($path)) {
            throw new \RuntimeException("Template manifest not found at {$path}. Run `pnpm build:templates` in next-app.");
        }
        $raw = file_get_contents($path);
        if ($raw === false) {
            throw new \RuntimeException("Could not read template manifest at {$path}.");
        }
        $manifest = json_decode($raw, associative: true);
        if (! is_array($manifest)) {
            throw new \RuntimeException("Template manifest at {$path} is not valid JSON.");
        }
        $this->templates = collect($manifest['templates'] ?? [])->keyBy('key')->all();
    }

    /** @return list<string> */
    public function allKeys(): array
    {
        return array_keys($this->templates);
    }

    /** @return array{key:string, label:string, thumbnail:string, tags:array, jsonSchema:array} */
    public function get(string $key): array
    {
        if (! isset($this->templates[$key])) {
            throw new \InvalidArgumentException("Unknown template key: {$key}");
        }

        return $this->templates[$key];
    }

    public function exists(string $key): bool
    {
        return isset($this->templates[$key]);
    }

    public function supportsSections(string $key): bool
    {
        $t = $this->get($key);

        return isset($t['supportedSections']) && is_array($t['supportedSections']);
    }

    /**
     * A template supports per-section editing when the manifest carries
     * `sectionSchemas` (catalog-backed). Monolithic templates like
     * `indigo-gold` advertise `supportedSections` for the enable/disable
     * toggle + render-time ordering, but their section bodies are still
     * edited through the legacy whole-schema form.
     */
    public function supportsSectionEditing(string $key): bool
    {
        $t = $this->get($key);

        return isset($t['sectionSchemas'])
            && is_array($t['sectionSchemas'])
            && $t['sectionSchemas'] !== [];
    }

    /** @return list<string> */
    public function supportedSections(string $key): array
    {
        $t = $this->get($key);

        return $t['supportedSections'] ?? [];
    }

    /** @return list<string> */
    public function sectionOrder(string $key): array
    {
        $t = $this->get($key);

        return $t['sectionOrder'] ?? [];
    }

    /** @return list<string> */
    public function defaultEnabledSections(string $key): array
    {
        $t = $this->get($key);

        return $t['defaultEnabledSections'] ?? [];
    }

    /** @return list<string> */
    public function defaultSalesSections(string $key): array
    {
        $t = $this->get($key);

        return $t['defaultSalesSections'] ?? [];
    }

    /** @return array<string, array<string, mixed>> */
    public function sectionSchemas(string $key): array
    {
        $t = $this->get($key);

        return $t['sectionSchemas'] ?? [];
    }
}
