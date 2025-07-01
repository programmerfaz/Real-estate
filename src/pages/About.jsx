import React, { useState } from "react";
import { Home as HomeIcon, Menu, X, LogOut } from "lucide-react";
import { Link } from "react-router-dom";

const About = () => {
    const [menuOpen, setMenuOpen] = useState(false);
    const userEmail = "user@example.com"; // mock
    const handleLogout = () => console.log("Logout clicked");

    return (
        <div className="bg-white text-gray-800">
            {/* Header */}
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
                            <a href="./About" className="text-blue-600 font-medium border-b-2 border-blue-600 pb-1">About</a>
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
                                    <LogOut onClick={handleLogout} className="w-5 h-5 text-red-600 hover:text-red-800 cursor-pointer" />
                                </>
                            ) : (
                                <button className="text-gray-600 hover:text-blue-600 font-medium">Sign In</button>
                            )}
                        </div>
                    </div>

                    {menuOpen && (
                        <div className="md:hidden bg-white border-t border-gray-200 pt-4 pb-4 space-y-2">
                            <a href="./Home" className="block px-4 text-gray-600 hover:text-blue-600 font-medium">Properties</a>
                            <a href="./Buy" className="block px-4 text-gray-600 hover:text-blue-600 font-medium">Buy</a>
                            <a href="./Rent" className="block px-4 text-gray-600 hover:text-blue-600 font-medium">Rent</a>
                            <a href="./AIHelp" className="block px-4 text-gray-600 hover:text-blue-600 font-medium">AI Help</a>
                            <a href="./About" className="block px-4 text-blue-600 font-medium">About</a>
                            <Link to="/Favourites">
                                <div className="px-4">
                                    <button className="mt-2 w-full bg-blue-600 text-white py-2 rounded-lg hover:bg-blue-700 transition-colors">My Favourites</button>
                                </div>
                            </Link>
                            {userEmail ? (
                                <div className="px-4 flex items-center justify-between mt-2">
                                    <span className="text-sm text-gray-600">Welcome, {userEmail.split('@')[0]}</span>
                                    <LogOut onClick={handleLogout} className="w-5 h-5 text-red-600 hover:text-red-800 cursor-pointer" />
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

            {/* Hero Section */}
            <section className="relative h-96 bg-cover bg-center" style={{ backgroundImage: "url('https://images.unsplash.com/photo-1600585154340-be6161a56a0c')" }}>
                <div className="absolute inset-0 bg-black bg-opacity-50 flex items-center justify-center">
                    <h1 className="text-white text-4xl md:text-5xl font-bold">About Us</h1>
                </div>
            </section>

            {/* Company Overview */}
            <section className="max-w-6xl mx-auto px-4 py-16">
                <h2 className="text-3xl font-bold mb-6">Our Story</h2>
                <p className="text-lg text-gray-700 leading-relaxed">
                    Welcome to Fazil Realty — your trusted partner in real estate across Bahrain. With a passion for property and a commitment to service, we’ve been helping individuals, families, and businesses find their perfect place since 2020.
                </p>
                <p className="mt-4 text-gray-700">
                    Whether you're buying, renting, or investing, we provide end-to-end guidance, from market analysis to closing deals.
                </p>
            </section>

            {/* Blog Section */}
            <section className="bg-gray-50 py-16">
                <div className="max-w-6xl mx-auto px-4">
                    <h2 className="text-3xl font-bold mb-10 text-center">Latest Blogs</h2>
                    <div className="grid md:grid-cols-3 gap-6">
                        {/* Blog 1 */}
                        <div className="bg-white rounded-xl shadow hover:shadow-md transition">
                            <img
                                src="https://images.pexels.com/photos/1396122/pexels-photo-1396122.jpeg?auto=compress&cs=tinysrgb&w=800"
                                alt="Trends"
                                className="rounded-t-xl w-full h-48 object-cover"
                            />
                            <div className="p-4">
                                <h3 className="font-semibold text-lg mb-2">Real Estate Trends in Bahrain</h3>
                                <p className="text-gray-600 text-sm">
                                    Discover how the Bahrain real estate market is evolving and what opportunities lie ahead in 2025.
                                </p>
                            </div>
                        </div>

                        {/* Blog 2 */}
                        <div className="bg-white rounded-xl shadow hover:shadow-md transition">
                            <img
                                src="https://images.pexels.com/photos/106399/pexels-photo-106399.jpeg?auto=compress&cs=tinysrgb&w=800"
                                alt="Interior"
                                className="rounded-t-xl w-full h-48 object-cover"
                            />
                            <div className="p-4">
                                <h3 className="font-semibold text-lg mb-2">Modern Interior Design Tips</h3>
                                <p className="text-gray-600 text-sm">
                                    Learn how to style your new home with modern aesthetics and practical layouts for comfort and value.
                                </p>
                            </div>
                        </div>

                        {/* Blog 3 */}
                        <div className="bg-white rounded-xl shadow hover:shadow-md transition">
                            <img
                                src="https://images.pexels.com/photos/1438832/pexels-photo-1438832.jpeg?auto=compress&cs=tinysrgb&w=800"
                                alt="Investment"
                                className="rounded-t-xl w-full h-48 object-cover"
                            />
                            <div className="p-4">
                                <h3 className="font-semibold text-lg mb-2">Investing in Bahrain Property</h3>
                                <p className="text-gray-600 text-sm">
                                    Why Bahrain is becoming a hot destination for real estate investors from the Gulf and beyond.
                                </p>
                            </div>
                        </div>
                    </div>
                </div>
            </section>


            {/* Testimonials */}
            <section className="max-w-6xl mx-auto px-4 py-16">
                <h2 className="text-3xl font-bold mb-10 text-center">Customer Reviews</h2>
                <div className="grid md:grid-cols-3 gap-6">
                    {[
                        { name: "Ali H.", text: "Excellent service and very professional team!" },
                        { name: "Ahmed A.", text: "Found my dream home with their help. Highly recommend!" },
                        { name: "Mohammed K.", text: "Smooth process from start to finish. Great experience!" },
                    ].map((review, idx) => (
                        <div key={idx} className="bg-white border p-6 rounded-lg shadow">
                            <p className="text-gray-700 italic mb-4">"{review.text}"</p>
                            <div className="text-right text-sm font-semibold text-blue-600">- {review.name}</div>
                        </div>
                    ))}
                </div>
            </section>

            {/* Footer */}
            <footer className="bg-gray-900 py-12">
                <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
                    <div className="grid grid-cols-1 md:grid-cols-4 gap-8">
                        <div>
                            <div className="flex items-center gap-2 mb-4">
                                <div className="w-10 h-10 bg-blue-600 rounded-lg flex items-center justify-center">
                                    <HomeIcon className="w-6 h-6 text-white" />
                                </div>
                                <span className="text-xl font-bold text-white">Wealth Home</span>
                            </div>
                            <p className="text-gray-400">
                                Your trusted partner for finding the perfect property in Bahrain.
                            </p>
                        </div>

                        <div>
                            <h3 className="text-white font-semibold mb-4">Quick Links</h3>
                            <ul className="space-y-2 text-gray-400">
                                <li><a href="./Home" className="hover:text-white">Home</a></li>
                                <li><a href="./Buy" className="hover:text-white">Buy</a></li>
                                <li><a href="./Rent" className="hover:text-white">Rent</a></li>
                                <li><a href="./About" className="hover:text-white">About Us</a></li>
                            </ul>
                        </div>

                        <div>
                            <h3 className="text-white font-semibold mb-4">Locations</h3>
                            <ul className="space-y-2 text-gray-400">
                                <li><a href="#" className="hover:text-white">Manama</a></li>
                                <li><a href="#" className="hover:text-white">Riffa</a></li>
                                <li><a href="#" className="hover:text-white">Muharraq</a></li>
                                <li><a href="#" className="hover:text-white">Hamad Town</a></li>
                            </ul>
                        </div>

                        <div>
                            <h3 className="text-white font-semibold mb-4">Contact</h3>
                            <ul className="space-y-2 text-gray-400">
                                <li>+973 1234 5678</li>
                                <li>info@bahrainhomes.com</li>
                                <li>Manama, Kingdom of Bahrain</li>
                            </ul>
                        </div>
                    </div>

                    <div className="border-t border-gray-800 mt-12 pt-8 text-center text-gray-400">
                        <p>&copy; 2025 WealthHomes. All rights reserved.</p>
                    </div>
                </div>
            </footer>
        </div>
    );
};

export default About;
