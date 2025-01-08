import logo from "./logo.svg";
import "./App.css";
import Main from "./Components/Main";
import Header from "./Components/Header";
import Login from "./Components/Login";
import { BrowserRouter as Router, Route, Routes } from "react-router-dom";
import UserPage from "./Components/UserPage";

function App() {
  return (
    <Router>
      <div className="App">
        <Routes>
          <Route
            exact
            path="/"
            element={
              <>
                <Header />
                <Login />
                <Main />
                <UserPage />
              </>
            }
          />
          <Route path="/UserPage" Component={<UserPage />}>
            {" "}
          </Route>
        </Routes>
      </div>
    </Router>
  );
}

export default App;
