const { EmbedBuilder, Colors, ActionRowBuilder, ButtonBuilder } = require('discord.js')
const fs = require('fs')



module.exports = {
    name: 'ready',
    once: true,

    async execute(client) {

        async function updateList() {
            const json = JSON.parse(fs.readFileSync('./src/dataBase/bot.json'));
            const messageId = json.message_list_id;
            let channel = client.channels.cache.get("1061827241031508121");
            let message = await channel.messages.fetch(messageId.id).catch(err => {
                if (err.code === 10008) return null;
                console.error(err);
            });
            const embed_components = {
                embeds: [new EmbedBuilder()
                    .setTitle('📜 Список игр')
                    .setDescription(`Список игр пользователей\n${game_table()}\nСообщение будет обновляться каждый раз при взаимодействии с списками. Команды для информации в <#1060755559231524954>`)
                    .setColor(Colors.Green)
                    .setTimestamp(Date.now())], components: [new ActionRowBuilder()
                        .addComponents([
                            new ButtonBuilder()
                                .setCustomId('start_confern_1')
                                .setLabel('🚀 Начать собрание')
                                .setStyle('3'),
                            new ButtonBuilder()
                                .setCustomId('plan_confern_1')
                                .setDisabled(true)
                                .setLabel('⏳ Запланировать собрание')
                                .setStyle('1'),
                            new ButtonBuilder()
                                .setCustomId('photo_confern')
                                .setDisabled(true)
                                .setLabel('📸 Посмотреть фото')
                                .setStyle('1')
                        ])]
            }
            if (!message) {
                message = await channel.send(embed_components);
                json.message_list_id = message;
                fs.writeFileSync('./src/dataBase/bot.json', JSON.stringify(json));
            } else {
                message.edit(embed_components);
            }
        }
        
        function get_game_list() {
            const users_files_name = fs.readdirSync('./src/dataBase/users');
            let uniqueGames = new Set();
        
            for (let user_file_name of users_files_name) {
                const fileData = JSON.parse(fs.readFileSync(`./src/dataBase/users/${user_file_name}`, 'utf8')).data.games;
                if (fileData.length === 0) {
                    uniqueGames.add("empty");
                } else {
                    for (let game of fileData) {
                        game = game.trim();
                        if (game.charAt(0) === '!') {
                            uniqueGames.add(game.split(0))
                        } else
                        if (!uniqueGames.has(game) && game !== 'undefined') {
                            uniqueGames.add(game);
                        }
                    }
                }
                
            }
            return [...uniqueGames];
        }
        
        
        function check_game_in_list(user, game) {
            let have_game = false;
            JSON.parse(fs.readFileSync(`./src/dataBase/users/${user}.json`, 'utf-8')).data.games.forEach((game_in_list => {
                if (game_in_list === game) {
                    have_game = true;
                }
            })); return have_game;
        }
        
        
        function game_table() {
            const game_list = get_game_list();
        
        
            // Проверка у скольких есть игра для сортировки по количеству 
            let game_counts = {};
            for (let game of game_list) {
                if (game !== "empty") {
                    game_counts[game] = 0;
                }
            }
            const users = fs.readdirSync(`./src/dataBase/users`);
            for (let user of users) {
                user = user.replace('.json', '');
                for (let game of game_list) {
                    if (check_game_in_list(user, game)) {
                        game_counts[game]++;
                    }
                }
            }
            game_list.sort((a, b) => game_counts[b] - game_counts[a]);
        
        
            let end_list = "";
            let users_string = "";
            for (let user of users) {
                let userName = JSON.parse(fs.readFileSync(`./src/dataBase/users/${user}`)).userName;
                users_string += `${userName.charAt(0)}${userName.slice(1)} `;
            }
        
            //capitalizing first letter of the userName
            users_string = users_string.split(" ").map((name) => name.charAt(0).toUpperCase()).join(" ");
            end_list += `  ${' '.repeat(Math.max(...game_list.map(game => game.length)))}${users_string}\n`;
        
            game_list.map((game_in_lists) => {
                console.log(game_in_lists);
                if (game_in_lists[0] === '!') {
                    users_string += `${game_in_lists.split(0)} `;
                }
                users_string += ' '.repeat(Math.max(...game_list.map(game => game.length)) - game_in_lists.length);
                for (let user of users) {
                    user = user.replace('.json', '');
                    if (game_in_lists[0] === '!') {
                        users_string += `⚠️`;
                    } else if (check_game_in_list(user, game_in_lists)) {
                        users_string += `✅`;
                    } else {
                        users_string += `❌`;
                    }
                }
                end_list += `${users_string}\n`;
            });
            if (end_list.includes("empty")) {
                end_list = end_list.replace("empty", "No games");
            }
            let list_names = '';
            for (let user of users) {
                let userName = JSON.parse(fs.readFileSync(`./src/dataBase/users/${user}`)).userName;
                list_names += `**${JSON.parse(fs.readFileSync(`./src/dataBase/users/${user}`)).userName.trim()}**: ${userName.charAt(0)}\n`;
            }
            return `${list_names}\n\`\`\`${end_list}\`\`\``;
        }


        console.log('Ready!');
        console.log(`${client.user.tag} активирован!`);
                client.user.setActivity(`👉👌💦`);
                client.user.setStatus('idle');

                const message = new EmbedBuilder()
                    .setTitle('🟢 Бот был запущен!')
                    .setDescription('Бот был запущен через консоль.')
                    .setColor(Colors.Green)
                    .setTimestamp(Date.now())

                await client.channels.cache.get("1060771841452560507")
                    .send({
                        content: '<@1060761793204596846> запустился', components: [
                            new ActionRowBuilder().addComponents([
                                new ButtonBuilder().setCustomId('happyMessage').setLabel('🎉 Позравляю').setStyle(3),
                                new ButtonBuilder().setCustomId('restartButton').setLabel('🔁 Перезагрузить').setStyle(1),
                                new ButtonBuilder().setCustomId('stopButton').setLabel('🛑 Выключить бота').setStyle(4)
                            ])
                        ], embeds: [message]
                    })


                    updateList()
        async function pickPresence() {
            const option = Math.floor(Math.random() * statusArray.length);

            try {
                
            } catch (error) {
                console.error(error);
            }
        }
    },
};