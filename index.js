import { db } from './database/db.js';
import { Client, GatewayIntentBits } from 'discord.js';
import { analyzeAndSetupChannel } from './functions/channelUtils.js';
import { rememberUserWithBirthdayIsInSevenDays, rememberUserWithBirthdayIsToday } from './functions/reminders.js';
import { allBirthdays, addBirthday, deleteBirthday } from './functions/commands.js';

process.loadEnvFile();

const TOKEN = process.env.DISCORD_TOKEN;
const CHANNEL_ID = process.env.DISCORD_CHANNEL_ID;

const client = new Client({ 
    intents: [GatewayIntentBits.Guilds, GatewayIntentBits.GuildMessages, GatewayIntentBits.MessageContent] 
});

client.once('ready', async () => {
    console.log(`Bot listo como ${client.user.tag}`);

    await analyzeAndSetupChannel(client);

    rememberUserWithBirthdayIsInSevenDays(client);
    rememberUserWithBirthdayIsToday(client);
});

client.on('messageCreate', message => {
    if (message.author.bot) return;

    allBirthdays(message);
    addBirthday(message);
    deleteBirthday(message);
});


client.login(TOKEN);