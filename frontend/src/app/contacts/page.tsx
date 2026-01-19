"use client";
import React, { useEffect, useState } from 'react';
import MainLayout from '@/components/layout/MainLayout';
import { useRouter } from 'next/navigation';

interface Contact {
    id: string;
    firstName: string;
    lastName: string;
    email: string;
    company: string;
    status: string; // lead, customer, lost
}

export default function Contacts() {
    const router = useRouter();
    const [contacts, setContacts] = useState<Contact[]>([]);
    const [loading, setLoading] = useState(true);
    const [isModalOpen, setIsModalOpen] = useState(false);

    // Form State
    const [formData, setFormData] = useState({
        firstName: '',
        lastName: '',
        email: '',
        company: '',
        status: 'lead'
    });
    const [submitting, setSubmitting] = useState(false);

    useEffect(() => {
        fetchContacts();
    }, []);

    const fetchContacts = async () => {
        const token = localStorage.getItem('token');
        if (!token) {
            router.push('/auth/login');
            return;
        }
        try {
            const res = await fetch('http://192.168.4.69:4000/contacts', {
                headers: { 'Authorization': `Bearer ${token}` }
            });
            if (res.ok) {
                const data = await res.json();
                setContacts(data);
            }
        } catch (error) {
            console.error('Error fetching contacts:', error);
        } finally {
            setLoading(false);
        }
    };

    const handleCreate = async (e: React.FormEvent) => {
        e.preventDefault();
        setSubmitting(true);
        const token = localStorage.getItem('token');
        try {
            const res = await fetch('http://localhost:4000/contacts', {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                    'Authorization': `Bearer ${token}`
                },
                body: JSON.stringify(formData)
            });

            if (res.ok) {
                const newContact = await res.json();
                setContacts([...contacts, newContact]);
                setIsModalOpen(false);
                setFormData({ firstName: '', lastName: '', email: '', company: '', status: 'lead' });
            }
        } catch (error) {
            console.error('Error creating contact:', error);
        } finally {
            setSubmitting(false);
        }
    };

    const getStatusColor = (status: string) => {
        switch (status) {
            case 'customer': return 'bg-green-100 text-green-800 dark:bg-green-900/30 dark:text-green-300';
            case 'lead': return 'bg-blue-100 text-blue-800 dark:bg-blue-900/30 dark:text-blue-300';
            case 'lost': return 'bg-red-100 text-red-800 dark:bg-red-900/30 dark:text-red-300';
            default: return 'bg-slate-100 text-slate-800 dark:bg-slate-700/50 dark:text-slate-300';
        }
    };

    if (loading) {
        return (
            <MainLayout>
                <div className="flex items-center justify-center h-full">
                    <span className="material-symbols-outlined animate-spin text-4xl text-primary">progress_activity</span>
                </div>
            </MainLayout>
        );
    }

    return (
        <MainLayout>
            <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4 mb-6">
                <div>
                    <h2 className="text-2xl font-bold text-slate-900 dark:text-white">Contactos</h2>
                    <p className="text-sm text-slate-500 dark:text-[#93adc8] mt-1">Gestión de clientes y prospectos.</p>
                </div>
                <button
                    onClick={() => setIsModalOpen(true)}
                    className="bg-primary hover:bg-primary/90 text-white text-sm font-medium px-4 py-2 rounded-lg shadow-sm transition-colors flex items-center gap-2"
                >
                    <span className="material-symbols-outlined !text-[20px]">add</span>
                    <span>Nuevo Contacto</span>
                </button>
            </div>

            {/* Filters Bar */}
            <div className="bg-white dark:bg-[#1e293b] p-4 rounded-xl border border-slate-100 dark:border-[#243647] mb-6 flex flex-col sm:flex-row gap-4">
                <div className="flex-1 relative">
                    <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                        <span className="material-symbols-outlined text-slate-400 dark:text-[#93adc8]">search</span>
                    </div>
                    <input
                        type="text"
                        placeholder="Buscar contactos..."
                        className="block w-full pl-10 pr-3 py-2 border border-slate-200 dark:border-[#243647] rounded-lg leading-5 bg-slate-50 dark:bg-[#111a22] text-slate-900 dark:text-white placeholder-slate-500 dark:placeholder-[#93adc8] focus:outline-none focus:ring-2 focus:ring-primary sm:text-sm transition-colors"
                    />
                </div>
            </div>

            {/* Table */}
            <div className="bg-white dark:bg-[#1e293b] rounded-xl border border-slate-100 dark:border-[#243647] overflow-hidden shadow-sm">
                <div className="overflow-x-auto h-[calc(100vh-320px)]">
                    <table className="w-full text-left border-collapse">
                        <thead className="bg-slate-50 dark:bg-[#111a22] border-b border-slate-100 dark:border-[#243647] sticky top-0 z-10">
                            <tr>
                                <th className="px-6 py-4 text-xs font-semibold text-slate-500 dark:text-[#93adc8] uppercase tracking-wider">Nombre</th>
                                <th className="px-6 py-4 text-xs font-semibold text-slate-500 dark:text-[#93adc8] uppercase tracking-wider">Empresa</th>
                                <th className="px-6 py-4 text-xs font-semibold text-slate-500 dark:text-[#93adc8] uppercase tracking-wider">Email</th>
                                <th className="px-6 py-4 text-xs font-semibold text-slate-500 dark:text-[#93adc8] uppercase tracking-wider">Estado</th>
                                <th className="px-6 py-4 text-xs font-semibold text-slate-500 dark:text-[#93adc8] uppercase tracking-wider text-right">Acciones</th>
                            </tr>
                        </thead>
                        <tbody className="divide-y divide-slate-100 dark:divide-[#243647]">
                            {contacts.map((contact, i) => (
                                <tr key={i} className="hover:bg-slate-50 dark:hover:bg-[#243647]/30 transition-colors">
                                    <td className="px-6 py-4 whitespace-nowrap">
                                        <div className="flex items-center gap-3">
                                            <div className="size-8 rounded-full bg-primary/10 text-primary flex items-center justify-center font-bold text-sm uppercase">
                                                {contact.firstName?.charAt(0)}
                                            </div>
                                            <span className="text-sm font-medium text-slate-900 dark:text-white">{contact.firstName} {contact.lastName}</span>
                                        </div>
                                    </td>
                                    <td className="px-6 py-4 whitespace-nowrap text-sm text-slate-600 dark:text-[#93adc8]">{contact.company || '-'}</td>
                                    <td className="px-6 py-4 whitespace-nowrap text-sm text-slate-600 dark:text-[#93adc8]">{contact.email || '-'}</td>
                                    <td className="px-6 py-4 whitespace-nowrap">
                                        <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${getStatusColor(contact.status)}`}>
                                            {contact.status}
                                        </span>
                                    </td>
                                    <td className="px-6 py-4 whitespace-nowrap text-right">
                                        <button className="text-slate-400 hover:text-primary dark:text-[#93adc8] dark:hover:text-white transition-colors">
                                            <span className="material-symbols-outlined !text-[20px]">more_horiz</span>
                                        </button>
                                    </td>
                                </tr>
                            ))}
                            {contacts.length === 0 && (
                                <tr>
                                    <td colSpan={5} className="px-6 py-10 text-center text-slate-500">
                                        No se encontraron contactos.
                                    </td>
                                </tr>
                            )}
                        </tbody>
                    </table>
                </div>
            </div>

            {/* Modal */}
            {isModalOpen && (
                <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 backdrop-blur-sm p-4">
                    <div className="bg-white dark:bg-[#1e293b] rounded-xl shadow-xl border border-slate-100 dark:border-[#243647] w-full max-w-lg overflow-hidden animate-in fade-in zoom-in duration-200">
                        <div className="p-4 border-b border-slate-100 dark:border-[#243647] flex justify-between items-center">
                            <h3 className="font-semibold text-lg text-slate-900 dark:text-white">Nuevo Contacto</h3>
                            <button onClick={() => setIsModalOpen(false)} className="text-slate-400 hover:text-slate-600 dark:hover:text-white">
                                <span className="material-symbols-outlined">close</span>
                            </button>
                        </div>
                        <form onSubmit={handleCreate} className="p-4 space-y-4">
                            <div className="grid grid-cols-2 gap-4">
                                <div>
                                    <label className="block text-sm font-medium text-slate-700 dark:text-[#93adc8] mb-1">Nombre</label>
                                    <input
                                        type="text" required
                                        value={formData.firstName}
                                        onChange={(e) => setFormData({ ...formData, firstName: e.target.value })}
                                        className="w-full px-3 py-2 border border-slate-200 dark:border-[#243647] rounded-lg bg-slate-50 dark:bg-[#111a22] text-slate-900 dark:text-white focus:ring-2 focus:ring-primary focus:outline-none"
                                    />
                                </div>
                                <div>
                                    <label className="block text-sm font-medium text-slate-700 dark:text-[#93adc8] mb-1">Apellido</label>
                                    <input
                                        type="text" required
                                        value={formData.lastName}
                                        onChange={(e) => setFormData({ ...formData, lastName: e.target.value })}
                                        className="w-full px-3 py-2 border border-slate-200 dark:border-[#243647] rounded-lg bg-slate-50 dark:bg-[#111a22] text-slate-900 dark:text-white focus:ring-2 focus:ring-primary focus:outline-none"
                                    />
                                </div>
                            </div>
                            <div>
                                <label className="block text-sm font-medium text-slate-700 dark:text-[#93adc8] mb-1">Email</label>
                                <input
                                    type="email" required
                                    value={formData.email}
                                    onChange={(e) => setFormData({ ...formData, email: e.target.value })}
                                    className="w-full px-3 py-2 border border-slate-200 dark:border-[#243647] rounded-lg bg-slate-50 dark:bg-[#111a22] text-slate-900 dark:text-white focus:ring-2 focus:ring-primary focus:outline-none"
                                />
                            </div>
                            <div>
                                <label className="block text-sm font-medium text-slate-700 dark:text-[#93adc8] mb-1">Empresa</label>
                                <input
                                    type="text"
                                    value={formData.company}
                                    onChange={(e) => setFormData({ ...formData, company: e.target.value })}
                                    className="w-full px-3 py-2 border border-slate-200 dark:border-[#243647] rounded-lg bg-slate-50 dark:bg-[#111a22] text-slate-900 dark:text-white focus:ring-2 focus:ring-primary focus:outline-none"
                                />
                            </div>
                            <div>
                                <label className="block text-sm font-medium text-slate-700 dark:text-[#93adc8] mb-1">Estado</label>
                                <select
                                    value={formData.status}
                                    onChange={(e) => setFormData({ ...formData, status: e.target.value })}
                                    className="w-full px-3 py-2 border border-slate-200 dark:border-[#243647] rounded-lg bg-slate-50 dark:bg-[#111a22] text-slate-900 dark:text-white focus:ring-2 focus:ring-primary focus:outline-none"
                                >
                                    <option value="lead">Lead</option>
                                    <option value="customer">Customer</option>
                                    <option value="lost">Lost</option>
                                </select>
                            </div>
                            <div className="pt-2 flex justify-end gap-3">
                                <button
                                    type="button"
                                    onClick={() => setIsModalOpen(false)}
                                    className="px-4 py-2 text-sm font-medium text-slate-600 dark:text-[#93adc8] hover:bg-slate-100 dark:hover:bg-[#243647] rounded-lg transition-colors"
                                >
                                    Cancelar
                                </button>
                                <button
                                    type="submit"
                                    disabled={submitting}
                                    className="px-4 py-2 text-sm font-medium text-white bg-primary hover:bg-primary/90 rounded-lg shadow-sm transition-colors flex items-center gap-2"
                                >
                                    {submitting ? 'Guardando...' : 'Guardar Contacto'}
                                </button>
                            </div>
                        </form>
                    </div>
                </div>
            )}
        </MainLayout>
    );
}
