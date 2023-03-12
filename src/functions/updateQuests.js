const fs = require('fs');
const { EmbedBuilder, Colors } = require('discord.js');
const { xpAdd } = require('./leveling');

async function updateQuests(client) {
    const data = JSON.parse(fs.readFileSync('./src/dataBase/bot.json'));
    let quests = data.quests;

    updateMessageQuest(client);

    if (quests.length == 0) {
        return
    }
    const now = new Date();
    const day = now.getDate();

    // check if day changed

    const questsDay = new Date(data.questsDayTime)
    if (questsDay.getDate() != day) {
        data.questsDayTime = now;
        
        let quests = data.quests.filter(quest => quest.type == 'Evryday');

        const channel = client.channels.cache.get('1062752082408513676');

        quests.forEach(quest => {
            quest.users_have_quest.forEach(user => {
                let userData = JSON.parse(fs.readFileSync(`./src/dataBase/users/${user.id}.json`));
                userData.stuck = 1;
                fs.writeFileSync(`./src/dataBase/users/${user.id}.json`, JSON.stringify(userData));
            });
            quest.users_have_quest = [];
        });

        const users = fs.readdirSync('./src/dataBase/users/');
        users.forEach(user => {
            user = user.replace('.json', '');
            
            let userData = JSON.parse(fs.readFileSync(`./src/dataBase/users/${user}.json`));

            user_no_complted_quests = quests.filter(quest => !quest.users_completed_quest.find(id => id == user));
            console.log(user_no_complted_quests.length);

            if (user_no_complted_quests.length == 0) {
                channel.send(`<@${user}> выполнил все ежедневные квесты, которые только были! Его стрик равен \`${userData.stuck}x\` 🔥`);
                console.log('Пользователь выполнил все ежедневные квесты, удаляем его из всех квестов');
                quests.forEach(quest => {
                    // delete user from users_completed_quest
                    quest.users_completed_quest = quest.users_completed_quest.filter(id => id != user);
                    user_no_complted_quests = quests
                });
            }

            const random = Math.floor(Math.random() * user_no_complted_quests.length);
            user_no_complted_quests[random]?.users_have_quest.push({
                id: user,
                progress: 0,
            });
        });

        // replace users_have_quest in data.quests only for Evryday quests
        data.quests = data.quests.map(quest => {
            if (quest.type == 'Evryday') {
                return quests.find(q => q.name === quest.name);
            } else {
                return quest;
            }
        });

        fs.writeFileSync('./src/dataBase/bot.json', JSON.stringify(data));
        
        if (questsDay.getDate() % 7 === 0) {
            channel.send(`Появились новые еженедельные квесты! <#1082480582912651325>`);

            quests = data.quests.filter(quest => quest.type == 'Week');

            quests.forEach(quest => {
                quest.users_have_quest = [];
            });

            users.forEach(user => {
                user = user.replace('.json', '');

                const random = Math.floor(Math.random() * quests.length);

                quests[random].users_have_quest.push({
                    id: user,
                    progress: 0,
                });
            });

            // replace users_have_quest in data.quests only for Weekly quests
            data.quests = data.quests.map(quest => {
                if (quest.type == 'Weekly') {
                    return quests.find(q => q.name === quest.name);
                } else {
                    return quest;
                }
            });

            fs.writeFileSync('./src/dataBase/bot.json', JSON.stringify(data));
        }
        updateMessageQuest(client);
    }
}

async function updateMessageQuest(client) {
    let data = JSON.parse(fs.readFileSync('./src/dataBase/bot.json'));
    let quests = data.quests;

    if (quests.length == 0) {
        return
    }

    // get all users quests

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

    const channel = await client.channels.cache.get('1082480582912651325');
    let message = await channel.messages.fetch(data.questsMessageId);


    if (data.questsMessageId != message.id) {
        let data2 = JSON.parse(fs.readFileSync('./src/dataBase/bot.json'));
        message = await channel.send({ content: `Активные квесты:`, embeds: embeds, ephemeral: true });

        data2.questsMessageId = message.id;
        fs.writeFileSync('./src/dataBase/bot.json', JSON.stringify(data2));
    } else {
        message.edit({ content: `Активные квесты:`, embeds: embeds });
    }
}

async function progressQuestAdd(client, userId, questName, progress, message, voiceChannel) {
    let data = JSON.parse(fs.readFileSync('./src/dataBase/bot.json'));
    let quest = data.quests.find(quest => quest.name === questName);

    if (!quest) return;

    let user = quest.users_have_quest.find(user => user.id === userId);

    if (!user) return;

    await fs.writeFileSync('./src/dataBase/bot.json', JSON.stringify(data));

    user.progress += progress;
    if (user.progress >= quest.need) {
        console.log(`Квест ${quest.name} завершен пользователем ${userId}`);
        endQuest(client, userId, questName, message, voiceChannel)
    }
    updateMessageQuest(client);
}

async function progressQuestSet(client, userId, questName, progress, message, voiceChannel) {
    let data = JSON.parse(fs.readFileSync('./src/dataBase/bot.json'));
    let quest = data.quests.find(quest => quest.name === questName);

    if (!quest) return;

    let user = quest.users_have_quest.find(user => user.id === userId);

    if (!user) return;

    await fs.writeFileSync('./src/dataBase/bot.json', JSON.stringify(data));

    user.progress = progress;
    if (user.progress >= quest.need) {
        console.log(`Квест ${quest.name} завершен пользователем ${userId}`);
        endQuest(client, userId, questName, message, voiceChannel)
    }
    updateMessageQuest(client);
}

async function endQuest(client, userId, questName, message, voiceChannel) {
    let data = JSON.parse(fs.readFileSync('./src/dataBase/bot.json'));
    let quest = data.quests.find(quest => quest.name === questName);

    if (!quest) return;

    let userQuest = quest.users_have_quest.find(userQuest => userQuest.id === userId);

    if (!userQuest) return;

    quest.users_have_quest.splice(quest.users_have_quest.indexOf(userQuest), 1);
    quest.users_completed_quest.push(userQuest.id);

    fs.writeFileSync('./src/dataBase/bot.json', JSON.stringify(data));

    let userData = JSON.parse(fs.readFileSync(`./src/dataBase/users/${userId}.json`));
    let revand = quest.reward;

    if (quest.type === 'Evryday') {
        userData.stuck += 0.25;
        revand = quest.reward * userData.stuck;
        xpAdd(client, userId, revand, message, voiceChannel, true)
    } else if (quest.type === 'Week') {
        userData.stuckWeek += 1
        revand = quest.reward * userData.stuckWeek;
        xpAdd(client, userId, revand, message, voiceChannel, true)
    } else if (quest.type === 'Season') {
        revand = quest.reward
        xpAdd(client, userId, quest.revand, message, voiceChannel, true)
    }

    fs.writeFileSync(`./src/dataBase/users/${userId}.json`, JSON.stringify(userData));

    if (message) {
        message.react('🔥').then(() => {
            message.react('🎯');
        });
    } else if (voiceChannel) {
        voiceChannel.send({ content: `<@${userId}>, ты выполнил квест \`${quest.name}(${quest.type})\`!\nНаграда: \`${quest.reward}(${revand})xp\``});
    } else {
        const channel = await client.channels.cache.get('1060755820003991672');
        channel.send({ content: `<@${userId}>, ты выполнил квест \`${quest.name}(${quest.type})\`!\nНаграда: \`${quest.reward}(${revand})xp\``});
    }
    updateMessageQuest(client);
}

module.exports = {
    progressQuestSet,
    updateQuests,
    progressQuestAdd,
};