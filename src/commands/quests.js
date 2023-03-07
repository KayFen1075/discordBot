const { SlashCommandBuilder, PermissionFlagsBits, Colors, EmbedBuilder } = require('discord.js');
const fs = require('fs');
const CircularJSON = require('circular-json');

module.exports = {
    data: new SlashCommandBuilder()
        .setName('quest')
        .setDescription('Квесты')
        .addSubcommand(subcommand => subcommand
            .setName('create')
            .setDescription('Создать квест')
            .addStringOption(option => option
                .setName('name')
                .setDescription('Название')
                .setRequired(true))
            .addStringOption(option => option
                .setName('description')
                .setDescription('Описание(что надо сдлеать)')
                .setRequired(true))
            .addNumberOption(option => option
                .setName('reward')
                .setDescription('Награда за квест опыта')
                .setRequired(true))
            .addStringOption(option => option
                .setName('type')
                .setDescription('Тип квеста, ежедневный, недельный, сезонный')
                .setRequired(true)
                .setChoices(
                    { name: 'Ежедневный', value: 'Evryday' },
                    { name: 'Недельный',  value: 'Week' },
                    { name: 'Сезонный',   value: 'Season' },
                ))
                .addNumberOption(option => option
                    .setName('progress')
                    .setDescription('Еденицы нужные для выполнения квеста')
                    .setRequired(false))
        )
        .addSubcommand(subcommand => subcommand
            .setName('delete')
            .setDescription('Удалить квест')
            .addStringOption(option => option
                .setName('name')
                .setDescription('Название')
                .setRequired(true))
        )
        .addSubcommand(subcommand => subcommand
            .setName('list')
            .setDescription('Список твоих квестов которые надо выполнить')
        )
        .addSubcommand(subcommand => subcommand
            .setName('edit')
            .setDescription('Редактировать квест')
            .addStringOption(option => option
                .setName('name')
                .setDescription('Название')
                .setRequired(true))
            .addStringOption(option => option
                .setName('description')
                .setDescription('Описание(что надо сдлеать)')
                .setRequired(false))
            .addNumberOption(option => option
                .setName('reward')
                .setDescription('Награда за квест опыта')
                .setRequired(false))
            .addNumberOption(option => option
                .setName('progress')
                .setDescription('Еденицы нужные для выполнения квеста')
                .setRequired(false))
            .addStringOption(option => option
                .setName('type')
                .setDescription('Тип квеста, ежедневный, недельный, сезонный')
                .setRequired(false)
                .setChoices(
                    { name: 'Ежедневный', value: 'Evryday' },
                    { name: 'Недельный',  value: 'Week' },
                    { name: 'Сезонный',   value: 'Season' },
                ))
        )
        .addSubcommand(subcommand => subcommand
            .setName('give')
            .setDescription('Выдать квест')
            .addUserOption(option => option
                .setName('user')
                .setDescription('Пользователь')
                .setRequired(true))
            .addStringOption(option => option
                .setName('name')
                .setDescription('Название')
                .setRequired(true))
        ),

    async execute(interaction) {
        let data = JSON.parse(fs.readFileSync('./src/dataBase/bot.json'))

        const subcommand = interaction.options.getSubcommand();


        if (subcommand === 'create') {

            const user = interaction.options.getUser('user');
            const name = interaction.options.getString('name');
            const description = interaction.options.getString('description');
            const reward = interaction.options.getNumber('reward');
            const type = interaction.options.getString('type');
            const progress = interaction.options.getNumber('progress');

            // only admin can create quests
            if (!interaction.member.permissions.has(PermissionFlagsBits.Administrator)) {
                interaction.reply({ content: 'У вас нет прав для выполнения этой команды!', ephemeral: true });
                return
            }
            // check if quest already exists
            if (data.quests.find(quest => quest.name === name)) {
                interaction.reply('Квест с таким названием уже существует');
                return;
            }

            const quest = {
                name: name,
                description: description,
                reward: reward,
                type: type,
                progress: 0,
                need: progress,
                users_have_quest: [], // { id: 'id', progress: 0, need: 10 }
                users_completed_quest: [],
            }

            data.quests.push(quest);

            fs.writeFileSync('./src/dataBase/bot.json', JSON.stringify(data, null, 2));

            interaction.reply(`Вы создали новый квест **${name}** вся информация: \nОписание: ${description} \nНаграда: ${reward} \nТип: ${type}`);
        } else if (subcommand === 'delete') {

            const name = interaction.options.getString('name');

            // only admin can delete quests
            if (!interaction.member.premissions.has(PermissionFlagsBits.Administrator)) {
                interaction.reply('Только администратор может удалять квесты');
                return;
            }

            // check if quest exists
            if (!data.quests.find(quest => quest.name === name)) {
                interaction.reply('Квеста с таким названием не существует');
                return;
            }

            data.quests = data.quests.filter(quest => quest.name !== name);

            fs.writeFileSync('./src/dataBase/bot.json', JSON.stringify(data, null, 2));

            interaction.reply(`Вы удалили квест **${name}**`);
        } else if (subcommand === 'list') {

            // get all users quests
            const quests = data.quests

            let evrydayQuests = [];
            let weekQuests = [];
            let seasonQuests = [];

            quests.forEach(quest => {
                let users = quest.users_have_quest;

                if (quest.type === 'Evryday') {
                    let usersWithProgress = [];

                    users.forEach(user => {
                        let progress = Math.floor(user.progress / quest.need * 100);
                        let bar = '█'.repeat(Math.floor(progress / 10)) + '░'.repeat(10 - Math.floor(progress / 10));

                        usersWithProgress.push({ id: user.id, bar: `${progress}% ${bar}`, quest: quest.name });
                    });

                    evrydayQuests.push(...usersWithProgress);
                }
            else if (quest.type === 'Week') {
            // get quest name + users + progress in % and bar (█, ░)

            let usersWithProgress = [];

            users.forEach(user => {
                let progress = Math.floor(user.progress / quest.need * 100);
                        let bar = '█'.repeat(Math.floor(progress / 10)) + '░'.repeat(10 - Math.floor(progress / 10));

                        usersWithProgress.push({id: user.id, bar: `${progress}% ${bar}`, quest: quest.name});
                    });

                    weekQuests.push(...usersWithProgress);

                } else if (quest.type === 'Season') {
                    // get quest name + users + progress in % and bar (█, ░)

                    let usersWithProgress = [];

                    users.forEach(user => {
                        let progress = Math.floor(user.progress / quest.need * 100);
                        let bar = '█'.repeat(Math.floor(progress / 10)) + '░'.repeat(10 - Math.floor(progress / 10));

                        usersWithProgress.push({id: user.id, bar: `${progress}% ${bar}`, quest: quest.name});
                    });

                    seasonQuests.push(...usersWithProgress);
                }
            })
        
            let embeds = [];

            // evryday quests
            if (evrydayQuests.length > 0) {

                let fileds = [];
                evrydayQuests.forEach(user => {
                    let quest = data.quests.find(quest => quest.name === user.quest);
                    const userData = JSON.parse(fs.readFileSync(`./src/dataBase/users/${user.id}.json`))

                    fileds.push({ name: `${userData.userName} ${quest.name}`, value: `Награда: \`${quest.reward}xp\`\n\`\`\`js\n${quest.description}\`\`\`**${user.bar} (${quest.users_have_quest.find(x => x.id === user.id ).progress})**`, inline: true });
                });


                embeds.push(new EmbedBuilder()
                    .setTitle('☀️ Ежедневные квесты')
                    .setDescription('Квесты которые можно выполнять каждый день, прогресс пользователей:')
                    .addFields(fileds)
                    .setColor(Colors.Green)
                );
            } 

            // week quests
            if (weekQuests.length > 0) {

                let fileds = [];

                weekQuests.forEach(user => {
                    let quest = data.quests.find(quest => quest.name === user.quest);
                    const userData = JSON.parse(fs.readFileSync(`./src/dataBase/users/${user.id}.json`))

                    fileds.push({ name: `${userData.userName} ${quest.name}`, value: `Награда: \`${quest.reward}xp\`\n\`\`\`js\n${quest.description}\`\`\`**${user.bar} (${quest.users_have_quest.find(x => x.id === user.id ).progress})**`, inline: true });
                });

                embeds.push(new EmbedBuilder()
                    .setTitle('🌇 Еженедельные квесты')
                    .setDescription(`Квесты которые можно выполнять каждую неделю, прогресс пользователей:`)
                    .addFields(fileds)
                    .setColor(Colors.Gold)
                );
            }
            
            // season quests
            if (seasonQuests.length > 0) {

                let fileds = [];

                seasonQuests.forEach(user => {
                    let quest = data.quests.find(quest => quest.name === user.quest);
                    const userData = JSON.parse(fs.readFileSync(`./src/dataBase/users/${user.id}.json`))

                    fileds.push({ name: `${userData.userName} ${quest.name}`, value: `Награда: \`boost ${quest.reward}x\`\n\`\`\`js\n${quest.description}\`\`\`**${user.bar} (${quest.users_have_quest.find(x => x.id === user.id ).progress})**`, inline: true });
                });

                embeds.push(new EmbedBuilder()
                    .setTitle('🌘 Ежесезонные квесты')
                    .setDescription(`Квесты которые можно выдаються каждый сезон, в слудующем сезоне они дадут буст опыта на 3 дня, прогресс пользователей:`)
                    .addFields(fileds)
                    .setColor(Colors.DarkBlue)
                );
            }

            interaction.reply({ content: `Активные квесты:`, embeds: embeds, ephemeral: true });
        } else if (subcommand === 'edit') {

            const name = interaction.options.getString('name');
            const description = interaction.options.getString('description');
            const reward = interaction.options.getNumber('reward');
            const type = interaction.options.getString('type');

            if (!interaction.member.permissions.has(PermissionFlagsBits.Administrator)) {
                interaction.reply({ content: 'У вас нет прав для выполнения этой команды!', ephemeral: true });
                return
            }

            let quest = data.quests.find(quest => quest.name === name);

            description ? quest.description = description : null;
            reward ? quest.reward = reward : null;
            type ? quest.type = type : null;

            fs.writeFileSync('./src/dataBase/quests.json', JSON.stringify(data, null, 4));

            interaction.reply({ content: `Квест \`${name}\` успешно изменен!`, ephemeral: true });
        } else if (subcommand === 'give') {
            
            const name = interaction.options.getString('name');
            const user = interaction.options.getUser('user');

            // only admin can give quests
            if (!interaction.member.permissions.has(PermissionFlagsBits.Administrator)) {
                interaction.reply({ content: 'У вас нет прав для выполнения этой команды!', ephemeral: true });
                return
            }
            // check if quest exists
            if (!data.quests.find(quest => quest.name === name)) {
                interaction.reply('Квеста с таким названием не существует');
                return;
            }

            const quest = data.quests.find(quest => quest.name === name);
            console.log(quest);
            // check if user exists
            if (quest.users_have_quest.find(user => user.id === user)) {
                interaction.reply('Пользователь уже имеет этот квест');
                return;
            }

            // add user to quest
            quest.users_have_quest.push({id: user.id, progress: 0});

            fs.writeFileSync('./src/dataBase/bot.json', JSON.stringify(data, null, 2));

            interaction.reply(`Вы выдали квест **${name}** пользователю <@${user}>`);

        }
    }
};