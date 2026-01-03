require('dotenv').config();
require('./config/firebase-admin');
const firestoreService = require('./services/firestore.service');

const defaultServices = [
    {
        title: 'Birthday Customisation',
        description: 'Create stunning outfit concepts for birthday celebrations using your own fabric.',
        icon: 'Cake',
        category: 'customization',
        features: [
            'Outfit concepts using your fabric',
            'Fabric guidance if required',
            'Modern yet wearable designs'
        ],
        price: null,
        isActive: true,
        order: 1
    },
    {
        title: 'Wedding Customisation',
        description: 'Elegant designs for brides and family members for all wedding functions.',
        icon: 'Gem',
        category: 'customization',
        features: [
            'Designs for brides & family members',
            'Outfit planning for different functions',
            'Balance of traditional and modern aesthetics'
        ],
        price: null,
        isActive: true,
        order: 2
    },
    {
        title: 'Events & Special Occasions',
        description: 'Perfect outfit concepts for festivals, parties, and special occasions.',
        icon: 'PartyPopper',
        category: 'customization',
        features: [
            'Festival, party & reception outfit concepts',
            'Designs based on your theme, fabric & occasion',
            'Versatile styling options'
        ],
        price: null,
        isActive: true,
        order: 3
    },
    {
        title: 'Product Catalog Generation',
        description: 'Professional product catalogs for any type of product or business.',
        icon: 'BookOpen',
        category: 'catalog',
        features: [
            'Professional catalogs for any product type',
            'Custom layouts and branding',
            'Digital and print-ready formats'
        ],
        price: null,
        isActive: true,
        order: 4
    }
];

async function seedServices() {
    try {
        console.log('🌱 Seeding services...\n');

        for (const service of defaultServices) {
            const created = await firestoreService.create('services', service);
            console.log(`✅ Created: ${service.title} (${created.id})`);
        }

        console.log('\n🎉 Services seeded successfully!');
        process.exit(0);
    } catch (error) {
        console.error('❌ Error seeding services:', error);
        process.exit(1);
    }
}

seedServices();
