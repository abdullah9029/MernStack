import React, { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import axios from "axios";

const UserPage = () => {
  const [user, setUser] = useState(null);
  const [recipes, setRecipes] = useState([]);
  const [publicRecipes, setPublicRecipes] = useState([]);
  const [showAddForm, setShowAddForm] = useState(false);
  const [editingRecipe, setEditingRecipe] = useState(null);
  const [profileImage, setProfileImage] = useState(null);
  const img = "http://localhost:2000/uploads";

  const [showProfileDialog, setShowProfileDialog] = useState(false);
  const [editedName, setEditedName] = useState({
    FirstName: "",
    LastName: "",
  });
  const [newRecipe, setNewRecipe] = useState({
    title: "",
    ingredients: "",
    instructions: "",
    isPublic: false,
  });

  const [activeMenu, setActiveMenu] = useState(null);

  const buttonStyle = {
    padding: "8px 16px",
    borderRadius: "4px",
    border: "none",
    cursor: "pointer",
    fontSize: "14px",
    transition: "all 0.3s ease",
    margin: "5px",
  };

  const menuButtonStyle = {
    background: "transparent",
    border: "none",
    fontSize: "20px",
    cursor: "pointer",
    padding: "5px 10px",
    borderRadius: "50%",
    transition: "background 0.3s ease",
    verticalAlign: "middle",
    ":hover": {
      background: "#f0f0f0",
    },
  };

  const dropdownStyle = {
    position: "absolute",
    right: "0",
    top: "100%",
    backgroundColor: "white",
    boxShadow: "0 2px 5px rgba(0,0,0,0.2)",
    borderRadius: "4px",
    padding: "5px 0",
    zIndex: 1000,
  };

  const dropdownButtonStyle = {
    display: "block",
    width: "100%",
    padding: "8px 15px",
    border: "none",
    background: "none",
    textAlign: "left",
    cursor: "pointer",
    fontSize: "14px",
    ":hover": {
      backgroundColor: "#f5f5f5",
    },
  };

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
      setEditedName({
        FirstName: parsedUser.FirstName,
        LastName: parsedUser.LastName,
      });
      if (parsedUser.profilePicture) {
        setProfileImage(parsedUser.profilePicture);
      }
      fetchPrivateRecipes(parsedUser._id);
    }

    fetchPublicRecipes();
  }, [navigate]);

  const handleUpdateProfile = async () => {
    try {
      const formData = new FormData();
      formData.append("FirstName", editedName.FirstName);
      formData.append("LastName", editedName.LastName);

      if (profileImage instanceof File) {
        formData.append("profilePicture", profileImage);
      }

      const response = await axios.put(
        `http://localhost:2000/api/users/${user._id}/profile-picture`,
        formData,
        {
          headers: {
            "Content-Type": "multipart/form-data",
          },
        }
      );

      if (response.status === 200) {
        const updatedUser = response.data.user;

        // Update the user state with new profile picture
        setUser((prevUser) => ({
          ...prevUser,
          profilePicture: updatedUser.profilePicture, // Update the profile picture URL
          FirstName: updatedUser.FirstName, // Ensure the first name is also updated
          LastName: updatedUser.LastName, // Ensure last name is also updated
        }));

        // Save the updated user to localStorage
        localStorage.setItem("user", JSON.stringify(updatedUser));

        setShowProfileDialog(false);
        const imgPath = `${img}/${user._id}.jpg`;
        console.log(imgPath);
        alert("Profile updated successfully!");
      } else {
        alert("Failed to update profile. Please try again.");
      }
    } catch (error) {
      console.error("Error updating profile:", error);
      alert("Failed to update profile. Please try again.");
    }
  };

  const handleImageChange = (e) => {
    if (e.target.files && e.target.files[0]) {
      setProfileImage(e.target.files[0]);
    }
  };

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
    console.log(parsedUser._id);

    if (!parsedUser || !parsedUser._id) {
      console.error("User ID is not available.");
      alert("User ID is not available. Please log in.");
      return;
    }

    try {
      const response = await axios.post("http://localhost:2000/api/recipes", {
        userId: parsedUser._id,
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
    setActiveMenu(null);
  };

  const handleEditRecipe = (recipe) => {
    setEditingRecipe(recipe._id);
    setNewRecipe({
      title: recipe.title,
      ingredients: recipe.ingredients,
      instructions: recipe.instructions,
      isPublic: recipe.isPublic || false,
    });
    console.log(newRecipe.isPublic);
    setShowAddForm(true);
    setActiveMenu(null);
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
          <button
            className="profile-button"
            onClick={() => setShowProfileDialog(true)}
            style={{
              width: "40px",
              height: "40px",
              borderRadius: "50%",
              border: "none",
              padding: 0,
              overflow: "hidden",
              cursor: "pointer",
              backgroundColor: user.profilePicture ? "transparent" : "#4CAF50",
              color: "white",
              display: "flex",
              alignItems: "center",
              justifyContent: "center",
            }}
          >
            <img
              src={`${img}/${user._id}.jpg`}
              alt="Profile"
              style={{
                width: "100%",
                height: "100%",
                objectFit: "cover",
              }}
            />
          </button>
        </div>

        {showProfileDialog && (
          <>
            <div
              className="overlay"
              onClick={() => setShowProfileDialog(false)}
            />
            <div className="dialog">
              <h2>Profile Information</h2>
              <div className="form-group">
                <label>Profile Picture:</label>
                <input
                  type="file"
                  accept="image/*"
                  onChange={handleImageChange}
                />
                {profileImage && (
                  <img
                    src={
                      profileImage instanceof File
                        ? URL.createObjectURL(profileImage)
                        : `http://localhost:2000${profileImage}`
                    }
                    alt="Profile Preview"
                    style={{
                      width: "100px",
                      height: "100px",
                      objectFit: "cover",
                      marginTop: "10px",
                      borderRadius: "50%",
                    }}
                  />
                )}
                <label>First Name:</label>
                <input
                  type="text"
                  value={editedName.FirstName}
                  onChange={(e) =>
                    setEditedName({ ...editedName, FirstName: e.target.value })
                  }
                />
                <label>Last Name:</label>
                <input
                  type="text"
                  value={editedName.LastName}
                  onChange={(e) =>
                    setEditedName({ ...editedName, LastName: e.target.value })
                  }
                />
                <label>Email:</label>
                <div className="email-display">{user.Email}</div>
              </div>
              <div className="button-group">
                <button
                  onClick={() => setShowProfileDialog(false)}
                  className="cancel-button"
                >
                  Cancel
                </button>
                <button onClick={handleUpdateProfile} className="save-button">
                  Save Changes
                </button>
              </div>
            </div>
          </>
        )}

        <button
          style={{
            ...buttonStyle,
            backgroundColor: showAddForm ? "#ff4444" : "#4CAF50",
            color: "white",
          }}
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
            <button
              style={{
                ...buttonStyle,
                backgroundColor: "#4CAF50",
                color: "white",
                width: "100%",
                marginTop: "10px",
              }}
              type="submit"
            >
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
                  <div style={{ position: "relative" }}>
                    <button
                      style={menuButtonStyle}
                      onClick={() =>
                        setActiveMenu(
                          activeMenu === recipe._id ? null : recipe._id
                        )
                      }
                    >
                      ⋮
                    </button>

                    {activeMenu === recipe._id && (
                      <div style={dropdownStyle}>
                        <button
                          style={dropdownButtonStyle}
                          onClick={() => handleEditRecipe(recipe)}
                        >
                          Edit
                        </button>
                        <button
                          style={dropdownButtonStyle}
                          onClick={() => handleDeleteRecipe(recipe._id, false)}
                        >
                          Delete
                        </button>
                      </div>
                    )}
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

        <button
          style={{
            ...buttonStyle,
            backgroundColor: "#ff4444",
            color: "white",
            marginTop: "20px",
          }}
          onClick={handleLogout}
        >
          Sign Out
        </button>
      </div>
    </div>
  );
};

export default UserPage;
