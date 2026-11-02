"use server";
import { cookies } from "next/headers";
import { redirect } from "next/navigation";
import { revalidatePath } from "next/cache";
import { api, ApiError, requireUser } from "@/lib/api";
import {
  credentials,
  registration,
  cartSchema,
  checkoutUrl,
} from "@/lib/validation";
import type { ActionState, Order } from "@/lib/types";

export async function authenticate(
  kind: "login" | "register",
  _prev: ActionState,
  form: FormData,
): Promise<ActionState> {
  const parsed = (kind === "register" ? registration : credentials).safeParse(
    Object.fromEntries(form),
  );
  if (!parsed.success) return { error: parsed.error.issues[0].message };
  let token: string;
  try {
    const result = await api<{ token: string }>(`/${kind}`, {
      method: "POST",
      body: parsed.data,
    });
    token = result.token;
    if (!token) return { error: "La API no devolvió un token válido." };
  } catch (e) {
    if (e instanceof ApiError) return { error: e.message, fields: e.fields };
    throw e;
  }
  (await cookies()).set("norte_token", token, {
    httpOnly: true,
    secure: process.env.NODE_ENV === "production",
    sameSite: "lax",
    path: "/",
    maxAge: 60 * 60 * 8,
  });
  revalidatePath("/", "layout");
  redirect("/checkout");
}
export async function logout() {
  try {
    await api("/logout", {
      method: "POST",
      auth: true,
      allowUnauthorized: true,
    });
  } catch (e) {
    if (!(e instanceof ApiError)) throw e;
  }
  (await cookies()).delete("norte_token");
  revalidatePath("/", "layout");
  redirect("/login");
}
export async function pay(
  _prev: ActionState,
  form: FormData,
): Promise<ActionState> {
  await requireUser();
  let url: string;
  try {
    const raw = JSON.parse(String(form.get("items")));
    const items = cartSchema.parse(raw);
    const key = String(form.get("key"));
    if (!/^[a-zA-Z0-9-]{20,80}$/.test(key))
      return { error: "Actualiza la página e inténtalo de nuevo." };
    const order = await api<Order>("/orders", {
      method: "POST",
      body: { items },
      auth: true,
      key,
    });
    const session = await api<{ url: string }>(`/orders/${order.id}/checkout`, {
      method: "POST",
      auth: true,
    });
    url = checkoutUrl(session.url);
  } catch (e) {
    if (e instanceof ApiError) return { error: e.message, fields: e.fields };
    if (e instanceof Error && e.message.startsWith("NEXT_REDIRECT")) throw e;
    return {
      error:
        "No se pudo iniciar el pago. Revisa tu carrito e inténtalo de nuevo.",
    };
  }
  revalidatePath("/historial");
  revalidatePath("/catalogo");
  redirect(url);
}
export async function resumePayment(
  _prev: ActionState,
  form: FormData,
): Promise<ActionState> {
  await requireUser();
  let url: string;
  try {
    const id = Number(form.get("order"));
    if (!Number.isSafeInteger(id) || id < 1)
      return { error: "Orden inválida." };
    const result = await api<{ url: string }>(`/orders/${id}/checkout`, {
      method: "POST",
      auth: true,
    });
    url = checkoutUrl(result.url);
  } catch (e) {
    if (e instanceof ApiError) return { error: e.message };
    throw e;
  }
  revalidatePath("/historial");
  redirect(url);
}
export async function refreshOrders() {
  await requireUser();
  revalidatePath("/historial");
  revalidatePath("/confirmacion");
  revalidatePath("/catalogo");
}
