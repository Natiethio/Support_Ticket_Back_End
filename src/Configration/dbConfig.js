const mongoose = require("mongoose")

mongoose.connect("mongodb://127.0.0.1:27017/crud_db",{
  // useNewUrlParser: true,
  // useUnifiedTopology: true,
  connectTimeoutMS: 50000,
});

mongoose.connection.on("connected" , () => {
   console.log("connected to MongoDB");
});

mongoose.connection.on("error" , (err) => {
  console.error(`MongoDB connection error: ${err}`)
});


module.exports = mongoose;