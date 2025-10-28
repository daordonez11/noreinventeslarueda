"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const client_1 = require("@prisma/client");
const prisma = new client_1.PrismaClient();
async function main() {
    console.log('🌱 Starting database seed...');
    // Create categories
    const categories = [
        {
            slug: 'frontend',
            nameEs: 'Frontend',
            nameEn: 'Frontend',
            descriptionEs: 'Librerías y frameworks para desarrollo web del lado del cliente',
            descriptionEn: 'Libraries and frameworks for client-side web development',
            icon: '🎨',
            displayOrder: 1,
        },
        {
            slug: 'backend',
            nameEs: 'Backend',
            nameEn: 'Backend',
            descriptionEs: 'Frameworks y herramientas para desarrollo web del lado del servidor',
            descriptionEn: 'Frameworks and tools for server-side web development',
            icon: '⚙️',
            displayOrder: 2,
        },
        {
            slug: 'databases',
            nameEs: 'Bases de Datos',
            nameEn: 'Databases',
            descriptionEs: 'Sistemas de gestión de bases de datos y ORMs',
            descriptionEn: 'Database management systems and ORMs',
            icon: '💾',
            displayOrder: 3,
        },
        {
            slug: 'mobile',
            nameEs: 'Mobile',
            nameEn: 'Mobile',
            descriptionEs: 'Frameworks para desarrollo de aplicaciones móviles',
            descriptionEn: 'Frameworks for mobile application development',
            icon: '📱',
            displayOrder: 4,
        },
        {
            slug: 'devops',
            nameEs: 'DevOps',
            nameEn: 'DevOps',
            descriptionEs: 'Herramientas para CI/CD, contenerización y orquestación',
            descriptionEn: 'Tools for CI/CD, containerization and orchestration',
            icon: '🚀',
            displayOrder: 5,
        },
        {
            slug: 'testing',
            nameEs: 'Testing',
            nameEn: 'Testing',
            descriptionEs: 'Frameworks y librerías para testing y QA',
            descriptionEn: 'Frameworks and libraries for testing and QA',
            icon: '✅',
            displayOrder: 6,
        },
        {
            slug: 'tools',
            nameEs: 'Herramientas',
            nameEn: 'Tools',
            descriptionEs: 'Herramientas de desarrollo y utilidades generales',
            descriptionEn: 'Developer tools and general utilities',
            icon: '🛠️',
            displayOrder: 7,
        },
    ];
    for (const category of categories) {
        const existing = await prisma.category.findUnique({
            where: { slug: category.slug },
        });
        if (!existing) {
            await prisma.category.create({
                data: category,
            });
            console.log(`✅ Created category: ${category.nameEs}`);
        }
        else {
            console.log(`⏭️  Category already exists: ${category.nameEs}`);
        }
    }
    console.log('✨ Seed completed successfully!');
}
main()
    .catch((e) => {
    console.error('❌ Seed failed:', e);
    process.exit(1);
})
    .finally(async () => {
    await prisma.$disconnect();
});
