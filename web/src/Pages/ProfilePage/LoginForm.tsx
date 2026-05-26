import { useState } from 'react';

interface LoginFormProps {
  onLoginSuccess: (email: string) => void;
  onSwitchToRegister: () => void;
}

export default function LoginForm({ onLoginSuccess, onSwitchToRegister }: LoginFormProps) {
  const [email, setEmail] = useState('');

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!email.trim()) return alert('Por favor, ingresá tu email');
    onLoginSuccess(email);
  };

  return (
    <div className="max-w-md w-full mx-auto bg-white border border-zinc-200 p-8 rounded-[32px] shadow-md">
      <h2 className="text-3xl font-bold text-zinc-900 mb-6 text-center">Iniciar Sesión</h2>
      <form onSubmit={handleSubmit} className="space-y-4">
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
          className="w-full bg-gradient-to-r from-violet-600 to-pink-500 hover:opacity-90 text-white font-medium py-3 rounded-2xl transition-opacity mt-4 shadow-sm"
        >
          Ingresar
        </button>
      </form>
      <p className="text-sm text-zinc-500 mt-6 text-center">
        ¿No tenes cuenta?{' '}
        <button
          onClick={onSwitchToRegister}
          className="text-violet-600 hover:underline font-semibold"
        >
          Registrate acá
        </button>
      </p>
    </div>
  );
}
