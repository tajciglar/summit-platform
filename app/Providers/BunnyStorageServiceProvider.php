<?php

namespace App\Providers;

use Illuminate\Filesystem\FilesystemAdapter;
use Illuminate\Support\Facades\Storage;
use Illuminate\Support\ServiceProvider;
use League\Flysystem\Filesystem;
use PlatformCommunity\Flysystem\BunnyCDN\BunnyCDNAdapter;
use PlatformCommunity\Flysystem\BunnyCDN\BunnyCDNClient;
use PlatformCommunity\Flysystem\BunnyCDN\BunnyCDNRegion;

/**
 * Registers the `bunnycdn` Flysystem driver with Laravel's Storage manager.
 *
 * The platformcommunity/flysystem-bunnycdn package has no auto-discovery,
 * so we wire the driver manually here. Disks using `'driver' => 'bunnycdn'`
 * (see config/filesystems.php) are resolved through this extension.
 */
class BunnyStorageServiceProvider extends ServiceProvider
{
    public function boot(): void
    {
        Storage::extend('bunnycdn', function ($app, array $config): FilesystemAdapter {
            $region = $config['region'] ?? '';

            $client = new BunnyCDNClient(
                $config['storage_zone'] ?? '',
                $config['api_key'] ?? '',
                $region !== '' ? $region : BunnyCDNRegion::DEFAULT,
            );

            $adapter = new BunnyCDNAdapter(
                $client,
                $config['pull_zone_url'] ?? '',
            );

            return new FilesystemAdapter(
                new Filesystem($adapter, $config),
                $adapter,
                $config,
            );
        });
    }
}
