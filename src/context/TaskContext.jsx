import { createContext, useContext, useEffect, useMemo, useState } from "react";
import toast from "react-hot-toast";
import { useAuth } from "./AuthContext";
import {
  createTaskForBoard,
  deleteTaskForBoard,
  fetchTasksForBoard,
  moveTaskForBoard,
  reorderTasksForBoard,
  updateTaskForBoard,
} from "../services/taskService";
import {
  acceptInvitation,
  createOwnedBoard,
  declineInvitation,
  fetchBoardMembers,
  fetchMyPendingInvitations,
  fetchReadableBoards,
  inviteViewerToBoard,
} from "../services/sharingService";

const TaskContext = createContext(null);

export function TaskProvider({ children }) {
  const { user } = useAuth();
  const [tasks, setTasks] = useState([]);
  const [boards, setBoards] = useState([]);
  const [activeBoardId, setActiveBoardId] = useState(null);
  const [boardMembers, setBoardMembers] = useState([]);
  const [myInvitations, setMyInvitations] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    let cancelled = false;

    const bootstrap = async () => {
      if (!user) {
        setBoards([]);
        setActiveBoardId(null);
        setBoardMembers([]);
        setMyInvitations([]);
        setTasks([]);
        setLoading(false);
        return;
      }

      setLoading(true);
      try {
        const [readableBoards, nextInvitations] = await Promise.all([
          fetchReadableBoards(),
          fetchMyPendingInvitations(user.id),
        ]);

        let nextBoards = readableBoards;

        if (!nextBoards.length) {
          const personalBoard = await createOwnedBoard({
            ownerUserId: user.id,
            title: "Mi tablero",
          });
          nextBoards = [personalBoard];
        }

        if (cancelled) return;

        setBoards(nextBoards);
        setMyInvitations(nextInvitations);

        const firstBoardId = nextBoards[0]?.id ?? null;
        setActiveBoardId((prev) => {
          if (!prev) return firstBoardId;
          const stillExists = nextBoards.some((board) => board.id === prev);
          return stillExists ? prev : firstBoardId;
        });
      } catch (error) {
        if (!cancelled) {
          toast.error(error.message || "No se pudieron cargar los tableros");
          setBoards([]);
          setActiveBoardId(null);
          setTasks([]);
        }
      } finally {
        if (!cancelled) setLoading(false);
      }
    };

    bootstrap();
    return () => {
      cancelled = true;
    };
  }, [user]);

  useEffect(() => {
    let cancelled = false;

    const loadBoardData = async () => {
      if (!user || !activeBoardId) {
        setTasks([]);
        setBoardMembers([]);
        return;
      }

      setLoading(true);
      try {
        const [nextTasks, members] = await Promise.all([
          fetchTasksForBoard(user.id, activeBoardId),
          fetchBoardMembers(activeBoardId),
        ]);

        if (cancelled) return;
        setTasks(nextTasks);
        setBoardMembers(members);
      } catch (error) {
        if (!cancelled) {
          toast.error(error.message || "No se pudo cargar el tablero");
          setTasks([]);
          setBoardMembers([]);
        }
      } finally {
        if (!cancelled) setLoading(false);
      }
    };

    loadBoardData();
    return () => {
      cancelled = true;
    };
  }, [activeBoardId, user]);

  const api = useMemo(() => {
    const activeBoard =
      boards.find((board) => board.id === activeBoardId) || null;
    const isReadOnlyBoard = Boolean(
      activeBoard && activeBoard.owner_user_id !== user?.id,
    );

    return {
      tasks,
      boards,
      activeBoard,
      activeBoardId,
      setActiveBoardId,
      boardMembers,
      myInvitations,
      isReadOnlyBoard,
      loading,
      async addTask(task) {
        if (!user) throw new Error("Debes iniciar sesion");
        if (!activeBoardId) {
          throw new Error("No hay tablero activo para crear tareas");
        }
        if (isReadOnlyBoard) throw new Error("Este tablero es solo lectura");

        const sameStatus = tasks.filter((t) => t.status === task.status);
        const created = await createTaskForBoard({
          userId: user.id,
          boardId: activeBoardId,
          task,
          position: sameStatus.length,
        });
        setTasks((prev) => [...prev, created]);
      },
      async updateTask(task) {
        if (!user) throw new Error("Debes iniciar sesion");
        if (!task?.id) throw new Error("Tarea invalida");
        if (!activeBoardId) {
          throw new Error("No hay tablero activo para actualizar tareas");
        }
        if (isReadOnlyBoard) throw new Error("Este tablero es solo lectura");

        const updated = await updateTaskForBoard({
          userId: user.id,
          boardId: activeBoardId,
          taskId: task.id,
          patch: task,
        });
        setTasks((prev) =>
          prev.map((t) => (t.id === updated.id ? updated : t)),
        );
      },
      async deleteTask(id) {
        if (!user || !activeBoardId || isReadOnlyBoard) return;
        try {
          await deleteTaskForBoard({
            userId: user.id,
            boardId: activeBoardId,
            taskId: id,
          });
          setTasks((prev) => prev.filter((t) => t.id !== id));
        } catch (error) {
          toast.error(error.message || "No se pudo eliminar la tarea");
        }
      },
      async moveTask(id, status) {
        if (!user || !activeBoardId || isReadOnlyBoard) return;
        try {
          const moved = await moveTaskForBoard({
            userId: user.id,
            boardId: activeBoardId,
            taskId: id,
            status,
          });
          setTasks((prev) => prev.map((t) => (t.id === moved.id ? moved : t)));
        } catch (error) {
          toast.error(error.message || "No se pudo mover la tarea");
        }
      },
      async reorderTasks(nextTasks) {
        if (!user || !activeBoardId || isReadOnlyBoard) return;
        setTasks(nextTasks);
        try {
          await reorderTasksForBoard({
            userId: user.id,
            boardId: activeBoardId,
            orderedTasks: nextTasks,
          });
        } catch (error) {
          toast.error(error.message || "No se pudo reordenar");
        }
      },
      async inviteViewer(email) {
        if (!user || !activeBoardId || isReadOnlyBoard) return;

        const created = await inviteViewerToBoard({
          boardId: activeBoardId,
          invitedByUserId: user.id,
          email,
        });

        setBoardMembers((prev) => [created, ...prev]);
      },
      async acceptInvitation(memberId) {
        if (!user) return;
        const accepted = await acceptInvitation(memberId, user.id);
        setMyInvitations((prev) => prev.filter((inv) => inv.id !== memberId));

        const nextBoards = await fetchReadableBoards();
        setBoards(nextBoards);
        setActiveBoardId((prev) => prev ?? accepted.board_id);
      },
      async declineInvitation(memberId) {
        if (!user) return;
        await declineInvitation(memberId, user.id);
        setMyInvitations((prev) => prev.filter((inv) => inv.id !== memberId));
      },
    };
  }, [
    activeBoardId,
    boardMembers,
    boards,
    loading,
    myInvitations,
    tasks,
    user,
  ]);

  return <TaskContext.Provider value={api}>{children}</TaskContext.Provider>;
}

export const useTasks = () => {
  const ctx = useContext(TaskContext);
  if (!ctx) throw new Error("useTasks must be used within TaskProvider");
  return ctx;
};
