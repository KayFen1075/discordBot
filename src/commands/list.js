import { SlashCommandBuilder } from '@discordjs/builders';

const list = new SlashCommandBuilder()
    .setName('list')
    .setDescription('Управление списком')
    .addSubcommand(subcommand => subcommand.setName('add').setDescription('Добавить в список игры').addStringOption(option => option
        .setName('games').setDescription('Игры котоыре ты хочешь добавить(через ,)').setRequired(true)
        ))
    .addSubcommand(subcommand => subcommand.setName('remove').setDescription('Удалить игры из списка(Выбрать из следущего собщения)'))

export default list.toJSON();