<?php

use Illuminate\Database\Migrations\Migration;
use Spatie\Permission\Models\Permission;

return new class extends Migration
{
    public function up(): void
    {
        foreach ([
            'media_library.view',
            'media_library.upload',
            'media_library.delete',
            'media_library.delete_in_use',
            'media_library.manage_globals',
        ] as $name) {
            Permission::findOrCreate($name, 'web');
        }
    }

    public function down(): void
    {
        Permission::whereIn('name', [
            'media_library.view',
            'media_library.upload',
            'media_library.delete',
            'media_library.delete_in_use',
            'media_library.manage_globals',
        ])->delete();
    }
};
