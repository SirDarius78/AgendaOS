import React from "react";
import { format, isSameDay } from "date-fns";
import { es } from "date-fns/locale";
import { Plus, Clock } from "lucide-react";
import { useTasks } from "../../context/TaskContext";
import { HOURS, parseDate, formatLong } from "../../utils/dateUtils";

const PRIORITY_COLOR = { high: "#ef4444", medium: "#f59e0b", low: "#10b981" };

export default function DayView({ currentDate, onAddTask, onEditTask }) {
  const { tasks } = useTasks();

  const dayTasks = tasks.filter((t) => {
    const d = parseDate(t.date);
    return d && isSameDay(d, currentDate);
  });

  const tasksForHour = (hour) =>
    dayTasks.filter((t) => {
      if (!t.time) return false;
      const h = parseInt(t.time.split(":")[0], 10);
      return h === hour;
    });

  const unscheduled = dayTasks.filter((t) => !t.time);

  return (
    <div className="p-6 max-w-3xl mx-auto">
      {/* Day title */}
      <div className="flex items-center justify-between mb-6">
        <h2 className="text-xl font-bold text-gray-800 capitalize">
          {formatLong(currentDate)}
        </h2>
        <button
          onClick={() => onAddTask(format(currentDate, "yyyy-MM-dd"))}
          className="flex items-center gap-2 bg-indigo-600 hover:bg-indigo-700 text-white px-3 py-2 rounded-xl text-sm font-medium transition-colors"
        >
          <Plus size={15} />
          Agregar tarea
        </button>
      </div>

      {/* Unscheduled tasks */}
      {unscheduled.length > 0 && (
        <div className="mb-5 p-3 bg-gray-50 rounded-xl border border-gray-100">
          <p className="text-xs font-semibold text-gray-400 uppercase tracking-wider mb-2">
            Sin hora asignada
          </p>
          <div className="flex flex-col gap-1.5">
            {unscheduled.map((task) => (
              <TaskRow key={task.id} task={task} onEdit={onEditTask} />
            ))}
          </div>
        </div>
      )}

      {/* Timeline */}
      <div className="flex flex-col gap-0">
        {HOURS.map((hour) => {
          const hourTasks = tasksForHour(hour);
          return (
            <div key={hour} className="flex gap-4 group">
              {/* Hour label */}
              <div className="w-14 shrink-0 text-right">
                <span className="text-xs text-gray-300 group-hover:text-gray-400 transition-colors">
                  {hour.toString().padStart(2, "0")}:00
                </span>
              </div>

              {/* Line + content */}
              <div className="flex-1 border-t border-gray-100 pt-2 pb-3 min-h-[52px]">
                {hourTasks.length > 0 ? (
                  <div className="flex flex-col gap-1.5">
                    {hourTasks.map((task) => (
                      <TaskRow key={task.id} task={task} onEdit={onEditTask} />
                    ))}
                  </div>
                ) : (
                  <button
                    onClick={() =>
                      onAddTask(
                        format(currentDate, "yyyy-MM-dd"),
                        `${hour.toString().padStart(2, "0")}:00`,
                      )
                    }
                    className="w-full text-left text-xs text-transparent group-hover:text-gray-300 hover:!text-indigo-400 transition-colors py-1"
                  >
                    + Agregar tarea a las {hour}:00
                  </button>
                )}
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
}

function TaskRow({ task, onEdit }) {
  return (
    <button
      onClick={() => onEdit(task)}
      className="flex items-center gap-3 w-full text-left px-3 py-2 rounded-xl hover:shadow-sm transition-all border"
      style={{
        borderColor: task.color + "40",
        backgroundColor: task.color + "10",
      }}
    >
      <div
        className="w-1 h-8 rounded-full shrink-0"
        style={{ backgroundColor: task.color }}
      />
      <div className="flex-1 min-w-0">
        <p className="text-sm font-medium text-gray-800 truncate">
          {task.title}
        </p>
        {task.description && (
          <p className="text-xs text-gray-400 truncate">{task.description}</p>
        )}
      </div>
      {task.time && (
        <span className="flex items-center gap-1 text-xs text-gray-400 shrink-0">
          <Clock size={11} />
          {task.time}
        </span>
      )}
    </button>
  );
}
