const { Events, EmbedBuilder, Colors, ActionRowBuilder, ButtonBuilder } = require('discord.js')
const fs = require('fs')
const { game_table } = require('../functions/listFunc.js')
const { execute } = require('./ready.js')

module.exports = {
    name: Events.InteractionCreate,

    async execute(interaction) {
        if (!interaction.isChatInputCommand()) return;

        const command = interaction.client.commands.get(interaction.commandName);

        if (!command) {
            console.error(`Команда ${interaction.commandName} не найдена.`);
            return;
        }

        try {
            await command.execute(interaction);
        } catch (error) {
            console.error(error);
            await interaction.reply({ content: `При использование команды произошла ошибка!\`\`\`${error}\`\`\``, ephemeral: true });
        }
    }
}