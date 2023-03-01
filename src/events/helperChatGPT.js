const { Events, GuildScheduledEventManager } = require('discord.js')
const { execute } = require('./ready')

const { Configuration, OpenAIApi } = require("openai");
const { fileLog } = require('../functions/logs');

const configuration = new Configuration({
  apiKey: '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',
});

const openai = new OpenAIApi(configuration);

module.exports = {
    name: Events.ThreadCreate,
    
    async execute(thread) {
        console.log(await thread.fetchStarterMessage());
        if (thread.parentId === '1063376987990790206') {
            const waitMessage = await thread.send('Смотрю что можно сделать..');
            const response = await openai.createCompletion({
                model: "text-davinci-003",
                prompt: `Ты помошник в дискорде, сюда пишут люди когда у них появляються ошибки или что-то не получаеться. Примичание, они могут написать тебе всего 1 раз, так что ты должен помочь одним сообщеним, подробностей они тебе не дадут. Если ты не знаешь что делать то скажи я не знаю чем вам помочь. Твоя задача это посмотреть на проблему, если пользователь что-то сделал не так, то сказать ему что он не правильно что-то сделал. Если же ошибка в коде то упомянуть админа(сделать это в начале сообщения написав "<@701572980332953631>" иза того что это в дискорде) и дать рекомендации как это можно исправить. В кратце про наш сервер, тут есть канал с списком и 2 команды: 1. /list add (game) (android) (user) 2. /list remove (android). Команды не работают на ботов(ты КайФэн). Пиши текст красиво со всеми фишками дискорда. Твоя задача смотреть правильноли пользователь всё сделал если нет то опять же упомянуть создателя . Пользователь создал запрос на помощь: Title(${thread.name}) Problem(${await thread.fetchStarterMessage()})`,
                temperature: 0.9,
                max_tokens: 500,
                top_p: 1,
                frequency_penalty: 0.0,
                presence_penalty: 0.6,
                stop: [" Человек:", " AI:"],
              });
            await thread.send(`${response.data.choices[0].text}`)
            await waitMessage.edit('Готово!')
            fileLog(`[BUGS] ${thread.name} (${thread.id}) был создан в канале ${thread.parent.name} (${thread.parent.id}) ответ от AI: ${response.data.choices[0].text}`)
        }
    }
}