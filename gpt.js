const { Configuration, OpenAIApi } = require('openai');
const configuration = new Configuration({
    apiKey: process.env.OPENAI_API_KEY,
});
const openai = new OpenAIApi(configuration);

const cost = {
    "gpt3p5":{
        "promptTokens" : 0.0015/1000,
        "completionTokens" : 0.0020/1000
    }
}


async function ask({systemRole , userContent} = {}) {

    return openai.createChatCompletion({
        model:"gpt-3.5-turbo",
        messages: [
            {"role": "system", "content": systemRole},
            {"role": "user", "content": userContent}
        ],
    })
    .then(response => {
        //calculating the cost
        const promptTokensCost = response.data.usage.prompt_tokens * cost.gpt3p5.promptTokens;
        const completionTokensCost = response.data.usage.completion_tokens * cost.gpt3p5.completionTokens;
        const totalCost = promptTokensCost + completionTokensCost;
        const costLine = `(cost: USD ${totalCost.toFixed(5)})`;
        return (costLine + `\n` + response.data.choices[0].message.content);
    })
    .catch(error => {
        console.log(error.message);
        return ("Sorry, something in GPT API went wrong. I am unable to process your query.");
    })

}
//Export the "ask" function
module.exports = {
    ask,
};