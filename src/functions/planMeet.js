const { EmbedBuilder } = require('@discordjs/builders');
const { Colors } = require('discord.js');
const fs = require('fs');

async function planMeet(client, creatorId, subjects, users, time) {
    let data = {};

    data.meet = {
        "id": creatorId,
        "subjects": subjects,
        "users_invited": users,
        "users_accepted": [],
        "users_someone": [], 
        "users_declined": [], 
        "users_rejected": [],
        "time": time
    }

    // create file
    fs.writeFileSync(`./src/dataBase/planMeets/${creatorId}.json`, JSON.stringify(data, null, 2));
    
    const channelMeets = client.channels.cache.get('1074715039212253346');

    let ping_users = "";
    users.forEach(user => {
        ping_users += `<@${user}>`;
    });

    const userData = JSON.parse(fs.readFileSync(`./src/dataBase/users/${creatorId}.json`));

    // sum now date and time
    const now = Date.now()
    const time_to_start = new Date(now + time);
    const day = time_to_start.getDate();
    const month = time_to_start.getMonth() + 1;
    const hours = time_to_start.getHours();
    const minutes = time_to_start.getMinutes();
    

    const messageMeet = channelMeets.send({
        content: `Запланировано собрание, тема: **${subjects.join(', ')}**, ${ping_users}.`,
        embeds: [new EmbedBuilder()
            .setTitle(`⌛ ${userData.userName} запланировал собрание!`)
            .setColor(Colors.Yellow)
            .setDescription(`<@${creatorId}> запланировал собрание на **${day}.${month} в ${hours}:${minutes}**, тема: **${subjects.join(', ')}**. `)
        ]
    });

    // create thread
    messageMeet.startThread({
        name: `✉️ План от ${userData.userName}, логи`,
        autoArchiveDuration: 60,
        reason: 'Логи списка, просьба сюда не писать.\n\n🟢 - Добавление в список\n🔴 - Удаление из списка',
    })

    // send message in thread
    messageMeet.send(`Время начала: ${day}.${month} в ${hours}:${minutes}, дальше идут логи.`);
}