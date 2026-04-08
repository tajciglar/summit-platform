<?php

namespace App\Enums;

use Filament\Forms\Components\FileUpload;
use Filament\Forms\Components\RichEditor;
use Filament\Forms\Components\TextInput;

enum StepTemplate: string
{
    // Optin templates
    case HeroSpeakers = 'hero_speakers';
    case VideoForm = 'video_form';
    case Minimal = 'minimal';

    // Checkout templates
    case StandardCheckout = 'standard_checkout';
    case SplitCheckout = 'split_checkout';

    // Upsell templates
    case UrgencyUpsell = 'urgency_upsell';
    case SimpleUpsell = 'simple_upsell';

    // Thank-you templates
    case ConfirmationCard = 'confirmation_card';

    public function label(): string
    {
        return match ($this) {
            self::HeroSpeakers => 'Hero + Speakers',
            self::VideoForm => 'Video + Form',
            self::Minimal => 'Minimal',
            self::StandardCheckout => 'Standard Checkout',
            self::SplitCheckout => 'Split Checkout',
            self::UrgencyUpsell => 'Urgency Upsell',
            self::SimpleUpsell => 'Simple Upsell',
            self::ConfirmationCard => 'Confirmation Card',
        };
    }

    /** Step types this template is valid for. */
    public function allowedTypes(): array
    {
        return match ($this) {
            self::HeroSpeakers, self::VideoForm => ['optin'],
            self::Minimal => ['optin', 'thank_you'],
            self::StandardCheckout, self::SplitCheckout => ['checkout'],
            self::UrgencyUpsell, self::SimpleUpsell => ['upsell'],
            self::ConfirmationCard => ['thank_you'],
        };
    }

    /** Content field keys this template uses. */
    public function contentFields(): array
    {
        return match ($this) {
            self::HeroSpeakers => ['headline', 'subheadline', 'body', 'cta_text', 'hero_image'],
            self::VideoForm => ['headline', 'subheadline', 'video_url', 'cta_text'],
            self::Minimal => ['headline', 'subheadline', 'body'],
            self::StandardCheckout => ['headline', 'subheadline', 'cta_text'],
            self::SplitCheckout => ['headline', 'subheadline', 'cta_text', 'hero_image'],
            self::UrgencyUpsell => ['headline', 'subheadline', 'body', 'cta_text', 'countdown_minutes'],
            self::SimpleUpsell => ['headline', 'subheadline', 'cta_text'],
            self::ConfirmationCard => ['headline', 'subheadline', 'body'],
        };
    }

    /** Get template options filtered by step type for Filament Select. */
    public static function optionsForType(?string $type): array
    {
        if (! $type) {
            return collect(self::cases())
                ->mapWithKeys(fn (self $t) => [$t->value => $t->label()])
                ->all();
        }

        return collect(self::cases())
            ->filter(fn (self $t) => in_array($type, $t->allowedTypes()))
            ->mapWithKeys(fn (self $t) => [$t->value => $t->label()])
            ->all();
    }

    /** Default template for a given step type. */
    public static function defaultForType(string $type): string
    {
        return match ($type) {
            'optin' => self::HeroSpeakers->value,
            'checkout' => self::StandardCheckout->value,
            'upsell' => self::SimpleUpsell->value,
            'thank_you' => self::ConfirmationCard->value,
            default => self::Minimal->value,
        };
    }

    /** Filament form components for this template's content fields. */
    public static function filamentFields(?string $template): array
    {
        $fields = $template ? (self::tryFrom($template)?->contentFields() ?? []) : [];

        $components = [];

        foreach ($fields as $field) {
            $components[] = match ($field) {
                'headline' => TextInput::make('content.headline')
                    ->label('Headline')
                    ->maxLength(255),
                'subheadline' => TextInput::make('content.subheadline')
                    ->label('Subheadline')
                    ->maxLength(255),
                'body' => RichEditor::make('content.body')
                    ->label('Body')
                    ->toolbarButtons(['bold', 'italic', 'link', 'bulletList', 'orderedList']),
                'cta_text' => TextInput::make('content.cta_text')
                    ->label('CTA Button Text')
                    ->placeholder('Register Now')
                    ->maxLength(100),
                'hero_image' => FileUpload::make('content.hero_image')
                    ->label('Hero Image')
                    ->image()
                    ->directory('funnel-images')
                    ->maxSize(5120),
                'video_url' => TextInput::make('content.video_url')
                    ->label('Video URL')
                    ->url()
                    ->placeholder('https://www.youtube.com/embed/...'),
                'countdown_minutes' => TextInput::make('content.countdown_minutes')
                    ->label('Countdown Timer (minutes)')
                    ->numeric()
                    ->default(15)
                    ->minValue(1)
                    ->maxValue(1440),
                default => null,
            };
        }

        return array_filter($components);
    }
}
