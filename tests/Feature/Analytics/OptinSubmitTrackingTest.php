<?php

use App\Models\Funnel;
use App\Models\Optin;
use App\Models\PageView;
use App\Models\Summit;
use Illuminate\Foundation\Testing\RefreshDatabase;
use Illuminate\Support\Facades\Queue;

uses(RefreshDatabase::class);

it('writes a page_view row with page_type=optin_submit when an optin is created', function () {
    Queue::fake();

    $summit = Summit::factory()->create();
    $funnel = Funnel::factory()->for($summit)->create();

    $this->postJson('/api/optins', [
        'first_name' => 'Taj',
        'email' => 'taj@example.com',
        'funnel_id' => $funnel->id,
    ])->assertOk();

    expect(Optin::count())->toBe(1);
    expect(PageView::where('page_type', 'optin_submit')->where('summit_id', $summit->id)->count())->toBe(1);
});
