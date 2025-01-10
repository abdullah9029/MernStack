import { useState, useEffect } from "react";
import axios from "axios";
import { BrowserRouter as Router, useNavigate } from "react-router-dom";
import UserPage from "./UserPage";

function Login() {
  const navigate = useNavigate();
  const [isSignUp, setIsSignUp] = useState(false);
  const [formData, setFormData] = useState({
    firstName: "",
    lastName: "",
    email: "",
    password: "",
  });
  //const [isLogin, setIslogin] = useState(false);
  const [message, setMessage] = useState("");
  const [isWrong, setisWrong] = useState(false);
  const [isDuplicate, setIsDuplicate] = useState(false);
  const [isSuccess, setIsSuccess] = useState(false);

  useEffect(() => {
    if (isDuplicate) {
      const timer = setTimeout(() => {
        setIsDuplicate(false);
      }, 4000);
      return () => clearTimeout(timer);
    }
  }, [isDuplicate]);

  useEffect(() => {
    if (isWrong) {
      const timer = setTimeout(() => {
        setisWrong(false);
      }, 4000);
      return () => clearTimeout(timer);
    }
  }, [isWrong]);

  useEffect(() => {
    if (isSuccess) {
      const timer = setTimeout(() => {
        setIsSuccess(false);
      }, 4000);
      return () => clearTimeout(timer);
    }
  }, [isSuccess]);

  const handleSubmit = async (e) => {
    e.preventDefault();
    try {
      if (isSignUp) {
        const response = await axios.post("http://localhost:2000/register", {
          FirstName: formData.firstName,
          LastName: formData.lastName,
          Email: formData.email,
          Password: formData.password,
        });
        console.log("Sign up successful:", response.data);
        await handleLogin();
      } else {
        await handleLogin();
      }
    } catch (error) {
      console.error(
        "Error:",
        error.response ? error.response.data : error.message
      );
      setIsDuplicate(true);
      setMessage("User already exists");
    }
  };

  const handleLogin = async () => {
    try {
      const response = await axios.post("http://localhost:2000/login", {
        Email: formData.email,
        Password: formData.password,
      });
      console.log("Login successful:", response.data);
      localStorage.setItem("user", JSON.stringify(response.data.user));
      setisWrong(false);
      setIsDuplicate(false);
      setIsSuccess(true);
      navigate("/UserPage");

      if (isSignUp) {
        setMessage("SignUp Successful!");
      } else {
        setMessage("Login Successful!");
      }

      // Optionally, redirect user or perform other actions
    } catch (error) {
      setMessage("Invalid Email or Password");
      setisWrong(true);
    }
  };

  const handleInputChange = (e) => {
    setFormData({
      ...formData,
      [e.target.name]: e.target.value,
    });
  };

  return (
    <div className="login-container">
      <div className="login-box">
        {isDuplicate && <div className="duplicate-message">{message}</div>}
        {isWrong && <div className="error-message">{message}</div>}
        {isSuccess && <div className="success-message">{message}</div>}
        <h2>{isSignUp ? "Sign Up" : "Login"}</h2>
        <form onSubmit={handleSubmit}>
          {isSignUp && (
            <>
              <div className="form-group">
                <label>First Name:</label>
                <input
                  type="text"
                  name="firstName"
                  value={formData.firstName}
                  onChange={handleInputChange}
                  required
                />
              </div>
              <div className="form-group">
                <label>Last Name:</label>
                <input
                  type="text"
                  name="lastName"
                  value={formData.lastName}
                  onChange={handleInputChange}
                  required
                />
              </div>
            </>
          )}
          <div className="form-group">
            <label>Email:</label>
            <input
              type="email"
              name="email"
              value={formData.email}
              onChange={handleInputChange}
              required
            />
          </div>
          <div className="form-group">
            <label>Password:</label>
            <input
              type="password"
              name="password"
              value={formData.password}
              onChange={handleInputChange}
              required
            />
          </div>
          <button type="submit" className="submit-btn">
            {isSignUp ? "Sign Up" : "Login"}
          </button>
        </form>
        <p className="toggle-form">
          {isSignUp ? "Already have an account?" : "Don't have an account?"}{" "}
          <button className="toggle-btn" onClick={() => setIsSignUp(!isSignUp)}>
            {isSignUp ? "Login" : "Sign Up"}
          </button>
        </p>
      </div>

      <style jsx>{`
        .login-container {
          display: flex;
          justify-content: center;
          align-items: center;
          min-height: 100vh;
          background: linear-gradient(to right, #2c3e50, #3498db);
          padding: 20px;
        }

        .login-box {
          background: white;
          padding: 2rem;
          border-radius: 8px;
          box-shadow: 0 4px 6px rgba(0, 0, 0, 0.1);
          width: 100%;
          max-width: 400px;
        }

        h2 {
          color: #2c3e50;
          text-align: center;
          margin-bottom: 1.5rem;
        }

        .form-group {
          margin-bottom: 1rem;
        }

        label {
          display: block;
          margin-bottom: 0.5rem;
          color: #2c3e50;
        }

        input {
          width: 100%;
          padding: 0.5rem;
          border: 1px solid #ddd;
          border-radius: 4px;
          font-size: 1rem;
        }

        .submit-btn {
          width: 100%;
          padding: 0.75rem;
          background: #3498db;
          color: white;
          border: none;
          border-radius: 4px;
          font-size: 1rem;
          cursor: pointer;
          transition: background-color 0.3s ease;
        }

        .submit-btn:hover {
          background: #2980b9;
        }

        .toggle-form {
          text-align: center;
          margin-top: 1rem;
          color: #2c3e50;
        }

        .toggle-btn {
          background: none;
          border: none;
          color: #3498db;
          cursor: pointer;
          font-size: 1rem;
          padding: 0;
          margin-left: 0.5rem;
        }

        .toggle-btn:hover {
          text-decoration: underline;
        }

        .error-message,
        .duplicate-message,
        .success-message {
          padding: 0.75rem;
          border-radius: 4px;
          margin-bottom: 1rem;
          text-align: center;
          font-weight: bold;
          animation: shake 0.5s ease-in-out;
        }

        .error-message {
          background-color: #ff6b6b;
          color: white;
        }

        .success-message {
          background-color: #2ecc71;
          color: white;
        }

        @keyframes shake {
          0%,
          100% {
            transform: translateX(0);
          }
          25% {
            transform: translateX(-10px);
          }
          75% {
            transform: translateX(10px);
          }
        }

        .duplicate-message {
          background-color: #ffa502;
          color: white;
        }
      `}</style>
    </div>
  );
}

export default Login;
