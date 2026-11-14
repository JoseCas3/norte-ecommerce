#!/bin/sh
set -eu
: "${APP_KEY:?Configura APP_KEY en .env}"
php artisan package:discover --ansi
php artisan config:cache
exec "$@"
