<?php

namespace App\Console\Commands;

use App\Models\Domain;
use App\Models\Funnel;
use Illuminate\Console\Attributes\Description;
use Illuminate\Console\Attributes\Signature;
use Illuminate\Console\Command;

/**
 * Playwright helper: finds one (active Domain, active Funnel, published
 * optin step) tuple for the host-routing e2e test. Emits JSON with
 * host / funnelSlug / templateKey so the spec doesn't hardcode UUIDs.
 */
#[Signature('test:pick-public-funnel')]
#[Description('Emit a {host,funnelSlug,templateKey} fixture for Playwright host-routing test')]
class PickPublicFunnel extends Command
{
    public function handle(): int
    {
        foreach (Domain::query()->where('is_active', true)->get() as $domain) {
            $funnel = Funnel::query()
                ->whereIn('summit_id', $domain->summits()->pluck('id'))
                ->where('is_active', true)
                ->whereHas('steps', fn ($q) => $q->where('step_type', 'optin')->where('is_published', true))
                ->first();

            if (! $funnel) {
                continue;
            }

            $step = $funnel->steps()
                ->where('step_type', 'optin')
                ->where('is_published', true)
                ->first();

            $templateKey = is_array($step?->page_content)
                ? ($step->page_content['template_key'] ?? null)
                : null;

            if (! $templateKey) {
                continue;
            }

            $this->line((string) json_encode([
                'host' => $domain->hostname,
                'funnelSlug' => $funnel->slug,
                'templateKey' => $templateKey,
            ], JSON_UNESCAPED_SLASHES));

            return self::SUCCESS;
        }

        $this->line('{}');

        return self::SUCCESS;
    }
}
