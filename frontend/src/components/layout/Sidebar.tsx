"use client";
import Link from 'next/link';
import { usePathname } from 'next/navigation';

export default function Sidebar() {
  const pathname = usePathname();

  const menuItems = [
    { name: 'Dashboard', path: '/dashboard', icon: 'dashboard' },
    { name: 'Contacts', path: '/contacts', icon: 'group' },
    { name: 'Pipeline', path: '/pipeline', icon: 'filter_alt' },
    { name: 'Tasks', path: '/tasks', icon: 'check_circle' },
    { name: 'Calendar', path: '/calendar', icon: 'calendar_month' },
    { name: 'Chat', path: '/chat', icon: 'chat' },
    { name: 'Users', path: '/users', icon: 'manage_accounts' },
    { name: 'Reports', path: '/reports', icon: 'assessment' },
  ];

  return (
    <aside className="flex w-64 flex-col bg-white dark:bg-[#111a22] border-r border-slate-200 dark:border-[#243647] flex-shrink-0 z-20 transition-all duration-300">
      {/* Logo Area */}
      <div className="flex items-center gap-3 px-6 h-16 border-b border-slate-200 dark:border-[#243647]">
        <div className="size-8 bg-primary rounded-lg flex items-center justify-center text-white">
          <span className="material-symbols-outlined !text-[20px]">grid_view</span>
        </div>
        <h2 className="text-lg font-bold tracking-tight text-slate-900 dark:text-white">Nexus CRM</h2>
      </div>

      {/* Profile Snippet */}
      <div className="p-4 border-b border-slate-200 dark:border-[#243647]">
        <div className="flex items-center gap-3 p-2 rounded-lg bg-slate-50 dark:bg-[#243647]/50">
          <div
            className="size-10 rounded-full bg-cover bg-center shrink-0"
            style={{ backgroundImage: 'url("https://lh3.googleusercontent.com/aida-public/AB6AXuDf-mXSPRsHuKMYMmh9J2B6C_9az3fSkPdTDt37ha66v0yGCc6TO-iVvnBqhEZ2bkoHuhvTyqImMUym38eU4DmlPIOOkoWJ7C_NWufI2GXgrN6wz8B9C9l6pwjgSIM_-s88iXkPNhL2xV1tOQF20BGqJFHNPWj9dtKRrFPelMYqhEfuVRYTkvmHqkhKXgLao16Qo5v4P4OnxuYuiUMJS4kmUF82CM0HxsGAXci7Xxm9PXP7h-Z91k7QKu_6UFD1ItuXpFz4hndrBFo")' }}
          ></div>
          <div className="flex flex-col overflow-hidden">
            <h3 className="text-sm font-semibold truncate text-slate-900 dark:text-white">Alex Doe</h3>
            <p className="text-xs text-slate-500 dark:text-[#93adc8] truncate">Sales Manager</p>
          </div>
        </div>
      </div>

      {/* Navigation Links */}
      <nav className="flex-1 overflow-y-auto py-4 px-3 space-y-1">
        {menuItems.map((item) => {
          const isActive = pathname === item.path;
          return (
            <Link
              key={item.path}
              href={item.path}
              className={`flex items-center gap-3 px-3 py-2.5 rounded-lg transition-colors group ${isActive
                ? 'bg-primary/10 text-primary dark:bg-[#243647] dark:text-white'
                : 'text-slate-600 dark:text-[#93adc8] hover:bg-slate-50 hover:text-slate-900 dark:hover:bg-[#243647]/50 dark:hover:text-white'
                }`}
            >
              <span className={`material-symbols-outlined ${isActive ? 'filled' : ''}`}>{item.icon}</span>
              <span className="text-sm font-medium">{item.name}</span>
            </Link>
          );
        })}
      </nav>

      {/* Bottom Actions */}
      <div className="p-4 border-t border-slate-200 dark:border-[#243647]">
        <Link
          href="/settings"
          className="flex items-center gap-3 px-3 py-2.5 rounded-lg text-slate-600 dark:text-[#93adc8] hover:bg-slate-50 hover:text-slate-900 dark:hover:bg-[#243647]/50 dark:hover:text-white transition-colors"
        >
          <span className="material-symbols-outlined">settings</span>
          <span className="text-sm font-medium">Settings</span>
        </Link>
      </div>
    </aside>
  );
}
