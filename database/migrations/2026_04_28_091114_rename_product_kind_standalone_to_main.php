<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Support\Facades\DB;

return new class extends Migration
{
    public function up(): void
    {
        DB::statement("ALTER TYPE product_kind RENAME VALUE 'standalone' TO 'main'");
        DB::statement("ALTER TABLE products ALTER COLUMN kind SET DEFAULT 'main'");
    }

    public function down(): void
    {
        DB::statement("ALTER TABLE products ALTER COLUMN kind SET DEFAULT 'standalone'");
        DB::statement("ALTER TYPE product_kind RENAME VALUE 'main' TO 'standalone'");
    }
};
