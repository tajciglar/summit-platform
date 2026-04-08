<?php

namespace App\Jobs;

use App\Models\Order;
use App\Services\BrevoMailer;
use Illuminate\Bus\Queueable;
use Illuminate\Contracts\Queue\ShouldQueue;
use Illuminate\Foundation\Bus\Dispatchable;
use Illuminate\Queue\InteractsWithQueue;
use Illuminate\Queue\SerializesModels;

class SendOrderConfirmationEmail implements ShouldQueue
{
    use Dispatchable, InteractsWithQueue, Queueable, SerializesModels;

    public int $tries = 3;

    public array $backoff = [10, 60, 300];

    public function __construct(private readonly Order $order) {}

    public function handle(BrevoMailer $mailer): void
    {
        $mailer->sendOrderConfirmation($this->order);
    }
}
