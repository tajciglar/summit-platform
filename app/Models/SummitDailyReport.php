<?php

namespace App\Models;

use App\Models\Concerns\HasUuid;
use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Relations\BelongsTo;

class SummitDailyReport extends Model
{
    use HasUuid;

    protected $fillable = [
        'summit_id', 'report_date',
        'views', 'optins', 'nr_of_purchases', 'revenue_usd_cents', 'revenue_eur_cents',
        'ad_spend_eur_cents', 'cpc_eur_cents',
        'optin_rate', 'purchase_rate', 'cpl_eur_cents', 'cpo_eur_cents',
        'aov_usd_cents', 'roas', 'checkout_rate', 'upgrade_checkout_rate', 'upsell_take_rate',
        'comment', 'execution_notes',
    ];

    protected $casts = [
        'report_date' => 'date',
        'views' => 'integer',
        'optins' => 'integer',
        'nr_of_purchases' => 'integer',
        'revenue_usd_cents' => 'integer',
        'revenue_eur_cents' => 'integer',
        'ad_spend_eur_cents' => 'integer',
        'cpc_eur_cents' => 'integer',
        'cpl_eur_cents' => 'integer',
        'cpo_eur_cents' => 'integer',
        'aov_usd_cents' => 'integer',
        'optin_rate' => 'float',
        'purchase_rate' => 'float',
        'roas' => 'float',
        'checkout_rate' => 'float',
        'upgrade_checkout_rate' => 'float',
        'upsell_take_rate' => 'float',
    ];

    public function summit(): BelongsTo
    {
        return $this->belongsTo(Summit::class);
    }

    /**
     * Recalculate computable fields from source tables (page_views, optins, orders).
     */
    public function recalculateFromSource(): self
    {
        $date = $this->report_date;
        $summitId = $this->summit_id;

        $this->views = PageView::where('summit_id', $summitId)
            ->whereDate('created_at', $date)
            ->count();

        $this->optins = Optin::where('summit_id', $summitId)
            ->whereDate('created_at', $date)
            ->count();

        $orders = Order::where('summit_id', $summitId)
            ->where('status', 'completed')
            ->whereDate('completed_at', $date);

        $this->nr_of_purchases = $orders->count();
        $this->revenue_usd_cents = $orders->sum('total_cents');

        $this->recalculateDerivedRates();

        return $this;
    }

    /**
     * Recalculate derived rates from stored numerics.
     */
    public function recalculateDerivedRates(): self
    {
        $this->optin_rate = $this->views > 0
            ? round($this->optins / $this->views, 4) : null;

        $this->purchase_rate = $this->optins > 0
            ? round($this->nr_of_purchases / $this->optins, 4) : null;

        $this->cpl_eur_cents = ($this->ad_spend_eur_cents && $this->optins > 0)
            ? (int) round($this->ad_spend_eur_cents / $this->optins) : null;

        $this->cpo_eur_cents = ($this->ad_spend_eur_cents && $this->nr_of_purchases > 0)
            ? (int) round($this->ad_spend_eur_cents / $this->nr_of_purchases) : null;

        $this->aov_usd_cents = $this->nr_of_purchases > 0
            ? (int) round($this->revenue_usd_cents / $this->nr_of_purchases) : null;

        $this->roas = ($this->ad_spend_eur_cents > 0 && $this->revenue_eur_cents)
            ? round($this->revenue_eur_cents / $this->ad_spend_eur_cents, 4) : null;

        return $this;
    }

    protected static function booted(): void
    {
        static::saving(function (self $report) {
            $report->recalculateDerivedRates();
        });
    }
}
