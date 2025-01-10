import React, { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import axios from "axios";

const UserPage = () => {
  const [user, setUser] = useState(null);
  const [recipes, setRecipes] = useState([]);
  const [showAddForm, setShowAddForm] = useState(false);
  const [newRecipe, setNewRecipe] = useState({
    title: "",
    ingredients: "",
    instructions: "",
  });

  const navigate = useNavigate();

  useEffect(() => {
    const loggedInUser = localStorage.getItem("user");
    if (!loggedInUser) {
      navigate("/");
      return;
    }

    const parsedUser = JSON.parse(loggedInUser);
    setUser(parsedUser);

    // Fetch user's recipes when component mounts
    const fetchRecipes = async () => {
      try {
        const response = await axios.get(
          `http://localhost:2000/api/recipes/${parsedUser._id}`
        );
        setRecipes(response.data);
      } catch (error) {
        console.error("Error fetching recipes:", error);
      }
    };

    fetchRecipes();
  }, [navigate]);

  const handleLogout = () => {
    localStorage.removeItem("user");
    navigate("/login");
  };

  const handleAddRecipe = async (e) => {
    e.preventDefault();

    if (!user || !user._id) {
      console.error("User ID is not available.");
      return; // Exit if user ID is not available
    }

    try {
      const response = await axios.post("http://localhost:2000/api/recipes", {
        userId: user._id,
        title: newRecipe.title,
        ingredients: newRecipe.ingredients,
        instructions: newRecipe.instructions,
      });

      // Update recipes list and reset form state
      setRecipes([...recipes, response.data.recipe]);
      setShowAddForm(false);
      setNewRecipe({ title: "", ingredients: "", instructions: "" });
    } catch (error) {
      console.error("Error adding recipe:", error);
      // Optionally show an error message to the user
    }
  };

  // Loading state for user
  if (!user) {
    return (
      <div className="page-container">
        <div className="loading">Loading...</div>
      </div>
    );
  }

  return (
    <div className="page-container">
      <div className="form-container">
        <div className="welcome-section">
          <h1 className="title">Welcome, {user.FirstName}!</h1>
          <div className="profile-icon">
            {user.FirstName.charAt(0)}
            {user.LastName.charAt(0)}
          </div>
        </div>

        <div>
          <div className="detail-item">
            <label className="label">Full Name</label>
            <div className="value">
              {user.FirstName} {user.LastName}
            </div>
          </div>

          <div className="detail-item">
            <label className="label">Email Address</label>
            <div className="value">{user.Email}</div>
          </div>
        </div>

        <button
          className={`button add-recipe-button ${showAddForm ? "active" : ""}`}
          onClick={() => setShowAddForm(!showAddForm)}
        >
          {showAddForm ? "Cancel" : "Add New Recipe"}
        </button>

        {showAddForm && (
          <form className="recipe-form" onSubmit={handleAddRecipe}>
            <input
              className="input"
              type="text"
              placeholder="Recipe Title"
              value={newRecipe.title}
              onChange={(e) =>
                setNewRecipe({ ...newRecipe, title: e.target.value })
              }
              required
            />
            <textarea
              className="textarea"
              placeholder="Ingredients (one per line)"
              value={newRecipe.ingredients}
              onChange={(e) =>
                setNewRecipe({ ...newRecipe, ingredients: e.target.value })
              }
              required
            />
            <textarea
              className="textarea"
              placeholder="Cooking Instructions"
              value={newRecipe.instructions}
              onChange={(e) =>
                setNewRecipe({ ...newRecipe, instructions: e.target.value })
              }
              required
            />
            <button className="button" type="submit">
              Save Recipe
            </button>
          </form>
        )}

        <div className="recipe-list">
          {recipes.map((recipe) => (
            <div key={recipe._id} className="recipe">
              <div className="recipe-title">{recipe.title}</div>
              <div>
                <strong>Ingredients:</strong>
                <pre>{recipe.ingredients}</pre>
              </div>
              <div>
                <strong>Instructions:</strong>
                <pre>{recipe.instructions}</pre>
              </div>
            </div>
          ))}
        </div>

        <button className="button logout-button" onClick={handleLogout}>
          Sign Out
        </button>
      </div>
    </div>
  );
};

export default UserPage;
