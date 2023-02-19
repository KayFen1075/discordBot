const { Client, SlashCommandBuilder, PermissionFlagsBits, GatewayIntentBits, EmbedBuilder, PermissionsBitField, Permissions, MessageManager, Embed, Collection, Colors } = require('discord.js');
const { execute } = require('./bot');

module.exports = {
data: new SlashCommandBuilder()
    .setName('clear')
    .setDescription('Очистить сообщения')
    .addNumberOption((option) => option.setName('count').setDescription('Количество сообщений').setRequired(true))
    .setDefaultMemberPermissions(PermissionFlagsBits.Administrator)
	.setDMPermission(false),
    async execute(interaction, client) {
        await interaction.channel.bulkDelete(interaction.options.get('count').value);
        await interaction.reply({content: `Было успешно удалено ${interaction.options.get('count').value}`, ephemeral: true});
    }
}