<?php

namespace App\Services\StyleBrief;

class DefaultStyleBrief
{
    public static function get(): array
    {
        return [
            'palette' => [
                'primary' => '#704fe6',
                'primary_dark' => '#5e4d9b',
                'primary_text' => '#ffffff',
                'cta' => '#FBA506',
                'cta_secondary' => '#ffc500',
                'cta_orange' => '#ff8f00',
                'accent_green' => '#00b553',
                'background' => '#ffffff',
                'surface' => '#e6e6fa',
                'text' => '#000000',
                'text_muted' => '#898686',
                'border' => '#e5e7eb',
            ],
            'typography' => [
                'heading_font' => 'Poppins',
                'body_font' => 'Poppins',
                'accent_font' => 'Cormorant Garamond',
                'heading_weight' => 700,
                'scale' => 'comfortable',
            ],
            'components' => [
                'button_shape' => 'pill',
                'button_radius' => '500px',
                'button_weight' => 'bold',
                'card_style' => 'elevated',
                'card_radius' => '12px',
            ],
            'rhythm' => [
                'section_padding' => '75px',
                'max_width' => 1120,
                'density' => 'comfortable',
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
