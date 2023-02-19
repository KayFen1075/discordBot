const { SlashCommandBuilder, Attachment } = require('discord.js')
const AI = require('stable-diffusion-cjs')
const { execute } = require('./bot')
const fs = require('fs')

module.exports = {
    data: new SlashCommandBuilder()
        .setName('imgen')
        .setDescription('Сгенерировать картинку')
        .addStringOption(option => option
            .setName('promt')
            .setDescription('Описание картины на англизком')
        ),

    async execute(interaction) {
        console.log(interaction.options.get('promt').value);
        AI.generate(interaction.options.get('promt').value, async (result) => {
            if (result.error) {
                console.log(result.error)
                return;
            }
            try {
                for (let i = 0; i < result.results.length; i++) {
                    let data = result.results[i].split(",")[1]
                    const buffer = Buffer.from(data, "base64")
                    const filename = `image_${i + 1}.png`
                    interaction.channel.send({content: `<@${interaction.user.id}> изаброжение готово! По запросу \`${interaction.options.get('promt').value}\`.`, files: [buffer]})
                    fs.writeFileSync(`./src/images/imagen/${filename}`, buffer)
                }
            } catch (e) {
                console.log(e)
            }
        })
        console.log(1);
        // fs.readdir(`./src/images/imagen`, (err, files) => {
        //     const attachments = files.map(file => new Attachment(`./src/images/imagen/${file}`));
        //     console.log(attachments);
        //     interaction.channel.send({content: `<@${interaction.user.id}> изаброжение готово! По запросу \`${interaction.options.get('promt').value}\`.`, files: [attachments]})
        // })
        
    }
}