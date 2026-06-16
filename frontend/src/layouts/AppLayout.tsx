import { Outlet, NavLink } from 'react-router-dom';
import { LayoutDashboard, Inbox, FilePlus, Database, Layers } from 'lucide-react';
import { clsx, type ClassValue } from 'clsx';
import { twMerge } from 'tailwind-merge';

function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs));
}

export default function AppLayout() {
  const navigation = [
    { name: 'Overview', href: '/', icon: Layers },
    { name: 'Dashboard', href: '/dashboard', icon: LayoutDashboard },
    { name: 'Submissions', href: '/submissions', icon: Inbox },
    { name: 'New Submission', href: '/submissions/new', icon: FilePlus },
    { name: 'CRM Pipeline', href: '/pipeline', icon: Database },
  ];

  return (
    <div className="flex h-screen bg-slate-50">
      {/* Sidebar */}
      <div className="flex w-64 flex-col bg-slate-900 border-r border-slate-800 shadow-xl z-10">
        <div className="flex flex-col px-6 mt-6 mb-4">
          <div className="flex items-center">
            <img
              src="/intake-mark.svg"
              alt=""
              className="h-8 w-8 rounded-lg shadow-lg ring-1 ring-white/10"
              aria-hidden="true"
            />
            <h1 className="ml-3 text-xl font-bold text-white tracking-tight">Intake</h1>
          </div>
          <p className="mt-2 text-xs text-slate-400 font-medium tracking-wide">
            Messy leads to CRM-ready records
          </p>
        </div>
        <nav className="flex-1 space-y-1 px-4 py-4">
          {navigation.map((item) => (
            <NavLink
              key={item.name}
              to={item.href}
              className={({ isActive }) =>
                cn(
                  isActive
                    ? 'bg-slate-800 text-white'
                    : 'text-slate-300 hover:bg-slate-800 hover:text-white',
                  'group flex items-center rounded-md px-3 py-2.5 text-sm font-medium transition-colors'
                )
              }
            >
              <item.icon className="mr-3 h-5 w-5 flex-shrink-0" aria-hidden="true" />
              {item.name}
            </NavLink>
          ))}
        </nav>
      </div>

      {/* Main content */}
      <div className="flex flex-1 flex-col overflow-hidden">
        <main className="flex-1 overflow-y-auto bg-slate-50 p-8">
          <div className="mx-auto max-w-6xl">
            <Outlet />
          </div>
        </main>
      </div>
    </div>
  );
}
