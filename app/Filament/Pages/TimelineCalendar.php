<?php

namespace App\Filament\Pages;

use App\Filament\Imports\TimelineImporter;
use App\Models\Summit;
use App\Models\SummitCampaignActivity;
use App\Models\TimelineAnnotation;
use BackedEnum;
use Filament\Actions\ImportAction;
use Filament\Pages\Page;
use Filament\Support\Icons\Heroicon;
use Illuminate\Support\Carbon;
use Illuminate\Support\Collection;
use Livewire\Attributes\Url;

class TimelineCalendar extends Page
{
    protected static \UnitEnum|string|null $navigationGroup = 'Planning';

    protected static ?int $navigationSort = 0;

    protected static string|BackedEnum|null $navigationIcon = Heroicon::OutlinedCalendarDays;

    protected static ?string $navigationLabel = 'Timeline Calendar';

    protected static ?string $title = 'Summit Timeline';

    protected string $view = 'filament.pages.timeline-calendar';

    #[Url]
    public int $year;

    #[Url]
    public string $typeFilter = '';

    #[Url]
    public string $search = '';

    public function mount(): void
    {
        $this->year = (int) date('Y');
    }

    protected function getHeaderActions(): array
    {
        return [
            ImportAction::make()
                ->importer(TimelineImporter::class)
                ->label('Import CSV'),
        ];
    }

    public function getViewData(): array
    {
        $weeks = $this->generateWeeks();
        $summits = $this->getSummits();
        $annotations = $this->getAnnotations();

        return [
            'weeks' => $weeks,
            'summits' => $summits,
            'annotations' => $annotations,
            'year' => $this->year,
            'activityColors' => self::activityColors(),
        ];
    }

    protected function generateWeeks(): array
    {
        $weeks = [];
        $start = Carbon::create($this->year, 1, 1)->startOfWeek(Carbon::MONDAY);
        $end = Carbon::create($this->year, 12, 31)->endOfWeek(Carbon::SUNDAY);

        while ($start->lte($end)) {
            $weeks[] = [
                'start' => $start->copy(),
                'end' => $start->copy()->addDays(6),
                'label' => $start->format('d/m'),
                'month' => $start->format('M'),
            ];
            $start->addWeek();
        }

        return $weeks;
    }

    protected function getSummits(): Collection
    {
        $query = Summit::with(['campaignActivities' => function ($q) {
            $q->whereYear('starts_at', $this->year)
                ->orWhereYear('ends_at', $this->year);
        }])
            ->whereHas('campaignActivities', function ($q) {
                $q->whereYear('starts_at', $this->year)
                    ->orWhereYear('ends_at', $this->year);
            });

        if ($this->typeFilter) {
            $query->where('summit_type', $this->typeFilter);
        }

        if ($this->search) {
            $query->where('title', 'ilike', "%{$this->search}%");
        }

        return $query->orderBy('pre_summit_starts_at')->get()->map(function (Summit $summit) {
            return [
                'id' => $summit->id,
                'title' => $summit->title,
                'type' => $summit->summit_type,
                'activities' => $summit->campaignActivities->map(fn (SummitCampaignActivity $a) => [
                    'id' => $a->id,
                    'type' => $a->activity_type,
                    'label' => $a->label ?: str_replace('_', ' ', ucfirst($a->activity_type)),
                    'starts_at' => $a->starts_at->format('Y-m-d'),
                    'ends_at' => $a->ends_at->format('Y-m-d'),
                    'color' => $a->color ?: (self::activityColors()[$a->activity_type] ?? '#6B7280'),
                ]),
            ];
        });
    }

    protected function getAnnotations(): Collection
    {
        return TimelineAnnotation::whereYear('date', $this->year)
            ->orderBy('date')
            ->get();
    }

    public static function activityColors(): array
    {
        return [
            'promo' => '#3B82F6',
            'peak_promo' => '#F59E0B',
            'event' => '#10B981',
            'book_speakers' => '#8B5CF6',
            'interviews' => '#6366F1',
            'testing' => '#EF4444',
            'replay' => '#06B6D4',
            'custom' => '#6B7280',
        ];
    }
}
