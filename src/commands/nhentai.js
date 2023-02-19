const { SlashCommandBuilder } = require('discord.js')
const { execute } = require('./list')
const nhentai = require('nhentai-js')

module.exports = {
    data: new SlashCommandBuilder()
        .setName('nhentai')
        .setDescription('Хентай библиотека nhentai')
        .addSubcommand(subcommand => subcommand
            .setName('random')
            .setDescription('Рандомный хентай')    
        ),

    async execute(interaction) {
        (async () => {
            console.log(await nhentai.getHomepage(1))
            console.log(1)
        })()
    }
}