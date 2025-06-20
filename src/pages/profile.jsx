// User profile page with modern design and functionality
import { useState, useEffect } from 'react'
import { User, Mail, Phone, MapPin, Edit3, Save, X, Camera, Heart, Eye, Calendar } from 'lucide-react'
import Navbar from '../components/layout/Navbar'
import { auth } from '../firebase'
import { userService, propertyService } from '../config/supabase'
import { useNavigate } from 'react-router-dom'

const Profile = () => {
  const [user, setUser] = useState(null)
  const [profile, setProfile] = useState({
    full_name: '',
    phone: '',
    location: '',
    bio: '',
    avatar_url: ''
  })
  const [isEditing, setIsEditing] = useState(false)
  const [loading, setLoading] = useState(true)
  const [saving, setSaving] = useState(false)
  const [stats, setStats] = useState({
    favorites: 0,
    views: 0,
    inquiries: 0
  })
  const navigate = useNavigate()

  useEffect(() => {
    const unsubscribe = auth.onAuthStateChanged(async (user) => {
      if (user) {
        setUser(user)
        await loadUserProfile(user.uid)
        await loadUserStats(user.uid)
      } else {
        navigate('/login')
      }
      setLoading(false)
    })

    return () => unsubscribe()
  }, [navigate])

  /**
   * Load user profile data from Supabase
   * @param {string} userId - User ID
   */
  const loadUserProfile = async (userId) => {
    try {
      const profileData = await userService.getUserProfile(userId)
      if (profileData) {
        setProfile(profileData)
      }
    } catch (error) {
      console.error('Error loading profile:', error)
    }
  }

  /**
   * Load user statistics (favorites, views, etc.)
   * @param {string} userId - User ID
   */
  const loadUserStats = async (userId) => {
    try {
      const favorites = await propertyService.getFavorites(userId)
      setStats({
        favorites: favorites.length,
        views: Math.floor(Math.random() * 50) + 10, // Mock data
        inquiries: Math.floor(Math.random() * 20) + 5 // Mock data
      })
    } catch (error) {
      console.error('Error loading stats:', error)
    }
  }

  /**
   * Handle profile form submission
   * @param {Event} e - Form event
   */
  const handleSaveProfile = async (e) => {
    e.preventDefault()
    if (!user) return

    setSaving(true)
    try {
      await userService.updateUserProfile(user.uid, profile)
      setIsEditing(false)
      alert('Profile updated successfully!')
    } catch (error) {
      console.error('Error saving profile:', error)
      alert('Error saving profile. Please try again.')
    } finally {
      setSaving(false)
    }
  }

  /**
   * Handle input changes
   * @param {string} field - Field name
   * @param {string} value - Field value
   */
  const handleInputChange = (field, value) => {
    setProfile(prev => ({ ...prev, [field]: value }))
  }

  /**
   * Handle avatar upload (mock implementation)
   */
  const handleAvatarUpload = () => {
    // In a real implementation, this would handle file upload
    alert('Avatar upload functionality would be implemented here')
  }

  if (loading) {
    return (
      <div className="min-h-screen bg-gray-50">
        <Navbar />
        <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
          <div className="animate-pulse">
            <div className="bg-white rounded-2xl shadow-lg p-8">
              <div className="flex items-center space-x-6 mb-8">
                <div className="w-24 h-24 bg-gray-300 rounded-full"></div>
                <div className="flex-1">
                  <div className="h-8 bg-gray-300 rounded mb-2"></div>
                  <div className="h-4 bg-gray-300 rounded w-1/2"></div>
                </div>
              </div>
              <div className="space-y-4">
                <div className="h-4 bg-gray-300 rounded"></div>
                <div className="h-4 bg-gray-300 rounded"></div>
                <div className="h-4 bg-gray-300 rounded w-3/4"></div>
              </div>
            </div>
          </div>
        </div>
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-gray-50">
      <Navbar />
      
      <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {/* Profile Header */}
        <div className="bg-white rounded-2xl shadow-lg overflow-hidden mb-8">
          {/* Cover Image */}
          <div className="h-48 bg-gradient-to-r from-blue-600 to-blue-800 relative">
            <div className="absolute inset-0 bg-black/20"></div>
            <div className="absolute bottom-6 left-8 text-white">
              <h1 className="text-3xl font-bold">My Profile</h1>
              <p className="text-blue-100">Manage your account and preferences</p>
            </div>
          </div>

          {/* Profile Info */}
          <div className="px-8 py-6">
            <div className="flex items-start justify-between">
              <div className="flex items-center space-x-6">
                {/* Avatar */}
                <div className="relative -mt-16">
                  <div className="w-24 h-24 bg-gradient-to-r from-blue-500 to-blue-600 rounded-full border-4 border-white shadow-lg flex items-center justify-center">
                    {profile.avatar_url ? (
                      <img
                        src={profile.avatar_url}
                        alt="Profile"
                        className="w-full h-full rounded-full object-cover"
                      />
                    ) : (
                      <User className="h-10 w-10 text-white" />
                    )}
                  </div>
                  <button
                    onClick={handleAvatarUpload}
                    className="absolute bottom-0 right-0 bg-white rounded-full p-2 shadow-lg hover:shadow-xl transition-all duration-200"
                  >
                    <Camera className="h-4 w-4 text-gray-600" />
                  </button>
                </div>

                {/* User Info */}
                <div className="pt-4">
                  <h2 className="text-2xl font-bold text-gray-900">
                    {profile.full_name || user?.email?.split('@')[0] || 'User'}
                  </h2>
                  <p className="text-gray-600 flex items-center mt-1">
                    <Mail className="h-4 w-4 mr-2" />
                    {user?.email}
                  </p>
                  {profile.location && (
                    <p className="text-gray-600 flex items-center mt-1">
                      <MapPin className="h-4 w-4 mr-2" />
                      {profile.location}
                    </p>
                  )}
                </div>
              </div>

              {/* Edit Button */}
              <button
                onClick={() => setIsEditing(!isEditing)}
                className="flex items-center space-x-2 bg-blue-600 text-white px-4 py-2 rounded-lg hover:bg-blue-700 transition-colors"
              >
                {isEditing ? (
                  <>
                    <X className="h-4 w-4" />
                    <span>Cancel</span>
                  </>
                ) : (
                  <>
                    <Edit3 className="h-4 w-4" />
                    <span>Edit Profile</span>
                  </>
                )}
              </button>
            </div>
          </div>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          {/* Profile Form */}
          <div className="lg:col-span-2">
            <div className="bg-white rounded-2xl shadow-lg p-8">
              <h3 className="text-xl font-bold text-gray-900 mb-6">Profile Information</h3>
              
              <form onSubmit={handleSaveProfile} className="space-y-6">
                {/* Full Name */}
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Full Name
                  </label>
                  <input
                    type="text"
                    value={profile.full_name}
                    onChange={(e) => handleInputChange('full_name', e.target.value)}
                    disabled={!isEditing}
                    className="w-full px-4 py-3 border border-gray-200 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent disabled:bg-gray-50 disabled:text-gray-500"
                    placeholder="Enter your full name"
                  />
                </div>

                {/* Phone */}
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Phone Number
                  </label>
                  <input
                    type="tel"
                    value={profile.phone}
                    onChange={(e) => handleInputChange('phone', e.target.value)}
                    disabled={!isEditing}
                    className="w-full px-4 py-3 border border-gray-200 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent disabled:bg-gray-50 disabled:text-gray-500"
                    placeholder="+973 XXXX XXXX"
                  />
                </div>

                {/* Location */}
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Location
                  </label>
                  <select
                    value={profile.location}
                    onChange={(e) => handleInputChange('location', e.target.value)}
                    disabled={!isEditing}
                    className="w-full px-4 py-3 border border-gray-200 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent disabled:bg-gray-50 disabled:text-gray-500"
                  >
                    <option value="">Select your location</option>
                    <option value="Manama">Manama</option>
                    <option value="Riffa">Riffa</option>
                    <option value="Muharraq">Muharraq</option>
                    <option value="Hamad Town">Hamad Town</option>
                    <option value="Isa Town">Isa Town</option>
                    <option value="Juffair">Juffair</option>
                    <option value="Seef">Seef</option>
                    <option value="Adliya">Adliya</option>
                  </select>
                </div>

                {/* Bio */}
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Bio
                  </label>
                  <textarea
                    value={profile.bio}
                    onChange={(e) => handleInputChange('bio', e.target.value)}
                    disabled={!isEditing}
                    rows={4}
                    className="w-full px-4 py-3 border border-gray-200 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent disabled:bg-gray-50 disabled:text-gray-500"
                    placeholder="Tell us about yourself..."
                  />
                </div>

                {/* Save Button */}
                {isEditing && (
                  <button
                    type="submit"
                    disabled={saving}
                    className="w-full bg-gradient-to-r from-blue-600 to-blue-700 text-white py-3 px-4 rounded-lg hover:from-blue-700 hover:to-blue-800 transition-all duration-200 flex items-center justify-center space-x-2 font-medium shadow-lg hover:shadow-xl disabled:opacity-50"
                  >
                    <Save className="h-4 w-4" />
                    <span>{saving ? 'Saving...' : 'Save Changes'}</span>
                  </button>
                )}
              </form>
            </div>
          </div>

          {/* Stats Sidebar */}
          <div className="space-y-6">
            {/* Activity Stats */}
            <div className="bg-white rounded-2xl shadow-lg p-6">
              <h3 className="text-lg font-bold text-gray-900 mb-4">Activity</h3>
              <div className="space-y-4">
                <div className="flex items-center justify-between">
                  <div className="flex items-center space-x-3">
                    <div className="p-2 bg-red-100 rounded-lg">
                      <Heart className="h-4 w-4 text-red-600" />
                    </div>
                    <span className="text-gray-700">Favorites</span>
                  </div>
                  <span className="font-bold text-gray-900">{stats.favorites}</span>
                </div>
                
                <div className="flex items-center justify-between">
                  <div className="flex items-center space-x-3">
                    <div className="p-2 bg-blue-100 rounded-lg">
                      <Eye className="h-4 w-4 text-blue-600" />
                    </div>
                    <span className="text-gray-700">Property Views</span>
                  </div>
                  <span className="font-bold text-gray-900">{stats.views}</span>
                </div>
                
                <div className="flex items-center justify-between">
                  <div className="flex items-center space-x-3">
                    <div className="p-2 bg-green-100 rounded-lg">
                      <Calendar className="h-4 w-4 text-green-600" />
                    </div>
                    <span className="text-gray-700">Inquiries</span>
                  </div>
                  <span className="font-bold text-gray-900">{stats.inquiries}</span>
                </div>
              </div>
            </div>

            {/* Quick Actions */}
            <div className="bg-white rounded-2xl shadow-lg p-6">
              <h3 className="text-lg font-bold text-gray-900 mb-4">Quick Actions</h3>
              <div className="space-y-3">
                <a
                  href="/favorites"
                  className="block w-full text-left px-4 py-3 bg-gray-50 hover:bg-gray-100 rounded-lg transition-colors"
                >
                  View My Favorites
                </a>
                <a
                  href="/buy"
                  className="block w-full text-left px-4 py-3 bg-gray-50 hover:bg-gray-100 rounded-lg transition-colors"
                >
                  Browse Properties
                </a>
                <a
                  href="/ai-assistant"
                  className="block w-full text-left px-4 py-3 bg-gray-50 hover:bg-gray-100 rounded-lg transition-colors"
                >
                  Get AI Assistance
                </a>
              </div>
            </div>

            {/* Account Info */}
            <div className="bg-white rounded-2xl shadow-lg p-6">
              <h3 className="text-lg font-bold text-gray-900 mb-4">Account</h3>
              <div className="space-y-3 text-sm text-gray-600">
                <div>
                  <span className="font-medium">Member since:</span>
                  <br />
                  {user?.metadata?.creationTime ? 
                    new Date(user.metadata.creationTime).toLocaleDateString() : 
                    'Recently'
                  }
                </div>
                <div>
                  <span className="font-medium">Last sign in:</span>
                  <br />
                  {user?.metadata?.lastSignInTime ? 
                    new Date(user.metadata.lastSignInTime).toLocaleDateString() : 
                    'Today'
                  }
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}

export default Profile