const { EmbedBuilder, Colors, ActionRowBuilder, ButtonBuilder } = require('discord.js')
const fs = require('fs')


module.exports = {
    name: 'ready',
    once: true,

    async execute(client) {
        console.log(`${client.user.tag} активирован!`);
        client.user.setActivity(`👉👌💦`);
        client.user.setStatus('idle');
        const message = new EmbedBuilder()
            .setTitle('🟢 Бот был запущен!')
            .setDescription('Бот был запущен через консоль.')
            .setColor(Colors.Green)
            .setTimestamp(Date.now())

        await client.channels.cache.get("1060771841452560507")
            .send({
                content: '<@1060761793204596846> запустился', components: [
                    new ActionRowBuilder().addComponents([
                        new ButtonBuilder().setCustomId('happyMessage').setLabel('🎉 Позравляю').setStyle(3),
                        new ButtonBuilder().setCustomId('restartButton').setLabel('🔁 Перезагрузить').setStyle(1),
                        new ButtonBuilder().setCustomId('stopButton').setLabel('🛑 Выключить бота').setStyle(4)
                    ])
                ], embeds: [message]
            })

            async function pickPresence () {
                const option = Math.floor(Math.random() * statusArray.length);
    
                try {
                    await client.user.setPresence({
                        activities: [
                            {
                                name: statusArray[option].content,
                                type: statusArray[option].type,
    
                            },
                        
                        ],
    
                        status: statusArray[option].status
                    })
                } catch (error) {
                    console.error(error);
                }
            }
    },
};

