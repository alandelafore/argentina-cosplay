import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

export const clearDatabase = async () => {
  console.log('🧹 Clearing database...');

  // Delete in order to respect foreign key constraints
  await prisma.productImage.deleteMany();
  await prisma.productAttribute.deleteMany();
  await prisma.productVariant.deleteMany();
  await prisma.favorite.deleteMany();
  await prisma.cartItem.deleteMany();
  await prisma.orderItem.deleteMany();
  await prisma.review.deleteMany();
  await prisma.dispute.deleteMany();
  await prisma.order.deleteMany();
  await prisma.product.deleteMany();
  await prisma.categoryAttribute.deleteMany();
  await prisma.category.deleteMany();
  await prisma.userRole.deleteMany();
  await prisma.user.deleteMany();

  console.log('✅ Database cleared successfully!');
};