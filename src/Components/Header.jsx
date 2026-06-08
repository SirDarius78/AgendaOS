import React, { useState } from "react";
import {
  LayoutDashboard,
  CalendarDays,
  CalendarClock,
  Plus,
  ChevronLeft,
  ChevronRight,
} from "lucide-react";
import { format } from "date-fns";
import { es } from "date-fns/locale";
import { formatLong, nextWeek, prevWeek } from "../utils/dateUtils";

const VIEWS = [
  { id: "board", label: "Board", Icon: LayoutDashboard },
  { id: "week", label: "Semana", Icon: CalendarDays },
  { id: "day", label: "Día", Icon: CalendarClock },
];

export default function Header({
  view,
  onViewChange,
  onNewTask,
  currentDate,
  onDateChange,
}) {
  return (
    <header className="sticky top-0 z-40 bg-white/80 backdrop-blur border-b border-gray-100 px-6 py-3">
      <div className="max-w-7xl mx-auto flex items-center gap-4">
        {/* Logo */}
        <div className="flex items-center gap-2 mr-4">
          <div className="w-8 h-8 rounded-lg bg-indigo-600 flex items-center justify-center">
            <LayoutDashboard size={16} className="text-white" />
          </div>
          <span className="font-bold text-gray-800 text-lg">TaskFlow</span>
        </div>

        {/* View switcher */}
        <nav className="flex items-center bg-gray-100 rounded-xl p-1 gap-0.5">
          {VIEWS.map(({ id, label, Icon }) => (
            <button
              key={id}
              onClick={() => onViewChange(id)}
              className={`flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-sm font-medium transition-all ${
                view === id
                  ? "bg-white text-indigo-600 shadow-sm"
                  : "text-gray-500 hover:text-gray-700"
              }`}
            >
              <Icon size={14} />
              {label}
            </button>
          ))}
        </nav>

        {/* Date navigation (week/day views) */}
        {(view === "week" || view === "day") && (
          <div className="flex items-center gap-2">
            <button
              onClick={() => onDateChange(prevWeek(currentDate))}
              className="p-1.5 rounded-lg hover:bg-gray-100 text-gray-500 transition-colors"
            >
              <ChevronLeft size={16} />
            </button>
            <span className="text-sm font-medium text-gray-700 min-w-[160px] text-center capitalize">
              {view === "week"
                ? `Semana del ${format(currentDate, "d MMM", { locale: es })}`
                : formatLong(currentDate)}
            </span>
            <button
              onClick={() => onDateChange(nextWeek(currentDate))}
              className="p-1.5 rounded-lg hover:bg-gray-100 text-gray-500 transition-colors"
            >
              <ChevronRight size={16} />
            </button>
            <button
              onClick={() => onDateChange(new Date())}
              className="px-2.5 py-1 text-xs font-medium bg-indigo-50 text-indigo-600 rounded-lg hover:bg-indigo-100 transition-colors"
            >
              Hoy
            </button>
          </div>
        )}

        <div className="flex-1" />

        {/* New task button */}
        <button
          onClick={onNewTask}
          className="flex items-center gap-2 bg-indigo-600 hover:bg-indigo-700 text-white px-4 py-2 rounded-xl text-sm font-medium transition-colors shadow-sm"
        >
          <Plus size={16} />
          Nueva tarea
        </button>
      </div>
    </header>
  );
}
