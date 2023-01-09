import { SlashCommandBuilder } from '@discordjs/builders';

const clearMessage = new SlashCommandBuilder()
    .setName('clear')
    .setDescription('Очистить сообщения')
    .addNumberOption((option) => option.setName('count').setDescription('Количество сообщений').setRequired(true))

export default clearMessage.toJSON();