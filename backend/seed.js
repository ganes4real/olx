require('dotenv').config();
const mongoose = require('mongoose');
const bcrypt = require('bcryptjs');
const User = require('./models/User');
const Product = require('./models/Product');

async function seedDB() {
    try {
        console.log('Connecting to MongoDB...');
        await mongoose.connect(process.env.MONGODB_URI);
        console.log('Connected!');

        console.log('Clearing existing data...');
        await User.deleteMany({});
        await Product.deleteMany({});

        console.log('Creating dummy user...');
        const salt = await bcrypt.genSalt(10);
        const hashedPassword = await bcrypt.hash('password123', salt);
        const testUser = new User({
            name: 'Test Seller',
            email: 'test@example.com',
            password: hashedPassword
        });
        await testUser.save();
        console.log('User created: test@example.com / password123');

        console.log('Creating dummy products...');
        const products = [
            {
                title: 'MacBook Pro M1 2020',
                description: 'Mint condition MacBook Pro M1 with 16GB RAM and 512GB SSD. Barely used.',
                price: 950,
                category: 'Electronics',
                location: 'New York, NY',
                sellerId: testUser._id
            },
            {
                title: 'IKEA Ektorp Sofa',
                description: 'Comfortable 3-seat sofa in beige. Small stain on one cushion.',
                price: 150,
                category: 'Furniture',
                location: 'Brooklyn, NY',
                sellerId: testUser._id
            },
            {
                title: 'Honda Civic 2018 EX',
                description: 'Great condition, single owner. 45,000 miles. Clean title.',
                price: 15500,
                category: 'Cars',
                location: 'Queens, NY',
                sellerId: testUser._id
            },
            {
                title: 'iPhone 13 Pro',
                description: '128GB Sierra Blue. Unlocked. Comes with box and charger.',
                price: 600,
                category: 'Mobile Phones',
                location: 'Manhattan, NY',
                sellerId: testUser._id
            }
        ];
        
        await Product.insertMany(products);
        console.log('Successfully seeded database with products!');

        process.exit(0);
    } catch (err) {
        console.error('Error seeding database:', err);
        process.exit(1);
    }
}

seedDB();
