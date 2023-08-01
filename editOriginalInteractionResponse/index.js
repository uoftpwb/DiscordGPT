const axios = require('axios');
const { askGpt } = require('./gptApiUtils');

exports.handler = async (event) => {
    const { data: { options }, token } = event;
    const userQuery = options[0].value;
    const interactionToken = token;

    console.log("User query:", userQuery);

    const patchURL = `https://discord.com/api/v10/webhooks/${process.env.APP_ID}/${interactionToken}/messages/@original`;

    const defaultModel = "gpt-4";
    const defaultRole = "You are an AI assists with research, enhances conversations, and provides academic writing support. You delivers accurate information, facilitates communication, promotes learning, contributes creatively, and adds an element of fun.";

    const model = defaultModel; // Develop a way to change the model
    const role = defaultRole; // Develop a way to change the role

    try {
        const botResponse = await askGpt(role, userQuery, model);

        console.log("Bot response:", botResponse);

        await axios.patch(patchURL, {
            "content": botResponse,
            "allowed_mentions": { "parse": [] }
        }, {
            headers: {
                "Authorization": `Bot ${process.env.BOT_TOKEN}`,
                "Content-Type": "application/json"
            }
        });
    } catch (error) {
        console.log(error.message);
    }
};
