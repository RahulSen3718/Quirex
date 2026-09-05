import 'bootstrap/dist/css/bootstrap.min.css';
import 'bootstrap/dist/js/bootstrap.bundle.js'; 
import './App.css'
import { useLocation, Routes, Route, Navigate } from 'react-router-dom';
import TopNavbar from './components/landingComponents/TopNavbar';
import Navbar from './components/landingComponents/NavBar';
import Home from './components/landingComponents/Home';
import About from './components/landingComponents/About';
import Services from './components/landingComponents/Services';
import Property from './components/landingComponents/Property';
import UserRegister from './components/landingComponents/UserRegister';
import Footer from './components/landingComponents/Footer'
import Login from './components/landingComponents/Login';
import AddProperty from './components/AdminComponents/AddProperty';
import AdminPropertyList from './components/AdminComponents/AdminPropertyList';
import AdminSoldProperty from './components/AdminComponents/AdminSoldProperty';
import UserList from './components/AdminComponents/UserList';
import AdminProfile from './components/AdminComponents/AdminProfile';
import AdminContactUsList from './components/AdminComponents/AdminContactUsList';
import AdminCategoryManagement from './components/AdminComponents/AdminCategoryManagement';
import UserBoughtList from './components/userComponents/UserBoughtList';
import UserProfile from './components/userComponents/UserProfile';
import UserHome from './components/userComponents/UserHome';
import UserLogOut from './components/userComponents/UserLogOut';
import CategoryPage from './components/landingComponents/CategoryPage';
import ContactUs from './components/landingComponents/ContactUs';
import Counter from './components/landingComponents/Counter';
import NotFound from './NotFound';
import 'aos/dist/aos.css'
import AOS from 'aos';
import { useEffect, useState } from 'react';

// Protected Route Guard
const ProtectedRoute = ({ children, allowedRole }) => {
  let user = null;
  try {
    user = JSON.parse(localStorage.getItem("userInfo"));
  } catch (e) {
    user = null;
  }

  if (!user || !user._id) {
    return <Navigate to="/login" replace />;
  }

  if (allowedRole && user.userType !== allowedRole) {
    return <Navigate to={user.userType === "admin" ? "/admin-categories" : "/user-home"} replace />;
  }

  return children;
};

function App() {
  const location = useLocation();
  const [userData, setUserData] = useState(() => {
    try {
      return JSON.parse(localStorage.getItem('userInfo'));
    } catch {
      return null;
    }
  });

  useEffect(() => {
    const handleAuth = () => {
      try {
        const user = JSON.parse(localStorage.getItem("userInfo"));
        setUserData(user);
      } catch (e) {
        setUserData(null);
      }
    };
    handleAuth();
    window.addEventListener('storage', handleAuth);
    window.addEventListener('authChange', handleAuth);
    return () => {
      window.removeEventListener('storage', handleAuth);
      window.removeEventListener('authChange', handleAuth);
    };
  }, [location]);

  useEffect(() => {
    AOS.init({
      offset: 200,
      duration: 600,
      easing: 'ease-in-sine',
      delay: 100,
    });
  }, []);

  const isAuth = !!(userData && (userData._id || userData.email));
  const hideHeader = [
    '/register', 
    '/login', 
    '/user-home', 
    '/user-property', 
    '/user-bought', 
    '/user-profile',
    ...(isAuth ? ['/property', '/category'] : [])
  ].includes(location.pathname.toLowerCase());
  const hideFooter = [
    '/register', 
    '/login', 
    '/about', 
    '/services', 
    '/pages', 
    '/counter', 
    '/user-home', 
    '/user-property', 
    '/user-bought', 
    '/user-profile',
    '/category',
    '/categories',
    '/admin-categories',
    '/admin-manage',
    '/property',
    '/admin-list',
    '/admin-add',
    '/add-listing',
    '/add-property',
    '/admin-sold',
    '/contactus',
    '/contact',
    '/contact-us',
    '/admin-contact'
  ].includes(location.pathname.toLowerCase());

  return (
    <>
      {!hideHeader && <TopNavbar />}
      <Routes>
        {/* Public Routes */}
        <Route path='/' element={<Home />} />
        <Route path='/about' element={<About />} />
        <Route path='/services' element={<Services />} />
        <Route path='/property' element={<Property />} />
        <Route path='/category' element={<CategoryPage />} />
        <Route path='/categories' element={<CategoryPage />} />
        <Route path='/counter' element={<Counter />} />
        <Route path='/pages' element={<Counter />} />
        <Route path='/ContactUs' element={<ContactUs />} />
        <Route path='/contact' element={<ContactUs />} />
        <Route path='/contact-us' element={<ContactUs />} />
        <Route path='/register' element={<UserRegister />} />
        <Route path='/login' element={<Login />} />
        <Route path='/logout' element={<UserLogOut />} />
        <Route path='/user-logout' element={<UserLogOut />} />

        {/* Protected Admin Routes */}
        <Route path='/admin-categories' element={<ProtectedRoute allowedRole="admin"><AdminCategoryManagement /></ProtectedRoute>} />
        <Route path='/admin-manage' element={<ProtectedRoute allowedRole="admin"><AdminCategoryManagement /></ProtectedRoute>} />
        <Route path='/admin-add' element={<ProtectedRoute allowedRole="admin"><AddProperty /></ProtectedRoute>} />
        <Route path='/add-listing' element={<ProtectedRoute allowedRole="admin"><AddProperty /></ProtectedRoute>} />
        <Route path='/add-property' element={<ProtectedRoute allowedRole="admin"><AddProperty /></ProtectedRoute>} />
        <Route path='/admin-list' element={<ProtectedRoute allowedRole="admin"><AdminPropertyList /></ProtectedRoute>} />
        <Route path='/admin-sold' element={<ProtectedRoute allowedRole="admin"><AdminSoldProperty /></ProtectedRoute>} />
        <Route path='/admin-user' element={<ProtectedRoute allowedRole="admin"><UserList /></ProtectedRoute>} />
        <Route path='/admin-profile' element={<ProtectedRoute allowedRole="admin"><AdminProfile /></ProtectedRoute>} />
        <Route path='/admin-contact' element={<ProtectedRoute allowedRole="admin"><AdminContactUsList /></ProtectedRoute>} /> 

        {/* Protected User Routes */}
        <Route path='/user-home' element={<ProtectedRoute allowedRole="user"><UserHome /></ProtectedRoute>} />
        <Route path='/user-property' element={<ProtectedRoute allowedRole="user"><Property /></ProtectedRoute>} />
        <Route path='/user-bought' element={<ProtectedRoute allowedRole="user"><UserBoughtList /></ProtectedRoute>} />
        <Route path='/user-profile' element={<ProtectedRoute allowedRole="user"><UserProfile /></ProtectedRoute>} /> 

        <Route path='*' element={<NotFound />} />
      </Routes>
      {!hideFooter && <Footer />}
    </>
  );
}

export default App