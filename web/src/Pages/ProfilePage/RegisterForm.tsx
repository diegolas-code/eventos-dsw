import { useState } from 'react';
import { register } from '../../services/authService';

interface RegisterFormProps {
  onRegisterSuccess: (email: string, token: string) => void;
  onSwitchToLogin: () => void;
}

export default function RegisterForm({ onRegisterSuccess, onSwitchToLogin }: RegisterFormProps) {
  const [email, setEmail] = useState('');
  const [nombre, setNombre] = useState('');
  const [password, setPassword] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!email.trim() || !nombre.trim() || !password.trim()) {
      return setError('Por favor, completá todos los campos');
    }

    try {
      setLoading(true);
      setError(null);
      const data = await register({
        email,
        nombreMostrar: nombre,
        password,
      });
      alert('¡Usuario registrado con éxito!');
      onRegisterSuccess(data.user.email, data.token);
    } catch (err: any) {
      console.error(err);
      setError(err.response?.data?.error ?? 'Error al registrar el usuario. Comprobá los datos.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="max-w-md w-full mx-auto bg-white border border-zinc-200 p-8 rounded-[32px] shadow-md">
      <h2 className="text-3xl font-bold text-zinc-900 mb-6 text-center">Crear cuenta</h2>

      {error && (
        <div className="bg-red-50 text-red-600 p-4 rounded-2xl text-sm mb-4 border border-red-100">
          {error}
        </div>
      )}

      <form onSubmit={handleSubmit} className="space-y-4">
        <div>
          <label className="block text-sm font-medium text-zinc-600 mb-2 font-semibold">
            Nombre
          </label>
          <input
            type="text"
            value={nombre}
            onChange={e => setNombre(e.target.value)}
            className="w-full px-5 py-3 border border-zinc-300 rounded-2xl text-black outline-none focus:border-violet-600 transition-colors"
            placeholder="Ej: Carlos S."
            disabled={loading}
          />
        </div>

        <div>
          <label className="block text-sm font-medium text-zinc-600 mb-2 font-semibold">
            Correo Electrónico
          </label>
          <input
            type="email"
            value={email}
            onChange={e => setEmail(e.target.value)}
            className="w-full px-5 py-3 border border-zinc-300 rounded-2xl text-black outline-none focus:border-violet-600 transition-colors"
            placeholder="tu@email.com"
            disabled={loading}
          />
        </div>

        <div>
          <label className="block text-sm font-medium text-zinc-600 mb-2 font-semibold">
            Contraseña
          </label>
          <input
            type="password"
            value={password}
            onChange={e => setPassword(e.target.value)}
            className="w-full px-5 py-3 border border-zinc-300 rounded-2xl text-black outline-none focus:border-violet-600 transition-colors"
            placeholder="••••••••"
            disabled={loading}
          />
        </div>

        <button
          type="submit"
          disabled={loading}
          className="w-full bg-gradient-to-r from-violet-600 to-pink-500 hover:opacity-90 text-white font-medium py-3 rounded-2xl transition-opacity mt-4 disabled:opacity-50 shadow-sm"
        >
          {loading ? 'Registrando...' : 'Registrarse'}
        </button>
      </form>

      <p className="text-sm text-zinc-500 mt-6 text-center">
        ¿Ya tenés cuenta?{' '}
        <button
          onClick={onSwitchToLogin}
          className="text-violet-600 hover:underline font-semibold"
          disabled={loading}
        >
          Iniciá sesión
        </button>
      </p>
    </div>
  );
}
