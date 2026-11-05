import { EmbedBuilder } from 'discord.js';
import { readFileSync } from 'fs';
import { getAllUsersOrderByBirthday, userExistsByDiscordId, postUser, deleteUserByDiscordId } from '../database/querys.js';

process.loadEnvFile();

const CHANNEL_ID = process.env.DISCORD_CHANNEL_ID;

const numRegex = /\b(\d{1,2})\/(\d{1,2})\/(\d{4})\b/;
const textRegex = /\b(\d{1,2})\s+de\s+([a-zA-ZáéíóúÁÉÍÓÚñÑ]+)\s+de\s+(\d{4})\b/;

const nameOfMonthsToNumber = {
    enero: '01', febrero: '02', marzo: '03', abril: '04',
    mayo: '05', junio: '06', julio: '07', agosto: '08',
    septiembre: '09', octubre: '10', noviembre: '11', diciembre: '12'
};

const numberOfMonthsToName = {
    '01': 'Enero', '02': 'Febrero', '03': 'Marzo', '04': 'Abril',
    '05': 'Mayo', '06': 'Junio', '07': 'Julio', '08': 'Agosto',
    '09': 'Septiembre', '10': 'Octubre', '11': 'Noviembre', '12': 'Diciembre'
};

export const allBirthdays = async (message) => {
    if (message.channel.id !== CHANNEL_ID) return;

    if (!message.content.toLowerCase().startsWith('!cumples')) return;

    const users = getAllUsersOrderByBirthday();

    const embed = new EmbedBuilder()
        .setTitle('Todos los Cumpleaños')
        .addFields(
            {
                name: '',
                value: users.length > 0 ? 
                    users.map(user => {
                        const birthday = user.birthday.split('-');
                        return `**${user.discord_username}**: ${birthday[2]} de ${numberOfMonthsToName[birthday[1]]}`;
                    }).join('\n') : 
                    'No hay cumpleaños registrados.'
            }
        )

    message.reply({ embeds: [embed] });
}

const UPCOMING_BIRTHDAYS_LIMIT = 5;
const MS_PER_DAY = 24 * 60 * 60 * 1000;

const getTodayInSantiago = () => {
    const [year, month, day] = new Intl.DateTimeFormat('en-CA', { timeZone: 'America/Santiago' })
        .format(new Date()).split('-').map(Number);
    return Date.UTC(year, month - 1, day);
}

const formatDaysLeft = (daysLeft) => {
    if (daysLeft === 0) return '¡hoy! 🎉';
    if (daysLeft === 1) return 'mañana';
    return `en ${daysLeft} días`;
}

export const upcomingBirthdays = (message) => {
    if (message.channel.id !== CHANNEL_ID) return;

    if (!message.content.toLowerCase().startsWith('!proximos')) return;

    const today = getTodayInSantiago();
    const currentYear = new Date(today).getUTCFullYear();

    const upcoming = getAllUsersOrderByBirthday()
        .map(user => {
            const [birthYear, month, day] = user.birthday.split('-').map(Number);
            const nextBirthdayYear = Date.UTC(currentYear, month - 1, day) < today ? currentYear + 1 : currentYear;
            const daysLeft = Math.round((Date.UTC(nextBirthdayYear, month - 1, day) - today) / MS_PER_DAY);
            return { user, daysLeft, age: nextBirthdayYear - birthYear };
        })
        .sort((a, b) => a.daysLeft - b.daysLeft)
        .slice(0, UPCOMING_BIRTHDAYS_LIMIT);

    const embed = new EmbedBuilder()
        .setTitle('Próximos Cumpleaños')
        .addFields(
            {
                name: '',
                value: upcoming.length > 0 ?
                    upcoming.map(({ user, daysLeft, age }) => {
                        const birthday = user.birthday.split('-');
                        const ageText = age > 0 ? ` (cumple ${age} 🎂)` : '';
                        return `**${user.discord_username}**: ${birthday[2]} de ${numberOfMonthsToName[birthday[1]]} — ${formatDaysLeft(daysLeft)}${ageText}`;
                    }).join('\n') :
                    'No hay cumpleaños registrados.'
            }
        );

    message.reply({ embeds: [embed] });
}

// Built in UTC and compared field by field because Date silently rolls invalid days over (31/02 -> 03/03).
const isValidDate = (day, month, year) => {
    const date = new Date(Date.UTC(year, month - 1, day));
    return date.getUTCFullYear() === Number(year)
        && date.getUTCMonth() === month - 1
        && date.getUTCDate() === Number(day);
}

export const addBirthday = async (message) => {
    if (message.channel.id !== CHANNEL_ID) return;

    if (!message.content.toLowerCase().startsWith('!addcumple')) return;

    if (!(message.content.match(numRegex) || message.content.match(textRegex))) {
        message.reply('Por favor, envía una fecha en el formato correcto: "DD/MM/YYYY" o "DD de Mes de YYYY".');
        return;
    }

    let match;
    if (message.content.match(textRegex)) {
        match = message.content.match(textRegex);
        
        if (!(match[2].toLowerCase() in nameOfMonthsToNumber)) {
            message.reply('No se ha reconocido el mes. Por favor, escribe el mes correctamente en español.');
            return;
        }

        match[2] = nameOfMonthsToNumber[match[2].toLowerCase()];
    } else match = message.content.match(numRegex);

    const [, rawDay, rawMonth, year] = match;
    const day = rawDay.padStart(2, '0');
    const month = rawMonth.padStart(2, '0');

    if (!isValidDate(day, month, year)) {
        message.reply('Fecha inválida. Por favor, verifica el día, mes y año.');
        return;
    }

    if (!message.author.globalName) {
        message.reply('No tienes un nombre de usuario global. Por favor, verifica tu configuración de Discord.');
        return;
    }

    if (userExistsByDiscordId(message.author.id)) {
        message.reply('Ya tienes una fecha de cumpleaños registrada.');
        return;
    }

    postUser({discord_id: message.author.id, discord_username: message.author.globalName, birthday: `${year}-${month}-${day}`});
    
    message.reply(`Se ha guardado tu cumpleaños: ${day}/${month}/${year} 📅`);
};

export const deleteBirthday = async (message) => {
    if (message.channel.id !== CHANNEL_ID) return;

    if (!message.content.toLowerCase().startsWith('!delcumple')) return;

    if (!(userExistsByDiscordId(message.author.id))) {
        message.reply('No tienes una fecha de cumpleaños registrada.');
        return;
    }

    deleteUserByDiscordId(message.author.id);
    
    message.reply(`Tu fecha de cumpleaños ha sido eliminada.`);
}

export const allHolidays = (message) => {
    if (message.channel.id !== CHANNEL_ID) return;

    if (!message.content.toLowerCase().startsWith('!feriados')) return;

    const holidays = JSON.parse(readFileSync('holidays.json'));
    
    const embed = new EmbedBuilder()
        .setTitle('Todos los Feriados')
        .addFields(
            {
                name: '',
                value: holidays.length > 0 ?
                    holidays.map(holiday => {
                    const holidayDate = holiday.date.split('-');
                    return `**${holiday.title}**: ${holidayDate[2]} de ${numberOfMonthsToName[holidayDate[1]]}`;
                }).join('\n') : 
                'No hay feriados registrados.'
            }
        );

    message.reply({ embeds: [embed] });
}