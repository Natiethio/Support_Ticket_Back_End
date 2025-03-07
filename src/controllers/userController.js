const userService = require("../Services/userService");
const UserService = require("../Services/userService");
const { createSecretToken } = require("../Services/SecretToken");
const cookieParser = require("cookie-parser");
const secretKey = process.env.TOKEN_KEY;
require('dotenv').config();
const session = require('express-session');
const fs = require("fs");
const path = require("path");
const jwt = require('jsonwebtoken');

class userController {
  async createUserfunc(req, res) {
    try {
      const { name, email, phone } = req.body;
      const saveuser = await UserService.createUser(name, email, phone);
      res.json(saveuser);
    }
    catch (error) {
      // if (error.validationErrors) {
      //   // Send validation errors to the frontend
      //   return res.status(400).json({ errors: error.validationErrors });
      // }
      res.status(500).json({ error: error.message })
    }
  }
  async getAllUsers(req, res) {
    try {
      const allusers = await UserService.getAllUsers();
      res.json(allusers);
    }
    catch (error) {
      res.status(500).json({ error: error.message })
    }
  }
  async getUserById(req, res) {
    const userId = req.params.id

    // if (!mongoose.Types.ObjectId.isValid(userId)) {
    //   return res.status(400).json({ error: "Invalid user ID" });
    // }

    try {
      const user = await UserService.getUserById(userId);
      if (!user) {
        return res.status(404).json({ error: "User not found" })
      }
      res.json(user);
    }
    catch (error) {
      res.status(500).json({ error: error.message })
    }
  }

  async updateUser(req, res) {

    const userId = req.params.id
    const updateData = req.body;
    const profileImage = req.file;

    try {
      const updateduser = await UserService.updateUser(userId, updateData, profileImage)

      if (!updateduser)
        return res.status(404).json({ error: "User not found" })
      res.json(updateduser);
    }

    catch (error) {
      if (error.validationErrors) {
        return res.status(400).json({ errors: error.validationErrors });
      }
      res.status(500).json({ error: error.message })
    }
  }

  async deleteUser(req, res) {
    const userId = req.params.id
    try {
      const deleteduser = await UserService.deleteUser(userId)
      if (!deleteduser)
        return res.status(404).json({ error: "User not found" })
      res.json({ message: "User deleted succesffully", user: deleteduser });
    }
    catch (error) {
      res.status(500).json({ error: error.message })
    }
  }

  async deleteTicket(req, res) {
    const ticketId = req.params.id
    try {
      const deletedticket = await UserService.deleteTicket(ticketId)
      if (!deletedticket)
        return res.status(404).json({ error: "Ticket not found" })
      res.json({ message: "Ticket deleted succesffully", ticket: deletedticket });
    }

    catch (error) {
      res.status(500).json({ error: error.message })
    }
  }

  async Register(req, res, next) {
    try {
      const { firstName, lastName, sex, email, phone, password, confirmPassword, role } = req.body;

      const profileImage = req.file || null; // Save the file name

      const newuser = await UserService.RegisterUser(firstName, lastName, sex, email, phone, password, confirmPassword, profileImage, role)


      // req.session.userId = newuser._id; // Store user ID in session // Assign user data to new session
      res.status(200).json({ message: "User signed up successfully", success: true, newuser });

    }
    catch (error) {
      console.log(error)
      if (error.validationErrors) {
        return res.status(400).json({ errors: error.validationErrors });
      }
      res.status(500).json({ error: error.message })
    }
  }

  async Login(req, res) {
    try {
      const { email, password } = req.body;
      const loginuser = await UserService.LoginUser(email, password)

      if (!loginuser) {
        return res.status(401).json({ message: "Invalid Credentials" });
      }
      const token = loginuser.token.accessToken

      const refreshtoken = loginuser.refreshToken.refreshToken

      res.cookie("token_auth", token, {
        withCredentials: true,
        httpOnly: true,
        secure: true,
        sameSite: "None",
        maxAge: 0.5 * 60 * 60 * 1000,  // 30 minute
      });

      res.cookie("refreshtoken", refreshtoken, {
        withCredentials: true,
        httpOnly: true, // https
        secure: true,
        sameSite: "None",
        maxAge: 24 * 60 * 60 * 1000, // 1 day
      });


      res.status(200).json({ message: "User logged in successfully", success: true, user: loginuser.user, token, refreshtoken });
    }
    catch (error) {
      if (error.validationErrors) {
        return res.status(400).json({ errors: error.validationErrors });
      }
      console.log(error)
      res.status(500).json({ error: error.message })
    }
  }

  async VerifyUser(req, res) {
    const token = req.cookies.token_auth;
    // console.log("verify Token", token)
    if (!token) {
      return res.json({ message: "Unauthorized. No token provided." });
    }

    jwt.verify(token, secretKey, (err, user) => {
      if (err) {
        return res.status(403).json({ message: "Forbidden. Invalid token." });
      }

      const role = user.role

      // console.log(user)

      res.status(200).json({ message: "User verified in successfully", success: true, user: user, token: token, role: role });

    });
  }

  async Getauthuser(req, res, next) {
    // console.log(authtoken)
    try {
      const user = req.user;
      if (!user) {
        return res.status(404).json({ message: "User not found" });
      }

      res.status(200).json({
        message: "Authenticated user fetched successfully",
        success: true,
        loginuser: user,
      });
    }
    catch (error) {
      console.log(error)
      res.status(500).json({ error: error.message })
    }
  }

  async Getnormaluser(req, res) {
    try {
      const user = req.user;
      if (!user) {
        return res.status(404).json({ message: "User not found" });
      }
      const userId = user.userId
      // console.log(userId)
      const loginuser = await UserService.getUserById(userId);
      res.status(200).json({
        message: "Authenticated user fetched successfully",
        success: true,
        loginuser: loginuser,
      });
    }
    catch (error) {
      console.log(error)
      res.status(500).json({ error: error.message })
    }
  }


  async RefreshToken(req, res) {
    const refreshToken = req.cookies.refreshtoken;

    if (!refreshToken) {
      return res.status(401).json({ message: "Unauthorized. No refresh token provided." });
    }

    try {

      const decoded = jwt.verify(refreshToken, process.env.REFRESH_TOKEN);

      const newAccessToken = jwt.sign(
        { userId: decoded.userId, firstName: decoded.firstName, lastName: decoded.lastName, email: decoded.email, phone: decoded.phone, profileImage: decoded.profileImage, role: decoded.role },
        process.env.TOKEN_KEY,
        { expiresIn: '15m' } // 15 minutes
      );

      res.cookie("token_auth", newAccessToken, {
        httpOnly: true,
        secure: true,
        sameSite: "None",
        maxAge: 15 * 60 * 1000, // 15 minutes
      });

      res.status(200).json({ message: "Access token refreshed successfully." });
    } catch (error) {
      console.error("Refresh token error:", error);

      // Clear the refresh token (if invalid or expired)

      res.clearCookie("token_auth", {
        httpOnly: true,
        secure: true,
        sameSite: "None",
      });

      res.clearCookie('refreshtoken', {
        httpOnly: true,
        secure: true,
        sameSite: "None",
      });


      // Respond with an error
      res.status(403).json({ message: "Forbidden. Invalid or expired refresh token." });
    }
  }


  async Logout(req, res) {
    res.clearCookie("token_auth", {
      httpOnly: true,
      secure: true,
      sameSite: "None",
    });

    res.clearCookie("refreshtoken", {
      httpOnly: true,
      secure: true,
      sameSite: "None",
    });

    res.status(200).json({ message: "Logged out successfully" });
  }

  async createTicketController(req, res) {
    try {
      const { title, description, status } = req.body;
      const userId = req.user.userId;

      // console.log(userId, title, description, status)

      const ticket = await UserService.createTicket(userId, title, description, status);

      res.status(201).json({
        message: "Ticket created successfully",
        ticket,
      });
    }
    catch (error) {
      if (error.validationErrors) {
        return res.status(400).json({ errors: error.validationErrors });
      }
      console.log(error)
      res.status(500).json({ error: error.message })
    }
  };

  async getMyTicketsController(req, res) {

    try {
      const userId = req.user.userId;

      const tickets = await UserService.getMyTickets(userId);

      res.status(200).json({
        message: "Tickets fetched successfully",
        tickets,
      });
    } catch (error) {
      res.status(400).json({ error: error.message });
    }
  };

  async getAllTickets(req, res) {
    try {
      const tickets = await userService.getAllTickets();
      res.status(200).json(tickets);
    } catch (error) {
      res.status(500).json({ message: error.message });
    }
  };


  async updateTicketStatus(req, res) {
    try {
      const ticketId  = req.params.id;
      const { status } = req.body;

      if (!["Open", "In_Progress", "Closed"].includes(status)) {
        return res.status(400).json({ message: "Invalid status value" });
      }

      const updatedTicket = await UserService.updateTicketStatus(ticketId, status);

      res.json({ message: "Ticket updated successfully", updatedTicket });
    } catch (error) {
      res.status(500).json({ message: "Error updating ticket", error });
    }
  };

};



module.exports = new userController();