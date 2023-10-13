const {
    createHmac,
  } = require('node:crypto');

const { TextEncoder } = require('util');

  
function base64url(text) {
    return new Buffer.alloc(text.length, text).toString('base64url');
}

// Function to decode Base64url
function base64UrlDecode(base64Url) {
    // Convert base64url to base64 by replacing "-" with "+" and "_" with "/"
    const base64 = base64Url.replace(/-/g, '+').replace(/_/g, '/');
  
    // Add padding if necessary
    const paddedBase64 = base64.padEnd(base64.length + (4 - (base64.length % 4)) % 4, '=');
  
    // Decode the base64 string
    const decodedData = Buffer.from(paddedBase64, 'base64');
  
    return decodedData.toString('utf-8'); // Assuming the data is a UTF-8 encoded string
  }

function toUTF8(text) {
    const textEncoder = new TextEncoder();
    // Encode the string to UTF-8
    const utf8Header = textEncoder.encode(JSON.stringify(text));
    return utf8Header;
}

function jwtTemplate(issuer, expirationTime){
    const header = {"typ":"JWT","alg":"HS256"}

    const claimsSet = {"iss":issuer,"exp":expirationTime}
   
    const signatureSets = JSON.stringify(header) + JSON.stringify('.') + JSON.stringify(claimsSet);

    const hmac = createHmac('sha256', 'a secret');
    const signature = hmac.update(signatureSets).digest('base64url');
    hmac.end();
    return base64url(toUTF8(header)) + ('.') + base64url(JSON.stringify(claimsSet)) + ('.') + signature;

}


module.exports = {
    jwt: jwtTemplate,
    base64UrlDecode: base64UrlDecode,
    base64url: base64url,
    toUTF8: toUTF8
};