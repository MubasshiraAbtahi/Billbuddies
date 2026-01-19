import React from 'react';
import { Formik, Form, Field, ErrorMessage } from 'formik';
import * as Yup from 'yup';
import toast from 'react-hot-toast';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';

// Form validation schema for signup
const signupSchema = Yup.object().shape({
  email: Yup.string().email('Invalid email').required('Email is required'),
  password: Yup.string()
    .min(6, 'Password must be at least 6 characters')
    .required('Password is required'),
  confirmPassword: Yup.string()
    .oneOf([Yup.ref('password')], 'Passwords must match')
    .required('Confirm password is required'),
  firstName: Yup.string().required('First name is required'),
  lastName: Yup.string().required('Last name is required'),
  username: Yup.string().required('Username is required'),
});

const SignupPage = () => {
  const navigate = useNavigate();
  const { signup } = useAuth();

  const handleSubmit = async (values, { setSubmitting }) => {
    try {
      await signup(
        values.email,
        values.password,
        values.firstName,
        values.lastName,
        values.username
      );
      toast.success('Account created successfully!');
      navigate('/dashboard');
    } catch (error) {
      console.error('Signup error:', error);
      toast.error(error.response?.data?.message || 'Signup failed');
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-blue-50 to-indigo-100">
      <div className="bg-white rounded-lg shadow-lg p-8 w-full max-w-md">
        <h1 className="text-3xl font-bold text-center text-gray-800 mb-6">Bill Buddies</h1>
        <p className="text-center text-gray-600 mb-8">Create your account</p>

        <Formik
          initialValues={{
            email: '',
            password: '',
            confirmPassword: '',
            firstName: '',
            lastName: '',
            username: '',
          }}
          validationSchema={signupSchema}
          onSubmit={handleSubmit}
        >
          {({ isSubmitting }) => (
            <Form className="space-y-4">
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label htmlFor="firstName" className="block text-sm font-medium text-gray-700">
                    First Name
                  </label>
                  <Field
                    type="text"
                    id="firstName"
                    name="firstName"
                    className="mt-1 block w-full rounded-md border-gray-300 shadow-sm px-3 py-2 border"
                  />
                  <ErrorMessage name="firstName" component="div" className="text-red-500 text-sm mt-1" />
                </div>

                <div>
                  <label htmlFor="lastName" className="block text-sm font-medium text-gray-700">
                    Last Name
                  </label>
                  <Field
                    type="text"
                    id="lastName"
                    name="lastName"
                    className="mt-1 block w-full rounded-md border-gray-300 shadow-sm px-3 py-2 border"
                  />
                  <ErrorMessage name="lastName" component="div" className="text-red-500 text-sm mt-1" />
                </div>
              </div>

              <div>
                <label htmlFor="username" className="block text-sm font-medium text-gray-700">
                  Username
                </label>
                <Field
                  type="text"
                  id="username"
                  name="username"
                  className="mt-1 block w-full rounded-md border-gray-300 shadow-sm px-3 py-2 border"
                />
                <ErrorMessage name="username" component="div" className="text-red-500 text-sm mt-1" />
              </div>

              <div>
                <label htmlFor="email" className="block text-sm font-medium text-gray-700">
                  Email
                </label>
                <Field
                  type="email"
                  id="email"
                  name="email"
                  className="mt-1 block w-full rounded-md border-gray-300 shadow-sm px-3 py-2 border"
                />
                <ErrorMessage name="email" component="div" className="text-red-500 text-sm mt-1" />
              </div>

              <div>
                <label htmlFor="password" className="block text-sm font-medium text-gray-700">
                  Password
                </label>
                <Field
                  type="password"
                  id="password"
                  name="password"
                  className="mt-1 block w-full rounded-md border-gray-300 shadow-sm px-3 py-2 border"
                />
                <ErrorMessage name="password" component="div" className="text-red-500 text-sm mt-1" />
              </div>

              <div>
                <label htmlFor="confirmPassword" className="block text-sm font-medium text-gray-700">
                  Confirm Password
                </label>
                <Field
                  type="password"
                  id="confirmPassword"
                  name="confirmPassword"
                  className="mt-1 block w-full rounded-md border-gray-300 shadow-sm px-3 py-2 border"
                />
                <ErrorMessage name="confirmPassword" component="div" className="text-red-500 text-sm mt-1" />
              </div>

              <button
                type="submit"
                disabled={isSubmitting}
                className="w-full bg-indigo-600 text-white py-2 px-4 rounded-md hover:bg-indigo-700 disabled:opacity-50"
              >
                {isSubmitting ? 'Creating Account...' : 'Sign Up'}
              </button>
            </Form>
          )}
        </Formik>

        <div className="mt-6 text-center">
          <p className="text-gray-600">Already have an account?</p>
          <button
            onClick={() => navigate('/login')}
            className="mt-2 w-full bg-blue-600 text-white py-2 px-4 rounded-md hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-blue-500"
          >
            Back to Login
          </button>
        </div>
      </div>
    </div>
  );
};

export default SignupPage;
