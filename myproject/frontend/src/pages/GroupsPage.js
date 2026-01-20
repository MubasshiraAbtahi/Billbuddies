import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import TopNav from '../components/TopNav';
import CreateGroupModal from '../components/CreateGroupModal';
import { ColorfulButton, LoadingSpinner, ProfileCircle, Badge, EmptyState } from '../components/UI';
import toast from 'react-hot-toast';
import { PlusIcon } from '@heroicons/react/24/outline';

function GroupsPage() {
  const navigate = useNavigate();
  const [groups, setGroups] = useState([]);
  const [loading, setLoading] = useState(true);
  const [showCreateModal, setShowCreateModal] = useState(false);

  // Gradient colors for groups
  const gradients = [
    'bg-gradient-sunset',
    'bg-gradient-ocean',
    'bg-gradient-warm',
    'bg-gradient-success',
    'bg-gradient-danger',
    'bg-gradient-playful',
  ];

  useEffect(() => {
    fetchGroups();
  }, []);

  const fetchGroups = async () => {
    try {
      const response = await fetch('/api/group/my-groups', {
        headers: {
          Authorization: `Bearer ${localStorage.getItem('token')}`,
        },
      });
      const data = await response.json();
      if (data.success) {
        setGroups(data.groups);
      }
    } catch (error) {
      toast.error('Failed to load groups');
    } finally {
      setLoading(false);
    }
  };

  const handleGroupCreated = (newGroup) => {
    setGroups([...groups, newGroup]);
    fetchGroups(); // Refresh to ensure we have the latest data
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-gray-50 to-gray-100">
        <TopNav />
        <div className="flex justify-center items-center min-h-[500px]">
          <LoadingSpinner size="lg" color="brand-pink" />
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-50 to-gray-100">
      <TopNav />

      <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {/* Header */}
        <div className="mb-12 animate-slide-up">
          <div className="flex justify-between items-start gap-4">
            <div>
              <h1 className="text-4xl font-bold text-gray-900 mb-2">👥 Your Groups</h1>
              <p className="text-gray-600">Collaborate and split expenses together</p>
            </div>
            <ColorfulButton
              gradient="playful"
              onClick={() => setShowCreateModal(true)}
              className="whitespace-nowrap"
            >
              <PlusIcon className="w-5 h-5 inline mr-2" />
              New Group
            </ColorfulButton>
          </div>
        </div>

        {/* Groups Grid */}
        {groups.length === 0 ? (
          <div className="animate-slide-up">
            <EmptyState
              icon="👥"
              title="No groups yet"
              description="Create your first group to start splitting expenses with friends!"
              action={() => setShowCreateModal(true)}
              actionText="Create Your First Group"
            />
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 animate-scale-in">
            {groups.map((group, index) => {
              const gradient = gradients[index % gradients.length];
              return (
                <div
                  key={group._id}
                  onClick={() => navigate(`/group/${group._id}`)}
                  className={`${gradient} rounded-2xl p-6 text-white shadow-medium hover:shadow-strong hover:scale-105 transition-all duration-300 cursor-pointer animate-slide-up`}
                  style={{ animationDelay: `${index * 0.05}s` }}
                >
                  {/* Top section */}
                  <div className="flex justify-between items-start mb-4">
                    <div>
                      <div className="text-5xl mb-3 opacity-90">{group.icon || '👥'}</div>
                      <h3 className="text-2xl font-bold mb-1">{group.name}</h3>
                      {group.description && (
                        <p className="text-white/80 text-sm line-clamp-2">{group.description}</p>
                      )}
                    </div>
                  </div>

                  {/* Members avatars */}
                  <div className="flex items-center gap-2 mb-6 pb-4 border-b border-white/30">
                    {group.members.slice(0, 4).map((member) => (
                      <ProfileCircle
                        key={member._id}
                        name={`${member.firstName} ${member.lastName}`}
                        image={member.profilePicture}
                        color="bg-white/30"
                        size="sm"
                        ring={false}
                      />
                    ))}
                    {group.members.length > 4 && (
                      <div className="w-8 h-8 rounded-full bg-white/30 border-2 border-white flex items-center justify-center text-xs font-bold">
                        +{group.members.length - 4}
                      </div>
                    )}
                  </div>

                  {/* Stats */}
                  <div className="space-y-2">
                    <div className="flex justify-between items-center text-sm">
                      <span className="text-white/90">Members</span>
                      <span className="font-bold text-lg">{group.members.length}</span>
                    </div>
                    <div className="flex justify-between items-center text-sm">
                      <span className="text-white/90">Total Spent</span>
                      <span className="font-bold text-lg">${group.totalSpent?.toFixed(2) || '0.00'}</span>
                    </div>
                    <div className="flex justify-between items-center text-sm">
                      <span className="text-white/90">Expenses</span>
                      <span className="font-bold text-lg">{group.totalExpenses || 0}</span>
                    </div>
                  </div>

                  {/* Arrow indicator */}
                  <div className="mt-6 pt-4 border-t border-white/30 flex justify-center opacity-70 group-hover:opacity-100 transition-opacity">
                    <span className="text-xl">→</span>
                  </div>
                </div>
              );
            })}
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
}

export default GroupsPage;
