import { useCallback, useEffect, useState } from "react";
import API from "../api";

export default function Tasks() {
  const [tasks, setTasks] = useState([]);
  const [title, setTitle] = useState("");
  const [dueDate, setDueDate] = useState("");
  const [taskPriority, setTaskPriority] = useState("medium");

  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");

  const [search, setSearch] = useState("");
  const [priority, setPriority] = useState("");
  const [completed, setCompleted] = useState("");
  const [dueDateFilter, setDueDateFilter] = useState("");
  const [sortBy, setSortBy] = useState("due_date");
  const [sortOrder, setSortOrder] = useState("ASC");

  const [editingId, setEditingId] = useState(null);
  const [editText, setEditText] = useState("");
  const [editDueDate, setEditDueDate] = useState("");
  const [editPriority, setEditPriority] = useState("medium");

  const normalizeTask = (task) => ({
    ...task,
    completed: task.completed === 1 || task.completed === "1" ? 1 : 0,
  });

  const logout = () => {
    localStorage.removeItem("token");
    window.location.reload();
  };

  const fetchTasks = useCallback(async () => {
    try {
      setLoading(true);
      setError("");

      const params = { search, priority, sortBy, order: sortOrder };
      if (completed !== "") params.completed = completed;
      if (dueDateFilter) params.due_date = dueDateFilter;

      const res = await API.get("/tasks", { params });
      setTasks(
        Array.isArray(res.data.data)
          ? res.data.data.map(normalizeTask)
          : []
      );
    } catch (err) {
      console.log("ERROR:", err.response?.data || err.message);
      setError(err.response?.data?.error || "Operation failed");
    } finally {
      setLoading(false);
    }
  }, [search, priority, completed, dueDateFilter, sortBy, sortOrder]);

  const completedCount = tasks.filter((task) => task.completed).length;
  const pendingCount = tasks.length - completedCount;
  
  const addTask = async () => {
    if (!title.trim()) return;

    try {
      setLoading(true);
      setError("");

      const res = await API.post("/tasks", {
        title,
        due_date: dueDate || null,
        priority: taskPriority || "medium",
      });

      setTasks((prev) => [normalizeTask(res.data), ...prev]);
      setTitle("");
      setDueDate("");
      setTaskPriority("medium");
    } catch (err) {
      console.log("ERROR:", err.response?.data || err.message);
      setError(err.response?.data?.error || "Operation failed");
    } finally {
      setLoading(false);
    }
  };

  const deleteTask = async (id) => {
    try {
      setError("");
      await API.delete(`/tasks/${id}`);
      setTasks((prev) => prev.filter((task) => task.id !== id));
    } catch (err) {
      console.log("ERROR:", err.response?.data || err.message);
      setError(err.response?.data?.error || "Operation failed");
    }
  };

  const toggleComplete = async (task) => {
    try {
      setError("");
      await API.put(`/tasks/${task.id}`, {
        completed: task.completed ? 0 : 1,
      });
      await fetchTasks();
    } catch (err) {
      console.log("ERROR:", err.response?.data || err.message);
      setError(err.response?.data?.error || "Operation failed");
    }
  };

  const saveEdit = async (id) => {
    try {
      setError("");
      const payload = {
        title: editText,
        priority: editPriority,
      };

      payload.due_date = editDueDate === "" ? null : editDueDate;

      const res = await API.put(`/tasks/${id}`, payload);
      setTasks((prev) =>
        prev.map((item) =>
          item.id === id ? normalizeTask({ ...item, ...res.data }) : item
        )
      );
      setEditingId(null);
    } catch (err) {
      console.log("ERROR:", err.response?.data || err.message);
      setError(err.response?.data?.error || "Operation failed");
    }
  };

  useEffect(() => {
    fetchTasks();
  }, [fetchTasks]);

  return (
    <div className="max-w-xl mx-auto p-4">
      <h1 className="text-3xl font-bold mb-4 text-center">
        🚀 Task Manager
      </h1>

      {/* ERROR */}
      {error && (
        <div className="bg-red-100 text-red-700 p-2 mb-3 rounded">
          {error}
        </div>
      )}

      {/* ADD TASK */}
      <div className="flex flex-col gap-2 mb-4 sm:flex-row sm:items-end">
        <input
          className="border p-2 flex-1 rounded focus:outline-none focus:ring-2 focus:ring-blue-400"
          placeholder="New task..."
          value={title}
          onChange={(e) => setTitle(e.target.value)}
        />

        <input
          type="date"
          className="border p-2 rounded"
          value={dueDate}
          onChange={(e) => setDueDate(e.target.value)}
        />

        <select
          className="border p-2 rounded"
          value={taskPriority}
          onChange={(e) => setTaskPriority(e.target.value)}
        >
          <option value="high">High</option>
          <option value="medium">Medium</option>
          <option value="low">Low</option>
        </select>

        <button
          onClick={logout}
          className="bg-gray-800 text-white px-3 py-1 rounded"
        >
          Logout
        </button>
        <button
          onClick={addTask}
          className="bg-blue-500 hover:bg-blue-600 text-white px-4 rounded transition"
        >
          Add
        </button>
      </div>

      {/* FILTERS */}
      <div className="flex flex-col gap-2 mb-4 sm:flex-row">
        <input
          className="border p-2 flex-1 rounded"
          placeholder="Search..."
          value={search}
          onChange={(e) => setSearch(e.target.value)}
        />

        <input
          type="date"
          className="border p-2 rounded"
          value={dueDateFilter}
          onChange={(e) => setDueDateFilter(e.target.value)}
        />

        <select
          className="border p-2 rounded"
          value={priority}
          onChange={(e) => setPriority(e.target.value)}
        >
          <option value="">Priority</option>
          <option value="high">High</option>
          <option value="medium">Medium</option>
          <option value="low">Low</option>
        </select>

        <select
          className="border p-2 rounded"
          value={completed}
          onChange={(e) => setCompleted(e.target.value)}
        >
          <option value="">Status</option>
          <option value="1">Done</option>
          <option value="0">Pending</option>
        </select>
      </div>

      <div className="flex flex-col gap-2 mb-4 sm:flex-row sm:items-center">
        <select
          className="border p-2 rounded"
          value={sortBy}
          onChange={(e) => setSortBy(e.target.value)}
        >
          <option value="due_date">Sort by due date</option>
          <option value="priority">Sort by priority</option>
          <option value="title">Sort by title</option>
          <option value="completed">Sort by status</option>
        </select>

        <select
          className="border p-2 rounded"
          value={sortOrder}
          onChange={(e) => setSortOrder(e.target.value)}
        >
          <option value="ASC">Ascending</option>
          <option value="DESC">Descending</option>
        </select>

        <button
          onClick={() => {
            setSearch("");
            setPriority("");
            setCompleted("");
            setDueDateFilter("");
          }}
          className="bg-gray-200 text-gray-700 px-3 py-2 rounded"
        >
          Clear filters
        </button>
      </div>

      <div className="flex flex-col gap-2 mb-4 sm:flex-row sm:justify-between sm:items-center">
        <div className="text-sm text-gray-600">
          {tasks.length} tasks • {completedCount} completed • {pendingCount} pending
        </div>
        <div className="text-sm text-gray-600">
          {sortBy === "due_date" && "Sorted by due date"}
          {sortBy === "priority" && "Sorted by priority"}
          {sortBy === "title" && "Sorted by title"}
          {sortBy === "completed" && "Sorted by status"}
        </div>
      </div>

      {/* LOADING */}
      {loading && (
        <div className="text-center text-gray-500 animate-pulse">
          Loading tasks...
        </div>
      )}

      {/* TASK LIST */}
      <div className="space-y-3">
        {tasks.map((task) => (
          <div
            key={task.id}
            className="p-4 border rounded shadow hover:shadow-lg transition duration-300 flex justify-between items-center"
          >
            <div className="flex-1">
              {editingId === task.id ? (
                <div className="space-y-2">
                  <input
                    className="border p-1 w-full"
                    value={editText}
                    onChange={(e) => setEditText(e.target.value)}
                  />
                  <div className="flex gap-2">
                    <input
                      type="date"
                      className="border p-1 rounded flex-1"
                      value={editDueDate}
                      onChange={(e) => setEditDueDate(e.target.value)}
                    />
                    <select
                      className="border p-1 rounded"
                      value={editPriority}
                      onChange={(e) => setEditPriority(e.target.value)}
                    >
                      <option value="high">High</option>
                      <option value="medium">Medium</option>
                      <option value="low">Low</option>
                    </select>
                  </div>
                </div>
              ) : (
                <>
                  <h3
                    className={`font-semibold ${
                      task.completed ? "line-through text-gray-400" : ""
                    }`}
                  >
                    {task.title}
                  </h3>
                  <p className="text-sm text-gray-500">
                    📅 {task.due_date ? new Date(task.due_date).toLocaleDateString("en-GB", { dateStyle: "medium" }) : "No date"} | ⚠️ {task.priority} <br />
                    🕒 {task.created_at ? new Date(task.created_at).toLocaleString("en-GB", { dateStyle: "medium", timeStyle: "short" }) : "No time"}
                  </p>
                </>
              )}

            </div>

            <div className="flex gap-2">
              {editingId === task.id ? (
                <button
                  onClick={() => saveEdit(task.id)}
                  className="bg-green-500 text-white px-2 rounded"
                >
                  Save
                </button>
              ) : (
                <button
                  onClick={() => {
                    setEditingId(task.id);
                    setEditText(task.title);
                    setEditDueDate(task.due_date || "");
                    setEditPriority(task.priority || "medium");
                  }}
                  className="bg-yellow-400 px-2 rounded"
                >
                  Edit
                </button>
              )}

              <button
                onClick={() => toggleComplete(task)}
                className="bg-blue-400 text-white px-2 rounded"
              >
                {task.completed ? "Undo" : "Done"}
              </button>

              <button
                onClick={() => deleteTask(task.id)}
                className="bg-red-500 text-white px-2 rounded"
              >
                X
              </button>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}