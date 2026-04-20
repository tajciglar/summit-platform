# Next.js Landing + Sales → FunnelKit Checkout Flow Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Wire optin form (Next.js) → Laravel (stores Contact + Optin, syncs AC) → sales page → FunnelKit checkout (pre-filled), for the `parenting-summits.com` funnel.

**Architecture:** A new `Contact` model deduplicates leads by email. Each optin creates/updates a Contact and a linked Optin record. The existing `SyncOptinToActiveCampaign` job is extended to also update `contacts.ac_contact_id`. A new API endpoint `POST /api/optins` returns a redirect URL so the Next.js form can send the visitor to the sales page with email/name in the URL. A `FunnelContext` provides `funnel.id` to client blocks without touching the block schema. A `useCheckoutUrl` hook on the sales page appends those URL params to the FunnelKit checkout URL.

**Tech Stack:** Laravel 11 · PHP 8.3 · Filament 4 · Pest · Next.js 16 · React 19 · TypeScript · Zod · Tailwind v4

---

## File Map

**Create:**
- `database/migrations/2026_04_20_100000_create_contacts_table.php`
- `database/migrations/2026_04_20_100001_add_contact_id_to_optins_table.php`
- `app/Models/Contact.php`
- `app/Http/Controllers/Api/OptinController.php`
- `app/Filament/Resources/Contacts/ContactResource.php`
- `app/Filament/Resources/Contacts/ContactsTable.php`
- `tests/Feature/Api/OptinControllerTest.php`
- `next-app/src/lib/funnel-context.tsx`
- `next-app/src/hooks/useCheckoutUrl.ts`

**Modify:**
- `app/Models/Optin.php` — add `contact_id` to fillable + relationship
- `app/Jobs/SyncOptinToActiveCampaign.php` — store `ac_contact_id` on Contact after sync
- `app/Services/ActiveCampaignService.php` — return contact ID from `syncContactWithTags`
- `routes/api.php` — add `POST /api/optins`
- `next-app/src/app/[[...slug]]/page.tsx` — wrap with `FunnelProvider`
- `next-app/src/blocks/form-cta/OptinFormBlock/Component.tsx` — use funnelId from context, redirect on success
- `.env.example` — document `ACTIVE_CAMPAIGN_URL`, `ACTIVE_CAMPAIGN_KEY`, `ACTIVE_CAMPAIGN_OPTIN_TAG_ID`

---

## Task 1: Contact model + migration

**Files:**
- Create: `database/migrations/2026_04_20_100000_create_contacts_table.php`
- Create: `app/Models/Contact.php`

- [ ] **Step 1: Write the migration**

```php
<?php
// database/migrations/2026_04_20_100000_create_contacts_table.php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    public function up(): void
    {
        Schema::create('contacts', function (Blueprint $table) {
            $table->uuid('id')->primary();
            $table->string('email')->unique();
            $table->string('first_name');
            $table->string('last_name')->nullable();
            $table->string('ac_contact_id')->nullable();
            $table->timestamps();
        });
    }

    public function down(): void
    {
        Schema::dropIfExists('contacts');
    }
};
```

- [ ] **Step 2: Create the Contact model**

```php
<?php
// app/Models/Contact.php

namespace App\Models;

use App\Models\Concerns\HasUuid;
use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Relations\HasMany;

class Contact extends Model
{
    use HasFactory, HasUuid;

    protected $fillable = [
        'email',
        'first_name',
        'last_name',
        'ac_contact_id',
    ];

    public function optins(): HasMany
    {
        return $this->hasMany(Optin::class);
    }

    public function orders(): HasMany
    {
        return $this->hasMany(Order::class);
    }
}
```

- [ ] **Step 3: Run the migration**

```bash
php artisan migrate
```

Expected: `Migrating: 2026_04_20_100000_create_contacts_table` ... `Migrated`

- [ ] **Step 4: Commit**

```bash
git add database/migrations/2026_04_20_100000_create_contacts_table.php app/Models/Contact.php
git commit -m "feat(contacts): Contact model + contacts table"
```

---

## Task 2: Add contact_id to optins

**Files:**
- Create: `database/migrations/2026_04_20_100001_add_contact_id_to_optins_table.php`
- Modify: `app/Models/Optin.php`

- [ ] **Step 1: Write the migration**

```php
<?php
// database/migrations/2026_04_20_100001_add_contact_id_to_optins_table.php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    public function up(): void
    {
        Schema::table('optins', function (Blueprint $table) {
            $table->uuid('contact_id')->nullable()->after('id');
            $table->foreign('contact_id')->references('id')->on('contacts')->nullOnDelete();
        });
    }

    public function down(): void
    {
        Schema::table('optins', function (Blueprint $table) {
            $table->dropForeign(['contact_id']);
            $table->dropColumn('contact_id');
        });
    }
};
```

- [ ] **Step 2: Run the migration**

```bash
php artisan migrate
```

Expected: `Migrating: 2026_04_20_100001_add_contact_id_to_optins_table` ... `Migrated`

- [ ] **Step 3: Add contact_id to Optin model**

Open `app/Models/Optin.php`. Change the `$fillable` array to include `contact_id` and add the relationship:

```php
protected $fillable = [
    'contact_id', 'user_id', 'email', 'first_name', 'summit_id', 'funnel_id', 'funnel_step_id',
    'source_url', 'ip_address', 'user_agent',
    'utm_source', 'utm_medium', 'utm_campaign', 'utm_content', 'utm_term',
    'activecampaign_synced',
];
```

Add the relationship below the existing `user()` method:

```php
public function contact(): BelongsTo
{
    return $this->belongsTo(Contact::class);
}
```

- [ ] **Step 4: Commit**

```bash
git add database/migrations/2026_04_20_100001_add_contact_id_to_optins_table.php app/Models/Optin.php
git commit -m "feat(contacts): add contact_id FK to optins"
```

---

## Task 3: ActiveCampaign returns contact ID

The `SyncOptinToActiveCampaign` job needs to store `ac_contact_id` on the Contact after sync. For this, `ActiveCampaignService::syncContactWithTags` must return the AC contact ID.

**Files:**
- Modify: `app/Services/ActiveCampaignService.php`
- Modify: `app/Jobs/SyncOptinToActiveCampaign.php`

- [ ] **Step 1: Write the failing test**

```php
<?php
// tests/Feature/Api/OptinControllerTest.php — add this later; for now write a unit-style test

// tests/Unit/SyncOptinToActiveCampaignTest.php
use App\Jobs\SyncOptinToActiveCampaign;
use App\Models\Contact;
use App\Models\Optin;
use App\Services\ActiveCampaignService;

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
```

- [ ] **Step 2: Run test to see it fail**

```bash
./vendor/bin/pest tests/Unit/SyncOptinToActiveCampaignTest.php -v
```

Expected: FAIL — `syncContactWithTags` currently returns void, no `ac_contact_id` stored.

- [ ] **Step 3: Update ActiveCampaignService to return contact ID**

In `app/Services/ActiveCampaignService.php`, change the `syncContactWithTags` signature and body:

```php
public function syncContactWithTags(string $email, string $name, array $tagIds): string
{
    if (! $this->baseUrl || ! $this->apiKey) {
        Log::warning('ActiveCampaign not configured — skipping sync.');

        return '';
    }

    try {
        $contactId = $this->findOrCreateContact($email, $name);

        foreach ($tagIds as $tagId) {
            $this->addTag($contactId, $tagId);
        }

        Log::info('ActiveCampaign contact synced', ['email' => $email, 'tags' => $tagIds]);

        return (string) $contactId;
    } catch (\Throwable $e) {
        Log::error('ActiveCampaign sync failed', ['email' => $email, 'error' => $e->getMessage()]);

        return '';
    }
}
```

- [ ] **Step 4: Update SyncOptinToActiveCampaign to store the ID**

Replace the `handle` method in `app/Jobs/SyncOptinToActiveCampaign.php`:

```php
public function handle(ActiveCampaignService $ac): void
{
    $tagId = config('services.activecampaign.optin_tag_id');

    $acContactId = $ac->syncContactWithTags(
        $this->optin->email,
        $this->optin->first_name ?? $this->optin->email,
        $tagId ? [$tagId] : [],
    );

    $this->optin->update(['activecampaign_synced' => true]);

    if ($acContactId && $this->optin->contact_id) {
        Contact::where('id', $this->optin->contact_id)
            ->whereNull('ac_contact_id')
            ->update(['ac_contact_id' => $acContactId]);
    }
}
```

Add the import at the top of the file:

```php
use App\Models\Contact;
```

- [ ] **Step 5: Create Contact factory** (needed for test)

```bash
php artisan make:factory ContactFactory --model=Contact
```

In the generated `database/factories/ContactFactory.php`, update the `definition` method:

```php
public function definition(): array
{
    return [
        'email' => fake()->unique()->safeEmail(),
        'first_name' => fake()->firstName(),
        'last_name' => fake()->optional()->lastName(),
        'ac_contact_id' => null,
    ];
}
```

Also check that `Optin` has a factory. If `database/factories/OptinFactory.php` does not exist, create it:

```bash
php artisan make:factory OptinFactory --model=Optin
```

```php
// database/factories/OptinFactory.php
public function definition(): array
{
    return [
        'email' => fake()->safeEmail(),
        'first_name' => fake()->firstName(),
        'activecampaign_synced' => false,
    ];
}
```

- [ ] **Step 6: Run the test to see it pass**

```bash
./vendor/bin/pest tests/Unit/SyncOptinToActiveCampaignTest.php -v
```

Expected: PASS

- [ ] **Step 7: Commit**

```bash
git add app/Services/ActiveCampaignService.php app/Jobs/SyncOptinToActiveCampaign.php \
  database/factories/ContactFactory.php database/factories/OptinFactory.php \
  tests/Unit/SyncOptinToActiveCampaignTest.php
git commit -m "feat(contacts): AC sync stores ac_contact_id on Contact"
```

---

## Task 4: API OptinController

**Files:**
- Create: `app/Http/Controllers/Api/OptinController.php`
- Modify: `routes/api.php`
- Create: `tests/Feature/Api/OptinControllerTest.php`

- [ ] **Step 1: Write the failing test**

```php
<?php
// tests/Feature/Api/OptinControllerTest.php

use App\Models\Contact;
use App\Models\Funnel;
use App\Models\Optin;
use App\Models\Summit;
use Illuminate\Support\Facades\Queue;

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
    $summit = Summit::factory()->create(['slug' => 'aps25']);
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

it('rate limits at 5 requests per minute per ip', function () {
    $funnel = Funnel::factory()->for(Summit::factory())->create();

    for ($i = 0; $i < 5; $i++) {
        $this->postJson('/api/optins', [
            'first_name' => 'Test',
            'email' => "test{$i}@example.com",
            'funnel_id' => $funnel->id,
        ])->assertOk();
    }

    $this->postJson('/api/optins', [
        'first_name' => 'Test',
        'email' => 'test6@example.com',
        'funnel_id' => $funnel->id,
    ])->assertStatus(429);
});
```

- [ ] **Step 2: Run tests to see them fail**

```bash
./vendor/bin/pest tests/Feature/Api/OptinControllerTest.php -v
```

Expected: FAIL — route does not exist yet.

- [ ] **Step 3: Create the API OptinController**

```php
<?php
// app/Http/Controllers/Api/OptinController.php

namespace App\Http\Controllers\Api;

use App\Http\Controllers\Controller;
use App\Jobs\SyncOptinToActiveCampaign;
use App\Models\Contact;
use App\Models\Funnel;
use App\Models\Optin;
use Illuminate\Http\JsonResponse;
use Illuminate\Http\Request;

class OptinController extends Controller
{
    public function store(Request $request): JsonResponse
    {
        $data = $request->validate([
            'first_name' => ['required', 'string', 'max:100'],
            'email' => ['required', 'email', 'max:255'],
            'funnel_id' => ['required', 'uuid', 'exists:funnels,id'],
        ]);

        $funnel = Funnel::with('summit')->findOrFail($data['funnel_id']);

        $contact = Contact::updateOrCreate(
            ['email' => $data['email']],
            ['first_name' => $data['first_name']],
        );

        $optin = Optin::create([
            'contact_id' => $contact->id,
            'email' => $data['email'],
            'first_name' => $data['first_name'],
            'funnel_id' => $funnel->id,
            'summit_id' => $funnel->summit->id,
            'ip_address' => $request->ip(),
            'source_url' => $request->header('Referer'),
            'user_agent' => $request->userAgent(),
            'utm_source' => $request->input('utm_source'),
            'utm_medium' => $request->input('utm_medium'),
            'utm_campaign' => $request->input('utm_campaign'),
            'utm_content' => $request->input('utm_content'),
            'utm_term' => $request->input('utm_term'),
        ]);

        SyncOptinToActiveCampaign::dispatch($optin);

        $redirect = sprintf(
            '/%s/%s/sales?email=%s&first_name=%s',
            $funnel->summit->slug,
            $funnel->slug,
            urlencode($data['email']),
            urlencode($data['first_name']),
        );

        return response()->json(['redirect' => $redirect]);
    }
}
```

- [ ] **Step 4: Register the route**

Open `routes/api.php` and add after the existing routes:

```php
Route::post('/optins', \App\Http\Controllers\Api\OptinController::class . '@store')
    ->middleware('throttle:5,1');
```

- [ ] **Step 5: Check that Funnel and Summit factories exist**

```bash
ls database/factories/ | grep -E "Funnel|Summit"
```

If `FunnelFactory.php` or `SummitFactory.php` are missing, the test will fail. Check and add minimal factories for any that are missing. Funnel factory needs at minimum:

```php
public function definition(): array
{
    return [
        'slug' => fake()->slug(2),
        'name' => fake()->words(3, true),
        'is_active' => true,
    ];
}
```

Summit factory needs at minimum:

```php
public function definition(): array
{
    return [
        'slug' => fake()->slug(2),
        'title' => fake()->sentence(3),
        'status' => 'pre_summit',
        'current_phase' => 'pre_summit',
        'timezone' => 'UTC',
        'audience' => 'general',
        'summit_type' => 'free',
    ];
}
```

- [ ] **Step 6: Run tests to see them pass**

```bash
./vendor/bin/pest tests/Feature/Api/OptinControllerTest.php -v
```

Expected: all 4 tests PASS. If rate-limit test flakes, it may need `RefreshDatabase` + throttle config disabled in test env.

- [ ] **Step 7: Commit**

```bash
git add app/Http/Controllers/Api/OptinController.php routes/api.php \
  tests/Feature/Api/OptinControllerTest.php
git commit -m "feat(api): POST /api/optins — creates Contact + Optin, dispatches AC sync"
```

---

## Task 4b: Add contact_id to orders (Phase 2 prep)

**Files:**
- Create: `database/migrations/2026_04_20_100002_add_contact_id_to_orders_table.php`
- Modify: `app/Models/Order.php`

- [ ] **Step 1: Create the migration**

```php
<?php
// database/migrations/2026_04_20_100002_add_contact_id_to_orders_table.php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    public function up(): void
    {
        Schema::table('orders', function (Blueprint $table) {
            $table->uuid('contact_id')->nullable()->after('id');
            $table->foreign('contact_id')->references('id')->on('contacts')->nullOnDelete();
        });
    }

    public function down(): void
    {
        Schema::table('orders', function (Blueprint $table) {
            $table->dropForeign(['contact_id']);
            $table->dropColumn('contact_id');
        });
    }
};
```

- [ ] **Step 2: Add contact_id to Order model**

Open `app/Models/Order.php`. Add `'contact_id'` to the `$fillable` array (it will be nullable/unused until Phase 2). Add the relationship:

```php
public function contact(): \Illuminate\Database\Eloquent\Relations\BelongsTo
{
    return $this->belongsTo(\App\Models\Contact::class);
}
```

- [ ] **Step 3: Run migration**

```bash
php artisan migrate
```

Expected: `Migrating: 2026_04_20_100002_add_contact_id_to_orders_table` ... `Migrated`

- [ ] **Step 4: Commit**

```bash
git add database/migrations/2026_04_20_100002_add_contact_id_to_orders_table.php app/Models/Order.php
git commit -m "feat(contacts): add nullable contact_id FK to orders (Phase 2 prep)"
```

---

## Task 5: Filament ContactResource (read-only)

**Files:**
- Create: `app/Filament/Resources/Contacts/ContactResource.php`
- Create: `app/Filament/Resources/Contacts/ContactsTable.php`

- [ ] **Step 1: Create ContactsTable**

```php
<?php
// app/Filament/Resources/Contacts/ContactsTable.php

namespace App\Filament\Resources\Contacts;

use Filament\Tables\Columns\TextColumn;
use Filament\Tables\Filters\Filter;
use Filament\Tables\Table;
use Illuminate\Database\Eloquent\Builder;

class ContactsTable
{
    public static function configure(Table $table): Table
    {
        return $table
            ->columns([
                TextColumn::make('email')
                    ->searchable()
                    ->sortable(),
                TextColumn::make('first_name')
                    ->searchable()
                    ->sortable(),
                TextColumn::make('optins_count')
                    ->counts('optins')
                    ->label('Optins')
                    ->sortable(),
                TextColumn::make('ac_contact_id')
                    ->label('AC ID')
                    ->placeholder('—'),
                TextColumn::make('created_at')
                    ->dateTime()
                    ->sortable()
                    ->since(),
            ])
            ->defaultSort('created_at', 'desc')
            ->filters([
                Filter::make('synced_to_ac')
                    ->label('Synced to AC')
                    ->query(fn (Builder $query) => $query->whereNotNull('ac_contact_id')),
            ]);
    }
}
```

- [ ] **Step 2: Create ContactResource**

```php
<?php
// app/Filament/Resources/Contacts/ContactResource.php

namespace App\Filament\Resources\Contacts;

use App\Filament\Resources\Contacts\ContactsTable;
use App\Models\Contact;
use Filament\Resources\Resource;
use Filament\Tables\Table;
use Filament\Support\Icons\Heroicon;

class ContactResource extends Resource
{
    protected static ?string $model = Contact::class;

    protected static string|Heroicon|null $navigationIcon = Heroicon::OutlinedUsers;

    protected static ?string $navigationGroup = 'CRM';

    protected static ?int $navigationSort = 0;

    protected static ?string $recordTitleAttribute = 'email';

    public static function table(Table $table): Table
    {
        return ContactsTable::configure($table);
    }

    public static function getPages(): array
    {
        return [
            'index' => \Filament\Resources\Pages\ListRecords::route('/'),
        ];
    }

    public static function canCreate(): bool
    {
        return false;
    }
}
```

- [ ] **Step 3: Verify it loads in the browser**

```bash
composer dev
```

Navigate to `/admin/contacts`. Confirm the table renders without errors.

- [ ] **Step 4: Commit**

```bash
git add app/Filament/Resources/Contacts/
git commit -m "feat(filament): read-only ContactResource under CRM group"
```

---

## Task 6: FunnelContext in Next.js

The OptinFormBlock needs `funnel.id` at runtime. The page already has the funnel data from `resolveFunnel()`. We add a React context to expose it to client components without touching the block schema.

**Files:**
- Create: `next-app/src/lib/funnel-context.tsx`
- Modify: `next-app/src/app/[[...slug]]/page.tsx`

- [ ] **Step 1: Create FunnelContext**

```tsx
// next-app/src/lib/funnel-context.tsx
'use client'
import { createContext, useContext } from 'react'

interface FunnelContextValue {
  funnelId: string
  funnelSlug: string
  summitSlug: string
}

const FunnelContext = createContext<FunnelContextValue | null>(null)

export function FunnelProvider({
  children,
  value,
}: {
  children: React.ReactNode
  value: FunnelContextValue
}) {
  return <FunnelContext.Provider value={value}>{children}</FunnelContext.Provider>
}

export function useFunnel(): FunnelContextValue {
  const ctx = useContext(FunnelContext)
  if (!ctx) throw new Error('useFunnel must be used inside FunnelProvider')
  return ctx
}
```

- [ ] **Step 2: Wrap the page with FunnelProvider**

Open `next-app/src/app/[[...slug]]/page.tsx`. Add the import and wrap the `<main>` element:

```tsx
import { FunnelProvider } from '@/lib/funnel-context'
```

Change the return value to:

```tsx
return (
  <ThemeProvider theme={data.theme}>
    <SpeakersProvider speakers={data.speakers}>
      <FunnelProvider
        value={{
          funnelId: data.funnel.id,
          funnelSlug: data.funnel.slug,
          summitSlug: summitSlug,
        }}
      >
        <main>
          <RenderBlocks blocks={data.blocks} />
        </main>
      </FunnelProvider>
    </SpeakersProvider>
  </ThemeProvider>
)
```

- [ ] **Step 3: Run typecheck to confirm no errors**

```bash
cd next-app && pnpm typecheck
```

Expected: 0 errors.

- [ ] **Step 4: Commit**

```bash
git add next-app/src/lib/funnel-context.tsx next-app/src/app/\[\[...slug\]\]/page.tsx
git commit -m "feat(next): FunnelProvider context exposes funnel.id to client blocks"
```

---

## Task 7: Update OptinFormBlock

**Files:**
- Modify: `next-app/src/blocks/form-cta/OptinFormBlock/Component.tsx`

- [ ] **Step 1: Update the component**

Replace the full contents of `next-app/src/blocks/form-cta/OptinFormBlock/Component.tsx`:

```tsx
'use client'
import { useState, type FormEvent } from 'react'
import { useRouter } from 'next/navigation'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { cn } from '@/lib/cn'
import { useFunnel } from '@/lib/funnel-context'
import type { Props } from './schema'

const API_BASE = process.env.NEXT_PUBLIC_LARAVEL_API_URL || 'http://localhost:8000'

export function OptinFormBlock(props: Props) {
  const router = useRouter()
  const { funnelId } = useFunnel()
  const [state, setState] = useState({ name: '', email: '' })
  const [submitting, setSubmitting] = useState(false)
  const [error, setError] = useState<string | null>(null)

  async function submit(e: FormEvent) {
    e.preventDefault()
    setSubmitting(true)
    setError(null)

    // Collect UTM params from current URL
    const params = new URLSearchParams(window.location.search)
    const utmFields: Record<string, string> = {}
    for (const key of ['utm_source', 'utm_medium', 'utm_campaign', 'utm_content', 'utm_term']) {
      const val = params.get(key)
      if (val) utmFields[key] = val
    }

    try {
      const res = await fetch(`${API_BASE}/api/optins`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json', Accept: 'application/json' },
        body: JSON.stringify({
          first_name: state.name,
          email: state.email,
          funnel_id: funnelId,
          ...utmFields,
        }),
      })

      if (!res.ok) {
        const body = await res.json().catch(() => ({}))
        const message = body?.message || `Request failed (${res.status})`
        throw new Error(message)
      }

      const { redirect } = await res.json()
      router.push(redirect)
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Something went wrong. Please try again.')
      setSubmitting(false)
    }
  }

  const bg = {
    light: 'bg-gray-50 text-gray-900',
    dark: 'bg-gray-900 text-white',
    primary: 'bg-[rgb(var(--color-primary))] text-white',
  }[props.backgroundStyle]

  const onDark = props.backgroundStyle !== 'light'

  return (
    <section className={cn('py-20', bg)}>
      <div className="mx-auto max-w-[520px] px-6">
        {props.headline && (
          <h2 className="text-center text-3xl font-bold md:text-4xl">{props.headline}</h2>
        )}
        {props.subheadline && (
          <p className={cn('mt-4 text-center', onDark ? 'text-white/90' : 'text-gray-600')}>
            {props.subheadline}
          </p>
        )}
        <form onSubmit={submit} className="mt-8 space-y-4">
          {props.fields.name && (
            <div>
              <Label htmlFor="optin-name" className={onDark ? 'text-white' : ''}>
                Name
              </Label>
              <Input
                id="optin-name"
                required
                value={state.name}
                onChange={(e) => setState({ ...state, name: e.target.value })}
                className={onDark ? 'bg-white/10 text-white placeholder:text-white/50 border-white/30' : ''}
                placeholder="Your name"
              />
            </div>
          )}
          {props.fields.email && (
            <div>
              <Label htmlFor="optin-email" className={onDark ? 'text-white' : ''}>
                Email
              </Label>
              <Input
                id="optin-email"
                type="email"
                required
                value={state.email}
                onChange={(e) => setState({ ...state, email: e.target.value })}
                className={onDark ? 'bg-white/10 text-white placeholder:text-white/50 border-white/30' : ''}
                placeholder="you@example.com"
              />
            </div>
          )}
          <Button
            type="submit"
            size="lg"
            disabled={submitting}
            className="w-full bg-[rgb(var(--color-accent))] text-white hover:bg-[rgb(var(--color-accent))]/90"
          >
            {submitting ? 'Submitting…' : props.submitLabel}
          </Button>
          {props.secondaryText && (
            <p className={cn('text-center text-sm', onDark ? 'text-white/80' : 'text-gray-600')}>
              {props.secondaryText}
            </p>
          )}
          {error && (
            <p className="text-center text-sm text-red-300" role="alert">
              {error}
            </p>
          )}
          {props.privacyText && (
            <p className={cn('text-center text-xs', onDark ? 'text-white/60' : 'text-gray-500')}>
              {props.privacyText}
            </p>
          )}
        </form>
      </div>
    </section>
  )
}
```

- [ ] **Step 2: Run typecheck**

```bash
cd next-app && pnpm typecheck
```

Expected: 0 errors.

- [ ] **Step 3: Commit**

```bash
git add next-app/src/blocks/form-cta/OptinFormBlock/Component.tsx
git commit -m "feat(optin-form): post to /api/optins with funnelId + UTMs, redirect on success"
```

---

## Task 8: useCheckoutUrl hook for sales page

**Files:**
- Create: `next-app/src/hooks/useCheckoutUrl.ts`

- [ ] **Step 1: Create the hook**

```ts
// next-app/src/hooks/useCheckoutUrl.ts
'use client'
import { useSearchParams } from 'next/navigation'

const BASE_URL = process.env.NEXT_PUBLIC_FUNNELKIT_CHECKOUT_URL || ''

export function useCheckoutUrl(): string {
  const params = useSearchParams()
  const email = params.get('email') ?? ''
  const firstName = params.get('first_name') ?? ''

  if (!BASE_URL) return '#'

  const url = new URL(BASE_URL)
  if (email) url.searchParams.set('billing_email', email)
  if (firstName) url.searchParams.set('billing_first_name', firstName)

  return url.toString()
}
```

- [ ] **Step 2: Run typecheck**

```bash
cd next-app && pnpm typecheck
```

Expected: 0 errors.

- [ ] **Step 3: Add env var to next-app/.env.example**

Open `next-app/.env.example` (or `.env.local.example` — wherever Next.js env vars are documented). Add:

```
NEXT_PUBLIC_FUNNELKIT_CHECKOUT_URL=https://althea-academy.com/checkout/vip-pass
```

- [ ] **Step 4: Apply hook to the sales page CTA block**

Find which block renders the "Buy Now" button on the sales page. Run:

```bash
grep -r "Buy Now\|Get Access\|btn.*checkout\|checkout.*btn" next-app/src/blocks --include="*.tsx" -l
```

For each block that renders a checkout CTA, import and use the hook. Example pattern:

```tsx
// At top of the Component.tsx file
import { useCheckoutUrl } from '@/hooks/useCheckoutUrl'

// Inside the component
const checkoutUrl = useCheckoutUrl()

// On the button/link
<a href={checkoutUrl}>Buy Now</a>
```

If the block is a server component, convert it to `'use client'` first.

- [ ] **Step 5: Run typecheck again after applying hook**

```bash
cd next-app && pnpm typecheck
```

Expected: 0 errors.

- [ ] **Step 6: Commit**

```bash
git add next-app/src/hooks/useCheckoutUrl.ts next-app/ 
git commit -m "feat(sales): useCheckoutUrl hook pre-fills FunnelKit checkout with email+name"
```

---

## Task 9: Environment variables

**Files:**
- Modify: `.env.example`
- Modify: `next-app/.env.example` (or equivalent)

- [ ] **Step 1: Document Laravel env vars in .env.example**

Open `.env.example`. Find the `ACTIVE_CAMPAIGN` section. Ensure these vars are present:

```env
ACTIVE_CAMPAIGN_URL=https://youraccountname.api-us1.com
ACTIVE_CAMPAIGN_KEY=your_api_key_here
ACTIVE_CAMPAIGN_OPTIN_TAG_ID=123
```

Check `config/services.php` to confirm the config keys match:

```bash
grep -A5 'activecampaign' config/services.php
```

The config should map:
- `services.activecampaign.url` → `ACTIVE_CAMPAIGN_URL`
- `services.activecampaign.key` → `ACTIVE_CAMPAIGN_KEY`
- `services.activecampaign.optin_tag_id` → `ACTIVE_CAMPAIGN_OPTIN_TAG_ID`

If the config keys or env var names don't match, update `config/services.php` to use these names.

- [ ] **Step 2: Add CORS origin for parenting-summits.com**

In `.env` (and note in `.env.example`):

```env
CORS_ALLOWED_ORIGINS=https://parenting-summits.com,https://www.parenting-summits.com
```

- [ ] **Step 3: Commit**

```bash
git add .env.example
git commit -m "docs(env): document AC + CORS env vars for optin flow"
```

---

## Task 10: Funnel setup for parenting-summits.com

This task creates the domain, funnel, and two funnel steps in the database so the Next.js app can resolve and render the pages.

- [ ] **Step 1: Start the dev environment**

```bash
composer dev
```

Wait until `INFO  Server running on [http://127.0.0.1:8000]` appears.

- [ ] **Step 2: Create the domain in Filament**

Navigate to `http://localhost:8000/admin/domains` → **New Domain**.

- **Host:** `parenting-summits.com`
- Leave other fields as defaults.

Save. Note the Domain ID from the URL.

- [ ] **Step 3: Create the summit in Filament (if it doesn't exist)**

Navigate to `/admin/summits` → **New Summit**.

- **Slug:** `aps25` (or whichever slug the APS parenting summit uses)
- **Title:** Althea Parenting Summit 2025
- **Status / Phase:** pre_summit

Save.

- [ ] **Step 4: Create the funnel in Filament**

Navigate to `/admin/funnels` → **New Funnel**.

- **Summit:** select the summit from step 3
- **Slug:** `main`
- **Name:** APS25 Main Funnel
- **Is Active:** true

Save.

- [ ] **Step 5: Create funnel steps in Filament**

Navigate to the funnel's Steps relation manager → **New Step**.

Step 1:
- **Slug:** `optin`
- **Type:** optin
- **Sort order:** 1

Step 2:
- **Slug:** `sales`
- **Type:** sales
- **Sort order:** 2

- [ ] **Step 6: Link the domain to the funnel**

In the Domain record created in step 2, set the **Funnel** to the funnel created in step 4.

- [ ] **Step 7: Verify the route resolves**

```bash
curl "http://localhost:8000/api/funnels/resolve?summit_slug=aps25&funnel_slug=main&step_slug=optin"
```

Expected: 200 JSON with `funnel.slug: "main"`, `step.slug: "optin"`.

- [ ] **Step 8: Commit note**

The domain/funnel data lives in the database (not in git). No commit needed — but note the IDs in a comment or Filament note for the team.

---

## Task 11: End-to-end smoke test

- [ ] **Step 1: Run the full PHP test suite**

```bash
./vendor/bin/pest --parallel
```

Expected: all tests pass. Fix any failures before proceeding.

- [ ] **Step 2: Run Next.js typecheck + lint**

```bash
cd next-app && pnpm typecheck && pnpm lint
```

Expected: 0 errors, 0 warnings.

- [ ] **Step 3: Start dev environment and test the optin flow manually**

```bash
composer dev   # Laravel terminal
cd next-app && pnpm dev  # Next.js terminal
```

Navigate to `http://localhost:3000/aps25/main/optin`.

1. Fill in name + email → submit
2. Confirm redirect to `/aps25/main/sales?email=...&first_name=...`
3. Check `http://localhost:8000/admin/contacts` — new contact record visible
4. Check `http://localhost:8000/admin/optins` — new optin linked to contact

- [ ] **Step 4: Verify sales page Buy Now URL**

On the sales page, inspect the Buy Now link `href`. It should contain:
- `billing_email=<encoded-email>`
- `billing_first_name=<encoded-name>`

- [ ] **Step 5: Final commit if any cleanup was needed**

```bash
git add -p
git commit -m "chore: post-smoke-test cleanup"
```
