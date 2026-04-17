<?php

namespace App\Services\Templates;

class TemplateRegistry
{
    /** @var array<string, array{key:string, label:string, thumbnail:string, tags:array, jsonSchema:array}> */
    private array $templates;

    public function __construct(?string $manifestPath = null)
    {
        $path = $manifestPath ?? base_path('next-app/public/template-manifest.json');
        if (!is_file($path)) {
            throw new \RuntimeException("Template manifest not found at {$path}. Run `pnpm build:templates` in next-app.");
        }
        $raw = file_get_contents($path);
        if ($raw === false) {
            throw new \RuntimeException("Could not read template manifest at {$path}.");
        }
        $manifest = json_decode($raw, associative: true);
        if (!is_array($manifest)) {
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
        if (!isset($this->templates[$key])) {
            throw new \InvalidArgumentException("Unknown template key: {$key}");
        }
        return $this->templates[$key];
    }

    public function exists(string $key): bool
    {
        return isset($this->templates[$key]);
    }
}
