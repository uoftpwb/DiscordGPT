const nacl = require('tweetnacl');
const PUBLIC_KEY = process.env.PUBLIC_KEY;

function verifySignature(event) {
  const signature = event.headers['x-signature-ed25519']
  const timestamp = event.headers['x-signature-timestamp'];
  const strBody = event.body; 

  const isVerified = nacl.sign.detached.verify(
    Buffer.from(timestamp + strBody),
    Buffer.from(signature, 'hex'),
    Buffer.from(PUBLIC_KEY, 'hex')
  );

  return isVerified;
}

const invalidRequestSignatureJSON = {
  statusCode: 401,
  body: JSON.stringify('Invalid Request Signature'),
};

module.exports = {verifySignature, invalidRequestSignatureJSON};