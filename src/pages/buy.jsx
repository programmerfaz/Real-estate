import React, { useEffect, useState } from "react";
import { MapPin, Bed, Bath, Square, Car, Star, TrendingUp, Award, Users, LogOut, Menu, Home as HomeIcon, Filter, X } from "lucide-react";
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

    const handleLogout = () => {
        // Clear user session (adjust based on how you store auth info)
        localStorage.removeItem('userEmail');
        // Redirect to sign-in
        navigate('/login');
    };

    // Mock auth state for demonstration    
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
            } else {
                setUserEmail(null);
                setFavourites([]); // clear on logout
            }
        });

        return () => unsubscribe();
    }, []);

    useEffect(() => {
        const fetchFavourites = async () => {
            if (!userEmail) return;

            const { data, error } = await supabase
                .from("favourites")
                .select("property_id")
                .eq("user_email", userEmail);

            if (error) {
                console.error("Error fetching favourites:", error.message);
            } else {
                const favouriteIds = data.map((fav) => fav.property_id);
                setFavourites(favouriteIds);
            }
        };

        fetchFavourites();
    }, [userEmail]);



    const [allProperties, setAllProperties] = useState([]);
    const [visibleProperties, setVisibleProperties] = useState(6);
    const [selectedLocations, setSelectedLocations] = useState([]);
    const [selectedPriceRange, setSelectedPriceRange] = useState("");
    // values: "below50k", "50k-150k", "above150k", "custom"
    const [customPriceRange, setCustomPriceRange] = useState({ min: 20000, max: 200000 });
    const [selectedBedrooms, setSelectedBedrooms] = useState("Any");
    const [selectedBathrooms, setSelectedBathrooms] = useState("Any");
    const [selectedYearBuilt, setSelectedYearBuilt] = useState("Any");
    const [furnishedValue, setFurnishedValue] = useState('');
    const [selectedAmenities, setSelectedAmenities] = useState([]);




    useEffect(() => {
        const fetchProperties = async () => {
            let query = supabase.from("properties").select("*");

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

            // Bedrooms filter
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



            const { data, error } = await query;

            if (error) {
                console.error("Error fetching properties:", error.message);
            } else {
                setAllProperties(data);
            }
        };

        fetchProperties();
    }, [selectedLocations,
        selectedPriceRange,
        customPriceRange,
        selectedBedrooms,
        selectedBathrooms,
        selectedYearBuilt,
        furnishedValue,
        selectedAmenities
    ]);

    const navigate = useNavigate();

    const clearAllFilters = () => {
        setSelectedLocations([]);
        setSelectedPriceRange('');
        setCustomPriceRange({ min: 20000, max: 200000 });
        setSelectedBedrooms('Any');
        setSelectedBathrooms('Any');
        setSelectedYearBuilt('Any');
        setFurnishedValue('');
        setSelectedAmenities([]);
    };


    const toggleAmenity = (amenity) => {
        setSelectedAmenities((prev) =>
            prev.includes(amenity)
                ? prev.filter((a) => a !== amenity)
                : [...prev, amenity]
        );
    };

    const handleLoadMore = () => {
        setVisibleProperties((prev) => prev + 6);
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





    return (
        <>
            <header className="bg-white shadow-sm border-b border-gray-100">
                <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
                    <div className="flex justify-between items-center py-4">
                        {/* Logo */}
                        <div className="flex items-center gap-2">
                            <div className="w-10 h-10 bg-blue-600 rounded-lg flex items-center justify-center">
                                <HomeIcon className="w-6 h-6 text-white" />
                            </div>
                            <span className="text-xl font-bold text-gray-900">Wealth Home</span>
                        </div>

                        {/* Desktop Nav */}
                        <nav className="hidden md:flex items-center gap-8">
                            <a href="./Home" className="text-gray-600 hover:text-blue-600 font-medium">Properties</a>
                            <a href="./Buy" className="text-gray-600 hover:text-blue-600 font-medium">Buy</a>
                            <a href="./Rent" className="text-gray-600 hover:text-blue-600 font-medium">Rent</a>
                            <a href="./AIHelp" className="text-gray-600 hover:text-blue-600 font-medium">AI Help</a>
                            <a href="./About" className="text-gray-600 hover:text-blue-600 font-medium">About</a>
                        </nav>

                        {/* Mobile menu toggle */}
                        <button
                            onClick={() => setMenuOpen(!menuOpen)}
                            className="md:hidden text-gray-700 focus:outline-none"
                        >
                            {menuOpen ? <X className="w-6 h-6" /> : <Menu className="w-6 h-6" />}
                        </button>

                        {/* Right section */}
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

                    {/* Mobile dropdown */}
                    {menuOpen && (
                        <div className="md:hidden bg-white border-t border-gray-200 pt-4 pb-4 space-y-2">
                            <a href="./Home" className="block px-4 text-gray-600 hover:text-blue-600 font-medium">Properties</a>
                            <a href="./Buy" className="block px-4 text-gray-600 hover:text-blue-600 font-medium">Buy</a>
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

            <div className="flex h-screen">
                {/* Filter Sidebar - Fixed position with responsive visibility */}
                <aside className={`w-80 bg-white shadow-lg border-r border-gray-200 overflow-y-auto transition-transform duration-300 ease-in-out
                                   lg:translate-x-0 lg:static lg:block
                                   ${isFilterOpen ? 'translate-x-0' : '-translate-x-full'} 
                                   fixed inset-y-0 left-0 z-50 lg:z-auto`}>
                    {/* Mobile close button */}
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
                            <h2 className="text-xl font-semibold text-gray-800">Custom Filter</h2>
                            <button
                                className="text-blue-600 text-sm font-medium hover:text-blue-800 transition-colors cursor-pointer"
                                onClick={clearAllFilters}
                            >
                                Clear all
                            </button>
                        </div>

                        {/* Location */}
                        <div className="mb-6">
                            <h3 className="font-medium mb-3 text-gray-700">Location</h3>
                            <div className="space-y-2">
                                {["Amwaj Islands", "Riffa", "Manama", "Seef"].map((location) => (
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
                                    <span className="text-gray-700">Custom</span>
                                </label>
                            </div>

                            {/* Show custom slider only if "custom" is selected */}
                            {selectedPriceRange === "custom" && (
                                <div className="mt-4 p-4 bg-gray-50 rounded-lg">
                                    <div className="flex justify-between mb-3 text-sm font-medium text-gray-600">
                                        <label>Min: BHD {customPriceRange.min.toLocaleString()}</label>
                                        <label>Max: BHD {customPriceRange.max.toLocaleString()}</label>
                                    </div>

                                    <div className="relative h-8">
                                        {/* Min slider */}
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

                                        {/* Max slider */}
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

                                        {/* Slider track background */}
                                        <div className="absolute top-4 left-0 right-0 h-1 bg-gray-300 rounded"></div>

                                        {/* Selected range highlight */}
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

                {/* Main Property Grid - Scrollable content */}
                <main className="flex-1 overflow-y-auto bg-gray-50">
                    <div className="p-6">
                        {/* Mobile filter button */}
                        <div className="lg:hidden mb-4">
                            <button
                                onClick={() => setIsFilterOpen(true)}
                                className="flex items-center gap-2 bg-blue-600 text-white px-4 py-2 rounded-lg hover:bg-blue-700 transition-colors"
                            >
                                <Filter className="w-4 h-4" />
                                Filters
                            </button>
                        </div>

                        <h1 className="text-3xl font-bold mb-6 text-gray-800">
                            {viewMode === "buy" ? "Buy Properties" : "Rent Properties"}
                        </h1>

                        <div className="grid grid-cols-1 lg:grid-cols-2 xl:grid-cols-3 gap-6">
                            {allProperties.slice(0, visibleProperties).map((property) => (
                                <PropertyCard
                                    key={property.id}
                                    {...property}
                                    formatPrice={formatPrice}
                                    isFavourite={favourites.includes(property.id)}
                                    toggleFavourite={() => toggleFavourite(property.id)}
                                />

                            ))}
                        </div>

                        {visibleProperties < allProperties.length && (
                            <div className="flex justify-center mt-8">
                                <button
                                    onClick={handleLoadMore}
                                    className="bg-blue-600 text-white px-8 py-3 rounded-lg shadow-md hover:bg-blue-700 
                                               transition-colors font-medium"
                                >
                                    Load More Properties
                                </button>
                            </div>
                        )}
                    </div>
                </main>
            </div>
        </>
    );
};

export default Buy;