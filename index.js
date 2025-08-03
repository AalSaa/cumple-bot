import { Client, GatewayIntentBits } from 'discord.js';
import { addBirthday, deleteBirthday } from './functions/commands.js';

process.loadEnvFile();

const TOKEN = process.env.DISCORD_TOKEN;

const client = new Client({ 
    intents: [GatewayIntentBits.Guilds, GatewayIntentBits.GuildMessages, GatewayIntentBits.MessageContent] 
});

client.once('ready', () => {
    console.log(`Bot listo como ${client.user.tag}`);
});

client.on('messageCreate', message => {
    if (message.author.bot) return;

    addBirthday(message);
    deleteBirthday(message);
});


client.login(TOKEN);