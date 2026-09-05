import React from 'react';
import { IoCarOutline, IoLibraryOutline } from "react-icons/io5";
import { LiaSwimmingPoolSolid, LiaBedSolid } from "react-icons/lia";
import { BsShieldCheck } from "react-icons/bs";
import { GiStethoscope, GiJapaneseBridge } from "react-icons/gi";
import { TbHomeShield } from "react-icons/tb";

const OurAnimities = () => {
  return (
    <section className="bg py-5">
      <div className="container">
        <div className="text-center mb-4">
          <div className="tagline">Our Amenities</div>
          <h2 className="section-title">Building Amenities</h2>
        </div>

        <div className="row g-4 justify-content-center">
          <div className="col-6 col-md-4 col-lg-3">
            <div className="amenity-card">
              <div className="amenity-icon"><IoCarOutline className='icons'/></div>
              <h6>Parking Space</h6>
              <button className="arrow-btn" aria-label="Details">→</button>
            </div>
          </div>

          <div className="col-6 col-md-4 col-lg-3">
            <div className="amenity-card">
              <div className="amenity-icon"><LiaSwimmingPoolSolid className='icons'/></div>
              <h6>Swimming Pool</h6>
              <button className="arrow-btn" aria-label="Details">→</button>
            </div>
          </div>

          <div className="col-6 col-md-4 col-lg-3">
            <div className="amenity-card">
              <div className="amenity-icon"><BsShieldCheck className='icons' /></div>
              <h6>Private Security</h6>
              <button className="arrow-btn" aria-label="Details">→</button>
            </div>
          </div>

          <div className="col-6 col-md-4 col-lg-3">
            <div className="amenity-card">
              <div className="amenity-icon"><GiStethoscope className='icons'/></div>
              <h6>Medical Center</h6>
              <button className="arrow-btn" aria-label="Details">→</button>
            </div>
          </div>

          <div className="col-6 col-md-4 col-lg-3">
            <div className="amenity-card">
              <div className="amenity-icon"><IoLibraryOutline className='icons'/></div>
              <h6>Library Area</h6>
              <button className="arrow-btn" aria-label="Details">→</button>
            </div>
          </div>

          <div className="col-6 col-md-4 col-lg-3">
            <div className="amenity-card">
              <div className="amenity-icon"><LiaBedSolid className='icons'/></div>
              <h6>King Size Beds</h6>
              <button className="arrow-btn" aria-label="Details">→</button>
            </div>
          </div>

          <div className="col-6 col-md-4 col-lg-3">
            <div className="amenity-card">
              <div className="amenity-icon"><TbHomeShield className='icons'/></div>
              <h6>Smart Homes</h6>
              <button className="arrow-btn" aria-label="Details">→</button>
            </div>
          </div>

          <div className="col-6 col-md-4 col-lg-3">
            <div className="amenity-card">
              <div className="amenity-icon"><GiJapaneseBridge className='icons'/></div>
              <h6>Garden Walkway</h6>
              <button className="arrow-btn" aria-label="Details">→</button>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
};

export default OurAnimities;
