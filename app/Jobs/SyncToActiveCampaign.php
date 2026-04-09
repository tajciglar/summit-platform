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
        $order->loadMissing('user', 'items.product');

        $tagIds = [];

        // Add the purchaser tag if configured
        $purchaserTagId = config('services.activecampaign.purchaser_tag_id');
        if ($purchaserTagId) {
            $tagIds[] = $purchaserTagId;
        }

        // Add per-product tags from product metadata
        foreach ($order->items as $item) {
            if ($item->product?->activecampaign_tag_id) {
                $tagIds[] = $item->product->activecampaign_tag_id;
            }
        }

        $email = $order->user->email;
        $name = $order->user->name ?? $email;

        return new self($email, $name, $tagIds);
    }
}
