import React, { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '@/contexts/AuthContext';

const Login: React.FC = () => {
  const [username, setUsername] = useState('');
  const [password, setPassword] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const navigate = useNavigate();
  const { login } = useAuth();

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setError(null);
    
    try {
      await login(username, password);
      navigate('/');
    } catch (err: any) {
      setError(err.message || 'Login failed. Please check your credentials.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-purple-50 to-indigo-50 p-3 md:p-4">
      <div className="bg-white rounded-2xl shadow-2xl w-full max-w-md overflow-hidden">
        {/* Header */}
        <div className="bg-gradient-to-r from-purple-600 to-indigo-600 px-4 md:px-8 py-4 md:py-6 text-white text-center">
          <div className="flex items-center justify-center space-x-3 mb-3 md:mb-4">
            <div className="bg-white/20 p-2 rounded-lg">
              <span className="font-bold text-xl md:text-2xl">TE</span>
            </div>
            <h1 className="text-xl md:text-2xl font-bold">Think Events</h1>
          </div>
          <p className="text-sm md:text-base text-purple-100">Welcome back! Sign in to your account</p>
        </div>

        {/* Form */}
        <form onSubmit={handleSubmit} className="p-4 md:p-8 space-y-4 md:space-y-6">
          {error && (
            <div className="bg-red-50 border border-red-200 rounded-lg p-3 md:p-4">
              <p className="text-red-600 text-xs md:text-sm font-medium">{error}</p>
            </div>
          )}

          <div className="space-y-3 md:space-y-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Username or Email
              </label>
              <Input 
                value={username} 
                onChange={(e) => setUsername(e.target.value)} 
                placeholder="Enter your username or email"
                className="w-full px-3 md:px-4 py-2.5 md:py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-purple-500 focus:border-transparent text-sm md:text-base"
                required 
              />
            </div>

            <div>
              <label className="text-sm font-medium text-gray-700 mb-2">
                Password
              </label>
              <Input 
                type="password" 
                value={password} 
                onChange={(e) => setPassword(e.target.value)} 
                placeholder="Enter your password"
                className="w-full px-3 md:px-4 py-2.5 md:py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-purple-500 focus:border-transparent text-sm md:text-base"
                required 
              />
            </div>
          </div>

          <Button 
            type="submit" 
            className="w-full bg-gradient-to-r from-purple-600 to-indigo-600 hover:from-purple-700 hover:to-indigo-700 text-white font-semibold py-2.5 md:py-3 rounded-lg transition-all duration-200 transform hover:scale-105 min-h-[44px] md:min-h-[48px]" 
            disabled={loading}
          >
            {loading ? (
              <div className="flex items-center justify-center space-x-2">
                <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin"></div>
                <span className="text-sm md:text-base">Signing In...</span>
              </div>
            ) : (
              <span className="text-sm md:text-base">Sign In</span>
            )}
          </Button>

          <div className="text-center">
            <p className="text-gray-600 text-xs md:text-sm">
              Don't have an account?{' '}
              <button 
                type="button"
                onClick={() => navigate('/signup')} 
                className="text-purple-600 hover:text-purple-700 font-medium hover:underline"
              >
                Sign up here
              </button>
            </p>
            <p className="text-gray-600 text-xs md:text-sm mt-2">
              <button 
                type="button"
                onClick={() => navigate('/forgot-password')} 
                className="text-purple-600 hover:text-purple-700 font-medium hover:underline"
              >
                Forgot your password?
              </button>
            </p>
          </div>
        </form>
      </div>
    </div>
  );
};

export default Login; 