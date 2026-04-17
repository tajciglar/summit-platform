<?php

namespace App\Services\Templates;

class TemplateSelector
{
    public function __construct(private TemplateRegistry $registry) {}

    /**
     * Pick up to $count distinct template keys from the candidate pool.
     *
     * If $pool is empty, all registry keys are used as candidates. Pool entries
     * that are not present in the registry are filtered out. If fewer valid
     * candidates exist than $count, all of them are returned.
     *
     * @param  list<string>  $pool  Candidate template keys. Empty = all registry keys.
     * @return list<string>
     */
    public function pick(array $pool, int $count): array
    {
        $validKeys = $this->registry->allKeys();
        $candidates = empty($pool)
            ? $validKeys
            : array_values(array_intersect($pool, $validKeys));

        if (empty($candidates) || $count <= 0) {
            return [];
        }

        shuffle($candidates);

        return array_slice($candidates, 0, min($count, count($candidates)));
    }
}
