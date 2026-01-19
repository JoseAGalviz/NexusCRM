"use client";
import React, { useEffect, useState } from 'react';
import MainLayout from '@/components/layout/MainLayout';
import { useRouter } from 'next/navigation';

interface Task {
    id: string;
    title: string;
    description: string;
    priority: 'low' | 'medium' | 'high' | 'urgent';
    status: 'todo' | 'in_progress' | 'review' | 'done';
    dueDate: string;
}

export default function Tasks() {
    const router = useRouter();
    const [tasks, setTasks] = useState<Task[]>([]);
    const [loading, setLoading] = useState(true);
    const [isModalOpen, setIsModalOpen] = useState(false);
    const [editingTask, setEditingTask] = useState<Task | null>(null);

    const [formData, setFormData] = useState({
        title: '',
        description: '',
        priority: 'medium',
        status: 'todo',
        dueDate: new Date().toISOString().slice(0, 16)
    });
    const [submitting, setSubmitting] = useState(false);

    useEffect(() => {
        fetchTasks();
    }, []);

    const fetchTasks = async () => {
        const token = localStorage.getItem('token');
        if (!token) {
            router.push('/auth/login');
            return;
        }
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
        } finally {
            setLoading(false);
        }
    };

    const handleStatusChange = async (taskId: string, newStatus: 'todo' | 'in_progress' | 'review' | 'done') => {
        const updatedTasks = tasks.map(t => t.id === taskId ? { ...t, status: newStatus } : t);
        setTasks(updatedTasks);

        const token = localStorage.getItem('token');
        try {
            await fetch(`http://192.168.4.69:4000/tasks/${taskId}`, {
                method: 'PATCH',
                headers: {
                    'Content-Type': 'application/json',
                    'Authorization': `Bearer ${token}`
                },
                body: JSON.stringify({ status: newStatus })
            });
        } catch (error) {
            console.error('Error updating task status:', error);
        }
    };

    const handleDelete = async (taskId: string) => {
        if (!confirm('¿Estás seguro de eliminar esta tarea?')) return;

        const token = localStorage.getItem('token');
        try {
            const res = await fetch(`http://192.168.4.69:4000/tasks/${taskId}`, {
                method: 'DELETE',
                headers: { 'Authorization': `Bearer ${token}` }
            });

            if (res.ok) {
                setTasks(tasks.filter(t => t.id !== taskId));
            }
        } catch (error) {
            console.error('Error deleting task:', error);
        }
    };

    const handleEdit = (task: Task) => {
        setEditingTask(task);
        setFormData({
            title: task.title,
            description: task.description || '',
            priority: task.priority,
            status: task.status,
            dueDate: new Date(task.dueDate).toISOString().slice(0, 16)
        });
        setIsModalOpen(true);
    };

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        setSubmitting(true);
        const token = localStorage.getItem('token');

        try {
            const url = editingTask
                ? `http://192.168.4.69:4000/tasks/${editingTask.id}`
                : 'http://192.168.4.69:4000/tasks';

            const method = editingTask ? 'PATCH' : 'POST';

            const res = await fetch(url, {
                method,
                headers: {
                    'Content-Type': 'application/json',
                    'Authorization': `Bearer ${token}`
                },
                body: JSON.stringify(formData)
            });

            if (res.ok) {
                const updatedTask = await res.json();
                if (editingTask) {
                    setTasks(tasks.map(t => t.id === editingTask.id ? updatedTask : t));
                } else {
                    setTasks([...tasks, updatedTask]);
                }
                closeModal();
            }
        } catch (error) {
            console.error('Error saving task:', error);
        } finally {
            setSubmitting(false);
        }
    };

    const closeModal = () => {
        setIsModalOpen(false);
        setEditingTask(null);
        setFormData({
            title: '',
            description: '',
            priority: 'medium',
            status: 'todo',
            dueDate: new Date().toISOString().slice(0, 16)
        });
    };

    const getPriorityColor = (priority: string) => {
        switch (priority) {
            case 'urgent': return 'bg-red-100 text-red-800 dark:bg-red-900/30 dark:text-red-300';
            case 'high': return 'bg-orange-100 text-orange-800 dark:bg-orange-900/30 dark:text-orange-300';
            case 'medium': return 'bg-yellow-100 text-yellow-800 dark:bg-yellow-900/30 dark:text-yellow-300';
            case 'low': return 'bg-blue-100 text-blue-800 dark:bg-blue-900/30 dark:text-blue-300';
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
                    <h2 className="text-2xl font-bold text-slate-900 dark:text-white">Tareas</h2>
                    <p className="text-sm text-slate-500 dark:text-[#93adc8] mt-1">Organiza tu trabajo diario.</p>
                </div>
                <button
                    onClick={() => setIsModalOpen(true)}
                    className="bg-primary hover:bg-primary/90 text-white text-sm font-medium px-4 py-2 rounded-lg shadow-sm transition-colors flex items-center gap-2"
                >
                    <span className="material-symbols-outlined !text-[20px]">add</span>
                    <span>Nueva Tarea</span>
                </button>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                {tasks.map((task) => (
                    <div key={task.id} className="bg-white dark:bg-[#1e293b] p-5 rounded-xl shadow-sm border border-slate-100 dark:border-[#243647] hover:shadow-md transition-all">
                        <div className="flex justify-between items-start mb-2">
                            <span className={`inline-flex items-center px-2 py-0.5 rounded text-xs font-medium ${getPriorityColor(task.priority)} uppercase`}>
                                {task.priority}
                            </span>
                            <div className="flex items-center gap-2">
                                <span className="text-xs text-slate-400 dark:text-[#93adc8]">{new Date(task.dueDate).toLocaleString([], { dateStyle: 'short', timeStyle: 'short' })}</span>
                            </div>
                        </div>
                        <h3 className="font-semibold text-slate-900 dark:text-white mb-1 truncate">{task.title}</h3>
                        <p className="text-sm text-slate-500 dark:text-[#93adc8] line-clamp-2 min-h-[2.5em]">{task.description}</p>

                        <div className="mt-4 pt-3 border-t border-slate-50 dark:border-[#243647] flex justify-between items-center">
                            <select
                                value={task.status}
                                onChange={(e) => handleStatusChange(task.id, e.target.value as any)}
                                className="text-xs font-medium px-2 py-1 rounded bg-slate-100 dark:bg-[#243647] text-slate-600 dark:text-[#93adc8] uppercase border-none focus:ring-1 focus:ring-primary cursor-pointer"
                            >
                                <option value="todo">Todo</option>
                                <option value="in_progress">In Progress</option>
                                <option value="review">Review</option>
                                <option value="done">Done</option>
                            </select>
                            <div className="flex gap-2">
                                <button
                                    onClick={() => handleEdit(task)}
                                    className="text-slate-400 hover:text-primary dark:hover:text-white transition-colors"
                                    title="Editar"
                                >
                                    <span className="material-symbols-outlined !text-[20px]">edit</span>
                                </button>
                                <button
                                    onClick={() => handleDelete(task.id)}
                                    className="text-slate-400 hover:text-red-500 dark:hover:text-red-400 transition-colors"
                                    title="Eliminar"
                                >
                                    <span className="material-symbols-outlined !text-[20px]">delete</span>
                                </button>
                            </div>
                        </div>
                    </div>
                ))}
            </div>
            {tasks.length === 0 && (
                <div className="text-center py-20 bg-slate-50 dark:bg-[#111a22]/50 rounded-xl border border-dashed border-slate-200 dark:border-[#243647]">
                    <span className="material-symbols-outlined text-4xl text-slate-300 dark:text-slate-600 mb-2">check_circle</span>
                    <p className="text-slate-500 dark:text-[#93adc8]">No tienes tareas pendientes.</p>
                </div>
            )}

            {/* Modal */}
            {isModalOpen && (
                <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 backdrop-blur-sm p-4">
                    <div className="bg-white dark:bg-[#1e293b] rounded-xl shadow-xl border border-slate-100 dark:border-[#243647] w-full max-w-lg overflow-hidden animate-in fade-in zoom-in duration-200">
                        <div className="p-4 border-b border-slate-100 dark:border-[#243647] flex justify-between items-center">
                            <h3 className="font-semibold text-lg text-slate-900 dark:text-white">
                                {editingTask ? 'Editar Tarea' : 'Nueva Tarea'}
                            </h3>
                            <button onClick={closeModal} className="text-slate-400 hover:text-slate-600 dark:hover:text-white">
                                <span className="material-symbols-outlined">close</span>
                            </button>
                        </div>
                        <form onSubmit={handleSubmit} className="p-4 space-y-4">
                            <div>
                                <label className="block text-sm font-medium text-slate-700 dark:text-[#93adc8] mb-1">Título</label>
                                <input
                                    type="text" required
                                    value={formData.title}
                                    onChange={(e) => setFormData({ ...formData, title: e.target.value })}
                                    className="w-full px-3 py-2 border border-slate-200 dark:border-[#243647] rounded-lg bg-slate-50 dark:bg-[#111a22] text-slate-900 dark:text-white focus:ring-2 focus:ring-primary focus:outline-none"
                                />
                            </div>
                            <div className="grid grid-cols-2 gap-4">
                                <div>
                                    <label className="block text-sm font-medium text-slate-700 dark:text-[#93adc8] mb-1">Vencimiento</label>
                                    <input
                                        type="datetime-local" required
                                        value={formData.dueDate}
                                        onChange={(e) => setFormData({ ...formData, dueDate: e.target.value })}
                                        className="w-full px-3 py-2 border border-slate-200 dark:border-[#243647] rounded-lg bg-slate-50 dark:bg-[#111a22] text-slate-900 dark:text-white focus:ring-2 focus:ring-primary focus:outline-none"
                                    />
                                </div>
                                <div>
                                    <label className="block text-sm font-medium text-slate-700 dark:text-[#93adc8] mb-1">Prioridad</label>
                                    <select
                                        value={formData.priority}
                                        onChange={(e) => setFormData({ ...formData, priority: e.target.value as any })}
                                        className="w-full px-3 py-2 border border-slate-200 dark:border-[#243647] rounded-lg bg-slate-50 dark:bg-[#111a22] text-slate-900 dark:text-white focus:ring-2 focus:ring-primary focus:outline-none"
                                    >
                                        <option value="low">Baja</option>
                                        <option value="medium">Media</option>
                                        <option value="high">Alta</option>
                                        <option value="urgent">Urgente</option>
                                    </select>
                                </div>
                            </div>
                            <div>
                                <label className="block text-sm font-medium text-slate-700 dark:text-[#93adc8] mb-1">Descripción</label>
                                <textarea
                                    rows={3}
                                    value={formData.description}
                                    onChange={(e) => setFormData({ ...formData, description: e.target.value })}
                                    className="w-full px-3 py-2 border border-slate-200 dark:border-[#243647] rounded-lg bg-slate-50 dark:bg-[#111a22] text-slate-900 dark:text-white focus:ring-2 focus:ring-primary focus:outline-none"
                                />
                            </div>
                            <div className="pt-2 flex justify-end gap-3">
                                <button
                                    type="button"
                                    onClick={closeModal}
                                    className="px-4 py-2 text-sm font-medium text-slate-600 dark:text-[#93adc8] hover:bg-slate-100 dark:hover:bg-[#243647] rounded-lg transition-colors"
                                >
                                    Cancelar
                                </button>
                                <button
                                    type="submit"
                                    disabled={submitting}
                                    className="px-4 py-2 text-sm font-medium text-white bg-primary hover:bg-primary/90 rounded-lg shadow-sm transition-colors flex items-center gap-2"
                                >
                                    {submitting ? 'Guardando...' : editingTask ? 'Actualizar' : 'Crear Tarea'}
                                </button>
                            </div>
                        </form>
                    </div>
                </div>
            )}
        </MainLayout>
    );
}
