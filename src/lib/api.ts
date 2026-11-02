import "server-only";
import { cookies } from "next/headers";
import { redirect } from "next/navigation";
export class ApiError extends Error {
  constructor(
    public status: number,
    message: string,
    public fields?: Record<string, string[]>,
  ) {
    super(message);
  }
}
export async function api<T>(
  path: string,
  options: {
    method?: string;
    body?: unknown;
    auth?: boolean;
    key?: string;
    cache?: boolean;
    allowUnauthorized?: boolean;
  } = {},
): Promise<T> {
  const base = process.env.BASE_URL;
  if (!base)
    throw new ApiError(
      503,
      "Configura BASE_URL en .env.local para conectar la API.",
    );
  const token = options.auth
    ? (await cookies()).get("norte_token")?.value
    : undefined;
  if (options.auth && !token) redirect("/login");
  let res: Response;
  try {
    res = await fetch(`${base.replace(/\/$/, "")}${path}`, {
      method: options.method || "GET",
      headers: {
        Accept: "application/json",
        ...(options.body ? { "Content-Type": "application/json" } : {}),
        ...(token ? { Authorization: `Bearer ${token}` } : {}),
        ...(options.key ? { "Idempotency-Key": options.key } : {}),
      },
      body: options.body ? JSON.stringify(options.body) : undefined,
      signal: AbortSignal.timeout(12000),
      ...(options.cache
        ? { next: { revalidate: 60, tags: ["products"] } }
        : { cache: "no-store" }),
    });
  } catch {
    throw new ApiError(
      503,
      "No se pudo conectar con la API. Comprueba que Laravel esté ejecutándose.",
    );
  }
  const data = await res.json().catch(() => null);
  if (!res.ok) {
    if (res.status === 401 && options.auth && !options.allowUnauthorized)
      redirect("/login?expired=1");
    throw new ApiError(
      res.status,
      data?.message || "No se pudo completar la solicitud.",
      data?.errors,
    );
  }
  return data as T;
}
export async function requireUser() {
  return api<{ id: number; name: string; email: string }>("/user", {
    auth: true,
  });
}
