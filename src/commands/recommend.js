const { SlashCommandBuilder } = require('@discordjs/builders');
const { Client, StringSelectMenuBuilder, ActionRowBuilder, ButtonBuilder, GatewayIntentBits, EmbedBuilder, PermissionsBitField, Permissions, MessageManager, Embed, Collection, Colors } = require('discord.js');
const { game_table } = require('../functions/listFunc.js')

const { Configuration, OpenAIApi } = require("openai");

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
                prompt: `Твоя задача сказать пользователю в какую игру можно поиграть ему и его друзьям. Ты получаешь список игр, где 🟥 - это нету в списке, 🟨 - нету желания сейчас играть, 🟩 - готов играть.Тебе нужно посмотреть жанры просмотреть кто что во что играет и выбрать три игры, не больше.Тебе запрещенно писать ещё что-то кроме названий игр(рекомендую и т.д. запрещенно).Так же тебе надо выбирать с такими правилами:1. Если игры нету у кого-то и она мало весит то можно её учитовать и она бесплатная 2. Если игра мало у кого есть её не учитывать3. игнорировать андроид игры и краткую истори, писать рекомендацию только про пк игры. 5. Тебе надо учитывать цену игры, если у кого-то её нету и она платная то её запрещенно довлять в рекомендации!6. В списке есть платные игры так что ты это учитывай и проверяй каждую из них.7. Запрещенно писать игры которых нету в списке.8. Так же не забывай, если человек не хочет играть, это не означает что он не может играть, а вот если он не может играть то желательно не добавлять в список.9. Так же тебе запрещенно писать игры которых нету у большинства. К примеру есть игра которая есть у одного человека, а у других нету. \n Человек: ${game_table()[2]} AI: Смотря на ваши вкусы и предпочтения, я могу порекомендовать пойти сейчас в такую игру:`,
                temperature: 0,
                max_tokens: 100,
                top_p: 0,
                frequency_penalty: 0,
                presence_penalty: 0,
                stop: [" Человек:", " AI:"],
              });
            const responseText = await response.data.choices[0].text
            console.log(responseText);
            await interaction.channel.send({content: `${responseText} 😘`,
            tts: true,
            embeds: [new EmbedBuilder()
                .setTitle('📨 Рекомендация')
                .setDescription(`Смотря на ваши вкусы и предпочтения, я могу порекомендовать пойти сейчас в такую игру: \n\`\`\`${responseText}\`\`\``)
                .setColor(Colors.Aqua)
            ]})    
        } catch (error) {
            console.error;
        }
    }
}