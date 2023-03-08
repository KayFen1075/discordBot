const fs = require('fs');
const ChartJSImage = require('chart.js-image');
const { ButtonStyle, Colors } = require('discord.js');
const { ButtonBuilder, EmbedBuilder, ActionRowBuilder } = require('@discordjs/builders');


async function generateTable(count, labels, mounth, week) {

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
    let bot = JSON.parse(fs.readFileSync(`./src/dataBase/bot.json`))

    users.forEach(e => {
        let user = JSON.parse(fs.readFileSync(`./src/dataBase/users/${e}`))

        // add to arr last count days or mounths
        if (mounth) {
            for (let i = 0; user.state.length <= count * 30; i++) {
                user.state.unshift(0)
            }
            const arr = user.state.splice(-(count * 30)).map(e => { return e / 60000 / 60 })

            // sum last 30 days
            let timeInMounth = []
            for (let i = 0; i < count; i++) {
                let sum = 0
                for (let j = 0; j < 30; j++) {
                    sum += arr[i * 30 + j]
                }
                timeInMounth.push(sum)
            }

            botUsers.push({
                type: "line",
                label: `${user.userName}`,
                borderColor: generateRandomColor(),
                backgroundColor: generateRandomColor(true),
                data: timeInMounth
            })
        } else if (week) {
            for (let i = 0; user.state.length <= count * 7; i++) {
                user.state.unshift(0)
            }
            const arr = user.state.splice(-(count * 7)).map(e => { return e / 60000 / 60 })

            // sum last 7 days
            let timeInWeek = []
            for (let i = 0; i < count; i++) {
                let sum = 0
                for (let j = 0; j < 7; j++) {
                    sum += arr[i * 7 + j]
                }
                timeInWeek.push(sum)
            }

            botUsers.push({
                type: "line",
                label: `${user.userName}`,
                borderColor: generateRandomColor(),
                backgroundColor: generateRandomColor(true),
                data: timeInWeek
            })
        } else {
            for (let i = 0; user.state.length <= count; i++) {
                user.state.unshift(0)
            }
            const arr = user.state.splice(-count).map(e => { return e / 60000 / 60 })

            botUsers.push({
                type: "line",
                label: `${user.userName}`,
                borderColor: generateRandomColor(),
                backgroundColor: generateRandomColor(true),
                data: arr
            })
        }
        // const arr = user.state.splice(-count).map(e => { return e / 60000 / 60 })

        // botUsers.push(
        //     {
        //         type: "line",
        //         label: `${user.userName}`,
        //         borderColor: generateRandomColor(),
        //         backgroundColor: generateRandomColor(true),
        //         data: arr
        //     }
        // )
    })

    if (mounth) {
        // bot state
        // const now = new Date()
        // let botArr = bot.state.splice(-(count * 30)).map(e => { return e / 60000 / 60 })
// 
        // const daysInMounth = now.getDate()
// 
// 
        // const allDaysInMounths = (count - 1) * 30 + daysInMounth
        // for (let i = 0; botArr.length <= allDaysInMounths; i++) {
            // botArr.unshift(0)
        // }
// 
        // const thisMounth = botArr.splice(-daysInMounth)
        // const lastMounths = botArr.splice(-(count - 1) * 30)
        // let timeInMounth = []
// 
// 
// 
// 
        // botUsers.push({
            // type: "bar",
            // label: "Общее время игры",
            // borderColor: "rgba(255, 99,132)",
            // backgroundColor: "rgb(255, 192, 203)",
            // data: timeInMounth
        // })
    
    } else if (week) {
        // bot state
        for (let i = 0; bot.state.length <= count * 7; i++) {
            bot.state.unshift(0)
        }
        const botArr = bot.state.splice(-(count * 30)).map(e => { return e / 60000 / 60 })

        // sum last 7 days
        let timeInWeek = []
        for (let i = 0; i < count; i++) {
            let sum = 0
            for (let j = 0; j < 7; j++) {
                sum += botArr[i * 7 + j]
            }
            timeInWeek.push(sum)
        }

        botUsers.push({
            type: "bar",
            label: "Общее время игры",
            borderColor: "rgba(255, 99,132)",
            backgroundColor: "rgb(255, 192, 203)",
            data: timeInWeek
        })
    } else {
        // bot state
        for (let i = 0; bot.state.length <= count; i++) {
            bot.state.unshift(0)
        }
        const botArr = bot.state.splice(-count).map(e => { return e / 60000 / 60 })
        botUsers.push({
            type: "bar",
            label: "Общее время игры",
            borderColor: "rgba(255, 99,132)",
            backgroundColor: "rgb(255, 192, 203)",
            data: botArr
        })
    }

    let line_chart;
    try {
        line_chart = await ChartJSImage().chart({
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
    
                labels: labels,
                datasets: botUsers
            },
        }) // Line chart
            .backgroundColor('rgba(255,255,255,1)')
            .width(500) // 500px
            .height(300); // 300px
        const buffer = line_chart.toBuffer('image/png');
        return buffer
    } catch (error) {
        console.log(error)
        const buffer = fs.readFileSync('./src/error.png')
        return buffer
    }
    
}

function getLastNDays(n, mounth, week) {
    const dates = [];
    if (mounth) {
        for (let i = n - 1; i >= 0; i--) {
            const date = new Date();
            date.setMonth(date.getMonth() - i);
            const month = ("0" + (date.getMonth() + 1)).slice(-2);
            dates.push(month);
        }
        return dates;
    } else if (week) {
        for (let i = n - 1; i >= 0; i--) {
            const date = new Date();
            date.setDate(date.getDate() - i);
            const day = ("0" + date.getDate()).slice(-2);
            const dayWeekAgo = ("0" + (date.getDate() - 7)).slice(-2);
            const month = ("0" + (date.getMonth() + 1)).slice(-2);
            const formattedDate = `${day}.${month}-${dayWeekAgo}.${month}`;
            dates.push(formattedDate);
        }
        return dates;
    } else {
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
}

/*
async function updateState() {
    
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
*/

async function updateStatick(client) {
    let data = await JSON.parse(fs.readFileSync('./src/dataBase/bot.json'));

    // find state type of object

    const state = data.state_type.find(e => e.disabled === false),
        type = state.type,
        count = state.count;

    // get users time and all users time and avg time
    const users = fs.readdirSync(`./src/dataBase/users`)
    let users_time = ``
    let total_time = 0

    data.state.forEach(e => {
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

    let message
    const messageId = data.message_stats;
    const channel = await client.channels.cache.get("1061911188528693358");
    if (messageId !== null) {
        message = await channel.messages.fetch(messageId.id).catch(err => {
            console.error(err);
        });
    } else {
        message = false
    }
    const avg = data.state.splice(-8).splice(1).reduce((acc, curr) => (curr !== Infinity ? acc + curr : acc), 0) / 8;

    let imge;

    // update chart
    if (type === 'days') {
        imge = await generateTable(count, getLastNDays(count));
    } else if (type === 'week') {
        imge = await generateTable(count, getLastNDays(count, false, true), false, true);
    } else {
        imge = await generateTable(count, getLastNDays(count, true), true);
    }

    let buttons = []

    // create buttons
    data.state_type.forEach(e => {
        buttons.push(new ButtonBuilder()
            .setCustomId(`stat_${e.name}`)
            .setLabel(e.name)
            .setStyle(!e.disabled ? ButtonStyle.Success : ButtonStyle.Primary)
            .setDisabled(!e.disabled))
    })
    // buttons.push(new ButtonBuilder()
    //     .setCustomId('stat_update')
    //     .setLabel('🔃 Обновить')
    //     .setStyle(ButtonStyle.Secondary)
    //     .setDisabled(false))
        

    // create embed
    const embed_components = {
        embeds: [new EmbedBuilder()
            .setTitle('📈 График активности')
            .setDescription(`График обновляеться каждые 5 минут, у каждого будет свой рандомный цвет который тоже месяетсья, ярко зелёный квадрат это общее время активности(Собраний)\n **Общая статистика за всё время:** \n${users_time}**Время собраний:** \`${Math.floor(total_time / 60000 / 60)}ч, ${Math.floor(total_time / 60000 % 60)}м\`\n\n**Среднее время собраний за неделю:** \`${Math.round(avg / 60000 / 60)}ч, ${Math.round(avg / 60000 % 60)}м\``)
            .setColor(Colors.Green)
            .setTimestamp(Date.now())
        ], components: [new ActionRowBuilder()
            .addComponents(buttons)], files: [await imge]
    }
    message = await client.channels.cache.get("1061911188528693358").messages.fetch(data.message_stats.id);

    // edit message or send new
    if (message) {
        message.edit(embed_components);
        message.react('🔃')
    } else {
        message = await client.channels.cache.get("1061911188528693358").send(embed_components);
        data.message_stats = message;
        message.react('🔃')
        fs.writeFileSync('./src/dataBase/bot.json', JSON.stringify(data));
    }
}

async function changeState(interaction) {
    let data = await JSON.parse(fs.readFileSync('./src/dataBase/bot.json'));
    const customId = interaction.customId.split('_')[1];

    data.state_type.forEach(e => {
        e.disabled = true
    })

    data.state_type.find(e => e.name === customId).disabled = false

    fs.writeFileSync('./src/dataBase/bot.json', JSON.stringify(data));

    updateStatick(interaction.client)
}

module.exports = {
    updateStatick,
    changeState
}