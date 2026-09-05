import React, { useEffect, useState, useMemo } from 'react';
import { IoBedOutline, IoSearchOutline, IoRefreshOutline, IoCloseOutline } from "react-icons/io5";
import { 
  FaMapMarkerAlt, 
  FaSearch, 
  FaFilter, 
  FaBuilding, 
  FaTag, 
  FaHome, 
  FaStore, 
  FaLayerGroup, 
  FaCheckCircle, 
  FaTimes 
} from "react-icons/fa";
import { useLocation, useNavigate } from "react-router-dom";
import NavBar from './NavBar';
import axios from 'axios';
import Swal from 'sweetalert2';
import { API_BASE_URL } from '../../config/api';
import { getPropertyImageUrl, handleImageError } from '../../utils/propertyImageHelper';

const CATEGORY_CARDS = [
  {
    id: 'Houses & Villas',
    name: 'Houses & Villas',
    icon: FaHome,
    image: 'https://images.unsplash.com/photo-1613977257363-707ba9348227?auto=format&fit=crop&w=800&q=80',
    fallbackImage: '/img/2.jpg.jpeg',
    tagline: 'Luxury Living',
    description: 'Independent luxury villas, modern duplexes & family homes.'
  },
  {
    id: 'Flats & Apartments',
    name: 'Flats & Apartments',
    icon: FaBuilding,
    image: 'https://images.unsplash.com/photo-1545324418-cc1a3fa10c00?auto=format&fit=crop&w=800&q=80',
    fallbackImage: '/img/1.jpg.jpeg',
    tagline: 'Urban Heights',
    description: 'Modern high-rise flats, penthouses & studio apartments.'
  },
  {
    id: 'Shops & Commercial',
    name: 'Shops & Commercial',
    icon: FaStore,
    image: 'https://images.unsplash.com/photo-1497366216548-37526070297c?auto=format&fit=crop&w=800&q=80',
    fallbackImage: '/img/3.jpg.jpeg',
    tagline: 'Prime Business',
    description: 'Retail shops, corporate offices & commercial spaces.'
  },
  {
    id: 'Land & Plots',
    name: 'Land & Plots',
    icon: FaLayerGroup,
    image: 'https://images.unsplash.com/photo-1500382017468-9049fed747ef?auto=format&fit=crop&w=800&q=80',
    fallbackImage: '/img/5.jpg.jpeg',
    tagline: 'Investment Sites',
    description: 'Approved residential plots, acres & commercial lands.'
  }
];

const isCategoryMatch = (item, category) => {
  if (!category || category === 'All') return true;
  const cat = (item?.category || '').toLowerCase();
  const title = (item?.title || '').toLowerCase();
  const desc = (item?.description || '').toLowerCase();

  if (category === 'Houses & Villas') {
    return (
      cat.includes('house') ||
      cat.includes('villa') ||
      cat.includes('bungalow') ||
      cat.includes('duplex') ||
      cat.includes('home') ||
      cat === 'residential' ||
      title.includes('house') ||
      title.includes('villa') ||
      title.includes('bungalow')
    );
  }
  if (category === 'Flats & Apartments') {
    return (
      cat.includes('flat') ||
      cat.includes('apartment') ||
      cat.includes('condo') ||
      cat.includes('penthouse') ||
      cat.includes('studio') ||
      title.includes('flat') ||
      title.includes('apartment') ||
      title.includes('condo') ||
      title.includes('penthouse') ||
      title.includes('studio')
    );
  }
  if (category === 'Shops & Commercial') {
    return (
      cat.includes('shop') ||
      cat.includes('commercial') ||
      cat.includes('office') ||
      cat.includes('retail') ||
      cat.includes('showroom') ||
      cat.includes('store') ||
      title.includes('shop') ||
      title.includes('commercial') ||
      title.includes('office') ||
      title.includes('retail')
    );
  }
  if (category === 'Land & Plots') {
    return (
      cat.includes('land') ||
      cat.includes('plot') ||
      cat.includes('site') ||
      cat.includes('farm') ||
      title.includes('land') ||
      title.includes('plot')
    );
  }

  return cat === category.toLowerCase();
};

const Property = () => {
  const [listData, setListData] = useState([]);
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedStatus, setSelectedStatus] = useState('All'); // All, Rent, Sale
  const [selectedCategory, setSelectedCategory] = useState('All'); // All, Houses & Villas, Flats & Apartments, Shops & Commercial, Land & Plots
  const [selectedBedrooms, setSelectedBedrooms] = useState('All');
  const [isBuying, setIsBuying] = useState(false);

  const location = useLocation();
  const navigate = useNavigate();
  const isFullPage = location?.pathname !== "/";

  useEffect(() => {
    fetchData();
  }, []);

  const fetchData = async () => {
    try {
      const response = await axios.get(`${API_BASE_URL}/api/property-list`);
      if (response?.data?.code === 200) {
        setListData(response?.data?.data || []);
      }
    } catch (e) {
      console.error('Error fetching property list:', e);
    }
  };

  const handleCategoryClick = (categoryId) => {
    if (selectedCategory === categoryId) {
      setSelectedCategory('All');
    } else {
      setSelectedCategory(categoryId);
    }
  };

  const handleResetFilters = () => {
    setSearchTerm('');
    setSelectedStatus('All');
    setSelectedCategory('All');
    setSelectedBedrooms('All');
  };

  // Cumulative filtered properties (AND logic)
  const filteredProperties = useMemo(() => {
    return listData.filter((item) => {
      // 1. Search term filter across title, location, description, category, status, bedrooms, price
      const term = searchTerm.trim().toLowerCase();
      const matchesSearch = !term || 
        (item?.title && item.title.toLowerCase().includes(term)) ||
        (item?.location && item.location.toLowerCase().includes(term)) ||
        (item?.description && item.description.toLowerCase().includes(term)) ||
        (item?.category && item.category.toLowerCase().includes(term)) ||
        (item?.status && item.status.toLowerCase().includes(term)) ||
        (item?.price && item.price.toString().toLowerCase().includes(term)) ||
        (item?.bedrooms && item.bedrooms.toString().includes(term)) ||
        (item?.area && item.area.toString().includes(term));

      // 2. Status filter (Rent / Sale)
      const matchesStatus = selectedStatus === 'All' || 
        (item?.status && item.status.toLowerCase() === selectedStatus.toLowerCase());

      // 3. Category filter
      const matchesCategory = isCategoryMatch(item, selectedCategory);

      // 4. Bedrooms filter
      const matchesBedrooms = selectedBedrooms === 'All' ||
        (item?.bedrooms && (
          selectedBedrooms === '4' ? Number(item.bedrooms) >= 4 : item.bedrooms.toString() === selectedBedrooms
        )) ||
        (item?.area && (
          selectedBedrooms === '4' ? Number(item.area) >= 4 : item.area.toString() === selectedBedrooms
        ));

      return matchesSearch && matchesStatus && matchesCategory && matchesBedrooms;
    });
  }, [listData, searchTerm, selectedStatus, selectedCategory, selectedBedrooms]);

  const hasActiveFilters = searchTerm || selectedStatus !== 'All' || selectedCategory !== 'All' || selectedBedrooms !== 'All';

  const handleBuy = async (propertyId) => {
    if (isBuying) return;
    const userData = JSON.parse(localStorage.getItem('userInfo'));
    if (!userData?._id) {
      Swal.fire({
        title: "Login Required",
        text: "Please login to buy or book this property.",
        icon: "info",
        confirmButtonColor: "#FF5A3C",
        showCancelButton: true,
        confirmButtonText: "Go to Login"
      }).then((result) => {
        if (result.isConfirmed) {
          navigate('/login');
        }
      });
      return;
    }

    setIsBuying(true);
    try {
      const response = await axios.post(`${API_BASE_URL}/api/buy`, { userId: userData?._id, propertyId });
      if (response?.data?.code === 200) {
        Swal.fire({
          title: "Property Purchased!",
          text: response?.data?.message || "Property bought successfully. Check your Bought Properties list.",
          icon: 'success',
          confirmButtonColor: '#28a745'
        });
      } else {
        Swal.fire({
          title: "Notice",
          text: response?.data?.message || "This property is already acquired or unavailable.",
          icon: 'warning',
          confirmButtonColor: '#FF5A3C'
        });
      }
    } catch (error) {
      Swal.fire({
        title: "Error",
        text: "Error processing request. Please try again.",
        icon: 'error'
      });
    } finally {
      setIsBuying(false);
    }
  };

  return (
    <>
      {isFullPage && <NavBar />}
      <section className='property py-5'>
        <div className="container">
          
          {/* Main Title / Header */}
          <div className="text-center mb-4">
            <div className="tagline">Properties</div>
            <h2 className="section-title">
              {isFullPage ? "Explore Available Properties" : "Featured Listings"}
            </h2>
            <p className="text-muted">
              {isFullPage ? "Filter and find your dream home, apartment, commercial space, or rental villa." : "Discover our handpicked verified property options for sale and rent."}
            </p>
          </div>

          {/* 1. BROWSE BY CATEGORY SECTION */}
          {isFullPage && (
            <div className="quirex-browse-category-wrap">
              <div className="quirex-category-header d-flex align-items-end justify-content-between flex-wrap gap-2">
                <div>
                  <div className="quirex-category-tag">Categories</div>
                  <h3 className="quirex-category-title">Browse By Category</h3>
                </div>
                {selectedCategory !== 'All' && (
                  <button 
                    onClick={() => setSelectedCategory('All')}
                    className="btn btn-sm btn-outline-secondary rounded-pill px-3"
                  >
                    View All Categories
                  </button>
                )}
              </div>

              {/* 4 Category Visual Cards Grid */}
              <div className="quirex-category-grid">
                {CATEGORY_CARDS.map((cat) => {
                  const IconComponent = cat.icon;
                  const isSelected = selectedCategory === cat.id;
                  const catCount = listData.filter((item) => isCategoryMatch(item, cat.id)).length;

                  return (
                    <div
                      key={cat.id}
                      className={`quirex-cat-card ${isSelected ? 'active' : ''}`}
                      onClick={() => handleCategoryClick(cat.id)}
                      role="button"
                      tabIndex={0}
                      onKeyDown={(e) => {
                        if (e.key === 'Enter' || e.key === ' ') {
                          handleCategoryClick(cat.id);
                        }
                      }}
                      title={`Filter by ${cat.name}`}
                    >
                      {/* Property Category Image */}
                      <img
                        src={cat.image}
                        alt={cat.name}
                        className="quirex-cat-card-img"
                        onError={(e) => {
                          e.target.onerror = null;
                          e.target.src = cat.fallbackImage;
                        }}
                      />

                      {/* Readability Gradient Overlay */}
                      <div className="quirex-cat-card-overlay"></div>

                      {/* Card Content */}
                      <div className="quirex-cat-card-content">
                        {/* Top: Icon + Badge */}
                        <div className="quirex-cat-card-top">
                          <div className="quirex-cat-icon-circle">
                            <IconComponent />
                          </div>
                          <span className="quirex-cat-badge">
                            {isSelected ? (
                              <>
                                <FaCheckCircle /> Selected
                              </>
                            ) : (
                              `${catCount} Listings`
                            )}
                          </span>
                        </div>

                        {/* Bottom: Tagline + Title + Description */}
                        <div className="quirex-cat-card-bottom">
                          <span className="quirex-cat-tagline">{cat.tagline}</span>
                          <h4 className="quirex-cat-name">{cat.name}</h4>
                          <p className="quirex-cat-desc">{cat.description}</p>
                        </div>
                      </div>
                    </div>
                  );
                })}
              </div>
            </div>
          )}

          {/* 2. DYNAMIC SEARCH & FILTER BAR */}
          {isFullPage && (
            <div className="quirex-property-filter-card">
              <div className="row g-2 g-md-3 align-items-center">
                
                {/* 1. Real-Time Search Input */}
                <div className="col-12 col-md-4">
                  <div className="quirex-filter-search-box">
                    <IoSearchOutline className="quirex-filter-search-icon" />
                    <input
                      type="text"
                      className="quirex-filter-search-input"
                      placeholder="Search by city, title, location, keyword..."
                      value={searchTerm}
                      onChange={(e) => setSearchTerm(e.target.value)}
                    />
                    {searchTerm && (
                      <button
                        type="button"
                        className="quirex-filter-clear-btn"
                        onClick={() => setSearchTerm('')}
                        aria-label="Clear search"
                        title="Clear search"
                      >
                        <IoCloseOutline />
                      </button>
                    )}
                  </div>
                </div>

                {/* 2. Status Filter (Rent/Sale/All) */}
                <div className="col-6 col-md-2">
                  <select
                    className="quirex-filter-select w-100"
                    value={selectedStatus}
                    onChange={(e) => setSelectedStatus(e.target.value)}
                    aria-label="Filter by Type"
                  >
                    <option value="All">All Types (Rent/Buy)</option>
                    <option value="Rent">For Rent</option>
                    <option value="Sale">For Sale</option>
                  </select>
                </div>

                {/* 3. Category Filter (Synchronized with Category Cards) */}
                <div className="col-6 col-md-3">
                  <select
                    className="quirex-filter-select w-100"
                    value={selectedCategory}
                    onChange={(e) => setSelectedCategory(e.target.value)}
                    aria-label="Filter by Category"
                  >
                    <option value="All">All Categories</option>
                    <option value="Houses & Villas">Houses & Villas</option>
                    <option value="Flats & Apartments">Flats & Apartments</option>
                    <option value="Shops & Commercial">Shops & Commercial</option>
                    <option value="Land & Plots">Land & Plots</option>
                  </select>
                </div>

                {/* 4. Bedrooms Filter */}
                <div className="col-6 col-md-2">
                  <select
                    className="quirex-filter-select w-100"
                    value={selectedBedrooms}
                    onChange={(e) => setSelectedBedrooms(e.target.value)}
                    aria-label="Filter by Bedrooms"
                  >
                    <option value="All">Any Bedrooms</option>
                    <option value="1">1 Bedroom</option>
                    <option value="2">2 Bedrooms</option>
                    <option value="3">3 Bedrooms</option>
                    <option value="4">4+ Bedrooms</option>
                  </select>
                </div>

                {/* 5. Reset Filters Button */}
                <div className="col-6 col-md-1">
                  <button
                    type="button"
                    className="quirex-filter-reset-btn"
                    onClick={handleResetFilters}
                    title="Reset all filters"
                  >
                    <IoRefreshOutline />
                    <span>Reset</span>
                  </button>
                </div>

              </div>

              {/* Active Filters Summary Bar */}
              {hasActiveFilters && (
                <div className="quirex-active-filters-bar">
                  <div className="d-flex align-items-center gap-2 flex-wrap">
                    <span className="small text-muted fw-bold">Active Filters:</span>
                    {searchTerm && (
                      <span className="quirex-filter-pill-tag">
                        Keyword: "{searchTerm}"
                        <FaTimes className="tag-remove" onClick={() => setSearchTerm('')} />
                      </span>
                    )}
                    {selectedCategory !== 'All' && (
                      <span className="quirex-filter-pill-tag">
                        Category: {selectedCategory}
                        <FaTimes className="tag-remove" onClick={() => setSelectedCategory('All')} />
                      </span>
                    )}
                    {selectedStatus !== 'All' && (
                      <span className="quirex-filter-pill-tag">
                        Type: {selectedStatus === 'Sale' ? 'For Sale' : 'For Rent'}
                        <FaTimes className="tag-remove" onClick={() => setSelectedStatus('All')} />
                      </span>
                    )}
                    {selectedBedrooms !== 'All' && (
                      <span className="quirex-filter-pill-tag">
                        Bedrooms: {selectedBedrooms === '4' ? '4+ Beds' : `${selectedBedrooms} Bed`}
                        <FaTimes className="tag-remove" onClick={() => setSelectedBedrooms('All')} />
                      </span>
                    )}
                  </div>

                  <div className="small text-muted fw-semibold">
                    Showing <span className="text-dark fw-bold">{filteredProperties.length}</span> of {listData.length} properties
                  </div>
                </div>
              )}
            </div>
          )}

          {/* 3. PROPERTY CARDS GRID */}
          <div className='row g-4 py-2 justify-content-center'>
            {filteredProperties?.map((item, index) => (
              <div className='col-12 col-md-6 col-lg-3' key={item?._id || index}>
                <div className="card h-100 shadow-sm border-0 rounded-4 overflow-hidden position-relative property-card">
                  
                  {/* Status Badge */}
                  <span className={`position-absolute top-0 start-0 m-3 badge ${item?.status?.toLowerCase() === 'sale' ? 'bg-primary' : 'bg-success'} shadow-sm px-3 py-2 rounded-pill`}>
                    {item?.status === 'Sale' ? 'For Sale' : 'For Rent'}
                  </span>

                  <img
                    src={getPropertyImageUrl(item, index)}
                    className="card-img-top img-fluid featuredimg"
                    alt={item?.title || 'Property'}
                    style={{ height: '220px', objectFit: 'cover' }}
                    onError={(e) => handleImageError(e, item?.category, index)}
                  />

                  <div className="card-body d-flex flex-column p-4">
                    <div className="d-flex justify-content-between align-items-baseline mb-1">
                      <p className='mycolor1 mb-0 fs-5'>
                        <b>${item?.price}</b>
                        <small className="text-muted fs-6 font-monospace">
                          {item?.status === 'Sale' ? '' : '/mo'}
                        </small>
                      </p>
                      <span className="badge bg-light text-dark border small">
                        {item?.category || 'House'}
                      </span>
                    </div>

                    <h5 className="card-title my-2">
                      <b className='mycolor2 text-truncate d-block' title={item?.title}>{item?.title}</b>
                    </h5>

                    <p className="small text-muted mb-2 d-flex align-items-center gap-1">
                      <FaMapMarkerAlt className="text-danger flex-shrink-0" />
                      <span className="text-truncate">{item?.location || 'Prime Location'}</span>
                    </p>

                    <p className="card-text featuredp flex-grow-1 text-muted small" style={{ minHeight: '40px' }}>
                      {item?.description?.length > 75 ? `${item.description.slice(0, 75)}...` : item?.description}
                    </p>

                    <div className='d-flex justify-content-between align-items-center mt-3 pt-3 border-top'>
                      <div className='featuredp d-flex align-items-center gap-1 text-secondary small'>
                        <IoBedOutline className="fs-5" />
                        <span>{item?.bedrooms || item?.area || '1'} Bed</span>
                      </div>
                      <button
                        onClick={() => handleBuy(item?._id)}
                        disabled={isBuying}
                        className='btn btn-outline-danger btn-sm px-4 rounded-pill fw-semibold'
                      >
                        Buy Now
                      </button>
                    </div>
                  </div>
                </div>
              </div>
            ))}

            {/* 4. PROFESSIONAL EMPTY STATE */}
            {filteredProperties?.length === 0 && (
              <div className="col-12 py-4">
                <div className="quirex-empty-state-box">
                  <div className="quirex-empty-state-icon">
                    <FaBuilding />
                  </div>
                  <h3 className="fw-bold text-dark mb-2">No Properties Found</h3>
                  <p className="text-muted mb-4" style={{ maxWidth: '460px', margin: '0 auto' }}>
                    Try adjusting your search or filter criteria to find more properties.
                  </p>
                  <button
                    type="button"
                    onClick={handleResetFilters}
                    className="btn btn-primary bggcolor border-0 px-4 py-2 rounded-pill fw-semibold text-white shadow-sm"
                  >
                    <IoRefreshOutline className="me-2" /> Reset All Filters
                  </button>
                </div>
              </div>
            )}
          </div>
        </div>
      </section>
    </>
  );
};

export default Property;
