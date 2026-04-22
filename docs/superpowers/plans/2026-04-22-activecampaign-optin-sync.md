# ActiveCampaign Optin Sync Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Wire per-summit AC tags and shared list assignment into the optin sync flow, with failure tracking and retry UI in Filament.

**Architecture:** Two migrations add `ac_optin_tag` to summits and replace the boolean `activecampaign_synced` with `ac_sync_status`/`ac_sync_error`/`ac_synced_at` on optins. The existing `SyncOptinToActiveCampaign` job is rewritten to read tag from summit and list ID from AppSettings. `ActiveCampaignService` gains `addContactToList` and `findOrCreateTagByName` methods. Filament gets a new section on the Summit form and sync status columns + retry actions on the Contacts table.

**Tech Stack:** Laravel 13, Filament v4, Pest 4, PostgreSQL

---

### Task 1: Migration — add `ac_optin_tag` to summits

**Files:**
- Create: `database/migrations/2026_04_22_100000_add_ac_optin_tag_to_summits_table.php`
- Modify: `app/Models/Summit.php` (add to `$fillable`)

- [ ] **Step 1: Create migration**

```bash
php artisan make:migration add_ac_optin_tag_to_summits_table --table=summits --no-interaction
```

Replace the generated file contents with:

```php
<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    public function up(): void
    {
        Schema::table('summits', function (Blueprint $table) {
            $table->string('ac_optin_tag', 255)->nullable()->after('summit_type');
        });
    }

    public function down(): void
    {
        Schema::table('summits', function (Blueprint $table) {
            $table->dropColumn('ac_optin_tag');
        });
    }
};
```

- [ ] **Step 2: Add `ac_optin_tag` to Summit model `$fillable`**

In `app/Models/Summit.php`, add `'ac_optin_tag'` to the `$fillable` array after `'summit_type'`:

```php
protected $fillable = [
    'domain_id',
    'slug', 'title', 'description', 'topic', 'hero_image_url',
    'status', 'current_phase', 'timezone',
    'pre_summit_starts_at', 'late_pre_summit_starts_at',
    'during_summit_starts_at', 'post_summit_starts_at', 'ends_at',
    'audience',
    'summit_type',
    'ac_optin_tag',
    'style_reference_url', 'style_brief', 'style_brief_built_at', 'style_brief_status',
];
```

- [ ] **Step 3: Run migration**

```bash
php artisan migrate
```

Expected: migration runs successfully, `summits` table now has `ac_optin_tag` column.

- [ ] **Step 4: Commit**

```bash
git add database/migrations/*add_ac_optin_tag* app/Models/Summit.php
git commit -m "feat(ac): add ac_optin_tag column to summits table"
```

---

### Task 2: Migration — replace `activecampaign_synced` with status columns on optins

**Files:**
- Create: `database/migrations/2026_04_22_100001_update_ac_sync_columns_on_optins_table.php`
- Modify: `app/Models/Optin.php` (update `$fillable` and `casts()`)
- Modify: `database/factories/OptinFactory.php` (update default)

- [ ] **Step 1: Create migration**

```bash
php artisan make:migration update_ac_sync_columns_on_optins_table --table=optins --no-interaction
```

Replace the generated file contents with:

```php
<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Support\Facades\DB;

return new class extends Migration
{
    public function up(): void
    {
        DB::statement("ALTER TABLE optins ADD COLUMN ac_sync_status VARCHAR(20) NOT NULL DEFAULT 'pending'");
        DB::statement('ALTER TABLE optins ADD COLUMN ac_sync_error TEXT');
        DB::statement('ALTER TABLE optins ADD COLUMN ac_synced_at TIMESTAMPTZ');

        DB::statement("UPDATE optins SET ac_sync_status = 'synced' WHERE activecampaign_synced = true");

        DB::statement('ALTER TABLE optins DROP COLUMN activecampaign_synced');
    }

    public function down(): void
    {
        DB::statement('ALTER TABLE optins ADD COLUMN activecampaign_synced BOOLEAN NOT NULL DEFAULT false');
        DB::statement("UPDATE optins SET activecampaign_synced = true WHERE ac_sync_status = 'synced'");
        DB::statement('ALTER TABLE optins DROP COLUMN ac_sync_status');
        DB::statement('ALTER TABLE optins DROP COLUMN ac_sync_error');
        DB::statement('ALTER TABLE optins DROP COLUMN ac_synced_at');
    }
};
```

- [ ] **Step 2: Update Optin model**

In `app/Models/Optin.php`, replace the `$fillable` and `casts()`:

```php
protected $fillable = [
    'contact_id', 'user_id', 'email', 'first_name', 'summit_id', 'funnel_id', 'funnel_step_id',
    'source_url', 'ip_address', 'user_agent',
    'utm_source', 'utm_medium', 'utm_campaign', 'utm_content', 'utm_term',
    'ac_sync_status', 'ac_sync_error', 'ac_synced_at',
];

protected function casts(): array
{
    return [
        'created_at' => 'datetime',
        'ac_synced_at' => 'datetime',
    ];
}
```

- [ ] **Step 3: Update OptinFactory**

In `database/factories/OptinFactory.php`, replace the `definition()` method:

```php
public function definition(): array
{
    return [
        'email' => fake()->safeEmail(),
        'first_name' => fake()->firstName(),
        'ac_sync_status' => 'pending',
    ];
}
```

- [ ] **Step 4: Run migration**

```bash
php artisan migrate
```

Expected: migration runs, `optins` table now has `ac_sync_status`, `ac_sync_error`, `ac_synced_at` columns; `activecampaign_synced` is gone.

- [ ] **Step 5: Commit**

```bash
git add database/migrations/*update_ac_sync_columns* app/Models/Optin.php database/factories/OptinFactory.php
git commit -m "feat(ac): replace activecampaign_synced with ac_sync_status/error/synced_at on optins"
```

---

### Task 3: ActiveCampaignService — add `findOrCreateTagByName` and `addContactToList`

**Files:**
- Modify: `app/Services/ActiveCampaignService.php`
- Create: `tests/Unit/ActiveCampaignServiceTest.php`

- [ ] **Step 1: Write failing tests**

Create `tests/Unit/ActiveCampaignServiceTest.php`:

```php
<?php

use App\Services\ActiveCampaignService;
use Illuminate\Support\Facades\Http;

beforeEach(function () {
    config([
        'services.activecampaign.url' => 'https://test.api-us1.com',
        'services.activecampaign.key' => 'test-key',
    ]);
});

it('finds existing tag by name', function () {
    Http::fake([
        'test.api-us1.com/api/3/tags?search=ATS1+APR26+SIGNUP' => Http::response([
            'tags' => [['id' => '42', 'tag' => 'ATS1 APR26 SIGNUP']],
        ]),
    ]);

    $service = new ActiveCampaignService;
    $tagId = $service->findOrCreateTagByName('ATS1 APR26 SIGNUP');

    expect($tagId)->toBe('42');
});

it('creates tag when not found', function () {
    Http::fake([
        'test.api-us1.com/api/3/tags?search=NEW+TAG' => Http::response(['tags' => []]),
        'test.api-us1.com/api/3/tags' => Http::response(['tag' => ['id' => '99']]),
    ]);

    $service = new ActiveCampaignService;
    $tagId = $service->findOrCreateTagByName('NEW TAG');

    expect($tagId)->toBe('99');
    Http::assertSent(fn ($request) => $request->url() === 'https://test.api-us1.com/api/3/tags'
        && $request->method() === 'POST'
        && $request['tag']['tag'] === 'NEW TAG'
        && $request['tag']['tagType'] === 'contact'
    );
});

it('adds contact to list', function () {
    Http::fake([
        'test.api-us1.com/api/3/contactLists' => Http::response(['contactList' => ['id' => '1']]),
    ]);

    $service = new ActiveCampaignService;
    $service->addContactToList('55', '7');

    Http::assertSent(fn ($request) => $request->url() === 'https://test.api-us1.com/api/3/contactLists'
        && $request['contactList']['contact'] === '55'
        && $request['contactList']['list'] === '7'
        && $request['contactList']['status'] === 1
    );
});
```

- [ ] **Step 2: Run tests to verify they fail**

```bash
php artisan test --compact --filter=ActiveCampaignServiceTest
```

Expected: 3 failures — methods `findOrCreateTagByName` and `addContactToList` don't exist yet.

- [ ] **Step 3: Implement the two new methods**

In `app/Services/ActiveCampaignService.php`, make `findOrCreateContact`, `addTag`, and `request` public (they'll be called by the job directly). Then add the two new methods:

```php
public function findOrCreateTagByName(string $tagName): string
{
    $response = $this->request('GET', '/api/3/tags?search='.urlencode($tagName));

    foreach ($response['tags'] ?? [] as $tag) {
        if (strcasecmp($tag['tag'], $tagName) === 0) {
            return (string) $tag['id'];
        }
    }

    $created = $this->request('POST', '/api/3/tags', [
        'tag' => [
            'tag' => $tagName,
            'tagType' => 'contact',
        ],
    ]);

    return (string) $created['tag']['id'];
}

public function addContactToList(string $contactId, string $listId): void
{
    $this->request('POST', '/api/3/contactLists', [
        'contactList' => [
            'contact' => $contactId,
            'list' => $listId,
            'status' => 1,
        ],
    ]);
}
```

Also change `findOrCreateContact` and `addTag` and `request` from `private` to `public`:

```php
public function findOrCreateContact(string $email, string $name): int
```
```php
public function addTag(int|string $contactId, int|string $tagId): void
```
```php
public function request(string $method, string $path, array $data = []): array
```

- [ ] **Step 4: Run tests to verify they pass**

```bash
php artisan test --compact --filter=ActiveCampaignServiceTest
```

Expected: 3 passing tests.

- [ ] **Step 5: Commit**

```bash
git add app/Services/ActiveCampaignService.php tests/Unit/ActiveCampaignServiceTest.php
git commit -m "feat(ac): add findOrCreateTagByName and addContactToList to ActiveCampaignService"
```

---

### Task 4: Remove env-level tag IDs from config

**Files:**
- Modify: `config/services.php`
- Modify: `.env.example`

- [ ] **Step 1: Remove `optin_tag_id` and `product_tag_id` from config/services.php**

In `config/services.php`, replace the `activecampaign` block:

```php
'activecampaign' => [
    'url' => env('ACTIVE_CAMPAIGN_URL'),
    'key' => env('ACTIVE_CAMPAIGN_KEY'),
],
```

- [ ] **Step 2: Remove env vars from `.env.example`**

Remove these two lines from `.env.example`:

```
ACTIVE_CAMPAIGN_OPTIN_TAG_ID=123
ACTIVE_CAMPAIGN_PRODUCT_TAG_ID=456
```

- [ ] **Step 3: Commit**

```bash
git add config/services.php .env.example
git commit -m "refactor(ac): remove hardcoded tag IDs from env config"
```

---

### Task 5: Rewrite `SyncOptinToActiveCampaign` job

**Files:**
- Modify: `app/Jobs/SyncOptinToActiveCampaign.php`
- Modify: `tests/Unit/SyncOptinToActiveCampaignTest.php`

- [ ] **Step 1: Write failing tests**

Replace `tests/Unit/SyncOptinToActiveCampaignTest.php` entirely:

```php
<?php

use App\Jobs\SyncOptinToActiveCampaign;
use App\Models\AppSettings;
use App\Models\Contact;
use App\Models\Optin;
use App\Models\Summit;
use App\Services\ActiveCampaignService;
use Illuminate\Foundation\Testing\RefreshDatabase;

uses(RefreshDatabase::class);

it('syncs contact with tag from summit and list from settings', function () {
    $summit = Summit::factory()->create(['ac_optin_tag' => 'ATS1 APR26 SIGNUP']);
    $contact = Contact::factory()->create(['ac_contact_id' => null]);
    $optin = Optin::factory()->create([
        'contact_id' => $contact->id,
        'summit_id' => $summit->id,
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

it('skips sync when summit has no ac_optin_tag', function () {
    $summit = Summit::factory()->create(['ac_optin_tag' => null]);
    $contact = Contact::factory()->create();
    $optin = Optin::factory()->create([
        'contact_id' => $contact->id,
        'summit_id' => $summit->id,
        'ac_sync_status' => 'pending',
    ]);

    $ac = Mockery::mock(ActiveCampaignService::class);
    $ac->shouldNotReceive('findOrCreateContact');

    (new SyncOptinToActiveCampaign($optin))->handle($ac);

    expect($optin->fresh()->ac_sync_status)->toBe('synced');
});

it('skips list assignment when no list ID configured', function () {
    $summit = Summit::factory()->create(['ac_optin_tag' => 'TEST']);
    $contact = Contact::factory()->create();
    $optin = Optin::factory()->create([
        'contact_id' => $contact->id,
        'summit_id' => $summit->id,
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
    $summit = Summit::factory()->create(['ac_optin_tag' => 'TEST']);
    $contact = Contact::factory()->create();
    $optin = Optin::factory()->create([
        'contact_id' => $contact->id,
        'summit_id' => $summit->id,
    ]);

    $ac = Mockery::mock(ActiveCampaignService::class);
    $ac->shouldReceive('findOrCreateContact')
        ->andThrow(new \RuntimeException('AC API down'));

    $job = new SyncOptinToActiveCampaign($optin);
    $job->failed(new \RuntimeException('AC API down'));

    $optin->refresh();
    expect($optin->ac_sync_status)->toBe('failed');
    expect($optin->ac_sync_error)->toBe('AC API down');
});
```

- [ ] **Step 2: Run tests to verify they fail**

```bash
php artisan test --compact --filter=SyncOptinToActiveCampaignTest
```

Expected: failures because the job still uses old logic.

- [ ] **Step 3: Rewrite the job**

Replace `app/Jobs/SyncOptinToActiveCampaign.php` entirely:

```php
<?php

namespace App\Jobs;

use App\Models\AppSettings;
use App\Models\Contact;
use App\Models\Optin;
use App\Services\ActiveCampaignService;
use Illuminate\Bus\Queueable;
use Illuminate\Contracts\Queue\ShouldQueue;
use Illuminate\Foundation\Bus\Dispatchable;
use Illuminate\Queue\InteractsWithQueue;
use Illuminate\Queue\SerializesModels;
use Illuminate\Support\Facades\Log;

class SyncOptinToActiveCampaign implements ShouldQueue
{
    use Dispatchable, InteractsWithQueue, Queueable, SerializesModels;

    public int $tries = 3;

    public array $backoff = [10, 60, 300];

    public function __construct(private readonly Optin $optin) {}

    public function handle(ActiveCampaignService $ac): void
    {
        $this->optin->loadMissing(['summit', 'contact']);

        $tagName = $this->optin->summit?->ac_optin_tag;

        if (! $tagName) {
            $this->optin->update(['ac_sync_status' => 'synced', 'ac_synced_at' => now()]);

            return;
        }

        $contactId = $ac->findOrCreateContact(
            $this->optin->email,
            $this->optin->first_name ?? $this->optin->email,
        );

        $tagId = $ac->findOrCreateTagByName($tagName);
        $ac->addTag($contactId, $tagId);

        $listId = AppSettings::current()->activecampaign_list_id;
        if ($listId) {
            $ac->addContactToList((string) $contactId, $listId);
        }

        $this->optin->update([
            'ac_sync_status' => 'synced',
            'ac_synced_at' => now(),
            'ac_sync_error' => null,
        ]);

        if ($this->optin->contact_id) {
            Contact::where('id', $this->optin->contact_id)
                ->whereNull('ac_contact_id')
                ->update(['ac_contact_id' => (string) $contactId]);
        }
    }

    public function failed(\Throwable $exception): void
    {
        $this->optin->update([
            'ac_sync_status' => 'failed',
            'ac_sync_error' => $exception->getMessage(),
        ]);

        Log::critical('SyncOptinToActiveCampaign failed permanently', [
            'optin_id' => $this->optin->id,
            'email' => $this->optin->email,
            'error' => $exception->getMessage(),
        ]);
    }
}
```

- [ ] **Step 4: Run tests to verify they pass**

```bash
php artisan test --compact --filter=SyncOptinToActiveCampaignTest
```

Expected: 4 passing tests.

- [ ] **Step 5: Commit**

```bash
git add app/Jobs/SyncOptinToActiveCampaign.php tests/Unit/SyncOptinToActiveCampaignTest.php
git commit -m "feat(ac): rewrite sync job to use per-summit tags and list assignment"
```

---

### Task 6: Update OptinController test for new status column

**Files:**
- Modify: `tests/Feature/Api/OptinControllerTest.php`

- [ ] **Step 1: Update existing test assertions**

In `tests/Feature/Api/OptinControllerTest.php`, the test `'creates contact and optin, returns redirect url'` currently doesn't check sync status. Add an assertion after the optin exists check:

```php
$optin = Optin::where('contact_id', $contact->id)->first();
expect($optin)->not->toBeNull();
expect($optin->ac_sync_status)->toBe('pending');
```

- [ ] **Step 2: Run the test**

```bash
php artisan test --compact --filter=OptinControllerTest
```

Expected: 3 passing tests.

- [ ] **Step 3: Commit**

```bash
git add tests/Feature/Api/OptinControllerTest.php
git commit -m "test(ac): assert optin starts with pending ac_sync_status"
```

---

### Task 7: Filament — add AC section to Summit form

**Files:**
- Modify: `app/Filament/Resources/Summits/SummitResource.php`

- [ ] **Step 1: Add ActiveCampaign section to the form**

In `app/Filament/Resources/Summits/SummitResource.php`, inside the `form()` method, add a new `Section` after the existing "Basics" section (before the closing `]);` of the `components` array):

```php
Section::make('ActiveCampaign')
    ->description('Tag applied to contacts who opt in via this summit\'s funnels.')
    ->collapsed()
    ->columnSpanFull()
    ->components([
        TextInput::make('ac_optin_tag')
            ->label('Optin tag')
            ->placeholder('e.g. ATS1 APR26 SIGNUP')
            ->maxLength(255)
            ->helperText('Contacts will be tagged with this value in ActiveCampaign when they opt in. Leave blank to skip AC sync.'),
    ]),
```

- [ ] **Step 2: Verify in browser**

Open the Summit edit form in the admin panel. Confirm the "ActiveCampaign" section appears collapsed at the bottom, expands to show the tag input, and saves correctly.

- [ ] **Step 3: Commit**

```bash
git add app/Filament/Resources/Summits/SummitResource.php
git commit -m "feat(ac): add AC optin tag field to Summit edit form"
```

---

### Task 8: Filament — add sync status columns and retry actions to Contacts table

**Files:**
- Modify: `app/Filament/Resources/Contacts/ContactsTable.php`
- Modify: `app/Filament/Resources/Contacts/ContactResource.php`

- [ ] **Step 1: Add Optins relation manager**

Create `app/Filament/Resources/Contacts/RelationManagers/OptinsRelationManager.php`:

```php
<?php

namespace App\Filament\Resources\Contacts\RelationManagers;

use App\Jobs\SyncOptinToActiveCampaign;
use App\Models\Optin;
use Filament\Actions\Action;
use Filament\Actions\BulkAction;
use Filament\Resources\RelationManagers\RelationManager;
use Filament\Schemas\Schema;
use Filament\Support\Icons\Heroicon;
use Filament\Tables\Columns\TextColumn;
use Filament\Tables\Filters\SelectFilter;
use Filament\Tables\Table;
use Illuminate\Database\Eloquent\Collection;

class OptinsRelationManager extends RelationManager
{
    protected static string $relationship = 'optins';

    public function table(Table $table): Table
    {
        return $table
            ->columns([
                TextColumn::make('email')
                    ->searchable(),
                TextColumn::make('first_name')
                    ->searchable(),
                TextColumn::make('summit.title')
                    ->label('Summit'),
                TextColumn::make('ac_sync_status')
                    ->label('AC Status')
                    ->badge()
                    ->color(fn (string $state): string => match ($state) {
                        'synced' => 'success',
                        'failed' => 'danger',
                        default => 'gray',
                    })
                    ->tooltip(fn (Optin $record): ?string => $record->ac_sync_error),
                TextColumn::make('ac_synced_at')
                    ->label('Synced at')
                    ->since()
                    ->placeholder('—'),
                TextColumn::make('created_at')
                    ->since()
                    ->sortable(),
            ])
            ->defaultSort('created_at', 'desc')
            ->filters([
                SelectFilter::make('ac_sync_status')
                    ->label('AC Status')
                    ->options([
                        'pending' => 'Pending',
                        'synced' => 'Synced',
                        'failed' => 'Failed',
                    ]),
            ])
            ->recordActions([
                Action::make('retry_ac_sync')
                    ->label('Retry AC Sync')
                    ->icon(Heroicon::OutlinedArrowPath)
                    ->color('warning')
                    ->visible(fn (Optin $record): bool => $record->ac_sync_status === 'failed')
                    ->requiresConfirmation()
                    ->action(function (Optin $record): void {
                        $record->update([
                            'ac_sync_status' => 'pending',
                            'ac_sync_error' => null,
                        ]);
                        SyncOptinToActiveCampaign::dispatch($record);
                    }),
            ])
            ->toolbarActions([
                BulkAction::make('retry_failed_syncs')
                    ->label('Retry Failed Syncs')
                    ->icon(Heroicon::OutlinedArrowPath)
                    ->color('warning')
                    ->requiresConfirmation()
                    ->deselectRecordsAfterCompletion()
                    ->action(function (Collection $records): void {
                        $failed = $records->where('ac_sync_status', 'failed');
                        foreach ($failed as $optin) {
                            $optin->update([
                                'ac_sync_status' => 'pending',
                                'ac_sync_error' => null,
                            ]);
                            SyncOptinToActiveCampaign::dispatch($optin);
                        }
                    }),
            ]);
    }
}
```

- [ ] **Step 2: Register the relation manager on ContactResource**

In `app/Filament/Resources/Contacts/ContactResource.php`, add the `getRelations` method and the necessary import:

```php
use App\Filament\Resources\Contacts\RelationManagers\OptinsRelationManager;
```

```php
public static function getRelations(): array
{
    return [
        OptinsRelationManager::class,
    ];
}
```

Also add a View page so the relation manager has somewhere to render. In `getPages()`:

```php
public static function getPages(): array
{
    return [
        'index' => ListContacts::route('/'),
        'view' => Pages\ViewContact::route('/{record}'),
    ];
}
```

- [ ] **Step 3: Create the ViewContact page**

Create `app/Filament/Resources/Contacts/Pages/ViewContact.php`:

```php
<?php

namespace App\Filament\Resources\Contacts\Pages;

use App\Filament\Resources\Contacts\ContactResource;
use Filament\Resources\Pages\ViewRecord;

class ViewContact extends ViewRecord
{
    protected static string $resource = ContactResource::class;
}
```

- [ ] **Step 4: Update ContactsTable to show AC sync summary**

In `app/Filament/Resources/Contacts/ContactsTable.php`, add after the `ac_contact_id` column:

```php
TextColumn::make('optins_failed_count')
    ->label('Failed syncs')
    ->state(fn ($record) => $record->optins()->where('ac_sync_status', 'failed')->count())
    ->badge()
    ->color(fn (int $state): string => $state > 0 ? 'danger' : 'gray')
    ->placeholder('0'),
```

- [ ] **Step 5: Verify in browser**

Open the Contacts list in Filament. Confirm the "Failed syncs" column appears. Click into a contact — confirm the Optins relation table shows with AC Status badges, the retry action on failed rows, and the bulk retry action.

- [ ] **Step 6: Commit**

```bash
git add app/Filament/Resources/Contacts/
git commit -m "feat(ac): add optins relation manager with sync status and retry actions"
```

---

### Task 9: Run full test suite and fix any breakage

**Files:**
- Any files with broken references to `activecampaign_synced`

- [ ] **Step 1: Run full test suite**

```bash
php artisan test --compact
```

- [ ] **Step 2: Fix any failures**

Search for any remaining references to `activecampaign_synced` and update them to use `ac_sync_status`:

```bash
grep -r "activecampaign_synced" --include="*.php" app/ tests/ database/
```

Fix each occurrence.

- [ ] **Step 3: Run Pint**

```bash
vendor/bin/pint --dirty --format agent
```

- [ ] **Step 4: Run full test suite again**

```bash
php artisan test --compact
```

Expected: all tests pass.

- [ ] **Step 5: Commit**

```bash
git add -A
git commit -m "fix(ac): clean up remaining activecampaign_synced references"
```
