const fs = require('fs');

const { Intents, MessageEmbed, MessageActionRow, MessageButton, MessageSelectMenu, EmbedBuilder, Colors, ButtonBuilder, ActionRowBuilder } = require('discord.js');

const { fileLog } = require('./logs');

// end vote
async function endVote(id, client) {

    // get data
    let data = JSON.parse(fs.readFileSync('./src/dataBase/bot.json'))
    let vote = data.votes.find(e => e.id == id)
    let users = fs.readdirSync('./src/dataBase/users')
    let votes = {} // object with votes {vote: count}} 

    const channel = await client.channels.cache.get(vote.channel)

    const messageVotes = await channel.messages.fetch(vote.message)
    console.log(messageVotes);

    // check if 0 users voted
    if (vote.votes_users.length == 0) {

        const editedMessage = {
            content: `@everyone Голосование <@${vote.id}> завершено!`,
            embeds: [
                new EmbedBuilder()
                    .setTitle(vote.title)
                    .setDescription(`**Вопрос:** ${vote.question}\n**Варианты ответов:**\n${vote.choices.join('\n')}\n\n**Результаты:**\nНикто не проголосовал\n**Было дано времени:** ${vote.time}\n**Победитель:** Никто`)
                    .setColor(Colors.Green)
                    .setTimestamp(Date.now())
            ]
        }
        // edit vote message 
        await messageVotes.edit(editedMessage)
        return
    }
    
    // sum votes
    vote.choices.forEach(e => {
        if (vote.votes_users.filter(e2 => e2.vote == e).length != 0) {
            votes[e] = vote.votes_users.filter(e2 => e2.vote == e).length
        } else {
            votes[e] = 0
        }
    })

    // get max vote
    let max = 0
    let maxVote = ''
    for (const key in votes) {
        if (votes[key] == max) {
            maxVote = `Ничья у ${key} и ${maxVote}`
        }
        if (votes[key] > max) {
            max = votes[key]
            maxVote = key
        }
    }

    // users not voted
    let usersNotVoted = []
    users.forEach(e => {
        user = e.replace('.json', '')
        if (!vote.votes_users.find(e2 => e2.id == user)) {
            usersNotVoted.push(user)
        }
    })
    // set users not voted to <@user>
    usersNotVoted = usersNotVoted.map(e => `<@${e}>`)
    console.log(usersNotVoted);

    // get users voted id
    let usersVoted = []
    vote.votes_users.forEach(e => {
        usersVoted.push(e.user)
    })
    console.log(usersVoted);

    // get statistics in % for each vote
    let statistics = []
    for (const key in votes) {
        // add progress bar and check users voted for this vote
        if (votes[key] == 0) {
            statistics.push(`${key}: 0%\n` + '▬')
            continue
        }
        let usersVotedForThisVote = []

        if (vote.anonymous === false) {
            vote.votes_users.forEach(e => {
                if (e.vote == key) {
                    usersVotedForThisVote.push(`<@${e.id}>`)
                }
            })
        }
        statistics.push(`${key}: ${Math.round(votes[key] / usersVoted.length * 100)}%\n` + '▬'.repeat(Math.round(votes[key] / usersVoted.length * 10)) + `\n${usersVotedForThisVote.join(', ')}`)
    }

    // edit vote message, disable buttons and green color for winner
    let components = []
    vote.choices.forEach(async e => {
        // check draw
        if (maxVote.includes('Ничья')) {
            components.push(new ButtonBuilder().setCustomId(`vote_${vote.id}_${e}`).setLabel(e).setStyle(3).setDisabled(true))
            return
        }

        if (e == maxVote) {
            components.push(new ButtonBuilder().setCustomId(`vote_${vote.id}_${e}`).setLabel(e).setStyle(3).setDisabled(true))
        } else {
            components.push(new ButtonBuilder().setCustomId(`vote_${vote.id}_${e}`).setLabel(e).setStyle(4).setDisabled(true))
        }
    })
    
    await messageVotes.edit({
        content: `Голосование <@${vote.id}> завершено!`,
        embeds: [
            new EmbedBuilder()
                .setTitle(vote.title)
                .setDescription(`${vote.description}\n\n**Не проголосовали:** ${usersNotVoted.join(', ')}\n\n**Результаты:**\n${statistics.join('\n')}\n\n**Было дано времени:** ${vote.time}\n**Победитель:** ${maxVote}`)
                .setColor(vote.color)
                .setTimestamp(Date.now())
        ],
        components: [new ActionRowBuilder().addComponents(components)]
    })

    messageVotes.reply(`Голосование <@${vote.id}> завершено! Победитель: ${maxVote} (${votes[maxVote]} голосов) (Не проголосовали: ${usersNotVoted.join(', ')})`)

    // delete vote from data
    data.votes.splice(data.votes.indexOf(vote), 1)
    fs.writeFileSync('./src/dataBase/bot.json', JSON.stringify(data))
    fileLog(`[VOTE] Голосование ${vote.id} завершено! Победитель: ${maxVote} (${votes[maxVote]} голосов) (Не проголосовали: ${usersNotVoted.join(', ')})`)
}

module.exports = {
    endVote
}