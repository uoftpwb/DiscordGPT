// Initialize dotenv
require('dotenv').config();

//import the "ask" function from the "gpt.js" file
const { ask } = require("./gpt.js"); 

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
    if (message.author.bot) return;
    const prefix  = "/gpt";
    if (!message.content.startsWith(prefix)) return;

    const userQuery = message.content.slice(prefix.length);
    console.log("prompt: ", userQuery);

    ask(userQuery)
    .then(generatedText => {
        const discordMessageLimit = 1999;
        console.log(generatedText)
        let chunks = splitMessage(generatedText, discordMessageLimit);

        for (let chunk of chunks) {
            message.channel.send(chunk)
            .catch(error => {
                console.log(error.message);
                let errorMessage = "Sorry, something went wrong. I am unable to process your query.";
                if (error.message && error.code) {
                    errorMessage += `\nDetails: ${error.message} [${error.code}].`;
                }
                return message.reply(errorMessage);
            });
        }
    });
 
});

function splitMessage(text, limit) {
    let chunks = [];
    let start = 0;

    while (start < text.length) {

        let end = Math.min(start + limit, text.length);

        // If the end is not at the end of the string, backtrack to the last paragraph end
        if (end != text.length) {
            let lastNewline = text.lastIndexOf('\n', end);
            if (lastNewline > start) {
                end = lastNewline + 1; // Include the newline character in the chunk
            } else { // If there's no newline (single paragraph longer than limit), split by sentence
                let lastPeriod = text.lastIndexOf('.', end);
                let lastQuestion = text.lastIndexOf('?', end);
                let lastExclamation = text.lastIndexOf('!', end);
                let lastEnd = Math.max(lastPeriod, lastQuestion, lastExclamation);
                if (lastEnd > start) {
                    end = lastEnd + 1; // Include the period in the chunk
                } else {// else, we have a single sentence longer than limit, we have to truncate
                    let lastComma = text.lastIndexOf(',', end);
                    if (lastComma > start) {
                        end = lastComma + 1;
                    } else {
                        let lastSpace = text.lastIndexOf(' ', end);
                        if (lastSpace > start) {
                            end = lastSpace;
                        }
                    }
                }
            }
        }

        let chunk = text.substring(start, end);
        chunks.push(chunk);
        start += chunk.length;
    }

    return chunks;
}

// Log In our bot
client.login(process.env.BOT_TOKEN);
