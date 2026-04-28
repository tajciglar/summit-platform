<?php

namespace App\Filament\Resources\Contacts\Pages;

use App\Filament\Resources\Contacts\ContactResource;
use App\Models\Summit;
use Filament\Actions\Action;
use Filament\Resources\Pages\ListRecords;
use Filament\Support\Icons\Heroicon;
use Symfony\Component\HttpFoundation\StreamedResponse;

class ListContacts extends ListRecords
{
    protected static string $resource = ContactResource::class;

    protected function getHeaderActions(): array
    {
        return [
            Action::make('exportCsv')
                ->label('Export CSV')
                ->icon(Heroicon::OutlinedArrowDownTray)
                ->action(fn () => $this->streamCsv()),
        ];
    }

    public function streamCsv(): StreamedResponse
    {
        $query = $this->getFilteredSortedTableQuery();

        $filename = 'contacts-'.now()->format('Y-m-d-His').'.csv';

        return response()->streamDownload(function () use ($query): void {
            $handle = fopen('php://output', 'w');
            fputcsv($handle, [
                'email', 'first_name', 'last_name', 'country',
                'paid_orders_count', 'total_revenue', 'created_at', 'summits',
            ]);

            $query->cursor()->each(function ($record) use ($handle) {
                $summitIds = $record->optins()->whereNotNull('summit_id')->pluck('summit_id')->unique();
                $summitTitles = Summit::query()->whereIn('id', $summitIds)->pluck('title')->all();
                $revenueCents = (int) $record->orders()
                    ->whereIn('status', ['completed', 'partial_refund'])
                    ->sum('total_cents');

                fputcsv($handle, [
                    $record->email,
                    $record->first_name,
                    $record->last_name,
                    $record->country,
                    $record->paid_orders_count ?? 0,
                    number_format($revenueCents / 100, 2, '.', ''),
                    optional($record->created_at)->toIso8601String(),
                    implode(', ', $summitTitles),
                ]);
            });

            fclose($handle);
        }, $filename, [
            'Content-Type' => 'text/csv',
        ]);
    }
}
