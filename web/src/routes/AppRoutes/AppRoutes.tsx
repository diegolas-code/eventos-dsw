import { BrowserRouter, Routes, Route } from 'react-router-dom';

import HomePage from '../../Pages/Home/Homepage';
import EventPage from '../../Pages/EventPage/EventPage';
import CreateEventPage from '../../Pages/CreateEventPage/CreateEventPage';
import ProfilePage from '../../Pages/ProfilePage/ProfilePage';
import ModerationPage from '../../Pages/ModerationPage/ModerationPage';
import ProtectedRoute from './ProtectedRoute';

export default function AppRoutes() {
  return (
    <BrowserRouter>
      <Routes>
        <Route path="/" element={<HomePage />} />
        <Route path="/evento/:id" element={<EventPage />} />
        <Route
          path="/crear-evento"
          element={
            <ProtectedRoute allowedRoles={['artista', 'lugar', 'admin']}>
              <CreateEventPage />
            </ProtectedRoute>
          }
        />
        <Route
          path="/moderacion"
          element={
            <ProtectedRoute allowedRoles={['moderador', 'admin']}>
              <ModerationPage />
            </ProtectedRoute>
          }
        />
        <Route path="/perfil" element={<ProfilePage />} />
      </Routes>
    </BrowserRouter>
  );
}
