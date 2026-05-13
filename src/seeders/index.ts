import { PrismaClient } from '@prisma/client';
import { clearDatabase } from './clear.seeder';
import { seedUsers } from './users.seeder';
import { seedCategories } from './categories.seeder';
import { seedProducts } from './products.seeder';

const prisma = new PrismaClient();

async function main() {
  const shouldClear = process.argv.includes('--clear');

  console.log('🚀 Starting database seeding...');

  try {
    if (shouldClear) {
      await clearDatabase();
    }

    // Seed in order to respect foreign key constraints
    await seedUsers();
    await seedCategories();
    await seedProducts();

    console.log('🎊 All seeders completed successfully!');
    console.log('');
    console.log('📋 Dummy Data Summary:');
    console.log('👥 6 Users created (1 admin, 2 sellers, 3 buyers)');
    console.log('📂 6 Main categories with subcategories');
    console.log('🛍️  10 Products with images');
    console.log('');
    console.log('🔐 Test Accounts:');
    console.log('   Admin: admin@cosplay.com / password123');
    console.log('   Seller: vendedor1@cosplay.com / password123');
    console.log('   Buyer: comprador1@cosplay.com / password123');
  } catch (error) {
    console.error('❌ Error during seeding:', error);
    process.exit(1);
  } finally {
    await prisma.$disconnect();
  }
}

main();