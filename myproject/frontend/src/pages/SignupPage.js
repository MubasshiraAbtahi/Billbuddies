import { useEffect } from 'react';
import { useNavigate } from 'react-router-dom';

// SignupPage is now integrated into LoginPage with tab toggle
// This component redirects to LoginPage
const SignupPage = () => {
  const navigate = useNavigate();

  useEffect(() => {
    navigate('/login');
  }, [navigate]);

  return null;
};

export default SignupPage;
