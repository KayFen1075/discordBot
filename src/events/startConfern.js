const { Events, ButtonStyle, StringSelectMenuBuilder, UserSelectMenuBuilder, Client, ActionRowBuilder, ButtonBuilder, GatewayIntentBits, EmbedBuilder, PermissionsBitField, Permissions, MessageManager, Embed, Collection, Colors, Message, ChannelType } = require('discord.js');
const fs = require('fs');
const { execute } = require('./ready');
const { fileLog } = require('../functions/logs')

const { get_game_list, check_game_in_list } = require('../functions/listFunc.js');
const { giveAdvanced } = require('../functions/giveAdvanced');
const { meetCreate } = require('../functions/meet');

module.exports = {
    name: Events.InteractionCreate,

    async execute(interaction) {
        if (!fs.existsSync(`./src/dataBase/users/${interaction.user.id}.json`)) {
            return
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
                interaction.reply({ content: 'У тебя уже есть собрание, закончи его или отмени', ephemeral: true })
            } else {
                meetCreate(undefined, interaction.client, interaction.user.id, userr.createEvent.setup1, interaction.values)
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