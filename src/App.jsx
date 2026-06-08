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
  const { addTask, updateTask, loading } = useTasks();
  const [view, setView] = useState("board");
  const [currentDate, setCurrentDate] = useState(new Date());
  const [modal, setModal] = useState({
    open: false,
    task: null,
    defaultStatus: "todo",
    defaultDate: null,
  });

  const openNew = (statusOrDate, time) => {
    // From board column → statusOrDate is a status string
    // From calendar → statusOrDate is a "yyyy-MM-dd" string
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
    setModal({
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
        currentDate={currentDate}
        onDateChange={setCurrentDate}
        userEmail={user?.email || ""}
        onSignOut={handleSignOut}
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
