// Tipado manual del esquema de supabase/migrations/*.sql.
// Si en el futuro se usa `supabase gen types typescript`, este archivo se puede reemplazar por el generado.

export type UserRole = "comprador" | "vendedor" | "admin";
export type ProductStatus = "draft" | "active" | "paused";
export type OrderStatus = "pending" | "paid" | "shipped" | "delivered" | "cancelled";

export interface Profile {
  id: string;
  role: UserRole;
  display_name: string;
  bio: string | null;
  avatar_url: string | null;
  rating_avg: number;
  rating_count: number;
  created_at: string;
  // Dirección desde la que el vendedor despacha sus pedidos (null si todavía no la configuró, o si es comprador)
  origin_nombre_contacto: string | null;
  origin_calle: string | null;
  origin_numero: string | null;
  origin_ciudad: string | null;
  origin_provincia: string | null;
  origin_codigo_postal: string | null;
  origin_telefono: string | null;
}

export interface Category {
  id: string;
  slug: string;
  name: string;
}

export interface Franchise {
  id: string;
  slug: string;
  name: string;
}

export interface Size {
  id: string;
  label: string;
  sort_order: number;
}

export interface Product {
  id: string;
  seller_id: string;
  category_id: string;
  franchise_id: string | null;
  slug: string;
  title: string;
  description: string | null;
  price_cents: number;
  status: ProductStatus;
  weight_grams: number;
  length_cm: number;
  width_cm: number;
  height_cm: number;
  created_at: string;
}

export interface ProductSize {
  product_id: string;
  size_id: string;
  stock: number;
}

export interface ProductImage {
  id: string;
  product_id: string;
  storage_path: string;
  position: number;
}

export interface Address {
  id: string;
  user_id: string;
  nombre_completo: string;
  calle: string;
  numero: string;
  ciudad: string;
  provincia: string;
  codigo_postal: string;
  telefono: string;
  created_at: string;
}

export interface CartItem {
  id: string;
  user_id: string;
  product_id: string;
  size_id: string | null;
  quantity: number;
  created_at: string;
}

export interface Order {
  id: string;
  buyer_id: string;
  status: OrderStatus;
  shipping_address_id: string;
  subtotal_cents: number;
  shipping_cents: number;
  total_cents: number;
  envia_shipment_id: string | null;
  created_at: string;
}

export interface OrderItem {
  id: string;
  order_id: string;
  product_id: string;
  seller_id: string;
  size_id: string | null;
  quantity: number;
  unit_price_cents: number;
  commission_cents: number;
}

export interface Rating {
  id: string;
  order_id: string;
  rater_id: string;
  seller_id: string;
  score: number;
  comment: string | null;
  created_at: string;
}
