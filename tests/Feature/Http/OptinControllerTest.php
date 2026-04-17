<?php

use App\Models\{Funnel, Optin, Summit};

it('creates an optin for a valid funnel_id + email', function () {
    $summit = Summit::factory()->create();
    $funnel = Funnel::factory()->for($summit)->create();

    $response = $this->postJson('/api/optins', [
        'funnel_id' => $funnel->id,
        'email' => 'Test@Example.COM',
        'first_name' => 'Taj',
        'utm_source' => 'hp',
    ]);

    $response->assertCreated();
    $response->assertJson(['ok' => true]);

    expect(Optin::count())->toBe(1);
    $optin = Optin::first();
    expect($optin->email)->toBe('test@example.com');   // lowercased
    expect($optin->funnel_id)->toBe($funnel->id);
    expect($optin->summit_id)->toBe($summit->id);       // auto-resolved
    expect($optin->utm_source)->toBe('hp');
});

it('rejects invalid funnel_id', function () {
    $this->postJson('/api/optins', [
        'funnel_id' => '00000000-0000-0000-0000-000000000000',
        'email' => 'a@b.com',
    ])->assertUnprocessable();
});

it('rejects malformed email', function () {
    $summit = Summit::factory()->create();
    $funnel = Funnel::factory()->for($summit)->create();

    $this->postJson('/api/optins', [
        'funnel_id' => $funnel->id,
        'email' => 'not-an-email',
    ])->assertUnprocessable();
});
