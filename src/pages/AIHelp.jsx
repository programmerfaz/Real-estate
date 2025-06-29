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
  RefreshCw,
  Zap,
  Brain,
  Cpu,
  Activity,
  Globe,
  Shield,
  Rocket,
  Eye,
  Mic,
  MicOff,
  Volume2,
  VolumeX,
  Settings,
  Download,
  Share2,
  Bookmark,
  Clock,
  Calendar,
  Filter,
  Search,
  ChevronRight,
  ArrowRight,
  Play,
  Pause
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
  const [favourites, setFavourites] = useState([]);
  const [activeTab, setActiveTab] = useState('chat');
  const [isTyping, setIsTyping] = useState(false);
  const [voiceEnabled, setVoiceEnabled] = useState(false);
  const [isListening, setIsListening] = useState(false);
  const [aiPersonality, setAiPersonality] = useState('professional');
  const [chatHistory, setChatHistory] = useState([]);
  const [aiThinking, setAiThinking] = useState(false);
  const [showAdvancedOptions, setShowAdvancedOptions] = useState(false);
  const messagesEndRef = useRef(null);
  const navigate = useNavigate();

  // OpenAI API configuration
  const OPENAI_API_KEY = import.meta.env.VITE_OPENAI_API_KEY || 'your-openai-api-key-here';

  useEffect(() => {
    const unsubscribe = auth.onAuthStateChanged((user) => {
      if (user) {
        setUserEmail(user.email);
        fetchFavourites(user.email);
      } else {
        setUserEmail(null);
        setFavourites([]);
      }
    });
    return () => unsubscribe();
  }, []);

  const fetchFavourites = async (email) => {
    try {
      const { data, error } = await supabase
        .from('favourites')
        .select('property_id')
        .eq('user_email', email);

      if (!error && data) {
        const ids = data.map((fav) => fav.property_id);
        setFavourites(ids);
      }
    } catch (error) {
      console.error('Error fetching favourites:', error);
    }
  };

  useEffect(() => {
    const fetchProperties = async () => {
      try {
        const { data, error } = await supabase.from("properties").select("*");
        if (error) {
          console.error("Error fetching properties:", error.message);
        } else {
          setAllProperties(data || []);
          generateInitialRecommendations(data || []);
        }
      } catch (error) {
        console.error("Error in fetchProperties:", error);
        setAllProperties([]);
      }
    };
    fetchProperties();
  }, []);

  useEffect(() => {
    scrollToBottom();
  }, [messages]);

  useEffect(() => {
    // Enhanced welcome message with personality
    if (messages.length === 0) {
      const welcomeMessages = {
        professional: `🏠 Welcome to Wealth Home's AI Assistant! I'm your intelligent property advisor, powered by advanced AI technology.

I can help you with:
🎯 Personalized property recommendations
📊 Real-time market analysis & trends  
💰 Investment opportunity insights
🏘️ Neighborhood deep-dive reports
📈 Price prediction & valuation
🔍 Smart property matching

What would you like to explore today?`,
        friendly: `Hey there! 👋 I'm your AI property buddy, and I'm super excited to help you find your dream home in Bahrain!

I'm like having a real estate expert in your pocket 24/7. I can:
✨ Find properties that match your vibe
📍 Give you the inside scoop on neighborhoods  
💡 Share investment tips and tricks
🎨 Help you visualize your future home
📱 Keep you updated on market trends

Ready to start this amazing journey together?`,
        expert: `Greetings. I am the Wealth Home AI Property Intelligence System - your advanced real estate analytics engine.

My capabilities include:
🧠 Deep learning property analysis
⚡ Real-time market data processing
🎯 Precision-targeted recommendations
📊 Predictive market modeling
🔬 Comprehensive investment analysis
🌐 Multi-dimensional property scoring

Initiating consultation protocol. How may I assist with your property objectives?`
      };

      setMessages([{
        id: 1,
        type: 'bot',
        content: welcomeMessages[aiPersonality],
        timestamp: new Date(),
        personality: aiPersonality
      }]);
    }
  }, [aiPersonality]);

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
  };

  const handleLogout = async () => {
    try {
      await auth.signOut();
      localStorage.removeItem('userEmail');
      navigate('/login');
    } catch (error) {
      console.error('Logout error:', error);
    }
  };

  const generateInitialRecommendations = (properties) => {
    if (!properties || properties.length === 0) {
      setRecommendations([]);
      return;
    }

    const featured = properties.filter(p => p.featured).slice(0, 3);
    const highRated = [...properties].sort((a, b) => (b.rating || 0) - (a.rating || 0)).slice(0, 3);
    const affordable = [...properties].sort((a, b) => (a.price || 0) - (b.price || 0)).slice(0, 3);
    const luxury = [...properties].sort((a, b) => (b.price || 0) - (a.price || 0)).slice(0, 3);
    
    setRecommendations([
      { title: 'AI Featured Picks', properties: featured, icon: Sparkles, color: 'from-purple-500 to-pink-500' },
      { title: 'Top Rated Properties', properties: highRated, icon: Star, color: 'from-yellow-500 to-orange-500' },
      { title: 'Best Value Deals', properties: affordable, icon: DollarSign, color: 'from-green-500 to-emerald-500' },
      { title: 'Luxury Collection', properties: luxury, icon: Crown, color: 'from-blue-500 to-indigo-500' }
    ]);
  };

  const toggleFavourite = async (propertyId) => {
    if (!userEmail) {
      alert("Please sign in to manage favourites.");
      return;
    }

    const isFavourite = favourites.includes(propertyId);

    try {
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
    } catch (error) {
      console.error('Error toggling favourite:', error);
    }
  };

  const callOpenAI = async (userMessage, context = '') => {
    setAiThinking(true);
    
    const personalityPrompts = {
      professional: "You are a professional real estate AI assistant. Provide detailed, accurate, and helpful information in a business-like tone.",
      friendly: "You are a friendly and enthusiastic real estate AI assistant. Be warm, encouraging, and use emojis appropriately. Make the conversation feel personal and exciting.",
      expert: "You are an expert-level real estate AI with deep analytical capabilities. Provide sophisticated insights, use technical terminology when appropriate, and focus on data-driven recommendations."
    };

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
              content: `${personalityPrompts[aiPersonality]} You are working for Wealth Home, a premium property platform in Bahrain. 

Available properties context: ${context}

Guidelines:
- Match the ${aiPersonality} personality in your responses
- Provide specific, actionable advice about Bahrain real estate
- Ask clarifying questions when needed
- Suggest properties based on user preferences
- Include market insights when relevant
- Keep responses engaging and informative
- Always end with a helpful question or suggestion
- Use appropriate emojis for friendly personality
- Be technical and analytical for expert personality`
            },
            {
              role: 'user',
              content: userMessage
            }
          ],
          max_tokens: 600,
          temperature: aiPersonality === 'expert' ? 0.3 : 0.7
        })
      });

      if (!response.ok) {
        throw new Error(`OpenAI API request failed: ${response.status}`);
      }

      const data = await response.json();
      setAiThinking(false);
      return data.choices[0].message.content;
    } catch (error) {
      console.error('OpenAI API Error:', error);
      setAiThinking(false);
      return "I apologize, but I'm experiencing some technical difficulties. However, I can still help you explore our amazing property collection! Would you like me to show you some featured properties or market insights?";
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
    setIsTyping(true);

    // Simulate typing delay
    setTimeout(() => setIsTyping(false), 2000);

    const propertiesContext = allProperties.slice(0, 10).map(p => 
      `${p.title} in ${p.location} - ${p.bedrooms}BR/${p.bathrooms}BA - $${p.price?.toLocaleString() || 'N/A'}`
    ).join('; ');

    try {
      const aiResponse = await callOpenAI(inputMessage, propertiesContext);
      
      const botMessage = {
        id: Date.now() + 1,
        type: 'bot',
        content: aiResponse,
        timestamp: new Date(),
        personality: aiPersonality
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

  const smartQuestions = [
    { 
      category: "Property Search", 
      questions: [
        "Find me luxury waterfront properties",
        "Show 3-bedroom family homes under $300k",
        "What are the best investment areas?",
        "Properties with swimming pools in Manama"
      ]
    },
    { 
      category: "Market Analysis", 
      questions: [
        "Current market trends in Bahrain",
        "Price predictions for next quarter",
        "Best time to buy property",
        "ROI analysis for rental properties"
      ]
    },
    { 
      category: "Neighborhood Insights", 
      questions: [
        "Compare Riffa vs Manama living",
        "Family-friendly areas with good schools",
        "Upcoming development projects",
        "Transportation and connectivity"
      ]
    }
  ];

  const handleQuickQuestion = (question) => {
    setInputMessage(question);
    setTimeout(() => handleSendMessage(), 100);
  };

  const formatPrice = (price) => `$${(price || 0).toLocaleString()}`;

  const calculateAveragePrice = () => {
    if (!allProperties || allProperties.length === 0) return 0;
    const total = allProperties.reduce((sum, p) => sum + (p.price || 0), 0);
    return Math.round(total / allProperties.length / 1000);
  };

  const Crown = ({ className }) => (
    <svg className={className} viewBox="0 0 24 24" fill="currentColor">
      <path d="M5 16L3 6l5.5 4L12 4l3.5 6L21 6l-2 10H5zm2.7-2h8.6l.9-4.4L14 12l-2-4-2 4-3.2-2.4L7.7 14z"/>
    </svg>
  );

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-900 via-blue-900 to-slate-900">
      {/* Animated Background */}
      <div className="fixed inset-0 overflow-hidden pointer-events-none">
        <div className="absolute -top-40 -right-40 w-80 h-80 bg-blue-500/10 rounded-full blur-3xl animate-pulse"></div>
        <div className="absolute -bottom-40 -left-40 w-80 h-80 bg-purple-500/10 rounded-full blur-3xl animate-pulse delay-1000"></div>
        <div className="absolute top-1/2 left-1/2 transform -translate-x-1/2 -translate-y-1/2 w-96 h-96 bg-cyan-500/5 rounded-full blur-3xl animate-pulse delay-2000"></div>
      </div>

      {/* Header */}
      <header className="relative bg-white/10 backdrop-blur-md border-b border-white/20 sticky top-0 z-40">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between items-center py-4">
            <div className="flex items-center gap-2">
              <div className="w-10 h-10 bg-gradient-to-r from-blue-500 to-purple-600 rounded-lg flex items-center justify-center">
                <HomeIcon className="w-6 h-6 text-white" />
              </div>
              <span className="text-xl font-bold text-white">Wealth Home</span>
            </div>

            <nav className="hidden md:flex items-center gap-8">
              <a href="./Home" className="text-white/70 hover:text-white font-medium transition-colors">Properties</a>
              <a href="./Buy" className="text-white/70 hover:text-white font-medium transition-colors">Buy</a>
              <a href="./Rent" className="text-white/70 hover:text-white font-medium transition-colors">Rent</a>
              <a href="./AIHelp" className="text-white font-medium border-b-2 border-blue-400 pb-1">AI Help</a>
              <a href="./About" className="text-white/70 hover:text-white font-medium transition-colors">About</a>
            </nav>

            <button
              onClick={() => setMenuOpen(!menuOpen)}
              className="md:hidden text-white focus:outline-none"
            >
              {menuOpen ? <X className="w-6 h-6" /> : <Menu className="w-6 h-6" />}
            </button>

            <div className="hidden md:flex items-center gap-4">
              <Link to="/Favourites">
                <button className="bg-gradient-to-r from-blue-500 to-purple-600 text-white px-4 py-2 rounded-lg hover:from-blue-600 hover:to-purple-700 transition-all duration-300 transform hover:scale-105">
                  My Favourites
                </button>
              </Link>
              {userEmail ? (
                <>
                  <span className="text-sm text-white/70">Welcome, {userEmail.split('@')[0]}</span>
                  <LogOut
                    onClick={handleLogout}
                    className="w-5 h-5 text-red-400 hover:text-red-300 cursor-pointer transition-colors"
                  />
                </>
              ) : (
                <button className="text-white/70 hover:text-white font-medium transition-colors">Sign In</button>
              )}
            </div>
          </div>

          {menuOpen && (
            <div className="md:hidden bg-white/10 backdrop-blur-md border-t border-white/20 pt-4 pb-4 space-y-2">
              <a href="./Home" className="block px-4 text-white/70 hover:text-white font-medium">Properties</a>
              <a href="./Buy" className="block px-4 text-white/70 hover:text-white font-medium">Buy</a>
              <a href="./Rent" className="block px-4 text-white/70 hover:text-white font-medium">Rent</a>
              <a href="./AIHelp" className="block px-4 text-white font-medium">AI Help</a>
              <a href="./About" className="block px-4 text-white/70 hover:text-white font-medium">About</a>
            </div>
          )}
        </div>
      </header>

      {/* Hero Section */}
      <section className="relative py-20">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 text-center">
          <div className="flex items-center justify-center mb-8">
            <div className="relative">
              <div className="w-20 h-20 bg-gradient-to-r from-blue-500 to-purple-600 rounded-3xl flex items-center justify-center mr-6 animate-pulse">
                <Brain className="w-10 h-10 text-white" />
              </div>
              <div className="absolute -top-2 -right-2 w-6 h-6 bg-green-400 rounded-full flex items-center justify-center">
                <div className="w-2 h-2 bg-white rounded-full animate-ping"></div>
              </div>
            </div>
            <div className="text-left">
              <h1 className="text-5xl md:text-6xl font-bold text-white mb-2">
                AI Property
                <span className="block text-transparent bg-clip-text bg-gradient-to-r from-blue-400 to-purple-400">
                  Intelligence
                </span>
              </h1>
              <p className="text-blue-200 text-lg">Powered by Advanced Machine Learning</p>
            </div>
          </div>
          
          <p className="text-xl text-white/80 mb-12 max-w-4xl mx-auto leading-relaxed">
            Experience the future of real estate with our cutting-edge AI assistant. 
            Get personalized recommendations, market insights, and expert guidance powered by advanced algorithms.
          </p>

          {/* AI Personality Selector */}
          <div className="flex justify-center mb-8">
            <div className="bg-white/10 backdrop-blur-md rounded-2xl p-2 flex gap-2">
              {[
                { key: 'professional', label: 'Professional', icon: Shield },
                { key: 'friendly', label: 'Friendly', icon: Heart },
                { key: 'expert', label: 'Expert', icon: Brain }
              ].map(({ key, label, icon: Icon }) => (
                <button
                  key={key}
                  onClick={() => setAiPersonality(key)}
                  className={`flex items-center px-4 py-2 rounded-xl font-medium transition-all duration-300 ${
                    aiPersonality === key 
                      ? 'bg-gradient-to-r from-blue-500 to-purple-600 text-white shadow-lg transform scale-105' 
                      : 'text-white/70 hover:text-white hover:bg-white/10'
                  }`}
                >
                  <Icon className="w-4 h-4 mr-2" />
                  {label}
                </button>
              ))}
            </div>
          </div>
        </div>
      </section>

      {/* Main Content */}
      <div className="relative max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 pb-8">
        {/* Enhanced Tab Navigation */}
        <div className="flex flex-wrap gap-2 mb-8 bg-white/10 backdrop-blur-md rounded-2xl p-2 shadow-2xl">
          {[
            { key: 'chat', label: 'AI Chat', icon: MessageCircle, gradient: 'from-blue-500 to-cyan-500' },
            { key: 'recommendations', label: 'Smart Recommendations', icon: Target, gradient: 'from-purple-500 to-pink-500' },
            { key: 'insights', label: 'Market Intelligence', icon: BarChart3, gradient: 'from-green-500 to-emerald-500' }
          ].map(({ key, label, icon: Icon, gradient }) => (
            <button
              key={key}
              onClick={() => setActiveTab(key)}
              className={`flex items-center px-6 py-4 rounded-xl font-medium transition-all duration-300 ${
                activeTab === key 
                  ? `bg-gradient-to-r ${gradient} text-white shadow-lg transform scale-105` 
                  : 'text-white/70 hover:text-white hover:bg-white/10'
              }`}
            >
              <Icon className="w-5 h-5 mr-2" />
              {label}
            </button>
          ))}
        </div>

        {/* Chat Tab */}
        {activeTab === 'chat' && (
          <div className="grid grid-cols-1 lg:grid-cols-4 gap-8">
            {/* Enhanced Chat Interface */}
            <div className="lg:col-span-3">
              <div className="bg-white/10 backdrop-blur-md rounded-3xl shadow-2xl overflow-hidden border border-white/20">
                {/* Chat Header */}
                <div className="bg-gradient-to-r from-blue-600/80 to-purple-600/80 backdrop-blur-md p-6 border-b border-white/20">
                  <div className="flex items-center justify-between">
                    <div className="flex items-center">
                      <div className="relative">
                        <div className="w-12 h-12 bg-gradient-to-r from-blue-400 to-purple-500 rounded-full flex items-center justify-center mr-4">
                          <Bot className="w-6 h-6 text-white" />
                        </div>
                        <div className="absolute -bottom-1 -right-1 w-4 h-4 bg-green-400 rounded-full border-2 border-white">
                          <div className="w-full h-full bg-green-400 rounded-full animate-pulse"></div>
                        </div>
                      </div>
                      <div>
                        <h3 className="text-xl font-semibold text-white">AI Property Assistant</h3>
                        <div className="flex items-center text-blue-100">
                          <Activity className="w-4 h-4 mr-1" />
                          <span className="text-sm">
                            {isLoading ? 'Processing...' : aiThinking ? 'Analyzing...' : 'Online & Ready'}
                          </span>
                        </div>
                      </div>
                    </div>
                    
                    <div className="flex items-center gap-2">
                      <button
                        onClick={() => setVoiceEnabled(!voiceEnabled)}
                        className={`p-2 rounded-lg transition-colors ${voiceEnabled ? 'bg-green-500' : 'bg-white/20'}`}
                      >
                        {voiceEnabled ? <Volume2 className="w-4 h-4" /> : <VolumeX className="w-4 h-4" />}
                      </button>
                      <button
                        onClick={() => setShowAdvancedOptions(!showAdvancedOptions)}
                        className="p-2 rounded-lg bg-white/20 hover:bg-white/30 transition-colors"
                      >
                        <Settings className="w-4 h-4" />
                      </button>
                    </div>
                  </div>
                </div>

                {/* Messages */}
                <div className="h-96 overflow-y-auto p-6 space-y-6 bg-gradient-to-b from-transparent to-black/10">
                  {messages.map((message) => (
                    <div
                      key={message.id}
                      className={`flex ${message.type === 'user' ? 'justify-end' : 'justify-start'}`}
                    >
                      <div className={`flex items-start max-w-xs lg:max-w-md ${
                        message.type === 'user' ? 'flex-row-reverse' : 'flex-row'
                      }`}>
                        <div className={`w-10 h-10 rounded-full flex items-center justify-center ${
                          message.type === 'user' 
                            ? 'bg-gradient-to-r from-blue-500 to-purple-600 ml-3' 
                            : 'bg-gradient-to-r from-gray-600 to-gray-700 mr-3'
                        }`}>
                          {message.type === 'user' ? (
                            <User className="w-5 h-5 text-white" />
                          ) : (
                            <Bot className="w-5 h-5 text-white" />
                          )}
                        </div>
                        <div className={`px-6 py-4 rounded-2xl backdrop-blur-md border ${
                          message.type === 'user'
                            ? 'bg-gradient-to-r from-blue-500/80 to-purple-600/80 text-white border-blue-400/30'
                            : 'bg-white/10 text-white border-white/20'
                        }`}>
                          <p className="whitespace-pre-wrap leading-relaxed">{message.content}</p>
                          <div className="flex items-center justify-between mt-3">
                            <p className={`text-xs ${
                              message.type === 'user' ? 'text-blue-100' : 'text-white/60'
                            }`}>
                              {message.timestamp.toLocaleTimeString()}
                            </p>
                            {message.type === 'bot' && (
                              <div className="flex items-center gap-2">
                                <button className="p-1 rounded hover:bg-white/10 transition-colors">
                                  <Copy className="w-3 h-3" />
                                </button>
                                <button className="p-1 rounded hover:bg-white/10 transition-colors">
                                  <ThumbsUp className="w-3 h-3" />
                                </button>
                              </div>
                            )}
                          </div>
                        </div>
                      </div>
                    </div>
                  ))}
                  
                  {(isLoading || isTyping || aiThinking) && (
                    <div className="flex justify-start">
                      <div className="flex items-start">
                        <div className="w-10 h-10 rounded-full bg-gradient-to-r from-gray-600 to-gray-700 flex items-center justify-center mr-3">
                          <Bot className="w-5 h-5 text-white" />
                        </div>
                        <div className="bg-white/10 backdrop-blur-md px-6 py-4 rounded-2xl border border-white/20">
                          <div className="flex items-center space-x-3">
                            <div className="flex space-x-1">
                              <div className="w-2 h-2 bg-blue-400 rounded-full animate-bounce"></div>
                              <div className="w-2 h-2 bg-purple-400 rounded-full animate-bounce delay-100"></div>
                              <div className="w-2 h-2 bg-cyan-400 rounded-full animate-bounce delay-200"></div>
                            </div>
                            <span className="text-white/80 text-sm">
                              {aiThinking ? 'AI is analyzing...' : 'Generating response...'}
                            </span>
                          </div>
                        </div>
                      </div>
                    </div>
                  )}
                  <div ref={messagesEndRef} />
                </div>

                {/* Enhanced Input */}
                <div className="border-t border-white/20 p-6 bg-white/5 backdrop-blur-md">
                  <div className="flex items-center space-x-4">
                    <div className="flex-1 relative">
                      <textarea
                        value={inputMessage}
                        onChange={(e) => setInputMessage(e.target.value)}
                        onKeyPress={handleKeyPress}
                        placeholder="Ask me anything about properties in Bahrain..."
                        className="w-full px-6 py-4 bg-white/10 backdrop-blur-md border border-white/20 rounded-2xl focus:ring-2 focus:ring-blue-500 focus:border-transparent resize-none text-white placeholder-white/50"
                        rows="2"
                      />
                      <div className="absolute right-3 bottom-3 flex items-center gap-2">
                        <button
                          onClick={() => setIsListening(!isListening)}
                          className={`p-2 rounded-lg transition-colors ${
                            isListening ? 'bg-red-500' : 'bg-white/20 hover:bg-white/30'
                          }`}
                        >
                          {isListening ? <MicOff className="w-4 h-4" /> : <Mic className="w-4 h-4" />}
                        </button>
                      </div>
                    </div>
                    <button
                      onClick={handleSendMessage}
                      disabled={!inputMessage.trim() || isLoading}
                      className="bg-gradient-to-r from-blue-500 to-purple-600 text-white p-4 rounded-2xl hover:from-blue-600 hover:to-purple-700 transition-all duration-300 disabled:opacity-50 disabled:cursor-not-allowed transform hover:scale-105"
                    >
                      <Send className="w-5 h-5" />
                    </button>
                  </div>
                </div>
              </div>
            </div>

            {/* Enhanced Sidebar */}
            <div className="space-y-6">
              {/* Smart Questions */}
              <div className="bg-white/10 backdrop-blur-md rounded-2xl shadow-xl p-6 border border-white/20">
                <h3 className="text-lg font-semibold mb-4 flex items-center text-white">
                  <Lightbulb className="w-5 h-5 mr-2 text-yellow-400" />
                  Smart Questions
                </h3>
                <div className="space-y-4">
                  {smartQuestions.map((category, categoryIndex) => (
                    <div key={categoryIndex}>
                      <h4 className="text-sm font-medium text-blue-300 mb-2">{category.category}</h4>
                      <div className="space-y-2">
                        {category.questions.map((question, index) => (
                          <button
                            key={index}
                            onClick={() => handleQuickQuestion(question)}
                            className="w-full text-left p-3 text-sm bg-white/5 hover:bg-white/10 text-white/80 hover:text-white rounded-lg transition-all duration-300 border border-white/10 hover:border-white/20"
                          >
                            {question}
                          </button>
                        ))}
                      </div>
                    </div>
                  ))}
                </div>
              </div>

              {/* AI Status */}
              <div className="bg-gradient-to-br from-blue-500/20 to-purple-500/20 backdrop-blur-md rounded-2xl p-6 border border-blue-400/30">
                <h3 className="text-lg font-semibold mb-3 text-white flex items-center">
                  <Cpu className="w-5 h-5 mr-2 text-blue-400" />
                  AI Status
                </h3>
                <div className="space-y-3">
                  <div className="flex justify-between items-center">
                    <span className="text-white/70 text-sm">Processing Power</span>
                    <div className="flex items-center">
                      <div className="w-16 h-2 bg-white/20 rounded-full mr-2">
                        <div className="w-14 h-2 bg-gradient-to-r from-green-400 to-blue-500 rounded-full"></div>
                      </div>
                      <span className="text-green-400 text-sm">87%</span>
                    </div>
                  </div>
                  <div className="flex justify-between items-center">
                    <span className="text-white/70 text-sm">Response Time</span>
                    <span className="text-blue-400 text-sm">1.2s</span>
                  </div>
                  <div className="flex justify-between items-center">
                    <span className="text-white/70 text-sm">Accuracy</span>
                    <span className="text-purple-400 text-sm">94.7%</span>
                  </div>
                </div>
              </div>

              {/* Pro Tips */}
              <div className="bg-gradient-to-br from-yellow-500/20 to-orange-500/20 backdrop-blur-md rounded-2xl p-6 border border-yellow-400/30">
                <h3 className="text-lg font-semibold mb-3 text-white flex items-center">
                  <Rocket className="w-5 h-5 mr-2 text-yellow-400" />
                  Pro Tips
                </h3>
                <ul className="space-y-2 text-sm text-white/80">
                  <li>• Be specific about your budget and preferences</li>
                  <li>• Ask about neighborhood amenities and schools</li>
                  <li>• Inquire about future development plans</li>
                  <li>• Request investment potential analysis</li>
                </ul>
              </div>
            </div>
          </div>
        )}

        {/* Enhanced Recommendations Tab */}
        {activeTab === 'recommendations' && (
          <div className="space-y-8">
            <div className="text-center">
              <h2 className="text-4xl font-bold text-white mb-4">AI-Powered Recommendations</h2>
              <p className="text-xl text-white/70">Intelligent property curation based on advanced algorithms</p>
            </div>

            {recommendations.length > 0 ? (
              recommendations.map((category, index) => (
                <div key={index} className="bg-white/10 backdrop-blur-md rounded-3xl shadow-2xl p-8 border border-white/20">
                  <div className="flex items-center mb-6">
                    <div className={`w-12 h-12 bg-gradient-to-r ${category.color} rounded-2xl flex items-center justify-center mr-4`}>
                      <category.icon className="w-6 h-6 text-white" />
                    </div>
                    <h3 className="text-2xl font-bold text-white">{category.title}</h3>
                  </div>
                  <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                    {category.properties.map((property) => (
                      <div key={property.id} className="transform hover:scale-105 transition-all duration-300">
                        <PropertyCard
                          {...property}
                          formatPrice={formatPrice}
                          showViewButton={true}
                          isFavourite={favourites.includes(property.id)}
                          toggleFavourite={() => toggleFavourite(property.id)}
                        />
                      </div>
                    ))}
                  </div>
                </div>
              ))
            ) : (
              <div className="text-center py-12">
                <div className="w-16 h-16 bg-white/10 rounded-full flex items-center justify-center mx-auto mb-4">
                  <Loader2 className="w-8 h-8 text-white animate-spin" />
                </div>
                <p className="text-white/70">Loading AI recommendations...</p>
              </div>
            )}
          </div>
        )}

        {/* Enhanced Market Insights Tab */}
        {activeTab === 'insights' && (
          <div className="space-y-8">
            <div className="text-center">
              <h2 className="text-4xl font-bold text-white mb-4">Market Intelligence Dashboard</h2>
              <p className="text-xl text-white/70">Real-time analytics powered by machine learning</p>
            </div>

            {/* Enhanced Market Stats */}
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
              {[
                { icon: HomeIcon, label: 'Total Properties', value: allProperties.length, color: 'from-blue-500 to-cyan-500', trend: '+12%' },
                { icon: DollarSign, label: 'Avg. Price', value: `$${calculateAveragePrice()}K`, color: 'from-green-500 to-emerald-500', trend: '+8%' },
                { icon: TrendingUp, label: 'Market Growth', value: '+12%', color: 'from-purple-500 to-pink-500', trend: '+2%' },
                { icon: MapPin, label: 'Hot Location', value: 'Manama', color: 'from-orange-500 to-red-500', trend: 'Top' }
              ].map((stat, index) => (
                <div key={index} className="bg-white/10 backdrop-blur-md rounded-2xl shadow-xl p-6 border border-white/20 hover:bg-white/15 transition-all duration-300">
                  <div className={`w-12 h-12 bg-gradient-to-r ${stat.color} rounded-xl flex items-center justify-center mx-auto mb-4`}>
                    <stat.icon className="w-6 h-6 text-white" />
                  </div>
                  <div className="text-3xl font-bold text-white mb-2">{stat.value}</div>
                  <div className="text-white/70 text-sm mb-2">{stat.label}</div>
                  <div className="flex items-center justify-center">
                    <TrendingUp className="w-3 h-3 text-green-400 mr-1" />
                    <span className="text-green-400 text-xs">{stat.trend}</span>
                  </div>
                </div>
              ))}
            </div>

            {/* Price Analysis */}
            {allProperties.length > 0 && (
              <div className="bg-white/10 backdrop-blur-md rounded-3xl shadow-2xl p-8 border border-white/20">
                <h3 className="text-2xl font-bold text-white mb-6 flex items-center">
                  <BarChart3 className="w-6 h-6 mr-3 text-blue-400" />
                  Price Analysis by Location
                </h3>
                <div className="space-y-4">
                  {[...new Set(allProperties.map(p => p.location))].map((location, index) => {
                    const locationProps = allProperties.filter(p => p.location.includes(location));
                    const avgPrice = locationProps.reduce((sum, p) => sum + (p.price || 0), 0) / locationProps.length;
                    const maxPrice = Math.max(...allProperties.map(p => p.price || 0));
                    const percentage = maxPrice > 0 ? (avgPrice / maxPrice) * 100 : 0;
                    
                    return (
                      <div key={index} className="bg-white/5 rounded-xl p-4 hover:bg-white/10 transition-colors">
                        <div className="flex justify-between items-center mb-3">
                          <span className="font-medium text-white">{location}</span>
                          <span className="text-blue-400 font-semibold">${Math.round(avgPrice / 1000)}K</span>
                        </div>
                        <div className="w-full bg-white/20 rounded-full h-3">
                          <div 
                            className="bg-gradient-to-r from-blue-500 to-purple-600 h-3 rounded-full transition-all duration-1000 ease-out"
                            style={{ width: `${percentage}%` }}
                          ></div>
                        </div>
                        <div className="flex justify-between items-center mt-2 text-xs text-white/60">
                          <span>{locationProps.length} properties</span>
                          <span>{percentage.toFixed(1)}% of max</span>
                        </div>
                      </div>
                    );
                  })}
                </div>
              </div>
            )}

            {/* AI Market Analysis */}
            <div className="bg-gradient-to-br from-blue-500/20 to-purple-500/20 backdrop-blur-md rounded-3xl p-8 border border-blue-400/30">
              <div className="flex items-center mb-6">
                <Brain className="w-8 h-8 text-blue-400 mr-3" />
                <h3 className="text-2xl font-bold text-white">AI Market Intelligence</h3>
              </div>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div className="bg-white/10 rounded-2xl p-6 border border-white/20">
                  <h4 className="font-semibold text-white mb-3 flex items-center">
                    <Zap className="w-5 h-5 mr-2 text-yellow-400" />
                    Market Trends
                  </h4>
                  <ul className="space-y-2 text-white/80">
                    <li>• Waterfront properties +15% price growth</li>
                    <li>• 3BR apartments highest demand</li>
                    <li>• Manama leads in transaction volume</li>
                    <li>• Smart homes gaining 23% premium</li>
                  </ul>
                </div>
                <div className="bg-white/10 rounded-2xl p-6 border border-white/20">
                  <h4 className="font-semibold text-white mb-3 flex items-center">
                    <Target className="w-5 h-5 mr-2 text-green-400" />
                    Investment Insights
                  </h4>
                  <ul className="space-y-2 text-white/80">
                    <li>• Emerging areas: Hamad Town +8% ROI</li>
                    <li>• Furnished properties: 12% rental yield</li>
                    <li>• School proximity adds 18% value</li>
                    <li>• New developments: 25% appreciation</li>
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

const Heart = ({ className }) => (
  <svg className={className} viewBox="0 0 24 24" fill="currentColor">
    <path d="M12 21.35l-1.45-1.32C5.4 15.36 2 12.28 2 8.5 2 5.42 4.42 3 7.5 3c1.74 0 3.41.81 4.5 2.09C13.09 3.81 14.76 3 16.5 3 19.58 3 22 5.42 22 8.5c0 3.78-3.4 6.86-8.55 11.54L12 21.35z"/>
  </svg>
);

export default AIHelp;