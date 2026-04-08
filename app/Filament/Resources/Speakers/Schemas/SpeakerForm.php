<?php

namespace App\Filament\Resources\Speakers\Schemas;

use Filament\Forms\Components\SpatieMediaLibraryFileUpload;
use Filament\Forms\Components\Textarea;
use Filament\Forms\Components\TextInput;
use Filament\Forms\Components\Toggle;
use Filament\Schemas\Schema;

class SpeakerForm
{
    public static function configure(Schema $schema): Schema
    {
        return $schema
            ->components([
                TextInput::make('name')->required(),
                TextInput::make('title')
                    ->label('Role / Title')
                    ->placeholder('CTO at Acme'),
                Textarea::make('bio')->rows(3),
                SpatieMediaLibraryFileUpload::make('photo')
                    ->collection('photo')
                    ->image()
                    ->imageEditor(),
                TextInput::make('website_url')
                    ->label('Website')
                    ->url(),
                Toggle::make('is_active')->default(true),
            ]);
    }
}
