const fs = require('fs');
const { Client, GatewayIntentBits, EmbedBuilder, PermissionsBitField, Permissions, MessageManager, Embed, Collection, Colors } = require('discord.js');
const TOKEN = process.env['BOT_TOKEN'];

const client = new Client({
    intents: [GatewayIntentBits.Guilds, GatewayIntentBits.GuildMessages, GatewayIntentBits.MessageContent]
});

client.commands = new Collection();

require('dotenv').config();

const functions = fs.readdirSync("./src/functions").filter(file => file.endsWith(".js"));
const eventFiles = fs.readdirSync("./src/events").filter(file => file.endsWith(".js"));
const commandFolders = fs.readdirSync("./src/commands");



(async () => {
    for (file of functions) {
        require(`./functions/${file}`)(client);
    }
    client.handleEvents(eventFiles, "./src/events");
    client.handleCommands(commandFolders, "./src/commands");
    client.login('MTA2MDc2MTc5MzIwNDU5Njg0Ng.GhwaO5.V7XYlVDUpP3vzEyTA94dE3LziaoE21LewvzwTg')
})();

client.on('interactionCreate', async (interaction) =>{
    if (interaction.customId === 'remove_pc_games') {
        let userr = JSON.parse(fs.readFileSync(`./src/dataBase/users/${interaction.user.username}.json`, 'utf-8'));
        let filteredArray = userr.data.games.filter(x => !interaction.values.includes(x));
        userr.data.games = filteredArray;

        const userData = JSON.stringify(userr);

        await interaction.reply(`Удаленно: \`${interaction.values}\`, теперь у тебя такие игры: \`${filteredArray}\``)
        fs.writeFileSync(`./src/dataBase/users/${interaction.user.username}.json`, userData)
    }
})