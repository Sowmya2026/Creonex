require('dotenv').config();
const { db } = require('./config/firebase-admin');

const seedTestData = async () => {
    try {
        console.log('🌱 Seeding test data...\n');

        // Add test visitors
        console.log('👥 Adding test visitors...');
        const visitorsData = [
            {
                ip: '192.168.1.100',
                userAgent: 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36',
                visitCount: 5,
                firstVisit: new Date(Date.now() - 7 * 24 * 60 * 60 * 1000), // 7 days ago
                lastVisit: new Date(),
                visits: [
                    { page: '/', timestamp: new Date(Date.now() - 7 * 24 * 60 * 60 * 1000) },
                    { page: '/services', timestamp: new Date(Date.now() - 5 * 24 * 60 * 60 * 1000) },
                    { page: '/how-it-works', timestamp: new Date(Date.now() - 3 * 24 * 60 * 60 * 1000) },
                    { page: '/contact', timestamp: new Date(Date.now() - 1 * 24 * 60 * 60 * 1000) },
                    { page: '/', timestamp: new Date() }
                ]
            },
            {
                ip: '192.168.1.101',
                userAgent: 'Mozilla/5.0 (iPhone; CPU iPhone OS 14_0 like Mac OS X) Mobile/15E148',
                visitCount: 3,
                firstVisit: new Date(Date.now() - 5 * 24 * 60 * 60 * 1000),
                lastVisit: new Date(Date.now() - 2 * 60 * 60 * 1000), // 2 hours ago
                visits: [
                    { page: '/', timestamp: new Date(Date.now() - 5 * 24 * 60 * 60 * 1000) },
                    { page: '/services', timestamp: new Date(Date.now() - 3 * 24 * 60 * 60 * 1000) },
                    { page: '/', timestamp: new Date(Date.now() - 2 * 60 * 60 * 1000) }
                ]
            },
            {
                ip: '192.168.1.102',
                userAgent: 'Mozilla/5.0 (Macintosh; Intel Mac OS X 10_15_7) AppleWebKit/605.1.15',
                visitCount: 8,
                firstVisit: new Date(Date.now() - 10 * 24 * 60 * 60 * 1000),
                lastVisit: new Date(Date.now() - 10 * 60 * 1000), // 10 minutes ago (active user)
                visits: [
                    { page: '/', timestamp: new Date(Date.now() - 10 * 24 * 60 * 60 * 1000) },
                    { page: '/services', timestamp: new Date(Date.now() - 8 * 24 * 60 * 60 * 1000) },
                    { page: '/how-it-works', timestamp: new Date(Date.now() - 6 * 24 * 60 * 60 * 1000) },
                    { page: '/contact', timestamp: new Date(Date.now() - 4 * 24 * 60 * 60 * 1000) },
                    { page: '/', timestamp: new Date(Date.now() - 2 * 24 * 60 * 60 * 1000) },
                    { page: '/services', timestamp: new Date(Date.now() - 1 * 24 * 60 * 60 * 1000) },
                    { page: '/how-it-works', timestamp: new Date(Date.now() - 12 * 60 * 60 * 1000) },
                    { page: '/', timestamp: new Date(Date.now() - 10 * 60 * 1000) }
                ]
            }
        ];

        for (const visitor of visitorsData) {
            await db.collection('visitors').add(visitor);
        }
        console.log(`✅ Added ${visitorsData.length} test visitors\n`);

        // Add test contacts
        console.log('📧 Adding test contacts...');
        const contactsData = [
            {
                name: 'John Doe',
                email: 'john.doe@example.com',
                message: 'I am interested in your web design services. Can you provide more information about pricing?',
                status: 'new',
                read: false,
                createdAt: new Date(Date.now() - 2 * 24 * 60 * 60 * 1000)
            },
            {
                name: 'Jane Smith',
                email: 'jane.smith@example.com',
                message: 'Looking for a complete branding package for my startup. Please contact me.',
                status: 'new',
                read: false,
                createdAt: new Date(Date.now() - 1 * 24 * 60 * 60 * 1000)
            },
            {
                name: 'Mike Johnson',
                email: 'mike.j@example.com',
                message: 'Need help with social media marketing. What packages do you offer?',
                status: 'new',
                read: false,
                createdAt: new Date(Date.now() - 5 * 60 * 60 * 1000)
            }
        ];

        for (const contact of contactsData) {
            await db.collection('contacts').add(contact);
        }
        console.log(`✅ Added ${contactsData.length} test contacts\n`);

        console.log('━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━');
        console.log('✅ Test Data Seeded Successfully!');
        console.log('━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━\n');
        console.log('📊 Summary:');
        console.log(`   - ${visitorsData.length} visitors`);
        console.log(`   - ${visitorsData.reduce((sum, v) => sum + v.visits.length, 0)} page views`);
        console.log(`   - ${contactsData.length} contact inquiries\n`);
        console.log('🚀 Refresh your admin dashboard to see the data!\n');

        process.exit(0);
    } catch (error) {
        console.error('\n❌ Seeding failed!');
        console.error('Error:', error.message);
        process.exit(1);
    }
};

seedTestData();
