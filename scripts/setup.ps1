$ErrorActionPreference = 'Stop'
Set-Location (Split-Path $PSScriptRoot -Parent)
if (!(Test-Path '.env.local')) { Copy-Item '.env.example' '.env.local' }
if (!(Test-Path 'backend/.env')) { Copy-Item 'backend/.env.example' 'backend/.env' }
foreach ($taskDir in @('backend/bootstrap/cache','backend/storage/framework/cache/data','backend/storage/framework/sessions','backend/storage/framework/views','backend/storage/logs')) { New-Item -ItemType Directory -Path $taskDir -Force | Out-Null }
if (!(Test-Path 'backend/database/database.sqlite')) { New-Item -ItemType File 'backend/database/database.sqlite' | Out-Null }
if (Test-Path '.tools/php/php.exe') { $env:PATH = (Join-Path (Get-Location) '.tools/php') + ';' + $env:PATH }
if (!(Get-Command php -ErrorAction SilentlyContinue)) { throw 'Instala PHP 8.4 y Composer o utiliza los binarios portátiles locales.' }
if (Test-Path '.tools/composer.phar') { php .tools/composer.phar install --working-dir=backend --no-interaction } else { composer install --working-dir=backend --no-interaction }
if ($LASTEXITCODE -ne 0) { throw 'Falló Composer.' }
if ((Get-Content backend/.env -Raw) -match '(?m)^APP_KEY=\s*$') { php backend/artisan key:generate }
php backend/artisan migrate --seed --force
if ($LASTEXITCODE -ne 0) { throw 'Falló la migración.' }
Write-Host 'API preparada. Ejecuta scripts/start-api.ps1 en una terminal.'
