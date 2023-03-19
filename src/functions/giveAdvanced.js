const { EmbedBuilder } = require('@discordjs/builders');
const { Colors } = require('discord.js');
const fs = require('fs');
const { fileLog } = require('../functions/logs');
const { xpAdd } = require('./leveling');

async function giveAdvanced(client, name, user) {

    if (!fs.existsSync(`./src/dataBase/users/${user}.json`)) {
        return
    }

    let data = JSON.parse(fs.readFileSync('./src/dataBase/bot.json'));
    const channelAdvanced = client.channels.cache.get('1080976121627164765');
    console.log(2);

    // check if advanced exists
    data.advenced.forEach((e, i) => {
        if (e.name == name) {
            if (e.users.includes(user)) {
                return console.log(`Пользователь ${user} уже имеет достижение ${name}`);
            } else {
                const advenced = e;
                const users = fs.readdirSync('./src/dataBase/users/').length;
                
                data.advenced[i].users.push(user);
                fs.writeFileSync('./src/dataBase/bot.json', JSON.stringify(data, null, 2));
                fileLog(`Выдано достижение ${name} пользователю (${user})`);
                
                xpAdd(client, user, data.advenced[i].xp, undefined, undefined, true)

                const embed = new EmbedBuilder()
                    .setTitle(`${advenced.emoji} ${advenced.name} получено достижение!`)
                    .setDescription(`Пользователь <@${user}> получил достижение, для выполнения которого требовалось:\n\`\`\`js\n${advenced.description}\`\`\`Сложность: \`${advenced.difficulty.split(';')[0]}\` | Награда за выполнение: \`${advenced.xp}xp\`\nЭто достижение есть всего у **${ Math.round( advenced.users.length / users * 100 ) }%** пользователей!`)
                    .setColor( Number(advenced.difficulty.split(';')[1]))
                channelAdvanced.send({
                    content: `<@${user}> получил достижение **${name.toLowerCase()}**!\n\n `,
                    embeds: [embed]
                });
                return console.log(`Выдано достижение ${name} пользователю (${user})`);
            }
        }
    });
}

module.exports = {
    giveAdvanced
};