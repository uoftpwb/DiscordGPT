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

const { Configuration, OpenAIApi } = require('openai');
const configuration = new Configuration({
    apiKey: process.env.OPENAI_API_KEY,
});
const openai = new OpenAIApi(configuration);

client.on("messageCreate", async function (message) {
    if (message.author.bot) return;
    const prefix  = "/gpt";
    if (!message.content.startsWith(prefix)) return;

    prompt = message.content.slice(prefix.length)

    const userQuery = prompt;
    console.log("prompt: ", userQuery);
    prompt = message.content.slice(prefix.length)

    openai.createChatCompletion({
        model:"gpt-3.5-turbo",
        messages: [
            {"role": "system", "content": "You are a helpful assistant."},
            {"role": "user", "content": userQuery}
        ],
    })
    .then(response => {
        //calculating the cost
        const promptTokens = response.data.usage.prompt_tokens
        const completionTokens = response.data.usage.completion_tokens
        const cost = {
            "gpt3p5":{
                "promptTokens" : 0.0015/1000,
                "completionTokens" : 0.0020/1000
            }
        }
        const totalCost = promptTokens * cost.gpt3p5.promptTokens + completionTokens * cost.gpt3p5.completionTokens
        console.log(`cost: USD ${totalCost.toFixed(5)}`)

        let generatedText = `(cost: USD ${totalCost.toFixed(5)})\n` + response.data.choices[0].message.content
        // Check if the generated text is longer than the Discord message limit
        const discordMessageLimit = 1999;
        if (generatedText.length > discordMessageLimit) {
            // If it is, split it into multiple messages and send them one by one
            let start = 0;
            while (start < generatedText.length) {

                let end = Math.min(start + discordMessageLimit, generatedText.length);
                // If the end is not at the end of the string, backtrack to the last paragraph end
                if (end != generatedText.length) {
                    let lastNewline = generatedText.lastIndexOf('\n', end);
                    if (lastNewline > start) {
                        end = lastNewline + 1; // Include the newline character in the chunk
                    } else { // If there's no newline (single paragraph longer than limit), split by sentence
                        let lastPeriod = generatedText.lastIndexOf('.', end);
                        let lastQuestion = generatedText.lastIndexOf('?', end);
                        let lastExclamation = generatedText.lastIndexOf('!', end);
                        let lastEnd = Math.max(lastPeriod, lastQuestion, lastExclamation);
                        if (lastEnd > start) {
                            end = lastEnd + 1; // Include the period in the chunk
                        } else {// else, we have a single sentence longer than limit, we have to truncate
                            let lastComma = generatedText.lastIndexOf(',', end);
                            if (lastComma > start) {
                                end = lastComma + 1;
                            } else {
                                let lastSpace = generatedText.lastIndexOf(' ', end);
                                if (lastSpace > start) {
                                    end = lastSpace;
                                }
                            }
                        }
                    }
                }
                
                let chunk = generatedText.substring(start, end);

                message.channel.send(chunk)
                .catch(error => {
                    console.log(error.message);
                    let errorMessage = "Sorry, something went wrong. I am unable to process your query.";
                    if (error.message && error.code) {
                        errorMessage += `\nDetails: ${error.message} [${error.code}].`;
                    }
                    return message.reply(errorMessage);
                }
                );

                start += chunk.length;
            }
        } else {
            // If it isn't, just send the message as is
            return message.reply(generatedText)
            .catch(error => {
                console.log(error.message);
                let errorMessage = "Sorry, something went wrong. I am unable to process your query.";
                if (error.message && error.code) {
                    errorMessage += `\nDetails: ${error.message} [${error.code}].`;
                }
                return message.reply(errorMessage);
            }
            );
        }
    })
    .catch(error => {
        console.log(error.message);
        return message.reply("Sorry, something in GPT API went wrong. I am unable to process your query.");
    });
});

// Log In our bot
client.login(process.env.BOT_TOKEN);
