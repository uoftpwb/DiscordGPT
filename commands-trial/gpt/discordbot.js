// Initialize dotenv
require('dotenv').config();

//import the "ask" function from the "gpt.js" file
const { ask } = require("./gpt.js"); 

const fs = require('node:fs');
const path = require('node:path');

// Discord.js versions ^13.0 require us to explicitly define client intents
const { Client, Collection, Events, GatewayIntentBits, Partials, REST, Routes } = require('discord.js');
const { clientId, token } = require('./config.json');
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
    ]
});

client.on('ready', () => {
 console.log(`Logged in as ${client.user.tag}!`);
});

client.on("messageCreate", async function (message) {
    if (message.author.bot) return;
    const prefix  = "/";
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

// slash commands
client.commands = new Collection();
const commands = [];
// Grab all the command files from the commands directory you created earlier
const foldersPath = path.join(__dirname, 'commands');
const commandFolders = fs.readdirSync(foldersPath);

for (const folder of commandFolders) {
	// Grab all the command files from the commands directory you created earlier
	const commandsPath = path.join(foldersPath, folder);
	const commandFiles = fs.readdirSync(commandsPath).filter(file => file.endsWith('.js'));
	// Grab the SlashCommandBuilder#toJSON() output of each command's data for deployment
	for (const file of commandFiles) {
		const filePath = path.join(commandsPath, file);
		const command = require(filePath);
		if ('data' in command && 'execute' in command) {
			commands.push(command.data.toJSON());
            client.commands.set(command.data.name, command); 
		} else {
			console.log(`[WARNING] The command at ${filePath} is missing a required "data" or "execute" property.`);
		}
	}
}

// Construct and prepare an instance of the REST module
const rest = new REST().setToken(token);

// and deploy your commands!
(async () => {
	try {
		console.log(`Started refreshing ${commands.length} application (/) commands.`);

		// The put method is used to fully refresh all commands in the guild with the current set
		const data = await rest.put(
            Routes.applicationCommands(clientId),
            { body: commands },
        );

		console.log(`Successfully reloaded ${data.length} application (/) commands.`);
	} catch (error) {
		// And of course, make sure you catch and log any errors!
		console.error(error);
	}
})();


client.on(Events.InteractionCreate, async interaction => {
	if (!interaction.isChatInputCommand()) return;

	const command = interaction.client.commands.get(interaction.commandName);

	if (!command) {
		console.error(`No command matching ${interaction.commandName} was found.`);
		return;
	}

	try {
		await command.execute(interaction);
	} catch (error) {
		console.error(error);
		if (interaction.replied || interaction.deferred) {
			await interaction.followUp({ content: 'There was an error while executing this command!', ephemeral: true });
		} else {
			await interaction.reply({ content: 'There was an error while executing this command!', ephemeral: true });
		}
	}
});


// Log In our bot
client.login(process.env.BOT_TOKEN);
