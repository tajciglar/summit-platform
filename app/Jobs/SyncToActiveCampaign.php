<?php

namespace App\Jobs;

use App\Models\Order;
use App\Services\ActiveCampaignService;
use Illuminate\Bus\Queueable;
use Illuminate\Contracts\Queue\ShouldQueue;
use Illuminate\Foundation\Bus\Dispatchable;
use Illuminate\Queue\InteractsWithQueue;
use Illuminate\Queue\SerializesModels;

class SyncToActiveCampaign implements ShouldQueue
{
    use Dispatchable, InteractsWithQueue, Queueable, SerializesModels;

    public int $tries = 3;

    public array $backoff = [10, 60, 300];

    public function __construct(
        private readonly string $email,
        private readonly string $name,
        private readonly array $tagIds,
    ) {}

    public function handle(ActiveCampaignService $ac): void
    {
        $ac->syncContactWithTags($this->email, $this->name, $this->tagIds);
    }

    /**
     * Create from a paid order — determines which tags to apply.
     */
    public static function fromOrder(Order $order): self
    {
        $order->loadMissing('product');

        $tagIds = [];

        // Add the product-specific tag if configured
        $productTagId = config('services.activecampaign.product_tag_id');
        if ($productTagId) {
            $tagIds[] = $productTagId;
        }

        return new self(
            $order->customer_email,
            $order->customer_name ?? $order->customer_email,
            $tagIds,
        );
    }
}
