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
                        game_in_data = game.toString().trim();
                        if (!uniqueGames.has(game_in_data) && game_in_data.charAt(0) !== '!') {
                            uniqueGames.add(game_in_data);
                        }
                    }
                    for (let game of fileData) {
                        game_in_data = game.toString().trim();
                        game_one_str = game_in_data.substring(1)
                        if (!uniqueGames.has(game_one_str) && game_in_data.charAt(0) === '!') {
                            uniqueGames.add(game_one_str);
                        }
                    }

                }
            }
            return [...uniqueGames];
        }

        function get_android_game_list() {
            const users_files_name = fs.readdirSync('./src/dataBase/users');
            let uniqueGames = new Set();

            for (let user_file_name of users_files_name) {
                const fileData = JSON.parse(fs.readFileSync(`./src/dataBase/users/${user_file_name}`, 'utf8')).data.android_games;
                if (fileData.length === 0) {
                    uniqueGames.add("empty");
                } else {
                    for (let game of fileData) {
                        game_in_data = game.toString().trim();
                        if (!uniqueGames.has(game_in_data) && game_in_data.charAt(0) !== '!') {
                            uniqueGames.add(game_in_data);
                        }
                    }
                    for (let game of fileData) {
                        game_in_data = game.toString().trim();
                        game_one_str = game_in_data.substring(1)
                        if (!uniqueGames.has(game_one_str) && game_in_data.charAt(0) === '!') {
                            uniqueGames.add(game_one_str);
                        }
                    }

                }
            }
            return [...uniqueGames];
        }











        function check_game_in_list(user, game, type) {
            let have_game = false;
            game_trim = game.toString().trim();
            if (type !== '!') {
                JSON.parse(fs.readFileSync(`./src/dataBase/users/${user}.json`, 'utf-8')).data.games.forEach((game_in_list => {
                    if (game_in_list.trim() === game_trim) {
                        have_game = true;
                    }
                })); return have_game;
            } else {
                JSON.parse(fs.readFileSync(`./src/dataBase/users/${user}.json`, 'utf-8')).data.games.forEach((game_in_list => {
                    if (game_in_list.trim() === `!${game_trim}`) {
                        have_game = true;
                    }
                })); return have_game;
            }
        }

        function check_android_game_in_list(user, game, type) {
            let have_game = false;
            game_trim = game.toString().trim();
            if (type !== '!') {
                JSON.parse(fs.readFileSync(`./src/dataBase/users/${user}.json`, 'utf-8')).data.android_games.forEach((game_in_list => {
                    if (game_in_list.trim() === game_trim) {
                        have_game = true;
                    }
                })); return have_game;
            } else {
                JSON.parse(fs.readFileSync(`./src/dataBase/users/${user}.json`, 'utf-8')).data.android_games.forEach((game_in_list => {
                    if (game_in_list.trim() === `!${game_trim}`) {
                        have_game = true;
                    }
                })); return have_game;
            }

        }


        function game_table() {
            const game_list = get_game_list();
            const android_game_list = get_android_game_list();

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
                    if (check_game_in_list(user, game) || check_game_in_list(user, game, '!')) {
                        game_counts[game]++;
                    }
                }
            }
            game_list.sort((a, b) => game_counts[b] - game_counts[a]);

            let android_game_counts = {};
            for (let game of game_list) {
                if (game !== "empty") {
                    android_game_counts[game] = 0;
                }
            }
            for (let user of users) {
                user = user.replace('.json', '');
                for (let game of game_list) {
                    if (check_android_game_in_list(user, game) || check_android_game_in_list(user, game, '!')) {
                        android_game_counts[game]++;
                    }
                }
            }
            android_game_list.sort((a, b) => android_game_list[b] - android_game_list[a]);




            let end_list = "";
            let users_string = "";
            for (let user of users) {
                let userName = JSON.parse(fs.readFileSync(`./src/dataBase/users/${user}`)).userName;
                users_string += `${userName.charAt(0)}${userName.slice(1)} `;
            }

            //capitalizing first letter of the userName
            users_string = users_string.split(" ").map((name) => name.charAt(0).toUpperCase()).join(" ");
            end_list += `  ${' '.repeat(Math.max(...game_list.map(game => game.length), ...android_game_list.map(game => game.length)))}${users_string}\n`;

            game_list.forEach(game_in_list => {
                users_string = `${game_in_list} `;
                const maxSpaces = Math.max(...game_list.map(game => game.length), ...android_game_list.map(game => game.length)) - game_in_list.length;
                users_string += ' '.repeat(maxSpaces);
                for (let user of users) {
                    user = user.replace('.json', '');
                    if (check_game_in_list(user, game_in_list, '!')) {
                        users_string += `🟨`;
                    } else
                        if (check_game_in_list(user, game_in_list)) {
                            users_string += `✅`;
                        } else {
                            users_string += `🟥`;
                        }
                }
                end_list += `${users_string}\n`;
            });


            let list_names = '';
            for (let user of users) {
                let userName = JSON.parse(fs.readFileSync(`./src/dataBase/users/${user}`)).userName;
                list_names += `**${JSON.parse(fs.readFileSync(`./src/dataBase/users/${user}`)).userName.trim()}**: ${userName.charAt(0)}\n`;
            }

            let android = '';
            let end_list_android = '';
            
            console.log(android_game_list);
            android_game_list.forEach(game_in_list => {
                android = `${game_in_list} `;
                const maxSpaces = Math.max(Math.max(...android_game_list.map(game => game.length), ...game_list.map(game => game.length))) - game_in_list.length;
                android += ' '.repeat(maxSpaces);
                for (let user of users) {
                    user = user.replace('.json', '');
                    if (check_android_game_in_list(user, game_in_list, '!')) {
                        android += `🟨`;
                    } else
                        if (check_android_game_in_list(user, game_in_list)) {
                            android += `✅`;
                        } else {
                            android += `🟥`;
                        }
                }
                end_list_android += `${android}\n`;
            });

            const history_data = JSON.parse(fs.readFileSync(`./src/dataBase/bot.json`)).list_history
            const history = history_data.toString().split(',').join('')
            console.log(history);

            return `${list_names}\n\`\`\`js\n${end_list}\n// Это ПК игры\`\`\`\n\`\`\`js\n${end_list_android}\n// Это Андроид игры\`\`\`\n**Короткая история:**\n\`\`\`diff\n${history}\`\`\` `;
        }


        console.log(`${client.user.tag} активирован!`);
        client.user.setActivity(`👉👌💦`);
        client.user.setStatus('idle');
        let func = require('../functions/test/listFunc.js')
        console.log(func);
        updateList()
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

        async function pickPresence() {
            const option = Math.floor(Math.random() * statusArray.length);

            try {

            } catch (error) {
                console.error(error);
            }
        }
    },
};

