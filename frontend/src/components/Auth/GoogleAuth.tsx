import React from 'react';
import { GoogleLogin } from '@react-oauth/google';
import { useAuth } from '@/contexts/AuthContext';
import { useNavigate } from 'react-router-dom';
import { useToast } from '@/hooks/use-toast';

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
  const { toast } = useToast();

  const handleSuccess = async (credentialResponse: any) => {
    try {
      const idToken = credentialResponse?.credential;
      if (!idToken) {
        toast({
          title: 'Authentication Error',
          description: 'No token received from Google',
          variant: 'destructive',
        });
        return;
      }

        const response = await fetch(`${import.meta.env.VITE_API_URL || 'http://localhost:5001'}/api/auth/google`, {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ idToken }),
        });

        const data = await response.json();

        if (data.success) {
          await loginWithGoogle(data.token, data.user);
        toast({
          title: 'Success',
          description: 'Logged in with Google successfully',
        });
          navigate('/');
        } else {
        toast({
          title: 'Authentication Failed',
          description: data.message || 'Google login failed',
          variant: 'destructive',
        });
      }
    } catch (error: any) {
      toast({
        title: 'Error',
        description: 'An error occurred during Google login. Please try again.',
        variant: 'destructive',
      });
    }
  };

  const handleError = () => {
    toast({
      title: 'Authentication Failed',
      description: 'Google authentication was cancelled or failed',
      variant: 'destructive',
    });
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
