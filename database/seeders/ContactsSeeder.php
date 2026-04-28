<?php

namespace Database\Seeders;

use App\Models\Contact;
use App\Models\Optin;
use App\Models\Order;
use App\Models\Summit;
use App\Models\User;
use Illuminate\Database\Seeder;
use Illuminate\Support\Carbon;
use Illuminate\Support\Str;

/**
 * Seeds a realistic mix of contacts to exercise the CRM list:
 * - varied countries
 * - spread across the last 90 days for date-range filtering
 * - attached to summits via optins
 * - ~40% buyers (one or more paid orders), the rest non-buyers
 * - some synced to AC, some not
 */
class ContactsSeeder extends Seeder
{
    public function run(): void
    {
        $summits = Summit::query()->limit(3)->get();
        if ($summits->isEmpty()) {
            $this->command?->warn('ContactsSeeder: no summits found — run summit seeders first.');

            return;
        }

        $countries = ['US', 'GB', 'CA', 'AU', 'DE', 'FR', 'NL', 'BR', 'MX', 'IT', 'ES', 'JP'];
        $now = Carbon::now();

        // Orders require a user_id; reuse one seed user as the buyer "owner".
        $buyer = User::query()->first() ?? User::factory()->create([
            'name' => 'Seed Buyer',
            'email' => 'seed-buyer@example.com',
        ]);

        for ($i = 0; $i < 80; $i++) {
            $createdAt = $now->copy()->subDays(random_int(0, 90))->subHours(random_int(0, 23));
            $summit = $summits->random();
            $funnel = $summit->funnels()->inRandomOrder()->first();

            $contact = Contact::factory()->create([
                'country' => $countries[array_rand($countries)],
                'ac_contact_id' => fake()->boolean(50) ? (string) fake()->numberBetween(1000, 99999) : null,
                'created_at' => $createdAt,
                'updated_at' => $createdAt,
            ]);

            // Every contact opted in to the chosen summit at least once.
            Optin::create([
                'id' => (string) Str::uuid(),
                'contact_id' => $contact->id,
                'email' => $contact->email,
                'first_name' => $contact->first_name,
                'summit_id' => $summit->id,
                'funnel_id' => $funnel?->id,
                'created_at' => $createdAt,
                'ac_sync_status' => $contact->ac_contact_id ? 'synced' : 'pending',
            ]);

            // ~40% become buyers with 1–2 paid orders.
            if (fake()->boolean(40)) {
                $orderCount = random_int(1, 2);
                for ($n = 0; $n < $orderCount; $n++) {
                    $totalCents = fake()->randomElement([2900, 4900, 7900, 9900, 14900, 19900]);
                    $orderDate = $createdAt->copy()->addDays(random_int(0, 5));

                    Order::create([
                        'id' => (string) Str::uuid(),
                        'contact_id' => $contact->id,
                        'user_id' => $buyer->id,
                        'order_number' => 'SEED-'.strtoupper(Str::random(8)),
                        'summit_id' => $summit->id,
                        'funnel_id' => $funnel?->id,
                        'status' => fake()->randomElement(['completed', 'completed', 'completed', 'partial_refund']),
                        'subtotal_cents' => $totalCents,
                        'discount_cents' => 0,
                        'total_cents' => $totalCents,
                        'currency' => 'USD',
                        'completed_at' => $orderDate,
                        'created_at' => $orderDate,
                        'updated_at' => $orderDate,
                    ]);
                }
            }
        }

        $this->command?->info('ContactsSeeder: 80 contacts seeded across '.$summits->count().' summit(s).');
    }
}
