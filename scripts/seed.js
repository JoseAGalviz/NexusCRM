const { faker } = require('@faker-js/faker');
const axios = require('axios');

async function seed() {
    console.log('🌱 Seeding data...');
    const API_URL = 'http://localhost:4000';

    try {
        // 1. Authenticate
        console.log('Logging in...');
        const loginRes = await axios.post(`${API_URL}/auth/login`, {
            email: 'admin@nexus.com',
            password: 'password123'
        });
        const token = loginRes.data.access_token;
        const headers = { Authorization: `Bearer ${token}` };

        // 2. Create Contacts
        console.log('Creating Contacts...');
        for (let i = 0; i < 15; i++) {
            await axios.post(`${API_URL}/contacts`, {
                firstName: faker.person.firstName(),
                lastName: faker.person.lastName(),
                email: faker.internet.email(),
                phone: faker.phone.number(),
                company: faker.company.name(),
                status: faker.helpers.arrayElement(['lead', 'customer', 'lost'])
            }, { headers });
        }

        // 3. Create Deals
        console.log('Creating Deals...');
        for (let i = 0; i < 10; i++) {
            await axios.post(`${API_URL}/deals`, {
                title: `${faker.commerce.productAdjective()} Deal`,
                value: parseFloat(faker.commerce.price({ min: 1000, max: 50000 })),
                companyName: faker.company.name(),
                stage: faker.helpers.arrayElement(['prospect', 'negotiation', 'won', 'lost']),
                expectedCloseDate: faker.date.future()
            }, { headers });
        }

        console.log('✅ Seeding complete!');

    } catch (error) {
        console.error('❌ Seeding failed:', error.response?.data || error.message);
    }
}

seed();
