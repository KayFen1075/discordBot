const fs = require('fs');

function checkStatistics(user) {
    if (!fs.existsSync(`./src/dataBase/users/${user}.json`)) {
        return 
    }
    let userData = JSON.parse(fs.readFileSync(`./src/dataBase/users/${user}.json`));

    // check if user have statistics data
    if (!userData.statistics) {
        userData.statistics = {
            messages: 0,
            commands: 0,
            meetsCreated: 0,
            voteCreated: 0,
            chatGPT_requests: 0,
            kayfengen_requests: 0,
            assets_messages: 0,
            admin: false,
        }
    } else {    
        return
    }

    // save data
    fs.writeFileSync(`./src/dataBase/users/${user}.json`, JSON.stringify(userData));
} 

function checkLeveling(user) {
    if (!fs.existsSync(`./src/dataBase/users/${user}.json`)) {
        return
    }
    let userData = JSON.parse(fs.readFileSync(`./src/dataBase/users/${user}.json`));

    // check if user have leveling data
    if (!userData.leveling) {
        userData.leveling = {
            level: 1,
            xp: 0,
            xpToNextLevel: 100,
            boost: 1,
            boostTime: 0,
        }
    } else {
        return
    }

    // save data
    fs.writeFileSync(`./src/dataBase/users/${user}.json`, JSON.stringify(userData));
}

function checkActive(client) {
    // const users = fs.readdirSync('./src/dataBase/users/')
// 
    // users.forEach(user => {
        // let userData = JSON.parse(fs.readFileSync(`./src/dataBase/users/${user}`));
        // const lastDays = userData.state.splice(-7);
        // console.log(userData);
        // console.log(lastDays);
// 
        // let test = [1, 2, 3]
        // test.splice(0, -2)
        // console.log(test)
// 
        // if (lastDays && lastDays.length > 0) {
            // if (Math.max(...lastDays) == 0) {
                // const channel = client.channels.cache.get('1062752082408513676')
                // channel.send(`<@${user}> не активен уже 7 дней. Задумайтесь зачем он вам надо 😶`)
                // userData.state[-1] = 1
                // fs.writeFileSync(`./src/dataBase/users/${user}`, JSON.stringify(userData));
            // }
        // }
    // })
}

module.exports = {
    checkStatistics,
    checkLeveling,
    checkActive,
}