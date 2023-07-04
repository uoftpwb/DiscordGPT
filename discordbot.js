// Initialize dotenv
require('dotenv').config();

// Discord.js versions ^13.0 require us to explicitly define client intents
const { Client, GatewayIntentBits } = require('discord.js');
const client = new Client({ 
    intents: [
        GatewayIntentBits.Guilds,
        GatewayIntentBits.GuildMessages,
        GatewayIntentBits.MessageContent,
    ] });

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
    const prefix  = "/gpt"
    if (!message.content.startsWith("/gpt")) return;
    /*return message.reply(`${message.content}`);*/

    prompt = message.content.slice(prefix.length)

    const userQuery = prompt;
    console.log("prompt: ", userQuery);
    try {
        const response = await openai.createChatCompletion({
            model:"gpt-3.5-turbo",
            messages: [
                {"role": "system", "content": "You are a helpful assistant."},
                {"role": "user", "content": userQuery}
            ],
        });
        const generatedText = response.data.choices[0].message.content
        return message.reply(generatedText);
    } catch (error) {
        if (error.response) {
          console.log(error.response.status);
          console.log(error.response.data);
        } else {
          console.log(error.message);
        }
        return message.reply(
        "Sorry, something went wrong. I am unable to process your query."
        );
    }


});

// Log In our bot
client.login(process.env.BOT_TOKEN);