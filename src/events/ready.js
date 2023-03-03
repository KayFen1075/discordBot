const { Events, EmbedBuilder, Colors, ActionRowBuilder, ButtonBuilder, TextInputStyle, ButtonStyle } = require('discord.js')
const fs = require('fs')
const { game_table } = require('../functions/listFunc.js')
const { Configuration, OpenAIApi } = require("openai");

const configuration = new Configuration({
    apiKey: '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',
});

const openai = new OpenAIApi(configuration);

const ChartJSImage = require('chart.js-image');
const { fileLog } = require('../functions/logs.js');
const { endVote } = require('../functions/endVote')


module.exports = {
    name: Events.ClientReady,
    once: true,

    async execute(client) {
        console.log(`${client.user.tag} активирован!`);
        client.user.setActivity(`👉👌💦`);
        client.user.setStatus('idle');
        const message = new EmbedBuilder()
            .setTitle('🟢 Бот был запущен!')
            .setDescription('Бот был запущен через консоль.')
            .setColor(Colors.Green)
            .setTimestamp(Date.now())

        await client.channels.cache.get("1060771841452560507")
            .send({
                content: '<@1060761793204596846> запустился', components: [
                    new ActionRowBuilder().addComponents([
                        new ButtonBuilder().setCustomId('happyMessage').setLabel('🎉 Позравляю').setStyle(3),
                        new ButtonBuilder().setCustomId('restartButton').setLabel('🔁 Перезагрузить').setStyle(1),
                        new ButtonBuilder().setCustomId('stopButton').setLabel('🛑 Выключить бота').setStyle(4)
                    ])
                ], embeds: [message]
            })


    
        // check votes
        async function cheakVotes() {
            // check time to end vote
            let data = JSON.parse(fs.readFileSync('./src/dataBase/bot.json', 'utf8')).votes
            const users = fs.readdirSync('./src/dataBase/users')
            data.forEach(async e => {
                if (e.votes_users.length == users.length) {
                    console.log(`Все пользователи проголосовали, голосование ${e.id} завершено`);
                    await endVote(e.id, client)
                }
                switch (e.time) {
                    case '1m': { if (Date.now() - e.startVote >=   60000 ) { await endVote(e.id, client) } break; }
                    case '5m': { if (Date.now() - e.startVote >=   300000 ) { await endVote(e.id, client) } break; }
                    case '10m': { if (Date.now() - e.startVote >=  600000 ) { await endVote(e.id, client) } break; }
                    case '30m': { if (Date.now() - e.startVote >=  1800000 ) { await endVote(e.id, client) } break; }
                    case '1h': { if (Date.now() - e.startVote >=   3600000 ) { await endVote(e.id, client) } break; }
                    case '2h': { if (Date.now() - e.startVote >=   7200000 ) { await endVote(e.id, client) } break; }
                    case '6h': { if (Date.now() - e.startVote >=   21600000 ) { await endVote(e.id, client) } break; }
                    case '12h': { if (Date.now() - e.startVote >=  43200000 ) { await endVote(e.id, client) } break; }
                    case '1d': { if (Date.now() - e.startVote >=   86400000 ) { await endVote(e.id, client) } break; }
                    case '2d': { if (Date.now() - e.startVote >=   172800000 ) { await endVote(e.id, client) } break; }
                    case '3d': { if (Date.now() - e.startVote >=   259200000 ) { await endVote(e.id, client) } break; }
                    case '4d': { if (Date.now() - e.startVote >=   345600000 ) { await endVote(e.id, client) } break; }
                    case '5d': { if (Date.now() - e.startVote >=   432000000 ) { await endVote(e.id, client) } break; }
                    case '6d': { if (Date.now() - e.startVote >=   518400000 ) { await endVote(e.id, client) } break; }
                    case '7d': { if (Date.now() - e.startVote >=   604800000 ) { await endVote(e.id, client) } break; }
                }
            })
        }; cheakVotes() 

        async function updateList() {
            const json = JSON.parse(fs.readFileSync('./src/dataBase/bot.json'));
            const messageId = json.message_list_id;
            let channel = await client.channels.cache.get("1061827241031508121");
            let message = await channel.messages.fetch(messageId.id).catch(err => {
                console.error(err);
            });
            const gameTable = await game_table()

            let user_name_description = [];
            gameTable[0].forEach((user, i) => user_name_description.push({ name: user, value: `\`\`\`js\n${gameTable[1][i]}\`\`\``, inline: true }))

            const embed_components = {
                embeds: [
                    new EmbedBuilder()
                        .setTitle('🧑🏾‍❤️‍🧑🏿 Список игр пользователей')
                        .addFields(user_name_description)
                        .setColor(Colors.Green)
                    ,
                    new EmbedBuilder()
                        .setTitle('🖥️ ПК игры')
                        .setDescription(gameTable[2] + gameTable[3])
                        .setColor(Colors.Green)
                        .setTimestamp(Date.now())
                    ,
                    new EmbedBuilder()
                        .setTitle(`⌛ Короткая история:`)
                        .setColor(Colors.Green)
                        .setDescription(`${gameTable[4]}**Команды для списка:**\n\`/list add \${game} ?{android} ?{user}\` - Добавить в список игру, можно через \`,\`. Писать 1 в 1, кроме больших букв на них пофиг\n\`/list remove\` - Удалить игры из списка, выбрать из меню.\n\`android\` - может быть true или false, изначально flase.\n\`user\` - влиять на чужой список игр.`)
                    ,
                    new EmbedBuilder()
                        .setTitle(`💡 Рекомендации`)
                        .setColor(Colors.Aqua)
                        .setDescription(`Смотря на список, я могу порекомендовать такие игры: \n\`\`\`${json.recomend}\`\`\``)
                ], components: [new ActionRowBuilder()
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
        await updateList()

        async function updateState() {
            async function generateChart(dates, days, mounth) {
                let time = [];
                // times.forEach(element => {
                //     time.push((element/60000).toString())
                // });
                let colors = [
                    [255, 0, 0],      // красный
                    [255, 165, 0],    // оранжевый
                    [255, 255, 0],    // желтый
                    [0, 128, 0],      // зеленый
                    [0, 255, 255],    // голубой
                    [0, 0, 255],      // синий
                    [128, 0, 128],    // пурпурный
                    [255, 0, 255],    // фуксия
                    [128, 128, 128],  // серый
                    [192, 192, 192],  // серебряный
                    [139, 69, 19],    // коричневый
                    [255, 192, 203],  // розовый
                    [128, 0, 0],      // темно-красный
                    [139, 0, 139],    // фиолетовый
                    [0, 128, 128],    // темный голубой
                    [0, 0, 128],      // темно-синий
                    [0, 0, 0],        // черный
                    [255, 69, 0],     // оранжево-красный
                    [255, 215, 0],    // золотой
                    [0, 255, 127],    // ярко-зеленый
                    [30, 144, 255],   // стальной синий
                    [255, 20, 147],   // розовый
                    [70, 130, 180],   // голубой сталь
                    [240, 128, 128],  // светло-красный
                    [0, 255, 255],    // ярко-голубой
                    [221, 160, 221],  // светло-фиолетовый
                    [46, 139, 87],    // морской волны
                    [255, 99, 71]     // томатный
                ]
                function generateRandomColor(alpha) {
                    const colori = Math.floor(Math.random() * colors.length)
                    let color
                    if (alpha) {
                        color = `rgba(${colors[colori]}, 0.2)`;
                    } else {
                        color = `rgb(${colors[colori]})`;
                        colors.splice(colori, 1)
                    }
                    return color;
                }

                let botUsers = []

                const users = fs.readdirSync(`./src/dataBase/users`)

                users.forEach(e => {
                    let user = JSON.parse(fs.readFileSync(`./src/dataBase/users/${e}`))

                    for (let i = 0; user.state.length <= days; i++) {
                        user.state.unshift(0)
                    }

                    const arr = user.state.splice(-days).map(e => { return e / 60000 / 60 })
                    botUsers.push(
                        {
                            type: "line",
                            label: `${user.userName}`,
                            borderColor: generateRandomColor(),
                            backgroundColor: generateRandomColor(true),
                            data: arr
                        }
                    )
                })

                let bot = JSON.parse(fs.readFileSync(`./src/dataBase/bot.json`))

                for (let i = 0; bot.state.length <= days; i++) {
                    bot.state.unshift(0)
                }

                const arr = bot.state.splice(-days).map(e => { return e / 60000 / 60 })
                botUsers.push(
                    {
                        type: "bar",
                        label: "Общее время игры",
                        borderColor: "rgba(255, 99,132)",
                        backgroundColor: "rgb(255, 192, 203)",
                        data: arr
                    }
                )

                const line_chart = ChartJSImage().chart({
                    type: "bar",

                    options: {
                        plugins: {
                            title: {
                                display: true,
                                text: 'KayFen'
                            },
                        },
                        responsive: true,
                        scales: {
                            x: {
                                stacked: true,
                            },
                            y: {
                                stacked: true
                            }
                        }
                    },
                    data: {

                        labels: dates,
                        datasets: botUsers
                        // {
                        //     type: "line",
                        //     label: "Борис",
                        //     borderColor: "rgb(255, 99,132)",
                        //     backgroundColor: "rgba(255, 99, 132, 0.5)",
                        //     data: time
                        // },
                        // {
                        //     type: "line",
                        //     label: "Денис",
                        //     borderColor: "rgba(255, 99,132)",
                        //     backgroundColor: "rgba(0, 0, 0, 0.5)",
                        //     data: [0,3,0,20]
                        // },
                    },


                }) // Line chart
                    .backgroundColor('rgba(255,255,255,1)')
                    .width(500) // 500px
                    .height(300); // 300px
                const buffer = line_chart.toBuffer('image/png');
                return buffer
            }
            function getLastNDays(n) {
                const dates = [];
                for (let i = n - 1; i >= 0; i--) {
                    const date = new Date();
                    date.setDate(date.getDate() - i);
                    const day = ("0" + date.getDate()).slice(-2);
                    const month = ("0" + (date.getMonth() + 1)).slice(-2);
                    const formattedDate = `${day}.${month}`;
                    dates.push(formattedDate);
                }
                return dates;
            }
            const imge = await generateChart(getLastNDays(7), 7, false);

            const json = JSON.parse(fs.readFileSync('./src/dataBase/bot.json'));
            let channel = await client.channels.cache.get("1061911188528693358");
            let message

            const users = fs.readdirSync(`./src/dataBase/users`)
            let users_time = ``
            let total_time = 0

            json.state.forEach(e => {
                total_time += e
            })

            users.forEach(e => {
                let user = JSON.parse(fs.readFileSync(`./src/dataBase/users/${e}`))
                let user_time = 0
                user.state.forEach((e) => {
                    user_time += e
                })
                users_time += `**${user.userName}:** \`${Math.round(user_time / 60000 / 60)}ч, ${Math.round(user_time / 60000 % 60)}м\`\n`
            })

            const messageId = json.message_stats;
            if (messageId !== null) {
                message = await channel.messages.fetch(messageId.id).catch(err => {
                    console.error(err);
                });
            } else {
                message = false
            }
            const avg = json.state.splice(-8).splice(1).reduce((acc, curr) => (curr !== Infinity ? acc + curr : acc), 0) / 8;

            const embed_components = {
                embeds: [new EmbedBuilder()
                    .setTitle('📈 График активности')
                    .setDescription(`График обновляеться каждые 5 минут, у каждого будет свой рандомный цвет который тоже месяетсья, ярко зелёный квадрат это общее время активности(Собраний)\n **Общая статистика за всё время:** \n${users_time}**Время собраний:** \`${Math.round(total_time / 60000 / 60)}ч, ${Math.round(total_time / 60000 % 60)}м\`\n\n**Среднее время собраний за неделю:** \`${Math.round(avg / 60000 / 60)}ч, ${Math.round(avg / 60000 % 60)}м\``)
                    .setColor(Colors.Green)
                    .setTimestamp(Date.now())
                ], components: [new ActionRowBuilder()
                    .addComponents([
                        new ButtonBuilder()
                            .setCustomId('stat_week')
                            .setLabel('за неделю')
                            .setStyle(ButtonStyle.Primary)
                            .setDisabled(true),
                        new ButtonBuilder()
                            .setCustomId('stat_mounth')
                            .setLabel('за месяц')
                            .setStyle(ButtonStyle.Secondary)
                            .setDisabled(true),
                        new ButtonBuilder()
                            .setCustomId('stat_Xmounth')
                            .setLabel('за 3 месяця')
                            .setStyle(ButtonStyle.Secondary)
                            .setDisabled(true),
                        new ButtonBuilder()
                            .setCustomId('stat_year')
                            .setLabel('за год')
                            .setStyle(ButtonStyle.Secondary)
                            .setDisabled(true)
                    ])], files: [await imge]
            }
            if (!message) {
                message = await channel.send(embed_components);
                json.message_stats = message;

                fs.writeFileSync('./src/dataBase/bot.json', JSON.stringify(json));
            } else {
                message.edit(embed_components);
            }
        }
        updateState()
        setInterval(() => {
            cheakVotes()
            updateState()
        }, 300000)

        async function updateRegister() {
            const json = JSON.parse(fs.readFileSync('./src/dataBase/bot.json'));
            let channel = await client.channels.cache.get("1061827016518815845");
            let message

            const messageId = json.message_register_id;
            if (messageId !== null) {
                message = await channel.messages.fetch(messageId.id).catch(err => {
                    console.error(err);
                });
            } else {
                message = false
            }
            const gameTable = await game_table()

            let user_name_description = [];
            gameTable[0].forEach((user, i) => user_name_description.push({ name: user, value: `\`\`\`js\n${gameTable[1][i]}\`\`\``, inline: true }))


            const embed_components = {
                embeds: [new EmbedBuilder()
                    .setTitle('🐸 Подать заявку 🪪')
                    .setDescription(`**Добро пожаловать в хажабу, это приватный сервер для общения!**\n\nОсновная суть хажабы это проведение собраний, просмотр списков(все игры которые есть у разных людей), голосовые фишки, новости о раздачах игр и так же различные нейросети.\nВсё работает через бота <@1060761793204596846>, если он не работает то есть канал *если бот здох*. Бот использует различные нейросети благодаря чему он может помогать и выполнять многие функции.\n\nВот все участники и их игры, мб кому-то понадобиться:\n`)
                    .addFields(user_name_description)
                    .setColor(Colors.Green)
                    .setTimestamp(Date.now()),
                new EmbedBuilder()
                    .setTitle('🖥️ ПК игры')
                    .setDescription(gameTable[2] + gameTable[3])
                    .setColor(Colors.Green)
                    .setTimestamp(Date.now())
                ], components: [new ActionRowBuilder()
                    .addComponents([
                        new ButtonBuilder()
                            .setCustomId('register')
                            .setLabel('✍️ Подать заявку')
                            .setStyle('3')
                    ])]
            }
            if (!message) {
                message = await channel.send(embed_components);
                json.message_register_id = message;

                fs.writeFileSync('./src/dataBase/bot.json', JSON.stringify(json));
            } else {
                message.edit(embed_components);
            }
        }
        updateRegister()

        function sendHappyBirthday() {
            const today = new Date();

            const users = fs.readdirSync(`./src/dataBase/users`)
            users.forEach(e => {
                let user = JSON.parse(fs.readFileSync(`./src/dataBase/users/${e}`))
                user.state.push(0)
                fs.writeFileSync(`./src/dataBase/users/${e}`, JSON.stringify(user))
            })


            // Check if any of the user's birthdays match today's date
            users.forEach(async userJSON => {
                const user = JSON.parse(fs.readFileSync(`./src/dataBase/users/${userJSON}`))
                console.log(today.getFullYear() + '/' + user.data.happyDate.substring(6, 10));
                console.log(`Date: ` + `${padString(today.getDate())}.${padString(today.getMonth() + 1)} / ${user.data.happyDate.substring(0, 5)}`);

                if (user.data.happyDate.substring(0, 5) === `${padString(today.getDate())}.${padString(today.getMonth() + 1)}`) {
                    const response = await openai.createCompletion({
                        model: "text-davinci-003",
                        prompt: `Твоя задача написать поздравление на день рождения для ${user.userName} ему исполняеться ${today.getFullYear() - user.data.happyDate.substring(6, 10)} лет. Ты находишься в дискорд сервере так что сделай это поздравление для ${user.userName} самым лучшим. Ты находишься на сервере "ХАЖАБА", где друзья общаються и играют в игры месте. Так же у нас есть описание которое ${user.userName} написал о себе при регестрации: "${user.data.discription}"(там может быть хлам). Можешь написать цытату(начиная с "> "), стих и само поздравлнеие`,
                        temperature: 0.9,
                        max_tokens: 2000,
                        top_p: 1,
                        frequency_penalty: 0.0,
                        presence_penalty: 0.6,
                    });
                    client.channels.cache.get('1061912734582718505').send(`@everyone, сегодня у **${user.userName}а** день рождения! Ему исполнилось ${today.getFullYear() - user.data.happyDate.substring(6, 10)} 🎂🎉\n${response.data.choices[0].text}`).then(message => {
                        message.react('🎁');
                    });
                } else if (user.data.happyDate.substring(0, 5) === `${padString(today.getDate() + 1)}.${padString(today.getMonth() + 1)}`) {
                    client.channels.cache.get('1061912734582718505').send(`@everyone, завтра у **${user.userName}а** будет день рождение! Ему исполниться ${today.getFullYear() - user.data.happyDate.substring(6, 10)} лет 🎁`).then(message => {
                        message.react('🎀');
                    });
                } else if (user.data.happyDate.substring(0, 5) === `${padString(today.getDate() + 3)}.${padString(today.getMonth() + 1)}`) {
                    client.channels.cache.get('1061912734582718505').send(`@everyone, через 3 дня у **${user.userName}а** будет день рождение! Ему исполниться ${today.getFullYear() - user.data.happyDate.substring(6, 10)} лет 🎀`).then(message => {
                        message.react('❤️‍🔥');
                    });
                } else if (user.data.happyDate.substring(0, 5) === `${padString(today.getDate() + 7)}.${padString(today.getMonth() + 1)}`) {
                    client.channels.cache.get('1061912734582718505').send(`@everyone, через неделю у **${user.userName}а** будет день рождение! Ему исполниться ${today.getFullYear() - user.data.happyDate.substring(6, 10)} лет 😲`).then(message => {
                        message.react('🤚🏻');
                    });
                } else if (user.data.happyDate.substring(0, 5) === `${padString(today.getDate())}.${padString(today.getMonth() + 2)}`) {
                    client.channels.cache.get('1061912734582718505').send(`@everyone, через месяц у **${user.userName}а** будет день рождение! Ему исполниться ${today.getFullYear() - user.data.happyDate.substring(6, 10)} лет 😇`).then(message => {
                        message.react('👍');
                    });
                }
            });
        };

        const runSendHappyBirthday = () => {
            const today = new Date();

            const botData = JSON.parse(fs.readFileSync('./src/dataBase/bot.json'));

            if (botData.happyCheckDate === undefined || today.toDateString() !== new Date(botData.happyCheckDate).toDateString()) {
                sendHappyBirthday();
                botData.state.push(0)
                botData.happyCheckDate = today;
                fs.writeFileSync('./src/dataBase/bot.json', JSON.stringify(botData));
            }
        }; runSendHappyBirthday()
        setInterval(() => {
            runSendHappyBirthday()
        }, 300000)

        function padString(num) {
            let str = num.toString();
            if (str.length === 1) {
                str = str.padStart(2, "0");
            }
            return str;
        } // 86400000 milliseconds = 24 hours
    },
};

