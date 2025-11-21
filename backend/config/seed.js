// import bcrypt from 'bcryptjs';
// import User from './models/user.model.js';

 export async function seed() {}
//   try {
//     const existingAdmin = await User.findOne({ email: 'admin2@ecommerce.com' });
//     if (existingAdmin) {
//       return;
//     }

//     const hashedPassword = await bcrypt.hash('admin123!', 10);

//     const admin = await User.create({
//       name: 'Admin',
//       email: 'admin2@ecommerce.com',
//       password: hashedPassword,
//       role: 'admin',
//     });

//     console.log('Admin created:', admin);
//     process.exit(0);
//   } catch (err) {
//     console.error('Seeding error:', err);
//     process.exit(1);
//   }
// }

seed();
