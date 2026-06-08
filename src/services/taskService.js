import { supabase } from "../lib/supabaseClient";

const VALID_STATUSES = ["todo", "inprogress", "done"];
const VALID_PRIORITIES = ["low", "medium", "high"];

function toUiTime(value) {
  if (!value) return "";
  return String(value).slice(0, 5);
}

function normalizeTags(tags) {
  if (!Array.isArray(tags)) return [];
  return tags
    .map((tag) => String(tag).trim())
    .filter(Boolean)
    .slice(0, 20);
}

function validateTaskInput(task) {
  const title = String(task.title ?? "").trim();
  if (!title) throw new Error("El titulo es obligatorio");

  const status = VALID_STATUSES.includes(task.status) ? task.status : "todo";
  const priority = VALID_PRIORITIES.includes(task.priority)
    ? task.priority
    : "medium";

  const date = task.date ? String(task.date) : null;
  const time = task.time ? String(task.time).slice(0, 5) : null;

  return {
    title,
    description: String(task.description ?? "").trim() || null,
    due_date: date,
    due_time: time,
    status,
    priority,
    color: String(task.color ?? "#6366f1"),
    tags: normalizeTags(task.tags),
  };
}

function mapTaskFromDb(row) {
  return {
    id: row.id,
    boardId: row.board_id,
    title: row.title,
    description: row.description ?? "",
    date: row.due_date ?? "",
    time: toUiTime(row.due_time),
    status: row.status,
    priority: row.priority,
    color: row.color ?? "#6366f1",
    tags: Array.isArray(row.tags) ? row.tags : [],
    createdAt: row.created_at,
    updatedAt: row.updated_at,
    position: row.position ?? 0,
  };
}

export async function fetchTasksForUser(userId) {
  return fetchTasksForBoard(userId, null);
}

export async function fetchTasksForBoard(userId, boardId) {
  let query = supabase
    .from("tasks")
    .select("*")
    .order("status", { ascending: true })
    .order("position", { ascending: true })
    .order("created_at", { ascending: true });

  if (boardId) {
    query = query.eq("board_id", boardId);
  } else {
    query = query.eq("user_id", userId);
  }

  const { data, error } = await query;

  if (error) throw error;
  return (data || []).map(mapTaskFromDb);
}

export async function createTaskForBoard({
  userId,
  boardId,
  task,
  position = 0,
}) {
  const payload = validateTaskInput(task);

  const { data, error } = await supabase
    .from("tasks")
    .insert({ ...payload, user_id: userId, board_id: boardId, position })
    .select("*")
    .single();

  if (error) throw error;
  return mapTaskFromDb(data);
}

export async function updateTaskForBoard({ userId, boardId, taskId, patch }) {
  const payload = validateTaskInput(patch);

  const { data, error } = await supabase
    .from("tasks")
    .update(payload)
    .eq("id", taskId)
    .eq("user_id", userId)
    .eq("board_id", boardId)
    .select("*")
    .single();

  if (error) throw error;
  return mapTaskFromDb(data);
}

export async function deleteTaskForBoard({ userId, boardId, taskId }) {
  const { error } = await supabase
    .from("tasks")
    .delete()
    .eq("id", taskId)
    .eq("user_id", userId)
    .eq("board_id", boardId);

  if (error) throw error;
}

export async function moveTaskForBoard({ userId, boardId, taskId, status }) {
  if (!VALID_STATUSES.includes(status)) {
    throw new Error("Estado de tarea invalido");
  }

  const { data, error } = await supabase
    .from("tasks")
    .update({ status })
    .eq("id", taskId)
    .eq("user_id", userId)
    .eq("board_id", boardId)
    .select("*")
    .single();

  if (error) throw error;
  return mapTaskFromDb(data);
}

export async function reorderTasksForBoard({ userId, boardId, orderedTasks }) {
  if (!orderedTasks.length) return;

  const updates = orderedTasks.map((task, index) =>
    supabase
      .from("tasks")
      .update({ position: index, status: task.status })
      .eq("id", task.id)
      .eq("user_id", userId)
      .eq("board_id", boardId),
  );

  const results = await Promise.all(updates);
  const failed = results.find((result) => result.error);
  if (failed?.error) throw failed.error;
}
