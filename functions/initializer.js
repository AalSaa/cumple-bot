import axios from 'axios';
import { existsSync, readFileSync, writeFileSync } from 'fs';
import { db } from '../database/db.js';

const initializeDatabase = () => {
    db.prepare(
        `CREATE TABLE IF NOT EXISTS discord_user (
        id INTEGER PRIMARY KEY AUTOINCREMENT,
        discord_id TEXT NOT NULL,
        discord_username TEXT NOT NULL,
        birthday DATE NOT NULL)`
    ).run();
}

const isHolidaysJSONCreatedInCurrentYear = () => {
    const currentYear = new Date().getFullYear();
    const holidaysData = JSON.parse(readFileSync('holidays.json', 'utf8'));
    return holidaysData.year === currentYear;
};

const initializeHolidaysJSON = async () => {
    if (existsSync('holidays.json') && !(isHolidaysJSONCreatedInCurrentYear())) return;

    try {
        const response = await axios.get('https://api.boostr.cl/holidays.json');
        const holidays = response.data;
        const holidaysJSON = JSON.stringify(holidays.data, null, 4);

        writeFileSync('holidays.json', holidaysJSON);
    } catch (error) {
        console.error('Error al obtener los feriados:', error);
    }
};

initializeDatabase();
await initializeHolidaysJSON();