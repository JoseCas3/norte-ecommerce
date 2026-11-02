export type Product = {
  id: number;
  name: string;
  description: string;
  category: string;
  price: number;
  stock: number;
  color: string;
  icon: string;
};
export type CartItem = { product: Product; quantity: number };
export type Order = {
  id: number;
  status: "pending" | "paid" | "cancelled";
  total: number;
  created_at: string;
  items: {
    product_id: number;
    name: string;
    quantity: number;
    unit_price: number;
  }[];
};
export type ActionState = { error?: string; fields?: Record<string, string[]> };
export const money = (cents: number) =>
  new Intl.NumberFormat("es-GT", { style: "currency", currency: "USD" }).format(
    cents / 100,
  );
