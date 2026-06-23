// Legt einen User direkt in der Neon-DB an (zum Seeden / Admin).
// Nutzung: node scripts/create-user.mjs <benutzername> <passwort>
import { config } from "dotenv";
config({ path: ".env.local" });

import { PrismaClient } from "@prisma/client";
import { PrismaPg } from "@prisma/adapter-pg";
import { Pool } from "pg";
import bcrypt from "bcryptjs";

const username = process.argv[2];
const password = process.argv[3];

if (!username || !password) {
  console.error("Nutzung: node scripts/create-user.mjs <benutzername> <passwort>");
  process.exit(1);
}

const prisma = new PrismaClient({
  adapter: new PrismaPg(new Pool({ connectionString: process.env.DATABASE_URL })),
});

const passwordHash = await bcrypt.hash(password, 12);

// Idempotent: existiert der Username schon, wird nur das Passwort aktualisiert.
const user = await prisma.user.upsert({
  where: { username },
  update: { password: passwordHash },
  create: { username, name: username, password: passwordHash },
});

console.log("User angelegt/aktualisiert:", { id: user.id, username: user.username });

await prisma.$disconnect();
