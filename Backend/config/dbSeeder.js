import { categoryModel, serviceProviderModel, propertyModel, userModel } from '../model/table.js';
import bcrypt from 'bcryptjs';

export const seedDatabaseIfEmpty = async () => {
  try {
    const adminCount = await userModel.countDocuments({ userType: 'admin' });
    if (adminCount === 0) {
      const salt = await bcrypt.genSalt(10);
      const hashedPassword = await bcrypt.hash('admin123', salt);
      const defaultAdmin = new userModel({
        name: 'Quirex Administrator',
        email: 'admin@quirex.com',
        password: hashedPassword,
        contact: '9876543210',
        address: '15/A, NestTower, Financial District, NYC',
        profile: 'author.jpg.jpeg',
        userType: 'admin',
        isBlocked: false
      });
      await defaultAdmin.save();
      console.log('Seeded default Admin user: admin@quirex.com');
    }

    const categoryCount = await categoryModel.countDocuments();
    if (categoryCount === 0) {
      const defaultCategories = [
        {
          name: 'House',
          slug: 'house',
          description: 'Contemporary standalone family homes, suburban estates, and garden residences.',
          icon: 'FaHome',
          image: '1.jpg.jpeg',
          isActive: true
        },
        {
          name: 'Villa',
          slug: 'villa',
          description: 'Ultra-luxurious private villas featuring infinity pools, expansive lawns, and modern architectural finishes.',
          icon: 'FaBuilding',
          image: '2.jpg.jpeg',
          isActive: true
        },
        {
          name: 'Apartment',
          slug: 'apartment',
          description: 'High-rise urban apartments and designer penthouses in prime metropolitan centers.',
          icon: 'FaBuilding',
          image: '3.jpg.jpeg',
          isActive: true
        },
        {
          name: 'Commercial',
          slug: 'commercial',
          description: 'Retail stores, corporate headquarters, and high-footfall business venues.',
          icon: 'FaStore',
          image: '4.jpg.jpeg',
          isActive: true
        },
        {
          name: 'Office',
          slug: 'office',
          description: 'Turnkey executive office suites, co-working facilities, and tech park workspaces.',
          icon: 'FaBriefcase',
          image: '5.jpg.jpeg',
          isActive: true
        },
        {
          name: 'Studio',
          slug: 'studio',
          description: 'Compact, stylish, and fully furnished studio lofts ideal for professionals and short stays.',
          icon: 'FaLayerGroup',
          image: '1.png',
          isActive: true
        }
      ];
      await categoryModel.insertMany(defaultCategories);
      console.log(`Seeded ${defaultCategories.length} default categories.`);
    }

    const providerCount = await serviceProviderModel.countDocuments();
    if (providerCount === 0) {
      const defaultProviders = [
        {
          name: 'Quirex Luxury Advisory & Brokerage',
          email: 'brokerage@quirex.com',
          phone: '+1 (555) 345-6789',
          category: 'Villa',
          serviceType: 'Luxury Real Estate Advisory',
          experience: '12+ Years',
          rating: 4.95,
          location: 'Manhattan, New York',
          priceRange: '$$$$',
          image: 'author.jpg.jpeg',
          bio: 'Premier advisory firm specializing in high-net-worth real estate transactions and confidential acquisitions.',
          isActive: true
        },
        {
          name: 'Skyline Architecture & Interior Staging',
          email: 'design@skylinestaging.com',
          phone: '+1 (555) 789-0123',
          category: 'Apartment',
          serviceType: 'Home Staging & Architectural Tour',
          experience: '9+ Years',
          rating: 4.88,
          location: 'San Francisco, California',
          priceRange: '$$$',
          image: 'author.jpg.jpeg',
          bio: 'Award-winning staging specialists transforming properties into breathtaking showcase residences.',
          isActive: true
        },
        {
          name: 'Apex Structural Engineering & Inspection',
          email: 'inspections@apexengineering.com',
          phone: '+1 (555) 456-7890',
          category: 'Commercial',
          serviceType: 'Property Due Diligence & Inspection',
          experience: '15+ Years',
          rating: 4.92,
          location: 'Chicago, Illinois',
          priceRange: '$$',
          image: 'author.jpg.jpeg',
          bio: 'Certified master building inspectors providing comprehensive safety, seismic, and structural integrity audits.',
          isActive: true
        },
        {
          name: 'Vanguard Title & Real Estate Legal Counsel',
          email: 'legal@vanguardlaw.com',
          phone: '+1 (555) 890-1234',
          category: 'House',
          serviceType: 'Title Transfer & Legal Advisory',
          experience: '18+ Years',
          rating: 4.98,
          location: 'Austin, Texas',
          priceRange: '$$$',
          image: 'author.jpg.jpeg',
          bio: 'Dedicated legal counsel securing transparent escrow, swift contract validation, and title registration.',
          isActive: true
        }
      ];
      await serviceProviderModel.insertMany(defaultProviders);
      console.log(`Seeded ${defaultProviders.length} default service providers.`);
    }

    const propertyCount = await propertyModel.countDocuments();
    if (propertyCount === 0) {
      const defaultProperties = [
        {
          title: 'Beverly Hills Mediterranean Palace',
          price: '4,850,000',
          area: '6,200',
          description: 'Gated private estate with panoramic sunset views, resort-style heated pool, chef kitchen, and wine cellar.',
          location: 'Beverly Hills, CA',
          pic: '1.jpg.jpeg',
          category: 'Villa',
          status: 'Sale',
          bedrooms: '5+',
          serviceType: 'Luxury Residential',
          isOffer: true,
          offerDiscount: 'Special 15% Reduction'
        },
        {
          title: 'Manhattan Skyline Penthouse Suite',
          price: '8,500',
          area: '2,800',
          description: 'Expansive duplex penthouse with private wraparound terrace, direct elevator access, and 360-degree city panorama.',
          location: 'Tribeca, New York',
          pic: '2.jpg.jpeg',
          category: 'Apartment',
          status: 'Rent',
          bedrooms: '3',
          serviceType: 'Urban Penthouse',
          isOffer: true,
          offerDiscount: 'First Month 20% Off'
        },
        {
          title: 'Mission District Designer Villa',
          price: '2,450,000',
          area: '3,450',
          description: 'Architectural masterpiece featuring exposed timber trusses, minimalist concrete landscaping, and solar glass facade.',
          location: 'San Francisco, CA',
          pic: '3.jpg.jpeg',
          category: 'House',
          status: 'Sale',
          bedrooms: '4',
          serviceType: 'Modern Architecture',
          isOffer: false,
          offerDiscount: ''
        },
        {
          title: 'Pacific Heights Executive Residence',
          price: '5,200',
          area: '2,100',
          description: 'Quiet tree-lined sanctuary with hardwood flooring, marble baths, high ceilings, and landscaped backyard patio.',
          location: 'Pacific Heights, CA',
          pic: '4.jpg.jpeg',
          category: 'House',
          status: 'Rent',
          bedrooms: '3',
          serviceType: 'Residential Rental',
          isOffer: false,
          offerDiscount: ''
        },
        {
          title: 'Downtown Retail Boutique & Showroom',
          price: '6,400',
          area: '3,100',
          description: 'Prime corner commercial property with floor-to-ceiling display windows, high footfall, and dedicated customer parking.',
          location: 'Chicago, IL',
          pic: '5.jpg.jpeg',
          category: 'Commercial',
          status: 'Rent',
          bedrooms: '1',
          serviceType: 'Commercial Space',
          isOffer: true,
          offerDiscount: '10% Lease Rebate'
        },
        {
          title: 'SoHo Modern Designer Loft',
          price: '1,250,000',
          area: '1,650',
          description: 'Authentic industrial brick loft with soaring 14-foot ceilings, custom steel fireplace, and bespoke Italian kitchen.',
          location: 'SoHo, New York',
          pic: '3.png',
          category: 'Studio',
          status: 'Sale',
          bedrooms: '2',
          serviceType: 'Studio Residence',
          isOffer: false,
          offerDiscount: ''
        }
      ];
      await propertyModel.insertMany(defaultProperties);
      console.log(`Seeded ${defaultProperties.length} default properties.`);
    }
  } catch (err) {
    console.error('Error during database seeding:', err.message);
  }
};
