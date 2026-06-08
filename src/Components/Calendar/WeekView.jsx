import React from "react";
import { format, isToday, isSameDay } from "date-fns";
import { es } from "date-fns/locale";
import { Plus, Clock } from "lucide-react";
import { useTasks } from "../../context/TaskContext";
import { getWeekDays, parseDate } from "../../utils/dateUtils";

const PRIORITY_DOT = {
  high: "bg-red-400",
  medium: "bg-amber-400",
  low: "bg-emerald-400",
};

function MiniCard({ task, onEdit }) {
  return (
    <button
      onClick={() => onEdit(task)}
      className="w-full text-left px-2 py-1.5 rounded-lg text-xs font-medium text-white truncate transition-opacity hover:opacity-90"
      style={{ backgroundColor: task.color || "#6366f1" }}
      title={task.title}
    >
      <div className="flex items-center gap-1">
        {task.time && <Clock size={9} className="shrink-0" />}
        <span className="truncate">
          {task.time && `${task.time} `}
          {task.title}
        </span>
      </div>
    </button>
  );
}

export default function WeekView({ currentDate, onAddTask, onEditTask }) {
  const { tasks } = useTasks();
  const days = getWeekDays(currentDate);

  const tasksForDay = (day) =>
    tasks
      .filter((t) => {
        const d = parseDate(t.date);
        return d && isSameDay(d, day);
      })
      .sort((a, b) => (a.time || "").localeCompare(b.time || ""));

  return (
    <div className="p-6">
      <div className="grid grid-cols-7 gap-3">
        {days.map((day) => {
          const dayTasks = tasksForDay(day);
          const today = isToday(day);

          return (
            <div
              key={day.toISOString()}
              className={`rounded-2xl border min-h-[300px] flex flex-col overflow-hidden transition-shadow hover:shadow-md ${
                today ? "border-indigo-300 shadow-sm" : "border-gray-100"
              }`}
            >
              {/* Day header */}
              <div
                className={`px-3 py-2.5 flex items-center justify-between border-b ${
                  today ? "bg-indigo-600" : "bg-gray-50 border-gray-100"
                }`}
              >
                <div>
                  <p
                    className={`text-[10px] font-semibold uppercase tracking-wider ${
                      today ? "text-indigo-200" : "text-gray-400"
                    }`}
                  >
                    {format(day, "EEE", { locale: es })}
                  </p>
                  <p
                    className={`text-lg font-bold leading-none ${
                      today ? "text-white" : "text-gray-700"
                    }`}
                  >
                    {format(day, "d")}
                  </p>
                </div>
                <button
                  onClick={() => onAddTask(format(day, "yyyy-MM-dd"))}
                  className={`p-1 rounded-lg transition-colors ${
                    today
                      ? "hover:bg-indigo-500 text-indigo-100"
                      : "hover:bg-gray-200 text-gray-400"
                  }`}
                >
                  <Plus size={13} />
                </button>
              </div>

              {/* Tasks */}
              <div className="flex-1 p-2 flex flex-col gap-1.5">
                {dayTasks.map((task) => (
                  <MiniCard key={task.id} task={task} onEdit={onEditTask} />
                ))}
                {dayTasks.length === 0 && (
                  <p className="text-[11px] text-gray-300 text-center mt-4">
                    Sin tareas
                  </p>
                )}
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
}
