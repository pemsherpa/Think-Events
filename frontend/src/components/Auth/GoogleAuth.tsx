import React from 'react';
import { GoogleLogin } from '@react-oauth/google';
import { jwtDecode } from 'jwt-decode';
import { useAuth } from '@/contexts/AuthContext';
import { Button } from '@/components/ui/button';
import { useNavigate } from 'react-router-dom';

interface GoogleUser {
  sub: string;
  name: string;
  given_name: string;
  family_name: string;
  email: string;
  picture: string;
  email_verified: boolean;
}

interface GoogleAuthProps {
  variant?: 'default' | 'outline';
  size?: 'sm' | 'md' | 'lg';
  className?: string;
}

const GoogleAuth: React.FC<GoogleAuthProps> = ({ 
  variant = 'default', 
  size = 'md',
  className = '' 
}) => {
  const { loginWithGoogle } = useAuth();
  const navigate = useNavigate();

  const handleSuccess = async (credentialResponse: any) => {
    try {
      if (credentialResponse.credential) {
        const decoded: GoogleUser = jwtDecode(credentialResponse.credential);
        
        // Call the backend to authenticate with Google
        const response = await fetch(`${import.meta.env.VITE_API_URL || 'http://localhost:5001'}/api/auth/google`, {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
          },
          body: JSON.stringify({
            googleId: decoded.sub,
            email: decoded.email,
            firstName: decoded.given_name,
            lastName: decoded.family_name,
            picture: decoded.picture,
            emailVerified: decoded.email_verified
          }),
        });

        const data = await response.json();

        if (data.success) {
          // Login successful
          await loginWithGoogle(data.token, data.user);
          navigate('/');
        } else {
          console.error('Google authentication failed:', data.message);
        }
      }
    } catch (error) {
      console.error('Error processing Google authentication:', error);
    }
  };

  const handleError = () => {
    console.error('Google authentication failed');
  };

  return (
    <div className={className}>
      <GoogleLogin
        onSuccess={handleSuccess}
        onError={handleError}
        useOneTap
        theme="filled_blue"
        size="large"
        text="continue_with"
        shape="rectangular"
        locale="en"
      />
    </div>
  );
};

export default GoogleAuth;
