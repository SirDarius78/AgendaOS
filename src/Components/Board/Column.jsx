import React from "react";
import {
  SortableContext,
  verticalListSortingStrategy,
} from "@dnd-kit/sortable";
import { useDroppable } from "@dnd-kit/core";
import TaskCard from "./TaskCard";
import { Plus } from "lucide-react";

const COLUMN_META = {
  todo: {
    label: "Por hacer",
    dot: "bg-gray-400",
    header: "bg-gray-50 border-gray-200",
  },
  inprogress: {
    label: "En progreso",
    dot: "bg-amber-400",
    header: "bg-amber-50 border-amber-100",
  },
  done: {
    label: "Completado",
    dot: "bg-emerald-400",
    header: "bg-emerald-50 border-emerald-100",
  },
};

export default function Column({
  id,
  tasks,
  onAddTask,
  onEditTask,
  onDeleteTask,
}) {
  const meta = COLUMN_META[id];

  const { setNodeRef, isOver } = useDroppable({ id });

  return (
    <div className="flex flex-col w-full sm:w-72 sm:shrink-0">
      {/* Column header */}
      <div
        className={`sticky top-[72px] sm:static z-10 flex items-center justify-between px-3 py-2.5 rounded-xl border mb-3 shadow-sm sm:shadow-none ${meta.header}`}
      >
        <div className="flex items-center gap-2">
          <span className={`w-2 h-2 rounded-full ${meta.dot}`} />
          <span className="text-sm font-semibold text-gray-700">
            {meta.label}
          </span>
          <span className="ml-1 text-xs bg-white/80 text-gray-500 font-medium px-1.5 py-0.5 rounded-full border">
            {tasks.length}
          </span>
        </div>
        <button
          onClick={() => onAddTask(id)}
          className="p-2 rounded-lg hover:bg-white/60 text-gray-400 hover:text-gray-600 transition-colors"
        >
          <Plus size={14} />
        </button>
      </div>

      {/* Drop zone */}
      <div
        ref={setNodeRef}
        className={`flex-1 flex flex-col gap-2 min-h-[200px] rounded-xl p-2 transition-colors ${
          isOver ? "bg-indigo-50/60" : "bg-transparent"
        }`}
      >
        <SortableContext
          items={tasks.map((t) => t.id)}
          strategy={verticalListSortingStrategy}
        >
          {tasks.map((task) => (
            <TaskCard
              key={task.id}
              task={task}
              onEdit={onEditTask}
              onDelete={onDeleteTask}
            />
          ))}
        </SortableContext>

        {tasks.length === 0 && (
          <button
            onClick={() => onAddTask(id)}
            className="flex flex-col items-center justify-center h-24 rounded-xl border-2 border-dashed border-gray-200 text-gray-300 hover:border-indigo-300 hover:text-indigo-400 transition-colors text-xs gap-1"
          >
            <Plus size={18} />
            Agregar tarea
          </button>
        )}
      </div>
    </div>
  );
}
