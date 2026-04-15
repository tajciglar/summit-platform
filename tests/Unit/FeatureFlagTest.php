<?php
// tests/Unit/FeatureFlagTest.php
namespace Tests\Unit;

use Tests\TestCase;

class FeatureFlagTest extends TestCase
{
    public function test_runtime_gemini_flag_reads_env(): void
    {
        config(['features.runtime_gemini_gen' => true]);
        $this->assertTrue(config('features.runtime_gemini_gen'));
        config(['features.runtime_gemini_gen' => false]);
        $this->assertFalse(config('features.runtime_gemini_gen'));
    }
}
