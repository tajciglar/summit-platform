<?php

namespace Database\Seeders;

use Illuminate\Database\Seeder;
use Spatie\Permission\Models\Permission;
use Spatie\Permission\Models\Role;

class RoleAndPermissionSeeder extends Seeder
{
    public function run(): void
    {
        // Reset cached roles and permissions
        app()[\Spatie\Permission\PermissionRegistrar::class]->forgetCachedPermissions();

        // Permissions
        $permissions = [
            // Domains
            'view_domains', 'create_domains', 'edit_domains', 'delete_domains',
            // Funnels
            'view_funnels', 'create_funnels', 'edit_funnels', 'delete_funnels',
            // Funnel Steps
            'view_funnel_steps', 'create_funnel_steps', 'edit_funnel_steps', 'delete_funnel_steps',
            // Products
            'view_products', 'create_products', 'edit_products', 'delete_products',
            // Speakers
            'view_speakers', 'create_speakers', 'edit_speakers', 'delete_speakers',
            // Orders
            'view_orders',
        ];

        foreach ($permissions as $permission) {
            Permission::findOrCreate($permission);
        }

        // Operator — full access to everything
        Role::findOrCreate('operator')->syncPermissions($permissions);

        // Editor — can view and edit content, but cannot manage domains, products, or delete anything
        Role::findOrCreate('editor')->syncPermissions([
            'view_funnels', 'edit_funnels',
            'view_funnel_steps', 'edit_funnel_steps',
            'view_speakers', 'create_speakers', 'edit_speakers',
            'view_orders',
        ]);
    }
}
