<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\DB;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    public function up(): void
    {
        DB::statement("DROP TYPE IF EXISTS user_role CASCADE");
        DB::statement("CREATE TYPE user_role AS ENUM ('admin', 'buyer')");

        DB::statement("
            CREATE TABLE users (
                id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
                email VARCHAR(255) NOT NULL UNIQUE,
                email_verified_at TIMESTAMPTZ,
                password VARCHAR(255) NOT NULL,
                first_name VARCHAR(255),
                last_name VARCHAR(255),
                role user_role NOT NULL DEFAULT 'buyer',
                stripe_customer_id VARCHAR(255),
                activecampaign_id VARCHAR(255),
                phone VARCHAR(50),
                country CHAR(2),
                is_active BOOLEAN NOT NULL DEFAULT true,
                last_login_at TIMESTAMPTZ,
                remember_token VARCHAR(100),
                created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
                updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
            )
        ");

        DB::statement('CREATE INDEX users_role_idx ON users(role)');
        DB::statement('CREATE INDEX users_stripe_customer_id_idx ON users(stripe_customer_id)');

        Schema::create('password_reset_tokens', function (Blueprint $table) {
            $table->string('email')->primary();
            $table->string('token');
            $table->timestamp('created_at')->nullable();
        });

        Schema::create('sessions', function (Blueprint $table) {
            $table->string('id')->primary();
            $table->foreignUuid('user_id')->nullable()->index();
            $table->string('ip_address', 45)->nullable();
            $table->text('user_agent')->nullable();
            $table->longText('payload');
            $table->integer('last_activity')->index();
        });
    }

    public function down(): void
    {
        Schema::dropIfExists('sessions');
        Schema::dropIfExists('password_reset_tokens');
        DB::statement('DROP TABLE IF EXISTS users');
        DB::statement('DROP TYPE IF EXISTS user_role CASCADE');
    }
};
