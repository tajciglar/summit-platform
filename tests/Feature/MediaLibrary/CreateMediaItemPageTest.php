<?php

use App\Enums\MediaCategory;
use App\Filament\Resources\MediaItems\Pages\CreateMediaItem;
use App\Models\Domain;
use App\Models\MediaItem;
use App\Models\User;
use Filament\Facades\Filament;
use Illuminate\Foundation\Testing\RefreshDatabase;
use Illuminate\Http\UploadedFile;
use Illuminate\Support\Facades\Storage;

use function Pest\Livewire\livewire;

uses(RefreshDatabase::class);

beforeEach(function () {
    config()->set('media-library.disk_name', 'public');
    Storage::fake('public');

    $this->domain = Domain::factory()->create();
    $this->user = User::factory()->create();
    $this->actingAs($this->user);
    Filament::setTenant($this->domain);
});

it('bulk-uploads multiple files and creates one MediaItem per row', function () {
    $first = UploadedFile::fake()->image('my-photo_v2.JPG', 800, 600);
    $second = UploadedFile::fake()->image('hero-banner.png', 800, 600);

    livewire(CreateMediaItem::class)
        ->set('data.uploads', [$first, $second])
        ->set('data.items', [
            [
                'file_key' => '0',
                'file_name' => 'my-photo_v2.JPG',
                'title' => 'My Photo V2',
                'category' => MediaCategory::LandingPage->value,
                'sub_category' => 'pages',
            ],
            [
                'file_key' => '1',
                'file_name' => 'hero-banner.png',
                'title' => 'Hero Banner',
                'category' => MediaCategory::Brand->value,
                'sub_category' => 'logo',
            ],
        ])
        ->call('create')
        ->assertHasNoFormErrors();

    expect(MediaItem::count())->toBe(2);

    $landing = MediaItem::where('category', MediaCategory::LandingPage)->first();
    expect($landing)->not->toBeNull()
        ->and($landing->sub_category)->toBe('pages')
        ->and($landing->caption)->toBe('My Photo V2')
        ->and($landing->created_by_user_id)->toBe($this->user->id);

    $brand = MediaItem::where('category', MediaCategory::Brand)->first();
    expect($brand)->not->toBeNull()
        ->and($brand->sub_category)->toBe('logo')
        ->and($brand->caption)->toBe('Hero Banner');
});

it('blocks submission when a row is missing a category', function () {
    $file = UploadedFile::fake()->image('a.png', 100, 100);

    livewire(CreateMediaItem::class)
        ->set('data.uploads', [$file])
        ->set('data.items', [
            [
                'file_key' => '0',
                'file_name' => 'a.png',
                'title' => 'A',
                'category' => null,
                'sub_category' => null,
            ],
        ])
        ->call('create')
        ->assertHasFormErrors(['items.0.category' => 'required']);

    expect(MediaItem::count())->toBe(0);
});
