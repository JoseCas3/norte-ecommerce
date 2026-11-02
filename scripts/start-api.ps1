$ErrorActionPreference = 'Stop'
Set-Location (Split-Path $PSScriptRoot -Parent)
if (Test-Path '.tools/php/php.exe') { & ./.tools/php/php.exe -S 127.0.0.1:8000 -t backend/public backend/server.php } else { php -S 127.0.0.1:8000 -t backend/public backend/server.php }
