import { useState } from 'react';
import { useSearchParams, useNavigate } from 'react-router-dom';
import MainLayout from '../../Components/layout/MainLayout';
import api from '../../services/api';

export default function ResetPasswordPage() {
  const [searchParams] = useSearchParams();
  const token = searchParams.get('token');
  const navigate = useNavigate();

  const [nuevaClave, setNuevaClave] = useState('');
  const [loading, setLoading] = useState(false);
  const [msg, setMsg] = useState<{ tipo: 'ok' | 'error'; texto: string } | null>(null);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (nuevaClave.length < 6) {
      setMsg({ tipo: 'error', texto: 'La contraseña debe tener al menos 6 caracteres.' });
      return;
    }
    setLoading(true);
    setMsg(null);

    try {
      await api.post('/auth/reset-password', { token, nuevaClave });
      setMsg({ tipo: 'ok', texto: 'Contraseña actualizada con éxito. Redirigiendo al login...' });
      setTimeout(() => {
        navigate('/perfil');
      }, 3000);
    } catch (err: any) {
      console.error(err);
      const errorMsg = err.response?.data?.error || 'El token es inválido o ha expirado.';
      setMsg({ tipo: 'error', texto: errorMsg });
    } finally {
      setLoading(false);
    }
  };

  return (
    <MainLayout>
      <div className="py-10 min-h-[60vh] flex flex-col justify-center items-center">
        <div className="max-w-md w-full bg-white border border-zinc-200 p-8 rounded-[32px] shadow-md">
          <h2 className="text-2xl font-bold text-zinc-900 text-center mb-6">
            Restablecer Contraseña
          </h2>

          {msg && (
            <div
              className={`p-4 mb-4 rounded-2xl text-sm border ${
                msg.tipo === 'ok'
                  ? 'bg-green-50 text-green-700 border-green-100'
                  : 'bg-red-50 text-red-600 border-red-100'
              }`}
            >
              {msg.texto}
            </div>
          )}

          <form onSubmit={handleSubmit} className="space-y-4">
            <div>
              <label className="block text-xs font-semibold text-zinc-600 mb-1.5">
                Nueva Contraseña
              </label>
              <input
                type="password"
                value={nuevaClave}
                onChange={e => setNuevaClave(e.target.value)}
                placeholder="Mínimo 6 caracteres"
                className="w-full px-4 py-2.5 border border-zinc-300 rounded-xl text-sm outline-none focus:border-violet-600 transition-colors bg-zinc-50 focus:bg-white"
                disabled={loading || msg?.tipo === 'ok'}
                required
              />
            </div>

            <button
              type="submit"
              disabled={loading || msg?.tipo === 'ok'}
              className="w-full bg-violet-600 hover:bg-violet-700 text-white font-bold py-3 rounded-xl transition-colors shadow-sm disabled:opacity-50"
            >
              {loading ? 'Actualizando...' : 'Actualizar contraseña'}
            </button>
          </form>
        </div>
      </div>
    </MainLayout>
  );
}
