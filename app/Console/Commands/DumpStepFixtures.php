<?php

namespace App\Console\Commands;

use App\Models\FunnelStep;
use Illuminate\Console\Attributes\Description;
use Illuminate\Console\Attributes\Signature;
use Illuminate\Console\Command;

/**
 * Playwright fixture dumper: prints one FunnelStep id per template_key +
 * step_type as a JSON map so the e2e globalSetup can pick a known-good step
 * for each template without hardcoding UUIDs.
 *
 * Usage: php artisan test:dump-step-fixtures
 */
#[Signature('test:dump-step-fixtures')]
#[Description('Emit steps.json fixture for Playwright e2e tests')]
class DumpStepFixtures extends Command
{
    public function handle(): int
    {
        $byTemplate = [];

        FunnelStep::query()->whereNotNull('page_content')->get()->each(function (FunnelStep $s) use (&$byTemplate) {
            $key = is_array($s->page_content) ? ($s->page_content['template_key'] ?? null) : null;
            if (! $key) {
                return;
            }
            $byTemplate[$key] ??= [];
            if (! isset($byTemplate[$key][$s->step_type])) {
                $byTemplate[$key][$s->step_type] = $s->id;
            }
        });

        $this->line((string) json_encode($byTemplate, JSON_PRETTY_PRINT | JSON_UNESCAPED_SLASHES));

        return self::SUCCESS;
    }
}
