const { Events, Client, ActionRowBuilder, ButtonBuilder, GatewayIntentBits, EmbedBuilder, PermissionsBitField, Permissions, MessageManager, Embed, Collection, Colors, Message } = require('discord.js')
const { game_table } = require('../functions/listFunc.js')
const { execute } = require('./ready')
const fs = require('fs');

module.exports = {
    name: Events.InteractionCreate,
    
    async execute(interaction) {
            const json = JSON.parse(fs.readFileSync('./src/dataBase/bot.json'));
            const messageId = json.message_list_id;
            let channel = await interaction.guild.channels.cache.get("1061827241031508121");
            let message = await channel.messages.fetch(messageId.id).catch(err => {
                console.error(err);
            });
            let interactionUser;


            if (interaction.customId === 'remove_pc_games') {
                let bot = JSON.parse(fs.readFileSync(`./src/dataBase/bot.json`, 'utf-8'));
        
                let userr = JSON.parse(fs.readFileSync(`./src/dataBase/users/${interaction.user.username}.json`, 'utf-8'));
                let filteredArray = userr.data.games.filter(x => !interaction.values.includes(x.trim()));
                userr.data.games = filteredArray;
        
                const userData = JSON.stringify(userr);
        
                await interaction.reply({content: `Удаленно: \`${interaction.values}\`, теперь у тебя такие игры: \`${filteredArray}\``, ephemeral: true})
                fs.writeFileSync(`./src/dataBase/users/${interaction.user.username}.json`, userData)
                
                bot.list_history = [`-🔴 ${userr.userName} удалил из списка ${interaction.values} (PC)\n`,bot.list_history[0],bot.list_history[1],bot.list_history[2],bot.list_history[3]]
                fs.writeFileSync(`./src/dataBase/bot.json`, JSON.stringify(bot))
                interaction.message.delete()
        
                message.thread.send({ 
                    content: `${userr.userName} удалил игру`,
                    embeds: [ new EmbedBuilder()
                        .setTitle('🔴 Удаление игры (PC)')
                        .setColor(Colors.Red)
                        .setDescription(`**${userr.userName}** удалил из списка \`${interaction.values}\`(PC), после удаления у него такие игры:\n\`\`\`${userr.data.games}\`\`\``)
                        .setTimestamp(Date.now())
                    ] })
        
            } else if (interaction.customId === 'remove_android_games') {
                let bot = JSON.parse(fs.readFileSync(`./src/dataBase/bot.json`, 'utf-8'));
        
                let userr = JSON.parse(fs.readFileSync(`./src/dataBase/users/${interaction.user.username}.json`, 'utf-8'));
                let filteredArray = userr.data.android_games.filter(x => !interaction.values.includes(x));
                userr.data.android_games = filteredArray;
        
                const userData = JSON.stringify(userr);
        
                await interaction.reply({content: `Удаленно: \`${interaction.values}\`, теперь у тебя такие игры: \`${filteredArray}\``, ephemeral: true})
                fs.writeFileSync(`./src/dataBase/users/${interaction.user.username}.json`, userData)
                
                bot.list_history = [`-🔴 ${userr.userName} удалил из списка ${interaction.values} (Android)\n`,bot.list_history[0],bot.list_history[1],bot.list_history[2],bot.list_history[3]]
                fs.writeFileSync(`./src/dataBase/bot.json`, JSON.stringify(bot))
                interaction.message.delete()
        
                message.thread.send({ 
                    content: `${userr.userName} удалил игру`,
                    embeds: [ new EmbedBuilder()
                        .setTitle('🔴 Удаление игры (Android)')
                        .setColor(Colors.Red)
                        .setDescription(`**${userr.userName}** удалил из списка \`${interaction.values}\`(Android), после удаления у него такие игры:\n\`\`\`${userr.data.android_games}\`\`\``)
                        .setTimestamp(Date.now())
                    ] })
            }
            async function updateList() {
                const json = JSON.parse(fs.readFileSync('./src/dataBase/bot.json'));
                const messageId = json.message_list_id;
                let channel = await interaction.guild.channels.cache.get("1061827241031508121");
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
            
        }
}