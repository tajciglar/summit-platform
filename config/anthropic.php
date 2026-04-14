<?php

return [
    'api_key' => env('ANTHROPIC_API_KEY'),
    'base_url' => env('ANTHROPIC_BASE_URL', 'https://api.anthropic.com/v1'),
    'architect_model' => env('ANTHROPIC_ARCHITECT_MODEL', 'claude-opus-4-6'),
    'copywriter_model' => env('ANTHROPIC_COPYWRITER_MODEL', 'claude-opus-4-6'),
    'max_tokens' => 4096,
    'timeout' => 120,
    'retries' => 2,
    'prompt_cache' => env('ANTHROPIC_PROMPT_CACHE', true),
];
