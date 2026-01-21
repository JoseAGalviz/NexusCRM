"use client";
import React, { useState } from 'react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import API_URL from '@/config/api';

export default function Register() {
    const [formData, setFormData] = useState({
        firstName: '',
        lastName: '',
        email: '',
        password: '',
        confirmPassword: ''
    });
    const [error, setError] = useState('');
    const [success, setSuccess] = useState(false);
    const [loading, setLoading] = useState(false);
    const router = useRouter();

    const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
        setFormData({
            ...formData,
            [e.target.name]: e.target.value
        });
    };

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        setError('');

        if (formData.password !== formData.confirmPassword) {
            setError('Las contraseñas no coinciden');
            return;
        }

        setLoading(true);

        try {
            const res = await fetch(`${API_URL}/auth/register`, {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({
                    email: formData.email,
                    password: formData.password,
                    firstName: formData.firstName,
                    lastName: formData.lastName,
                    role: 'sales' // Default role for public registration
                }),
            });

            if (!res.ok) {
                const data = await res.json();
                throw new Error(data.message || 'Error al registrar usuario');
            }

            setSuccess(true);
            setTimeout(() => {
                router.push('/auth/login');
            }, 3000);
        } catch (err: any) {
            setError(err.message || 'Error al conectar con el servidor');
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
                        <span className="material-symbols-outlined !text-[28px]">person_add</span>
                    </div>
                    <h2 className="text-2xl font-bold text-slate-900 dark:text-white">Crear cuenta</h2>
                    <p className="text-sm text-slate-500 dark:text-[#93adc8] mt-2">Únete a Nexus CRM hoy mismo</p>
                </div>

                {/* Success Message */}
                {success ? (
                    <div className="text-center space-y-4">
                        <div className="p-4 bg-green-50 dark:bg-green-900/10 border border-green-100 dark:border-green-900/30 rounded-lg text-green-600 dark:text-green-400">
                            <p className="font-medium">¡Registro exitoso!</p>
                            <p className="text-sm mt-1">Redirigiendo a la página de inicio de sesión...</p>
                        </div>
                        <span className="material-symbols-outlined animate-spin text-primary">progress_activity</span>
                    </div>
                ) : (
                    <form onSubmit={handleSubmit} className="space-y-4">
                        {error && (
                            <div className="p-3 text-sm text-red-500 bg-red-50 dark:bg-red-900/10 border border-red-100 dark:border-red-900/30 rounded-lg">
                                {error}
                            </div>
                        )}

                        <div className="grid grid-cols-2 gap-4">
                            <div>
                                <label className="block text-sm font-medium text-slate-700 dark:text-[#93adc8] mb-1.5">Nombre</label>
                                <input
                                    name="firstName"
                                    type="text"
                                    required
                                    value={formData.firstName}
                                    onChange={handleChange}
                                    placeholder="Juan"
                                    className="block w-full px-3 py-2 border border-slate-200 dark:border-[#243647] rounded-lg bg-slate-50 dark:bg-[#111a22] text-slate-900 dark:text-white placeholder-slate-400 focus:outline-none focus:ring-2 focus:ring-primary focus:border-transparent transition-all"
                                />
                            </div>
                            <div>
                                <label className="block text-sm font-medium text-slate-700 dark:text-[#93adc8] mb-1.5">Apellido</label>
                                <input
                                    name="lastName"
                                    type="text"
                                    required
                                    value={formData.lastName}
                                    onChange={handleChange}
                                    placeholder="Pérez"
                                    className="block w-full px-3 py-2 border border-slate-200 dark:border-[#243647] rounded-lg bg-slate-50 dark:bg-[#111a22] text-slate-900 dark:text-white placeholder-slate-400 focus:outline-none focus:ring-2 focus:ring-primary focus:border-transparent transition-all"
                                />
                            </div>
                        </div>

                        <div>
                            <label className="block text-sm font-medium text-slate-700 dark:text-[#93adc8] mb-1.5">Email</label>
                            <input
                                name="email"
                                type="email"
                                required
                                value={formData.email}
                                onChange={handleChange}
                                placeholder="tu@email.com"
                                className="block w-full px-3 py-2 border border-slate-200 dark:border-[#243647] rounded-lg bg-slate-50 dark:bg-[#111a22] text-slate-900 dark:text-white placeholder-slate-400 focus:outline-none focus:ring-2 focus:ring-primary focus:border-transparent transition-all"
                            />
                        </div>

                        <div>
                            <label className="block text-sm font-medium text-slate-700 dark:text-[#93adc8] mb-1.5">Contraseña</label>
                            <input
                                name="password"
                                type="password"
                                required
                                value={formData.password}
                                onChange={handleChange}
                                placeholder="••••••••"
                                className="block w-full px-3 py-2 border border-slate-200 dark:border-[#243647] rounded-lg bg-slate-50 dark:bg-[#111a22] text-slate-900 dark:text-white placeholder-slate-400 focus:outline-none focus:ring-2 focus:ring-primary focus:border-transparent transition-all"
                            />
                        </div>

                        <div>
                            <label className="block text-sm font-medium text-slate-700 dark:text-[#93adc8] mb-1.5">Confirmar Contraseña</label>
                            <input
                                name="confirmPassword"
                                type="password"
                                required
                                value={formData.confirmPassword}
                                onChange={handleChange}
                                placeholder="••••••••"
                                className="block w-full px-3 py-2 border border-slate-200 dark:border-[#243647] rounded-lg bg-slate-50 dark:bg-[#111a22] text-slate-900 dark:text-white placeholder-slate-400 focus:outline-none focus:ring-2 focus:ring-primary focus:border-transparent transition-all"
                            />
                        </div>

                        <button
                            type="submit"
                            disabled={loading}
                            className="w-full bg-primary hover:bg-primary/90 text-white font-semibold py-2.5 rounded-lg shadow-md hover:shadow-lg transition-all transform active:scale-[0.98] disabled:opacity-70 disabled:cursor-not-allowed flex justify-center"
                        >
                            {loading ? <span className="material-symbols-outlined animate-spin text-sm">progress_activity</span> : 'Registrarse'}
                        </button>

                        <div className="text-center mt-4">
                            <p className="text-sm text-slate-500 dark:text-[#93adc8]">
                                ¿Ya tienes cuenta?{' '}
                                <Link href="/auth/login" className="text-primary font-medium hover:underline">
                                    Inicia sesión
                                </Link>
                            </p>
                        </div>
                    </form>
                )}
            </div>
        </div>
    );
}
