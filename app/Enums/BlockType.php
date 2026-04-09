<?php

namespace App\Enums;

use Filament\Forms\Components\FileUpload;
use Filament\Forms\Components\Repeater;
use Filament\Forms\Components\RichEditor;
use Filament\Forms\Components\Select;
use Filament\Forms\Components\Textarea;
use Filament\Forms\Components\TextInput;
use Filament\Forms\Components\Toggle;

enum BlockType: string
{
    case Hero = 'hero';
    case SpeakerGrid = 'speaker_grid';
    case Video = 'video';
    case Text = 'text';
    case Image = 'image';
    case Cta = 'cta';
    case Testimonials = 'testimonials';
    case Faq = 'faq';
    case Countdown = 'countdown';
    case PricingCard = 'pricing_card';
    case Divider = 'divider';
    case CheckoutForm = 'checkout_form';
    case OrderBumps = 'order_bumps';
    case UpsellOffer = 'upsell_offer';

    public function label(): string
    {
        return match ($this) {
            self::Hero => 'Hero Section',
            self::SpeakerGrid => 'Speaker Grid',
            self::Video => 'Video Embed',
            self::Text => 'Text / Rich Content',
            self::Image => 'Image',
            self::Cta => 'Call to Action',
            self::Testimonials => 'Testimonials',
            self::Faq => 'FAQ Accordion',
            self::Countdown => 'Countdown Timer',
            self::PricingCard => 'Pricing Card',
            self::Divider => 'Divider / Spacer',
            self::CheckoutForm => 'Checkout Form',
            self::OrderBumps => 'Order Bumps',
            self::UpsellOffer => 'Upsell Offer',
        };
    }

    public function icon(): string
    {
        return match ($this) {
            self::Hero => 'heroicon-o-star',
            self::SpeakerGrid => 'heroicon-o-user-group',
            self::Video => 'heroicon-o-play-circle',
            self::Text => 'heroicon-o-document-text',
            self::Image => 'heroicon-o-photo',
            self::Cta => 'heroicon-o-cursor-arrow-rays',
            self::Testimonials => 'heroicon-o-chat-bubble-left-right',
            self::Faq => 'heroicon-o-question-mark-circle',
            self::Countdown => 'heroicon-o-clock',
            self::PricingCard => 'heroicon-o-currency-dollar',
            self::Divider => 'heroicon-o-minus',
            self::CheckoutForm => 'heroicon-o-credit-card',
            self::OrderBumps => 'heroicon-o-plus-circle',
            self::UpsellOffer => 'heroicon-o-gift',
        };
    }

    /** All block types as Select options. */
    public static function options(): array
    {
        return collect(self::cases())
            ->mapWithKeys(fn (self $type) => [$type->value => $type->label()])
            ->all();
    }

    /** Filament form fields for this block type's data. */
    public function filamentFields(): array
    {
        return match ($this) {
            self::Hero => [
                TextInput::make('headline')->maxLength(255),
                TextInput::make('subheadline')->maxLength(255),
                RichEditor::make('body')->toolbarButtons(['bold', 'italic', 'link', 'bulletList']),
                TextInput::make('cta_text')->label('CTA Text')->placeholder('Register Now')->maxLength(100),
                TextInput::make('cta_url')->label('CTA Link')->url()->placeholder('https://...'),
                FileUpload::make('background_image')->label('Background Image')->image()->directory('block-images')->maxSize(5120),
                Select::make('style')->options(['gradient' => 'Gradient', 'image_overlay' => 'Image Overlay', 'solid' => 'Solid Color'])->default('gradient'),
            ],

            self::SpeakerGrid => [
                TextInput::make('heading')->default('Meet Your Speakers')->maxLength(255),
                TextInput::make('subheading')->maxLength(255),
                Select::make('columns')->options(['2' => '2 columns', '3' => '3 columns', '4' => '4 columns'])->default('3'),
                Toggle::make('show_featured_only')->label('Show featured speakers only'),
            ],

            self::Video => [
                TextInput::make('video_url')->label('Video URL')->url()->required()->placeholder('https://www.youtube.com/embed/...'),
                TextInput::make('heading')->maxLength(255),
                TextInput::make('caption')->maxLength(500),
            ],

            self::Text => [
                RichEditor::make('body')->required()->toolbarButtons(['bold', 'italic', 'link', 'bulletList', 'orderedList', 'h2', 'h3']),
                Select::make('width')->options(['narrow' => 'Narrow (640px)', 'medium' => 'Medium (768px)', 'wide' => 'Wide (1024px)'])->default('medium'),
            ],

            self::Image => [
                FileUpload::make('image_url')->label('Image')->image()->directory('block-images')->required()->maxSize(5120),
                TextInput::make('alt_text')->label('Alt Text')->maxLength(255),
                TextInput::make('caption')->maxLength(500),
                Select::make('width')->options(['small' => 'Small', 'medium' => 'Medium', 'full' => 'Full Width'])->default('medium'),
            ],

            self::Cta => [
                TextInput::make('heading')->maxLength(255),
                TextInput::make('subheading')->maxLength(255),
                TextInput::make('button_text')->required()->maxLength(100),
                TextInput::make('button_url')->url()->placeholder('https://...'),
                Select::make('style')->options(['primary' => 'Primary Color', 'accent' => 'Accent Color', 'dark' => 'Dark'])->default('primary'),
            ],

            self::Testimonials => [
                TextInput::make('heading')->default('What People Say')->maxLength(255),
                Repeater::make('items')
                    ->schema([
                        Textarea::make('quote')->required()->rows(2),
                        TextInput::make('name')->required()->maxLength(255),
                        TextInput::make('title')->maxLength(255)->placeholder('CEO at Company'),
                        TextInput::make('photo_url')->url(),
                    ])
                    ->itemLabel(fn (array $state): ?string => $state['name'] ?? null)
                    ->collapsible()
                    ->defaultItems(1),
            ],

            self::Faq => [
                TextInput::make('heading')->default('Frequently Asked Questions')->maxLength(255),
                Repeater::make('items')
                    ->schema([
                        TextInput::make('question')->required()->maxLength(500),
                        Textarea::make('answer')->required()->rows(3),
                    ])
                    ->itemLabel(fn (array $state): ?string => $state['question'] ?? null)
                    ->collapsible()
                    ->defaultItems(1),
            ],

            self::Countdown => [
                TextInput::make('heading')->placeholder('Offer expires in...')->maxLength(255),
                TextInput::make('minutes')->numeric()->default(15)->minValue(1)->maxValue(1440),
                TextInput::make('expired_text')->placeholder('This offer has expired')->maxLength(255),
            ],

            self::PricingCard => [
                TextInput::make('heading')->maxLength(255),
                TextInput::make('subheading')->maxLength(255),
                Repeater::make('features')
                    ->schema([
                        TextInput::make('text')->required(),
                        Toggle::make('included')->default(true),
                    ])
                    ->itemLabel(fn (array $state): ?string => $state['text'] ?? null)
                    ->collapsible()
                    ->defaultItems(3),
                TextInput::make('cta_text')->label('Button Text')->maxLength(100),
            ],

            self::Divider => [
                Select::make('style')->options(['line' => 'Line', 'space' => 'Space Only', 'dots' => 'Dots'])->default('space'),
                Select::make('size')->options(['sm' => 'Small', 'md' => 'Medium', 'lg' => 'Large'])->default('md'),
            ],

            self::CheckoutForm => [
                TextInput::make('heading')->default('Complete Your Order')->maxLength(255),
                TextInput::make('subheading')->maxLength(255),
                TextInput::make('button_text')->default('Complete Purchase')->maxLength(100),
                Toggle::make('show_express_checkout')->label('Show Apple Pay / Google Pay')->default(true),
            ],

            self::OrderBumps => [
                TextInput::make('heading')->placeholder('Add to your order')->maxLength(255),
            ],

            self::UpsellOffer => [
                TextInput::make('heading')->maxLength(255),
                TextInput::make('subheading')->maxLength(255),
                RichEditor::make('body')->toolbarButtons(['bold', 'italic', 'bulletList']),
                TextInput::make('accept_text')->default('Yes — Add This')->maxLength(100),
                TextInput::make('decline_text')->default('No thanks, skip this offer')->maxLength(100),
            ],
        };
    }
}
