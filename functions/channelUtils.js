import { AttachmentBuilder, EmbedBuilder } from 'discord.js';
import { CronJob } from 'cron';

process.loadEnvFile();

const CHANNEL_ID = process.env.DISCORD_CHANNEL_ID;

const deleteAllMessagesInChannel = async (channel) => {
    let deleted;
    do {
        deleted = await channel.bulkDelete(100);
    } while (deleted.size !== 0);
}

const sendWelcomeMessage = (channel) => {
    const fileCake = new AttachmentBuilder('./public/images/png/cake.png');
    const filePenguin = new AttachmentBuilder('./public/images/png/penguin.png');

    const embed = new EmbedBuilder()
        .setTitle('CumpleBot!')
        .setDescription('CumpleBot sirve para guardar y avisar los cumpleaños de los usuarios de este servidor 🎉')
        .addFields(
            {
                name: '¿Como agregar mi cumpleaños? 🤔',
                value: 'Puedes agregar tu cumpleaños usando los comandos:\n' +
                    '- `!addcumple DD/MM/YYYY`\n' +
                    '- `!addcumple DD de Mes de YYYY`'
            },
            {
                name: '¿Como eliminar mi cumpleaños? ❌',
                value: 'Puedes eliminar tu cumpleaños usando el comando `!delcumple`.'
            },
            {
                name: '¿Como ver todos los cumpleaños? 🎂',
                value: 'Puedes ver tu cumpleaños y el de los demás usando el comando `!cumples`.'
            },
            {
                name: '¿Como ver los feriados? 📅',
                value: 'Puedes ver los feriados usando el comando `!feriados`.'
            }
        )
        .setThumbnail('attachment://cake.png')
        .setImage('attachment://penguin.png');

    channel.send({ embeds: [embed], files: [fileCake, filePenguin] });
}

const setupChannel = async (channel) => {
    await deleteAllMessagesInChannel(channel);
    sendWelcomeMessage(channel);
}

const analyzeChannel = async (channel, client) => {
    const messages = await channel.messages.fetch({ after: '0', limit: 1 });
    const firstMessage = messages.first();

    if (!firstMessage || firstMessage.author.id !== client.user.id) return true;

    const embed = firstMessage.embeds[0];

    if (!embed || embed.title !== 'CumpleBot!') return true;
}

export const analyzeAndSetupChannel = async (client) => {
    const channel = await client.channels.fetch(CHANNEL_ID);

    let needsSetup = await analyzeChannel(channel, client);
    if (needsSetup) await setupChannel(channel);

    new CronJob('59 23 * * 0', async () => {
        needsSetup = await analyzeChannel(channel, client);
        if (needsSetup) await setupChannel(channel);
    }, null, true, 'America/Santiago');
}