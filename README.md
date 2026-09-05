# 🏢 Quirex — Real Estate & Property Management Platform

<p align="center">
  <img src="./img/logo.png" alt="Quirex Logo" width="180" />
</p>

<p align="center">
  <strong>A modern, full-stack MERN real estate marketplace and property management system.</strong>
</p>

<p align="center">
  <img src="https://img.shields.io/badge/React-19.x-61DAFB?style=for-the-badge&logo=react&logoColor=black" alt="React 19" />
  <img src="https://img.shields.io/badge/Vite-7.x-646CFF?style=for-the-badge&logo=vite&logoColor=white" alt="Vite" />
  <img src="https://img.shields.io/badge/Node.js-18+-339933?style=for-the-badge&logo=node.js&logoColor=white" alt="Node.js" />
  <img src="https://img.shields.io/badge/Express.js-5.x-000000?style=for-the-badge&logo=express&logoColor=white" alt="Express.js" />
  <img src="https://img.shields.io/badge/MongoDB-Mongoose-47A248?style=for-the-badge&logo=mongodb&logoColor=white" alt="MongoDB" />
  <img src="https://img.shields.io/badge/Bootstrap-5.3-7952B3?style=for-the-badge&logo=bootstrap&logoColor=white" alt="Bootstrap" />
</p>

---

## 📖 Table of Contents

- [🌟 Overview](#-overview)
- [✨ Key Features](#-key-features)
  - [👤 User Features](#-user-features)
  - [🛡️ Admin Dashboard Features](#️-admin-dashboard-features)
- [🛠️ Tech Stack](#️-tech-stack)
- [📁 Project Structure](#-project-structure)
- [🚀 Getting Started](#-getting-started)
  - [📋 Prerequisites](#-prerequisites)
  - [⚙️ Backend Setup](#️-backend-setup)
  - [💻 Frontend Setup](#-frontend-setup)
- [🔐 Environment Variables](#-environment-variables)
- [📡 API Documentation](#-api-documentation)
- [🔒 Security & Authentication](#-security--authentication)
- [🤝 Contributing](#-contributing)
- [📄 License](#-license)

---

## 🌟 Overview

**Quirex** is a full-featured real estate marketplace and management platform designed to streamline property transactions, rentals, and service bookings. It bridges the gap between property seekers, verified service professionals, and property administrators.

Built using the **MERN** stack (MongoDB, Express, React, Node.js) paired with **Vite** and **Bootstrap 5**, Quirex offers blazing-fast load times, seamless user experiences, responsive layouts, and robust role-based access control.

---

## ✨ Key Features

### 👤 User Features
- **🏡 Dynamic Property Discovery:** Browse properties for sale and rent with interactive search and categorization (Villas, Apartments, Houses, Commercial).
- **🔍 Advanced Filtering:** Filter listings by category, bedroom count, price range, service type, and special discount offers.
- **🛒 Instant Property Buying / Booking:** Book or buy properties directly with real-time status updates and order records.
- **📜 Purchase History (Bought List):** Dedicated dashboard section displaying purchased properties and transaction summaries.
- **👷 Verified Service Providers Directory:** Discover certified real estate agents, contractors, architects, and interior designers with ratings and contact information.
- **👤 Profile Management:** Update personal details, contact information, address, and profile avatars.
- **💬 Interactive Contact & Inquiries:** Submit inquiries directly through an interactive contact form with instant admin notification.
- **🎨 Engaging UI/UX:** Smooth animations powered by **AOS (Animate On Scroll)**, dynamic typewriter hero headlines, and animated counter metrics.

### 🛡️ Admin Dashboard Features
- **📊 Real-Time Analytics & Overview:** Monitor total properties, active categories, sold records, registered users, and user inquiries.
- **🏷️ Category Management:** Complete CRUD operations (Create, Read, Update, Delete) for property categories with custom banners and icons.
- **🏠 Property Management:** Add new properties with high-resolution image uploads, update pricing, toggle offer discounts, or remove listings.
- **🤝 Service Provider Directory Management:** Onboard, update, and manage verified professional partners.
- **📑 Sold Properties Tracker:** Automatic transaction logging when a user purchases a property, complete with buyer details and timestamps.
- **👥 User Access Control:** View registered users and instantly toggle block/unblock status to safeguard the platform.
- **📬 Inquiries Inbox:** Manage, review, and track client inquiries submitted via the Contact form.

---

## 🛠️ Tech Stack

### Frontend
- **Framework & Build Tool:** [React 19](https://react.dev/), [Vite](https://vitejs.dev/)
- **Routing:** [React Router DOM v7](https://reactrouter.com/)
- **Styling & UI:** [Bootstrap 5](https://getbootstrap.com/), Custom Vanilla CSS
- **Icons & Animation:** [React Icons](https://react-icons.github.io/react-icons/), [AOS (Animate On Scroll)](https://michalsnik.github.io/aos/), [React CountUp](https://github.com/glennreyes/react-countup), [Typewriter Effect](https://www.npmjs.com/package/typewriter-effect)
- **Forms & Validation:** [React Hook Form](https://react-hook-form.com/), [Yup](https://github.com/jquense/yup)
- **Alerts & Modals:** [SweetAlert2](https://sweetalert2.github.io/)
- **HTTP Client:** [Axios](https://axios-http.com/)

### Backend
- **Runtime Environment:** [Node.js](https://nodejs.org/) (ES Modules)
- **Framework:** [Express.js v5](https://expressjs.com/)
- **Database & ODM:** [MongoDB](https://www.mongodb.com/), [Mongoose v8](https://mongoosejs.com/)
- **File & Media Handling:** [express-fileupload](https://www.npmjs.com/package/express-fileupload)
- **Security & Utilities:** [Bcryptjs](https://www.npmjs.com/package/bcryptjs), [CORS](https://www.npmjs.com/package/cors), [Dotenv](https://www.npmjs.com/package/dotenv), [Nodemon](https://nodemon.io/)

---

## 📁 Project Structure

```text
Quirex/
├── Backend/                     # Express.js REST API Server
│   ├── config/
│   │   └── db.js                # MongoDB connection handler
│   ├── model/
│   │   └── table.js             # Mongoose schemas (User, Property, Category, Provider, Buyer, Contact)
│   ├── route/
│   │   ├── adminRoute.js        # Admin & Public listing endpoints
│   │   └── userRoute.js         # Authentication, user profile & purchase endpoints
│   ├── uploads/                 # Static media uploads (images, avatars, banners)
│   ├── .env.example             # Backend environment template
│   ├── index.js                 # Server entry point & middleware config
│   └── package.json
│
├── frontend/                    # React 19 + Vite Client Application
│   ├── public/                  # Public assets
│   ├── src/
│   │   ├── components/
│   │   │   ├── AdminComponents/ # Admin Dashboard & Management UI
│   │   │   ├── landingComponents/# Landing page, Navbar, Property & Category views
│   │   │   └── userComponents/  # User Dashboard, Profile, and Purchase history
│   │   ├── config/
│   │   │   └── api.js           # Centralized API base URL configuration
│   │   ├── App.jsx              # Application router & protected routes
│   │   ├── App.css              # Global custom stylesheets & responsive utilities
│   │   └── main.jsx             # React DOM root entry
│   ├── .env.example             # Frontend environment template
│   ├── index.html
│   ├── vite.config.js
│   └── package.json
│
├── img/                         # Repository brand assets & sample images
├── .gitignore
└── README.md
```

---

## 🚀 Getting Started

Follow these step-by-step instructions to set up and run Quirex on your local development machine.

### 📋 Prerequisites

Ensure you have the following installed on your machine:
- **Node.js**: `v18.0.0` or higher ([Download Node.js](https://nodejs.org/))
- **npm** (comes with Node.js) or **yarn**
- **MongoDB**: Local MongoDB instance running on port `27017` or a [MongoDB Atlas](https://www.mongodb.com/atlas) connection URI.
- **Git**

---

### ⚙️ Backend Setup

1. **Navigate to the Backend directory:**
   ```bash
   cd Backend
   ```

2. **Install server dependencies:**
   ```bash
   npm install
   ```

3. **Configure Environment Variables:**
   Create a `.env` file in the `Backend/` root:
   ```bash
   cp .env.example .env
   ```
   *Edit `.env` as needed (see [Environment Variables](#-environment-variables)).*

4. **Start the Backend server:**
   ```bash
   # Development mode with live reload
   npm run dev
   ```
   The backend will start at `http://localhost:9000`.

---

### 💻 Frontend Setup

1. **Open a new terminal and navigate to the `frontend` directory:**
   ```bash
   cd frontend
   ```

2. **Install frontend dependencies:**
   ```bash
   npm install
   ```

3. **Configure Frontend Environment Variables:**
   Create a `.env` file in the `frontend/` root:
   ```bash
   cp .env.example .env
   ```
   *Ensure `VITE_API_BASE_URL` points to your backend (`http://localhost:9000`).*

4. **Start the Vite development server:**
   ```bash
   npm run dev
   ```
   The frontend will be accessible at `http://localhost:5173` (or the port specified in your terminal).

---

## 🔐 Environment Variables

### Backend (`Backend/.env`)

```env
# Server Port
PORT=9000

# MongoDB Database Connection String
MONGO_URI=mongodb://localhost:27017/Quirex

# Frontend Origin (Optional for CORS configuration)
CLIENT_URL=http://localhost:5173
```

### Frontend (`frontend/.env`)

```env
# Backend API Base URL
VITE_API_BASE_URL=http://localhost:9000
```

---

## 📡 API Documentation

### 🔓 Public & Authentication Routes (`/api`)

| Method | Endpoint | Description |
| :--- | :--- | :--- |
| `GET` | `/health` | Server health check endpoint |
| `POST` | `/user-register` | Register a new user with profile picture upload |
| `POST` | `/login` | Authenticate user or admin & retrieve session data |
| `GET` | `/categories` | Fetch all active property categories |
| `GET` | `/service-providers`| Fetch verified service provider listings |
| `GET` | `/property-list` | Retrieve all available properties for sale/rent |
| `GET` | `/property-details/:id` | Get comprehensive details of a single property |
| `POST` | `/contact-us` | Submit an inquiry message |

### 👤 Protected User Routes (`/api`)

| Method | Endpoint | Description |
| :--- | :--- | :--- |
| `PUT` | `/user-update` | Update user profile information & avatar |
| `POST` | `/buy` | Purchase / book a property |
| `POST` | `/user-bought-list` | Retrieve list of properties purchased by the user |

### 🛡️ Admin Management Routes (`/api`)

| Method | Endpoint | Description |
| :--- | :--- | :--- |
| `GET` | `/admin/overview-stats` | Fetch aggregated platform statistics |
| `GET` | `/admin/categories` | Retrieve all categories with management details |
| `POST` | `/admin/add-category` | Add a new property category |
| `POST` | `/admin/update-category`| Update an existing category |
| `POST` | `/admin/delete-category`| Delete a category |
| `GET` | `/admin/providers` | Fetch all service providers |
| `POST` | `/admin/add-provider` | Add a verified service provider |
| `POST` | `/admin/update-provider` | Update a service provider's profile |
| `POST` | `/admin/delete-provider` | Remove a service provider |
| `POST` | `/add-property` | Create and publish a new property listing |
| `POST` | `/update-property` | Edit property specifications, price, or status |
| `POST` | `/delete-property` | Remove a property listing |
| `GET` | `/admin-sold-list` | View complete history of sold properties |
| `POST` | `/delete-sold-item` | Remove a sold record entry |
| `GET` | `/admin-user-list` | View all registered platform users |
| `POST` | `/toggle-user-status` | Toggle user account status (Block / Unblock) |
| `ALL` | `/contact-us-list` | View list of all contact inquiries |

---

## 🔒 Security & Authentication

- **Password Hashing:** Passwords are encrypted using `bcryptjs` with salt rounds prior to persistence.
- **Client-Side Route Protection:** `ProtectedRoute` wrapper enforces role authentication (`user` vs `admin`) and redirects unauthenticated access.
- **Input Sanitization & Validation:** Handled via schema constraints and form validation using `Yup` and `React Hook Form`.
- **CORS Protection:** Configured with specific methods, headers, and credentials support.

---

## 🤝 Contributing

Contributions, issues, and feature requests are welcome!

1. Fork the Project
2. Create your Feature Branch (`git checkout -b feature/AmazingFeature`)
3. Commit your Changes (`git commit -m 'Add some AmazingFeature'`)
4. Push to the Branch (`git push origin feature/AmazingFeature`)
5. Open a Pull Request

---

## 📄 License

Distributed under the **ISC License**. See `package.json` for details.

---

<p align="center">
  Made with ❤️ for modern real estate solutions.
</p>
