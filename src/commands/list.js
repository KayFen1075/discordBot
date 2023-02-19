const { SlashCommandBuilder } = require('@discordjs/builders');
const { Client, StringSelectMenuBuilder, ActionRowBuilder, ButtonBuilder, GatewayIntentBits, EmbedBuilder, PermissionsBitField, Permissions, MessageManager, Embed, Collection, Colors } = require('discord.js');
const fs = require('fs');

const client = new Client({
    intents: [GatewayIntentBits.Guilds, GatewayIntentBits.GuildMessages, GatewayIntentBits.MessageContent]
});


module.exports = {
    data: new SlashCommandBuilder()
        .setName('list')
        .setDescription('Управление списком')
        .addSubcommand(subcommand => subcommand
            .setName('add')
            .setDescription('Добавить в список игры')
            .addStringOption(option => option
                .setName('games').setDescription('Игры котоыре ты хочешь добавить(через , )').setRequired(true))
            .addBooleanOption(option => option.setName('android').setDescription('Игры котоыре ты хочешь добавить(через ,)').setRequired(false))
            .addUserOption(option => option.setName('user').setDescription('Выбери пользователя для редактирования').setRequired(false))
        )
        .addSubcommand(subcommand => subcommand
            .setName('remove')
            .setDescription('Удалить игры из списка(Выбрать из следущего собщения) можно выбрать андроид')
            .addBooleanOption(option => option.setName('android').setDescription('Игры котоыре ты хочешь добавить(через,)').setRequired(false))
        ),
    async execute(interaction) {
        if (!fs.existsSync(`./src/dataBase/users/${interaction.user.id}.json`)) {
            await interaction.reply({content: 'Ты не участник **ХАЖАБЫ** что бы использовать эту команду. Пройти регистрацию что бы использовать **все** команды <#1061827016518815845>', ephemeral: true})
            return
        }
        let bot = JSON.parse(fs.readFileSync(`./src/dataBase/bot.json`, 'utf-8'));
        const messageId = bot.message_list_id;
        let channel = await interaction.guild.channels.cache.get("1061827241031508121");
        let message = await channel.messages.fetch(messageId.id).catch(err => {
            console.error(err);
        });
        let interactionUser = interaction.user.id;
        if (interaction.options.get('user')) {
            interactionUser = interaction.options.get('user').member.id
        }
        if (interaction.options._subcommand === 'add') {
            if (!interaction.options.get('android')) {
                let userr = JSON.parse(fs.readFileSync(`./src/dataBase/users/${interactionUser}.json`, 'utf-8'));
                let newGames = interaction.options.get('games').value.trim().split(',');

                let existingGames = newGames.filter(game => userr.data.games.some(x => x.trim() === game.trim()));

                if (existingGames.length > 0) {
                    interaction.reply({ content: `У тебя в списке уже есть **${existingGames.join(', ')}**!`, ephemeral: true });
                    return;
                }

                await userr.data.games.push(...newGames);

                const userData = JSON.stringify(userr);

                fs.writeFileSync(`./src/dataBase/users/${interactionUser}.json`, userData)
                bot.list_history = [`+🟢 ${userr.userName} добавил в список ${interaction.options.get('games').value} (PC)\n`, bot.list_history[0], bot.list_history[1], bot.list_history[2], bot.list_history[3]]
                interaction.reply({ content: `В ваш список были добавлены **${interaction.options.get('games').value}**`, ephemeral: true })
                message.thread.send({
                    content: `${userr.userName}(${interaction.user.tag}) добавил игру`,
                    embeds: [new EmbedBuilder()
                        .setTitle('🟢 Добавление игры (PC)')
                        .setColor(Colors.Green)
                        .setDescription(`**${userr.userName}** добавил в список \`${interaction.options.get('games').value}\`(PC), после добавления у него такие игры:\n\`\`\`${userr.data.games}\`\`\``)
                        .setTimestamp(Date.now())
                    ]
                })
            } else {
                let userr = JSON.parse(fs.readFileSync(`./src/dataBase/users/${interactionUser}.json`, 'utf-8'));
                let newGames = interaction.options.get('games').value.trim().split(',')
                let existingGames = newGames.filter(game => userr.data.android_games.some(x => x.trim() === game.trim()))

                if (existingGames.length > 0) {
                    interaction.reply({ content: `У тебя в списке уже есть **${existingGames.join(', ')}**!`, ephemeral: true });
                    return;
                }

                await userr.data.android_games.push(...newGames);

                const userData = JSON.stringify(userr);

                fs.writeFileSync(`./src/dataBase/users/${interactionUser}.json`, userData)
                bot.list_history = [`+🟢 ${userr.userName} Добавил в список ${interaction.options.get('games').value} (Android)\n`, bot.list_history[0], bot.list_history[1], bot.list_history[2], bot.list_history[3]]
                interaction.reply({ content: `В ваш список были добавлены **${interaction.options.get('games').value}**(Android)`, ephemeral: true })
                message.thread.send({
                    content: `${userr.userName}(${interaction.user.tag}) добавил игру`,
                    embeds: [new EmbedBuilder()
                        .setTitle('🟢 Добавление игры (Android)')
                        .setColor(Colors.Green)
                        .setDescription(`**${userr.userName}** добавил в список \`${interaction.options.get('games').value}\`(Android), после добавления у него такие игры:\n\`\`\`${userr.data.android_games}\`\`\``)
                        .setTimestamp(Date.now())
                    ]
                })
            }
            fs.writeFileSync(`./src/dataBase/bot.json`, JSON.stringify(bot))
        } else if (interaction.options._subcommand === 'remove') {
            let userr = JSON.parse(fs.readFileSync(`./src/dataBase/users/${interactionUser}.json`, 'utf-8'));

            const andr = interaction.options.get('android');
            console.log(andr);

            if (!andr) {
                let options = await userr.data.games.map(game => {
                    let desc;
                    game = game.trim()
                    if (game.charAt(0) === '!') {
                        desc = `🟥`
                    } else {
                        desc = `🟧`
                    }
                    return {
                        label: game,
                        description: `${desc} Удалить ПК игру`,
                        value: game,

                    }
                });
                const row = await new ActionRowBuilder()
                    .addComponents(
                        new StringSelectMenuBuilder()
                            .setCustomId('remove_pc_games')
                            .setPlaceholder('Выбрать игру/игры')
                            .addOptions(options)
                            .setMinValues(1)
                            .setMaxValues(userr.data.games.length)
                    );
                await interaction.reply({
                    content: `Выбери игры которые хочешь удалить(ПК): ${userr.data.games}`,
                    components: [row]
                })
            } else {
                let options = await userr.data.android_games.map(game => {
                    let desc;
                    game = game.trim()
                    if (game.charAt(0) === '!') {
                        desc = `🟥`
                    } else {
                        desc = `🟧`
                    }
                    return {
                        label: game,
                        description: `${desc} Удалить игру Android`,
                        
                        value: game,

                    }
                });
                const row = new ActionRowBuilder()
                    .addComponents(
                        new StringSelectMenuBuilder()
                            .setCustomId('remove_android_games')
                            .setPlaceholder('Выбрать игру/игры')
                            .addOptions(options)
                            .setMinValues(1)
                            .setMaxValues(userr.data.android_games.length)
                    );
                await interaction.reply({
                    content: `Выбери игры которые хочешь удалить(Android): ${userr.data.android_games}`,
                    components: [row]
                })
            }
        }
    }
}