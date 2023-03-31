const { Events, ActionRowBuilder, ButtonStyle, ButtonBuilder, EmbedBuilder, StringSelectMenuBuilder, Colors, UserSelectMenuBuilder, BaseSelectMenuBuilder } = require('discord.js');
const { get_game_list, check_game_in_list } = require('../functions/listFunc');
const fs = require('fs');
const { RoundTime } = require('../functions/Mthon');
const config = require('../config.json');

module.exports = {
    name: Events.InteractionCreate,

    async execute(interaction) {

        if (!fs.existsSync(`./src/dataBase/users/${interaction.user.id}.json`)) {
            return
        }

        const subcommand = interaction?.options?._subcommand
        let userData = JSON.parse(fs.readFileSync(`./src/dataBase/users/${interaction.user.id}.json`));
        
        if (subcommand === 'plan' || interaction.customId === 'plan_meet_1') {
            let games = await interaction?.options?.get('subject') ? (await interaction.options.get('subject').value).split(',') : get_game_list()
            
            function have_game(game) {
                if (check_game_in_list(interaction.user.id, game) || check_game_in_list(interaction.user.id, game, "!")) {
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
                        .setCustomId('plan_meet_2')
                        .setPlaceholder('Выбрать игру/игры')
                        .addOptions(options)
                        .setMinValues(1)
                        .setMaxValues(games.length)
                );
            interaction.reply({
                content: `<@${interaction.user.id}> Начинаем!`,
                embeds: [new EmbedBuilder()
                    .setTitle(`🚧 Планирование собрания`)
                    .setColor(Colors.Yellow)
                    .setFooter({ text: `Планирование собрания`, iconUrl: interaction.user.avatarURL()})
                    .setDescription(`Выберите игру/игры для проведения собрания. Выбирать игры которых у тебя нету можно, но если ты в них можешь играть не забудь их добавить в список, что бы не создовать путаницы`)],
                components: [row, new ActionRowBuilder().addComponents([new ButtonBuilder()
                    .setCustomId('stop_create_event')
                    .setLabel('Отмена')
                    .setStyle(ButtonStyle.Danger)])
                ]
            });

            userData.planMeet = {
                "id": interaction.user.id,
                "subjects": games,
                "users_invited": [],
                "users_accepted": [],
                "users_later": [],
                "users_someone": [],
                "users_declined": [], // { "id": "id", "reason": "reason"}
                "users_requested": [],
                "type": "time",
                "time": null,
                "message_id": null,
                "ping_30_min": false,
                "ping_5_min": false,
                "emoji": null,
            }

            fs.writeFileSync(`./src/dataBase/users/${interaction.user.id}.json`, JSON.stringify(userData, null, 4))
        } else if ( interaction.customId === 'plan_meet_2' ) {
            let games = interaction.values;

            const users_files = fs.readdirSync('./src/dataBase/users')

            const selectMenu = new ActionRowBuilder().addComponents(
                new UserSelectMenuBuilder()
                    .setCustomId(`plan_meet_3`)
                    .setPlaceholder('Выбрать пользователей')
                    .setMaxValues(users_files.length)
                    .setMinValues(1)
            );
            interaction.message.edit({
                content: `<@${interaction.user.id}> Продолжаем..`,
                embeds: [new EmbedBuilder()
                    .setTitle(`🚧 Планирование собрания`)
                    .setColor(Colors.Yellow)
                    .setDescription(`Вы выбрали: \n\`\`\`${games.join(', ')}\`\`\`\n Теперь выберите участников собрания. \n\n**Нельзя выбирать:**\n1) Ботов, это выведит ошибку\n2) Себя, тоже ошибка\n3) Тех кто не могу быть на собрании сейчас`)],
                components: [selectMenu, new ActionRowBuilder().addComponents([new ButtonBuilder()
                    .setCustomId('stop_create_event')
                    .setLabel('Отмена')
                    .setStyle(ButtonStyle.Danger)])]
            })
            
            userData.planMeet.subjects = games

            interaction.reply({content: 'Ага, вот какие у тебя фетиши..', ephemeral: true})
            fs.writeFileSync(`./src/dataBase/users/${interaction.user.id}.json`, JSON.stringify(userData, null, 4))
        } else if ( interaction.customId === 'plan_meet_3' ) {
            let users = interaction.values;

            if (users.includes(interaction.user.id)) {
                interaction.reply({content: 'Нельзя выбирать себя', ephemeral: true})
                return
            }

            function getOptionsThisDay() {
                let options = []
                
                const date = new Date();
                let hours = date.getHours() + 1
                const minutes = date.getMinutes();

                hours < 10 ? hours = 10 : null;
                if (hours > 21) {
                    options.push({
                        label: `Попробуй завтра!`,
                        emoji: '<:segodna:1084743616599167026>',
                        description: `На сегодня уже нельзя планировать собрание`,
                        value: 'error'
                    })
                    return options
                }

                for (let i = hours; i <= 21; i++) {
                    for (let j = 0; j < 60; j += 30) {
                        const time = new Date(date.getFullYear(), date.getMonth(), date.getDate(), i, j).getTime().toString()
                        options.push({
                            label: `Сегодня в ${RoundTime(i)}:${RoundTime(j)}`,
                            emoji: '<:segodna:1084743616599167026>',
                            description: `${RoundTime(i)}:${RoundTime(j)} по Кивскому времени(Сейчас ${RoundTime(date.getHours())}:${RoundTime(minutes)})`,
                            // value is tiks
                            value: time
                        })
                    }
                }
                
                return options
            }
            const { RoundTime } = require('../functions/Mthon');
            function getOptionsNextDay() {
                let options = []

                const date = new Date();

                for (let i = 10; i <= 21; i++) {
                    for (let j = 0; j === 30 || j === 0; j += 30) {
                        const time = new Date(date.getFullYear(), date.getMonth(), date.getDate() + 1, i, j).getTime().toString()
                        options.push({
                            label: `Завтра в ${RoundTime(i)}:${RoundTime(j)}`,
                            emoji: '<:zavtra:1084744738911031306>',
                            description: `${RoundTime(i)}:${RoundTime(j)} по Кивскому времени`,
                            // value hours + minutes + date + 1 day
                            value: time
                        })
                    }
                }
                return options
            }
            function getOptionsLastDay() {
                let options = []

                const date = new Date();

                for (let i = 10; i <= 21; i++) {
                    for (let j = 0; j < 60; j += 30) {
                        const time = new Date(date.getFullYear(), date.getMonth(), date.getDate() + 2, i, j).getTime().toString()
                        options.push({
                            label: `Послезавтра в ${RoundTime(i)}:${RoundTime(j)}`,
                            emoji: '<:posle_zavtra:1084744736398639104>',
                            description: `${RoundTime(i)}:${RoundTime(j)} по Кивскому времени`,
                            // value hours + minutes + date + 2 day
                            value: time
                        })
                    }
                }
                return options
            }
            
            // console.log(getOptionsNextDay());
            // console.log(getOptionsLastDay());

            const thisDay = new ActionRowBuilder().addComponents(
                new StringSelectMenuBuilder()
                    .setCustomId(`plan_meet_4thisDay`)
                    .setPlaceholder('🌈 СЕГОДНЯ')
                    .addOptions(
                        getOptionsThisDay()
                    )
            );
            const nextDay = new ActionRowBuilder().addComponents(
                new StringSelectMenuBuilder()
                    .setCustomId(`plan_meet_4nextDay`)
                    .setPlaceholder('🔥 ЗАВТРА (Популярно у геев)')
                    .addOptions(
                        getOptionsNextDay()
                    )
            );
            const lastDay = new ActionRowBuilder().addComponents(
                new StringSelectMenuBuilder()
                    .setCustomId(`plan_meet_4lastDay`)
                    .setPlaceholder('🫥 ПОСЛЕЗАВТРА')
                    .addOptions(
                        getOptionsLastDay()
                    )
            );
            console.log(nextDay);

            let ping_users = users.map(user => `<@${user}>`).join(', ')

            interaction.message.edit({
                content: `<@${interaction.user.id}> Продолжаем . . .`,
                embeds: [new EmbedBuilder()
                    .setTitle(`🚧 Планирование собрания`)
                    .setColor(Colors.Yellow)
                    .setDescription(`Вы выбрали: ${ping_users}\n Теперь время собрания.`)],
                components: [thisDay, nextDay, lastDay, new ActionRowBuilder().addComponents([
                    new ButtonBuilder()
                        .setCustomId('stop_create_event')
                        .setLabel('Отмена')
                        .setStyle(ButtonStyle.Danger),
                    new ButtonBuilder()
                        // .setCustomId('nuked')
                        .setLabel('ПУЛЬТ ОТ ЯДЕРКИ😲😲👉🏿👌🏿💥🤯🧑🏿👶🏻🧑🏿')
                        .setStyle(ButtonStyle.Link)
                        .setURL('https://www.tiktok.com/@yanti.ez/video/7210349481588526341')
                ])]
            })
            
            userData.planMeet.users_invited = users

            interaction.reply({content: 'Ага, вот какие у тебя фетиши..', ephemeral: true})
            fs.writeFileSync(`./src/dataBase/users/${interaction.user.id}.json`, JSON.stringify(userData, null, 4))
        } else if ( interaction.customId?.includes('plan_meet_4') ) {
            let time = Number(interaction.values[0]);

            let userData = JSON.parse(fs.readFileSync(`./src/dataBase/users/${interaction.user.id}.json`));

            const dateFormPlan = new Date(time);
            const date = new Date();
            const hours = date.getHours();
            const minutes = date.getMinutes();

            let timeToMeet = time - date;

            if (timeToMeet < 0) {
                interaction.reply({content: 'Ты не можешь планировать собрание в прошлом! **Конча ебаная нахуй ты вообще пытался это сделать, гнида сука пидарас уебан негр недоношений ДЕНИС!!!!!!**', ephemeral: true})
                return
            }

            const timeToMeetInDays = Math.round(timeToMeet / 1000 / 60 / 60 / 24);

            const ping_users = userData.planMeet.users_invited.map(user => `<@${user}>`).join(', ')
            const subjects = userData.planMeet.subjects.join(', ')

            interaction.message.edit({
                content: `<@${interaction.user.id}> Продолжаем , , ,`,
                embeds: [new EmbedBuilder()
                    .setTitle(`🚧 Планирование собрания`)
                    .setColor(Colors.Yellow)
                    .setDescription(`Вы выбрали что собрание начнеться в \`${RoundTime(dateFormPlan.getHours())}:${RoundTime(dateFormPlan.getMinutes())}\` через \`${timeToMeetInDays}\` дней.\nДо этого вы выбрали участников: ${ping_users}\nТемы собрания: \`${subjects}\`\n Выбирите способ начала собрания.`)],
                components: [new ActionRowBuilder().addComponents([
                    new ButtonBuilder()
                        .setCustomId('plan_meet_5allReady')
                        .setLabel('Когда все будут готовы')
                        .setStyle(ButtonStyle.Success),
                    new ButtonBuilder()
                        .setCustomId('plan_meet_5time')
                        .setLabel(`Ровно по времени`)
                        .setStyle(ButtonStyle.Success),
                    new ButtonBuilder()
                        .setCustomId('plan_meet_5command')
                        .setLabel(`Только по команде /meet start`)
                        .setStyle(ButtonStyle.Success),
                    new ButtonBuilder()
                        .setCustomId('stop_create_event')
                        .setLabel('Отмена')
                        .setStyle(ButtonStyle.Danger),
                    new ButtonBuilder()
                        .setCustomId('plan_meet_1')
                        .setLabel('Начать заново планировать собрание')
                        .setStyle(ButtonStyle.Danger)
                ])
                ]
            })

            userData.planMeet.time = time
            fs.writeFileSync(`./src/dataBase/users/${interaction.user.id}.json`, JSON.stringify(userData, null, 4))
        } else if ( interaction.customId?.includes('plan_meet_5') ) {
            let userData = JSON.parse(fs.readFileSync(`./src/dataBase/users/${interaction.user.id}.json`));

            const selectButton = interaction.customId.split('plan_meet_5');

            const dateFormPlan = new Date(userData.planMeet.time);
            const date = new Date();

            let timeToMeet = userData.planMeet.time - date;

            const timeToMeetInDays = Math.round(timeToMeet / 1000 / 60 / 60 / 24);

            const ping_users = userData.planMeet.users_invited.map(user => `<@${user}>`).join(', ')
            const subjects = userData.planMeet.subjects.join(', ')
            const button = [
                new ActionRowBuilder().addComponents([
                    new ButtonBuilder()
                        .setCustomId('happy')
                        .setLabel('Готово!')
                        .setStyle(ButtonStyle.Success)
                        .setDisabled(true)
                ])
            ]

            if (selectButton === 'allReady') {
                userData.planMeet.type = 'allReady'
                interaction.message.edit({
                    content: `<@${interaction.user.id}> Собрание запланировано!`,
                    embeds: [new EmbedBuilder()
                        .setTitle(`🚧 Планирование собрания`)
                        .setColor(Colors.Green)
                        .setDescription(`Вы выбрали что собрание начнеться в \`${RoundTime(dateFormPlan.getHours())}:${RoundTime(dateFormPlan.getMinutes())}\` через (\`${RoundTime(dateFormPlan.getDate())}.${RoundTime(dateFormPlan.getMonth()+1)}\`) д.\nДо этого вы выбрали участников: ${ping_users}\nТемы собрания: \`${subjects}\`\nСобрание начнеться когда все будут готовы(поголосуют, если лохи не голосуют то можно ипользовать \`/meet start\`).`)],
                        components: button
                })
            } 

            if (selectButton === 'time') {
                userData.planMeet.type = 'time'
                interaction.message.edit({
                    content: `<@${interaction.user.id}> Собрание запланировано!`,
                    embeds: [new EmbedBuilder()
                        .setTitle(`🚧 Планирование собрания`)
                        .setColor(Colors.Green)
                        .setDescription(`Вы выбрали что собрание начнеться в \`${RoundTime(dateFormPlan.getHours())}:${RoundTime(dateFormPlan.getMinutes())}\` через (\`${RoundTime(dateFormPlan.getDate())}.${RoundTime(dateFormPlan.getMonth()+1)}\`) д.\nДо этого вы выбрали участников: ${ping_users}\nТемы собрания: \`${subjects}\`\nСобрание начнеться ровно по времени.`)],
                        components: button
                })
            }

            if (selectButton === 'command') {
                userData.planMeet.type = 'command'
                interaction.message.edit({
                    content: `<@${interaction.user.id}> Собрание запланировано!`,
                    embeds: [new EmbedBuilder()
                        .setTitle(`🚧 Планирование собрания`)
                        .setColor(Colors.Green)
                        .setDescription(`Вы выбрали что собрание начнеться в \`${RoundTime(dateFormPlan.getHours())}:${RoundTime(dateFormPlan.getMinutes())}\` (\`${RoundTime(dateFormPlan.getDate())}.${RoundTime(dateFormPlan.getMonth()+1)}\`)\nДо этого вы выбрали участников: ${ping_users}\nТемы собрания: \`${subjects}\`\nСобрание начнеться только по команде \`/meet start\`.`)],
                        components: button
                })
            }
            const channel = await interaction.client.channels.cache.get(config.channels_id.meets)

            const message = await channel.send({
                content: `<@${interaction.user.id}> Собрание запланировано! и позвал вас: ${ping_users}`,
                embeds: [new EmbedBuilder()
                    .setTitle(`📅 Залпнированно собрание`)
                    .setColor(Colors.Yellow)
                    .setDescription(`Собрание начнеться в \`${RoundTime(dateFormPlan.getHours())}:${RoundTime(dateFormPlan.getMinutes())}\` (\`${RoundTime(dateFormPlan.getDate())}.${RoundTime(dateFormPlan.getMonth()+1)}\`)\nТемы собрания: \`${subjects}\`\nПриглашенные участники: ${ping_users}\nНажмите выбирите сможете вы прийти или нет. __**ЭТО ОБЯЗАТЕЛЬНО!**__`),
                ],
                components: [
                    new ActionRowBuilder().addComponents([
                        new ButtonBuilder()
                            .setCustomId(`accept_invite☼${interaction.user.id}`)
                            .setLabel('Я смогу')
                            .setEmoji('<:9462pepe8:1069747369702338591>')
                            .setStyle(ButtonStyle.Success),
                        new ButtonBuilder()
                            .setCustomId(`maybe_invite☼${interaction.user.id}`)
                            .setLabel('Может буду')
                            .setEmoji('<:andIdidntdoanything:1069747362857226350>')
                            .setStyle(ButtonStyle.Primary),
                        new ButtonBuilder()
                            .setCustomId(`later_invite☼${interaction.user.id}`)
                            .setEmoji(`<:cool:1069747338077290638>`)
                            .setLabel('Буду позже')
                            .setStyle(ButtonStyle.Primary),
                        new ButtonBuilder()
                            .setCustomId(`not_invite☼${interaction.user.id}`)
                            .setLabel('Не смогу')
                            .setEmoji('<:clown:1069747358688083988>')
                            .setStyle(ButtonStyle.Danger),
                        new ButtonBuilder()
                            .setCustomId(`add_invite☼${interaction.user.id}`)
                            .setEmoji(`<:UM:1069747345887080488>`)
                            .setLabel('Добавьте меня')
                            .setStyle(ButtonStyle.Secondary),
                    ])
                ]
            })
            
            // 15 random emojis 
            const emojis = ['🔥', '💥', '🫡', '🧨', '🐸', '🐷', '🐵', '😺', '🫥', '🌈', '🌟', '🌙', '🌚', '🌝']
            const randomEmoji = emojis[Math.floor(Math.random() * emojis.length)]

            // create thread
            const thread = await message.startThread({
                name: `${randomEmoji} Логи собрания ${userData.userName}`,
                autoArchiveDuration: 60,
            })

            thread.send(`<@${interaction.user.id}> Собрание запланировано! и позвал вас: ${ping_users}\nСобрание начнеться в \`${RoundTime(dateFormPlan.getHours())}:${RoundTime(dateFormPlan.getMinutes())}\` (\`${RoundTime(dateFormPlan.getDate())}.${RoundTime(dateFormPlan.getMonth()+1)}\`)\nТемы собрания: \`${subjects}\``)
            
            userData.planMeet.message_id = message.id
            userData.planMeet.emoji = randomEmoji
            fs.writeFileSync(`./src/dataBase/users/${interaction.user.id}.json`, JSON.stringify(userData, null, 4))

            // create file in dataBase/planMeets
            fs.writeFileSync(`./src/dataBase/planMeets/${interaction.user.id}.json`, JSON.stringify(userData.planMeet), null, 4)

            interaction.reply({
                content: `Собрание запланировано!`,
                ephemeral: true
            })
            setTimeout(() => {
                interaction.message.delete()
            }, 5000)
        }
    }
}