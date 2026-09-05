import React, { useEffect, useState } from 'react';
import NavBar from '../landingComponents/NavBar';
import axios from 'axios';
import Swal from 'sweetalert2';
import { API_BASE_URL } from '../../config/api';
import { getPropertyImageUrl, handleImageError } from '../../utils/propertyImageHelper';
import { FaTrashAlt, FaPlus, FaMapMarkerAlt, FaBed, FaEdit, FaTimes, FaSave, FaImage, FaPercentage, FaLayerGroup } from 'react-icons/fa';
import { Link } from 'react-router-dom';

const AdminPropertyList = () => {
  const [listData, setListData] = useState([]);
  const [categories, setCategories] = useState(['House', 'Villa', 'Apartment', 'Commercial', 'Office', 'Studio']);
  const [loading, setLoading] = useState(false);
  const [editModalOpen, setEditModalOpen] = useState(false);
  const [selectedProperty, setSelectedProperty] = useState(null);
  const [formData, setFormData] = useState({
    title: '',
    price: '',
    area: '',
    location: '',
    category: 'House',
    status: 'Rent',
    bedrooms: '1',
    serviceType: 'Residential Real Estate',
    isOffer: false,
    offerDiscount: '',
    description: '',
  });
  const [editPic, setEditPic] = useState(null);
  const [picPreview, setPicPreview] = useState(null);
  const [isUpdating, setIsUpdating] = useState(false);

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

  useEffect(() => {
    fetchData();
    fetchCategories();
  }, []);

  const fetchCategories = async () => {
    try {
      const res = await axios.get(`${API_BASE_URL}/api/categories`);
      if (res?.data?.code === 200 && res.data.data?.length > 0) {
        setCategories(res.data.data.map(c => c.name));
      }
    } catch (e) {
      // Fallback
    }
  };

  const fetchData = async () => {
    setLoading(true);
    try {
      const response = await axios.get(`${API_BASE_URL}/api/property-list`);
      if (response?.data?.code === 200) {
        setListData(response?.data?.data || []);
      }
    } catch (e) {
      console.error("Error fetching properties:", e);
    } finally {
      setLoading(false);
    }
  };

  const openEditModal = (item) => {
    setSelectedProperty(item);
    setFormData({
      title: item?.title || '',
      price: item?.price || '',
      area: item?.area || '',
      location: item?.location || '',
      category: item?.category || 'House',
      status: item?.status || 'Rent',
      bedrooms: item?.bedrooms || '1',
      serviceType: item?.serviceType || 'Residential Real Estate',
      isOffer: Boolean(item?.isOffer),
      offerDiscount: item?.offerDiscount || '',
      description: item?.description || '',
    });
    setPicPreview(item?.pic ? `${API_BASE_URL}/img/${item.pic}` : null);
    setEditPic(null);
    setEditModalOpen(true);
  };

  const handleFileChange = (e) => {
    if (e.target.files && e.target.files[0]) {
      const file = e.target.files[0];
      setEditPic(file);
      setPicPreview(URL.createObjectURL(file));
    }
  };

  const handleUpdateProperty = async (e) => {
    e.preventDefault();
    if (!formData.title || !formData.price || !formData.location) {
      Swal.fire({
        title: "Missing Fields",
        text: "Please enter title, price, and location.",
        icon: "warning"
      });
      return;
    }

    setIsUpdating(true);
    try {
      const postData = new FormData();
      postData.append('_id', selectedProperty._id);
      postData.append('title', formData.title);
      postData.append('price', formData.price);
      postData.append('area', formData.area);
      postData.append('location', formData.location);
      postData.append('category', formData.category);
      postData.append('status', formData.status);
      postData.append('bedrooms', formData.bedrooms);
      postData.append('serviceType', formData.serviceType);
      postData.append('isOffer', formData.isOffer ? 'true' : 'false');
      postData.append('offerDiscount', formData.offerDiscount);
      postData.append('description', formData.description);
      if (editPic) {
        postData.append('pic', editPic);
      }

      const response = await axios.post(`${API_BASE_URL}/api/update-property`, postData, {
        headers: getAdminHeaders()
      });

      if (response?.data?.code === 200) {
        Swal.fire({
          title: "Updated!",
          text: "Property details updated successfully.",
          icon: "success",
          timer: 1500,
          showConfirmButton: false
        });
        setEditModalOpen(false);
        fetchData();
      } else {
        Swal.fire({
          title: "Update Failed",
          text: response?.data?.message || "Failed to update property.",
          icon: "error"
        });
      }
    } catch (err) {
      Swal.fire({
        title: "Error",
        text: err?.response?.data?.message || "Server error occurred while updating.",
        icon: "error"
      });
    } finally {
      setIsUpdating(false);
    }
  };

  const handleDeleteProperty = async (_id) => {
    Swal.fire({
      title: "Delete Property?",
      text: "This listing will be permanently removed from the public catalog.",
      icon: "warning",
      showCancelButton: true,
      confirmButtonColor: "#d33",
      cancelButtonColor: "#6c757d",
      confirmButtonText: "Yes, Delete!"
    }).then(async (result) => {
      if (result.isConfirmed) {
        try {
          const response = await axios.post(`${API_BASE_URL}/api/delete-property`, { _id }, {
            headers: getAdminHeaders()
          });
          if (response?.data?.code === 200) {
            Swal.fire({
              title: "Deleted!",
              text: response?.data?.message || "Property removed successfully.",
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
            text: err?.response?.data?.message || "Could not delete property. Please try again.",
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
        <div className="d-flex flex-column flex-md-row justify-content-between align-items-md-center gap-3 mb-4">
          <div>
            <div className="tagline">Admin Zone</div>
            <h2 className="section-title mb-1">Listed Properties</h2>
            <p className="text-muted mb-0">Manage and monitor all active property listings on Quirex portal.</p>
          </div>
          <div className="d-flex gap-2">
            <Link to="/admin-categories" className="btn btn-outline-secondary d-inline-flex align-items-center gap-2 px-3 py-2">
              <FaLayerGroup /> Categories & Hub
            </Link>
            <Link to="/admin-add" className="btn btn-login d-inline-flex align-items-center gap-2 px-4 py-2">
              <FaPlus /> Add New Property
            </Link>
          </div>
        </div>

        <div className="card shadow-sm border-0 rounded-4 overflow-hidden">
          <div className="table-responsive">
            <table className="table table-hover align-middle mb-0">
              <thead className="table-dark">
                <tr>
                  <th scope="col" className="ps-4">Image</th>
                  <th scope="col">Title</th>
                  <th scope="col">Location</th>
                  <th scope="col">Category</th>
                  <th scope="col">Status</th>
                  <th scope="col">Price</th>
                  <th scope="col">Bedrooms</th>
                  <th scope="col" className="text-center pe-4">Actions</th>
                </tr>
              </thead>
              <tbody>
                {listData?.map((item, index) => (
                  <tr key={item?._id || index}>
                    <td className="ps-4">
                      <img
                        src={getPropertyImageUrl(item, index)}
                        alt={item?.title || 'Property'}
                        className="rounded-3 shadow-sm"
                        style={{ height: '55px', width: '80px', objectFit: 'cover' }}
                        onError={(e) => handleImageError(e, item?.category, index)}
                      />
                    </td>
                    <td>
                      <span className="fw-bold text-dark d-block">{item?.title}</span>
                      <small className="text-muted text-truncate d-inline-block" style={{ maxWidth: '200px' }}>
                        {item?.description}
                      </small>
                    </td>
                    <td>
                      <span className="d-inline-flex align-items-center gap-1 text-muted">
                        <FaMapMarkerAlt className="text-danger small" /> {item?.location}
                      </span>
                    </td>
                    <td>
                      <span className="badge bg-light text-dark border">
                        {item?.category || 'House'}
                      </span>
                    </td>
                    <td>
                      <span className={`badge ${item?.status?.toLowerCase() === 'sale' ? 'bg-primary-subtle text-primary border border-primary-subtle' : 'bg-success-subtle text-success border border-success-subtle'} px-3 py-1 rounded-pill`}>
                        {item?.status || 'Rent'}
                      </span>
                    </td>
                    <td>
                      <span className="fw-bold text-coral">${item?.price}{item?.status?.toLowerCase() === 'rent' ? '/mo' : ''}</span>
                    </td>
                    <td>
                      <span className="d-inline-flex align-items-center gap-1 text-secondary">
                        <FaBed /> {item?.bedrooms || item?.area || '1'} Bed
                      </span>
                    </td>
                    <td className="text-center pe-4">
                      <div className="d-inline-flex gap-2">
                        <button
                          onClick={() => openEditModal(item)}
                          className="btn btn-sm btn-outline-primary d-inline-flex align-items-center gap-1 px-3 py-1"
                          title="Edit Property"
                        >
                          <FaEdit /> Edit
                        </button>
                        <button
                          onClick={() => handleDeleteProperty(item?._id)}
                          className="btn btn-sm btn-outline-danger d-inline-flex align-items-center gap-1 px-3 py-1"
                          title="Delete Property"
                        >
                          <FaTrashAlt /> Delete
                        </button>
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>

          {!loading && listData?.length === 0 && (
            <div className="text-center py-5">
              <h5 className="text-muted">No Properties Listed Yet</h5>
              <p className="small text-secondary mb-3">Click "Add New Property" to publish your first real estate listing.</p>
              <Link to="/admin-add" className="btn btn-sm btn-login px-4">
                Add Property
              </Link>
            </div>
          )}
        </div>
      </div>

      {/* Edit Property Modal */}
      {editModalOpen && (
        <div className="modal fade show d-block" tabIndex="-1" style={{ backgroundColor: 'rgba(0,0,0,0.55)', backdropFilter: 'blur(3px)' }}>
          <div className="modal-dialog modal-dialog-centered modal-lg">
            <div className="modal-content border-0 rounded-4 shadow-lg overflow-hidden">
              <div className="modal-header bg-dark text-white px-4 py-3">
                <h5 className="modal-title fw-bold d-flex align-items-center gap-2">
                  <FaEdit className="text-coral" /> Edit Property Listing
                </h5>
                <button 
                  type="button" 
                  className="btn-close btn-close-white" 
                  onClick={() => setEditModalOpen(false)}
                  aria-label="Close"
                ></button>
              </div>

              <form onSubmit={handleUpdateProperty}>
                <div className="modal-body p-4">
                  <div className="row g-3">
                    <div className="col-12 col-md-6">
                      <label className="form-label fw-semibold">Property Title</label>
                      <input 
                        type="text" 
                        className="form-control" 
                        value={formData.title} 
                        onChange={(e) => setFormData({ ...formData, title: e.target.value })} 
                        required 
                      />
                    </div>

                    <div className="col-12 col-md-6">
                      <label className="form-label fw-semibold">Location / Address</label>
                      <input 
                        type="text" 
                        className="form-control" 
                        value={formData.location} 
                        onChange={(e) => setFormData({ ...formData, location: e.target.value })} 
                        required 
                      />
                    </div>

                    <div className="col-12 col-md-4">
                      <label className="form-label fw-semibold">Price ($)</label>
                      <input 
                        type="text" 
                        className="form-control" 
                        value={formData.price} 
                        onChange={(e) => setFormData({ ...formData, price: e.target.value })} 
                        required 
                      />
                    </div>

                    <div className="col-12 col-md-4">
                      <label className="form-label fw-semibold">Category</label>
                      <select 
                        className="form-select" 
                        value={formData.category} 
                        onChange={(e) => setFormData({ ...formData, category: e.target.value })}
                      >
                        {categories.map(c => (
                          <option key={c} value={c}>{c}</option>
                        ))}
                      </select>
                    </div>

                    <div className="col-12 col-md-4">
                      <label className="form-label fw-semibold">Listing Status</label>
                      <select 
                        className="form-select" 
                        value={formData.status} 
                        onChange={(e) => setFormData({ ...formData, status: e.target.value })}
                      >
                        <option value="Rent">For Rent</option>
                        <option value="Sale">For Sale</option>
                        <option value="Sold">Sold Out</option>
                      </select>
                    </div>

                    <div className="col-12 col-md-4">
                      <label className="form-label fw-semibold">Bedrooms</label>
                      <input 
                        type="text" 
                        className="form-control" 
                        value={formData.bedrooms} 
                        onChange={(e) => setFormData({ ...formData, bedrooms: e.target.value })} 
                      />
                    </div>

                    <div className="col-12 col-md-4">
                      <label className="form-label fw-semibold">Area (Sq Ft)</label>
                      <input 
                        type="text" 
                        className="form-control" 
                        value={formData.area} 
                        onChange={(e) => setFormData({ ...formData, area: e.target.value })} 
                      />
                    </div>

                    <div className="col-12 col-md-4">
                      <label className="form-label fw-semibold">Service Specialty</label>
                      <input 
                        type="text" 
                        className="form-control" 
                        value={formData.serviceType} 
                        onChange={(e) => setFormData({ ...formData, serviceType: e.target.value })} 
                      />
                    </div>

                    <div className="col-12 col-md-6 d-flex align-items-center">
                      <div className="form-check mt-2">
                        <input 
                          type="checkbox" 
                          className="form-check-input" 
                          id="editOfferCheck"
                          checked={formData.isOffer}
                          onChange={(e) => setFormData({ ...formData, isOffer: e.target.checked })}
                        />
                        <label className="form-check-label fw-semibold" htmlFor="editOfferCheck">
                          Feature in Recent Offers & Deals
                        </label>
                      </div>
                    </div>

                    {formData.isOffer && (
                      <div className="col-12 col-md-6">
                        <label className="form-label fw-semibold">Discount / Promo Tag</label>
                        <input 
                          type="text" 
                          className="form-control" 
                          placeholder="e.g. 15% OFF"
                          value={formData.offerDiscount}
                          onChange={(e) => setFormData({ ...formData, offerDiscount: e.target.value })}
                        />
                      </div>
                    )}

                    <div className="col-12">
                      <label className="form-label fw-semibold">Description</label>
                      <textarea 
                        className="form-control" 
                        rows="3" 
                        value={formData.description} 
                        onChange={(e) => setFormData({ ...formData, description: e.target.value })}
                      ></textarea>
                    </div>

                    <div className="col-12">
                      <label className="form-label fw-semibold">Change Property Image (Optional)</label>
                      <div className="d-flex align-items-center gap-3">
                        {picPreview && (
                          <img 
                            src={picPreview} 
                            alt="Preview" 
                            className="rounded-3 border" 
                            style={{ width: '90px', height: '60px', objectFit: 'cover' }} 
                          />
                        )}
                        <input 
                          type="file" 
                          className="form-control" 
                          accept="image/*" 
                          onChange={handleFileChange} 
                        />
                      </div>
                    </div>
                  </div>
                </div>

                <div className="modal-footer bg-light px-4 py-3">
                  <button 
                    type="button" 
                    className="btn btn-secondary px-4" 
                    onClick={() => setEditModalOpen(false)}
                  >
                    Cancel
                  </button>
                  <button 
                    type="submit" 
                    className="btn btn-login px-4 d-inline-flex align-items-center gap-2"
                    disabled={isUpdating}
                  >
                    <FaSave /> {isUpdating ? 'Saving...' : 'Save Changes'}
                  </button>
                </div>
              </form>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default AdminPropertyList;
