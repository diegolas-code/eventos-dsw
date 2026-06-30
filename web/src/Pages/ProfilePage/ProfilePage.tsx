import { useState, useEffect } from 'react';
import MainLayout from '../../Components/layout/MainLayout';
import LoginForm from './LoginForm';
import RegisterForm from './RegisterForm';
import ProfileView from './ProfileView';
import ManagePerfilPage from './ManagePerfilPage';
import DashboardView from './DashboardView';
import { useQuery, useQueryClient } from '@tanstack/react-query';
import api from '../../services/api';
import { useLocation } from 'react-router-dom';

export default function ProfilePage() {
  const [userId, setUserId] = useState<string | null>(() => {
    return localStorage.getItem('demo_session_id');
  });

  const [userEmail, setUserEmail] = useState<string | null>(() => {
    return localStorage.getItem('demo_session_email');
  });

  const [view, setView] = useState<'login' | 'register'>('login');
  const [isManagingPerfil, setIsManagingPerfil] = useState<boolean>(false);
  const [highlightBanner, setHighlightBanner] = useState(false);
  const queryClient = useQueryClient();
  const location = useLocation();

  useEffect(() => {
    //Si el usuario fue rebotado desde /crear-evento
    if (location.state?.emitirRegistroEntidad) {
      const banner = document.getElementById('banner-comercial');
      if (banner) {
        banner.scrollIntoView({ behavior: 'smooth', block: 'center' });
      }

      setHighlightBanner(true);

      const timer = setTimeout(() => setHighlightBanner(false), 2000);
      return () => clearTimeout(timer);
    }
  }, [location]);

  // Datos completos del usuario logueado
  const {
    data: usuario,
    isLoading,
    refetch,
  } = useQuery({
    queryKey: ['usuario-actual', userId],
    queryFn: async () => {
      if (!userId) return null;
      const response = await api.get(`/usuarios/${userId}`);

      if (response.data && response.data.data) {
        return response.data.data;
      }
      return response.data;
    },
    enabled: !!userEmail,
    retry: false,
  });

  // DATOS MOCKEADOS TEMPORALES PARA PRUEBA
  const usuarioMock = {
    id: 'user-id-real-o-falso',
    email: userEmail ?? 'melisasofia16@hotmail.com',
    nombre_mostrar: 'Melisa (Modo Test)',
    perfiles: [
      {
        id: 'perfil-test-123',
        nombre: 'Mi Banda de Post-Hardcore',
        tipo: 'ARTISTA',
      },
    ],
  };

  const handleLoginSuccess = (id: string, email: string, token: string, rol: string) => {
    localStorage.setItem('token', token);
    localStorage.setItem('demo_session_id', id);
    localStorage.setItem('demo_session_email', email);
    localStorage.setItem('demo_session_rol', rol);
    setUserId(id);
    setUserEmail(email);
  };

  const handleLogout = () => {
    localStorage.removeItem('token');
    localStorage.removeItem('demo_session_id');
    localStorage.removeItem('demo_session_email');
    localStorage.removeItem('demo_session_rol');
    setUserId(null);
    setUserEmail(null);
    setView('login');
    setIsManagingPerfil(false);
  };

  const handlePerfilActualizado = () => {
    setIsManagingPerfil(false);
    queryClient.invalidateQueries({ queryKey: ['usuario-actual', userId] });
  };

  return (
    <MainLayout>
      <div className="py-10 min-h-[60hv] flex flex-col justify-center items-center">
        {userEmail ? (
          isLoading ? (
            <p className="text-zinc-500">Cargando datos de tu cuenta...</p>
          ) : isManagingPerfil ? (
            <ManagePerfilPage
              perfilInicial={usuario?.perfiles?.[0]}
              onBack={handlePerfilActualizado}
            />
          ) : (
            //Vista perfil y Agenda/Dashboard
            <div className="w-full max-w-4xl space-y-6">
              <ProfileView
                userEmail={userEmail}
                usuarioData={usuario}
                //usuarioData={usuarioMock}
                onLogout={handleLogout}
                onUsuarioActualizado={refetch}
                onCreatePerfilClick={() => setIsManagingPerfil(true)}
                highlightBanner={highlightBanner}
              />

              <DashboardView
                usuarioData={usuario}
                //usuarioData={usuarioMock}
                onEditarPerfilClick={() => setIsManagingPerfil(true)}
              />
            </div>
          )
        ) : view === 'login' ? (
          <LoginForm
            onLoginSuccess={handleLoginSuccess}
            onSwitchToRegister={() => setView('register')}
          />
        ) : (
          // Si no esta logueado y esta en vista registro
          <RegisterForm
            onRegisterSuccess={handleLoginSuccess}
            onSwitchToLogin={() => setView('login')}
          />
        )}
      </div>
    </MainLayout>
  );
}
