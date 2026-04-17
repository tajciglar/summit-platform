<?php

namespace App\Filament\Resources\Orders\Pages;

use App\Filament\Resources\Orders\OrderResource;
use App\Models\Order;
use Filament\Resources\Pages\ViewRecord;
use Filament\Schemas\Components\Grid;
use Filament\Schemas\Components\Section;
use Filament\Schemas\Schema;
use Filament\Infolists\Components\TextEntry;
use Filament\Infolists\Components\KeyValueEntry;

class ViewOrder extends ViewRecord
{
    protected static string $resource = OrderResource::class;

    public function infolist(Schema $schema): Schema
    {
        return $schema->components([
            Section::make('Order')
                ->columns(3)
                ->schema([
                    TextEntry::make('order_number')->label('Order #')->copyable(),
                    TextEntry::make('status')->badge(),
                    TextEntry::make('phase_at_purchase')->label('Phase'),
                    TextEntry::make('user.email')->label('Customer email'),
                    TextEntry::make('summit.title')->label('Summit'),
                    TextEntry::make('funnel.name')->label('Funnel'),
                ]),

            Section::make('Totals')
                ->columns(4)
                ->schema([
                    TextEntry::make('subtotal_cents')->money('USD', divideBy: 100)->label('Subtotal'),
                    TextEntry::make('discount_cents')->money('USD', divideBy: 100)->label('Discount'),
                    TextEntry::make('tax_cents')->money('USD', divideBy: 100)->label('Tax'),
                    TextEntry::make('total_cents')->money('USD', divideBy: 100)->label('Total')->weight('bold'),
                ]),

            Section::make('Items')
                ->schema([
                    TextEntry::make('items_summary')
                        ->label('Items')
                        ->formatStateUsing(function (Order $record): string {
                            $items = $record->items ?? [];
                            if (empty($items)) {
                                return 'No items.';
                            }
                            return collect($items)->map(function (array $item): string {
                                $name = $item['name'] ?? ($item['product_id'] ?? 'unknown');
                                $qty = $item['qty'] ?? $item['quantity'] ?? 1;
                                $total = isset($item['total_cents']) ? '$'.number_format($item['total_cents'] / 100, 2) : '';
                                return "{$qty} × {$name} — {$total}";
                            })->implode("\n");
                        })
                        ->html(false),
                ]),

            Section::make('Stripe')
                ->columns(2)
                ->collapsed()
                ->schema([
                    TextEntry::make('stripe_payment_intent_id')->label('PaymentIntent')->copyable(),
                    TextEntry::make('stripe_checkout_session_id')->label('Checkout session')->copyable(),
                    TextEntry::make('stripe_subscription_id')->label('Subscription')->copyable(),
                    TextEntry::make('subscription_status')->label('Sub status'),
                ]),

            Section::make('Timestamps')
                ->columns(3)
                ->schema([
                    TextEntry::make('completed_at')->dateTime(),
                    TextEntry::make('created_at')->dateTime(),
                    TextEntry::make('updated_at')->dateTime(),
                ]),
        ]);
    }
}
