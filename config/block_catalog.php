<?php

return [
    'cache_key' => 'block-catalog:current',
    'bunny_storage_zone' => env('BUNNY_CDN_STORAGE_ZONE'),
    'bunny_api_key' => env('BUNNY_CDN_API_KEY'),
    'bunny_hostname' => env('BUNNY_CDN_HOSTNAME'),
    'catalog_path' => 'block-catalog/current.json',
    'refresh_token' => env('CATALOG_REFRESH_TOKEN'),
];
