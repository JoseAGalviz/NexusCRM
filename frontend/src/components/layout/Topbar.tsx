"use client";
import React, { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';

export default function Topbar() {
    const router = useRouter();
    const [user, setUser] = useState<{ firstName: string; lastName: string; email: string } | null>(null);

    useEffect(() => {
        const storedUser = localStorage.getItem('user');
        if (storedUser) {
            try {
                setUser(JSON.parse(storedUser));
            } catch (e) {
                console.error("Failed to parse user from local storage", e);
            }
        }
    }, []);

    const handleLogout = () => {
        localStorage.removeItem('token');
        localStorage.removeItem('user');
        router.push('/auth/login');
    };

    return (
        <header className="h-16 flex items-center justify-between px-6 bg-white dark:bg-[#111a22] border-b border-slate-200 dark:border-[#243647] flex-shrink-0 z-10">
            <div className="flex items-center flex-1">
                <div className="relative w-full max-w-md">
                    <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                        <span className="material-symbols-outlined text-slate-400 dark:text-[#93adc8]">search</span>
                    </div>
                    <input
                        className="block w-full pl-10 pr-3 py-2 border-none rounded-lg leading-5 bg-slate-100 dark:bg-[#243647] text-slate-900 dark:text-white placeholder-slate-500 dark:placeholder-[#93adc8] focus:outline-none focus:ring-2 focus:ring-primary sm:text-sm transition-colors"
                        placeholder="Search for leads, contacts, or deals..."
                        type="text"
                    />
                </div>
            </div>
            <div className="ml-4 flex items-center gap-4">
                <div className="flex items-center gap-2">
                    <button className="flex items-center gap-2 px-3 py-2 rounded-lg bg-slate-100 dark:bg-[#243647] text-slate-600 dark:text-[#93adc8] hover:text-primary dark:hover:text-white transition-colors">
                        <span className="material-symbols-outlined !text-[20px]">calendar_today</span>
                        <span className="text-sm font-medium">Oct 24 - Nov 24</span>
                    </button>
                </div>

                {/* User Profile & Logout */}
                <div className="flex items-center gap-3 pl-3 border-l border-slate-200 dark:border-slate-700">
                    {user ? (
                        <>
                            <div className="text-right hidden sm:block">
                                <p className="text-sm font-medium text-slate-900 dark:text-white">{user.firstName} {user.lastName}</p>
                                <p className="text-xs text-slate-500 dark:text-slate-400">{user.email}</p>
                            </div>
                            <button
                                onClick={handleLogout}
                                className="size-9 rounded-full bg-primary/10 text-primary flex items-center justify-center hover:bg-red-50 hover:text-red-500 transition-colors"
                                title="Logout"
                            >
                                <span className="material-symbols-outlined !text-[20px]">logout</span>
                            </button>
                        </>
                    ) : (
                        <div className="size-9 rounded-full bg-slate-200 animate-pulse"></div>
                    )}
                </div>
            </div>
        </header>
    );
}
