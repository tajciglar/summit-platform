<?php

namespace App\Http\Controllers\Admin;

use App\Http\Controllers\Controller;
use App\Models\Funnel;
use App\Models\FunnelStep;
use Illuminate\Http\JsonResponse;
use Illuminate\Http\Request;
use Inertia\Inertia;
use Inertia\Response;

class FlowController extends Controller
{
    public function show(Funnel $funnel): Response
    {
        $funnel->load(['summit', 'steps.product']);

        $steps = $funnel->steps->sortBy('sort_order')->values()->map(fn (FunnelStep $step) => [
            'id' => $step->id,
            'name' => $step->name,
            'slug' => $step->slug,
            'step_type' => $step->step_type,
            'sort_order' => $step->sort_order,
            'is_published' => $step->is_published,
            'product_name' => $step->product?->name,
            'has_blocks' => ! empty($step->content['blocks'] ?? []),
        ]);

        return Inertia::render('Admin/Flow', [
            'funnel' => [
                'id' => $funnel->id,
                'name' => $funnel->name,
                'slug' => $funnel->slug,
            ],
            'summit' => [
                'id' => $funnel->summit->id,
                'title' => $funnel->summit->title,
                'slug' => $funnel->summit->slug,
            ],
            'steps' => $steps,
        ]);
    }

    public function reorder(Request $request, Funnel $funnel): JsonResponse
    {
        $validated = $request->validate([
            'steps' => ['required', 'array'],
            'steps.*.id' => ['required', 'uuid'],
            'steps.*.sort_order' => ['required', 'integer', 'min:0'],
        ]);

        foreach ($validated['steps'] as $stepData) {
            FunnelStep::where('id', $stepData['id'])
                ->where('funnel_id', $funnel->id)
                ->update(['sort_order' => $stepData['sort_order']]);
        }

        return response()->json(['success' => true]);
    }
}
