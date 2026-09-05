import React from 'react';
import { CiLocationOn } from "react-icons/ci";
import { LuPhoneCall } from "react-icons/lu";
import { BsEnvelope } from "react-icons/bs";
import { ImFacebook } from "react-icons/im";
import { IoLogoTwitter } from "react-icons/io5";
import { FaLinkedin } from "react-icons/fa";
import { FaYoutube } from "react-icons/fa6";
import { BiLogoTelegram } from "react-icons/bi";

const Footer = () => {
  return (
    <> 
      <footer className="footer">
        <div className="container">
          <div className="row g-4">
            <div className="col-12 col-md-6 col-lg-3">
              <div className="d-flex align-items-center mb-3 logo">
                <img src='/img/favicon.png' alt="Quirex Logo" height="32" className="me-2" /> Quirex
              </div>
              <p>Leading real estate platform helping you discover, buy, and rent premier properties with trust, transparency, and verified listings.</p>
              <p><CiLocationOn className='me-2'/>15/A, NestTower, NYC, USA</p>
              <p><LuPhoneCall className='me-2'/>+1 (800) 555-0199</p>
              <p><BsEnvelope className='me-2'/>support@quirex.com</p>
              <div className="d-flex gap-3 mt-3">
                <a href="#facebook" className="text-white" aria-label="Facebook"><ImFacebook /></a>
                <a href="#twitter" className="text-white" aria-label="Twitter"><IoLogoTwitter /></a>
                <a href="#linkedin" className="text-white" aria-label="LinkedIn"><FaLinkedin /></a>
                <a href="#youtube" className="text-white" aria-label="YouTube"><FaYoutube /></a>
              </div>
            </div>

            <div className="col-6 col-md-3 col-lg-2">
              <h5 className='text-light'>Company</h5>
              <a href="#">About</a>
              <a href="#">Blog</a>
              <a href="#">All Products</a>
              <a href="#">Locations Map</a>
              <a href="#">FAQ</a>
              <a href="#">Contact us</a>
            </div>

            <div className="col-6 col-md-3 col-lg-2">
              <h5 className='text-light'>Services</h5>
              <a href="#">Order tracking</a>
              <a href="#">Wish List</a>
              <a href="#">Login</a>
              <a href="#">My account</a>
              <a href="#">Terms & Conditions</a>
              <a href="#">Promotional Offers</a>
            </div>

            <div className="col-6 col-md-3 col-lg-2">
              <h5 className='text-light'>Customer Care</h5>
              <a href="#">Login</a>
              <a href="#">My account</a>
              <a href="#">Wish List</a>
              <a href="#">Order tracking</a>
              <a href="#">FAQ</a>
              <a href="#">Contact us</a>
            </div>

            <div className="col-12 col-md-6 col-lg-3">
              <h5 className='text-light'>Newsletter</h5>
              <p>Subscribe to our weekly Newsletter and receive updates via email.</p>
              <div className="d-flex mb-3">
                <input type="email" placeholder="Email*" className="subscribe-input" />
                <button className="subscribe-btn" aria-label="Subscribe"><BiLogoTelegram /></button>
              </div>
              <h6 className="text-white mt-3">We Accept</h6>
              <div className="payment-icons mt-2">
                <img src='/img/payment-4.png' alt="Payment Methods" className="img-fluid" />
              </div>
            </div>
          </div>
        </div>
      </footer>

      <div className="footer-bottom">
        <div className="container d-flex flex-column flex-md-row justify-content-between align-items-center">
          <div className='text-center'>All Rights Reserved @ Company {new Date().getFullYear()}</div>
          <div className="mt-2 mt-md-0 d-flex gap-3">
            <a href="#">Terms & Conditions</a>
            <a href="#">Claim</a>
            <a href="#">Privacy & Policy</a>
          </div>
        </div>
      </div>
    </>
  );
};

export default Footer;
