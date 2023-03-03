const { EmbedBuilder } = require('@discordjs/builders');
const { SlashCommandBuilder, Colors, PermissionFlagsBits } = require('discord.js');
const fs = require('fs');
const { giveAdvanced } = require('../functions/giveAdvanced');
const { fileLog } = require('../functions/logs');


module.exports = {
    data: new SlashCommandBuilder()
        .setName('advanced')
        .setDescription('Достижения')
        .addSubcommand(subcommand => subcommand
            .setName('create')
            .setDescription('Создать достижение')
            .addStringOption(option => option
                .setName('emoji')
                .setDescription('Эмодзи')
                .setRequired(true))
            .addStringOption(option => option
                .setName('name')
                .setDescription('Название')
                .setRequired(true))
            .addStringOption(option => option
                .setName('description')
                .setDescription('Описание')
                .setRequired(true))
            .addNumberOption(option => option
                .setName('reward')
                .setDescription('Награда за достижение опыта')
                .setRequired(true))
            .addStringOption(option => option
                .setName('difficulty')
                .setDescription('Сложность')
                .setRequired(true)
                .setChoices(
                    { name: 'Легко',      value: `Легко;${Colors.Grey}` },
                    { name: 'Средне',     value: `Средне;${Colors.Green}` },
                    { name: 'Сложно',     value: `Сложно;${Colors.Purple}` },
                    { name: 'Легендарно', value: `Легендарно;${Colors.Yellow}` },
                    { name: 'Невозможно', value: `Невозможно;${Colors.Gold}` },
                ))
        )
        .addSubcommand(subcommand => subcommand
            .setName('delete')
            .setDescription('Удалить достижение')
            .addStringOption(option => option
                .setName('name')
                .setDescription('Название')
                .setRequired(true))
        )
        .addSubcommand(subcommand => subcommand
            .setName('list')
            .setDescription('Список достижений')
        )
        .addSubcommand(subcommand => subcommand
            .setName('give')
            .setDescription('Выдать достижение')
            .addUserOption(option => option
                .setName('user')
                .setDescription('Пользователь')
                .setRequired(true))
            .addStringOption(option => option
                .setName('name')
                .setDescription('Название')
                .setRequired(true))
        )
        // .setDefaultMemberPermissions(PermissionFlagsBits.Administrator)
        ,

    async execute(interaction, client) {
        const subcommand = interaction.options.getSubcommand();
        let data = JSON.parse(fs.readFileSync('./src/dataBase/bot.json'));

        //only for users
        if (!fs.existsSync(`./src/dataBase/users/${interaction.user.id}.json`)) {
            return
        }

        // create
        if (subcommand === 'create') {
            //only for admins
            if (!interaction.member.permissions.has(PermissionFlagsBits.Administrator)) {
                interaction.reply({ content: 'У вас нет прав для выполнения этой команды!', ephemeral: true });
                return
            }

            const emoji = interaction.options.get('emoji').value;
            const name = interaction.options.get('name').value;
            const description = interaction.options.get('description').value;
            const reward = interaction.options.get('reward').value;
            const difficulty = interaction.options.get('difficulty').value;
                    const color = Number(difficulty.split(';')[1])
                    const difficultyName = difficulty.split(';')[0]
            // if (data.advenced.find(x => x.name === name) || data.advenced.find(x => x.emoji === emoji)) {
            //     return interaction.reply({ content: 'Достижение с таким названием или эмодзи уже существует!', ephemeral: true });
            // }

            data.advenced.push({
                emoji: emoji,
                name: name,
                description: description,
                users: [],
                difficulty: difficulty,
                xp: reward
            });

            fs.writeFileSync('./src/dataBase/bot.json', JSON.stringify(data));
            
            const embed = new EmbedBuilder()
                .setTitle(`${emoji} Новое достижение!`)
                .setDescription(`Было создано новое достижение: **${name}**\n\nДля того что бы его получить надо выполнить следующее:\n\`\`\`js\n${description}\`\`\`Сложность: \`${difficultyName}\``)
                .setColor(color)
                .setTimestamp(Date.now())

            interaction.reply({ content: '@here, новое достижение!', embeds: [embed] });
            fileLog(`[ADVENCED] Достижение успешно создано! (Название: ${name}, Эмодзи: ${emoji}, Описание: ${description}, Цвет: ${color}, Сложность: ${difficultyName}) `);
        }
        
        // delete
        else if (subcommand === 'delete') {

            //only for admins
            if (!interaction.member.permissions.has(PermissionFlagsBits.Administrator)) {
                interaction.reply({ content: 'У вас нет прав для выполнения этой команды!', ephemeral: true });
                return
            }

            const name = interaction.options.get('name').value;
            
            if (!data.advenced.find(x => x.name.toLowerCase() === name.toLowerCase())) {
                return interaction.reply({ content: 'Достижение с таким названием не существует!', ephemeral: true });
            }

            data.advenced.splice(data.advenced.findIndex(x => x.name === name), 1);

            fs.writeFileSync('./src/dataBase/bot.json', JSON.stringify(data));
            interaction.reply({ content: 'Достижение успешно удалено!', ephemeral: true });
            fileLog(`[ADVENCED] Достижение успешно удалено! (Название: ${name})`);
        }
        
        // list 
        else if (subcommand === 'list') {
            if (data.advenced.length === 0) {
                interaction.reply({ content: 'Достижений пока что нету или админ лох', ephemeral: true });
                return;
            }

            let fileds = [];
            data.advenced.forEach(e => {
                let users = [];
                e.users.forEach(u => {
                    users.push(`<@${u}>`);
                });
                fileds.push({
                    name: `${e.emoji} ${e.name}`,
                    value: `\`\`\`${e.description}\`\`\`Сложность: \`${e.difficulty.split(';')[0]}\` Награда: \`${e.xp}xp\`\nПолучили: ${users.join(', ')}`,
                    inline: false
                });
            });

            let embed = new EmbedBuilder()
                .setTitle('🏅 Список достижений')
                .setDescription('Список достижений, которые можно получить на сервере.')
                .setColor(Colors.Green)
                .addFields(fileds)

            interaction.reply({ content: `Достижения:`, embeds: [embed], ephemeral: true });
        }

        // give
        else if (subcommand === 'give') {

            
            const user = interaction.options.get('user').value;
            const name = interaction.options.get('name').value;
            
            giveAdvanced(interaction.client, name, user);

            // if (!data.advenced.find(x => x.name.toLowerCase() === name.toLowerCase())) {
            //     return interaction.reply({ content: 'Достижение с таким названием не существует!', ephemeral: true });
            // }

            // if (data.advenced.find(x => x.name.toLowerCase() === name.toLowerCase()).users.find(x => x === user)) {
            //     return interaction.reply({ content: 'Данный пользователь уже получил это достижение!', ephemeral: true });
            // }

            // data.advenced.find(x => x.name.toLowerCase() === name.toLowerCase()).users.push(user);

            // fs.writeFileSync('./src/dataBase/bot.json', JSON.stringify(data));
            // interaction.reply({ content: 'Достижение успешно выдано!', ephemeral: true });
            // fileLog(`[ADVENCED] Достижение успешно выдано! (Пользователь: ${user}, Название: ${name})`);
        }
    }
}