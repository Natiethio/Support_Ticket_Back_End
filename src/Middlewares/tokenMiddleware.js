const jwt = require('jsonwebtoken');
require('dotenv').config();
const secretKey = process.env.TOKEN_KEY;
// const secretKey = require("../Configration/jwtConfig")

const tokenMiddleware = {
  authenticateToken: (req, res, next) => {
    const authtoken = req.cookies.token_auth

    if (!authtoken) {
      return res.status(401).json({ message: "Unauthorized. No token provided." });
    }

    jwt.verify(authtoken, secretKey, (err, user) => {

      if (err) {
        return res.status(403).json({ message: "Forbidden. Invalid token." });
      } 

      req.user = user;
      next();
    });
  },

  authorizeRoles: (...roles) => (req, res, next) => {
    if (!roles.includes(req.user.role.role)) {
      return res.status(403).json({ message: "Forbidden. You do not have access." });
    }
    next();
  }
};

module.exports = tokenMiddleware;
