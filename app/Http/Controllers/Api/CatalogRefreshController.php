<?php

namespace App\Http\Controllers\Api;

use App\Http\Controllers\Controller;
use App\Services\Blocks\BlockCatalogService;
use Illuminate\Http\JsonResponse;
use Illuminate\Http\Request;

class CatalogRefreshController extends Controller
{
    public function __invoke(Request $request, BlockCatalogService $service): JsonResponse
    {
        $expected = config('block_catalog.refresh_token');
        $provided = $request->bearerToken();

        abort_unless($expected && hash_equals($expected, $provided ?? ''), 403);

        $catalog = $service->fetchAndCache();

        return response()->json([
            'version' => $catalog['version'] ?? null,
            'block_count' => count($catalog['blocks'] ?? []),
        ]);
    }
}
