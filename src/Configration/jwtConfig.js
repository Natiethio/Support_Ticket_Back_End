const crypto = require("crypto")

//Generate a random secrete key

const secreteKey = crypto.randomBytes(32).toString('hex');

module.exports = {
    secreteKey: secreteKey
}