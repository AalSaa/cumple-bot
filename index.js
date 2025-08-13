import { Client, GatewayIntentBits } from 'discord.js';
import './functions/initializer.js';
import { analyzeAndSetupChannel } from './functions/channelUtils.js';
import { rememberTomorrowsHoliday, rememberTodaysHoliday, rememberUserWithBirthdayIsInSevenDays, rememberUserWithBirthdayIsToday } from './functions/reminders.js';
import { allBirthdays, addBirthday, deleteBirthday, allHolidays } from './functions/commands.js';

process.loadEnvFile();

const TOKEN = process.env.DISCORD_TOKEN;

const client = new Client({ 
    intents: [GatewayIntentBits.Guilds, GatewayIntentBits.GuildMessages, GatewayIntentBits.MessageContent] 
});

client.once('ready', async () => {
    console.log(`Bot listo como ${client.user.tag}`);

    await analyzeAndSetupChannel(client);

    rememberTomorrowsHoliday(client);
    rememberTodaysHoliday(client);
    rememberUserWithBirthdayIsInSevenDays(client);
    rememberUserWithBirthdayIsToday(client);
});

client.on('messageCreate', message => {
    if (message.author.bot) return;

    allBirthdays(message);
    addBirthday(message);
    deleteBirthday(message);
    allHolidays(message);
});


client.login(TOKEN);