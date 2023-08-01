function Ping() {
    return {
      statusCode: 200,
      body: JSON.stringify({ "type": 1 }),
    }
  }

function Foo() {
      return {
        statusCode: 200,
        headers: { 
          "Content-Type": "application/json" 
        },
        body: JSON.stringify({
          "type": 4,
          "data": { "content": "bar" }
        })
      }
  }

const AWS = require('aws-sdk');
const lambda = new AWS.Lambda();

async function Ask(body) {

    const userQuery = body.data.options[0].value;
    console.log("userQuery: ", userQuery);
    
    // Asynchronously invoke the editOriginalInteractionResponse Lambda function
    const functionARN = 'arn:aws:lambda:ap-southeast-2:308866550505:function:editOriginalInteractionResponse'
    
    const invokeParams = {
      FunctionName: functionARN,
      InvocationType: 'Event',
      Payload: JSON.stringify(body)
    };

    // Trigger the invocation and don't wait for it to complete
    const promise = await lambda.invoke(invokeParams).promise();

    // Return the deferred response immediately
    return {
      statusCode: 200,
      headers: {
        "Content-Type": "application/json"
      },
      body: JSON.stringify({
        "type": 5,
      })
    }
  }

module.exports = {Ping, Foo, Ask};
