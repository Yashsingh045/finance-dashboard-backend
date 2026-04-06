import { PrismaClient } from '@prisma/client';
import bcrypt from 'bcryptjs';

// Seeds the database with the exact test users and 10 sample financial records.
// Passwords, emails, and roles are defined in the spec and must not be changed.

const prisma = new PrismaClient();

const SALT_ROUNDS = parseInt(process.env.BCRYPT_SALT_ROUNDS ?? '12', 10);

const users = [
  { email: 'admin@finance.dev',   password: 'Admin@12345',   name: 'Admin User',    role: 'ADMIN'   as const },
  { email: 'analyst@finance.dev', password: 'Analyst@12345', name: 'Ana Analyst',   role: 'ANALYST' as const },
  { email: 'viewer@finance.dev',  password: 'Viewer@12345',  name: 'Victor Viewer', role: 'VIEWER'  as const },
];

// Helper to generate a date N days ago
const daysAgo = (n: number) => {
  const d = new Date();
  d.setDate(d.getDate() - n);
  d.setHours(0, 0, 0, 0);
  return d;
};

async function main() {
  console.log('🌱 Starting database seed...');

  // Upsert users so the seed is idempotent
  const createdUsers: Record<string, { id: string }> = {};

  for (const u of users) {
    const hashedPassword = await bcrypt.hash(u.password, SALT_ROUNDS);
    const user = await prisma.user.upsert({
      where: { email: u.email },
      update: {},
      create: {
        email: u.email,
        hashedPassword,
        name: u.name,
        role: u.role,
        status: 'ACTIVE',
      },
    });
    createdUsers[u.role] = { id: user.id };
    console.log(`  ✅ ${u.role}: ${u.email} (id: ${user.id})`);
  }

  const analystId = createdUsers['ANALYST']!.id;

  // 10 sample financial records for the analyst covering the past 3 months
  const sampleRecords = [
    { type: 'INCOME'  as const, amount: 5000.00, category: 'SALARY',        date: daysAgo(5),  description: 'Monthly salary - March' },
    { type: 'INCOME'  as const, amount: 1200.00, category: 'FREELANCE',     date: daysAgo(12), description: 'Website project' },
    { type: 'EXPENSE' as const, amount: 850.00,  category: 'RENT',          date: daysAgo(15), description: 'Monthly rent' },
    { type: 'EXPENSE' as const, amount: 200.00,  category: 'UTILITIES',     date: daysAgo(18), description: 'Electricity & water' },
    { type: 'EXPENSE' as const, amount: 320.00,  category: 'FOOD',          date: daysAgo(22), description: 'Groceries & dining' },
    { type: 'INCOME'  as const, amount: 5000.00, category: 'SALARY',        date: daysAgo(35), description: 'Monthly salary - February' },
    { type: 'EXPENSE' as const, amount: 150.00,  category: 'TRANSPORT',     date: daysAgo(40), description: 'Fuel and metro' },
    { type: 'INCOME'  as const, amount: 800.00,  category: 'INVESTMENT',    date: daysAgo(50), description: 'Dividend payout' },
    { type: 'EXPENSE' as const, amount: 75.00,   category: 'ENTERTAINMENT', date: daysAgo(55), description: 'Streaming subscriptions' },
    { type: 'EXPENSE' as const, amount: 500.00,  category: 'HEALTHCARE',    date: daysAgo(75), description: 'Annual health checkup' },
  ];

  for (const rec of sampleRecords) {
    await prisma.financialRecord.create({
      data: {
        userId: analystId,
        type: rec.type,
        amount: rec.amount,
        category: rec.category,
        date: rec.date,
        description: rec.description,
      },
    });
  }

  console.log(`  📊 Created ${sampleRecords.length} sample financial records for analyst`);
  console.log('\n✅ Seed complete!');
  console.log('\nTest credentials:');
  console.log('  admin@finance.dev   / Admin@12345');
  console.log('  analyst@finance.dev / Analyst@12345');
  console.log('  viewer@finance.dev  / Viewer@12345');
}

main()
  .catch((e) => {
    console.error('❌ Seed failed:', e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
