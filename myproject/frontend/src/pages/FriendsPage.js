import React, { useState, useEffect } from 'react';
import toast from 'react-hot-toast';
import apiClient from '../utils/api';
import { FiPlus, FiX } from 'react-icons/fi';

const FriendsPage = () => {
  const [friends, setFriends] = useState([]);
  const [requests, setRequests] = useState([]);
  const [loading, setLoading] = useState(true);
  const [showAddFriend, setShowAddFriend] = useState(false);
  const [searchQuery, setSearchQuery] = useState('');
  const [searchResults, setSearchResults] = useState([]);

  useEffect(() => {
    fetchFriendsData();
  }, []);

  const fetchFriendsData = async () => {
    try {
      const [friendsRes, requestsRes] = await Promise.all([
        apiClient.get('/friend/list'),
        apiClient.get('/friend/requests'),
      ]);
      setFriends(friendsRes.data.friends);
      setRequests(requestsRes.data.requests);
    } catch (error) {
      toast.error('Failed to load friends');
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
      const response = await apiClient.get(`/user/search?query=${query}`);
      setSearchResults(response.data.users);
    } catch (error) {
      toast.error('Search failed');
    }
  };

  const handleSendRequest = async (recipientId) => {
    try {
      const user = searchResults.find(u => u._id === recipientId);
      await apiClient.post('/friend/request/send', {
        recipientEmail: user.email,
      });
      toast.success('Friend request sent!');
      setSearchQuery('');
      setSearchResults([]);
    } catch (error) {
      toast.error('Failed to send request');
    }
  };

  const handleAcceptRequest = async (requestId) => {
    try {
      await apiClient.post(`/friend/request/accept/${requestId}`);
      toast.success('Friend request accepted!');
      fetchFriendsData();
    } catch (error) {
      toast.error('Failed to accept request');
    }
  };

  const handleDeclineRequest = async (requestId) => {
    try {
      await apiClient.post(`/friend/request/decline/${requestId}`);
      toast.success('Friend request declined');
      fetchFriendsData();
    } catch (error) {
      toast.error('Failed to decline request');
    }
  };

  const handleRemoveFriend = async (friendId) => {
    try {
      await apiClient.post(`/friend/remove/${friendId}`);
      toast.success('Friend removed');
      fetchFriendsData();
    } catch (error) {
      toast.error('Failed to remove friend');
    }
  };

  if (loading) return <div className="text-center py-8">Loading...</div>;

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex justify-between items-center">
        <h1 className="text-3xl font-bold">Friends</h1>
        <button
          onClick={() => setShowAddFriend(!showAddFriend)}
          className="flex items-center gap-2 px-4 py-2 bg-indigo-600 text-white rounded-lg hover:bg-indigo-700"
        >
          <FiPlus /> Add Friend
        </button>
      </div>

      {/* Add Friend Section */}
      {showAddFriend && (
        <div className="bg-white p-6 rounded-lg border">
          <div className="space-y-4">
            <input
              type="text"
              placeholder="Search by email or username..."
              value={searchQuery}
              onChange={(e) => handleSearch(e.target.value)}
              className="w-full px-4 py-2 border rounded-lg focus:outline-none focus:ring-2 focus:ring-indigo-500"
            />
            {searchResults.length > 0 && (
              <div className="space-y-2 max-h-64 overflow-y-auto">
                {searchResults.map((user) => (
                  <div key={user._id} className="flex justify-between items-center p-3 bg-gray-50 rounded">
                    <div>
                      <p className="font-semibold">{user.username}</p>
                      <p className="text-sm text-gray-600">{user.email}</p>
                    </div>
                    <button
                      onClick={() => handleSendRequest(user._id)}
                      className="px-3 py-1 bg-blue-600 text-white rounded hover:bg-blue-700 text-sm"
                    >
                      Send Request
                    </button>
                  </div>
                ))}
              </div>
            )}
          </div>
        </div>
      )}

      {/* Friend Requests */}
      {requests.length > 0 && (
        <div className="bg-white p-6 rounded-lg border">
          <h2 className="text-xl font-bold mb-4">Friend Requests ({requests.length})</h2>
          <div className="space-y-2">
            {requests.map((request) => (
              <div key={request._id} className="flex justify-between items-center p-4 bg-yellow-50 rounded">
                <div>
                  <p className="font-semibold">{request.sender.username}</p>
                  <p className="text-sm text-gray-600">{request.sender.email}</p>
                </div>
                <div className="flex gap-2">
                  <button
                    onClick={() => handleAcceptRequest(request._id)}
                    className="px-3 py-1 bg-green-600 text-white rounded hover:bg-green-700 text-sm"
                  >
                    Accept
                  </button>
                  <button
                    onClick={() => handleDeclineRequest(request._id)}
                    className="px-3 py-1 bg-red-600 text-white rounded hover:bg-red-700 text-sm"
                  >
                    Decline
                  </button>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Friends List */}
      <div className="bg-white p-6 rounded-lg border">
        <h2 className="text-xl font-bold mb-4">Friends ({friends.length})</h2>
        <div className="space-y-2">
          {friends.length > 0 ? (
            friends.map((friend) => (
              <div key={friend._id} className="flex justify-between items-center p-4 bg-gray-50 rounded">
                <div className="flex items-center gap-4">
                  {friend.profilePicture && (
                    <img
                      src={friend.profilePicture}
                      alt={friend.username}
                      className="w-12 h-12 rounded-full"
                    />
                  )}
                  <div>
                    <p className="font-semibold">{friend.username}</p>
                    <p className="text-sm text-gray-600">{friend.email}</p>
                  </div>
                </div>
                <button
                  onClick={() => handleRemoveFriend(friend._id)}
                  className="text-red-600 hover:text-red-800"
                >
                  <FiX size={20} />
                </button>
              </div>
            ))
          ) : (
            <p className="text-gray-500">No friends yet</p>
          )}
        </div>
      </div>
    </div>
  );
};

export default FriendsPage;
