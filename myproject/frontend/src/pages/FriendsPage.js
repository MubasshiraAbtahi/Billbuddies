import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import TopNav from '../components/TopNav';
import { ColorfulButton, ProfileCircle, LoadingSpinner, EmptyState, AnimatedTab, Badge } from '../components/UI';
import toast from 'react-hot-toast';
import { MagnifyingGlassIcon } from '@heroicons/react/24/outline';

function FriendsPage() {
  const navigate = useNavigate();
  const [activeTab, setActiveTab] = useState('friends');
  const [friends, setFriends] = useState([]);
  const [pendingRequests, setPendingRequests] = useState([]);
  const [searchQuery, setSearchQuery] = useState('');
  const [searchResults, setSearchResults] = useState([]);
  const [loading, setLoading] = useState(false);
  const [showSearch, setShowSearch] = useState(false);

  useEffect(() => {
    if (activeTab === 'friends') {
      fetchFriends();
    } else if (activeTab === 'pending') {
      fetchPendingRequests();
    }
  }, [activeTab]);

  const fetchFriends = async () => {
    try {
      setLoading(true);
      const response = await fetch('/api/friend/list', {
        headers: {
          Authorization: `Bearer ${localStorage.getItem('token')}`,
        },
      });
      const data = await response.json();
      if (data.success) {
        setFriends(data.data);
      }
    } catch (error) {
      toast.error('Failed to load friends');
    } finally {
      setLoading(false);
    }
  };

  const fetchPendingRequests = async () => {
    try {
      setLoading(true);
      const response = await fetch('/api/friend/requests', {
        headers: {
          Authorization: `Bearer ${localStorage.getItem('token')}`,
        },
      });
      const data = await response.json();
      if (data.success) {
        setPendingRequests(data.data);
      }
    } catch (error) {
      toast.error('Failed to load requests');
    } finally {
      setLoading(false);
    }
  };

  const handleSearch = async (query) => {
    setSearchQuery(query);
    if (query.length < 2) {
      setSearchResults([]);
      return;
    }

    try {
      const response = await fetch(`/api/friend/search?query=${query}`, {
        headers: {
          Authorization: `Bearer ${localStorage.getItem('token')}`,
        },
      });
      const data = await response.json();
      if (data.success) {
        setSearchResults(data.data);
      }
    } catch (error) {
      toast.error('Search failed');
    }
  };

  const handleAcceptRequest = async (requestId) => {
    try {
      const response = await fetch(`/api/friend/request/accept/${requestId}`, {
        method: 'POST',
        headers: {
          Authorization: `Bearer ${localStorage.getItem('token')}`,
        },
      });
      const data = await response.json();
      if (data.success) {
        toast.success('Friend request accepted! 🎉');
        fetchPendingRequests();
        fetchFriends();
      }
    } catch (error) {
      toast.error('Failed to accept request');
    }
  };

  const handleDeclineRequest = async (requestId) => {
    try {
      const response = await fetch(`/api/friend/request/decline/${requestId}`, {
        method: 'POST',
        headers: {
          Authorization: `Bearer ${localStorage.getItem('token')}`,
        },
      });
      const data = await response.json();
      if (data.success) {
        toast.success('Request declined');
        fetchPendingRequests();
      }
    } catch (error) {
      toast.error('Failed to decline request');
    }
  };

  const handleSendRequest = async (userId) => {
    try {
      const response = await fetch('/api/friend/request/send', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${localStorage.getItem('token')}`,
        },
        body: JSON.stringify({ recipientId: userId }),
      });
      const data = await response.json();
      if (data.success) {
        toast.success('Friend request sent! 📨');
        setSearchQuery('');
        setSearchResults([]);
        setShowSearch(false);
      }
    } catch (error) {
      toast.error('Failed to send request');
    }
  };

  const tabs = [
    { id: 'friends', label: `👥 Friends (${friends.length})` },
    { id: 'pending', label: `⏳ Pending (${pendingRequests.length})` },
    { id: 'search', label: '🔍 Add Friend' },
  ];

  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-50 to-gray-100">
      <TopNav />

      <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {/* Header */}
        <div className="mb-8 animate-slide-up">
          <h1 className="text-4xl font-bold text-gray-900 mb-2">🤝 Friends</h1>
          <p className="text-gray-600">Build your network and share expenses together</p>
        </div>

        {/* Tabs */}
        <div className="mb-8 animate-slide-up" style={{ animationDelay: '0.1s' }}>
          <div className="flex gap-2 bg-white rounded-2xl p-2 shadow-subtle">
            {['friends', 'pending', 'search'].map((tab) => (
              <button
                key={tab}
                onClick={() => {
                  setActiveTab(tab);
                  if (tab === 'friends') fetchFriends();
                  if (tab === 'pending') fetchPendingRequests();
                }}
                className={`flex-1 px-4 py-3 rounded-xl font-semibold transition-all duration-300 ${
                  activeTab === tab
                    ? 'bg-gradient-sunset text-white shadow-medium'
                    : 'text-gray-700 hover:bg-gray-100'
                }`}
              >
                {tab === 'friends' && `👥 Friends (${friends.length})`}
                {tab === 'pending' && `⏳ Pending (${pendingRequests.length})`}
                {tab === 'search' && '➕ Add Friend'}
              </button>
            ))}
          </div>
        </div>

        {/* Loading State */}
        {loading && (
          <div className="flex justify-center items-center py-12">
            <LoadingSpinner size="lg" color="brand-pink" />
          </div>
        )}

        {/* Friends Tab */}
        {!loading && activeTab === 'friends' && (
          <div className="space-y-4 animate-slide-up" style={{ animationDelay: '0.2s' }}>
            {friends.length === 0 ? (
              <EmptyState
                icon="🤝"
                title="No friends yet"
                description="Start by adding friends to share expenses with them!"
                action={() => setActiveTab('search')}
                actionText="Add Your First Friend"
              />
            ) : (
              <div className="grid gap-4">
                {friends.map((friend, index) => (
                  <div
                    key={friend._id}
                    className="bg-white rounded-2xl p-5 shadow-subtle hover:shadow-medium hover:-translate-y-1 transition-all duration-300 animate-slide-up"
                    style={{ animationDelay: `${index * 0.05}s` }}
                  >
                    <div className="flex items-center justify-between">
                      <div className="flex items-center gap-4">
                        <ProfileCircle
                          name={`${friend.firstName} ${friend.lastName}`}
                          image={friend.profilePicture}
                          color="bg-brand-pink"
                          size="md"
                        />
                        <div className="flex-1">
                          <h3 className="font-bold text-gray-900">
                            {friend.firstName} {friend.lastName}
                          </h3>
                          <p className="text-sm text-gray-600">{friend.email}</p>
                        </div>
                      </div>
                      <Badge variant="success">✓ Friends</Badge>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>
        )}

        {/* Pending Requests Tab */}
        {!loading && activeTab === 'pending' && (
          <div className="space-y-4 animate-slide-up" style={{ animationDelay: '0.2s' }}>
            {pendingRequests.length === 0 ? (
              <EmptyState
                icon="📭"
                title="No pending requests"
                description="You're all caught up! Check back later for new friend requests."
              />
            ) : (
              <div className="grid gap-4">
                {pendingRequests.map((request, index) => (
                  <div
                    key={request._id}
                    className="bg-white rounded-2xl p-5 shadow-subtle hover:shadow-medium transition-all duration-300 animate-slide-up"
                    style={{ animationDelay: `${index * 0.05}s` }}
                  >
                    <div className="flex items-center justify-between">
                      <div className="flex items-center gap-4">
                        <ProfileCircle
                          name={`${request.sender.firstName} ${request.sender.lastName}`}
                          image={request.sender.profilePicture}
                          color="bg-brand-orange"
                          size="md"
                        />
                        <div className="flex-1">
                          <h3 className="font-bold text-gray-900">
                            {request.sender.firstName} {request.sender.lastName}
                          </h3>
                          <p className="text-sm text-gray-600">{request.sender.email}</p>
                          <p className="text-xs text-gray-500 mt-1">Wants to be your friend</p>
                        </div>
                      </div>
                      <div className="flex gap-2">
                        <ColorfulButton
                          variant="ghost"
                          size="sm"
                          onClick={() => handleDeclineRequest(request._id)}
                        >
                          ✗ Decline
                        </ColorfulButton>
                        <ColorfulButton
                          gradient="success"
                          size="sm"
                          onClick={() => handleAcceptRequest(request._id)}
                        >
                          ✓ Accept
                        </ColorfulButton>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>
        )}

        {/* Search/Add Friend Tab */}
        {!loading && activeTab === 'search' && (
          <div className="space-y-6 animate-slide-up" style={{ animationDelay: '0.2s' }}>
            {/* Search Input */}
            <div className="relative">
              <div className="absolute inset-y-0 left-0 pl-4 flex items-center pointer-events-none">
                <MagnifyingGlassIcon className="w-5 h-5 text-gray-400" />
              </div>
              <input
                type="text"
                placeholder="Search by email, name, or username..."
                value={searchQuery}
                onChange={(e) => handleSearch(e.target.value)}
                className="w-full pl-12 pr-4 py-3 rounded-xl border-2 border-brand-teal hover:border-brand-pink focus:outline-none focus:border-brand-pink transition-colors text-gray-900 placeholder-gray-500"
              />
            </div>

            {/* Search Results */}
            {searchQuery.length > 1 && searchResults.length === 0 && (
              <EmptyState
                icon="🔍"
                title="No results found"
                description={`We couldn't find anyone matching "${searchQuery}". Try a different search.`}
              />
            )}

            {searchResults.length > 0 && (
              <div className="space-y-3">
                <p className="text-sm font-semibold text-gray-700">
                  Found {searchResults.length} result{searchResults.length !== 1 ? 's' : ''}
                </p>
                {searchResults.map((user, index) => (
                  <div
                    key={user._id}
                    className="bg-white rounded-2xl p-5 shadow-subtle hover:shadow-medium transition-all duration-300 animate-slide-up"
                    style={{ animationDelay: `${index * 0.05}s` }}
                  >
                    <div className="flex items-center justify-between">
                      <div className="flex items-center gap-4">
                        <ProfileCircle
                          name={`${user.firstName} ${user.lastName}`}
                          image={user.profilePicture}
                          color="bg-brand-teal"
                          size="md"
                        />
                        <div className="flex-1">
                          <h3 className="font-bold text-gray-900">
                            {user.firstName} {user.lastName}
                          </h3>
                          <p className="text-sm text-gray-600">{user.email}</p>
                          {user.username && (
                            <p className="text-xs text-gray-500">@{user.username}</p>
                          )}
                        </div>
                      </div>
                      <ColorfulButton
                        gradient="ocean"
                        size="sm"
                        onClick={() => handleSendRequest(user._id)}
                      >
                        ➕ Add Friend
                      </ColorfulButton>
                    </div>
                  </div>
                ))}
              </div>
            )}

            {searchQuery.length === 0 && (
              <EmptyState
                icon="📧"
                title="Search for friends"
                description="Enter a name, email, or username to find people to add as friends."
              />
            )}
          </div>
        )}
      </div>
    </div>
  );
}

export default FriendsPage;
