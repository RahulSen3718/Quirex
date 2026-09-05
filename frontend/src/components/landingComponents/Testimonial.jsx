import React from 'react';
import { FaStar, FaQuoteRight } from 'react-icons/fa';
import { IoSparklesOutline } from 'react-icons/io5';

const Testimonial = () => {
  const testimonials = [
    {
      id: 1,
      name: "Jacob William",
      role: "Luxury Home Buyer",
      rating: 5,
      comment: "Quirex helped me find my dream penthouse in record time. The verified listings, virtual tours, and seamless paperwork made the entire buying experience completely stress-free!",
      img: "/img/1.jpg_1.jpeg",
      tilt: "left"
    },
    {
      id: 2,
      name: "Kelian Anderson",
      role: "Property Seller",
      rating: 5,
      comment: "Sold my luxury apartment within 3 weeks at top market value! Their team provided exceptional marketing exposure and guided me through every negotiation step with ease.",
      img: "/img/2.jpg_1.jpeg",
      tilt: "right"
    },
    {
      id: 3,
      name: "Adam Joseph",
      role: "Real Estate Investor",
      rating: 5,
      comment: "The ROI insights, market analytics, and curated investment properties on Quirex are unmatched. Truly the most reliable and transparent real estate platform I've worked with.",
      img: "/img/3.jpg_2.jpeg",
      tilt: "left"
    }
  ];

  return (
    <section className="quirex-testimonial-section py-5">
      <div className="container py-3">
        {/* Section Header */}
        <div className="text-center mb-5">
          <span className="quirex-services-badge mb-2">
            <IoSparklesOutline className="quirex-badge-icon" />
            Client Reviews
          </span>
          <h2 className="quirex-testimonial-title fw-bold text-dark mt-2">
            What Our <span className="quirex-highlight-coral">Clients Say</span>
          </h2>
          <p className="text-muted mx-auto" style={{ maxWidth: '600px', fontSize: '0.96rem' }}>
            Hear from happy homeowners, investors, and sellers who found their ideal properties through Quirex.
          </p>
        </div>

        {/* Testimonials Cards Grid */}
        <div className="row g-4 justify-content-center">
          {testimonials.map((item) => (
            <div key={item.id} className="col-12 col-md-6 col-lg-4 d-flex">
              <div className={`quirex-testimonial-card w-100 tilt-${item.tilt}`}>
                {/* Top Quote & Rating */}
                <div className="d-flex justify-content-between align-items-center mb-3">
                  <div className="quirex-quote-badge">
                    <FaQuoteRight className="quirex-quote-icon" />
                  </div>
                  <div className="quirex-star-rating">
                    {[...Array(item.rating)].map((_, i) => (
                      <FaStar key={i} className="star-icon" />
                    ))}
                  </div>
                </div>

                {/* Review Text */}
                <p className="quirex-testimonial-text flex-grow-1">
                  "{item.comment}"
                </p>

                {/* Author Info */}
                <div className="quirex-author-box d-flex align-items-center gap-3 pt-3 border-top">
                  <div className="quirex-author-img-wrap">
                    <img 
                      src={item.img} 
                      className="quirex-author-img" 
                      alt={item.name} 
                      onError={(e) => { e.target.src = '/img/1.jpg.jpeg'; }}
                    />
                  </div>
                  <div>
                    <h6 className="quirex-author-name mb-0">{item.name}</h6>
                    <span className="quirex-author-role">{item.role}</span>
                  </div>
                </div>
              </div>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
};

export default Testimonial;
