<?php

use App\Enums\MediaCategory;
use App\Filament\Resources\MediaItems\Pages\ListMediaItems;
use App\Models\Domain;
use App\Models\MediaItem;
use App\Models\User;
use Filament\Facades\Filament;
use Illuminate\Foundation\Testing\RefreshDatabase;
use Illuminate\Support\Facades\Storage;
use Illuminate\Support\Str;

use function Pest\Livewire\livewire;

uses(RefreshDatabase::class);

beforeEach(function () {
    config()->set('media-library.disk_name', 'public');
    Storage::fake('public');

    $this->domain = Domain::factory()->create();
    $this->user = User::factory()->create();
    $this->user->domains()->attach($this->domain);
    $this->user->givePermissionTo(['media_library.view', 'media_library.upload', 'media_library.delete']);

    $this->actingAs($this->user);
    Filament::setTenant($this->domain);
});

it('lists own-domain and global items, hides other domains', function () {
    $mine = MediaItem::factory()->create(['domain_id' => $this->domain->id]);
    $global = MediaItem::factory()->create(['domain_id' => null]);
    $otherDomain = Domain::factory()->create();
    $hidden = MediaItem::factory()->create(['domain_id' => $otherDomain->id]);

    livewire(ListMediaItems::class)
        ->loadTable()
        ->assertCanSeeTableRecords([$mine, $global])
        ->assertCanNotSeeTableRecords([$hidden]);
});

it('renders the landing_page tab without erroring', function () {
    MediaItem::factory()->create(['domain_id' => $this->domain->id, 'category' => MediaCategory::LandingPage]);

    livewire(ListMediaItems::class, ['activeTab' => 'landing_page'])
        ->loadTable()
        ->assertSuccessful();
});

it('guards delete when item has attachments', function () {
    $item = MediaItem::factory()->create(['domain_id' => $this->domain->id]);
    DB::table('media_item_attachments')->insert([
        'id' => Str::uuid(),
        'media_item_id' => $item->id,
        'attachable_id' => Str::uuid(),
        'attachable_type' => 'App\\Models\\Summit',
        'role' => 'hero',
        'sort_order' => 0,
        'created_at' => now(),
        'updated_at' => now(),
    ]);

    livewire(ListMediaItems::class)
        ->callTableAction('delete', $item)
        ->assertNotified('In use');

    expect(MediaItem::find($item->id))->not->toBeNull();
});
