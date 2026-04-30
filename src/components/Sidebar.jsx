"use client"
import React from 'react';
import { 
  LayoutGrid, 
  Calendar, 
  BarChart3, 
  Clock, 
  Stethoscope, 
  HelpCircle, 
  Settings,
  Sparkles,
  Activity
} from 'lucide-react';

export default function Sidebar() {
  const sidebarItems = [
    { icon: LayoutGrid, label: 'Overview', active: false },
    { icon: Calendar, label: 'Appointments', active: false },
    { icon: BarChart3, label: 'Analysis', active: true },
    { icon: Clock, label: 'Schedule', active: false },
    { icon: Stethoscope, label: 'Consultation', active: false },
  ];

  const bottomItems = [
    { icon: HelpCircle, label: 'Help' },
    { icon: Settings, label: 'Settings' },
  ];

  return (
    <aside className="w-72 bg-white/80 backdrop-blur-xl border-r border-slate-200/60 flex flex-col fixed h-full z-20 shadow-xl shadow-slate-200/20">
      <div className="p-6 flex items-center gap-3">
        <div className="relative">
          <div className="w-10 h-10 bg-gradient-to-br from-blue-500 to-blue-600 rounded-xl flex items-center justify-center shadow-lg shadow-blue-500/30 ring-4 ring-blue-500/10">
            <Sparkles className="w-5 h-5 text-white" />
          </div>
          <div className="absolute -bottom-0.5 -right-0.5 w-3 h-3 bg-emerald-400 rounded-full border-2 border-white" />
        </div>
        <div>
          <span className="font-bold text-lg text-slate-900 tracking-tight">MedAI Pro</span>
          <p className="text-[10px] text-slate-400 font-medium uppercase tracking-wider">Healthcare Platform</p>
        </div>
      </div>

      <nav className="flex-1 px-4 py-6 space-y-1.5">
        <p className="px-4 text-[10px] font-semibold text-slate-400 uppercase tracking-wider mb-4">Main Menu</p>
        {sidebarItems.map((item) => (
          <a
            key={item.label}
            href="#"
            className={`group flex items-center gap-3 px-4 py-3.5 rounded-xl text-sm font-medium transition-all duration-300 relative overflow-hidden ${
              item.active
                ? 'bg-gradient-to-r from-blue-500 to-blue-600 text-white shadow-lg shadow-blue-500/30'
                : 'text-slate-500 hover:bg-slate-100/80 hover:text-slate-700'
            }`}
          >
            {item.active && (
              <div className="absolute inset-0 bg-gradient-to-r from-white/20 to-transparent opacity-0 group-hover:opacity-100 transition-opacity" />
            )}
            <item.icon className={`w-5 h-5 transition-transform duration-300 group-hover:scale-110 ${item.active ? 'text-white' : 'text-slate-400 group-hover:text-slate-600'}`} />
            {item.label}
            {item.active && (
              <div className="ml-auto">
                <Activity className="w-4 h-4 text-white/70 animate-pulse" />
              </div>
            )}
          </a>
        ))}
      </nav>

      <div className="p-4 border-t border-slate-200/60 space-y-1.5">
        <p className="px-4 text-[10px] font-semibold text-slate-400 uppercase tracking-wider mb-3">Support</p>
        {bottomItems.map((item) => (
          <a
            key={item.label}
            href="#"
            className="group flex items-center gap-3 px-4 py-3 rounded-xl text-sm font-medium text-slate-500 hover:bg-slate-100/80 hover:text-slate-700 transition-all duration-300"
          >
            <item.icon className="w-5 h-5 text-slate-400 group-hover:text-slate-600 transition-transform duration-300 group-hover:scale-110" />
            {item.label}
          </a>
        ))}
      </div>

      <div className="p-4">
        <div className="relative overflow-hidden bg-gradient-to-br from-slate-800 to-slate-900 rounded-2xl p-5 text-white">
          <div className="absolute top-0 right-0 w-32 h-32 bg-blue-500/20 rounded-full blur-2xl" />
          <div className="absolute bottom-0 left-0 w-24 h-24 bg-emerald-500/20 rounded-full blur-2xl" />
          <div className="relative">
            <div className="flex items-center gap-2 mb-3">
              <Sparkles className="w-4 h-4 text-amber-400" />
              <span className="text-xs font-semibold text-amber-400 uppercase tracking-wider">Pro Plan</span>
            </div>
            <p className="text-sm font-medium mb-3 text-slate-200">Unlock advanced AI diagnostics</p>
            <button className="w-full py-2.5 bg-white/10 hover:bg-white/20 backdrop-blur-sm rounded-xl text-sm font-medium transition-all duration-300 border border-white/10 hover:border-white/20">
              Upgrade Now
            </button>
          </div>
        </div>
      </div>
    </aside>
  );
}