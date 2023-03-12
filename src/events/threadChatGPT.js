const { Events } = require('discord.js');
const fs = require('fs');

const { Configuration, OpenAIApi } = require("openai");

const { fileLog } = require('../functions/logs');
const configuration = new Configuration({
  apiKey: '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',
});
const openai = new OpenAIApi(configuration);

module.exports = {
    name: Events.ThreadCreate,

    async execute(thread) {
        console.log(thread.parentId);
        if (thread.parentId === '1083422733796393042') {
            if (!fs.existsSync(`./src/dataBase/users/${thread.ownerId}.json`)) {
                thread.send('Вы не зарегистрированы в системе');
            }
            const userData = JSON.parse(fs.readFileSync(`./src/dataBase/users/${thread.ownerId}.json`));
            let data = JSON.parse(fs.readFileSync(`./src/dataBase/chatGPT.json`));
            let response = `Ой, что-то пошло не так!`;

            response = await openai.createChatCompletion({
                model: "gpt-3.5-turbo",
                messages: [
                    {role: "system", content: `Пользователь c случайным именем ${await userData.userName} создал тему: ${await thread.name}. Вот правила как что делать, списки писать так "\`1.\`", "\`2.\`".. Код писать так "\`\`\`язык\nКод\`\`\`". Таблицы писать так "\`\`\`js\n| Заголовок | Заголовок |\`\`\`". И так далее. Если пользователь будет хамить или нарушать правила, позови меня этим текстом "<@701572980332953631>".`},
                    {role: "assistant", content: "Здраствуйте, я последняя модель ChatGPT 3.5 turbo. Я могу помочь вам со всеми вопросами, я отвечу на любой вопрос. Так же я умею делать списки, таблицы, код, и многое другое."},
                    {role: "user", content: `${await thread.fetchStarterMessage().then(message => message.content)}`},
            ],
            });
            data.data.push({
                "threadId": thread.id,
                "messages": [
                    {
                        "role": "system",
                        "content": `Пользователь c именем ${await userData.userName} создал тему: ${await thread.name}`
                    },
                    {
                        "role": "assistant",
                        "content": "Здраствуйте, я последняя модель ChatGPT 3.5 turbo. Я могу помочь вам со всеми вопросами, я отвечу на любой вопрос."
                    },
                    {
                        "role": "user",
                        "content": `${await thread.fetchStarterMessage().then(message => message.content) }`
                    },
                    response.data.choices[0].message
                ],
                creatorId: thread.ownerId
            })

            thread.send(response.data.choices[0].message);

            fs.writeFileSync(`./src/dataBase/chatGPT.json`, JSON.stringify(data, null, 2));

            fileLog(`[CHATGPT3.5] ${userData.userName} (${thread.ownerId}) создал тему: ${thread.name} и написал: ${thread.lastMessage.content}`);
        }
    }
}