import Database from 'better-sqlite3';

export const db = new Database('./cumple_bot.db');

db.prepare(
    `CREATE TABLE IF NOT EXISTS discord_user (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    discord_id TEXT NOT NULL,
    discord_username TEXT NOT NULL,
    birthday DATE NOT NULL)`
).run();
