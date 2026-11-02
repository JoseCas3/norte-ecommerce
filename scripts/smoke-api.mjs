import assert from "node:assert/strict";
import { writeFile, mkdir } from "node:fs/promises";
const base = process.env.BASE_URL || "http://127.0.0.1:8000/api";
let token;
const checks = [];
async function call(path, method = "GET", body, auth = true, key) {
  const r = await fetch(base + path, {
    method,
    headers: {
      Accept: "application/json",
      ...(body ? { "Content-Type": "application/json" } : {}),
      ...(auth && token ? { Authorization: "Bearer " + token } : {}),
      ...(key ? { "Idempotency-Key": key } : {}),
    },
    body: body ? JSON.stringify(body) : undefined,
  });
  const data = await r.json();
  return { status: r.status, data };
}
function check(name, condition) {
  assert.ok(condition, name);
  checks.push({ name, result: "PASS" });
  console.log("PASS", name);
}
const products = await call("/products");
check(
  "Catálogo público desde Laravel",
  products.status === 200 && products.data.data.length >= 1,
);
const p = products.data.data[0];
check(
  "Detalle de producto",
  (await call("/products/" + p.id)).data.id === p.id,
);
check(
  "Órdenes protegidas",
  (await call("/orders", "GET", undefined, false)).status === 401,
);
const email = "qa-" + Date.now() + "@example.com",
  password = crypto.randomUUID() + "aA1!";
const reg = await call("/register", "POST", {
  name: "Verificación automática",
  email,
  password,
  password_confirmation: password,
});
check("Registro real con Sanctum", reg.status === 201 && !!reg.data.token);
token = reg.data.token;
const login = await call("/login", "POST", { email, password });
check("Login real", login.status === 200 && !!login.data.token);
const key = crypto.randomUUID(),
  items = [{ product_id: p.id, quantity: 1 }];
const order = await call("/orders", "POST", { items, total: 1 }, true, key);
check(
  "Orden recalcula precio desde BD",
  order.status === 201 && order.data.total === p.price,
);
const retry = await call("/orders", "POST", { items }, true, key);
check(
  "Reintento idempotente conserva orden",
  retry.status === 200 && retry.data.id === order.data.id,
);
check(
  "Clave reutilizada con otro carrito devuelve conflicto",
  (
    await call(
      "/orders",
      "POST",
      { items: [{ product_id: p.id, quantity: 2 }] },
      true,
      key,
    )
  ).status === 409,
);
check(
  "Cantidades fuera de límite rechazadas",
  (
    await call(
      "/orders",
      "POST",
      { items: [{ product_id: p.id, quantity: 999 }] },
      true,
      crypto.randomUUID(),
    )
  ).status === 422,
);
check(
  "Historial contiene la orden",
  (await call("/orders")).data.data.some((o) => o.id === order.data.id),
);
check(
  "Orden propia accesible",
  (await call("/orders/" + order.data.id)).status === 200,
);
const other = await call("/register", "POST", {
  name: "Otra cuenta QA",
  email: "other-" + email,
  password,
  password_confirmation: password,
});
const original = token;
token = other.data.token;
check(
  "Aislamiento entre usuarios",
  (await call("/orders/" + order.data.id)).status === 404,
);
token = original;
check("Logout revoca token", (await call("/logout", "POST")).status === 200);
check("Token revocado rechazado", (await call("/orders")).status === 401);
await mkdir("evidencias", { recursive: true });
await writeFile(
  "evidencias/verificacion-api.json",
  JSON.stringify(
    {
      timestamp: new Date().toISOString(),
      base,
      checks,
      nota: "Pruebas reales de API. No incluye evidencia de pago en Stripe.",
    },
    null,
    2,
  ),
);
