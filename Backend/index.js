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

// Recipe Schema
const recipeSchema = new mongoose.Schema({
    userId: { type: mongoose.Schema.Types.ObjectId, ref: 'registeredUserdb', required: true },
    title: { type: String, required: true },
    ingredients: { type: String, required: true },
    instructions: { type: String, required: true }
});

const Recipe = mongoose.model('Recipe', recipeSchema);

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

// Recipe Routes
app.post('/api/recipes', async (req, res) => {  
    console.log("Received recipe data:", req.body); // Log incoming data  
    try {  
        const { userId, title, ingredients, instructions } = req.body;  
        // Check if any required fields are missing  
        if (!userId || !title || !ingredients || !instructions) {  
            return res.status(400).json({ status: "error", message: "All fields are required" });  
        }  
        
        const recipe = new Recipe({ userId, title, ingredients, instructions });  
        const savedRecipe = await recipe.save();  
        res.status(201).json({ status: "ok", recipe: savedRecipe });  
    } catch (error) {  
        console.error("Error creating recipe:", error);  
        res.status(500).json({ status: "error", message: error.message });  
    }  
});


app.get('/api/recipes/:userId', async (req, res) => {
    try {
        const recipes = await Recipe.find({ userId: req.params.userId });
        res.json(recipes);
    } catch (error) {
        console.error("Error fetching recipes:", error);
        res.status(500).json({ status: "error", message: error.message });
    }
});

mongoose.connect(CONNECTION_STRING, {  
    useNewUrlParser: true,  
    useUnifiedTopology: true,  
    serverSelectionTimeoutMS: 20000,  
    socketTimeoutMS: 45000,   
}).then(() => console.log("Mongoose connected successfully"))  
  .catch(error => console.error("Error connecting to Mongoose:", error));

// Ensure mongoose is connected before using it  
