import React, { useState, useEffect } from 'react';
import { 
  IoPersonOutline, 
  IoLockClosedOutline, 
  IoEyeOutline, 
  IoEyeOffOutline, 
  IoArrowForward, 
  IoAlertCircleOutline 
} from "react-icons/io5";
import { useForm } from 'react-hook-form';
import { yupResolver } from '@hookform/resolvers/yup';
import * as yup from 'yup';
import axios from 'axios';
import Swal from 'sweetalert2';
import { useNavigate, Link } from 'react-router-dom';
import { API_BASE_URL } from '../../config/api';

const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
const mobileRegex = /^[6-9][0-9]{9}$/;

const isValidIdentifier = (value) => {
  if (!value) return false;
  const trimmed = value.trim();
  if (trimmed.includes('@')) {
    return emailRegex.test(trimmed);
  }
  return mobileRegex.test(trimmed);
};

const schema = yup.object().shape({
  identifier: yup
    .string()
    .transform((val) => (val ? val.trim() : ''))
    .required('Please enter your email or mobile number.')
    .test(
      'valid-email-or-mobile',
      'Please enter a valid email address or 10-digit mobile number.',
      (value) => isValidIdentifier(value)
    ),
  password: yup
    .string()
    .transform((val) => (val ? val.trim() : ''))
    .required('Please enter your password.')
    .min(8, 'Password must be 8–20 characters.')
    .max(20, 'Password must be 8–20 characters.'),
});

const Login = () => {
  const navigate = useNavigate();
  const [isLoading, setIsLoading] = useState(false);
  const [serverError, setServerError] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [rememberMe, setRememberMe] = useState(false);

  const {
    register,
    handleSubmit,
    setValue,
    setError,
    formState: { errors },
  } = useForm({
    resolver: yupResolver(schema),
    mode: 'onChange',
  });

  // Load remembered identifier if previously saved
  useEffect(() => {
    try {
      const savedIdentifier = localStorage.getItem('quirex_remembered_identifier');
      if (savedIdentifier) {
        setValue('identifier', savedIdentifier, { shouldValidate: true });
        setRememberMe(true);
      }
    } catch (e) {
      // Quiet fail if storage unavailable
    }
  }, [setValue]);

  const clearServerError = () => {
    if (serverError) setServerError('');
  };

  const handleForgotPassword = (e) => {
    e.preventDefault();
    Swal.fire({
      title: "Password Assistance",
      text: "To reset your password, please contact support at support@quirex.com or send a message via our Contact page.",
      icon: "info",
      confirmButtonColor: "#FF5A3C",
      showCancelButton: true,
      confirmButtonText: "Contact Us",
      cancelButtonText: "Close"
    }).then((result) => {
      if (result.isConfirmed) {
        navigate('/ContactUs');
      }
    });
  };

  const handleLogin = async (data) => {
    if (isLoading) return;
    setIsLoading(true);
    setServerError('');

    try {
      // Remember me handling
      if (rememberMe) {
        localStorage.setItem('quirex_remembered_identifier', data.identifier.trim());
      } else {
        localStorage.removeItem('quirex_remembered_identifier');
      }

      const payload = {
        identifier: data.identifier.trim(),
        password: data.password.trim(),
      };

      const response = await axios.post(`${API_BASE_URL}/api/login`, payload);

      if (response?.data?.code === 200) {
        localStorage.setItem('userInfo', JSON.stringify(response?.data?.data));

        Swal.fire({
          title: "Welcome Back!",
          text: response?.data?.message || "Signed in successfully.",
          icon: "success",
          timer: 1200,
          showConfirmButton: false,
          timerProgressBar: true,
        });

        setTimeout(() => {
          if (response?.data?.data?.userType === "admin") {
            navigate('/admin-add');
          } else {
            navigate('/user-home');
          }
        }, 1200);
      } else {
        const errorMsg = response?.data?.message || "Invalid email/mobile number or password. Please check your details and try again.";
        setServerError(errorMsg);

        Swal.fire({
          title: "Sign In Failed",
          text: errorMsg,
          icon: "error",
          confirmButtonColor: "#FF5A3C",
        });
      }
    } catch (error) {
      const responseData = error?.response?.data;
      const statusCode = error?.response?.status;
      const field = responseData?.field;

      let errorMsg = "Invalid email/mobile number or password. Please check your details and try again.";

      if (!error.response) {
        errorMsg = "Unable to sign in right now. Please verify backend server connectivity and try again.";
      } else if (statusCode === 403) {
        errorMsg = responseData?.message || "Your account has been blocked by the administrator. Please contact support.";
      } else if (responseData?.message) {
        errorMsg = responseData.message;
      }

      setServerError(errorMsg);

      if (field === 'identifier' || field === 'contact' || field === 'email') {
        setError('identifier', { type: 'server', message: errorMsg });
      } else if (field === 'password') {
        setError('password', { type: 'server', message: errorMsg });
      }

      Swal.fire({
        title: "Sign In Failed",
        text: errorMsg,
        icon: "error",
        confirmButtonColor: "#FF5A3C",
      });
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="quirex-auth-page">
      {/* Subtle Ambient Background Lighting */}
      <div className="quirex-auth-glow-coral" aria-hidden="true"></div>
      <div className="quirex-auth-glow-navy" aria-hidden="true"></div>

      <div className="quirex-auth-container quirex-login-container">
        <div className="quirex-auth-card quirex-login-card">
          
          {/* Card Header */}
          <div className="quirex-auth-header">
            <Link to="/" className="quirex-auth-logo-badge" title="Go to QUIREX Home">
              <img src="/img/favicon.png" alt="QUIREX" className="quirex-auth-logo-img" />
            </Link>
            <h1 className="quirex-auth-title">Welcome Back</h1>
            <p className="quirex-auth-subtitle">Sign in to continue to your Quirex account</p>
          </div>

          {/* Server Error Alert Banner */}
          {serverError && (
            <div className="quirex-auth-alert error" role="alert">
              <IoAlertCircleOutline className="quirex-alert-icon" />
              <span>{serverError}</span>
            </div>
          )}

          {/* Login Form */}
          <form onSubmit={handleSubmit(handleLogin)} noValidate className="quirex-auth-form">
            <div className="d-flex flex-column gap-3 mb-3">
              
              {/* 1. Email or Mobile Credential Field */}
              <div className="quirex-field-group">
                <label className="quirex-field-label" htmlFor="login-identifier">
                  Email or Mobile Number
                </label>
                <div className={`quirex-input-wrap ${errors.identifier ? 'is-invalid' : ''}`}>
                  <IoPersonOutline className="quirex-input-icon" />
                  <input
                    id="login-identifier"
                    type="text"
                    {...register('identifier')}
                    onChange={(e) => {
                      clearServerError();
                      register('identifier').onChange(e);
                    }}
                    className="quirex-input"
                    placeholder="Enter email or mobile number"
                    autoComplete="username"
                    aria-invalid={errors.identifier ? 'true' : 'false'}
                    aria-describedby={errors.identifier ? 'identifier-error' : undefined}
                  />
                </div>
                {errors.identifier && (
                  <span id="identifier-error" className="quirex-field-error">
                    <IoAlertCircleOutline /> {errors.identifier.message}
                  </span>
                )}
              </div>

              {/* 2. Password Field */}
              <div className="quirex-field-group">
                <label className="quirex-field-label" htmlFor="login-password">
                  Password
                </label>
                <div className={`quirex-input-wrap ${errors.password ? 'is-invalid' : ''}`}>
                  <IoLockClosedOutline className="quirex-input-icon" />
                  <input
                    id="login-password"
                    type={showPassword ? "text" : "password"}
                    {...register('password')}
                    onChange={(e) => {
                      clearServerError();
                      register('password').onChange(e);
                    }}
                    className="quirex-input password-input"
                    placeholder="Enter your password"
                    autoComplete="current-password"
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

            </div>

            {/* 3. Remember Me & Forgot Password Row */}
            <div className="quirex-auth-options">
              <label className="quirex-checkbox-label" htmlFor="login-remember">
                <input
                  type="checkbox"
                  id="login-remember"
                  checked={rememberMe}
                  onChange={(e) => setRememberMe(e.target.checked)}
                  className="quirex-checkbox"
                />
                <span>Remember me</span>
              </label>

              <button
                type="button"
                onClick={handleForgotPassword}
                className="quirex-forgot-btn"
              >
                Forgot Password?
              </button>
            </div>

            {/* 4. Login CTA Button */}
            <button
              type="submit"
              className="quirex-auth-submit-btn mt-2"
              disabled={isLoading}
              aria-label="Sign In"
            >
              {isLoading ? (
                <>
                  <span className="spinner-border spinner-border-sm me-2" role="status" aria-hidden="true"></span>
                  Signing In...
                </>
              ) : (
                <>
                  <span>Sign In</span>
                  <IoArrowForward className="quirex-btn-arrow" />
                </>
              )}
            </button>

            {/* 5. Register Link */}
            <div className="quirex-auth-footer">
              <span className="text-muted">Don't have an account?</span>
              <Link to="/register" className="quirex-auth-link">
                Create an account
              </Link>
            </div>

          </form>

        </div>
      </div>
    </div>
  );
};

export default Login;
