<?php

use App\Jobs\SyncOptinToActiveCampaign;
use App\Models\Contact;
use App\Models\Optin;
use App\Services\ActiveCampaignService;
use Illuminate\Foundation\Testing\RefreshDatabase;

uses(RefreshDatabase::class);

it('stores ac_contact_id on contact after sync', function () {
    $contact = Contact::factory()->create(['ac_contact_id' => null]);
    $optin = Optin::factory()->create(['contact_id' => $contact->id]);

    $ac = Mockery::mock(ActiveCampaignService::class);
    $ac->shouldReceive('syncContactWithTags')
        ->once()
        ->andReturn('99');

    app()->instance(ActiveCampaignService::class, $ac);

    (new SyncOptinToActiveCampaign($optin))->handle($ac);

    expect($contact->fresh()->ac_contact_id)->toBe('99');
    expect($optin->fresh()->activecampaign_synced)->toBeTrue();
});
