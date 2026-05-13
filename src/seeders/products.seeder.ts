import { PrismaClient, ProductCondition } from '@prisma/client';

const prisma = new PrismaClient();

export const seedProducts = async () => {
  console.log('🌱 Seeding products...');

  // Get existing users and categories
  const sellers = await prisma.user.findMany({
    where: {
      roles: {
        some: {
          role: 'VENDEDOR',
        },
      },
    },
  });

  const categories = await prisma.category.findMany({
    include: {
      children: true,
    },
  });

  if (sellers.length === 0 || categories.length === 0) {
    throw new Error('No sellers or categories found. Please run users and categories seeders first.');
  }

  const products = [
    {
      title: 'Peluca Rosa Pastel - Estilo Kawaii',
      description: 'Hermosa peluca rosa pastel perfecta para looks kawaii y anime. Hecha con fibra sintética de alta calidad, suave al tacto y duradera. Longitud aproximada: 80cm. Incluye peine y bolsa de almacenamiento.',
      price: 4500,
      condition: 'NUEVO' as ProductCondition,
      stock: 15,
      tags: ['kawaii', 'rosa', 'anime', 'peluca', 'cosplay'],
      categorySlug: 'pelucas-largas',
      sellerIndex: 0,
      images: [
        'https://images.unsplash.com/photo-1594736797933-d0401ba2fe65?w=500&h=500&fit=crop',
        'https://images.unsplash.com/photo-1582095133179-bfd08e2fc6b3?w=500&h=500&fit=crop',
      ],
    },
    {
      title: 'Lentes de Contacto Violetas - Goddess Series',
      description: 'Lentes de contacto color violeta intenso, perfectos para personajes misteriosos y elegantes. Diámetro: 14.5mm. Incluye solución de almacenamiento y gotas hidratantes.',
      price: 3200,
      condition: 'NUEVO' as ProductCondition,
      stock: 25,
      tags: ['lentes', 'violeta', 'cosplay', 'anime', 'contacto'],
      categorySlug: 'lentes-color',
      sellerIndex: 1,
      images: [
        'https://images.unsplash.com/photo-1578662996442-48f60103fc96?w=500&h=500&fit=crop',
        'https://images.unsplash.com/photo-1585435557343-3b092031e2bb?w=500&h=500&fit=crop',
      ],
    },
    {
      title: 'Traje de Sailor Moon Completo',
      description: 'Traje completo de Sailor Moon con falda plisada, blusa y detalles bordados. Talles S, M, L disponibles. Incluye transformador y varita. Material: Algodón y poliéster.',
      price: 12500,
      condition: 'NUEVO' as ProductCondition,
      stock: 5,
      tags: ['sailor moon', 'anime', 'cosplay', 'traje', 'completo'],
      categorySlug: 'trajes-completos',
      sellerIndex: 0,
      images: [
        'https://images.unsplash.com/photo-1578662996442-48f60103fc96?w=500&h=500&fit=crop',
        'https://images.unsplash.com/photo-1591047139829-d91aecb6caea?w=500&h=500&fit=crop',
        'https://images.unsplash.com/photo-1582095133179-bfd08e2fc6b3?w=500&h=500&fit=crop',
      ],
    },
    {
      title: 'Botas Goticas Negras con Plataformas',
      description: 'Botas góticas con plataformas de 10cm, ideales para cosplay dark o alternativo. Material sintético resistente al agua. Talles 35-42 disponibles.',
      price: 8900,
      condition: 'NUEVO' as ProductCondition,
      stock: 8,
      tags: ['botas', 'góticas', 'plataformas', 'cosplay', 'alternativo'],
      categorySlug: 'botas',
      sellerIndex: 1,
      images: [
        'https://images.unsplash.com/photo-1549298916-b41d501d3772?w=500&h=500&fit=crop',
        'https://images.unsplash.com/photo-1551107696-a4b0c5a0d9a2?w=500&h=500&fit=crop',
      ],
    },
    {
      title: 'Collar de Gato con Cascabel Kawaii',
      description: 'Adorable collar de gato con cascabel plateado y dije de corazón. Ajustable, perfecto para cosplay de personajes tiernos o como accesorio cotidiano.',
      price: 1200,
      condition: 'NUEVO' as ProductCondition,
      stock: 30,
      tags: ['collar', 'gato', 'kawaii', 'accesorio', 'cascabel'],
      categorySlug: 'joyas-collares',
      sellerIndex: 0,
      images: [
        'https://images.unsplash.com/photo-1601758228041-f3b2795255f1?w=500&h=500&fit=crop',
      ],
    },
    {
      title: 'Espada de Luz LED - Star Wars',
      description: 'Espada de luz LED funcional con batería recargable. Incluye estuche de transporte y 7 colores diferentes. Longitud: 75cm. Perfecta para cosplay de Jedi o Sith.',
      price: 6800,
      condition: 'NUEVO' as ProductCondition,
      stock: 12,
      tags: ['espada', 'star wars', 'led', 'cosplay', 'jedi'],
      categorySlug: 'espadas',
      sellerIndex: 1,
      images: [
        'https://images.unsplash.com/photo-1578662996442-48f60103fc96?w=500&h=500&fit=crop',
        'https://images.unsplash.com/photo-1591047139829-d91aecb6caea?w=500&h=500&fit=crop',
      ],
    },
    {
      title: 'Peluca Azul Eléctrica - Estilo Punk',
      description: 'Peluca azul eléctrico con estilo punk/rockero. Corte asimétrico moderno, perfecta para personajes alternativos. Fibra resistente y fácil de peinar.',
      price: 3800,
      condition: 'USADO' as ProductCondition,
      stock: 3,
      tags: ['peluca', 'azul', 'punk', 'alternativo', 'cosplay'],
      categorySlug: 'pelucas-cortas',
      sellerIndex: 0,
      images: [
        'https://images.unsplash.com/photo-1582095133179-bfd08e2fc6b3?w=500&h=500&fit=crop',
      ],
    },
    {
      title: 'Lentes de Contacto Dorados - Fantasy',
      description: 'Lentes dorados con efecto metálico, perfectos para personajes fantasy o elfos. Diámetro: 14.2mm. Incluye todo lo necesario para su cuidado.',
      price: 2900,
      condition: 'NUEVO' as ProductCondition,
      stock: 20,
      tags: ['lentes', 'dorados', 'fantasy', 'elfos', 'cosplay'],
      categorySlug: 'lentes-cosplay',
      sellerIndex: 1,
      images: [
        'https://images.unsplash.com/photo-1578662996442-48f60103fc96?w=500&h=500&fit=crop',
      ],
    },
    {
      title: 'Conjunto de Hada - Alas y Varita',
      description: 'Conjunto completo de hada con alas transparentes y varita mágica con LED. Incluye tiara y guantes. Talle único ajustable. Material: Tul y plástico resistente.',
      price: 5600,
      condition: 'NUEVO' as ProductCondition,
      stock: 7,
      tags: ['hada', 'alas', 'varita', 'magia', 'cosplay'],
      categorySlug: 'otros-accesorios',
      sellerIndex: 0,
      images: [
        'https://images.unsplash.com/photo-1591047139829-d91aecb6caea?w=500&h=500&fit=crop',
        'https://images.unsplash.com/photo-1585435557343-3b092031e2bb?w=500&h=500&fit=crop',
      ],
    },
    {
      title: 'Zapatillas Deportivas Blancas - Anime Style',
      description: 'Zapatillas blancas con diseño anime, perfectas para cosplay casual. Suela antideslizante y cómodas para uso diario. Talles 35-44.',
      price: 7200,
      condition: 'NUEVO' as ProductCondition,
      stock: 10,
      tags: ['zapatillas', 'blancas', 'anime', 'casual', 'cosplay'],
      categorySlug: 'zapatillas',
      sellerIndex: 1,
      images: [
        'https://images.unsplash.com/photo-1549298916-b41d501d3772?w=500&h=500&fit=crop',
      ],
    },
  ];

  for (const productData of products) {
    const category = categories.find(cat =>
      cat.slug === productData.categorySlug ||
      cat.children.some(child => child.slug === productData.categorySlug)
    );

    if (!category) {
      console.warn(`⚠️ Category not found for product: ${productData.title}`);
      continue;
    }

    const seller = sellers[productData.sellerIndex % sellers.length];

    // Check if product already exists
    const existingProduct = await prisma.product.findFirst({
      where: { title: productData.title },
    });

    if (existingProduct) {
      console.log(`⏭️ Product already exists: ${productData.title}`);
      continue;
    }

    const product = await prisma.product.create({
      data: {
        sellerId: seller.id,
        categoryId: category.id,
        title: productData.title,
        description: productData.description,
        price: productData.price,
        condition: productData.condition,
        stock: productData.stock,
        tags: productData.tags,
        images: {
          create: productData.images.map((url, index) => ({
            url,
            position: index,
          })),
        },
      },
    });
    console.log(`✅ Created product: ${product.title} - $${product.price}`);
  }

  console.log('🎉 Products seeded successfully!');
};