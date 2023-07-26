function formatMessages(messageObject) {
    // Initial system message
    let messages = [
        {"role": "system", "content": "You are a helpful assistant."},
    ];
    
    // Convert the Collection to an array and reverse it
    const reversedArray = Array.from(messageObject.values()).reverse();

    // Iterate over each message in the Collection
    reversedArray.forEach((message, id) => {
        // Decide the role based on whether the author is a bot
        const role = message.author.bot ? 'assistant' : 'user';
        
        // Add the message to the array
        messages.push({
            role: role,
            content: message.content
        });
    });
  
    return messages;
}

async function getThreadMessages(message, limit = 10) {
    // fetch the thread associated with the message
    const thread = await message.channel.fetch();
    
    // fetch messages from the thread, limit set to the parameter limit, and disable cache
    const messagesInThread = await thread.messages.fetch({ limit, cache: false });
    
    return messagesInThread;
}

module.exports = {
    formatMessages,
    getThreadMessages
};
