const express = require("express");
const bodyParser = require("body-parser");
const cors = require("cors");
const cookieParser = require("cookie-parser");
const session = require('express-session'); 
require("dotenv").config();
const path = require("path");

const userRoutes = require("./src/routes/userRoute");


const app = express();
const PORT = process.env.PORT || 5001;   
// const RedisStore = require('connect-redis')(   session);
// const redis = require('redis');  


const corsOptions = {
  origin: process.env.FRONTEND_URL,
  credentials: true,
  methods: ['GET', 'POST', 'PUT', 'DELETE'],
  allowedHeaders: ["Content-Type", "Authorization"], // Allow these headers
};

// Middleware
app.use(cors(corsOptions));
app.use(bodyParser.json());
app.use(cookieParser());


app.use('/uploads', express.static(path.join(__dirname, 'uploads')));

// app.use(
//   session({   

//     // store: new RedisStore({ client: redisClient }),
//     secret: process.env.SESSION_SECRET,
//     resave: false,
//     saveUninitialized: false,
//     cookie: { maxAge: 1000 * 60 * 30 }, // 30 minutes
//     store: new session.MemoryStore({ // Use a proper store in production (e.g., Redis)
//       checkExpirationInterval: 1000 * 60 * 5, // Clear expired sessions every 5 minutes
//       expiration: 1000 * 60 * 30, // Sessions expire after 30 minutes
//   }),
//   })
// );

app.use("/api/user", userRoutes);  //base route is /api/user in UserRoutes it will have a child route to to have the controller function 


app.listen(PORT, () => {
  console.log(`Server is running on port: ${PORT}`);
});





