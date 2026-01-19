import React, { useState } from 'react';
import { Formik, Form, Field, ErrorMessage } from 'formik';
import * as Yup from 'yup';
import toast from 'react-hot-toast';
import apiClient from '../utils/api';

const groupSchema = Yup.object().shape({
  name: Yup.string().required('Group name is required'),
  description: Yup.string(),
  members: Yup.array().of(Yup.string()),
});

const CreateGroupModal = ({ isOpen, onClose, onGroupCreated }) => {
  const [friends, setFriends] = useState([]);
  const [selectedMembers, setSelectedMembers] = useState([]);

  const handleSubmit = async (values, { setSubmitting }) => {
    try {
      const response = await apiClient.post('/group/create', {
        ...values,
        members: selectedMembers,
      });
      toast.success('Group created successfully!');
      onGroupCreated(response.data.group);
      onClose();
    } catch (error) {
      toast.error('Failed to create group');
    } finally {
      setSubmitting(false);
    }
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
      <div className="bg-white rounded-lg p-8 w-full max-w-md">
        <h2 className="text-2xl font-bold mb-6">Create New Group</h2>

        <Formik
          initialValues={{
            name: '',
            description: '',
          }}
          validationSchema={groupSchema}
          onSubmit={handleSubmit}
        >
          {({ isSubmitting }) => (
            <Form className="space-y-4">
              <div>
                <label htmlFor="name" className="block text-sm font-medium mb-1">
                  Group Name
                </label>
                <Field
                  type="text"
                  id="name"
                  name="name"
                  placeholder="e.g., Roommates"
                  className="w-full border rounded px-3 py-2"
                />
                <ErrorMessage name="name" component="div" className="text-red-500 text-sm mt-1" />
              </div>

              <div>
                <label htmlFor="description" className="block text-sm font-medium mb-1">
                  Description
                </label>
                <Field
                  as="textarea"
                  id="description"
                  name="description"
                  placeholder="What is this group for?"
                  className="w-full border rounded px-3 py-2"
                  rows={3}
                />
              </div>

              <div className="flex gap-2 pt-6">
                <button
                  type="button"
                  onClick={onClose}
                  className="flex-1 px-4 py-2 border rounded-lg hover:bg-gray-50"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  disabled={isSubmitting}
                  className="flex-1 px-4 py-2 bg-indigo-600 text-white rounded-lg hover:bg-indigo-700 disabled:opacity-50"
                >
                  Create Group
                </button>
              </div>
            </Form>
          )}
        </Formik>
      </div>
    </div>
  );
};

export default CreateGroupModal;
