const { Client, SlashCommandBuilder, PermissionFlagsBits, GatewayIntentBits, EmbedBuilder, PermissionsBitField, Permissions, MessageManager, Embed, Collection, Colors } = require('@discordjs/builders');
const Canvas = require('canvas')
const Chart = require('chart.js');
const fs = require('fs')
const ChartJSImage = require('chart.js-image');

module.exports = {
    data: new SlashCommandBuilder()
        .setName('bot')
        .setDescription('Управление ботом')
        .addSubcommand(subCommand => subCommand.setName('stop').setDescription('Остановить деятельность бота'))
        .addSubcommand(subCommand => subCommand.setName('reload').setDescription('Перезагрузка бота'))
        .addSubcommand(subCommand => subCommand.setName('status').setDescription('Посмотреть статус бота')),
    async execute(interaction, client) {
    }
}    