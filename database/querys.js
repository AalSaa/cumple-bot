import { pool } from "./db.js";

export const getAllUsersWithBirthdayIsInSevenDays = async () => {
    const query = `
        SELECT * FROM "discord_user"
        WHERE TO_CHAR(birthday, 'MM-DD') = TO_CHAR(CURRENT_DATE + INTERVAL '7 days', 'MM-DD');
    `;
    const result = await pool.query(query);
    return result.rows;
}

export const getAllUsersWithBirthdayIsToday = async () => {
    const query = `
        SELECT * FROM "discord_user"
        WHERE TO_CHAR(birthday, 'MM-DD') = TO_CHAR(CURRENT_DATE, 'MM-DD');
    `;
    const result = await pool.query(query);
    return result.rows;
}

export const userExistsByDiscordId = async (discordId) => {
    const query = 'SELECT EXISTS (SELECT 1 FROM "discord_user" WHERE discord_id = $1) AS exists';
    const values = [discordId];
    const result = await pool.query(query, values);
    return result.rows[0].exists;
}

export const postUser = async (user) => {
    try {
        const query = 'INSERT INTO "discord_user" (discord_id, birthday) VALUES ($1, $2)';
        const values = [user.id, user.birthday];
        await pool.query(query, values);
    } catch (error) {
        console.error('Error al guardar el usuario:', error);
    }
}

export const deleteUserByDiscordId = async (discordId) => {
    try {
        const query = 'DELETE FROM "discord_user" WHERE discord_id = $1';
        const values = [discordId];
        await pool.query(query, values);
    } catch (error) {
        console.error('Error al eliminar el usuario:', error);
    }
}