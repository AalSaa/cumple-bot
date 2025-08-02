import { Client, GatewayIntentBits } from 'discord.js';
import User from './models/user.js';
import config from './config.json' with { type: 'json' };
const TOKEN = config.token;

const client = new Client({ 
    intents: [GatewayIntentBits.Guilds, GatewayIntentBits.GuildMessages, GatewayIntentBits.MessageContent] 
});

const numRegex = /\b(\d{1,2})\/(\d{1,2})\/(\d{4})\b/;
const textRegex = /\b(\d{1,2})\s+de\s+([a-zA-ZáéíóúÁÉÍÓÚñÑ]+)\s+de\s+(\d{4})\b/;

const months = {
    enero: '01', febrero: '02', marzo: '03', abril: '04',
    mayo: '05', junio: '06', julio: '07', agosto: '08',
    septiembre: '09', octubre: '10', noviembre: '11', diciembre: '12'
};

client.once('ready', () => {
    console.log(`Bot listo como ${client.user.tag}`);
});

client.on('messageCreate', message => {
    if (message.author.bot) return;

    let match;
    let isMatched = false;
    if (message.content.match(numRegex)) {
        match = message.content.match(numRegex);
        isMatched = true;
    } else if (message.content.match(textRegex)) {
        match = message.content.match(textRegex);

        if (!match[2].toLowerCase() in months) {
            message.reply('No se ha reconocido el mes. Por favor, escriba bien el mes en español.');
            return;
        }

        match[2] = months[match[2].toLowerCase()];
        isMatched = true;
    } else {
        message.reply('Por favor, envía una fecha en el formato correcto: "DD/MM/YYYY" o "DD de Mes de YYYY".');
        return;
    }

    const [, day, month, year] = match;
    message.reply(`<@${message.author.id}> Fecha recibida: ${day}/${month}/${year}`);
    const newUser = new User({ id: message.author.id, birthday: new Date(`${year}-${month}-${day}`) });

    console.log(newUser);
});


client.login(TOKEN);