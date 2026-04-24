<?php

namespace App\Filament\Resources\Products\Pages;

use App\Filament\Resources\Products\ProductResource;
use App\Jobs\SyncProductToStripe;
use App\Models\Product;
use Filament\Actions\Action;
use Filament\Actions\DeleteAction;
use Filament\Notifications\Notification;
use Filament\Resources\Pages\EditRecord;

class EditProduct extends EditRecord
{
    protected static string $resource = ProductResource::class;

    protected function getHeaderActions(): array
    {
        return [
            Action::make('retryStripeSync')
                ->label('Retry Stripe sync')
                ->icon('heroicon-o-arrow-path')
                ->color('warning')
                ->visible(fn (Product $record): bool => $record->stripe_sync_status === 'failed')
                ->action(function (Product $record): void {
                    SyncProductToStripe::dispatch($record->id);
                    Notification::make()
                        ->title('Stripe sync queued')
                        ->success()
                        ->send();
                }),
            DeleteAction::make(),
        ];
    }
}
