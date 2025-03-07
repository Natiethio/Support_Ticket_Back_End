const express = require('express')
const mongoose = require('mongoose')

const app = express()

mongoose.connect("mongodb://127.0.0.1:27017/crud_db")

const PORT = process.env.PORT || 5000;

const UserSchema = new mongoose.Schema({
    name: String,
    age : Number
})

const UserModel = mongoose.model("users" , UserSchema)

app.get("/getuser", (req,res)=>{
    UserModel.find({}).then(function(users){
        res.json(users)
    }).catch(function(err){
    console.log(err)
   })
})

app.listen(PORT,()=>{
    console.log(`Server is running on port ${PORT}`);
  })