const express = require('express');  
const MongoClient = require('mongodb').MongoClient;  
const cors = require("cors");  
require('dotenv').config();  
const mongoose = require("mongoose");  
const bcrypt = require('bcrypt');   
const multer = require('multer');
const path = require('path');

const port = 2000;  
const app = express();  




app.use(cors({  
    origin: '*'  
}));  
app.use(express.json());  
app.use('/uploads', express.static('uploads')); // Serve uploaded files statically

const CONNECTION_STRING = process.env.MonogURL;  
const DATABASE = 'todoAppdb';  
let database;  

// Configure multer for file upload
const storage = multer.diskStorage({
    destination: function(req, file, cb) {
        cb(null, 'uploads/');
    },
    filename: function(req, file, cb) {
        cb(null, Date.now() + path.extname(file.originalname));
    }
});

const upload = multer({ 
    storage: storage,
    limits: {
        fileSize: 5 * 1024 * 1024 // 5MB limit
    },
    fileFilter: function(req, file, cb) {
        const filetypes = /jpeg|jpg|png/;
        const mimetype = filetypes.test(file.mimetype);
        const extname = filetypes.test(path.extname(file.originalname).toLowerCase());
        
        if (mimetype && extname) {
            return cb(null, true);
        }
        cb(new Error('Only .png, .jpg and .jpeg format allowed!'));
    }
});

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

app.post('/login', async (req, res) => {  
    const { Email, Password } = req.body;  

    try {  
        const user = await User.findOne({ Email });  
        if (!user) {  
            return res.status(404).send({ status: "error", message: "User not found" });  
        }  

        const isMatch = await bcrypt.compare(Password, user.Password);  
        if (!isMatch) {  
            return res.status(401).send({ status: "error", message: "Invalid credentials" });  
        }  

        res.send({ status: "ok", message: "Login successful", user });  
    } catch (error) {  
        console.error("Error logging in:", error);  
        res.status(500).send({ status: "error", message: "Server error" });  
    }  
});  

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

// Update user profile with profile picture
app.put('/api/users/:id/profile-picture', upload.single('profilePicture'), async (req, res) => {  
    try {  
        if (!req.file) {  
            return res.status(400).json({ message: 'No file uploaded' });  
        }  

        // Simulate updating user in the database (replace with your actual update logic)  
        const updatedUser = await User.findByIdAndUpdate(  
            req.params.id,  
            {   
                profilePicture: `/uploads/${req.file.filename}`,  
                FirstName: req.body.FirstName || undefined,  
                LastName: req.body.LastName || undefined  
            },  
            { new: true }  
        );  

        if (!updatedUser) {  
            return res.status(404).json({ message: 'User not found' });  
        }  

        res.status(200).json({  
            message: 'Profile updated successfully',  
            user: updatedUser  
        });  
    } catch (error) {  
        console.error("Error updating profile:", error); // Log the error details  
        res.status(500).json({ message: 'Error updating profile', error: error.message }); // Send the error message back for easier debugging  
    }  
});

app.put('/api/users/:id', async (req, res) => {  
  const { FirstName, LastName } = req.body; // Get the new names from the request body  
  try {  
    const updatedUser = await User.findByIdAndUpdate(  
      req.params.id,  
      { FirstName, LastName }, // Update the fields  
      { new: true } // Return the updated object  
    );  

    if (!updatedUser) {  
      return res.status(404).json({ message: 'User not found' });  
    }  

    res.status(200).json(updatedUser); // Send back the updated user  
  } catch (error) {  
    console.error("Error updating user:", error);  
    res.status(500).json({ message: 'Error updating profile' });  
  }  
});


// PUT endpoint to update user profile  
// app.put('/api/users/:id', async (req, res) => {  
//   try {  
//     const { id } = req.params;  
//     const { FirstName } = req.body;  

//     // Find the user by ID and update their name  
//     const updatedUser = await User.findByIdAndUpdate(id, { FirstName }, { new: true });  

//     if (!updatedUser) {  
//       return res.status(404).json({ message: 'User not found' });  
//     }  

//     res.status(200).json(updatedUser);  
//   } catch (error) {  
//     console.error("Error updating user:", error);  
//     res.status(500).json({ message: 'Error updating profile' });  
//   }  
// });

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