import React, { useEffect, useState } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';

const API_BASE = (import.meta as any).env.VITE_API_BASE_URL || 'http://localhost:8000/api';
const GOOGLE_CLIENT_ID = (import.meta as any).env.VITE_GOOGLE_CLIENT_ID;

declare global {
  interface Window {
    google?: any;
  }
}

const Login: React.FC = () => {
  const navigate = useNavigate();
  const [username, setUsername] = useState('');
  const [password, setPassword] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  useEffect(() => {
    // Load Google script
    if (GOOGLE_CLIENT_ID && !document.getElementById('google-identity')) {
      const s = document.createElement('script');
      s.src = 'https://accounts.google.com/gsi/client';
      s.async = true;
      s.id = 'google-identity';
      document.body.appendChild(s);
    }
  }, []);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');
    setLoading(true);
    try {
      const res = await fetch(`${API_BASE}/auth/login/`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ username, password }),
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data?.detail || 'Login failed');
      localStorage.setItem('access', data.access);
      localStorage.setItem('refresh', data.refresh);
      navigate('/');
    } catch (err: any) {
      setError(err.message || 'Login failed');
    } finally {
      setLoading(false);
    }
  };

  const googleSignin = async () => {
    if (!window.google || !GOOGLE_CLIENT_ID) return;
    try {
      await window.google.accounts.id.initialize({
        client_id: GOOGLE_CLIENT_ID,
        callback: async (resp: any) => {
          try {
            const r = await fetch(`${API_BASE}/auth/google/`, {
              method: 'POST',
              headers: { 'Content-Type': 'application/json' },
              body: JSON.stringify({ id_token: resp.credential })
            });
            const data = await r.json();
            if (!r.ok) throw new Error(data?.detail || 'Google login failed');
            localStorage.setItem('access', data.access);
            localStorage.setItem('refresh', data.refresh);
            navigate('/');
          } catch (e: any) {
            setError(e.message || 'Google login failed');
          }
        }
      });
      window.google.accounts.id.prompt();
    } catch (e: any) {
      setError(e.message || 'Google init failed');
    }
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-gray-50 p-4">
      <div className="w-full max-w-md bg-white rounded-xl shadow-lg p-6">
        <h1 className="text-2xl font-semibold mb-4 text-center">Welcome back</h1>
        <p className="text-sm text-gray-600 text-center mb-6">Login to continue</p>
        <form onSubmit={handleSubmit} className="space-y-4">
          <div>
            <Label className="mb-1 block">Username</Label>
            <Input value={username} onChange={(e) => setUsername(e.target.value)} required placeholder="johndoe" />
          </div>
          <div>
            <Label className="mb-1 block">Password</Label>
            <Input type="password" value={password} onChange={(e) => setPassword(e.target.value)} required placeholder="••••••••" />
          </div>
          {error && <p className="text-red-600 text-sm">{error}</p>}
          <Button type="submit" disabled={loading} className="w-full bg-purple-600 hover:bg-purple-700">
            {loading ? 'Signing in...' : 'Login'}
          </Button>
        </form>
        <div className="my-4 flex items-center">
          <div className="flex-1 h-px bg-gray-200" />
          <span className="px-2 text-xs text-gray-500">OR</span>
          <div className="flex-1 h-px bg-gray-200" />
        </div>
        <Button variant="outline" className="w-full" onClick={googleSignin}>
          Continue with Google
        </Button>
        <p className="mt-4 text-sm text-center">No account? <Link to="/signup" className="underline">Sign up</Link></p>
      </div>
    </div>
  );
};

export default Login; 