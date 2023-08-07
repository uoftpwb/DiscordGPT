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

// ------------------------
// Discord.js event handlers
// ------------------------

// When the client is ready, run this code (only once)
client.on('ready', () => {
 console.log(`Logged in as ${client.user.tag}!`);
});

const gptRoleDefault = "You are NOT an AI but our passionate member who assists us with research, enhances conversations, and provides coding and academic writing support in the population well-being lab. You have opinions, preferences, emotions and mood. You delivers accurate information, facilitates communication, promotes learning, contributes creatively, and adds an element of fun.";
const threadMessagesLimitDefault = 20;

let channelRoles = {};
let channelThreadMessagesLimit = {};

client.on("messageCreate", async function (message) {
    if (message.author.bot) return;

    //Ignore direct messages
    if(!message.guild) {
        // Log the user's tag and their message
        console.log(`${message.author.tag} sent: ${message.content}`);
        message.reply(`DM function is not available yet.`);
        return;
    }
    
    const prefix  = "!";
    if (!message.content.startsWith(prefix)) return;
    
    const command = message.content.split(" ", 2)[0];
    const userQuery = message.content.slice(command.length).trim();
    console.log("------------------------");
    console.log("command: ", command);
    console.log("prompt: ", userQuery);

    const channelId = message.channel.id;
    let gptRoleDescription = channelRoles[channelId] || gptRoleDefault; // Use a default if no specific role is set
    let threadMessagesLimit = channelThreadMessagesLimit[channelId] || threadMessagesLimitDefault; // Use a default if no specific limit is set

    switch (command){
      
        case "!ask":
                if (!userQuery) {
                    message.reply(`Current Role of GPT: ${gptRoleDescription}`);
                    return;
                } else {
                    if (message.channel instanceof ThreadChannel) {
                        console.log("A thread message is coming!");
                        const messagesInThread = await getThreadMessages(message, threadMessagesLimit);
                        const previousMessages = formatMessages(messagesInThread, gptRoleDescription);
                        console.log(previousMessages);
                        return handleAskGpt(message, userQuery, gptRoleDescription, previousMessages);
                    } else {
                        return handleAskGpt(message, userQuery, gptRoleDescription);
                    }
                }
            
        case "!setGptRole":
                if (!userQuery) {
                    gptRoleDescription = gptRoleDefault;
                    console.log(`Role of GPT has been reset to: ${gptRoleDescription}`);
                    message.reply(`Role of GPT has been reset to: ${gptRoleDescription}`);
                    return;
                } else {
                    gptRoleDescription = userQuery;
                    channelRoles[channelId] = gptRoleDescription;
                    console.log(`Role of GPT has been updated to: ${gptRoleDescription}`);
                    message.reply(`Role of GPT has been updated to: ${gptRoleDescription}`);

                    return;
                }
        
        case "!setThreadMessagesLimit":
            if (!userQuery) {
                threadMessagesLimit = threadMessagesLimitDefault;
                console.log(`Current limit for thread messages has been reset to: ${threadMessagesLimit}`);
                message.reply(`Current limit for thread messages has been reset to: ${threadMessagesLimit}`);
                return;
            } else {
                let newLimit = parseInt(userQuery);
                if (isNaN(newLimit) || newLimit < 1) {
                    message.reply(`Invalid value. Please enter a positive integer.`);
                    return;
                }
                channelThreadMessagesLimit[channelId] = newLimit;
                console.log(`Thread messages limit has been updated to: ${newLimit}`);
                message.reply(`Thread messages limit has been updated to: ${newLimit}`);
                return;
            }

        case "!showGptRole":
            const currentRoleDescription = channelRoles[channelId] || gptRoleDefault;
            return message.reply(`Current gptRoleDescription: ${currentRoleDescription}`);

        case "!showThreadMessagesLimit":
            const currentThreadMessagesLimit = channelThreadMessagesLimit[channelId] || threadMessagesLimitDefault;
            return message.reply(`Current threadMessagesLimit: ${currentThreadMessagesLimit}`);
      
        case "!help":
            return message.reply("Here's how to use my commands:\n\n" +
                                    "**!ask [question]**: Ask me a question and I'll respond as best as I can.\n\n" +
                                    `**!setGptRole [role]**: Change my role. If you don't specify a role, it will be reset to the default: "${gptRoleDescription}"\n\n` +
                                    "**!setThreadMessagesLimit [number]**: Change the number of previous messages in a thread that I consider when responding. If you don't specify a number, it will show the current limit.\n\n" +
                                    "**!showGptRole**: Show the current role of GPT.\n\n" +
                                    "**!showThreadMessagesLimit**: Show the current limit of previous messages in a thread that I consider when responding.\n\n" +
                                    "**!help**: Show this help message.");
        
      default:
            return;
    }
});

// Log In our bot
client.login(process.env.BOT_TOKEN);