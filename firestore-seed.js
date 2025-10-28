#!/usr/bin/env node

/**
 * Firestore Data Seeder
 * Seeds categories into Firestore (replaces Prisma seed)
 */

const admin = require('firebase-admin');

// Initialize Firebase Admin
if (!admin.apps.length) {
  admin.initializeApp({
    credential: admin.credential.cert({
      projectId: process.env.FIREBASE_PROJECT_ID,
      clientEmail: process.env.FIREBASE_CLIENT_EMAIL,
      privateKey: process.env.FIREBASE_PRIVATE_KEY?.replace(/\\n/g, '\n'),
    }),
  });
}

const db = admin.firestore();

const categories = [
  {
    slug: 'frontend',
    nameEs: 'Frontend',
    nameEn: 'Frontend',
    descriptionEs: 'Frameworks y bibliotecas para desarrollo de interfaces de usuario',
    descriptionEn: 'Frameworks and libraries for user interface development',
    icon: 'layout',
    displayOrder: 1,
  },
  {
    slug: 'backend',
    nameEs: 'Backend',
    nameEn: 'Backend',
    descriptionEs: 'Frameworks y herramientas para desarrollo del lado del servidor',
    descriptionEn: 'Frameworks and tools for server-side development',
    icon: 'server',
    displayOrder: 2,
  },
  {
    slug: 'databases',
    nameEs: 'Bases de Datos',
    nameEn: 'Databases',
    descriptionEs: 'Sistemas de gestión de bases de datos y ORMs',
    descriptionEn: 'Database management systems and ORMs',
    icon: 'database',
    displayOrder: 3,
  },
  {
    slug: 'mobile',
    nameEs: 'Desarrollo Móvil',
    nameEn: 'Mobile Development',
    descriptionEs: 'Frameworks para desarrollo de aplicaciones móviles',
    descriptionEn: 'Frameworks for mobile app development',
    icon: 'mobile',
    displayOrder: 4,
  },
  {
    slug: 'devops',
    nameEs: 'DevOps',
    nameEn: 'DevOps',
    descriptionEs: 'Herramientas de CI/CD, contenedores y orquestación',
    descriptionEn: 'CI/CD tools, containers and orchestration',
    icon: 'settings',
    displayOrder: 5,
  },
  {
    slug: 'testing',
    nameEs: 'Testing',
    nameEn: 'Testing',
    descriptionEs: 'Frameworks y herramientas de pruebas',
    descriptionEn: 'Testing frameworks and tools',
    icon: 'check-circle',
    displayOrder: 6,
  },
  {
    slug: 'tools',
    nameEs: 'Herramientas',
    nameEn: 'Tools',
    descriptionEs: 'Utilidades y herramientas de desarrollo',
    descriptionEn: 'Development utilities and tools',
    icon: 'wrench',
    displayOrder: 7,
  },
];

async function seedCategories() {
  console.log('🌱 Seeding categories to Firestore...');

  const batch = db.batch();

  for (const category of categories) {
    const docRef = db.collection('categories').doc();
    batch.set(docRef, {
      ...category,
      createdAt: admin.firestore.FieldValue.serverTimestamp(),
      updatedAt: admin.firestore.FieldValue.serverTimestamp(),
    });
  }

  await batch.commit();

  console.log('✅ Successfully seeded', categories.length, 'categories');
}

async function main() {
  try {
    await seedCategories();
    console.log('✅ Seeding completed successfully');
    process.exit(0);
  } catch (error) {
    console.error('❌ Seeding failed:', error);
    process.exit(1);
  }
}

main();
