const { Events, VoiceChannel, Message } = require("discord.js");
const say = require("say");
const { execute } = require("./ready");
const { VoiceConnectionStatus, AudioPlayerStatus, createAudioPlayer, NoSubscriberBehavior, joinVoiceChannel, createAudioResource } = require('@discordjs/voice');

module.exports = {
    name: Events.MessageCreate,

    async execute(message) {
        // if (!(message.channel instanceof VoiceChannel) || !message.content.toLowerCase().includes("мегумин")) return;

        // const connection = joinVoiceChannel({
        //     channelId: message.channel.id,
        //     guildId: message.channel.guild.id,
        //     adapterCreator: message.channel.guild.voiceAdapterCreator,
        // });

        // const player = createAudioPlayer();
        // const resource = createAudioResource((await say.speak(await message.content, "Alex", 1.0)));

        // player.play(resource)
        // connection.subscribe(player)

        
    }
}