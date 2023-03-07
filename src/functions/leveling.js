const fs = require('fs');
const { checkLeveling } = require('./cheking');
const { fileLog } = require('./logs');

async function xpAdd(client, user, xp, message, channelId, boostDisable) {
    if (!fs.existsSync(`./src/dataBase/users/${user}.json`)) {
        return
    }
    let userData = JSON.parse(fs.readFileSync(`./src/dataBase/users/${user}.json`));

    // check if user have leveling data
    checkLeveling(user)

    // add xp
    boostDisable ? userData.leveling.xp += xp : userData.leveling.xp += xp * userData.leveling.boost

    const remainder_xp = userData.leveling.xp - userData.leveling.xpToNextLevel;

    // check if user level up
    if (userData.leveling.xp >= userData.leveling.xpToNextLevel) {
        await levelUp(client, user, Math.max(remainder_xp, 0), message, channelId);
        return;
    }

    // save data
    fs.writeFileSync(`./src/dataBase/users/${user}.json`, JSON.stringify(userData));
}

async function levelUp(client, user, remainder_xp, message, channelId) {
    let userData = JSON.parse(fs.readFileSync(`./src/dataBase/users/${user}.json`));
    const userMember = client.guilds.cache.get('1060755232109379644').members.cache.get(user);

    // add level
    userData.leveling.level += 1;
    userData.leveling.xp = 0;
    // add xp to next level
    userData.leveling.xpToNextLevel = Math.floor(userData.leveling.xpToNextLevel + 25 * (userData.leveling.level / 2));

    // save data
    fs.writeFileSync(`./src/dataBase/users/${user}.json`, JSON.stringify(userData));

    userMember.setNickname(`${userData.userName} [${userData.leveling.level} LVL]`);

    const xp = remainder_xp - userData.leveling.xpToNextLevel
    xpAdd(client, user, Math.max(xp, 0) , message, channelId, true);

    if (message) {
        // add rundom reaction
        const reacts = ['🎊', '🎉', '😎', '👍🏿'];
        message.react(reacts[Math.floor(Math.random() * reacts.length)]).then(() => {
            message.react('🆙')
        });

        fileLog(`[LEVELING]`, `Пользователь <@${userData.userName}> повысил свой уровень до ${userData.leveling.level} уровня! через сообщение`)
    } else if (channelId) {
        // send message
        const channel = client.channels.cache.get(channelId);
        channel.send(`Поздравляем <@${user}> с повышением уровня активности до **${userData.leveling.level}** уровня!`);
        fileLog(`[LEVELING]`, `Пользователь <@${userData.userName}> повысил свой уровень до ${userData.leveling.level} уровня! через голосовой чат`)
    } else {
        const channel = client.channels.cache.get('1060755820003991672');
        channel.send(`Поздравляем <@${user}> с повышением уровня активности до **${userData.leveling.level}** уровня!`);
        fileLog(`[LEVELING]`, `Пользователь <@${userData.userName}> повысил свой уровень до ${userData.leveling.level} уровня! через голосовой чат`)
    }
}

async function addBoost(client, user, boost, time, reason) {
    let userData = JSON.parse(fs.readFileSync(`./src/dataBase/users/${user}.json`));

    // check if user have leveling data
    checkLeveling(user)

    const timeStat = {
        hours: Math.floor(time / 60 / 60 / 1000 % 60),
        minutes: Math.floor(time / 60 / 1000),
    }

    // say reason ib channel
    const channel = client.channels.cache.get('1062752082408513676');
    channel.send(`Пользователь <@${user}> получил буст на **${boost}x** на \`${timeStat.hours}ч, ${timeStat.minutes}м\` по причине: **${reason}**`);

    time += Date.now();

    userData.leveling.boost = boost;
    userData.leveling.boostTime = time;

    // save data
    fs.writeFileSync(`./src/dataBase/users/${user}.json`, JSON.stringify(userData));
    fileLog(`[LEVELING]`, `Пользователь <@${userData.userName}> получил буст на ${boost}x на ${timeStat.hours}ч, ${timeStat.minutes}м по причине: ${reason}`)
}

async function checkBoostTime() {

    // get all users
    let users = fs.readdirSync('./src/dataBase/users/');
        users = users.map(user => user.replace('.json', ''));
    users.forEach(user => {
        checkLeveling(user)

        let userData = JSON.parse(fs.readFileSync(`./src/dataBase/users/${user}.json`));
    
        // check if user boost time is over
        if (userData.leveling.boostTime <= Date.now()) {
            userData.leveling.boost = 1;
            userData.leveling.boostTime = 0;
        
            // save data
            fs.writeFileSync(`./src/dataBase/users/${user}.json`, JSON.stringify(userData));
            fileLog(`[LEVELING]`, `Буст пользователя <@${userData.userName}> закончился. Буст: ${userData.leveling.boost}x`)
        } else if (userData.leveling.boostTime > 0) {
            console.log(`Осталось минут: ${Math.floor((userData.leveling.boostTime - Date.now()) / 1000 / 60)}`);
        }
    });
}

module.exports = {
    xpAdd,
    levelUp,
    addBoost,
    checkBoostTime
};