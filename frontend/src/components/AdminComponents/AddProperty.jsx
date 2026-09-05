import React, { useState, useEffect } from 'react';
import NavBar from '../landingComponents/NavBar';
import { FaBuilding, FaTag, FaMapMarkerAlt, FaBed, FaAlignLeft, FaImage, FaPercentage } from "react-icons/fa";
import { TbVectorTriangle } from "react-icons/tb";
import { useForm } from 'react-hook-form';
import { yupResolver } from '@hookform/resolvers/yup';
import * as yup from 'yup';
import axios from 'axios';
import Swal from 'sweetalert2';
import { API_BASE_URL } from '../../config/api';

const schemaproperty = yup.object().shape({
  title: yup.string().required('Title is required.').min(3, 'Title must be at least 3 characters.').max(100, 'Title cannot exceed 100 characters.'),
  price: yup.string().required('Price is required.'),
  area: yup.string().required('Area is required.').min(1, 'Please enter valid area.'),
  location: yup.string().required('Location is required.').min(2, 'Location must be at least 2 characters.').max(100),
  description: yup.string().required('Description is required.').min(5, 'Description must be at least 5 characters.').max(2000, 'Description cannot exceed 2000 characters.'),
  category: yup.string().required('Category is required.'),
  status: yup.string().required('Status is required.'),
  bedrooms: yup.string().required('Bedrooms is required.'),
  serviceType: yup.string(),
  isOffer: yup.boolean(),
  offerDiscount: yup.string(),
  pic: yup.mixed().test('fileRequired', 'Property image is required.', (value) => {
    return value && value.length > 0 && value[0] instanceof File;
  })
});

const AddProperty = () => {
  const [isLoading, setIsLoading] = useState(false);
  const [dynamicCategories, setDynamicCategories] = useState(['House', 'Villa', 'Apartment', 'Commercial', 'Office', 'Studio']);
  
  const { register, handleSubmit, reset, watch, formState: { errors } } = useForm({
    resolver: yupResolver(schemaproperty),
    defaultValues: {
      category: 'House',
      status: 'Rent',
      bedrooms: '2',
      serviceType: 'Residential Real Estate',
      isOffer: false,
      offerDiscount: ''
    }
  });

  const isOfferWatched = watch('isOffer');

  useEffect(() => {
    fetchCategories();
  }, []);

  const fetchCategories = async () => {
    try {
      const res = await axios.get(`${API_BASE_URL}/api/categories`);
      if (res?.data?.code === 200 && res.data.data?.length > 0) {
        setDynamicCategories(res.data.data.map(c => c.name));
      }
    } catch (e) {
      // Fallback to defaults
    }
  };

  const addProperty = async (data) => {
    if (isLoading) return;
    setIsLoading(true);

    try {
      let userData = null;
      try {
        userData = JSON.parse(localStorage.getItem('userInfo'));
      } catch {
        userData = null;
      }

      const adminId = userData?._id || userData?.email || '';
      const formData = new FormData();
      formData.append('title', data.title.trim());
      formData.append('price', data.price.trim());
      formData.append('area', data.area.trim());
      formData.append('location', data.location.trim());
      formData.append('description', data.description.trim());
      formData.append('category', data.category);
      formData.append('status', data.status);
      formData.append('bedrooms', data.bedrooms);
      formData.append('serviceType', data.serviceType ? data.serviceType.trim() : 'Residential Real Estate');
      formData.append('isOffer', data.isOffer ? 'true' : 'false');
      formData.append('offerDiscount', data.offerDiscount ? data.offerDiscount.trim() : '');
      formData.append('pic', data.pic[0]);

      const response = await axios.post(`${API_BASE_URL}/api/add-property`, formData, {
        headers: {
          'Content-Type': 'multipart/form-data',
          'x-admin-id': adminId,
          'Authorization': `Bearer ${adminId}`
        }
      });

      if (response?.data?.code === 200) {
        Swal.fire({
          title: "Property Added!",
          text: response?.data?.message || "Property listing published successfully to live catalog.",
          icon: "success",
          confirmButtonColor: "#FF5A3C"
        });
        reset();
      } else {
        Swal.fire({
          title: "Failed to Add Property",
          text: response?.data?.message || "Please check your inputs and try again.",
          icon: "error"
        });
      }
    } catch (error) {
      Swal.fire({
        title: "Server Error",
        text: error?.response?.data?.message || "Error saving property. Please ensure you are logged in as admin.",
        icon: "error"
      });
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <>
      <NavBar />
      <div className="container my-5">
        <div className="text-center mb-4">
          <div className="tagline">Admin Zone</div>
          <h2 className="section-title">Add New Property</h2>
          <p className="text-muted">Create a new real estate listing with accurate specifications, pricing, and imagery.</p>
        </div>

        <div className="row justify-content-center">
          <div className="col-md-10 col-lg-8">
            <div className="form-box shadow-sm border-0 rounded-4 p-4 p-md-5 bg-white">
              <form onSubmit={handleSubmit(addProperty)} noValidate>
                <div className="row g-3">

                  {/* Property Title */}
                  <div className="col-md-12">
                    <label className="form-label fw-semibold">Property Title <span className="text-danger">*</span></label>
                    <div className="input-group">
                      <span className="input-group-text"><FaBuilding /></span>
                      <input {...register('title')} type="text" className={`form-control ${errors?.title ? 'is-invalid' : ''}`} placeholder="e.g. Modern Luxury Villa in Beverly Hills" />
                    </div>
                    {errors?.title && <p className='text-danger small mt-1 mb-0'>{errors?.title?.message}</p>}
                  </div>

                  {/* Dynamic Category Dropdown */}
                  <div className="col-md-6">
                    <label className="form-label fw-semibold">Property Category <span className="text-danger">*</span></label>
                    <div className="input-group">
                      <span className="input-group-text"><FaBuilding /></span>
                      <select {...register('category')} className={`form-select ${errors?.category ? 'is-invalid' : ''}`}>
                        {dynamicCategories.map(cat => (
                          <option key={cat} value={cat}>{cat}</option>
                        ))}
                      </select>
                    </div>
                    {errors?.category && <p className='text-danger small mt-1 mb-0'>{errors?.category?.message}</p>}
                  </div>

                  {/* Status Dropdown */}
                  <div className="col-md-6">
                    <label className="form-label fw-semibold">Listing Type / Status <span className="text-danger">*</span></label>
                    <div className="input-group">
                      <span className="input-group-text"><FaTag /></span>
                      <select {...register('status')} className={`form-select ${errors?.status ? 'is-invalid' : ''}`}>
                        <option value="Rent">For Rent</option>
                        <option value="Sale">For Sale</option>
                      </select>
                    </div>
                    {errors?.status && <p className='text-danger small mt-1 mb-0'>{errors?.status?.message}</p>}
                  </div>

                  {/* Price */}
                  <div className="col-md-6">
                    <label className="form-label fw-semibold">Price ($) <span className="text-danger">*</span></label>
                    <div className="input-group">
                      <span className="input-group-text"><FaTag /></span>
                      <input {...register('price')} type="text" className={`form-control ${errors?.price ? 'is-invalid' : ''}`} placeholder="e.g. 250000 or 1200/mo" />
                    </div>
                    {errors?.price && <p className='text-danger small mt-1 mb-0'>{errors?.price?.message}</p>}
                  </div>

                  {/* Bedrooms */}
                  <div className="col-md-6">
                    <label className="form-label fw-semibold">Number of Bedrooms <span className="text-danger">*</span></label>
                    <div className="input-group">
                      <span className="input-group-text"><FaBed /></span>
                      <select {...register('bedrooms')} className={`form-select ${errors?.bedrooms ? 'is-invalid' : ''}`}>
                        <option value="1">1 Bedroom</option>
                        <option value="2">2 Bedrooms</option>
                        <option value="3">3 Bedrooms</option>
                        <option value="4">4 Bedrooms</option>
                        <option value="5+">5+ Bedrooms</option>
                      </select>
                    </div>
                    {errors?.bedrooms && <p className='text-danger small mt-1 mb-0'>{errors?.bedrooms?.message}</p>}
                  </div>

                  {/* Area */}
                  <div className="col-md-6">
                    <label className="form-label fw-semibold">Area (Sq. Ft) <span className="text-danger">*</span></label>
                    <div className="input-group">
                      <span className="input-group-text"><TbVectorTriangle /></span>
                      <input {...register('area')} type="text" className={`form-control ${errors?.area ? 'is-invalid' : ''}`} placeholder="e.g. 3450" />
                    </div>
                    {errors?.area && <p className='text-danger small mt-1 mb-0'>{errors?.area?.message}</p>}
                  </div>

                  {/* Location */}
                  <div className="col-md-6">
                    <label className="form-label fw-semibold">Location / City <span className="text-danger">*</span></label>
                    <div className="input-group">
                      <span className="input-group-text"><FaMapMarkerAlt /></span>
                      <input {...register('location')} type="text" className={`form-control ${errors?.location ? 'is-invalid' : ''}`} placeholder="e.g. Manhattan, NYC" />
                    </div>
                    {errors?.location && <p className='text-danger small mt-1 mb-0'>{errors?.location?.message}</p>}
                  </div>

                  {/* Service Specialty */}
                  <div className="col-md-12">
                    <label className="form-label fw-semibold">Service Specialty / Tagline</label>
                    <input {...register('serviceType')} type="text" className="form-control" placeholder="e.g. Luxury Penthouse Suite, Suburban Family Estate" />
                  </div>

                  {/* Special Offer Checkbox & Discount */}
                  <div className="col-md-6 d-flex align-items-center">
                    <div className="form-check mt-3">
                      <input {...register('isOffer')} type="checkbox" className="form-check-input" id="isOfferCheck" />
                      <label className="form-check-label fw-semibold" htmlFor="isOfferCheck">
                        Feature in "Recent Offers & Deals"
                      </label>
                    </div>
                  </div>

                  {isOfferWatched && (
                    <div className="col-md-6">
                      <label className="form-label fw-semibold">Discount / Promo Tag</label>
                      <div className="input-group">
                        <span className="input-group-text"><FaPercentage /></span>
                        <input {...register('offerDiscount')} type="text" className="form-control" placeholder="e.g. 15% OFF or First Month Free" />
                      </div>
                    </div>
                  )}

                  {/* Image Upload */}
                  <div className="col-md-12">
                    <label className="form-label fw-semibold">Property Image <span className="text-danger">*</span></label>
                    <div className="input-group">
                      <span className="input-group-text"><FaImage /></span>
                      <input {...register('pic')} type="file" accept="image/*" className={`form-control ${errors?.pic ? 'is-invalid' : ''}`} />
                    </div>
                    {errors?.pic && <p className='text-danger small mt-1 mb-0'>{errors?.pic?.message}</p>}
                  </div>

                  {/* Description */}
                  <div className="col-md-12">
                    <label className="form-label fw-semibold">Description <span className="text-danger">*</span></label>
                    <div className="input-group">
                      <span className="input-group-text align-items-start pt-2"><FaAlignLeft /></span>
                      <textarea rows={4} {...register('description')} className={`form-control ${errors?.description ? 'is-invalid' : ''}`} placeholder="Enter detailed property features, neighborhood advantages, and amenities..."></textarea>
                    </div>
                    {errors?.description && <p className='text-danger small mt-1 mb-0'>{errors?.description?.message}</p>}
                  </div>

                  <div className="text-center mt-4 col-12">
                    <button type="submit" disabled={isLoading} className="btn px-5 btn-login py-2">
                      {isLoading ? (
                        <>
                          <span className="spinner-border spinner-border-sm me-2" role="status" aria-hidden="true"></span>
                          Saving Property...
                        </>
                      ) : (
                        "Publish Property"
                      )}
                    </button>
                  </div>
                </div>
              </form>
            </div>
          </div>
        </div>
      </div>
    </>
  );
};

export default AddProperty;
