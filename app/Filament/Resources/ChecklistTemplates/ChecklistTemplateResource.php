<?php

namespace App\Filament\Resources\ChecklistTemplates;

use App\Filament\Resources\ChecklistTemplates\Pages\CreateChecklistTemplate;
use App\Filament\Resources\ChecklistTemplates\Pages\EditChecklistTemplate;
use App\Filament\Resources\ChecklistTemplates\Pages\ListChecklistTemplates;
use App\Filament\Resources\ChecklistTemplates\RelationManagers\TemplateItemsRelationManager;
use App\Filament\Resources\ChecklistTemplates\Schemas\ChecklistTemplateForm;
use App\Filament\Resources\ChecklistTemplates\Tables\ChecklistTemplatesTable;
use App\Models\SummitChecklistTemplate;
use BackedEnum;
use Filament\Resources\Resource;
use Filament\Schemas\Schema;
use Filament\Support\Icons\Heroicon;
use Filament\Tables\Table;

class ChecklistTemplateResource extends Resource
{
    protected static ?string $model = SummitChecklistTemplate::class;

    protected static \UnitEnum|string|null $navigationGroup = 'Settings';

    protected static ?int $navigationSort = 0;

    protected static string|BackedEnum|null $navigationIcon = Heroicon::OutlinedClipboardDocumentList;

    protected static ?string $navigationLabel = 'Checklist Templates';

    protected static ?string $modelLabel = 'Checklist Template';

    public static function form(Schema $schema): Schema
    {
        return ChecklistTemplateForm::configure($schema);
    }

    public static function table(Table $table): Table
    {
        return ChecklistTemplatesTable::configure($table);
    }

    public static function getRelations(): array
    {
        return [
            TemplateItemsRelationManager::class,
        ];
    }

    public static function getPages(): array
    {
        return [
            'index' => ListChecklistTemplates::route('/'),
            'create' => CreateChecklistTemplate::route('/create'),
            'edit' => EditChecklistTemplate::route('/{record}/edit'),
        ];
    }
}
