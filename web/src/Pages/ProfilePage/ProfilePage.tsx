import { useState, useEffect } from 'react';
import MainLayout from '../../Components/layout/MainLayout';
import LoginForm from './LoginForm';
import RegisterForm from './RegisterForm';
import ProfileView from './ProfileView';
import ManagePerfilPage from './ManagePerfilPage';

export default function ProfilePage() {
  const [userEmail, setUserEmail] = useState<string | null>(null);
  const [view, setView] = useState<'login' | 'register'>('login');

  //Nuevo estado que controla si se edita/crea el perfil de entidad
  const [isManagingPerfil, setIsManagingPerfil] = useState<boolean>(false);

  useEffect(() => {
    const savedUser = localStorage.getItem('demo_session_email');
    if (savedUser) {
      setUserEmail(savedUser);
    }
  }, []);

  const handleLoginSuccess = (email: string, token: string, rol: string) => {
    localStorage.setItem('token', token);
    localStorage.setItem('demo_session_email', email);
    localStorage.setItem('demo_session_rol', rol);
    setUserEmail(email);
  };

  const handleLogout = () => {
    localStorage.removeItem('token');
    localStorage.removeItem('demo_session_email');
    localStorage.removeItem('demo_session_rol');
    setUserEmail(null);
    setView('login');
    setIsManagingPerfil(false);
  };

  return (
    <MainLayout>
      <div className="py-10 min-h-[60hv] flex flex-col justify-center items-center">
        {userEmail ? (
          // Si el usuario está logueado, decidimos qué pantalla mostrar
          isManagingPerfil ? (
            <ManagePerfilPage onBack={() => setIsManagingPerfil(false)} />
          ) : (
            <ProfileView
              userEmail={userEmail}
              onLogout={handleLogout}
              onCreatePerfilClick={() => setIsManagingPerfil(true)} // ¡Acá solucionamos el error!
            />
          )
        ) : view === 'login' ? (
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
