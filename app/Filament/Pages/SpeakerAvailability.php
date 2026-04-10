<?php

namespace App\Filament\Pages;

use App\Models\Speaker;
use App\Models\SummitSpeaker;
use BackedEnum;
use Filament\Pages\Page;
use Filament\Support\Icons\Heroicon;
use Illuminate\Support\Carbon;
use Illuminate\Support\Collection;

class SpeakerAvailability extends Page
{
    protected static \UnitEnum|string|null $navigationGroup = 'Content';

    protected static ?int $navigationSort = 4;

    protected static string|BackedEnum|null $navigationIcon = Heroicon::OutlinedCalendar;

    protected static ?string $navigationLabel = 'Speaker Availability';

    protected static ?string $title = 'Speaker Availability';

    protected string $view = 'filament.pages.speaker-availability';

    #[\Livewire\Attributes\Url]
    public string $search = '';

    public function getViewData(): array
    {
        $query = Speaker::with(['summitSpeakers.summit'])
            ->whereHas('summitSpeakers');

        if ($this->search) {
            $query->where(function ($q) {
                $q->where('first_name', 'ilike', "%{$this->search}%")
                    ->orWhere('last_name', 'ilike', "%{$this->search}%");
            });
        }

        $speakers = $query->orderBy('last_name')->get()->map(function (Speaker $speaker) {
            $bookings = $speaker->summitSpeakers->map(fn (SummitSpeaker $ss) => [
                'summit' => $ss->summit?->title ?? 'Unknown',
                'summit_type' => $ss->summit?->summit_type ?? 'new',
                'presentation_day' => $ss->presentation_day?->format('M d, Y'),
                'is_featured' => $ss->is_featured,
                'status' => $ss->summit?->status ?? 'draft',
            ])->sortBy('presentation_day');

            return [
                'name' => "{$speaker->first_name} {$speaker->last_name}",
                'email' => $speaker->email,
                'total_appearances' => $bookings->count(),
                'upcoming' => $bookings->filter(fn ($b) => $b['status'] === 'published')->count(),
                'bookings' => $bookings,
            ];
        });

        return [
            'speakers' => $speakers,
        ];
    }
}
