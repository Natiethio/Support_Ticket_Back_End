const User = require("../models/user")
const Ticket = require("../models/ticket")
const bcrypt = require('bcrypt');
const jwt = require('jsonwebtoken');
const validator = require('validator');
const cookieParser = require("cookie-parser");
require('dotenv').config();
const session = require('express-session');
const { validate } = require('deep-email-validator');
const { generateSecretToken } = require("../utils/jwtUtils")
const { generateRefreshToken } = require("../utils/jwtUtils")
const fs = require("fs");
const path = require("path");



require('dotenv').config();


class UserService {
  async createUser(name, email, phone) {
    const newUser = new User({ name, email, phone })
    return await newUser.save();
  }

  async getAllUsers() {
    return await User.find();
  }

  async getUserById(userId) {
    return await User.findById(userId)
  }

  async RegisterUser(firstName, lastName, sex, email, phone, password, confirmPassword, profileImage, role) {

    // console.log(firstName, lastName, sex, email)
    const errors = {};

    //Email Policy
    const emailRegex = /^[a-zA-Z0-9._-]+@[a-zA-Z0-9.-]+\.[a-zA-Z]{2,4}$/;

    //Password Policy
    const passwordRegex = {
      length: /.{8,}/,
      number: /\d/,
      uppercase: /[A-Z]/,
      specialChar: /[@#$%^&*!]/,
    };

    // Phone Regex (only numeric)
    const phoneRegex = /^(09|07)\d{8}$/;
    // const createdAt = new Date();

    // Basic validations
    if (!firstName) errors.firstName = "First name is required";
    if (!lastName) errors.lastName = "Last name is required";
    if (!sex) errors.sex = "Sex is required";
    if (!email) errors.email = "Email is required";
    if (!phone) errors.phone = "Phone number is required";
    if (!password) errors.password = "Password is required";
    if (!confirmPassword) errors.confirmPassword = "Password confirmation is required";

    if (!errors.email && !emailRegex.test(email)) {
      errors.email = 'Invalid email format';
    }

    if (!errors.email && !validator.isEmail(email)) {
      errors.email = "Invalid email format";
    }

    if (phone && !phoneRegex.test(phone)) {
      errors.phone = "Invalid phone number";
    } else if (phone && phone.length !== 10) {
      errors.phone = "Phone number must be exactly 10 digits";
    }

    // Role validation
    if (!role) {
      errors.role = 'Role is required';
    } else if (role !== 'user') {
      errors.role = 'Invalid role';
    }

    if (Object.keys(errors).length > 0) {
      throw { validationErrors: errors };
    }

    if (!errors.password && !passwordRegex.length.test(password)) {
      errors.password = "Password must be at least 8 characters long";
    } else if (!passwordRegex.number.test(password)) {
      errors.password = "Password must contain a number";
    } else if (!passwordRegex.uppercase.test(password)) {
      errors.password = "Password must contain at least one uppercase letter";
    } else if (!passwordRegex.specialChar.test(password)) {
      errors.password = "Password must contain at least one special character (e.g., @, #, $)";
    }

    if (Object.keys(errors).length > 0) {
      throw { validationErrors: errors };
    }


    if (password !== confirmPassword) {
      errors.confirmPassword = "Passwords do not match";
    }


    if (!errors.email && await User.findOne({ email })) {
      errors.email = 'Email already exists';
    }


    if (!errors.phone && await User.findOne({ phone })) {
      errors.phone = 'Phone number already exists';
    }

    // Throw errors if any
    if (Object.keys(errors).length > 0) {
      throw { validationErrors: errors };
    }

    const hashedPassword = await bcrypt.hash(password, 12);

    let profileImageName = null;
    if (profileImage) {
      const uniqueSuffix = `${Date.now()}-${Math.round(Math.random())}`;
      profileImageName = `${firstName}_${lastName}_${new Date().toISOString().split('T')[0]}_${uniqueSuffix}${path.extname(profileImage.originalname)}`;

      // Ensure the uploads directory exists
      const uploadPath = path.join(__dirname, "../../uploads");
      if (!fs.existsSync(uploadPath)) {
        fs.mkdirSync(uploadPath, { recursive: true });
      }

      // Save the file
      const fullFilePath = path.join(uploadPath, profileImageName);
      fs.writeFileSync(fullFilePath, profileImage.buffer);
    } else {
      if (sex === "male") {
        profileImageName = "Profile-Default-Male.png";
      }
      else {
        profileImageName = "Profile-Default-Female.png";
      }

    }

    // Save user to the database
    const RegUser = new User({
      firstName,
      lastName,
      sex,
      email,
      phone,
      password: hashedPassword,
      profileImage: profileImageName,
      role,
    });

    return await RegUser.save();
  }

  async LoginUser(email, password) {
    const secretKey = process.env.TOKEN_KEY;
    if (!secretKey) throw new Error("SESSION_SECRET is not defined");

    const errors = {};
    // const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    const emailRegex = /^[a-zA-Z0-9._-]+@[a-zA-Z0-9.-]+\.[a-zA-Z]{2,4}$/;

    // Validate email
    if (!email) {
      errors.email = "Email is required";
    } else if (!emailRegex.test(email)) {
      errors.email = "Invalid email format";
    } else {
      const user = await User.findOne({ email });
      if (!user) {
        errors.email = "User not found";
      }
    }

    // Validate password
    if (!password) {
      errors.password = "Password is required";
    }

    // Stop further execution if validation errors exist
    if (Object.keys(errors).length > 0) {
      throw { validationErrors: errors };
    }


    const user = await User.findOne({ email });

    if (!user) {
      errors.nouser = "No Such User Found";

      if (Object.keys(errors).length > 0) {
        throw { validationErrors: errors };
      }

    }

    const isPasswordValid = await bcrypt.compare(password, user.password);
    if (!isPasswordValid) {
      errors.password = "Passwords do not match";
    }

    if (Object.keys(errors).length > 0) {
      throw { validationErrors: errors };
    }

    const refreshtoken = generateRefreshToken(user)

    const token = generateSecretToken(user)

    return {
      user: user,
      token: token,
      refreshToken: refreshtoken
    };
    // return token;
  }

  async updateUser(userId, updateData, profileImage) {
    const errors = {};
    const emailRegex = /^[a-zA-Z0-9._-]+@[a-zA-Z0-9.-]+\.[a-zA-Z]{2,4}$/;
    const phoneRegex = /^(09|07)\d{8}$/;

    
    const { firstName, lastName, email, phone } = updateData;


    if (!firstName) errors.firstName = "First name is required";
    if (!lastName) errors.lastName = "Last name is required";
    if (!email) errors.email = "Email is required";
    if (!phone) errors.phone = "Phone number is required";


    if (!errors.email && !emailRegex.test(email)) {
      errors.email = 'Invalid email format';
    }

    if (Object.keys(errors).length > 0) {
      throw { validationErrors: errors };
    }

    if (!errors.phone && phone.length !== 10) {
      errors.phone = "Phone number must be 10 digits";
    }

    if (Object.keys(errors).length > 0) {
      throw { validationErrors: errors };
    }

    if (phone && !phoneRegex.test(phone)) {
      errors.phone = "Invalid phone number";
    }

    // Fetch the existing user for comparison
    const existingUser = await User.findById(userId);
    if (!existingUser) {
      throw { message: "User not found" };
    }

    // Check for duplicate email only if the email is being updated
    if (!errors.email && email !== existingUser.email) {
      const emailExists = await User.findOne({ email });
      if (emailExists) {
        errors.email = 'Email already exists';
      }
    }

    // Check for duplicate phone only if the phone is being updated
    if (!errors.phone && phone !== existingUser.phone) {
      const phoneExists = await User.findOne({ phone });
      if (phoneExists) {
        errors.phone = 'Phone number already exists';
      }
    }

    if (Object.keys(errors).length > 0) {
      throw { validationErrors: errors };
    }

    // Handle profile image logic
    let profileImageName = existingUser.profileImage;
    if (profileImage) {
      // Generate a new profile image name
      const uniqueSuffix = `${Date.now()}-${Math.round(Math.random())}`;
      profileImageName = `${firstName}_${lastName}_${new Date().toISOString().split("T")[0]}_${uniqueSuffix}${path.extname(profileImage.originalname)}`;
      console.log(profileImageName)
      // Save the new image to the uploads folder
      const uploadPath = path.join(__dirname, "../../uploads");
      if (!fs.existsSync(uploadPath)) {
        fs.mkdirSync(uploadPath, { recursive: true });
      }
      const fullFilePath = path.join(uploadPath, profileImageName);
      fs.writeFileSync(fullFilePath, profileImage.buffer);

      // Delete the old profile image (if it exists and is not a default image)
      if (existingUser.profileImage && !existingUser.profileImage.startsWith("Profile-Default")) {
        const oldFilePath = path.join(uploadPath, existingUser.profileImage);
        if (fs.existsSync(oldFilePath)) {
          fs.unlinkSync(oldFilePath);
        }
      }
    }

    updateData.profileImage = profileImageName;
    return await User.findByIdAndUpdate(userId, updateData, { new: true });
  }


  async deleteUser(userId) {

    const existingUser = await User.findById(userId);

    if (!existingUser) {
      throw { message: "User not found" };
    }

    const uploadPath = path.join(__dirname, "../../uploads");
    if (!fs.existsSync(uploadPath)) {
      fs.mkdirSync(uploadPath, { recursive: true });
    }

    if (existingUser.profileImage && !existingUser.profileImage.startsWith("Profile-Default")) {
      const oldFilePath = path.join(uploadPath, existingUser.profileImage);
      if (fs.existsSync(oldFilePath)) {
        fs.unlinkSync(oldFilePath);
      }
    }

    return await User.findByIdAndDelete(userId)
  }

  async deleteTicket(ticketId) {

    const existingTicket = await Ticket.findById(ticketId);

    if (!existingTicket) {
      throw { message: "Ticket not found" };
    }

    return await Ticket.findByIdAndDelete(ticketId)
  }

  async createTicket(userId, title, description, status) {

    const errors = {};

    if (!title) {
      errors.title = "Title is required";
    }

    if (!description) {
      errors.description = "Description is required";
    }

    if (!status) {
      errors.status = "Status is required";
    }

    if (Object.keys(errors).length > 0) {
      throw { validationErrors: errors };
    }

    // console.log(userId, title, description, status)

    const ticket = new Ticket({
      user_id: userId,
      title,
      description,
      status
    });

    return await ticket.save();
    // return ticket;
  };

  async getMyTickets (userId) {
    return await Ticket.find({ user_id: userId }).sort({ createdAt: -1 }); 
  };

  async updateTicketStatus (ticketId, status)  {
    return await Ticket.findByIdAndUpdate(ticketId, { status }, { new: true });
  };

  // async getAllTickets (){
  //   // return await Ticket.find().populate("user", "name email profilePicture");
  //   return await Ticket.find();
  // };

  async getAllTickets (){
    try {
        const tickets = await Ticket.find().populate('user_id', 'firstName lastName email profileImage');
        return tickets;
    } catch (error) {
        throw new Error("Error fetching tickets: " + error.message);
    }
};

  
};

module.exports = new UserService();






