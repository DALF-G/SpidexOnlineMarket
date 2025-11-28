import './App.css';
import {BrowserRouter as Router, Routes, Route } from 'react-router-dom';
import "bootstrap/dist/css/bootstrap.min.css";
import "bootstrap/dist/js/bootstrap.min.js";
import "bootstrap/"
import Homecomponent from './components/Homecomponent';
import ProductsPage from "./components/ProductsPage";
import ProductDetails from "./components/ProductDetails";
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
import ProductAdd from './components/admin/forms/ProductAdd'
import ProductView from './components/admin/forms/ProductView';
import ProductEdit from './components/admin/forms/ProductEdit';
import Messages from './components/admin/Messages'
import Users from './components/admin/Users';
import Categories from './components/admin/Categories';
import CategoryAdd from './components/admin/forms/CategoryAdd';
import CategoryEdit from './components/admin/forms/CategoryEdit';
import PrivateRoute from "./components/PrivateRoute";
import SellerLayout from './components/seller/SellerLayout'
import SellerDashboard from './components/seller/SellerDashboard';
import SellerMessages from './components/seller/SellerMessages';
import SellerProducts from './components/seller/SellerProducts';
import SellerBuyers from './components/seller/SellerBuyers';
import SellerProductAdd from './components/seller/forms/SellerProductAdd';
import SellerProductEdit from './components/seller/forms/SellerProductEdit';
import SellerProductView from './components/seller/forms/SellerProductView';


function App() {
  return (
    <Router>
    <AuthProvider>
    <Routes>
      <Route path='/' element ={<Homecomponent/>} />

      <Route path="/products" element={<ProductsPage />} />
      <Route path="/product/:id" element={<PrivateRoute><ProductDetails /></PrivateRoute> } />

      {/* Below are the admin routes */}
       <Route path='/admin-dashboard'
       element={
        <ProtectedRoute allowedRoles={['admin']}>
          <AdminLayout/>
        </ProtectedRoute>
       }
       >
        <Route path='' element={<AdminDashboard/>} />
        <Route path='users' element={<Users/>} />
        <Route path='categories' element={<Categories/>} />
        <Route path='categories/add' element={<CategoryAdd />} />
        <Route path='categories/edit' element={<CategoryEdit />} />
        <Route path='buyers' element={<Buyers/>} />
        <Route path='sellers' element={<Sellers/>} />
        <Route path='products' element={<Products/>} />
        <Route path='products/add' element={<ProductAdd/>} />
        <Route path='products/view' element={<ProductView/>} />
        <Route path='products/edit' element={<ProductEdit/>} />
        <Route path='messages' element={<Messages/>} />
       </Route>

       {/* Below are the seller routes */}
       <Route path='/seller-dashboard'
       element={
        <ProtectedRoute allowedRoles={['seller']}>
          <SellerLayout/>
        </ProtectedRoute>
       }
       >
        <Route path='' element={<SellerDashboard/>} />
        <Route path='products' element={<SellerProducts/>} />
        <Route path='buyers' element={<SellerBuyers/>} />
        <Route path='messages' element={<SellerMessages/>} />
        <Route path="products/add" element={<SellerProductAdd />} />
        <Route path="products/edit" element={<SellerProductEdit />} />
        <Route path="products/view" element={<SellerProductView />} />
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
