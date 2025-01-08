import { useState } from 'react';

function Header() {
  const [isLoggedIn, setIsLoggedIn] = useState(false);
  const [showLoginForm, setShowLoginForm] = useState(false);
  const [loginData, setLoginData] = useState({
    email: '',
    password: ''
  });

  const handleLogin = (e) => {
    e.preventDefault();
    // Add login logic here
    console.log('Login attempted with:', loginData);
    setIsLoggedIn(true);
    setShowLoginForm(false);
  };

  const handleLogout = () => {
    setIsLoggedIn(false);
    setLoginData({ email: '', password: '' });
  };

  return (
    <header>
      <nav>
        <div className="logo">
          <h1>Recipe Manager</h1>
        </div>
      </nav>

      {showLoginForm && (
        <div className="login-modal">
          <div className="login-content">
            <h2>Login to Recipe Manager</h2>
            <form onSubmit={handleLogin}>
              <div className="form-group">
                <label>Email:</label>
                <input
                  type="email"
                  value={loginData.email}
                  onChange={(e) => setLoginData({...loginData, email: e.target.value})}
                  required
                />
              </div>
              <div className="form-group">
                <label>Password:</label>
                <input
                  type="password"
                  value={loginData.password}
                  onChange={(e) => setLoginData({...loginData, password: e.target.value})}
                  required
                />
              </div>
              <div className="button-group">
                <button type="submit">Login</button>
                <button type="button" onClick={() => setShowLoginForm(false)}>Cancel</button>
              </div>
            </form>
          </div>
        </div>
      )}

      <style jsx>{`
        header {
          background: linear-gradient(to right, #2c3e50, #3498db);
          color: white;
          padding: 1rem;
          box-shadow: 0 2px 5px rgba(0,0,0,0.1);
        }

        nav {
          display: flex;
          justify-content: center;
          align-items: center;
          max-width: 1200px;
          margin: 0 auto;
        }

        .logo h1 {
          margin: 0;
          font-size: 1.8rem;
          font-weight: bold;
          text-align: center;
        }

        button {
          background-color: transparent;
          border: 2px solid white;
          color: white;
          padding: 0.5rem 1rem;
          border-radius: 4px;
          cursor: pointer;
          transition: all 0.3s ease;
        }

        button:hover {
          background-color: white;
          color: #2c3e50;
        }

        .login-modal {
          position: fixed;
          top: 0;
          left: 0;
          width: 100%;
          height: 100%;
          background-color: rgba(0,0,0,0.5);
          display: flex;
          justify-content: center;
          align-items: center;
        }

        .login-content {
          background-color: white;
          padding: 2rem;
          border-radius: 8px;
          width: 100%;
          max-width: 400px;
          color: #333;
        }

        .form-group {
          margin-bottom: 1rem;
        }

        .form-group label {
          display: block;
          margin-bottom: 0.5rem;
          font-weight: bold;
        }

        .form-group input {
          width: 100%;
          padding: 0.5rem;
          border: 1px solid #ddd;
          border-radius: 4px;
          font-size: 1rem;
        }

        .button-group {
          display: flex;
          gap: 1rem;
          margin-top: 1.5rem;
        }

        .button-group button {
          flex: 1;
          background-color: #3498db;
          color: white;
          border: none;
          padding: 0.75rem;
        }

        .button-group button:last-child {
          background-color: #95a5a6;
        }

        .button-group button:hover {
          opacity: 0.9;
        }
      `}</style>
    </header>
  );
}

export default Header;
