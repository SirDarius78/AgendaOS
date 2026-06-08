import React from "react";
import { LayoutDashboard } from "lucide-react";

export default function AuthShell({ title, subtitle, children }) {
  return (
    <div className="min-h-screen bg-gradient-to-b from-indigo-50 via-white to-slate-100 px-4 py-8 flex items-center justify-center">
      <div className="w-full max-w-md rounded-3xl border border-indigo-100 bg-white/95 shadow-xl p-5 sm:p-7">
        <div className="flex items-center gap-3 mb-6">
          <div className="w-10 h-10 rounded-xl bg-indigo-600 text-white flex items-center justify-center">
            <LayoutDashboard size={18} />
          </div>
          <div>
            <h1 className="text-lg sm:text-xl font-bold text-slate-800">
              TaskFlow
            </h1>
            <p className="text-xs sm:text-sm text-slate-500">
              Organiza tus tareas por usuario
            </p>
          </div>
        </div>

        <div className="mb-5">
          <h2 className="text-xl sm:text-2xl font-semibold text-slate-800">
            {title}
          </h2>
          <p className="mt-1 text-sm text-slate-500">{subtitle}</p>
        </div>

        {children}
      </div>
    </div>
  );
}
