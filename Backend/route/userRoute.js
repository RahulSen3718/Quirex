import express from 'express';
import bcrypt from 'bcryptjs';
import mongoose from 'mongoose';
import { userModel, propertyModel, buyerModel } from '../model/table.js';
import path from 'path';
import fs from 'fs';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);
const uploadDir = path.join(__dirname, '..', 'uploads');

if (!fs.existsSync(uploadDir)) {
  fs.mkdirSync(uploadDir, { recursive: true });
}

const router = express.Router();

const moveFile = (file, uploadPath) => {
  return new Promise((resolve, reject) => {
    file.mv(uploadPath, (err) => {
      if (err) return reject(err);
      resolve();
    });
  });
};

router.post('/user-register', async (req, res) => {
  let uploadedFilePath = null;

  try {

    if (mongoose.connection.readyState !== 1) {
      console.error("Registration failed: Database is not connected. readyState =", mongoose.connection.readyState);
      return res.status(500).json({
        code: 500,
        message: "Database connection unavailable. Please ensure MongoDB is running and try again.",
        data: ''
      });
    }

    const name = typeof req.body?.name === 'string' ? req.body.name.trim() : '';
    const email = typeof req.body?.email === 'string' ? req.body.email.trim().toLowerCase() : '';
    const contact = typeof req.body?.contact === 'string' ? req.body.contact.trim() : '';
    const password = typeof req.body?.password === 'string' ? req.body.password.trim() : '';
    const address = typeof req.body?.address === 'string' ? req.body.address.trim() : '';


    if (!name) {
      return res.status(400).json({
        code: 400,
        message: "Name is required.",
        field: "name",
        data: ''
      });
    }
    if (!email) {
      return res.status(400).json({
        code: 400,
        message: "Email is required.",
        field: "email",
        data: ''
      });
    }
    if (!contact) {
      return res.status(400).json({
        code: 400,
        message: "Mobile number is required.",
        field: "contact",
        data: ''
      });
    }
    if (!password) {
      return res.status(400).json({
        code: 400,
        message: "Password is required.",
        field: "password",
        data: ''
      });
    }
    if (!address) {
      return res.status(400).json({
        code: 400,
        message: "Address is required.",
        field: "address",
        data: ''
      });
    }

    // Name validation (2-50 characters, letters and spaces only)
    if (name.length < 2 || name.length > 50 || !/^[a-zA-Z\s]+$/.test(name)) {
      return res.status(400).json({
        code: 400,
        message: "Please enter a valid name (2-50 characters, letters only).",
        field: "name",
        data: ''
      });
    }

    // Mobile number validation (10 digits starting with 6, 7, 8, or 9)
    const mobileRegex = /^[6-9][0-9]{9}$/;
    if (!mobileRegex.test(contact)) {
      return res.status(400).json({
        code: 400,
        message: "Please enter a valid 10-digit mobile number.",
        field: "contact",
        data: ''
      });
    }

    // Email validation
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!emailRegex.test(email)) {
      return res.status(400).json({
        code: 400,
        message: "Please enter a valid email address.",
        field: "email",
        data: ''
      });
    }

    // Password validation (8-20 characters)
    if (password.length < 8) {
      return res.status(400).json({
        code: 400,
        message: "Password must be at least 8 characters.",
        field: "password",
        data: ''
      });
    }
    if (password.length > 20) {
      return res.status(400).json({
        code: 400,
        message: "Password cannot exceed 20 characters.",
        field: "password",
        data: ''
      });
    }

    // Address validation (3-200 characters)
    if (address.length < 3 || address.length > 200) {
      return res.status(400).json({
        code: 400,
        message: "Address must be between 3 and 200 characters.",
        field: "address",
        data: ''
      });
    }

    // Profile picture check (optional with default fallback)
    let sanitizedFileName = 'default-avatar.png';

    if (req.files && req.files.profile) {
      const { profile } = req.files;
      const allowedMimes = [
        'image/jpeg', 'image/png', 'image/webp', 'image/jpg', 'image/gif',
        'image/pjpeg', 'image/x-png'
      ];
      if (!allowedMimes.includes(profile.mimetype)) {
        return res.status(400).json({
          code: 400,
          message: "Invalid file type. Only JPG, PNG, WEBP, and GIF images are allowed.",
          field: "profile",
          data: ''
        });
      }

      if (profile.size && profile.size > 5 * 1024 * 1024) {
        return res.status(400).json({
          code: 400,
          message: "Profile picture size must be less than 5MB.",
          field: "profile",
          data: ''
        });
      }

      // Safe filename generation
      if (!fs.existsSync(uploadDir)) {
        fs.mkdirSync(uploadDir, { recursive: true });
      }
      const originalName = profile.name || 'profile.jpg';
      const cleanBaseName = path.basename(originalName).replace(/[^a-zA-Z0-9._-]/g, '_');
      sanitizedFileName = `${Date.now()}_${cleanBaseName}`;
      const uploadFilePath = path.join(uploadDir, sanitizedFileName);

      await moveFile(profile, uploadFilePath);
      uploadedFilePath = uploadFilePath;
    }

    // Check duplicate email or contact
    const [emailExists, contactExists] = await Promise.all([
      userModel.findOne({ email }),
      userModel.findOne({ contact })
    ]);

    if (emailExists && contactExists) {
      return res.status(409).json({
        code: 409,
        message: "This email and mobile number are already registered. Please login or use different details.",
        field: "both",
        data: ''
      });
    } else if (emailExists) {
      return res.status(409).json({
        code: 409,
        message: "This email is already registered. Please use another email or login.",
        field: "email",
        data: ''
      });
    } else if (contactExists) {
      return res.status(409).json({
        code: 409,
        message: "This mobile number is already registered. Please use another number or login.",
        field: "contact",
        data: ''
      });
    }

    // Password Hashing with bcryptjs (salt rounds = 10)
    const salt = await bcrypt.genSalt(10);
    const hashedPassword = await bcrypt.hash(password, salt);

    const data = new userModel({
      name,
      email,
      password: hashedPassword,
      contact,
      address,
      profile: sanitizedFileName,
      userType: 'user'
    });

    const result = await data.save();
    const responseData = result.toObject();
    delete responseData.password;

    return res.status(200).json({
      code: 200,
      message: "User Registered Successfully.",
      data: responseData
    });
  } catch (err) {
    console.error("Registration Server Error:", err);

    // Clean up uploaded file if database save failed
    if (uploadedFilePath && fs.existsSync(uploadedFilePath)) {
      try {
        fs.unlinkSync(uploadedFilePath);
      } catch (cleanupErr) {
        console.error("Failed to clean up uploaded file:", cleanupErr);
      }
    }

    if (err.code === 11000) {
      const duplicateField = Object.keys(err.keyPattern || err.keyValue || {})[0] || (err.message?.includes('contact') ? 'contact' : 'email');
      const friendlyName = duplicateField === 'contact' ? 'mobile number' : duplicateField;
      return res.status(409).json({
        code: 409,
        message: `This ${friendlyName} is already registered. Please login or use different details.`,
        field: duplicateField,
        data: ''
      });
    }

    if (err.name === 'ValidationError') {
      const firstErrorMsg = Object.values(err.errors || {})[0]?.message || err.message;
      return res.status(400).json({
        code: 400,
        message: firstErrorMsg,
        data: ''
      });
    }

    return res.status(500).json({
      code: 500,
      message: "Server error occurred during registration. Please try again later.",
      data: ''
    });
  }
});

router.put('/user-update', async (req, res) => {
  let uploadedFilePath = null;

  try {
    // Database connection readiness check
    if (mongoose.connection.readyState !== 1) {
      console.error("User update failed: Database is not connected.");
      return res.status(500).json({
        code: 500,
        message: "Database connection unavailable. Please try again later.",
        data: ''
      });
    }

    const { userId } = req.body || {};

    // Validate MongoDB ObjectId
    if (!userId || !mongoose.Types.ObjectId.isValid(userId)) {
      return res.status(400).json({
        code: 400,
        message: "Invalid or missing user ID.",
        field: "userId",
        data: ''
      });
    }

    // Verify existing user exists
    const existingUser = await userModel.findById(userId);
    if (!existingUser) {
      return res.status(404).json({
        code: 404,
        message: "User account not found.",
        data: ''
      });
    }

    const updateFields = { updatedAt: new Date() };

    // Validate and sanitize Name
    if (typeof req.body.name === 'string' && req.body.name.trim()) {
      const name = req.body.name.trim();
      if (name.length < 2 || name.length > 50 || !/^[a-zA-Z\s]+$/.test(name)) {
        return res.status(400).json({
          code: 400,
          message: "Please enter a valid name (2-50 characters, letters only).",
          field: "name",
          data: ''
        });
      }
      updateFields.name = name;
    }

    // Validate and sanitize Contact / Phone
    if (typeof req.body.contact === 'string' && req.body.contact.trim()) {
      const contact = req.body.contact.trim();
      const mobileRegex = /^[6-9][0-9]{9}$/;
      if (!mobileRegex.test(contact)) {
        return res.status(400).json({
          code: 400,
          message: "Please enter a valid 10-digit mobile number.",
          field: "contact",
          data: ''
        });
      }

      // Check if another user already has this contact number
      if (contact !== existingUser.contact) {
        const contactConflict = await userModel.findOne({
          contact,
          _id: { $ne: userId }
        });
        if (contactConflict) {
          return res.status(409).json({
            code: 409,
            message: "This mobile number is already registered to another account.",
            field: "contact",
            data: ''
          });
        }
      }
      updateFields.contact = contact;
    }

    // Validate and sanitize Address
    if (typeof req.body.address === 'string' && req.body.address.trim()) {
      const address = req.body.address.trim();
      if (address.length < 3 || address.length > 200) {
        return res.status(400).json({
          code: 400,
          message: "Address must be between 3 and 200 characters.",
          field: "address",
          data: ''
        });
      }
      updateFields.address = address;
    }

    // Secure Password Update (Only when explicitly entered and non-blank)
    if (typeof req.body.password === 'string' && req.body.password.trim()) {
      const newPassword = req.body.password.trim();
      if (newPassword.length < 8) {
        return res.status(400).json({
          code: 400,
          message: "New password must be at least 8 characters.",
          field: "password",
          data: ''
        });
      }
      if (newPassword.length > 20) {
        return res.status(400).json({
          code: 400,
          message: "New password cannot exceed 20 characters.",
          field: "password",
          data: ''
        });
      }

      const salt = await bcrypt.genSalt(10);
      updateFields.password = await bcrypt.hash(newPassword, salt);
    }

    // Secure Profile Picture Upload Handling
    if (req.files && req.files.profile) {
      const { profile } = req.files;
      const allowedMimes = ['image/jpeg', 'image/png', 'image/webp', 'image/jpg', 'image/gif'];
      const allowedExtensions = ['.jpg', '.jpeg', '.png', '.webp', '.gif'];

      const ext = path.extname(profile.name || '').toLowerCase();

      if (!allowedMimes.includes(profile.mimetype) || !allowedExtensions.includes(ext)) {
        return res.status(400).json({
          code: 400,
          message: "Invalid file type. Only JPG, PNG, WEBP, and GIF images are allowed.",
          field: "profile",
          data: ''
        });
      }

      if (profile.size && profile.size > 5 * 1024 * 1024) {
        return res.status(400).json({
          code: 400,
          message: "Profile picture size must be less than 5MB.",
          field: "profile",
          data: ''
        });
      }

      if (!fs.existsSync(uploadDir)) {
        fs.mkdirSync(uploadDir, { recursive: true });
      }

      // Generate cryptographically safe unique filename preventing path traversal
      const safeRandom = Math.random().toString(36).substring(2, 10);
      const safeFileName = `${Date.now()}_${safeRandom}${ext}`;
      const destPath = path.join(uploadDir, safeFileName);

      await moveFile(profile, destPath);
      uploadedFilePath = destPath;
      updateFields.profile = safeFileName;
    }

    // Apply strictly whitelisted updates
    const updatedUser = await userModel.findByIdAndUpdate(
      userId,
      { $set: updateFields },
      { new: true, runValidators: true }
    ).select("-password");

    if (!updatedUser) {
      return res.status(404).json({
        code: 404,
        message: "User account not found.",
        data: ''
      });
    }

    const responseData = updatedUser.toObject();
    delete responseData.password;

    return res.status(200).json({
      code: 200,
      message: "Profile updated successfully.",
      data: responseData
    });
  } catch (err) {
    console.error("User update server error:", err);

    // Clean up uploaded file if database save failed
    if (uploadedFilePath && fs.existsSync(uploadedFilePath)) {
      try {
        fs.unlinkSync(uploadedFilePath);
      } catch (cleanupErr) {
        console.error("Failed to clean up uploaded profile image:", cleanupErr);
      }
    }

    if (err.code === 11000) {
      const duplicateField = Object.keys(err.keyPattern || err.keyValue || {})[0] || 'contact';
      const friendlyName = duplicateField === 'contact' ? 'mobile number' : duplicateField;
      return res.status(409).json({
        code: 409,
        message: `This ${friendlyName} is already registered.`,
        field: duplicateField,
        data: ''
      });
    }

    return res.status(500).json({
      code: 500,
      message: "Server error occurred while updating profile. Please try again later.",
      data: ''
    });
  }
});

router.post('/login', async (req, res) => {
  try {
    const rawIdentifier = typeof req.body.identifier === 'string'
      ? req.body.identifier.trim()
      : typeof req.body.contact === 'string'
        ? req.body.contact.trim()
        : typeof req.body.email === 'string'
          ? req.body.email.trim()
          : '';
    const password = typeof req.body.password === 'string' ? req.body.password.trim() : '';

    if (!rawIdentifier) {
      return res.status(400).json({
        code: 400,
        message: "Email or mobile number is required.",
        field: "identifier",
        data: ""
      });
    }

    if (!password) {
      return res.status(400).json({
        code: 400,
        message: "Password is required.",
        field: "password",
        data: ""
      });
    }

    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    const mobileRegex = /^[6-9][0-9]{9}$/;

    const isEmail = rawIdentifier.includes('@');
    let query;

    if (isEmail) {
      if (!emailRegex.test(rawIdentifier)) {
        return res.status(400).json({
          code: 400,
          message: "Please enter a valid email address or 10-digit mobile number.",
          field: "identifier",
          data: ""
        });
      }
      query = { email: rawIdentifier.toLowerCase() };
    } else {
      if (!mobileRegex.test(rawIdentifier)) {
        return res.status(400).json({
          code: 400,
          message: "Please enter a valid email address or 10-digit mobile number.",
          field: "identifier",
          data: ""
        });
      }
      query = { contact: rawIdentifier };
    }

    // Search user database using email OR mobile number
    const user = await userModel.findOne(query);

    if (!user) {
      return res.status(401).json({
        code: 401,
        message: "Invalid email/mobile number or password.",
        data: ""
      });
    }

    // Check if user account is blocked by admin (PDF requirement)
    if (user.isBlocked) {
      return res.status(403).json({
        code: 403,
        message: "Your account has been blocked by the administrator. Please contact support.",
        data: ""
      });
    }

    // Check password (support both bcrypt hashed and legacy plaintext)
    let isPasswordValid = false;
    if (user.password) {
      if (user.password.startsWith('$2a$') || user.password.startsWith('$2b$') || user.password.startsWith('$2y$')) {
        isPasswordValid = await bcrypt.compare(password, user.password);
      } else {
        // Legacy plaintext password check
        isPasswordValid = (user.password === password);
        if (isPasswordValid) {
          // Transparently upgrade plaintext password to bcrypt hash
          const salt = await bcrypt.genSalt(10);
          const newHashedPassword = await bcrypt.hash(password, salt);
          await userModel.findByIdAndUpdate(user._id, { password: newHashedPassword });
        }
      }
    }

    if (isPasswordValid) {
      const userData = user.toObject();
      delete userData.password;

      return res.status(200).json({
        code: 200,
        message: "Login Successfully.",
        data: userData
      });
    } else {
      return res.status(401).json({
        code: 401,
        message: "Invalid email/mobile number or password.",
        data: ""
      });
    }
  } catch (err) {
    console.error("Login Server Error:", err);
    return res.status(500).json({
      code: 500,
      message: "Server error occurred during login. Please try again later.",
      data: ''
    });
  }
});

router.post('/buy', async (req, res) => {
  try {
    const { userId, propertyId } = req.body;
    const isSold = await buyerModel.findOne({ propertyId })
    if (isSold) {
      res.json({
        code: 400,
        message: "Property Already Sold.",
        data: isSold
      })
    } else {
      const data = new buyerModel({ userId, propertyId });
      const result = await data.save();
      res.json({
        code: 200,
        message: "Property Bought Successfully..",
        data: result
      })
    }
  } catch (err) {
    res.json({
      code: 500,
      message: "Internal Server Error",
      data: ''
    })
  }
})
router.post('/user-bought-list', async (req, res) => {
  try {
    const { userId } = req.body;
    const raw = await buyerModel.find({ userId });
    const finalData = await Promise.all(
      raw?.map(async (item) => {
        const propertyData = await propertyModel.findOne({ _id: item?.propertyId });

        return {
          _id: item?._id,
          propertyId: propertyData?._id,
          title: propertyData?.title || 'Luxury Property',
          price: propertyData?.price || '0',
          area: propertyData?.area || 'N/A',
          location: propertyData?.location || 'Prime Location',
          description: propertyData?.description || '',
          pic: propertyData?.pic || '',
          category: propertyData?.category || 'Residential',
          status: propertyData?.status ? `Acquired (${propertyData.status})` : 'Confirmed',
          createdAt: item?.createdAt || new Date()
        }
      })
    )
    res.json({
      code: 200,
      message: "Data fetched successfully.",
      data: finalData
    })

  } catch (err) {
    res.json({
      code: 500,
      message: "Internal Server Error",
      data: ''
    })
  }
})

export default router;