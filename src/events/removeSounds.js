const { Events } = require('discord.js')
const { execute } = require('./ready')
const fs = require('fs')
const { fileLog } = require('../functions/logs')

module.exports = {
    name: Events.InteractionCreate,

    async execute(interaction) {
        if (interaction.customId === 'welcome_remove') {
            const files = fs.readdirSync(`./src/sounds/users_join/${interaction.user.id}`)
            if (files.length !== 0) {
                interaction.values.forEach(e => {
                    fs.unlinkSync(`./src/sounds/users_join/${interaction.user.id}/${e}`)
                    console.log(`Удалено: ${e}`);
                });
                interaction.reply(`Успешно удаленно ${interaction.values}`)
                interaction.message.delete()
            }
            fileLog(`[SOUND] ${interaction.user.username} (${interaction.user.id}) удалил звук(а) ${interaction.values} в категории \`welcome\``)
        } else if (interaction.customId === 'goodbye_remove') {
            const files = fs.readdirSync(`./src/sounds/users_leave/${interaction.user.id}`)
            if (files.length !== 0) {
                interaction.values.forEach(e => {
                    fs.unlinkSync(`./src/sounds/users_leave/${interaction.user.id}/${e}`)
                    console.log(`Удалено: ${e}`);
                });
                interaction.reply(`Успешно удаленно ${interaction.values}`)
                interaction.message.delete()
                fileLog(`[SOUND] ${interaction.user.username} (${interaction.user.id}) удалил звук(а) ${interaction.values} в категории \`goodbye\``)
            }
        }
    }
}