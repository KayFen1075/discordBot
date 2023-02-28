const { Events, GuildScheduledEventManager } = require('discord.js')
const { execute } = require('./ready')

module.exports = {
    name: Events.MessageCreate,
    
    async execute(message) {
        if (message.author.bot === false) {
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