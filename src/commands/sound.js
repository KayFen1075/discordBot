const { SlashCommandSubcommandBuilder, SlashCommandBuilder, StringSelectMenuBuilder, ActionRowBuilder } = require('discord.js')
const { execute } = require('./list')
const fs = require('fs');
const https = require('https');
const path = require('path')

module.exports = {
    data: new SlashCommandBuilder()
        .setName('sound')
        .setDescription('Управление звуками')
        .addSubcommandGroup((Group) => Group
            .setName('welcome')
            .setDescription('Упраление приветствиями')
            .addSubcommand((subcommand) => subcommand
                .setName('add')
                .setDescription('Добавить новое приветствие, в формате mp3 (желательно)')
                .addAttachmentOption(option => option
                    .setName('file')
                    .setDescription('Файл для нового приветствия')
                    .setRequired(true)
                )
            )
            .addSubcommand((subcommand) => subcommand
                .setName('remove')
                .setDescription('Удалить приветствия')
            )
        )
        .addSubcommandGroup((Group) => Group
            .setName('goodbye')
            .setDescription('Добавить новое прощяние, в формате mp3 (желательно)')
            .addSubcommand((subcommand) => subcommand
                .setName('add')
                .setDescription('Добавить новое приветствие, в формате mp3 (желательно)')
                .addAttachmentOption(option => option
                    .setName('file')
                    .setDescription('Файл для нового прощания')
                    .setRequired(true)
                )
            )
            .addSubcommand((subcommand) => subcommand
                .setName('remove')
                .setDescription('Удалить приветствия')
            )
        ),

    async execute(interaction) {

        console.dir(interaction.options)
        if (interaction.options._group === 'welcome') {
            if (interaction.options._subcommand === 'add') {
                const file = await interaction.options.getAttachment('file');

                const fileName = file.name;
                const dirPath = path.join('./src/sounds/users_join', interaction.user.id);
                const filePath = path.join(dirPath, fileName);

                fs.mkdir(dirPath, { recursive: true }, (err) => {
                    if (err) throw err;
                    https.get(file.url, (res) => {
                        res.pipe(fs.createWriteStream(filePath)).on('finish', () => {
                            console.log(`The file "${fileName}" has been created at "${filePath}".`);
                            interaction.reply({ content: `Вы добавили ${fileName} в свои приветствия!`, ephemeral: true })
                        });
                    });
                });
            } else if (fs.existsSync(`./src/sounds/users_join/${interaction.user.id}`)) {
                const files = fs.readdirSync(`./src/sounds/users_join/${interaction.user.id}`)
                if (files.length !== 0) {

                    let options = []

                    files.forEach((e, i) => {
                        options.push({
                            label: `Приветствие ${++i}`,
                            description: `Удалить: ${e}`,
                            value: `${e}`
                        })
                    })

                    const row = new ActionRowBuilder()
                        .addComponents(
                            new StringSelectMenuBuilder()
                                .setCustomId('welcome_remove')
                                .setPlaceholder('Выбрать приветствия')
                                .addOptions(options)
                                .setMinValues(1)
                                .setMaxValues(files.length)
                        );

                    interaction.reply({
                        content: `Выбери какие приветствия хочешь удалить:`,
                        components: [row]
                    })
                } else {
                    interaction.reply({ content: `У вас нету приветствий!`, ephemeral: true })
                }
            } else {
                interaction.reply({ content: `Вы ебалн? У вас даже папки с приветствиями нету` })
            }
        } else if (interaction.options._group === 'goodbye') {
            if (interaction.options._subcommand === 'add') {
                const file = await interaction.options.getAttachment('file');

                const fileName = file.name;
                const dirPath = path.join('./src/sounds/users_leave', interaction.user.id);
                const filePath = path.join(dirPath, fileName);

                fs.mkdir(dirPath, { recursive: true }, (err) => {
                    if (err) throw err;
                    https.get(file.url, (res) => {
                        res.pipe(fs.createWriteStream(filePath)).on('finish', () => {
                            console.log(`The file "${fileName}" has been created at "${filePath}".`);
                            interaction.reply({ content: `Вы добавили **${fileName}** в свои прощания!`, ephemeral: true })
                        });
                    });
                });
            } else if (fs.existsSync(`./src/sounds/users_leave/${interaction.user.id}`)) {
                const files = fs.readdirSync(`./src/sounds/users_leave/${interaction.user.id}`)
                if (files.length !== 0) {

                    let options = []

                    files.forEach((e, i) => {
                        options.push({
                            label: `Приветствие ${++i}`,
                            description: `Удалить: ${e}`,
                            value: `${e}`
                        })
                    })

                    const row = new ActionRowBuilder()
                        .addComponents(
                            new StringSelectMenuBuilder()
                                .setCustomId('goodbye_remove')
                                .setPlaceholder('Выбрать прощания')
                                .addOptions(options)
                                .setMinValues(1)
                                .setMaxValues(files.length)
                        );

                    interaction.reply({
                        content: `Выбери какие прощание хочешь удалить:`,
                        components: [row]
                    })
                } else {
                    interaction.reply({ content: `У вас нету приветствий!`, ephemeral: true })
                }
            } else {
                interaction.reply({ content: `Вы ебалн? У вас даже папки с приветствиями нету` })
            }
        }
    }
}