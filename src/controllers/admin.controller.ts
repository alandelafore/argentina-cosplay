import { Request, Response } from "express";
import { prisma } from "../config/database";

export async function suspendUser(req: Request, res: Response) {
  const { id } = req.params;
  const { suspended } = req.body;

  const user = await prisma.user.update({
    where: { id },
    data: { isSuspended: Boolean(suspended) },
  });

  return res.json({ message: `Usuario ${suspended ? "suspendido" : "reactivado"}`, user });
}

export async function updateProductStatus(req: Request, res: Response) {
  const { id } = req.params;
  const { status } = req.body;

  const product = await prisma.product.update({
    where: { id },
    data: { status },
  });

  return res.json(product);
}
