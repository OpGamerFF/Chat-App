import React, { useState } from 'react';
import axios from 'axios';
import { useAuth } from '../context/AuthContext';
import { useNavigate, Link } from 'react-router-dom';
import { Mail, Lock, User, Zap } from 'lucide-react';
import { GoogleLogin } from '@react-oauth/google';

const Register = () => {
  const [formData, setFormData] = useState({ username: '', email: '', password: '' });
  const [error, setError] = useState('');
  const { login } = useAuth();
  const navigate = useNavigate();

  const handleGoogleSuccess = async (credentialResponse) => {
    try {
      const { data } = await axios.post('/api/auth/google', { credential: credentialResponse.credential });
      login(data.accessToken, data.user);
      navigate('/');
    } catch (err) {
      console.error('Google Auth Error:', err);
      setError('Google Sign In failed');
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    try {
      const { data } = await axios.post('/api/auth/register', formData);
      login(data.accessToken, data.user);
      navigate('/');
    } catch (err) {
      console.error('Registration Error:', err.response?.data || err.message);
      setError(err.response?.data?.message || err.message || 'Registration failed');
    }
  };

  return (
    <div className="min-h-screen bg-primary-50 dark:bg-dark-900 flex items-center justify-center p-4">
      <div className="bg-white/90 dark:bg-dark-800/90 backdrop-blur-xl p-8 rounded-[32px] shadow-2xl w-full max-w-md border border-white/50 dark:border-dark-700">
        <div className="flex flex-col items-center mb-10">
          <div className="bg-gradient-to-tr from-primary-600 to-indigo-400 p-3.5 rounded-2xl shadow-lg shadow-primary-200 dark:shadow-none mb-5 transition-transform hover:scale-105">
            <Zap className="text-white w-8 h-8" fill="white" />
          </div>
          <h1 className="text-3xl font-outfit font-black tracking-tight dark:text-white">Pulse</h1>
          <p className="text-gray-500 dark:text-dark-400 mt-2 font-medium">Join the vibe. Create an account.</p>
        </div>

        {error && <div className="bg-red-50 text-red-500 p-3 rounded-xl mb-6 text-sm flex items-center justify-center font-bold">{error}</div>}

        <form onSubmit={handleSubmit} className="space-y-5 mb-6">
          <div className="relative">
            <User className="absolute left-4 top-1/2 -translate-y-1/2 text-gray-400 w-5 h-5" />
            <input
              type="text"
              placeholder="Username"
              className="w-full bg-gray-50 dark:bg-dark-700 dark:text-white pl-12 pr-4 py-3.5 rounded-2xl outline-none focus:ring-2 focus:ring-primary-400 transition-all border border-transparent dark:border-dark-600"
              value={formData.username}
              onChange={(e) => setFormData({ ...formData, username: e.target.value })}
              required
            />
          </div>
          <div className="relative">
            <Mail className="absolute left-4 top-1/2 -translate-y-1/2 text-gray-400 w-5 h-5" />
            <input
              type="email"
              placeholder="Email address"
              className="w-full bg-gray-50 dark:bg-dark-700 dark:text-white pl-12 pr-4 py-3.5 rounded-2xl outline-none focus:ring-2 focus:ring-primary-400 transition-all border border-transparent dark:border-dark-600"
              value={formData.email}
              onChange={(e) => setFormData({ ...formData, email: e.target.value })}
              required
            />
          </div>
          <div className="relative">
            <Lock className="absolute left-4 top-1/2 -translate-y-1/2 text-gray-400 w-5 h-5" />
            <input
              type="password"
              placeholder="Password"
              className="w-full bg-gray-50 dark:bg-dark-700 dark:text-white pl-12 pr-4 py-3.5 rounded-2xl outline-none focus:ring-2 focus:ring-primary-400 transition-all border border-transparent dark:border-dark-600"
              value={formData.password}
              onChange={(e) => setFormData({ ...formData, password: e.target.value })}
              required
            />
          </div>
          <button type="submit" className="w-full bg-primary-500 text-white font-bold py-4 rounded-2xl shadow-lg shadow-primary-100 hover:bg-primary-600 active:scale-95 transition-all">
            Get Started
          </button>
        </form>

        <div className="flex items-center space-x-4 mb-6">
          <div className="flex-1 h-px bg-gray-200 dark:bg-dark-700"></div>
          <span className="text-gray-400 text-sm font-medium">OR</span>
          <div className="flex-1 h-px bg-gray-200 dark:bg-dark-700"></div>
        </div>

        <div className="flex justify-center mb-6">
           <GoogleLogin
              onSuccess={handleGoogleSuccess}
              onError={() => setError('Google Sign In failed')}
              useOneTap
              shape="pill"
           />
        </div>

        <p className="text-center text-gray-500 dark:text-dark-400 mt-8 text-sm">
          Already have an account? <Link to="/login" className="text-primary-500 font-bold hover:underline">Log in</Link>
        </p>
      </div>
    </div>

  );
};

export default Register;
