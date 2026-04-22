<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Support\Facades\DB;

/**
 * Six remaining monolithic templates (blue-coral, cream-sage, green-gold,
 * lime-ink, rust-cream, violet-sun) stop storing `speakersDay` in
 * page_content — speakers + their day buckets are now fully derived at
 * render time from the summit's Speaker table (same pattern as
 * indigo-gold / ochre-ink). Strip the key so Zod validation doesn't
 * reject the extra property under the new schema.
 *
 * Non-reversible — the stripped data is fully reconstructable from the
 * Speaker table at render time, so there's nothing meaningful to restore.
 */
return new class extends Migration
{
    public function up(): void
    {
        $templateKeys = ['blue-coral', 'cream-sage', 'green-gold', 'lime-ink', 'rust-cream', 'violet-sun'];

        DB::table('funnel_steps')
            ->whereIn(DB::raw("page_content->>'template_key'"), $templateKeys)
            ->orderBy('id')
            ->lazy()
            ->each(function (object $row): void {
                $content = json_decode($row->page_content, true) ?: [];
                $body = $content['content'] ?? null;
                if (! is_array($body) || ! array_key_exists('speakersDay', $body)) {
                    return;
                }

                unset($body['speakersDay']);
                $content['content'] = $body;

                DB::table('funnel_steps')
                    ->where('id', $row->id)
                    ->update(['page_content' => json_encode($content)]);
            });
    }

    public function down(): void
    {
        // Intentionally empty — the speaker day groupings are derived at
        // render time now; there's no page_content state to restore.
    }
};
