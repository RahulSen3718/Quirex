import React, { useEffect, useState } from 'react';
import NavBar from '../landingComponents/NavBar';
import axios from 'axios';
import Swal from 'sweetalert2';
import { API_BASE_URL } from '../../config/api';
import { FaUserCheck, FaUserSlash } from 'react-icons/fa';

const UserList = () => {
  const [data, setData] = useState([]);
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    fetchData();
  }, []);

  const getAdminHeaders = () => {
    try {
      const user = JSON.parse(localStorage.getItem('userInfo'));
      const adminId = user?._id || user?.email || '';
      return {
        'x-admin-id': adminId,
        'Authorization': `Bearer ${adminId}`
      };
    } catch {
      return {};
    }
  };

  const fetchData = async () => {
    setLoading(true);
    try {
      const response = await axios.get(`${API_BASE_URL}/api/admin-user-list`, {
        headers: getAdminHeaders()
      });
      if (response?.data?.code === 200) {
        setData(response?.data?.data || []);
      }
    } catch (err) {
      console.error("Error fetching user list:", err);
    } finally {
      setLoading(false);
    }
  };

  const handleToggleStatus = async (user) => {
    const action = user.isBlocked ? "Unblock" : "Block";
    const confirmColor = user.isBlocked ? "#28a745" : "#d33";

    Swal.fire({
      title: `${action} User?`,
      text: `Are you sure you want to ${action.toLowerCase()} ${user.name}?`,
      icon: "warning",
      showCancelButton: true,
      confirmButtonColor: confirmColor,
      cancelButtonColor: "#6c757d",
      confirmButtonText: `Yes, ${action}!`
    }).then(async (result) => {
      if (result.isConfirmed) {
        try {
          const response = await axios.post(`${API_BASE_URL}/api/toggle-user-status`, {
            userId: user._id
          }, {
            headers: getAdminHeaders()
          });
          if (response?.data?.code === 200) {
            Swal.fire({
              title: "Success",
              text: response.data.message,
              icon: "success",
              timer: 1500,
              showConfirmButton: false
            });
            fetchData();
          } else {
            Swal.fire({
              title: "Error",
              text: response?.data?.message || "Failed to update user status.",
              icon: "error"
            });
          }
        } catch (err) {
          Swal.fire({
            title: "Server Error",
            text: "Could not update user status. Please try again.",
            icon: "error"
          });
        }
      }
    });
  };

  return (
    <div className="min-vh-100 bg-light">
      <NavBar />
      <div className="container py-5">
        <div className="text-center mb-4">
          <div className="tagline">Admin Zone</div>
          <h2 className="section-title">All Registered Users</h2>
          <p className="text-muted">Manage system users, view registration profiles, and toggle account access.</p>
        </div>

        <div className="card shadow-sm border-0 rounded-4 overflow-hidden">
          <div className="table-responsive">
            <table className="table table-hover align-middle mb-0">
              <thead className="table-dark">
                <tr>
                  <th scope="col" className="ps-4">Sr.No.</th>
                  <th scope="col">Profile</th>
                  <th scope="col">Name</th>
                  <th scope="col">Email</th>
                  <th scope="col">Contact</th>
                  <th scope="col">Address</th>
                  <th scope="col">Status</th>
                  <th scope="col" className="text-center pe-4">Actions</th>
                </tr>
              </thead>
              <tbody>
                {data?.map((item, index) => (
                  <tr key={item?._id || index}>
                    <td className="ps-4 fw-semibold text-muted">{index + 1}</td>
                    <td>
                      <img
                        src={`${API_BASE_URL}/img/${item?.profile}`}
                        alt={item?.name || 'User'}
                        className="rounded-circle border"
                        style={{ height: '48px', width: '48px', objectFit: 'cover' }}
                        onError={(e) => {
                          e.target.onerror = null;
                          e.target.src = '/img/author.jpg.jpeg';
                        }}
                      />
                    </td>
                    <td>
                      <span className="fw-bold text-dark">{item?.name}</span>
                    </td>
                    <td>{item?.email}</td>
                    <td>{item?.contact}</td>
                    <td>
                      <span className="small text-muted text-truncate d-inline-block" style={{ maxWidth: '200px' }}>
                        {item?.address}
                      </span>
                    </td>
                    <td>
                      {item?.isBlocked ? (
                        <span className="badge bg-danger-subtle text-danger border border-danger-subtle px-3 py-2 rounded-pill fw-semibold">
                          Blocked
                        </span>
                      ) : (
                        <span className="badge bg-success-subtle text-success border border-success-subtle px-3 py-2 rounded-pill fw-semibold">
                          Active
                        </span>
                      )}
                    </td>
                    <td className="text-center pe-4">
                      {item?.isBlocked ? (
                        <button
                          onClick={() => handleToggleStatus(item)}
                          className="btn btn-sm btn-outline-success d-inline-flex align-items-center gap-1 px-3 py-1"
                          title="Unblock User"
                        >
                          <FaUserCheck /> Unblock
                        </button>
                      ) : (
                        <button
                          onClick={() => handleToggleStatus(item)}
                          className="btn btn-sm btn-outline-danger d-inline-flex align-items-center gap-1 px-3 py-1"
                          title="Block User"
                        >
                          <FaUserSlash /> Block
                        </button>
                      )}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>

          {!loading && data?.length === 0 && (
            <div className="text-center py-5">
              <h5 className="text-muted">No users found</h5>
              <p className="small text-secondary mb-0">Registered buyers will appear here automatically.</p>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default UserList;
