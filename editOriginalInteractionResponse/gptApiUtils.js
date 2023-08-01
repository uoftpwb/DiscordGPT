const { Configuration, OpenAIApi } = require('openai');

const configuration = new Configuration({
    apiKey: process.env.OPENAI_API_KEY,
});

const openai = new OpenAIApi(configuration);

const cost = {
    "gpt-3.5-turbo": {
        "promptTokens": 0.0015 / 1000,
        "completionTokens": 0.0020 / 1000
    },
    "gpt-4": {
        "promptTokens": 0.03 / 1000,
        "completionTokens": 0.06 / 1000
    }
}

function calculateCost(response, model) {
    const { promptTokens, completionTokens } = cost[model];
    const promptTokensCost = response.data.usage.prompt_tokens * promptTokens;
    const completionTokensCost = response.data.usage.completion_tokens * completionTokens;
    const totalCost = promptTokensCost + completionTokensCost;

    return `(cost: USD ${totalCost.toFixed(5)})`;
}

async function askGpt(systemRole, userContent, model, previousMessages = null) {
    let messages = [
        { "role": "system", "content": systemRole },
        { "role": "user", "content": userContent }
    ];

    if (previousMessages) {
        messages = previousMessages;
        console.log("Previous messages: ", messages);
    }

    console.log("Sending prompt to GP")

    try {
        const response = await openai.createChatCompletion({
            model: model,
            messages: messages,
        });

        const costLine = previousMessages ? "" : calculateCost(response, model);
        return `${response.data.choices[0].message.content}\n${costLine}`;
    } catch (error) {
        console.log(error.message);
        return "Sorry, something in GPT API went wrong. I am unable to process your query.";
    }
}

module.exports = {
    askGpt,
};
