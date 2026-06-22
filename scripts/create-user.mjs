import Database from "better-sqlite3";
import { randomBytes } from "node:crypto";
import bcrypt from "bcryptjs";
import path from "node:path";
import { fileURLToPath } from "node:url";

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const dbPath = path.join(__dirname, "../prisma/dev.db");

const db = new Database(dbPath);

const id = randomBytes(8).toString("hex");
const hash = await bcrypt.hash("test1234", 12);
const now = Date.now();

db.prepare(`
  INSERT OR REPLACE INTO User (id, email, name, password, createdAt)
  VALUES (?, ?, ?, ?, ?)
`).run(id, "test@test.de", "Test User", hash, now);

const user = db.prepare("SELECT * FROM User WHERE email = ?").get("test@test.de");
console.log("User erstellt:", user);

db.close();