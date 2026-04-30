"use client"
import React from 'react';
import { ChevronLeft, ChevronRight, Bell, ChevronDown } from 'lucide-react';

export default function Header() {
  return (
    <header className="bg-white/70 backdrop-blur-xl border-b border-slate-200/60 px-8 py-4 flex items-center justify-between sticky top-0 z-10 shadow-sm shadow-slate-200/20">
      <div className="flex items-center gap-4">
        <div className="flex items-center gap-3 text-sm text-slate-500">
          <button className="p-2 hover:bg-slate-100 rounded-xl transition-all duration-300 hover:scale-105">
            <ChevronLeft className="w-4 h-4" />
          </button>
          <div className="flex items-center gap-2 px-3 py-1.5 bg-slate-100/80 rounded-lg">
            <span className="hover:text-slate-700 cursor-pointer transition-colors">Dashboard</span>
            <ChevronRight className="w-3 h-3 text-slate-300" />
            <span className="text-blue-600 font-semibold">Analysis</span>
          </div>
        </div>
      </div>

      <div className="flex items-center gap-3">
        <button className="relative p-2.5 hover:bg-slate-100 rounded-xl transition-all duration-300 group">
          <Bell className="w-5 h-5 text-slate-500 group-hover:text-slate-700 transition-colors" />
          <span className="absolute top-1.5 right-1.5 w-2.5 h-2.5 bg-gradient-to-r from-red-500 to-rose-500 rounded-full ring-2 ring-white animate-pulse"></span>
        </button>
        <div className="w-px h-8 bg-slate-200" />
        <div className="flex items-center gap-3 pl-2 cursor-pointer group">
          <div className="relative">
            <img
              src="https://images.unsplash.com/photo-1472099645785-5658abf4ff4e?w=100&h=100&fit=crop&crop=face"
              alt="User"
              className="w-10 h-10 rounded-xl object-cover ring-2 ring-slate-200 group-hover:ring-blue-500/50 transition-all duration-300"
            />
            <div className="absolute -bottom-0.5 -right-0.5 w-3 h-3 bg-emerald-400 rounded-full border-2 border-white" />
          </div>
          <div className="hidden md:block">
            <p className="text-sm font-semibold text-slate-900">Dehmani Mohamed</p>
            <p className="text-xs text-slate-500 flex items-center gap-1">
              <span className="w-1.5 h-1.5 bg-emerald-400 rounded-full" />
              Patient
            </p>
          </div>
          <ChevronDown className="w-4 h-4 text-slate-400 group-hover:text-slate-600 transition-colors" />
        </div>
      </div>
    </header>
  );
}