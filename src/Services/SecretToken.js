require("dotenv").config();

const jwt = require("jsonwebtoken");

module.exports.createSecretToken = (user) => {

  const payload = {
    userId: { id: user._id },
    email: {email: user.email }
};

  return jwt.sign(payload, process.env.TOKEN_KEY, {
    expiresIn:'1h',
  });
};