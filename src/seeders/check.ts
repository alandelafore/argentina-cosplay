import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

async function checkSeededData() {
  console.log('🔍 Checking seeded data...\n');

  // Check users
  const userCount = await prisma.user.count();
  console.log(`👥 Users: ${userCount}`);

  const users = await prisma.user.findMany({
    select: { email: true, name: true, roles: { select: { role: true } } },
    take: 3,
  });
  users.forEach(user => {
    console.log(`   - ${user.name} (${user.email}) - Roles: ${user.roles.map(r => r.role).join(', ')}`);
  });

  // Check categories
  const categoryCount = await prisma.category.count();
  console.log(`\n📂 Categories: ${categoryCount}`);

  const categories = await prisma.category.findMany({
    select: { name: true, _count: { select: { children: true } } },
    take: 6,
  });
  categories.forEach(cat => {
    console.log(`   - ${cat.name} (${cat._count.children} subcategorías)`);
  });

  // Check products
  const productCount = await prisma.product.count();
  console.log(`\n🛍️ Products: ${productCount}`);

  const products = await prisma.product.findMany({
    select: {
      title: true,
      price: true,
      condition: true,
      stock: true,
      seller: { select: { name: true } },
      category: { select: { name: true } },
      _count: { select: { images: true } }
    },
    take: 5,
  });
  products.forEach(product => {
    console.log(`   - ${product.title}`);
    console.log(`     💰 $${product.price} | 📦 ${product.stock} | ${product.condition}`);
    console.log(`     👤 ${product.seller.name} | 📂 ${product.category.name} | 🖼️ ${product._count.images} imágenes`);
  });

  await prisma.$disconnect();
  console.log('\n✅ Data check completed!');
}

checkSeededData();