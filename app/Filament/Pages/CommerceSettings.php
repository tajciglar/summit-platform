<?php

namespace App\Filament\Pages;

use App\Models\AppSettings;
use BackedEnum;
use Filament\Actions\Action;
use Filament\Forms\Components\Select;
use Filament\Forms\Components\TextInput;
use Filament\Notifications\Notification;
use Filament\Pages\Page;
use Filament\Schemas\Components\Section;
use Filament\Schemas\Schema;
use Filament\Support\Icons\Heroicon;
use UnitEnum;

/**
 * Platform-wide commerce config. Global on purpose — products are global
 * across domains, so the Stripe account and default currency must be too.
 * Lives under the "Sales" nav group alongside Products.
 */
class CommerceSettings extends Page
{
    protected static string|BackedEnum|null $navigationIcon = Heroicon::OutlinedCreditCard;

    protected static string|UnitEnum|null $navigationGroup = 'Sales';

    protected static ?int $navigationSort = 90;

    protected static ?string $title = 'Commerce settings';

    protected string $view = 'filament.pages.settings';

    /** @var array<string, mixed>|null */
    public ?array $data = [];

    public function mount(): void
    {
        $this->form->fill(AppSettings::current()->toArray());
    }

    public function form(Schema $schema): Schema
    {
        return $schema
            ->record(AppSettings::current())
            ->statePath('data')
            ->components([
                Section::make('Stripe')
                    ->description('One Stripe account serves every domain — products are global, so checkout is too.')
                    ->columns(2)
                    ->components([
                        TextInput::make('stripe_publishable_key')
                            ->label('Publishable key')
                            ->prefix('pk_')
                            ->maxLength(255)
                            ->helperText('Leave blank to use env STRIPE_KEY.'),
                        Select::make('default_currency')
                            ->options([
                                'USD' => 'US Dollar',
                                'EUR' => 'Euro',
                                'GBP' => 'British Pound',
                                'CAD' => 'Canadian Dollar',
                                'AUD' => 'Australian Dollar',
                            ])
                            ->default('USD')
                            ->required()
                            ->native(false),
                    ]),
            ]);
    }

    /**
     * @return array<string, Action>
     */
    protected function getFormActions(): array
    {
        return [
            Action::make('save')
                ->label('Save changes')
                ->submit('save'),
        ];
    }

    public function save(): void
    {
        $data = $this->form->getState();

        AppSettings::current()->update($data);

        Notification::make()
            ->title('Commerce settings saved')
            ->success()
            ->send();
    }
}
