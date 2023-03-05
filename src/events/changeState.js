const { Events } = require('discord.js');
const { changeState } = require('../functions/statistick');

module.exports = {
    name: Events.InteractionCreate,

    async execute(interaction) {
        // check if the interaction is a reaction
        

        // check if the interaction is a button
        if (!interaction.isButton()) return;

        // check if the button a custom id start with 'state_'
        if (!interaction.customId.startsWith('stat_')) return;


        interaction.reply({ content: 'Вы изменили ститистику на ' + interaction.customId.split('_')[1], ephemeral: true });

        // change the state
        changeState(interaction)
    }
}