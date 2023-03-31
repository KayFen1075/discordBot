const fs = require('fs');
const { fileLog } = require('./logs');
const config = require('../config.json');
const { ChannelType, PermissionsBitField, Colors, ButtonStyle, ThreadAutoArchiveDuration } = require('discord.js');
const { ActionRowBuilder, ButtonBuilder, EmbedBuilder } = require('@discordjs/builders');
const { giveAdvanced } = require('./giveAdvanced');
const { RoundTime } = require('../functions/Mthon');
const { log } = require('console');

function truncateText(text) {
    if (text.length > 60) {
      return text.substring(0, 60) + "..";
    }
    return text;
  }

async function meetCreate(interaction, client, creator_id, subjects, users, xpBoost) {
    console.log(creator_id, subjects, users);
    if (fs.existsSync(`./src/dataBase/meets/${creator_id}.json`) || fs.existsSync(`./src/dataBase/planMeets/${creator_id}.json`)) {
        console.log(`[ERROR] ${creator_id} уже создал встречу или планирует создать встречу`);
        fileLog(`[ERROR] meetCreate: ${creator_id} уже создал встречу или планирует создать встречу`);
        return false;
    }

    if (!creator_id || !subjects || !users) {
        console.log(`[ERROR] meetCreate: Не все аргументы были переданы`);
        fileLog(`[ERROR] meetCreate: Не все аргументы были переданы`);
        return false;
    }

    let userData = JSON.parse(fs.readFileSync(`./src/dataBase/users/${creator_id}.json`));

    const emojis = ['🔥', '💥', '🫡', '🧨', '🐸', '🐷', '🐵', '😺', '🫥', '🌈', '🌟', '🌙', '🌚', '🌝']
    const randomEmoji = emojis[Math.floor(Math.random() * emojis.length)]

    let userList = [];
    let perms = [];
    const guild = await client.guilds.cache.get("1060755232109379644");
    const meets_channel = await guild.channels.cache.get(config.channels_id.meets);

    // create voice channel
    const voiceChannel = await guild.channels.create({
        name: `${randomEmoji}${userData.userName}: ${truncateText(userData.createEvent.setup1.toString())} id♂${creator_id}`,
        type: ChannelType.GuildVoice,
    }); await voiceChannel.setParent('1060755232583319665');


    // get perms and userList
    await users.forEach(async element => {
        const user = await guild.members.cache.get(element);
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
                id: guild.id,
                deny: [PermissionsBitField.Flags.Connect],
            })
    });

    let xpBoostText = '';
    xpBoost ? xpBoostText = `\n> В этом собрании действует буст опыта на \`${xpBoost}x\`` : xpBoostText = '';

    const meet_message = await meets_channel.send({
        content: `<@${creator_id}> только что создал собрание и позвал: ${userList.join(', ')}`,
        embeds: [new EmbedBuilder()
            .setTitle(`${randomEmoji} Создано собрание!`)
            .setDescription(`${userData.userName} создал собрание на темы: \`${subjects.join(', ')}\`!\nВсе участники собрания: **<@${creator_id}>, ${userList.join(', ')}**\n[Открыть голосовой канал на прямую в дискорде](https://discord.com/channels/${guild.id}/${await voiceChannel.id})${xpBoostText}`)
            .setColor(Colors.Green)
            .setTimestamp(Date.now())
            .setFooter({ text: `⚠️ Собрание автоматически удалиться через 30 минут если в нём никого не окажеться`})
        ],
        components: [new ActionRowBuilder().addComponents([
            new ButtonBuilder()
                .setLabel('Зайти по этой кнопке')
                .setStyle(ButtonStyle.Link)
                .setURL(`https://discord.com/channels/${guild.id}/${await voiceChannel.id}`),
            new ButtonBuilder()
               .setCustomId(`leave_meet☼${creator_id}`)
               .setLabel('Покинуть собрание')
               .setStyle(ButtonStyle.Danger)
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
        message_id: meet_message.id,
        time_start: Date.now(),
        emoji: randomEmoji,
        xp_boost: xpBoost,
    };

    // create thread
    const thread = await meet_message.startThread({
        name: `${randomEmoji} Логи собрания ${userData.userName}`,
        autoArchiveDuration: ThreadAutoArchiveDuration.OneDay,
    });

    thread.send(`<@${creator_id}> создал собрание на темы: \`${subjects.join(', ')}\`!\nВсе участники собрания: **<@${creator_id}>, ${userList.join(', ')}**\nЗайти в голосовой канал можно [через эту ссылку](https://discord.com/channels/${guild.id}/${await voiceChannel.id})`)
    voiceChannel.send(`<@${creator_id}> создал собрание на темы: \`${subjects.join(', ')}\`!\nВсе участники собрания: **<@${creator_id}>, ${userList.join(', ')}**`)

    giveAdvanced(client, "Hello world", creator_id)
    
    setTimeout(() => {
        interaction?.message.delete()
    }, 5000)
    const chech_users = setTimeout(async () => {
        const members = await voiceChannel.members.filter(member => !member.user.bot);
        if (members.size === 0 && fs.existsSync(`./src/dataBase/meets/${creator_id}.json`)) {
            voiceChannel.delete()
            const timeMeet = Date.now() - meet.time_start

            let bot = JSON.parse(fs.readFileSync(`./src/dataBase/bot.json`))
            bot.state[bot.state.length - 1] = bot.state[bot.state.length - 1] + timeMeet
            fs.writeFileSync(`./src/dataBase/bot.json`, JSON.stringify(bot))

            meets_channel.send(`<@${creator_id}> ваше собрание было пустым, поэтому я его закрыл, оно длилось \`${Math.round(timeMeet / 60000 / 60)}ч, ${Math.round(timeMeet / 60000 % 60)}м\`, это время не учитывалось так как в нём не кого не было.`)
            meetEnd_message(client, creator_id)
            clearInterval(chech_users)
        }
    }, 1800000)
    interaction?.reply({ content: 'GayPaty StaRt', ephemeral: true })
    fs.writeFileSync(`./src/dataBase/meets/${creator_id}.json`, JSON.stringify(meet))
}



async function meetStart(client, creator_id, xpBoost) {

    if (fs.existsSync(`./src/dataBase/planMeets/${creator_id}.json`)) {
        let planMeet = JSON.parse(fs.readFileSync(`./src/dataBase/planMeets/${creator_id}.json`))
        let userData = JSON.parse(fs.readFileSync(`./src/dataBase/users/${creator_id}.json`))

        let users = [];

        users.push(...planMeet.users_accepted, ...planMeet.users_later)

        users = users.map((item) => {
            return item.toString()
        })

        let userList = [];
        let perms = [];
        const guild = await client.guilds.cache.get("1060755232109379644");
        const meets_channel = await guild.channels.cache.get(config.channels_id.meets);

        // create voice channel
        const voiceChannel = await guild.channels.create({
            name: `${planMeet.emoji}${userData.userName}: ${truncateText(planMeet.subjects.join(', '))} id♂${creator_id}`,
            type: ChannelType.GuildVoice,
        }); await voiceChannel.setParent('1060755232583319665');

        console.log(users);
        // get perms and userList
        await users.forEach(async element => {
            const user = await guild.members.fetch(element);
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
                    id: guild.id,
                    deny: [PermissionsBitField.Flags.Connect],
                })
        });

        let xpBoostText = '';
        xpBoost ? xpBoostText = `\n> В этом собрании действует буст опыта на \`${xpBoost}x\`` : xpBoostText = '';

        const message = await meets_channel.messages.fetch(planMeet.message_id)

        const users_not_reacted = planMeet.users_invited.filter((item) => !users.includes(item));

        // ping users not reacted
        let ping_users_not_reacted = []
        users_not_reacted.forEach((item) => {
            ping_users_not_reacted.push(`<@${item}>`)
        })

        let loxi = ''
        ping_users_not_reacted.length > 0 ? loxi = `\n\nАутисты ХАЖАБЫ: ${ping_users_not_reacted.join(', ')}.` : loxi = ''


        await message.edit({
            content: `<@${creator_id}> собрание начилось! Участники: ${userList.join(', ')}`,
            embeds: [new EmbedBuilder()
                .setTitle(`${planMeet.emoji} Запланированое собрание создано!`)
                .setDescription(`${userData.userName} создал собрание на темы: \`${planMeet.subjects.join(', ')}\`!\nВсе участники собрания: **<@${creator_id}>, ${userList.join(', ')}**\n[Открыть голосовой канал на прямую в дискорде](https://discord.com/channels/${guild.id}/${await voiceChannel.id})${xpBoostText}${loxi}`)
                .setColor(Colors.Green)
                .setTimestamp(Date.now())
                .setFooter({ text: `⚠️ Собрание автоматически удалиться через 30 минут если в нём никого не окажеться` })
            ],
            components: [new ActionRowBuilder().addComponents([
                new ButtonBuilder()
                    .setLabel('Зайти по этой кнопке')
                    .setStyle(ButtonStyle.Link)
                    .setURL(`https://discord.com/channels/${guild.id}/${await voiceChannel.id}`),
                new ButtonBuilder()
                    .setCustomId(`leave_meet☼${creator_id}`)
                    .setLabel('Покинуть собрание')
                    .setStyle(ButtonStyle.Danger)
            ])]
        })

        await message.thread.send({
            content: `🔥 <@${creator_id}> Ваше запланированое собрание было начато! Все участники собрания: ${userList.join(', ')}`,
        })
        await voiceChannel.permissionOverwrites.set(await perms)

        const meet = {
            users_list: users,
            games_list: planMeet.subjects,
            channel: voiceChannel.id,
            message_id: planMeet.message,
            time_start: Date.now(),
            emoji: planMeet.emoji,
            xp_boost: xpBoost,
        }

        fs.writeFileSync(`./src/dataBase/meets/${creator_id}.json`, JSON.stringify(meet))
        fs.writeFileSync(`./src/dataBase/users/${creator_id}.json`, JSON.stringify(userData))
        fs.unlinkSync(`./src/dataBase/planMeets/${creator_id}.json`)

    }
}

async function checkPlans(client) {
    const date = new Date();

    planMeets = fs.readdirSync(`./src/dataBase/planMeets/`);
    planMeets.forEach(async element => {
        let planMeet = JSON.parse(fs.readFileSync(`./src/dataBase/planMeets/${element}`))
        let userData = JSON.parse(fs.readFileSync(`./src/dataBase/users/${element}`))

        element = element.replace('.json', '')

        let users = [];
        users.push(...planMeet.users_accepted, ...planMeet.users_later, ...planMeet.users_declined, ...planMeet.users_someone)
        let ping_users = []
        planMeet.users_invited.forEach((item) => {
            ping_users.push(`<@${item}>`)
        })

        const users_not_reacted = planMeet.users_invited.filter((item) => !users.includes(item));

        // ping users not reacted
        let ping_users_not_reacted = []
        users_not_reacted.forEach((item) => {
            ping_users_not_reacted.push(`<@${item}>`)
        })
        // console.log('--------------');
        // console.log(planMeet?.ping_45_min);
        // console.log(users_not_reacted.length > 0);
        // console.log(planMeet.time - 45 *60*1000 <= date.getTime());
        // ping users not reacted 1 hour before meet
        if (!planMeet?.ping_1_hour && users_not_reacted.length > 0 && planMeet.time - 60 *60*1000 <= date.getTime()) {
            const channel = await client.channels.fetch(config.channels_id.meets);
            const message = await channel.messages.fetch(planMeet.message_id)

            await message.thread.send({
                content: `⚠️ ${ping_users_not_reacted.join(', ')} вы не выбрали вариант к собранию! Выберите вариант сможете вы прийти или не сможете, через час начнёться собрание вас туда не добавят!`,
            })
            planMeet.ping_1_hour = true
            fs.writeFileSync(`./src/dataBase/planMeets/${element}.json`, JSON.stringify(planMeet))
            return
        }

        // ping users not reacted 45 minutes before meet
        else if (!planMeet?.ping_45_min && users_not_reacted.length > 0 && planMeet.time - 45 *60*1000 <= date.getTime()) {
            const channel = await client.channels.fetch(config.channels_id.meets);
            const message = await channel.messages.fetch(planMeet.message_id)

            await message.thread.send({
                content: `⚠️ ${ping_users_not_reacted.join(', ')} алё ебать, конча засохшая ты блять можешь нажать на вариант сможешь прийти или нет, через 45 минут начнёться собрание вас туда не добавят!\n\nЧеловеческим языком написаноже \`Нажмите выбирите сможете вы прийти или нет. ЭТО ОБЯЗАТЕЛЬНО!\` а ты хуйня не можешь на кнопочку нажать чмо ебаное блять!\n> P.S. Текст нейросети`,
            })
            planMeet.ping_45_min = true
            fs.writeFileSync(`./src/dataBase/planMeets/${element}.json`, JSON.stringify(planMeet))
            return
        }

        // ping users not reacted 2 minutes before meet
        else if (!planMeet?.ping_2_min && users_not_reacted.length > 0 && planMeet.time - 2 *60*1000 <= date.getTime()) {
            const channel = await client.channels.fetch(config.channels_id.meets);
            const message = await channel.messages.fetch(planMeet.message_id)

            await message.thread.send({
                content: `⚠️ ${ping_users_not_reacted.join(', ')} ну ты и лох. Через 2м собрание, а ты ещё не выбрал вариант. Ты ебаный чмо, ты ебаный лох, ты ебаный пидор, ты ебаный гей, ты ебаный транс, ты ебаный клоун, ты ебаный мудак!\n**Я выдаю тебе придуприждение, в следущий раз забаню нахуй!**`,
            })
            planMeet.ping_2_min = true
            fs.writeFileSync(`./src/dataBase/planMeets/${element}.json`, JSON.stringify(planMeet))
            return
        }

        // ping users 30 min before meet
        else if (planMeet.time - 1800000 <= date.getTime() && !planMeet.ping_30_min) {
            const channel = await client.channels.fetch(config.channels_id.meets);
            const message = await channel.messages.fetch(planMeet.message_id)

            await message.thread.send({
                content: `🥂 <@${element}> Ваше запланированое собрание начнеться через 30 минут! Участники: ${ping_users.join(', ')}!`,
            })
            planMeet.ping_30_min = true
            fs.writeFileSync(`./src/dataBase/planMeets/${element}.json`, JSON.stringify(planMeet))
            return
        }
        // ping users 5 min before meet
        else if (planMeet.time - 300000 <= date.getTime() && !planMeet.ping_5_min) {
            const channel = await client.channels.fetch(config.channels_id.meets);
            const message = await channel.messages.fetch(planMeet.message_id)

            await message.thread.send({
                content: `🥳 <@${element}> Ваше запланированое собрание начнеться через 5 минут! Участники: ${ping_users.join(', ')}!`,
            })
            planMeet.ping_5_min = true
            fs.writeFileSync(`./src/dataBase/planMeets/${element}.json`, JSON.stringify(planMeet))
            return
        }

        switch (planMeet.type) {
            case 'allReady': {
                if (planMeet.time <= date.getTime() && users_not_reacted.length == 0) {
                    meetStart(client, element, planMeet.xpBoost)
                } else if (planMeet.time <= date.getTime() && users_not_reacted.length != 0) {
                    const channel = await client.channels.fetch(config.channels_id.meets);
                    const message = await channel.messages.fetch(planMeet.message_id)

                    await message.thread.send({
                        content: `⚠️ <@${element}> Ваше запланированое собрание было не запущенно! Не все участники собрания приняли приглашение! Вы можеет начать собрание вручную командой \`/meet start\` ${ping_users.join(', ')}\n> Собрание будет удалено через 30 минут!`,
                    })
                    planMeet.type = 'end'
                    fs.writeFileSync(`./src/dataBase/planMeets/${element}.json`, JSON.stringify(planMeet))
                    return
                }
            } break;
			ф
            case 'time': {
                if (planMeet.time <= date.getTime()) {
                    meetStart(client, element, planMeet.xpBoost)
                    return
                }
            } break;

            case 'command': {
                if (planMeet.time <= date.getTime()) {
                    const channel = await client.channels.fetch(config.channels_id.meets);
                    const message = await channel.messages.fetch(planMeet.message_id)

                    await message.thread.send({
                        content: `⚡ <@${element}> Ваше запланированое собрание было не запущенно! Вы не запустили собрание командой \`/meet start\` ${ping_users.join(', ')}\n> Собрание будет удалено через 2 часа! Не забудьте запустить собрание!`,
                    })

                    setTimeout(async () => {
                        if (fs.existsSync(`./src/dataBase/planMeets/${element}.json`)) {
                            const channel = await client.channels.fetch(config.channels_id.meets);
                            const message = await channel.messages.fetch(planMeet.message_id)
                            
                            await message.thread.send({
                                content: `❌ <@${element}> ваше собрание не было запущено в течении 2 часов! Запланированое собрание удалено.`,
                            })
                        
                            fs.unlinkSync(`./src/dataBase/planMeets/${element}.json`)
                            }
                    }, 120 *60*1000)

                    planMeet.type = 'end'
                    fs.writeFileSync(`./src/dataBase/planMeets/${element}.json`, JSON.stringify(planMeet))
                    return
                }
            } break;
        }
    });
}

async function meetEnd_message(client, creator_id) {
	if (!fs.existsSync(`./src/dataBase/meets/${creator_id}.json`)) return
	const meet = JSON.parse(fs.readFileSync(`./src/dataBase/meets/${creator_id}.json`))
	const user = JSON.parse(fs.readFileSync(`./src/dataBase/users/${creator_id}.json`))

	console.log(meet);

	const channel = await client.channels.fetch(config.channels_id.meets);
	const message = await channel.messages.fetch(meet.message_id)	

	console.log(channel);

	const time = new Date(meet.time_start)
	const now = new Date()

	const timeDiff = now.getTime() - time.getTime()

	const hours = Math.floor(timeDiff / (1000 * 60 * 60))
	const minutes = Math.floor((timeDiff % (1000 * 60 * 60)) / (1000 * 60))

	const ping_users = []
	meet.users_list.forEach(element => {
		ping_users.push(`<@${element}>`)
	});

	message.thread.send({
		content: `🛑 <@${creator_id}> собрание было завершенро, оно продлилось \`${RoundTime(hours)}ч, ${RoundTime(minutes)}м\`!`,
	})

	message.edit({
		content: `<@${creator_id}> собрание уже закрыто, оно продлилось \`${RoundTime(hours)}ч, ${RoundTime(minutes)}м\`!`,
		embeds: [
			{
				title: `${meet.emoji} Собрание ${user.userName}`,
				description: `${user.userName} ваше собрание было закончено, темы собрания: \`${meet.games_list.join(', ')}\`.\nВсе участники собрания:<@${creator_id}>, ${ping_users.join(', ')}!\nВремя проведения собрания: \`${RoundTime(hours)}ч, ${RoundTime(minutes)}м\``,
				color: Colors.Red,
				footer: {
					text: `Собрание было создано ${time.toLocaleString('ru-RU', { timeZone: 'Europe/Moscow' })}`,
				},
			},
		],
		components: [],
	})

	message.thread.setArchived(true)

	fs.unlinkSync(`./src/dataBase/meets/${creator_id}.json`)
}

module.exports = { meetCreate, meetStart, checkPlans, meetEnd_message }
