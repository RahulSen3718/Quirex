import React, { useState, useRef } from 'react';
import {
  IoPersonOutline,
  IoMailOutline,
  IoCallOutline,
  IoLocationOutline,
  IoLockClosedOutline,
  IoEyeOutline,
  IoEyeOffOutline,
  IoCloudUploadOutline,
  IoArrowForward,
  IoAlertCircleOutline,
  IoCheckmarkCircleOutline,
  IoCloseCircleOutline,
  IoImageOutline
} from "react-icons/io5";
import { useForm } from 'react-hook-form';
import { yupResolver } from '@hookform/resolvers/yup';
import * as yup from 'yup';
import axios from 'axios';
import Swal from 'sweetalert2';
import { useNavigate, Link } from 'react-router-dom';
import { API_BASE_URL } from '../../config/api';

const allowedMimes = ['image/jpeg', 'image/png', 'image/webp', 'image/jpg', 'image/gif', 'image/pjpeg', 'image/x-png'];

const schema = yup.object().shape({
  name: yup
    .string()
    .transform((val) => (val ? val.trim() : ''))
    .required('Please enter your name.')
    .min(2, 'Name must be at least 2 characters.')
    .max(50, 'Name cannot exceed 50 characters.')
    .matches(/^[a-zA-Z\s]+$/, 'Name can only contain alphabetic characters and spaces.'),
  email: yup
    .string()
    .transform((val) => (val ? val.trim() : ''))
    .required('Please enter a valid email address.')
    .email('Please enter a valid email address.')
    .matches(/^[^\s@]+@[^\s@]+\.[^\s@]+$/, 'Please enter a valid email address.'),
  contact: yup
    .string()
    .transform((val) => (val ? val.trim() : ''))
    .required('Mobile number must contain 10 digits.')
    .test('valid-mobile', 'Mobile number must contain 10 digits.', (value) => /^[6-9][0-9]{9}$/.test(value || '')),
  password: yup
    .string()
    .transform((val) => (val ? val.trim() : ''))
    .required('Password must be 8–20 characters.')
    .min(8, 'Password must be 8–20 characters.')
    .max(20, 'Password must be 8–20 characters.'),
  confirmPassword: yup
    .string()
    .transform((val) => (val ? val.trim() : ''))
    .required('Please confirm your password.')
    .oneOf([yup.ref('password')], 'Passwords do not match.'),
  address: yup
    .string()
    .transform((val) => (val ? val.trim() : ''))
    .required('Please enter your address.')
    .min(3, 'Address must be at least 3 characters.')
    .max(200, 'Address cannot exceed 200 characters.'),
  profile: yup
    .mixed()
    .nullable()
    .notRequired()
    .test('fileType', 'Only JPG, PNG, WEBP, and GIF images are allowed.', (value) => {
      if (!value || value.length === 0 || !(value[0] instanceof File)) return true;
      return allowedMimes.includes(value[0].type);
    })
    .test('fileSize', 'Profile picture size must be less than 5MB.', (value) => {
      if (!value || value.length === 0 || !(value[0] instanceof File)) return true;
      return value[0].size <= 5 * 1024 * 1024;
    }),
});

const UserRegister = () => {
  const navigate = useNavigate();
  const [isLoading, setIsLoading] = useState(false);
  const [serverError, setServerError] = useState('');
  const [successMessage, setSuccessMessage] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);
  const [previewImage, setPreviewImage] = useState(null);
  const fileInputRef = useRef(null);

  const {
    register,
    handleSubmit,
    setValue,
    setError,
    clearErrors,
    reset,
    formState: { errors },
  } = useForm({
    resolver: yupResolver(schema),
    mode: 'onChange',
  });

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

  const handlePaste = (e) => {
    e.preventDefault();
    clearAlerts();
    const pastedData = (e.clipboardData || window.clipboardData).getData('text');
    const numericValue = pastedData.replace(/\D/g, '').slice(0, 10);
    setValue('contact', numericValue, { shouldValidate: true, shouldDirty: true, shouldTouch: true });
  };

  const handleKeyDown = (e) => {
    if (e.key === ' ') {
      e.preventDefault();
      return;
    }
    const allowedKeys = [
      'Backspace', 'Tab', 'Delete', 'ArrowLeft', 'ArrowRight',
      'ArrowUp', 'ArrowDown', 'Enter', 'Home', 'End', 'Escape'
    ];
    if (!allowedKeys.includes(e.key) && !/^\d$/.test(e.key) && !e.ctrlKey && !e.metaKey) {
      e.preventDefault();
    }
  };

  const handleFileChange = (e) => {
    clearAlerts();
    const files = e.target.files;
    if (files && files.length > 0) {
      const file = files[0];
      if (allowedMimes.includes(file.type) && file.size <= 5 * 1024 * 1024) {
        const reader = new FileReader();
        reader.onloadend = () => {
          setPreviewImage(reader.result);
        };
        reader.readAsDataURL(file);
      } else {
        setPreviewImage(null);
      }
    } else {
      setPreviewImage(null);
    }
  };

  const handleRemoveImage = () => {
    setPreviewImage(null);
    setValue('profile', null, { shouldValidate: true });
    if (fileInputRef.current) {
      fileInputRef.current.value = '';
    }
  };

  const handleRegister = async (data) => {
    if (isLoading) return;
    setIsLoading(true);
    clearAlerts();

    try {
      const formData = new FormData();
      formData.append('name', data.name.trim());
      formData.append('email', data.email.trim().toLowerCase());
      formData.append('contact', data.contact.trim());
      formData.append('password', data.password.trim());
      formData.append('address', data.address.trim());

      if (data.profile && data.profile.length > 0 && data.profile[0] instanceof File) {
        formData.append('profile', data.profile[0]);
      }

      const response = await axios.post(`${API_BASE_URL}/api/user-register`, formData, {
        headers: {
          'Content-Type': 'multipart/form-data',
        },
      });

      if (response.status === 200 || response.data?.code === 200) {
        const msg = response?.data?.message || "User registered successfully!";
        setSuccessMessage(msg);
        setServerError('');

        Swal.fire({
          title: "Registration Successful",
          text: "Welcome to QUIREX! Redirecting to login...",
          icon: "success",
          confirmButtonColor: "#FF5A3C",
          timer: 2000,
          timerProgressBar: true,
        }).then(() => {
          reset();
          setPreviewImage(null);
          if (fileInputRef.current) {
            fileInputRef.current.value = '';
          }
          navigate('/login');
        });
      } else {
        const errorMsg = response?.data?.message || "Registration failed. Please check your details and try again.";
        setServerError(errorMsg);
        setSuccessMessage('');

        if (response?.data?.field === 'email') {
          setError('email', { type: 'server', message: errorMsg });
        } else if (response?.data?.field === 'contact') {
          setError('contact', { type: 'server', message: errorMsg });
        } else if (response?.data?.field === 'both') {
          setError('email', { type: 'server', message: 'This email is already registered. Please use another email or login.' });
          setError('contact', { type: 'server', message: 'This mobile number is already registered. Please use another number or login.' });
        }

        Swal.fire({
          title: "Registration Failed",
          text: errorMsg,
          icon: "error",
          confirmButtonColor: "#FF5A3C",
        });
      }
    } catch (error) {
      setSuccessMessage('');
      const responseData = error?.response?.data;
      const statusCode = error?.response?.status;
      const field = responseData?.field;

      let errorMsg = "Registration failed. Please check your details and try again.";

      if (!error.response) {
        errorMsg = "Unable to connect to server. Please check your network connection or verify if backend is running.";
      } else if (statusCode === 400) {
        errorMsg = responseData?.message || "Please check the entered details and try again.";
        if (field && ['name', 'email', 'contact', 'password', 'address', 'profile'].includes(field)) {
          setError(field, { type: 'server', message: errorMsg });
        }
      } else if (statusCode === 409) {
        errorMsg = responseData?.message || "Email or mobile number is already registered.";
        if (field === 'email' || errorMsg.toLowerCase().includes('email')) {
          setError('email', { type: 'server', message: errorMsg });
        } else if (field === 'contact' || errorMsg.toLowerCase().includes('mobile')) {
          setError('contact', { type: 'server', message: errorMsg });
        } else if (field === 'both' || errorMsg.toLowerCase().includes('both')) {
          setError('email', { type: 'server', message: 'This email is already registered. Please use another email or login.' });
          setError('contact', { type: 'server', message: 'This mobile number is already registered. Please use another number or login.' });
        }
      } else if (statusCode === 500) {
        errorMsg = responseData?.message || "Internal server error occurred during registration. Please try again later.";
      } else if (responseData?.message) {
        errorMsg = responseData.message;
      }

      setServerError(errorMsg);

      Swal.fire({
        title: "Registration Failed",
        text: errorMsg,
        icon: "error",
        confirmButtonColor: "#FF5A3C",
      });
    } finally {
      setIsLoading(false);
    }
  };

  const { ref: profileRegisterRef, ...profileRest } = register('profile');

  return (
    <div className="quirex-auth-page">
      {/* Subtle decorative background ambient glows */}
      <div className="quirex-auth-glow-coral" aria-hidden="true"></div>
      <div className="quirex-auth-glow-navy" aria-hidden="true"></div>

      <div className="quirex-auth-container">
        <div className="quirex-auth-card">

          {/* Card Header */}
          <div className="quirex-auth-header">
            <Link to="/" className="quirex-auth-logo-badge" title="Go to QUIREX Home">
              <img src="/img/favicon.png" alt="QUIREX" className="quirex-auth-logo-img" />
            </Link>
            <h1 className="quirex-auth-title">Create Your Account</h1>
            <p className="quirex-auth-subtitle">Join Quirex and start your real estate journey</p>
          </div>

          {/* Server Feedback Banners */}
          {serverError && (
            <div className="quirex-auth-alert error" role="alert">
              <IoAlertCircleOutline className="quirex-alert-icon" />
              <span>{serverError}</span>
            </div>
          )}

          {successMessage && (
            <div className="quirex-auth-alert success" role="alert">
              <IoCheckmarkCircleOutline className="quirex-alert-icon" />
              <span>{successMessage}</span>
            </div>
          )}

          {/* Registration Form */}
          <form onSubmit={handleSubmit(handleRegister)} noValidate className="quirex-auth-form">
            <div className="quirex-auth-grid">

              {/* 1. Your Name */}
              <div className="quirex-field-group">
                <label className="quirex-field-label" htmlFor="register-name">
                  Your Name
                </label>
                <div className={`quirex-input-wrap ${errors.name ? 'is-invalid' : ''}`}>
                  <IoPersonOutline className="quirex-input-icon" />
                  <input
                    id="register-name"
                    type="text"
                    {...register('name')}
                    onChange={(e) => {
                      clearAlerts();
                      register('name').onChange(e);
                    }}
                    className="quirex-input"
                    placeholder="Enter your name"
                    autoComplete="name"
                    aria-invalid={errors.name ? 'true' : 'false'}
                    aria-describedby={errors.name ? 'name-error' : undefined}
                  />
                </div>
                {errors.name && (
                  <span id="name-error" className="quirex-field-error">
                    <IoAlertCircleOutline /> {errors.name.message}
                  </span>
                )}
              </div>

              {/* 2. Your Email */}
              <div className="quirex-field-group">
                <label className="quirex-field-label" htmlFor="register-email">
                  Your Email
                </label>
                <div className={`quirex-input-wrap ${errors.email ? 'is-invalid' : ''}`}>
                  <IoMailOutline className="quirex-input-icon" />
                  <input
                    id="register-email"
                    type="email"
                    {...register('email')}
                    onChange={(e) => {
                      clearAlerts();
                      register('email').onChange(e);
                    }}
                    className="quirex-input"
                    placeholder="Enter your email"
                    autoComplete="email"
                    aria-invalid={errors.email ? 'true' : 'false'}
                    aria-describedby={errors.email ? 'email-error' : undefined}
                  />
                </div>
                {errors.email && (
                  <span id="email-error" className="quirex-field-error">
                    <IoAlertCircleOutline /> {errors.email.message}
                  </span>
                )}
              </div>

              {/* 3. Phone Number */}
              <div className="quirex-field-group">
                <label className="quirex-field-label" htmlFor="register-contact">
                  Phone Number
                </label>
                <div className={`quirex-input-wrap ${errors.contact ? 'is-invalid' : ''}`}>
                  <IoCallOutline className="quirex-input-icon" />
                  <input
                    id="register-contact"
                    type="tel"
                    inputMode="numeric"
                    maxLength={10}
                    {...register('contact')}
                    onChange={handleContactChange}
                    onKeyDown={handleKeyDown}
                    onPaste={handlePaste}
                    className="quirex-input"
                    placeholder="Enter 10-digit mobile number"
                    autoComplete="tel"
                    aria-invalid={errors.contact ? 'true' : 'false'}
                    aria-describedby={errors.contact ? 'contact-error' : undefined}
                  />
                </div>
                {errors.contact && (
                  <span id="contact-error" className="quirex-field-error">
                    <IoAlertCircleOutline /> {errors.contact.message}
                  </span>
                )}
              </div>

              {/* 4. Address */}
              <div className="quirex-field-group">
                <label className="quirex-field-label" htmlFor="register-address">
                  Address
                </label>
                <div className={`quirex-input-wrap ${errors.address ? 'is-invalid' : ''}`}>
                  <IoLocationOutline className="quirex-input-icon" />
                  <input
                    id="register-address"
                    type="text"
                    {...register('address')}
                    onChange={(e) => {
                      clearAlerts();
                      register('address').onChange(e);
                    }}
                    className="quirex-input"
                    placeholder="Enter your address"
                    autoComplete="street-address"
                    aria-invalid={errors.address ? 'true' : 'false'}
                    aria-describedby={errors.address ? 'address-error' : undefined}
                  />
                </div>
                {errors.address && (
                  <span id="address-error" className="quirex-field-error">
                    <IoAlertCircleOutline /> {errors.address.message}
                  </span>
                )}
              </div>

              {/* 5. Password */}
              <div className="quirex-field-group">
                <label className="quirex-field-label" htmlFor="register-password">
                  Password
                </label>
                <div className={`quirex-input-wrap ${errors.password ? 'is-invalid' : ''}`}>
                  <IoLockClosedOutline className="quirex-input-icon" />
                  <input
                    id="register-password"
                    type={showPassword ? "text" : "password"}
                    {...register('password')}
                    onChange={(e) => {
                      clearAlerts();
                      register('password').onChange(e);
                    }}
                    className="quirex-input password-input"
                    placeholder="Password (8–20 characters)"
                    autoComplete="new-password"
                    aria-invalid={errors.password ? 'true' : 'false'}
                    aria-describedby={errors.password ? 'password-error' : undefined}
                  />
                  <button
                    type="button"
                    className="quirex-password-toggle"
                    onClick={() => setShowPassword(!showPassword)}
                    aria-label={showPassword ? "Hide password" : "Show password"}
                  >
                    {showPassword ? <IoEyeOffOutline /> : <IoEyeOutline />}
                  </button>
                </div>
                {errors.password && (
                  <span id="password-error" className="quirex-field-error">
                    <IoAlertCircleOutline /> {errors.password.message}
                  </span>
                )}
              </div>

              {/* 6. Confirm Password */}
              <div className="quirex-field-group">
                <label className="quirex-field-label" htmlFor="register-confirm-password">
                  Confirm Password
                </label>
                <div className={`quirex-input-wrap ${errors.confirmPassword ? 'is-invalid' : ''}`}>
                  <IoLockClosedOutline className="quirex-input-icon" />
                  <input
                    id="register-confirm-password"
                    type={showConfirmPassword ? "text" : "password"}
                    {...register('confirmPassword')}
                    onChange={(e) => {
                      clearAlerts();
                      register('confirmPassword').onChange(e);
                    }}
                    className="quirex-input password-input"
                    placeholder="Confirm password"
                    autoComplete="new-password"
                    aria-invalid={errors.confirmPassword ? 'true' : 'false'}
                    aria-describedby={errors.confirmPassword ? 'confirm-password-error' : undefined}
                  />
                  <button
                    type="button"
                    className="quirex-password-toggle"
                    onClick={() => setShowConfirmPassword(!showConfirmPassword)}
                    aria-label={showConfirmPassword ? "Hide confirm password" : "Show confirm password"}
                  >
                    {showConfirmPassword ? <IoEyeOffOutline /> : <IoEyeOutline />}
                  </button>
                </div>
                {errors.confirmPassword && (
                  <span id="confirm-password-error" className="quirex-field-error">
                    <IoAlertCircleOutline /> {errors.confirmPassword.message}
                  </span>
                )}
              </div>

              {/* 7. Profile Picture (Optional) */}
              <div className="quirex-field-group full-width">
                <label className="quirex-field-label" htmlFor="register-profile">
                  Profile Picture <span className="quirex-optional-tag">(Optional)</span>
                </label>

                <input
                  id="register-profile"
                  type="file"
                  accept="image/png,image/jpeg,image/jpg,image/webp,image/gif"
                  {...profileRest}
                  ref={(e) => {
                    profileRegisterRef(e);
                    fileInputRef.current = e;
                  }}
                  onChange={(e) => {
                    handleFileChange(e);
                    profileRest.onChange(e);
                  }}
                  className="visually-hidden"
                />

                {previewImage ? (
                  <div className="quirex-upload-preview-card">
                    <img src={previewImage} alt="Profile preview" className="quirex-preview-avatar" />
                    <div className="quirex-preview-info">
                      <span className="quirex-preview-name">
                        {fileInputRef.current?.files?.[0]?.name || 'Profile Picture Selected'}
                      </span>
                      <span className="quirex-preview-size">
                        {fileInputRef.current?.files?.[0]?.size
                          ? `${(fileInputRef.current.files[0].size / (1024 * 1024)).toFixed(2)} MB`
                          : 'Image ready'}
                      </span>
                    </div>
                    <button
                      type="button"
                      onClick={handleRemoveImage}
                      className="quirex-remove-preview-btn"
                      title="Remove image"
                      aria-label="Remove profile image"
                    >
                      <IoCloseCircleOutline />
                    </button>
                  </div>
                ) : (
                  <div
                    className={`quirex-upload-zone ${errors.profile ? 'is-invalid' : ''}`}
                    onClick={() => fileInputRef.current?.click()}
                    role="button"
                    tabIndex={0}
                    onKeyDown={(e) => {
                      if (e.key === 'Enter' || e.key === ' ') {
                        e.preventDefault();
                        fileInputRef.current?.click();
                      }
                    }}
                    aria-label="Upload profile picture (optional)"
                  >
                    <div className="quirex-upload-icon-wrap">
                      <IoCloudUploadOutline className="quirex-upload-icon" />
                    </div>
                    <div className="quirex-upload-text">
                      <span className="quirex-upload-title">Click to upload avatar</span>
                      <span className="quirex-upload-hint">JPG, PNG, WEBP or GIF (Max 5MB)</span>
                    </div>
                  </div>
                )}

                {errors.profile && (
                  <span className="quirex-field-error">
                    <IoAlertCircleOutline /> {errors.profile.message}
                  </span>
                )}
              </div>

            </div>

            {/* 8. Register CTA Button */}
            <button
              type="submit"
              className="quirex-auth-submit-btn"
              disabled={isLoading}
              aria-label="Register Now"
            >
              {isLoading ? (
                <>
                  <span className="spinner-border spinner-border-sm me-2" role="status" aria-hidden="true"></span>
                  Creating Account...
                </>
              ) : (
                <>
                  <span>Register Now</span>
                  <IoArrowForward className="quirex-btn-arrow" />
                </>
              )}
            </button>

            {/* 9. Login Link */}
            <div className="quirex-auth-footer">
              <span className="text-muted">Already have an account?</span>
              <Link to="/login" className="quirex-auth-link">
                Login
              </Link>
            </div>

          </form>

        </div>
      </div>
    </div>
  );
};

export default UserRegister;
