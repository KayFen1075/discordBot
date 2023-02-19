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
            const interactionUser = interaction.user.id;

            if (interaction.customId === 'remove_pc_games') {
                let bot = JSON.parse(fs.readFileSync(`./src/dataBase/bot.json`, 'utf-8'));
        
                let userr = JSON.parse(fs.readFileSync(`./src/dataBase/users/${interactionUser}.json`, 'utf-8'));
                let filteredArray = userr.data.games.filter(x => !interaction.values.includes(x.trim()));
                userr.data.games = filteredArray;
        
                const userData = JSON.stringify(userr);
        
                await interaction.reply({content: `Удаленно: \`${interaction.values}\`, теперь у тебя такие игры: \`${filteredArray}\``, ephemeral: true})
                fs.writeFileSync(`./src/dataBase/users/${interactionUser}.json`, userData)
                
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
        
                let userr = JSON.parse(fs.readFileSync(`./src/dataBase/users/${interactionUser}.json`, 'utf-8'));
                let filteredArray = userr.data.android_games.filter(x => !interaction.values.includes(x));
                userr.data.android_games = filteredArray;
        
                const userData = JSON.stringify(userr);
        
                await interaction.reply({content: `Удаленно: \`${interaction.values}\`, теперь у тебя такие игры: \`${filteredArray}\``, ephemeral: true})
                fs.writeFileSync(`./src/dataBase/users/${interactionUser}.json`, userData)
                
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
                const gameTable = await game_table()

                let user_name_description = [];
                gameTable[0].forEach((user, i) => user_name_description.push({ name: user, value: `\`\`\`js\n${gameTable[1][i]}\`\`\``, inline: true }))

                const embed_components = {
                    embeds: [
                    new EmbedBuilder()
                        .setTitle('🧑🏾‍❤️‍🧑🏿 Список игр пользователей')   
                        .addFields(user_name_description)
                        .setColor(Colors.Green)
                    ,    
                    new EmbedBuilder()
                        .setTitle('🖥️ ПК игры')
                        .setDescription(gameTable[2]+gameTable[3])
                        .setColor(Colors.Green)
                        .setTimestamp(Date.now())
                    ,
                    new EmbedBuilder()
                            .setTitle(`⌛ Короткая история:`)
                            .setColor(Colors.Green)
                            .setDescription(`${gameTable[4]}**Команды для списка:**\n\`/list add \${game} ?{android} ?{user}\` - Добавить в список игру, можно через \`,\`. Писать 1 в 1, кроме больших букв на них пофиг\n\`/list remove\` - Удалить игры из списка, выбрать из меню.\n\`android\` - может быть true или false, изначально flase.\n\`user\` - влиять на чужой список игр.`)
                    ], components: [new ActionRowBuilder()
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
            async function updateRegister() {
                const json = JSON.parse(fs.readFileSync('./src/dataBase/bot.json'));
                let channel = await interaction.guild.channels.cache.get("1061827016518815845");
                let message
    
                const messageId = json.message_register_id;
                if (messageId !== null) {
                    message = await channel.messages.fetch(messageId.id).catch(err => {
                        console.error(err);
                    });
                } else {
                    message = false
                }
                
                
                const gameTable = await game_table()

            let user_name_description = [];
            gameTable[0].forEach((user, i) => user_name_description.push({ name: user, value: `\`\`\`js\n${gameTable[1][i]}\`\`\``, inline: true }))

            
            const embed_components = {
                embeds: [new EmbedBuilder()
                    .setTitle('🐸 Подать заявку 🪪')
                    .setDescription(`**Добро пожаловать в хажабу, это приватный сервер для общения!**\n\nОсновная суть хажабы это проведение собраний, просмотр списков(все игры которые есть у разных людей), голосовые фишки, новости о раздачах игр и так же различные нейросети.\nВсё работает через бота <@1060761793204596846>, если он не работает то есть канал *если бот здох*. Бот использует различные нейросети благодаря чему он может помогать и выполнять многие функции.\n\nВот все участники и их игры, мб кому-то понадобиться:\n`)
                    .addFields(user_name_description)
                    .setColor(Colors.Green)
                    .setTimestamp(Date.now()),
                    new EmbedBuilder()
                        .setTitle('🖥️ ПК игры')
                        .setDescription(gameTable[2]+gameTable[3])
                        .setColor(Colors.Green)
                        .setTimestamp(Date.now())
                ], components: [new ActionRowBuilder()
                        .addComponents([
                            new ButtonBuilder()
                                .setCustomId('register')
                                .setLabel('✍️ Подать заявку')
                                .setStyle('3')
                        ])]
            }
            if (!message) {
                message = await channel.send(embed_components);
                json.message_register_id = message;
        
                fs.writeFileSync('./src/dataBase/bot.json', JSON.stringify(json));
            } else {
                message.edit(embed_components);
            }
            }
            updateRegister()
        }
}