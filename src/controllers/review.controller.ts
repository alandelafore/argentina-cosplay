import { Request, Response } from "express";
import { prisma } from "../config/database";

export async function createReview(req: Request, res: Response) {
  const buyerId = req.user?.id as string;
  const { orderId, productId, rating, comment, photos } = req.body;

  const order = await prisma.order.findUnique({
    where: { id: orderId },
    include: { items: true },
  });

  if (!order || order.buyerId !== buyerId) {
    return res.status(404).json({ message: "Orden no encontrada o no autorizada" });
  }

  if (order.status !== "ENTREGADO") {
    return res.status(400).json({ message: "Solo se puede valorar un producto luego de la entrega" });
  }

  const item = order.items.find((item) => item.productId === productId);
  if (!item) {
    return res.status(400).json({ message: "El producto no pertenece a esta orden" });
  }

  const review = await prisma.review.create({
    data: {
      productId,
      buyerId,
      rating: Number(rating),
      comment,
      photos: photos || [],
      deliveredAt: new Date(),
    },
  });

  return res.status(201).json(review);
}
