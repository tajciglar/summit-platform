<?php

namespace App\Services;

use App\Enums\BlockType;
use App\Models\Funnel;
use App\Models\FunnelStep;
use App\Models\FunnelStepBump;
use App\Models\Product;
use App\Models\Summit;
use Illuminate\Support\Facades\DB;
use Illuminate\Support\Facades\Log;
use Illuminate\Support\Str;

class FunnelForgeMapper
{
    /**
     * Map a FunnelForge generation result into Eloquent models.
     *
     * @param  array  $record  The raw JSON from FunnelForge /generate
     * @param  Summit  $summit  The summit to attach the funnel to
     * @return Funnel The created funnel with steps and bumps
     */
    public function map(array $record, Summit $summit): Funnel
    {
        $content = $record['content'] ?? $record;
        $summitMeta = $content['summit'] ?? [];
        $eventType = $record['eventType'] ?? 'summit';

        return DB::transaction(function () use ($content, $summitMeta, $summit, $eventType) {
            $funnel = Funnel::create([
                'summit_id' => $summit->id,
                'slug' => Str::slug($summitMeta['name'] ?? $summit->title),
                'name' => $summitMeta['name'] ?? $summit->title,
                'description' => $summitMeta['tagline'] ?? null,
                'target_phase' => 'pre_summit',
                'is_active' => true,
                'theme' => [],
            ]);

            $sortOrder = 0;

            // --- Optin page ---
            if ($optin = $content['optin_page'] ?? null) {
                $this->createStep($funnel, 'optin', 'Opt-in', 'optin', $sortOrder++, $this->optinBlocks($optin, $summitMeta));
            }

            // --- VIP / Sales page ---
            if ($vip = $content['vip_page'] ?? null) {
                $step = $this->createStep($funnel, 'sales_page', 'VIP All-Access', 'vip', $sortOrder++, $this->vipBlocks($vip));

                // Attach bumps
                if ($bumps = $content['bumps'] ?? []) {
                    $this->createBumps($step, $bumps);
                }
            }

            // --- Upsell page ---
            if ($upsell = $content['upsell_page'] ?? null) {
                $this->createStep($funnel, 'upsell', 'Upsell', 'upsell', $sortOrder++, $this->upsellBlocks($upsell));
            }

            // --- Thank you page ---
            if ($thanks = $content['thank_you_page'] ?? null) {
                $this->createStep($funnel, 'thank_you', 'Thank You', 'thank-you', $sortOrder++, $this->thankYouBlocks($thanks));
            }

            Log::info('FunnelForge funnel mapped', [
                'funnel_id' => $funnel->id,
                'summit_id' => $summit->id,
                'steps' => $funnel->steps()->count(),
            ]);

            return $funnel->load('steps.bumps');
        });
    }

    private function createStep(Funnel $funnel, string $stepType, string $name, string $slug, int $sortOrder, array $blocks): FunnelStep
    {
        return FunnelStep::create([
            'funnel_id' => $funnel->id,
            'step_type' => $stepType,
            'template' => 'default',
            'slug' => $slug,
            'name' => $name,
            'content' => ['blocks' => $blocks],
            'sort_order' => $sortOrder,
            'is_published' => true,
        ]);
    }

    private function createBumps(FunnelStep $step, array $bumps): void
    {
        foreach ($bumps as $i => $bump) {
            // Try to find a matching product by name, or create a placeholder
            $product = Product::firstOrCreate(
                ['name' => $bump['name']],
                [
                    'slug' => Str::slug($bump['name']),
                    'summit_id' => $step->funnel->summit_id,
                ]
            );

            FunnelStepBump::create([
                'funnel_step_id' => $step->id,
                'product_id' => $product->id,
                'headline' => $bump['one_line_pitch'] ?? $bump['name'],
                'description' => $bump['description'] ?? null,
                'bullets' => [],
                'checkbox_label' => $bump['checkbox_label'] ?? 'Yes! Add this to my order',
                'sort_order' => $i,
                'is_active' => true,
            ]);
        }
    }

    // ---------------------------------------------------------------
    // Block builders — convert FunnelForge flat fields to Block arrays
    // ---------------------------------------------------------------

    private function optinBlocks(array $optin, array $summitMeta): array
    {
        $blocks = [];

        // Hero
        $blocks[] = [
            'type' => BlockType::Hero->value,
            'headline' => $optin['headline'] ?? '',
            'subheadline' => $optin['subheadline'] ?? '',
            'body' => $this->painPointsHtml($optin),
            'cta_text' => $optin['cta_button'] ?? 'Register Now',
            'style' => 'gradient',
        ];

        // Speaker grid
        $blocks[] = [
            'type' => BlockType::SpeakerGrid->value,
            'heading' => $optin['speaker_headline'] ?? 'Meet Your Speakers',
            'subheading' => $optin['speakers_intro'] ?? '',
            'columns' => '3',
            'show_featured_only' => false,
        ];

        // Social proof / transformation CTA
        $blocks[] = [
            'type' => BlockType::Cta->value,
            'heading' => $optin['transformation_statement'] ?? '',
            'subheading' => $optin['social_proof_line'] ?? '',
            'button_text' => $optin['cta_button'] ?? 'Register Now',
            'style' => 'primary',
        ];

        // Countdown
        $blocks[] = [
            'type' => BlockType::Countdown->value,
            'heading' => $optin['urgency_line'] ?? 'Spots are limited',
            'minutes' => 15,
        ];

        return $blocks;
    }

    private function vipBlocks(array $vip): array
    {
        $blocks = [];

        // Hero
        $blocks[] = [
            'type' => BlockType::Hero->value,
            'headline' => $vip['headline'] ?? '',
            'subheadline' => $vip['subheadline'] ?? '',
            'body' => $vip['who_this_is_for'] ?? '',
            'cta_text' => $vip['cta_button'] ?? 'Get VIP Access',
            'style' => 'gradient',
        ];

        // Value stack as pricing card
        $features = array_map(fn (array $item) => [
            'text' => ($item['item'] ?? '').' — '.$this->formatValue($item['value'] ?? ''),
            'included' => true,
        ], $vip['value_stack'] ?? []);

        $blocks[] = [
            'type' => BlockType::PricingCard->value,
            'heading' => 'Total Value: '.($vip['total_value'] ?? ''),
            'subheading' => 'Your Price: '.($vip['your_price'] ?? ''),
            'features' => $features,
            'cta_text' => $vip['cta_button'] ?? 'Get VIP Access',
        ];

        // FAQ (objections)
        $faqItems = [];
        if ($obj1 = $vip['objection_1'] ?? null) {
            $faqItems[] = ['question' => $obj1['objection'], 'answer' => $obj1['answer']];
        }
        if ($obj2 = $vip['objection_2'] ?? null) {
            $faqItems[] = ['question' => $obj2['objection'], 'answer' => $obj2['answer']];
        }
        if ($faqItems) {
            $blocks[] = [
                'type' => BlockType::Faq->value,
                'heading' => 'Common Questions',
                'items' => $faqItems,
            ];
        }

        // Guarantee + urgency CTA
        $blocks[] = [
            'type' => BlockType::Cta->value,
            'heading' => $vip['guarantee'] ?? '',
            'subheading' => $vip['urgency_line'] ?? '',
            'button_text' => $vip['cta_button'] ?? 'Get VIP Access',
            'style' => 'accent',
        ];

        return $blocks;
    }

    private function upsellBlocks(array $upsell): array
    {
        return [
            [
                'type' => BlockType::UpsellOffer->value,
                'heading' => $upsell['headline'] ?? '',
                'subheading' => $upsell['subheadline'] ?? '',
                'body' => $this->upsellBodyHtml($upsell),
                'accept_text' => $upsell['cta_button'] ?? 'Yes — Add This',
                'decline_text' => $upsell['no_thanks'] ?? 'No thanks, skip this offer',
            ],
        ];
    }

    private function thankYouBlocks(array $thanks): array
    {
        return [
            [
                'type' => BlockType::Hero->value,
                'headline' => $thanks['headline'] ?? 'Thank You!',
                'subheadline' => $thanks['subheadline'] ?? '',
                'body' => $thanks['next_steps'] ?? '',
                'cta_text' => $thanks['community_cta'] ?? '',
                'style' => 'solid',
            ],
        ];
    }

    // ---------------------------------------------------------------
    // Helpers
    // ---------------------------------------------------------------

    private function painPointsHtml(array $optin): string
    {
        $points = array_filter([
            $optin['pain_point_1'] ?? null,
            $optin['pain_point_2'] ?? null,
            $optin['pain_point_3'] ?? null,
        ]);

        if (! $points) {
            return '';
        }

        $items = implode('', array_map(fn (string $p) => "<li>{$p}</li>", $points));

        return "<ul>{$items}</ul>";
    }

    private function upsellBodyHtml(array $upsell): string
    {
        $parts = array_filter([
            $upsell['what_you_just_did'] ?? null,
            $upsell['next_level_problem'] ?? null,
            $upsell['solution_description'] ?? null,
        ]);

        $html = implode('<br><br>', $parts);

        $bullets = array_filter([
            $upsell['bullet_1'] ?? null,
            $upsell['bullet_2'] ?? null,
            $upsell['bullet_3'] ?? null,
        ]);

        if ($bullets) {
            $items = implode('', array_map(fn (string $b) => "<li>{$b}</li>", $bullets));
            $html .= "<ul>{$items}</ul>";
        }

        return $html;
    }

    private function formatValue(string $value): string
    {
        // If it's already formatted like "$297" just return it
        if (str_starts_with($value, '$') || str_starts_with($value, '€')) {
            return $value;
        }

        return $value;
    }
}
