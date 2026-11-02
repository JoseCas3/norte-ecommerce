# NORTE — E-commerce con Next.js 16 y Laravel 12

Actividad evaluada: **Optimización avanzada de rendimiento, Web Vitals y mutaciones asíncronas en el servidor**.

Frontend en Next.js App Router y TypeScript, API REST en Laravel 12, autenticación con Sanctum y pago con Stripe Checkout. El catálogo proviene de SQLite a través de la API; no hay un servidor simulado ni una alternativa de pagos ficticios.

## Requisitos

- Node.js 24 y pnpm 11.
- PHP 8.4 con extensiones curl, fileinfo, mbstring, openssl, pdo_sqlite, sqlite3 y zip.
- Composer 2.
- Stripe CLI y credenciales de un sandbox o cuenta de Stripe en modo de prueba.
- Edge, Chrome o Brave para ejecutar Lighthouse.

Se incluyen `pnpm-lock.yaml` y `backend/composer.lock`. En este equipo se prepararon binarios portátiles en `.tools/`; ese directorio es privado y no se distribuye en GitHub.

## Instalación y ejecución

Desde la raíz del proyecto:

```powershell
pnpm install --frozen-lockfile
./scripts/setup.ps1
```

El script crea los directorios de Laravel, copia los archivos de entorno si no existen, instala Composer, genera APP_KEY y ejecuta las migraciones y el seeder sin borrar datos existentes.

Abre tres terminales:

```powershell
# Terminal 1: API
./scripts/start-api.ps1

# Terminal 2: frontend
pnpm dev

# Terminal 3: webhooks de Stripe
./scripts/start-webhooks.ps1
```

- Tienda: [http://localhost:3000](http://localhost:3000).
- Swagger UI: [http://127.0.0.1:8000/docs](http://127.0.0.1:8000/docs).
- OpenAPI: [http://127.0.0.1:8000/openapi.json](http://127.0.0.1:8000/openapi.json).

En macOS/Linux, después de instalar las dependencias:

```sh
cp .env.example .env.local
cp backend/.env.example backend/.env
mkdir -p backend/bootstrap/cache backend/storage/framework/cache/data backend/storage/framework/sessions backend/storage/framework/views backend/storage/logs
touch backend/database/database.sqlite
cd backend
composer install
php artisan key:generate
php artisan migrate --seed
cd ..
php -S 127.0.0.1:8000 -t backend/public backend/server.php
# En otras terminales: pnpm dev y stripe listen ...
```

### Configuración del frontend: .env.local

```dotenv
BASE_URL=http://127.0.0.1:8000/api
SITE_URL=http://localhost:3000
```

`BASE_URL` es la URL base de Laravel e incluye `/api`. Solo se utiliza en el servidor. `SITE_URL` identifica la URL local de referencia; el retorno de Stripe se configura en `FRONTEND_URL` de Laravel.

### Configuración del backend: backend/.env

```dotenv
APP_NAME=NORTE
APP_ENV=local
APP_KEY=
APP_DEBUG=false
APP_URL=http://127.0.0.1:8000
FRONTEND_URL=http://localhost:3000
DB_CONNECTION=sqlite
STRIPE_SECRET=
STRIPE_WEBHOOK_SECRET=
```

`php artisan key:generate` completa APP_KEY. La base de datos se crea en `backend/database/database.sqlite`. Los precios se almacenan como enteros en centavos USD.

## Stripe: configuración y flujo de compra

1. Obtén una clave secreta de prueba de tu cuenta/sandbox y escríbela en `backend/.env`, en STRIPE_SECRET.
2. Ejecuta `stripe login` si usas una cuenta propia. Con un sandbox temporal, usa el perfil local creado por la CLI.
3. Inicia la escucha:

```sh
stripe listen --events checkout.session.completed,checkout.session.async_payment_succeeded,checkout.session.expired --forward-to http://127.0.0.1:8000/api/stripe/webhook
```

4. Copia el secreto `whsec_...` que muestra la CLI a STRIPE_WEBHOOK_SECRET. Mantén la escucha activa mientras pruebas.
5. Registra un usuario desde la tienda, agrega productos y continúa al pago.
6. En Checkout utiliza la tarjeta de prueba **4242 4242 4242 4242**, fecha futura y CVC de tres dígitos.
7. Comprueba la confirmación de compra y la orden con estado «Pago confirmado» en el historial.

Stripe procesa el pago en su infraestructura de pruebas; no se mueve dinero. La orden cambia a `paid` únicamente después de verificar una sesión pagada, su importe, moneda e identificador. El webhook exige firma válida. La página de retorno solo consulta la API.

**Sandbox preparado para esta entrega:** caduca el **9 de noviembre de 2026**. El enlace privado para reclamarlo está en `.tools/RECLAMAR-STRIPE.txt`, excluido de Git. Reclámalo antes de la fecha indicada para conservarlo. Las claves nunca deben adjuntarse a la entrega.

Referencias oficiales: [pruebas de Stripe](https://docs.stripe.com/testing), [confirmación de pagos](https://docs.stripe.com/checkout/fulfillment), [sandbox temporal](https://docs.stripe.com/cli/sandbox).

## Rutas implementadas

| Ruta                   | Acceso                     | Función                                      |
| ---------------------- | -------------------------- | -------------------------------------------- |
| /                      | Público                    | Redirige al catálogo                         |
| /catalogo              | Público                    | Listado, búsqueda y categorías               |
| /catalogo/[id]         | Público                    | Detalle, stock y agregar al carrito          |
| /registro              | Público                    | Registro mediante Server Action              |
| /login                 | Público                    | Login mediante Server Action                 |
| /checkout              | Público / pago autenticado | Carrito local y creación de orden            |
| /confirmacion?order=ID | Protegido                  | Estado real de una orden propia              |
| /historial             | Protegido                  | Órdenes del usuario y reanudación de pago    |
| /api/session           | Público                    | Indica si existe cookie sin exponer el token |

El proxy de Next.js protege historial y confirmación. Laravel valida la identidad y la propiedad de cada orden, incluso si alguien intenta saltarse el frontend.

## Endpoints consumidos

| Método | Endpoint Laravel          | Uso                                       |
| ------ | ------------------------- | ----------------------------------------- |
| GET    | /api/products             | Catálogo y filtros                        |
| GET    | /api/products/{id}        | Detalle                                   |
| POST   | /api/register             | Registro                                  |
| POST   | /api/login                | Login                                     |
| GET    | /api/user                 | Validación de sesión                      |
| POST   | /api/logout               | Revocación del token                      |
| GET    | /api/orders               | Historial propio                          |
| POST   | /api/orders               | Crear orden                               |
| GET    | /api/orders/{id}          | Confirmación                              |
| POST   | /api/orders/{id}/checkout | Abrir/reanudar Stripe                     |
| POST   | /api/stripe/webhook       | Confirmar pago o liberar stock al expirar |

El contrato OpenAPI está versionado en `backend/openapi.json` y se visualiza con Swagger UI. En Swagger, registra/inicia sesión, copia el token en **Authorize** y usa **Try it out → Execute**. La creación de orden exige una cabecera Idempotency-Key UUID distinta para cada carrito.

## Decisiones de rendimiento y seguridad

- **Server Components:** catálogo, detalle, identidad e historial consultan Laravel desde el servidor.
- **Server Actions:** registro, login, logout, creación de orden, inicio de pago y actualización de historial.
- **Cookie httpOnly:** el bearer token se guarda en una cookie de servidor con SameSite=Lax, Secure en producción y duración de ocho horas. El proxy refuerza esos atributos. El token no llega a localStorage ni a props del navegador.
- **Carrito local:** guarda solamente productos y cantidades. Laravel ignora totales enviados por el cliente, recalcula con precios de base de datos y reserva stock en una transacción.
- **Idempotencia:** un reintento del mismo carrito conserva la clave y recupera la misma orden. Stripe también recibe una clave por orden. Los botones se deshabilitan mientras la mutación está pendiente.
- **Lecturas públicas:** caché de 60 segundos; las lecturas privadas usan no-store. Las mutaciones llaman revalidatePath. Después del webhook, el botón de actualización consulta el estado actual y revalida catálogo/historial.
- **Resiliencia:** timeout de 12 segundos, mensajes de validación, errores de red, error.tsx y opción de reintento.
- **Carga progresiva:** loading.tsx para catálogo, checkout e historial, con Suspense en catálogo e historial.
- **Diseño estable:** áreas visuales con aspect-ratio, fuentes del sistema y sin scripts de Stripe en el catálogo; Stripe se abre solo al pagar.
- **Web Vitals:** useReportWebVitals registra métricas en desarrollo. Lighthouse genera evidencia de laboratorio. El INP de campo requiere interacciones y tráfico real; el TBT del reporte no es una medición de INP.

Referencias: [mutaciones de Next.js](https://nextjs.org/docs/app/getting-started/mutating-data), [cookies](https://nextjs.org/docs/app/api-reference/functions/cookies), [Sanctum](https://laravel.com/docs/12.x/sanctum).

### Alcance

Se implementa el flujo solicitado de compra en USD, sin administración, cálculo fiscal ni logística real. El seeder aporta seis productos iniciales persistentes a la API. Las órdenes pendientes reservan stock; las sesiones que expiran lo liberan mediante webhook. Una orden cuyo Checkout aún no pudo abrirse conserva la reserva para reintentar desde el historial. Para una tienda comercial convendría añadir un proceso programado de limpieza de órdenes abandonadas y paginación del historial.

## Validación

```sh
pnpm test
pnpm typecheck
pnpm build
cd backend
vendor/bin/phpunit
cd ..
node scripts/smoke-api.mjs
```

En Windows con PHP portátil:

```powershell
./.tools/php/php.exe backend/vendor/phpunit/phpunit/phpunit -c backend/phpunit.xml
```

Las pruebas HTTP crean cuentas QA en la base local con correos example.com y verifican autenticación, aislamiento, precios, idempotencia y revocación. Las pruebas unitarias de pago comprueban confirmación, importes y expiración con datos controlados en una BD en memoria. Son verificaciones técnicas separadas de la compra realizada en Stripe.

Se incluye CI de GitHub Actions para compilar el frontend y ejecutar sus pruebas y las del backend.

## Lighthouse y evidencias

Para reproducir la auditoría usa la versión de producción:

```sh
pnpm build
pnpm start
# En otra terminal, con Laravel activo:
pnpm lighthouse
```

Si la CLI no encuentra un navegador:

```powershell
$env:CHROME_PATH = 'C:/Program Files (x86)/Microsoft/Edge/Application/msedge.exe'
pnpm lighthouse
```

Reporte móvil local del catálogo: **97 rendimiento / 100 accesibilidad / 100 buenas prácticas / 100 SEO**. LCP **0,9 s**, CLS **0**, TBT **190 ms**. Los resultados dependen del dispositivo y de las condiciones de ejecución.

Los archivos están en [evidencias/](evidencias/): capturas del flujo, Swagger, reporte HTML/JSON y verificación del pago contrastada con la API de Stripe. Consulta el [índice de evidencias](evidencias/README.md).

## Publicación en GitHub

El repositorio público debe incluir código fuente, README, ejemplos de entorno, archivos lock y evidencias. Excluir .env.local, backend/.env, node_modules, vendor, SQLite, logs y .tools. No enviar secretos al profesor.

```sh
git init -b main
git add .
git commit -m "Implementar e-commerce Next.js y API Laravel con Stripe"
git remote add origin https://github.com/JoseCas3/norte-ecommerce.git
git push -u origin main
```

Crea el repositorio vacío como público antes del push. Adjunta su URL y las capturas/reporte a la plataforma de la actividad.
