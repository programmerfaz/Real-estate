import React, { useEffect, useState } from 'react';
import { TrendingUp, Award, Users, Home as HomeIcon } from 'lucide-react';
import PropertyCard from '../components/PropertyCard';
import SearchBar from '../components/SearchBar';
import { Link } from "react-router-dom";

import { auth } from "../firebase";

const Home = () => {
  const [userEmail, setUserEmail] = useState(null);

  // Mock auth state for demonstration
  useEffect(() => {
    const unsubscribe = auth.onAuthStateChanged((user) => {
      if (user) {
        setUserEmail(user.email);
      } else {
        setUserEmail(null);
      }
    });
    return () => unsubscribe();
  }, []);

  const featuredProperties = [
    {
      id: '1',
      title: 'Luxury Waterfront Villa',
      location: 'Manama, Bahrain',
      price: 2500,
      beds: 5,
      baths: 4,
      area: 4500,
      imageUrl: 'https://images.pexels.com/photos/1396122/pexels-photo-1396122.jpeg?auto=compress&cs=tinysrgb&w=800',
      type: 'Villa',
      featured: true
    },
    {
      id: '2',
      title: 'Modern Downtown Apartment',
      location: 'Manama City Center, Bahrain',
      price: 1200,
      beds: 3,
      baths: 2,
      area: 1800,
      imageUrl: 'https://images.pexels.com/photos/1571460/pexels-photo-1571460.jpeg?auto=compress&cs=tinysrgb&w=800',
      type: 'Apartment',
      featured: false
    },
    {
      id: '3',
      title: 'Family Townhouse',
      location: 'Riffa, Bahrain',
      price: 1800,
      beds: 4,
      baths: 3,
      area: 3200,
      imageUrl: 'https://images.pexels.com/photos/1396132/pexels-photo-1396132.jpeg?auto=compress&cs=tinysrgb&w=800',
      type: 'Townhouse',
      featured: false
    },
    {
      id: '4',
      title: 'Seafront Penthouse',
      location: 'Muharraq, Bahrain',
      price: 3200,
      beds: 4,
      baths: 3,
      area: 2800,
      imageUrl: 'https://images.pexels.com/photos/1643383/pexels-photo-1643383.jpeg?auto=compress&cs=tinysrgb&w=800',
      type: 'Penthouse',
      featured: true
    },
    {
      id: '5',
      title: 'Garden View Apartment',
      location: 'Hamad Town, Bahrain',
      price: 800,
      beds: 2,
      baths: 2,
      area: 1200,
      imageUrl: 'https://images.pexels.com/photos/1571463/pexels-photo-1571463.jpeg?auto=compress&cs=tinysrgb&w=800',
      type: 'Apartment',
      featured: false
    },
    {
      id: '6',
      title: 'Executive Villa',
      location: 'Sitra, Bahrain',
      price: 2200,
      beds: 5,
      baths: 4,
      area: 4000,
      imageUrl: 'https://images.pexels.com/photos/1396132/pexels-photo-1396132.jpeg?auto=compress&cs=tinysrgb&w=800',
      type: 'Villa',
      featured: false
    }
  ];

  const stats = [
    { icon: HomeIcon, label: 'Properties Listed', value: '2,500+' },
    { icon: Users, label: 'Happy Clients', value: '1,200+' },
    { icon: Award, label: 'Years Experience', value: '15+' },
    { icon: TrendingUp, label: 'Properties Sold', value: '800+' }
  ];

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Header */}
      <header className="bg-white shadow-sm border-b border-gray-100">
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
              <a href="./Buy" className="text-gray-600 hover:text-blue-600 font-medium">Buy</a>
              <a href="./Rent" className="text-gray-600 hover:text-blue-600 font-medium">Rent</a>
              <a href="./AIHelp" className="text-gray-600 hover:text-blue-600 font-medium">AI Help</a>
              <a href="./About" className="text-gray-600 hover:text-blue-600 font-medium">About</a>
            </nav>

            <div className="flex items-center gap-4">
              {userEmail ? (
                <span className="text-sm text-gray-600">Welcome, {userEmail.split('@')[0]}</span>
              ) : (
                <button className="text-gray-600 hover:text-blue-600 font-medium">Sign In</button>
              )}
              <Link to="/Favourites">
                <button className="bg-blue-600 text-white px-4 py-2 rounded-lg hover:bg-blue-700 transition-colors">
                  My Favourites
                </button>
              </Link>
            </div>
          </div>
        </div>
      </header>

      {/* Hero Section */}
      <section className="relative bg-gradient-to-br from-blue-900 via-blue-800 to-blue-700 py-20">
        <div className="absolute inset-0 bg-black/20"></div>
        <div className="relative max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 text-center">
          <h1 className="text-5xl md:text-6xl font-bold text-white mb-6">
            Find Your Dream Home
            <span className="block text-blue-300">in Bahrain</span>
          </h1>
          <p className="text-xl text-blue-100 mb-12 max-w-3xl mx-auto">
            Discover the perfect property from our extensive collection of premium homes,
            apartments, and commercial spaces across the Kingdom of Bahrain.
          </p>

          <div className="max-w-4xl mx-auto">
            <SearchBar />
          </div>
        </div>
      </section>

      {/* Stats Section */}
      <section className="py-16 bg-white">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="grid grid-cols-2 md:grid-cols-4 gap-8">
            {stats.map((stat, index) => (
              <div key={index} className="text-center">
                <div className="w-16 h-16 bg-blue-100 rounded-full flex items-center justify-center mx-auto mb-4">
                  <stat.icon className="w-8 h-8 text-blue-600" />
                </div>
                <div className="text-3xl font-bold text-gray-900 mb-2">{stat.value}</div>
                <div className="text-gray-600">{stat.label}</div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Featured Properties */}
      <section className="py-20 bg-gray-50">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-16">
            <h2 className="text-4xl font-bold text-gray-900 mb-4">Featured Properties</h2>
            <p className="text-xl text-gray-600 max-w-2xl mx-auto">
              Explore our handpicked selection of premium properties across Bahrain's most desirable locations.
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
            {featuredProperties.map((property) => (
              <PropertyCard key={property.id} {...property} />
            ))}
          </div>

          <div className="text-center mt-12">
            <Link to="/buy">
              <button className="bg-blue-600 text-white px-8 py-3 rounded-lg hover:bg-blue-700 transition-colors font-medium cursor-pointer">
                View All Properties
              </button>
            </Link>
          </div>
        </div>
      </section>

      {/* CTA Section */}
      <section className="py-20 bg-blue-600">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 text-center">
          <h2 className="text-4xl font-bold text-white mb-6">Ready to Find Your Perfect Home?</h2>
          <p className="text-xl text-blue-100 mb-8 max-w-2xl mx-auto">
            Join thousands of satisfied customers who found their dream properties with BahrainHomes.
          </p>
          <div className="flex flex-col sm:flex-row gap-4 justify-center">
            <Link to="/Buy">
              <button className="bg-white text-blue-600 px-8 py-3 rounded-lg hover:bg-gray-100 transition-colors font-medium cursor-pointer">
                Browse Properties
              </button>
            </Link>
            <Link to="/AIHelp">
              <button className="border-2 border-white text-white px-8 py-3 rounded-lg hover:bg-white hover:text-blue-600 transition-colors font-medium cursor-pointer">
                Ask AI for Help
              </button>
            </Link>
          </div>
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
}

export default Home;