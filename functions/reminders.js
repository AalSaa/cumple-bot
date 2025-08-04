import { CronJob } from 'cron';
import { getAllUsersWithBirthdayIsInSevenDays, getAllUsersWithBirthdayIsToday } from '../database/querys.js';

process.loadEnvFile();

const CHANNEL_ID = process.env.DISCORD_CHANNEL_ID;

export const rememberUserWithBirthdayIsInSevenDays = async (client) => {
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

export const rememberUserWithBirthdayIsToday = async (client) => {
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