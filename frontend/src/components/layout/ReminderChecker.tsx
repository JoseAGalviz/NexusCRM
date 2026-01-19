"use client";
import { useEffect, useRef } from 'react';

export default function ReminderChecker() {
    const alertedTasks = useRef<Set<string>>(new Set());

    useEffect(() => {
        const checkReminders = async () => {
            const token = localStorage.getItem('token');
            if (!token) return;

            try {
                // Fetch all tasks (optimization: create a specific endpoint for due tasks)
                // For now, we fetch all and filter client-side to be quick
                const res = await fetch('http://192.168.4.69:4000/tasks', {
                    headers: { 'Authorization': `Bearer ${token}` }
                });

                if (res.ok) {
                    const tasks = await res.json();
                    const now = new Date();

                    tasks.forEach((task: any) => {
                        if (task.status === 'done') return;

                        const dueDate = new Date(task.dueDate);
                        const timeDiff = dueDate.getTime() - now.getTime();

                        // Alert if due within next 10 minutes or 5 minutes past, and not already alerted
                        if (timeDiff < 10 * 60 * 1000 && timeDiff > -5 * 60 * 1000 && !alertedTasks.current.has(task.id)) {
                            // Request permission
                            if (Notification.permission === 'granted') {
                                new Notification('Recordatorio de Tarea ⏰', {
                                    body: `"${task.title}" vence pronto!`,
                                    icon: '/favicon.ico'
                                });
                            } else if (Notification.permission !== 'denied') {
                                Notification.requestPermission().then(permission => {
                                    if (permission === 'granted') {
                                        new Notification('Recordatorio de Tarea ⏰', {
                                            body: `"${task.title}" vence pronto!`,
                                            icon: '/favicon.ico'
                                        });
                                    }
                                });
                            }

                            // Also simple alert for demo visibility
                            alert(`🔔 RECORDATORIO: La tarea "${task.title}" requiere tu atención.`);

                            alertedTasks.current.add(task.id);
                        }
                    });
                }
            } catch (error) {
                console.error("Reminder check failed", error);
            }
        };

        // Initial check
        checkReminders();

        // Check every minute
        const interval = setInterval(checkReminders, 60000);

        return () => clearInterval(interval);
    }, []);

    return null; // Invisible component
}
