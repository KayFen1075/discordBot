const { Events, ActionRowBuilder, ButtonStyle, ButtonBuilder, EmbedBuilder, StringSelectMenuBuilder, Colors, UserSelectMenuBuilder } = require('discord.js');
const { get_game_list, check_game_in_list } = require('../functions/listFunc');
const fs = require('fs');

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
                "users_someone": [],  // { "id": "id", "time": "time", "reason": "reason"}
                "users_declined": [], // { "id": "id", "reason": "reason"}
                "time": null,
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

            function getOptions() {
                let options = []
                // get last hours and 30 minutes
                const now = new Date();

                const hours = now.getHours();
                const last_minutes = now.getMinutes() + 30;
                
                for (let i = 17; i <= 21 ; i++) {
                    for (let j = 0; j <= 59; j++) {
                        if (j % 30 === 0) {
                            options.push({
                                label: `Сегодня в ${i}:${j}`,
                                emoji: '🫠',
                                description: `Сегодня в ${i}:${j}`,
                                // value is tiks
                                value: now + (i * 60 * 60 * 1000) + (j * 60 * 1000)
                            })
                        }
                    }
                }

                console.log(options);
                // get next day
                const next_day = new Date(now.getFullYear(), now.getMonth(), now.getDate() + 1);
                console.log(next_day);
                for (let i = 17; i <= 21 ; i++) {
                    for (let j = 0; j <= 59; j++) {
                        if (j % 30 === 0) {
                            options.push({
                                label: `Завтра в ${i}:${j}`,
                                emoji: '🕐',
                                description: `Завтра в ${i}:${j}`,
                                // value is tiks
                                value: next_day + (i * 60 * 60 * 1000) + (j * 60 * 1000)
                            })
                        }
                    }
                }
            }

            console.log(getOptions());

            const row = new ActionRowBuilder().addComponents(
                new StringSelectMenuBuilder()
                    .setCustomId(`start_confern_4`)
                    .setPlaceholder('Выбрать время')
                    .addOptions(
                        getOptions()
                    )


            );

            let ping_users = users.map(user => `<@${user}>`).join(', ')


            interaction.message.edit({
                content: `<@${interaction.user.id}> Продолжаем . . .`,
                embeds: [new EmbedBuilder()
                    .setTitle(`🚧 Планирование собрания`)
                    .setColor(Colors.Yellow)
                    .setDescription(`Вы выбрали: ${ping_users}\n Теперь время собрания.`)],
                components: [row, new ActionRowBuilder().addComponents([new ButtonBuilder()
                    .setCustomId('stop_create_event')
                    .setLabel('Отмена')
                    .setStyle(ButtonStyle.Danger)])]
            })
            
            userData.planMeet.users_invited = users

            interaction.reply({content: 'Ага, вот какие у тебя фетиши..', ephemeral: true})
            fs.writeFileSync(`./src/dataBase/users/${interaction.user.id}.json`, JSON.stringify(userData, null, 4))
        }
    }
}