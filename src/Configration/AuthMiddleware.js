const User = require("../models/user")
require("dotenv").config();
const jwt = require("jsonwebtoken");

module.exports.userVerification = (req, res) => {
  const token = req.cookies.token
  if (!token) {
    return res.json({ status: true })
  }
  jwt.verify(token, process.env.TOKEN_KEY, async (err, data) => {
    if (err) {
     return res.json({ status: true })
    } else {
      const user = await User.findById(data._id)
      if (user) return res.json({ status: true, user: user.firstName })
      else return res.json({ status: true })
    }
  })
}