import React, { useEffect, useState } from 'react';
import NavBar from '../landingComponents/NavBar';
import axios from 'axios';
import Swal from 'sweetalert2';
import { API_BASE_URL } from '../../config/api';
import { FaEnvelope, FaUser, FaPhone, FaCalendarAlt } from 'react-icons/fa';

const AdminContactUsList = () => {
  const [list, setList] = useState([]);
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
      const response = await axios.get(`${API_BASE_URL}/api/contact-us-list`, {
        headers: getAdminHeaders()
      });
      if (response?.data?.code === 200) {
        setList(response?.data?.data || []);
      }
    } catch (e) {
      console.error("Error loading enquiries:", e);
    } finally {
      setLoading(false);
    }
  };

  const showFullMessage = (item) => {
    Swal.fire({
      title: item?.subject || "Customer Inquiry",
      html: `
        <div style="text-align: left; font-size: 0.95rem;">
          <p><strong>From:</strong> ${item?.name} (${item?.email})</p>
          <p><strong>Phone:</strong> ${item?.phone || 'N/A'}</p>
          <hr/>
          <p><strong>Message:</strong></p>
          <p style="white-space: pre-wrap; background: #f8f9fa; padding: 12px; border-radius: 8px;">${item?.message}</p>
        </div>
      `,
      icon: "info",
      confirmButtonColor: "#FF5A3C",
      confirmButtonText: "Close"
    });
  };

  return (
    <div className="min-vh-100 bg-light">
      <NavBar />
      <div className="container py-5">
        <div className="text-center mb-4">
          <div className="tagline">Admin Zone</div>
          <h2 className="section-title">Customer Enquiries & Inquiries</h2>
          <p className="text-muted">Review messages and real estate lead submissions submitted via public contact forms.</p>
        </div>

        <div className="card shadow-sm border-0 rounded-4 overflow-hidden">
          <div className="table-responsive">
            <table className="table table-hover align-middle mb-0">
              <thead className="table-dark">
                <tr>
                  <th scope="col" className="ps-4">#</th>
                  <th scope="col">Name</th>
                  <th scope="col">Email</th>
                  <th scope="col">Phone</th>
                  <th scope="col">Subject</th>
                  <th scope="col">Message Preview</th>
                  <th scope="col" className="text-center pe-4">Action</th>
                </tr>
              </thead>
              <tbody>
                {list?.map((item, index) => (
                  <tr key={item?._id || index}>
                    <td className="ps-4 fw-semibold text-muted">{index + 1}</td>
                    <td>
                      <span className="fw-bold text-dark">{item?.name}</span>
                    </td>
                    <td>{item?.email}</td>
                    <td>{item?.phone || 'N/A'}</td>
                    <td>
                      <span className="badge bg-light text-dark border">
                        {item?.subject || 'General'}
                      </span>
                    </td>
                    <td>
                      <span className="text-muted text-truncate d-inline-block" style={{ maxWidth: '240px' }}>
                        {item?.message}
                      </span>
                    </td>
                    <td className="text-center pe-4">
                      <button
                        onClick={() => showFullMessage(item)}
                        className="btn btn-sm btn-outline-primary px-3 py-1"
                      >
                        View Full
                      </button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>

          {!loading && list?.length === 0 && (
            <div className="text-center py-5">
              <h5 className="text-muted">No Enquiries Found</h5>
              <p className="small text-secondary mb-0">Customer inquiries sent from the website will be listed here.</p>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default AdminContactUsList;