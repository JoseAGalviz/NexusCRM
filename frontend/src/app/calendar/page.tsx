"use client";
import React, { useEffect, useState } from 'react';
import MainLayout from '@/components/layout/MainLayout';
import { useRouter } from 'next/navigation';

interface Task {
    id: string;
    title: string;
    description: string;
    dueDate: string;
    priority: 'low' | 'medium' | 'high' | 'urgent';
}

export default function Calendar() {
    const router = useRouter();
    const [tasks, setTasks] = useState<Task[]>([]);
    const [currentDate, setCurrentDate] = useState(new Date());

    useEffect(() => {
        const fetchTasks = async () => {
            const token = localStorage.getItem('token');
            if (!token) return router.push('/auth/login');
            try {
                const res = await fetch('http://192.168.4.69:4000/tasks', {
                    headers: { 'Authorization': `Bearer ${token}` }
                });
                if (res.ok) {
                    const data = await res.json();
                    setTasks(data);
                }
            } catch (error) {
                console.error('Error fetching tasks:', error);
            }
        };
        fetchTasks();
    }, [router]);

    // Calendar Helper Functions
    const getDaysInMonth = (year: number, month: number) => new Date(year, month + 1, 0).getDate();
    const getFirstDayOfMonth = (year: number, month: number) => new Date(year, month, 1).getDay();

    const renderCalendar = () => {
        const year = currentDate.getFullYear();
        const month = currentDate.getMonth();
        const daysInMonth = getDaysInMonth(year, month);
        const firstDay = getFirstDayOfMonth(year, month);

        const days = [];
        // Empty cells for previous month
        for (let i = 0; i < firstDay; i++) {
            days.push(<div key={`empty-${i}`} className="bg-slate-50 dark:bg-[#111a22]/50 min-h-[100px] border border-slate-100 dark:border-[#243647]"></div>);
        }

        // Days of current month
        for (let day = 1; day <= daysInMonth; day++) {
            const dateStr = `${year}-${String(month + 1).padStart(2, '0')}-${String(day).padStart(2, '0')}`;
            const dayTasks = tasks.filter(t => t.dueDate.startsWith(dateStr));
            const isToday = new Date().toISOString().startsWith(dateStr);

            days.push(
                <div key={day} className={`bg-white dark:bg-[#1e293b] min-h-[100px] p-2 border border-slate-100 dark:border-[#243647] flex flex-col gap-1 ${isToday ? 'ring-1 ring-inset ring-primary' : ''}`}>
                    <div className="text-right mb-1">
                        <span className={`text-sm font-medium ${isToday ? 'text-primary bg-primary/10 rounded-full size-6 inline-flex items-center justify-center' : 'text-slate-700 dark:text-slate-300'}`}>{day}</span>
                    </div>
                    {dayTasks.map(task => (
                        <div key={task.id}
                            title={`${task.title}\n${task.description || 'No description'}`}
                            className={`text-[10px] px-1.5 py-1 rounded truncate border-l-2 cursor-pointer group relative
                            ${task.priority === 'urgent' ? 'bg-red-50 text-red-700 border-red-500 dark:bg-red-900/20 dark:text-red-300' :
                                    task.priority === 'high' ? 'bg-orange-50 text-orange-700 border-orange-500 dark:bg-orange-900/20 dark:text-orange-300' :
                                        'bg-blue-50 text-blue-700 border-blue-500 dark:bg-blue-900/20 dark:text-blue-300'
                                }`}>
                            {task.title}
                        </div>
                    ))}
                </div>
            );
        }
        return days;
    };

    const nextMonth = () => setCurrentDate(new Date(currentDate.getFullYear(), currentDate.getMonth() + 1, 1));
    const prevMonth = () => setCurrentDate(new Date(currentDate.getFullYear(), currentDate.getMonth() - 1, 1));

    return (
        <MainLayout>
            <div className="flex flex-col sm:flex-row justify-between items-center gap-4 mb-6">
                <div>
                    <h2 className="text-2xl font-bold text-slate-900 dark:text-white">Calendario</h2>
                    <p className="text-sm text-slate-500 dark:text-[#93adc8] mt-1">Vista mensual de actividades.</p>
                </div>
                <div className="flex items-center gap-4 bg-white dark:bg-[#1e293b] p-1 rounded-lg border border-slate-200 dark:border-[#243647]">
                    <button onClick={prevMonth} className="p-1 hover:bg-slate-100 dark:hover:bg-[#243647] rounded transition-colors">
                        <span className="material-symbols-outlined">chevron_left</span>
                    </button>
                    <span className="font-semibold text-slate-900 dark:text-white min-w-[140px] text-center">
                        {currentDate.toLocaleDateString('es-ES', { month: 'long', year: 'numeric' }).toUpperCase()}
                    </span>
                    <button onClick={nextMonth} className="p-1 hover:bg-slate-100 dark:hover:bg-[#243647] rounded transition-colors">
                        <span className="material-symbols-outlined">chevron_right</span>
                    </button>
                </div>
            </div>

            <div className="bg-white dark:bg-[#1e293b] rounded-xl shadow-sm border border-slate-200 dark:border-[#243647] overflow-hidden">
                <div className="grid grid-cols-7 bg-slate-50 dark:bg-[#111a22] border-b border-slate-200 dark:border-[#243647]">
                    {['Domingo', 'Lunes', 'Martes', 'Miércoles', 'Jueves', 'Viernes', 'Sábado'].map(day => (
                        <div key={day} className="py-2 text-center text-xs font-semibold text-slate-500 dark:text-[#93adc8] uppercase tracking-wider">
                            {day}
                        </div>
                    ))}
                </div>
                <div className="grid grid-cols-7">
                    {renderCalendar()}
                </div>
            </div>
        </MainLayout>
    );
}
