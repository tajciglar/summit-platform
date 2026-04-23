<?php

namespace App\Support;

use Illuminate\Contracts\Encryption\DecryptException;
use Illuminate\Support\Facades\Crypt;

/**
 * Opaque, URL-safe token that carries an optin's {email, first_name} forward
 * to the sales page without exposing those values in the URL query string.
 *
 * The payload is encrypted with Laravel's APP_KEY (Crypt::encryptString), so
 * only this server can decrypt it. Tokens expire after 30 minutes.
 */
class CheckoutPrefillToken
{
    public const TTL_SECONDS = 1800;

    public static function issue(string $email, string $firstName): string
    {
        return Crypt::encryptString(json_encode([
            'email' => $email,
            'first_name' => $firstName,
            'exp' => now()->addSeconds(self::TTL_SECONDS)->timestamp,
        ]));
    }

    /**
     * @return array{email: string, first_name: string}|null Null when the
     *                                                       token is invalid, tampered with, or expired.
     */
    public static function read(string $token): ?array
    {
        try {
            $payload = json_decode(Crypt::decryptString($token), true);
        } catch (DecryptException) {
            return null;
        }

        if (! is_array($payload) || ! isset($payload['email'], $payload['first_name'], $payload['exp'])) {
            return null;
        }

        if (now()->timestamp > (int) $payload['exp']) {
            return null;
        }

        return [
            'email' => (string) $payload['email'],
            'first_name' => (string) $payload['first_name'],
        ];
    }
}
