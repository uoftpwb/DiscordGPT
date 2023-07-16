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


async function ask(userQuery) {

    openai.createChatCompletion({
        model:"gpt-3.5-turbo",
        messages: [
            {"role": "system", "content": "You are a helpful assistant."},
            {"role": "user", "content": userQuery}
        ],
    })
    .then(response => {
        //calculating the cost
        const promptTokensCost = response.data.usage.prompt_tokens * cost.gpt3p5.promptTokens
        const completionTokensCost = response.data.usage.completion_tokens * cost.gpt3p5.completionTokens
        const totalCost = promptTokensCost + completionTokensCost
        const costLine = `(cost: USD ${totalCost.toFixed(5)})`

        return (costLine + `\n` + response.data.choices[0].message.content)

        generatedText = `(cost: USD ${totalCost.toFixed(5)})\n` + response.data.choices[0].message.content
        


    const response = await openai.createCompletion({
        model: "text-davinci-002",
        prompt,
        temperature: 0.7,
        max_tokens: 256,
        top_p: 1,
        frequency_penalty: 0,
        presence_penalty: 0,
    });
    const answer = response.data.choices[0].text;
    return answer;
}
//Export the "ask" function
module.exports = {
    ask,
};