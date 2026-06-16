import { useState, useEffect } from 'react';
import MainLayout from '../../Components/layout/MainLayout';
import LoginForm from './LoginForm';
import RegisterForm from './RegisterForm';
import ProfileView from './ProfileView';

export default function ProfilePage() {
  const [userEmail, setUserEmail] = useState<string | null>(null);
  const [view, setView] = useState<'login' | 'register'>('login');

  useEffect(() => {
    const savedUser = localStorage.getItem('demo_session_email');
    if (savedUser) {
      setUserEmail(savedUser);
    }
  }, []);

  const handleLoginSuccess = (email: string, token: string) => {
    localStorage.setItem('token', token);
    localStorage.setItem('demo_session_email', email);
    setUserEmail(email);
  };

  const handleLogout = () => {
    localStorage.removeItem('token');
    localStorage.removeItem('demo_session_email');
    setUserEmail(null);
    setView('login');
  };

  return (
    <MainLayout>
      <div className="py-10 min-h-[60hv] flex flex-col justify-center items-center">
        {userEmail ? (
          // Si el usuario está logueado, ve sus datos
          <ProfileView onLogout={handleLogout} userEmail={userEmail} />
        ) : view === 'login' ? (
          // Si no esta logueado y esta en vista login
          <LoginForm
            onLoginSuccess={handleLoginSuccess}
            onSwitchToRegister={() => setView('register')}
          />
        ) : (
          // Si no esta loguado y esta en vista registro
          <RegisterForm
            onRegisterSuccess={handleLoginSuccess}
            onSwitchToLogin={() => setView('login')}
          />
        )}
      </div>
    </MainLayout>
  );
}
