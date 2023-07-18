// Initialize dotenv
require('dotenv').config();

//import the "ask" function from the "gpt.js" file
const { ask } = require("./gpt.js"); 

// import the logProcess functions
const { updateUserInfo, logMessage,convertMessageFormat, message2messagesInThread } = require('./logProcess');

// Discord.js versions ^13.0 require us to explicitly define client intents
const { Client, GatewayIntentBits, Partials, ThreadChannel } = require('discord.js');
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

let gptRole = "You are a helpful assistant.";

client.on("messageCreate", async function (message) {

    if (message.channel instanceof ThreadChannel) {
        console.log("A thread message is coming!");
        const messagesInThread = await message2messagesInThread(message, limit = 10);
        const convertedMessages = convertMessageFormat(messagesInThread);
        console.log(convertedMessages);
        /* convertedMessages is properly formatted for GPT API call,
        check https://github.com/openai/openai-cookbook/blob/main/examples/How_to_format_inputs_to_ChatGPT_models.ipynb
        for how to use it. */
    };

    if (message.author.bot) return;
    
    const prefix  = "!";
    if (!message.content.startsWith(prefix)) return;

    // Log the message and update the user info
    updateUserInfo(message);
    logMessage(message);
    
    const command = message.content.split(" ", 2)[0];
    const userQuery = message.content.slice(command.length).trim();
    console.log("------------------------");
    console.log("command: ", command);
    console.log("prompt: ", userQuery);

    switch (command){
      
      case "!ask":
            if (!userQuery) {
                message.reply(`Current Role of GPT: ${gptRole}`);
                return;
            } else {
                return handleAskGpt(message, userQuery);
            }
            
      case "!gptRole":
            if (!userQuery) {
                gptRole = "You are a helpful assistant.";
                console.log(`Role of GPT has been reset to: ${gptRole}`);
                message.reply(`Role of GPT has been reset to: ${gptRole}`);
                return;
            } else {
                gptRole = userQuery;
                console.log(`Role of GPT has been updated to: ${gptRole}`);
                message.reply(`Role of GPT has been updated to: ${gptRole}`);
                return;
            }
      
      case "!help":
        return message.reply("Here's how to use my commands:\n\n" +
                             "**!ask [question]**: Ask me a question and I'll respond as best as I can.\n\n" +
                             `**!gptRole [role]**: Change my role. If you don't specify a role, it will be reset to the default: "${gptRole}"\n\n` +
                             "**!help**: Show this help message.");
      
      default:
            return;
    }
});

function handleAskGpt(message, question){
    if (!question) return;
    console.log(`Asking GPT with role: ${gptRole}`);
    
    ask({systemRole: gptRole, userContent: question})
    .then(generatedText => {
        let chunks = splitMessage(text = generatedText);

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
}

function splitMessage(text, limit = 1999) {
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
