import { createContext, useContext, useEffect, useMemo, useState } from "react";
import toast from "react-hot-toast";
import { useAuth } from "./AuthContext";
import {
  createTaskForUser,
  deleteTaskForUser,
  fetchTasksForUser,
  moveTaskForUser,
  reorderTasksForUser,
  updateTaskForUser,
} from "../services/taskService";

const TaskContext = createContext(null);

export function TaskProvider({ children }) {
  const { user } = useAuth();
  const [tasks, setTasks] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    let cancelled = false;

    const loadTasks = async () => {
      if (!user) {
        setTasks([]);
        setLoading(false);
        return;
      }

      setLoading(true);
      try {
        const next = await fetchTasksForUser(user.id);
        if (!cancelled) setTasks(next);
      } catch (error) {
        if (!cancelled) {
          toast.error(error.message || "No se pudieron cargar las tareas");
          setTasks([]);
        }
      } finally {
        if (!cancelled) setLoading(false);
      }
    };

    loadTasks();
    return () => {
      cancelled = true;
    };
  }, [user]);

  const api = useMemo(() => {
    return {
      tasks,
      loading,
      async addTask(task) {
        if (!user) return;
        const sameStatus = tasks.filter((t) => t.status === task.status);
        const created = await createTaskForUser(
          user.id,
          task,
          sameStatus.length,
        );
        setTasks((prev) => [...prev, created]);
      },
      async updateTask(task) {
        if (!user || !task?.id) return;
        const updated = await updateTaskForUser(user.id, task.id, task);
        setTasks((prev) =>
          prev.map((t) => (t.id === updated.id ? updated : t)),
        );
      },
      async deleteTask(id) {
        if (!user) return;
        try {
          await deleteTaskForUser(user.id, id);
          setTasks((prev) => prev.filter((t) => t.id !== id));
        } catch (error) {
          toast.error(error.message || "No se pudo eliminar la tarea");
        }
      },
      async moveTask(id, status) {
        if (!user) return;
        try {
          const moved = await moveTaskForUser(user.id, id, status);
          setTasks((prev) => prev.map((t) => (t.id === moved.id ? moved : t)));
        } catch (error) {
          toast.error(error.message || "No se pudo mover la tarea");
        }
      },
      async reorderTasks(nextTasks) {
        if (!user) return;
        setTasks(nextTasks);
        try {
          await reorderTasksForUser(user.id, nextTasks);
        } catch (error) {
          toast.error(error.message || "No se pudo reordenar");
        }
      },
    };
  }, [loading, tasks, user]);

  return <TaskContext.Provider value={api}>{children}</TaskContext.Provider>;
}

export const useTasks = () => {
  const ctx = useContext(TaskContext);
  if (!ctx) throw new Error("useTasks must be used within TaskProvider");
  return ctx;
};
