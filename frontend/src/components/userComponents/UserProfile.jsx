import React, { useState, useEffect, useRef } from 'react';
import { Link } from 'react-router-dom';
import {
  FaUser,
  FaEnvelope,
  FaKey,
  FaLock,
  FaEye,
  FaEyeSlash,
  FaMapMarkerAlt,
  FaCamera,
  FaShieldAlt,
  FaCheckCircle,
  FaExclamationCircle,
  FaEdit,
  FaTimes,
  FaCheck,
  FaIdCard,
  FaShoppingBag,
} from "react-icons/fa";
import { IoMdCall } from "react-icons/io";
import { MdOutlineVerifiedUser, MdSecurity, MdHomeWork } from "react-icons/md";
import { useForm } from 'react-hook-form';
import { yupResolver } from '@hookform/resolvers/yup';
import * as yup from 'yup';
import axios from 'axios';
import Swal from 'sweetalert2';
import NavBar from '../landingComponents/NavBar';
import { API_BASE_URL } from '../../config/api';

const allowedMimes = ['image/jpeg', 'image/png', 'image/webp', 'image/jpg', 'image/gif'];
const allowedExtensions = ['.jpg', '.jpeg', '.png', '.webp', '.gif'];

const schema = yup.object().shape({
  name: yup
    .string()
    .transform((val) => (val ? val.trim() : ''))
    .required('Full Name is required.')
    .min(2, 'Name must be at least 2 characters.')
    .max(50, 'Name cannot exceed 50 characters.')
    .matches(/^[a-zA-Z\s]+$/, 'Name can only contain letters and spaces.'),
  email: yup
    .string()
    .transform((val) => (val ? val.trim().toLowerCase() : ''))
    .required('Email is required.')
    .email('Please enter a valid email address.'),
  contact: yup
    .string()
    .transform((val) => (val ? val.trim() : ''))
    .required('Phone Number is required.')
    .test('valid-mobile', 'Please enter a valid 10-digit mobile number.', (value) => /^[6-9][0-9]{9}$/.test(value || '')),
  address: yup
    .string()
    .transform((val) => (val ? val.trim() : ''))
    .required('Address is required.')
    .min(3, 'Address must be at least 3 characters.')
    .max(200, 'Address cannot exceed 200 characters.'),
  password: yup
    .string()
    .transform((val) => (val ? val.trim() : ''))
    .test('password-length', 'Password must be between 8 and 20 characters.', (val) => {
      if (!val || val.length === 0) return true;
      return val.length >= 8 && val.length <= 20;
    }),
  confirmPassword: yup
    .string()
    .transform((val) => (val ? val.trim() : ''))
    .test('passwords-match', 'Passwords do not match.', function (val) {
      const { password } = this.parent;
      if (!password || password.length === 0) return true;
      return val === password;
    }),
  profile: yup
    .mixed()
    .test('fileType', 'Only JPG, PNG, WEBP, and GIF images are allowed.', (value) => {
      if (!value || value.length === 0 || !(value[0] instanceof File)) return true;
      return allowedMimes.includes(value[0].type);
    })
    .test('fileSize', 'Profile picture size must be less than 5MB.', (value) => {
      if (!value || value.length === 0 || !(value[0] instanceof File)) return true;
      return value[0].size <= 5 * 1024 * 1024;
    }),
});

const UserProfile = () => {
  const [isEditMode, setIsEditMode] = useState(false);
  const [currentUser, setCurrentUser] = useState(null);
  const [previewImage, setPreviewImage] = useState(null);
  const [selectedFileName, setSelectedFileName] = useState('');
  const [imageError, setImageError] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [serverError, setServerError] = useState('');
  const [successMessage, setSuccessMessage] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);
  const [showFullPhone, setShowFullPhone] = useState(false);
  const fileInputRef = useRef(null);

  const {
    register,
    handleSubmit,
    setValue,
    clearErrors,
    formState: { errors },
  } = useForm({
    resolver: yupResolver(schema),
    mode: 'onChange',
  });

  // Load existing user profile from localStorage securely
  useEffect(() => {
    try {
      const user = JSON.parse(localStorage.getItem('userInfo'));
      if (user && user._id) {
        setCurrentUser(user);
        setValue('name', user.name || '');
        setValue('email', user.email || '');
        setValue('contact', user.contact || '');
        setValue('address', user.address || '');
        setValue('password', '');
        setValue('confirmPassword', '');

        if (user.profile) {
          const profileUrl = `${API_BASE_URL}/img/${user.profile}`;
          setPreviewImage(profileUrl);
        }
      }
    } catch (e) {
      console.error('Error loading user info from localStorage:', e);
    }
  }, [setValue]);

  const clearAlerts = () => {
    if (serverError) setServerError('');
    if (successMessage) setSuccessMessage('');
  };

  const handleContactChange = (e) => {
    clearAlerts();
    const numericValue = e.target.value.replace(/\D/g, '').slice(0, 10);
    e.target.value = numericValue;
    setValue('contact', numericValue, { shouldValidate: true, shouldDirty: true, shouldTouch: true });
  };

  // Immediate image preview with security format & size validation
  const handleImageChange = (e) => {
    clearAlerts();
    setImageError('');
    const files = e.target.files;

    if (files && files.length > 0) {
      const file = files[0];
      const ext = '.' + file.name.split('.').pop().toLowerCase();

      if (!allowedMimes.includes(file.type) || !allowedExtensions.includes(ext)) {
        setImageError('Invalid image format. Allowed formats: JPG, PNG, WEBP, GIF.');
        return;
      }

      if (file.size > 5 * 1024 * 1024) {
        setImageError('Image size exceeds maximum 5MB limit.');
        return;
      }

      const previewUrl = URL.createObjectURL(file);
      setPreviewImage(previewUrl);
      setSelectedFileName(file.name);
      setValue('profile', files, { shouldValidate: true });
    }
  };

  const triggerFileInput = () => {
    if (fileInputRef.current) {
      fileInputRef.current.click();
    }
  };

  const getMaskedPhone = (phone) => {
    if (!phone) return '';
    const clean = phone.toString().trim();
    if (clean.length <= 4) return clean;
    return '******' + clean.slice(-4);
  };

  // Discard changes and return to read-only view
  const handleCancelEdit = () => {
    if (currentUser) {
      setValue('name', currentUser.name || '');
      setValue('email', currentUser.email || '');
      setValue('contact', currentUser.contact || '');
      setValue('address', currentUser.address || '');
      setValue('password', '');
      setValue('confirmPassword', '');
      if (currentUser.profile) {
        setPreviewImage(`${API_BASE_URL}/img/${currentUser.profile}`);
      } else {
        setPreviewImage(null);
      }
    }
    setSelectedFileName('');
    setImageError('');
    clearErrors();
    clearAlerts();
    setIsEditMode(false);
  };

  // Save changes and return to read-only view on success
  const handleUpdate = async (data) => {
    if (isLoading) return;
    setIsLoading(true);
    clearAlerts();

    try {
      const userData = JSON.parse(localStorage.getItem('userInfo')) || {};
      const userId = userData?._id;

      if (!userId) {
        setServerError('User session expired. Please login again.');
        setIsLoading(false);
        return;
      }

      const formData = new FormData();
      formData.append('userId', userId);
      formData.append('name', data.name.trim());
      formData.append('contact', data.contact.trim());
      formData.append('address', data.address.trim());

      // Only send password if user explicitly entered a new password
      if (data.password && data.password.trim()) {
        formData.append('password', data.password.trim());
      }

      // Only send new profile picture if a new valid file is selected
      if (data.profile && data.profile.length > 0 && data.profile[0] instanceof File) {
        formData.append('profile', data.profile[0]);
      }

      const response = await axios.put(`${API_BASE_URL}/api/user-update`, formData, {
        headers: {
          'Content-Type': 'multipart/form-data',
        },
      });

      if (response.data?.code === 200 || response.status === 200) {
        const updatedData = response.data?.data || {};
        const mergedUser = { ...userData, ...updatedData };
        delete mergedUser.password;
        localStorage.setItem('userInfo', JSON.stringify(mergedUser));
        setCurrentUser(mergedUser);

        if (mergedUser.profile) {
          setPreviewImage(`${API_BASE_URL}/img/${mergedUser.profile}?t=${Date.now()}`);
        }

        const msg = response.data?.message || "Profile updated successfully.";
        setSuccessMessage(msg);
        setServerError('');

        // Reset password fields
        setValue('password', '');
        setValue('confirmPassword', '');
        setSelectedFileName('');

        // Return to Read-Only mode
        setIsEditMode(false);

        Swal.fire({
          title: "Profile Updated",
          text: msg,
          icon: "success",
          confirmButtonColor: "#FF5A3C",
          timer: 2000,
          timerProgressBar: true,
        });
      } else {
        const errMsg = response.data?.message || "Unable to update profile. Please try again.";
        setServerError(errMsg);
        setSuccessMessage('');

        Swal.fire({
          title: "Update Failed",
          text: errMsg,
          icon: "error",
          confirmButtonColor: "#FF5A3C",
        });
      }
    } catch (error) {
      console.error("Profile update error:", error);
      const errMsg = error.response?.data?.message || "Unable to update profile. Please try again.";
      setServerError(errMsg);
      setSuccessMessage('');

      Swal.fire({
        title: "Update Failed",
        text: errMsg,
        icon: "error",
        confirmButtonColor: "#FF5A3C",
      });
    } finally {
      setIsLoading(false);
    }
  };

  const { ref: formProfileRef, ...profileRest } = register('profile');

  const getInitials = (name) => {
    if (!name) return 'U';
    const parts = name.trim().split(' ');
    if (parts.length > 1) {
      return (parts[0][0] + parts[1][0]).toUpperCase();
    }
    return name.slice(0, 2).toUpperCase();
  };

  return (
    <>
      <NavBar />
      <div className="profile-page-bg py-5">
        <div className="container">
          <div className="row justify-content-center">
            <div className="col-12 col-lg-10 col-xl-9">

              {/* Top Alert Messages */}
              {serverError && (
                <div className="alert alert-danger profile-alert py-3 px-4 mb-4 d-flex align-items-center" role="alert">
                  <FaExclamationCircle className="me-2 fs-5 flex-shrink-0 text-danger" />
                  <span className="fw-medium">{serverError}</span>
                </div>
              )}

              {successMessage && (
                <div className="alert alert-success profile-alert py-3 px-4 mb-4 d-flex align-items-center" role="alert">
                  <FaCheckCircle className="me-2 fs-5 flex-shrink-0 text-success" />
                  <span className="fw-medium">{successMessage}</span>
                </div>
              )}

              {/* =========================================================
                  MODE 1: DEFAULT READ-ONLY PROFILE OVERVIEW
                 ========================================================= */}
              {!isEditMode && (
                <>
                  {/* Header Card (Read-Only) */}
                  <div className="profile-header-card mb-4">
                    <div className="d-flex flex-column flex-md-row align-items-center justify-content-between gap-4 text-center text-md-start">
                      
                      {/* Avatar & User Details */}
                      <div className="d-flex flex-column flex-sm-row align-items-center gap-4 text-center text-sm-start">
                        <div className="profile-avatar-wrapper">
                          {previewImage ? (
                            <img
                              src={previewImage}
                              alt="Profile"
                              className="profile-avatar-img"
                              onError={(e) => {
                                e.target.onerror = null;
                                setPreviewImage(null);
                              }}
                            />
                          ) : (
                            <div className="profile-avatar-placeholder">
                              {getInitials(currentUser?.name)}
                            </div>
                          )}
                        </div>

                        <div>
                          <div className="d-flex flex-wrap align-items-center justify-content-center justify-content-sm-start gap-2 mb-1">
                            <h2 className="profile-user-name mb-0">{currentUser?.name || "User Profile"}</h2>
                            <span className="badge profile-verified-badge">
                              <MdOutlineVerifiedUser className="me-1" /> QUiREX Member
                            </span>
                          </div>
                          <p className="profile-subtext mb-2">QUiREX Real Estate Account</p>
                          
                          <div className="d-flex flex-wrap justify-content-center justify-content-sm-start gap-3 small text-muted">
                            {currentUser?.email && (
                              <span className="d-inline-flex align-items-center">
                                <FaEnvelope className="me-1 text-secondary" /> {currentUser.email}
                              </span>
                            )}
                            {currentUser?.contact && (
                              <span className="d-inline-flex align-items-center">
                                <IoMdCall className="me-1 text-secondary" />
                                +91 {showFullPhone ? currentUser.contact : getMaskedPhone(currentUser.contact)}
                                <button
                                  type="button"
                                  className="btn btn-sm btn-link text-muted p-0 ms-1 d-inline-flex align-items-center"
                                  onClick={() => setShowFullPhone(!showFullPhone)}
                                  title={showFullPhone ? "Mask phone number" : "Show full phone number"}
                                  style={{ textDecoration: 'none', lineHeight: 1 }}
                                  aria-label={showFullPhone ? "Mask phone number" : "Show full phone number"}
                                >
                                  {showFullPhone ? <FaEyeSlash size={12} /> : <FaEye size={12} />}
                                </button>
                              </span>
                            )}
                          </div>
                        </div>
                      </div>

                      {/* Profile Action Buttons: Edit Profile & My Orders */}
                      <div className="d-flex align-items-center gap-2 flex-wrap">
                        <Link
                          to="/user-bought"
                          className="btn btn-outline-dark d-flex align-items-center gap-2 px-3 py-2 rounded-3 fw-semibold small"
                          title="View your orders and bookings"
                        >
                          <FaShoppingBag className="text-coral" style={{ color: '#FF5A3C' }} /> My Orders
                        </Link>
                        <button
                          type="button"
                          className="btn profile-edit-mode-btn d-flex align-items-center gap-2 px-4 py-2"
                          onClick={() => {
                            clearAlerts();
                            setIsEditMode(true);
                          }}
                        >
                          <FaEdit /> Edit Profile
                        </button>
                      </div>

                    </div>
                  </div>

                  {/* Main Information Cards (Read-Only) */}
                  <div className="profile-main-card mb-4">
                    
                    {/* Section 1: Personal Information */}
                    <div className="profile-section mb-4">
                      <div className="profile-section-header d-flex align-items-center mb-3">
                        <div className="profile-section-icon me-2">
                          <FaIdCard />
                        </div>
                        <div>
                          <h5 className="profile-section-title mb-0">Personal Information</h5>
                          <p className="profile-section-subtitle mb-0">Your verified contact and profile details</p>
                        </div>
                      </div>

                      <div className="row g-3">
                        {/* Full Name */}
                        <div className="col-12 col-md-6">
                          <div className="profile-info-tile">
                            <span className="profile-info-label">Full Name</span>
                            <div className="profile-info-value d-flex align-items-center gap-2">
                              <FaUser className="text-secondary small" />
                              <span>{currentUser?.name || "Not provided"}</span>
                            </div>
                          </div>
                        </div>

                        {/* Email */}
                        <div className="col-12 col-md-6">
                          <div className="profile-info-tile">
                            <div className="d-flex justify-content-between align-items-center">
                              <span className="profile-info-label">Email Address</span>
                              <span className="badge bg-light text-success border border-success-subtle small py-1 px-2">Verified</span>
                            </div>
                            <div className="profile-info-value d-flex align-items-center gap-2">
                              <FaEnvelope className="text-secondary small" />
                              <span>{currentUser?.email || "Not provided"}</span>
                            </div>
                          </div>
                        </div>

                        {/* Phone Number */}
                        <div className="col-12 col-md-6">
                          <div className="profile-info-tile">
                            <span className="profile-info-label">Phone Number</span>
                            <div className="profile-info-value d-flex align-items-center justify-content-between">
                              <div className="d-flex align-items-center gap-2">
                                <IoMdCall className="text-secondary small" />
                                <span>+91 {showFullPhone ? currentUser?.contact : getMaskedPhone(currentUser?.contact)}</span>
                              </div>
                              <button
                                type="button"
                                className="btn btn-sm btn-link text-muted p-0"
                                onClick={() => setShowFullPhone(!showFullPhone)}
                                title={showFullPhone ? "Mask phone" : "Reveal phone"}
                                style={{ textDecoration: 'none' }}
                              >
                                {showFullPhone ? <FaEyeSlash size={14} /> : <FaEye size={14} />}
                              </button>
                            </div>
                          </div>
                        </div>

                        {/* Address */}
                        <div className="col-12 col-md-6">
                          <div className="profile-info-tile">
                            <span className="profile-info-label">Address</span>
                            <div className="profile-info-value d-flex align-items-start gap-2">
                              <FaMapMarkerAlt className="text-secondary small mt-1 flex-shrink-0" />
                              <span>{currentUser?.address || "No address provided"}</span>
                            </div>
                          </div>
                        </div>
                      </div>
                    </div>

                    <hr className="profile-divider my-4" />

                    {/* Section 2: Account Security Summary */}
                    <div className="profile-section">
                      <div className="profile-section-header d-flex align-items-center mb-3">
                        <div className="profile-section-icon me-2" style={{ backgroundColor: '#E0F2FE', color: '#0284C7' }}>
                          <MdSecurity />
                        </div>
                        <div>
                          <h5 className="profile-section-title mb-0">Account Security</h5>
                          <p className="profile-section-subtitle mb-0">Current security and privacy status</p>
                        </div>
                      </div>

                      <div className="row g-3">
                        <div className="col-12 col-md-4">
                          <div className="profile-security-tile h-100">
                            <div className="d-flex align-items-center justify-content-between mb-2">
                              <span className="profile-security-title">Password Protection</span>
                              <FaCheckCircle className="text-success" />
                            </div>
                            <p className="profile-security-desc mb-0">
                              Password is encrypted and securely stored using bcrypt algorithm.
                            </p>
                          </div>
                        </div>

                        <div className="col-12 col-md-4">
                          <div className="profile-security-tile h-100">
                            <div className="d-flex align-items-center justify-content-between mb-2">
                              <span className="profile-security-title">Email Protection</span>
                              <FaLock className="text-primary" />
                            </div>
                            <p className="profile-security-desc mb-0">
                              Account email is locked to prevent unauthorized changes.
                            </p>
                          </div>
                        </div>

                        <div className="col-12 col-md-4">
                          <div className="profile-security-tile h-100">
                            <div className="d-flex align-items-center justify-content-between mb-2">
                              <span className="profile-security-title">Account Standing</span>
                              <FaCheckCircle className="text-success" />
                            </div>
                            <p className="profile-security-desc mb-0">
                              Active QUiREX user account with full platform permissions.
                            </p>
                          </div>
                        </div>
                      </div>
                    </div>

                  </div>
                </>
              )}

              {/* =========================================================
                  MODE 2: EDIT PROFILE FORM VIEW
                 ========================================================= */}
              {isEditMode && (
                <>
                  {/* Edit Mode Top Header Bar */}
                  <div className="profile-header-card mb-4">
                    <div className="d-flex flex-column flex-md-row align-items-center justify-content-between gap-3 text-center text-md-start">
                      <div>
                        <h2 className="profile-user-name mb-1">Edit Profile</h2>
                        <p className="profile-subtext mb-0">Update your personal details, profile picture, or password</p>
                      </div>

                      {/* Header Actions */}
                      <div className="d-flex align-items-center gap-2">
                        <button
                          type="button"
                          className="btn profile-cancel-btn d-flex align-items-center gap-1 px-3 py-2"
                          onClick={handleCancelEdit}
                          disabled={isLoading}
                        >
                          <FaTimes /> Cancel
                        </button>
                        <button
                          type="button"
                          className="btn profile-submit-btn d-flex align-items-center gap-1 px-4 py-2"
                          onClick={handleSubmit(handleUpdate)}
                          disabled={isLoading}
                        >
                          {isLoading ? (
                            <>
                              <span className="spinner-border spinner-border-sm me-1" role="status" aria-hidden="true"></span>
                              Saving...
                            </>
                          ) : (
                            <>
                              <FaCheck /> Save Changes
                            </>
                          )}
                        </button>
                      </div>
                    </div>
                  </div>

                  {/* Edit Form Card */}
                  <div className="profile-main-card">
                    <form onSubmit={handleSubmit(handleUpdate)} noValidate>

                      {/* Photo Section in Edit Mode */}
                      <div className="profile-section mb-4">
                        <div className="profile-section-header d-flex align-items-center mb-3">
                          <div className="profile-section-icon me-2">
                            <FaCamera />
                          </div>
                          <div>
                            <h5 className="profile-section-title mb-0">Profile Picture</h5>
                            <p className="profile-section-subtitle mb-0">Update your avatar (Max 5MB, JPG/PNG/WEBP/GIF)</p>
                          </div>
                        </div>

                        <div className="d-flex flex-column flex-sm-row align-items-center gap-4 p-3 rounded-3 border bg-light">
                          <div className="position-relative">
                            <div className="profile-avatar-wrapper" style={{ width: '90px', height: '90px' }}>
                              {previewImage ? (
                                <img
                                  src={previewImage}
                                  alt="Profile Preview"
                                  className="profile-avatar-img"
                                  onError={(e) => {
                                    e.target.onerror = null;
                                    setPreviewImage(null);
                                  }}
                                />
                              ) : (
                                <div className="profile-avatar-placeholder" style={{ fontSize: '1.6rem' }}>
                                  {getInitials(currentUser?.name)}
                                </div>
                              )}
                            </div>
                            <button
                              type="button"
                              className="profile-camera-badge"
                              onClick={triggerFileInput}
                              title="Upload photo"
                              aria-label="Upload photo"
                            >
                              <FaCamera />
                            </button>
                          </div>

                          <div className="text-center text-sm-start flex-grow-1">
                            <button
                              type="button"
                              className="btn btn-sm btn-outline-secondary profile-change-photo-btn d-inline-flex align-items-center gap-2 mb-2"
                              onClick={triggerFileInput}
                            >
                              <FaCamera /> Choose New Image
                            </button>
                            <div>
                              <small className="text-muted d-block">
                                Allowed formats: JPG, PNG, WEBP, GIF. Maximum size: 5MB.
                              </small>
                            </div>
                            {selectedFileName && !imageError && (
                              <span className="badge bg-white text-dark border py-1 px-2 mt-2 small">
                                Selected: <strong>{selectedFileName}</strong>
                              </span>
                            )}
                            {imageError && (
                              <p className="text-danger small fw-semibold mt-2 mb-0">{imageError}</p>
                            )}
                            {errors.profile && (
                              <p className="text-danger small fw-semibold mt-2 mb-0">{errors.profile.message}</p>
                            )}
                          </div>
                        </div>

                        {/* Hidden File Input */}
                        <input
                          type="file"
                          accept="image/*"
                          ref={(e) => {
                            formProfileRef(e);
                            fileInputRef.current = e;
                          }}
                          {...profileRest}
                          onChange={handleImageChange}
                          className="d-none"
                          id="profile-picture-input"
                        />
                      </div>

                      <hr className="profile-divider my-4" />

                      {/* Section 1: Personal Information */}
                      <div className="profile-section mb-4">
                        <div className="profile-section-header d-flex align-items-center mb-3">
                          <div className="profile-section-icon me-2">
                            <FaUser />
                          </div>
                          <div>
                            <h5 className="profile-section-title mb-0">Personal Information</h5>
                            <p className="profile-section-subtitle mb-0">Edit your public contact and address details</p>
                          </div>
                        </div>

                        <div className="row g-3">
                          {/* Full Name */}
                          <div className="col-12 col-md-6">
                            <label className="form-label profile-label" htmlFor="profile-name">
                              Full Name <span className="text-danger">*</span>
                            </label>
                            <div className="input-group profile-input-group">
                              <span className="input-group-text"><FaUser /></span>
                              <input
                                id="profile-name"
                                type="text"
                                {...register('name')}
                                onChange={(e) => {
                                  clearAlerts();
                                  register('name').onChange(e);
                                }}
                                className={`form-control ${errors.name ? 'is-invalid' : ''}`}
                                placeholder="Enter your full name"
                                autoComplete="name"
                              />
                            </div>
                            {errors.name && <p className="profile-field-error">{errors.name.message}</p>}
                          </div>

                          {/* Email (Read Only) */}
                          <div className="col-12 col-md-6">
                            <div className="d-flex justify-content-between align-items-center">
                              <label className="form-label profile-label" htmlFor="profile-email">
                                Email Address
                              </label>
                              <span className="badge bg-light text-muted border small mb-1">Read Only</span>
                            </div>
                            <div className="input-group profile-input-group">
                              <span className="input-group-text"><FaEnvelope /></span>
                              <input
                                id="profile-email"
                                type="email"
                                {...register('email')}
                                disabled
                                className="form-control bg-light text-muted"
                                placeholder="Your email address"
                                autoComplete="email"
                              />
                            </div>
                            <small className="text-muted" style={{ fontSize: '0.78rem' }}>
                              Email address is permanently linked and cannot be modified.
                            </small>
                          </div>

                          {/* Phone Number */}
                          <div className="col-12 col-md-6">
                            <label className="form-label profile-label" htmlFor="profile-contact">
                              Phone Number <span className="text-danger">*</span>
                            </label>
                            <div className="input-group profile-input-group">
                              <span className="input-group-text"><IoMdCall /></span>
                              <input
                                id="profile-contact"
                                type="tel"
                                inputMode="numeric"
                                maxLength={10}
                                {...register('contact')}
                                onChange={handleContactChange}
                                className={`form-control ${errors.contact ? 'is-invalid' : ''}`}
                                placeholder="Enter 10-digit mobile number"
                                autoComplete="tel"
                              />
                            </div>
                            {errors.contact && <p className="profile-field-error">{errors.contact.message}</p>}
                          </div>

                          {/* Address (Textarea) */}
                          <div className="col-12 col-md-6">
                            <label className="form-label profile-label" htmlFor="profile-address">
                              Address <span className="text-danger">*</span>
                            </label>
                            <div className="input-group profile-input-group">
                              <span className="input-group-text align-items-start pt-2"><FaMapMarkerAlt /></span>
                              <textarea
                                id="profile-address"
                                rows={3}
                                {...register('address')}
                                onChange={(e) => {
                                  clearAlerts();
                                  register('address').onChange(e);
                                }}
                                className={`form-control ${errors.address ? 'is-invalid' : ''}`}
                                placeholder="Enter your street address, city, state"
                                autoComplete="street-address"
                              />
                            </div>
                            {errors.address && <p className="profile-field-error">{errors.address.message}</p>}
                          </div>
                        </div>
                      </div>

                      <hr className="profile-divider my-4" />

                      {/* Section 2: Security & Password */}
                      <div className="profile-section mb-4">
                        <div className="profile-section-header d-flex align-items-center mb-3">
                          <div className="profile-section-icon me-2">
                            <FaShieldAlt />
                          </div>
                          <div>
                            <h5 className="profile-section-title mb-0">Security & Password</h5>
                            <p className="profile-section-subtitle mb-0">Leave blank to preserve your current password</p>
                          </div>
                        </div>

                        <div className="row g-3">
                          {/* New Password */}
                          <div className="col-12 col-md-6">
                            <label className="form-label profile-label" htmlFor="profile-password">
                              New Password
                            </label>
                            <div className="input-group profile-input-group">
                              <span className="input-group-text"><FaKey /></span>
                              <input
                                id="profile-password"
                                type={showPassword ? "text" : "password"}
                                {...register('password')}
                                onChange={(e) => {
                                  clearAlerts();
                                  register('password').onChange(e);
                                }}
                                className={`form-control ${errors.password ? 'is-invalid' : ''}`}
                                placeholder="Enter new password (8-20 chars)"
                                autoComplete="new-password"
                              />
                              <button
                                type="button"
                                className="btn btn-outline-secondary profile-eye-btn"
                                onClick={() => setShowPassword(!showPassword)}
                                aria-label={showPassword ? "Hide password" : "Show password"}
                              >
                                {showPassword ? <FaEyeSlash /> : <FaEye />}
                              </button>
                            </div>
                            {errors.password && <p className="profile-field-error">{errors.password.message}</p>}
                          </div>

                          {/* Confirm New Password */}
                          <div className="col-12 col-md-6">
                            <label className="form-label profile-label" htmlFor="profile-confirm-password">
                              Confirm New Password
                            </label>
                            <div className="input-group profile-input-group">
                              <span className="input-group-text"><FaLock /></span>
                              <input
                                id="profile-confirm-password"
                                type={showConfirmPassword ? "text" : "password"}
                                {...register('confirmPassword')}
                                onChange={(e) => {
                                  clearAlerts();
                                  register('confirmPassword').onChange(e);
                                }}
                                className={`form-control ${errors.confirmPassword ? 'is-invalid' : ''}`}
                                placeholder="Re-enter new password"
                                autoComplete="new-password"
                              />
                              <button
                                type="button"
                                className="btn btn-outline-secondary profile-eye-btn"
                                onClick={() => setShowConfirmPassword(!showConfirmPassword)}
                                aria-label={showConfirmPassword ? "Hide confirm password" : "Show confirm password"}
                              >
                                {showConfirmPassword ? <FaEyeSlash /> : <FaEye />}
                              </button>
                            </div>
                            {errors.confirmPassword && <p className="profile-field-error">{errors.confirmPassword.message}</p>}
                          </div>
                        </div>
                      </div>

                      {/* Bottom Action Bar */}
                      <div className="d-flex flex-column flex-sm-row justify-content-end align-items-center gap-3 pt-3">
                        <button
                          type="button"
                          className="btn profile-cancel-btn px-4 py-2 fw-semibold"
                          onClick={handleCancelEdit}
                          disabled={isLoading}
                        >
                          <FaTimes className="me-1" /> Cancel
                        </button>
                        <button
                          type="submit"
                          className="btn profile-submit-btn px-5 py-2 fw-semibold"
                          disabled={isLoading}
                        >
                          {isLoading ? (
                            <>
                              <span className="spinner-border spinner-border-sm me-2" role="status" aria-hidden="true"></span>
                              Saving...
                            </>
                          ) : (
                            <>
                              <FaCheck className="me-1" /> Save Changes
                            </>
                          )}
                        </button>
                      </div>

                    </form>
                  </div>
                </>
              )}

            </div>
          </div>
        </div>
      </div>
    </>
  );
};

export default UserProfile;
