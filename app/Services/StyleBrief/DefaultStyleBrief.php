<?php

namespace App\Services\StyleBrief;

class DefaultStyleBrief
{
    public static function get(): array
    {
        return [
            'palette' => [
                'primary' => '#5e4d9b',
                'primary_text' => '#ffffff',
                'accent' => '#00b553',
                'background' => '#ffffff',
                'surface' => '#f9fafb',
                'text' => '#111827',
                'text_muted' => '#6b7280',
                'border' => '#e5e7eb',
            ],
            'typography' => [
                'heading_font' => 'Plus Jakarta Sans',
                'body_font' => 'Inter',
                'heading_weight' => 700,
                'scale' => 'comfortable',
            ],
            'components' => [
                'button_shape' => 'pill',
                'button_weight' => 'bold',
                'card_style' => 'elevated',
                'card_radius' => 'lg',
            ],
            'rhythm' => [
                'section_padding' => 'comfortable',
                'max_width' => 1200,
                'density' => 'airy',
            ],
            'voice' => [
                'tone' => 'warm-expert',
                'headline_style' => 'benefit-driven',
            ],
            'hero_pattern' => 'split-image-right',
            '_generated_from' => null,
            '_generated_at' => null,
            '_locked_fields' => [],
        ];
    }
}
