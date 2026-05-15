/**
 * Offline demo data (~48 sale + ~48 rent). Images are from Unsplash (same sources
 * often used for property listings / Google Image-style results — hotlink-safe CDN).
 */

const LOCATIONS = [
  "Manama",
  "Amwaj Islands",
  "Riffa",
  "Seef District",
  "Juffair",
  "Budaiya",
  "Saar",
  "Muharraq",
  "Hamad Town",
  "Isa Town",
];

const TYPES = ["Villa", "Apartment", "Penthouse", "Townhouse", "Duplex"];

const FURNISHED = ["Fully Furnished", "Semi-Furnished", "Unfurnished", "Furnished"];

const AMENITY_POOL = [
  "Private Beach",
  "Swimming Pool",
  "Gym",
  "Garage",
  "Garden",
  "Security",
  "WiFi",
  "Elevator",
  "Parking",
];

/** Curated Unsplash property / interior photos */
const PROPERTY_IMAGES = [
  "https://images.unsplash.com/photo-1600596542815-ffad4c1539a9?auto=format&fit=crop&w=900&q=80",
  "https://images.unsplash.com/photo-1600585154340-be6161a56a0c?auto=format&fit=crop&w=900&q=80",
  "https://images.unsplash.com/photo-1600607687939-ce8a6c25118c?auto=format&fit=crop&w=900&q=80",
  "https://images.unsplash.com/photo-1600566753190-17f0baa2a6c3?auto=format&fit=crop&w=900&q=80",
  "https://images.unsplash.com/photo-1600047509807-ba8f99d2cdde?auto=format&fit=crop&w=900&q=80",
  "https://images.unsplash.com/photo-1568605114967-8130f3a36994?auto=format&fit=crop&w=900&q=80",
  "https://images.unsplash.com/photo-1613490493576-7fde63acd811?auto=format&fit=crop&w=900&q=80",
  "https://images.unsplash.com/photo-1580587771525-78b9dba3b914?auto=format&fit=crop&w=900&q=80",
  "https://images.unsplash.com/photo-1512917774080-9991f1c4c750?auto=format&fit=crop&w=900&q=80",
  "https://images.unsplash.com/photo-1564013799919-ab600027ffc6?auto=format&fit=crop&w=900&q=80",
  "https://images.unsplash.com/photo-1570129477492-45c003edd2be?auto=format&fit=crop&w=900&q=80",
  "https://images.unsplash.com/photo-1599809275677-bbef26e999aa?auto=format&fit=crop&w=900&q=80",
  "https://images.unsplash.com/photo-1628744876497-eb309cdc63af?auto=format&fit=crop&w=900&q=80",
  "https://images.unsplash.com/photo-1560518883-ce09059eeffa?auto=format&fit=crop&w=900&q=80",
  "https://images.unsplash.com/photo-1494526585095-c41746248156?auto=format&fit=crop&w=900&q=80",
];

function hashPick(seed, mod) {
  return ((seed * 7919 + 49297) % mod + mod) % mod;
}

function pickAmenities(seed) {
  const count = 3 + hashPick(seed, 5);
  const out = [];
  let s = seed;
  for (let k = 0; k < count; k++) {
    s = s * 1103515245 + 12345;
    out.push(AMENITY_POOL[s % AMENITY_POOL.length]);
  }
  return [...new Set(out)];
}

function buildRecord(id, mode) {
  const seed = id * 17;
  const loc = LOCATIONS[hashPick(seed, LOCATIONS.length)];
  const type = TYPES[hashPick(seed + 1, TYPES.length)];
  const imgIdx = hashPick(seed + 2, PROPERTY_IMAGES.length);
  const main = PROPERTY_IMAGES[imgIdx];
  const gallery = [
    PROPERTY_IMAGES[(imgIdx + 1) % PROPERTY_IMAGES.length],
    PROPERTY_IMAGES[(imgIdx + 3) % PROPERTY_IMAGES.length],
    PROPERTY_IMAGES[(imgIdx + 5) % PROPERTY_IMAGES.length],
  ];

  const bedrooms = 1 + hashPick(seed + 3, 5);
  const bathrooms = 1 + hashPick(seed + 4, Math.min(4, bedrooms));
  const sqft = 650 + hashPick(seed + 5, 3900);
  const parking = 1 + hashPick(seed + 6, 3);
  const year_built = 2008 + hashPick(seed + 7, 17);
  const furnished = FURNISHED[hashPick(seed + 8, FURNISHED.length)];
  const pet_friendly = hashPick(seed + 9, 2) === 1;
  const rating = Math.round((35 + hashPick(seed + 10, 15)) / 10 * 10) / 10;
  const featured = id % 7 === 0;

  const salePrice = 48000 + hashPick(seed + 11, 332000);
  const rentPrice = 280 + hashPick(seed + 12, 1920);

  const title =
    mode === "sale"
      ? `${type} with skyline views — ${loc}`
      : `Monthly rental · ${type} near ${loc}`;

  return {
    id,
    title,
    location: `${loc}, Bahrain`,
    price: mode === "sale" ? salePrice : rentPrice,
    bedrooms,
    bathrooms,
    sqft,
    parking,
    image: main,
    images: gallery,
    rating,
    featured,
    type,
    year_built,
    furnished,
    pet_friendly,
    description: `${type} in ${loc}. Bright layout, quality finishes, and strong natural light — ideal for ${mode === "sale" ? "buyers" : "tenants"} exploring Bahrain.`,
    amenities: pickAmenities(seed),
    agent_name: "Wealth Home Advisors",
    agent_phone: "+973 1700 " + String(2000 + hashPick(seed, 899)).padStart(4, "0"),
    agent_email: `listings${id}@wealthhome.demo`,
    address: `Building ${100 + id}, Road ${hashPick(seed + 13, 40)}, ${loc}`,
  };
}

const SALE_COUNT = 48;
const RENT_COUNT = 48;

export const DUMMY_SALE_PROPERTIES = Array.from({ length: SALE_COUNT }, (_, i) =>
  buildRecord(i + 1, "sale")
);

export const DUMMY_RENT_PROPERTIES = Array.from({ length: RENT_COUNT }, (_, i) =>
  buildRecord(i + 101, "rent")
);
