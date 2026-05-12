import { Request, Response } from "express";
import { prisma } from "../config/database";

export async function openDispute(req: Request, res: Response) {
  const buyerId = req.user?.id as string;
  const { orderId, reason, evidence = [] } = req.body;

  const order = await prisma.order.findUnique({ where: { id: orderId } });
  if (!order || order.buyerId !== buyerId) {
    return res.status(404).json({ message: "Orden no encontrada o no autorizada" });
  }

  const dispute = await prisma.dispute.create({
    data: {
      buyerId,
      sellerId: order.sellerId,
      orderId,
      reason,
      evidence,
    },
  });

  return res.status(201).json(dispute);
}

export async function listDisputes(req: Request, res: Response) {
  const userId = req.user?.id as string;
  const isAdmin = req.user?.roles.includes("ADMIN");

  const disputes = await prisma.dispute.findMany({
    where: isAdmin ? {} : { OR: [{ buyerId: userId }, { sellerId: userId }] },
    orderBy: { createdAt: "desc" },
  });

  return res.json({ data: disputes });
}

export async function resolveDispute(req: Request, res: Response) {
  const { id } = req.params;
  const { status } = req.body;

  const dispute = await prisma.dispute.update({
    where: { id },
    data: { status },
  });

  return res.json(dispute);
}
