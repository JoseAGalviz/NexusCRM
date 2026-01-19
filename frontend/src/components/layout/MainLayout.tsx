import Sidebar from './Sidebar';
import Topbar from './Topbar';
import ReminderChecker from './ReminderChecker';

interface MainLayoutProps {
  children: React.ReactNode;
}

export default function MainLayout({ children }: MainLayoutProps) {
  return (
    <div className="flex h-screen bg-slate-50 dark:bg-[#0b1116] overflow-hidden transition-colors duration-300">
      <ReminderChecker />
      <Sidebar />
      <div className="flex-1 flex flex-col min-w-0 overflow-hidden">
                <Topbar />
                <main className="flex-1 overflow-y-auto p-6 md:p-8">
                    <div className="max-w-[1400px] mx-auto space-y-6">
                        {children}
                    </div>
                </main>
            </div>
        </div>
    );
}
