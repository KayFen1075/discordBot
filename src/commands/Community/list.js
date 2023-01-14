const { SlashCommandBuilder } = require('@discordjs/builders');
const { Client, GatewayIntentBits, EmbedBuilder, PermissionsBitField, Permissions, MessageManager, Embed, Collection, Colors } = require('discord.js');
const { execute } = require('./bot');
const fs = require('fs');

module.exports = {
data: new SlashCommandBuilder()
    .setName('list')
    .setDescription('Управление списком')
    .addSubcommand(subcommand => subcommand.setName('add').setDescription('Добавить в список игры').addStringOption(option => option
        .setName('games').setDescription('Игры котоыре ты хочешь добавить(через ,)').setRequired(true)
        ))
    .addSubcommand(subcommand => subcommand.setName('remove').setDescription('Удалить игры из списка(Выбрать из следущего собщения)')),
    async execute(interaction) {
        if (interaction.options._subcommand === 'add') {
            const userr = fs.readFileSync(`./src/dataBase/users/${interaction.user.username}.json`, 'utf-8', (err, data) => {
                if (err) {
                    console.log(err);
                } else {
                    console.log(data);
                }
            })
            const userData = userr.data.games.push([interaction.options.get('games').value])
            fs.writeFileSync(`./src/dataBase/users/${interaction.user.username}.json`, userData, (err, data) => {
                if (err) {
                    console.log(err);
                } else {
                    console.log(data);
                }
            })
        }
    }
}

