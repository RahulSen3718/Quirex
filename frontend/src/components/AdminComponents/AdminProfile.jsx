import React, { useEffect, useState } from 'react';
import { FaUser, FaEnvelope, FaKey, FaMapMarkerAlt } from "react-icons/fa";
import { IoMdCall } from "react-icons/io";
import { MdAddPhotoAlternate } from "react-icons/md";
import { useForm } from 'react-hook-form';
import { yupResolver } from '@hookform/resolvers/yup';
import * as yup from 'yup';
import axios from 'axios';
import Swal from 'sweetalert2';
import NavBar from '../landingComponents/NavBar';
import { API_BASE_URL } from '../../config/api';

const schema = yup.object().shape({
  name: yup.string().required('Name is required.').min(2, 'Name must be at least 2 characters.').max(50),
  email: yup.string().email('Invalid email.').required('Email is required.'),
  contact: yup.string().required('Phone number is required.').test('valid-mobile', 'Enter 10-digit mobile number.', (val) => /^[6-9][0-9]{9}$/.test(val || '')),
  password: yup.string().test('pwd-len', 'Password must be between 8 and 20 characters.', (val) => {
    if (!val || val.length === 0) return true;
    return val.length >= 8 && val.length <= 20;
  }),
  address: yup.string().required('Address is required.').min(3, 'Address must be at least 3 characters.'),
  profile: yup.mixed()
});

const AdminProfile = () => {
  const [currentUser, setCurrentUser] = useState(null);
  const [previewImage, setPreviewImage] = useState(null);
  const [isLoading, setIsLoading] = useState(false);

  const { register, handleSubmit, setValue, formState: { errors } } = useForm({
    resolver: yupResolver(schema),
  });

  useEffect(() => {
    try {
      const user = JSON.parse(localStorage.getItem('userInfo'));
      if (user) {
        setCurrentUser(user);
        setValue('name', user?.name || '');
        setValue('email', user?.email || '');
        setValue('contact', user?.contact || '');
        setValue('address', user?.address || '');
        if (user?.profile) {
          setPreviewImage(`${API_BASE_URL}/img/${user.profile}`);
        }
      }
    } catch (e) {
      console.error("Error loading user info:", e);
    }
  }, [setValue]);

  const handleUpdate = async (data) => {
    if (isLoading) return;
    setIsLoading(true);

    try {
      const userData = JSON.parse(localStorage.getItem('userInfo'));
      const formData = new FormData();
      formData.append('userId', userData?._id);
      formData.append('name', data.name.trim());
      formData.append('contact', data.contact.trim());
      formData.append('address', data.address.trim());

      if (data.password && data.password.trim()) {
        formData.append('password', data.password.trim());
      }

      if (data.profile && data.profile.length > 0 && data.profile[0] instanceof File) {
        formData.append('profile', data.profile[0]);
      }

      const response = await axios.put(`${API_BASE_URL}/api/user-update`, formData, {
        headers: {
          'Content-Type': 'multipart/form-data',
        },
      });

      if (response.data?.code === 200) {
        const updated = response?.data?.data || {};
        const merged = { ...userData, ...updated };
        delete merged.password;
        localStorage.setItem('userInfo', JSON.stringify(merged));
        setCurrentUser(merged);
        if (merged.profile) {
          setPreviewImage(`${API_BASE_URL}/img/${merged.profile}?t=${Date.now()}`);
        }

        Swal.fire({
          title: "Profile Updated",
          text: response?.data?.message || "Admin profile updated successfully.",
          icon: "success",
          confirmButtonColor: "#FF5A3C"
        });
      } else {
        Swal.fire({
          title: "Update Failed",
          text: response?.data?.message || "Could not update profile.",
          icon: "error"
        });
      }
    } catch (err) {
      Swal.fire({
        title: "Server Error",
        text: "Error updating profile. Please try again later.",
        icon: "error"
      });
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <>
      <NavBar />
      <div className="container my-5">
        <div className="text-center mb-4">
          <div className="tagline">Admin Zone</div>
          <h2 className="section-title">Admin Account Profile</h2>
          <p className="text-muted">Update administrative credentials, contact details, and display avatar.</p>
        </div>

        <div className="row justify-content-center">
          <div className="col-md-10 col-lg-8">
            <div className="form-box shadow-sm border-0 rounded-4 p-4 p-md-5 bg-white">
              
              {/* Profile Avatar Header */}
              <div className="d-flex align-items-center gap-3 mb-4 pb-3 border-bottom">
                <img
                  src={previewImage || '/img/author.jpg.jpeg'}
                  alt="Admin"
                  className="rounded-circle border shadow-sm"
                  style={{ height: '70px', width: '70px', objectFit: 'cover' }}
                  onError={(e) => {
                    e.target.onerror = null;
                    e.target.src = '/img/author.jpg.jpeg';
                  }}
                />
                <div>
                  <h5 className="mb-0 fw-bold text-dark">{currentUser?.name || "Administrator"}</h5>
                  <span className="badge bg-danger-subtle text-danger border border-danger-subtle px-3 py-1 rounded-pill small">
                    Admin Access
                  </span>
                </div>
              </div>

              <form onSubmit={handleSubmit(handleUpdate)} noValidate>
                <div className="row g-3">

                  <div className="col-md-6">
                    <label className="form-label fw-semibold">Your Name <span className="text-danger">*</span></label>
                    <div className="input-group">
                      <span className="input-group-text"><FaUser /></span>
                      <input type="text" {...register('name')} className={`form-control ${errors.name ? 'is-invalid' : ''}`} placeholder="Enter your name" />
                    </div>
                    {errors.name && <p className="text-danger small mt-1 mb-0">{errors.name.message}</p>}
                  </div>

                  <div className="col-md-6">
                    <label className="form-label fw-semibold">Email Address</label>
                    <div className="input-group">
                      <span className="input-group-text"><FaEnvelope /></span>
                      <input disabled type="email" {...register('email')} className="form-control bg-light text-muted" placeholder="Admin Email" />
                    </div>
                  </div>

                  <div className="col-md-6">
                    <label className="form-label fw-semibold">Phone Number <span className="text-danger">*</span></label>
                    <div className="input-group">
                      <span className="input-group-text"><IoMdCall /></span>
                      <input type="tel" {...register('contact')} className={`form-control ${errors.contact ? 'is-invalid' : ''}`} placeholder="Enter 10-digit phone number" />
                    </div>
                    {errors.contact && <p className="text-danger small mt-1 mb-0">{errors.contact.message}</p>}
                  </div>

                  <div className="col-md-6">
                    <label className="form-label fw-semibold">New Password (Optional)</label>
                    <div className="input-group">
                      <span className="input-group-text"><FaKey /></span>
                      <input type="password" {...register('password')} className={`form-control ${errors.password ? 'is-invalid' : ''}`} placeholder="Leave blank to keep current" />
                    </div>
                    {errors.password && <p className="text-danger small mt-1 mb-0">{errors.password.message}</p>}
                  </div>

                  <div className="col-md-6">
                    <label className="form-label fw-semibold">Office / Address <span className="text-danger">*</span></label>
                    <div className="input-group">
                      <span className="input-group-text"><FaMapMarkerAlt /></span>
                      <input type="text" {...register('address')} className={`form-control ${errors.address ? 'is-invalid' : ''}`} placeholder="Enter Address" />
                    </div>
                    {errors.address && <p className="text-danger small mt-1 mb-0">{errors.address.message}</p>}
                  </div>

                  <div className="col-md-6">
                    <label className="form-label fw-semibold">New Profile Picture (Optional)</label>
                    <div className="input-group">
                      <span className="input-group-text"><MdAddPhotoAlternate /></span>
                      <input type="file" accept="image/*" {...register('profile')} className="form-control" />
                    </div>
                  </div>

                  <div className="text-center mt-4 col-12">
                    <button type="submit" disabled={isLoading} className="btn px-5 btn-login py-2">
                      {isLoading ? (
                        <>
                          <span className="spinner-border spinner-border-sm me-2" role="status" aria-hidden="true"></span>
                          Updating...
                        </>
                      ) : (
                        "Update Profile"
                      )}
                    </button>
                  </div>
                </div>
              </form>
            </div>
          </div>
        </div>
      </div>
    </>
  );
};

export default AdminProfile;
