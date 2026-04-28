<?php

namespace App\Services\Templates;

class HeadlineRichText
{
    /**
     * Split rich-text HTML into the three canonical strings the renderer expects.
     *
     * The first `<em>...</em>` (or `<i>...</i>`) becomes the accent. Text before
     * is `lead`; text after is `trail`. Other inline tags are stripped. HTML
     * entities are decoded. A surrounding `<p>` wrapper from RichEditor output
     * is unwrapped.
     *
     * @return array{lead: string, accent: string, trail: string}
     */
    public static function split(string $html): array
    {
        $html = trim($html);
        if ($html === '') {
            return ['lead' => '', 'accent' => '', 'trail' => ''];
        }

        // Unwrap a single outer <p>...</p> from RichEditor output.
        if (preg_match('#^<p>(.*)</p>$#s', $html, $m)) {
            $html = $m[1];
        }

        // Normalize <i> to <em>.
        $html = preg_replace('#<\s*i(\s[^>]*)?>#i', '<em>', $html) ?? $html;
        $html = preg_replace('#<\s*/\s*i\s*>#i', '</em>', $html) ?? $html;

        if (preg_match('#^(.*?)<em(?:\s[^>]*)?>(.*?)</em>(.*)$#s', $html, $m)) {
            return [
                'lead' => self::clean($m[1]),
                'accent' => self::clean($m[2]),
                'trail' => self::clean($m[3]),
            ];
        }

        return [
            'lead' => self::clean($html),
            'accent' => '',
            'trail' => '',
        ];
    }

    /**
     * Inverse of {@see split()}. Empty accent omits the `<em>` wrapper.
     *
     * @param  array{lead?: string, accent?: string, trail?: string}  $parts
     */
    public static function join(array $parts): string
    {
        $lead = htmlspecialchars((string) ($parts['lead'] ?? ''), ENT_QUOTES);
        $accent = htmlspecialchars((string) ($parts['accent'] ?? ''), ENT_QUOTES);
        $trail = htmlspecialchars((string) ($parts['trail'] ?? ''), ENT_QUOTES);

        if ($accent === '') {
            return $lead.$trail;
        }

        return $lead.'<em>'.$accent.'</em>'.$trail;
    }

    private static function clean(string $fragment): string
    {
        $stripped = strip_tags($fragment);

        return html_entity_decode($stripped, ENT_QUOTES, 'UTF-8');
    }
}
