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
});

it('creates a MediaItem and attaches the uploaded file via addMedia', function () {
    $domain = Domain::factory()->create();
    $user = User::factory()->create();

    $this->actingAs($user);
    Filament::setTenant($domain);

    $file = UploadedFile::fake()->image('hero.png', 800, 600);

    livewire(CreateMediaItem::class)
        ->fillForm([
            'category' => MediaCategory::LandingPage->value,
            'sub_category' => 'hero',
            'caption' => 'Test hero',
            'alt_text' => 'A test hero image',
            'file_upload' => $file,
        ])
        ->call('create')
        ->assertHasNoFormErrors();

    $item = MediaItem::first();
    expect($item)->not->toBeNull();
    expect($item->category)->toBe(MediaCategory::LandingPage);
    expect($item->domain_id)->toBe($domain->id);
    expect($item->created_by_user_id)->toBe($user->id);
    expect($item->path)->not->toBe('');
    expect($item->file_name)->not->toBe('');
    expect($item->getFirstMedia('file'))->not->toBeNull();
});
