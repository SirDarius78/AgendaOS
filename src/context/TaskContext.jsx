import React, { createContext, useContext, useEffect, useReducer } from "react";
import { v4 as uuidv4 } from "uuid";

const STORAGE_KEY = "taskmanager_tasks";

const defaultTasks = [];

function loadFromStorage() {
  try {
    const raw = localStorage.getItem(STORAGE_KEY);
    return raw ? JSON.parse(raw) : defaultTasks;
  } catch {
    return defaultTasks;
  }
}

function saveToStorage(tasks) {
  localStorage.setItem(STORAGE_KEY, JSON.stringify(tasks));
}

// ── Reducer ───────────────────────────────────────────────────────────────────
function reducer(state, action) {
  let next;
  switch (action.type) {
    case "ADD":
      next = [
        ...state,
        {
          ...action.payload,
          id: uuidv4(),
          createdAt: new Date().toISOString(),
        },
      ];
      break;
    case "UPDATE":
      next = state.map((t) =>
        t.id === action.payload.id ? { ...t, ...action.payload } : t,
      );
      break;
    case "DELETE":
      next = state.filter((t) => t.id !== action.payload);
      break;
    case "MOVE":
      next = state.map((t) =>
        t.id === action.payload.id
          ? { ...t, status: action.payload.status }
          : t,
      );
      break;
    case "REORDER":
      next = action.payload;
      break;
    default:
      return state;
  }
  saveToStorage(next);
  return next;
}

// ── Context ───────────────────────────────────────────────────────────────────
const TaskContext = createContext(null);

export function TaskProvider({ children }) {
  const [tasks, dispatch] = useReducer(reducer, [], loadFromStorage);

  const addTask = (task) => dispatch({ type: "ADD", payload: task });
  const updateTask = (task) => dispatch({ type: "UPDATE", payload: task });
  const deleteTask = (id) => dispatch({ type: "DELETE", payload: id });
  const moveTask = (id, status) =>
    dispatch({ type: "MOVE", payload: { id, status } });
  const reorderTasks = (tasks) => dispatch({ type: "REORDER", payload: tasks });

  return (
    <TaskContext.Provider
      value={{ tasks, addTask, updateTask, deleteTask, moveTask, reorderTasks }}
    >
      {children}
    </TaskContext.Provider>
  );
}

export const useTasks = () => {
  const ctx = useContext(TaskContext);
  if (!ctx) throw new Error("useTasks must be used within TaskProvider");
  return ctx;
};
