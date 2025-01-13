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
    instructions: { type: String, required: true },  
    isPublic: { type: Boolean, default: false } // Add this line for public recipes  
});  

const Recipe = mongoose.model('Recipe', recipeSchema);  

// User registration and login routes...  

// Recipe Routes  
app.post('/api/recipes', async (req, res) => {  
    console.log("Received recipe data:", req.body); // Log incoming data  
    try {  
        const { userId, title, ingredients, instructions, isPublic } = req.body; // Include isPublic  
        // Check if any required fields are missing  
        if (!userId || !title || !ingredients || !instructions) {  
            return res.status(400).json({ status: "error", message: "All fields are required" });  
        }  

        const recipe = new Recipe({ userId, title, ingredients, instructions, isPublic }); // Set isPublic  
        const savedRecipe = await recipe.save();  
        res.status(201).json({ status: "ok", recipe: savedRecipe });  
    } catch (error) {  
        console.error("Error creating recipe:", error);  
        res.status(500).json({ status: "error", message: error.message });  
    }  
});  


app.post("/register", async (req, res) => {  
    const { FirstName, LastName, Email, Password } = req.body;  

    try {  
        const hashedPassword = await bcrypt.hash(Password, 10);  
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

// Endpoint to fetch all public recipes  
app.get('/api/public-recipes', async (req, res) => {  
    try {  
        const publicRecipes = await Recipe.find({ isPublic: true });  
        res.json(publicRecipes);  
    } catch (error) {  
        console.error("Error fetching public recipes:", error);  
        res.status(500).json({ status: "error", message: error.message });  
    }  
});  

// Endpoint to fetch user's private recipes  
app.get('/api/recipes/:userId', async (req, res) => {  
    try {  
        const recipes = await Recipe.find({ userId: req.params.userId });  
        res.json(recipes);  
    } catch (error) {  
        console.error("Error fetching recipes:", error);  
        res.status(500).json({ status: "error", message: error.message });  
    }  
});  

// Endpoint to delete a recipe  
app.delete('/api/recipes/:id', async (req, res) => {  
    try {  
        const recipeId = req.params.id;  
        const result = await Recipe.findByIdAndDelete(recipeId);  
        if (!result) {  
            return res.status(404).send("Recipe not found");  
        }  
        res.status(200).send("Recipe deleted successfully");  
    } catch (error) {  
        console.error("Error deleting recipe:", error);  
        res.status(500).send("Server error");  
    }  
});  


app.put('/api/recipes/:id', async (req, res) => {  
    try {  
        const recipeId = req.params.id;  
        const { title, ingredients, instructions, isPublic } = req.body; // Include isPublic  

        // Check if any required fields are missing  
        if (!title || !ingredients || !instructions) {  
            return res.status(400).json({ status: "error", message: "All fields are required" });  
        }  

       
        const updatedRecipe = await Recipe.findByIdAndUpdate(  
            recipeId,  
            { title, ingredients, instructions, isPublic },  
            { new: true }
        );  

        if (!updatedRecipe) {  
            return res.status(404).send("Recipe not found");  
        }  

        res.status(200).json({ status: "ok", recipe: updatedRecipe });  
    } catch (error) {  
        console.error("Error updating recipe:", error);  
        res.status(500).send("Server error");  
    }  
});  


mongoose.connect(CONNECTION_STRING, {  
    useNewUrlParser: true,  
    useUnifiedTopology: true,  
    serverSelectionTimeoutMS: 20000,  
    socketTimeoutMS: 45000,   
}).then(() => console.log("Mongoose connected successfully"))  
  .catch(error => console.error("Error connecting to Mongoose:", error));