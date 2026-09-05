import React, { useEffect, useState, useMemo } from 'react';
import NavBar from './NavBar';
import axios from 'axios';
import { API_BASE_URL } from '../../config/api';
import { 
  FaMapMarkerAlt, 
  FaBed, 
  FaRulerCombined, 
  FaTag, 
  FaSearch, 
  FaFilter, 
  FaHome, 
  FaBuilding, 
  FaStore, 
  FaBriefcase, 
  FaLayerGroup, 
  FaPhoneAlt, 
  FaStar, 
  FaCheckCircle, 
  FaTimes, 
  FaInfoCircle, 
  FaExternalLinkAlt,
  FaPercentage
} from 'react-icons/fa';
import { IoSparklesOutline, IoCloseOutline, IoRefreshOutline, IoShieldCheckmarkOutline } from 'react-icons/io5';
import Swal from 'sweetalert2';
import { useNavigate } from 'react-router-dom';
import { getPropertyImageUrl, handleImageError } from '../../utils/propertyImageHelper';

// Dynamic icon resolver for category icons
const getCategoryIcon = (iconName) => {
  switch (iconName) {
    case 'FaBuilding': return <FaBuilding className="me-1" />;
    case 'FaStore': return <FaStore className="me-1" />;
    case 'FaBriefcase': return <FaBriefcase className="me-1" />;
    case 'FaLayerGroup': return <FaLayerGroup className="me-1" />;
    case 'FaHome':
    default:
      return <FaHome className="me-1" />;
  }
};

const CategoryPage = () => {
  const navigate = useNavigate();
  const [categories, setCategories] = useState([]);
  const [properties, setProperties] = useState([]);
  const [providers, setProviders] = useState([]);
  const [loading, setLoading] = useState(true);
  const [userData, setUserData] = useState(null);

  // Search and Filter States
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedCategory, setSelectedCategory] = useState('All');
  const [selectedStatus, setSelectedStatus] = useState('All'); // 'All', 'Rent', 'Sale'
  const [selectedBedrooms, setSelectedBedrooms] = useState('All'); // 'All', '1', '2', '3', '4+'
  const [maxPriceFilter, setMaxPriceFilter] = useState('');
  const [locationFilter, setLocationFilter] = useState('');
  const [showOnlyOffers, setShowOnlyOffers] = useState(false);

  // Modal State for Property / Service Detail View
  const [selectedItem, setSelectedItem] = useState(null);
  const [isDetailModalOpen, setIsDetailModalOpen] = useState(false);

  useEffect(() => {
    try {
      const user = JSON.parse(localStorage.getItem('userInfo'));
      setUserData(user);
    } catch (e) {
      setUserData(null);
    }
    fetchCategoryData();
  }, []);

  const fetchCategoryData = async () => {
    setLoading(true);
    try {
      const [catRes, propRes, provRes] = await Promise.all([
        axios.get(`${API_BASE_URL}/api/categories`),
        axios.get(`${API_BASE_URL}/api/property-list`),
        axios.get(`${API_BASE_URL}/api/service-providers`)
      ]);

      if (catRes?.data?.code === 200) {
        setCategories(catRes.data.data || []);
      }
      if (propRes?.data?.code === 200) {
        setProperties(propRes.data.data || []);
      }
      if (provRes?.data?.code === 200) {
        setProviders(provRes.data.data || []);
      }
    } catch (err) {
      console.error("Error fetching dynamic category data:", err);
    } finally {
      setLoading(false);
    }
  };

  // Real-Time Multi-Criteria Filtering
  const filteredProperties = useMemo(() => {
    return properties.filter((item) => {
      // 1. Search Query Match (Category name, Property name, Location, Description, ServiceType)
      if (searchQuery.trim()) {
        const query = searchQuery.trim().toLowerCase();
        const matchesTitle = item?.title?.toLowerCase().includes(query);
        const matchesLocation = item?.location?.toLowerCase().includes(query);
        const matchesDesc = item?.description?.toLowerCase().includes(query);
        const matchesCategory = item?.category?.toLowerCase().includes(query);
        const matchesService = item?.serviceType?.toLowerCase().includes(query);
        if (!matchesTitle && !matchesLocation && !matchesDesc && !matchesCategory && !matchesService) {
          return false;
        }
      }

      // 2. Category Filter
      if (selectedCategory !== 'All') {
        const itemCat = (item?.category || '').toLowerCase();
        const selCat = selectedCategory.toLowerCase();
        if (itemCat !== selCat && !itemCat.includes(selCat)) {
          return false;
        }
      }

      // 3. Status Filter (Rent vs Sale)
      if (selectedStatus !== 'All') {
        if ((item?.status || '').toLowerCase() !== selectedStatus.toLowerCase()) {
          return false;
        }
      }

      // 4. Location Sub-filter
      if (locationFilter.trim()) {
        const loc = locationFilter.trim().toLowerCase();
        if (!item?.location?.toLowerCase().includes(loc)) {
          return false;
        }
      }

      // 5. Bedrooms Filter
      if (selectedBedrooms !== 'All') {
        const itemBeds = parseInt(item?.bedrooms || '1', 10);
        if (selectedBedrooms === '4+') {
          if (itemBeds < 4) return false;
        } else {
          if (itemBeds.toString() !== selectedBedrooms) return false;
        }
      }

      // 6. Max Price Filter
      if (maxPriceFilter) {
        const rawPrice = parseInt((item?.price || '').toString().replace(/[^0-9]/g, ''), 10);
        const filterPrice = parseInt(maxPriceFilter, 10);
        if (!isNaN(rawPrice) && !isNaN(filterPrice) && rawPrice > filterPrice) {
          return false;
        }
      }

      // 7. Offers Only
      if (showOnlyOffers) {
        if (!item?.isOffer) return false;
      }

      return true;
    });
  }, [properties, searchQuery, selectedCategory, selectedStatus, selectedBedrooms, maxPriceFilter, locationFilter, showOnlyOffers]);

  // Section Groupings
  const offerProperties = useMemo(() => {
    return filteredProperties.filter((p) => p.isOffer || (p.offerDiscount && p.offerDiscount.length > 0));
  }, [filteredProperties]);

  const rentProperties = useMemo(() => {
    return filteredProperties.filter((p) => (p.status || '').toLowerCase() === 'rent');
  }, [filteredProperties]);

  const saleProperties = useMemo(() => {
    return filteredProperties.filter((p) => (p.status || '').toLowerCase() === 'sale');
  }, [filteredProperties]);

  // Filtered Service Providers
  const filteredProviders = useMemo(() => {
    return providers.filter((prov) => {
      if (selectedCategory !== 'All') {
        const provCat = (prov?.category || '').toLowerCase();
        const selCat = selectedCategory.toLowerCase();
        if (provCat !== selCat && !provCat.includes(selCat)) {
          return false;
        }
      }
      if (searchQuery.trim()) {
        const q = searchQuery.trim().toLowerCase();
        const matchName = prov?.name?.toLowerCase().includes(q);
        const matchService = prov?.serviceType?.toLowerCase().includes(q);
        const matchLoc = prov?.location?.toLowerCase().includes(q);
        const matchBio = prov?.bio?.toLowerCase().includes(q);
        if (!matchName && !matchService && !matchLoc && !matchBio) return false;
      }
      return true;
    });
  }, [providers, selectedCategory, searchQuery]);

  const handleResetFilters = () => {
    setSearchQuery('');
    setSelectedCategory('All');
    setSelectedStatus('All');
    setSelectedBedrooms('All');
    setMaxPriceFilter('');
    setLocationFilter('');
    setShowOnlyOffers(false);
  };

  const hasActiveFilters = searchQuery || selectedCategory !== 'All' || selectedStatus !== 'All' || selectedBedrooms !== 'All' || maxPriceFilter || locationFilter || showOnlyOffers;

  const handleOpenDetailModal = (item) => {
    setSelectedItem(item);
    setIsDetailModalOpen(true);
  };

  const handleBuyOrRentProperty = async (property) => {
    if (!userData || !userData._id) {
      Swal.fire({
        title: "Sign In Required",
        text: "Please sign in to your Quirex account to acquire or book this property.",
        icon: "info",
        showCancelButton: true,
        confirmButtonText: "Sign In Now",
        confirmButtonColor: "#FF5A3C",
        cancelButtonText: "Cancel"
      }).then((result) => {
        if (result.isConfirmed) {
          navigate('/login');
        }
      });
      return;
    }

    try {
      const res = await axios.post(`${API_BASE_URL}/api/buy`, {
        userId: userData._id,
        propertyId: property._id
      });

      if (res?.data?.code === 200) {
        Swal.fire({
          title: "Reservation Confirmed!",
          text: `You have successfully acquired ${property.title}. Check your Orders list.`,
          icon: "success",
          confirmButtonColor: "#28a745"
        });
        setIsDetailModalOpen(false);
      } else {
        Swal.fire({
          title: "Notice",
          text: res?.data?.message || "This property is already reserved.",
          icon: "info",
          confirmButtonColor: "#FF5A3C"
        });
      }
    } catch (err) {
      Swal.fire({
        title: "Transaction Failed",
        text: "Unable to process property reservation. Please try again.",
        icon: "error"
      });
    }
  };

  // Helper to format currency
  const formatPriceDisplay = (price, status) => {
    if (!price) return '$0';
    const isRent = (status || '').toLowerCase() === 'rent';
    const clean = price.toString().trim();
    const formatted = clean.startsWith('$') ? clean : `$${clean}`;
    return isRent ? `${formatted}/mo` : formatted;
  };

  // Property Card Renderer
  const renderPropertyCard = (item) => {
    const isRent = (item?.status || '').toLowerCase() === 'rent';

    return (
      <div key={item._id} className="col-12 col-md-6 col-lg-4 col-xl-3">
        <div className="card h-100 border-0 rounded-4 shadow-sm overflow-hidden quirex-category-card">
          {/* Card Image Box with Hover Zoom */}
          <div className="quirex-cat-img-box position-relative overflow-hidden">
            <img 
              src={getPropertyImageUrl(item)} 
              alt={item.title || 'Property Listing'} 
              className="quirex-cat-img w-100"
              onError={(e) => handleImageError(e, item?.category)}
            />

            {/* Top Badges */}
            <div className="position-absolute top-0 start-0 m-3 d-flex flex-wrap gap-2">
              <span className={`badge ${isRent ? 'bg-success' : 'bg-primary'} px-3 py-2 rounded-pill shadow-sm fw-semibold`}>
                {isRent ? 'For Rent' : 'For Sale'}
              </span>
              <span className="badge bg-dark bg-opacity-75 px-3 py-2 rounded-pill shadow-sm fw-medium">
                {item.category || 'House'}
              </span>
            </div>

            {/* Offer Ribbon if Applicable */}
            {item.isOffer && (
              <div className="position-absolute top-0 end-0 m-3">
                <span className="badge bg-danger px-3 py-2 rounded-pill shadow-sm d-flex align-items-center gap-1 fw-bold">
                  <FaPercentage className="small" /> {item.offerDiscount || 'Offer Deal'}
                </span>
              </div>
            )}
          </div>

          {/* Card Body */}
          <div className="card-body p-4 d-flex flex-column">
            <div className="d-flex justify-content-between align-items-baseline mb-2">
              <span className="quirex-cat-price fs-5 fw-bold text-coral">
                {formatPriceDisplay(item.price, item.status)}
              </span>
              {item.serviceType && (
                <span className="badge bg-light text-secondary border small text-truncate" style={{ maxWidth: '120px' }}>
                  {item.serviceType}
                </span>
              )}
            </div>

            <h5 className="fw-bold text-dark mb-2 text-truncate" title={item.title}>
              {item.title}
            </h5>

            <p className="text-muted small d-flex align-items-center gap-1 mb-2">
              <FaMapMarkerAlt className="text-danger flex-shrink-0" />
              <span className="text-truncate">{item.location || 'Prime Location'}</span>
            </p>

            <p className="text-secondary small mb-3 quirex-text-clamp-2" style={{ minHeight: '38px' }}>
              {item.description || 'Verified luxury property equipped with modern utilities, architectural refinement, and prime connectivity.'}
            </p>

            {/* Specifications Strip */}
            <div className="d-flex justify-content-between text-muted small py-2 mb-3 border-top border-bottom">
              <span className="d-flex align-items-center gap-1">
                <FaBed className="text-coral" /> {item.bedrooms || '1'} {parseInt(item.bedrooms, 10) === 1 ? 'Bed' : 'Beds'}
              </span>
              <span className="d-flex align-items-center gap-1">
                <FaRulerCombined className="text-coral" /> {item.area || '1,200'} Sq Ft
              </span>
            </div>

            {/* Action Buttons: View Details & Quick Buy/Rent */}
            <div className="mt-auto d-flex gap-2 pt-1">
              <button 
                type="button"
                onClick={() => handleOpenDetailModal(item)}
                className="btn btn-outline-secondary btn-sm rounded-pill w-50 py-2 d-flex align-items-center justify-content-center gap-1 fw-semibold"
                title="View full listing details"
              >
                <FaInfoCircle /> Details
              </button>
              <button 
                type="button"
                onClick={() => handleBuyOrRentProperty(item)}
                className="btn btn-primary bggcolor border-0 text-white btn-sm rounded-pill w-50 py-2 fw-semibold"
              >
                {isRent ? 'Rent Now' : 'Buy Now'}
              </button>
            </div>
          </div>
        </div>
      </div>
    );
  };

  return (
    <div className="min-vh-100 bg-light quirex-category-page-root">
      <NavBar />

      {/* Hero Header Section */}
      <section className="py-5 bg-white border-bottom shadow-sm">
        <div className="container py-2 text-center">
          <span className="quirex-services-badge mb-2">
            <IoSparklesOutline className="quirex-badge-icon" /> Dynamic Real Estate Zone
          </span>
          <h1 className="display-6 fw-bold text-dark mb-2">
            Explore Properties by <span className="quirex-highlight-coral">Category & Service</span>
          </h1>
          <p className="text-muted mx-auto mb-4" style={{ maxWidth: '640px' }}>
            Database-driven catalog featuring verified residential estates, commercial hubs, rental residences, and licensed property specialists.
          </p>

          {/* Top Search Bar */}
          <div className="row justify-content-center mb-4">
            <div className="col-12 col-md-9 col-lg-7">
              <div className="quirex-live-search-box shadow-sm rounded-pill overflow-hidden border d-flex align-items-center bg-white px-3 py-1">
                <FaSearch className="text-coral fs-5 ms-2 flex-shrink-0" />
                <input 
                  type="text" 
                  className="form-control border-0 py-2 shadow-none fs-6" 
                  placeholder="Search by category, property title, city, neighborhood or service..." 
                  value={searchQuery} 
                  onChange={(e) => setSearchQuery(e.target.value)} 
                />
                {searchQuery && (
                  <button 
                    type="button"
                    className="btn btn-link text-muted p-1 text-decoration-none" 
                    onClick={() => setSearchQuery('')}
                    title="Clear search"
                  >
                    <IoCloseOutline size={22} />
                  </button>
                )}
                <button 
                  type="button" 
                  className="btn btn-primary bggcolor border-0 text-white px-4 py-2 rounded-pill fw-semibold ms-2 d-none d-sm-block"
                  onClick={() => {}}
                >
                  Search
                </button>
              </div>
            </div>
          </div>

          {/* Dynamic Category Badges / Pills (Loaded directly from database) */}
          <div className="d-flex flex-wrap justify-content-center gap-2 align-items-center">
            <button 
              type="button"
              onClick={() => setSelectedCategory('All')}
              className={`quirex-category-pill ${selectedCategory === 'All' ? 'active' : ''}`}
            >
              <span>All Categories</span>
              <span className="quirex-pill-badge">{properties.length}</span>
            </button>

            {categories.map((cat) => {
              const isSelected = selectedCategory.toLowerCase() === (cat.name || '').toLowerCase();
              const count = cat.itemCount !== undefined 
                ? cat.itemCount 
                : properties.filter(p => (p.category || '').toLowerCase() === (cat.name || '').toLowerCase()).length;

              return (
                <button 
                  key={cat._id || cat.name} 
                  type="button"
                  onClick={() => setSelectedCategory(cat.name)}
                  className={`quirex-category-pill ${isSelected ? 'active' : ''}`}
                >
                  <span className="quirex-pill-icon">{getCategoryIcon(cat.icon)}</span>
                  <span>{cat.name}</span>
                  <span className="quirex-pill-badge">{count}</span>
                </button>
              );
            })}
          </div>
        </div>
      </section>

      {/* Advanced Filter Control Bar */}
      <section className="bg-white border-bottom py-3">
        <div className="container">
          <div className="row g-2 align-items-center">
            {/* Listing Type Filter */}
            <div className="col-6 col-md-3 col-lg-2">
              <label className="small text-muted fw-semibold d-block mb-1">Listing Type</label>
              <select 
                className="form-select form-select-sm rounded-3 shadow-none"
                value={selectedStatus}
                onChange={(e) => setSelectedStatus(e.target.value)}
              >
                <option value="All">All Types</option>
                <option value="Rent">For Rent</option>
                <option value="Sale">For Sale</option>
              </select>
            </div>

            {/* Bedrooms Filter */}
            <div className="col-6 col-md-3 col-lg-2">
              <label className="small text-muted fw-semibold d-block mb-1">Bedrooms</label>
              <select 
                className="form-select form-select-sm rounded-3 shadow-none"
                value={selectedBedrooms}
                onChange={(e) => setSelectedBedrooms(e.target.value)}
              >
                <option value="All">Any Bedrooms</option>
                <option value="1">1 Bedroom</option>
                <option value="2">2 Bedrooms</option>
                <option value="3">3 Bedrooms</option>
                <option value="4+">4+ Bedrooms</option>
              </select>
            </div>

            {/* Location Filter */}
            <div className="col-6 col-md-3 col-lg-3">
              <label className="small text-muted fw-semibold d-block mb-1">Location / City</label>
              <input 
                type="text" 
                className="form-control form-control-sm rounded-3 shadow-none"
                placeholder="e.g. New York, CA..."
                value={locationFilter}
                onChange={(e) => setLocationFilter(e.target.value)}
              />
            </div>

            {/* Max Price Filter */}
            <div className="col-6 col-md-3 col-lg-3">
              <label className="small text-muted fw-semibold d-block mb-1">Max Price ($)</label>
              <input 
                type="number" 
                className="form-control form-control-sm rounded-3 shadow-none"
                placeholder="e.g. 500000 or 5000"
                value={maxPriceFilter}
                onChange={(e) => setMaxPriceFilter(e.target.value)}
              />
            </div>

            {/* Reset Filters CTA */}
            <div className="col-12 col-lg-2 d-flex align-items-end pt-2 pt-lg-0">
              <button 
                type="button" 
                onClick={handleResetFilters}
                className="btn btn-outline-secondary btn-sm rounded-3 w-100 d-flex align-items-center justify-content-center gap-1 py-2"
                title="Reset all filter options"
              >
                <IoRefreshOutline /> Reset Filters
              </button>
            </div>
          </div>

          {/* Active Filter Chips */}
          {hasActiveFilters && (
            <div className="d-flex align-items-center gap-2 flex-wrap pt-3 border-top mt-3">
              <span className="small text-muted fw-bold">Active Filters:</span>
              {searchQuery && (
                <span className="badge bg-light text-dark border px-3 py-2 rounded-pill d-inline-flex align-items-center gap-1">
                  Query: "{searchQuery}"
                  <FaTimes className="cursor-pointer text-danger ms-1" onClick={() => setSearchQuery('')} />
                </span>
              )}
              {selectedCategory !== 'All' && (
                <span className="badge bg-light text-dark border px-3 py-2 rounded-pill d-inline-flex align-items-center gap-1">
                  Category: {selectedCategory}
                  <FaTimes className="cursor-pointer text-danger ms-1" onClick={() => setSelectedCategory('All')} />
                </span>
              )}
              {selectedStatus !== 'All' && (
                <span className="badge bg-light text-dark border px-3 py-2 rounded-pill d-inline-flex align-items-center gap-1">
                  Type: {selectedStatus === 'Sale' ? 'For Sale' : 'For Rent'}
                  <FaTimes className="cursor-pointer text-danger ms-1" onClick={() => setSelectedStatus('All')} />
                </span>
              )}
              {selectedBedrooms !== 'All' && (
                <span className="badge bg-light text-dark border px-3 py-2 rounded-pill d-inline-flex align-items-center gap-1">
                  Beds: {selectedBedrooms}
                  <FaTimes className="cursor-pointer text-danger ms-1" onClick={() => setSelectedBedrooms('All')} />
                </span>
              )}
              {locationFilter && (
                <span className="badge bg-light text-dark border px-3 py-2 rounded-pill d-inline-flex align-items-center gap-1">
                  Location: {locationFilter}
                  <FaTimes className="cursor-pointer text-danger ms-1" onClick={() => setLocationFilter('')} />
                </span>
              )}
              {maxPriceFilter && (
                <span className="badge bg-light text-dark border px-3 py-2 rounded-pill d-inline-flex align-items-center gap-1">
                  Max Price: ${maxPriceFilter}
                  <FaTimes className="cursor-pointer text-danger ms-1" onClick={() => setMaxPriceFilter('')} />
                </span>
              )}
              <span className="ms-auto small text-muted">
                Found <strong>{filteredProperties.length}</strong> matching properties
              </span>
            </div>
          )}
        </div>
      </section>

      {/* Main Dynamic Content Sections */}
      <main className="container py-5">
        {loading ? (
          /* Loading Skeletons */
          <div className="text-center py-5">
            <div className="spinner-border text-coral mb-3" style={{ width: '3rem', height: '3rem' }} role="status"></div>
            <h4 className="fw-bold text-dark">Loading Real-Time Catalog...</h4>
            <p className="text-muted">Fetching verified categories and live database listings.</p>
          </div>
        ) : filteredProperties.length === 0 ? (
          /* Empty Search / Filter State */
          <div className="text-center py-5 bg-white rounded-4 shadow-sm p-5 border">
            <div className="mb-3 text-coral">
              <FaBuilding size={56} className="opacity-75" />
            </div>
            <h3 className="fw-bold text-dark mb-2">No Matching Listings Found</h3>
            <p className="text-muted mx-auto mb-4" style={{ maxWidth: '480px' }}>
              We couldn't find any property matching your current search parameters. Try expanding your search or resetting active filters.
            </p>
            <button 
              type="button" 
              onClick={handleResetFilters}
              className="btn btn-primary bggcolor border-0 text-white px-4 py-2 rounded-pill fw-semibold shadow-sm"
            >
              <IoRefreshOutline className="me-2" /> Reset All Filters
            </button>
          </div>
        ) : (
          <>
            {/* SECTION 1: Recent Special Offers & Exclusive Discounts */}
            {offerProperties.length > 0 && (
              <section className="mb-5 pb-3">
                <div className="d-flex align-items-center justify-content-between mb-4 flex-wrap gap-2">
                  <div className="d-flex align-items-center gap-2">
                    <span className="badge p-2 text-white rounded-circle shadow-sm" style={{ backgroundColor: '#FF5A3C' }}>
                      <FaTag />
                    </span>
                    <div>
                      <h3 className="fw-bold text-dark mb-0">Recent Offers & Hot Deals</h3>
                      <small className="text-muted">Special markdown pricing and promotional real estate packages</small>
                    </div>
                  </div>
                  <span className="badge bg-danger bg-opacity-10 text-danger border border-danger-subtle px-3 py-2 rounded-pill fw-semibold">
                    {offerProperties.length} Deals Active
                  </span>
                </div>

                <div className="row g-4">
                  {offerProperties.map(renderPropertyCard)}
                </div>
              </section>
            )}

            {/* SECTION 2: Recent Places for Rent */}
            {rentProperties.length > 0 && (
              <section className="mb-5 pb-3">
                <div className="d-flex align-items-center justify-content-between mb-4 flex-wrap gap-2">
                  <div>
                    <h3 className="fw-bold text-dark mb-0">Recent Places for Rent</h3>
                    <small className="text-muted">Explore verified monthly rental homes, apartments, and suites</small>
                  </div>
                  <span className="badge bg-success bg-opacity-10 text-success border border-success-subtle px-3 py-2 rounded-pill fw-semibold">
                    {rentProperties.length} Rentals Available
                  </span>
                </div>

                <div className="row g-4">
                  {rentProperties.map(renderPropertyCard)}
                </div>
              </section>
            )}

            {/* SECTION 3: Recent Places for Sale */}
            {saleProperties.length > 0 && (
              <section className="mb-5 pb-3">
                <div className="d-flex align-items-center justify-content-between mb-4 flex-wrap gap-2">
                  <div>
                    <h3 className="fw-bold text-dark mb-0">Recent Places for Sale</h3>
                    <small className="text-muted">Permanent luxury residences, villas, and commercial real estate for purchase</small>
                  </div>
                  <span className="badge bg-primary bg-opacity-10 text-primary border border-primary-subtle px-3 py-2 rounded-pill fw-semibold">
                    {saleProperties.length} Properties for Sale
                  </span>
                </div>

                <div className="row g-4">
                  {saleProperties.map(renderPropertyCard)}
                </div>
              </section>
            )}

            {/* SECTION 4: Verified Real Estate Service Providers */}
            {filteredProviders.length > 0 && (
              <section className="mt-4 pt-4 border-top">
                <div className="d-flex align-items-center justify-content-between mb-4 flex-wrap gap-2">
                  <div>
                    <span className="badge bg-info bg-opacity-10 text-info border border-info-subtle px-3 py-1 rounded-pill mb-1">
                      Professional Directory
                    </span>
                    <h3 className="fw-bold text-dark mb-0">Verified Real Estate Service Providers</h3>
                    <small className="text-muted">Connect with top-rated brokerage advisors, inspectors, and staging consultants</small>
                  </div>
                </div>

                <div className="row g-4">
                  {filteredProviders.map((prov) => (
                    <div key={prov._id} className="col-12 col-sm-6 col-lg-4 col-xl-3">
                      <div className="card h-100 border-0 rounded-4 shadow-sm p-3 p-xl-4 bg-white quirex-provider-card d-flex flex-column">
                        <div className="d-flex align-items-start gap-3 mb-3">
                          <img 
                            src={`${API_BASE_URL}/img/${prov.image}`} 
                            alt={prov.name} 
                            className="rounded-circle border flex-shrink-0 shadow-sm" 
                            style={{ width: '52px', height: '52px', objectFit: 'cover' }}
                            onError={(e) => { e.target.src = '/img/author.jpg.jpeg'; }}
                          />
                          <div className="flex-grow-1 overflow-hidden" style={{ minWidth: 0 }}>
                            <h6 
                              className="quirex-provider-title" 
                              title={prov.name}
                            >
                              {prov.name}
                            </h6>
                            <div className="d-flex align-items-center gap-2 flex-wrap">
                              <span className="badge bg-primary bg-opacity-10 text-primary border border-primary-subtle px-2 py-1 rounded-pill" style={{ fontSize: '0.72rem', fontWeight: 600 }}>
                                {prov.category}
                              </span>
                              <div className="d-flex align-items-center gap-1 text-warning" style={{ fontSize: '0.78rem' }}>
                                <FaStar size={11} /> 
                                <span className="fw-bold text-dark">{prov.rating || 4.9}</span>
                                <span className="text-muted small">({prov.experience || '5+ Yrs'})</span>
                              </div>
                            </div>
                          </div>
                        </div>

                        <p className="quirex-provider-bio">
                          {prov.bio || 'Licensed industry professional specializing in high-grade real estate consulting and transaction security.'}
                        </p>

                        <div className="pt-3 mt-auto border-top d-flex justify-content-between align-items-center gap-2">
                          <span 
                            className="d-flex align-items-center gap-1 text-secondary text-truncate" 
                            style={{ fontSize: '0.82rem', maxWidth: '65%' }}
                            title={prov.location}
                          >
                            <FaMapMarkerAlt className="text-danger flex-shrink-0" size={13} />
                            <span className="text-truncate">{prov.location}</span>
                          </span>
                          <a 
                            href={`tel:${prov.phone}`} 
                            className="btn btn-sm btn-outline-danger rounded-pill px-3 py-1 fw-semibold d-inline-flex align-items-center gap-1 flex-shrink-0"
                            style={{ fontSize: '0.82rem' }}
                          >
                            <FaPhoneAlt size={10} /> Call
                          </a>
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              </section>
            )}
          </>
        )}
      </main>

      {/* Interactive Property Detail Modal */}
      {isDetailModalOpen && selectedItem && (
        <div 
          className="modal fade show d-block" 
          tabIndex="-1" 
          style={{ backgroundColor: 'rgba(0,0,0,0.65)', backdropFilter: 'blur(4px)', zIndex: 1055 }}
          onClick={() => setIsDetailModalOpen(false)}
        >
          <div 
            className="modal-dialog modal-dialog-centered modal-lg" 
            onClick={(e) => e.stopPropagation()}
          >
            <div className="modal-content border-0 rounded-4 shadow-lg overflow-hidden">
              
              {/* Modal Header Image Banner */}
              <div className="position-relative" style={{ height: '300px', backgroundColor: '#1e293b' }}>
                <img 
                  src={getPropertyImageUrl(selectedItem)} 
                  alt={selectedItem.title} 
                  className="w-100 h-100"
                  style={{ objectFit: 'cover' }}
                  onError={(e) => handleImageError(e, selectedItem?.category)}
                />
                <button 
                  type="button" 
                  className="btn btn-dark bg-opacity-75 text-white rounded-circle p-2 position-absolute top-0 end-0 m-3 border-0"
                  onClick={() => setIsDetailModalOpen(false)}
                  aria-label="Close"
                >
                  <IoCloseOutline size={24} />
                </button>

                <div className="position-absolute bottom-0 start-0 m-3 d-flex gap-2">
                  <span className={`badge ${selectedItem.status?.toLowerCase() === 'sale' ? 'bg-primary' : 'bg-success'} px-3 py-2 rounded-pill shadow-sm fs-6`}>
                    For {selectedItem.status || 'Rent'}
                  </span>
                  <span className="badge bg-dark px-3 py-2 rounded-pill shadow-sm fs-6">
                    {selectedItem.category || 'House'}
                  </span>
                  {selectedItem.isOffer && (
                    <span className="badge bg-danger px-3 py-2 rounded-pill shadow-sm fs-6">
                      {selectedItem.offerDiscount || 'Special Offer'}
                    </span>
                  )}
                </div>
              </div>

              {/* Modal Body */}
              <div className="modal-body p-4 p-md-5">
                <div className="d-flex justify-content-between align-items-baseline flex-wrap gap-2 mb-3">
                  <div>
                    <h3 className="fw-bold text-dark mb-1">{selectedItem.title}</h3>
                    <p className="text-muted d-flex align-items-center gap-1 mb-0">
                      <FaMapMarkerAlt className="text-danger" /> {selectedItem.location || 'Prime Location'}
                    </p>
                  </div>
                  <div className="text-md-end">
                    <span className="small text-muted d-block">Listed Price</span>
                    <span className="fs-3 fw-bold text-coral">
                      {formatPriceDisplay(selectedItem.price, selectedItem.status)}
                    </span>
                  </div>
                </div>

                {/* Key Specifications Grid */}
                <div className="row g-3 my-3 p-3 bg-light rounded-3 text-center">
                  <div className="col-4 border-end">
                    <span className="text-muted small d-block">Bedrooms</span>
                    <strong className="text-dark fs-5">{selectedItem.bedrooms || '1'} Beds</strong>
                  </div>
                  <div className="col-4 border-end">
                    <span className="text-muted small d-block">Total Area</span>
                    <strong className="text-dark fs-5">{selectedItem.area || '1,200'} Sq Ft</strong>
                  </div>
                  <div className="col-4">
                    <span className="text-muted small d-block">Category</span>
                    <strong className="text-dark fs-5">{selectedItem.category || 'House'}</strong>
                  </div>
                </div>

                {/* Detailed Description */}
                <h5 className="fw-bold text-dark mb-2">Description & Amenities</h5>
                <p className="text-secondary leading-relaxed mb-4">
                  {selectedItem.description || 'This prime property provides extraordinary craftsmanship, premium natural light, modern HVAC infrastructure, integrated safety systems, and convenient access to key business hubs, international schools, and transport terminals.'}
                </p>

                {/* Trust Badges */}
                <div className="d-flex align-items-center gap-3 p-3 border rounded-3 bg-white mb-4">
                  <IoShieldCheckmarkOutline className="text-success fs-1 flex-shrink-0" />
                  <div>
                    <h6 className="fw-bold text-dark mb-0">Verified Quirex Luxury Property</h6>
                    <small className="text-muted">Includes legal title verification, certified inspection report, and transparent pricing guarantee.</small>
                  </div>
                </div>

                {/* Footer Action Buttons */}
                <div className="d-flex justify-content-end gap-2 pt-2 border-top">
                  <button 
                    type="button" 
                    className="btn btn-outline-secondary px-4 py-2 rounded-pill"
                    onClick={() => setIsDetailModalOpen(false)}
                  >
                    Close
                  </button>
                  <button 
                    type="button" 
                    onClick={() => handleBuyOrRentProperty(selectedItem)}
                    className="btn btn-primary bggcolor border-0 text-white px-5 py-2 rounded-pill fw-semibold shadow-sm"
                  >
                    {selectedItem.status?.toLowerCase() === 'sale' ? 'Buy Property Now' : 'Rent Property Now'}
                  </button>
                </div>
              </div>

            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default CategoryPage;
