import { Request, Response } from "express";
import { prisma } from "../config/database";

export async function getCart(req: Request, res: Response) {
  const userId = req.user?.id as string;

  const cart = await prisma.cart.findUnique({
    where: { userId },
    include: {
      items: {
        include: {
          product: { include: { images: true, seller: true } },
          variant: true,
        },
      },
    },
  });

  return res.json({ data: cart || { items: [] } });
}

export async function addCartItem(req: Request, res: Response) {
  const userId = req.user?.id as string;
  const { productId, variantId, quantity = 1 } = req.body;

  const product = await prisma.product.findUnique({
    where: { id: productId },
    include: { variants: true },
  });

  if (!product || product.status !== "ACTIVE") {
    return res.status(404).json({ message: "Producto no disponible" });
  }

  const variant = variantId ? product.variants.find((item) => item.id === variantId) : null;
  const unitPrice = variant?.price ?? product.price;

  let cart = await prisma.cart.findUnique({
    where: { userId },
    include: { items: true },
  });

  if (cart && cart.sellerId !== product.sellerId) {
    return res.status(400).json({ message: "El carrito solo puede contener productos del mismo vendedor" });
  }

  if (!cart) {
    cart = await prisma.cart.create({
      data: { userId, sellerId: product.sellerId },
      include: { items: true },
    });
  }

  const existingItem = await prisma.cartItem.findFirst({
    where: { cartId: cart.id, productId, variantId: variant?.id },
  });

  if (existingItem) {
    await prisma.cartItem.update({
      where: { id: existingItem.id },
      data: { quantity: existingItem.quantity + Number(quantity) },
    });
  } else {
    await prisma.cartItem.create({
      data: {
        cartId: cart.id,
        productId,
        variantId: variant?.id,
        quantity: Number(quantity),
        unitPrice,
      },
    });
  }

  const updatedCart = await prisma.cart.findUnique({
    where: { userId },
    include: {
      items: {
        include: { product: { include: { images: true } }, variant: true },
      },
    },
  });

  return res.json({ data: updatedCart });
}

export async function removeCartItem(req: Request, res: Response) {
  const userId = req.user?.id as string;
  const { itemId } = req.params;

  const cart = await prisma.cart.findUnique({ where: { userId } });
  if (!cart) {
    return res.status(404).json({ message: "Carrito no encontrado" });
  }

  await prisma.cartItem.deleteMany({ where: { id: itemId, cartId: cart.id } });

  const updatedCart = await prisma.cart.findUnique({
    where: { userId },
    include: {
      items: {
        include: { product: { include: { images: true } }, variant: true },
      },
    },
  });

  return res.json({ data: updatedCart });
}

export async function clearCart(req: Request, res: Response) {
  const userId = req.user?.id as string;

  const cart = await prisma.cart.findUnique({ where: { userId } });
  if (!cart) {
    return res.status(404).json({ message: "Carrito no encontrado" });
  }

  await prisma.cartItem.deleteMany({ where: { cartId: cart.id } });
  await prisma.cart.delete({ where: { id: cart.id } });

  return res.json({ message: "Carrito vacío" });
}
