import React, { useState } from "react";
import { Toaster } from "react-hot-toast";
import { TaskProvider } from "./context/TaskContext";
import Header from "./Components/Header";
import BoardView from "./Components/Board/BoardView";
import WeekView from "./Components/Calendar/WeekView";
import DayView from "./Components/Calendar/DayView";
import TaskModal from "./Components/TaskModal";
import { useTasks } from "./context/TaskContext";

function AppContent() {
  const [view, setView] = useState("board");
  const [currentDate, setCurrentDate] = useState(new Date());
  const [modal, setModal] = useState({
    open: false,
    task: null,
    defaultStatus: "todo",
    defaultDate: null,
  });
  const { addTask, updateTask } = useTasks();

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

  const handleSave = (data) => {
    if (modal.task) {
      updateTask({ ...modal.task, ...data });
    } else {
      addTask({
        ...data,
        status: data.status || modal.defaultStatus || "todo",
        time: data.time || modal.defaultTime || "",
      });
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
      />

      <main>
        {view === "board" && (
          <BoardView onAddTask={openNew} onEditTask={openEdit} />
        )}
        {view === "week" && (
          <WeekView
            currentDate={currentDate}
            onAddTask={openNew}
            onEditTask={openEdit}
          />
        )}
        {view === "day" && (
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
        position="bottom-right"
        toastOptions={{
          style: { borderRadius: "12px", fontSize: "13px" },
        }}
      />
    </div>
  );
}

export default function App() {
  return (
    <TaskProvider>
      <AppContent />
    </TaskProvider>
  );
}
