<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Support\Facades\DB;

/**
 * Introduces Domain as the Filament tenant. A domain is a public-facing brand
 * (parenting-summits.com, vzgoja.si, althea-academy.com). Each domain hosts
 * many summits; each summit may live on multiple domains.
 *
 * Replaces summit_user (direct admin↔summit membership) with domain_user —
 * admins now have access to a domain, which transitively grants them access
 * to every summit on that domain.
 */
return new class extends Migration
{
    public function up(): void
    {
        DB::statement("
            CREATE TABLE domains (
                id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
                name VARCHAR(255) NOT NULL,
                hostname VARCHAR(255) NOT NULL UNIQUE,
                slug VARCHAR(255) NOT NULL UNIQUE,
                brand_color VARCHAR(20),
                is_active BOOLEAN NOT NULL DEFAULT true,
                created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
                updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
            )
        ");

        DB::statement('CREATE INDEX domains_is_active_idx ON domains(is_active)');

        // M2M between domains and summits (a summit can be hosted on multiple
        // brands; a brand hosts multiple summits).
        DB::statement("
            CREATE TABLE domain_summit (
                domain_id UUID NOT NULL REFERENCES domains(id) ON DELETE CASCADE,
                summit_id UUID NOT NULL REFERENCES summits(id) ON DELETE CASCADE,
                created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
                PRIMARY KEY (domain_id, summit_id)
            )
        ");

        DB::statement('CREATE INDEX domain_summit_summit_id_idx ON domain_summit(summit_id)');

        // Replaces summit_user as the tenancy membership table.
        DB::statement("
            CREATE TABLE domain_user (
                user_id UUID NOT NULL REFERENCES users(id) ON DELETE CASCADE,
                domain_id UUID NOT NULL REFERENCES domains(id) ON DELETE CASCADE,
                created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
                PRIMARY KEY (user_id, domain_id)
            )
        ");

        DB::statement('CREATE INDEX domain_user_domain_id_idx ON domain_user(domain_id)');

        // The old summit_user table is no longer the tenancy source, but keep
        // it around in case anything else relies on it — can drop later.
    }

    public function down(): void
    {
        DB::statement('DROP TABLE IF EXISTS domain_user');
        DB::statement('DROP TABLE IF EXISTS domain_summit');
        DB::statement('DROP TABLE IF EXISTS domains');
    }
};
