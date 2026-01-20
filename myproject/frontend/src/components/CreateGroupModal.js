import React, { useState, useEffect } from 'react';
import { Formik, Form, Field, ErrorMessage } from 'formik';
import * as Yup from 'yup';
import toast from 'react-hot-toast';
import apiClient from '../utils/api';

const groupSchema = Yup.object().shape({
  name: Yup.string()
    .required('Group name is required')
    .min(2, 'Group name must be at least 2 characters'),
  description: Yup.string()
    .max(500, 'Description must not exceed 500 characters'),
  icon: Yup.string(),
});

// Emoji picker options
const EMOJI_OPTIONS = ['👥', '🎉', '🏠', '✈️', '💰', '🍽️', '🎓', '⚽', '📚', '🎵'];

const CreateGroupModal = ({ isOpen, onClose, onGroupCreated }) => {
  const [friends, setFriends] = useState([]);
  const [selectedMembers, setSelectedMembers] = useState([]);
  const [searchQuery, setSearchQuery] = useState('');
  const [loadingFriends, setLoadingFriends] = useState(false);
  const [currentStep, setCurrentStep] = useState(1); // Step 1: Info, Step 2: Members
  const [selectedIcon, setSelectedIcon] = useState('👥');

  // Fetch friends list when modal opens
  useEffect(() => {
    if (isOpen) {
      fetchFriends();
    }
  }, [isOpen]);

  const fetchFriends = async () => {
    try {
      setLoadingFriends(true);
      const response = await apiClient.get('/friend/list');
      if (response.data.success) {
        setFriends(response.data.data);
      } else {
        // If no friends endpoint, fallback to empty
        setFriends([]);
      }
    } catch (error) {
      console.log('Could not fetch friends:', error.message);
      setFriends([]);
    } finally {
      setLoadingFriends(false);
    }
  };

  // Filter friends based on search
  const filteredFriends = friends.filter(
    (friend) =>
      friend.firstName.toLowerCase().includes(searchQuery.toLowerCase()) ||
      friend.lastName.toLowerCase().includes(searchQuery.toLowerCase()) ||
      friend.email.toLowerCase().includes(searchQuery.toLowerCase())
  );

  // Toggle member selection
  const toggleMember = (memberId) => {
    setSelectedMembers((prev) =>
      prev.includes(memberId) ? prev.filter((id) => id !== memberId) : [...prev, memberId]
    );
  };

  const handleSubmit = async (values, { setSubmitting }) => {
    try {
      // Verify at least one member is selected
      if (selectedMembers.length === 0) {
        toast.error('Please select at least one member');
        setSubmitting(false);
        return;
      }

      const response = await apiClient.post('/group/create', {
        name: values.name,
        description: values.description,
        icon: selectedIcon,
        members: selectedMembers,
      });

      if (response.data.success) {
        toast.success('Group created successfully! 🎉');
        onGroupCreated(response.data.group);
        // Reset form
        setCurrentStep(1);
        setSelectedMembers([]);
        setSearchQuery('');
        setSelectedIcon('👥');
        onClose();
      }
    } catch (error) {
      const message = error.response?.data?.message || 'Failed to create group';
      toast.error(message);
    } finally {
      setSubmitting(false);
    }
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
      <div className="bg-white rounded-lg p-8 w-full max-w-2xl max-h-[90vh] overflow-y-auto">
        <h2 className="text-2xl font-bold mb-2">Create New Group</h2>
        <p className="text-gray-600 mb-6">
          {currentStep === 1 ? 'Step 1: Group Details' : 'Step 2: Select Members'}
        </p>

        <Formik
          initialValues={{
            name: '',
            description: '',
            icon: '👥',
          }}
          validationSchema={groupSchema}
          onSubmit={handleSubmit}
        >
          {({ isSubmitting, values }) => (
            <Form className="space-y-6">
              {/* Step 1: Group Information */}
              {currentStep === 1 && (
                <>
                  {/* Group Icon Selection */}
                  <div>
                    <label className="block text-sm font-medium mb-3">Group Icon</label>
                    <div className="flex gap-2 flex-wrap">
                      {EMOJI_OPTIONS.map((emoji) => (
                        <button
                          key={emoji}
                          type="button"
                          onClick={() => setSelectedIcon(emoji)}
                          className={`text-3xl p-3 rounded-lg border-2 transition-all ${
                            selectedIcon === emoji
                              ? 'border-indigo-600 bg-indigo-50'
                              : 'border-gray-200 hover:border-gray-300'
                          }`}
                        >
                          {emoji}
                        </button>
                      ))}
                    </div>
                  </div>

                  {/* Group Name */}
                  <div>
                    <label htmlFor="name" className="block text-sm font-medium mb-1">
                      Group Name *
                    </label>
                    <Field
                      type="text"
                      id="name"
                      name="name"
                      placeholder="e.g., Roommates, Vegas Trip, College Friends"
                      className="w-full border border-gray-300 rounded px-3 py-2 focus:outline-none focus:ring-2 focus:ring-indigo-600"
                    />
                    <ErrorMessage
                      name="name"
                      component="div"
                      className="text-red-500 text-sm mt-1"
                    />
                  </div>

                  {/* Description */}
                  <div>
                    <label htmlFor="description" className="block text-sm font-medium mb-1">
                      Description (Optional)
                    </label>
                    <Field
                      as="textarea"
                      id="description"
                      name="description"
                      placeholder="What is this group for? e.g., 'Sharing expenses for our Vegas trip'"
                      className="w-full border border-gray-300 rounded px-3 py-2 focus:outline-none focus:ring-2 focus:ring-indigo-600"
                      rows={3}
                    />
                    <ErrorMessage
                      name="description"
                      component="div"
                      className="text-red-500 text-sm mt-1"
                    />
                  </div>

                  {/* Friends Preview */}
                  <div className="bg-blue-50 border border-blue-200 rounded-lg p-4">
                    <p className="text-sm font-medium text-blue-900">
                      ℹ️ You have {friends.length} friend{friends.length !== 1 ? 's' : ''} available to add
                    </p>
                  </div>
                </>
              )}

              {/* Step 2: Select Members */}
              {currentStep === 2 && (
                <>
                  {/* Search Friends */}
                  <div>
                    <label htmlFor="search" className="block text-sm font-medium mb-2">
                      Search Friends
                    </label>
                    <input
                      type="text"
                      id="search"
                      placeholder="Search by name or email..."
                      value={searchQuery}
                      onChange={(e) => setSearchQuery(e.target.value)}
                      className="w-full border border-gray-300 rounded px-3 py-2 focus:outline-none focus:ring-2 focus:ring-indigo-600"
                    />
                  </div>

                  {/* Selected Count */}
                  <div className="bg-indigo-50 border border-indigo-200 rounded-lg p-4">
                    <p className="text-sm font-medium text-indigo-900">
                      {selectedMembers.length === 0
                        ? '👥 Select at least one friend to continue'
                        : `✓ ${selectedMembers.length} member${selectedMembers.length !== 1 ? 's' : ''} selected`}
                    </p>
                  </div>

                  {/* Friends List */}
                  <div className="border border-gray-200 rounded-lg max-h-96 overflow-y-auto">
                    {loadingFriends ? (
                      <div className="p-8 text-center">
                        <p className="text-gray-500">Loading friends...</p>
                      </div>
                    ) : filteredFriends.length === 0 ? (
                      <div className="p-8 text-center">
                        <p className="text-gray-500">
                          {friends.length === 0
                            ? 'No friends yet. Add friends to create a group!'
                            : 'No friends match your search'}
                        </p>
                      </div>
                    ) : (
                      <div className="divide-y">
                        {filteredFriends.map((friend) => (
                          <div
                            key={friend._id}
                            className="flex items-center gap-3 p-4 hover:bg-gray-50 cursor-pointer transition-colors"
                            onClick={() => toggleMember(friend._id)}
                          >
                            <input
                              type="checkbox"
                              checked={selectedMembers.includes(friend._id)}
                              onChange={() => {}} // Controlled by parent click
                              className="w-4 h-4 rounded border-gray-300 text-indigo-600"
                            />
                            <div className="flex-1">
                              <p className="font-medium text-gray-900">
                                {friend.firstName} {friend.lastName}
                              </p>
                              <p className="text-sm text-gray-500">{friend.email}</p>
                            </div>
                            {selectedMembers.includes(friend._id) && (
                              <span className="text-indigo-600 font-semibold">✓</span>
                            )}
                          </div>
                        ))}
                      </div>
                    )}
                  </div>
                </>
              )}

              {/* Navigation Buttons */}
              <div className="flex gap-2 pt-6">
                <button
                  type="button"
                  onClick={onClose}
                  className="flex-1 px-4 py-2 border border-gray-300 rounded-lg text-gray-700 hover:bg-gray-50 font-medium transition-colors"
                >
                  Cancel
                </button>

                {currentStep === 1 ? (
                  <button
                    type="button"
                    onClick={() => {
                      if (values.name.trim() === '') {
                        toast.error('Group name is required');
                      } else if (friends.length === 0) {
                        toast.error('You need to add friends before creating a group');
                      } else {
                        setCurrentStep(2);
                      }
                    }}
                    className="flex-1 px-4 py-2 bg-indigo-600 text-white rounded-lg hover:bg-indigo-700 font-medium transition-colors"
                  >
                    Next: Select Members
                  </button>
                ) : (
                  <>
                    <button
                      type="button"
                      onClick={() => setCurrentStep(1)}
                      className="flex-1 px-4 py-2 border border-gray-300 rounded-lg text-gray-700 hover:bg-gray-50 font-medium transition-colors"
                    >
                      Back
                    </button>
                    <button
                      type="submit"
                      disabled={isSubmitting || selectedMembers.length === 0}
                      className="flex-1 px-4 py-2 bg-green-600 text-white rounded-lg hover:bg-green-700 disabled:opacity-50 disabled:cursor-not-allowed font-medium transition-colors"
                    >
                      {isSubmitting ? 'Creating...' : 'Create Group'}
                    </button>
                  </>
                )}
              </div>
            </Form>
          )}
        </Formik>
      </div>
    </div>
  );
};

export default CreateGroupModal;
