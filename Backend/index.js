const express = require('express');  
const MongoClient = require('mongodb').MongoClient;  
const cors = require("cors");  
require('dotenv').config();  
const mongoose = require("mongoose");  
const bcrypt = require('bcrypt');   

const port = 2000;  
const app = express();  

app.use(cors({  
    origin: '*'  
}));  
app.use(express.json());  

const CONNECTION_STRING = process.env.MonogURL;  
const DATABASE = 'todoAppdb';  
let database;  

async function connectToDatabase() {  
    console.log("Attempting to connect to MongoDB...");  
    try {  
        const client = await MongoClient.connect(CONNECTION_STRING, { useNewUrlParser: true, useUnifiedTopology: true });  
        database = client.db(DATABASE);  
        console.log("MongoDB connected successfully");  
    } catch (error) {  
        console.error("Error connecting to MongoDB:", error);  
    }  
}  

app.listen(port, () => {  
    console.log(`Server is running on port ${port}`);  
    connectToDatabase();  
});  

app.get('/api/todoAppdb/GetNotes', async (req, res) => {  
    try {  
        const result = await database.collection("todoApp").find({}).toArray();  
        res.send(result);  
    } catch (error) {  
        console.error("Error fetching notes:", error);  
        res.status(500).send("Error fetching notes");  
    }  
});  

require("./userDetails");  
const User = mongoose.model("registeredUserdb");  

app.post("/register", async (req, res) => {  
    const { FirstName, LastName, Email, Password } = req.body;  

    try {  
        const hashedPassword = await bcrypt.hash(Password, 10);  
        console.log("Hashed Password:", hashedPassword);  // Debugging the hashed password  

        const newUser = await User.create({  
            FirstName,  
            LastName,  
            Email,  
            Password: hashedPassword,   
        });  
        
        res.status(201).send({   
            status: "ok",   
            message: "User registered successfully!",  
            user: {  
                id: newUser._id,  
                FirstName: newUser.FirstName,  
                LastName: newUser.LastName,  
                Email: newUser.Email  
            }  
        });  
    } catch (error) {  
        console.error("Error creating user:", error.message);  
        res.status(400).send({ status: "error", message: error.message });  
    }  
});  

app.post("/login", async (req, res) => {  
    const { Email, Password } = req.body;  

    try {  
        const user = await User.findOne({ Email });  
        console.log("User found:", user);  // Log the user object   

        if (!user) {  
            return res.status(401).send({ status: "error", message: "User not found" });  
        }  

        const isPasswordValid = await bcrypt.compare(Password, user.Password);  
        console.log("Password valid:", isPasswordValid);  // Log if password is valid  

        if (!isPasswordValid) {  
            return res.status(401).send({ status: "error", message: "Invalid password" });  
        }  

        res.status(200).send({  
            status: "ok",  
            message: "Login successful",  
            user: {  
                id: user._id,  
                FirstName: user.FirstName,  
                LastName: user.LastName,  
                Email: user.Email  
            }  
        });  
    } catch (error) {  
        console.error("Error during login:", error.message);  
        res.status(500).send({ status: "error", message: "Internal server error" });  
    }  
});  

mongoose.connect(CONNECTION_STRING, {  
    useNewUrlParser: true,  
    useUnifiedTopology: true,  
    serverSelectionTimeoutMS: 20000,  
    socketTimeoutMS: 45000,   
}).then(() => console.log("Mongoose connected successfully"))  
  .catch(error => console.error("Error connecting to Mongoose:", error));