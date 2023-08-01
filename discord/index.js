const {verifySignature, invalidRequestSignatureJSON} = require('./verifySignature');
const {Ping} = require('./commands');
const {handleCommand} = require('./handleCommands');

exports.handler = async (event) => {
  
  if (!verifySignature(event)) {
    return invalidRequestSignatureJSON;
  }

  const body = JSON.parse(event.body)

  /* body.type can be one of the following:
    1: A Ping
    2: An Application Command (like a slash command)
    3: A Message Component interaction (like a button or select menu)
  */

  switch (body.type) {
    case 1: return Ping(body);
    case 2: return handleCommand(body);
    
    default:
      return {
    statusCode: 404  // If no handler implemented for Discord's request
    }
  }
};