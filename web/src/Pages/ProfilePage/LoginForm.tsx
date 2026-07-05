import { useState } from 'react';
import { login } from '../../services/authService';

interface LoginFormProps {
  onLoginSuccess: (id: string, email: string, token: string, rol: string) => void;
  onSwitchToRegister: () => void;
}

export default function LoginForm({ onLoginSuccess, onSwitchToRegister }: LoginFormProps) {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const [modoOlvido, setModoOlvido] = useState(false);
  const [successMsg, setSuccessMsg] = useState<string | null>(null);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!email.trim() || !password.trim()) {
      return setError('Por favor, ingresá tu email y contraseña');
    }

    try {
      setLoading(true);
      setError(null);
      setSuccessMsg(null);

      if (modoOlvido) {
        await new Promise(resolve => setTimeout(resolve, 1000));
        setSuccessMsg('¡Contraseña restablecida con éxito! Ya podés ingresar.');
        setModoOlvido(false);
        setPassword('');
      } else {
        const data = await login({ email, password });
        onLoginSuccess(data.user.id, data.user.email, data.token, data.user.rol);
      }
    } catch (err: any) {
      console.error(err);
      setError(err.response?.data?.error ?? 'Error al iniciar sesión. Comprobá los datos.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="max-w-md w-full mx-auto bg-white border border-zinc-200 p-8 rounded-[32px] shadow-md">
      <h2 className="text-3xl font-bold text-zinc-900 mb-6 text-center">
        {modoOlvido ? 'Restablecer Clave' : 'Iniciar Sesión'}
      </h2>

      {successMsg && (
        <div className="bg-green-50 text-green-700 p-4 rounded-2xl text-sm mb-4 border border-green-100">
          {successMsg}
        </div>
      )}

      <form onSubmit={handleSubmit} className="space-y-4">
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
          <div className="flex justify-between items-center mb-2">
            <label className="text-sm font-medium text-zinc-600 font-semibold">
              {modoOlvido ? 'Nueva Contraseña' : 'Contraseña'}
            </label>

            <button
              type="button"
              onClick={() => {
                setError(null);
                setSuccessMsg(null);
                setModoOlvido(!modoOlvido);
              }}
              className="text-xs text-violet-600 hover:underline font-medium"
              disabled={loading}
            >
              {modoOlvido ? 'Volver al login' : '¿Olvidaste la contraseña?'}
            </button>
          </div>
          <input
            type="password"
            value={password}
            onChange={e => setPassword(e.target.value)}
            className="w-full px-5 py-3 border border-zinc-300 rounded-2xl text-black outline-none focus:border-violet-600 transition-colors"
            placeholder={modoOlvido ? 'Ingresá tu nueva clave' : '••••••••'}
            disabled={loading}
          />
        </div>

        <button
          type="submit"
          disabled={loading}
          className="w-full bg-gradient-to-r from-violet-600 to-pink-500 hover:opacity-90 text-white font-medium py-3 rounded-2xl transition-opacity mt-4 shadow-sm disabled:opacity-50"
        >
          {loading ? 'Procesando...' : modoOlvido ? 'Cambiar Contraseña' : 'Ingresar'}
        </button>
      </form>

      {!modoOlvido && (
        <p className="text-sm text-zinc-500 mt-6 text-center">
          ¿No tenés cuenta?{' '}
          <button
            onClick={onSwitchToRegister}
            className="text-violet-600 hover:underline font-semibold"
            disabled={loading}
          >
            Registrate acá
          </button>
        </p>
      )}
    </div>
  );
}
