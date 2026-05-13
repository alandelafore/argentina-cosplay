import { Request } from "express";
import bcrypt from "bcrypt";
import jwt from "jsonwebtoken";
import { prisma } from "../config/database";
import { GraphQLContext } from "./context";

const JWT_SECRET = process.env.JWT_SECRET || "secret";
const JWT_REFRESH_SECRET = process.env.JWT_REFRESH_SECRET || "refreshsecret";
const ACCESS_TOKEN_EXPIRES_IN = process.env.ACCESS_TOKEN_EXPIRES_IN || "15m";
const REFRESH_TOKEN_EXPIRES_IN = process.env.REFRESH_TOKEN_EXPIRES_IN || "7d";
const PLATFORM_COMMISSION = Number(process.env.PLATFORM_COMMISSION || 0.1);

function signAccessToken(userId: string, roles: string[]) {
  return jwt.sign({ sub: userId, roles }, JWT_SECRET, { expiresIn: ACCESS_TOKEN_EXPIRES_IN });
}

function signRefreshToken(userId: string, roles: string[]) {
  return jwt.sign({ sub: userId, roles }, JWT_REFRESH_SECRET, { expiresIn: REFRESH_TOKEN_EXPIRES_IN });
}

export const resolvers = {
  Query: {
    me: async (_: unknown, __: unknown, context: GraphQLContext) => {
      if (!context.user) {
        return null;
      }
      return prisma.user.findUnique({ where: { id: context.user.id }, include: { roles: true } });
    },

    product: async (_: unknown, { id }: { id: string }) => {
      return prisma.product.findUnique({
        where: { id },
        include: {
          images: true,
          variants: true,
          attributes: { include: { attributeDefinition: true } },
          seller: { include: { roles: true } },
          category: true,
        },
      });
    },

    products: async (_: unknown, args: any) => {
      const { filter, page = 1, pageSize = 20 } = args;
      const where: any = { status: "ACTIVE" };

      if (filter?.categoryId) {
        where.categoryId = filter.categoryId;
      }
      if (filter?.condition) {
        where.condition = filter.condition;
      }
      if (filter?.minPrice || filter?.maxPrice) {
        where.price = {};
        if (filter.minPrice) where.price.gte = filter.minPrice;
        if (filter.maxPrice) where.price.lte = filter.maxPrice;
      }
      if (filter?.search) {
        where.OR = [
          { title: { contains: filter.search, mode: "insensitive" } },
          { description: { contains: filter.search, mode: "insensitive" } },
          { tags: { has: filter.search } },
        ];
      }
      if (filter?.attributes) {
        where.AND = filter.attributes.map((attribute: any) => {
          const condition: any = { attributes: { some: {} } };
          if (attribute.definitionId) {
            condition.attributes.some.attributeDefinitionId = attribute.definitionId;
          }
          if (attribute.name) {
            condition.attributes.some.attributeDefinition = { name: attribute.name };
          }
          condition.attributes.some.value = attribute.value;
          return condition;
        });
      }

      const products = await prisma.product.findMany({
        where,
        include: {
          images: true,
          seller: { select: { id: true, name: true } },
          category: true,
        },
        skip: (page - 1) * pageSize,
        take: pageSize,
        orderBy: { createdAt: "desc" },
      });

      return { data: products, page, pageSize };
    },

    categories: async () => {
      return prisma.category.findMany({
        where: { parentId: null },
        include: { children: true, attributes: true },
      });
    },

    category: async (_: unknown, { id }: { id: string }) => {
      return prisma.category.findUnique({
        where: { id },
        include: { children: true, parent: true, attributes: true },
      });
    },

    order: async (_: unknown, { id }: { id: string }, context: GraphQLContext) => {
      if (!context.user) {
        throw new Error("No autorizado");
      }

      return prisma.order.findFirst({
        where: {
          id,
          OR: [{ buyerId: context.user.id }, { sellerId: context.user.id }],
        },
        include: {
          items: { include: { product: true, variant: true } },
          payment: true,
          shipping: true,
        },
      });
    },

    cart: async (_: unknown, __: unknown, context: GraphQLContext) => {
      if (!context.user) {
        throw new Error("No autorizado");
      }

      return prisma.cart.findUnique({
        where: { userId: context.user.id },
        include: {
          items: {
            include: {
              product: {
                include: {
                  images: true,
                  category: true,
                  seller: { select: { id: true, name: true } },
                },
              },
              variant: true,
            },
          },
        },
      });
    },
  },

  User: {
    roles: (parent: any) => {
      return parent.roles?.map((roleEntry: any) => roleEntry.role) || [];
    },
  },

  Mutation: {
    register: async (_: unknown, { input }: any) => {
      const hashed = await bcrypt.hash(input.password, 10);
      const roles = input.roles?.length ? input.roles : ["COMPRADOR"];

      const user = await prisma.user.create({
        data: {
          email: input.email,
          password: hashed,
          name: input.name,
          phone: input.phone,
          cuit: input.cuit,
          roles: { create: roles.map((role: string) => ({ role })) },
        },
        include: { roles: true },
      });

      return {
        accessToken: signAccessToken(user.id, roles),
        refreshToken: signRefreshToken(user.id, roles),
        user,
      };
    },

    login: async (_: unknown, { email, password }: { email: string; password: string }) => {
      const user = await prisma.user.findUnique({ where: { email }, include: { roles: true } });
      if (!user) {
        throw new Error("Credenciales inválidas");
      }
      if (user.isSuspended) {
        throw new Error("Cuenta suspendida");
      }
      const valid = await bcrypt.compare(password, user.password);
      if (!valid) {
        throw new Error("Credenciales inválidas");
      }
      const roles = user.roles.map((entry) => entry.role);
      return {
        accessToken: signAccessToken(user.id, roles),
        refreshToken: signRefreshToken(user.id, roles),
        user,
      };
    },

    updateProfile: async (_: unknown, { input }: any, context: GraphQLContext) => {
      if (!context.user) {
        throw new Error("No autorizado");
      }

      const { name, phone, cuit } = input;
      return prisma.user.update({
        where: { id: context.user.id },
        data: {
          name: name ?? undefined,
          phone: phone ?? undefined,
          cuit: cuit ?? undefined,
        },
        include: { roles: true },
      });
    },

    createProduct: async (_: unknown, { input }: any, context: GraphQLContext) => {
      if (!context.user) {
        throw new Error("No autorizado");
      }
      return prisma.product.create({
        data: {
          title: input.title,
          description: input.description,
          price: input.price,
          categoryId: input.categoryId,
          condition: input.condition,
          stock: input.stock,
          sellerId: context.user.id,
          tags: input.tags || [],
          images: {
            create: (input.images || []).slice(0, 6).map((url: string, index: number) => ({ url, position: index })),
          },
          attributes: {
            create: (input.attributes || []).map((attribute: any) => ({
              attributeDefinitionId: attribute.definitionId,
              value: attribute.value,
            })),
          },
          variants: {
            create: (input.variants || []).map((variant: any) => ({
              sku: variant.sku,
              size: variant.size,
              color: variant.color,
              stock: variant.stock,
              price: variant.price,
            })),
          },
        },
      });
    },

    createCategory: async (_: unknown, { input }: any) => {
      return prisma.category.create({
        data: {
          name: input.name,
          slug: input.slug,
          parentId: input.parentId || null,
          attributes: {
            create: (input.attributes || []).map((attribute: any) => ({
              name: attribute.name,
              type: attribute.type,
              required: attribute.required || false,
              options: attribute.options || [],
            })),
          },
        },
      });
    },

    addCartItem: async (_: unknown, { input }: any, context: GraphQLContext) => {
      if (!context.user) {
        throw new Error("No autorizado");
      }

      const product = await prisma.product.findUnique({ where: { id: input.productId }, include: { variants: true } });
      if (!product || product.status !== "ACTIVE") {
        throw new Error("Producto no disponible");
      }

      const variant = input.variantId ? product.variants.find((item) => item.id === input.variantId) : null;
      const unitPrice = variant?.price ?? product.price;

      let cart = await prisma.cart.findUnique({ where: { userId: context.user.id }, include: { items: true } });
      if (cart && cart.sellerId !== product.sellerId) {
        throw new Error("El carrito solo puede contener productos del mismo vendedor");
      }
      if (!cart) {
        cart = await prisma.cart.create({ data: { userId: context.user.id, sellerId: product.sellerId }, include: { items: true } });
      }
      const existingItem = await prisma.cartItem.findFirst({ where: { cartId: cart.id, productId: input.productId, variantId: variant?.id } });
      if (existingItem) {
        await prisma.cartItem.update({ where: { id: existingItem.id }, data: { quantity: existingItem.quantity + input.quantity } });
      } else {
        await prisma.cartItem.create({ data: { cartId: cart.id, productId: input.productId, variantId: variant?.id, quantity: input.quantity, unitPrice } });
      }

      return prisma.cart.findUnique({
        where: { userId: context.user.id },
        include: {
          items: {
            include: { product: { include: { images: true } }, variant: true },
          },
        },
      });
    },

    removeCartItem: async (_: unknown, { itemId }: { itemId: string }, context: GraphQLContext) => {
      if (!context.user) {
        throw new Error("No autorizado");
      }

      const cart = await prisma.cart.findUnique({ where: { userId: context.user.id } });
      if (!cart) {
        throw new Error("Carrito no encontrado");
      }

      await prisma.cartItem.deleteMany({ where: { id: itemId, cartId: cart.id } });

      return prisma.cart.findUnique({
        where: { userId: context.user.id },
        include: {
          items: {
            include: {
              product: {
                include: {
                  images: true,
                  category: true,
                  seller: { select: { id: true, name: true } },
                },
              },
              variant: true,
            },
          },
        },
      });
    },

    createOrder: async (_: unknown, __: unknown, context: GraphQLContext) => {
      if (!context.user) {
        throw new Error("No autorizado");
      }

      const cart = await prisma.cart.findUnique({ where: { userId: context.user.id }, include: { items: { include: { product: true, variant: true } } } });
      if (!cart || cart.items.length === 0) {
        throw new Error("El carrito está vacío");
      }

      const totalAmount = cart.items.reduce((sum, item) => sum + item.unitPrice * item.quantity, 0);
      const commission = Number((totalAmount * PLATFORM_COMMISSION).toFixed(2));

      const order = await prisma.order.create({
        data: {
          buyerId: context.user.id,
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
          statusHistory: { create: { fromStatus: "PENDIENTE", toStatus: "PENDIENTE", note: "Orden creada" } },
        },
        include: { items: { include: { product: true, variant: true } }, statusHistory: true },
      });

      await prisma.cartItem.deleteMany({ where: { cartId: cart.id } });
      await prisma.cart.delete({ where: { id: cart.id } });

      return order;
    },
  },
};
