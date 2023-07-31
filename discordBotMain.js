// Initialize dotenv
require('dotenv').config();

// Import the "askGpt3" function from the "gptApiUtils.js" file
const { askGpt } = require("./gptApiUtils.js");

// Import the message utility functions
const { handleAskGpt, splitMessage } = require("./messageUtils.js");

// Import the log processing functions
const { formatMessages, getThreadMessages } = require('./logProcessingUtils.js');

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

const gptRoleDefault = "You are a AI assists with research, enhances conversations, and provides academic writing support. You delivers accurate information, facilitates communication, promotes learning, contributes creatively, and adds an element of fun.";
let gptRoleDescription = gptRoleDefault;
let threadMessagesLimit = 20;

client.on("messageCreate", async function (message) {

    if (message.author.bot) return;
    
    const prefix  = "!";
    if (!message.content.startsWith(prefix)) return;
    
    const command = message.content.split(" ", 2)[0];
    const userQuery = message.content.slice(command.length).trim();
    console.log("------------------------");
    console.log("command: ", command);
    console.log("prompt: ", userQuery);

    switch (command){
      
        case "!setThreadMessagesLimit":
            if (!userQuery) {
                message.reply(`Current limit for thread messages: ${threadMessagesLimit}`);
                return;
            } else {
                let newLimit = parseInt(userQuery);
                if (isNaN(newLimit) || newLimit < 1) {
                    message.reply(`Invalid value. Please enter a positive integer.`);
                    return;
                }
                threadMessagesLimit = newLimit;
                console.log(`Thread messages limit has been updated to: ${threadMessagesLimit}`);
                message.reply(`Thread messages limit has been updated to: ${threadMessagesLimit}`);
                return;
            }

        case "!ask":
                if (!userQuery) {
                    message.reply(`Current Role of GPT: ${gptRoleDescription}`);
                    return;
                } else {
                    if (message.channel instanceof ThreadChannel) {
                        console.log("A thread message is coming!");
                        const messagesInThread = await getThreadMessages(message, threadMessagesLimit);
                        const previousMessages = formatMessages(messagesInThread);
                        console.log(previousMessages);
                        return handleAskGpt(message, userQuery, gptRoleDescription, previousMessages);
                    } else {
                        return handleAskGpt(message, userQuery, gptRoleDescription);
                    }
                }
            
        case "!gptRole":
                if (!userQuery) {
                    gptRoleDescription = gptRoleDefault;
                    console.log(`Role of GPT has been reset to: ${gptRoleDescription}`);
                    message.reply(`Role of GPT has been reset to: ${gptRoleDescription}`);
                    return;
                } else {
                    gptRoleDescription = userQuery;
                    console.log(`Role of GPT has been updated to: ${gptRoleDescription}`);
                    message.reply(`Role of GPT has been updated to: ${gptRoleDescription}`);
                    return;
                }
      
        case "!help":
            return message.reply("Here's how to use my commands:\n\n" +
                                    "**!ask [question]**: Ask me a question and I'll respond as best as I can.\n\n" +
                                    `**!gptRole [role]**: Change my role. If you don't specify a role, it will be reset to the default: "${gptRoleDescription}"\n\n` +
                                    "**!setThreadMessagesLimit [number]**: Change the number of previous messages in a thread that I consider when responding. If you don't specify a number, it will show the current limit.\n\n" +
                                    "**!help**: Show this help message.");
        
      default:
            return;
    }
});

// Log In our bot
client.login(process.env.BOT_TOKEN);