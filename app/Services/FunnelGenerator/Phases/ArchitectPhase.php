<?php

namespace App\Services\FunnelGenerator\Phases;

use App\Services\FunnelGenerator\AnthropicClient;
use App\Services\FunnelGenerator\Exceptions\ArchitectException;
use App\Services\FunnelGenerator\Tools\ToolBuilder;

class ArchitectPhase
{
    public function __construct(
        private AnthropicClient $client,
        private ToolBuilder $toolBuilder,
    ) {}

    /**
     * @param  array  $brief  ['summit_name','audience','tone','speaker_count','start_date','price_vip']
     * @param  array<int,string>  $stepTypes
     * @return array<string, array<int,string>>  e.g. ['optin' => ['HeroWithCountdown','OptinForm'], …]
     */
    public function run(array $brief, array $catalog, array $stepTypes): array
    {
        $tool = $this->toolBuilder->architectTool($catalog, $stepTypes);

        $system = $this->systemPrompt();
        $cacheBlock = [
            'type' => 'text',
            'text' => 'BLOCK CATALOG (v'.($catalog['version'] ?? 'dev')."):\n".$this->catalogDigest($catalog),
        ];
        if (config('anthropic.prompt_cache')) {
            $cacheBlock['cache_control'] = ['type' => 'ephemeral'];
        }
        $systemBlocks = [
            ['type' => 'text', 'text' => $system],
            $cacheBlock,
        ];

        $response = $this->client->messages([
            'model' => config('anthropic.architect_model'),
            'max_tokens' => config('anthropic.max_tokens', 2048),
            'system' => $systemBlocks,
            'tools' => [$tool],
            'tool_choice' => ['type' => 'tool', 'name' => 'architect_funnel'],
            'messages' => [[
                'role' => 'user',
                'content' => $this->userPrompt($brief),
            ]],
        ]);

        foreach ($response['content'] ?? [] as $block) {
            if (($block['type'] ?? null) === 'tool_use' && ($block['name'] ?? null) === 'architect_funnel') {
                return $block['input'];
            }
        }

        throw new ArchitectException('Architect did not return an architect_funnel tool call.');
    }

    private function systemPrompt(): string
    {
        return <<<'SYS'
You are an expert summit funnel architect. Given a summit brief and a catalog of Next.js block components, you pick the block sequence for each step of the funnel.

Rules:
- Order blocks as they will appear on the page (top to bottom).
- Every funnel must start with a hero-category block and end with an OptinForm-like CTA (for optin), a PaymentForm-like block (for sales_page), an UpsellOffer-like block (for upsell), or a ThankYou-like block (for thank_you).
- Keep optin pages between 4 and 8 blocks. Sales pages 5-10. Upsells 3-5. Thank-you pages 2-4.
- Prefer a mix of categories (hero, social-proof, content, form-cta) over repetition.
- Do NOT include blocks whose purpose conflicts with the summit tone.

Respond ONLY by calling the architect_funnel tool.
SYS;
    }

    private function catalogDigest(array $catalog): string
    {
        $lines = [];
        foreach ($catalog['blocks'] ?? [] as $b) {
            $validOn = implode(',', $b['validOn'] ?? []);
            $purpose = trim(preg_replace('/\s+/', ' ', $b['purpose'] ?? ''));
            $lines[] = "- {$b['type']} (category=".($b['category'] ?? 'unknown').", validOn={$validOn}): {$purpose}";
        }

        return implode("\n", $lines);
    }

    private function userPrompt(array $brief): string
    {
        return "Summit brief:\n".json_encode($brief, JSON_PRETTY_PRINT)."\n\nEmit the full funnel block sequence.";
    }
}
