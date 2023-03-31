const fs = require('fs');
const dotenv = require('dotenv');
const path = require('node:path');
dotenv.config();
const { Events, Client, ActionRowBuilder,ButtonBuilder, GatewayIntentBits, EmbedBuilder, PermissionsBitField, Permissions, MessageManager, Embed, Collection, Colors, Message } = require('discord.js');
const { VoiceConnectionStatus, AudioPlayerStatus } = require('@discordjs/voice');

const { token } = require('./config.json');
const { channel } = require('diagnostics_channel');
const { request } = require('http');
const { time, Console } = require('console');
const { meetEnd_message } = require('./functions/meet');
const client = new Client({
	intents: [GatewayIntentBits.Guilds, GatewayIntentBits.GuildMessages, GatewayIntentBits.MessageContent, GatewayIntentBits.GuildVoiceStates]
});

client.commands = new Collection();

// client.on('threadCreate', (interaction) => {
	// interaction.appliedTags.forEach(tag => {
		// console.log(`tag: `+tag);
	// })
// });

// 

// client.on('ready', (client) => {
	// meetEnd_message(client, '543103577837797386')
// })

const commandsPath = path.join(__dirname, 'commands');
const commandFiles = fs.readdirSync(commandsPath).filter(file => file.endsWith('.js'));
for (const file of commandFiles) {
	const filePath = path.join(commandsPath, file);
	const command = require(filePath);
	// Set a new item in the Collection with the key as the command name and the value as the exported module
	if ('data' in command && 'execute' in command) {
		client.commands.set(command.data.name, command);
	} else {
		console.log(`[WARNING] The command at ${filePath} is missing a required "data" or "execute" property.`);
	}
}


const eventsPath = path.join(__dirname, 'events');
const eventFiles = fs.readdirSync(eventsPath).filter(file => file.endsWith('.js'));
for (const file of eventFiles) {
	const filePath = path.join(eventsPath, file);
	const event = 
	require(filePath);
	if (event.once) {
		client.once(event.name, (...args) => event.execute(...args));
	} else {
		client.on(event.name, (...args) => event.execute(...args));
	}
}

client.login(token)


