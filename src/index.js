const fs = require('fs');
const dotenv = require('dotenv');
const path = require('node:path');
dotenv.config();
const { Events, Client, ActionRowBuilder, ButtonBuilder, GatewayIntentBits, EmbedBuilder, PermissionsBitField, Permissions, MessageManager, Embed, Collection, Colors, Message } = require('discord.js');
const { Configuration, OpenAIApi } = require("openai");

const configuration = new Configuration({
  apiKey: '',
});
const openai = new OpenAIApi(configuration);

const { game_table } = require('./functions/listFunc.js')


const { token } = require('./config.json');
const { channel } = require('diagnostics_channel');
const { request } = require('http');
const { time } = require('console');
const client = new Client({
    intents: [GatewayIntentBits.Guilds, GatewayIntentBits.GuildMessages, GatewayIntentBits.MessageContent]
});

client.on('messageCreate', async message => {
    
    // If the message is not from a bot, generate a response with ChatGPT
    if (!message.author.bot && message.channelId === '1067154510000160900') {
        const waitMessage = await message.channel.send({ content: 'Обрабатываю ваш запрос..' })
        const response = await openai.createCompletion({
            model: "text-davinci-003",
            prompt: `Ниже приведен разговор с помощником искусственного интеллекта. Так же он находится в дискорд сервере "ХАЖАБА", его роль помогать участникам. Так как это дискорд, твоя задача писать как в дискорде, тобиж код надо писать в \`\`\`Code type\nCode\`\`\` и т.д. Ещё информация о твоей роботе, тебя зовут "КайФэн", ты должен в начале каждого ответа ставить подходящий смайлик. Немного про сервер "ХАЖАБА", это приватный сервер в дискорде который был создан для общения и проведения собраний. Его функционал: Создавать списки, Искать игры в которые можно поиграть, различные нейросети, совместные создания и многое другое. Не забывай ставить смайлики! Ещё твоя задача давать короткие ответы и развлекать пользователей, говорить только понятный кораткий ответ \n\nЧеловек: Здравствуйте, кто вы?\nAI: 😘 Я ИИ, созданный Кеви. Чем я могу помочь вам сегодня? \n\n Человек: ${message.content}\nAI:`,
            temperature: 0.9,
            max_tokens: 150,
            top_p: 1,
            frequency_penalty: 0.0,
            presence_penalty: 0.6,
            stop: [" Человек:", " AI:"],
          });
        await message.reply(`${response.data.choices[0].text}`)
        await waitMessage.edit({ content: 'Готово!' })
        setTimeout(async () => {
            await waitMessage.delete()
        }, 2000);

    }
});

client.commands = new Collection();

client.once(Events.ClientReady, c => {
	console.log(`Ready! Logged in as ${c.user.tag}`);
});

const commandsPath = path.join(__dirname, 'commands');
const commandFiles = fs.readdirSync(commandsPath).filter(file => file.endsWith('.js'));

for (const file of commandFiles) {
	const filePath = path.join(commandsPath, file);
	const command = require(filePath);
	// Set a new item in the Collection with the key as the command name and the value as the exported module
	if ('data' in command && 'execute' in command) {
		client.commands.set(command.data.name, command);
	} else {
		console.log(`[WARNING] The command at ${filePath} is missing a required "data" or "execute" property.`);
	}
}

client.on(Events.InteractionCreate, async interaction => {
	if (!interaction.isChatInputCommand()) return;

	const command = interaction.client.commands.get(interaction.commandName);

	if (!command) {
		console.error(`Команда ${interaction.commandName} не найдена.`);
		return;
	}

	try {
		await command.execute(interaction);
	} catch (error) {
		console.error(error);
		await interaction.reply({ content: `При использование команды произошла ошибка!\`\`\`${error}\`\`\``, ephemeral: true });
	}
});





client.on('interactionCreate', async (interaction) =>{
    const json = JSON.parse(fs.readFileSync('./src/dataBase/bot.json'));
    const messageId = json.message_list_id;
    let channel = await client.channels.cache.get("1061827241031508121");
    let message = await channel.messages.fetch(messageId.id).catch(err => {
        console.error(err);
    });
    if (interaction.customId === 'remove_pc_games') {
        let bot = JSON.parse(fs.readFileSync(`./src/dataBase/bot.json`, 'utf-8'));

        let userr = JSON.parse(fs.readFileSync(`./src/dataBase/users/${interaction.user.username}.json`, 'utf-8'));
        let filteredArray = userr.data.games.filter(x => !interaction.values.includes(x.trim()));
        userr.data.games = filteredArray;

        const userData = JSON.stringify(userr);

        await interaction.reply({content: `Удаленно: \`${interaction.values}\`, теперь у тебя такие игры: \`${filteredArray}\``, ephemeral: true})
        fs.writeFileSync(`./src/dataBase/users/${interaction.user.username}.json`, userData)
        
        bot.list_history = [`-🔴 ${userr.userName} удалил из списка ${interaction.values} (PC)\n`,bot.list_history[0],bot.list_history[1],bot.list_history[2],bot.list_history[3]]
        fs.writeFileSync(`./src/dataBase/bot.json`, JSON.stringify(bot))
        interaction.message.delete()

        message.thread.send({ 
            content: `${userr.userName} удалил игру`,
            embeds: [ new EmbedBuilder()
                .setTitle('🔴 Удаление игры (PC)')
                .setColor(Colors.Red)
                .setDescription(`**${userr.userName}** удалил из списка \`${interaction.values}\`(PC), после удаления у него такие игры:\n\`\`\`${userr.data.games}\`\`\``)
                .setTimestamp(Date.now())
            ] })

    } else if (interaction.customId === 'remove_android_games') {
        let bot = JSON.parse(fs.readFileSync(`./src/dataBase/bot.json`, 'utf-8'));

        let userr = JSON.parse(fs.readFileSync(`./src/dataBase/users/${interaction.user.username}.json`, 'utf-8'));
        let filteredArray = userr.data.android_games.filter(x => !interaction.values.includes(x));
        userr.data.android_games = filteredArray;

        const userData = JSON.stringify(userr);

        await interaction.reply({content: `Удаленно: \`${interaction.values}\`, теперь у тебя такие игры: \`${filteredArray}\``, ephemeral: true})
        fs.writeFileSync(`./src/dataBase/users/${interaction.user.username}.json`, userData)
        
        bot.list_history = [`-🔴 ${userr.userName} удалил из списка ${interaction.values} (Android)\n`,bot.list_history[0],bot.list_history[1],bot.list_history[2],bot.list_history[3]]
        fs.writeFileSync(`./src/dataBase/bot.json`, JSON.stringify(bot))
        interaction.message.delete()

        message.thread.send({ 
            content: `${userr.userName} удалил игру`,
            embeds: [ new EmbedBuilder()
                .setTitle('🔴 Удаление игры (Android)')
                .setColor(Colors.Red)
                .setDescription(`**${userr.userName}** удалил из списка \`${interaction.values}\`(Android), после удаления у него такие игры:\n\`\`\`${userr.data.android_games}\`\`\``)
                .setTimestamp(Date.now())
            ] })
    }
    await updateList()
})
console.log(game_table);
client.on('ready', ()=>{
    updateList()
})

client.login(token)

async function updateList() {
    const json = JSON.parse(fs.readFileSync('./src/dataBase/bot.json'));
    const messageId = json.message_list_id;
    let channel = await client.channels.cache.get("1061827241031508121");
    let message = await channel.messages.fetch(messageId.id).catch(err => {
        console.error(err);
    });
    const embed_components = {
        embeds: [new EmbedBuilder()
            .setTitle('📜 Список игр')
            .setDescription(`Список игр пользователей\n${game_table()}\nСообщение будет обновляться каждый раз при взаимодействии с списками. Команды для информации в <#1060755559231524954>`)
            .setColor(Colors.Green)
            .setTimestamp(Date.now())], components: [new ActionRowBuilder()
                .addComponents([
                    new ButtonBuilder()
                        .setCustomId('start_confern_1')
                        .setLabel('🚀 Начать собрание')
                        .setStyle('3'),
                    new ButtonBuilder()
                        .setCustomId('plan_confern_1')
                        .setDisabled(true)
                        .setLabel('⏳ Запланировать собрание')
                        .setStyle('1'),
                    new ButtonBuilder()
                        .setCustomId('photo_confern')
                        .setDisabled(true)
                        .setLabel('📸 Посмотреть фото')
                        .setStyle('1')
                ])]
    }
    if (!message) {
        message = await channel.send(embed_components);
        json.message_list_id = message;

        fs.writeFileSync('./src/dataBase/bot.json', JSON.stringify(json));
        await message.startThread({
            name: '📙 List logs',
            autoArchiveDuration: 60,
            reason: 'Логи списка, просьба сюда не писать.\n\n🟢 - Добавление в список\n🔴 - Удаление из списка',
        });
        await message.thread.send('Начало логов!')
    } else {
        message.edit(embed_components);
    }
}

