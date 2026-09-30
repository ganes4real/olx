const mongoose = require('mongoose');
const bcrypt = require('bcryptjs');
require('dotenv').config();

const User = require('./models/User');
const Item = require('./models/Item');
const Favorite = require('./models/Favorite');
const Report = require('./models/Report');
const Chat = require('./models/Chat');
const Message = require('./models/Message');

const MONGO_URI = process.env.MONGO_URI || 'mongodb://127.0.0.1:27017/olx_clone';

// Helper to generate a clean, colorful, lightweight Base64 SVG image to be stored directly in MongoDB
function generateBase64AdImage(title, category, color1 = '#002f34', color2 = '#00a49f') {
  const svg = `<svg xmlns="http://www.w3.org/2000/svg" width="800" height="600" viewBox="0 0 800 600">
    <defs>
      <linearGradient id="grad" x1="0%" y1="0%" x2="100%" y2="100%">
        <stop offset="0%" style="stop-color:${color1};stop-opacity:1" />
        <stop offset="100%" style="stop-color:${color2};stop-opacity:1" />
      </linearGradient>
      <pattern id="grid" width="40" height="40" patternUnits="userSpaceOnUse">
        <path d="M 40 0 L 0 0 0 40" fill="none" stroke="rgba(255,255,255,0.06)" stroke-width="1"/>
      </pattern>
    </defs>
    <rect width="800" height="600" fill="url(#grad)" />
    <rect width="800" height="600" fill="url(#grid)" />
    <circle cx="400" cy="240" r="110" fill="rgba(255,255,255,0.12)" />
    <circle cx="400" cy="240" r="80" fill="rgba(255,255,255,0.2)" />
    
    <text x="400" y="250" text-anchor="middle" font-family="-apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif" font-size="44" font-weight="900" fill="#ffffff" letter-spacing="2">
      ${category.toUpperCase()}
    </text>
    <rect x="100" y="380" width="600" height="150" rx="16" fill="rgba(0,0,0,0.35)" />
    <text x="400" y="440" text-anchor="middle" font-family="-apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif" font-size="28" font-weight="bold" fill="#ffce32">
      ${title.length > 36 ? title.substring(0, 34) + '...' : title}
    </text>
    <text x="400" y="490" text-anchor="middle" font-family="-apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif" font-size="18" fill="#e0f2f1">
      ★ Verified OLX Marketplace Listing ★
    </text>
  </svg>`;

  return `data:image/svg+xml;base64,${Buffer.from(svg).toString('base64')}`;
}

async function seedDatabase() {
  try {
    await mongoose.connect(MONGO_URI);
    console.log(' Connected to MongoDB for seeding...');

    // Clear old data
    await Promise.all([
      User.deleteMany({}),
      Item.deleteMany({}),
      Favorite.deleteMany({}),
      Report.deleteMany({}),
      Chat.deleteMany({}),
      Message.deleteMany({})
    ]);
    console.log(' Cleared old collections.');

    // 1. Create Users with bcrypt hashed passwords
    const salt = await bcrypt.genSalt(10);
    const hash = async (pwd) => await bcrypt.hash(pwd, salt);

    const usersData = [
      {
        userId: 'test101',
        name: 'OLX Administrator',
        email: 'test101@olx.com',
        password: await hash('pass101'),
        phone: '+91 98000 11111',
        role: 'admin',
        createdAt: new Date('2023-01-01')
      },
      {
        name: 'Rohit Sharma',
        email: 'rohit@example.com',
        password: await hash('rohit123'),
        phone: '+91 98201 12345',
        role: 'user',
        createdAt: new Date('2023-05-15')
      },
      {
        name: 'Priya Patel',
        email: 'priya@example.com',
        password: await hash('priya123'),
        phone: '+91 98450 67890',
        role: 'user',
        createdAt: new Date('2023-08-20')
      },
      {
        name: 'Amit Kumar',
        email: 'amit@example.com',
        password: await hash('amit123'),
        phone: '+91 98111 22334',
        role: 'user',
        createdAt: new Date('2024-01-10')
      },
      {
        name: 'Sneha Reddy',
        email: 'buyer@example.com',
        password: await hash('buyer123'),
        phone: '+91 99999 88888',
        role: 'user',
        createdAt: new Date('2024-02-01')
      }
    ];

    const users = await User.insertMany(usersData);
    console.log(` Created ${users.length} users with hashed passwords.`);

    const admin = users[0];
    const rohit = users[1];
    const priya = users[2];
    const amit = users[3];
    const sneha = users[4];

    // 2. Create Items linked to Users, with status and in-database Base64 images
    const rawItems = [
      {
        title: 'Hyundai Creta SX (O) 1.5 Petrol 2022',
        description: 'First owner, only 18,500 kms driven. Panoramic sunroof, ventilated seats, Bose sound system. Complete service record available at authorized Hyundai service center. Comprehensive insurance valid till Dec 2026.',
        price: 1450000,
        category: 'Cars',
        location: 'Mumbai, Maharashtra',
        color1: '#002f34',
        color2: '#005f6b',
        user: rohit,
        status: 'listed',
        featured: true
      },
      {
        title: 'Apple iPhone 15 Pro Max - 256GB Natural Titanium',
        description: 'Battery health 99%, with original Bill, Box, and Apple Braided Cable. Under official Apple India warranty until November. Absolutely scratchless condition with tempered glass applied.',
        price: 92000,
        category: 'Mobile Phones',
        location: 'Delhi, NCR',
        color1: '#263238',
        color2: '#455a64',
        user: priya,
        status: 'listed',
        featured: true
      },
      {
        title: 'Royal Enfield Classic 350 Reborn (Dark Stealth)',
        description: '2023 model, dual channel ABS, alloy wheels with tubeless tires. Run only 6,200 kms. Ceramic coated with showroom condition. Single hand driven.',
        price: 185000,
        category: 'Motorcycles',
        location: 'Bengaluru, Karnataka',
        color1: '#3e2723',
        color2: '#5d4037',
        user: rohit,
        status: 'listed',
        featured: true
      },
      {
        title: 'Luxury 3 BHK Flat in Prime High-Rise Society',
        description: '1850 sq.ft, 14th floor with scenic view, modular kitchen, wooden flooring in master bedroom, 2 covered car parkings, club house, swimming pool, gym.',
        price: 18500000,
        category: 'Houses & Apartments',
        location: 'Pune, Maharashtra',
        color1: '#1a237e',
        color2: '#283593',
        user: amit,
        status: 'listed',
        featured: true
      },
      {
        title: 'Sony PlayStation 5 Console (Disc Edition) + 2 Controllers',
        description: 'Like new condition, 825GB SSD, comes with 2 DualSense controllers, charging dock, HDMI 2.1 cable, and God of War Ragnarok disk included.',
        price: 41000,
        category: 'Electronics & Appliances',
        location: 'Hyderabad, Telangana',
        color1: '#0d47a1',
        color2: '#1565c0',
        user: priya,
        status: 'listed',
        featured: false
      },
      {
        title: 'Ather 450X Gen 3 Electric Scooter (Mint Condition)',
        description: 'TrueRange 105 km per charge. Fast charger, Warp mode, touch dashboard with Google Maps navigation. Under battery warranty till 2027.',
        price: 98000,
        category: 'Scooters',
        location: 'Chennai, Tamil Nadu',
        color1: '#004d40',
        color2: '#00796b',
        user: rohit,
        status: 'listed',
        featured: false
      },
      {
        title: 'Solid Teak Wood 6-Seater Dining Table Set',
        description: 'Handcrafted pure Sheesham/Teak wood dining table with glass top and 6 cushioned chairs. Minimalist modern finish. Selling due to house relocation.',
        price: 24500,
        category: 'Furniture',
        location: 'Ahmedabad, Gujarat',
        color1: '#4e342e',
        color2: '#6d4c41',
        user: amit,
        status: 'listed',
        featured: false
      },
      {
        title: 'Tata Ace Gold Petrol Mini Truck 2021',
        description: 'Commercial vehicle in top mechanical condition. 42,000 kms done. Fitness and all commercial national permits valid up to 2027. New tyres.',
        price: 360000,
        category: 'Commercial Vehicles',
        location: 'Kolkata, West Bengal',
        color1: '#e65100',
        color2: '#ef6c00',
        user: amit,
        status: 'sold', // Example of sold item
        featured: false
      },
      {
        title: 'MacBook Pro 14" M2 Pro (16GB RAM / 512GB SSD)',
        description: 'Space Gray, 120Hz Liquid Retina XDR screen, cycle count only 45. Includes original 67W MagSafe fast charger and box. Excellent for software engineers and video editors.',
        price: 132000,
        category: 'Electronics & Appliances',
        location: 'Bengaluru, Karnataka',
        color1: '#212121',
        color2: '#424242',
        user: priya,
        status: 'listed',
        featured: true
      },
      {
        title: 'Canon EOS R6 Mark II Mirrorless Camera Body',
        description: 'Under Indian warranty, shutter count less than 8,000. 24.2 MP full-frame sensor, 4K 60p, dual card slots. Comes with 2 original batteries and SanDisk Extreme Pro 128GB.',
        price: 168000,
        category: 'Electronics & Appliances',
        location: 'Mumbai, Maharashtra',
        color1: '#b71c1c',
        color2: '#c62828',
        user: rohit,
        status: 'reserved', // Example of reserved item
        featured: false
      },
      {
        title: 'Samsung Galaxy S24 Ultra 5G - 512GB Titanium Gray',
        description: 'S-Pen included, Snapdragon 8 Gen 3, 200MP camera with AI photo assist. Under Samsung Care+ accidental protection. Mint condition.',
        price: 99000,
        category: 'Mobile Phones',
        location: 'Noida, Uttar Pradesh',
        color1: '#311b92',
        color2: '#4527a0',
        user: amit,
        status: 'listed',
        featured: false
      },
      {
        title: 'Maruti Suzuki Swift ZXi+ Dual Tone 2021',
        description: 'Top end model with push button start, smartplay touchscreen with Android Auto, alloy wheels, cruise control. 24,000 kms. Single owner.',
        price: 680000,
        category: 'Cars',
        location: 'Jaipur, Rajasthan',
        color1: '#c2185b',
        color2: '#ad1457',
        user: rohit,
        status: 'listed',
        featured: false
      }
    ];

    const itemsToInsert = rawItems.map((item, idx) => ({
      title: item.title,
      description: item.description,
      price: item.price,
      category: item.category,
      location: item.location,
      image: generateBase64AdImage(item.title, item.category, item.color1, item.color2), // Stored as actual Base64 in DB
      userId: item.user._id,
      sellerName: item.user.name,
      sellerPhone: item.user.phone,
      sellerMemberSince: new Date(item.user.createdAt).toLocaleDateString('en-US', { month: 'short', year: 'numeric' }),
      status: item.status,
      featured: item.featured,
      createdAt: new Date(Date.now() - (idx * 86400000))
    }));

    const items = await Item.insertMany(itemsToInsert);
    console.log(` Created ${items.length} items with actual base64 images, statuses, and linked user IDs.`);

    // 3. Create Sample Favorites for Sneha (buyer)
    const favs = [
      { userId: sneha._id, itemId: items[0]._id },
      { userId: sneha._id, itemId: items[1]._id },
      { userId: sneha._id, itemId: items[2]._id }
    ];
    await Favorite.insertMany(favs);
    console.log(` Created ${favs.length} sample favorites.`);

    // 4. Create Sample Reports (for scam detection & admin review)
    const reports = [
      {
        itemId: items[1]._id,
        itemTitle: items[1].title,
        sellerId: items[1].userId,
        sellerName: items[1].sellerName,
        reporterId: sneha._id,
        reporterName: sneha.name,
        reporterEmail: sneha.email,
        reason: 'Counterfeit Product',
        description: 'Buyer reported that seller asked for an advance payment via UPI QR code before showing the phone in person.',
        status: 'pending',
        createdAt: new Date(Date.now() - 3600000)
      },
      {
        itemId: items[7]._id,
        itemTitle: items[7].title,
        sellerId: items[7].userId,
        sellerName: items[7].sellerName,
        reporterId: null,
        reporterName: 'Anonymous Visitor',
        reporterEmail: 'safety@visitor.com',
        reason: 'Duplicate Ad',
        description: 'This mini truck was already marked sold last week and posted again.',
        status: 'resolved',
        adminNotes: 'Seller verified vehicle is sold, status updated.',
        createdAt: new Date(Date.now() - 86400000)
      }
    ];
    await Report.insertMany(reports);
    console.log(` Created ${reports.length} sample scam reports for admin panel.`);

    // 5. Create Sample Chat & Messages between Sneha (buyer) and Rohit (seller) for Creta
    const cretaItem = items[0];
    const sampleChat = new Chat({
      participants: [sneha._id, rohit._id],
      itemId: cretaItem._id,
      lastMessage: 'Sure, you can inspect it this Saturday in Bandra.',
      lastMessageSender: rohit._id,
      lastMessageAt: new Date()
    });
    await sampleChat.save();

    const messages = [
      {
        chatId: sampleChat._id,
        senderId: sneha._id,
        senderName: sneha.name,
        text: 'Hi Rohit! Is the Creta 2022 still available for inspection?',
        createdAt: new Date(Date.now() - 1000 * 60 * 30)
      },
      {
        chatId: sampleChat._id,
        senderId: rohit._id,
        senderName: rohit.name,
        text: 'Hello Sneha! Yes, the car is available with full service records.',
        createdAt: new Date(Date.now() - 1000 * 60 * 20)
      },
      {
        chatId: sampleChat._id,
        senderId: sneha._id,
        senderName: sneha.name,
        text: 'Can we negotiate slightly on the price if I pay immediately?',
        createdAt: new Date(Date.now() - 1000 * 60 * 10)
      },
      {
        chatId: sampleChat._id,
        senderId: rohit._id,
        senderName: rohit.name,
        text: 'Sure, you can inspect it this Saturday in Bandra. We can discuss face to face!',
        createdAt: new Date()
      }
    ];
    await Message.insertMany(messages);
    console.log(` Created sample conversation with ${messages.length} messages.`);

    console.log('\n=======================================');
    console.log(' SEEDING COMPLETE');
    console.log(' Admin Credentials:');
    console.log('   User ID: test101 (or test101@olx.com)');
    console.log('   Password: pass101');
    console.log(' Demo User Credentials:');
    console.log('   User ID / Email: rohit@example.com (Password: rohit123)');
    console.log('   User ID / Email: buyer@example.com (Password: buyer123)');
    console.log('=======================================\n');

    process.exit(0);
  } catch (err) {
    console.error('❌ Seeding error:', err);
    process.exit(1);
  }
}

seedDatabase();
