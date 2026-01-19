"use client";
import React, { useEffect, useState } from 'react';
import MainLayout from '@/components/layout/MainLayout';
import { useRouter } from 'next/navigation';

interface DashboardStats {
    revenue: number;
    activeDeals: number;
    winRate: number;
    newLeads: number;
    funnel: Record<string, number>;
}

export default function Dashboard() {
    const router = useRouter();
    const [stats, setStats] = useState<DashboardStats | null>(null);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        const fetchStats = async () => {
            const token = localStorage.getItem('token');
            if (!token) {
                router.push('/auth/login');
                return;
            }

            try {
                const res = await fetch('http://192.168.4.69:4000/dashboard/stats', {
                    headers: { 'Authorization': `Bearer ${token}` }
                });
                if (res.ok) {
                    const data = await res.json();
                    setStats(data);
                } else if (res.status === 401) {
                    router.push('/auth/login');
                }
            } catch (error) {
                console.error('Error fetching dashboard stats:', error);
            } finally {
                setLoading(false);
            }
        };

        fetchStats();
    }, [router]);

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
            {/* Title Section */}
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
                <div>
                    <h1 className="text-2xl font-bold text-slate-900 dark:text-white tracking-tight">Executive Dashboard</h1>
                    <p className="text-sm text-slate-500 dark:text-[#93adc8] mt-1">Overview of your sales performance and upcoming activities.</p>
                </div>
            </div>

            {/* KPI Cards Row */}
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                {/* Card 1 */}
                <div className="bg-white dark:bg-[#1e293b] rounded-xl p-6 shadow-sm border border-slate-100 dark:border-[#243647] flex flex-col gap-1">
                    <div className="flex items-center justify-between mb-2">
                        <p className="text-sm font-medium text-slate-500 dark:text-[#93adc8]">Total Revenue</p>
                        <span className="bg-green-100 dark:bg-green-500/10 text-green-600 dark:text-green-400 text-xs font-semibold px-2 py-0.5 rounded-full flex items-center gap-1">
                            <span className="material-symbols-outlined !text-[12px]">trending_up</span> 15%
                        </span>
                    </div>
                    <h3 className="text-3xl font-bold text-slate-900 dark:text-white">
                        ${stats?.revenue.toLocaleString()}
                    </h3>
                    <p className="text-xs text-slate-400 dark:text-[#93adc8] mt-1">Closed deals value</p>
                </div>
                {/* Card 2 */}
                <div className="bg-white dark:bg-[#1e293b] rounded-xl p-6 shadow-sm border border-slate-100 dark:border-[#243647] flex flex-col gap-1">
                    <div className="flex items-center justify-between mb-2">
                        <p className="text-sm font-medium text-slate-500 dark:text-[#93adc8]">New Leads</p>
                        <span className="bg-green-100 dark:bg-green-500/10 text-green-600 dark:text-green-400 text-xs font-semibold px-2 py-0.5 rounded-full flex items-center gap-1">
                            <span className="material-symbols-outlined !text-[12px]">trending_up</span> 5%
                        </span>
                    </div>
                    <h3 className="text-3xl font-bold text-slate-900 dark:text-white">{stats?.newLeads}</h3>
                    <p className="text-xs text-slate-400 dark:text-[#93adc8] mt-1">Active candidates</p>
                </div>
                {/* Card 3 */}
                <div className="bg-white dark:bg-[#1e293b] rounded-xl p-6 shadow-sm border border-slate-100 dark:border-[#243647] flex flex-col gap-1">
                    <div className="flex items-center justify-between mb-2">
                        <p className="text-sm font-medium text-slate-500 dark:text-[#93adc8]">Win Rate</p>
                        <span className="bg-slate-100 dark:bg-slate-700 text-slate-600 dark:text-slate-300 text-xs font-semibold px-2 py-0.5 rounded-full">
                            Target 45%
                        </span>
                    </div>
                    <h3 className="text-3xl font-bold text-slate-900 dark:text-white">{stats?.winRate.toFixed(1)}%</h3>
                    <p className="text-xs text-slate-400 dark:text-[#93adc8] mt-1">Based on closed deals</p>
                </div>
            </div>

            {/* Charts Section */}
            <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
                {/* Sales Funnel Chart */}
                <div className="lg:col-span-1 bg-white dark:bg-[#1e293b] rounded-xl p-6 shadow-sm border border-slate-100 dark:border-[#243647]">
                    <div className="flex items-center justify-between mb-6">
                        <h3 className="text-base font-semibold text-slate-900 dark:text-white">Sales Funnel</h3>
                    </div>
                    <div className="flex flex-col gap-4">
                        <div className="relative group">
                            <div className="flex justify-between text-xs font-medium text-slate-500 dark:text-[#93adc8] mb-1">
                                <span>Prospects</span>
                                <span className="text-slate-900 dark:text-white font-bold">{stats?.funnel?.prospect || 0}</span>
                            </div>
                            <div className="h-3 w-full bg-slate-100 dark:bg-[#243647] rounded-full overflow-hidden">
                                <div className="h-full bg-primary rounded-full" style={{ width: '100%' }}></div>
                            </div>
                        </div>
                        <div className="relative group">
                            <div className="flex justify-between text-xs font-medium text-slate-500 dark:text-[#93adc8] mb-1">
                                <span>Negotiation</span>
                                <span className="text-slate-900 dark:text-white font-bold">{stats?.funnel?.negotiation || 0}</span>
                            </div>
                            <div className="h-3 w-full bg-slate-100 dark:bg-[#243647] rounded-full overflow-hidden">
                                <div className="h-full bg-primary/80 rounded-full" style={{ width: '60%' }}></div>
                            </div>
                        </div>
                        <div className="relative group">
                            <div className="flex justify-between text-xs font-medium text-slate-500 dark:text-[#93adc8] mb-1">
                                <span>Won</span>
                                <span className="text-slate-900 dark:text-white font-bold">{stats?.funnel?.won || 0}</span>
                            </div>
                            <div className="h-3 w-full bg-slate-100 dark:bg-[#243647] rounded-full overflow-hidden">
                                <div className="h-full bg-green-500/80 rounded-full" style={{ width: '30%' }}></div>
                            </div>
                        </div>
                        <div className="relative group">
                            <div className="flex justify-between text-xs font-medium text-slate-500 dark:text-[#93adc8] mb-1">
                                <span>Lost</span>
                                <span className="text-slate-900 dark:text-white font-bold">{stats?.funnel?.lost || 0}</span>
                            </div>
                            <div className="h-3 w-full bg-slate-100 dark:bg-[#243647] rounded-full overflow-hidden">
                                <div className="h-full bg-red-500/80 rounded-full" style={{ width: '10%' }}></div>
                            </div>
                        </div>
                    </div>
                </div>

                {/* Monthly Revenue Chart (Mocked Visual for now as endpoint returns total) */}
                <div className="lg:col-span-2 bg-white dark:bg-[#1e293b] rounded-xl p-6 shadow-sm border border-slate-100 dark:border-[#243647]">
                    <div className="flex items-center justify-between mb-6">
                        <div>
                            <h3 className="text-base font-semibold text-slate-900 dark:text-white">Monthly Revenue</h3>
                            <p className="text-xs text-slate-500 dark:text-[#93adc8]">Jan - Jun 2024</p>
                        </div>
                    </div>
                    <div className="h-[220px] w-full flex items-center justify-center text-slate-400">
                        {/* Placeholder for complex chart library */}
                        <p>Chart visualization requires history data endpoint (Coming Soon)</p>
                    </div>
                </div>
            </div>

            {/* Bottom Lists Section (Placeholder for Tasks Integration) */}
            <div className="mt-6">
                <div className="bg-white dark:bg-[#1e293b] rounded-xl p-6 shadow-sm border border-slate-100 dark:border-[#243647]">
                    <h3 className="text-base font-semibold text-slate-900 dark:text-white mb-4">Upcoming Tasks</h3>
                    <p className="text-sm text-slate-500">Tasks integration coming in next step...</p>
                </div>
            </div>

        </MainLayout>
    );
}
