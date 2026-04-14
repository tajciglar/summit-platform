<?php

namespace App\Services\FunnelGenerator\Validators;

use App\Services\FunnelGenerator\Exceptions\InvalidPropsException;
use Opis\JsonSchema\Errors\ErrorFormatter;
use Opis\JsonSchema\Validator;

class BlockPropsValidator
{
    public function validate(array $schema, array $props): bool
    {
        $validator = new Validator();
        $result = $validator->validate(
            json_decode(json_encode($props)),
            json_decode(json_encode($schema)),
        );

        if ($result->isValid()) {
            return true;
        }

        $formatter = new ErrorFormatter();
        $flat = $formatter->formatFlat($result->error());
        $errors = array_map(fn ($msg) => ['message' => (string) $msg], $flat);

        throw new InvalidPropsException(
            'Block props failed schema validation: '.implode('; ', array_column($errors, 'message')),
            $errors,
        );
    }
}
