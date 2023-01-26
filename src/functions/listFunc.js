const fs = require('fs');
const dotenv = require('dotenv');
dotenv.config();

const { Events, Client, ActionRowBuilder, ButtonBuilder, GatewayIntentBits, EmbedBuilder, PermissionsBitField, Permissions, MessageManager, Embed, Collection, Colors, Message } = require('discord.js');

const client = new Client({
    intents: [GatewayIntentBits.Guilds, GatewayIntentBits.GuildMessages, GatewayIntentBits.MessageContent]
});


    
function get_game_list() {
    const users_files_name = fs.readdirSync('./src/dataBase/users');
    let uniqueGames = new Set();

    for (let user_file_name of users_files_name) {
        const fileData = JSON.parse(fs.readFileSync(`./src/dataBase/users/${user_file_name}`, 'utf8')).data.games;
        if (fileData.length === 0) {
            uniqueGames.add("Мать ");
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
            uniqueGames.add("Мать ");
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

    //capitalizing first letter of the userName
    users_string = users_string.split(" ").map((name) => name.charAt(0).toUpperCase()).join("👇🏿");
    end_list += `Users ${' '.repeat(Math.max(...game_list.map(game => game.length), ...android_game_list.map(game => game.length))-5)}${users_string}\n`
    game_list.forEach(game_in_list => {
        users_string = `${game_in_list} `;
        const maxSpaces = Math.max(...game_list.map(game => game.length), ...android_game_list.map(game => game.length)) - game_in_list.length;
        users_string += ' '.repeat(maxSpaces);
        for (let user of users) {
            user = user.replace('.json', '');
            if (check_game_in_list(user, game_in_list, '!')) {
                users_string += `🟨 `;
            } else
                if (check_game_in_list(user, game_in_list)) {
                    users_string += `🟩 `;
                } else {
                    users_string += `🟥 `;
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
    
    android_game_list.forEach(game_in_list => {
        android = `${game_in_list} `;
        const maxSpaces = Math.max(Math.max(...android_game_list.map(game => game.length), ...game_list.map(game => game.length))) - game_in_list.length;
        android += ' '.repeat(maxSpaces);
        for (let user of users) {
            user = user.replace('.json', '');
            if (check_android_game_in_list(user, game_in_list, '!')) {
                android += `🟨 `;
            } else
                if (check_android_game_in_list(user, game_in_list)) {
                    android += `🟩 `;
                }  else {
                    android += `🟥 `;
                }
        }
        end_list_android += `${android}\n`;
    });

    const history_data = JSON.parse(fs.readFileSync(`./src/dataBase/bot.json`)).list_history
    const history = history_data.toString().split(',').join('')

    return `${list_names}\n**💻 ПК игры:**\n\`\`\`js\n${end_list}\`\`\`\n**<:android:1065337434809831495> Андроид игры:**\n\`\`\`js\n${end_list_android}\`\`\`\n**Короткая история:**\n\`\`\`diff\n${history}\`\`\` `;
}
module.exports = { game_table, get_game_list, check_game_in_list }