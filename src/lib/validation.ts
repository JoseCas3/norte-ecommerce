import { z } from "zod";
export const credentials = z.object({
  email: z.email("Escribe un correo válido."),
  password: z.string().min(8, "Usa al menos 8 caracteres.").max(128),
});
export const registration = credentials
  .extend({
    name: z.string().trim().min(2, "Escribe tu nombre.").max(100),
    password_confirmation: z.string(),
  })
  .refine((v) => v.password === v.password_confirmation, {
    path: ["password_confirmation"],
    message: "Las contraseñas no coinciden.",
  });
export const cartSchema = z
  .array(
    z.object({
      product_id: z.number().int().positive(),
      quantity: z.number().int().min(1).max(20),
    }),
  )
  .min(1)
  .max(50)
  .refine(
    (items) => new Set(items.map((i) => i.product_id)).size === items.length,
    "Productos duplicados.",
  );
export function checkoutUrl(value: string) {
  const url = new URL(value);
  if (url.protocol !== "https:" || url.hostname !== "checkout.stripe.com")
    throw new Error("La API devolvió una URL de pago no permitida.");
  return url.href;
}
