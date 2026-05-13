import { Request, Response } from "express";
import { prisma } from "../config/database";
// import { analyticsQueue, searchLogQueue } from "../config/queue";

export async function listProducts(req: Request, res: Response) {
  const { categoryId, minPrice, maxPrice, condition, search, page = 1, pageSize = 20, attributeFilters } = req.query;
  const filters: any = { status: "ACTIVE" };

  if (categoryId) {
    filters.categoryId = categoryId;
  }
  if (condition) {
    filters.condition = condition;
  }
  if (minPrice || maxPrice) {
    filters.price = {};
    if (minPrice) filters.price.gte = Number(minPrice);
    if (maxPrice) filters.price.lte = Number(maxPrice);
  }

  const where: any = { ...filters };

  if (search) {
    where.OR = [
      { title: { contains: String(search), mode: "insensitive" } },
      { description: { contains: String(search), mode: "insensitive" } },
      { tags: { has: String(search) } },
    ];
  }

  if (attributeFilters) {
    try {
      const parsedFilters = JSON.parse(String(attributeFilters));
      if (Array.isArray(parsedFilters) && parsedFilters.length) {
        where.AND = parsedFilters.map((filter: any) => {
          if (filter.definitionId) {
            return {
              attributes: {
                some: {
                  attributeDefinitionId: filter.definitionId,
                  value: filter.value,
                },
              },
            };
          }

          if (filter.name) {
            return {
              attributes: {
                some: {
                  attributeDefinition: { name: filter.name },
                  value: filter.value,
                },
              },
            };
          }

          return {
            attributes: { some: { value: filter.value } },
          };
        });
      }
    } catch (error) {
      return res.status(400).json({ message: "attributeFilters debe ser un JSON válido" });
    }
  }

  const products = await prisma.product.findMany({
    where,
    include: {
      images: true,
      seller: { select: { id: true, name: true } },
      attributes: { include: { attributeDefinition: true } },
      variants: true,
    },
    skip: (Number(page) - 1) * Number(pageSize),
    take: Number(pageSize),
    orderBy: { createdAt: "desc" },
  });

  // await searchLogQueue.add("logSearch", {
  //   query: search || "",
  //   filters: { categoryId, minPrice, maxPrice, condition, attributeFilters },
  //   results: products.length,
  //   userId: req.user?.id,
  //   ip: req.ip,
  //   timestamp: new Date(),
  // });

  return res.json({ data: products, page: Number(page), pageSize: Number(pageSize) });
}

export async function getProduct(req: Request, res: Response) {
  const { id } = req.params;
  const product = await prisma.product.findUnique({
    where: { id },
    include: {
      images: true,
      variants: true,
      attributes: { include: { attributeDefinition: true } },
      seller: { select: { id: true, name: true } },
    },
  });

  if (!product) {
    return res.status(404).json({ message: "Producto no encontrado" });
  }

  // await analyticsQueue.add("productView", {
  //   productId: id,
  //   userId: req.user?.id,
  //   ip: req.ip,
  //   userAgent: req.headers["user-agent"] || "",
  //   createdAt: new Date(),
  // });

  return res.json(product);
}

export async function createProduct(req: Request, res: Response) {
  const { title, description, price, categoryId, condition, stock, tags, attributes, variants, images } = req.body;
  const sellerId = req.user?.id;

  if (!sellerId) {
    return res.status(401).json({ message: "No autorizado" });
  }

  const product = await prisma.product.create({
    data: {
      sellerId,
      categoryId,
      title,
      description,
      price: Number(price),
      condition,
      stock: Number(stock) || 0,
      tags: tags || [],
      images: {
        create: (images || []).slice(0, 6).map((url: string, index: number) => ({ url, position: index })),
      },
      attributes: {
        create: (attributes || []).map((attribute: any) => ({
          attributeDefinitionId: attribute.definitionId,
          value: attribute.value,
        })),
      },
      variants: {
        create: (variants || []).map((variant: any) => ({
          sku: variant.sku,
          size: variant.size,
          color: variant.color,
          stock: variant.stock,
          price: variant.price,
        })),
      },
    },
  });

  return res.status(201).json(product);
}
