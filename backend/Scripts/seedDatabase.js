const mongoose = require('mongoose');
const User = require('../models/User');
require('dotenv').config();

// Database seeder to create default admin user and sample data
const seedDatabase = async () => {
  try {
    // Connect to database
    const uri = process.env.MONGODB_URI || 'mongodb://localhost:27017/stivan';
    await mongoose.connect(uri, {
      useNewUrlParser: true,
      useUnifiedTopology: true,
    });
    
    console.log('Connected to MongoDB for seeding...');

    // Check if admin already exists
    const existingAdmin = await User.findOne({ role: 'admin' });
    if (existingAdmin) {
      console.log('Admin user already exists:', existingAdmin.email);
    } else {
      // Create default admin user
      const adminData = {
        name: 'System Administrator',
        email: 'admin@stivan.com',
        password: 'Admin123!@#', // Change this in production
        role: 'admin',
        permissions: ['read', 'write', 'delete', 'manage_users', 'manage_roles'],
        isActive: true
      };

      const admin = await User.createAdmin(adminData);
      console.log('✅ Admin user created successfully');
      console.log('📧 Email:', admin.email);
      console.log('🔑 Password: Admin123!@# (Please change this!)');
      console.log('👑 Role:', admin.role);
    }

    // Check if moderator exists
    const existingModerator = await User.findOne({ role: 'moderator' });
    if (!existingModerator) {
      const moderatorData = {
        name: 'Content Moderator',
        email: 'moderator@stivan.com',
        password: 'Moderator123!',
        role: 'moderator',
        permissions: ['read', 'write', 'delete'],
        isActive: true
      };

      const moderator = new User(moderatorData);
      await moderator.save();
      console.log('✅ Moderator user created successfully');
      console.log('📧 Email:', moderator.email);
      console.log('🔑 Password: Moderator123!');
    }

    // Check if regular user exists
    const existingUser = await User.findOne({ role: 'user', email: 'user@stivan.com' });
    if (!existingUser) {
      const userData = {
        name: 'Regular User',
        email: 'user@stivan.com',
        password: 'User123!',
        role: 'user',
        permissions: ['read'],
        isActive: true
      };

      const user = new User(userData);
      await user.save();
      console.log('✅ Regular user created successfully');
      console.log('📧 Email:', user.email);
      console.log('🔑 Password: User123!');
    }

    console.log('\n🎉 Database seeding completed successfully!');
    console.log('\nDefault accounts created:');
    console.log('1. Admin: admin@stivan.com (Admin123!@#)');
    console.log('2. Moderator: moderator@stivan.com (Moderator123!)');
    console.log('3. User: user@stivan.com (User123!)');
    console.log('\n⚠️  Please change default passwords in production!');

  } catch (error) {
    console.error('❌ Error seeding database:', error);
  } finally {
    mongoose.connection.close();
    console.log('Database connection closed');
  }
};

// Run the seeder
if (require.main === module) {
  seedDatabase();
}

module.exports = seedDatabase;