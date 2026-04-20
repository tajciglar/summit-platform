<?php
use App\Models\Contact;
use App\Models\Funnel;
use App\Models\Optin;
use App\Models\Summit;
use Illuminate\Support\Facades\Queue;

uses(\Illuminate\Foundation\Testing\RefreshDatabase::class);

beforeEach(function () {
    Queue::fake();
});

it('creates contact and optin, returns redirect url', function () {
    $summit = Summit::factory()->create(['slug' => 'aps25']);
    $funnel = Funnel::factory()->create(['summit_id' => $summit->id, 'slug' => 'main']);

    $response = $this->postJson('/api/optins', [
        'first_name' => 'Jane',
        'email' => 'jane@example.com',
        'funnel_id' => $funnel->id,
    ]);

    $response->assertOk()
        ->assertJsonStructure(['redirect']);

    expect($response->json('redirect'))->toContain('email=jane%40example.com');
    expect($response->json('redirect'))->toContain('first_name=Jane');

    $contact = Contact::where('email', 'jane@example.com')->first();
    expect($contact)->not->toBeNull();
    expect($contact->first_name)->toBe('Jane');

    expect(Optin::where('contact_id', $contact->id)->exists())->toBeTrue();

    Queue::assertPushed(\App\Jobs\SyncOptinToActiveCampaign::class);
});

it('upserts contact when email already exists', function () {
    $summit = Summit::factory()->create(['slug' => 'aps25-b']);
    $funnel = Funnel::factory()->create(['summit_id' => $summit->id, 'slug' => 'main']);
    Contact::factory()->create(['email' => 'repeat@example.com', 'first_name' => 'Old']);

    $this->postJson('/api/optins', [
        'first_name' => 'New',
        'email' => 'repeat@example.com',
        'funnel_id' => $funnel->id,
    ])->assertOk();

    expect(Contact::where('email', 'repeat@example.com')->count())->toBe(1);
    expect(Contact::where('email', 'repeat@example.com')->first()->first_name)->toBe('New');
});

it('returns 422 for missing email', function () {
    $funnel = Funnel::factory()->for(Summit::factory())->create();

    $this->postJson('/api/optins', [
        'first_name' => 'Jane',
        'funnel_id' => $funnel->id,
    ])->assertUnprocessable();
});
