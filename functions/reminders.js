import { CronJob } from 'cron';
import { readFileSync } from 'fs';
import { getAllUsersWithBirthdayIsInSevenDays, getAllUsersWithBirthdayIsToday } from '../database/querys.js';

process.loadEnvFile();

const CHANNEL_ID = process.env.DISCORD_CHANNEL_ID;

export const rememberTomorrowsHoliday = (client) => {
    new CronJob('0 0 0 * * *', async () => {
        const holidays = JSON.parse(readFileSync('holidays.json'));
        const now = new Date();
        const tomorrow = new Date(now.getFullYear(), now.getMonth(), now.getDate() + 1)
            .toISOString().split('T')[0];
        const tomorrowsHolidays = holidays.filter(holiday => holiday.date === tomorrow);

        if (tomorrowsHolidays.length === 0) return;

        const channel = await client.channels.fetch(CHANNEL_ID);
        await channel.send(`@everyone Mañana es feriado!`);
    }, null, true, 'America/Santiago');
}

export const rememberTodaysHoliday = (client) => {
    new CronJob('0 0 0 * * *', async () => {
        const holidays = JSON.parse(readFileSync('holidays.json'));
        const today = new Date().toISOString().split('T')[0];
        const todaysHolidays = holidays.filter(holiday => holiday.date === today);

        if (todaysHolidays.length === 0) return;

        const channel = await client.channels.fetch(CHANNEL_ID);
        await channel.send(`@everyone Hoy es feriado 🎉`);
    }, null, true, 'America/Santiago');
}

export const rememberUserWithBirthdayIsInSevenDays = (client) => {
    new CronJob('0 0 0 * * *', async () => {
        const users = getAllUsersWithBirthdayIsInSevenDays();
        if (users.length === 0) return;

        const channel = await client.channels.fetch(CHANNEL_ID);
        for (const user of users) {
            await channel.send(
                `@everyone <@${user.discord_id}> estara de cumpleaños en 7 dias, ¡prepara un regalo 🎁!`
            );
        }
    }, null, true, 'America/Santiago');
}

export const rememberUserWithBirthdayIsToday = (client) => {
    new CronJob('0 0 0 * * *', async () => {
        const users = getAllUsersWithBirthdayIsToday();
        if (users.length === 0) return;

        const channel = await client.channels.fetch(CHANNEL_ID);
        for (const user of users) {
            await channel.send(
                `@everyone <@${user.discord_id}> ¡Feliz cumpleaños! 🎉`
            );
        }
    }, null, true, 'America/Santiago');
}