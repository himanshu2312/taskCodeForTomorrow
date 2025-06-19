import sqlite3 from 'sqlite3';
import { resolve } from 'path';
import { fileURLToPath } from 'url';
import bcrypt from 'bcryptjs';

const __filename = fileURLToPath(import.meta.url);
const __dirname = resolve(__filename, '..');

const dbPath = resolve(__dirname, './database.sqlite');

// Initialize SQLite database
const db = new sqlite3.Database(dbPath, (err) => {
    if (err) console.error('Failed to connect to DB:', err.message);
    else console.log('Connected to SQLite database');
});

db.serialize(() => {
    db.run(`
        CREATE TABLE IF NOT EXISTS users (
            id INTEGER PRIMARY KEY AUTOINCREMENT,
            email TEXT NOT NULL UNIQUE,
            password TEXT NOT NULL
        )
    `);

    db.run(`
        CREATE TABLE IF NOT EXISTS categories (
            id INTEGER PRIMARY KEY AUTOINCREMENT,
            name TEXT NOT NULL UNIQUE
        )
    `);

    db.run(`
        CREATE TABLE IF NOT EXISTS services (
            id INTEGER PRIMARY KEY AUTOINCREMENT,
            category_id INTEGER NOT NULL,
            name TEXT NOT NULL,
            type TEXT CHECK(type IN ('Normal', 'VIP')),
            FOREIGN KEY (category_id) REFERENCES categories(id) ON DELETE CASCADE
        )
    `);

    db.run(`
        CREATE TABLE IF NOT EXISTS service_price_options (
            id INTEGER PRIMARY KEY AUTOINCREMENT,
            service_id INTEGER NOT NULL,
            duration TEXT NOT NULL,
            price REAL NOT NULL,
            type TEXT CHECK(type IN ('Hourly', 'Weekly', 'Monthly')),
            FOREIGN KEY (service_id) REFERENCES services(id) ON DELETE CASCADE
        )
    `);

    // Check and insert admin user
    const email = 'admin@codesfortomorrow.com';
    const plainPassword = 'Admin123!@#';

    db.get('SELECT * FROM users WHERE email = ?', [email], async (err, row) => {
        if (err) return console.error('Error checking admin:', err.message);

        if (!row) {
            const hashed = await bcrypt.hash(plainPassword, 10);
            db.run('INSERT INTO users (email, password) VALUES (?, ?)', [email, hashed]);
            console.log('Admin user created');
        } else {
            console.log('Admin user already exists');
        }
    });
});

export default db;
