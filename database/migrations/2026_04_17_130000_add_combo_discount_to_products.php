<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Support\Facades\DB;

/**
 * Combos don't own Stripe prices — children do. A combo purchase becomes N
 * Stripe line items (one per child). The combo may offer an order-level
 * discount taken off the sum of children's current-phase prices.
 */
return new class extends Migration
{
    public function up(): void
    {
        DB::statement('
            ALTER TABLE products
                ADD COLUMN combo_discount_cents INTEGER
        ');
    }

    public function down(): void
    {
        DB::statement('ALTER TABLE products DROP COLUMN IF EXISTS combo_discount_cents');
    }
};
