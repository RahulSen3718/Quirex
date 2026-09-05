import React from 'react';
import { Link, useLocation } from 'react-router-dom';
import NavBar from './NavBar';
import { IoBedOutline, IoCarSportOutline, IoSparklesOutline } from "react-icons/io5";
import { LiaBathSolid } from "react-icons/lia";
import { TbVectorTriangle } from "react-icons/tb";
import { FaCheckCircle, FaArrowRight, FaBuilding } from "react-icons/fa";

const About = () => {
  const location = useLocation();
  const isFullPage = location?.pathname !== "/";

  const featurePoints = [
    "Verified Property Listings",
    "Easy Property Search & Smart Filters",
    "Simple Buying, Renting & Selling Experience",
    "Clear and Detailed Property Information"
  ];

  const propertySpecs = [
    {
      icon: <IoBedOutline />,
      value: "3",
      label: "Bedrooms"
    },
    {
      icon: <LiaBathSolid />,
      value: "2",
      label: "Bathrooms"
    },
    {
      icon: <IoCarSportOutline />,
      value: "2",
      label: "Parking"
    },
    {
      icon: <TbVectorTriangle />,
      value: "3450",
      label: "Sq. Ft."
    }
  ];

  return (
    <>
      {isFullPage && <NavBar />}
      <section className="quirex-about-section">
        <div className="container py-3 py-lg-4">
          <div className="row g-5 align-items-center">
            
            {/* Left Column: Brand Story, Features & Specifications */}
            <div className="col-12 col-lg-6" data-aos="fade-right">
              {/* Eyebrow Pill Badge */}
              <div className="mb-3">
                <span className="quirex-about-badge">
                  <IoSparklesOutline className="fs-6" />
                  About Us
                </span>
              </div>

              {/* Primary Section Heading */}
              <h1 className="quirex-about-title mb-3">
                Find a Place You'll Love to Call Home
              </h1>

              {/* Secondary Supporting Copy */}
              <p className="quirex-about-desc mb-4">
                QUIREX is a modern real estate platform designed to simplify the way people discover, buy, rent, and sell properties. Explore property listings, use smart filters, compare options, and find a property that fits your requirements.
              </p>

              {/* Real-Estate Value Checklist */}
              <div className="quirex-feature-list mb-4">
                {featurePoints.map((feature, idx) => (
                  <div key={idx} className="quirex-feature-item">
                    <FaCheckCircle className="quirex-feature-icon" />
                    <span>{feature}</span>
                  </div>
                ))}
              </div>

              {/* Property Specification Cards (PDF Specifications) */}
              <div className="mb-4">
                <div className="quirex-specs-grid">
                  {propertySpecs.map((spec, idx) => (
                    <div key={idx} className="quirex-spec-card">
                      <div className="quirex-spec-icon-wrap">
                        {spec.icon}
                      </div>
                      <div className="quirex-spec-value">{spec.value}</div>
                      <div className="quirex-spec-label">{spec.label}</div>
                    </div>
                  ))}
                </div>
              </div>

              {/* Call to Action Actions */}
              <div className="quirex-about-actions pt-2">
                <Link to="/property" className="quirex-about-btn-primary">
                  <span>Explore Properties</span>
                  <FaArrowRight className="fs-6" />
                </Link>
                <Link to="/ContactUs" className="quirex-about-btn-secondary">
                  Contact Advisory
                </Link>
              </div>
            </div>

            {/* Right Column: Architectural Visual Property Showcase */}
            <div className="col-12 col-lg-6" data-aos="fade-left">
              <div className="quirex-gallery-wrapper">
                
                {/* Large Primary Focal Showcase Card */}
                <div className="quirex-gallery-main-card">
                  <div className="quirex-gallery-badge-top">
                    <FaBuilding className="text-warning" />
                    <span>Featured Architecture</span>
                  </div>
                  <img 
                    src="/img/11.jpg.jpeg" 
                    alt="Modern QUIREX residential luxury villa architecture" 
                    className="quirex-gallery-main-img"
                    loading="eager"
                  />
                  <div className="quirex-gallery-overlay-caption">
                    <h5 className="fw-bold mb-1 text-white">Modern Architectural Villa</h5>
                    <p className="small text-white-50 mb-0">Designed for contemporary luxury & serene lifestyle</p>
                  </div>
                </div>

                {/* Sub-gallery Cards Row */}
                <div className="quirex-gallery-sub-row">
                  {/* Supporting Interior Card */}
                  <div className="quirex-gallery-sub-card">
                    <img 
                      src="/img/3.png" 
                      alt="Contemporary luxury living room interior design" 
                      className="quirex-gallery-sub-img"
                      loading="lazy"
                    />
                    <span className="quirex-gallery-sub-tag">Modern Interiors</span>
                  </div>

                  {/* Supporting Balcony/Exterior Card */}
                  <div className="quirex-gallery-sub-card">
                    <img 
                      src="/img/12.jpg.jpeg" 
                      alt="Luxury balcony with scenic view and outdoor lounge" 
                      className="quirex-gallery-sub-img"
                      loading="lazy"
                    />
                    <span className="quirex-gallery-sub-tag">Scenic Balcony View</span>
                  </div>
                </div>

              </div>
            </div>

          </div>
        </div>
      </section>
    </>
  );
};

export default About;
