<?php

use App\Jobs\SyncOptinToActiveCampaign;
use App\Models\AppSettings;
use App\Models\Contact;
use App\Models\Funnel;
use App\Models\Optin;
use App\Models\Summit;
use App\Services\ActiveCampaignService;
use Illuminate\Foundation\Testing\RefreshDatabase;

uses(RefreshDatabase::class);

it('syncs contact with tag from funnel and list from settings', function () {
    $summit = Summit::factory()->create();
    $funnel = Funnel::factory()->create([
        'summit_id' => $summit->id,
        'ac_optin_tag' => 'ATS1 APR26 SIGNUP',
    ]);
    $contact = Contact::factory()->create(['ac_contact_id' => null]);
    $optin = Optin::factory()->create([
        'contact_id' => $contact->id,
        'summit_id' => $summit->id,
        'funnel_id' => $funnel->id,
        'ac_sync_status' => 'pending',
    ]);

    AppSettings::current()->update(['activecampaign_list_id' => '7']);

    $ac = Mockery::mock(ActiveCampaignService::class);
    $ac->shouldReceive('findOrCreateContact')
        ->once()
        ->with($optin->email, $optin->first_name)
        ->andReturn(55);
    $ac->shouldReceive('findOrCreateTagByName')
        ->once()
        ->with('ATS1 APR26 SIGNUP')
        ->andReturn('42');
    $ac->shouldReceive('addTag')
        ->once()
        ->with(55, '42');
    $ac->shouldReceive('addContactToList')
        ->once()
        ->with('55', '7');

    (new SyncOptinToActiveCampaign($optin))->handle($ac);

    $optin->refresh();
    expect($optin->ac_sync_status)->toBe('synced');
    expect($optin->ac_synced_at)->not->toBeNull();
    expect($optin->ac_sync_error)->toBeNull();
    expect($contact->fresh()->ac_contact_id)->toBe('55');
});

it('skips sync when funnel has no ac_optin_tag', function () {
    $summit = Summit::factory()->create();
    $funnel = Funnel::factory()->create([
        'summit_id' => $summit->id,
        'ac_optin_tag' => null,
    ]);
    $contact = Contact::factory()->create();
    $optin = Optin::factory()->create([
        'contact_id' => $contact->id,
        'summit_id' => $summit->id,
        'funnel_id' => $funnel->id,
        'ac_sync_status' => 'pending',
    ]);

    $ac = Mockery::mock(ActiveCampaignService::class);
    $ac->shouldNotReceive('findOrCreateContact');

    (new SyncOptinToActiveCampaign($optin))->handle($ac);

    expect($optin->fresh()->ac_sync_status)->toBe('synced');
});

it('skips list assignment when no list ID configured', function () {
    $summit = Summit::factory()->create();
    $funnel = Funnel::factory()->create([
        'summit_id' => $summit->id,
        'ac_optin_tag' => 'TEST',
    ]);
    $contact = Contact::factory()->create();
    $optin = Optin::factory()->create([
        'contact_id' => $contact->id,
        'summit_id' => $summit->id,
        'funnel_id' => $funnel->id,
    ]);

    AppSettings::current()->update(['activecampaign_list_id' => null]);

    $ac = Mockery::mock(ActiveCampaignService::class);
    $ac->shouldReceive('findOrCreateContact')->andReturn(1);
    $ac->shouldReceive('findOrCreateTagByName')->andReturn('1');
    $ac->shouldReceive('addTag');
    $ac->shouldNotReceive('addContactToList');

    (new SyncOptinToActiveCampaign($optin))->handle($ac);

    expect($optin->fresh()->ac_sync_status)->toBe('synced');
});

it('sets failed status with error message on exception', function () {
    $summit = Summit::factory()->create();
    $funnel = Funnel::factory()->create([
        'summit_id' => $summit->id,
        'ac_optin_tag' => 'TEST',
    ]);
    $contact = Contact::factory()->create();
    $optin = Optin::factory()->create([
        'contact_id' => $contact->id,
        'summit_id' => $summit->id,
        'funnel_id' => $funnel->id,
    ]);

    $job = new SyncOptinToActiveCampaign($optin);
    $job->failed(new RuntimeException('AC API down'));

    $optin->refresh();
    expect($optin->ac_sync_status)->toBe('failed');
    expect($optin->ac_sync_error)->toBe('AC API down');
});
