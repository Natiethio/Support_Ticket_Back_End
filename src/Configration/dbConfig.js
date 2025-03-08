const mongoose = require("mongoose")

require('dotenv').config(); 

const dbURL = process.env.MONGODB_URL;

mongoose.connect(dbURL, { 

});


while (retries = 5) {
  try {
    mongoose.connect(dbURL, {
      useNewUrlParser: true,
      useUnifiedTopology: true,
      connectTimeoutMS: 50000,
    }); 
    console.log("MongoDB Connected");
    break;
  } catch (error) {
    console.error(`MongoDB connection failed. Retries left: ${retries - 1}`);
    retries -= 1;

    if (retries > 0) new Promise((res) => setTimeout(res, 5000));
    else process.exit(1); 
  }
}


mongoose.connection.on("connected" , () => {
   console.log("connected to MongoDB");
});

mongoose.connection.on("error" , (err) => {
  console.error(`MongoDB connection error: ${err}`)
});


module.exports = mongoose;