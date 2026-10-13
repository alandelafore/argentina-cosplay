import { NextResponse } from "next/server";
import { createClient } from "@/lib/supabase/server";

const ENVIA_BASE_URL = process.env.ENVIA_API_BASE_URL ?? "https://api-test.envia.com";

type CartProduct = {
  weight_grams: number;
  length_cm: number;
  width_cm: number;
  height_cm: number;
  price_cents: number;
  seller_id: string;
  profiles: {
    display_name: string;
    origin_nombre_contacto: string | null;
    origin_calle: string | null;
    origin_numero: string | null;
    origin_ciudad: string | null;
    origin_provincia: string | null;
    origin_codigo_postal: string | null;
    origin_telefono: string | null;
  } | null;
};

export async function POST(request: Request) {
  const { addressId } = await request.json();
  if (!addressId) {
    return NextResponse.json({ error: "Falta addressId" }, { status: 400 });
  }

  const supabase = await createClient();
  const { data: userData } = await supabase.auth.getUser();
  if (!userData.user) {
    return NextResponse.json({ error: "No autenticado" }, { status: 401 });
  }

  const [{ data: address }, { data: cartItems }] = await Promise.all([
    supabase.from("addresses").select("*").eq("id", addressId).eq("user_id", userData.user.id).single(),
    supabase
      .from("cart_items")
      .select(
        "quantity, products(weight_grams, length_cm, width_cm, height_cm, price_cents, seller_id, profiles(display_name, origin_nombre_contacto, origin_calle, origin_numero, origin_ciudad, origin_provincia, origin_codigo_postal, origin_telefono))",
      )
      .eq("user_id", userData.user.id),
  ]);

  if (!address) {
    return NextResponse.json({ error: "Dirección no encontrada" }, { status: 404 });
  }
  if (!cartItems || cartItems.length === 0) {
    return NextResponse.json({ error: "El carrito está vacío" }, { status: 400 });
  }

  // El carrito puede traer productos de más de un vendedor: cada vendedor despacha
  // desde su propio domicilio, así que se cotiza un paquete por vendedor y se suman.
  const bySeller = new Map<string, { product: CartProduct; quantity: number }[]>();
  for (const item of cartItems) {
    const product = item.products as unknown as CartProduct | null;
    if (!product) continue;
    const group = bySeller.get(product.seller_id) ?? [];
    group.push({ product, quantity: item.quantity });
    bySeller.set(product.seller_id, group);
  }

  const destination = {
    name: address.nombre_completo,
    phone: address.telefono,
    street: `${address.calle} ${address.numero}`,
    city: address.ciudad,
    state: address.provincia,
    country: "AR",
    postalCode: address.codigo_postal,
  };

  const breakdown = await Promise.all(
    Array.from(bySeller.entries()).map(async ([sellerId, items]) => {
      const seller = items[0].product.profiles;
      const sellerName = seller?.display_name ?? "Vendedor";

      if (
        !seller ||
        !seller.origin_calle ||
        !seller.origin_numero ||
        !seller.origin_ciudad ||
        !seller.origin_provincia ||
        !seller.origin_codigo_postal ||
        !seller.origin_telefono
      ) {
        return { sellerId, sellerName, error: "El vendedor todavía no configuró su dirección de origen." };
      }

      let totalWeightGrams = 0;
      let declaredValueCents = 0;
      let maxLength = 20;
      let maxWidth = 20;
      let maxHeight = 10;

      for (const { product, quantity } of items) {
        totalWeightGrams += product.weight_grams * quantity;
        declaredValueCents += product.price_cents * quantity;
        maxLength = Math.max(maxLength, product.length_cm);
        maxWidth = Math.max(maxWidth, product.width_cm);
        maxHeight = Math.max(maxHeight, product.height_cm);
      }

      const envResponse = await fetch(`${ENVIA_BASE_URL}/ship/rate/`, {
        method: "POST",
        headers: {
          Authorization: `Bearer ${process.env.ENVIA_API_TOKEN}`,
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          origin: {
            name: seller.origin_nombre_contacto,
            phone: seller.origin_telefono,
            street: `${seller.origin_calle} ${seller.origin_numero}`,
            city: seller.origin_ciudad,
            state: seller.origin_provincia,
            country: "AR",
            postalCode: seller.origin_codigo_postal,
          },
          destination,
          packages: [
            {
              type: "box",
              content: "Cosplay / props",
              amount: 1,
              declaredValue: declaredValueCents / 100,
              weight: Math.max(totalWeightGrams / 1000, 0.1),
              weightUnit: "KG",
              lengthUnit: "CM",
              dimensions: { length: maxLength, width: maxWidth, height: maxHeight },
            },
          ],
        }),
      });

      if (!envResponse.ok) {
        const detail = await envResponse.text();
        return { sellerId, sellerName, error: "No se pudo cotizar este envío", detail };
      }

      const rates = await envResponse.json();
      const cheapest = Array.isArray(rates) ? rates[0] : rates?.data?.[0];
      if (!cheapest) {
        return { sellerId, sellerName, error: "El transportista no devolvió tarifas para esta dirección." };
      }

      return { sellerId, sellerName, totalPriceCents: Math.round(cheapest.totalPrice * 100), rate: cheapest };
    }),
  );

  const hasError = breakdown.some((b) => "error" in b);
  const totalShippingCents = breakdown.reduce((sum, b) => sum + (b.totalPriceCents ?? 0), 0);

  return NextResponse.json({ breakdown, totalShippingCents, hasError });
}
