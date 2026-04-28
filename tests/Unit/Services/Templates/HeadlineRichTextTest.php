<?php

namespace Tests\Unit\Services\Templates;

use App\Services\Templates\HeadlineRichText;
use PHPUnit\Framework\Attributes\DataProvider;
use PHPUnit\Framework\TestCase;

class HeadlineRichTextTest extends TestCase
{
    #[DataProvider('splitCases')]
    public function test_split(string $html, array $expected): void
    {
        $this->assertSame($expected, HeadlineRichText::split($html));
    }

    public static function splitCases(): array
    {
        return [
            'three parts' => [
                'A<em>b</em>c',
                ['lead' => 'A', 'accent' => 'b', 'trail' => 'c'],
            ],
            'plain text' => [
                'Just text',
                ['lead' => 'Just text', 'accent' => '', 'trail' => ''],
            ],
            'lead + accent only' => [
                'A<em>b</em>',
                ['lead' => 'A', 'accent' => 'b', 'trail' => ''],
            ],
            'accent + trail only' => [
                '<em>b</em>c',
                ['lead' => '', 'accent' => 'b', 'trail' => 'c'],
            ],
            'empty' => [
                '',
                ['lead' => '', 'accent' => '', 'trail' => ''],
            ],
            'i tag treated as em' => [
                'A<i>b</i>c',
                ['lead' => 'A', 'accent' => 'b', 'trail' => 'c'],
            ],
            'strips other tags' => [
                'A<strong>x</strong><em>b</em>c',
                ['lead' => 'Ax', 'accent' => 'b', 'trail' => 'c'],
            ],
            'multiple em — only first counts' => [
                'A<em>b</em>c<em>d</em>e',
                ['lead' => 'A', 'accent' => 'b', 'trail' => 'cde'],
            ],
            'decodes entities' => [
                'Tea &amp; biscuits<em>now</em>',
                ['lead' => 'Tea & biscuits', 'accent' => 'now', 'trail' => ''],
            ],
            'paragraph wrapper from RichEditor' => [
                '<p>A<em>b</em>c</p>',
                ['lead' => 'A', 'accent' => 'b', 'trail' => 'c'],
            ],
        ];
    }

    #[DataProvider('joinCases')]
    public function test_join(array $parts, string $expected): void
    {
        $this->assertSame($expected, HeadlineRichText::join($parts));
    }

    public static function joinCases(): array
    {
        return [
            'three parts' => [
                ['lead' => 'A', 'accent' => 'b', 'trail' => 'c'],
                'A<em>b</em>c',
            ],
            'empty accent skips em' => [
                ['lead' => 'Hello world', 'accent' => '', 'trail' => ''],
                'Hello world',
            ],
            'escapes html in parts' => [
                ['lead' => 'A & B', 'accent' => '<x>', 'trail' => '"end"'],
                'A &amp; B<em>&lt;x&gt;</em>&quot;end&quot;',
            ],
        ];
    }

    public function test_round_trip(): void
    {
        $original = ['lead' => 'Your bright, ', 'accent' => 'busy-minded', 'trail' => ' child is not a problem to be solved.'];
        $html = HeadlineRichText::join($original);
        $back = HeadlineRichText::split($html);
        $this->assertSame($original, $back);
    }
}
