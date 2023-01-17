const { Interaction, Embed, EmbedBuilder } = require("discord.js");

module.exports = {
    name: 'interactionCreate',
    async execute(interaction, client) {
        if (!interaction.isCommand()) return;

        const command = client.commands.get(interaction.commandName);

        if (!command) return
        
        try{
            await command.execute(interaction, client);
        } catch (error) {
            console.log(error);
            await interaction.reply({
                content: {content: 'Ошибка!',
                embeds: new EmbedBuilder()
                    .setTitle('⚠️ Произошла ошибка')
                    .setDescription(`Во время использования комманды произошла ошибка:\n\`\`\`${error}\`\`\`\nЕсли этой ошибки не должно было быть, напиши об этом в баге со скриншотом`)
                    .setColor('Red')
                }, 
                ephemeral: true
            });
        } 

    },
    


};