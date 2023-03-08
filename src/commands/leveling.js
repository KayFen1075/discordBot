const { SlashCommandBuilder } = require('@discordjs/builders');
const fs = require('fs');
const { checkLeveling } = require('../functions/cheking');
const { PermissionFlagsBits } = require('discord.js')
const { addBoost } = require('../functions/leveling');

module.exports = {
    data: new SlashCommandBuilder()
        .setName('level')
        .setDescription('Уровени')
        .addSubcommand(subcommand => subcommand
            .setName('boost')
            .setDescription('Буст опыта')
            .addNumberOption(option => option
                .setName('boost')
                .setDescription('Умножитель опыта (к примеру 1.5)')
                .setRequired(true))
            .addUserOption(option => option
                .setName('user')
                .setDescription('Пользователь')
                .setRequired(true))
            .addStringOption(option => option
                .setName('time')
                .setDescription('Время буста')
                .setRequired(true)
                .setChoices(
                    { name: '1 час',  value: '3600000' },
                    { name: '12 часов', value: '43200000' },
                    { name: '1 день', value: '86400000' },
                    { name: '3 дня', value: '259200000' },
                    { name: '1 неделя', value: '604800000' },
                ))
            .addStringOption(option => option
                .setName('reason')
                .setDescription('Причина буста')
                .setRequired(true)
            )
        )
        .addSubcommand(subcommand => subcommand
            .setName('reset')
            .setDescription('Сбросить уровень')
            .addUserOption(option => option
                .setName('user')
                .setDescription('Пользователь')
                .setRequired(true))
    )
    .setDefaultMemberPermissions(PermissionFlagsBits.Administrator),

    async execute(interaction) {
        const subcommand = interaction.options.getSubcommand();

        if (subcommand === 'boost') {
            const boost = await interaction.options.get('boost').value;
            const user = await interaction.options.get('user').value;
            const time = await Number(interaction.options.get('time').value);
            const reason = await interaction.options.get('reason').value;

            console.log(user);

            checkLeveling(user)

            let userData = JSON.parse(fs.readFileSync(`./src/dataBase/users/${user}.json`));

            addBoost(interaction.client, user, boost, time, reason)

            interaction.reply({content: `Буст опыта на **${boost}x** пользователю **${userData.userName}** на **${time / 3600000}** часов. Причина: ${reason}`, ephemeral: true})
        } 

        if (subcommand === 'reset') {
            const user = interaction.options.get('user').value;

            checkLeveling(user)

            // only for admins
            interaction.member.PermissionFlagsBits.Administrator === false ? interaction.reply({ content: 'Ты не админ, иди нахуй', ephemeral: true }) : null;

            let userData = JSON.parse(fs.readFileSync(`./src/dataBase/users/${user}.json`));

            userData.leveling = {
                level: 0,
                xp: 0,
                boost: 1,
                boostTime: 0,
            }

            fs.writeFileSync(`./src/dataBase/users/${user}.json`, JSON.stringify(userData));

            interaction.reply({ content: `Уровень пользователя ${userData.userName} сброшен! Иди нахуй лох`})
        }
    }
}