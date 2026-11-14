# syntax=docker/dockerfile:1
FROM php:8.4-fpm-alpine AS php-base
RUN apk add --no-cache oniguruma libxml2 \
    && apk add --no-cache --virtual .build-deps $PHPIZE_DEPS oniguruma-dev libxml2-dev \
    && docker-php-ext-install -j$(nproc) pdo_mysql mbstring xml \
    && apk del .build-deps
WORKDIR /var/www/html
FROM php-base AS dependencies
COPY --from=composer:2 /usr/bin/composer /usr/bin/composer
ENV COMPOSER_ALLOW_SUPERUSER=1
COPY composer.json composer.lock ./
RUN --mount=type=cache,target=/root/.composer/cache composer install --no-dev --prefer-dist --no-interaction --no-progress --no-scripts --no-autoloader
COPY app ./app
COPY database ./database
RUN composer dump-autoload --no-dev --classmap-authoritative --no-scripts
FROM php-base AS runtime
ENV APP_ENV=production APP_DEBUG=false
COPY app ./app
COPY bootstrap/app.php bootstrap/providers.php ./bootstrap/
COPY config ./config
COPY database ./database
COPY public ./public
COPY routes ./routes
COPY artisan openapi.json ./
COPY --from=dependencies /var/www/html/vendor ./vendor
COPY docker/entrypoint.sh /usr/local/bin/norte-entrypoint
RUN mkdir -p bootstrap/cache storage/framework/cache/data storage/framework/sessions storage/framework/views storage/logs \
    && chown -R www-data:www-data bootstrap/cache storage \
    && sed -i 's/\r$//' /usr/local/bin/norte-entrypoint \
    && chmod +x /usr/local/bin/norte-entrypoint
USER www-data
EXPOSE 9000
ENTRYPOINT ["norte-entrypoint"]
CMD ["php-fpm", "-F"]
FROM nginx:stable-alpine AS web
COPY docker/nginx.conf /etc/nginx/conf.d/default.conf
COPY public /var/www/html/public
EXPOSE 80
