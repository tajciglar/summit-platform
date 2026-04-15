<?php

namespace App\Services\StyleBrief;

use App\Models\Funnel;

class StyleBriefResolver
{
    public function resolveForFunnel(?Funnel $funnel): array
    {
        $default = DefaultStyleBrief::get();
        if (! $funnel) {
            return $default;
        }

        $base = $funnel->summit?->style_brief ?? [];
        $override = $funnel->style_brief_override ?? [];

        return $this->deepMerge($this->deepMerge($default, $base), $override);
    }

    public function resolveForSummit(\App\Models\Summit $summit): array
    {
        $default = DefaultStyleBrief::get();
        $base = $summit->style_brief ?? [];

        return $this->deepMerge($default, $base);
    }

    private function deepMerge(array $a, array $b): array
    {
        foreach ($b as $key => $value) {
            if (is_array($value)
                && isset($a[$key])
                && is_array($a[$key])
                && ! array_is_list($a[$key])
            ) {
                $a[$key] = $this->deepMerge($a[$key], $value);
            } else {
                $a[$key] = $value;
            }
        }
        return $a;
    }
}
