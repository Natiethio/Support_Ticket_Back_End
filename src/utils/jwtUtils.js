const jwt = require('jsonwebtoken');
require('dotenv').config();
const cookieParser = require('cookie-parser');
const TOKEN_KEY  = process.env.TOKEN_KEY;
const REFRESH_TOKEN  = process.env.REFRESH_TOKEN;
const { secreteKey } = require("../Configration/jwtConfig")

const generateSecretToken = (user) => {
  const payload = {
    userId: user._id,
    firstName:user.firstName,
    lastName:user.lastName,
    email: user.email,
    sex:user.sex,
    role:user.role,
    phone: user.phone,
    profileImage: user.profileImage,
  };

  const accesstoken = jwt.sign(payload, TOKEN_KEY, {
    expiresIn: '1h',
  });

  return {
    accessToken: accesstoken, 
  }
};

const generateRefreshToken = (user) => {  
  const payload = {
    userId: user._id,
    firstName:user.firstName,
    lastName:user.lastName,
    email: user.email,
    sex:user.sex,
    role:user.role,
    phone: user.phone,
    profileImage: user.profileImage,
  };

  const refreshtoken = jwt.sign(payload, REFRESH_TOKEN, {
    expiresIn: '3h',
  });

  return {
    refreshToken: refreshtoken,
  }
};

const verifytoken = (token)=>{
 return jwt.verify(token, TOKEN_KEY)
}

module.exports = { generateSecretToken, generateRefreshToken, verifytoken }
