const {Foo, Ask} = require('./commands');

function handleCommand(body) {
  switch (body.data.name) {
    
    case 'foo':
      return Foo();

    case 'ask':
        return Ask(body);
        
    default:
        return {
            statusCode: 404  // If no handler implemented for Discord's request
        }
    }
}

module.exports = {handleCommand};