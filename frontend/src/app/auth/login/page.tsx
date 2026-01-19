"use client";
import React, { useState } from 'react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';

export default function Login() {
    const [email, setEmail] = useState('');
    const [password, setPassword] = useState('');
    const [error, setError] = useState('');
    const [loading, setLoading] = useState(false);
    const router = useRouter();

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        setError('');
        setLoading(true);

        try {
            const res = await fetch('http://192.168.4.69:4000/auth/login', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ email, password }),
            });

            if (!res.ok) {
                throw new Error('Credenciales inválidas');
            }

            const data = await res.json();
            localStorage.setItem('token', data.access_token);
            localStorage.setItem('user', JSON.stringify(data.user)); // Store basic user info

            // Redirect to dashboard
            router.push('/dashboard');
        } catch (err: any) {
            setError(err.message || 'Error al iniciar sesión');
        } finally {
            setLoading(false);
        }
    };

    return (
        <div className="min-h-screen flex items-center justify-center bg-background-light dark:bg-background-dark p-4">
            <div className="w-full max-w-md bg-white dark:bg-[#1e293b] rounded-xl shadow-lg border border-slate-100 dark:border-[#243647] p-8">

                {/* Header */}
                <div className="text-center mb-8">
                    <div className="size-12 bg-primary rounded-xl mx-auto mb-4 flex items-center justify-center text-white shadow-lg shadow-primary/30">
                        <span className="material-symbols-outlined !text-[28px]">lock</span>
                    </div>
                    <h2 className="text-2xl font-bold text-slate-900 dark:text-white">Bienvenido de nuevo</h2>
                    <p className="text-sm text-slate-500 dark:text-[#93adc8] mt-2">Ingresa a tu cuenta para continuar</p>
                </div>

                {/* Form */}
                <form onSubmit={handleSubmit} className="space-y-5">
                    {error && (
                        <div className="p-3 text-sm text-red-500 bg-red-50 dark:bg-red-900/10 border border-red-100 dark:border-red-900/30 rounded-lg">
                            {error}
                        </div>
                    )}

                    <div>
                        <label className="block text-sm font-medium text-slate-700 dark:text-[#93adc8] mb-1.5">Email</label>
                        <input
                            type="email"
                            required
                            value={email}
                            onChange={(e) => setEmail(e.target.value)}
                            placeholder="tu@email.com"
                            className="block w-full px-3 py-2 border border-slate-200 dark:border-[#243647] rounded-lg bg-slate-50 dark:bg-[#111a22] text-slate-900 dark:text-white placeholder-slate-400 focus:outline-none focus:ring-2 focus:ring-primary focus:border-transparent transition-all"
                        />
                    </div>
                    <div>
                        <div className="flex justify-between items-center mb-1.5">
                            <label className="block text-sm font-medium text-slate-700 dark:text-[#93adc8]">Contraseña</label>
                            <Link href="#" className="text-xs font-medium text-primary hover:text-primary/80">¿Olvidaste tu contraseña?</Link>
                        </div>
                        <input
                            type="password"
                            required
                            value={password}
                            onChange={(e) => setPassword(e.target.value)}
                            placeholder="••••••••"
                            className="block w-full px-3 py-2 border border-slate-200 dark:border-[#243647] rounded-lg bg-slate-50 dark:bg-[#111a22] text-slate-900 dark:text-white placeholder-slate-400 focus:outline-none focus:ring-2 focus:ring-primary focus:border-transparent transition-all"
                        />
                    </div>
                    <button
                        type="submit"
                        disabled={loading}
                        className="w-full bg-primary hover:bg-primary/90 text-white font-semibold py-2.5 rounded-lg shadow-md hover:shadow-lg transition-all transform active:scale-[0.98] disabled:opacity-70 disabled:cursor-not-allowed flex justify-center"
                    >
                        {loading ? <span className="material-symbols-outlined animate-spin text-sm">progress_activity</span> : 'Iniciar Sesión'}
                    </button>
                </form>

                {/* Social Auth */}
                <div className="mt-8 relative text-center">
                    <div className="absolute inset-0 flex items-center"><div className="w-full border-t border-slate-200 dark:border-[#243647]"></div></div>
                    <span className="relative bg-white dark:bg-[#1e293b] px-3 text-xs text-slate-500 dark:text-[#93adc8] uppercase tracking-wider">O continúa con</span>
                </div>

                <div className="mt-6 grid grid-cols-2 gap-4">
                    <button type="button" className="flex items-center justify-center gap-2 px-4 py-2.5 border border-slate-200 dark:border-[#243647] rounded-lg text-slate-600 dark:text-white hover:bg-slate-50 dark:hover:bg-[#243647] transition-colors">
                        <svg className="size-5" viewBox="0 0 24 24" fill="currentColor"><path d="M12.545,10.239v3.821h5.445c-0.712,2.315-2.647,3.972-5.445,3.972c-3.332,0-6.033-2.701-6.033-6.032s2.701-6.032,6.033-6.032c1.498,0,2.866,0.549,3.921,1.453l2.814-2.814C17.503,2.988,15.139,2,12.545,2C7.021,2,2.543,6.477,2.543,12s4.478,10,10.002,10c8.396,0,10.249-7.85,9.426-11.748L12.545,10.239z" /></svg>
                        <span className="text-sm font-medium">Google</span>
                    </button>
                    <button type="button" className="flex items-center justify-center gap-2 px-4 py-2.5 border border-slate-200 dark:border-[#243647] rounded-lg text-slate-600 dark:text-white hover:bg-slate-50 dark:hover:bg-[#243647] transition-colors">
                        <svg className="size-5" viewBox="0 0 24 24" fill="currentColor"><path d="M12 2C6.477 2 2 6.484 2 12.017c0 4.425 2.865 8.18 6.839 9.504.5.092.682-.217.682-.483 0-.237-.008-.868-.013-1.703-2.782.605-3.369-1.343-3.369-1.343-.454-1.158-1.11-1.466-1.11-1.466-.908-.62.069-.608.069-.608 1.003.07 1.531 1.032 1.531 1.032.892 1.53 2.341 1.088 2.91.832.092-.647.35-1.088.636-1.338-2.22-.253-4.555-1.113-4.555-4.951 0-1.093.39-1.988 1.029-2.688-.103-.253-.446-1.272.098-2.65 0 0 .84-.27 2.75 1.026A9.564 9.564 0 0112 6.844c.85.004 1.705.115 2.504.337 1.909-1.296 2.747-1.027 2.747-1.027.546 1.379.202 2.398.1 2.651.64.7 1.028 1.595 1.028 2.688 0 3.848-2.339 4.695-4.566 4.943.359.309.678.92.678 1.855 0 1.338-.012 2.419-.012 2.747 0 .268.18.58.688.482A10.019 10.019 0 0022 12.017C22 6.484 17.522 2 12 2z" /></svg>
                        <span className="text-sm font-medium">GitHub</span>
                    </button>
                </div>
            </div>
        </div>
    );
}
