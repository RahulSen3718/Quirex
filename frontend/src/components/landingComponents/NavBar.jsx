import React, { useEffect, useState, useRef } from 'react';
import { Link, useNavigate, useLocation } from 'react-router-dom';
import { 
  FaBars, 
  FaTimes, 
  FaSignOutAlt, 
  FaUserCircle, 
  FaSearch, 
  FaShoppingBag, 
  FaRegUser, 
  FaShieldAlt,
  FaListAlt,
  FaHome,
  FaBuilding
} from "react-icons/fa";
import { IoSearchOutline, IoBagHandleOutline, IoPersonOutline, IoCloseOutline } from "react-icons/io5";
import axios from 'axios';
import { API_BASE_URL } from '../../config/api';

const NavBar = () => {
  const navigate = useNavigate();
  const location = useLocation();
  const [userData, setUserData] = useState(() => {
    try {
      return JSON.parse(localStorage.getItem('userInfo'));
    } catch {
      return null;
    }
  });
  const [isScrolled, setIsScrolled] = useState(false);
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);
  const [isSearchOpen, setIsSearchOpen] = useState(false);
  const [isUserDropdownOpen, setIsUserDropdownOpen] = useState(false);
  const [searchQuery, setSearchQuery] = useState('');
  const [orderCount, setOrderCount] = useState(0);

  const searchInputRef = useRef(null);
  const userDropdownRef = useRef(null);

  // Sync user data on route changes and auth events
  const loadUser = () => {
    try {
      const stored = localStorage.getItem('userInfo');
      const user = stored ? JSON.parse(stored) : null;
      setUserData(user);
      if (user?._id) {
        fetchOrderCount(user._id);
      } else {
        setOrderCount(0);
      }
    } catch (e) {
      console.error('Error loading user data in navbar:', e);
      setUserData(null);
      setOrderCount(0);
    }
  };

  useEffect(() => {
    loadUser();
    window.addEventListener('storage', loadUser);
    window.addEventListener('authChange', loadUser);
    return () => {
      window.removeEventListener('storage', loadUser);
      window.removeEventListener('authChange', loadUser);
    };
  }, [location]);

  // Fetch acquired properties count for cart badge
  const fetchOrderCount = async (userId) => {
    try {
      const response = await axios.post(`${API_BASE_URL}/api/user-bought-list`, {
        userId
      });
      if (response?.data?.code === 200) {
        setOrderCount(response?.data?.data?.length || 0);
      }
    } catch (e) {
      // Quiet fail if endpoint is busy
    }
  };

  // Scroll detection for sticky elevated navbar
  useEffect(() => {
    const handleScroll = () => {
      setIsScrolled(window.scrollY > 20);
    };
    window.addEventListener('scroll', handleScroll);
    return () => window.removeEventListener('scroll', handleScroll);
  }, []);

  // Close menus on route change
  useEffect(() => {
    setIsMobileMenuOpen(false);
    setIsUserDropdownOpen(false);
    setIsSearchOpen(false);
  }, [location.pathname]);

  // Focus input when search opens
  useEffect(() => {
    if (isSearchOpen && searchInputRef.current) {
      setTimeout(() => {
        searchInputRef.current?.focus();
      }, 100);
    }
  }, [isSearchOpen]);

  // Click outside to close user dropdown & search on ESC
  useEffect(() => {
    const handleClickOutside = (e) => {
      if (userDropdownRef.current && !userDropdownRef.current.contains(e.target)) {
        setIsUserDropdownOpen(false);
      }
    };
    const handleKeyDown = (e) => {
      if (e.key === 'Escape') {
        setIsSearchOpen(false);
        setIsUserDropdownOpen(false);
      }
    };
    document.addEventListener('mousedown', handleClickOutside);
    document.addEventListener('keydown', handleKeyDown);
    return () => {
      document.removeEventListener('mousedown', handleClickOutside);
      document.removeEventListener('keydown', handleKeyDown);
    };
  }, []);

  const handleLogout = () => {
    try {
      localStorage.removeItem('userInfo');
      sessionStorage.clear();
    } catch (e) {
      console.error("Error clearing user storage:", e);
    }
    setUserData(null);
    setOrderCount(0);
    setIsMobileMenuOpen(false);
    setIsUserDropdownOpen(false);
    window.dispatchEvent(new Event('authChange'));
    navigate('/login', { replace: true });
  };

  const handleSearchSubmit = (e) => {
    e.preventDefault();
    setIsSearchOpen(false);
    navigate(isUser ? '/user-property' : '/property');
  };

  const handleSearchTagClick = (tag) => {
    setIsSearchOpen(false);
    navigate(isUser ? '/user-property' : '/property');
  };

  const isActive = (path) => {
    if (path === '/' && (location.pathname === '/' || location.pathname === '/user-home')) return true;
    if (path !== '/' && location.pathname.toLowerCase() === path.toLowerCase()) return true;
    return false;
  };

  const toggleMobileMenu = () => {
    setIsMobileMenuOpen(!isMobileMenuOpen);
  };

  const isAdmin = userData?.userType === 'admin';
  const isUser = !!(userData && !isAdmin && (userData._id || userData.email || userData.name));

  // Determine Logo Destination
  const logoDestination = isAdmin
    ? '/admin-add' 
    : isUser
      ? '/user-home' 
      : '/';

  return (
    <>
      {/* Quick Property Search Modal Overlay */}
      {isSearchOpen && (
        <div className="quirex-search-overlay" onClick={() => setIsSearchOpen(false)}>
          <div className="quirex-search-card" onClick={(e) => e.stopPropagation()}>
            <div className="d-flex align-items-center justify-content-between mb-3">
              <h5 className="fw-bold mb-0 text-dark d-flex align-items-center gap-2">
                <IoSearchOutline className="text-coral" /> Search Properties
              </h5>
              <button 
                type="button" 
                className="btn btn-sm btn-light rounded-circle p-1"
                onClick={() => setIsSearchOpen(false)}
                aria-label="Close search"
              >
                <IoCloseOutline size={22} />
              </button>
            </div>

            <form onSubmit={handleSearchSubmit}>
              <div className="position-relative mb-3">
                <IoSearchOutline 
                  size={20} 
                  className="position-absolute top-50 translate-middle-y text-muted" 
                  style={{ left: '16px' }}
                />
                <input
                  ref={searchInputRef}
                  type="text"
                  className="quirex-search-card-input"
                  placeholder="Search by city, title, property type, or keyword..."
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                />
              </div>

              <div className="d-flex align-items-center justify-content-between flex-wrap gap-2 pt-1">
                <div className="d-flex align-items-center gap-2 flex-wrap">
                  <span className="small text-muted fw-semibold">Popular:</span>
                  <button type="button" className="quirex-search-tag-chip" onClick={() => handleSearchTagClick('Villa')}>Villa</button>
                  <button type="button" className="quirex-search-tag-chip" onClick={() => handleSearchTagClick('Apartment')}>Apartment</button>
                  <button type="button" className="quirex-search-tag-chip" onClick={() => handleSearchTagClick('For Rent')}>For Rent</button>
                  <button type="button" className="quirex-search-tag-chip" onClick={() => handleSearchTagClick('For Sale')}>For Sale</button>
                </div>
                <button type="submit" className="btn btn-primary bggcolor border-0 px-4 py-2 rounded-pill fw-semibold text-white">
                  Find Properties
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Main QUIREX Navigation Bar */}
      <nav className={`quirex-navbar sticky-top ${isScrolled ? 'scrolled' : ''}`}>
        <div className="container">
          <div className="d-flex align-items-center justify-content-between w-100">
            
            {/* 1. Brand Logo */}
            <Link to={logoDestination} className="quirex-brand text-decoration-none">
              <img src="/img/favicon.png" alt="QUiREX" className="quirex-brand-img" />
              <span className="quirex-brand-name">
                QUIREX<span className="quirex-brand-dot">.</span>
                {isAdmin && (
                  <span className="quirex-brand-badge ms-2">Admin</span>
                )}
              </span>
            </Link>

            {/* 2. Center Navigation Links (Desktop) */}
            <div className="d-none d-lg-flex align-items-center quirex-nav-links-wrap">
              {isAdmin ? (
                <>
                  <Link className={`quirex-nav-link ${isActive('/admin-categories') || isActive('/admin-manage') ? 'active' : ''}`} to="/admin-categories">Categories & Hub</Link>
                  <Link className={`quirex-nav-link ${isActive('/admin-add') ? 'active' : ''}`} to="/admin-add">Add Property</Link>
                  <Link className={`quirex-nav-link ${isActive('/admin-list') ? 'active' : ''}`} to="/admin-list">Properties</Link>
                  <Link className={`quirex-nav-link ${isActive('/admin-sold') ? 'active' : ''}`} to="/admin-sold">Sold</Link>
                  <Link className={`quirex-nav-link ${isActive('/admin-user') ? 'active' : ''}`} to="/admin-user">Users</Link>
                  <Link className={`quirex-nav-link ${isActive('/admin-profile') ? 'active' : ''}`} to="/admin-profile">Profile</Link>
                  <Link className={`quirex-nav-link ${isActive('/admin-contact') ? 'active' : ''}`} to="/admin-contact">Messages</Link>
                </>
              ) : isUser ? (
                <>
                  <Link className={`quirex-nav-link ${isActive('/user-home') || isActive('/') ? 'active' : ''}`} to="/user-home">
                    Home
                  </Link>
                  <Link className={`quirex-nav-link ${isActive('/category') ? 'active' : ''}`} to="/category">
                    Categories
                  </Link>
                  <Link className={`quirex-nav-link ${isActive('/user-property') || isActive('/property') ? 'active' : ''}`} to="/user-property">
                    Properties
                  </Link>
                  <Link className={`quirex-nav-link ${isActive('/user-bought') ? 'active' : ''}`} to="/user-bought">
                    My Orders
                  </Link>
                  <Link className={`quirex-nav-link ${isActive('/user-profile') ? 'active' : ''}`} to="/user-profile">
                    <FaRegUser className="me-1 small text-coral" /> Profile
                  </Link>
                </>
              ) : (
                <>
                  <Link className={`quirex-nav-link ${isActive('/') ? 'active' : ''}`} to="/">Home</Link>
                  <Link className={`quirex-nav-link ${isActive('/about') ? 'active' : ''}`} to="/about">About</Link>
                  <Link className={`quirex-nav-link ${isActive('/services') ? 'active' : ''}`} to="/services">Services</Link>
                  <Link className={`quirex-nav-link ${isActive('/category') ? 'active' : ''}`} to="/category">Categories</Link>
                  <Link className={`quirex-nav-link ${isActive('/property') ? 'active' : ''}`} to="/property">Property</Link>
                  <Link className={`quirex-nav-link ${isActive('/counter') || isActive('/pages') ? 'active' : ''}`} to="/counter">Pages</Link>
                  <Link className={`quirex-nav-link ${isActive('/ContactUs') ? 'active' : ''}`} to="/ContactUs">Contact Us</Link>
                </>
              )}
            </div>

            {/* 3. Right-Side Action Icons & CTA Group */}
            <div className="d-flex align-items-center gap-2 gap-md-3">
              
              {/* Action Icons Group [ Search ] [ User Profile / Dropdown ] [ Cart / Orders ] */}
              {!isUser && (
                <div className="quirex-action-group">
                  
                  {/* Search Action Button */}
                  <button
                    type="button"
                    className="quirex-action-btn"
                    onClick={() => setIsSearchOpen(true)}
                    aria-label="Search properties"
                    title="Search properties"
                  >
                    <IoSearchOutline />
                  </button>

                  {/* User / Account Action Button with Dropdown */}
                  <div className="quirex-dropdown-wrap" ref={userDropdownRef}>
                    <button
                      type="button"
                      className={`quirex-action-btn ${isUserDropdownOpen ? 'active' : ''}`}
                      onClick={() => setIsUserDropdownOpen(!isUserDropdownOpen)}
                      aria-label="User account menu"
                      aria-expanded={isUserDropdownOpen}
                      title={userData ? `Account: ${userData.name || 'User'}` : "Sign In / Register"}
                    >
                      <IoPersonOutline />
                    </button>

                    {/* Dropdown Menu */}
                    {isUserDropdownOpen && (
                      <div className="quirex-user-dropdown shadow-lg">
                        {userData ? (
                          <>
                            <div className="quirex-dropdown-header">
                              <div className="quirex-dropdown-user-name">
                                {userData?.name || (isAdmin ? 'Administrator' : 'Client Account')}
                              </div>
                              <div className="quirex-dropdown-user-email">
                                {userData?.email || ''}
                              </div>
                            </div>

                            {isAdmin && (
                              <>
                                <Link to="/admin-categories" className="quirex-dropdown-item">
                                  <FaListAlt className="text-coral" /> Categories & Services Hub
                                </Link>
                                <Link to="/admin-profile" className="quirex-dropdown-item">
                                  <FaShieldAlt className="text-coral" /> Admin Profile
                                </Link>
                                <Link to="/admin-list" className="quirex-dropdown-item">
                                  <FaListAlt className="text-coral" /> Property Management
                                </Link>
                                <Link to="/admin-sold" className="quirex-dropdown-item">
                                  <FaShoppingBag className="text-coral" /> Sold Properties
                                </Link>
                              </>
                            )}

                            <div className="border-top my-1"></div>
                            <button onClick={handleLogout} className="quirex-dropdown-item danger">
                              <FaSignOutAlt className="text-danger" /> Sign Out
                            </button>
                          </>
                        ) : (
                          <>
                            <div className="quirex-dropdown-header">
                              <div className="quirex-dropdown-user-name">Welcome to QUIREX</div>
                              <div className="quirex-dropdown-user-email">Sign in to manage properties</div>
                            </div>
                            <Link to="/login" className="quirex-dropdown-item">
                              <IoPersonOutline className="text-coral" /> Sign In
                            </Link>
                            <Link to="/register" className="quirex-dropdown-item">
                              <FaRegUser className="text-coral" /> Create Account
                            </Link>
                          </>
                        )}
                      </div>
                    )}
                  </div>

                  {/* Cart / Orders Action Button */}
                  <Link
                    to={userData ? (isAdmin ? '/admin-sold' : '/user-bought') : '/login'}
                    className="quirex-action-btn"
                    aria-label="View bought properties and orders"
                    title={isAdmin ? "Sold Properties" : "My Orders"}
                  >
                    <IoBagHandleOutline />
                    {orderCount > 0 && (
                      <span className="quirex-cart-badge">{orderCount}</span>
                    )}
                  </Link>

                </div>
              )}

              {/* Sign Out Button */}
              {userData && (
                <div className="d-flex align-items-center gap-2 ps-1">
                  <button onClick={handleLogout} className="btn navbar-btn-logout d-flex align-items-center gap-2">
                    <FaSignOutAlt /> Sign Out
                  </button>
                </div>
              )}

              {/* Mobile Menu Hamburger Toggle */}
              <button
                className="quirex-mobile-toggle d-lg-none"
                type="button"
                onClick={toggleMobileMenu}
                aria-label="Toggle navigation menu"
                aria-expanded={isMobileMenuOpen}
              >
                {isMobileMenuOpen ? <FaTimes size={18} /> : <FaBars size={18} />}
              </button>

            </div>

          </div>

          {/* Mobile Responsive Collapsible Menu */}
          {isMobileMenuOpen && (
            <div className="quirex-mobile-menu d-lg-none py-3 border-top mt-2">
              <div className="d-flex flex-column gap-1 mb-3">
                {isAdmin ? (
                  <>
                    <Link className={`quirex-mobile-nav-link ${isActive('/admin-categories') ? 'active' : ''}`} to="/admin-categories">Categories & Hub</Link>
                    <Link className={`quirex-mobile-nav-link ${isActive('/admin-add') ? 'active' : ''}`} to="/admin-add">Add Property</Link>
                    <Link className={`quirex-mobile-nav-link ${isActive('/admin-list') ? 'active' : ''}`} to="/admin-list">Property List</Link>
                    <Link className={`quirex-mobile-nav-link ${isActive('/admin-sold') ? 'active' : ''}`} to="/admin-sold">Sold Properties</Link>
                    <Link className={`quirex-mobile-nav-link ${isActive('/admin-user') ? 'active' : ''}`} to="/admin-user">Users</Link>
                    <Link className={`quirex-mobile-nav-link ${isActive('/admin-profile') ? 'active' : ''}`} to="/admin-profile">Admin Profile</Link>
                    <Link className={`quirex-mobile-nav-link ${isActive('/admin-contact') ? 'active' : ''}`} to="/admin-contact">Messages</Link>
                  </>
                ) : isUser ? (
                  <>
                    <Link className={`quirex-mobile-nav-link ${isActive('/user-home') ? 'active' : ''}`} to="/user-home">Home</Link>
                    <Link className={`quirex-mobile-nav-link ${isActive('/category') ? 'active' : ''}`} to="/category">Categories</Link>
                    <Link className={`quirex-mobile-nav-link ${isActive('/user-property') || isActive('/property') ? 'active' : ''}`} to="/user-property">Properties</Link>
                    <Link className={`quirex-mobile-nav-link ${isActive('/user-bought') ? 'active' : ''}`} to="/user-bought">My Orders</Link>
                    <Link className={`quirex-mobile-nav-link ${isActive('/user-profile') ? 'active' : ''}`} to="/user-profile">Profile</Link>
                  </>
                ) : (
                  <>
                    <Link className={`quirex-mobile-nav-link ${isActive('/') ? 'active' : ''}`} to="/">Home</Link>
                    <Link className={`quirex-mobile-nav-link ${isActive('/about') ? 'active' : ''}`} to="/about">About Us</Link>
                    <Link className={`quirex-mobile-nav-link ${isActive('/services') ? 'active' : ''}`} to="/services">Services</Link>
                    <Link className={`quirex-mobile-nav-link ${isActive('/category') ? 'active' : ''}`} to="/category">Categories</Link>
                    <Link className={`quirex-mobile-nav-link ${isActive('/property') ? 'active' : ''}`} to="/property">Property</Link>
                    <Link className={`quirex-mobile-nav-link ${isActive('/ContactUs') ? 'active' : ''}`} to="/ContactUs">Contact Us</Link>
                  </>
                )}
              </div>

              {userData ? (
                <div className="pt-2 border-top">
                  <button onClick={handleLogout} className="btn navbar-btn-logout w-100 d-flex align-items-center justify-content-center gap-2 py-2">
                    <FaSignOutAlt /> Sign Out ({userData.name || 'User'})
                  </button>
                </div>
              ) : (
                <div className="pt-2 border-top d-flex gap-2">
                  <Link to="/login" className="btn btn-outline-secondary w-50 py-2">Sign In</Link>
                  <Link to="/register" className="btn btn-primary bggcolor text-white w-50 py-2 border-0">Sign Up</Link>
                </div>
              )}
            </div>
          )}

        </div>
      </nav>
    </>
  );
};

export default NavBar;
