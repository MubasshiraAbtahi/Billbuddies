import React, { useState, useEffect } from 'react';
import { FiEdit2, FiSave, FiX } from 'react-icons/fi';
import toast from 'react-hot-toast';
import apiClient from '../utils/api';
import { useAuth } from '../context/AuthContext';

const ProfilePage = () => {
  const { user, logout } = useAuth();
  const [profile, setProfile] = useState(user);
  const [isEditing, setIsEditing] = useState(false);
  const [loading, setLoading] = useState(false);
  const [formData, setFormData] = useState({
    firstName: user?.firstName || '',
    lastName: user?.lastName || '',
    username: user?.username || '',
    phoneNumber: user?.phoneNumber || '',
    bio: user?.bio || '',
  });

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData(prev => ({
      ...prev,
      [name]: value
    }));
  };

  const handleSaveProfile = async () => {
    setLoading(true);
    try {
      const response = await apiClient.put('/user/profile', formData);
      setProfile(response.data.user);
      setIsEditing(false);
      toast.success('Profile updated successfully!');
    } catch (error) {
      toast.error('Failed to update profile');
    } finally {
      setLoading(false);
    }
  };

  const handleCancel = () => {
    setFormData({
      firstName: profile?.firstName || '',
      lastName: profile?.lastName || '',
      username: profile?.username || '',
      phoneNumber: profile?.phoneNumber || '',
      bio: profile?.bio || '',
    });
    setIsEditing(false);
  };

  const handleLogout = () => {
    logout();
  };

  return (
    <div className="max-w-2xl mx-auto space-y-6">
      {/* Profile Card */}
      <div className="bg-white rounded-lg border p-8">
        <div className="flex justify-between items-center mb-6">
          <h1 className="text-3xl font-bold">Profile Settings</h1>
          {!isEditing && (
            <button
              onClick={() => setIsEditing(true)}
              className="flex items-center gap-2 px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700"
            >
              <FiEdit2 /> Edit Profile
            </button>
          )}
        </div>

        {isEditing ? (
          <form className="space-y-4">
            <div className="grid grid-cols-2 gap-4">
              <div>
                <label className="block text-sm font-medium mb-1">First Name</label>
                <input
                  type="text"
                  name="firstName"
                  value={formData.firstName}
                  onChange={handleChange}
                  className="w-full px-4 py-2 border rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                />
              </div>
              <div>
                <label className="block text-sm font-medium mb-1">Last Name</label>
                <input
                  type="text"
                  name="lastName"
                  value={formData.lastName}
                  onChange={handleChange}
                  className="w-full px-4 py-2 border rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                />
              </div>
            </div>

            <div>
              <label className="block text-sm font-medium mb-1">Username</label>
              <input
                type="text"
                name="username"
                value={formData.username}
                onChange={handleChange}
                className="w-full px-4 py-2 border rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
              />
            </div>

            <div>
              <label className="block text-sm font-medium mb-1">Phone Number</label>
              <input
                type="tel"
                name="phoneNumber"
                value={formData.phoneNumber}
                onChange={handleChange}
                className="w-full px-4 py-2 border rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
              />
            </div>

            <div>
              <label className="block text-sm font-medium mb-1">Bio</label>
              <textarea
                name="bio"
                value={formData.bio}
                onChange={handleChange}
                className="w-full px-4 py-2 border rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                rows={4}
              />
            </div>

            <div className="flex gap-2">
              <button
                type="button"
                onClick={handleSaveProfile}
                disabled={loading}
                className="flex items-center gap-2 px-4 py-2 bg-green-600 text-white rounded-lg hover:bg-green-700 disabled:opacity-50"
              >
                <FiSave /> Save Changes
              </button>
              <button
                type="button"
                onClick={handleCancel}
                className="flex items-center gap-2 px-4 py-2 border rounded-lg hover:bg-gray-50"
              >
                <FiX /> Cancel
              </button>
            </div>
          </form>
        ) : (
          <div className="space-y-4">
            <div className="grid grid-cols-2 gap-4">
              <div>
                <p className="text-sm text-gray-600">First Name</p>
                <p className="font-semibold">{profile?.firstName}</p>
              </div>
              <div>
                <p className="text-sm text-gray-600">Last Name</p>
                <p className="font-semibold">{profile?.lastName}</p>
              </div>
            </div>

            <div>
              <p className="text-sm text-gray-600">Username</p>
              <p className="font-semibold">{profile?.username}</p>
            </div>

            <div>
              <p className="text-sm text-gray-600">Email</p>
              <p className="font-semibold">{profile?.email}</p>
            </div>

            {profile?.phoneNumber && (
              <div>
                <p className="text-sm text-gray-600">Phone</p>
                <p className="font-semibold">{profile?.phoneNumber}</p>
              </div>
            )}

            {profile?.bio && (
              <div>
                <p className="text-sm text-gray-600">Bio</p>
                <p className="font-semibold">{profile?.bio}</p>
              </div>
            )}
          </div>
        )}
      </div>

      {/* Logout Section */}
      <div className="bg-red-50 border border-red-200 rounded-lg p-6">
        <h2 className="text-lg font-bold text-red-900 mb-2">Logout</h2>
        <p className="text-red-700 mb-4">You will be logged out from all sessions.</p>
        <button
          onClick={handleLogout}
          className="px-4 py-2 bg-red-600 text-white rounded-lg hover:bg-red-700"
        >
          Logout Now
        </button>
      </div>
    </div>
  );
};

export default ProfilePage;
