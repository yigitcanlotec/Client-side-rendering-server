const {
    createHmac,
  } = require('node:crypto');

const { TextEncoder } = require('util');

  
function base64url(text) {
    return new Buffer.alloc(text.length, text).toString('base64url');
}


function jwtTemplate(issuer, expirationTime){
    const header = {"typ":"JWT","alg":"HS256"}

    const claimsSet = {"iss":issuer,"exp":expirationTime}
    
    const signatureSets = JSON.stringify(header) + JSON.stringify('.') + JSON.stringify(claimsSet);

    const hmac = createHmac('sha256', 'a secret');
    const signature = hmac.update(signatureSets).digest('base64url');
    // console.log(signature);
    hmac.end();

    const textEncoder = new TextEncoder();
    // Encode the string to UTF-8
    const utf8Header = textEncoder.encode(header);
   
    return base64url(utf8Header) + ('.') + base64url(JSON.stringify(claimsSet)) + ('.') + signature;

}


module.exports = jwtTemplate;