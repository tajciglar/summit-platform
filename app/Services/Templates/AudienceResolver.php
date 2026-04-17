<?php

declare(strict_types=1);

namespace App\Services\Templates;

use App\Enums\SummitAudience;
use App\Models\LandingPageBatch;

class AudienceResolver
{
    /**
     * @return array<string, string> 8-token palette hex map
     */
    public function resolveForBatch(LandingPageBatch $batch): array
    {
        return AudiencePalettes::paletteFor($this->resolveEnum($batch));
    }

    public function resolveEnum(LandingPageBatch $batch): ?SummitAudience
    {
        if ($batch->audience_override instanceof SummitAudience) {
            return $batch->audience_override;
        }

        $summit = $batch->summit;
        if ($summit && $summit->audience instanceof SummitAudience) {
            return $summit->audience;
        }

        return null;
    }
}
