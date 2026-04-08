<?php

namespace App\Filament\Resources\Funnels;

use App\Filament\Resources\Funnels\Pages\CreateFunnel;
use App\Filament\Resources\Funnels\Pages\EditFunnel;
use App\Filament\Resources\Funnels\Pages\ListFunnels;
use App\Filament\Resources\Funnels\Schemas\FunnelForm;
use App\Filament\Resources\Funnels\Tables\FunnelsTable;
use App\Models\Funnel;
use BackedEnum;
use Filament\Resources\Resource;
use Filament\Schemas\Schema;
use Filament\Support\Icons\Heroicon;
use Filament\Tables\Table;

class FunnelResource extends Resource
{
    protected static ?string $model = Funnel::class;

    protected static bool $shouldRegisterNavigation = false;

    protected static string|BackedEnum|null $navigationIcon = Heroicon::OutlinedRectangleStack;

    public static function form(Schema $schema): Schema
    {
        return FunnelForm::configure($schema);
    }

    public static function table(Table $table): Table
    {
        return FunnelsTable::configure($table);
    }

    public static function getRelations(): array
    {
        return [
            RelationManagers\FunnelStepsRelationManager::class,
        ];
    }

    public static function getPages(): array
    {
        return [
            'index' => ListFunnels::route('/'),
            'create' => CreateFunnel::route('/create'),
            'edit' => EditFunnel::route('/{record}/edit'),
        ];
    }
}
