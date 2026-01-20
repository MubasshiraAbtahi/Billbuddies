import React, { useState } from 'react';
import { Formik, Form, Field, ErrorMessage } from 'formik';
import * as Yup from 'yup';
import toast from 'react-hot-toast';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { ColorfulButton } from '../components/UI';

const loginSchema = Yup.object().shape({
  email: Yup.string().email('Invalid email').required('Email is required'),
  password: Yup.string().min(6, 'Password must be at least 6 characters').required('Password is required'),
});

const signupSchema = Yup.object().shape({
  firstName: Yup.string().required('First name is required'),
  lastName: Yup.string().required('Last name is required'),
  username: Yup.string().required('Username is required'),
  email: Yup.string().email('Invalid email').required('Email is required'),
  password: Yup.string().min(6, 'Password must be at least 6 characters').required('Password is required'),
  confirmPassword: Yup.string().oneOf([Yup.ref('password')], 'Passwords must match'),
});

const LoginPage = () => {
  const navigate = useNavigate();
  const { login, signup } = useAuth();
  const [isSignup, setIsSignup] = useState(false);

  const handleLogin = async (values, { setSubmitting }) => {
    try {
      await login(values.email, values.password);
      toast.success('Welcome back! 👋');
      navigate('/dashboard');
    } catch (error) {
      console.error('Login error:', error);
      toast.error(error.response?.data?.message || 'Login failed');
    } finally {
      setSubmitting(false);
    }
  };

  const handleSignup = async (values, { setSubmitting }) => {
    try {
      await signup({
        firstName: values.firstName,
        lastName: values.lastName,
        username: values.username,
        email: values.email,
        password: values.password,
      });
      toast.success('Account created! Welcome to Bill Buddies 🎉');
      navigate('/dashboard');
    } catch (error) {
      console.error('Signup error:', error);
      toast.error(error.response?.data?.message || 'Signup failed');
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <div className="min-h-screen bg-gradient-sunset flex items-center justify-center p-4 relative overflow-hidden">
      {/* Animated background elements */}
      <div className="absolute top-10 left-10 w-20 h-20 bg-white/10 rounded-full blur-xl animate-float" />
      <div className="absolute bottom-10 right-10 w-32 h-32 bg-white/10 rounded-full blur-xl animate-float" style={{ animationDelay: '0.5s' }} />
      <div className="absolute top-1/3 right-1/4 w-16 h-16 bg-white/5 rounded-full blur-lg animate-float" style={{ animationDelay: '1s' }} />

      {/* Main card */}
      <div className="bg-white rounded-3xl shadow-strong p-8 w-full max-w-md relative z-10 animate-scale-in">
        {/* Logo and Branding */}
        <div className="text-center mb-8">
          <div className="text-5xl mb-4">👥</div>
          <h1 className="text-3xl font-bold text-gray-800 mb-2">Bill Buddies</h1>
          <p className="text-gray-600 font-medium">Split smarter, stay friends</p>
        </div>

        {/* Tab toggle */}
        <div className="flex bg-gray-100 rounded-full p-1 mb-8">
          <button
            onClick={() => setIsSignup(false)}
            className={`flex-1 py-2 px-4 rounded-full font-semibold transition-all duration-300 ${
              !isSignup
                ? 'bg-gradient-sunset text-white shadow-medium'
                : 'text-gray-600 hover:text-gray-800'
            }`}
          >
            Sign In
          </button>
          <button
            onClick={() => setIsSignup(true)}
            className={`flex-1 py-2 px-4 rounded-full font-semibold transition-all duration-300 ${
              isSignup
                ? 'bg-gradient-ocean text-white shadow-medium'
                : 'text-gray-600 hover:text-gray-800'
            }`}
          >
            Sign Up
          </button>
        </div>

        {/* Login Form */}
        {!isSignup && (
          <Formik
            initialValues={{ email: '', password: '' }}
            validationSchema={loginSchema}
            onSubmit={handleLogin}
          >
            {({ isSubmitting, errors, touched }) => (
              <Form className="space-y-4">
                <div>
                  <label htmlFor="email" className="block text-sm font-semibold text-gray-700 mb-2">
                    📧 Email
                  </label>
                  <Field
                    type="email"
                    id="email"
                    name="email"
                    className={`w-full px-4 py-3 rounded-lg border-2 focus:outline-none transition-colors ${
                      errors.email && touched.email
                        ? 'border-red-500 bg-red-50'
                        : 'border-brand-teal hover:border-brand-pink focus:border-brand-pink'
                    }`}
                    placeholder="you@example.com"
                  />
                  <ErrorMessage name="email" component="div" className="text-red-600 text-sm mt-2 font-medium" />
                </div>

                <div>
                  <label htmlFor="password" className="block text-sm font-semibold text-gray-700 mb-2">
                    🔐 Password
                  </label>
                  <Field
                    type="password"
                    id="password"
                    name="password"
                    className={`w-full px-4 py-3 rounded-lg border-2 focus:outline-none transition-colors ${
                      errors.password && touched.password
                        ? 'border-red-500 bg-red-50'
                        : 'border-brand-teal hover:border-brand-pink focus:border-brand-pink'
                    }`}
                    placeholder="••••••••"
                  />
                  <ErrorMessage name="password" component="div" className="text-red-600 text-sm mt-2 font-medium" />
                </div>

                <ColorfulButton
                  type="submit"
                  disabled={isSubmitting}
                  gradient="warm"
                  size="lg"
                  className="w-full mt-6"
                >
                  {isSubmitting ? '⏳ Signing in...' : '✨ Sign In'}
                </ColorfulButton>
              </Form>
            )}
          </Formik>
        )}

        {/* Signup Form */}
        {isSignup && (
          <Formik
            initialValues={{
              firstName: '',
              lastName: '',
              username: '',
              email: '',
              password: '',
              confirmPassword: '',
            }}
            validationSchema={signupSchema}
            onSubmit={handleSignup}
          >
            {({ isSubmitting, errors, touched }) => (
              <Form className="space-y-3 max-h-96 overflow-y-auto">
                <div className="grid grid-cols-2 gap-3">
                  <div>
                    <label htmlFor="firstName" className="block text-xs font-semibold text-gray-700 mb-1">
                      First Name
                    </label>
                    <Field
                      type="text"
                      id="firstName"
                      name="firstName"
                      className={`w-full px-3 py-2 rounded-lg border-2 focus:outline-none transition-colors text-sm ${
                        errors.firstName && touched.firstName
                          ? 'border-red-500 bg-red-50'
                          : 'border-brand-teal hover:border-brand-pink focus:border-brand-pink'
                      }`}
                      placeholder="John"
                    />
                    <ErrorMessage name="firstName" component="div" className="text-red-600 text-xs mt-1" />
                  </div>
                  <div>
                    <label htmlFor="lastName" className="block text-xs font-semibold text-gray-700 mb-1">
                      Last Name
                    </label>
                    <Field
                      type="text"
                      id="lastName"
                      name="lastName"
                      className={`w-full px-3 py-2 rounded-lg border-2 focus:outline-none transition-colors text-sm ${
                        errors.lastName && touched.lastName
                          ? 'border-red-500 bg-red-50'
                          : 'border-brand-teal hover:border-brand-pink focus:border-brand-pink'
                      }`}
                      placeholder="Doe"
                    />
                    <ErrorMessage name="lastName" component="div" className="text-red-600 text-xs mt-1" />
                  </div>
                </div>

                <div>
                  <label htmlFor="username" className="block text-xs font-semibold text-gray-700 mb-1">
                    Username
                  </label>
                  <Field
                    type="text"
                    id="username"
                    name="username"
                    className={`w-full px-3 py-2 rounded-lg border-2 focus:outline-none transition-colors text-sm ${
                      errors.username && touched.username
                        ? 'border-red-500 bg-red-50'
                        : 'border-brand-teal hover:border-brand-pink focus:border-brand-pink'
                    }`}
                    placeholder="johndoe"
                  />
                  <ErrorMessage name="username" component="div" className="text-red-600 text-xs mt-1" />
                </div>

                <div>
                  <label htmlFor="email" className="block text-xs font-semibold text-gray-700 mb-1">
                    Email
                  </label>
                  <Field
                    type="email"
                    id="email"
                    name="email"
                    className={`w-full px-3 py-2 rounded-lg border-2 focus:outline-none transition-colors text-sm ${
                      errors.email && touched.email
                        ? 'border-red-500 bg-red-50'
                        : 'border-brand-teal hover:border-brand-pink focus:border-brand-pink'
                    }`}
                    placeholder="you@example.com"
                  />
                  <ErrorMessage name="email" component="div" className="text-red-600 text-xs mt-1" />
                </div>

                <div>
                  <label htmlFor="password" className="block text-xs font-semibold text-gray-700 mb-1">
                    Password
                  </label>
                  <Field
                    type="password"
                    id="password"
                    name="password"
                    className={`w-full px-3 py-2 rounded-lg border-2 focus:outline-none transition-colors text-sm ${
                      errors.password && touched.password
                        ? 'border-red-500 bg-red-50'
                        : 'border-brand-teal hover:border-brand-pink focus:border-brand-pink'
                    }`}
                    placeholder="••••••••"
                  />
                  <ErrorMessage name="password" component="div" className="text-red-600 text-xs mt-1" />
                </div>

                <div>
                  <label htmlFor="confirmPassword" className="block text-xs font-semibold text-gray-700 mb-1">
                    Confirm Password
                  </label>
                  <Field
                    type="password"
                    id="confirmPassword"
                    name="confirmPassword"
                    className={`w-full px-3 py-2 rounded-lg border-2 focus:outline-none transition-colors text-sm ${
                      errors.confirmPassword && touched.confirmPassword
                        ? 'border-red-500 bg-red-50'
                        : 'border-brand-teal hover:border-brand-pink focus:border-brand-pink'
                    }`}
                    placeholder="••••••••"
                  />
                  <ErrorMessage name="confirmPassword" component="div" className="text-red-600 text-xs mt-1" />
                </div>

                <ColorfulButton
                  type="submit"
                  disabled={isSubmitting}
                  gradient="ocean"
                  size="lg"
                  className="w-full mt-4"
                >
                  {isSubmitting ? '⏳ Creating Account...' : '🎉 Create Account'}
                </ColorfulButton>
              </Form>
            )}
          </Formik>
        )}
      </div>
    </div>
  );
};

export default LoginPage;
