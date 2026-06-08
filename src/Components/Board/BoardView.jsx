import React, { useState } from "react";
import {
  DndContext,
  closestCenter,
  PointerSensor,
  useSensor,
  useSensors,
  DragOverlay,
} from "@dnd-kit/core";
import { arrayMove } from "@dnd-kit/sortable";
import { useTasks } from "../../context/TaskContext";
import Column from "./Column";
import TaskCard from "./TaskCard";
import SharingPanel from "./SharingPanel";

const STATUSES = ["todo", "inprogress", "done"];

export default function BoardView({ onAddTask, onEditTask }) {
  const {
    tasks,
    moveTask,
    reorderTasks,
    deleteTask,
    boards,
    activeBoardId,
    setActiveBoardId,
    boardMembers,
    myInvitations,
    isReadOnlyBoard,
    inviteViewer,
    acceptInvitation,
    declineInvitation,
  } = useTasks();
  const [activeTask, setActiveTask] = useState(null);

  const sensors = useSensors(
    useSensor(PointerSensor, { activationConstraint: { distance: 5 } }),
  );

  const tasksByStatus = STATUSES.reduce((acc, s) => {
    acc[s] = tasks.filter((t) => t.status === s);
    return acc;
  }, {});

  const handleDragStart = ({ active }) => {
    if (isReadOnlyBoard) return;
    setActiveTask(tasks.find((t) => t.id === active.id) || null);
  };

  const handleDragEnd = ({ active, over }) => {
    if (isReadOnlyBoard) return;
    setActiveTask(null);
    if (!over) return;

    const activeTask = tasks.find((t) => t.id === active.id);
    if (!activeTask) return;

    // Dropped on a column droppable
    if (STATUSES.includes(over.id)) {
      if (activeTask.status !== over.id) moveTask(active.id, over.id);
      return;
    }

    // Dropped on another card
    const overTask = tasks.find((t) => t.id === over.id);
    if (!overTask) return;

    if (activeTask.status !== overTask.status) {
      moveTask(active.id, overTask.status);
    } else {
      const col = tasksByStatus[activeTask.status];
      const oldIdx = col.findIndex((t) => t.id === active.id);
      const newIdx = col.findIndex((t) => t.id === over.id);
      const reordered = arrayMove(col, oldIdx, newIdx);
      const otherTasks = tasks.filter((t) => t.status !== activeTask.status);
      reorderTasks([...otherTasks, ...reordered]);
    }
  };

  return (
    <div className="px-3 py-4 sm:p-6">
      <SharingPanel
        boards={boards}
        activeBoardId={activeBoardId}
        setActiveBoardId={setActiveBoardId}
        isReadOnlyBoard={isReadOnlyBoard}
        boardMembers={boardMembers}
        myInvitations={myInvitations}
        onInvite={inviteViewer}
        onAcceptInvitation={acceptInvitation}
        onDeclineInvitation={declineInvitation}
      />

      <DndContext
        sensors={isReadOnlyBoard ? undefined : sensors}
        collisionDetection={closestCenter}
        onDragStart={handleDragStart}
        onDragEnd={handleDragEnd}
      >
        <div className="flex flex-col sm:flex-row gap-4 sm:gap-5">
          {STATUSES.map((status) => (
            <Column
              key={status}
              id={status}
              tasks={tasksByStatus[status]}
              onAddTask={(s) => onAddTask(s)}
              onEditTask={onEditTask}
              onDeleteTask={deleteTask}
              readOnly={isReadOnlyBoard}
            />
          ))}
        </div>

        <DragOverlay>
          {activeTask && (
            <TaskCard
              task={activeTask}
              overlay
              onEdit={() => {}}
              onDelete={() => {}}
            />
          )}
        </DragOverlay>
      </DndContext>
    </div>
  );
}
