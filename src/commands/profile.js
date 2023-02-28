const { SlashCommandBuilder } = require('@discordjs/builders');
const { execute } = require('./list');
const { EmbedBuilder, Colors, ActionRowBuilder, StringSelectMenuBuilder} = require('discord.js')
const fs = require('fs')

module.exports = {
    data: new SlashCommandBuilder()
        .setName('profile')
        .setDescription('Посмотреть свой или чейто профиль')
        .addUserOption(option => option
            .setName('user')
            .setDescription('Посмотреть чей-то профиль')
            .setRequired(false)    
        ),
    async execute (interaction) {
        
        const user = interaction.options.get('user')
        if (!user) {
            const profileJSON = JSON.parse(fs.readFileSync(`./src/dataBase/users/${interaction.user.id}.json`))

            let options_join = [{
                label: `Нету`,
                description: `Пусто`,
                value: `null`
            }]
            let embeds_join = [{ name: 'Тут пусто', value: 'Что бы добавить приветствие есть команда `/sound welcome add`' }];
            if (fs.existsSync(`./src/sounds/users_join/${interaction.user.id}`)) {
                const files = fs.readdirSync(`./src/sounds/users_join/${interaction.user.id}`)
                if (files.length > 0) {
                    embeds_join = []
                    options_join = []
                    files.forEach((e, i) => {
                        embeds_join.push ({ name: `Приветствие ${++i}`, value: `\`\`\`${e}\`\`\``, inline: true })
                        options_join.push({
                                label: `Приветствие ${i}`,
                                description: `Прослушать: ${e}`,
                                value: `${e}`
                        })
                    });
                }
            }

            let options_leave = [{
                label: `Нету`,
                description: `Пусто`,
                value: `null`
            }]
            let embeds_leave = [{ name: 'Тут пусто', value: 'Что бы добавить приветствие есть команда `/sound goodbue add`' }];
            if (fs.existsSync(`./src/sounds/users_leave/${interaction.user.id}`)) {
                const files = fs.readdirSync(`./src/sounds/users_leave/${interaction.user.id}`)
                if (files.length > 0) {
                    embeds_leave = []
                    options_leave = []
                    files.forEach((e, i) => {
                        embeds_leave.push({ name: `Прощание ${++i}`, value: `\`\`\`${e}\`\`\``, inline: true })
                        options_leave.push({
                            label: `Прощание ${i}`,
                            description: `Прослушать: ${e}`,
                            value: `${e}`
                        })
                    });
                }
            }

            const row_join = new ActionRowBuilder()
                    .addComponents(
                        new StringSelectMenuBuilder()
                            .setCustomId('say_join')
                            .setPlaceholder('Прослушать приветствие')
                            .addOptions(options_join)
                            .setMinValues(1)
                            .setMaxValues(1)
                    );
            const row_leave = new ActionRowBuilder()
                    .addComponents(
                        new StringSelectMenuBuilder()
                            .setCustomId('say_leave')
                            .setPlaceholder('Прослушать прощание')
                            .addOptions(options_leave)
                            .setMinValues(1)
                            .setMaxValues(1)
                    ); 

            interaction.reply({
                content: `Профиль <@${interaction.user.id}>`, embeds: [
                    new EmbedBuilder()
                        .setTitle(`Профиль ${profileJSON.userName} 👨🏿‍❤️‍👨🏿`)
                        .setDescription(`**О себе:** \`\`\`${profileJSON.data.discription}\`\`\`\n**День рождения:** ${profileJSON.data.happyDate}\n**Игры в списке(ПК):** \`\`\`${profileJSON.data.games}.\`\`\`\n**Игры в списке(Андроид):** \`\`\`${profileJSON.data.android_games}.\`\`\``)
                        .setColor(Colors.Green)
                    ,
                    new EmbedBuilder()
                        .setTitle('Приветствия 🤚🏻')
                        .addFields(embeds_join)
                        .setColor(Colors.Orange)
                    ,
                    new EmbedBuilder()
                        .setTitle('Прощания 👋🏻')
                        .addFields(embeds_leave)
                        .setColor(Colors.Red)
                ],
                components: [row_join, row_leave], ephemeral: true
            })

        } else {
            const profileJSON = JSON.parse(fs.readFileSync(`./src/dataBase/users/${user.value}.json`))

            let embeds_join = [{ name: 'Тут пусто', value: 'Что бы добавить приветствие есть команда `/sound welcome add`' }];
            if (fs.existsSync(`./src/sounds/users_join/${user.value}`)) {
                const files = fs.readdirSync(`./src/sounds/users_join/${user.value}`)
                if (files.length > 0) {
                    embeds_join = []
                    files.forEach((e, i) => {
                        embeds_join.push({ name: `Приветствие ${++i}`, value: `\`\`\`${e}\`\`\``, inline: true })
                    });
                }
            }

            let embeds_leave = [{ name: 'Тут пусто', value: 'Что бы добавить приветствие есть команда `/sound goodbue add`' }];
            if (fs.existsSync(`./src/sounds/users_leave/${user.value}`)) {
                const files = fs.readdirSync(`./src/sounds/users_leave/${user.value}`)
                if (files.length > 0) {
                    embeds_join = []
                    files.forEach((e, i) => {
                        embeds_join.push({ name: `Прощание ${++i}`, value: `\`\`\`${e}\`\`\``, inline: true })
                    });
                }
            }

            

            interaction.reply({
                content: `Профиль <@${user.value}>`, embeds: [
                    new EmbedBuilder()
                        .setTitle(`Профиль ${profileJSON.userName} 👨🏿‍❤️‍👨🏿`)
                        .setDescription(`**О себе:** \`\`\`${profileJSON.data.discription}\`\`\`\n**День рождения:** ${profileJSON.data.happyDate}\n**Игры в списке(ПК):** \`\`\`${profileJSON.data.games}.\`\`\`\n**Игры в списке(Андроид):** \`\`\`${profileJSON.data.android_games}.\`\`\``)
                        .setColor(Colors.Green)
                    ,
                    new EmbedBuilder()
                        .setTitle('Приветствия 🤚🏻')
                        .addFields(embeds_join)
                        .setColor(Colors.Orange)
                    ,
                    new EmbedBuilder()
                        .setTitle('Прощания 👋🏻')
                        .addFields(embeds_leave)
                        .setColor(Colors.Red)
                ], ephemeral: true
            })
        }
    }
}