<?php

namespace App\Services\FunnelGenerator\Exceptions;

class InvalidPropsException extends \RuntimeException
{
    /** @param array<int,array{message:string}> $errors */
    public function __construct(string $message, private array $errors = [])
    {
        parent::__construct($message);
    }

    public function errors(): array
    {
        return $this->errors;
    }
}
