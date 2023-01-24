const { Client, SlashCommandBuilder, GatewayIntentBits, EmbedBuilder, PermissionsBitField, Permissions, MessageManager, Embed, Collection, Colors } = require('discord.js');
const { execute } = require('../commands/bot');

module.exports = {
data: new SlashCommandBuilder()
    .setName('clear')
    .setDescription('Очистить сообщения')
    .addNumberOption((option) => option.setName('count').setDescription('Количество сообщений').setRequired(true)),
    async execute(interaction, client) {
        await interaction.channel.bulkDelete(interaction.options.get('count').value);
        await interaction.reply({content: `Было успешно удалено ${interaction.options.get('count').value}`, ephemeral: true});
    }
}