const fs = require('fs');
const { EmbedBuilder, Colors } = require('discord.js');

async function updateQuests(client) {
    const data = JSON.parse(fs.readFileSync('./src/dataBase/bot.json'));
    let quests = data.quests;

    updateMessageQuest(client);

    if (quests.length == 0) {
        return
    }
    const now = new Date();
    const day = now.getDate();
    console.log(now);

    // check if day changed

    const questsDay = new Date(data.questsDayTime)
    console.log(questsDay);
    if (questsDay.getDate() != day) {
        data.questsDayTime = now;
        
        let quests = data.quests.filter(quest => quest.type == 'Evryday');

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

            const random = Math.floor(Math.random() * quests.length);
            quests[random]?.users_have_quest.push({
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
            const channel = client.channels.cache.get('1062752082408513676');
            // channel.send(`Появились новые еженедельные квесты! <#1082480582912651325>`);

            quests = data.quests.filter(quest => quest.type == 'Week');

            quests.forEach(quest => {
                quest.users_have_quest = [];
            });

            users.forEach(user => {
                user = user.replace('.json', '');

                const random = Math.floor(Math.random() * quests.length);
                console.log(quests[random]);
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

module.exports = {
    updateQuests,
};