// Sample data for Bahrain real estate properties
// This data will be used as fallback when Supabase is not connected

// Bahrain-specific locations
export const bahrainLocations = [
  'Manama', 'Riffa', 'Muharraq', 'Hamad Town', 'Isa Town', 'Sitra',
  'Juffair', 'Seef', 'Adliya', 'Diplomatic Area', 'Amwaj Islands',
  'Durrat Al Bahrain', 'Saar', 'Budaiya', 'Janabiyah', 'Tubli'
]

// Sample properties for sale in Bahrain
export const sampleSaleProperties = [
  {
    id: 1,
    title: 'Luxury Waterfront Villa in Amwaj Islands',
    location: 'Amwaj Islands, Bahrain',
    price: 450000,
    bedrooms: 5,
    bathrooms: 4,
    area: 450,
    type: 'villa',
    category: 'sale',
    image_url: 'https://images.pexels.com/photos/1396122/pexels-photo-1396122.jpeg?auto=compress&cs=tinysrgb&w=800',
    description: 'Stunning waterfront villa with private beach access, infinity pool, and panoramic sea views. Premium finishes throughout.',
    features: ['Private Beach', 'Infinity Pool', 'Maid Room', 'Garage', 'Garden'],
    created_at: new Date().toISOString()
  },
  {
    id: 2,
    title: 'Modern Penthouse in Juffair',
    location: 'Juffair, Bahrain',
    price: 280000,
    bedrooms: 3,
    bathrooms: 3,
    area: 250,
    type: 'apartment',
    category: 'sale',
    image_url: 'https://images.pexels.com/photos/2121121/pexels-photo-2121121.jpeg?auto=compress&cs=tinysrgb&w=800',
    description: 'Luxurious penthouse with city and sea views, premium amenities, and modern design in the heart of Juffair.',
    features: ['City View', 'Sea View', 'Gym', 'Pool', 'Parking'],
    created_at: new Date().toISOString()
  },
  {
    id: 3,
    title: 'Traditional Bahraini House in Muharraq',
    location: 'Muharraq, Bahrain',
    price: 180000,
    bedrooms: 4,
    bathrooms: 3,
    area: 300,
    type: 'house',
    category: 'sale',
    image_url: 'https://images.pexels.com/photos/1438832/pexels-photo-1438832.jpeg?auto=compress&cs=tinysrgb&w=800',
    description: 'Beautifully restored traditional Bahraini house with modern amenities, courtyard, and cultural heritage.',
    features: ['Courtyard', 'Traditional Design', 'Restored', 'Cultural Heritage'],
    created_at: new Date().toISOString()
  },
  {
    id: 4,
    title: 'Family Villa in Riffa Views',
    location: 'Riffa, Bahrain',
    price: 320000,
    bedrooms: 4,
    bathrooms: 3,
    area: 380,
    type: 'villa',
    category: 'sale',
    image_url: 'https://images.pexels.com/photos/1029599/pexels-photo-1029599.jpeg?auto=compress&cs=tinysrgb&w=800',
    description: 'Spacious family villa in prestigious Riffa Views with private garden, pool, and modern amenities.',
    features: ['Private Pool', 'Garden', 'Maid Room', 'Study Room', 'Garage'],
    created_at: new Date().toISOString()
  },
  {
    id: 5,
    title: 'Contemporary Apartment in Seef',
    location: 'Seef, Bahrain',
    price: 150000,
    bedrooms: 2,
    bathrooms: 2,
    area: 140,
    type: 'apartment',
    category: 'sale',
    image_url: 'https://images.pexels.com/photos/2581922/pexels-photo-2581922.jpeg?auto=compress&cs=tinysrgb&w=800',
    description: 'Modern apartment in Seef with mall access, city views, and premium amenities.',
    features: ['Mall Access', 'City View', 'Gym', 'Pool', 'Concierge'],
    created_at: new Date().toISOString()
  },
  {
    id: 6,
    title: 'Beachfront Townhouse in Durrat Al Bahrain',
    location: 'Durrat Al Bahrain',
    price: 380000,
    bedrooms: 3,
    bathrooms: 3,
    area: 280,
    type: 'townhouse',
    category: 'sale',
    image_url: 'https://images.pexels.com/photos/1396132/pexels-photo-1396132.jpeg?auto=compress&cs=tinysrgb&w=800',
    description: 'Exclusive beachfront townhouse with direct beach access and stunning sea views.',
    features: ['Beach Access', 'Sea View', 'Private Terrace', 'Parking'],
    created_at: new Date().toISOString()
  }
]

// Sample rental properties in Bahrain
export const sampleRentalProperties = [
  {
    id: 101,
    title: 'Furnished Studio in Juffair',
    location: 'Juffair, Bahrain',
    price: 380,
    bedrooms: 1,
    bathrooms: 1,
    area: 65,
    type: 'studio',
    category: 'rent',
    image_url: 'https://images.pexels.com/photos/2581922/pexels-photo-2581922.jpeg?auto=compress&cs=tinysrgb&w=800',
    description: 'Fully furnished studio apartment with gym, pool, and parking. Perfect for professionals.',
    features: ['Furnished', 'Gym', 'Pool', 'Parking', 'Security'],
    created_at: new Date().toISOString()
  },
  {
    id: 102,
    title: 'Luxury 2BR in Seef District',
    location: 'Seef, Bahrain',
    price: 650,
    bedrooms: 2,
    bathrooms: 2,
    area: 120,
    type: 'apartment',
    category: 'rent',
    image_url: 'https://images.pexels.com/photos/2121121/pexels-photo-2121121.jpeg?auto=compress&cs=tinysrgb&w=800',
    description: 'Modern 2-bedroom apartment with sea view, premium amenities, and mall access.',
    features: ['Sea View', 'Mall Access', 'Gym', 'Pool', 'Concierge'],
    created_at: new Date().toISOString()
  },
  {
    id: 103,
    title: 'Family Villa in Saar',
    location: 'Saar, Bahrain',
    price: 1200,
    bedrooms: 4,
    bathrooms: 3,
    area: 300,
    type: 'villa',
    category: 'rent',
    image_url: 'https://images.pexels.com/photos/1396122/pexels-photo-1396122.jpeg?auto=compress&cs=tinysrgb&w=800',
    description: 'Spacious family villa with garden, maid room, and garage in quiet neighborhood.',
    features: ['Garden', 'Maid Room', 'Garage', 'Pool', 'Security'],
    created_at: new Date().toISOString()
  },
  {
    id: 104,
    title: 'Modern Townhouse in Amwaj',
    location: 'Amwaj Islands, Bahrain',
    price: 900,
    bedrooms: 3,
    bathrooms: 2,
    area: 200,
    type: 'townhouse',
    category: 'rent',
    image_url: 'https://images.pexels.com/photos/1438832/pexels-photo-1438832.jpeg?auto=compress&cs=tinysrgb&w=800',
    description: 'Beautiful townhouse with marina view, private parking, and beach access.',
    features: ['Marina View', 'Beach Access', 'Parking', 'Terrace'],
    created_at: new Date().toISOString()
  },
  {
    id: 105,
    title: 'Executive Apartment in Diplomatic Area',
    location: 'Diplomatic Area, Bahrain',
    price: 800,
    bedrooms: 2,
    bathrooms: 2,
    area: 140,
    type: 'apartment',
    category: 'rent',
    image_url: 'https://images.pexels.com/photos/2029667/pexels-photo-2029667.jpeg?auto=compress&cs=tinysrgb&w=800',
    description: 'Premium apartment in business district with concierge service and city views.',
    features: ['City View', 'Concierge', 'Gym', 'Pool', 'Business Center'],
    created_at: new Date().toISOString()
  },
  {
    id: 106,
    title: 'Cozy 1BR in Adliya',
    location: 'Adliya, Bahrain',
    price: 420,
    bedrooms: 1,
    bathrooms: 1,
    area: 80,
    type: 'apartment',
    category: 'rent',
    image_url: 'https://images.pexels.com/photos/1029599/pexels-photo-1029599.jpeg?auto=compress&cs=tinysrgb&w=800',
    description: 'Charming apartment in cultural district, walking distance to restaurants and cafes.',
    features: ['Cultural District', 'Restaurants Nearby', 'Cafes', 'Parking'],
    created_at: new Date().toISOString()
  }
]

/**
 * Get random properties from sample data
 * @param {Array} properties - Source properties array
 * @param {number} count - Number of properties to return
 * @returns {Array} Random properties with price variations
 */
export const getRandomProperties = (properties, count = 6) => {
  const shuffled = [...properties].sort(() => Math.random() - 0.5)
  const selected = shuffled.slice(0, count)
  
  // Add price variations to make it feel dynamic
  return selected.map(property => ({
    ...property,
    id: property.id + Math.floor(Math.random() * 10000),
    price: property.category === 'rent' 
      ? property.price + Math.floor(Math.random() * 200) - 100
      : property.price + Math.floor(Math.random() * 50000) - 25000,
    area: property.area + Math.floor(Math.random() * 50) - 25
  }))
}