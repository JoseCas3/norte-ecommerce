import { test } from "node:test";
import assert from "node:assert/strict";
import {
  credentials,
  registration,
  cartSchema,
  checkoutUrl,
} from "../src/lib/validation.ts";
test("rechaza carritos vacíos, duplicados, negativos y cantidades fuera del límite", () => {
  for (const items of [
    [],
    [{ product_id: 1, quantity: 0 }],
    [{ product_id: 1, quantity: 21 }],
    [{ product_id: -1, quantity: 1 }],
    [
      { product_id: 1, quantity: 1 },
      { product_id: 1, quantity: 1 },
    ],
  ])
    assert.equal(cartSchema.safeParse(items).success, false);
  assert.equal(
    cartSchema.safeParse([{ product_id: 1, quantity: 2 }]).success,
    true,
  );
});
test("valida credenciales y confirmación de contraseña", () => {
  assert.equal(
    credentials.safeParse({ email: "inválido", password: "123" }).success,
    false,
  );
  assert.equal(
    registration.safeParse({
      name: "Ana",
      email: "ana@example.com",
      password: "password123",
      password_confirmation: "distinta",
    }).success,
    false,
  );
});
test("solo permite redirecciones al Checkout HTTPS oficial de Stripe", () => {
  assert.equal(
    checkoutUrl("https://checkout.stripe.com/c/pay/test"),
    "https://checkout.stripe.com/c/pay/test",
  );
  for (const url of [
    "http://checkout.stripe.com/test",
    "https://checkout.stripe.com.evil.test",
    "javascript:alert(1)",
    "https://evil.test",
  ])
    assert.throws(() => checkoutUrl(url));
});
