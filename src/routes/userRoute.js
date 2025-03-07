const express = require("express");

const jwt = require('jsonwebtoken');

const userController = require("../controllers/userController");
const authMiddleware = require("../Middlewares/middlewareAuth");
const authMiddlewareupd = require('../Middlewares/tokenMiddleware');
const upload = require('../Middlewares/upload');

const router = express.Router();

router.post("/adduser", userController.createUserfunc)

// router.post('/username',userVerification.userVerification)

router.post(
  "/register",
  upload.single("profileImage"),

  async (req, res, next) => {

    next();
  },

  userController.Register
);

router.post("/login", userController.Login)

router.get("/getallusers", authMiddlewareupd.authenticateToken,  userController.getAllUsers)

router.get("/mytickets", authMiddlewareupd.authenticateToken,  userController.getMyTicketsController)

router.get("/getuserbyid/:id", authMiddlewareupd.authenticateToken, userController.getUserById)
 
// router.use(authMiddleware.logSession);

router.post("/updateuser/:id",
  upload.single("profileImage"), 

  authMiddlewareupd.authenticateToken,

  async (req, res, next) => {

    next();
  },

  userController.updateUser
);

router.get("/me",  userController.VerifyUser);

router.delete("/deleteuser/:id",  authMiddlewareupd.authenticateToken, userController.deleteUser);

router.delete("/deleteticket/:id",  authMiddlewareupd.authenticateToken, userController.deleteTicket);

router.get("/getauthuser", authMiddlewareupd.authenticateToken, userController.Getauthuser);

router.get("/getnormaluser", authMiddlewareupd.authenticateToken, userController.Getnormaluser);

router.post("/tickets", authMiddlewareupd.authenticateToken, userController.createTicketController);

router.get("/all_tickets", authMiddlewareupd.authenticateToken, userController.getAllTickets);

router.post("/update_ticket/:id", authMiddlewareupd.authenticateToken, userController.updateTicketStatus);

router.post("/refresh_token", userController.RefreshToken); 

router.post("/logout", authMiddlewareupd.authenticateToken, userController.Logout);


module.exports = router;