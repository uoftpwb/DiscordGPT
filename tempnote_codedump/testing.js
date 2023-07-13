// Initialize dotenv
require('dotenv').config();

// Discord.js versions ^13.0 require us to explicitly define client intents
const { Client, GatewayIntentBits, Partials } = require('discord.js');
const client = new Client({ 
    intents: [
        GatewayIntentBits.Guilds,
        GatewayIntentBits.GuildMessages,
        GatewayIntentBits.DirectMessages,
        GatewayIntentBits.MessageContent,
    ],
    partials: [
        Partials.Channel,
        Partials.Message
    ]});

client.on('ready', () => {
 console.log(`Logged in as ${client.user.tag}!`);
});


client.on("messageCreate", async function (message) {
    console.log(message)
});

// Log In our bot
client.login(process.env.BOT_TOKEN);