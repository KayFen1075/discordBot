const { Events, ModalBuilder, ActionRowBuilder, TextInputBuilder, TextInputStyle, EmbedBuilder, Colors } = require('discord.js');
const { execute } = require('./ready');
const fs = require('fs');
const { ButtonBuilder } = require('@discordjs/builders');
const { fileLog } = require('../functions/logs');

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
                }
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
            if (await interaction.user.id !== '701572980332953631') {
                await interaction.reply({content: `Вы не создатель! ||падла не трож||`, ephemeral: true});
                return
            };
            let userIdd = interaction.message.content.split(':');
            userIdd = userIdd[1].replace(`||`,``);

            const role = interaction.guild.roles.cache.find(role => role.name === "Член хажабы")
            const requist = fs.readFileSync(`./src/dataBase/requests/${userIdd}.json`)
            

            (await interaction.guild.members.fetch(userIdd)).roles.add(role)

            await interaction.reply({content: `<@${userIdd}> Заявка принята!\n*У тебя больше нету заявок, если ты выйдешь или тебя выгонят, вернуться ты не сможешь*`});

            interaction.message.edit({content: `Новая заявка!(Принято)`, embeds: [new EmbedBuilder()
                .setTitle(`Заявка от ${requist.userName}`)
                .setDescription(`
                Заявка была принята, ты норм чел
                \`\`\`js\n0 Имя:    ${requist.userName}\n1 О себе: ${requist.data.discription}\n2 Др:     ${requist.data.happyDate}\n3 Игры которые может играть:
                \n${requist.data.games}\`\`\`
                `)
                .setColor(Colors.Green)    
            ], components: [new ActionRowBuilder().addComponents([new ButtonBuilder()
                    .setLabel(`🐸 Принять`).setCustomId(`acceptRequist`).setStyle('3'),
                        new ButtonBuilder()
                    .setLabel(`🤬 Отклонить`).setCustomId(`cancelRequist`).setStyle('4')
                ])]
            })

            fs.writeFileSync(`./src/dataBase/users/${userIdd}.json`, fs.readFileSync(`./src/dataBase/requests/${userIdd}.json`));
        } else if (await interaction.customId === 'cancelRequist') {
            if (await interaction.user.id !== '701572980332953631') {
                await interaction.reply({content: `Вы не создатель! ||падла не трож||`, ephemeral: true});
                return
            };
            let userIdd = interaction.message.content.split(':');
            userIdd = userIdd[1].replace(`||`,``);
            const requist = JSON.parse(fs.readFileSync(`./src/dataBase/requests/${userIdd}.json`))
            console.dir(requist)

            await interaction.reply({content: `<@${userIdd}> Заявка отклонена!\n*У тебя больше нету заявок*`});

            interaction.message.edit({content: `Новая заявка!(Отклонено)`, embeds: [new EmbedBuilder()
                .setTitle(`Заявка от ${requist.userName}`)
                .setDescription(`
                Заявка была отклонена, возможно вы еблан
                \`\`\`js\n0 Имя:    ${requist.userName}\n1 О себе: ${requist.data.discription}\n2 Др:     ${requist.data.happyDate}\n3 Игры которые может играть:
                \n${requist.data.games}\`\`\`
                `)
                .setColor(Colors.Red)    
            ], components: [new ActionRowBuilder().addComponents([new ButtonBuilder()
                    .setLabel(`🐸 Принять`).setCustomId(`acceptRequist`).setStyle('3'),
                        new ButtonBuilder()
                    .setLabel(`🤬 Отклонить`).setCustomId(`cancelRequist`).setStyle('4')
                ])]
            })
        }
    }
}