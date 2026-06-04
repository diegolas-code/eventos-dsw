import { BrowserRouter, Routes, Route } from 'react-router-dom';

import HomePage from '../../Pages/Home/Homepage';
import EventPage from '../../Pages/EventPage/EventPage';
import CreateEventPage from '../../Pages/CreateEventPage/CreateEventPage';
import ProfilePage from '../../Pages/ProfilePage/ProfilePage';
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
            <ProtectedRoute>
              <CreateEventPage />
            </ProtectedRoute>
          }
        />
        <Route path="/perfil" element={<ProfilePage />} />
      </Routes>
    </BrowserRouter>
  );
}
