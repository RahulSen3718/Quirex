import mongoose from "mongoose";

const userSchema = new mongoose.Schema({
  name: { type: String, required: true, trim: true },
  email: { type: String, required: true, trim: true, lowercase: true },
  password: { type: String, required: true },
  contact: { type: String, required: true, trim: true },
  address: { type: String, required: true, trim: true },
  profile: { type: String, required: true },
  userType: { type: String, default: 'user', enum: ['user', 'admin'] },
  isBlocked: { type: Boolean, default: false },
  createdAt: { type: Date, default: Date.now },
  updatedAt: { type: Date, default: Date.now },
});

export const userModel = mongoose.model('users', userSchema);

const categorySchema = new mongoose.Schema({
  name: { type: String, required: true, trim: true, unique: true },
  slug: { type: String, trim: true, lowercase: true },
  description: { type: String, trim: true },
  icon: { type: String, default: 'FaHome' },
  image: { type: String, default: '1.jpg.jpeg' },
  itemCount: { type: Number, default: 0 },
  isActive: { type: Boolean, default: true },
  createdAt: { type: Date, default: Date.now },
  updatedAt: { type: Date, default: Date.now },
});

export const categoryModel = mongoose.model('categories', categorySchema);

const serviceProviderSchema = new mongoose.Schema({
  name: { type: String, required: true, trim: true },
  email: { type: String, required: true, trim: true, lowercase: true },
  phone: { type: String, required: true, trim: true },
  category: { type: String, required: true, trim: true },
  serviceType: { type: String, required: true, trim: true },
  experience: { type: String, default: '5+ Years' },
  rating: { type: Number, default: 4.8 },
  location: { type: String, required: true, trim: true },
  priceRange: { type: String, default: '$$' },
  image: { type: String, default: 'author.jpg.jpeg' },
  bio: { type: String, trim: true },
  isActive: { type: Boolean, default: true },
  createdAt: { type: Date, default: Date.now },
  updatedAt: { type: Date, default: Date.now },
});

export const serviceProviderModel = mongoose.model('service_providers', serviceProviderSchema);

const propertySchema = new mongoose.Schema({
  title: { type: String, required: true, trim: true },
  price: { type: String, required: true },
  area: { type: String },
  description: { type: String },
  location: { type: String, required: true, trim: true },
  pic: { type: String, required: true },
  category: { type: String, default: 'House' },
  status: { type: String, default: 'Rent' }, // 'Rent', 'Sale', 'Sold'
  bedrooms: { type: String, default: '1' },
  serviceType: { type: String, default: 'Residential Real Estate' },
  isOffer: { type: Boolean, default: false },
  offerDiscount: { type: String, default: '' },
  createdAt: { type: Date, default: Date.now },
  updatedAt: { type: Date, default: Date.now },
});

export const propertyModel = mongoose.model('properties', propertySchema);

const BuyerSchema = new mongoose.Schema({
  userId: { type: String },
  propertyId: { type: String },
  createdAt: { type: Date, default: Date.now },
  updatedAt: { type: Date, default: Date.now }
});

export const buyerModel = mongoose.model('buyers', BuyerSchema);

const ContactSchema = new mongoose.Schema({
  name: { type: String },
  email: { type: String },
  phone: { type: String },
  subject: { type: String },
  message: { type: String },
  createdAt: { type: Date, default: Date.now },
  updatedAt: { type: Date, default: Date.now }
});

export const ContactModel = mongoose.model('contacts', ContactSchema);

