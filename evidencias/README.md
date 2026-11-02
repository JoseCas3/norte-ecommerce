# Evidencias de la actividad

Fecha de verificación: 2 de noviembre de 2026. Entorno local, Next.js en producción y Laravel 12 con SQLite.

| Archivo                  | Evidencia                                           |
| ------------------------ | --------------------------------------------------- |
| 01-catalogo.jpg          | Catálogo obtenido de la API                         |
| 02-carrito.jpg           | Carrito con producto y total                        |
| 03-registro.jpg          | Formulario de registro                              |
| 05-historial.jpg         | Orden pendiente antes del pago                      |
| 06-swagger-endpoints.jpg | Swagger con los endpoints implementados             |
| 07-stripe-checkout.jpg   | Checkout oficial de Stripe en sandbox               |
| 08-compra-confirmada.jpg | Confirmación del pago desde la aplicación           |
| 09-historial-pagado.jpg  | Orden pagada en historial protegido                 |
| 10-swagger-respuesta.jpg | GET /products ejecutado desde Swagger               |
| 11-lighthouse.jpg        | Puntuaciones del reporte de rendimiento             |
| lighthouse.html          | Reporte Lighthouse completo para abrir en navegador |
| lighthouse.json          | Mediciones originales de Lighthouse                 |
| verificacion-api.json    | Resultado de 14 verificaciones HTTP reales          |
| stripe-payment.json      | Estado pagado contrastado entre BD y API de Stripe  |
| stripe-webhook.txt       | Evento recibido y respuesta HTTP 200                |
| stripe-sandbox.json      | Modo de prueba y fecha de expiración, sin secretos  |

La captura 04-stripe-pendiente-configuracion.jpg documenta el manejo de errores antes de configurar Stripe. El pago se completó después y está acreditado por las capturas 08 y 09 y el archivo stripe-payment.json.

Lighthouse mide una carga del catálogo con emulación móvil. La evidencia de laboratorio no sustituye Web Vitals de campo. La compra utiliza infraestructura real de pruebas de Stripe y no mueve dinero.

Para una entrega compacta, adjunta 06, 07, 08, 09, 10 y 11 y conserva el reporte HTML en el repositorio. Las capturas no contienen contraseñas ni claves secretas.
