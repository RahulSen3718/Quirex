import React, { useState, useEffect, useRef } from 'react';
import NavBar from './NavBar';
import { useLocation } from 'react-router-dom';
import { IoSparklesOutline } from 'react-icons/io5';

const StatCard = ({ item }) => {
  const [displayCount, setDisplayCount] = useState(0);
  const animRef = useRef(null);

  const runCounterAnimation = (start = 0, target = item.targetValue, duration = 800) => {
    if (animRef.current) cancelAnimationFrame(animRef.current);
    const startTime = performance.now();

    const animate = (currentTime) => {
      const elapsed = currentTime - startTime;
      const progress = Math.min(elapsed / duration, 1);
      
      // Smooth cubic-out easing
      const easeOut = 1 - Math.pow(1 - progress, 3);
      const currentVal = Math.round(start + (target - start) * easeOut);
      setDisplayCount(currentVal);

      if (progress < 1) {
        animRef.current = requestAnimationFrame(animate);
      } else {
        setDisplayCount(target);
      }
    };

    animRef.current = requestAnimationFrame(animate);
  };

  useEffect(() => {
    runCounterAnimation(0, item.targetValue, 1000);
    return () => {
      if (animRef.current) cancelAnimationFrame(animRef.current);
    };
  }, [item.targetValue]);

  return (
    <div className="quirex-stat-card">
      <div className="quirex-stat-img-wrap">
        <img src={item.img} className="counter-img" alt={item.label} />
      </div>
      <h3 className="counter-number">
        {item.prefix || ''}{displayCount}{item.suffix || ''}
      </h3>
      <p className="counter-text">{item.label}</p>
    </div>
  );
};

const Counter = () => {
  const location = useLocation();
  const isFullPage = location?.pathname !== "/";

  const stats = [
    {
      id: 1,
      img: "/img/c11.png",
      targetValue: 560,
      prefix: "",
      suffix: "+",
      label: "Total Area Sq"
    },
    {
      id: 2,
      img: "/img/c2.png",
      targetValue: 197,
      prefix: "",
      suffix: "K+",
      label: "Apartments Sold"
    },
    {
      id: 3,
      img: "/img/c3.png",
      targetValue: 268,
      prefix: "",
      suffix: "+",
      label: "Total Constructions"
    },
    {
      id: 4,
      img: "/img/c4.png",
      targetValue: 340,
      prefix: "",
      suffix: "+",
      label: "Apartio Rooms"
    }
  ];

  return (
    <>
      {isFullPage && <NavBar />}
      <section className={`quirex-counter-section ${isFullPage ? "quirex-counter-page py-5" : "py-4"}`}>
        <div className="container py-2">
          {isFullPage && (
            <div className="text-center mb-5">
              <span className="quirex-services-badge mb-2">
                <IoSparklesOutline className="quirex-badge-icon" />
                Our Growth & Stats
              </span>
              <h2 className="section-title fw-bold text-dark mt-2">
                QUIREX By The <span className="text-coral">Numbers</span>
              </h2>
              <p className="text-muted mx-auto" style={{ maxWidth: '580px', fontSize: '0.95rem' }}>
                Proven track record of quality properties, client satisfaction, and market excellence across prime locations.
              </p>
            </div>
          )}

          <div className="row justify-content-center">
            <div className="col-12 col-xl-11">
              <div className="row g-4 justify-content-center">
                {stats.map((item) => (
                  <div 
                    key={item.id} 
                    className="col-12 col-sm-6 col-lg-3"
                  >
                    <StatCard item={item} />
                  </div>
                ))}
              </div>
            </div>
          </div>
        </div>
      </section>
    </>
  );
};

export default Counter;



