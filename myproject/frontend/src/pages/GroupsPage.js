import React, { useState, useEffect } from 'react';
import toast from 'react-hot-toast';
import apiClient from '../utils/api';
import { Link } from 'react-router-dom';
import { FiPlus } from 'react-icons/fi';
import CreateGroupModal from '../components/CreateGroupModal';

const GroupsPage = () => {
  const [groups, setGroups] = useState([]);
  const [loading, setLoading] = useState(true);
  const [showCreateModal, setShowCreateModal] = useState(false);

  useEffect(() => {
    fetchGroups();
  }, []);

  const fetchGroups = async () => {
    try {
      const response = await apiClient.get('/group/my-groups');
      setGroups(response.data.groups);
    } catch (error) {
      toast.error('Failed to load groups');
    } finally {
      setLoading(false);
    }
  };

  const handleGroupCreated = (newGroup) => {
    setGroups([...groups, newGroup]);
  };

  if (loading) return <div className="text-center py-8">Loading...</div>;

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex justify-between items-center">
        <h1 className="text-3xl font-bold">Your Groups</h1>
        <button
          onClick={() => setShowCreateModal(true)}
          className="flex items-center gap-2 px-4 py-2 bg-indigo-600 text-white rounded-lg hover:bg-indigo-700"
        >
          <FiPlus /> New Group
        </button>
      </div>

      {/* Groups Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
        {groups.length > 0 ? (
          groups.map((group) => (
            <Link
              key={group._id}
              to={`/group/${group._id}`}
              className="bg-white p-6 rounded-lg border hover:shadow-lg transition-shadow"
            >
              <h3 className="text-xl font-bold mb-2">{group.name}</h3>
              <p className="text-gray-600 text-sm mb-4">{group.description}</p>
              
              <div className="space-y-2 text-sm">
                <div className="flex justify-between">
                  <span className="text-gray-600">Members</span>
                  <span className="font-semibold">{group.members.length}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-gray-600">Total Spent</span>
                  <span className="font-semibold">${group.totalSpent.toFixed(2)}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-gray-600">Expenses</span>
                  <span className="font-semibold">{group.totalExpenses}</span>
                </div>
              </div>
            </Link>
          ))
        ) : (
          <div className="col-span-full text-center py-12">
            <p className="text-gray-500 mb-4">No groups yet</p>
            <button
              onClick={() => setShowCreateModal(true)}
              className="px-4 py-2 bg-indigo-600 text-white rounded-lg hover:bg-indigo-700"
            >
              Create Your First Group
            </button>
          </div>
        )}
      </div>

      {/* Create Group Modal */}
      <CreateGroupModal
        isOpen={showCreateModal}
        onClose={() => setShowCreateModal(false)}
        onGroupCreated={handleGroupCreated}
      />
    </div>
  );
};

export default GroupsPage;
