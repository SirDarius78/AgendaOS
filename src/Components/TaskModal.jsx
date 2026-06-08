import React, { useState, useEffect, useRef } from "react";
import { X, Calendar, Clock, Tag, AlignLeft, Flag } from "lucide-react";
import { format } from "date-fns";
import toast from "react-hot-toast";

const PRIORITIES = [
  {
    value: "low",
    label: "Baja",
    color: "bg-emerald-100 text-emerald-700 border-emerald-200",
  },
  {
    value: "medium",
    label: "Media",
    color: "bg-amber-100 text-amber-700 border-amber-200",
  },
  {
    value: "high",
    label: "Alta",
    color: "bg-red-100 text-red-700 border-red-200",
  },
];

const COLORS = [
  "#6366f1",
  "#8b5cf6",
  "#ec4899",
  "#f97316",
  "#10b981",
  "#3b82f6",
  "#f59e0b",
  "#14b8a6",
];

const STATUS_OPTIONS = [
  { value: "todo", label: "Por hacer" },
  { value: "inprogress", label: "En progreso" },
  { value: "done", label: "Completado" },
];

const EMPTY = {
  title: "",
  description: "",
  date: format(new Date(), "yyyy-MM-dd"),
  time: "",
  priority: "medium",
  status: "todo",
  color: "#6366f1",
  tags: "",
};

export default function TaskModal({
  open,
  onClose,
  onSave,
  initialData,
  defaultDate,
}) {
  const [form, setForm] = useState(EMPTY);
  const titleRef = useRef(null);

  useEffect(() => {
    if (open) {
      setForm(
        initialData
          ? {
              ...EMPTY,
              ...initialData,
              tags: (initialData.tags || []).join(", "),
            }
          : { ...EMPTY, date: defaultDate || EMPTY.date },
      );
      setTimeout(() => titleRef.current?.focus(), 50);
    }
  }, [open, initialData, defaultDate]);

  const set = (field) => (e) =>
    setForm((f) => ({ ...f, [field]: e.target.value }));

  const handleSubmit = (e) => {
    e.preventDefault();
    if (!form.title.trim()) {
      toast.error("El título es obligatorio");
      return;
    }
    onSave({
      ...form,
      tags: form.tags
        .split(",")
        .map((t) => t.trim())
        .filter(Boolean),
    });
    toast.success(initialData ? "Tarea actualizada ✓" : "Tarea creada ✓");
    onClose();
  };

  const handleKeyDown = (e) => {
    if (e.key === "Escape") onClose();
  };

  if (!open) return null;

  return (
    <div
      className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 backdrop-blur-sm p-4"
      onClick={(e) => e.target === e.currentTarget && onClose()}
      onKeyDown={handleKeyDown}
    >
      <div className="bg-white rounded-2xl shadow-2xl w-full max-w-lg animate-in fade-in zoom-in-95 duration-200">
        {/* Header */}
        <div className="flex items-center justify-between p-5 border-b border-gray-100">
          <h2 className="text-lg font-semibold text-gray-800">
            {initialData ? "Editar tarea" : "Nueva tarea"}
          </h2>
          <button
            onClick={onClose}
            className="p-1.5 rounded-lg text-gray-400 hover:text-gray-600 hover:bg-gray-100 transition-colors"
          >
            <X size={18} />
          </button>
        </div>

        <form onSubmit={handleSubmit} className="p-5 space-y-4">
          {/* Title */}
          <div>
            <input
              ref={titleRef}
              type="text"
              placeholder="Título de la tarea..."
              value={form.title}
              onChange={set("title")}
              className="w-full text-lg font-medium placeholder-gray-300 border-0 outline-none focus:ring-0 p-0"
            />
          </div>

          {/* Description */}
          <div className="flex gap-3 items-start">
            <AlignLeft size={16} className="mt-1 text-gray-400 shrink-0" />
            <textarea
              placeholder="Descripción (opcional)..."
              value={form.description}
              onChange={set("description")}
              rows={2}
              className="flex-1 text-sm text-gray-600 placeholder-gray-300 resize-none border-0 outline-none focus:ring-0 p-0"
            />
          </div>

          <div className="h-px bg-gray-100" />

          {/* Date & Time */}
          <div className="grid grid-cols-2 gap-3">
            <div className="flex items-center gap-2 bg-gray-50 rounded-xl px-3 py-2">
              <Calendar size={15} className="text-gray-400" />
              <input
                type="date"
                value={form.date}
                onChange={set("date")}
                className="flex-1 text-sm bg-transparent border-0 outline-none text-gray-700"
              />
            </div>
            <div className="flex items-center gap-2 bg-gray-50 rounded-xl px-3 py-2">
              <Clock size={15} className="text-gray-400" />
              <input
                type="time"
                value={form.time}
                onChange={set("time")}
                className="flex-1 text-sm bg-transparent border-0 outline-none text-gray-700"
              />
            </div>
          </div>

          {/* Priority */}
          <div className="flex items-center gap-2">
            <Flag size={15} className="text-gray-400" />
            <span className="text-sm text-gray-500 mr-1">Prioridad:</span>
            {PRIORITIES.map((p) => (
              <button
                key={p.value}
                type="button"
                onClick={() => setForm((f) => ({ ...f, priority: p.value }))}
                className={`px-3 py-1 text-xs font-medium rounded-full border transition-all ${p.color} ${
                  form.priority === p.value
                    ? "ring-2 ring-offset-1 ring-indigo-400"
                    : "opacity-60"
                }`}
              >
                {p.label}
              </button>
            ))}
          </div>

          {/* Status */}
          <div className="flex items-center gap-2">
            <span className="text-sm text-gray-500">Estado:</span>
            <select
              value={form.status}
              onChange={set("status")}
              className="text-sm bg-gray-50 border-0 rounded-lg px-2 py-1.5 text-gray-700 outline-none"
            >
              {STATUS_OPTIONS.map((s) => (
                <option key={s.value} value={s.value}>
                  {s.label}
                </option>
              ))}
            </select>
          </div>

          {/* Color & Tags */}
          <div className="flex items-center gap-3">
            <div className="flex gap-1.5">
              {COLORS.map((c) => (
                <button
                  key={c}
                  type="button"
                  onClick={() => setForm((f) => ({ ...f, color: c }))}
                  style={{ backgroundColor: c }}
                  className={`w-5 h-5 rounded-full transition-transform ${
                    form.color === c
                      ? "scale-125 ring-2 ring-offset-1 ring-gray-400"
                      : ""
                  }`}
                />
              ))}
            </div>
            <div className="flex-1 flex items-center gap-2 bg-gray-50 rounded-xl px-3 py-2">
              <Tag size={14} className="text-gray-400" />
              <input
                type="text"
                placeholder="etiquetas, separadas, por coma"
                value={form.tags}
                onChange={set("tags")}
                className="flex-1 text-sm bg-transparent border-0 outline-none text-gray-700 placeholder-gray-300"
              />
            </div>
          </div>

          {/* Actions */}
          <div className="flex gap-3 pt-2">
            <button
              type="button"
              onClick={onClose}
              className="flex-1 py-2.5 rounded-xl border border-gray-200 text-sm font-medium text-gray-600 hover:bg-gray-50 transition-colors"
            >
              Cancelar
            </button>
            <button
              type="submit"
              className="flex-1 py-2.5 rounded-xl text-sm font-medium text-white transition-colors"
              style={{ backgroundColor: form.color }}
            >
              {initialData ? "Guardar cambios" : "Crear tarea"}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}
