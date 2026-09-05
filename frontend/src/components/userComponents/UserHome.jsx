import React, { useEffect, useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import {
  FaHome,
  FaPlay,
  FaTimes,
  FaSignOutAlt,
  FaUser,
  FaShoppingBag,
  FaBuilding,
  FaPaperPlane,
  FaArrowRight,
  FaEnvelope,
  FaPhoneAlt,
  FaCommentDots
} from 'react-icons/fa';
import { IoSend } from 'react-icons/io5';
import HeroTypewriter from './HeroTypewriter';
import Typewriter from 'typewriter-effect';
import Swal from 'sweetalert2';
import axios from 'axios';
import { API_BASE_URL } from '../../config/api';

const UserHome = () => {
  const navigate = useNavigate();
  const [userData, setUserData] = useState(null);
  const [activeImgIndex, setActiveImgIndex] = useState(0);
  const [showEnquiryModal, setShowEnquiryModal] = useState(false);
  const [showVideoModal, setShowVideoModal] = useState(false);
  const [boughtCount, setBoughtCount] = useState(0);
  const [enquiryForm, setEnquiryForm] = useState({
    name: '',
    email: '',
    phone: '',
    propertyType: 'Luxury Villa & Pool',
    message: ''
  });

  const heroGallery = [
    {
      id: 0,
      title: "Luxury Living Room & Pool Patio",
      img: "/img/luxury-living-pool-hero.jpg",
      fallback: "/img/hero-luxury-living.png",
      thumb: "/img/luxury-living-pool-hero.jpg",
      alt: "Modern luxury living room opening to private swimming pool"
    },
    {
      id: 1,
      title: "Master Bedroom Suite",
      img: "/img/2.jpg.jpeg",
      fallback: "/img/2.jpg_1.jpeg",
      thumb: "/img/2.jpg.jpeg",
      alt: "Contemporary master bedroom with custom acoustic wood wall and ensuite bath"
    },
    {
      id: 2,
      title: "Classic Contemporary Living Room",
      img: "/img/3.png",
      fallback: "/img/7.png",
      thumb: "/img/3.png",
      alt: "Designer tufted sofa and bespoke wooden cage chandelier lounge"
    }
  ];


  const areaProperties = [
    {
      id: 1,
      badge: "2 PROPERTIES",
      location: "San Francisco",
      title: "Mission District Area",
      img: "/img/1.jpg.jpeg",
      alt: "Mission District Area luxury white modern villa with manicured lawn"
    },
    {
      id: 2,
      badge: "5 PROPERTIES",
      location: "New York",
      title: "Pacific Heights Area",
      img: "/img/2.jpg.jpeg",
      alt: "Pacific Heights Area bespoke luxury bedroom interior"
    },
    {
      id: 3,
      badge: "9 PROPERTIES",
      location: "Sedona, Arizona",
      title: "Noe Valley Zones",
      img: "/img/3.jpg.jpeg",
      alt: "Noe Valley Zones grand curved wooden staircase and spacious foyer"
    }
  ];

  useEffect(() => {
    try {
      const user = JSON.parse(localStorage.getItem('userInfo'));
      setUserData(user);
      if (user?._id) {
        fetchBoughtCount(user._id);
        setEnquiryForm(prev => ({
          ...prev,
          name: user.name || '',
          email: user.email || '',
          phone: user.mobile || ''
        }));
      }
    } catch (e) {
      setUserData(null);
    }
  }, []);

  const fetchBoughtCount = async (userId) => {
    try {
      const res = await axios.post(`${API_BASE_URL}/api/user-bought-list`, { userId });
      if (res?.data?.code === 200) {
        setBoughtCount(res?.data?.data?.length || 0);
      }
    } catch (e) {
      // Graceful fallback
    }
  };

  const handleLogout = () => {
    Swal.fire({
      title: "Sign Out",
      text: "Are you sure you want to sign out of your account?",
      icon: "question",
      showCancelButton: true,
      confirmButtonColor: "#FF5A3C",
      cancelButtonColor: "#64748b",
      confirmButtonText: "Yes, Sign Out",
      cancelButtonText: "Cancel"
    }).then((result) => {
      if (result.isConfirmed) {
        try {
          localStorage.removeItem('userInfo');
          sessionStorage.clear();
        } catch (e) {
          console.error("Error clearing user storage:", e);
        }
        setUserData(null);
        window.dispatchEvent(new Event('authChange'));
        navigate('/login', { replace: true });
      }
    });
  };

  const handleEnquirySubmit = (e) => {
    e.preventDefault();
    setShowEnquiryModal(false);
    Swal.fire({
      title: "Enquiry Sent Successfully!",
      text: "Our dedicated luxury real estate consultant will contact you shortly.",
      icon: "success",
      confirmButtonColor: "#FF5A3C"
    });
  };

  return (
    <div className="quirex-luxury-page-root">
      {/* Sleek Floating Header for Logged-In User */}
      <header className="quirex-luxury-topbar">
        <Link to="/user-home" className="quirex-luxury-brand">
          <span className="brand-dot">✦</span> QUIREX<span className="brand-accent">.</span>
        </Link>

        <div className="quirex-luxury-user-pill">
          <span className="quirex-user-badge-name d-none d-md-inline">
            Hello, <strong className="text-dark">{userData?.name || 'Client'}</strong>
          </span>
          <div className="vr d-none d-md-block opacity-25" style={{ height: '16px' }}></div>
          <Link to="/user-property" className="quirex-user-nav-link">
            <FaBuilding /> Properties
          </Link>
          <Link to="/user-bought" className="quirex-user-nav-link">
            <FaShoppingBag /> My Orders ({boughtCount})
          </Link>
          <Link to="/user-profile" className="quirex-user-nav-link">
            <FaUser /> Profile
          </Link>
          <button onClick={handleLogout} className="quirex-user-logout-btn" title="Sign Out">
            <FaSignOutAlt /> <span className="d-none d-sm-inline">Sign Out</span>
          </button>
        </div>
      </header>

      <section className="quirex-luxury-hero-grid">
        <div className="quirex-luxury-left-col">
          <div className="quirex-agency-tag">
            <FaHome className="quirex-agency-tag-icon" />
            <span className="quirex-agency-tag-text">Real Estate Agency</span>
          </div>

          <HeroTypewriter />

          <div className="quirex-luxury-desc-wrap">
            <p className="quirex-luxury-desc">
              Discover premium properties in exceptional locations, carefully selected to match your lifestyle. Find your ideal home with trusted guidance and a seamless property experience.
            </p>
          </div>

          <div className="quirex-luxury-cta-row">
            <button
              onClick={() => setShowEnquiryModal(true)}
              className="quirex-luxury-btn-enquiry"
            >
              Make An Enquiry
            </button>

            <button
              onClick={() => setShowVideoModal(true)}
              className="quirex-luxury-btn-play"
              title="Watch Luxury Property Walkthrough"
              aria-label="Play Video Tour"
            >
              <FaPlay className="quirex-play-icon" />
            </button>
          </div>
        </div>

        <div className="quirex-luxury-right-col">
          <div className="quirex-hero-img-viewport">
            <img
              key={activeImgIndex}
              src={heroGallery[activeImgIndex].img}
              alt={heroGallery[activeImgIndex].alt}
              className="quirex-luxury-hero-img"
              onError={(e) => {
                e.target.src = heroGallery[activeImgIndex].fallback;
              }}
            />
          </div>

          <div className="quirex-luxury-thumbnails-container">
            {heroGallery.map((item, idx) => (
              <div
                key={item.id}
                className={`quirex-luxury-thumb-card ${activeImgIndex === idx ? 'active' : ''}`}
                onClick={() => setActiveImgIndex(idx)}
                title={item.title}
                role="button"
                tabIndex={0}
                onKeyDown={(e) => {
                  if (e.key === 'Enter' || e.key === ' ') setActiveImgIndex(idx);
                }}
              >
                <img
                  src={item.thumb}
                  alt={item.title}
                  onError={(e) => { e.target.src = item.fallback; }}
                />
              </div>
            ))}
          </div>
        </div>
      </section>

      <section className="quirex-area-section">
        <div className="quirex-area-container">
          <div className="quirex-area-header">
            <span className="quirex-area-eyebrow">Area Properties</span>
            <h2 className="quirex-area-heading">
              Find Your Dream House <br />
              <span className="quirex-typewriter-inline">
                <Typewriter
                  options={{
                    strings: ['Search By Area', 'Discover Prime Zones', 'Explore Luxury Areas'],
                    autoStart: true,
                    loop: true,
                    delay: 70,
                    deleteSpeed: 45,
                  }}
                />
              </span>
            </h2>
          </div>

          {/* 3 Responsive Property Cards Grid */}
          <div className="quirex-area-grid">
            {areaProperties.map((card) => (
              <div key={card.id} className="quirex-area-card">
                <div className="quirex-area-card-img-wrap">
                  <span className="quirex-area-badge">{card.badge}</span>
                  <img
                    src={card.img}
                    alt={card.alt}
                    className="quirex-area-card-img"
                  />
                </div>

                <div className="quirex-area-card-body">
                  <span className="quirex-area-card-location">{card.location}</span>
                  <h3 className="quirex-area-card-title">{card.title}</h3>
                  <Link
                    to={`/user-property?area=${encodeURIComponent(card.location)}`}
                    className="quirex-area-card-link"
                  >
                    <span>View Property</span>
                    <FaArrowRight className="quirex-link-arrow" />
                  </Link>
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {showEnquiryModal && (
        <div className="quirex-modal-backdrop" onClick={() => setShowEnquiryModal(false)}>
          <div className="quirex-modal-card" onClick={(e) => e.stopPropagation()}>
            <button
              className="quirex-modal-close-btn"
              onClick={() => setShowEnquiryModal(false)}
              aria-label="Close modal"
            >
              <FaTimes />
            </button>

            <div className="mb-4">
              <h3 className="fw-bold text-dark mb-1">Make An Enquiry</h3>
              <p className="text-muted small mb-0">
                Inquire about our private luxury listings and custom bespoke villas.
              </p>
            </div>

            <form onSubmit={handleEnquirySubmit}>
              <div className="mb-3">
                <label className="quirex-modern-label">Your Name <span className="text-danger">*</span></label>
                <div className="quirex-modern-field-wrap">
                  <FaUser className="quirex-modern-field-icon" />
                  <input
                    type="text"
                    className="quirex-modern-input"
                    value={enquiryForm.name}
                    onChange={(e) => setEnquiryForm({ ...enquiryForm, name: e.target.value })}
                    placeholder="Enter your name"
                    required
                  />
                </div>
              </div>

              <div className="row g-3 mb-3">
                <div className="col-12 col-md-6">
                  <label className="quirex-modern-label">Email Address <span className="text-danger">*</span></label>
                  <div className="quirex-modern-field-wrap">
                    <FaEnvelope className="quirex-modern-field-icon" />
                    <input
                      type="email"
                      className="quirex-modern-input"
                      value={enquiryForm.email}
                      onChange={(e) => setEnquiryForm({ ...enquiryForm, email: e.target.value })}
                      placeholder="Enter your email"
                      required
                    />
                  </div>
                </div>
                <div className="col-12 col-md-6">
                  <label className="quirex-modern-label">Phone Number <span className="text-danger">*</span></label>
                  <div className="quirex-modern-field-wrap">
                    <FaPhoneAlt className="quirex-modern-field-icon" />
                    <input
                      type="tel"
                      className="quirex-modern-input"
                      value={enquiryForm.phone}
                      onChange={(e) => setEnquiryForm({ ...enquiryForm, phone: e.target.value })}
                      placeholder="Enter phone number"
                      required
                    />
                  </div>
                </div>
              </div>

              <div className="mb-3">
                <label className="quirex-modern-label">Property Interest</label>
                <select
                  className="form-select quirex-modern-input"
                  style={{ paddingLeft: '14px' }}
                  value={enquiryForm.propertyType}
                  onChange={(e) => setEnquiryForm({ ...enquiryForm, propertyType: e.target.value })}
                >
                  <option value="Luxury Villa & Pool">Luxury Villa & Private Pool</option>
                  <option value="Penthouse Skyline">Penthouse Skyline Suite</option>
                  <option value="Modern Architectural Estate">Modern Architectural Estate</option>
                  <option value="Waterfront Residence">Waterfront Residence</option>
                </select>
              </div>

              <div className="mb-4">
                <label className="quirex-modern-label">Message / Requirements</label>
                <div className="quirex-modern-field-wrap align-items-start">
                  <FaCommentDots className="quirex-modern-field-icon" style={{ top: '14px' }} />
                  <textarea
                    className="quirex-modern-textarea"
                    rows="3"
                    value={enquiryForm.message}
                    onChange={(e) => setEnquiryForm({ ...enquiryForm, message: e.target.value })}
                    placeholder="Write your message or inquiry here..."
                  ></textarea>
                </div>
              </div>

              <button
                type="submit"
                className="quirex-btn-submit w-100 py-3"
              >
                <IoSend /> Submit Enquiry
              </button>
            </form>
          </div>
        </div>
      )}

      {showVideoModal && (
        <div className="quirex-modal-backdrop" onClick={() => setShowVideoModal(false)}>
          <div className="quirex-video-modal-card" onClick={(e) => e.stopPropagation()}>
            <button
              className="quirex-video-close-btn"
              onClick={() => setShowVideoModal(false)}
              aria-label="Close video"
            >
              <FaTimes />
            </button>

            <div className="ratio ratio-16x9">
              <iframe
                src="https://www.youtube-nocookie.com/embed/dQw4w9WgXcQ?autoplay=1&mute=0"
                title="Luxury Real Estate Architectural Tour"
                allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture"
                allowFullScreen
              ></iframe>
            </div>

            <div className="p-4 bg-dark text-white d-flex justify-content-between align-items-center flex-wrap gap-2">
              <div>
                <h5 className="fw-bold mb-1">Architectural Walkthrough: {heroGallery[activeImgIndex].title}</h5>
                <p className="text-secondary small mb-0">Ultra 4K HDR Virtual Experience</p>
              </div>
              <button
                onClick={() => { setShowVideoModal(false); setShowEnquiryModal(true); }}
                className="btn btn-sm text-white px-3 py-2 fw-semibold"
                style={{ backgroundColor: '#FF5A3C' }}
              >
                Inquire About This Home
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default UserHome;
