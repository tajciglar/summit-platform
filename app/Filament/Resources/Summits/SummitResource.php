<?php

namespace App\Filament\Resources\Summits;

use App\Filament\Resources\Summits\Pages\CreateSummit;
use App\Filament\Resources\Summits\Pages\EditSummit;
use App\Filament\Resources\Summits\Pages\ListSummits;
use App\Filament\Resources\Summits\Schemas\SummitForm;
use App\Filament\Resources\Summits\Tables\SummitsTable;
use App\Models\Summit;
use BackedEnum;
use Filament\Resources\Resource;
use Filament\Schemas\Schema;
use Filament\Support\Icons\Heroicon;
use Filament\Tables\Table;

class SummitResource extends Resource
{
    protected static ?string $model = Summit::class;

    protected static \UnitEnum|string|null $navigationGroup = 'Content';

    protected static ?int $navigationSort = 0;

    protected static string|BackedEnum|null $navigationIcon = Heroicon::OutlinedStar;

    protected static ?string $recordTitleAttribute = 'title';

    public static function getGloballySearchableAttributes(): array
    {
        return ['title', 'slug', 'topic'];
    }

    public static function getGlobalSearchResultDetails(\Illuminate\Database\Eloquent\Model $record): array
    {
        return [
            'Type' => ucfirst($record->summit_type),
            'Status' => ucfirst($record->status),
            'Phase' => str_replace('_', ' ', ucfirst($record->current_phase)),
        ];
    }

    public static function form(Schema $schema): Schema
    {
        return SummitForm::configure($schema);
    }

    public static function table(Table $table): Table
    {
        return SummitsTable::configure($table);
    }

    public static function getRelations(): array
    {
        return [
            RelationManagers\FunnelsRelationManager::class,
            RelationManagers\SummitSpeakersRelationManager::class,
            RelationManagers\PhaseSchedulesRelationManager::class,
            RelationManagers\CampaignActivitiesRelationManager::class,
            RelationManagers\DailyReportsRelationManager::class,
            RelationManagers\ChecklistItemsRelationManager::class,
        ];
    }

    public static function getPages(): array
    {
        return [
            'index' => ListSummits::route('/'),
            'create' => CreateSummit::route('/create'),
            'edit' => EditSummit::route('/{record}/edit'),
        ];
    }
}
