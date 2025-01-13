import React, { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import axios from "axios";

const UserPage = () => {
  const [user, setUser] = useState(null);
  const [recipes, setRecipes] = useState([]);
  const [publicRecipes, setPublicRecipes] = useState([]);
  const [showAddForm, setShowAddForm] = useState(false);
  const [editingRecipe, setEditingRecipe] = useState(null);
  const [newRecipe, setNewRecipe] = useState({
    title: "",
    ingredients: "",
    instructions: "",
    isPublic: false,
  });

  const navigate = useNavigate();

  useEffect(() => {
    const fetchPublicRecipes = async () => {
      try {
        const response = await axios.get(
          `http://localhost:2000/api/public-recipes`
        );
        setPublicRecipes(response.data);
      } catch (error) {
        console.error("Error fetching public recipes:", error);
      }
    };

    const loggedInUser = localStorage.getItem("user");

    if (loggedInUser) {
      const parsedUser = JSON.parse(loggedInUser);
      setUser(parsedUser);
      fetchPrivateRecipes(parsedUser.id);
    }

    fetchPublicRecipes();
  }, [navigate]);

  const fetchPrivateRecipes = async (userId) => {
    try {
      const privateResponse = await axios.get(
        `http://localhost:2000/api/recipes/${userId}`
      );
      setRecipes(privateResponse.data);
    } catch (error) {
      console.error("Error fetching private recipes:", error);
    }
  };

  const handleLogout = () => {
    localStorage.removeItem("user");
    navigate("/");
  };

  const handleAddRecipe = async (e) => {
    e.preventDefault();
    const loggedInUser = localStorage.getItem("user");
    const parsedUser = JSON.parse(loggedInUser);

    if (!parsedUser || !parsedUser.id) {
      console.error("User ID is not available.");
      alert("User ID is not available. Please log in.");
      return;
    }

    try {
      const response = await axios.post("http://localhost:2000/api/recipes", {
        userId: parsedUser.id,
        title: newRecipe.title,
        ingredients: newRecipe.ingredients,
        instructions: newRecipe.instructions,
        isPublic: newRecipe.isPublic,
      });

      const savedRecipe = response.data.recipe;

      if (savedRecipe.isPublic) {
        setPublicRecipes([...publicRecipes, savedRecipe]);
      } else {
        setRecipes([...recipes, savedRecipe]);
      }

      setShowAddForm(false);
      setNewRecipe({
        title: "",
        ingredients: "",
        instructions: "",
        isPublic: false,
      });
      alert("Recipe saved successfully!");
    } catch (error) {
      console.error("Error adding recipe:", error);
      alert("Failed to save recipe. Please try again.");
    }
  };

  const handleDeleteRecipe = async (recipeId, isPublic) => {
    if (window.confirm("Are you sure you want to delete this recipe?")) {
      try {
        await axios.delete(
          `http://localhost:2000/api/${
            isPublic ? "public-recipes" : "recipes"
          }/${recipeId}`
        );
        if (isPublic) {
          setPublicRecipes(
            publicRecipes.filter((recipe) => recipe._id !== recipeId)
          );
        } else {
          setRecipes(recipes.filter((recipe) => recipe._id !== recipeId));
        }
        alert("Recipe deleted successfully!");
      } catch (error) {
        console.error("Error deleting recipe:", error);
        alert("Failed to delete recipe. Please try again.");
      }
    }
  };

  const handleEditRecipe = (recipe) => {
    setEditingRecipe(recipe._id);
    setNewRecipe({
      title: recipe.title,
      ingredients: recipe.ingredients,
      instructions: recipe.instructions,
      isPublic: recipe.isPublic || false,
    });
    setShowAddForm(true);
  };

  const handleUpdateRecipe = async (e) => {
    e.preventDefault();

    try {
      const response = await axios.put(
        `http://localhost:2000/api/recipes/${editingRecipe}`,
        {
          title: newRecipe.title,
          ingredients: newRecipe.ingredients,
          instructions: newRecipe.instructions,
          isPublic: newRecipe.isPublic,
        }
      );

      const updatedRecipe = response.data.recipe;

      if (updatedRecipe.isPublic) {
        setPublicRecipes((prevPublicRecipes) =>
          prevPublicRecipes.map((recipe) =>
            recipe._id === updatedRecipe._id ? updatedRecipe : recipe
          )
        );
        setRecipes(recipes.filter((recipe) => recipe._id !== editingRecipe));
      } else {
        setRecipes(
          recipes.map((recipe) =>
            recipe._id === editingRecipe ? updatedRecipe : recipe
          )
        );
      }

      setShowAddForm(false);
      setEditingRecipe(null);
      setNewRecipe({
        title: "",
        ingredients: "",
        instructions: "",
        isPublic: false,
      });

      alert("Recipe updated successfully!");
    } catch (error) {
      console.error("Error updating recipe:", error);
      alert("Failed to update recipe. Please try again.");
    }
  };

  if (!user) {
    return (
      <div className="loading-container">
        <div className="loading-text">Loading...</div>
      </div>
    );
  }

  return (
    <div className="user-page">
      <div className="content-container">
        <div className="header">
          <h1 className="welcome-text">Welcome, {user.FirstName}!</h1>
          <div className="user-avatar">
            {user.FirstName.charAt(0)}
            {user.LastName.charAt(0)}
          </div>
        </div>

        <div className="user-info">
          <div className="info-group">
            <label className="info-label">Full Name</label>
            <div className="info-value">
              {user.FirstName} {user.LastName}
            </div>
          </div>

          <div className="info-group">
            <label className="info-label">Email Address</label>
            <div className="info-value">{user.Email}</div>
          </div>
        </div>

        <button
          className={`add-recipe-btn ${showAddForm ? "cancel" : ""}`}
          onClick={() => {
            if (showAddForm) {
              setEditingRecipe(null);
              setNewRecipe({
                title: "",
                ingredients: "",
                instructions: "",
                isPublic: false,
              });
            }
            setShowAddForm(!showAddForm);
          }}
        >
          {showAddForm ? "Cancel" : "Add New Recipe"}
        </button>

        {showAddForm && (
          <form
            className="recipe-form"
            onSubmit={editingRecipe ? handleUpdateRecipe : handleAddRecipe}
          >
            <input
              className="form-input"
              type="text"
              placeholder="Recipe Title"
              value={newRecipe.title}
              onChange={(e) =>
                setNewRecipe({ ...newRecipe, title: e.target.value })
              }
              required
            />
            <textarea
              className="form-textarea"
              placeholder="Ingredients (one per line)"
              value={newRecipe.ingredients}
              onChange={(e) =>
                setNewRecipe({ ...newRecipe, ingredients: e.target.value })
              }
              required
            />
            <textarea
              className="form-textarea"
              placeholder="Cooking Instructions"
              value={newRecipe.instructions}
              onChange={(e) =>
                setNewRecipe({ ...newRecipe, instructions: e.target.value })
              }
              required
            />
            <div className="checkbox-container">
              <label className="checkbox-label">
                <input
                  type="checkbox"
                  checked={newRecipe.isPublic}
                  onChange={(e) =>
                    setNewRecipe({ ...newRecipe, isPublic: e.target.checked })
                  }
                />
                Make this recipe public
              </label>
            </div>
            <button className="save-btn" type="submit">
              {editingRecipe ? "Update Recipe" : "Save Recipe"}
            </button>
          </form>
        )}

        <h2 className="section-title">Private Recipes</h2>
        <div className="recipes-container">
          {recipes.length === 0 ? (
            <p className="no-recipes">No private recipes found.</p>
          ) : (
            recipes.map((recipe) => (
              <div key={recipe._id} className="recipe-card">
                <div className="recipe-header">
                  <div className="recipe-title">{recipe.title}</div>
                  <div className="recipe-actions">
                    <button
                      className="edit-btn"
                      onClick={() => handleEditRecipe(recipe)}
                    >
                      Edit
                    </button>
                    <button
                      className="delete-btn"
                      onClick={() => handleDeleteRecipe(recipe._id, false)}
                    >
                      Delete
                    </button>
                  </div>
                </div>
                <div className="recipe-section">
                  <strong className="section-label">Ingredients:</strong>
                  <pre className="recipe-content">{recipe.ingredients}</pre>
                </div>
                <div className="recipe-section">
                  <strong className="section-label">Instructions:</strong>
                  <pre className="recipe-content">{recipe.instructions}</pre>
                </div>
                <div>
                  <span className="recipe-visibility private">
                    Private Recipe
                  </span>
                </div>
              </div>
            ))
          )}
        </div>

        <h2 className="section-title public">Public Recipes</h2>
        <div className="recipes-container">
          {publicRecipes.length === 0 ? (
            <p className="no-recipes">No public recipes found.</p>
          ) : (
            publicRecipes.map((recipe) => (
              <div key={recipe._id} className="recipe-card">
                <div className="recipe-header">
                  <div className="recipe-title">{recipe.title}</div>
                  <div className="recipe-actions">
                    <button
                      className="edit-btn"
                      onClick={() => handleEditRecipe(recipe)}
                    >
                      Edit
                    </button>

                    <button
                      className="delete-btn"
                      onClick={() => handleDeleteRecipe(recipe._id, true)}
                    >
                      Delete
                    </button>
                  </div>
                </div>
                <div className="recipe-section">
                  <strong className="section-label">Ingredients:</strong>
                  <pre className="recipe-content">{recipe.ingredients}</pre>
                </div>
                <div className="recipe-section">
                  <strong className="section-label">Instructions:</strong>
                  <pre className="recipe-content">{recipe.instructions}</pre>
                </div>
                <div>
                  <span className="recipe-visibility public">
                    Public Recipe
                  </span>
                </div>
              </div>
            ))
          )}
        </div>

        <button className="sign-out-btn" onClick={handleLogout}>
          Sign Out
        </button>
      </div>
    </div>
  );
};

export default UserPage;
