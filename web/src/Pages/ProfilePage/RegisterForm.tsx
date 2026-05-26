import { useState } from 'react';
import { createUsuario } from '../../services/userService';

interface RegisterFormProps {
  onRegisterSuccess: (email: string) => void;
  onSwitchToLogin: () => void;
}

export default function RegisterForm({ onRegisterSuccess, onSwitchToLogin }: RegisterFormProps) {
  const [email, setEmail] = useState('');
  const [nombre, setNombre] = useState('');
  const [loading, setLoading] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!email.trim() || !nombre.trim()) return alert('Completá todos los campos');

    try {
      setLoading(false);
      await createUsuario({ email, nombreMostrar: nombre });
      alert('¡Usuario registrado con éxito en el backend!');
      onRegisterSuccess(email);
    } catch (error) {
      console.error(error);
      alert('Error al registrar el usuario. ¿Quizas el backend está apagado?');
    }
  };

  return (
    <div className="max-w-md w-full mx-auto bg-white border border-zinc-200 p-8 rounded-[32px] shadow-md">
      <h2 className="text-3xl font-bold text-zinc-900 mb-6 text-center">Crear cuenta</h2>
      <form onSubmit={handleSubmit} className="space-y-4">
        <div>
          <label className="block text-sm font-medium text-zinc-600 mb-2">Nombre</label>
          <input
            type="text"
            value={nombre}
            onChange={e => setNombre(e.target.value)}
            className="w-full px-5 py-3 border border-zinc-300 rounded-2xl text-black outline-none focus:border-violet-600 transition-colors"
            placeholder="Ej: Carlos S."
          />
        </div>
        <div>
          <label className="block text-sm font-medium text-zinc-600 mb-2">Correo Electrónico</label>
          <input
            type="email"
            value={email}
            onChange={e => setEmail(e.target.value)}
            className="w-full px-5 py-3 border border-zinc-300 rounded-2xl text-black outline-none focus:border-violet-600 transition-colors"
            placeholder="tu@email.com"
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
        <button onClick={onSwitchToLogin} className="text-violet-600 hover:underline font-semibold">
          Iniciá sesión
        </button>
      </p>
    </div>
  );
}
