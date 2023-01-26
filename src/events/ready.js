const { Events ,EmbedBuilder, Colors, ActionRowBuilder, ButtonBuilder } = require('discord.js')
const fs = require('fs')
const { game_table } = require('../functions/listFunc.js')



module.exports = {
    name: Events.ClientReady,
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
            async function updateList() {
                const json = JSON.parse(fs.readFileSync('./src/dataBase/bot.json'));
                const messageId = json.message_list_id;
                let channel = await client.channels.cache.get("1061827241031508121");
                let message = await channel.messages.fetch(messageId.id).catch(err => {
                    console.error(err);
                });
                const embed_components = {
                    embeds: [new EmbedBuilder()
                        .setTitle('📜 Список игр')
                        .setDescription(`Список игр пользователей\n${game_table()}\nСообщение будет обновляться каждый раз при взаимодействии с списками. Команды для информации в <#1060755559231524954>`)
                        .setColor(Colors.Green)
                        .setTimestamp(Date.now())], components: [new ActionRowBuilder()
                            .addComponents([
                                new ButtonBuilder()
                                    .setCustomId('start_confern_1')
                                    .setLabel('🚀 Начать собрание')
                                    .setStyle('3'),
                                new ButtonBuilder()
                                    .setCustomId('plan_confern_1')
                                    .setDisabled(true)
                                    .setLabel('⏳ Запланировать собрание')
                                    .setStyle('1'),
                                new ButtonBuilder()
                                    .setCustomId('photo_confern')
                                    .setDisabled(true)
                                    .setLabel('📸 Посмотреть фото')
                                    .setStyle('1')
                            ])]
                }
                if (!message) {
                    message = await channel.send(embed_components);
                    json.message_list_id = message;
            
                    fs.writeFileSync('./src/dataBase/bot.json', JSON.stringify(json));
                    await message.startThread({
                        name: '📙 List logs',
                        autoArchiveDuration: 60,
                        reason: 'Логи списка, просьба сюда не писать.\n\n🟢 - Добавление в список\n🔴 - Удаление из списка',
                    });
                    await message.thread.send('Начало логов!')
                } else {
                    message.edit(embed_components);
                }
            }
        await updateList()
    },
};

