<?php

namespace App\Filament\Resources\Contacts\Pages;

use App\Filament\Resources\Contacts\ContactResource;
use App\Models\Contact;
use Filament\Infolists\Components\TextEntry;
use Filament\Resources\Pages\ViewRecord;
use Filament\Schemas\Components\Section;
use Filament\Schemas\Schema;

class ViewContact extends ViewRecord
{
    protected static string $resource = ContactResource::class;

    public function infolist(Schema $schema): Schema
    {
        return $schema->components([
            Section::make('Contact')
                ->schema([
                    TextEntry::make('email'),
                    TextEntry::make('first_name')->label('First name'),
                    TextEntry::make('country')
                        ->placeholder('—'),
                    TextEntry::make('total_revenue')
                        ->label('Total revenue')
                        ->state(fn (Contact $record): string => '$'.number_format($record->paid_revenue_cents / 100, 2)),
                ])
                ->columns(2),
            Section::make('Summits')
                ->schema([
                    TextEntry::make('summits')
                        ->label('Attached summits')
                        ->state(fn (Contact $record) => $record->summits()->pluck('title')->all())
                        // summits() returns a Collection (see Contact model)
                        ->listWithLineBreaks()
                        ->bulleted()
                        ->placeholder('No summits'),
                ]),
        ]);
    }
}
