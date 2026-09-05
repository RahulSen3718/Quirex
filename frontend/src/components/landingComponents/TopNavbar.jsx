import React, { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import { FaDribbble, FaInstagram, FaRegEnvelope, FaTwitter, FaPlus, FaLayerGroup } from "react-icons/fa";
import { FaLocationDot, FaFacebookF } from "react-icons/fa6";

const TopNavbar = () => {
  const [isAdmin, setIsAdmin] = useState(false);

  useEffect(() => {
    const checkRole = () => {
      try {
        const user = JSON.parse(localStorage.getItem('userInfo'));
        setIsAdmin(user?.userType === 'admin');
      } catch {
        setIsAdmin(false);
      }
    };
    checkRole();
    window.addEventListener('storage', checkRole);
    window.addEventListener('authChange', checkRole);
    return () => {
      window.removeEventListener('storage', checkRole);
      window.removeEventListener('authChange', checkRole);
    };
  }, []);

  return (
    <header className="quirex-topbar">
      <div className="container quirex-topbar-container">
        {/* Contact Details */}
        <div className="quirex-topbar-left">
          <a 
            href="mailto:Info@webmail.com" 
            className="quirex-topbar-link"
            title="Email support"
          >
            <FaRegEnvelope className="quirex-topbar-icon" />
            <span className="quirex-topbar-text">Info@webmail.com</span>
          </a>

          <div className="quirex-topbar-divider d-none d-sm-block"></div>

          <div className="quirex-topbar-link d-none d-sm-flex">
            <FaLocationDot className="quirex-topbar-icon" />
            <span className="quirex-topbar-text">15/A, NestTower, NYC</span>
          </div>
        </div>

        {/* Social Links & Role-Based CTA Button */}
        <div className="quirex-topbar-right">
          <div className="quirex-topbar-socials d-none d-md-flex">
            <a 
              href="https://facebook.com" 
              target="_blank"
              rel="noopener noreferrer"
              className="quirex-social-link" 
              aria-label="Visit our Facebook page"
              title="Facebook"
            >
              <FaFacebookF />
            </a>
            <a 
              href="https://twitter.com" 
              target="_blank"
              rel="noopener noreferrer"
              className="quirex-social-link" 
              aria-label="Visit our Twitter profile"
              title="Twitter"
            >
              <FaTwitter />
            </a>
            <a 
              href="https://instagram.com" 
              target="_blank"
              rel="noopener noreferrer"
              className="quirex-social-link" 
              aria-label="Visit our Instagram profile"
              title="Instagram"
            >
              <FaInstagram />
            </a>
            <a 
              href="https://dribbble.com" 
              target="_blank"
              rel="noopener noreferrer"
              className="quirex-social-link" 
              aria-label="Visit our Dribbble portfolio"
              title="Dribbble"
            >
              <FaDribbble />
            </a>
          </div>

          {isAdmin ? (
            <Link 
              to="/admin-add" 
              className="quirex-topbar-btn"
              title="Add Listing"
            >
              <FaPlus className="quirex-topbar-btn-icon" />
              <span>Add Listing</span>
            </Link>
          ) : (
            <Link 
              to="/category" 
              className="quirex-topbar-btn"
              title="Explore Real Estate Categories"
            >
              <FaLayerGroup className="quirex-topbar-btn-icon" />
              <span>Browse Categories</span>
            </Link>
          )}
        </div>
      </div>
    </header>
  );
};

export default TopNavbar;
