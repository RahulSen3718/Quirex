import React, { useState } from 'react';
import { Link } from 'react-router-dom';
import { 
  FaHome, 
  FaEnvelope, 
  FaTimes, 
  FaCheckCircle, 
  FaMapMarkerAlt, 
  FaShieldAlt,
  FaUser,
  FaPhoneAlt,
  FaCommentDots
} from "react-icons/fa";
import { IoSend } from "react-icons/io5";
import HeroTypewriter from '../userComponents/HeroTypewriter';

// Exact 3 rotating quotes for the Quirex Home Hero Section
const HOME_HERO_QUOTES = [
  {
    id: 1,
    line1: "Find Your Dream",
    line2: [
      { text: "Home ", isHighlight: true },
      { text: "with Us", isHighlight: false }
    ],
    fullText: "Find Your Dream Home with Us"
  },
  {
    id: 2,
    line1: "Find a Home",
    line2: [
      { text: "That Fits ", isHighlight: false },
      { text: "Your Vision", isHighlight: true }
    ],
    fullText: "Find a Home That Fits Your Vision"
  },
  {
    id: 3,
    line1: "Discover Your Perfect",
    line2: [
      { text: "Luxury", isHighlight: true },
      { text: " House", isHighlight: false }
    ],
    fullText: "Discover Your Perfect Luxury House"
  }
];

const Slider = () => {
  const [showEnquiryModal, setShowEnquiryModal] = useState(false);
  const [enquirySubmitted, setEnquirySubmitted] = useState(false);
  const [enquiryForm, setEnquiryForm] = useState({
    name: '',
    email: '',
    phone: '',
    propertyType: 'Luxury Villa & Pool',
    notes: ''
  });

  const handleEnquirySubmit = (e) => {
    e.preventDefault();
    setEnquirySubmitted(true);
    setTimeout(() => {
      setEnquirySubmitted(false);
      setShowEnquiryModal(false);
      setEnquiryForm({
        name: '',
        email: '',
        phone: '',
        propertyType: 'Luxury Villa & Pool',
        notes: ''
      });
    }, 2000);
  };

  return (
    <section className="quirex-luxury-hero-section position-relative" id="home-hero">
      <div className="container-fluid px-lg-5">
        <div className="quirex-luxury-hero-grid">

          {/* Left Column: Brand Tag, Typewriter Headline, Description & CTAs */}
          <div className="quirex-luxury-left-col">

            {/* Real Estate Agency Eyebrow */}
            <div className="quirex-agency-tag">
              <FaHome className="quirex-agency-tag-icon" />
              <span className="quirex-agency-tag-text">Real Estate Agency</span>
            </div>

            {/* Smooth Rotating Headline cycling through the 3 quotes */}
            <HeroTypewriter phrases={HOME_HERO_QUOTES} />

            {/* Concise Professional Hero Description */}
            <div className="quirex-luxury-desc-wrap">
              <p className="quirex-luxury-desc">
                Explore an exclusive collection of verified luxury residences and premier architectural estates across coveted locations. Our trusted real estate specialists guide you seamlessly to the home that elevates your luxury lifestyle and vision.
              </p>
            </div>

            {/* CTA Buttons Row */}
            <div className="quirex-luxury-cta-row">
              <Link
                to="/property"
                className="quirex-luxury-btn-enquiry"
                id="hero-explore-properties-btn"
              >
                Explore Properties
              </Link>

              <button
                type="button"
                onClick={() => setShowEnquiryModal(true)}
                className="quirex-luxury-btn-secondary"
                id="hero-enquiry-btn"
              >
                <FaEnvelope className="me-1" /> Make An Enquiry
              </button>
            </div>

            {/* Trust Indicators */}
            <div className="quirex-hero-trust-row mt-4 pt-2" aria-label="QUIREX core assurances">
              <div className="quirex-trust-item">
                <FaCheckCircle className="quirex-trust-icon" aria-hidden="true" />
                <span>Verified Listings</span>
              </div>
              <div className="quirex-trust-item">
                <FaShieldAlt className="quirex-trust-icon" aria-hidden="true" />
                <span>Prime Architecture</span>
              </div>
              <div className="quirex-trust-item">
                <FaMapMarkerAlt className="quirex-trust-icon" aria-hidden="true" />
                <span>Exclusive Locations</span>
              </div>
            </div>

          </div>

          {/* Right Column: Hero Visual */}
          <div className="quirex-luxury-right-col">
            <div className="quirex-hero-image-wrapper">
              <div className="quirex-hero-backdrop-glow" aria-hidden="true"></div>
              <img
                src="/img/21_1.png"
                alt="QUIREX Luxury Estate Showcase"
                className="quirex-hero-img img-fluid"
                loading="eager"
                onError={(e) => {
                  e.target.src = "https://images.unsplash.com/photo-1600596542815-ffad4c1539a9?auto=format&fit=crop&w=1200&q=80";
                }}
              />
            </div>
          </div>

        </div>
      </div>

      {/* VIP Enquiry Modal */}
      {showEnquiryModal && (
        <div className="quirex-modal-backdrop" onClick={() => setShowEnquiryModal(false)}>
          <div className="quirex-modal-card" onClick={(e) => e.stopPropagation()}>
            <button
              className="quirex-modal-close-btn"
              onClick={() => setShowEnquiryModal(false)}
              aria-label="Close modal"
              type="button"
            >
              <FaTimes />
            </button>

            <div className="mb-4">
              <h3 className="fw-bold text-dark mb-1">Make An Enquiry</h3>
              <p className="text-muted small mb-0">
                Inquire about our private luxury listings and custom bespoke villas.
              </p>
            </div>

            {enquirySubmitted ? (
              <div className="alert alert-success d-flex align-items-center gap-2 py-3 rounded-3">
                <FaCheckCircle className="fs-5 text-success flex-shrink-0" />
                <span>Thank you! Our luxury property specialist will contact you shortly.</span>
              </div>
            ) : (
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
                      value={enquiryForm.notes}
                      onChange={(e) => setEnquiryForm({ ...enquiryForm, notes: e.target.value })}
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
            )}
          </div>
        </div>
      )}
    </section>
  );
};

export default Slider;
