<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Support\Facades\DB;

// Adds the FK constraint now that the contacts table exists.
return new class extends Migration
{
    public function up(): void
    {
        DB::statement('ALTER TABLE optins ADD CONSTRAINT optins_contact_id_fkey FOREIGN KEY (contact_id) REFERENCES contacts(id) ON DELETE SET NULL');
        DB::statement('CREATE INDEX optins_contact_id_idx ON optins(contact_id)');
    }

    public function down(): void
    {
        DB::statement('ALTER TABLE optins DROP CONSTRAINT IF EXISTS optins_contact_id_fkey');
        DB::statement('DROP INDEX IF EXISTS optins_contact_id_idx');
    }
};
