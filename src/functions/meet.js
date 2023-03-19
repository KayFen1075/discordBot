const fs = require('fs');
const { fileLog } = require('./logs');
const config = require('../config.json');
const { ActionRowBuilder, ButtonBuilder, EmbedBuilder } = require('@discordjs/builders');

async function meetCreate(interaction, client, creator_id, subjects, users) {

    if (fs.existsSync(`./src/dataBase/meets/${creator_id}.json`) || fs.existsSync(`./src/dataBase/planMeets/${creator_id}.json`)) {
        console.log(`[ERROR] ${creator_id} уже создал встречу или планирует создать встречу`);
        fileLog(`[ERROR] meetCreate: ${creator_id} уже создал встречу или планирует создать встречу`);
        return false;
    }

    if (client || creator_id || subjects || users === undefined) {
        console.log(`[ERROR] meetCreate: Не все аргументы были переданы`);
        fileLog(`[ERROR] meetCreate: Не все аргументы были переданы`);
        return false;
    }

    let userData = JSON.parse(fs.readFileSync(`./src/dataBase/users/${creator_id}.json`));

    const emojis = ['🔥', '💥', '🫡', '🧨', '🐸', '🐷', '🐵', '😺', '🫥', '🌈', '🌪', '🌟', '🌙', '🌚', '🌝']
    const randomEmoji = emojis[Math.floor(Math.random() * emojis.length)]

    let userList = [];
    let perms = [];
    const guid = client.guilds.cache.get("1060755232109379644");
    const meets_channel = await guild.channels.cache.get(config.channels_id.meets);

    // create voice channel
    const voiceChannel = await guild.channels.create({
        name: `${randomEmoji}${userData.userName}: ${truncateText(userData.createEvent.setup1.toString())} id♂${creator_id}`,
        type: ChannelType.GuildVoice,
    }); await voiceChannel.setParent('1060755232583319665');

    // get perms and userList
    await users.forEach(async element => {
        const user = await guid.members.cache.get(element);
        userList.push(`<@${user.user.id}>`)
        await perms.push({
            id: element,
            allow: [PermissionsBitField.Flags.Connect],
        },
            {
                id: creator_id,
                allow: [PermissionsBitField.Flags.Connect],
            },
            {
                id: guid.id,
                deny: [PermissionsBitField.Flags.Connect],
            })
    });



    meets_channel.send({
        content: `<@${creator_id}> только что создал собрание и позвал: ${userList.join(', ')}`,
        embeds: [new EmbedBuilder()
            .setTitle(`${randomEmoji} Создано собрание!`)
            .setDescription(`${userData.userName} создал собрание на темы: \`${subjects.join(', ')}\`!\nВсе участники собрания: **<@${creator_id}>, ${userList.join(', ')}**\nЗайти в голосовой канал можно [через эту ссылку](https://discord.com/channels/${guid.id}/${await voiceChannel.id})`)
            .setColor(Colors.Green)
            .setTimestamp(Date.now())
            .setFooter({ text: `⚠️ Собрание автоматически удалиться через 30 минут если в нём никого не окажеться`})
        ],
        components: [new ActionRowBuilder().addComponents([
            new ButtonBuilder()
                .setLabel('Зайти по этой кнопке')
                .setStyle(ButtonStyle.Link)
                .setURL(`https://discord.com/channels/${guid.id}/${await voiceChannel.id}`)
        ])]
    })

    await voiceChannel.permissionOverwrites.set(await perms)

    userData.createEvent.setup2 = users;
    fs.writeFileSync(`./src/dataBase/users/${creator_id}.json`, JSON.stringify(userData))
    await interaction?.message.edit({
        content: `<@${creator_id}> собрание запускаеться, ладно обманываю. На самом деле я нашёл пульт от ядерки и прямо сейчас говотовилось наподение на Белорусь, я вот карту принес сейчас покажу 🗺️.. Вот поэтому **Z** прямо сейчас запускаю ядерку на хуй;!; !;!;!;!;!;;!;!`,
        embeds: [new EmbedBuilder()
            .setTitle(`🚧 Создание собрания`)
            .setColor(Colors.Yellow)
            .setDescription(`Вы выбрали: \n${await userList}\n\`\`\`${userData.createEvent.setup1}\`\`\`\n скоро начнёться собрание`)],
        tts: true,
        components: [new ActionRowBuilder().addComponents([
            new ButtonBuilder()
                .setCustomId('happy')
                .setLabel('Готов') 
                .setStyle(ButtonStyle.Success)
        ])]
    })

    let meet = {
        users_list: users,
        games_list: subjects,
        channel: voiceChannel.id,
        meesage_id: voiceChannel.id,
        time_start: Date.now()
    };

    giveAdvanced(client, "Hello world", creator_id)

    setTimeout(() => {
        interaction?.message.delete()
    }, 5000)
    const chech_users = setInterval(async () => {
        const members = await voiceChannel.members.filter(member => !member.user.bot);
        if (members.size === 0 && fs.existsSync(`./src/dataBase/meets/${creator_id}.json`)) {
            voiceChannel.delete()
            const timeMeet = Date.now() - meet.time_start

            let bot = JSON.parse(fs.readFileSync(`./src/dataBase/bot.json`))
            bot.state[bot.state.length - 1] = bot.state[bot.state.length - 1] + timeMeet
            fs.writeFileSync(`./src/dataBase/bot.json`, JSON.stringify(bot))

            meetChannel.send(`<@${creator_id}> ваше собрание было пустым, поэтому я его закрыл, оно длилось \`${Math.round(timeMeet / 60000 / 60)}ч, ${Math.round(timeMeet / 60000 % 60)}м\`, это время не учитывалось так как в нём не кого не было.`)
            fs.unlinkSync(`./src/dataBase/meets/${creator_id}.json`)
            clearInterval(chech_users)
        }
    }, 300000)
    interaction?.reply({ content: 'GayPaty StaRt', ephemeral: true })
    fs.writeFileSync(`./src/dataBase/meets/${creator_id}.json`, JSON.stringify(meet))
}

module.exports = { meetCreate }