/**
 * Creates a test user for security testing.
 * Run with: npx tsx scripts/create-test-user.ts
 * Requires DATABASE_URL in .env.local
 */
import { PrismaClient } from "@prisma/client";
import { randomBytes, scryptSync } from "node:crypto";

const db = new PrismaClient();

const TEST_EMAIL = "pentest@securevault.dev";
const TEST_PASSWORD = "PentestKF1@2024!";

function hashPassword(password: string) {
  const salt = randomBytes(16).toString("hex");
  const hash = scryptSync(password, salt, 64).toString("hex");
  return { hash, salt };
}

async function main() {
  const existing = await db.user.findUnique({ where: { email: TEST_EMAIL } });

  if (existing) {
    console.log("✓ Test user already exists:", TEST_EMAIL);
    console.log("  Password:", TEST_PASSWORD);
    return;
  }

  const { hash, salt } = hashPassword(TEST_PASSWORD);

  const user = await db.user.create({
    data: {
      email: TEST_EMAIL,
      companyName: "PentestCo",
      passwordHash: hash,
      passwordSalt: salt,
      emailVerified: new Date(), // skip verification for test user
    },
  });

  await db.vault.create({
    data: { name: "Bóveda de prueba", ownerId: user.id },
  });

  console.log("✓ Test user created");
  console.log("  Email:   ", TEST_EMAIL);
  console.log("  Password:", TEST_PASSWORD);
  console.log("  User ID: ", user.id);
}

main()
  .catch(console.error)
  .finally(() => db.$disconnect());
