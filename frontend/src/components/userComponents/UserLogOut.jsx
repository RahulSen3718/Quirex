import React, { useEffect } from 'react';
import { useNavigate } from 'react-router-dom';

const UserLogOut = () => {
  const navigate = useNavigate();

  useEffect(() => {
    try {
      localStorage.removeItem('userInfo');
      sessionStorage.clear();
    } catch (e) {
      console.error('Logout cleanup error:', e);
    }
    navigate('/login', { replace: true });
  }, [navigate]);

  return (
    <div className="d-flex justify-content-center align-items-center py-5">
      <div className="spinner-border text-danger" role="status">
        <span className="visually-hidden">Logging out...</span>
      </div>
    </div>
  );
};

export default UserLogOut;
