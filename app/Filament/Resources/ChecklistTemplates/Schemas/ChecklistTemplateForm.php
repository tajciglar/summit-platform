<?php

namespace App\Filament\Resources\ChecklistTemplates\Schemas;

use Filament\Forms\Components\Textarea;
use Filament\Forms\Components\TextInput;
use Filament\Forms\Components\Toggle;
use Filament\Schemas\Schema;

class ChecklistTemplateForm
{
    public static function configure(Schema $schema): Schema
    {
        return $schema
            ->components([
                TextInput::make('name')->required()->maxLength(255),
                Textarea::make('description')->rows(3),
                Toggle::make('is_default')
                    ->label('Default Template')
                    ->helperText('New summits will use this template when applying checklist'),
            ]);
    }
}
