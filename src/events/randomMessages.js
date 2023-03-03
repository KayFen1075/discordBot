const { Events, GuildScheduledEventManager } = require('discord.js')
const { execute } = require('./ready')
const { fileLog } = require('../functions/logs')
const { giveAdvanced } = require('../functions/giveAdvanced')
const { xpAdd } = require('../functions/leveling')
const fs = require('fs')

module.exports = {
    name: Events.MessageCreate,
    
    async execute(message) {
        if (message.author.bot === false) {
            if (fs.existsSync(`./src/dataBase/users/${message.author.id}.json`)) {
                xpAdd(message.client, message.author.id, Math.floor(Math.random(1) * 5), message)
            }
            fileLog(`[СООБЩЕНИЕ] ${message.author.username} (${message.author.id}) отправил сообщение: ${message.content}; в канале ${message.channel.name} (${message.channel.id}) на сервере ${message.guild.name} (${message.guild.id})`)
            if (message.content.toString().toLocaleUpperCase().search('КОГДА') >= 0) {
                const replyMessages = ['Завтра', 'Сейчас', 'Вчера', 'Послезавтра', `Через ${Math.floor(Math.random(0) * 31)}д`];
                await message.reply(replyMessages[Math.floor(Math.random(0) * replyMessages.length)])
            } else if (message.content.toString().toLocaleUpperCase().search('НЕГРЫ') + message.content.toString().toLocaleUpperCase().search('ПИДАРЫ') >= 1) {
                const msg = await message.reply('Согласен с этим выражением')
                msg.react('👍🏿')
            }
            if (message.channel.parentId === '1071945596090462238') {
                giveAdvanced(message.client, 'Архиолог', message.author.id)
                message.channel.setPosition(0)
            }
        } 
    }
}