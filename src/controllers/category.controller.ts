import { Request, Response } from "express";
import { prisma } from "../config/database";

export async function listCategories(req: Request, res: Response) {
  const categories = await prisma.category.findMany({
    where: { parentId: null },
    include: { children: true, attributes: true },
    orderBy: { name: "asc" },
  });

  return res.json({ data: categories });
}

export async function getCategory(req: Request, res: Response) {
  const { id } = req.params;
  const category = await prisma.category.findUnique({
    where: { id },
    include: { children: true, parent: true, attributes: true },
  });

  if (!category) {
    return res.status(404).json({ message: "Categoría no encontrada" });
  }

  return res.json(category);
}

export async function createCategory(req: Request, res: Response) {
  const { name, slug, parentId, attributes } = req.body;

  const category = await prisma.category.create({
    data: {
      name,
      slug,
      parentId: parentId || null,
      attributes: {
        create: (attributes || []).map((attr: any) => ({
          name: attr.name,
          type: attr.type || "string",
          required: attr.required || false,
          options: attr.options || [],
        })),
      },
    },
  });

  return res.status(201).json(category);
}
