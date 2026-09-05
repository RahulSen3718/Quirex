import React, { useEffect, useState } from 'react';
import NavBar from '../landingComponents/NavBar';
import axios from 'axios';
import Swal from 'sweetalert2';
import { API_BASE_URL } from '../../config/api';
import { getPropertyImageUrl, handleImageError } from '../../utils/propertyImageHelper';
import { 
  FaFolderPlus, 
  FaEdit, 
  FaTrashAlt, 
  FaSearch, 
  FaPlus, 
  FaUserTie, 
  FaBuilding, 
  FaSave, 
  FaTimes, 
  FaImage, 
  FaTag, 
  FaCheckCircle, 
  FaStar, 
  FaPhoneAlt, 
  FaEnvelope, 
  FaMapMarkerAlt, 
  FaPercent, 
  FaLayerGroup 
} from 'react-icons/fa';
import { IoSparklesOutline, IoRefreshOutline } from 'react-icons/io5';
import { Link } from 'react-router-dom';

const AdminCategoryManagement = () => {
  const [activeTab, setActiveTab] = useState('categories'); // 'categories' | 'providers' | 'listings'
  const [userData, setUserData] = useState(() => {
    try {
      return JSON.parse(localStorage.getItem('userInfo'));
    } catch {
      return null;
    }
  });

  // Category State
  const [categories, setCategories] = useState([]);
  const [catSearch, setCatSearch] = useState('');
  const [catModalOpen, setCatModalOpen] = useState(false);
  const [isEditingCat, setIsEditingCat] = useState(false);
  const [catFormData, setCatFormData] = useState({
    _id: '',
    name: '',
    description: '',
    icon: 'FaHome',
    isActive: true
  });
  const [catImageFile, setCatImageFile] = useState(null);
  const [catImagePreview, setCatImagePreview] = useState(null);

  // Provider State
  const [providers, setProviders] = useState([]);
  const [provSearch, setProvSearch] = useState('');
  const [provModalOpen, setProvModalOpen] = useState(false);
  const [isEditingProv, setIsEditingProv] = useState(false);
  const [provFormData, setProvFormData] = useState({
    _id: '',
    name: '',
    email: '',
    phone: '',
    category: 'House',
    serviceType: '',
    experience: '5+ Years',
    rating: 4.8,
    location: '',
    priceRange: '$$',
    bio: '',
    isActive: true
  });
  const [provImageFile, setProvImageFile] = useState(null);
  const [provImagePreview, setProvImagePreview] = useState(null);

  // Listings State
  const [listings, setListings] = useState([]);
  const [listingSearch, setListingSearch] = useState('');

  // Overview Stats
  const [stats, setStats] = useState({
    totalCategories: 0,
    totalProviders: 0,
    totalProperties: 0,
    totalSold: 0
  });

  const [loading, setLoading] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);

  // Helper for admin headers
  const getAdminHeaders = () => {
    const adminId = userData?._id || userData?.email || '';
    return {
      'x-admin-id': adminId,
      'Authorization': `Bearer ${adminId}`
    };
  };

  useEffect(() => {
    fetchAllData();
  }, []);

  const fetchAllData = async () => {
    setLoading(true);
    try {
      const headers = getAdminHeaders();
      const [catRes, provRes, propRes, statsRes] = await Promise.all([
        axios.get(`${API_BASE_URL}/api/admin/categories`, { headers }),
        axios.get(`${API_BASE_URL}/api/admin/providers`, { headers }),
        axios.get(`${API_BASE_URL}/api/property-list`),
        axios.get(`${API_BASE_URL}/api/admin/overview-stats`, { headers })
      ]);

      if (catRes?.data?.code === 200) setCategories(catRes.data.data || []);
      if (provRes?.data?.code === 200) setProviders(provRes.data.data || []);
      if (propRes?.data?.code === 200) setListings(propRes.data.data || []);
      if (statsRes?.data?.code === 200 && statsRes.data.data) {
        setStats(statsRes.data.data);
      }
    } catch (err) {
      console.error("Error fetching admin data:", err);
    } finally {
      setLoading(false);
    }
  };

  // =========================================================================
  // CATEGORY ACTIONS
  // =========================================================================
  const openAddCategoryModal = () => {
    setIsEditingCat(false);
    setCatFormData({
      _id: '',
      name: '',
      description: '',
      icon: 'FaHome',
      isActive: true
    });
    setCatImageFile(null);
    setCatImagePreview(null);
    setCatModalOpen(true);
  };

  const openEditCategoryModal = (cat) => {
    setIsEditingCat(true);
    setCatFormData({
      _id: cat._id,
      name: cat.name || '',
      description: cat.description || '',
      icon: cat.icon || 'FaHome',
      isActive: cat.isActive !== undefined ? cat.isActive : true
    });
    setCatImagePreview(cat.image ? `${API_BASE_URL}/img/${cat.image}` : null);
    setCatImageFile(null);
    setCatModalOpen(true);
  };

  const handleSaveCategory = async (e) => {
    e.preventDefault();
    if (!catFormData.name.trim()) {
      Swal.fire({ title: "Validation", text: "Category name is required.", icon: "warning" });
      return;
    }

    setIsSubmitting(true);
    try {
      const headers = getAdminHeaders();
      const formPayload = new FormData();
      if (catFormData._id) formPayload.append('_id', catFormData._id);
      formPayload.append('name', catFormData.name.trim());
      formPayload.append('description', catFormData.description.trim());
      formPayload.append('icon', catFormData.icon);
      formPayload.append('isActive', catFormData.isActive);
      if (catImageFile) {
        formPayload.append('image', catImageFile);
      }

      const endpoint = isEditingCat 
        ? `${API_BASE_URL}/api/admin/update-category`
        : `${API_BASE_URL}/api/admin/add-category`;

      const res = await axios.post(endpoint, formPayload, { headers });

      if (res?.data?.code === 200) {
        Swal.fire({
          title: "Success!",
          text: res.data.message || "Category saved successfully.",
          icon: "success",
          timer: 1500,
          showConfirmButton: false
        });
        setCatModalOpen(false);
        fetchAllData();
      } else {
        Swal.fire({
          title: "Failed",
          text: res?.data?.message || "Could not save category.",
          icon: "error"
        });
      }
    } catch (err) {
      Swal.fire({
        title: "Server Error",
        text: err?.response?.data?.message || "Error saving category. Check admin credentials.",
        icon: "error"
      });
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleDeleteCategory = async (catId, catName) => {
    Swal.fire({
      title: `Delete Category?`,
      text: `Are you sure you want to delete "${catName}"? This action cannot be undone.`,
      icon: "warning",
      showCancelButton: true,
      confirmButtonColor: "#d33",
      cancelButtonColor: "#6c757d",
      confirmButtonText: "Yes, Delete!"
    }).then(async (result) => {
      if (result.isConfirmed) {
        try {
          const headers = getAdminHeaders();
          const res = await axios.post(`${API_BASE_URL}/api/admin/delete-category`, { _id: catId }, { headers });
          if (res?.data?.code === 200) {
            Swal.fire({
              title: "Deleted!",
              text: "Category removed successfully.",
              icon: "success",
              timer: 1500,
              showConfirmButton: false
            });
            fetchAllData();
          } else {
            Swal.fire({ title: "Failed", text: res?.data?.message, icon: "error" });
          }
        } catch (err) {
          Swal.fire({
            title: "Server Error",
            text: err?.response?.data?.message || "Could not delete category.",
            icon: "error"
          });
        }
      }
    });
  };

  // =========================================================================
  // SERVICE PROVIDER ACTIONS
  // =========================================================================
  const openAddProviderModal = () => {
    setIsEditingProv(false);
    setProvFormData({
      _id: '',
      name: '',
      email: '',
      phone: '',
      category: categories.length > 0 ? categories[0].name : 'House',
      serviceType: 'Luxury Real Estate Advisory',
      experience: '5+ Years',
      rating: 4.8,
      location: '',
      priceRange: '$$',
      bio: '',
      isActive: true
    });
    setProvImageFile(null);
    setProvImagePreview(null);
    setProvModalOpen(true);
  };

  const openEditProviderModal = (prov) => {
    setIsEditingProv(true);
    setProvFormData({
      _id: prov._id,
      name: prov.name || '',
      email: prov.email || '',
      phone: prov.phone || '',
      category: prov.category || 'House',
      serviceType: prov.serviceType || '',
      experience: prov.experience || '5+ Years',
      rating: prov.rating || 4.8,
      location: prov.location || '',
      priceRange: prov.priceRange || '$$',
      bio: prov.bio || '',
      isActive: prov.isActive !== undefined ? prov.isActive : true
    });
    setProvImagePreview(prov.image ? `${API_BASE_URL}/img/${prov.image}` : null);
    setProvImageFile(null);
    setProvModalOpen(true);
  };

  const handleSaveProvider = async (e) => {
    e.preventDefault();
    if (!provFormData.name.trim() || !provFormData.email.trim() || !provFormData.location.trim()) {
      Swal.fire({ title: "Validation", text: "Name, Email, and Location are required.", icon: "warning" });
      return;
    }

    setIsSubmitting(true);
    try {
      const headers = getAdminHeaders();
      const formPayload = new FormData();
      if (provFormData._id) formPayload.append('_id', provFormData._id);
      formPayload.append('name', provFormData.name.trim());
      formPayload.append('email', provFormData.email.trim());
      formPayload.append('phone', provFormData.phone.trim());
      formPayload.append('category', provFormData.category);
      formPayload.append('serviceType', provFormData.serviceType.trim());
      formPayload.append('experience', provFormData.experience.trim());
      formPayload.append('rating', provFormData.rating);
      formPayload.append('location', provFormData.location.trim());
      formPayload.append('priceRange', provFormData.priceRange);
      formPayload.append('bio', provFormData.bio.trim());
      formPayload.append('isActive', provFormData.isActive);
      if (provImageFile) {
        formPayload.append('image', provImageFile);
      }

      const endpoint = isEditingProv 
        ? `${API_BASE_URL}/api/admin/update-provider`
        : `${API_BASE_URL}/api/admin/add-provider`;

      const res = await axios.post(endpoint, formPayload, { headers });

      if (res?.data?.code === 200) {
        Swal.fire({
          title: "Success!",
          text: res.data.message || "Service Provider saved successfully.",
          icon: "success",
          timer: 1500,
          showConfirmButton: false
        });
        setProvModalOpen(false);
        fetchAllData();
      } else {
        Swal.fire({
          title: "Failed",
          text: res?.data?.message || "Could not save provider.",
          icon: "error"
        });
      }
    } catch (err) {
      Swal.fire({
        title: "Server Error",
        text: err?.response?.data?.message || "Error saving provider.",
        icon: "error"
      });
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleDeleteProvider = async (provId, provName) => {
    Swal.fire({
      title: `Delete Service Provider?`,
      text: `Are you sure you want to remove "${provName}"?`,
      icon: "warning",
      showCancelButton: true,
      confirmButtonColor: "#d33",
      cancelButtonColor: "#6c757d",
      confirmButtonText: "Yes, Delete!"
    }).then(async (result) => {
      if (result.isConfirmed) {
        try {
          const headers = getAdminHeaders();
          const res = await axios.post(`${API_BASE_URL}/api/admin/delete-provider`, { _id: provId }, { headers });
          if (res?.data?.code === 200) {
            Swal.fire({
              title: "Deleted!",
              text: "Provider deleted successfully.",
              icon: "success",
              timer: 1500,
              showConfirmButton: false
            });
            fetchAllData();
          } else {
            Swal.fire({ title: "Failed", text: res?.data?.message, icon: "error" });
          }
        } catch (err) {
          Swal.fire({
            title: "Server Error",
            text: err?.response?.data?.message || "Could not delete provider.",
            icon: "error"
          });
        }
      }
    });
  };

  // Filtered Tables
  const filteredCategories = categories.filter(c => 
    c.name.toLowerCase().includes(catSearch.toLowerCase()) || 
    (c.description && c.description.toLowerCase().includes(catSearch.toLowerCase()))
  );

  const filteredProviders = providers.filter(p => 
    p.name.toLowerCase().includes(provSearch.toLowerCase()) || 
    p.serviceType.toLowerCase().includes(provSearch.toLowerCase()) ||
    p.location.toLowerCase().includes(provSearch.toLowerCase()) ||
    p.category.toLowerCase().includes(provSearch.toLowerCase())
  );

  const filteredListings = listings.filter(l => 
    l.title.toLowerCase().includes(listingSearch.toLowerCase()) || 
    l.location.toLowerCase().includes(listingSearch.toLowerCase()) ||
    (l.category && l.category.toLowerCase().includes(listingSearch.toLowerCase()))
  );

  return (
    <div className="min-vh-100 bg-light">
      <NavBar />

      <div className="container py-5">
        {/* Header Title */}
        <div className="d-flex flex-column flex-md-row justify-content-between align-items-md-center gap-3 mb-4">
          <div>
            <div className="tagline">Admin Control Hub</div>
            <h2 className="section-title mb-1">Category & Service Management</h2>
            <p className="text-muted mb-0">Full CRUD operations for real estate categories, licensed service providers, and live property listings.</p>
          </div>
          <div className="d-flex gap-2 flex-wrap">
            <Link to="/admin-add" className="btn btn-login d-inline-flex align-items-center gap-2 px-3 py-2">
              <FaPlus /> Add Property
            </Link>
            <button onClick={fetchAllData} className="btn btn-outline-secondary d-inline-flex align-items-center gap-2 px-3 py-2">
              <IoRefreshOutline /> Refresh
            </button>
          </div>
        </div>

        {/* Overview Stats Cards */}
        <div className="row g-3 mb-4">
          <div className="col-6 col-md-3">
            <div className="card border-0 rounded-4 shadow-sm p-3 bg-white d-flex flex-row align-items-center gap-3">
              <div className="p-3 rounded-circle text-white" style={{ backgroundColor: '#FF5A3C' }}>
                <FaLayerGroup size={22} />
              </div>
              <div>
                <span className="text-muted small d-block">Categories</span>
                <h4 className="fw-bold text-dark mb-0">{categories.length}</h4>
              </div>
            </div>
          </div>
          <div className="col-6 col-md-3">
            <div className="card border-0 rounded-4 shadow-sm p-3 bg-white d-flex flex-row align-items-center gap-3">
              <div className="p-3 rounded-circle bg-info text-white">
                <FaUserTie size={22} />
              </div>
              <div>
                <span className="text-muted small d-block">Service Providers</span>
                <h4 className="fw-bold text-dark mb-0">{providers.length}</h4>
              </div>
            </div>
          </div>
          <div className="col-6 col-md-3">
            <div className="card border-0 rounded-4 shadow-sm p-3 bg-white d-flex flex-row align-items-center gap-3">
              <div className="p-3 rounded-circle bg-primary text-white">
                <FaBuilding size={22} />
              </div>
              <div>
                <span className="text-muted small d-block">Active Listings</span>
                <h4 className="fw-bold text-dark mb-0">{listings.length}</h4>
              </div>
            </div>
          </div>
          <div className="col-6 col-md-3">
            <div className="card border-0 rounded-4 shadow-sm p-3 bg-white d-flex flex-row align-items-center gap-3">
              <div className="p-3 rounded-circle bg-success text-white">
                <FaCheckCircle size={22} />
              </div>
              <div>
                <span className="text-muted small d-block">Public Sync</span>
                <h4 className="fw-bold text-success mb-0">Live Online</h4>
              </div>
            </div>
          </div>
        </div>

        {/* Tab Navigation */}
        <div className="card border-0 rounded-4 shadow-sm overflow-hidden mb-4">
          <div className="card-header bg-white border-bottom p-3">
            <ul className="nav nav-pills card-header-pills gap-2">
              <li className="nav-item">
                <button 
                  className={`nav-link px-4 py-2 rounded-pill fw-semibold ${activeTab === 'categories' ? 'active bg-coral text-white' : 'text-dark bg-light'}`}
                  style={{ backgroundColor: activeTab === 'categories' ? '#FF5A3C' : '' }}
                  onClick={() => setActiveTab('categories')}
                >
                  <FaLayerGroup className="me-2" /> Categories ({categories.length})
                </button>
              </li>
              <li className="nav-item">
                <button 
                  className={`nav-link px-4 py-2 rounded-pill fw-semibold ${activeTab === 'providers' ? 'active bg-coral text-white' : 'text-dark bg-light'}`}
                  style={{ backgroundColor: activeTab === 'providers' ? '#FF5A3C' : '' }}
                  onClick={() => setActiveTab('providers')}
                >
                  <FaUserTie className="me-2" /> Service Providers ({providers.length})
                </button>
              </li>
              <li className="nav-item">
                <button 
                  className={`nav-link px-4 py-2 rounded-pill fw-semibold ${activeTab === 'listings' ? 'active bg-coral text-white' : 'text-dark bg-light'}`}
                  style={{ backgroundColor: activeTab === 'listings' ? '#FF5A3C' : '' }}
                  onClick={() => setActiveTab('listings')}
                >
                  <FaBuilding className="me-2" /> Property Overview ({listings.length})
                </button>
              </li>
            </ul>
          </div>

          <div className="card-body p-4">
            
            {/* ========================================================================= */}
            {/* TAB 1: CATEGORY MANAGEMENT */}
            {/* ========================================================================= */}
            {activeTab === 'categories' && (
              <div>
                <div className="d-flex flex-column flex-md-row justify-content-between align-items-md-center gap-3 mb-4">
                  <div className="position-relative" style={{ maxWidth: '360px', width: '100%' }}>
                    <FaSearch className="position-absolute top-50 translate-middle-y text-muted ms-3" />
                    <input 
                      type="text" 
                      className="form-control rounded-pill ps-5" 
                      placeholder="Search categories..."
                      value={catSearch}
                      onChange={(e) => setCatSearch(e.target.value)}
                    />
                  </div>
                  <button 
                    onClick={openAddCategoryModal}
                    className="btn btn-primary bggcolor border-0 text-white px-4 py-2 rounded-pill d-inline-flex align-items-center gap-2 fw-semibold"
                  >
                    <FaFolderPlus /> Add New Category
                  </button>
                </div>

                <div className="table-responsive">
                  <table className="table table-hover align-middle mb-0">
                    <thead className="table-dark">
                      <tr>
                        <th scope="col" className="ps-4">Preview</th>
                        <th scope="col">Category Name</th>
                        <th scope="col">Icon</th>
                        <th scope="col">Description</th>
                        <th scope="col">Live Listings</th>
                        <th scope="col">Status</th>
                        <th scope="col" className="text-center pe-4">Actions</th>
                      </tr>
                    </thead>
                    <tbody>
                      {filteredCategories.map((cat) => (
                        <tr key={cat._id}>
                          <td className="ps-4">
                            <img 
                              src={`${API_BASE_URL}/img/${cat.image}`} 
                              alt={cat.name}
                              className="rounded-3 shadow-sm border"
                              style={{ width: '64px', height: '44px', objectFit: 'cover' }}
                              onError={(e) => { e.target.src = '/img/1.jpg.jpeg'; }}
                            />
                          </td>
                          <td>
                            <strong className="text-dark fs-6">{cat.name}</strong>
                            <small className="text-muted d-block">/{cat.slug || cat.name.toLowerCase()}</small>
                          </td>
                          <td>
                            <span className="badge bg-light text-dark border px-2 py-1">
                              {cat.icon || 'FaHome'}
                            </span>
                          </td>
                          <td>
                            <span className="small text-muted text-truncate d-inline-block" style={{ maxWidth: '280px' }}>
                              {cat.description || 'No description entered.'}
                            </span>
                          </td>
                          <td>
                            <span className="badge bg-primary-subtle text-primary border border-primary-subtle px-3 py-1 rounded-pill fw-semibold">
                              {cat.itemCount !== undefined ? cat.itemCount : listings.filter(l => (l.category || '').toLowerCase() === cat.name.toLowerCase()).length} Listings
                            </span>
                          </td>
                          <td>
                            {cat.isActive !== false ? (
                              <span className="badge bg-success-subtle text-success border border-success-subtle px-3 py-1 rounded-pill">Active</span>
                            ) : (
                              <span className="badge bg-secondary-subtle text-secondary border px-3 py-1 rounded-pill">Hidden</span>
                            )}
                          </td>
                          <td className="text-center pe-4">
                            <div className="d-inline-flex gap-2">
                              <button 
                                onClick={() => openEditCategoryModal(cat)}
                                className="btn btn-sm btn-outline-primary d-inline-flex align-items-center gap-1 px-3 py-1"
                                title="Edit Category"
                              >
                                <FaEdit /> Edit
                              </button>
                              <button 
                                onClick={() => handleDeleteCategory(cat._id, cat.name)}
                                className="btn btn-sm btn-outline-danger d-inline-flex align-items-center gap-1 px-3 py-1"
                                title="Delete Category"
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

                {!loading && filteredCategories.length === 0 && (
                  <div className="text-center py-5">
                    <h5 className="text-muted">No categories match your search</h5>
                    <p className="small text-secondary mb-3">Click "Add New Category" to create a fresh category in the system.</p>
                    <button onClick={openAddCategoryModal} className="btn btn-sm btn-login px-4">
                      Add Category
                    </button>
                  </div>
                )}
              </div>
            )}

            {/* ========================================================================= */}
            {/* TAB 2: SERVICE PROVIDER MANAGEMENT */}
            {/* ========================================================================= */}
            {activeTab === 'providers' && (
              <div>
                <div className="d-flex flex-column flex-md-row justify-content-between align-items-md-center gap-3 mb-4">
                  <div className="position-relative" style={{ maxWidth: '360px', width: '100%' }}>
                    <FaSearch className="position-absolute top-50 translate-middle-y text-muted ms-3" />
                    <input 
                      type="text" 
                      className="form-control rounded-pill ps-5" 
                      placeholder="Search service providers..."
                      value={provSearch}
                      onChange={(e) => setProvSearch(e.target.value)}
                    />
                  </div>
                  <button 
                    onClick={openAddProviderModal}
                    className="btn btn-primary bggcolor border-0 text-white px-4 py-2 rounded-pill d-inline-flex align-items-center gap-2 fw-semibold"
                  >
                    <FaPlus /> Add Service Provider
                  </button>
                </div>

                <div className="table-responsive">
                  <table className="table table-hover align-middle mb-0">
                    <thead className="table-dark">
                      <tr>
                        <th scope="col" className="ps-4">Avatar</th>
                        <th scope="col">Provider Name</th>
                        <th scope="col">Service Type</th>
                        <th scope="col">Category</th>
                        <th scope="col">Contact</th>
                        <th scope="col">Rating & Exp</th>
                        <th scope="col">Location</th>
                        <th scope="col" className="text-center pe-4">Actions</th>
                      </tr>
                    </thead>
                    <tbody>
                      {filteredProviders.map((prov) => (
                        <tr key={prov._id}>
                          <td className="ps-4">
                            <img 
                              src={`${API_BASE_URL}/img/${prov.image}`} 
                              alt={prov.name}
                              className="rounded-circle shadow-sm border"
                              style={{ width: '48px', height: '48px', objectFit: 'cover' }}
                              onError={(e) => { e.target.src = '/img/author.jpg.jpeg'; }}
                            />
                          </td>
                          <td>
                            <strong className="text-dark">{prov.name}</strong>
                            <small className="text-muted d-block text-truncate" style={{ maxWidth: '180px' }}>{prov.bio}</small>
                          </td>
                          <td>
                            <span className="badge bg-info-subtle text-info border border-info-subtle px-2 py-1">
                              {prov.serviceType}
                            </span>
                          </td>
                          <td>
                            <span className="badge bg-light text-dark border">
                              {prov.category}
                            </span>
                          </td>
                          <td>
                            <div className="small">
                              <div><FaEnvelope className="text-muted me-1 small" /> {prov.email}</div>
                              <div><FaPhoneAlt className="text-muted me-1 small" /> {prov.phone}</div>
                            </div>
                          </td>
                          <td>
                            <div className="d-flex align-items-center gap-1 text-warning small fw-bold">
                              <FaStar /> {prov.rating || 4.8}
                            </div>
                            <small className="text-muted">{prov.experience || '5+ Years'}</small>
                          </td>
                          <td>
                            <span className="d-inline-flex align-items-center gap-1 text-muted small">
                              <FaMapMarkerAlt className="text-danger small" /> {prov.location}
                            </span>
                          </td>
                          <td className="text-center pe-4">
                            <div className="d-inline-flex gap-2">
                              <button 
                                onClick={() => openEditProviderModal(prov)}
                                className="btn btn-sm btn-outline-primary d-inline-flex align-items-center gap-1 px-3 py-1"
                                title="Edit Provider"
                              >
                                <FaEdit /> Edit
                              </button>
                              <button 
                                onClick={() => handleDeleteProvider(prov._id, prov.name)}
                                className="btn btn-sm btn-outline-danger d-inline-flex align-items-center gap-1 px-3 py-1"
                                title="Delete Provider"
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

                {!loading && filteredProviders.length === 0 && (
                  <div className="text-center py-5">
                    <h5 className="text-muted">No service providers registered</h5>
                    <p className="small text-secondary mb-3">Click "Add Service Provider" to add your first real estate partner.</p>
                    <button onClick={openAddProviderModal} className="btn btn-sm btn-login px-4">
                      Add Provider
                    </button>
                  </div>
                )}
              </div>
            )}

            {/* ========================================================================= */}
            {/* TAB 3: LISTINGS OVERVIEW */}
            {/* ========================================================================= */}
            {activeTab === 'listings' && (
              <div>
                <div className="d-flex flex-column flex-md-row justify-content-between align-items-md-center gap-3 mb-4">
                  <div className="position-relative" style={{ maxWidth: '360px', width: '100%' }}>
                    <FaSearch className="position-absolute top-50 translate-middle-y text-muted ms-3" />
                    <input 
                      type="text" 
                      className="form-control rounded-pill ps-5" 
                      placeholder="Search active listings..."
                      value={listingSearch}
                      onChange={(e) => setListingSearch(e.target.value)}
                    />
                  </div>
                  <div className="d-flex gap-2">
                    <Link to="/admin-list" className="btn btn-outline-primary px-3 py-2 rounded-pill fw-semibold">
                      Full Listing Manager
                    </Link>
                    <Link to="/admin-add" className="btn btn-primary bggcolor border-0 text-white px-4 py-2 rounded-pill fw-semibold">
                      <FaPlus className="me-1" /> Add New Property
                    </Link>
                  </div>
                </div>

                <div className="table-responsive">
                  <table className="table table-hover align-middle mb-0">
                    <thead className="table-dark">
                      <tr>
                        <th scope="col" className="ps-4">Image</th>
                        <th scope="col">Title</th>
                        <th scope="col">Category</th>
                        <th scope="col">Status</th>
                        <th scope="col">Price</th>
                        <th scope="col">Special Offer</th>
                        <th scope="col">Location</th>
                        <th scope="col" className="text-center pe-4">Actions</th>
                      </tr>
                    </thead>
                    <tbody>
                      {filteredListings.slice(0, 10).map((item) => (
                        <tr key={item._id}>
                          <td className="ps-4">
                            <img 
                              src={getPropertyImageUrl(item)} 
                              alt={item.title}
                              className="rounded-3 shadow-sm border"
                              style={{ width: '60px', height: '40px', objectFit: 'cover' }}
                              onError={(e) => handleImageError(e, item?.category)}
                            />
                          </td>
                          <td>
                            <strong className="text-dark d-block text-truncate" style={{ maxWidth: '220px' }}>{item.title}</strong>
                            <small className="text-muted">{item.bedrooms || '1'} Beds • {item.area || '1,200'} Sq Ft</small>
                          </td>
                          <td>
                            <span className="badge bg-light text-dark border">{item.category || 'House'}</span>
                          </td>
                          <td>
                            <span className={`badge ${item.status?.toLowerCase() === 'sale' ? 'bg-primary-subtle text-primary border border-primary-subtle' : 'bg-success-subtle text-success border border-success-subtle'} px-3 py-1 rounded-pill`}>
                              {item.status || 'Rent'}
                            </span>
                          </td>
                          <td>
                            <strong className="text-coral">${item.price}{item.status?.toLowerCase() === 'rent' ? '/mo' : ''}</strong>
                          </td>
                          <td>
                            {item.isOffer ? (
                              <span className="badge bg-danger px-2 py-1 rounded-pill">
                                {item.offerDiscount || 'Offer Deal'}
                              </span>
                            ) : (
                              <span className="text-muted small">Standard</span>
                            )}
                          </td>
                          <td>
                            <span className="small text-muted text-truncate d-inline-block" style={{ maxWidth: '150px' }}>
                              {item.location}
                            </span>
                          </td>
                          <td className="text-center pe-4">
                            <Link to="/admin-list" className="btn btn-sm btn-outline-secondary px-3 py-1 rounded-pill">
                              Manage Listing
                            </Link>
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>

                <div className="p-3 bg-light text-center border-top mt-3 rounded-3">
                  <Link to="/admin-list" className="fw-semibold text-coral text-decoration-none">
                    View and Edit all {listings.length} properties in Property Manager →
                  </Link>
                </div>
              </div>
            )}

          </div>
        </div>
      </div>

      {/* ========================================================================= */}
      {/* ADD / EDIT CATEGORY MODAL */}
      {/* ========================================================================= */}
      {catModalOpen && (
        <div className="modal fade show d-block" tabIndex="-1" style={{ backgroundColor: 'rgba(0,0,0,0.6)', backdropFilter: 'blur(3px)' }}>
          <div className="modal-dialog modal-dialog-centered">
            <div className="modal-content border-0 rounded-4 shadow-lg overflow-hidden">
              <div className="modal-header bg-dark text-white px-4 py-3">
                <h5 className="modal-title fw-bold d-flex align-items-center gap-2">
                  <FaLayerGroup className="text-coral" /> {isEditingCat ? 'Edit Category' : 'Create New Category'}
                </h5>
                <button type="button" className="btn-close btn-close-white" onClick={() => setCatModalOpen(false)}></button>
              </div>

              <form onSubmit={handleSaveCategory}>
                <div className="modal-body p-4">
                  <div className="row g-3">
                    <div className="col-12">
                      <label className="form-label fw-semibold">Category Name <span className="text-danger">*</span></label>
                      <input 
                        type="text" 
                        className="form-control" 
                        placeholder="e.g. Luxury Villa, Studio, Commercial Office"
                        value={catFormData.name}
                        onChange={(e) => setCatFormData({ ...catFormData, name: e.target.value })}
                        required
                      />
                    </div>

                    <div className="col-12 col-md-6">
                      <label className="form-label fw-semibold">Icon Identifier</label>
                      <select 
                        className="form-select"
                        value={catFormData.icon}
                        onChange={(e) => setCatFormData({ ...catFormData, icon: e.target.value })}
                      >
                        <option value="FaHome">FaHome (Residential)</option>
                        <option value="FaBuilding">FaBuilding (Villas & Apartments)</option>
                        <option value="FaStore">FaStore (Commercial & Shops)</option>
                        <option value="FaBriefcase">FaBriefcase (Office & Workspaces)</option>
                        <option value="FaLayerGroup">FaLayerGroup (Plots & Land)</option>
                      </select>
                    </div>

                    <div className="col-12 col-md-6">
                      <label className="form-label fw-semibold">Visibility Status</label>
                      <select 
                        className="form-select"
                        value={catFormData.isActive}
                        onChange={(e) => setCatFormData({ ...catFormData, isActive: e.target.value === 'true' || e.target.value === true })}
                      >
                        <option value="true">Active (Publicly Visible)</option>
                        <option value="false">Hidden (Draft)</option>
                      </select>
                    </div>

                    <div className="col-12">
                      <label className="form-label fw-semibold">Short Description</label>
                      <textarea 
                        rows="3" 
                        className="form-control" 
                        placeholder="Describe the architectural and lifestyle characteristics of this category..."
                        value={catFormData.description}
                        onChange={(e) => setCatFormData({ ...catFormData, description: e.target.value })}
                      ></textarea>
                    </div>

                    <div className="col-12">
                      <label className="form-label fw-semibold">Category Image (Banner / Card Preview)</label>
                      <div className="d-flex align-items-center gap-3">
                        {catImagePreview && (
                          <img 
                            src={catImagePreview} 
                            alt="Preview" 
                            className="rounded-3 border" 
                            style={{ width: '80px', height: '55px', objectFit: 'cover' }} 
                          />
                        )}
                        <input 
                          type="file" 
                          className="form-control" 
                          accept="image/*" 
                          onChange={(e) => {
                            if (e.target.files && e.target.files[0]) {
                              setCatImageFile(e.target.files[0]);
                              setCatImagePreview(URL.createObjectURL(e.target.files[0]));
                            }
                          }} 
                        />
                      </div>
                    </div>
                  </div>
                </div>

                <div className="modal-footer bg-light px-4 py-3">
                  <button type="button" className="btn btn-secondary px-4" onClick={() => setCatModalOpen(false)}>
                    Cancel
                  </button>
                  <button type="submit" disabled={isSubmitting} className="btn btn-login px-4 d-inline-flex align-items-center gap-2">
                    <FaSave /> {isSubmitting ? 'Saving...' : 'Save Category'}
                  </button>
                </div>
              </form>
            </div>
          </div>
        </div>
      )}

      {/* ========================================================================= */}
      {/* ADD / EDIT SERVICE PROVIDER MODAL */}
      {/* ========================================================================= */}
      {provModalOpen && (
        <div className="modal fade show d-block" tabIndex="-1" style={{ backgroundColor: 'rgba(0,0,0,0.6)', backdropFilter: 'blur(3px)' }}>
          <div className="modal-dialog modal-dialog-centered modal-lg">
            <div className="modal-content border-0 rounded-4 shadow-lg overflow-hidden">
              <div className="modal-header bg-dark text-white px-4 py-3">
                <h5 className="modal-title fw-bold d-flex align-items-center gap-2">
                  <FaUserTie className="text-coral" /> {isEditingProv ? 'Edit Service Provider' : 'Add New Service Provider'}
                </h5>
                <button type="button" className="btn-close btn-close-white" onClick={() => setProvModalOpen(false)}></button>
              </div>

              <form onSubmit={handleSaveProvider}>
                <div className="modal-body p-4">
                  <div className="row g-3">
                    <div className="col-12 col-md-6">
                      <label className="form-label fw-semibold">Provider / Company Name <span className="text-danger">*</span></label>
                      <input 
                        type="text" 
                        className="form-control" 
                        placeholder="e.g. Quirex Luxury Advisory"
                        value={provFormData.name}
                        onChange={(e) => setProvFormData({ ...provFormData, name: e.target.value })}
                        required
                      />
                    </div>

                    <div className="col-12 col-md-6">
                      <label className="form-label fw-semibold">Service Specialty / Title <span className="text-danger">*</span></label>
                      <input 
                        type="text" 
                        className="form-control" 
                        placeholder="e.g. Luxury Brokerage, Structural Inspection, Staging"
                        value={provFormData.serviceType}
                        onChange={(e) => setProvFormData({ ...provFormData, serviceType: e.target.value })}
                        required
                      />
                    </div>

                    <div className="col-12 col-md-6">
                      <label className="form-label fw-semibold">Email Address <span className="text-danger">*</span></label>
                      <input 
                        type="email" 
                        className="form-control" 
                        placeholder="consultant@domain.com"
                        value={provFormData.email}
                        onChange={(e) => setProvFormData({ ...provFormData, email: e.target.value })}
                        required
                      />
                    </div>

                    <div className="col-12 col-md-6">
                      <label className="form-label fw-semibold">Phone Number <span className="text-danger">*</span></label>
                      <input 
                        type="tel" 
                        className="form-control" 
                        placeholder="+1 (555) 000-0000"
                        value={provFormData.phone}
                        onChange={(e) => setProvFormData({ ...provFormData, phone: e.target.value })}
                        required
                      />
                    </div>

                    <div className="col-12 col-md-4">
                      <label className="form-label fw-semibold">Category Reference</label>
                      <select 
                        className="form-select"
                        value={provFormData.category}
                        onChange={(e) => setProvFormData({ ...provFormData, category: e.target.value })}
                      >
                        {categories.map((c) => (
                          <option key={c._id || c.name} value={c.name}>{c.name}</option>
                        ))}
                      </select>
                    </div>

                    <div className="col-12 col-md-4">
                      <label className="form-label fw-semibold">Experience</label>
                      <input 
                        type="text" 
                        className="form-control" 
                        placeholder="e.g. 8+ Years"
                        value={provFormData.experience}
                        onChange={(e) => setProvFormData({ ...provFormData, experience: e.target.value })}
                      />
                    </div>

                    <div className="col-12 col-md-4">
                      <label className="form-label fw-semibold">Rating (1.0 to 5.0)</label>
                      <input 
                        type="number" 
                        step="0.1" 
                        min="1" 
                        max="5"
                        className="form-control" 
                        value={provFormData.rating}
                        onChange={(e) => setProvFormData({ ...provFormData, rating: e.target.value })}
                      />
                    </div>

                    <div className="col-12 col-md-8">
                      <label className="form-label fw-semibold">Location / Base City <span className="text-danger">*</span></label>
                      <input 
                        type="text" 
                        className="form-control" 
                        placeholder="e.g. Manhattan, New York"
                        value={provFormData.location}
                        onChange={(e) => setProvFormData({ ...provFormData, location: e.target.value })}
                        required
                      />
                    </div>

                    <div className="col-12 col-md-4">
                      <label className="form-label fw-semibold">Price Tier</label>
                      <select 
                        className="form-select"
                        value={provFormData.priceRange}
                        onChange={(e) => setProvFormData({ ...provFormData, priceRange: e.target.value })}
                      >
                        <option value="$">$ (Standard)</option>
                        <option value="$$">$$ (Moderate)</option>
                        <option value="$$$">$$$ (Premium)</option>
                        <option value="$$$$">$$$$ (Ultra Luxury)</option>
                      </select>
                    </div>

                    <div className="col-12">
                      <label className="form-label fw-semibold">Professional Bio & Credentials</label>
                      <textarea 
                        rows="3" 
                        className="form-control" 
                        placeholder="Describe certifications, client track record, and specialized services..."
                        value={provFormData.bio}
                        onChange={(e) => setProvFormData({ ...provFormData, bio: e.target.value })}
                      ></textarea>
                    </div>

                    <div className="col-12">
                      <label className="form-label fw-semibold">Avatar / Company Logo</label>
                      <div className="d-flex align-items-center gap-3">
                        {provImagePreview && (
                          <img 
                            src={provImagePreview} 
                            alt="Preview" 
                            className="rounded-circle border" 
                            style={{ width: '60px', height: '60px', objectFit: 'cover' }} 
                          />
                        )}
                        <input 
                          type="file" 
                          className="form-control" 
                          accept="image/*" 
                          onChange={(e) => {
                            if (e.target.files && e.target.files[0]) {
                              setProvImageFile(e.target.files[0]);
                              setProvImagePreview(URL.createObjectURL(e.target.files[0]));
                            }
                          }} 
                        />
                      </div>
                    </div>
                  </div>
                </div>

                <div className="modal-footer bg-light px-4 py-3">
                  <button type="button" className="btn btn-secondary px-4" onClick={() => setProvModalOpen(false)}>
                    Cancel
                  </button>
                  <button type="submit" disabled={isSubmitting} className="btn btn-login px-4 d-inline-flex align-items-center gap-2">
                    <FaSave /> {isSubmitting ? 'Saving...' : 'Save Provider'}
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

export default AdminCategoryManagement;
