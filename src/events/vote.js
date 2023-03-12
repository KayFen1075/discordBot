const { Events } = require('discord.js');
const fs = require('fs');
const CircularJSON = require('circular-json');
const { fileLog } = require('../functions/logs');
const { progressQuestAdd } = require('../functions/updateQuests');

module.exports = {
    name: Events.InteractionCreate,

    async execute(interaction) {
        if (interaction.isButton()) {

            if (!fs.existsSync(`./src/dataBase/users/${interaction.user.id}.json`)) {
                return
            }
            
            // create arr from customId
            const arr = interaction.customId.split('‘');

            if (arr.leght < 2) {
                return
            }

            if (arr[0] === 'vote') {
                let data = JSON.parse(fs.readFileSync('./src/dataBase/bot.json'))

                // check if vote exist
                // data.votes.forEach(e => {
                //     if (e.id !== arr[2]) {
                //         interaction.reply({
                //             content: 'Голосование не найдено',
                //             ephemeral: true
                //         })
                //         this.return
                //     }
                // })
                // check vote if end
                if (!data.votes.find(e => e.id == arr[2])) {
                    interaction.reply({
                        content: 'Голосование уже было завершено',
                        ephemeral: true
                    })
                    return
                }

                // get vote 
                let vote = data.votes.find(e => e.id == arr[2])
                console.log(vote);
                let user = interaction.user.id

                // check if user voted, chage vote
                if (vote.votes_users.find(e => e.id == user)) {
                    vote.votes_users.find(e => e.id == user).vote = arr[1]
                    fs.writeFileSync('./src/dataBase/bot.json', CircularJSON.stringify(data))
                    fileLog(`[VOTE] ${interaction.user.username} изменил свой голос на ${arr[1]} в голосовании ${vote.id}`)
                    return interaction.reply({
                        content: `Вы изменили свой голос на ${arr[1]}`,
                        ephemeral: true
                    })
                }

                // say user voted
                interaction.reply({
                    content: `Вы проголосовали за ${arr[1]}`,
                    ephemeral: true
                })

                // add vote to file
                vote.votes_users.push({id: user, vote: arr[1]})
                fs.writeFileSync('./src/dataBase/bot.json', CircularJSON.stringify(data))
                fileLog(`[VOTE] ${interaction.user.username} проголосовал за ${arr[1]} в голосовании ${vote.id}`)
                progressQuestAdd(interaction.client, interaction.user.id, '🫱🏿‍🫲🏿 Голос', 1)
            }
        }
    }
}