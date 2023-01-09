import { config } from "dotenv";

import { ActionRow, ChannelManager, Client, discordSort, GatewayIntentBits, Message, Routes, StringSelectMenuBuilder, StringSelectMenuComponent } from 'discord.js';
import { REST } from "@discordjs/rest";
import clearMessages from './commands/clear.js'
import moneyMessage from './commands/money.js'
import list from './commands/list.js'
import { ActionRowBuilder, EmbedBuilder, SelectMenuBuilder, SelectMenuOptionBuilder } from "@discordjs/builders";

config();
const TOKEN = process.env.BOT_TOKEN;

const client = new Client({
    intents: [
        GatewayIntentBits.Guilds,
        GatewayIntentBits.GuildMessages,
        GatewayIntentBits.MessageContent
    ]
})

const rest = new REST({ version: '10'}).setToken(TOKEN);

// Запуск слеш команд
async function main() {
    const commands = [clearMessages, moneyMessage, list]
    try {
        console.log('Начало проверки команд (/)');
        await rest.put(Routes.applicationCommands('1060761793204596846'), { body: commands });
        console.log('Конец проверки (/)');
        client.login(TOKEN); 
    } catch (error) {
        console.log(error);
    }
}; main();


client.on('ready', ()=>{
    console.log(`${client.user.tag} активирован!`);
})

client.on('interactionCreate', (interaction) => {
    if (interaction.isChatInputCommand() && interaction.commandName === 'list') {
        console.log('Use `list` command');
       if (interaction.options.getSubcommand() === 'remove') {
        console.log('Use subcommand `list remove`');

        const menu = new ActionRowBuilder().setComponents(
            new SelectMenuBuilder()
            .setCustomId('games-selectiopn').setOptions([
                {label: '1', value: '1'},
                {label: '2', value: '2'}
            ])
            )

        interaction.reply({
            components: [menu.toJSON()]
        })
       }
    }

    
    if (interaction.isChatInputCommand() && interaction.commandName == 'clear') { // Команда Clear
        const count = interaction.options.get('count').value
        interaction.channel.bulkDelete(count)
        interaction.reply(`Удалено ${count} сообщений!`)
        console.log(`Удалено ${count} сообщений! из канала ${interaction.channel.name}(${interaction.channelId})`);
        setTimeout(()=>interaction.deleteReply(), 5000)
    }
})



client.on('messageCreate', (message)=>{
    if (message.author.bot == false) {
        if (message.content.toString().toLocaleUpperCase().search('КОГДА') >= 0) {
            const replyMessages = ['Завтра', 'Сейчас', 'Вчера', 'Послезавтра', `Через ${Math.floor(Math.random(0) * 31)}д`];
            message.reply(replyMessages[Math.floor(Math.random(0) * replyMessages.length)])
        }
        console.log( `${message.author.username}: ${message.content} ///#${message.channel.name}\\${message.channelId} ~ ${message.createdAt.toDateString()}`);
    console.log(bot);
    const logChannel = bot.channels.cache.filter('1060771841452560507');
    logChannel.send(`Пользователь ${message.author.tag}(${message.author.id}) отправил сообщение:
                    ${message.content}`)
}})


client.on('ready', (a) => {
    client.user.setActivity(`👉👌💦`);
    client.user.setStatus('idle');
    
})