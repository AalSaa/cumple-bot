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

// Birthdays saved without zero padding (e.g. 1990-3-5) are not valid SQLite dates, so strftime returns NULL.
const normalizeBirthdays = () => {
    const users = db.prepare('SELECT id, birthday FROM discord_user').all();
    const updateBirthday = db.prepare('UPDATE discord_user SET birthday = ? WHERE id = ?');

    for (const { id, birthday } of users) {
        const [year, month, day] = birthday.split('-');
        const normalizedBirthday = `${year}-${month.padStart(2, '0')}-${day.padStart(2, '0')}`;
        if (normalizedBirthday !== birthday) updateBirthday.run(normalizedBirthday, id);
    }
}

// holidays.json only stores the holidays array, so its year comes from the dates themselves.
const isHolidaysJSONFromCurrentYear = () => {
    const currentYear = new Date().getFullYear();
    const holidays = JSON.parse(readFileSync('holidays.json', 'utf8'));
    return holidays.some(holiday => holiday.date.startsWith(`${currentYear}-`));
};

export const updateHolidaysJSONIfOutdated = async () => {
    if (existsSync('holidays.json') && isHolidaysJSONFromCurrentYear()) return;

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
normalizeBirthdays();
await updateHolidaysJSONIfOutdated();
