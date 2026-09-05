import React, { useEffect, useState, useMemo } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import NavBar from '../landingComponents/NavBar';
import axios from 'axios';
import { API_BASE_URL } from '../../config/api';
import { getPropertyImageUrl, handleImageError } from '../../utils/propertyImageHelper';
import { 
  FaMapMarkerAlt, 
  FaCheckCircle, 
  FaShoppingBag, 
  FaCalendarAlt, 
  FaReceipt, 
  FaTimes, 
  FaSearch, 
  FaEye, 
  FaBuilding, 
  FaArrowRight, 
  FaShieldAlt,
  FaFileInvoiceDollar
} from 'react-icons/fa';

const UserBoughtList = () => {
  const navigate = useNavigate();
  const [list, setList] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedOrder, setSelectedOrder] = useState(null);
  const [userData, setUserData] = useState(null);

  useEffect(() => {
    try {
      const user = JSON.parse(localStorage.getItem('userInfo'));
      if (!user || !user._id) {
        navigate('/login', { replace: true });
        return;
      }
      setUserData(user);
      fetchData(user._id);
    } catch (e) {
      navigate('/login', { replace: true });
    }
  }, [navigate]);

  const fetchData = async (userId) => {
    setLoading(true);
    setError('');
    try {
      const response = await axios.post(`${API_BASE_URL}/api/user-bought-list`, {
        userId
      });
      if (response?.data?.code === 200) {
        setList(response?.data?.data || []);
      } else {
        setList([]);
      }
    } catch (e) {
      console.error("Error fetching user orders:", e);
      setError("Unable to load orders at this moment. Please check your connection.");
    } finally {
      setLoading(false);
    }
  };

  const filteredOrders = useMemo(() => {
    if (!searchTerm.trim()) return list;
    const term = searchTerm.toLowerCase();
    return list.filter(item => 
      (item?.title && item.title.toLowerCase().includes(term)) ||
      (item?.location && item.location.toLowerCase().includes(term)) ||
      (item?._id && item._id.toLowerCase().includes(term)) ||
      (item?.category && item.category.toLowerCase().includes(term))
    );
  }, [list, searchTerm]);

  const formatDate = (dateStr) => {
    if (!dateStr) return 'Recent';
    try {
      const date = new Date(dateStr);
      return isNaN(date.getTime()) 
        ? 'Confirmed' 
        : date.toLocaleDateString('en-US', {
            year: 'numeric',
            month: 'short',
            day: 'numeric'
          });
    } catch {
      return 'Confirmed';
    }
  };

  const formatOrderId = (id) => {
    if (!id) return '#QX-ORD-1001';
    return `#QX-${id.slice(-6).toUpperCase()}`;
  };

  return (
    <div className="min-vh-100 bg-light">
      <NavBar />
      
      <div className="container py-4 py-md-5">
        {/* Page Header */}
        <div className="d-flex flex-column flex-md-row align-items-md-center justify-content-between gap-3 mb-4 pb-2 border-bottom">
          <div>
            <div className="tagline text-uppercase fw-bold text-coral small mb-1" style={{ color: '#FF5A3C' }}>
              My Account
            </div>
            <h2 className="section-title fw-bold text-dark mb-1">
              My Orders & Bookings
            </h2>
            <p className="text-muted small mb-0">
              Review and manage your verified real estate portfolio, acquired properties, and booking transactions.
            </p>
          </div>

          <div className="d-flex align-items-center gap-2">
            <Link to="/user-profile" className="btn btn-outline-secondary btn-sm px-3 py-2 rounded-3 fw-semibold">
              My Profile
            </Link>
            <Link 
              to="/user-property" 
              className="btn btn-sm text-white px-3 py-2 rounded-3 fw-semibold d-inline-flex align-items-center gap-2"
              style={{ backgroundColor: '#FF5A3C', borderColor: '#FF5A3C' }}
            >
              <FaBuilding /> Browse Properties
            </Link>
          </div>
        </div>

        {/* Stats Row */}
        {!loading && !error && list.length > 0 && (
          <div className="row g-3 mb-4">
            <div className="col-12 col-sm-6 col-lg-4">
              <div className="card border-0 shadow-sm rounded-4 p-3 d-flex flex-row align-items-center gap-3">
                <div 
                  className="rounded-3 d-flex align-items-center justify-content-center flex-shrink-0"
                  style={{ width: '48px', height: '48px', backgroundColor: '#FFF1EE', color: '#FF5A3C', fontSize: '1.25rem' }}
                >
                  <FaShoppingBag />
                </div>
                <div>
                  <div className="text-muted small fw-semibold">Total Acquisitions</div>
                  <h4 className="fw-bold mb-0 text-dark">{list.length} {list.length === 1 ? 'Property' : 'Properties'}</h4>
                </div>
              </div>
            </div>

            <div className="col-12 col-sm-6 col-lg-4">
              <div className="card border-0 shadow-sm rounded-4 p-3 d-flex flex-row align-items-center gap-3">
                <div 
                  className="rounded-3 d-flex align-items-center justify-content-center flex-shrink-0"
                  style={{ width: '48px', height: '48px', backgroundColor: '#E0F2FE', color: '#0284C7', fontSize: '1.25rem' }}
                >
                  <FaShieldAlt />
                </div>
                <div>
                  <div className="text-muted small fw-semibold">Account Status</div>
                  <h4 className="fw-bold mb-0 text-dark">Verified Buyer</h4>
                </div>
              </div>
            </div>

            <div className="col-12 col-sm-12 col-lg-4">
              <div className="card border-0 shadow-sm rounded-4 p-3 d-flex flex-row align-items-center gap-3">
                <div 
                  className="rounded-3 d-flex align-items-center justify-content-center flex-shrink-0"
                  style={{ width: '48px', height: '48px', backgroundColor: '#DCFCE7', color: '#16A34A', fontSize: '1.25rem' }}
                >
                  <FaFileInvoiceDollar />
                </div>
                <div>
                  <div className="text-muted small fw-semibold">Portfolio Security</div>
                  <h4 className="fw-bold mb-0 text-dark">100% Guaranteed</h4>
                </div>
              </div>
            </div>
          </div>
        )}

        {/* Filter / Search Bar if list has items */}
        {list.length > 0 && (
          <div className="card border-0 shadow-sm rounded-4 mb-4 p-3">
            <div className="row g-2 align-items-center">
              <div className="col-12 col-md-6 col-lg-5">
                <div className="position-relative">
                  <FaSearch className="position-absolute top-50 translate-middle-y text-muted ms-3" />
                  <input
                    type="text"
                    className="form-control rounded-pill ps-5 pe-3 py-2 border-0 bg-light"
                    placeholder="Search by order ID, title, or location..."
                    value={searchTerm}
                    onChange={(e) => setSearchTerm(e.target.value)}
                  />
                </div>
              </div>
              <div className="col-12 col-md-6 col-lg-7 text-md-end text-muted small">
                Showing {filteredOrders.length} of {list.length} recorded {list.length === 1 ? 'order' : 'orders'}
              </div>
            </div>
          </div>
        )}

        {/* Orders Table Container */}
        <div className="card shadow-sm border-0 rounded-4 overflow-hidden">
          {loading ? (
            <div className="text-center py-5">
              <div className="spinner-border text-danger mb-3" style={{ color: '#FF5A3C' }} role="status">
                <span className="visually-hidden">Loading orders...</span>
              </div>
              <p className="text-muted small mb-0">Loading your property bookings and orders...</p>
            </div>
          ) : error ? (
            <div className="text-center py-5 px-3">
              <div className="alert alert-danger d-inline-block px-4 py-3 mb-3">
                {error}
              </div>
              <div>
                <button 
                  onClick={() => userData?._id && fetchData(userData._id)}
                  className="btn btn-sm btn-primary bggcolor border-0 px-4 py-2 rounded-pill text-white fw-semibold"
                >
                  Retry
                </button>
              </div>
            </div>
          ) : list.length === 0 ? (
            /* Professional Empty State as requested */
            <div className="text-center py-5 px-4 my-3">
              <div 
                className="rounded-circle d-inline-flex align-items-center justify-content-center mb-3 shadow-sm"
                style={{ width: '80px', height: '80px', backgroundColor: '#FFF1EE', color: '#FF5A3C', fontSize: '2rem' }}
              >
                <FaShoppingBag />
              </div>
              <h3 className="fw-bold text-dark mb-2">No orders yet</h3>
              <p className="text-muted mb-4 mx-auto" style={{ maxWidth: '420px' }}>
                Your property bookings and orders will appear here.
              </p>
              <Link 
                to="/user-property" 
                className="btn px-4 py-3 text-white fw-bold rounded-3 shadow-sm d-inline-flex align-items-center gap-2"
                style={{ backgroundColor: '#FF5A3C', border: 'none' }}
              >
                <FaBuilding /> Explore Properties
              </Link>
            </div>
          ) : filteredOrders.length === 0 ? (
            <div className="text-center py-5">
              <h5 className="text-muted fw-bold mb-1">No Matching Orders Found</h5>
              <p className="text-muted small mb-3">Try adjusting your search keyword.</p>
              <button 
                onClick={() => setSearchTerm('')} 
                className="btn btn-sm btn-outline-secondary px-3 rounded-pill"
              >
                Clear Search
              </button>
            </div>
          ) : (
            <div className="table-responsive">
              <table className="table table-hover align-middle mb-0">
                <thead className="bg-dark text-white" style={{ backgroundColor: '#0B2C3D' }}>
                  <tr>
                    <th scope="col" className="ps-4 py-3">Order ID</th>
                    <th scope="col" className="py-3">Property</th>
                    <th scope="col" className="py-3">Date</th>
                    <th scope="col" className="py-3">Amount</th>
                    <th scope="col" className="py-3">Location</th>
                    <th scope="col" className="py-3 text-center">Status</th>
                    <th scope="col" className="py-3 text-end pe-4">Action</th>
                  </tr>
                </thead>
                <tbody>
                  {filteredOrders.map((item) => (
                    <tr key={item?._id}>
                      {/* Order ID */}
                      <td className="ps-4">
                        <span className="badge bg-light text-dark border font-monospace px-2 py-1">
                          {formatOrderId(item?._id)}
                        </span>
                      </td>

                      {/* Property Preview & Title */}
                      <td>
                        <div className="d-flex align-items-center gap-3">
                          <img
                            src={getPropertyImageUrl(item)}
                            alt={item?.title || 'Property'}
                            className="rounded-3 shadow-sm flex-shrink-0"
                            style={{ height: '54px', width: '76px', objectFit: 'cover' }}
                            onError={(e) => handleImageError(e, item?.category)}
                          />
                          <div>
                            <span className="fw-bold text-dark d-block text-truncate" style={{ maxWidth: '220px' }}>
                              {item?.title || 'Luxury Residence'}
                            </span>
                            <span className="badge bg-light text-secondary border small px-2 py-0">
                              {item?.category || 'Residential'}
                            </span>
                            {item?.area && (
                              <span className="text-muted small ms-2">
                                {item.area} Sq. Ft
                              </span>
                            )}
                          </div>
                        </div>
                      </td>

                      {/* Booking Date */}
                      <td>
                        <div className="d-inline-flex align-items-center gap-1 text-muted small">
                          <FaCalendarAlt className="text-secondary" />
                          <span>{formatDate(item?.createdAt)}</span>
                        </div>
                      </td>

                      {/* Amount / Price */}
                      <td>
                        <span className="fw-bold fs-6" style={{ color: '#16A34A' }}>
                          ${item?.price ? Number(item.price).toLocaleString() : 'N/A'}
                        </span>
                      </td>

                      {/* Location */}
                      <td>
                        <span className="text-muted small d-inline-flex align-items-center gap-1">
                          <FaMapMarkerAlt className="text-danger flex-shrink-0" />
                          <span className="text-truncate" style={{ maxWidth: '140px' }}>
                            {item?.location || 'Prime City'}
                          </span>
                        </span>
                      </td>

                      {/* Status Badge */}
                      <td className="text-center">
                        <span 
                          className="badge px-3 py-2 rounded-pill fw-semibold d-inline-flex align-items-center gap-1 shadow-sm"
                          style={{ backgroundColor: '#DCFCE7', color: '#15803D' }}
                        >
                          <FaCheckCircle className="small" /> Acquired
                        </span>
                      </td>

                      {/* Action Details Button */}
                      <td className="text-end pe-4">
                        <button
                          type="button"
                          className="btn btn-sm btn-outline-dark d-inline-flex align-items-center gap-1 rounded-3 px-3 py-1"
                          onClick={() => setSelectedOrder(item)}
                          title="View Order Details"
                        >
                          <FaEye /> Details
                        </button>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}
        </div>
      </div>

      {/* Order Details & Receipt Modal */}
      {selectedOrder && (
        <div 
          className="modal fade show d-block" 
          tabIndex="-1" 
          style={{ backgroundColor: 'rgba(15, 44, 63, 0.65)', backdropFilter: 'blur(4px)' }}
          onClick={() => setSelectedOrder(null)}
        >
          <div className="modal-dialog modal-dialog-centered modal-lg" onClick={(e) => e.stopPropagation()}>
            <div className="modal-content border-0 rounded-4 shadow-lg overflow-hidden">
              <div className="modal-header bg-dark text-white py-3 px-4" style={{ backgroundColor: '#0B2C3D' }}>
                <div className="d-flex align-items-center gap-2">
                  <FaReceipt className="text-coral" style={{ color: '#FF5A3C' }} />
                  <h5 className="modal-title fw-bold mb-0">
                    Booking Receipt & Portfolio Details
                  </h5>
                </div>
                <button
                  type="button"
                  className="btn-close btn-close-white"
                  onClick={() => setSelectedOrder(null)}
                  aria-label="Close"
                ></button>
              </div>

              <div className="modal-body p-4">
                <div className="row g-4">
                  {/* Property Image & Status */}
                  <div className="col-12 col-md-5">
                    <div className="rounded-3 overflow-hidden shadow-sm mb-3 position-relative">
                      <img
                        src={getPropertyImageUrl(selectedOrder)}
                        alt={selectedOrder?.title}
                        className="w-100 object-fit-cover"
                        style={{ height: '220px' }}
                        onError={(e) => handleImageError(e, selectedOrder?.category)}
                      />
                      <span 
                        className="badge position-absolute top-0 start-0 m-3 px-3 py-2 rounded-pill shadow-sm"
                        style={{ backgroundColor: '#FF5A3C', color: '#FFF' }}
                      >
                        Acquired Property
                      </span>
                    </div>

                    <div className="card bg-light border-0 p-3 rounded-3">
                      <div className="small text-muted mb-1">Authenticated Account</div>
                      <div className="fw-bold text-dark">{userData?.name || 'Client'}</div>
                      <div className="small text-muted">{userData?.email || ''}</div>
                    </div>
                  </div>

                  {/* Order Specifications */}
                  <div className="col-12 col-md-7">
                    <div className="d-flex align-items-center justify-content-between mb-2">
                      <span className="badge bg-light text-dark border font-monospace px-2 py-1">
                        {formatOrderId(selectedOrder?._id)}
                      </span>
                      <span className="text-muted small d-inline-flex align-items-center gap-1">
                        <FaCalendarAlt /> {formatDate(selectedOrder?.createdAt)}
                      </span>
                    </div>

                    <h4 className="fw-bold text-dark mb-1">{selectedOrder?.title}</h4>
                    
                    <div className="d-flex align-items-center gap-2 mb-3">
                      <span className="text-muted small d-inline-flex align-items-center gap-1">
                        <FaMapMarkerAlt className="text-danger" /> {selectedOrder?.location || 'Prime Location'}
                      </span>
                      <span className="text-muted">•</span>
                      <span className="badge bg-secondary text-white small px-2 py-1">
                        {selectedOrder?.category || 'Residential'}
                      </span>
                    </div>

                    <div className="p-3 rounded-3 mb-3" style={{ backgroundColor: '#F8FAFC', border: '1px solid #E2E8F0' }}>
                      <div className="row g-2 text-center">
                        <div className="col-6 border-end">
                          <div className="text-muted small">Acquisition Price</div>
                          <div className="fw-bold fs-5" style={{ color: '#16A34A' }}>
                            ${selectedOrder?.price ? Number(selectedOrder.price).toLocaleString() : 'N/A'}
                          </div>
                        </div>
                        <div className="col-6">
                          <div className="text-muted small">Living Area</div>
                          <div className="fw-bold fs-5 text-dark">
                            {selectedOrder?.area || 'N/A'} <span className="fs-6 fw-normal text-muted">Sq. Ft</span>
                          </div>
                        </div>
                      </div>
                    </div>

                    <div className="mb-3">
                      <label className="fw-bold text-dark small mb-1">Property Description</label>
                      <p className="text-muted small mb-0" style={{ lineHeight: 1.6 }}>
                        {selectedOrder?.description || 'Exclusive luxury residence verified and cataloged on the QUIREX Real Estate platform.'}
                      </p>
                    </div>

                    <div className="alert alert-success d-flex align-items-center gap-2 py-2 px-3 mb-0 small">
                      <FaCheckCircle className="text-success flex-shrink-0" />
                      <span>This property order is officially confirmed and assigned to your account.</span>
                    </div>
                  </div>
                </div>
              </div>

              <div className="modal-footer bg-light py-2 px-4 border-top">
                <button
                  type="button"
                  className="btn btn-secondary btn-sm px-4 rounded-3"
                  onClick={() => setSelectedOrder(null)}
                >
                  Close Receipt
                </button>
                <Link
                  to="/user-property"
                  className="btn btn-sm text-white px-4 rounded-3 fw-semibold"
                  style={{ backgroundColor: '#FF5A3C' }}
                >
                  Explore More
                </Link>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default UserBoughtList;
