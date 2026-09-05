import React from "react";
import { Link, useLocation } from "react-router-dom";
import NavBar from "./NavBar";
import { FaArrowRight } from "react-icons/fa";
import { IoSparklesOutline } from "react-icons/io5";

const Services = () => {
  const location = useLocation();
  const isFullPage = location?.pathname !== "/";

  const servicesData = [
    {
      id: "buy",
      image: "/img/home.png",
      alt: "Buy a home with Quirex",
      title: "Buy a Home",
      desc: "Discover verified properties that match your lifestyle, budget, and location preferences. Find a place you'll be proud to call home.",
      ctaText: "Explore Homes",
      link: "/property",
      delay: "100"
    },
    {
      id: "rent",
      image: "/img/22.png",
      alt: "Rent a home with Quirex",
      title: "Rent a Home",
      desc: "Find comfortable rental properties in the locations you love, with options designed around your needs and budget.",
      ctaText: "Explore Rentals",
      link: "/property",
      delay: "200"
    },
    {
      id: "sell",
      image: "/img/23.png",
      alt: "Sell a home with Quirex",
      title: "Sell a Home",
      desc: "Showcase your property to the right audience and move toward a faster, smoother, and more confident sale.",
      ctaText: "List Your Property",
      link: "/admin-add",
      delay: "300"
    }
  ];

  return (
    <>
      {isFullPage && <NavBar />}
      <section className="quirex-services-section">
        <div className="container">
          
          {/* Section Header */}
          <div className="quirex-services-header text-center">
            <span className="quirex-services-badge">
              <IoSparklesOutline className="quirex-badge-icon" />
              Our Services
            </span>
            <h2 className="quirex-services-title">
              What We Help You <span className="quirex-highlight-coral">With</span>
            </h2>
            <p className="quirex-services-subtitle">
              From finding the right property to making a successful sale, Quirex makes every step of your real estate journey simple.
            </p>
          </div>

          {/* Service Cards Grid */}
          <div className="row g-4 justify-content-center quirex-services-grid">
            {servicesData.map((service) => (
              <div
                key={service.id}
                className="col-12 col-md-6 col-lg-4 d-flex"
                data-aos="fade-up"
                data-aos-delay={service.delay}
              >
                <div className="quirex-service-card w-100">
                  
                  {/* Top Image Container */}
                  <div className="quirex-service-img-wrap">
                    <img
                      src={service.image}
                      alt={service.alt}
                      className="quirex-service-img"
                      loading="lazy"
                    />
                  </div>

                  {/* Card Content */}
                  <div className="quirex-service-content">
                    <h3 className="quirex-service-card-title">{service.title}</h3>
                    <p className="quirex-service-card-desc">{service.desc}</p>
                  </div>

                  {/* Card CTA Link */}
                  <div className="quirex-service-cta-wrap">
                    <Link to={service.link} className="quirex-service-cta">
                      <span>{service.ctaText}</span>
                      <FaArrowRight className="quirex-service-cta-arrow" />
                    </Link>
                  </div>

                </div>
              </div>
            ))}
          </div>

        </div>
      </section>
    </>
  );
};

export default Services;
