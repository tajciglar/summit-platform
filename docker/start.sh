#!/bin/bash
set -e

PORT="${PORT:-80}"
sed -i "s/\${NGINX_PORT}/${PORT}/g" /etc/nginx/sites-available/default

php artisan migrate --force || true
php artisan config:cache || true
php artisan route:cache || true
php artisan view:cache || true

exec /usr/bin/supervisord -c /etc/supervisor/conf.d/supervisord.conf
