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

it('lists all media items globally — no domain scoping', function () {
    $a = MediaItem::factory()->create();
    $b = MediaItem::factory()->create();
    $c = MediaItem::factory()->create();

    livewire(ListMediaItems::class)
        ->loadTable()
        ->assertCanSeeTableRecords([$a, $b, $c]);
});

it('renders the landing_page tab without erroring', function () {
    MediaItem::factory()->create([
        'category' => MediaCategory::LandingPage,
        'sub_category' => 'pages',
    ]);

    livewire(ListMediaItems::class, ['activeTab' => 'landing_page'])
        ->loadTable()
        ->assertSuccessful();
});

it('filters by sub-category when drilled into a product tab', function () {
    $productImage = MediaItem::factory()->create([
        'category' => MediaCategory::Product,
        'sub_category' => 'product',
    ]);
    $bumpImage = MediaItem::factory()->create([
        'category' => MediaCategory::Product,
        'sub_category' => 'bump',
    ]);
    $upsellImage = MediaItem::factory()->create([
        'category' => MediaCategory::Product,
        'sub_category' => 'upsell',
    ]);

    livewire(ListMediaItems::class, ['activeTab' => 'product'])
        ->set('activeSubCategory', 'bump')
        ->loadTable()
        ->assertCanSeeTableRecords([$bumpImage])
        ->assertCanNotSeeTableRecords([$productImage, $upsellImage]);
});

it('resets sub-category when switching top-level tabs', function () {
    $component = livewire(ListMediaItems::class, ['activeTab' => 'product'])
        ->set('activeSubCategory', 'bump');

    expect($component->get('activeSubCategory'))->toBe('bump');

    $component->set('activeTab', 'landing_page');

    expect($component->get('activeSubCategory'))->toBeNull();
});

it('guards delete when item has attachments', function () {
    $item = MediaItem::factory()->create();
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
