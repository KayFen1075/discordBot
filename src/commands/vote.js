const { SlashCommandBuilder, ChannelType, PermissionsBitField, ActionRowBuilder, StringSelectMenuBuilder, ButtonBuilder, Colors } = require('discord.js')
const { execute } = require('./list')
const fs = require('fs')
const { EmbedBuilder } = require('@discordjs/builders')
const CircularJSON = require('circular-json')
const { fileLog } = require('../functions/logs')

module.exports = {
    data: new SlashCommandBuilder()
    .setName('vote')
    .setDescription('Голосования')
    // .addSubcommand(subcommand => subcommand
    //     .setName('end')
    //     .setDescription('Завершить голосование')
    // )
    // .addSubcommand(subcommand => subcommand
    //     .setName('list')
    //     .setDescription('Список всех голосований от всех пользователей')
    // )
    .addSubcommand(subcommand => subcommand
        .setName('create')
        .setDescription('Создать голосование')
        .addStringOption(option => option
            .setName('title')
            .setDescription('Суть голосования')
            .setMinLength(2)
            .setMaxLength(50)
            .setRequired(true)    
        )
        .addStringOption(option => option
            .setName('description')
            .setDescription('Суть описание, тоби ж тема и варианты')
            .setMinLength(2)
            .setMaxLength(999)
            .setRequired(true)    
        )
        .addStringOption(option => option
            .setName('choices')
            .setDescription('Выбор, писать через `;`. К примеру: да;нет;возможно')
            .setMinLength(3)
            .setMaxLength(200)
            .setRequired(true)
        )
        .addStringOption(option => option
            .setName('time')
            .setDescription('Выбрать время голосования')
            .setRequired(true)
            .setChoices(
                { name: '1 минута', value: '1m' },
                { name: '5 минут', value: '5m' },
                { name: '10 минут', value: '10m' },
                { name: '15 минут', value: '15m' },
                { name: '30 минут', value: '30m' },
                { name: '1 час', value: '1h' },
                { name: '2 часа', value: '2h' },
                { name: '6 часа', value: '6h' },
                { name: '12 часов', value: '12h' },
                { name: '1 день', value: '1d' },
                { name: '2 дня', value: '2d' },
                { name: '3 дня', value: '3d' },
                { name: '4 дня', value: '4d' },
                { name: '5 дней', value: '5d' },
                { name: '6 дней', value: '6d' },
                { name: '1 неделя', value: '1w' },

            )    
        )
        .addStringOption(option => option
            .setName('color')
            .setDescription('Выбери цвет для голосования(по умолчанию зелёный)')
            .setRequired(false)    
            .setChoices(
                { name: '🔴 Красный', value: Colors.Red.toString() },
                { name: '🟢 Зеленый', value: Colors.Green.toString() },
                { name: '🔵 Синий', value: Colors.Blue.toString() },
                { name: '⚪ Белый', value: Colors.White.toString() },
                { name: '⚫ Черный', value: Colors.NotQuiteBlack.toString() },
                { name: '🟡 Желтый', value: Colors.Yellow.toString() },
                { name: '🟣 Фиолетовый', value: Colors.Purple.toString() },
                { name: '🟠 Оранжевый', value: Colors.Orange.toString() },
                { name: '🟤 Коричневый', value: Colors.Blurple.toString() },
                { name: '🌸 Розовый', value: Colors.Purple.toString() }
            
            )
        )
        .addBooleanOption(option => option
            .setName('ping')
            .setDescription('Упомянуть всех или нет, по умолчанию стоит false')
            .setRequired(false)
        )
    ),

    async execute(interaction) {
        let data = JSON.parse(fs.readFileSync('./src/dataBase/bot.json', 'utf8'))

        if (!fs.existsSync(`./src/dataBase/users/${interaction.user.id}.json`)) {
            return
        }

        // check if user created vote
        data.votes.forEach(e => {
            if (e.id == interaction.user.id) {
                interaction.reply({
                    content: 'Вы уже создали голосование, пожалуйста, дождитесь его окончания или завершите его командой `/vote end`',
                    ephemeral: true
                })
                return
            }
        })

        let color = 5763719
        let ping = false
        let votes = (await interaction.options.get('choices').value).split(';')
        let components = []
        
        if (interaction.options.get('ping') && interaction.options.get('ping').value == true) {
            ping = `@everyone голосование от <@${interaction.user.id}>!`
        } else {
            ping = `Новое голосование от <@${interaction.user.id}>!`
        }

        if (votes.length > 5 || votes.length < 2) {
            interaction.reply({
                content: 'Максимум может быть 5 вариантов',
                ephemeral: true
            })
            return
        }

        votes.forEach(e => {
            components.push(
                new ButtonBuilder()
                    .setCustomId('vote‘'+e+'‘'+interaction.user.id)
                    .setLabel(e)
                    .setStyle('1'),
            )
        })
        
        if (interaction.options.get('color')) {
            color = parseInt((await interaction.options.get('color').value))
        }

        const messageVote = await interaction.channel.send({
            content: `${ping}`,
            embeds: [new EmbedBuilder()
                .setTitle(interaction.options.get('title').value)
                .setDescription(`${interaction.options.get('description').value}\nBy <@${interaction.user.id}>`)
                .setColor(color)
                .setTimestamp(Date.now())],
            components: [
                new ActionRowBuilder()
                    .addComponents(...components)
            ]
        })
        console.log(messageVote);
        interaction.reply({
            content: `Голосование создано! \n **Вся информация о голосовании:**\n **Название:** ${interaction.options.get('title').value}\n **Описание:** ${interaction.options.get('description').value}\n **Варианты:** ${votes.join(', ')}\n **Время:** ${interaction.options.get('time').value}\n **Цвет:** ${interaction.options.get('color').value}\n **Упоминание:** ${interaction.options.get('ping').value}\n **Сообщение:** ${messageVote.id}`,
            ephemeral: true
        })

        // add vote to file
        data.votes.push({
            id: interaction.user.id,
            title: interaction.options.get('title').value,
            description: interaction.options.get('description').value,
            choices: votes,
            color: color,
            ping: ping ,
            startVote: Date.now(),
            channel: interaction.channelId,
            message: await messageVote.id,
            votes_users: [], // users who voted objects {id: id, vote: choice}
            time: interaction.options.get('time').value,
        })
        fileLog(`[СОЗДАНО ГОЛОСОВАНИЕ] ${interaction.user.username}#${interaction.user.discriminator} (${interaction.user.id}) created vote ${interaction.options.get('title').value} in ${interaction.channel.name} (${interaction.channel.id})
Вся информация о голосовании:
Название: ${interaction.options.get('title').value}
Описание: ${interaction.options.get('description').value}
Варианты: ${votes.join(', ')}
Время: ${interaction.options.get('time').value}
Цвет: ${color}
Упоминание: ${ping}
Сообщение: ${messageVote.id}`)
        fs.writeFileSync('./src/dataBase/bot.json', JSON.stringify(data))

    }
}