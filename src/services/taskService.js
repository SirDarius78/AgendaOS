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
  const { data, error } = await supabase
    .from("tasks")
    .select("*")
    .eq("user_id", userId)
    .order("status", { ascending: true })
    .order("position", { ascending: true })
    .order("created_at", { ascending: true });

  if (error) throw error;
  return (data || []).map(mapTaskFromDb);
}

export async function createTaskForUser(userId, task, position = 0) {
  const payload = validateTaskInput(task);

  const { data, error } = await supabase
    .from("tasks")
    .insert({ ...payload, user_id: userId, position })
    .select("*")
    .single();

  if (error) throw error;
  return mapTaskFromDb(data);
}

export async function updateTaskForUser(userId, taskId, patch) {
  const payload = validateTaskInput(patch);

  const { data, error } = await supabase
    .from("tasks")
    .update(payload)
    .eq("id", taskId)
    .eq("user_id", userId)
    .select("*")
    .single();

  if (error) throw error;
  return mapTaskFromDb(data);
}

export async function deleteTaskForUser(userId, taskId) {
  const { error } = await supabase
    .from("tasks")
    .delete()
    .eq("id", taskId)
    .eq("user_id", userId);

  if (error) throw error;
}

export async function moveTaskForUser(userId, taskId, status) {
  if (!VALID_STATUSES.includes(status)) {
    throw new Error("Estado de tarea invalido");
  }

  const { data, error } = await supabase
    .from("tasks")
    .update({ status })
    .eq("id", taskId)
    .eq("user_id", userId)
    .select("*")
    .single();

  if (error) throw error;
  return mapTaskFromDb(data);
}

export async function reorderTasksForUser(userId, orderedTasks) {
  if (!orderedTasks.length) return;

  const updates = orderedTasks.map((task, index) =>
    supabase
      .from("tasks")
      .update({ position: index, status: task.status })
      .eq("id", task.id)
      .eq("user_id", userId),
  );

  const results = await Promise.all(updates);
  const failed = results.find((result) => result.error);
  if (failed?.error) throw failed.error;
}
