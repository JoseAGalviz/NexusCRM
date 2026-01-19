"use client";
import React, { useEffect, useState } from 'react';
import MainLayout from '@/components/layout/MainLayout';
import { useRouter } from 'next/navigation';

interface Deal {
    id: string;
    title: string;
    value: number;
    companyName: string;
    stage: 'prospect' | 'negotiation' | 'won' | 'lost';
}

export default function Pipeline() {
    const router = useRouter();
    const [deals, setDeals] = useState<Deal[]>([]);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        const fetchDeals = async () => {
            const token = localStorage.getItem('token');
            if (!token) {
                router.push('/auth/login');
                return;
            }
            try {
                const res = await fetch('http://192.168.4.69:4000/deals', {
                    headers: { 'Authorization': `Bearer ${token}` }
                });
                if (res.ok) {
                    const data = await res.json();
                    setDeals(data);
                }
            } catch (error) {
                console.error('Error fetching deals:', error);
            } finally {
                setLoading(false);
            }
        };
        fetchDeals();
    }, [router]);

    const getColumnItems = (stage: string) => deals.filter(d => d.stage === stage);

    const stages = [
        { title: 'Prospectos', stageKey: 'prospect', color: 'bg-indigo-500', items: getColumnItems('prospect') },
        { title: 'Negociación', stageKey: 'negotiation', color: 'bg-amber-500', items: getColumnItems('negotiation') },
        { title: 'Cierre', stageKey: 'won', color: 'bg-green-500', items: getColumnItems('won') },
        { title: 'Perdido', stageKey: 'lost', color: 'bg-red-500', items: getColumnItems('lost') },
    ];

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
            <header className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4 mb-6">
                <div>
                    <h2 className="text-2xl font-bold text-slate-900 dark:text-white">Pipeline de Ventas</h2>
                    <p className="text-sm text-slate-500 dark:text-[#93adc8] mt-1">Gestión de oportunidades por etapas.</p>
                </div>
                <button className="bg-primary hover:bg-primary/90 text-white text-sm font-medium px-4 py-2 rounded-lg shadow-sm transition-colors flex items-center gap-2">
                    <span className="material-symbols-outlined !text-[20px]">add</span>
                    <span>Nueva Oportunidad</span>
                </button>
            </header>

            <div className="flex gap-6 overflow-x-auto pb-6 h-[calc(100vh-200px)]">
                {stages.map((stage, i) => (
                    <div key={i} className="min-w-[320px] bg-white dark:bg-[#1e293b] rounded-xl border border-slate-100 dark:border-[#243647] flex flex-col shadow-sm">
                        {/* Stage Header */}
                        <div className="p-4 border-b border-slate-100 dark:border-[#243647] flex justify-between items-center">
                            <div className="flex items-center gap-2 font-semibold text-slate-900 dark:text-white">
                                <div className={`size-2.5 rounded-full ${stage.color}`}></div>
                                {stage.title}
                                <span className="bg-slate-100 dark:bg-[#243647] text-slate-600 dark:text-[#93adc8] text-xs px-2 py-0.5 rounded-full">
                                    {stage.items.length}
                                </span>
                            </div>
                            <button className="text-slate-400 hover:text-primary dark:text-[#93adc8] dark:hover:text-white">
                                <span className="material-symbols-outlined !text-[20px]">more_horiz</span>
                            </button>
                        </div>

                        {/* Stage Content */}
                        <div className="p-3 flex-1 flex flex-col gap-3 overflow-y-auto bg-slate-50/50 dark:bg-[#111a22]/30">
                            {stage.items.map((item) => (
                                <div key={item.id} className="bg-white dark:bg-[#243647] p-4 rounded-lg shadow-sm border border-slate-100 dark:border-[#243647]/50 hover:shadow-md cursor-grab transition-all group">
                                    <div className="font-semibold text-slate-900 dark:text-white mb-1 group-hover:text-primary transition-colors">{item.title}</div>
                                    <div className="text-xs text-slate-500 dark:text-[#93adc8] mb-3">{item.companyName || 'Sin compañía'}</div>
                                    <div className="flex justify-between items-center">
                                        <span className="text-sm font-bold text-slate-700 dark:text-slate-200">${Number(item.value).toLocaleString()}</span>
                                        <div className="size-6 rounded-full bg-slate-200 dark:bg-slate-600"></div>
                                    </div>
                                </div>
                            ))}
                            {stage.items.length === 0 && (
                                <div className="text-center py-8 text-slate-400 dark:text-slate-600 text-sm">
                                    Sin oportunidades
                                </div>
                            )}
                            <button className="w-full py-2 border border-dashed border-slate-300 dark:border-slate-600 rounded-lg text-slate-500 dark:text-[#93adc8] text-sm hover:bg-slate-50 dark:hover:bg-[#243647]/50 transition-colors flex items-center justify-center gap-1">
                                <span className="material-symbols-outlined !text-[18px]">add</span> Añadir
                            </button>
                        </div>
                    </div>
                ))}
            </div>
        </MainLayout>
    );
}
