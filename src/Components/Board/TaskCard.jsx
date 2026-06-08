import React from "react";
import { useSortable } from "@dnd-kit/sortable";
import { CSS } from "@dnd-kit/utilities";
import { Clock, Pencil, Trash2, GripVertical, Tag } from "lucide-react";

const PRIORITY_STYLES = {
  high: "bg-red-100 text-red-600",
  medium: "bg-amber-100 text-amber-600",
  low: "bg-emerald-100 text-emerald-600",
};

const PRIORITY_LABELS = { high: "Alta", medium: "Media", low: "Baja" };

export default function TaskCard({
  task,
  onEdit,
  onDelete,
  overlay = false,
  readOnly = false,
}) {
  const {
    attributes,
    listeners,
    setNodeRef,
    transform,
    transition,
    isDragging,
  } = useSortable({
    id: task.id,
    disabled: readOnly,
  });

  const style = {
    transform: CSS.Transform.toString(transform),
    transition,
    opacity: isDragging ? 0.4 : 1,
  };

  return (
    <div
      ref={setNodeRef}
      style={style}
      className={`group bg-white rounded-xl border border-gray-100 shadow-sm hover:shadow-md transition-all cursor-default select-none ${
        overlay ? "shadow-xl rotate-1 scale-105" : ""
      }`}
    >
      {/* Color accent bar */}
      <div
        className="h-1 rounded-t-xl"
        style={{ backgroundColor: task.color || "#6366f1" }}
      />

      <div className="p-3">
        <div className="flex items-start gap-2">
          {/* Drag handle */}
          {!readOnly && (
            <button
              {...attributes}
              {...listeners}
              className="mt-0.5 text-gray-300 hover:text-gray-500 cursor-grab active:cursor-grabbing shrink-0 p-1 -m-1"
            >
              <GripVertical size={14} />
            </button>
          )}

          <div className="flex-1 min-w-0">
            {/* Title */}
            <p className="text-sm font-medium text-gray-800 leading-snug">
              {task.title}
            </p>

            {/* Description */}
            {task.description && (
              <p className="text-xs text-gray-400 mt-1 line-clamp-2">
                {task.description}
              </p>
            )}

            {/* Meta row */}
            <div className="flex items-center gap-2 mt-2 flex-wrap">
              {task.date && (
                <span className="flex items-center gap-1 text-xs text-gray-400">
                  <Clock size={11} />
                  {task.time ? `${task.date} ${task.time}` : task.date}
                </span>
              )}
              {task.priority && (
                <span
                  className={`text-[10px] font-semibold px-1.5 py-0.5 rounded-full ${
                    PRIORITY_STYLES[task.priority]
                  }`}
                >
                  {PRIORITY_LABELS[task.priority]}
                </span>
              )}
            </div>

            {/* Tags */}
            {task.tags?.length > 0 && (
              <div className="flex gap-1 mt-2 flex-wrap">
                {task.tags.map((tag) => (
                  <span
                    key={tag}
                    className="flex items-center gap-0.5 text-[10px] bg-gray-100 text-gray-500 px-1.5 py-0.5 rounded-full"
                  >
                    <Tag size={9} />
                    {tag}
                  </span>
                ))}
              </div>
            )}
          </div>

          {/* Actions */}
          {!readOnly && (
            <div className="flex gap-1 shrink-0 opacity-100 sm:opacity-0 sm:group-hover:opacity-100 sm:transition-opacity">
              <button
                onClick={() => onEdit(task)}
                className="p-1.5 rounded-lg hover:bg-indigo-50 text-gray-400 hover:text-indigo-500 transition-colors"
              >
                <Pencil size={13} />
              </button>
              <button
                onClick={() => onDelete(task.id)}
                className="p-1.5 rounded-lg hover:bg-red-50 text-gray-400 hover:text-red-500 transition-colors"
              >
                <Trash2 size={13} />
              </button>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
