import express from 'express';
import path from 'path';
import fs from 'fs';
import mongoose from 'mongoose';
import { fileURLToPath } from 'url';
import {
  propertyModel,
  buyerModel,
  ContactModel,
  userModel,
  categoryModel,
  serviceProviderModel
} from '../model/table.js';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);
const uploadDir = path.join(__dirname, '..', 'uploads');

if (!fs.existsSync(uploadDir)) {
  fs.mkdirSync(uploadDir, { recursive: true });
}

const adminRoute = express.Router();

const moveFile = (file, uploadPath) => {
  return new Promise((resolve, reject) => {
    file.mv(uploadPath, (err) => {
      if (err) return reject(err);
      resolve();
    });
  });
};

export const verifyAdmin = async (req, res, next) => {
  try {
    const adminId =
      req.headers['x-admin-id'] ||
      req.headers['authorization']?.replace(/^Bearer\s+/i, '') ||
      req.body?.adminId ||
      req.body?.userId ||
      req.query?.adminId;

    if (!adminId) {
      return res.status(401).json({
        code: 401,
        message: "Unauthorized: Admin authentication credentials are required to modify data.",
        data: ''
      });
    }

    let user = null;
    if (mongoose.Types.ObjectId.isValid(adminId)) {
      user = await userModel.findById(adminId);
    } else {
      user = await userModel.findOne({ email: adminId.toString().trim().toLowerCase() });
    }

    if (!user) {
      return res.status(401).json({
        code: 401,
        message: "Unauthorized: Invalid admin credentials.",
        data: ''
      });
    }

    if (user.userType !== 'admin') {
      return res.status(403).json({
        code: 403,
        message: "Forbidden: Only users with the ADMIN role are authorized to perform this action.",
        data: ''
      });
    }

    if (user.isBlocked) {
      return res.status(403).json({
        code: 403,
        message: "Forbidden: Your administrator account has been deactivated.",
        data: ''
      });
    }

    req.admin = user;
    next();
  } catch (err) {
    console.error("Admin verification error:", err);
    return res.status(500).json({
      code: 500,
      message: "Authorization check encountered a server error.",
      data: ''
    });
  }
};

adminRoute.get('/categories', async (req, res) => {
  try {
    const categories = await categoryModel.find({ isActive: true }).sort({ createdAt: -1 });

    const categoriesWithCounts = await Promise.all(
      categories.map(async (cat) => {
        const count = await propertyModel.countDocuments({
          category: { $regex: new RegExp(`^${cat.name}$`, 'i') }
        });
        return {
          ...cat.toObject(),
          itemCount: count
        };
      })
    );

    return res.status(200).json({
      code: 200,
      message: "Categories fetched successfully.",
      data: categoriesWithCounts
    });
  } catch (err) {
    console.error("Public categories error:", err);
    return res.status(500).json({
      code: 500,
      message: "Failed to load categories.",
      data: []
    });
  }
});

adminRoute.get('/service-providers', async (req, res) => {
  try {
    const { category, search, location } = req.query;
    const query = { isActive: true };

    if (category && category !== 'All') {
      query.category = { $regex: new RegExp(`^${category}$`, 'i') };
    }

    if (location) {
      query.location = { $regex: location.trim(), $options: 'i' };
    }

    if (search) {
      query.$or = [
        { name: { $regex: search.trim(), $options: 'i' } },
        { serviceType: { $regex: search.trim(), $options: 'i' } },
        { category: { $regex: search.trim(), $options: 'i' } },
        { bio: { $regex: search.trim(), $options: 'i' } },
        { location: { $regex: search.trim(), $options: 'i' } }
      ];
    }

    const providers = await serviceProviderModel.find(query).sort({ rating: -1, createdAt: -1 });
    return res.status(200).json({
      code: 200,
      message: "Service providers fetched successfully.",
      data: providers
    });
  } catch (err) {
    console.error("Public service providers error:", err);
    return res.status(500).json({
      code: 500,
      message: "Failed to load service providers.",
      data: []
    });
  }
});

adminRoute.get('/property-details/:id', async (req, res) => {
  try {
    const { id } = req.params;
    if (!id || !mongoose.Types.ObjectId.isValid(id)) {
      return res.status(400).json({ code: 400, message: "Invalid property ID.", data: null });
    }
    const property = await propertyModel.findById(id);
    if (!property) {
      return res.status(404).json({ code: 404, message: "Property not found.", data: null });
    }
    return res.status(200).json({ code: 200, message: "Property details fetched.", data: property });
  } catch (err) {
    console.error("Property details error:", err);
    return res.status(500).json({ code: 500, message: "Error fetching property details.", data: null });
  }
});

adminRoute.get('/admin/categories', verifyAdmin, async (req, res) => {
  try {
    const categories = await categoryModel.find().sort({ createdAt: -1 });
    const categoriesWithCounts = await Promise.all(
      categories.map(async (cat) => {
        const count = await propertyModel.countDocuments({
          category: { $regex: new RegExp(`^${cat.name}$`, 'i') }
        });
        return {
          ...cat.toObject(),
          itemCount: count
        };
      })
    );

    return res.status(200).json({
      code: 200,
      message: "Admin categories fetched successfully.",
      data: categoriesWithCounts
    });
  } catch (err) {
    console.error("Admin categories list error:", err);
    return res.status(500).json({ code: 500, message: "Internal Server Error.", data: [] });
  }
});

adminRoute.post('/admin/add-category', verifyAdmin, async (req, res) => {
  try {
    const { name, description, icon } = req.body;
    if (!name || !name.trim()) {
      return res.status(400).json({ code: 400, message: "Category name is required.", data: '' });
    }

    const trimmedName = name.trim();
    const existing = await categoryModel.findOne({ name: { $regex: new RegExp(`^${trimmedName}$`, 'i') } });
    if (existing) {
      return res.status(400).json({ code: 400, message: "A category with this name already exists.", data: '' });
    }

    let sanitizedFileName = '1.jpg.jpeg';
    if (req.files && req.files.image) {
      const { image } = req.files;
      const originalName = image.name || 'category.jpg';
      const cleanBaseName = path.basename(originalName).replace(/[^a-zA-Z0-9._-]/g, '_');
      sanitizedFileName = `${Date.now()}_cat_${cleanBaseName}`;
      const uploadFilePath = path.join(uploadDir, sanitizedFileName);
      await moveFile(image, uploadFilePath);
    }

    const slug = trimmedName.toLowerCase().replace(/\s+/g, '-').replace(/[^a-z0-9-]/g, '');

    const newCategory = new categoryModel({
      name: trimmedName,
      slug,
      description: description ? description.trim() : '',
      icon: icon ? icon.trim() : 'FaHome',
      image: sanitizedFileName,
      isActive: true
    });

    const saved = await newCategory.save();
    return res.status(200).json({
      code: 200,
      message: "Category added successfully.",
      data: saved
    });
  } catch (err) {
    console.error("Admin add category error:", err);
    return res.status(500).json({ code: 500, message: "Internal server error adding category.", data: '' });
  }
});

adminRoute.post('/admin/update-category', verifyAdmin, async (req, res) => {
  try {
    const { _id, name, description, icon, isActive } = req.body;
    if (!_id || !mongoose.Types.ObjectId.isValid(_id)) {
      return res.status(400).json({ code: 400, message: "Invalid category ID.", data: '' });
    }

    const category = await categoryModel.findById(_id);
    if (!category) {
      return res.status(404).json({ code: 404, message: "Category not found.", data: '' });
    }

    if (name && name.trim()) {
      const trimmedName = name.trim();
      const duplicate = await categoryModel.findOne({
        name: { $regex: new RegExp(`^${trimmedName}$`, 'i') },
        _id: { $ne: _id }
      });
      if (duplicate) {
        return res.status(400).json({ code: 400, message: "Another category already uses this name.", data: '' });
      }
      category.name = trimmedName;
      category.slug = trimmedName.toLowerCase().replace(/\s+/g, '-').replace(/[^a-z0-9-]/g, '');
    }

    if (description !== undefined) category.description = description.trim();
    if (icon !== undefined) category.icon = icon.trim();
    if (isActive !== undefined) category.isActive = Boolean(isActive === 'true' || isActive === true);

    if (req.files && req.files.image) {
      const { image } = req.files;
      const originalName = image.name || 'category.jpg';
      const cleanBaseName = path.basename(originalName).replace(/[^a-zA-Z0-9._-]/g, '_');
      const sanitizedFileName = `${Date.now()}_cat_${cleanBaseName}`;
      const uploadFilePath = path.join(uploadDir, sanitizedFileName);
      await moveFile(image, uploadFilePath);
      category.image = sanitizedFileName;
    }

    category.updatedAt = new Date();
    const updated = await category.save();

    return res.status(200).json({
      code: 200,
      message: "Category updated successfully.",
      data: updated
    });
  } catch (err) {
    console.error("Admin update category error:", err);
    return res.status(500).json({ code: 500, message: "Failed to update category.", data: '' });
  }
});

adminRoute.post('/admin/delete-category', verifyAdmin, async (req, res) => {
  try {
    const { _id } = req.body;
    if (!_id) {
      return res.status(400).json({ code: 400, message: "Category ID is required.", data: '' });
    }

    const deleted = await categoryModel.findByIdAndDelete(_id);
    if (!deleted) {
      return res.status(404).json({ code: 404, message: "Category not found or already removed.", data: '' });
    }

    return res.status(200).json({
      code: 200,
      message: "Category deleted successfully.",
      data: deleted
    });
  } catch (err) {
    console.error("Admin delete category error:", err);
    return res.status(500).json({ code: 500, message: "Failed to delete category.", data: '' });
  }
});

adminRoute.get('/admin/providers', verifyAdmin, async (req, res) => {
  try {
    const providers = await serviceProviderModel.find().sort({ createdAt: -1 });
    return res.status(200).json({
      code: 200,
      message: "Admin providers fetched successfully.",
      data: providers
    });
  } catch (err) {
    console.error("Admin providers list error:", err);
    return res.status(500).json({ code: 500, message: "Internal Server Error.", data: [] });
  }
});

adminRoute.post('/admin/add-provider', verifyAdmin, async (req, res) => {
  try {
    const { name, email, phone, category, serviceType, experience, rating, location, priceRange, bio } = req.body;
    if (!name || !email || !phone || !category || !serviceType || !location) {
      return res.status(400).json({
        code: 400,
        message: "Please fill all required provider fields (Name, Email, Phone, Category, Service Type, Location).",
        data: ''
      });
    }

    let sanitizedFileName = 'author.jpg.jpeg';
    if (req.files && req.files.image) {
      const { image } = req.files;
      const originalName = image.name || 'provider.jpg';
      const cleanBaseName = path.basename(originalName).replace(/[^a-zA-Z0-9._-]/g, '_');
      sanitizedFileName = `${Date.now()}_prov_${cleanBaseName}`;
      const uploadFilePath = path.join(uploadDir, sanitizedFileName);
      await moveFile(image, uploadFilePath);
    }

    const newProvider = new serviceProviderModel({
      name: name.trim(),
      email: email.trim().toLowerCase(),
      phone: phone.trim(),
      category: category.trim(),
      serviceType: serviceType.trim(),
      experience: experience ? experience.trim() : '5+ Years',
      rating: rating ? Number(rating) : 4.8,
      location: location.trim(),
      priceRange: priceRange ? priceRange.trim() : '$$',
      image: sanitizedFileName,
      bio: bio ? bio.trim() : '',
      isActive: true
    });

    const saved = await newProvider.save();
    return res.status(200).json({
      code: 200,
      message: "Service provider added successfully.",
      data: saved
    });
  } catch (err) {
    console.error("Admin add provider error:", err);
    return res.status(500).json({ code: 500, message: "Failed to add service provider.", data: '' });
  }
});

adminRoute.post('/admin/update-provider', verifyAdmin, async (req, res) => {
  try {
    const { _id, name, email, phone, category, serviceType, experience, rating, location, priceRange, bio, isActive } = req.body;
    if (!_id || !mongoose.Types.ObjectId.isValid(_id)) {
      return res.status(400).json({ code: 400, message: "Invalid provider ID.", data: '' });
    }

    const provider = await serviceProviderModel.findById(_id);
    if (!provider) {
      return res.status(404).json({ code: 404, message: "Provider not found.", data: '' });
    }

    if (name) provider.name = name.trim();
    if (email) provider.email = email.trim().toLowerCase();
    if (phone) provider.phone = phone.trim();
    if (category) provider.category = category.trim();
    if (serviceType) provider.serviceType = serviceType.trim();
    if (experience) provider.experience = experience.trim();
    if (rating !== undefined) provider.rating = Number(rating);
    if (location) provider.location = location.trim();
    if (priceRange) provider.priceRange = priceRange.trim();
    if (bio !== undefined) provider.bio = bio.trim();
    if (isActive !== undefined) provider.isActive = Boolean(isActive === 'true' || isActive === true);

    if (req.files && req.files.image) {
      const { image } = req.files;
      const originalName = image.name || 'provider.jpg';
      const cleanBaseName = path.basename(originalName).replace(/[^a-zA-Z0-9._-]/g, '_');
      const sanitizedFileName = `${Date.now()}_prov_${cleanBaseName}`;
      const uploadFilePath = path.join(uploadDir, sanitizedFileName);
      await moveFile(image, uploadFilePath);
      provider.image = sanitizedFileName;
    }

    provider.updatedAt = new Date();
    const updated = await provider.save();

    return res.status(200).json({
      code: 200,
      message: "Service provider updated successfully.",
      data: updated
    });
  } catch (err) {
    console.error("Admin update provider error:", err);
    return res.status(500).json({ code: 500, message: "Failed to update service provider.", data: '' });
  }
});

adminRoute.post('/admin/delete-provider', verifyAdmin, async (req, res) => {
  try {
    const { _id } = req.body;
    if (!_id) {
      return res.status(400).json({ code: 400, message: "Provider ID is required.", data: '' });
    }

    const deleted = await serviceProviderModel.findByIdAndDelete(_id);
    if (!deleted) {
      return res.status(404).json({ code: 404, message: "Provider not found or already deleted.", data: '' });
    }

    return res.status(200).json({
      code: 200,
      message: "Service provider deleted successfully.",
      data: deleted
    });
  } catch (err) {
    console.error("Admin delete provider error:", err);
    return res.status(500).json({ code: 500, message: "Failed to delete provider.", data: '' });
  }
});

adminRoute.get('/property-list', async (req, res) => {
  try {
    const { category, status, search, location, minPrice, maxPrice, bedrooms, isOffer } = req.query;
    const query = {};

    if (category && category !== 'All') {
      query.category = { $regex: new RegExp(`^${category}$`, 'i') };
    }

    if (status && status !== 'All') {
      query.status = { $regex: new RegExp(`^${status}$`, 'i') };
    }

    if (isOffer === 'true' || isOffer === true) {
      query.isOffer = true;
    }

    if (location) {
      query.location = { $regex: location.trim(), $options: 'i' };
    }

    if (search) {
      const term = search.trim();
      query.$or = [
        { title: { $regex: term, $options: 'i' } },
        { location: { $regex: term, $options: 'i' } },
        { description: { $regex: term, $options: 'i' } },
        { category: { $regex: term, $options: 'i' } },
        { status: { $regex: term, $options: 'i' } },
        { serviceType: { $regex: term, $options: 'i' } }
      ];
    }

    const result = await propertyModel.find(query).sort({ createdAt: -1 });
    return res.json({
      code: 200,
      message: "Data fetched successfully.",
      data: result || []
    });
  } catch (err) {
    console.error("Property list error:", err);
    return res.status(500).json({
      code: 500,
      message: "Internal Server Error.",
      data: []
    });
  }
});

adminRoute.post('/add-property', verifyAdmin, async (req, res) => {
  try {
    const { title, price, area, description, location, category, status, bedrooms, serviceType, isOffer, offerDiscount } = req.body;

    if (!title || !price || !location) {
      return res.status(400).json({
        code: 400,
        message: "Title, Price, and Location are required.",
        data: ''
      });
    }

    if (!req.files || !req.files.pic) {
      return res.status(400).json({
        code: 400,
        message: "Property image is required.",
        data: ''
      });
    }

    const { pic } = req.files;
    const originalName = pic.name || 'property.jpg';
    const cleanBaseName = path.basename(originalName).replace(/[^a-zA-Z0-9._-]/g, '_');
    const sanitizedFileName = `${Date.now()}_${cleanBaseName}`;
    const uploadFilePath = path.join(uploadDir, sanitizedFileName);

    await moveFile(pic, uploadFilePath);

    const isExist = await propertyModel.findOne({ title: title?.trim() });
    if (isExist) {
      return res.json({
        code: 400,
        message: "Property with this title already exists.",
        data: isExist
      });
    }

    const data = new propertyModel({
      title: title?.trim(),
      price: price?.toString().trim(),
      area: area?.toString().trim() || 'N/A',
      description: description?.trim() || '',
      location: location?.trim(),
      category: category ? category.trim() : 'House',
      status: status ? status.trim() : 'Rent',
      bedrooms: bedrooms ? bedrooms.toString().trim() : '1',
      serviceType: serviceType ? serviceType.trim() : 'Residential Real Estate',
      isOffer: isOffer === 'true' || isOffer === true,
      offerDiscount: offerDiscount ? offerDiscount.trim() : '',
      pic: sanitizedFileName
    });

    const result = await data.save();
    return res.status(200).json({
      code: 200,
      message: "Property Added Successfully.",
      data: result
    });
  } catch (err) {
    console.error("Add Property Error:", err);
    return res.status(500).json({
      code: 500,
      message: "Internal Server Error adding property.",
      data: ''
    });
  }
});

adminRoute.post('/update-property', verifyAdmin, async (req, res) => {
  try {
    const { _id, title, price, area, description, location, category, status, bedrooms, serviceType, isOffer, offerDiscount } = req.body;
    if (!_id) {
      return res.status(400).json({
        code: 400,
        message: "Property ID is required.",
        data: ''
      });
    }

    const existingProperty = await propertyModel.findById(_id);
    if (!existingProperty) {
      return res.status(404).json({
        code: 404,
        message: "Property not found.",
        data: ''
      });
    }

    let sanitizedFileName = existingProperty.pic;
    if (req.files && req.files.pic) {
      const { pic } = req.files;
      const originalName = pic.name || 'property.jpg';
      const cleanBaseName = path.basename(originalName).replace(/[^a-zA-Z0-9._-]/g, '_');
      sanitizedFileName = `${Date.now()}_${cleanBaseName}`;
      const uploadFilePath = path.join(uploadDir, sanitizedFileName);
      await moveFile(pic, uploadFilePath);
    }

    existingProperty.title = title ? title.trim() : existingProperty.title;
    existingProperty.price = price ? price.toString().trim() : existingProperty.price;
    existingProperty.area = area ? area.toString().trim() : existingProperty.area;
    existingProperty.description = description !== undefined ? description.trim() : existingProperty.description;
    existingProperty.location = location ? location.trim() : existingProperty.location;
    existingProperty.category = category ? category.trim() : existingProperty.category;
    existingProperty.status = status ? status.trim() : existingProperty.status;
    existingProperty.bedrooms = bedrooms ? bedrooms.toString().trim() : existingProperty.bedrooms;
    if (serviceType !== undefined) existingProperty.serviceType = serviceType.trim();
    if (isOffer !== undefined) existingProperty.isOffer = Boolean(isOffer === 'true' || isOffer === true);
    if (offerDiscount !== undefined) existingProperty.offerDiscount = offerDiscount.trim();
    existingProperty.pic = sanitizedFileName;
    existingProperty.updatedAt = new Date();

    const updated = await existingProperty.save();
    return res.status(200).json({
      code: 200,
      message: "Property updated successfully.",
      data: updated
    });
  } catch (err) {
    console.error("Update Property Error:", err);
    return res.status(500).json({
      code: 500,
      message: "Internal Server Error updating property.",
      data: ''
    });
  }
});

adminRoute.post('/delete-property', verifyAdmin, async (req, res) => {
  try {
    const { _id } = req.body;
    if (!_id) {
      return res.status(400).json({ code: 400, message: "Property ID is required.", data: '' });
    }

    const result = await propertyModel.findByIdAndDelete(_id);
    if (result) {
      return res.json({
        code: 200,
        message: "Property Deleted Successfully.",
        data: ''
      });
    } else {
      return res.json({
        code: 400,
        message: "Property delete failed. Property not found.",
        data: ''
      });
    }
  } catch (err) {
    console.error("Delete property error:", err);
    return res.status(500).json({
      code: 500,
      message: "Internal Server Error deleting property.",
      data: ''
    });
  }
});

adminRoute.get('/admin/overview-stats', verifyAdmin, async (req, res) => {
  try {
    const [totalCategories, totalProviders, totalProperties, totalSold, totalUsers, totalMessages] = await Promise.all([
      categoryModel.countDocuments(),
      serviceProviderModel.countDocuments(),
      propertyModel.countDocuments(),
      buyerModel.countDocuments(),
      userModel.countDocuments({ userType: 'user' }),
      ContactModel.countDocuments()
    ]);

    return res.status(200).json({
      code: 200,
      message: "Overview stats loaded.",
      data: {
        totalCategories,
        totalProviders,
        totalProperties,
        totalSold,
        totalUsers,
        totalMessages
      }
    });
  } catch (err) {
    console.error("Overview stats error:", err);
    return res.status(500).json({ code: 500, message: "Failed to load admin stats.", data: null });
  }
});

// Admin Sold List (Protected)
adminRoute.get('/admin-sold-list', verifyAdmin, async (req, res) => {
  try {
    const raw = await buyerModel.find().sort({ createdAt: -1 });
    const finalData = await Promise.all(
      raw?.map(async (item) => {
        const propertyData = await propertyModel.findOne({ _id: item?.propertyId });
        const userData = await userModel.findOne({ _id: item?.userId });
        return {
          _id: item?._id,
          propertyId: propertyData?._id,
          title: propertyData?.title || 'Luxury Residence',
          price: propertyData?.price || '0',
          area: propertyData?.area || 'N/A',
          location: propertyData?.location || 'Prime City',
          description: propertyData?.description || '',
          category: propertyData?.category || 'House',
          status: propertyData?.status || 'Sold',
          bedrooms: propertyData?.bedrooms || '1',
          pic: propertyData?.pic,
          name: userData?.name || 'Customer',
          email: userData?.email || 'N/A',
          contact: userData?.contact || 'N/A'
        };
      })
    );
    return res.json({
      code: 200,
      message: "Data fetched.",
      data: finalData
    });
  } catch (err) {
    console.error("Admin sold list error:", err);
    return res.status(500).json({
      code: 500,
      message: "Internal Server Error.",
      data: []
    });
  }
});

adminRoute.post('/delete-sold-item', verifyAdmin, async (req, res) => {
  try {
    const { _id } = req.body;
    const result = await buyerModel.findByIdAndDelete(_id);
    if (result) {
      return res.json({
        code: 200,
        message: "Sold record deleted successfully.",
        data: ''
      });
    } else {
      return res.json({
        code: 400,
        message: "Sold record delete failed.",
        data: ''
      });
    }
  } catch (err) {
    console.error("Delete sold record error:", err);
    return res.status(500).json({
      code: 500,
      message: "Internal Server Error.",
      data: ''
    });
  }
});

adminRoute.get('/admin-user-list', verifyAdmin, async (req, res) => {
  try {
    const result = await userModel.find({ userType: "user" }).select("-password").sort({ createdAt: -1 });
    return res.json({
      code: 200,
      message: "Data fetched successfully.",
      data: result || []
    });
  } catch (err) {
    console.error("Admin user list error:", err);
    return res.status(500).json({
      code: 500,
      message: "Internal Server Error.",
      data: []
    });
  }
});

adminRoute.post('/toggle-user-status', verifyAdmin, async (req, res) => {
  try {
    const { userId } = req.body;
    if (!userId) {
      return res.status(400).json({
        code: 400,
        message: "User ID is required.",
        data: ''
      });
    }

    const user = await userModel.findById(userId);
    if (!user) {
      return res.status(404).json({
        code: 404,
        message: "User not found.",
        data: ''
      });
    }

    user.isBlocked = !user.isBlocked;
    user.updatedAt = new Date();
    await user.save();

    const statusText = user.isBlocked ? 'Blocked' : 'Unblocked';
    return res.status(200).json({
      code: 200,
      message: `User ${statusText} successfully.`,
      data: {
        _id: user._id,
        isBlocked: user.isBlocked,
        name: user.name,
        email: user.email
      }
    });
  } catch (err) {
    console.error("Toggle user status error:", err);
    return res.status(500).json({
      code: 500,
      message: "Internal Server Error.",
      data: ''
    });
  }
});

adminRoute.all('/contact-us-list', verifyAdmin, async (req, res) => {
  try {
    const data = await ContactModel.find().sort({ createdAt: -1 });
    return res.json({
      code: 200,
      message: "Data fetched successfully",
      data: data || []
    });
  } catch (err) {
    console.error("Contact list fetch error:", err);
    return res.status(500).json({
      code: 500,
      message: "Internal Server Error.",
      data: []
    });
  }
});

adminRoute.post('/contact-us', async (req, res) => {
  try {
    const { name, email, phone, subject, message } = req.body;
    if (!name || !email || !phone || !message) {
      return res.status(400).json({
        code: 400,
        message: "Please fill all required fields.",
        data: ''
      });
    }

    const data = new ContactModel({
      name: name.trim(),
      email: email.trim().toLowerCase(),
      phone: phone.trim(),
      subject: subject ? subject.trim() : 'General Inquiry',
      message: message.trim()
    });

    const result = await data.save();
    return res.status(200).json({
      code: 200,
      message: "Message sent successfully! Our team will contact you shortly.",
      data: result
    });
  } catch (err) {
    console.error("Save contact enquiry error:", err);
    return res.status(500).json({
      code: 500,
      message: "Unable to send message. Please try again later.",
      data: ''
    });
  }
});

export default adminRoute;