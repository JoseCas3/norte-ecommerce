$ErrorActionPreference = 'Stop'
Set-Location (Split-Path $PSScriptRoot -Parent)
if (Test-Path '.tools/stripe/stripe.exe') {
 & ./.tools/stripe/stripe.exe --config .tools/stripe-config.toml listen --events checkout.session.completed,checkout.session.async_payment_succeeded,checkout.session.expired --forward-to http://127.0.0.1:8000/api/stripe/webhook
} else {
 stripe listen --events checkout.session.completed,checkout.session.async_payment_succeeded,checkout.session.expired --forward-to http://127.0.0.1:8000/api/stripe/webhook
}
