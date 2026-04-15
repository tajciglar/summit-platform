<?php

namespace App\Filament\Resources\Funnels\Schemas;

use Filament\Forms\Components\ColorPicker;
use Filament\Forms\Components\FileUpload;
use Filament\Schemas\Components\Section;
use Filament\Forms\Components\Select;
use Filament\Forms\Components\Textarea;
use Filament\Forms\Components\TextInput;
use Filament\Forms\Components\Toggle;
use Filament\Schemas\Schema;

class FunnelForm
{
    public static function configure(Schema $schema): Schema
    {
        return $schema
            ->components([
                Select::make('summit_id')
                    ->relationship('summit', 'title')
                    ->searchable()
                    ->preload()
                    ->required(),
                TextInput::make('name')->required()->maxLength(500),
                TextInput::make('slug')->required()->maxLength(255),
                Textarea::make('description')->rows(2),
                Select::make('target_phase')
                    ->label('Target Phase')
                    ->options([
                        'pre_summit' => 'Pre-Summit',
                        'late_pre_summit' => 'Late Pre-Summit',
                        'during_summit' => 'During Summit',
                        'post_summit' => 'Post-Summit',
                    ])
                    ->placeholder('All phases'),
                Toggle::make('is_active')->default(true),

                Section::make('Theme')
                    ->description('Branding applied to all funnel pages')
                    ->schema([
                        ColorPicker::make('theme.colors.primary')->label('Primary')->default('#4f46e5'),
                        ColorPicker::make('theme.colors.secondary')->label('Secondary')->default('#1e293b'),
                        ColorPicker::make('theme.colors.accent')->label('Accent')->default('#f59e0b'),
                        ColorPicker::make('theme.colors.background')->label('Background')->default('#ffffff'),
                        ColorPicker::make('theme.colors.text')->label('Text')->default('#111827'),
                        Select::make('theme.fonts.heading')
                            ->label('Heading Font')
                            ->options([
                                'Inter' => 'Inter',
                                'Outfit' => 'Outfit',
                                'Plus Jakarta Sans' => 'Plus Jakarta Sans',
                                'DM Sans' => 'DM Sans',
                                'Playfair Display' => 'Playfair Display',
                                'Instrument Sans' => 'Instrument Sans',
                            ])
                            ->default('Inter'),
                        Select::make('theme.fonts.body')
                            ->label('Body Font')
                            ->options([
                                'Inter' => 'Inter',
                                'Outfit' => 'Outfit',
                                'Plus Jakarta Sans' => 'Plus Jakarta Sans',
                                'DM Sans' => 'DM Sans',
                                'Instrument Sans' => 'Instrument Sans',
                            ])
                            ->default('Inter'),
                        FileUpload::make('theme.logo_url')
                            ->label('Logo')
                            ->image()
                            ->directory('funnel-logos')
                            ->maxSize(2048),
                    ])
                    ->columns(2)
                    ->collapsible()
                    ->collapsed(),

                Section::make('Style Brief Override')
                    ->description('Optional — customise this funnel\'s Style Brief. Empty = inherit from summit.')
                    ->collapsible()
                    ->collapsed(fn ($record) => empty($record?->style_brief_override))
                    ->schema([
                        Textarea::make('style_brief_override')
                            ->label('Override JSON (partial Style Brief keys)')
                            ->rows(8)
                            ->helperText('Only the keys you override — the rest are deep-merged from the summit brief. E.g. `{"palette":{"primary":"#ff0000"}}`.')
                            ->placeholder('{}')
                            ->dehydrateStateUsing(fn ($state) => filled($state)
                                ? (json_decode(is_array($state) ? json_encode($state) : (string) $state, true) ?? null)
                                : null)
                            ->afterStateHydrated(function ($component, $state) {
                                if (is_array($state)) {
                                    $component->state(json_encode($state, JSON_PRETTY_PRINT | JSON_UNESCAPED_SLASHES));
                                }
                            })
                            ->rules([
                                function () {
                                    return function (string $attribute, $value, \Closure $fail) {
                                        if (blank($value)) return;
                                        $decoded = is_array($value) ? $value : json_decode((string) $value, true);
                                        if (! is_array($decoded)) $fail('Must be valid JSON.');
                                    };
                                },
                            ]),
                    ]),
            ]);
    }
}
