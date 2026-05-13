import { PrismaClient } from '@prisma/client';
import bcrypt from 'bcrypt';

const prisma = new PrismaClient();

export const seedUsers = async () => {
  console.log('🌱 Seeding users...');

  const hashedPassword = await bcrypt.hash('password123', 10);

  const users = [
    {
      email: 'admin@cosplay.com',
      name: 'Admin Cosplay',
      password: hashedPassword,
      phone: '+5491123456789',
      cuit: '20123456789',
      roles: ['ADMIN', 'VENDEDOR'] as const,
    },
    {
      email: 'vendedor1@cosplay.com',
      name: 'María García',
      password: hashedPassword,
      phone: '+5491187654321',
      cuit: '20234567890',
      roles: ['VENDEDOR'] as const,
    },
    {
      email: 'vendedor2@cosplay.com',
      name: 'Carlos López',
      password: hashedPassword,
      phone: '+5491198765432',
      cuit: '20345678901',
      roles: ['VENDEDOR'] as const,
    },
    {
      email: 'comprador1@cosplay.com',
      name: 'Ana Martínez',
      password: hashedPassword,
      phone: '+5491176543210',
      roles: ['COMPRADOR'] as const,
    },
    {
      email: 'comprador2@cosplay.com',
      name: 'Juan Pérez',
      password: hashedPassword,
      phone: '+5491165432109',
      roles: ['COMPRADOR'] as const,
    },
    {
      email: 'comprador3@cosplay.com',
      name: 'Laura Rodríguez',
      password: hashedPassword,
      phone: '+5491154321098',
      roles: ['COMPRADOR'] as const,
    },
  ];

  for (const userData of users) {
    // Check if user already exists
    const existingUser = await prisma.user.findUnique({
      where: { email: userData.email },
    });

    if (existingUser) {
      console.log(`⏭️ User already exists: ${userData.email}`);
      continue;
    }

    const user = await prisma.user.create({
      data: {
        email: userData.email,
        name: userData.name,
        password: userData.password,
        phone: userData.phone,
        cuit: userData.cuit,
        roles: {
          create: userData.roles.map(role => ({ role })),
        },
      },
    });
    console.log(`✅ Created user: ${user.name} (${user.email})`);
  }

  console.log('🎉 Users seeded successfully!');
};