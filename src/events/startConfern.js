const { Events, ButtonStyle, StringSelectMenuBuilder, UserSelectMenuBuilder, Client, ActionRowBuilder, ButtonBuilder, GatewayIntentBits, EmbedBuilder, PermissionsBitField, Permissions, MessageManager, Embed, Collection, Colors, Message } = require('discord.js');

const { execute } = require('./ready');

const { get_game_list, check_game_in_list } = require('../functions/listFunc.js')

module.exports = {
    name: Events.InteractionCreate,

    async execute(interaction) {
        if (interaction.isButton()) {
            if (interaction.customId === 'start_confern_1') {
                    const games = get_game_list();
                    function have_game(game) {
                        if (check_game_in_list(interaction.user.username, game)) {
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
                const selectMenu = new ActionRowBuilder().addComponents(
                    new UserSelectMenuBuilder()
                        .setCustomId(`start_confern_3`)
                        .setPlaceholder('Выбрать пользователей')
                        .setMaxValues(3)
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
            }
        } else if (interaction.customId === 'start_confern_3') {
            let userList;
            interaction.values.foreach(element => {
                userList += `${interaction.guild.members.cache.get(element).user.username}, `
            });
            interaction.message.edit({
            content: `<@${interaction.user.id}> Начинаю массовую спам атаку`,
            embeds: [new EmbedBuilder()
                .setTitle(`🚧 Создание собрания`)
                .setColor(Colors.Yellow)
                .setDescription(`Вы выбрали: \n\`\`\`${userList}\`\`\`\n скоро начнёться собрание`)],    
            tts: true,
            components: [new ActionRowBuilder().addComponents([new ButtonBuilder()
                .setCustomId('stop_create_event')
                .setLabel('Отмена')
                .setStyle(ButtonStyle.Danger)])]
        })
    }
    }}