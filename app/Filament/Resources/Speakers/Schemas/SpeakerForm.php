<?php

namespace App\Filament\Resources\Speakers\Schemas;

use Filament\Forms\Components\KeyValue;
use Filament\Forms\Components\Textarea;
use Filament\Forms\Components\TextInput;
use Filament\Schemas\Schema;

class SpeakerForm
{
    public static function configure(Schema $schema): Schema
    {
        return $schema
            ->components([
                TextInput::make('first_name')->required()->maxLength(255),
                TextInput::make('last_name')->required()->maxLength(255),
                TextInput::make('slug')->required()->maxLength(255)->unique(ignoreRecord: true),
                TextInput::make('email')->email(),
                TextInput::make('photo_url')->label('Photo URL')->url(),
                TextInput::make('title')
                    ->label('Role / Title')
                    ->placeholder('CEO at Acme')
                    ->maxLength(500),
                Textarea::make('short_description')->label('Short Description')->rows(2),
                Textarea::make('long_description')->label('Full Bio')->rows(4),
                TextInput::make('website_url')->label('Website')->url(),
                KeyValue::make('social_links')
                    ->label('Social Links')
                    ->keyLabel('Platform')
                    ->valueLabel('URL'),
            ]);
    }
}
