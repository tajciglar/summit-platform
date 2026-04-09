<?php

namespace App\Filament\Resources\DailyReports\Schemas;

use Filament\Forms\Components\DatePicker;
use Filament\Forms\Components\Fieldset;
use Filament\Forms\Components\Select;
use Filament\Forms\Components\Textarea;
use Filament\Forms\Components\TextInput;
use Filament\Schemas\Schema;

class DailyReportForm
{
    public static function configure(Schema $schema): Schema
    {
        return $schema
            ->components([
                Fieldset::make('Report Info')
                    ->schema([
                        Select::make('summit_id')
                            ->relationship('summit', 'title')
                            ->searchable()
                            ->preload()
                            ->required(),
                        DatePicker::make('report_date')
                            ->required()
                            ->unique(ignoreRecord: true, modifyRuleUsing: fn ($rule, $get) => $rule->where('summit_id', $get('summit_id'))),
                    ]),

                Fieldset::make('Traffic & Conversions')
                    ->schema([
                        TextInput::make('views')->numeric()->label('Views'),
                        TextInput::make('optins')->numeric()->label('Opt-ins'),
                        TextInput::make('nr_of_purchases')->numeric()->label('Nr. of Purchases'),
                        TextInput::make('revenue_usd_cents')->numeric()->label('Revenue USD (cents)'),
                        TextInput::make('revenue_eur_cents')->numeric()->label('Revenue EUR (cents)'),
                    ]),

                Fieldset::make('Ad Spend (Manual Entry)')
                    ->schema([
                        TextInput::make('ad_spend_eur_cents')->numeric()->label('Ad Spend EUR (cents)'),
                        TextInput::make('cpc_eur_cents')->numeric()->label('CPC EUR (cents)'),
                    ]),

                Fieldset::make('Rates')
                    ->schema([
                        TextInput::make('checkout_rate')
                            ->numeric()
                            ->step(0.0001)
                            ->label('Checkout Rate')
                            ->helperText('Decimal, e.g. 0.6208 = 62.08%'),
                        TextInput::make('upgrade_checkout_rate')
                            ->numeric()
                            ->step(0.0001)
                            ->label('Upgrade > Checkout Rate'),
                        TextInput::make('upsell_take_rate')
                            ->numeric()
                            ->step(0.0001)
                            ->label('Upsell Take Rate'),
                    ]),

                Fieldset::make('Derived Metrics (Auto-calculated)')
                    ->schema([
                        TextInput::make('optin_rate')->numeric()->disabled()->dehydrated()->label('Optin Rate'),
                        TextInput::make('purchase_rate')->numeric()->disabled()->dehydrated()->label('Purchase Rate'),
                        TextInput::make('cpl_eur_cents')->numeric()->disabled()->dehydrated()->label('CPL EUR (cents)'),
                        TextInput::make('cpo_eur_cents')->numeric()->disabled()->dehydrated()->label('CPO EUR (cents)'),
                        TextInput::make('aov_usd_cents')->numeric()->disabled()->dehydrated()->label('AOV USD (cents)'),
                        TextInput::make('roas')->numeric()->disabled()->dehydrated()->label('ROAS'),
                    ]),

                Fieldset::make('Notes')
                    ->schema([
                        Textarea::make('comment')->rows(3),
                        Textarea::make('execution_notes')->rows(3),
                    ]),
            ]);
    }
}
