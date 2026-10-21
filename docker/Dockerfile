FROM node:22-alpine AS frontend

WORKDIR /build

COPY package*.json ./
RUN npm ci

COPY . .
RUN npm run build

FROM composer:2 AS dependencies

WORKDIR /app

COPY composer.json composer.lock ./
RUN composer install --no-dev --no-interaction --no-progress --prefer-dist --no-scripts --optimize-autoloader

FROM php:8.2-fpm-alpine

RUN apk add --no-cache icu-libs libzip oniguruma \
    && apk add --no-cache --virtual .build-deps $PHPIZE_DEPS icu-dev libzip-dev oniguruma-dev \
    && docker-php-ext-install -j"$(getconf _NPROCESSORS_ONLN)" bcmath intl mbstring opcache pdo_mysql zip \
    && apk del .build-deps

WORKDIR /var/www/html

COPY --from=dependencies /app/vendor ./vendor
COPY --from=frontend /build/public/build ./public/build
COPY . .
COPY docker/php.ini /usr/local/etc/php/conf.d/zz-splitter.ini
COPY docker/entrypoint.sh /usr/local/bin/splitter-entrypoint

RUN chmod +x /usr/local/bin/splitter-entrypoint \
    && mkdir -p storage/framework/cache storage/framework/sessions storage/framework/views storage/logs bootstrap/cache \
    && chown -R www-data:www-data storage bootstrap/cache

ENTRYPOINT ["/usr/local/bin/splitter-entrypoint"]
CMD ["php-fpm", "-F"]
