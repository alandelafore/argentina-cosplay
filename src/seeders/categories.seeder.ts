import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

export const seedCategories = async () => {
  console.log('🌱 Seeding categories...');

  const categories = [
    {
      name: 'Pelucas',
      slug: 'pelucas',
      children: [
        { name: 'Pelucas Largas', slug: 'pelucas-largas' },
        { name: 'Pelucas Cortas', slug: 'pelucas-cortas' },
        { name: 'Pelucas de Anime', slug: 'pelucas-anime' },
        { name: 'Pelucas de Color', slug: 'pelucas-color' },
      ],
    },
    {
      name: 'Lentes de Contacto',
      slug: 'lentes-contacto',
      children: [
        { name: 'Lentes de Color', slug: 'lentes-color' },
        { name: 'Lentes Cosplay', slug: 'lentes-cosplay' },
        { name: 'Lentes Anime', slug: 'lentes-anime' },
      ],
    },
    {
      name: 'Vestuario',
      slug: 'vestuario',
      children: [
        { name: 'Trajes Completos', slug: 'trajes-completos' },
        { name: 'Blusas y Camisas', slug: 'blusas-camisas' },
        { name: 'Faldas y Shorts', slug: 'faldas-shorts' },
        { name: 'Accesorios de Vestuario', slug: 'accesorios-vestuario' },
      ],
    },
    {
      name: 'Calzado',
      slug: 'calzado',
      children: [
        { name: 'Botas', slug: 'botas' },
        { name: 'Zapatillas', slug: 'zapatillas' },
        { name: 'Sandalias', slug: 'sandalias' },
        { name: 'Calzado Especial', slug: 'calzado-especial' },
      ],
    },
    {
      name: 'Accesorios',
      slug: 'accesorios',
      children: [
        { name: 'Joyas y Collares', slug: 'joyas-collares' },
        { name: 'Aretes', slug: 'aretes' },
        { name: 'Pulseras', slug: 'pulseras' },
        { name: 'Otros Accesorios', slug: 'otros-accesorios' },
      ],
    },
    {
      name: 'Props y Armas',
      slug: 'props-armas',
      children: [
        { name: 'Espadas', slug: 'espadas' },
        { name: 'Varitas Mágicas', slug: 'varitas-magicas' },
        { name: 'Escudos', slug: 'escudos' },
        { name: 'Otros Props', slug: 'otros-props' },
      ],
    },
  ];

  for (const categoryData of categories) {
    // Check if category already exists
    const existingCategory = await prisma.category.findUnique({
      where: { slug: categoryData.slug },
    });

    if (existingCategory) {
      console.log(`⏭️ Category already exists: ${categoryData.name}`);
      continue;
    }

    const category = await prisma.category.create({
      data: {
        name: categoryData.name,
        slug: categoryData.slug,
        children: {
          create: categoryData.children.map(child => ({
            name: child.name,
            slug: child.slug,
          })),
        },
      },
    });
    console.log(`✅ Created category: ${category.name}`);
  }

  console.log('🎉 Categories seeded successfully!');
};