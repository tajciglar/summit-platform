<?php

namespace App\Http\Controllers\Admin;

use App\Http\Controllers\Controller;
use App\Models\FunnelStep;
use App\Services\BlockSchemaExporter;
use Illuminate\Http\JsonResponse;
use Illuminate\Http\Request;
use Inertia\Inertia;
use Inertia\Response;

class BuilderController extends Controller
{
    public function show(FunnelStep $funnelStep): Response
    {
        $funnelStep->load('funnel.summit');

        return Inertia::render('Admin/Builder', [
            'step' => [
                'id' => $funnelStep->id,
                'name' => $funnelStep->name,
                'slug' => $funnelStep->slug,
                'step_type' => $funnelStep->step_type,
            ],
            'funnel' => [
                'id' => $funnelStep->funnel->id,
                'name' => $funnelStep->funnel->name,
                'slug' => $funnelStep->funnel->slug,
            ],
            'summit' => [
                'id' => $funnelStep->funnel->summit->id,
                'title' => $funnelStep->funnel->summit->title,
                'slug' => $funnelStep->funnel->summit->slug,
            ],
            'theme' => $funnelStep->funnel->theme ?? [],
            'blocks' => $funnelStep->content['blocks'] ?? [],
            'blockSchemas' => BlockSchemaExporter::export(),
            'blockTypes' => BlockSchemaExporter::exportBlockTypes(),
        ]);
    }

    public function save(Request $request, FunnelStep $funnelStep): JsonResponse
    {
        $validated = $request->validate([
            'blocks' => ['required', 'array'],
            'blocks.*.type' => ['required', 'string'],
            'blocks.*.data' => ['required', 'array'],
        ]);

        $content = $funnelStep->content ?? [];
        $content['blocks'] = $validated['blocks'];
        $funnelStep->content = $content;
        $funnelStep->save();

        return response()->json([
            'success' => true,
            'updated_at' => $funnelStep->updated_at->toISOString(),
        ]);
    }
}
