import { SlashCommandBuilder } from '@discordjs/builders';
const moneyMessage = new SlashCommandBuilder()
    .setName('money')
    .setDescription('Очистить сообщения')
    .addSubcommand(subcommand => subcommand
        .setName('remove')
        .setDescription('Снять деньги с карты')
        .addNumberOption(option => option
            .setName('card')
            .setDescription('Номер карты, пример 1234')
            .setRequired(true)
        )
        .addNumberOption(option => option
            .setName('count')
            .setDescription('Количество алмазов кторые вы хотите снять')
            .setRequired(true)
        ))
    .addSubcommand(subcommand => subcommand
        .setName('add')
        .setDescription('Пополнить счёт')
        .addNumberOption(option => option
            .setName('card')
            .setDescription('Номер карты, пример 1234')
            .setRequired(true)
        )
        .addNumberOption(option => option
            .setName('count')
            .setDescription('Количество алмазов кторые вы хотите снять')
            .setRequired(true)
        ))
export default moneyMessage.toJSON();