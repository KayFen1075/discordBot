const { SlashCommandBuilder, PermissionsBitField, Colors } = require('discord.js');
const { execute } = require('./list');
const fs = require('fs');
const { fileLog } = require('../functions/logs')
const { EmbedBuilder } = require('@discordjs/builders');
const { meetStart, meetEnd_message } = require('../functions/meet');
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
        )
        .addSubcommand(subcommand => subcommand
            .setName('info')
            .setDescription('Посмотреть список участников собрания')
        )
        .addSubcommand(subcommand => subcommand
            .setName('change')
            .setDescription('Изменить тему собрания')
            .addStringOption(option => option
                .setName('subject')
                .setDescription('Выбрать свою тему собрания, можно через ","')
                .setRequired(true)
            )
        )
        .addSubcommand(subcommand => subcommand
            .setName('plan')
            .setDescription('Запланировать собрание')
            .addStringOption(option => option
                .setName('subject')
                .setDescription('Выбрать свою тему собрания, можно через ","')
                .setRequired(false)
            )
        )
        .addSubcommand(subcommand => subcommand
            .setName('start')
            .setDescription('Начать собрание')
        )
        .addSubcommand(subcommand => subcommand
            .setName('invite')
            .setDescription('Пригласить участников в собрание')
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
                        fs.writeFileSync(`./src/dataBase/bot.json`, JSON.stringify(bot))
                    
                        meetChannel.send(`<@${interaction.user.id}> закрыл собрание, еслии быть точнее то этот ебан вышел из своего же собрания`)
                        fileLog(`[MEET] ${interaction.user.tag} закрыл собрание, еслии быть точнее то этот ебан вышел из своего же собрания`)
                    await interaction.reply({content: `Вы удалили собрание`, ephemeral: true})
                    meetEnd_message(interaction.client, interaction.user.id)
                } else {
                    let userOverwrite = voiceChannel.permissionOverwrites
                    if (userOverwrite) {
                        userOverwrite.delete(interaction.user);
                    } voiceChannel.userLimit = await voiceChannel.userLimit - 1 
                    voiceChannel.send(`<@${interaction.user.id}> покинул собрание`)
                    meet.users_list = meet.users_list.filter(item => item !== interaction.user.id)
                    interaction.reply({content: `Вы покинули собрание`, ephemeral: true})
                    fileLog(`[MEET] ${interaction.user.tag} покинул собрание ${interaction.options.get('user').value}`)
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
                    fileLog(`[MEET] ${interaction.user.tag} выгнал ${interaction.options.get('user').value} из собрания`)
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
                fileLog(`[MEET] ${interaction.user.tag} добавил ${interaction.options.get('user').value} в собрание`)
                voiceChannel.permissionOverwrites.create(interaction.options.get('user').value, PermissionsBitField.Flags.Connect)
                } else {
                    interaction.reply({content: `<@${interaction.options.get('user').value}> уже есть в собрании`, ephemeral: true})
                }
                
            } else {
                interaction.reply({content: `Вы не создатель собрания <@${interaction.options.get('user').value}>`, ephemeral: true})
            }
        }

        // end meet
        else if (interaction.options._subcommand === 'end') {
            if (fs.existsSync(`./src/dataBase/meets/${interaction.user.id}.json`)) {
                let meet = JSON.parse(fs.readFileSync(`./src/dataBase/meets/${interaction.user.id}.json`))
                const voiceChannel = interaction.guild.channels.cache.get(meet.channel)

                const timeMeet = Date.now() - meet.time_start
                
                let bot = JSON.parse(fs.readFileSync(`./src/dataBase/bot.json`))
                    bot.state[bot.state.length - 1] = bot.state[bot.state.length - 1] + timeMeet
                    fs.writeFileSync(`./src/dataBase/bot.json`, JSON.stringify(bot))

                meetChannel.send(`<@${interaction.user.id}> закрыл собрание, оно длилось \`${Math.round(timeMeet / 60000 / 60)}ч, ${Math.round(timeMeet / 60000 % 60)}м\``)

                voiceChannel.delete();
                await interaction.reply({content: `Вы удалили собрание`, ephemeral: true})
                fileLog(`[MEET] ${interaction.user.tag} удалил собрание`)
                meetEnd_message(interaction.client, interaction.user.id)
            } else {
                interaction.reply({content: `Вы не проводите собрание`, ephemeral: true})
            }
        }

        // info meet
        else if (interaction.options._subcommand === 'info') {
            if (fs.existsSync(`./src/dataBase/meets/${interaction.user.id}.json`)) {
                let meet = JSON.parse(fs.readFileSync(`./src/dataBase/meets/${interaction.user.id}.json`))
                const timeMeet = Date.now() - meet.time_start
                const embed = new EmbedBuilder()
                    .setTitle(`🟩 Информация о собрании`)
                    .setDescription(`**Тема/темы:** ${meet.games_list.map(x => `\`${x}\``).join(', ')}\n**Время проведения:** \`${Math.round(timeMeet / 60000 / 60)}ч, ${Math.round(timeMeet / 60000 % 60)}м\`\n**Участники:** ${meet.users_list.map(x => `<@${x}>`).join(', ')}`)
                    .setColor(Colors.Green)
                interaction.reply({embeds: [embed], ephemeral: true})
            } else {
                interaction.reply({content: `Вы не проводите собрание`, ephemeral: true})
            }
        }

        // change subject meet
        else if (interaction.options._subcommand === 'change') {
            if (fs.existsSync(`./src/dataBase/meets/${interaction.user.id}.json`)) {
                let meet = JSON.parse(fs.readFileSync(`./src/dataBase/meets/${interaction.user.id}.json`))
                const userData = JSON.parse(fs.readFileSync(`./src/dataBase/users/${interaction.user.id}.json`))
                
                const voiceChannel = interaction.guild.channels.cache.get(meet.channel)
                const subject = interaction.options.get('subject').value.split(',')

                voiceChannel.setName(`${userData.userName}: ${subject.join(', ')} id♂${interaction.user.id}`)

                meet.games_list = subject

                fs.writeFileSync(`./src/dataBase/meets/${interaction.user.id}.json`, JSON.stringify(meet))

                interaction.reply({content: `Вы изменили тему собрания на: ${interaction.options.get('subject').value}`, ephemeral: true})
                fileLog(`[MEET] ${interaction.user.tag} изменил тему собрания на: ${interaction.options.get('subject').value}`)
            } else {
                interaction.reply({content: `Вы не проводите собрание`, ephemeral: true})
            }
        }
        
        // invite user to meet
        else if (interaction.options._subcommand === 'invite') {
            if (!fs.existsSync(`./src/dataBase/planMeets/${interaction.user.id}.json`)) {
                interaction.reply({content: `Вы не создали план собрания`, ephemeral: true})
                return
            }
            let planMeet = JSON.parse(fs.readFileSync(`./src/dataBase/planMeets/${interaction.user.id}.json`))
            const user = interaction.options.get('user').value
            if (planMeet.users_invited.includes(user)) {
                interaction.reply({content: `Вы уже пригласили этого пользователя`, ephemeral: true})
                return
            }
            planMeet.users_invited.push(user)
            fs.writeFileSync(`./src/dataBase/planMeets/${interaction.user.id}.json`, JSON.stringify(planMeet))
            interaction.reply({content: `Вы пригласили <@${user}> в собрание`, ephemeral: true})

            const message = await interaction.channel.messages.fetch(planMeet.message_id)
            message.thread.send(`<@${user}> вы были приглашены это собрание, пожалуйста выбирите смогли ли вы принять участие в нем.`)
        } 

        // start meet
        else if (interaction.options._subcommand === 'start') {
            if (fs.existsSync(`./src/dataBase/meets/${interaction.user.id}.json`)) {
                interaction.reply({content: `Вы уже проводите собрание`, ephemeral: true})
                return
            }

            if (!fs.existsSync(`./src/dataBase/planMeets/${interaction.user.id}.json`)) {
                interaction.reply({content: `Вы не создали план собрания`, ephemeral: true})
                return
            }

            meetStart(interaction.client, interaction.user.id)
            interaction.reply({content: `Вы начали собрание`, ephemeral: true})
        }
    }
}