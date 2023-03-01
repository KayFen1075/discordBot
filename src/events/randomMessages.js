const { Events, GuildScheduledEventManager } = require('discord.js')
const { execute } = require('./ready')
const { fileLog } = require('../functions/logs')

module.exports = {
    name: Events.MessageCreate,
    
    async execute(message) {
        if (message.author.bot === false) {
            fileLog(`[СООБЩЕНИЕ] ${message.author.username} (${message.author.id}) отправил сообщение: ${message.content}; в канале ${message.channel.name} (${message.channel.id}) на сервере ${message.guild.name} (${message.guild.id})`)
            if (message.content.toString().toLocaleUpperCase().search('КОГДА') >= 0) {
                const replyMessages = ['Завтра', 'Сейчас', 'Вчера', 'Послезавтра', `Через ${Math.floor(Math.random(0) * 31)}д`];
                await message.reply(replyMessages[Math.floor(Math.random(0) * replyMessages.length)])
            } else if (message.content.toString().toLocaleUpperCase().search('НЕГРЫ') + message.content.toString().toLocaleUpperCase().search('ПИДАРЫ') >= 1) {
                const msg = await message.reply('Согласен с этим выражением')
                msg.react('👍🏿')
            }
            if (message.channel.parentId === '1071945596090462238') {
                message.channel.setPosition(0)
            }
        } 
    }
}