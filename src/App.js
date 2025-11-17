import './App.css';
import {BrowserRouter as Router, Routes, Route } from 'react-router-dom';
import "bootstrap/dist/css/bootstrap.min.css";
import "bootstrap/dist/js/bootstrap.min.js";
import "bootstrap/"
import Homecomponent from './components/Homecomponent';
import Registercomponent from './components/Registercomponent';
import Logincomponent from './components/Logincomponent';
import NotFound from './components/NotFound';
import AdminRegistercomponent from './components/AdminRegistercomponent';
import { AuthProvider } from './context/AuthContext';
import AdminLayout from './components/admin/AdminLayout';
import ProtectedRoute from './context/ProtectedRoute';
import AdminDashboard from './components/admin/AdminDashboard'
import NotAuthorized from './components/NotAuthorized'
import Buyers from './components/admin/Buyers'
import Sellers from './components/admin/Sellers'
import Products from './components/admin/Products'
import Messages from './components/admin/Messages'
import ProductAdd from './components/admin/forms/ProductAdd'


function App() {
  return (
    <Router>
    <AuthProvider>
    <Routes>
      <Route path='/' element ={<Homecomponent/>} />

      {/* Below are the admin routes */}
       <Route path='/admin-dashboard'
       element={
        <ProtectedRoute allowedRoles={['admin']}>
          <AdminLayout/>
        </ProtectedRoute>
       }
       >
        <Route path='' element={<AdminDashboard/>} />
        <Route path='buyers' element={<Buyers/>} />
        <Route path='sellers' element={<Sellers/>} />
        <Route path='products' element={<Products/>} />
        <Route path='messages' element={<Messages/>} />
        <Route path='product/add' element={<ProductAdd/>} />
       </Route>

      <Route path='/register' element={<Registercomponent/>} />
      <Route path='/adminregister' element={<AdminRegistercomponent/>} />
      <Route path='/login' element={<Logincomponent/>} />
      {/* Defaults */}
       <Route path='/not-authorized' element={<NotAuthorized/>} />
      <Route path='*' element={<NotFound/>} /> 
    </Routes>
    </AuthProvider>
    </Router>
  );
}

export default App;
