import { db } from "./db.js";

export function getAllUsersWithBirthdayIsInSevenDays() {
	const stmt = db.prepare(`
    	SELECT * FROM discord_user
    	WHERE strftime('%m-%d', birthday) = strftime('%m-%d', date('now', '+7 days'));
  	`);
  	return stmt.all();
}

export function getAllUsersWithBirthdayIsToday() {
  	const stmt = db.prepare(`
    	SELECT * FROM discord_user
  		WHERE strftime('%m-%d', birthday) = strftime('%m-%d', 'now');
  	`);
  	return stmt.all();
}

export function userExistsByDiscordId(discordId) {
    const stmt = db.prepare('SELECT EXISTS (SELECT 1 FROM discord_user WHERE discord_id = ?) AS "exists"');
    return !!stmt.get(discordId).exists;
}

export function postUser(user) {
	try {
		db.prepare('INSERT INTO discord_user (discord_id, birthday) VALUES (?, ?)').run(user.discord_id, user.birthday);
	} catch (error) {
		console.error('Error al guardar el usuario:', error);
	}
}

export function deleteUserByDiscordId(discordId) {
	try {
		db.prepare('DELETE FROM discord_user WHERE discord_id = ?').run(discordId);
	} catch (error) {
		console.error('Error al eliminar el usuario:', error);
	}
}