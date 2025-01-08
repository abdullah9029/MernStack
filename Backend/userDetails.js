const mongoose = require("mongoose");  

const userSchema = new mongoose.Schema({  
    FirstName: String,  
    LastName: String,  
    Email: { type: String, unique: true },  
    Password: String,  
});  

const User = mongoose.model("registeredUserdb", userSchema);  

module.exports = User;