import React, { useEffect, useState } from 'react';
import NavBar from '../landingComponents/NavBar';
import axios from 'axios';
import Swal from 'sweetalert2';
import { API_BASE_URL } from '../../config/api';
import { getPropertyImageUrl, handleImageError } from '../../utils/propertyImageHelper';
import { FaTrashAlt, FaMapMarkerAlt, FaCheckCircle } from 'react-icons/fa';

const AdminSoldProperty = () => {
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
      const response = await axios.get(`${API_BASE_URL}/api/admin-sold-list`, {
        headers: getAdminHeaders()
      });
      if (response?.data?.code === 200) {
        setData(response?.data?.data || []);
      }
    } catch (e) {
      console.error("Error fetching sold properties:", e);
    } finally {
      setLoading(false);
    }
  };

  const handleDeleteProperty = async (_id) => {
    Swal.fire({
      title: "Remove Sold Record?",
      text: "This sold record will be removed from transaction logs.",
      icon: "warning",
      showCancelButton: true,
      confirmButtonColor: "#d33",
      cancelButtonColor: "#6c757d",
      confirmButtonText: "Yes, Delete!"
    }).then(async (result) => {
      if (result.isConfirmed) {
        try {
          const response = await axios.post(`${API_BASE_URL}/api/delete-sold-item`, { _id }, {
            headers: getAdminHeaders()
          });
          if (response?.data?.code === 200) {
            Swal.fire({
              title: "Record Deleted",
              text: response?.data?.message || "Transaction record removed successfully.",
              icon: "success",
              timer: 1500,
              showConfirmButton: false
            });
            fetchData();
          } else {
            Swal.fire({
              title: "Delete Failed",
              text: response?.data?.message,
              icon: "error"
            });
          }
        } catch (err) {
          Swal.fire({
            title: "Server Error",
            text: "Could not delete record. Please try again.",
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
          <h2 className="section-title">Sold Properties & Transactions</h2>
          <p className="text-muted">Overview of all real estate units successfully acquired by verified buyers.</p>
        </div>

        <div className="card shadow-sm border-0 rounded-4 overflow-hidden">
          <div className="table-responsive">
            <table className="table table-hover align-middle mb-0">
              <thead className="table-dark">
                <tr>
                  <th scope="col" className="ps-4">Sr.No.</th>
                  <th scope="col">Image</th>
                  <th scope="col">Property Title</th>
                  <th scope="col">Location</th>
                  <th scope="col">Price</th>
                  <th scope="col">Buyer Details</th>
                  <th scope="col">Status</th>
                  <th scope="col" className="text-center pe-4">Action</th>
                </tr>
              </thead>
              <tbody>
                {data?.map((item, index) => (
                  <tr key={item?._id || index}>
                    <td className="ps-4 fw-semibold text-muted">{index + 1}</td>
                    <td>
                      <img
                        src={getPropertyImageUrl(item, index)}
                        alt={item?.title || 'Property'}
                        className="rounded-3 shadow-sm"
                        style={{ height: '55px', width: '80px', objectFit: 'cover' }}
                        onError={(e) => handleImageError(e, item?.category, index)}
                      />
                    </td>
                    <td>
                      <span className="fw-bold text-dark d-block">{item?.title || 'Property'}</span>
                      <small className="text-muted">{item?.area} Sq. Ft</small>
                    </td>
                    <td>
                      <span className="text-muted d-inline-flex align-items-center gap-1">
                        <FaMapMarkerAlt className="text-danger small" /> {item?.location || 'N/A'}
                      </span>
                    </td>
                    <td>
                      <span className="fw-bold text-success">${item?.price}</span>
                    </td>
                    <td>
                      <div className="small">
                        <strong className="d-block text-dark">{item?.name}</strong>
                        <span className="text-muted d-block">{item?.email}</span>
                        <span className="text-secondary">{item?.contact}</span>
                      </div>
                    </td>
                    <td>
                      <span className="badge bg-danger-subtle text-danger border border-danger-subtle px-3 py-2 rounded-pill fw-bold d-inline-flex align-items-center gap-1">
                        <FaCheckCircle /> SOLD
                      </span>
                    </td>
                    <td className="text-center pe-4">
                      <button
                        onClick={() => handleDeleteProperty(item?._id)}
                        className="btn btn-sm btn-outline-danger d-inline-flex align-items-center gap-1 px-3 py-1"
                        title="Delete Record"
                      >
                        <FaTrashAlt /> Delete
                      </button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>

          {!loading && data?.length === 0 && (
            <div className="text-center py-5">
              <h5 className="text-muted">No Sold Properties Found</h5>
              <p className="small text-secondary mb-0">When users purchase listed properties, they will appear here.</p>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default AdminSoldProperty;
