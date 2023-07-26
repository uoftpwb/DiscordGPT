const { askGpt3 } = require("./gpt3ApiUtils.js");

function handleAskGpt(message, question, gptRoleDescription, previousMessages = null){
    if (!question) return;
    console.log(`Asking GPT with role: ${gptRoleDescription}`);
    
    let gptInput = {systemRole: gptRoleDescription, userContent: question};
    if (previousMessages) {
        gptInput.previousMessages = previousMessages;
    }
    
    askGpt3(gptInput).then(generatedText => {
        let chunks = splitMessage(text = generatedText);

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
}

function splitMessage(text, limit = 1999) {
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

module.exports = {
    handleAskGpt,
    splitMessage
};
