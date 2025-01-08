import { useState } from 'react';  
import axios from 'axios';  

function Login() {  
  const [isSignUp, setIsSignUp] = useState(false);  
  const [formData, setFormData] = useState({  
    firstName: '',  
    lastName: '',  
    email: '',  
    password: ''  
  });  

  const handleSubmit = async (e) => {  
    e.preventDefault();  
    try {  

      console.log(isSignUp); 

      console.log(formData.email);
       console.log(formData.password);
      if (isSignUp) {  
        // Adjust the POST endpoint to your backend register URL  
        const response = await axios.post('http://localhost:1900/register', {  
          FirstName: formData.firstName,  
          LastName: formData.lastName,  
          Email: formData.email,  
          Password: formData.password,  
        });  
        console.log('Sign up successful:');
        console.log(response.data);
      } else {  
        // Handle login logic (adjust login URL as needed)  
        const response = await axios.post('http://localhost:1900/login', {  

        
        
          email: formData.email,  
          password: formData.password  
        });  
        console.log('Login successful:', response.data);  
        // Here you can handle successful login (e.g., store token, redirect user)  
      }  
    } catch (error) {  
     
      //console.log("user already exist");
      // Here you can handle errors (e.g., show error message to user)  
    }  
  };  

  const handleInputChange = (e) => {  
    setFormData({  
      ...formData,  
      [e.target.name]: e.target.value  
    });  
  };  

  return (  
    <div className="login-container">  
      <div className="login-box">  
        <h2>{isSignUp ? 'Sign Up' : 'Login'}</h2>  
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
            {isSignUp ? 'Sign Up' : 'Login'}  
          </button>  
        </form>  
        <p className="toggle-form">  
          {isSignUp ? 'Already have an account?' : "Don't have an account?"}{' '}  
          <button   
            className="toggle-btn"  
            onClick={() => setIsSignUp(!isSignUp)}  
          >  
            {isSignUp ? 'Login' : 'Sign Up'}  
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
      `}</style>  
    </div>  
  );  
}  

export default Login;