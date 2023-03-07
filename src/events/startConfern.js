const { Events, ButtonStyle, StringSelectMenuBuilder, UserSelectMenuBuilder, Client, ActionRowBuilder, ButtonBuilder, GatewayIntentBits, EmbedBuilder, PermissionsBitField, Permissions, MessageManager, Embed, Collection, Colors, Message, ChannelType } = require('discord.js');
const fs = require('fs');
const { execute } = require('./ready');
const { fileLog } = require('../functions/logs')

const { get_game_list, check_game_in_list } = require('../functions/listFunc.js');
const { giveAdvanced } = require('../functions/giveAdvanced');

module.exports = {
    name: Events.InteractionCreate,

    async execute(interaction) {
        if (!fs.existsSync(`./src/dataBase/users/${interaction.user.id}.json`)) {
            return
        }
        function truncateText(text) {
            if (text.length > 60) {
              return text.substring(0, 60) + "..";
            }
            return text;
          }

        const interactionUser = interaction.user.id; 
        let subcommand = false;
        if (interaction.isCommand()) {
            subcommand = interaction.options._subcommand === 'create' && interaction.commandName === 'meet' 
        }
        let userr;
        if (fs.existsSync(`./src/dataBase/users/${interactionUser}.json`)) {
            userr = JSON.parse(fs.readFileSync(`./src/dataBase/users/${interactionUser}.json`, 'utf-8'));
        } else {
            return
        }

        
        
        if (interaction.isButton() || await subcommand && !interaction.options.get('subject')) {
            if (interaction.customId === 'start_confern_1' || await subcommand) {
                const games = get_game_list();
                function have_game(game) {
                    if (check_game_in_list(interactionUser, game) || check_game_in_list(interactionUser, game, "!")) {
                        return `🟩 Эта игра есть у тебя в списке`
                    } else {
                        return `🟨 Этой игры нету у тебя в списке`
                    }
                }

                let options = games.map(game => {
                    return {
                        label: game,
                        description: `${have_game(game)}`,
                        value: game,

                    }
                });
                const row = new ActionRowBuilder()
                    .addComponents(
                        new StringSelectMenuBuilder()
                            .setCustomId('start_confern_2')
                            .setPlaceholder('Выбрать игру/игры')
                            .addOptions(options)
                            .setMinValues(1)
                            .setMaxValues(games.length)
                    );
                interaction.reply({
                    content: `<@${interaction.user.id}> Начинаем!`,
                    tts: true,
                    embeds: [new EmbedBuilder()
                        .setTitle(`🚧 Создание собрания`)
                        .setColor(Colors.Yellow)
                        .setDescription(`Выберите игру для проведения собрания. Выбирать игры которых у тебя нету можно, но если ты в них можешь играть не забудь их добавить в список, что бы не создовать путаницы`)],
                    components: [row, new ActionRowBuilder().addComponents([new ButtonBuilder()
                        .setCustomId('stop_create_event')
                        .setLabel('Отмена')
                        .setStyle(ButtonStyle.Danger)])
                    ]
                });

            } else if (interaction.customId === 'stop_create_event') {
                interaction.message.delete();
            }
        } else if (interaction.isStringSelectMenu()) {
            if (interaction.customId === 'start_confern_2') {
                const users_files = fs.readdirSync('./src/dataBase/users')
                const selectMenu = new ActionRowBuilder().addComponents(
                    new UserSelectMenuBuilder()
                        .setCustomId(`start_confern_3`)
                        .setPlaceholder('Выбрать пользователей')
                        .setMaxValues(users_files.length)
                        .setMinValues(1)
                );
                interaction.message.edit({
                    content: `<@${interaction.user.id}> Продолжаем..`,
                    embeds: [new EmbedBuilder()
                        .setTitle(`🚧 Создание собрания`)
                        .setColor(Colors.Yellow)
                        .setDescription(`Вы выбрали: \n\`\`\`${interaction.values}\`\`\`\n Теперь выберите участников собрания. \n\n**Нельзя выбирать:**\n1) Ботов, это выведит ошибку\n2) Себя, тоже ошибка\n3) Тех кто не могу быть на собрании сейчас`)],
                    tts: true,
                    components: [selectMenu, new ActionRowBuilder().addComponents([new ButtonBuilder()
                        .setCustomId('stop_create_event')
                        .setLabel('Отмена')
                        .setStyle(ButtonStyle.Danger)])]
                })
                userr.createEvent.setup1 = interaction.values;
                const userData = JSON.stringify(userr);

                interaction.reply({content: 'Ага, вот какие у тебя фетиши..', ephemeral: true})
                fs.writeFileSync(`./src/dataBase/users/${interactionUser}.json`, userData)
            } 
        } else if (interaction.customId === 'start_confern_3') {
            if (fs.existsSync(`./src/dataBase/meets/${interaction.user.id}.json`)) {
                interaction.reply('Ты уже создал собрание! Выйди из него перед тем как создать новое `/meet leave ${найди себя}`(Это удалит собрание)')
            } else {
                let userList = [];
                let perms = [];

                const meetChannel = await interaction.guild.channels.cache.get('1074715039212253346')

                const voiceChannel = await interaction.guild.channels.create({
                    name: `${userr.userName}: ${truncateText(userr.createEvent.setup1.toString())} id♂${interaction.user.id}`,
                    type: ChannelType.GuildVoice,
                }); await voiceChannel.setParent('1060755232583319665');

                // await interaction.user.send({
                //     content: `https://discord.com/channels/${interaction.guildId}/${await voiceChannel.id}`,
                //     embeds: [new EmbedBuilder()
                //         .setTitle(`🎉 Вы создали собрание собрание!`)
                //         .setDescription(`Вы ${userr.userName} позвали поиграть в **${userr.createEvent.setup1}**!\nЗайти в голосовой канал можно [через эту ссылку](https://discord.com/channels/${interaction.guildId}/${await voiceChannel.id})`)
                //         .setColor(Colors.Green)
                //         .setTimestamp(Date.now())
                //     ]
                // })
                await interaction.values.forEach(async element => {
                    const user = await interaction.guild.members.cache.get(element);
                    userList.push(`<@${user.user.id}> `)
                    await perms.push({
                        id: element,
                        allow: [PermissionsBitField.Flags.Connect],
                    },
                        {
                            id: interaction.user.id,
                            allow: [PermissionsBitField.Flags.Connect],
                        },
                        {
                            id: interaction.guild.id,
                            deny: [PermissionsBitField.Flags.Connect],
                        })
                });

                meetChannel.send({
                    content: `<@${interaction.user.id}> создал собрание и позвал: ${userList} https://discord.com/channels/${interaction.guildId}/${await voiceChannel.id}`,
                    embeds: [new EmbedBuilder()
                        .setTitle(`🎉 Новое собрание!`)
                        .setDescription(`${userr.userName} позвал поиграть в **${userr.createEvent.setup1}**!\nВсе участники собрания: **<@${interaction.user.id}>, ${userList}**\nЗайти в голосовой канал можно [через эту ссылку](https://discord.com/channels/${interaction.guildId}/${await voiceChannel.id})`)
                        .setColor(Colors.Green)
                        .setTimestamp(Date.now())
                    ]
                })

                await voiceChannel.permissionOverwrites.set(await perms)

                userr.createEvent.setup2 = interaction.values;
                const userData = JSON.stringify(userr);
                fs.writeFileSync(`./src/dataBase/users/${interactionUser}.json`, userData)
                await interaction.message.edit({
                    content: `<@${interaction.user.id}> Начинаю массовую спам атаку`,
                    embeds: [new EmbedBuilder()
                        .setTitle(`🚧 Создание собрания`)
                        .setColor(Colors.Yellow)
                        .setDescription(`Вы выбрали: \n${await userList}\n\`\`\`${userr.createEvent.setup1}\`\`\`\n скоро начнёться собрание`)],
                    tts: true,
                    components: [new ActionRowBuilder().addComponents([new ButtonBuilder()
                        .setCustomId('ready_meet')
                        .setLabel('Готов')
                        .setStyle(ButtonStyle.Success)])]
                })

                let meet = {
                    users_list: interaction.values,
                    games_list: userr.createEvent.setup1,
                    channel: voiceChannel.id,
                    time_start: Date.now()
                }; 

                giveAdvanced(interaction.client, "Hello world", interaction.user.id)

                setTimeout(()=>{
                    interaction.message.delete()    
                }, 5000)
                const chech_users = setInterval(async ()=>{
                    const members = await voiceChannel.members.filter(member => !member.user.bot);
                    if (members.size === 0 && fs.existsSync(`./src/dataBase/meets/${interaction.user.id}.json`)) {
                        voiceChannel.delete()
                        const timeMeet = Date.now() - meet.time_start

                        let bot = JSON.parse(fs.readFileSync(`./src/dataBase/bot.json`))
                            bot.state[bot.state.length - 1] = bot.state[bot.state.length - 1] + timeMeet
                            fs.writeFileSync(`./src/dataBase/bot.json`, JSON.stringify(bot))

                        meetChannel.send(`<@${interaction.user.id}> ваше собрание было пустым, поэтому я его закрыл, оно длилось \`${Math.round(timeMeet / 60000 / 60)}ч, ${Math.round(timeMeet / 60000 % 60)}м\``)
                        fs.unlinkSync(`./src/dataBase/meets/${interaction.user.id}.json`)
                        clearInterval(chech_users)
                    }
                }, 300000)
                interaction.reply({ content: 'GayPaty StaRt', ephemeral: true })
                fileLog(`[MEET] ${interaction.user.username} создал собрание с ${userList} в ${voiceChannel.name} (${voiceChannel.id})
Участники собрания: ${interaction.values.join(', ')}
Время начала: ${new Date(meet.time_start).toLocaleString()}`)
                fs.writeFileSync(`./src/dataBase/meets/${interaction.user.id}.json`, JSON.stringify(meet))
            }
        } else if (interaction.subcommand === 'change' && interaction.options.get('subject')) {
            const value = (await interaction.options.get('subject')).value

            const users_files = fs.readdirSync('./src/dataBase/users')
            const selectMenu = new ActionRowBuilder().addComponents(
                new UserSelectMenuBuilder()
                    .setCustomId(`start_confern_3`)
                    .setPlaceholder('Выбрать пользователей')
                    .setMaxValues(users_files.length)
                    .setMinValues(1)
            );
            interaction.reply({
                content: `<@${interaction.user.id}> Продолжаем..`,
                embeds: [new EmbedBuilder()
                    .setTitle(`🚧 Создание собрания`)
                    .setColor(Colors.Yellow)
                    .setDescription(`Вы выбрали: \n\`\`\`${value}\`\`\`\n Теперь выберите участников собрания. \n\n**Нельзя выбирать:**\n1) Ботов, это выведит ошибку\n2) Себя, тоже ошибка\n3) Тех кто не могу быть на собрании сейчас`)],
                tts: true,
                components: [selectMenu, new ActionRowBuilder().addComponents([new ButtonBuilder()
                    .setCustomId('stop_create_event')
                    .setLabel('Отмена')
                    .setStyle(ButtonStyle.Danger)])]
            })
            userr.createEvent.setup1 = value.split(',');
            const userData = JSON.stringify(userr);

            fs.writeFileSync(`./src/dataBase/users/${interactionUser}.json`, userData)
            return
        }
    }
}