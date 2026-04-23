FROM php:8.4-fpm

RUN apt-get update && apt-get install -y \
    git curl zip unzip libpq-dev libzip-dev libpng-dev libjpeg-dev libfreetype6-dev \
    libicu-dev libmagickwand-dev imagemagick libheif1 libwebp-dev \
    nginx supervisor cron \
    && docker-php-ext-configure gd --with-freetype --with-jpeg \
    && docker-php-ext-install pdo pdo_pgsql pgsql zip gd bcmath pcntl intl exif \
    && pecl install imagick && docker-php-ext-enable imagick \
    && apt-get clean && rm -rf /var/lib/apt/lists/*

# Raise PHP upload limits to match Nginx (64M). Stock php-fpm defaults
# (2M upload / 8M post) reject hero images and speaker photos.
RUN { \
        echo 'upload_max_filesize = 50M'; \
        echo 'post_max_size = 50M'; \
        echo 'memory_limit = 256M'; \
        echo 'max_execution_time = 120'; \
    } > /usr/local/etc/php/conf.d/uploads.ini

COPY --from=composer:2 /usr/bin/composer /usr/local/bin/composer

RUN curl -fsSL https://deb.nodesource.com/setup_22.x | bash - \
    && apt-get install -y nodejs \
    && npm install -g pnpm

WORKDIR /var/www/html

COPY composer.json composer.lock ./
RUN composer install --no-dev --optimize-autoloader --no-scripts

COPY package.json pnpm-lock.yaml ./
RUN pnpm install --frozen-lockfile

COPY . .

RUN composer dump-autoload --optimize \
    && pnpm build \
    && php artisan filament:cache-components 2>/dev/null || true

RUN chown -R www-data:www-data storage bootstrap/cache

COPY docker/nginx.conf /etc/nginx/sites-available/default
COPY docker/supervisord.conf /etc/supervisor/conf.d/supervisord.conf
COPY docker/crontab /etc/cron.d/laravel-cron

RUN chmod 0644 /etc/cron.d/laravel-cron && crontab /etc/cron.d/laravel-cron

COPY docker/start.sh /usr/local/bin/start.sh
RUN chmod +x /usr/local/bin/start.sh

EXPOSE 80

CMD ["/usr/local/bin/start.sh"]
