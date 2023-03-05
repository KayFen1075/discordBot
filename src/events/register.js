const { Events, ModalBuilder, ActionRowBuilder, TextInputBuilder, TextInputStyle, EmbedBuilder, Colors } = require('discord.js');
const { execute } = require('./ready');
const fs = require('fs');
const { ButtonBuilder } = require('@discordjs/builders');
const { fileLog } = require('../functions/logs');
const { acceptReuqest, declineRequest } = require('../functions/requserts');


module.exports = {
    name: Events.InteractionCreate,

    async execute(interaction) {
        if (interaction.customId === 'register' && !fs.existsSync(`./src/dataBase/requests/${interaction.user.id}.json`) ) {
            const modal = new ModalBuilder()
                .setTitle('Заявка в ХАЖАБУ')
                .setCustomId('Moadlregister')
                .addComponents(new ActionRowBuilder().addComponents(new TextInputBuilder()
                    .setCustomId('name')
                    .setMinLength(2)
                    .setLabel('🆔 Cвоё реальное имя')
                    .setPlaceholder('Макс')
                    .setRequired(true)
                    .setStyle(TextInputStyle.Short)))
                .addComponents(new ActionRowBuilder().addComponents(new TextInputBuilder()
                    .setCustomId('happyDate')
                    .setMinLength(10)
                    .setMaxLength(10)
                    .setLabel('🎂 Дата рождения')
                    .setPlaceholder('DD.mm.YYYY(19.02.2007)')
                    .setRequired(true)
                    .setStyle(TextInputStyle.Short)))
                .addComponents(new ActionRowBuilder().addComponents(new TextInputBuilder()
                    .setCustomId('discription')
                    .setMinLength(30)
                    .setMaxLength(500)
                    .setLabel('🌊 Расскажи про себя')
                    .setPlaceholder('Я тот то тота, занимаюсь тем та тем. У меня есть такие то хобби..')
                    .setRequired(true)
                    .setStyle(TextInputStyle.Paragraph)))
                .addComponents(new ActionRowBuilder().addComponents(new TextInputBuilder()
                    .setCustomId('games')
                    .setLabel('🖥️ Игры которые ты можешь играть(через ,)')
                    .setPlaceholder('fortnite, cs:go, minecraft..')
                    .setRequired(true)
                    .setStyle(TextInputStyle.Paragraph)))
            interaction.showModal(modal)
        } else if (interaction.isModalSubmit()) {
            console.log(interaction.user.username);
            const games = interaction.fields.fields.get('games').value.split(',');
            const userData = JSON.stringify({
                userName: interaction.fields.fields.get('name').value,
                createEvent: {
                    setup1: [],
                    setup2: []
                },
                data: {
                    happyDate: interaction.fields.fields.get('happyDate').value,
                    discription: interaction.fields.fields.get('discription').value,
                    games: games,
                    android_games: []
                },
                leveling: {
                    level: 1,
                    xp: 0,
                    xpToNextLevel: 100,
                    boost: 0,
                    boostTime: 0
                },
                state: [0]
                    
            });

            interaction.user.username = interaction.fields.fields.get('name').value

            fs.writeFileSync(`./src/dataBase/requests/${interaction.user.id}.json`, userData)
            const channelRequist = interaction.guild.channels.cache.get('1068554674296344626')

            channelRequist.send({content: `Новая заявка! ||id:${interaction.user.id}||`, embeds: [new EmbedBuilder()
                .setTitle(`Заявка от ${interaction.fields.fields.get('name').value}`)
                .setDescription(`
                Заявка будет расмотрена, если её не одобрят то повторной попытки не будет(Бывают исключения)
                \`\`\`js\n0 Имя:    ${interaction.fields.fields.get('name').value}\n1 О себе: ${interaction.fields.fields.get('discription').value}\n2 Др:     ${interaction.fields.fields.get('happyDate').value}\n3 Игры которые может играть:
                \n${games}\`\`\`
                `)
                .setColor(Colors.Grey)    
            ], components: [new ActionRowBuilder().addComponents([new ButtonBuilder()
                    .setLabel(`🐸 Принять`).setCustomId(`acceptRequist`).setStyle('3'),
                        new ButtonBuilder()
                    .setLabel(`🤬 Отклонить`).setCustomId(`cancelRequist`).setStyle('4')
                ])]
            
            })

            interaction.reply({
                ephemeral: true,
                embeds: [new EmbedBuilder()
                    .setTitle('⌚ Ожидайте')
                    .setDescription(`Вы подали заявку в хажабу!\nЖдите ответа в течение года..
                    `)
                    .setColor(Colors.Green)
                ]
            })
            
            console.log(userData);
            fileLog(`[QUERST] ${interaction.user.username}(${interaction.user.id}) подал заявку в хажабу!`)
            
        } else if (await interaction.customId === 'acceptRequist') {

            // Accept requist

            if (await interaction.user.id !== '701572980332953631') {
                await interaction.reply({content: `Вы не создатель! ||падла не трож||`, ephemeral: true});
                return
            };
            
            const userIdd = await interaction.message.content.split('||')[1].split(':')[1].split('>')[0]

            acceptReuqest(interaction, userIdd)

        } else if (await interaction.customId === 'cancelRequist') {
            
            // Accept requist

            if (await interaction.user.id !== '701572980332953631') {
                await interaction.reply({content: `Вы не создатель! ||падла не трож||`, ephemeral: true});
                return
            };
            
            const userIdd = await interaction.message.content.split('||')[1].split(':')[1].split('>')[0]

            declineRequest(interaction, userIdd)
        }
    }
}