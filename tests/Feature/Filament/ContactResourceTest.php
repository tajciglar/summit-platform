<?php

use App\Filament\Resources\Contacts\Pages\ListContacts;
use App\Models\Contact;
use App\Models\Domain;
use App\Models\Optin;
use App\Models\Order;
use App\Models\Summit;
use App\Models\User;
use Filament\Facades\Filament;
use Illuminate\Support\Facades\Gate;

use function Pest\Livewire\livewire;

beforeEach(function () {
    Gate::before(fn () => true);
    $this->actingAs(User::factory()->admin()->create());

    $this->domain = Domain::create([
        'name' => 'Test Domain',
        'hostname' => 'contacts-test.localhost',
        'slug' => 'contacts-test',
        'is_active' => true,
    ]);
    Filament::setTenant($this->domain);

    $this->summitA = Summit::factory()->create(['title' => 'Summit Alpha', 'domain_id' => $this->domain->id]);
    $this->summitB = Summit::factory()->create(['title' => 'Summit Beta', 'domain_id' => $this->domain->id]);
});

it('defaults to latest-first sort by created_at', function () {
    $older = Contact::factory()->create(['created_at' => now()->subDays(10)]);
    $newer = Contact::factory()->create(['created_at' => now()->subDay()]);

    livewire(ListContacts::class)
        ->assertCanSeeTableRecords([$newer, $older], inOrder: true);
});

it('summit filter narrows the table to contacts attached to that summit', function () {
    $alphaContact = Contact::factory()->create();
    $betaContact = Contact::factory()->create();

    Optin::factory()->create([
        'contact_id' => $alphaContact->id,
        'summit_id' => $this->summitA->id,
        'email' => $alphaContact->email,
    ]);
    Optin::factory()->create([
        'contact_id' => $betaContact->id,
        'summit_id' => $this->summitB->id,
        'email' => $betaContact->email,
    ]);

    livewire(ListContacts::class)
        ->filterTable('summits', $this->summitA->id)
        ->assertCanSeeTableRecords([$alphaContact])
        ->assertCanNotSeeTableRecords([$betaContact]);
});

it('date range filter narrows by contacts.created_at', function () {
    $inside = Contact::factory()->create(['created_at' => '2026-02-15 10:00:00']);
    $outside = Contact::factory()->create(['created_at' => '2026-04-01 10:00:00']);

    livewire(ListContacts::class)
        ->filterTable('created_at', [
            'from' => '2026-01-01',
            'to' => '2026-03-02',
        ])
        ->assertCanSeeTableRecords([$inside])
        ->assertCanNotSeeTableRecords([$outside]);
});

it('buyer filter narrows to contacts with paid orders', function () {
    $buyer = Contact::factory()->create();
    $nonBuyer = Contact::factory()->create();

    $orderUser = User::factory()->create();
    Order::create([
        'contact_id' => $buyer->id,
        'user_id' => $orderUser->id,
        'order_number' => 'ORD-1',
        'status' => 'completed',
        'total_cents' => 9900,
        'subtotal_cents' => 9900,
        'discount_cents' => 0,
        'currency' => 'USD',
    ]);

    livewire(ListContacts::class)
        ->filterTable('is_buyer', true)
        ->assertCanSeeTableRecords([$buyer])
        ->assertCanNotSeeTableRecords([$nonBuyer]);
});

it('CSV export streams a file with expected headers and seeded contact', function () {
    $contact = Contact::factory()->create([
        'email' => 'export@example.test',
        'first_name' => 'Export',
        'last_name' => 'Tester',
        'country' => 'US',
    ]);

    $page = livewire(ListContacts::class)->instance();

    $response = $page->streamCsv();

    ob_start();
    $response->sendContent();
    $body = ob_get_clean();

    expect($body)->toContain('email,first_name,last_name,country');
    expect($body)->toContain('export@example.test');
    expect($body)->toContain('Export');
    expect($response->headers->get('Content-Type'))->toContain('text/csv');
});
