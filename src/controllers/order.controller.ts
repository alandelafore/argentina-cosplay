import { Request, Response } from "express";
import { prisma } from "../config/database";

const PLATFORM_COMMISSION = Number(process.env.PLATFORM_COMMISSION || 0.1);

export async function createOrder(req: Request, res: Response) {
  const buyerId = req.user?.id as string;

  const cart = await prisma.cart.findUnique({
    where: { userId: buyerId },
    include: {
      items: {
        include: { product: true, variant: true },
      },
    },
  });

  if (!cart || cart.items.length === 0) {
    return res.status(400).json({ message: "El carrito está vacío" });
  }

  const totalAmount = cart.items.reduce((sum, item) => sum + item.unitPrice * item.quantity, 0);
  const commission = Number((totalAmount * PLATFORM_COMMISSION).toFixed(2));

  const order = await prisma.order.create({
    data: {
      buyerId,
      sellerId: cart.sellerId,
      totalAmount,
      commission,
      items: {
        create: cart.items.map((item) => ({
          productId: item.productId,
          variantId: item.variantId,
          quantity: item.quantity,
          unitPrice: item.unitPrice,
        })),
      },
      statusHistory: {
        create: {
          fromStatus: "PENDIENTE",
          toStatus: "PENDIENTE",
          note: "Orden creada",
        },
      },
    },
    include: {
      items: { include: { product: true, variant: true } },
      statusHistory: true,
    },
  });

  await prisma.cartItem.deleteMany({ where: { cartId: cart.id } });
  await prisma.cart.delete({ where: { id: cart.id } });

  return res.status(201).json(order);
}

export async function getOrder(req: Request, res: Response) {
  const userId = req.user?.id as string;
  const { id } = req.params;

  const order = await prisma.order.findUnique({
    where: { id },
    include: {
      items: { include: { product: true, variant: true } },
      payment: true,
      shipping: { include: { updates: true } },
      statusHistory: true,
    },
  });

  if (!order || (order.buyerId !== userId && order.sellerId !== userId && !req.user?.roles.includes("ADMIN"))) {
    return res.status(404).json({ message: "Orden no encontrada" });
  }

  return res.json(order);
}

export async function listOrders(req: Request, res: Response) {
  const userId = req.user?.id as string;
  const { role } = req.query;

  const where: any = {};
  if (role === "seller") {
    where.sellerId = userId;
  } else if (role === "admin") {
    // admin puede ver todas las órdenes
  } else {
    where.buyerId = userId;
  }

  const orders = await prisma.order.findMany({
    where,
    include: {
      items: { include: { product: true, variant: true } },
      payment: true,
      shipping: true,
    },
    orderBy: { createdAt: "desc" },
  });

  return res.json({ data: orders });
}

export async function updateOrderStatus(req: Request, res: Response) {
  const { id } = req.params;
  const { status, note } = req.body;

  const order = await prisma.order.findUnique({ where: { id } });
  if (!order) {
    return res.status(404).json({ message: "Orden no encontrada" });
  }

  const updatedOrder = await prisma.order.update({
    where: { id },
    data: {
      status,
      statusHistory: {
        create: {
          fromStatus: order.status,
          toStatus: status,
          note,
        },
      },
    },
  });

  return res.json(updatedOrder);
}
