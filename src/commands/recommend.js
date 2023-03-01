const { SlashCommandBuilder } = require('@discordjs/builders');
const { Client, StringSelectMenuBuilder, ActionRowBuilder, ButtonBuilder, GatewayIntentBits, EmbedBuilder, PermissionsBitField, Permissions, MessageManager, Embed, Collection, Colors } = require('discord.js');
const { game_table } = require('../functions/listFunc.js')
const fs = require('fs')

const { Configuration, OpenAIApi } = require("openai");
const { fileLog } = require('../functions/logs.js');


const configuration = new Configuration({
  apiKey: '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',
});
const openai = new OpenAIApi(configuration);

module.exports = {
data: new SlashCommandBuilder()
    .setName('recommend')
    .setDescription('Получить рекомендации во что можно поиграть'),
    async execute(interaction) {
        try {
            const response = await openai.createCompletion({
model: "text-davinci-003",
prompt: `Ваша задача - порекомендовать игры пользователю и его друзьям. Вам будет дан список игр, где 🟥 означает, что игры нет в списке, 🟨 означает, что никто не заинтересован в игре сейчас, а 🟩 означает, что кто-то хочет в нее поиграть. Вам нужно посмотреть на жанры, понять, кто во что играет, и выбрать до трех игр. Ваши рекомендации должны быть разделены на три категории:
Игры, в которые можно играть прямо сейчас
Игры, которые могут обеспечить долгосрочное развлечение
Игры, которых нет в списке
Вам разрешается писать только названия игр в вашей рекомендации, без каких-либо дополнительных комментариев (таких как "я рекомендую" или "и т.д."). Кроме того, вы должны следовать следующим правилам:

Если игры нет в списке, но у нее маленький размер файла, вы можете включить ее в список, и она должна быть бесплатной.
Если в игру играет всего несколько человек, ее не следует включать.
Рекомендуйте только игры для ПК, игнорируя игры для Android и краткую историю.
Учитывайте цену игры. Если игра доступна не всем и является платной, ее не следует включать в рекомендацию.
Некоторые игры в списке могут быть платными, поэтому обязательно проверяйте каждую из них.
Не включайте игры, которых нет в списке.
Не пиши слишком много игры, 3-5 хватит.
Добавляй отступы.
Писать игры в которые можно играть от 2 человек, одиночные игры строго запрещены в списке.
Если человек не хочет играть в игру, это не значит, что он не может в нее играть. Однако если они не могут в нее играть, ее не следует включать в список.
Кроме того, не включайте в список игры, в которые играет лишь меньшинство людей. Например, если в игру играет только один человек, но не играют другие".
А вот пример разговора, основанного на этом запросе:
User: *list*
AI:
1 Игры, в которые можно играть прямо сейчас:
games..

2 Игры, которые могут обеспечить долгосрочное развлечение:
games..

3 Игры, которых нет в списке:
games..

User: ${game_table()[2]}
AI:`,
                  temperature: 0,
                  max_tokens: 1000,
                  top_p: 0,
                  frequency_penalty: 0,
                  presence_penalty: 0,
                  stop: ["User:", "AI:"],
                });
            const responseText = await response.data.choices[0].text
            console.log(responseText);
            await interaction.channel.send({content: `${responseText}`,
            embeds: [new EmbedBuilder()
                .setTitle('📨 Рекомендация')
                .setDescription(`Смотря на ваши вкусы и предпочтения, я могу порекомендовать пойти сейчас в такую игру: \n\`\`\`${responseText}\`\`\``)
                .setColor(Colors.Aqua)
            ]})    
            let bot = JSON.parse(fs.readFileSync('./src/dataBase/bot.json'))
             bot.recomend = responseText
             fs.writeFileSync('./src/dataBase/bot.json', JSON.stringify(bot))
             fileLog(`[RECOMEND] ${interaction.user.username} (${interaction.user.id}) получил рекомендацию: ${responseText}`)
        } catch (error) {
            console.error;
        }
    }
}