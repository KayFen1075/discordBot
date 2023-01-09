import { config } from "dotenv";

import { Client, GatewayIntentBits, Routes } from 'discord.js';
import { REST } from "@discordjs/rest";
import clearMessages from './commands/clear.js'

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
    const commands = [clearMessages]
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
    if (interaction.isChatInputCommand() && interaction.commandName == 'remove-money') {
        interaction.reply({ content: `Был создан тикет по запросу на снятие с карты ${interaction.options.get('card').value}`})
    }
    if (interaction.memberPermissions) {
        if (interaction.isChatInputCommand() && interaction.commandName == 'clear') {
            const count = interaction.options.get('count').value
            interaction.channel.bulkDelete(count)
            interaction.reply(`Удалено ${count} сообщений!`)
            console.log(`Удалено ${count} сообщений!`);
            setTimeout(()=>interaction.deleteReply(), 5000)
        }
    }
})

client.on('messageCreate', (message)=>{
    if (message.author.bot == false) {
        if (message.content.toString().toLocaleUpperCase().search('КОГДА') >= 0) {
            const replyMessages = ['Завтра', 'Сейчас', 'Вчера', 'Послезавтра', `Через ${Math.floor(Math.random(1, 30))}д`];
            message.reply(replyMessages[Math.floor(Math.random(0) * replyMessages.length)])
        }
        console.log( `${message.author.username}: ${message.content} ///#${message.channel.name}\\${message.channelId} ~ ${message.createdAt.toDateString()}`);
    }
})

client.on('guildMemberAdd', (member) => {
    console.log('На сервер зашёл человек');
})