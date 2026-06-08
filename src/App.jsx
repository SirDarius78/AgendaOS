import { useState } from "react";
import { Toaster, toast } from "react-hot-toast";
import { TaskProvider } from "./context/TaskContext";
import { AuthProvider, useAuth } from "./context/AuthContext";
import Header from "./Components/Header";
import BoardView from "./Components/Board/BoardView";
import WeekView from "./Components/Calendar/WeekView";
import DayView from "./Components/Calendar/DayView";
import TaskModal from "./Components/TaskModal";
import AuthScreen from "./Components/Auth/AuthScreen";
import { useTasks } from "./context/TaskContext";

function AppContent() {
  const { user, signOut } = useAuth();
  const { addTask, updateTask, loading, isReadOnlyBoard, tasks, activeBoard } =
    useTasks();
  const [view, setView] = useState("board");
  const [currentDate, setCurrentDate] = useState(new Date());
  const [modal, setModal] = useState({
    open: false,
    task: null,
    defaultStatus: "todo",
    defaultDate: null,
  });

  const statusLabel = {
    todo: "Por hacer",
    inprogress: "En progreso",
    done: "Completada",
  };

  const priorityLabel = {
    low: "Baja",
    medium: "Media",
    high: "Alta",
  };

  const escapeHtml = (value = "") =>
    String(value)
      .replaceAll("&", "&amp;")
      .replaceAll("<", "&lt;")
      .replaceAll(">", "&gt;")
      .replaceAll('"', "&quot;")
      .replaceAll("'", "&#039;");

  const handleExportPdf = () => {
    if (!tasks?.length) {
      toast.error("No hay tareas para exportar");
      return;
    }

    const ordered = [...tasks].sort((a, b) => {
      const statusOrder = { todo: 1, inprogress: 2, done: 3 };
      const sa = statusOrder[a.status] || 99;
      const sb = statusOrder[b.status] || 99;
      if (sa !== sb) return sa - sb;
      return String(a.title || "").localeCompare(String(b.title || ""));
    });

    const rows = ordered
      .map(
        (t) => `
      <tr>
        <td>${escapeHtml(t.title)}</td>
        <td>${escapeHtml(statusLabel[t.status] || t.status || "-")}</td>
        <td>${escapeHtml(priorityLabel[t.priority] || t.priority || "-")}</td>
        <td>${escapeHtml(t.date || "-")}</td>
        <td>${escapeHtml(t.time || "-")}</td>
        <td>${escapeHtml((t.tags || []).join(", ") || "-")}</td>
      </tr>
    `,
      )
      .join("");

    const w = window.open("", "_blank", "width=1100,height=800");
    if (!w) {
      toast.error("El navegador bloqueo la ventana para exportar");
      return;
    }

    const now = new Date();
    const fecha = now.toLocaleDateString("es-ES");
    const hora = now.toLocaleTimeString("es-ES");

    w.document.write(`
      <!doctype html>
      <html>
        <head>
          <meta charset="utf-8" />
          <title>Tareas - ${escapeHtml(activeBoard?.title || "Mi tablero")}</title>
          <style>
            body { font-family: Arial, sans-serif; padding: 24px; color: #111827; }
            h1 { margin: 0 0 6px; font-size: 20px; }
            p { margin: 0 0 16px; color: #4b5563; }
            table { width: 100%; border-collapse: collapse; }
            th, td { border: 1px solid #e5e7eb; padding: 8px; text-align: left; font-size: 12px; vertical-align: top; }
            th { background: #f3f4f6; }
            @media print {
              @page { size: A4 landscape; margin: 12mm; }
              button { display: none; }
            }
          </style>
        </head>
        <body>
          <h1>Listado de tareas</h1>
          <p>Tablero: ${escapeHtml(activeBoard?.title || "Mi tablero")} | Generado: ${fecha} ${hora}</p>
          <table>
            <thead>
              <tr>
                <th>Titulo</th>
                <th>Estado</th>
                <th>Prioridad</th>
                <th>Fecha</th>
                <th>Hora</th>
                <th>Etiquetas</th>
              </tr>
            </thead>
            <tbody>${rows}</tbody>
          </table>
          <script>
            window.onload = () => {
              window.print();
            };
          </script>
        </body>
      </html>
    `);

    w.document.close();
  };

  const openNew = (statusOrDate, time) => {
    if (isReadOnlyBoard) {
      toast.error("Este tablero es solo lectura");
      return;
    }

    const isStatus = ["todo", "inprogress", "done"].includes(statusOrDate);
    setModal({
      open: true,
      task: null,
      defaultStatus: isStatus ? statusOrDate : "todo",
      defaultDate: !isStatus ? statusOrDate : null,
      defaultTime: time || null,
    });
  };

  const openEdit = (task) =>
    isReadOnlyBoard
      ? toast.error("Este tablero es solo lectura")
      : setModal({
          open: true,
          task,
          defaultStatus: task.status,
          defaultDate: null,
        });
  const closeModal = () => setModal((m) => ({ ...m, open: false }));

  const handleSave = async (data) => {
    if (modal.task) {
      await updateTask({ ...modal.task, ...data });
    } else {
      await addTask({
        ...data,
        status: data.status || modal.defaultStatus || "todo",
        time: data.time || modal.defaultTime || "",
      });
    }
  };

  const handleSignOut = async () => {
    try {
      await signOut();
      toast.success("Sesion cerrada");
    } catch (error) {
      toast.error(error.message || "No se pudo cerrar sesion");
    }
  };

  return (
    <div className="min-h-screen bg-gray-50 font-sans">
      <Header
        view={view}
        onViewChange={setView}
        onNewTask={() => openNew("todo")}
        onExportPdf={handleExportPdf}
        currentDate={currentDate}
        onDateChange={setCurrentDate}
        userEmail={user?.email || ""}
        onSignOut={handleSignOut}
        disableNewTask={isReadOnlyBoard}
      />
      <main className="pb-3 sm:pb-4">
        {loading && (
          <div className="px-4 py-12 text-center text-gray-400 text-sm">
            Cargando tareas...
          </div>
        )}
        {!loading && view === "board" && (
          <BoardView onAddTask={openNew} onEditTask={openEdit} />
        )}
        {!loading && view === "week" && (
          <WeekView
            currentDate={currentDate}
            onAddTask={openNew}
            onEditTask={openEdit}
          />
        )}
        {!loading && view === "day" && (
          <DayView
            currentDate={currentDate}
            onAddTask={openNew}
            onEditTask={openEdit}
          />
        )}
      </main>

      <TaskModal
        open={modal.open}
        onClose={closeModal}
        onSave={handleSave}
        initialData={modal.task}
        defaultDate={modal.defaultDate}
      />

      <Toaster
        position="bottom-center"
        toastOptions={{
          style: { borderRadius: "12px", fontSize: "13px" },
        }}
      />
    </div>
  );
}

function AppShell() {
  const { user, loading } = useAuth();

  if (loading) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center text-gray-500">
        Cargando sesion...
      </div>
    );
  }

  if (!user) return <AuthScreen />;

  return (
    <TaskProvider>
      <AppContent />
    </TaskProvider>
  );
}

export default function App() {
  return (
    <AuthProvider>
      <AppShell />
    </AuthProvider>
  );
}
