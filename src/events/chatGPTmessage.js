const { Events } = require('discord.js');
const fs = require('fs');

const { Configuration, OpenAIApi } = require("openai");

const { fileLog } = require('../functions/logs');
const configuration = new Configuration({
  apiKey: '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',
});
const openai = new OpenAIApi(configuration);

module.exports = {
    name: Events.MessageCreate,

    async execute(message) {

        if (message.author.bot) return;

        if (!fs.existsSync(`./src/dataBase/users/${message.author.id}.json`)) {
            message.channel.send('Вы не зарегистрированы в системе');
        }

        let data = JSON.parse(fs.readFileSync(`./src/dataBase/chatGPT.json`));

        if (data.data.find(x => x.threadId === message.channelId)) {
            let response = `Ой, что-то пошло не так!`;
            let threadData = data.data.find(x => x.threadId === message.channelId);
            threadData.messages.push({
                "role": "user",
                "content": message.content
            })

            response = await openai.createChatCompletion({
                model: "gpt-3.5-turbo", 
                messages: threadData.messages,
            });

            threadData.messages.push(response.data.choices[0].message);

            fs.writeFileSync(`./src/dataBase/chatGPT.json`, JSON.stringify(data, null, 2));
            
            message.channel.send(response.data.choices[0].message);
            fileLog(`[CHATGPT3.5] ${message.author.username} (${message.author.id}) написал: ${message.content}`);
        }
    }
}