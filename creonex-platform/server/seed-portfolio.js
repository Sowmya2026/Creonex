require('dotenv').config();
require('./config/firebase-admin');
const firestoreService = require('./services/firestore.service');

const samplePortfolio = [
    {
        title: 'Bridal Lehenga Design',
        description: 'Elegant red and gold bridal lehenga visualization for a traditional wedding',
        imageUrl: 'https://images.unsplash.com/photo-1610030469983-98e550d6193c?w=800',
        category: 'wedding',
        tags: ['bridal', 'lehenga', 'traditional', 'red'],
        isFeatured: true,
        order: 1
    },
    {
        title: 'Birthday Party Outfit',
        description: 'Vibrant and modern birthday outfit concept with floral patterns',
        imageUrl: 'https://images.unsplash.com/photo-1595777457583-95e059d581b8?w=800',
        category: 'birthday',
        tags: ['birthday', 'modern', 'floral'],
        isFeatured: true,
        order: 2
    },
    {
        title: 'Product Catalog - Summer Collection',
        description: 'Professional product catalog for summer fashion collection',
        imageUrl: 'https://images.unsplash.com/photo-1490481651871-ab68de25d43d?w=800',
        category: 'catalog',
        tags: ['catalog', 'summer', 'fashion'],
        isFeatured: true,
        order: 3
    },
    {
        title: 'Custom Saree Design',
        description: 'Traditional saree with modern embellishments',
        imageUrl: 'https://images.unsplash.com/photo-1583391733956-6c78276477e2?w=800',
        category: 'customization',
        tags: ['saree', 'traditional', 'embroidery'],
        isFeatured: false,
        order: 4
    },
    {
        title: 'Wedding Guest Outfit',
        description: 'Elegant outfit concept for wedding guests',
        imageUrl: 'https://images.unsplash.com/photo-1617019114583-affb34d1b3cd?w=800',
        category: 'wedding',
        tags: ['wedding', 'guest', 'elegant'],
        isFeatured: false,
        order: 5
    },
    {
        title: 'Brand Catalog - Ethnic Wear',
        description: 'Complete brand catalog for ethnic wear collection',
        imageUrl: 'https://images.unsplash.com/photo-1610030469983-98e550d6193c?w=800',
        category: 'brand',
        tags: ['brand', 'catalog', 'ethnic'],
        isFeatured: false,
        order: 6
    }
];

async function seedPortfolio() {
    try {
        console.log('🌱 Seeding portfolio...\n');

        for (const item of samplePortfolio) {
            const created = await firestoreService.create('portfolio', item);
            console.log(`✅ Created: ${item.title} (${created.id})`);
        }

        console.log('\n🎉 Portfolio seeded successfully!');
        process.exit(0);
    } catch (error) {
        console.error('❌ Error seeding portfolio:', error);
        process.exit(1);
    }
}

seedPortfolio();
