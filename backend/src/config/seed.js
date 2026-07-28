require('dotenv').config();
const mongoose = require('mongoose');
const User     = require('../models/User');

const MONGO_URI = process.env.MONGO_URI || process.env.DATABASE_URL;

async function seed() {
  await mongoose.connect(MONGO_URI);
  console.log('Connected to MongoDB');

  const existing = await User.findOne({ role: 'admin' });
  if (existing) {
    console.log('Admin already exists:', existing.email);
    process.exit(0);
  }

  await User.create({
    name:  'School Admin',
    email: 'admin@school.com',
    password: 'Admin@123',
    role: 'admin',
    status: 'active',
  });

  console.log('Admin account created:');
  console.log('  Email:    admin@school.com');
  console.log('  Password: Admin@123');
  process.exit(0);
}

seed().catch(err => { console.error(err); process.exit(1); });
