const sqlite3 = require('sqlite3').verbose();

// Open a database handle
let db = new sqlite3.Database('./logs.db', sqlite3.OPEN_READWRITE, (err) => {
    if (err) {
        return console.error(err.message);
    }
    console.log('Connected to the logs.db SQlite database.');
});

function updateUserInfo(message) {
    if (message.author.bot) return; // Ignore messages from bots

    let userId = message.author.id;
    let userName = message.author.username;

    // Query for the user
    db.get('SELECT userName FROM usersInfo WHERE userId = ?', [userId], (err, row) => {
        if (err) {
            return console.error(err.message);
        }
        // If the user exists in the database
        if (row) {
            if (row.userName !== userName) {
                // If username is different, update it
                db.run('UPDATE usersInfo SET userName = ? WHERE userId = ?', [userName, userId], (err) => {
                    if (err) {
                        return console.error(err.message);
                    }
                    console.log(`Row(s) updated: ${this.changes}`);
                });
            }
        } else {
            // If the user doesn't exist in the database, insert them
            db.run('INSERT INTO usersInfo(userId, userName) VALUES(?, ?)', [userId, userName], (err) => {
                if (err) {
                    return console.error(err.message);
                }
                console.log(`A row has been inserted with rowid ${this.lastID}`);
            });
        }
    });
}

function logMessage(message, sessionNum = null) {
    if (message.author.bot) return; // Ignore messages from bots

    let userId = message.author.id;
    let messageText = message.content;

    // Insert the message into the messageLogs table
    db.run('INSERT INTO messageLogs(sessionNum, userId, messageText) VALUES(?, ?, ?)', [sessionNum, userId, messageText], (err) => {
        if (err) {
            return console.error(err.message);
        }
        console.log(`A row has been inserted with rowid ${this.lastID}`);
    });
}

function convertMessageFormat(messageObject) {
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

async function message2messagesInThread(message, limit = 10) {
    // fetch the thread associated with the message
    const thread = await message.channel.fetch();
    
    // fetch messages from the thread, limit set to the parameter limit, and disable cache
    const messagesInThread = await thread.messages.fetch({ limit, cache: false });
    
    return messagesInThread;
}

module.exports = {
    updateUserInfo,
    logMessage,
    convertMessageFormat,
    message2messagesInThread
};
