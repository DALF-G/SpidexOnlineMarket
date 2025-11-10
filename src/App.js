import './App.css';
import { BrowserRouter as Router,Routes,Route,Link } from 'react-router-dom';
import "bootstrap/dist/css/bootstrap.min.css";
import "bootstrap/dist/js/bootstrap.min.js";
import "bootstrap/"
import Homecomponent from './components/Homecomponent';
import Registercomponent from './components/Registercomponent';
import Logincomponent from './components/Logincomponent';
import NotFound from './components/NotFound';

function App() {
  return (
  <Router>
    <Routes>
      <Route path='/' element ={<Homecomponent/>} />
      <Route path='/register' element={<Registercomponent/>} />
      <Route path='/login' element={<Logincomponent/>} />
      <Route path='*' element={<NotFound/>} /> 
    </Routes>
  </Router>
  );
}

export default App;
