import './App.css';
import './HomePage.js'
import { BrowserRouter as Router, Route, Routes } from 'react-router-dom';
import {HomePage} from "./HomePage";
import Navbar from "./Navbar";
import AboutPage from "./About";

function App() {
  return (
      <Router>
    <div className="App dark-backgroud">
        <Navbar />
      <Routes>
        <Route path="/" element={<HomePage />} />
          <Route path="/about" element={<AboutPage />} />
      </Routes>
    </div>
        </Router>
  );
}

export default App;
