const { Events, VoiceState, VoiceStateManager } = require('discord.js')
const { execute } = require('./ready')
const { VoiceConnectionStatus, AudioPlayerStatus, createAudioPlayer, NoSubscriberBehavior, joinVoiceChannel, createAudioResource } = require('@discordjs/voice');
const fs = require('fs');
const { Interaction } = require('chart.js');
const internal = require('stream');
const { giveAdvanced } = require('../functions/giveAdvanced');
const { xpAdd } = require('../functions/leveling');

module.exports = {
    name: Events.VoiceStateUpdate,

    async execute(oldState, newState) {
        
        let newUserChannel = newState.channel
        let oldUserChannel = oldState.channel

        if (fs.existsSync(`./src/dataBase/users/${newState.member.user.id}.json`) && oldUserChannel === null && newUserChannel !== null && !newState.member.user.bot && newUserChannel.id !== '1060756194123317329') {
            let result; 
            if (fs.existsSync(`./src/sounds/users_join/${newState.member.user.id}`)) {
                const files = fs.readdirSync(`./src/sounds/users_join/${newState.member.user.id}`);
                result = `./src/sounds/users_join/${newState.member.user.id}/${files[Math.floor(Math.random(0) * files.length)]}`
            } else {
                result = `./src/sounds/users_join/default.ogg`;
            }

            let userr = fs.readFileSync(`./src/dataBase/users/${newState.member.user.id}.json`)

            let oldTime = -1;
            const timeGame = setInterval(async ()=>{
                let user = JSON.parse(fs.readFileSync(`./src/dataBase/users/${newState.member.user.id}.json`))
                console.log(`${user.state[user.state.length - 1]} / ${oldTime}`);
                if (newState.member.voice.channelId === newUserChannel.id && user.state[user.state.length - 1] !== oldTime) {
                    user.state[user.state.length - 1] = user.state[user.state.length - 1] + 30000
                    oldTime = user.state[user.state.length - 1] + 30000
                    console.log(user.userName +' '+ user.state[user.state.length - 1]);
                    fs.writeFileSync(`./src/dataBase/users/${newState.member.user.id}.json`, JSON.stringify(user))

                    // give advanced if user is in voice channel for 10 hour or 50 hour or 125 hour

                    let user_time = 0
                    user.state.forEach((e) => {
                        user_time += e
                    })
                    
                    if (user_time >= 36000000) {
                        giveAdvanced(newState.client, 'Проверка пройдена', newState.member.user.id)
                    } else if (user_time >= 180000000) {
                        giveAdvanced(newState.client, 'Полноценный участник ХАЖАБЫ', newState.member.user.id)
                    } else if (user_time >= 450000000) {
                        giveAdvanced(newState.client, 'Истенный олд', newState.member.user.id)
                    }

                    // leveling system (client user id, xp add, message(undefined), channel)
                    xpAdd(newState.client, newState.member.user.id, Math.floor(Math.random(1)*5), undefined, newState.member.voice.channel.id)

                } else {
                    clearInterval(timeGame)
                }
            }, 30000)

            const connection = joinVoiceChannel({
                channelId: newUserChannel.id,
                guildId: newUserChannel.guild.id,
                adapterCreator: newUserChannel.guild.voiceAdapterCreator,
            });
            
            const player = createAudioPlayer();
            const resource = createAudioResource(result);

            player.play(resource)
            connection.subscribe(player)
            const creatorId = await newUserChannel.name.split('♂')[1]
            const meet = JSON.parse(fs.readFileSync(`./src/dataBase/meets/${creatorId}.json`))
            const members = await newUserChannel.members.filter(member => !member.user.bot);

            console.log(members);

            if (meet.users_list.length + 1 <= members.size) {
                let ping = ''
                members.forEach((e) => {
                    ping += `${e}, `
                })
                if (meet.games_list.length === 1) {
                    newUserChannel.send(`${ping} все в сборе!\nБыло начато собрание по \`${meet.games_list}\`, создатель <@${creatorId}>`)
                } else {
                    newUserChannel.send(`${ping} все в сборе, начинаем голосование на выбор во что поиграть! Варианты которые выбрал <@${creatorId}>: \`\`\`js\n${meet.games_list}\`\`\`Выберите один вариант в меню`)
                }
                // if (5 === members.size && meet.games_list.find('cs:go')) {
                //     meet.users_list.forEach((e) => {
                //         giveAdvanced(newState.client, 'Пойти фулл стаком в кс', e)
                //     })
                // }
                
            } else {
                newUserChannel.send(`<@${newState.member.user.id}> присоеденился к собранию!\nДо начала собрания осталось: \`${members.size}/${meet.users_list.length + 1}\` участников`)
            }
            console.log(creatorId);
        } else if (fs.existsSync(`./src/dataBase/users/${newState.member.user.id}.json`) && !newState.member.user.bot && newUserChannel === null && oldUserChannel.id !== '1060756194123317329') {
            setTimeout(async () => {
                const creatorId = await oldUserChannel.name.split('♂')[1]
                if (fs.existsSync(`./src/dataBase/meets/${creatorId}.json`)) {
                    const creatorId = await oldUserChannel.name.split('♂')[1]
                    const meet = JSON.parse(fs.readFileSync(`./src/dataBase/meets/${creatorId}.json`))
                    const members = await oldUserChannel.members.filter(member => !member.user.bot);

                    let result;
                    if (fs.existsSync(`./src/sounds/users_leave/${newState.member.user.id}`)) {
                        const files = fs.readdirSync(`./src/sounds/users_leave/${newState.member.user.id}`);
                        result = `./src/sounds/users_leave/${newState.member.user.id}/${files[Math.floor(Math.random(0) * files.length)]}`
                    } else {
                        result = `./src/sounds/users_join/default.ogg`;
                    }
                    const connection = joinVoiceChannel({
                        channelId: oldUserChannel.id,
                        guildId: oldUserChannel.guild.id,
                        adapterCreator: oldUserChannel.guild.voiceAdapterCreator,
                    });
                    const player = createAudioPlayer();
                    const resource = createAudioResource(result);
        
                    player.play(resource)
                    connection.subscribe(player)

                    if (members.size < 1) {
                        oldUserChannel.send(`<@${newState.member.user.id}> отошёл от собрания..\n До начала собрания осталось: \`${members.size}/${meet.users_list.length + 1}\` участников.\n**В канале не кого не осталось, он будет закрыт через \`5м\`**`)
                    } else {
                        oldUserChannel.send(`<@${newState.member.user.id}> отошёл от собрания..\n До начала собрания осталось: \`${members.size}/${meet.users_list.length + 1}\` участников`)
                    }
                } 
            }, 2000)
            
        }
    }
}