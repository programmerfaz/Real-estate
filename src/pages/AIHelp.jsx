import React, { useState, useEffect, useRef } from 'react';
import { 
  MessageCircle, 
  Send, 
  Bot, 
  User, 
  Home as HomeIcon, 
  TrendingUp, 
  MapPin, 
  DollarSign, 
  Bed, 
  Bath, 
  Square, 
  Star, 
  Lightbulb, 
  BarChart3, 
  Target, 
  Sparkles, 
  LogOut, 
  Menu, 
  X,
  Loader2,
  ThumbsUp,
  ThumbsDown,
  Copy,
  RefreshCw
} from 'lucide-react';
import { Link } from "react-router-dom";
import { supabase } from "../supabase";
import { auth } from "../firebase";
import { useNavigate } from 'react-router-dom';
import PropertyCard from '../components/PropertyCard';

const AIHelp = () => {
  const [userEmail, setUserEmail] = useState(null);
  const [menuOpen, setMenuOpen] = useState(false);
  const [messages, setMessages] = useState([]);
  const [inputMessage, setInputMessage] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [allProperties, setAllProperties] = useState([]);
  const [recommendations, setRecommendations] = useState([]);
  const [userPreferences, setUserPreferences] = useState({
    budget: '',
    location: '',
    bedrooms: '',
    propertyType: '',
    lifestyle: ''
  });
  const [marketInsights, setMarketInsights] = useState(null);
  const [activeTab, setActiveTab] = useState('chat');
  const messagesEndRef = useRef(null);
  const navigate = useNavigate();

  // OpenAI API configuration
  const OPENAI_API_KEY = process.env.REACT_APP_OPENAI_API_KEY || 'your-openai-api-key-here';

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

  useEffect(() => {
    const fetchProperties = async () => {
      const { data, error } = await supabase.from("properties").select("*");
      if (error) {
        console.error("Error fetching properties:", error.message);
      } else {
        setAllProperties(data);
        generateInitialRecommendations(data);
      }
    };
    fetchProperties();
  }, []);

  useEffect(() => {
    scrollToBottom();
  }, [messages]);

  useEffect(() => {
    // Add welcome message when component mounts
    if (messages.length === 0) {
      setMessages([{
        id: 1,
        type: 'bot',
        content: `Hello! I'm your AI property assistant. I can help you find the perfect property in Bahrain based on your preferences, budget, and lifestyle. 

What would you like to know about? I can help with:
• Property recommendations
• Market analysis
• Neighborhood insights
• Investment advice
• Mortgage calculations

How can I assist you today?`,
        timestamp: new Date()
      }]);
    }
  }, []);

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
  };

  const handleLogout = () => {
    localStorage.removeItem('userEmail');
    navigate('/login');
  };

  const generateInitialRecommendations = (properties) => {
    // Generate smart recommendations based on popular properties
    const featured = properties.filter(p => p.featured).slice(0, 3);
    const highRated = properties.sort((a, b) => b.rating - a.rating).slice(0, 3);
    const affordable = properties.sort((a, b) => a.price - b.price).slice(0, 3);
    
    setRecommendations([
      { title: 'Featured Properties', properties: featured, icon: Star },
      { title: 'Highly Rated', properties: highRated, icon: ThumbsUp },
      { title: 'Best Value', properties: affordable, icon: DollarSign }
    ]);
  };

  const generateMarketInsights = (properties) => {
    const avgPrice = properties.reduce((sum, p) => sum + p.price, 0) / properties.length;
    const locations = [...new Set(properties.map(p => p.location))];
    const priceByLocation = locations.map(loc => {
      const locationProps = properties.filter(p => p.location.includes(loc));
      return {
        location: loc,
        avgPrice: locationProps.reduce((sum, p) => sum + p.price, 0) / locationProps.length,
        count: locationProps.length
      };
    });

    setMarketInsights({
      avgPrice,
      totalProperties: properties.length,
      priceByLocation: priceByLocation.sort((a, b) => b.avgPrice - a.avgPrice),
      trends: {
        growth: '+12%',
        hottest: priceByLocation[0]?.location || 'Manama'
      }
    });
  };

  const callOpenAI = async (userMessage, context = '') => {
    try {
      const response = await fetch('https://api.openai.com/v1/chat/completions', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${OPENAI_API_KEY}`
        },
        body: JSON.stringify({
          model: 'gpt-3.5-turbo',
          messages: [
            {
              role: 'system',
              content: `You are a helpful AI real estate assistant for Wealth Home, a premium property platform in Bahrain. You help users find properties, provide market insights, and give real estate advice. 

Available properties context: ${context}

Guidelines:
- Be friendly, professional, and knowledgeable about Bahrain real estate
- Provide specific, actionable advice
- Ask clarifying questions when needed
- Suggest properties based on user preferences
- Include market insights when relevant
- Keep responses concise but informative
- Always end with a helpful question or suggestion`
            },
            {
              role: 'user',
              content: userMessage
            }
          ],
          max_tokens: 500,
          temperature: 0.7
        })
      });

      if (!response.ok) {
        throw new Error('OpenAI API request failed');
      }

      const data = await response.json();
      return data.choices[0].message.content;
    } catch (error) {
      console.error('OpenAI API Error:', error);
      return "I apologize, but I'm having trouble connecting to my AI services right now. However, I can still help you browse our properties and provide general assistance. Would you like me to show you some recommended properties based on popular choices?";
    }
  };

  const handleSendMessage = async () => {
    if (!inputMessage.trim()) return;

    const userMessage = {
      id: Date.now(),
      type: 'user',
      content: inputMessage,
      timestamp: new Date()
    };

    setMessages(prev => [...prev, userMessage]);
    setInputMessage('');
    setIsLoading(true);

    // Create context from properties for AI
    const propertiesContext = allProperties.slice(0, 10).map(p => 
      `${p.title} in ${p.location} - ${p.bedrooms}BR/${p.bathrooms}BA - $${p.price.toLocaleString()}`
    ).join('; ');

    try {
      const aiResponse = await callOpenAI(inputMessage, propertiesContext);
      
      const botMessage = {
        id: Date.now() + 1,
        type: 'bot',
        content: aiResponse,
        timestamp: new Date()
      };

      setMessages(prev => [...prev, botMessage]);
    } catch (error) {
      const errorMessage = {
        id: Date.now() + 1,
        type: 'bot',
        content: "I apologize for the technical difficulty. Let me help you in other ways! Would you like to see our featured properties or get market insights?",
        timestamp: new Date()
      };
      setMessages(prev => [...prev, errorMessage]);
    }

    setIsLoading(false);
  };

  const handleKeyPress = (e) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault();
      handleSendMessage();
    }
  };

  const quickQuestions = [
    "What's the best area to buy in Bahrain?",
    "Show me properties under $200k",
    "I need a 3-bedroom family home",
    "What are the current market trends?",
    "Help me calculate mortgage payments",
    "Best investment properties in Manama"
  ];

  const handleQuickQuestion = (question) => {
    setInputMessage(question);
    setTimeout(() => handleSendMessage(), 100);
  };

  const formatPrice = (price) => `$${price.toLocaleString()}`;

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Header */}
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
              <a href="./Buy" className="text-gray-600 hover:text-blue-600 font-medium">Buy</a>
              <a href="./Rent" className="text-gray-600 hover:text-blue-600 font-medium">Rent</a>
              <a href="./AIHelp" className="text-blue-600 font-medium border-b-2 border-blue-600 pb-1">AI Help</a>
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
              <a href="./Buy" className="block px-4 text-gray-600 hover:text-blue-600 font-medium">Buy</a>
              <a href="./Rent" className="block px-4 text-gray-600 hover:text-blue-600 font-medium">Rent</a>
              <a href="./AIHelp" className="block px-4 text-blue-600 font-medium">AI Help</a>
              <a href="./About" className="block px-4 text-gray-600 hover:text-blue-600 font-medium">About</a>
            </div>
          )}
        </div>
      </header>

      {/* Hero Section */}
      <section className="bg-gradient-to-br from-blue-900 via-blue-800 to-blue-700 py-16">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 text-center">
          <div className="flex items-center justify-center mb-6">
            <div className="w-16 h-16 bg-blue-500 rounded-2xl flex items-center justify-center mr-4">
              <Sparkles className="w-8 h-8 text-white" />
            </div>
            <h1 className="text-4xl md:text-5xl font-bold text-white">
              AI Property Assistant
            </h1>
          </div>
          <p className="text-xl text-blue-100 mb-8 max-w-3xl mx-auto">
            Get personalized property recommendations, market insights, and expert advice 
            powered by artificial intelligence
          </p>
        </div>
      </section>

      {/* Main Content */}
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {/* Tab Navigation */}
        <div className="flex flex-wrap gap-2 mb-8 bg-white rounded-xl p-2 shadow-sm">
          <button
            onClick={() => setActiveTab('chat')}
            className={`flex items-center px-6 py-3 rounded-lg font-medium transition-colors ${
              activeTab === 'chat' 
                ? 'bg-blue-600 text-white shadow-md' 
                : 'text-gray-600 hover:bg-gray-100'
            }`}
          >
            <MessageCircle className="w-5 h-5 mr-2" />
            AI Chat
          </button>
          <button
            onClick={() => setActiveTab('recommendations')}
            className={`flex items-center px-6 py-3 rounded-lg font-medium transition-colors ${
              activeTab === 'recommendations' 
                ? 'bg-blue-600 text-white shadow-md' 
                : 'text-gray-600 hover:bg-gray-100'
            }`}
          >
            <Target className="w-5 h-5 mr-2" />
            Smart Recommendations
          </button>
          <button
            onClick={() => setActiveTab('insights')}
            className={`flex items-center px-6 py-3 rounded-lg font-medium transition-colors ${
              activeTab === 'insights' 
                ? 'bg-blue-600 text-white shadow-md' 
                : 'text-gray-600 hover:bg-gray-100'
            }`}
          >
            <BarChart3 className="w-5 h-5 mr-2" />
            Market Insights
          </button>
        </div>

        {/* Chat Tab */}
        {activeTab === 'chat' && (
          <div className="grid grid-cols-1 lg:grid-cols-4 gap-8">
            {/* Chat Interface */}
            <div className="lg:col-span-3">
              <div className="bg-white rounded-2xl shadow-lg overflow-hidden">
                {/* Chat Header */}
                <div className="bg-gradient-to-r from-blue-600 to-blue-700 p-6">
                  <div className="flex items-center">
                    <div className="w-12 h-12 bg-blue-500 rounded-full flex items-center justify-center mr-4">
                      <Bot className="w-6 h-6 text-white" />
                    </div>
                    <div>
                      <h3 className="text-xl font-semibold text-white">AI Property Assistant</h3>
                      <p className="text-blue-100">Online • Ready to help</p>
                    </div>
                  </div>
                </div>

                {/* Messages */}
                <div className="h-96 overflow-y-auto p-6 space-y-4">
                  {messages.map((message) => (
                    <div
                      key={message.id}
                      className={`flex ${message.type === 'user' ? 'justify-end' : 'justify-start'}`}
                    >
                      <div className={`flex items-start max-w-xs lg:max-w-md ${
                        message.type === 'user' ? 'flex-row-reverse' : 'flex-row'
                      }`}>
                        <div className={`w-8 h-8 rounded-full flex items-center justify-center ${
                          message.type === 'user' 
                            ? 'bg-blue-600 ml-3' 
                            : 'bg-gray-200 mr-3'
                        }`}>
                          {message.type === 'user' ? (
                            <User className="w-4 h-4 text-white" />
                          ) : (
                            <Bot className="w-4 h-4 text-gray-600" />
                          )}
                        </div>
                        <div className={`px-4 py-3 rounded-2xl ${
                          message.type === 'user'
                            ? 'bg-blue-600 text-white'
                            : 'bg-gray-100 text-gray-800'
                        }`}>
                          <p className="whitespace-pre-wrap">{message.content}</p>
                          <p className={`text-xs mt-2 ${
                            message.type === 'user' ? 'text-blue-100' : 'text-gray-500'
                          }`}>
                            {message.timestamp.toLocaleTimeString()}
                          </p>
                        </div>
                      </div>
                    </div>
                  ))}
                  
                  {isLoading && (
                    <div className="flex justify-start">
                      <div className="flex items-start">
                        <div className="w-8 h-8 rounded-full bg-gray-200 flex items-center justify-center mr-3">
                          <Bot className="w-4 h-4 text-gray-600" />
                        </div>
                        <div className="bg-gray-100 px-4 py-3 rounded-2xl">
                          <div className="flex items-center space-x-2">
                            <Loader2 className="w-4 h-4 animate-spin text-blue-600" />
                            <span className="text-gray-600">AI is thinking...</span>
                          </div>
                        </div>
                      </div>
                    </div>
                  )}
                  <div ref={messagesEndRef} />
                </div>

                {/* Input */}
                <div className="border-t border-gray-200 p-6">
                  <div className="flex items-center space-x-4">
                    <div className="flex-1 relative">
                      <textarea
                        value={inputMessage}
                        onChange={(e) => setInputMessage(e.target.value)}
                        onKeyPress={handleKeyPress}
                        placeholder="Ask me anything about properties in Bahrain..."
                        className="w-full px-4 py-3 border border-gray-300 rounded-xl focus:ring-2 focus:ring-blue-500 focus:border-transparent resize-none"
                        rows="2"
                      />
                    </div>
                    <button
                      onClick={handleSendMessage}
                      disabled={!inputMessage.trim() || isLoading}
                      className="bg-blue-600 text-white p-3 rounded-xl hover:bg-blue-700 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
                    >
                      <Send className="w-5 h-5" />
                    </button>
                  </div>
                </div>
              </div>
            </div>

            {/* Quick Questions Sidebar */}
            <div className="space-y-6">
              <div className="bg-white rounded-2xl shadow-lg p-6">
                <h3 className="text-lg font-semibold mb-4 flex items-center">
                  <Lightbulb className="w-5 h-5 mr-2 text-yellow-500" />
                  Quick Questions
                </h3>
                <div className="space-y-2">
                  {quickQuestions.map((question, index) => (
                    <button
                      key={index}
                      onClick={() => handleQuickQuestion(question)}
                      className="w-full text-left p-3 text-sm bg-gray-50 hover:bg-blue-50 hover:text-blue-700 rounded-lg transition-colors"
                    >
                      {question}
                    </button>
                  ))}
                </div>
              </div>

              <div className="bg-gradient-to-br from-blue-50 to-indigo-50 rounded-2xl p-6 border border-blue-100">
                <h3 className="text-lg font-semibold mb-3 text-blue-900">💡 Pro Tip</h3>
                <p className="text-sm text-blue-800">
                  Be specific about your needs! Mention your budget, preferred location, 
                  number of bedrooms, and lifestyle preferences for better recommendations.
                </p>
              </div>
            </div>
          </div>
        )}

        {/* Recommendations Tab */}
        {activeTab === 'recommendations' && (
          <div className="space-y-8">
            <div className="text-center">
              <h2 className="text-3xl font-bold text-gray-900 mb-4">Smart Property Recommendations</h2>
              <p className="text-xl text-gray-600">AI-curated properties based on market trends and user preferences</p>
            </div>

            {recommendations.map((category, index) => (
              <div key={index} className="bg-white rounded-2xl shadow-lg p-8">
                <div className="flex items-center mb-6">
                  <category.icon className="w-8 h-8 text-blue-600 mr-3" />
                  <h3 className="text-2xl font-bold text-gray-900">{category.title}</h3>
                </div>
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                  {category.properties.map((property) => (
                    <PropertyCard
                      key={property.id}
                      {...property}
                      formatPrice={formatPrice}
                      showViewButton={true}
                    />
                  ))}
                </div>
              </div>
            ))}
          </div>
        )}

        {/* Market Insights Tab */}
        {activeTab === 'insights' && (
          <div className="space-y-8">
            <div className="text-center">
              <h2 className="text-3xl font-bold text-gray-900 mb-4">Market Insights & Analytics</h2>
              <p className="text-xl text-gray-600">Real-time market data and trends powered by AI analysis</p>
            </div>

            {/* Market Stats */}
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
              <div className="bg-white rounded-2xl shadow-lg p-6 text-center">
                <div className="w-12 h-12 bg-blue-100 rounded-full flex items-center justify-center mx-auto mb-4">
                  <HomeIcon className="w-6 h-6 text-blue-600" />
                </div>
                <div className="text-3xl font-bold text-gray-900 mb-2">{allProperties.length}</div>
                <div className="text-gray-600">Total Properties</div>
              </div>

              <div className="bg-white rounded-2xl shadow-lg p-6 text-center">
                <div className="w-12 h-12 bg-green-100 rounded-full flex items-center justify-center mx-auto mb-4">
                  <DollarSign className="w-6 h-6 text-green-600" />
                </div>
                <div className="text-3xl font-bold text-gray-900 mb-2">
                  ${Math.round(allProperties.reduce((sum, p) => sum + p.price, 0) / allProperties.length / 1000)}K
                </div>
                <div className="text-gray-600">Avg. Price</div>
              </div>

              <div className="bg-white rounded-2xl shadow-lg p-6 text-center">
                <div className="w-12 h-12 bg-purple-100 rounded-full flex items-center justify-center mx-auto mb-4">
                  <TrendingUp className="w-6 h-6 text-purple-600" />
                </div>
                <div className="text-3xl font-bold text-gray-900 mb-2">+12%</div>
                <div className="text-gray-600">Market Growth</div>
              </div>

              <div className="bg-white rounded-2xl shadow-lg p-6 text-center">
                <div className="w-12 h-12 bg-orange-100 rounded-full flex items-center justify-center mx-auto mb-4">
                  <MapPin className="w-6 h-6 text-orange-600" />
                </div>
                <div className="text-3xl font-bold text-gray-900 mb-2">Manama</div>
                <div className="text-gray-600">Hottest Area</div>
              </div>
            </div>

            {/* Price by Location */}
            <div className="bg-white rounded-2xl shadow-lg p-8">
              <h3 className="text-2xl font-bold text-gray-900 mb-6">Average Prices by Location</h3>
              <div className="space-y-4">
                {[...new Set(allProperties.map(p => p.location))].map((location, index) => {
                  const locationProps = allProperties.filter(p => p.location.includes(location));
                  const avgPrice = locationProps.reduce((sum, p) => sum + p.price, 0) / locationProps.length;
                  const maxPrice = Math.max(...allProperties.map(p => p.price));
                  const percentage = (avgPrice / maxPrice) * 100;
                  
                  return (
                    <div key={index} className="flex items-center justify-between">
                      <div className="flex-1">
                        <div className="flex justify-between items-center mb-2">
                          <span className="font-medium text-gray-900">{location}</span>
                          <span className="text-blue-600 font-semibold">${Math.round(avgPrice / 1000)}K</span>
                        </div>
                        <div className="w-full bg-gray-200 rounded-full h-2">
                          <div 
                            className="bg-blue-600 h-2 rounded-full transition-all duration-500"
                            style={{ width: `${percentage}%` }}
                          ></div>
                        </div>
                      </div>
                    </div>
                  );
                })}
              </div>
            </div>

            {/* AI Insights */}
            <div className="bg-gradient-to-br from-blue-50 to-indigo-50 rounded-2xl p-8 border border-blue-100">
              <div className="flex items-center mb-6">
                <Sparkles className="w-8 h-8 text-blue-600 mr-3" />
                <h3 className="text-2xl font-bold text-blue-900">AI Market Analysis</h3>
              </div>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div className="bg-white rounded-xl p-6">
                  <h4 className="font-semibold text-gray-900 mb-3">🔥 Hot Trends</h4>
                  <ul className="space-y-2 text-gray-700">
                    <li>• Waterfront properties seeing 15% price increase</li>
                    <li>• 3-bedroom apartments most in demand</li>
                    <li>• Manama and Riffa leading in sales volume</li>
                  </ul>
                </div>
                <div className="bg-white rounded-xl p-6">
                  <h4 className="font-semibold text-gray-900 mb-3">💡 Investment Tips</h4>
                  <ul className="space-y-2 text-gray-700">
                    <li>• Consider emerging areas like Hamad Town</li>
                    <li>• Furnished properties yield higher rental returns</li>
                    <li>• Properties near schools command premium prices</li>
                  </ul>
                </div>
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};

export default AIHelp;