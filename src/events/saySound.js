const { Events } = require('discord.js')
const { VoiceConnectionStatus, AudioPlayerStatus, createAudioPlayer, NoSubscriberBehavior, joinVoiceChannel, createAudioResource } = require('@discordjs/voice');
const { execute } = require('./ready')
const fs = require('fs');
const { fileLog } = require('../functions/logs');

module.exports = {
    name: Events.InteractionCreate,

    async execute (interaction) {
        if (!fs.existsSync(`./src/dataBase/users/${interaction.user.id}.json`)) {
            await interaction.reply({content: 'Ты не участник **ХАЖАБЫ** что бы использовать эту команду. Пройти регистрацию что бы использовать **все** команды <#1061827016518815845>', ephemeral: true})
            return
        }
        if (interaction.customId === 'say_join') {
            if (fs.existsSync(`./src/sounds/users_join/${interaction.user.id}/${interaction.values}`) && interaction.member.voice.channel) {
                const channel = interaction.member.voice.channel
                const connection = joinVoiceChannel({
                    channelId: channel.id,
                    guildId: interaction.guild.id,
                    adapterCreator: interaction.guild.voiceAdapterCreator,
                });
                const player = createAudioPlayer();
                const resource = createAudioResource(`./src/sounds/users_join/${interaction.user.id}/${interaction.values}`);
    
                player.play(resource)
                connection.subscribe(player)
                fileLog(`[SOUND] ${interaction.user.username} (${interaction.user.id}) проиграл звук \`${interaction.values}\` в категории \`welcome\``)
            } else {
                console.log(`Вы не в голосовом канале! Либо \`${interaction.values}\` не найдено`);
            }
        } else if (interaction.customId === 'say_leave') {
            if (fs.existsSync(`./src/sounds/users_leave/${interaction.user.id}/${interaction.values}`) && interaction.member.voice.channel) {
                const channel = interaction.member.voice.channel
                const connection = joinVoiceChannel({
                    channelId: channel.id,
                    guildId: interaction.guild.id,
                    adapterCreator: interaction.guild.voiceAdapterCreator,
                });
                const player = createAudioPlayer();
                const resource = createAudioResource(`./src/sounds/users_leave/${interaction.user.id}/${interaction.values}`);
    
                player.play(resource)
                connection.subscribe(player)
                fileLog(`[SOUND] ${interaction.user.username} (${interaction.user.id}) проиграл звук \`${interaction.values}\` в категории \`goodbye\``)
            } else {
                console.log(`Вы не в голосовом канале! Либо \`${interaction.values}\` не найдено`);
            }
        } else if (interaction.customId === 'assets_delete') {
            if (fs.existsSync(`./src/dataBase/assets/${interaction.values}.json`)) {
                const asset = JSON.parse(fs.readFileSync(`./src/dataBase/assets/${interaction.values}.json`))

                interaction.guild.channels.delete(asset.channel.id)
                fs.unlinkSync(`./src/dataBase/assets/${interaction.values}.json`)
                interaction.reply(`Успешно удалено`)
                fileLog(`[ASSETS] ${interaction.user.username} (${interaction.user.id}) удалил ассет \`${interaction.values}\``)
            }
            
            
        }
    }
}