<?php

namespace App\Filament\Resources\Affiliates;

use App\Filament\Resources\Affiliates\Pages\CreateAffiliate;
use App\Filament\Resources\Affiliates\Pages\EditAffiliate;
use App\Filament\Resources\Affiliates\Pages\ListAffiliates;
use App\Filament\Resources\Affiliates\Schemas\AffiliateForm;
use App\Filament\Resources\Affiliates\Tables\AffiliatesTable;
use App\Models\Affiliate;
use BackedEnum;
use Filament\Resources\Resource;
use Filament\Schemas\Schema;
use Filament\Support\Icons\Heroicon;
use Filament\Tables\Table;

class AffiliateResource extends Resource
{
    protected static ?string $model = Affiliate::class;

    protected static \UnitEnum|string|null $navigationGroup = 'Sales';

    protected static ?int $navigationSort = 3;

    protected static string|BackedEnum|null $navigationIcon = Heroicon::OutlinedUserPlus;

    public static function form(Schema $schema): Schema
    {
        return AffiliateForm::configure($schema);
    }

    public static function table(Table $table): Table
    {
        return AffiliatesTable::configure($table);
    }

    public static function getPages(): array
    {
        return [
            'index' => ListAffiliates::route('/'),
            'create' => CreateAffiliate::route('/create'),
            'edit' => EditAffiliate::route('/{record}/edit'),
        ];
    }
}
