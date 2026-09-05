import { API_BASE_URL } from '../config/api';

const DEFAULT_REAL_ESTATE_IMAGES = [
  '/img/1.jpg.jpeg',
  '/img/2.jpg.jpeg',
  '/img/3.jpg.jpeg',
  '/img/4.jpg.jpeg',
  '/img/5.jpg.jpeg',
  '/img/3.png',
  '/img/7.png',
  '/img/4.png',
  '/img/1.png',
  '/img/luxury-living-pool-hero.jpg',
  '/img/11.jpg.jpeg',
  '/img/12.jpg.jpeg',
  '/img/13.jpg.jpeg'
];

export const getCategoryHouseImage = (category = '', index = 0) => {
  const cat = (category || '').toLowerCase().trim();
  if (cat.includes('villa')) return '/img/luxury-living-pool-hero.jpg';
  if (cat.includes('apartment') || cat.includes('flat') || cat.includes('penthouse')) return '/img/2.jpg.jpeg';
  if (cat.includes('commercial') || cat.includes('office') || cat.includes('retail')) return '/img/5.jpg.jpeg';
  if (cat.includes('studio') || cat.includes('loft')) return '/img/3.png';
  if (cat.includes('house') || cat.includes('home')) {
    const houseList = ['/img/1.jpg.jpeg', '/img/3.jpg.jpeg', '/img/4.jpg.jpeg', '/img/11.jpg.jpeg'];
    return houseList[index % houseList.length];
  }
  return DEFAULT_REAL_ESTATE_IMAGES[index % DEFAULT_REAL_ESTATE_IMAGES.length];
};

export const getPropertyImageUrl = (item, index = 0) => {
  const pic = item?.pic || item?.image;
  if (pic && pic !== 'home.png' && pic !== 'notfound.png' && pic.trim() !== '') {
    if (pic.startsWith('http://') || pic.startsWith('https://')) {
      return pic;
    }
    if (pic.startsWith('/img/')) {
      return pic;
    }
    return `${API_BASE_URL}/img/${pic}`;
  }
  return getCategoryHouseImage(item?.category, index);
};

export const handleImageError = (e, category = '', index = 0) => {
  e.target.onerror = null;
  e.target.src = getCategoryHouseImage(category, index);
};
