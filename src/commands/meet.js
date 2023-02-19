const { SlashCommandBuilder, PermissionsBitField, Colors } = require('discord.js');
const { execute } = require('./list');
const fs = require('fs');
const { EmbedBuilder } = require('@discordjs/builders');
module.exports = {
    data: new SlashCommandBuilder()
        .setName('meet')
        .setDescription('Команды с собранием')
        .addSubcommand(subcommand => subcommand
            .setName('leave')
            .setDescription('Выйти из собарния, надо выбрать пользователя который проводит собрание.')
            .addMentionableOption(option => option
                .setName('user')
                .setDescription('Пользователь который проводит собрание')
                .setRequired(true)
            )
        )
        .addSubcommand(subcommand => subcommand
            .setName('create')
            .setDescription('Создать собрание, следовать инструкции которая появться')
            .addStringOption(option => option
                .setName('subject')
                .setDescription('Выбрать свою тему собрания, можно через ","')
                .setRequired(false)
            )
        )
        .addSubcommand(subcommand => subcommand
            .setName('end')
            .setDescription('Закончить собрание')
        )
        .addSubcommand(subcommand => subcommand
            .setName('kick')
            .setDescription('Выгнать участника собрания')
            .addMentionableOption(option => option
                .setName('user')
                .setDescription('Пользователь которого надо выгнать')
                .setRequired(true)
            )
        )
        .addSubcommand(subcommand => subcommand
            .setName('add')
            .setDescription('Добавить пользователя в собрание')
            .addMentionableOption(option => option
                .setName('user')
                .setDescription('Пользователь которого надо добавить')
                .setRequired(true)
            )
        ),
    async execute(interaction) {
        const meetChannel = await interaction.guild.channels.cache.get('1074715039212253346')

        // leave subcommand
        if (interaction.options._subcommand === 'leave') {
            if (fs.existsSync(`./src/dataBase/meets/${interaction.options.get('user').value}.json`)) {
                let meet = JSON.parse(fs.readFileSync(`./src/dataBase/meets/${interaction.options.get('user').value}.json`))
                const voiceChannel = interaction.guild.channels.cache.get(meet.channel)
                if (interaction.options.get('user').value === interaction.user.id) {
                    voiceChannel.delete();

                    const timeMeet = Date.now() - meet.time_start
                
                    let bot = JSON.parse(fs.readFileSync(`./src/dataBase/bot.json`))
                        bot.state[bot.state.length - 1] = bot.state[bot.state.length - 1] + timeMeet
                        console.log(bot.state[bot.state.length - 1]);
                        fs.writeFileSync(`./src/dataBase/bot.json`, JSON.stringify(bot))
                    
                        meetChannel.send(`<@${interaction.user.id}> закрыл собрание, еслии быть точнее то этот ебан вышел из своего же собрания`)
                    await interaction.reply({content: `Вы удалили собрание`, ephemeral: true})
                    fs.unlinkSync(`./src/dataBase/meets/${interaction.user.id}.json`)
                } else {
                    let userOverwrite = voiceChannel.permissionOverwrites
                    if (userOverwrite) {
                        userOverwrite.delete(interaction.user);
                    } voiceChannel.userLimit = await voiceChannel.userLimit - 1 
                    voiceChannel.send(`<@${interaction.user.id}> покинул собрание`)
                    meet.users_list = meet.users_list.filter(item => item !== interaction.user.id)
                    interaction.reply({content: `Вы покинули собрание`, ephemeral: true})
                    fs.writeFileSync(`./src/dataBase/meets/${interaction.options.get('user').value}.json`, JSON.stringify(meet))
                }
            } else {
                interaction.reply({content: `Этот пользователь не проводит собрание`, ephemeral: true})
            } 
        }

        // kick user in meet
        else if (interaction.options._subcommand === 'kick') {
            if (fs.existsSync(`./src/dataBase/meets/${interaction.user.id}.json`)) {

                let meet = JSON.parse(fs.readFileSync(`./src/dataBase/meets/${interaction.user.id}.json`))
                const voiceChannel = interaction.guild.channels.cache.get(meet.channel)

                if (meet.users_list.includes(interaction.options.get('user').value)) {
                    meet.users_list = meet.users_list.filter(item => item !== interaction.options.get('user').value)
                    interaction.reply({ content: `Вы выгнали <@${interaction.options.get('user').value}>`, ephemeral: true })
                    fs.writeFileSync(`./src/dataBase/meets/${interaction.user.id}.json`, JSON.stringify(meet))

                    voiceChannel.send(`<@${interaction.options.get('user').value}> выгнали из собрания`)

                    voiceChannel.permissionOverwrites.delete(interaction.guild.members.cache.get(interaction.options.get('user').value));
                    
                } else {
                    interaction.reply({ content: `Этого пользователя нету на собрании`, ephemeral: true })
                }
            } else {
                interaction.reply({ content: `Вы не создатель собрания`, ephemeral: true })
            }
        }

        // add user to meet
        else if (interaction.options._subcommand === 'add') {
            if (fs.existsSync(`./src/dataBase/meets/${interaction.user.id}.json`)) {
                let meet = JSON.parse(fs.readFileSync(`./src/dataBase/meets/${interaction.user.id}.json`))
                console.log(meet.users_list.filter(x => x !== interaction.options.get('user').value));
                if (!meet.users_list.includes(interaction.options.get('user').value)) {
                    const voiceChannel = interaction.guild.channels.cache.get(meet.channel)
                // const user = await interaction.guild.members.cache.get(interaction.options.get('user').value)

                meet.users_list = [...meet.users_list, interaction.options.get('user').value];

                // user.send({
                //     content: `https://discord.com/channels/${interaction.guildId}/${await voiceChannel.id}`,
                //     embeds: [new EmbedBuilder()
                //         .setTitle(`🟩 Вас добавили в собрание!`)
                //         .setDescription(`Вас добавил <@${interaction.user.id}> в собрание, подробности о собрании написаны в названии и описании канала [по ссылке](https://discord.com/channels/${interaction.guildId}/${await voiceChannel.id})`)
                //         .setColor(Colors.Green)
                //     ]
                // })
                interaction.reply({content: `Вы добавили в собрание <@${interaction.options.get('user').value}>`, ephemeral: true})
                fs.writeFileSync(`./src/dataBase/meets/${interaction.user.id}.json`, JSON.stringify(meet))

                voiceChannel.send(`<@${interaction.options.get('user').value}> добавили в собрание`)

                voiceChannel.permissionOverwrites.create(interaction.options.get('user').value, { ViewChannel: true })
                } else {
                    interaction.reply({content: `<@${interaction.options.get('user').value}> уже есть в собрании`, ephemeral: true})
                }
                
            } else {
                interaction.reply({content: `Вы не создатель собрания <@${interaction.options.get('user').value}>`, ephemeral: true})
            }
        }


        else if (interaction.options._subcommand === 'end') {
            if (fs.existsSync(`./src/dataBase/meets/${interaction.user.id}.json`)) {
                let meet = JSON.parse(fs.readFileSync(`./src/dataBase/meets/${interaction.user.id}.json`))
                const voiceChannel = interaction.guild.channels.cache.get(meet.channel)

                const timeMeet = Date.now() - meet.time_start
                
                let bot = JSON.parse(fs.readFileSync(`./src/dataBase/bot.json`))
                    bot.state[bot.state.length - 1] = bot.state[bot.state.length - 1] + timeMeet
                    console.log(bot.state[bot.state.length - 1]);
                    fs.writeFileSync(`./src/dataBase/bot.json`, JSON.stringify(bot))

                meetChannel.send(`<@${interaction.user.id}> закрыл собрание, оно длилось **${Math.round(timeMeet / 60000)}** минут`)

                voiceChannel.delete();
                await interaction.reply({content: `Вы удалили собрание`, ephemeral: true})
                fs.unlinkSync(`./src/dataBase/meets/${interaction.user.id}.json`)
            } else {
                interaction.reply({content: `Вы не проводите собрание`, ephemeral: true})
            }
        }
    }
}