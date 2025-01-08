import logo from './logo.svg';
import './App.css';
import Main from './Components/Main';
import Header from './Components/Header';
import Login from './Components/Login';

function App() {
  return (
    <div className="App">
      <Header/>
      <Login/>
      <Main/>
    </div>
  );
}

export default App;
