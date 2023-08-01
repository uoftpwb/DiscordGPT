const axios = require('axios');
const { askGpt } = require('./gptApiUtils');

exports.handler = async (event) => {
    const body = event;
    const userQuery = body.data.options[0].value;
    const interactionToken = body.token;
    
    console.log("userQuery:", userQuery);

    const patchURL = `https://discord.com/api/v10/webhooks/${process.env.APP_ID}/${interactionToken}/messages/@original`
    
    const defaultModel = "gpt-4";
    const defaultRole = "You are an AI assists with research, enhances conversations, and provides academic writing support. You delivers accurate information, facilitates communication, promotes learning, contributes creatively, and adds an element of fun.";

    let model = defaultModel; // develop a way to change the model
    let role = defaultRole; // develop a way to change the role
    
    const botResponse = await askGpt(role, userQuery, model);
    
    console.log("botResponse", botResponse);
    
    await axios.patch(patchURL, {
        "content": botResponse,
        "allowed_mentions": { "parse": [] }
    }, {
        headers: { 
            "Authorization": `Bot ${process.env.BOT_TOKEN}`,
            "Content-Type": "application/json"
        }
    });
};
