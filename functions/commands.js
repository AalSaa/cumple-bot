import { userExistsByDiscordId, postUser, deleteUserByDiscordId } from '../database/querys.js';

const numRegex = /\b(\d{1,2})\/(\d{1,2})\/(\d{4})\b/;
const textRegex = /\b(\d{1,2})\s+de\s+([a-zA-ZáéíóúÁÉÍÓÚñÑ]+)\s+de\s+(\d{4})\b/;

const months = {
    enero: '01', febrero: '02', marzo: '03', abril: '04',
    mayo: '05', junio: '06', julio: '07', agosto: '08',
    septiembre: '09', octubre: '10', noviembre: '11', diciembre: '12'
};

const isValidDate = (day, month, year) => {
    const date = new Date(`${year}-${month}-${day}`);
    return date instanceof Date && !isNaN(date);
}

export const addBirthday = async (message) => {
    if (!message.content.startsWith('!addCumple')) return;

    if (!(message.content.match(numRegex) || message.content.match(textRegex))) {
        message.reply('Por favor, envía una fecha en el formato correcto: "DD/MM/YYYY" o "DD de Mes de YYYY".');
        return;
    }

    let match;
    if (message.content.match(textRegex)) {
        match = message.content.match(textRegex);
        
        if (!(match[2].toLowerCase() in months)) {
            message.reply('No se ha reconocido el mes. Por favor, escribe el mes correctamente en español.');
            return;
        }

        match[2] = months[match[2].toLowerCase()];
    } else match = message.content.match(numRegex);

    const [, day, month, year] = match;

    if (!isValidDate(day, month, year)) {
        message.reply('Fecha inválida. Por favor, verifica el día, mes y año.');
        return;
    }

    if (userExistsByDiscordId(message.author.id)) {
        message.reply('Ya tienes una fecha de cumpleaños registrada.');
        return;
    }

    postUser({discord_id: message.author.id, birthday: `${year}-${month}-${day}`});
    
    message.reply(`<@${message.author.id}> Fecha recibida: ${day}/${month}/${year}`);
};

export const deleteBirthday = async (message) => {
    if (!message.content.startsWith('!delCumple')) return;

    if (!(userExistsByDiscordId(message.author.id))) {
        message.reply('No tienes una fecha de cumpleaños registrada.');
        return;
    }

    deleteUserByDiscordId(message.author.id);
    
    message.reply(`<@${message.author.id}> Tu fecha de cumpleaños ha sido eliminada.`);
}