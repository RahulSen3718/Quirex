import React, { useState } from 'react';
import { 
  FaUser, 
  FaEnvelope, 
  FaPencilAlt, 
  FaPhoneAlt, 
  FaMapMarkerAlt, 
  FaCommentDots
} from "react-icons/fa";
import { IoSparklesOutline, IoSend } from "react-icons/io5";
import NavBar from './NavBar';
import { useForm } from 'react-hook-form';
import { yupResolver } from '@hookform/resolvers/yup';
import * as yup from 'yup';
import axios from 'axios';
import Swal from 'sweetalert2'; 
import { API_BASE_URL } from '../../config/api';

const schemacontact = yup.object().shape({
  name: yup.string().required('Name is required.').min(2, 'Name must be at least 2 characters.').max(200),
  email: yup.string().required('Email is required.').email('Please enter a valid email address.'),
  phone: yup.string().required('Phone number is required.').min(10, 'Please enter a valid 10-digit number.'),
  subject: yup.string().required('Subject is required.').min(2, 'Subject must be at least 2 characters.').max(200),
  message: yup.string().required('Message is required.').min(5, 'Message must be at least 5 characters.').max(1500)
});

const ContactUs = () => {
  const [isLoading, setIsLoading] = useState(false);

  const { register, handleSubmit, reset, formState: { errors } } = useForm({
    resolver: yupResolver(schemacontact),
  });

  const contactUser = async (data) => {
    if (isLoading) return;
    setIsLoading(true);

    try {
      const response = await axios.post(`${API_BASE_URL}/api/contact-us`, data);
      if (response?.data?.code === 200) {
        Swal.fire({
          title: "Message Sent!",
          text: response?.data?.message || "Your inquiry has been submitted successfully.",
          icon: "success",
          confirmButtonColor: "#FF5A3C",
          confirmButtonText: "Done"
        });
        reset();
      } else {
        Swal.fire({
          title: "Submission Failed",
          text: response?.data?.message || "Please check your inputs and try again.",
          icon: "warning",
          confirmButtonColor: "#FF5A3C"
        });
      }
    } catch (err) {
      Swal.fire({
        title: "Server Error",
        text: "Could not send message. Please ensure the backend server is reachable.",
        icon: "error",
        confirmButtonColor: "#FF5A3C"
      });
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="quirex-contact-page-bg pb-5">
      <NavBar />

      <div className="container py-5">
        
        {/* Header Title Section */}
        <div className="text-center mb-5">
          <div className="d-inline-flex align-items-center gap-2 mb-2">
            <span className="badge bg-danger bg-opacity-10 text-danger border border-danger-subtle px-3 py-2 rounded-pill fw-semibold">
              <IoSparklesOutline className="me-1" /> Get In Touch
            </span>
          </div>
          <h1 className="display-6 fw-bold text-dark mb-2">
            Connect With Our <span className="text-coral">Property Experts</span>
          </h1>
          <p className="text-muted mx-auto mb-0" style={{ maxWidth: '560px', fontSize: '0.96rem' }}>
            Have questions about buying, renting, or listing luxury real estate? Fill out the form or contact our concierge directly.
          </p>
        </div>

        {/* Unified Luxury 2-Panel Card */}
        <div className="row justify-content-center">
          <div className="col-12 col-xl-11">
            <div className="quirex-contact-main-card">
              <div className="row g-0">

                {/* Left Info Panel */}
                <div className="col-12 col-lg-5">
                  <div className="quirex-contact-info-panel">
                    <h3 className="quirex-contact-panel-title">
                      Let's discuss your next dream property.
                    </h3>
                    <p className="quirex-contact-panel-desc">
                      Connect directly with certified property advisors for confidential consultation and live market insights.
                    </p>

                    <div className="quirex-contact-list">
                      <a href="tel:+18005557890" className="quirex-contact-item-row">
                        <div className="quirex-contact-item-icon">
                          <FaPhoneAlt />
                        </div>
                        <div>
                          <div className="quirex-contact-item-label">Direct Phone Line</div>
                          <div className="quirex-contact-item-val">+1 (800) 555-QUIREX</div>
                        </div>
                      </a>

                      <a href="mailto:info@quirex.com" className="quirex-contact-item-row">
                        <div className="quirex-contact-item-icon">
                          <FaEnvelope />
                        </div>
                        <div>
                          <div className="quirex-contact-item-label">Email Support</div>
                          <div className="quirex-contact-item-val">info@quirex.com</div>
                        </div>
                      </a>

                      <div className="quirex-contact-item-row mb-0">
                        <div className="quirex-contact-item-icon">
                          <FaMapMarkerAlt />
                        </div>
                        <div>
                          <div className="quirex-contact-item-label">Headquarters</div>
                          <div className="quirex-contact-item-val">15/A NestTower, Manhattan, NYC</div>
                        </div>
                      </div>
                    </div>
                  </div>
                </div>

                {/* Right Form Panel */}
                <div className="col-12 col-lg-7">
                  <div className="quirex-contact-form-panel">
                    <h3 className="quirex-form-title">Send Us A Message</h3>
                    <p className="quirex-form-subtitle">
                      Fill out your details below and our advisory team will reach out within 2 hours.
                    </p>

                    <form onSubmit={handleSubmit(contactUser)} noValidate>
                      <div className="row g-3">

                        {/* Name */}
                        <div className="col-12 col-sm-6">
                          <label className="quirex-modern-label">
                            Your Name <span className="text-danger">*</span>
                          </label>
                          <div className="quirex-modern-field-wrap">
                            <FaUser className="quirex-modern-field-icon" />
                            <input 
                              type="text" 
                              className={`quirex-modern-input ${errors?.name ? 'is-invalid border-danger' : ''}`}
                              placeholder="Enter your name"
                              {...register('name')}
                            />
                          </div>
                          {errors?.name && (
                            <p className="text-danger small mt-1 mb-0">{errors?.name?.message}</p>
                          )}
                        </div>

                        {/* Email */}
                        <div className="col-12 col-sm-6">
                          <label className="quirex-modern-label">
                            Your Email <span className="text-danger">*</span>
                          </label>
                          <div className="quirex-modern-field-wrap">
                            <FaEnvelope className="quirex-modern-field-icon" />
                            <input 
                              type="email" 
                              className={`quirex-modern-input ${errors?.email ? 'is-invalid border-danger' : ''}`}
                              placeholder="Enter your email"
                              {...register('email')}
                            />
                          </div>
                          {errors?.email && (
                            <p className="text-danger small mt-1 mb-0">{errors?.email?.message}</p>
                          )}
                        </div>

                        {/* Phone */}
                        <div className="col-12 col-sm-6">
                          <label className="quirex-modern-label">
                            Phone Number <span className="text-danger">*</span>
                          </label>
                          <div className="quirex-modern-field-wrap">
                            <FaPhoneAlt className="quirex-modern-field-icon" />
                            <input 
                              type="tel" 
                              className={`quirex-modern-input ${errors?.phone ? 'is-invalid border-danger' : ''}`}
                              placeholder="Enter phone number"
                              {...register('phone')}
                            />
                          </div>
                          {errors?.phone && (
                            <p className="text-danger small mt-1 mb-0">{errors?.phone?.message}</p>
                          )}
                        </div>

                        {/* Subject */}
                        <div className="col-12 col-sm-6">
                          <label className="quirex-modern-label">
                            Inquiry Subject <span className="text-danger">*</span>
                          </label>
                          <div className="quirex-modern-field-wrap">
                            <FaPencilAlt className="quirex-modern-field-icon" />
                            <input 
                              type="text" 
                              className={`quirex-modern-input ${errors?.subject ? 'is-invalid border-danger' : ''}`}
                              placeholder="Enter subject"
                              {...register('subject')}
                            />
                          </div>
                          {errors?.subject && (
                            <p className="text-danger small mt-1 mb-0">{errors?.subject?.message}</p>
                          )}
                        </div>

                        {/* Message */}
                        <div className="col-12">
                          <label className="quirex-modern-label">
                            Message <span className="text-danger">*</span>
                          </label>
                          <div className="quirex-modern-field-wrap align-items-start">
                            <FaCommentDots className="quirex-modern-field-icon" style={{ top: '16px' }} />
                            <textarea 
                              rows={4}
                              className={`quirex-modern-textarea ${errors?.message ? 'is-invalid border-danger' : ''}`}
                              placeholder="Write your message here..."
                              {...register('message')}
                            ></textarea>
                          </div>
                          {errors?.message && (
                            <p className="text-danger small mt-1 mb-0">{errors?.message?.message}</p>
                          )}
                        </div>

                        {/* Submit Action */}
                        <div className="col-12 pt-3">
                          <button 
                            type="submit" 
                            disabled={isLoading}
                            className="quirex-btn-submit w-100"
                          >
                            {isLoading ? (
                              <>
                                <span className="spinner-border spinner-border-sm" role="status" aria-hidden="true"></span>
                                <span>Transmitting Message...</span>
                              </>
                            ) : (
                              <>
                                <IoSend /> <span>Send Message</span>
                              </>
                            )}
                          </button>
                        </div>

                      </div>
                    </form>
                  </div>
                </div>

              </div>
            </div>
          </div>
        </div>

      </div>
    </div>
  );
};

export default ContactUs;