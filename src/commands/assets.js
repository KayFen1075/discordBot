const { SlashCommandBuilder, ChannelType, PermissionsBitField, ActionRowBuilder, StringSelectMenuBuilder } = require('discord.js')
const { execute } = require('./list')
const fs = require('fs')
const { channel } = require('diagnostics_channel')

module.exports = {
    data: new SlashCommandBuilder()
        .setName('asset')
        .setDescription('Управление игровыми материалами')
        .addSubcommand(subcommand => subcommand
            .setName('add')
            .setDescription('Добавить новую игру к материалам')
            .addStringOption(option => option
                .setName('game')
                .setDescription('Добавить игру в ручную, будет как идея если не у кого нету')
                .setRequired(true)    
            )
        )
        .addSubcommand(subcommand => subcommand
            .setName('delete')
            .setDescription('Удалить материалы(иди нахуй)')
        ),

    async execute (interaction) {
        if (!fs.existsSync(`./src/dataBase/users/${interaction.user.id}.json`)) {
            await interaction.reply({content: 'Ты не участник **ХАЖАБЫ** что бы использовать эту команду. Пройти регистрацию что бы использовать **все** команды <#1061827016518815845>', ephemeral: true})
            return
        }
        if (interaction.options._subcommand === 'add') {
            const game = await interaction.options.get('game')
            const files = fs.readdirSync(`./src/dataBase/assets`)

            if (game && !files.game) {
                const cahnnelText = await interaction.guild.channels.create({
                    name: `📦ㆍ${game.value}`,
                    type: ChannelType.GuildText,
                    description: `Материалы по ${game.value}, от ${interaction.user.tag}`
                }); await cahnnelText.setParent('1071945596090462238', { lockPermissions: false })

                await cahnnelText.permissionOverwrites.set([
                {
                    id: '1061899659565596742',
                    allow: [PermissionsBitField.Flags.ViewChannel],
                },
                {
                    id: interaction.guild.id,
                    deny: [PermissionsBitField.Flags.ViewChannel],
                }])

                const json = JSON.stringify({
                    game: `${game.value}`,
                    channel: cahnnelText,
                    creator: interaction.member,
                }) 

                fs.writeFileSync(`./src/dataBase/assets/${game.value}.json`, json)
                
                cahnnelText.send(`Материалы по ${game.value} были созданы! <#${cahnnelText.id}> создатель <@${interaction.user.id}>`)

                interaction.reply(`Материалы по ${game.value} были созданы! <#${cahnnelText.id}>`)
            } 
        } else if (interaction.options._subcommand === 'delete') {
            const files = fs.readdirSync(`./src/dataBase/assets`)
            
            if (files.length !== 0) {
                let options = [];

                files.forEach(e => {
                    e = e.replace('.json', '')
                    options.push({
                        label: `Материалы`,
                        description: `Удалить: ${e}`,
                        value: `${e}`,
                    })
                })

                const row = new ActionRowBuilder()
                .addComponents(
                    new StringSelectMenuBuilder()
                        .setCustomId('assets_delete')
                        .setPlaceholder('Выбрать материалы')
                        .addOptions(options)
                        .setMinValues(1)
                        .setMaxValues(1)
                ); 

            interaction.reply({ content: `Выбери материалы которые хочешь удалить`, components: [row] })
            }
        }
    }
}