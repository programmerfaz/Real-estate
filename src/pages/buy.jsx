import React, { useEffect, useState } from "react";
import { MapPin, Bed, Bath, Square, Car, Star, TrendingUp, Award, Users, LogOut, Menu, Home as HomeIcon, Filter, X, Search, Grid3X3, List, SortAsc, Bookmark, Share2, Eye, Calendar, DollarSign } from "lucide-react";
import SearchBar from '../components/SearchBar';
import PropertyCard from "../components/PropertyCard";
import { Link } from "react-router-dom";
import { supabase } from "../supabase";
import { useNavigate } from 'react-router-dom';
import { auth } from "../firebase";

const formatPrice = (price) => `$${price.toLocaleString()}`;

const Buy = ({ viewMode }) => {
    const [userEmail, setUserEmail] = useState(null);
    const [isFilterOpen, setIsFilterOpen] = useState(false);
    const [menuOpen, setMenuOpen] = useState(false);
    const [favourites, setFavourites] = useState([]);
    const [searchQuery, setSearchQuery] = useState('');
    const [sortBy, setSortBy] = useState('newest');
    const [viewType, setViewType] = useState('grid');
    const [isLoading, setIsLoading] = useState(false);
    const [savedSearches, setSavedSearches] = useState([]);
    const [showSaveSearch, setShowSaveSearch] = useState(false);
    const [recentlyViewed, setRecentlyViewed] = useState([]);

    const handleLogout = () => {
        localStorage.removeItem('userEmail');
        navigate('/login');
    };

    useEffect(() => {
        const unsubscribe = auth.onAuthStateChanged((user) => {
            if (user) {
                setUserEmail(user.email);
                const fetchFavourites = async () => {
                    const { data, error } = await supabase
                        .from('favourites')
                        .select('property_id')
                        .eq('user_email', user.email);

                    if (!error) {
                        const ids = data.map((fav) => fav.property_id);
                        setFavourites(ids);
                    } else {
                        console.error('Error fetching favourites:', error.message);
                    }
                };
                fetchFavourites();
                
                // Load recently viewed from localStorage
                const viewed = JSON.parse(localStorage.getItem(`recentlyViewed_${user.email}`) || '[]');
                setRecentlyViewed(viewed);
            } else {
                setUserEmail(null);
                setFavourites([]);
            }
        });

        return () => unsubscribe();
    }, []);

    const [allProperties, setAllProperties] = useState([]);
    const [visibleProperties, setVisibleProperties] = useState(12);
    const [selectedLocations, setSelectedLocations] = useState([]);
    const [selectedPriceRange, setSelectedPriceRange] = useState("");
    const [customPriceRange, setCustomPriceRange] = useState({ min: 20000, max: 200000 });
    const [selectedBedrooms, setSelectedBedrooms] = useState("Any");
    const [selectedBathrooms, setSelectedBathrooms] = useState("Any");
    const [selectedYearBuilt, setSelectedYearBuilt] = useState("Any");
    const [furnishedValue, setFurnishedValue] = useState('');
    const [selectedAmenities, setSelectedAmenities] = useState([]);

    const navigate = useNavigate();

    // Enhanced property fetching with search and sort
    useEffect(() => {
        const fetchProperties = async () => {
            setIsLoading(true);
            let query = supabase.from("properties").select("*");

            // Search functionality
            if (searchQuery.trim()) {
                query = query.or(`title.ilike.%${searchQuery}%,location.ilike.%${searchQuery}%,description.ilike.%${searchQuery}%`);
            }

            // Location filter
            if (selectedLocations.length > 0) {
                const orFilter = selectedLocations
                    .map((loc) => `location.ilike.%${loc}%`)
                    .join(",");
                query = query.or(orFilter);
            }

            // Price filter
            if (selectedPriceRange) {
                if (selectedPriceRange === "below50k") {
                    query = query.lt("price", 50000);
                } else if (selectedPriceRange === "50k-150k") {
                    query = query.gte("price", 50000).lte("price", 150000);
                } else if (selectedPriceRange === "above150k") {
                    query = query.gt("price", 150000);
                } else if (selectedPriceRange === "custom") {
                    query = query.gte("price", customPriceRange.min).lte("price", customPriceRange.max);
                }
            }

            // Other filters
            if (selectedBedrooms !== "Any") {
                const minBedrooms = parseInt(selectedBedrooms);
                if (!isNaN(minBedrooms)) {
                    query = query.gte("bedrooms", minBedrooms);
                }
            }
            if (selectedBathrooms !== "Any") {
                const minBathrooms = parseInt(selectedBathrooms);
                if (!isNaN(minBathrooms)) {
                    query = query.gte("bathrooms", minBathrooms);
                }
            }
            if (selectedYearBuilt === "2020+") {
                query = query.gte("year_built", 2020);
            } else if (selectedYearBuilt === "Before 2020") {
                query = query.lt("year_built", 2020);
            } else if (selectedYearBuilt !== "Any") {
                const minYearBuilt = parseInt(selectedYearBuilt);
                if (!isNaN(minYearBuilt)) {
                    query = query.eq("year_built", minYearBuilt);
                }
            }

            if (furnishedValue) {
                query = query.ilike('furnished', `%${furnishedValue}%`);
            }

            if (selectedAmenities.length > 0) {
                query = query.contains("amenities", selectedAmenities);
            }

            // Sorting
            switch (sortBy) {
                case 'price-low':
                    query = query.order('price', { ascending: true });
                    break;
                case 'price-high':
                    query = query.order('price', { ascending: false });
                    break;
                case 'bedrooms':
                    query = query.order('bedrooms', { ascending: false });
                    break;
                case 'newest':
                default:
                    query = query.order('created_at', { ascending: false });
                    break;
            }

            const { data, error } = await query;

            if (error) {
                console.error("Error fetching properties:", error.message);
            } else {
                setAllProperties(data);
            }
            setIsLoading(false);
        };

        fetchProperties();
    }, [selectedLocations, selectedPriceRange, customPriceRange, selectedBedrooms, selectedBathrooms, selectedYearBuilt, furnishedValue, selectedAmenities, searchQuery, sortBy]);

    const clearAllFilters = () => {
        setSelectedLocations([]);
        setSelectedPriceRange('');
        setCustomPriceRange({ min: 20000, max: 200000 });
        setSelectedBedrooms('Any');
        setSelectedBathrooms('Any');
        setSelectedYearBuilt('Any');
        setFurnishedValue('');
        setSelectedAmenities([]);
        setSearchQuery('');
    };

    const toggleAmenity = (amenity) => {
        setSelectedAmenities((prev) =>
            prev.includes(amenity)
                ? prev.filter((a) => a !== amenity)
                : [...prev, amenity]
        );
    };

    const handleLoadMore = () => {
        setVisibleProperties((prev) => prev + 12);
    };

    const handleLocationChange = (e) => {
        const { value, checked } = e.target;
        setSelectedLocations((prev) =>
            checked ? [...prev, value] : prev.filter((loc) => loc !== value)
        );
    };

    const toggleFavourite = async (propertyId) => {
        if (!userEmail) return;

        const isFavourite = favourites.includes(propertyId);

        if (isFavourite) {
            const { error } = await supabase
                .from('favourites')
                .delete()
                .eq('user_email', userEmail)
                .eq('property_id', propertyId);

            if (!error) {
                setFavourites(favourites.filter((id) => id !== propertyId));
            }
        } else {
            const { error } = await supabase.from('favourites').insert([
                { user_email: userEmail, property_id: propertyId },
            ]);

            if (!error) {
                setFavourites([...favourites, propertyId]);
            }
        }
    };

    const saveCurrentSearch = async () => {
        if (!userEmail) return;
        
        const searchData = {
            user_email: userEmail,
            search_name: `Search ${new Date().toLocaleDateString()}`,
            filters: {
                locations: selectedLocations,
                priceRange: selectedPriceRange,
                customPriceRange,
                bedrooms: selectedBedrooms,
                bathrooms: selectedBathrooms,
                yearBuilt: selectedYearBuilt,
                furnished: furnishedValue,
                amenities: selectedAmenities,
                searchQuery
            }
        };

        const { error } = await supabase.from('saved_searches').insert([searchData]);
        if (!error) {
            setShowSaveSearch(false);
            // Refresh saved searches
        }
    };

    const trackPropertyView = (propertyId) => {
        if (!userEmail) return;
        
        const viewed = JSON.parse(localStorage.getItem(`recentlyViewed_${userEmail}`) || '[]');
        const updatedViewed = [propertyId, ...viewed.filter(id => id !== propertyId)].slice(0, 10);
        localStorage.setItem(`recentlyViewed_${userEmail}`, JSON.stringify(updatedViewed));
        setRecentlyViewed(updatedViewed);
    };

    const getActiveFiltersCount = () => {
        let count = 0;
        if (selectedLocations.length > 0) count++;
        if (selectedPriceRange) count++;
        if (selectedBedrooms !== "Any") count++;
        if (selectedBathrooms !== "Any") count++;
        if (selectedYearBuilt !== "Any") count++;
        if (furnishedValue) count++;
        if (selectedAmenities.length > 0) count++;
        if (searchQuery.trim()) count++;
        return count;
    };

    return (
        <>
            <header className="bg-white shadow-sm border-b border-gray-100 sticky top-0 z-40">
                <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
                    <div className="flex justify-between items-center py-4">
                        <div className="flex items-center gap-2">
                            <div className="w-10 h-10 bg-blue-600 rounded-lg flex items-center justify-center">
                                <HomeIcon className="w-6 h-6 text-white" />
                            </div>
                            <span className="text-xl font-bold text-gray-900">Wealth Home</span>
                        </div>

                        <nav className="hidden md:flex items-center gap-8">
                            <a href="./Home" className="text-gray-600 hover:text-blue-600 font-medium">Properties</a>
                            <a href="./Buy" className="text-blue-600 font-medium border-b-2 border-blue-600 pb-1">Buy</a>
                            <a href="./Rent" className="text-gray-600 hover:text-blue-600 font-medium">Rent</a>
                            <a href="./AIHelp" className="text-gray-600 hover:text-blue-600 font-medium">AI Help</a>
                            <a href="./About" className="text-gray-600 hover:text-blue-600 font-medium">About</a>
                        </nav>

                        <button
                            onClick={() => setMenuOpen(!menuOpen)}
                            className="md:hidden text-gray-700 focus:outline-none"
                        >
                            {menuOpen ? <X className="w-6 h-6" /> : <Menu className="w-6 h-6" />}
                        </button>

                        <div className="hidden md:flex items-center gap-4">
                            <Link to="/Favourites">
                                <button className="bg-blue-600 text-white px-4 py-2 rounded-lg hover:bg-blue-700 transition-colors">
                                    My Favourites
                                </button>
                            </Link>
                            {userEmail ? (
                                <>
                                    <span className="text-sm text-gray-600">Welcome, {userEmail.split('@')[0]}</span>
                                    <LogOut
                                        onClick={handleLogout}
                                        className="w-5 h-5 text-red-600 hover:text-red-800 cursor-pointer"
                                    />
                                </>
                            ) : (
                                <button className="text-gray-600 hover:text-blue-600 font-medium">Sign In</button>
                            )}
                        </div>
                    </div>

                    {menuOpen && (
                        <div className="md:hidden bg-white border-t border-gray-200 pt-4 pb-4 space-y-2">
                            <a href="./Home" className="block px-4 text-gray-600 hover:text-blue-600 font-medium">Properties</a>
                            <a href="./Buy" className="block px-4 text-blue-600 font-medium">Buy</a>
                            <a href="./Rent" className="block px-4 text-gray-600 hover:text-blue-600 font-medium">Rent</a>
                            <a href="./AIHelp" className="block px-4 text-gray-600 hover:text-blue-600 font-medium">AI Help</a>
                            <a href="./About" className="block px-4 text-gray-600 hover:text-blue-600 font-medium">About</a>
                            <Link to="/Favourites">
                                <div className="px-4">
                                    <button className="mt-2 w-full bg-blue-600 text-white py-2 rounded-lg hover:bg-blue-700 transition-colors">
                                        My Favourites
                                    </button>
                                </div>
                            </Link>
                            {userEmail ? (
                                <div className="px-4 flex items-center justify-between mt-2">
                                    <span className="text-sm text-gray-600">Welcome, {userEmail.split('@')[0]}</span>
                                    <LogOut
                                        onClick={handleLogout}
                                        className="w-5 h-5 text-red-600 hover:text-red-800 cursor-pointer"
                                    />
                                </div>
                            ) : (
                                <div className="px-4">
                                    <button className="text-gray-600 hover:text-blue-600 font-medium">Sign In</button>
                                </div>
                            )}
                        </div>
                    )}
                </div>
            </header>

            {/* Enhanced Search Bar */}
            <div className="bg-white border-b border-gray-200 py-4">
                <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
                    <div className="flex flex-col lg:flex-row gap-4 items-center">
                        <div className="relative flex-1 max-w-2xl">
                            <Search className="absolute left-4 top-1/2 transform -translate-y-1/2 text-gray-400 w-5 h-5" />
                            <input
                                type="text"
                                placeholder="Search by title, location, or description..."
                                value={searchQuery}
                                onChange={(e) => setSearchQuery(e.target.value)}
                                className="w-full pl-12 pr-4 py-3 border border-gray-300 rounded-xl focus:ring-2 focus:ring-blue-500 focus:border-transparent text-lg"
                            />
                        </div>
                        
                        <div className="flex items-center gap-3">
                            <select
                                value={sortBy}
                                onChange={(e) => setSortBy(e.target.value)}
                                className="px-4 py-3 border border-gray-300 rounded-xl focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                            >
                                <option value="newest">Newest First</option>
                                <option value="price-low">Price: Low to High</option>
                                <option value="price-high">Price: High to Low</option>
                                <option value="bedrooms">Most Bedrooms</option>
                            </select>

                            <div className="flex bg-gray-100 rounded-xl p-1">
                                <button
                                    onClick={() => setViewType('grid')}
                                    className={`flex items-center px-3 py-2 rounded-lg transition-colors ${
                                        viewType === 'grid' ? 'bg-white shadow-sm text-blue-600' : 'text-gray-600'
                                    }`}
                                >
                                    <Grid3X3 className="w-4 h-4 mr-1" />
                                    Grid
                                </button>
                                <button
                                    onClick={() => setViewType('list')}
                                    className={`flex items-center px-3 py-2 rounded-lg transition-colors ${
                                        viewType === 'list' ? 'bg-white shadow-sm text-blue-600' : 'text-gray-600'
                                    }`}
                                >
                                    <List className="w-4 h-4 mr-1" />
                                    List
                                </button>
                            </div>
                        </div>
                    </div>
                </div>
            </div>

            <div className="flex h-screen">
                {/* Enhanced Filter Sidebar */}
                <aside className={`w-80 bg-white shadow-lg border-r border-gray-200 overflow-y-auto transition-transform duration-300 ease-in-out
                                   lg:translate-x-0 lg:static lg:block
                                   ${isFilterOpen ? 'translate-x-0' : '-translate-x-full'} 
                                   fixed inset-y-0 left-0 z-50 lg:z-auto`}>
                    <div className="lg:hidden flex justify-end p-4">
                        <button
                            onClick={() => setIsFilterOpen(false)}
                            className="p-2 rounded-md text-gray-500 hover:text-gray-700 hover:bg-gray-100"
                        >
                            <X className="w-6 h-6" />
                        </button>
                    </div>
                    
                    <div className="p-6">
                        <div className="flex justify-between items-center mb-6">
                            <h2 className="text-xl font-semibold text-gray-800">
                                Filters {getActiveFiltersCount() > 0 && (
                                    <span className="ml-2 bg-blue-100 text-blue-800 text-sm px-2 py-1 rounded-full">
                                        {getActiveFiltersCount()}
                                    </span>
                                )}
                            </h2>
                            <div className="flex gap-2">
                                <button
                                    onClick={() => setShowSaveSearch(true)}
                                    className="text-blue-600 text-sm font-medium hover:text-blue-800 transition-colors cursor-pointer"
                                    disabled={!userEmail}
                                >
                                    <Bookmark className="w-4 h-4" />
                                </button>
                                <button
                                    className="text-blue-600 text-sm font-medium hover:text-blue-800 transition-colors cursor-pointer"
                                    onClick={clearAllFilters}
                                >
                                    Clear all
                                </button>
                            </div>
                        </div>

                        {/* Quick Stats */}
                        <div className="mb-6 p-4 bg-blue-50 rounded-xl">
                            <div className="text-sm text-blue-600 mb-1">Properties Found</div>
                            <div className="text-2xl font-bold text-blue-800">{allProperties.length}</div>
                            {allProperties.length > 0 && (
                                <div className="text-xs text-blue-600 mt-1">
                                    Avg. Price: {formatPrice(allProperties.reduce((sum, p) => sum + p.price, 0) / allProperties.length)}
                                </div>
                            )}
                        </div>

                        {/* Location */}
                        <div className="mb-6">
                            <h3 className="font-medium mb-3 text-gray-700">Location</h3>
                            <div className="space-y-2">
                                {["Amwaj Islands", "Riffa", "Manama", "Seef", "Juffair", "Budaiya", "Saar"].map((location) => (
                                    <label key={location} className="flex items-center">
                                        <input
                                            type="checkbox"
                                            value={location}
                                            onChange={handleLocationChange}
                                            checked={selectedLocations.includes(location)}
                                            className="mr-3 h-4 w-4 text-blue-600 focus:ring-blue-500 border-gray-300 rounded"
                                        />
                                        <span className="text-gray-700">{location}</span>
                                    </label>
                                ))}
                            </div>
                        </div>

                        {/* Price Range */}
                        <div className="mb-6">
                            <h3 className="font-medium mb-3 text-gray-700">Price Range (BHD)</h3>
                            <div className="space-y-2">
                                <label className="flex items-center">
                                    <input
                                        type="radio"
                                        name="price"
                                        value="below50k"
                                        className="mr-3 h-4 w-4 text-blue-600 focus:ring-blue-500"
                                        checked={selectedPriceRange === "below50k"}
                                        onChange={(e) => setSelectedPriceRange(e.target.value)}
                                    />
                                    <span className="text-gray-700">Below BHD 50K</span>
                                </label>

                                <label className="flex items-center">
                                    <input
                                        type="radio"
                                        name="price"
                                        value="50k-150k"
                                        className="mr-3 h-4 w-4 text-blue-600 focus:ring-blue-500"
                                        checked={selectedPriceRange === "50k-150k"}
                                        onChange={(e) => setSelectedPriceRange(e.target.value)}
                                    />
                                    <span className="text-gray-700">BHD 50K - BHD 150K</span>
                                </label>

                                <label className="flex items-center">
                                    <input
                                        type="radio"
                                        name="price"
                                        value="above150k"
                                        className="mr-3 h-4 w-4 text-blue-600 focus:ring-blue-500"
                                        checked={selectedPriceRange === "above150k"}
                                        onChange={(e) => setSelectedPriceRange(e.target.value)}
                                    />
                                    <span className="text-gray-700">Above BHD 150K</span>
                                </label>

                                <label className="flex items-center">
                                    <input
                                        type="radio"
                                        name="price"
                                        value="custom"
                                        className="mr-3 h-4 w-4 text-blue-600 focus:ring-blue-500"
                                        checked={selectedPriceRange === "custom"}
                                        onChange={(e) => setSelectedPriceRange(e.target.value)}
                                    />
                                    <span className="text-gray-700">Custom Range</span>
                                </label>
                            </div>

                            {selectedPriceRange === "custom" && (
                                <div className="mt-4 p-4 bg-gray-50 rounded-lg">
                                    <div className="flex justify-between mb-3 text-sm font-medium text-gray-600">
                                        <label>Min: BHD {customPriceRange.min.toLocaleString()}</label>
                                        <label>Max: BHD {customPriceRange.max.toLocaleString()}</label>
                                    </div>

                                    <div className="relative h-8">
                                        <input
                                            type="range"
                                            min={0}
                                            max={200000}
                                            step={1000}
                                            value={customPriceRange.min}
                                            onChange={(e) => {
                                                const value = Math.min(Number(e.target.value), customPriceRange.max - 1000);
                                                setCustomPriceRange((prev) => ({
                                                    ...prev,
                                                    min: value,
                                                }));
                                            }}
                                            className="absolute w-full top-2 pointer-events-auto appearance-none h-3 bg-transparent"
                                            style={{ zIndex: 3 }}
                                        />

                                        <input
                                            type="range"
                                            min={0}
                                            max={200000}
                                            step={1000}
                                            value={customPriceRange.max}
                                            onChange={(e) => {
                                                const value = Math.max(Number(e.target.value), customPriceRange.min + 1000);
                                                setCustomPriceRange((prev) => ({
                                                    ...prev,
                                                    max: value,
                                                }));
                                            }}
                                            className="absolute w-full top-8 pointer-events-auto appearance-none h-3 bg-transparent"
                                            style={{ zIndex: 2 }}
                                        />

                                        <div className="absolute top-4 left-0 right-0 h-1 bg-gray-300 rounded"></div>

                                        <div
                                            className="absolute top-4 h-1 bg-blue-500 rounded"
                                            style={{
                                                left: `${(customPriceRange.min / 200000) * 100}%`,
                                                right: `${100 - (customPriceRange.max / 200000) * 100}%`,
                                            }}
                                        />
                                    </div>
                                </div>
                            )}
                        </div>

                        {/* Bedrooms */}
                        <div className="mb-6">
                            <h3 className="font-medium mb-3 text-gray-700">Bedrooms</h3>
                            <select
                                className="w-full border border-gray-300 rounded-lg px-3 py-2 text-gray-700
                                           focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500
                                           transition duration-200 ease-in-out hover:border-blue-400 cursor-pointer"
                                value={selectedBedrooms}
                                onChange={(e) => setSelectedBedrooms(e.target.value)}
                            >
                                <option>Any</option>
                                <option>1+</option>
                                <option>2+</option>
                                <option>3+</option>
                                <option>4+</option>
                                <option>5+</option>
                            </select>
                        </div>

                        {/* Bathrooms */}
                        <div className="mb-6">
                            <h3 className="font-medium mb-3 text-gray-700">Bathrooms</h3>
                            <select
                                className="w-full border border-gray-300 rounded-lg px-3 py-2 text-gray-700
                                           focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500
                                           transition duration-200 ease-in-out hover:border-blue-400 cursor-pointer"
                                value={selectedBathrooms}
                                onChange={(e) => setSelectedBathrooms(e.target.value)}
                            >
                                <option>Any</option>
                                <option>1+</option>
                                <option>2+</option>
                                <option>3+</option>
                                <option>4+</option>
                            </select>
                        </div>

                        {/* Year Built */}
                        <div className="mb-6">
                            <h3 className="font-medium mb-3 text-gray-700">Year Built</h3>
                            <select
                                className="w-full border border-gray-300 rounded-lg px-3 py-2 text-gray-700
                                           focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500
                                           transition duration-200 ease-in-out hover:border-blue-400 cursor-pointer"
                                value={selectedYearBuilt}
                                onChange={(e) => setSelectedYearBuilt(e.target.value)}
                            >
                                <option>Any</option>
                                <option>2024</option>
                                <option>2023</option>
                                <option>2020+</option>
                                <option>Before 2020</option>
                            </select>
                        </div>

                        {/* Furnishing */}
                        <div className="mb-6">
                            <h3 className="font-medium mb-3 text-gray-700">Furnishing</h3>
                            <select
                                className="w-full border border-gray-300 rounded-lg px-3 py-2 text-gray-700
                                           focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500
                                           transition duration-200 ease-in-out hover:border-blue-400 cursor-pointer"
                                value={furnishedValue}
                                onChange={(e) => setFurnishedValue(e.target.value)}
                            >
                                <option value="">Any</option>
                                <option value="Unfurnished">Unfurnished</option>
                                <option value="Fully Furnished">Fully Furnished</option>
                                <option value="Furnished">Furnished</option>
                            </select>
                        </div>

                        {/* Amenities */}
                        <div className="mb-6">
                            <h3 className="font-medium mb-3 text-gray-700">Amenities</h3>
                            <div className="flex flex-wrap gap-2">
                                {["Private Beach", "Swimming Pool", "Gym", "Garage", "Garden", "Security", "WiFi", "Elevator", "Parking"].map((amenity) => {
                                    const isSelected = selectedAmenities.includes(amenity);
                                    return (
                                        <span
                                            key={amenity}
                                            onClick={() => toggleAmenity(amenity)}
                                            className={`px-3 py-2 rounded-full text-sm cursor-pointer transition duration-200 border
                                                        ${isSelected
                                                    ? 'bg-blue-100 text-blue-700 border-blue-300'
                                                    : 'bg-gray-50 text-gray-600 border-gray-200 hover:bg-blue-50 hover:text-blue-600 hover:border-blue-200'
                                                }`}
                                        >
                                            {amenity}
                                        </span>
                                    );
                                })}
                            </div>
                        </div>
                    </div>
                </aside>

                {/* Overlay for mobile */}
                {isFilterOpen && (
                    <div
                        className="fixed inset-0 bg-black bg-opacity-50 z-40 lg:hidden"
                        onClick={() => setIsFilterOpen(false)}
                    ></div>
                )}

                {/* Main Property Grid */}
                <main className="flex-1 overflow-y-auto bg-gray-50">
                    <div className="p-6">
                        {/* Mobile filter button and results summary */}
                        <div className="flex justify-between items-center mb-6">
                            <div className="lg:hidden">
                                <button
                                    onClick={() => setIsFilterOpen(true)}
                                    className="flex items-center gap-2 bg-blue-600 text-white px-4 py-2 rounded-lg hover:bg-blue-700 transition-colors"
                                >
                                    <Filter className="w-4 h-4" />
                                    Filters
                                    {getActiveFiltersCount() > 0 && (
                                        <span className="bg-blue-800 text-white text-xs px-2 py-1 rounded-full">
                                            {getActiveFiltersCount()}
                                        </span>
                                    )}
                                </button>
                            </div>

                            <div className="text-sm text-gray-600">
                                {isLoading ? (
                                    <div className="flex items-center gap-2">
                                        <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-blue-600"></div>
                                        Searching...
                                    </div>
                                ) : (
                                    `Showing ${Math.min(visibleProperties, allProperties.length)} of ${allProperties.length} properties`
                                )}
                            </div>
                        </div>

                        {/* Recently Viewed (if user is logged in and has viewed properties) */}
                        {userEmail && recentlyViewed.length > 0 && (
                            <div className="mb-8">
                                <h3 className="text-lg font-semibold mb-4 flex items-center gap-2">
                                    <Eye className="w-5 h-5 text-blue-600" />
                                    Recently Viewed
                                </h3>
                                <div className="flex gap-4 overflow-x-auto pb-2">
                                    {recentlyViewed.slice(0, 5).map((propertyId) => {
                                        const property = allProperties.find(p => p.id === propertyId);
                                        if (!property) return null;
                                        return (
                                            <div key={propertyId} className="flex-shrink-0 w-48 bg-white rounded-lg shadow-sm border p-3">
                                                <img src={property.image} alt={property.title} className="w-full h-24 object-cover rounded mb-2" />
                                                <h4 className="font-medium text-sm truncate">{property.title}</h4>
                                                <p className="text-blue-600 font-semibold text-sm">{formatPrice(property.price)}</p>
                                            </div>
                                        );
                                    })}
                                </div>
                            </div>
                        )}

                        {/* Properties Grid/List */}
                        {allProperties.length === 0 && !isLoading ? (
                            <div className="text-center py-12">
                                <div className="text-gray-400 mb-4">
                                    <HomeIcon className="w-16 h-16 mx-auto" />
                                </div>
                                <h3 className="text-xl font-semibold text-gray-600 mb-2">No properties found</h3>
                                <p className="text-gray-500 mb-4">Try adjusting your search criteria or filters</p>
                                <button
                                    onClick={clearAllFilters}
                                    className="bg-blue-600 text-white px-6 py-2 rounded-lg hover:bg-blue-700 transition-colors"
                                >
                                    Clear All Filters
                                </button>
                            </div>
                        ) : (
                            <div className={viewType === 'grid' 
                                ? "grid grid-cols-1 lg:grid-cols-2 xl:grid-cols-3 gap-6" 
                                : "space-y-4"
                            }>
                                {allProperties.slice(0, visibleProperties).map((property) => (
                                    <div key={property.id} onClick={() => trackPropertyView(property.id)}>
                                        <PropertyCard
                                            {...property}
                                            formatPrice={formatPrice}
                                            isFavourite={favourites.includes(property.id)}
                                            toggleFavourite={() => toggleFavourite(property.id)}
                                            viewType={viewType}
                                        />
                                    </div>
                                ))}
                            </div>
                        )}

                        {/* Load More Button */}
                        {visibleProperties < allProperties.length && (
                            <div className="flex justify-center mt-8">
                                <button
                                    onClick={handleLoadMore}
                                    className="bg-blue-600 text-white px-8 py-3 rounded-lg shadow-md hover:bg-blue-700 
                                               transition-colors font-medium flex items-center gap-2"
                                >
                                    Load More Properties
                                    <span className="bg-blue-700 text-white text-sm px-2 py-1 rounded-full">
                                        +{Math.min(12, allProperties.length - visibleProperties)}
                                    </span>
                                </button>
                            </div>
                        )}
                    </div>
                </main>
            </div>

            {/* Save Search Modal */}
            {showSaveSearch && (
                <div className="fixed inset-0 bg-black bg-opacity-50 z-50 flex items-center justify-center p-4">
                    <div className="bg-white rounded-xl p-6 max-w-md w-full">
                        <h3 className="text-lg font-semibold mb-4">Save This Search</h3>
                        <p className="text-gray-600 mb-4">
                            Save your current search criteria to get notified when new matching properties are available.
                        </p>
                        <div className="flex gap-3">
                            <button
                                onClick={saveCurrentSearch}
                                className="flex-1 bg-blue-600 text-white py-2 px-4 rounded-lg hover:bg-blue-700 transition-colors"
                            >
                                Save Search
                            </button>
                            <button
                                onClick={() => setShowSaveSearch(false)}
                                className="flex-1 border border-gray-300 text-gray-700 py-2 px-4 rounded-lg hover:bg-gray-50 transition-colors"
                            >
                                Cancel
                            </button>
                        </div>
                    </div>
                </div>
            )}
        </>
    );
};

export default Buy;