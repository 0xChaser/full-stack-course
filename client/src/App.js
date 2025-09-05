import axios from "axios"
import logo from './logo.svg';
import './App.css';



const apiCall = () => {
  axios.get("http://localhost:8080/").then((data) => {
    console.log(data)
  })
}

function App() {
  return (
    <div className="App">
      <header className="App-header">
        <img src={logo} className="App-logo" alt="logo" />
        <button onClick={apiCall}> See data </button>
      </header>
    </div>
  );
}

export default App;
