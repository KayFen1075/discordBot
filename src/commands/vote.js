const { SlashCommandBuilder, ChannelType, PermissionsBitField, ActionRowBuilder, StringSelectMenuBuilder, ButtonBuilder, Colors } = require('discord.js')
const { execute } = require('./list')
const fs = require('fs')
const { EmbedBuilder } = require('@discordjs/builders')

module.exports = {
    data: new SlashCommandBuilder()
    .setName('vete')
    .setDescription('Голосования')
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
        let content = `Новое голосование от ${interaction.user.id}`
        let color = 5763719
        let votes = (await interaction.options.get('choices').value).split(';')
        let components = []
        
        votes.forEach(e => {
            components.push(
                new ButtonBuilder()
                    .setCustomId('vote'+e)
                    .setLabel(e)
                    .setStyle('1'),
            )
        })
        
        if (interaction.options.get('color')) {
            color = parseInt((await interaction.options.get('color').value))
        }

        interaction.reply({
            content: `${content}`,
            embeds: [new EmbedBuilder()
                .setTitle(interaction.options.get('title').value)
                .setDescription(`${interaction.options.get('description')}\nBy ${interaction.user.id}`)
                .setColor(color)
                .setTimestamp(Date.now())],
            components: [
                new ActionRowBuilder()
                    .addComponents(...components)
            ]
        })
    }
}