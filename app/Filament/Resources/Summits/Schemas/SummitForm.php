<?php

namespace App\Filament\Resources\Summits\Schemas;

use Filament\Forms\Components\DateTimePicker;
use Filament\Forms\Components\FileUpload;
use Filament\Forms\Components\Placeholder;
use Filament\Forms\Components\Select;
use Filament\Forms\Components\Textarea;
use Filament\Forms\Components\TextInput;
use Filament\Schemas\Components\Section;
use Filament\Schemas\Schema;

class SummitForm
{
    public static function configure(Schema $schema): Schema
    {
        return $schema
            ->components([
                TextInput::make('title')->required()->maxLength(500),
                TextInput::make('slug')->required()->maxLength(255)->unique(ignoreRecord: true),
                Textarea::make('description')->rows(3),
                TextInput::make('topic')->maxLength(255),
                Select::make('summit_type')
                    ->options([
                        'new' => 'New',
                        'replay' => 'Replay',
                    ])
                    ->default('new')
                    ->required(),
                FileUpload::make('hero_image_url')
                    ->label('Hero Image')
                    ->image()
                    ->directory('summit-images')
                    ->maxSize(5120),
                Select::make('status')
                    ->options([
                        'draft' => 'Draft',
                        'published' => 'Published',
                        'archived' => 'Archived',
                    ])
                    ->default('draft')
                    ->required(),
                Select::make('current_phase')
                    ->options([
                        'pre_summit' => 'Pre-Summit',
                        'late_pre_summit' => 'Late Pre-Summit',
                        'during_summit' => 'During Summit',
                        'post_summit' => 'Post-Summit',
                    ])
                    ->default('pre_summit')
                    ->required(),
                TextInput::make('timezone')
                    ->default('America/New_York')
                    ->required(),
                DateTimePicker::make('starts_at'),
                DateTimePicker::make('ends_at'),
                Section::make('Style')
                    ->description('Drives AI-generated landing page look & feel across every funnel of this summit.')
                    ->schema([
                        TextInput::make('style_reference_url')
                            ->label('Style Reference URL')
                            ->placeholder('https://parenting-summits.com')
                            ->url()
                            ->helperText('Used to auto-build a reusable Style Brief (palette, typography, density, hero pattern).'),
                        Placeholder::make('style_brief_status_label')
                            ->label('Style Brief Status')
                            ->content(fn ($record) => $record?->style_brief_status ?? 'absent'),
                    ]),
            ]);
    }
}
