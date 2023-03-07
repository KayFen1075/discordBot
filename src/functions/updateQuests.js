const fs = require('fs');

async function updateQuests(client) {
    const data = JSON.parse(fs.readFileSync('./src/dataBase/bot.json'));
    let quests = data.quests;

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
            channel.send(`Появились новые еженедельные квесты! <#1082480582912651325>`);

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
module.exports = {
    updateQuests,
};