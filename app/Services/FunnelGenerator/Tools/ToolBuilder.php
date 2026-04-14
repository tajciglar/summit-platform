<?php

namespace App\Services\FunnelGenerator\Tools;

class ToolBuilder
{
    /**
     * Build one Claude tool per block in the catalog whose validOn includes $stepType.
     *
     * @param  array  $catalog  Full catalog (must have 'blocks' key)
     * @return array<int, array{name:string,description:string,input_schema:array}>
     */
    public function toolsForStep(array $catalog, string $stepType): array
    {
        $blocks = array_values(array_filter(
            $catalog['blocks'] ?? [],
            fn ($b) => in_array($stepType, $b['validOn'] ?? [], true),
        ));

        return array_map(fn ($b) => [
            'name' => 'emit_'.$b['type'],
            'description' => $this->describe($b),
            'input_schema' => $this->cleanSchema($b['schema']),
        ], $blocks);
    }

    /**
     * Build the meta-tool the Architect call uses.
     *
     * @param  array<int,string>  $stepTypes  Ordered list (optin, sales_page, upsell, thank_you)
     */
    public function architectTool(array $catalog, array $stepTypes): array
    {
        $properties = [];
        foreach ($stepTypes as $stepType) {
            $enum = array_values(array_map(
                fn ($b) => $b['type'],
                array_filter(
                    $catalog['blocks'] ?? [],
                    fn ($b) => in_array($stepType, $b['validOn'] ?? [], true),
                ),
            ));

            $properties[$stepType] = [
                'type' => 'array',
                'minItems' => 0,
                'items' => ['type' => 'string', 'enum' => $enum],
                'description' => "Ordered list of block types for the {$stepType} step.",
            ];
        }

        return [
            'name' => 'architect_funnel',
            'description' => 'Emit the block sequence for a complete funnel. One array per step type. Order blocks top-to-bottom as they will appear on the page.',
            'input_schema' => [
                'type' => 'object',
                'properties' => $properties,
                'required' => $stepTypes,
            ],
        ];
    }

    /** Claude's input_schema rejects the top-level "$schema" key. Strip it. */
    private function cleanSchema(array $schema): array
    {
        unset($schema['$schema']);

        return $schema;
    }

    private function describe(array $block): string
    {
        $example = json_encode($block['exampleProps'] ?? [], JSON_PRETTY_PRINT);

        return trim(($block['purpose'] ?? '')."\n\nExample:\n".$example);
    }
}
