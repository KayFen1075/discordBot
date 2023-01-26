const { Events } = require('discord.js')
const { execute } = require('./ready')
const { Configuration, OpenAIApi } = require("openai");

const configuration = new Configuration({
  apiKey: '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',
});

const openai = new OpenAIApi(configuration);


module.exports = {
    name: Events.MessageCreate,
    async execute(message) {
        if (!message.author.bot && message.channelId === '1067154510000160900') {
            const waitMessage = await message.channel.send({ content: '<:cmd:1065337429688594432> Обрабатываю ваш запрос..' })
            const response = await openai.createCompletion({
                model: "text-davinci-002",
                prompt: `Ниже приведен разговор с помощником искусственного интеллекта. Так же он находится в дискорд сервере "ХАЖАБА", его роль помогать участникам. Так как это дискорд, твоя задача писать как в дискорде, тобиж код надо писать в \`\`\`Code type\nCode\`\`\` и т.д. Ещё информация о твоей роботе, тебя зовут "КайФэн", ты должен в начале каждого ответа ставить подходящий смайлик. Немного про сервер "ХАЖАБА", это приватный сервер в дискорде который был создан для общения и проведения собраний. Его функционал: Создавать списки, Искать игры в которые можно поиграть, различные нейросети, совместные создания и многое другое. Не забывай ставить смайлики! Ещё твоя задача давать короткие ответы и развлекать пользователей, говорить только понятный кораткий ответ в максимум 150 симловол НЕ больше.\n\nЧеловек: Здравствуйте, кто вы?\nAI: 😘 Я ИИ, созданный Кеви. Чем я могу помочь вам сегодня? \n\n Человек: ${message.content}\nAI:`,
                temperature: 0.9,
                max_tokens: 170,
                top_p: 1,
                frequency_penalty: 0.0,
                presence_penalty: 0.6,
                stop: [" Человек:", " AI:"],
              });
            await message.reply(`${response.data.choices[0].text}`)
            await waitMessage.edit({ content: '<:cmd:1065337429688594432> Готово!' })
            setTimeout(async () => {
                await waitMessage.delete()
            }, 3000);
        }
    }
}