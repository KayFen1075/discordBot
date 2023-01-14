const { SlashCommandBuilder, EmbedBuilder } = require('@discordjs/builders');

module.exports = {
data: new SlashCommandBuilder()
        .setName('bot')
        .setDescription('Управление ботом')
        .addSubcommand(subCommand => subCommand.setName('stop').setDescription('Остановить деятельность бота'))
        .addSubcommand(subCommand => subCommand.setName('reload').setDescription('Перезагрузка бота'))
        .addSubcommand(subCommand => subCommand.setName('status').setDescription('Посмотреть статус бота')),
        async execute(interaction, client) {             
                await interaction.reply('Работает');
        }
}