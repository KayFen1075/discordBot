const { SlashCommandBuilder } = require('@discordjs/builders');
const { Client, StringSelectMenuBuilder, ActionRowBuilder, ButtonBuilder, GatewayIntentBits, EmbedBuilder, PermissionsBitField, Permissions, MessageManager, Embed, Collection, Colors } = require('discord.js');
const { execute } = require('./bot');
const fs = require('fs');

module.exports = {
    data: new SlashCommandBuilder()
        .setName('list')
        .setDescription('Управление списком')
        .addSubcommand(subcommand => subcommand
            .setName('add')
            .setDescription('Добавить в список игры')
            .addStringOption(option => option
                .setName('games').setDescription('Игры котоыре ты хочешь добавить(через , )').setRequired(true))
            .addBooleanOption(option => option.setName('android').setDescription('Игры котоыре ты хочешь добавить(через ,)').setRequired(false))
        )
        .addSubcommand(subcommand => subcommand
            .setName('remove')
            .setDescription('Удалить игры из списка(Выбрать из следущего собщения) можно выбрать андроид'))
            .addBooleanOption(option => option.setName('android').setDescription('Игры котоыре ты хочешь добавить(через ,)').setRequired(false)),
    async execute(interaction) {
        if (interaction.options._subcommand === 'add') {
            if (!interaction.options.get('android')) {
                let userr = JSON.parse(fs.readFileSync(`./src/dataBase/users/${interaction.user.username}.json`, 'utf-8'));
                await userr.data.games.push(interaction.options.get('games').value);

                const userData = JSON.stringify(userr);

                interaction.reply(`UserData: ${userData}`)
                fs.writeFileSync(`./src/dataBase/users/${interaction.user.username}.json`, userData)
            } else {
                let userr = JSON.parse(fs.readFileSync(`./src/dataBase/users/${interaction.user.username}.json`, 'utf-8'));
                await userr.data.android_games.push(interaction.options.get('games').value);

                const userData = JSON.stringify(userr);

                interaction.reply(`UserData: ${userData}`)
                fs.writeFileSync(`./src/dataBase/users/${interaction.user.username}.json`, userData)
            }

        } else if (interaction.options._subcommand === 'remove') {
            let userr = JSON.parse(fs.readFileSync(`./src/dataBase/users/${interaction.user.username}.json`, 'utf-8'));
            if (await !interaction.options.get('android')) {
                let options = userr.data.games.map(game => {
                    return {
                        label: game,
						description: `🟥 Удалить игру`,
						value: game,

                    }
                });
                const row = new ActionRowBuilder()
                    .addComponents(
                        new StringSelectMenuBuilder()
                            .setCustomId('remove_pc_games')
                            .setPlaceholder('Выбрать игру/игры')
                            .addOptions(options)
                            .setMinValues(1)
                            .setMaxValues(userr.data.games.length)
                    );
                await interaction.reply({
                    content: `Выбери игры которые хочешь удалить(ПК): ${userr.data.games}`,
                    components: [row]
                })
            } else {
                let options = userr.data.android_games.map(game => {
                    return {
                        label: game,
						description: `🟥 Удалить игру Android`,
						value: game,

                    }
                });
                const row = new ActionRowBuilder()
                    .addComponents(
                        new StringSelectMenuBuilder()
                            .setCustomId('remove_pc_games')
                            .setPlaceholder('Выбрать игру/игры')
                            .addOptions(options)
                            .setMinValues(1)
                            .setMaxValues(userr.data.android_games.length)
                    );
                await interaction.reply({
                    content: `Выбери игры которые хочешь удалить(Android): ${userr.data.android_games}`,
                    components: [row]
                })
            }
        }
    } 
}

