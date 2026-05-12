// src/components/Kanban.js
import React, { useCallback, useEffect, useState, useRef } from "react";
import API from "../api";

// Icons as simple SVG components
const MenuIcon = () => <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 6h16M4 12h16M4 18h16" /></svg>;
const SearchIcon = () => <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" /></svg>;
const PlusIcon = () => <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4v16m8-8H4" /></svg>;
const SunIcon = () => <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 3v2m0 14v2m9-9h-2M5 12H3m15.364-6.364l-1.414 1.414M7.05 16.95l-1.414 1.414m12.728 0l-1.414-1.414M7.05 7.05L5.636 5.636M12 8a4 4 0 100 8 4 4 0 000-8z" /></svg>;
const MoonIcon = () => <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 12.79A9 9 0 1111.21 3a7 7 0 109.79 9.79z" /></svg>;

const KanbanBoard = ({ setUser, theme, setTheme }) => {
  const [sidebarOpen, setSidebarOpen] = useState(true);
  const [commandOpen, setCommandOpen] = useState(false);
  const [tasks, setTasks] = useState([]);
  const [workspaces, setWorkspaces] = useState([]);
  const [currentWorkspace, setCurrentWorkspace] = useState(null);
  const [searchQuery, setSearchQuery] = useState("");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const [draggedTask, setDraggedTask] = useState(null);
  const [userEmail, setUserEmail] = useState("");
  const [accountOpen, setAccountOpen] = useState(false);
  const [workspaceMenuOpen, setWorkspaceMenuOpen] = useState(null);
  const [taskTitle, setTaskTitle] = useState("");
  const [taskDueDate, setTaskDueDate] = useState("");
  const [taskPriority, setTaskPriority] = useState("medium");
  const [workspaceName, setWorkspaceName] = useState("");
  const [editingWorkspaceId, setEditingWorkspaceId] = useState(null);
  const [editingWorkspaceName, setEditingWorkspaceName] = useState("");
  const commandInputRef = useRef(null);
  const isDark = theme === 'dark';

  const kanbanColumns = {
    todo: { title: "📋 To Do", color: "from-slate-600 to-slate-700" },
    "in-progress": { title: "⚙️ In Progress", color: "from-blue-600 to-blue-700" },
    done: { title: "✅ Done", color: "from-emerald-600 to-emerald-700" },
  };

  const priorityColors = {
    high: "bg-red-500/20 text-red-400 border-red-500/50",
    medium: "bg-yellow-500/20 text-yellow-400 border-yellow-500/50",
    low: "bg-green-500/20 text-green-400 border-green-500/50",
  };

  const formatDate = (value) => {
    if (!value) return "";
    const date = new Date(value);
    return date.toLocaleDateString(undefined, {
      month: "short",
      day: "numeric",
      year: "numeric",
      hour: "2-digit",
      minute: "2-digit",
    });
  };

  const getTaskStateClasses = (task) => {
    if (task.completed) {
      return "bg-slate-800/60 border-slate-600/60";
    }
    if (task.due_date) {
      const due = new Date(task.due_date);
      const now = new Date();
      if (due < now) {
        return "bg-red-500/10 border-red-400/50";
      }
      const soon = new Date(now.getTime() + 24 * 60 * 60 * 1000);
      if (due <= soon) {
        return "bg-yellow-500/10 border-yellow-400/50";
      }
    }
    return "bg-slate-800/50 border-slate-700/50";
  };

  const getUserName = (email) => {
    if (!email) return "User";
    const rawName = email.split("@")[0];
    return rawName
      .replace(/[._]/g, " ")
      .split(" ")
      .map((part) => part.charAt(0).toUpperCase() + part.slice(1))
      .join(" ");
  };

  const decodeToken = (token) => {
    try {
      const payload = token.split('.')[1];
      const json = atob(payload.replace(/-/g, '+').replace(/_/g, '/'));
      return JSON.parse(json);
    } catch {
      return null;
    }
  };

  // Keyboard shortcuts
  useEffect(() => {
    const handleKeyPress = (e) => {
      if ((e.metaKey || e.ctrlKey) && e.key === "k") {
        e.preventDefault();
        setCommandOpen(!commandOpen);
        setTimeout(() => commandInputRef.current?.focus(), 0);
      }
      if (e.key === "Escape") {
        setCommandOpen(false);
      }
    };

    window.addEventListener("keydown", handleKeyPress);
    return () => window.removeEventListener("keydown", handleKeyPress);
  }, [commandOpen]);

  // Fetch tasks and workspaces
  const fetchData = useCallback(async () => {
    try {
      setLoading(true);
      setError("");

      // Fetch workspaces
      const wsRes = await API.get("/tasks/workspaces");
      const fetchedWorkspaces = wsRes.data.workspaces || [];
      setWorkspaces(fetchedWorkspaces);

      let activeWorkspace = currentWorkspace;
      if (!activeWorkspace && fetchedWorkspaces.length > 0) {
        activeWorkspace = fetchedWorkspaces[0];
        setCurrentWorkspace(activeWorkspace);
      }

      // Fetch tasks
      const params = {
        groupBy: "status",
        ...(searchQuery && { search: searchQuery }),
      };
      if (activeWorkspace?.id) {
        params.workspace_id = activeWorkspace.id;
      }
      const tasksRes = await API.get("/tasks", { params });
      setTasks(tasksRes.data.data || []);
    } catch (err) {
      console.error("ERROR:", err);
      setError("Failed to load data");
    } finally {
      setLoading(false);
    }
  }, [currentWorkspace, searchQuery]);

  useEffect(() => {
    fetchData();
  }, [fetchData]);

  useEffect(() => {
    const loadUser = async () => {
      try {
        const res = await API.get('/auth/me');
        setUserEmail(res.data.user?.email || '');
      } catch (err) {
        console.error('Failed to fetch user info', err);
        const token = localStorage.getItem('token');
        const decoded = token ? decodeToken(token) : null;
        setUserEmail(decoded?.email || '');
      }
    };

    loadUser();
  }, []);

  // Logout
  const logout = () => {
    localStorage.removeItem("token");
    setUser(false);
  };

  // Create new workspace
  const createWorkspace = async (name) => {
    try {
      const res = await API.post("/tasks/workspaces", { name, color: "#3B82F6" });
      setWorkspaces([...workspaces, res.data]);
      setCurrentWorkspace(res.data);
      setWorkspaceName("");
      setEditingWorkspaceId(null);
      setEditingWorkspaceName("");
      setError("");
      setCommandOpen(false);
    } catch (err) {
      setError(err.response?.data?.error || "Failed to create workspace");
    }
  };

  const updateWorkspace = async (workspaceId, name) => {
    try {
      const res = await API.put(`/tasks/workspaces/${workspaceId}`, { name });
      setWorkspaces(workspaces.map((ws) => (ws.id === workspaceId ? res.data : ws)));
      if (currentWorkspace?.id === workspaceId) {
        setCurrentWorkspace(res.data);
      }
      setWorkspaceName("");
      setEditingWorkspaceId(null);
      setEditingWorkspaceName("");
    } catch (err) {
      setError(err.response?.data?.error || "Failed to update workspace");
    }
  };

  const deleteWorkspace = async (workspaceId) => {
    try {
      await API.delete(`/tasks/workspaces/${workspaceId}`);
      const nextWorkspaces = workspaces.filter((ws) => ws.id !== workspaceId);
      setWorkspaces(nextWorkspaces);
      if (currentWorkspace?.id === workspaceId) {
        const nextWorkspace = nextWorkspaces[0] || null;
        setCurrentWorkspace(nextWorkspace);
        if (!nextWorkspace) {
          setTasks([]);
        }
      }
    } catch (err) {
      setError(err.response?.data?.error || "Failed to delete workspace");
    }
  };

  const saveWorkspace = async () => {
    const name = editingWorkspaceId ? editingWorkspaceName : workspaceName;
    if (!name || !name.trim()) {
      setError("Workspace title is required");
      return;
    }

    if (editingWorkspaceId) {
      await updateWorkspace(editingWorkspaceId, name.trim());
    } else {
      await createWorkspace(name.trim());
    }
  };

  const cancelEdit = () => {
    setEditingWorkspaceId(null);
    setEditingWorkspaceName("");
    setWorkspaceName("");
  };

  const toggleWorkspaceMenu = (workspaceId) => {
    setWorkspaceMenuOpen((prev) => (prev === workspaceId ? null : workspaceId));
  };

  const pinWorkspace = (workspaceId) => {
    setWorkspaces((prev) => {
      const updated = prev.map((ws) =>
        ws.id === workspaceId ? { ...ws, pinned: !ws.pinned } : ws
      );
      return [...updated].sort((a, b) => (b.pinned === true ? 1 : 0) - (a.pinned === true ? 1 : 0));
    });
    setWorkspaceMenuOpen(null);
  };

  // Create new task
  const createTask = async (title, due_date, priority) => {
    if (!title || !title.trim()) {
      setError("Task title cannot be empty");
      return;
    }

    if (!currentWorkspace) {
      setError("Please select or create a workspace before adding tasks.");
      return;
    }

    try {
      const res = await API.post("/tasks", {
        title: title.trim(),
        due_date: due_date || null,
        priority: priority || "medium",
        workspace_id: currentWorkspace.id,
        status: "todo",
      });
      setTasks([res.data, ...tasks]);
      setTaskTitle("");
      setTaskDueDate("");
      setTaskPriority("medium");
      setError("");
    } catch (err) {
      setError(err.response?.data?.error || "Failed to create task");
    }
  };

  // Update task status (Kanban drag)
  const updateTaskStatus = async (taskId, newStatus) => {
    try {
      await API.put(`/tasks/${taskId}`, { status: newStatus });
      setTasks(
        tasks.map((t) =>
          t.id === taskId ? { ...t, status: newStatus } : t
        )
      );
    } catch (err) {
      setError("Failed to update task");
    }
  };

  // Delete task
  const deleteTask = async (taskId) => {
    try {
      await API.delete(`/tasks/${taskId}`);
      setTasks(tasks.filter((t) => t.id !== taskId));
    } catch (err) {
      setError("Failed to delete task");
    }
  };

  // Toggle task completion
  const toggleTaskCompletion = async (task) => {
    try {
      const newStatus = task.status === "done" ? "todo" : "done";
      await API.put(`/tasks/${task.id}`, { status: newStatus, completed: newStatus === "done" ? 1 : 0 });
      setTasks(
        tasks.map((t) =>
          t.id === task.id ? { ...t, status: newStatus, completed: newStatus === "done" ? 1 : 0 } : t
        )
      );
    } catch (err) {
      setError("Failed to toggle task");
    }
  };

  // Group tasks by status
  const groupedTasks = {
    todo: tasks.filter((t) => t.status === "todo"),
    "in-progress": tasks.filter((t) => t.status === "in-progress"),
    done: tasks.filter((t) => t.status === "done"),
  };

  // Command palette handler
  const handleCommand = (input) => {
    if (input.startsWith("workspace:")) {
      createWorkspace(input.replace("workspace:", "").trim());
    } else {
      createTask(input);
    }
  };

  return (
    <div className={`flex min-h-screen overflow-hidden ${theme === 'dark' ? 'bg-gradient-to-br from-slate-950 via-slate-900 to-slate-950 text-slate-100' : 'bg-slate-100 text-slate-900'}`}>
      {/* SIDEBAR */}
      <div
        className={`${sidebarOpen ? "w-64" : "w-20"} backdrop-blur-xl transition-all duration-300 flex flex-col ${isDark ? 'bg-slate-900/50 border-r border-slate-700/50' : 'bg-white/80 border-r border-slate-200 shadow-sm'}`}
      >
        {/* Header */}
        <div className="p-4 border-b border-slate-700/30">
          <button
            onClick={() => setSidebarOpen(!sidebarOpen)}
            className="w-10 h-10 rounded-lg hover:bg-slate-800/50 flex items-center justify-center transition"
          >
            <MenuIcon />
          </button>
        </div>

        {/* Workspaces */}
        {sidebarOpen && (
          <div className="flex-1 overflow-y-auto p-3 space-y-2">
            <div className="text-xs font-bold text-slate-400 uppercase px-2 mb-3">Workspaces</div>
            <div className="space-y-2">
              {workspaces.map((ws) => (
                <div
                  key={ws.id}
                  className={`relative flex items-center justify-between gap-3 px-3 py-2 rounded-lg transition ${
                    currentWorkspace?.id === ws.id
                      ? "bg-gradient-to-r from-blue-500 to-blue-600 text-white"
                      : ws.pinned
                      ? "bg-slate-800/40 border border-slate-600/50 text-slate-100"
                      : "hover:bg-slate-800/50 text-slate-100"
                  }`}
                >
                  <button
                    onClick={() => setCurrentWorkspace(ws)}
                    className="text-left truncate flex-1"
                  >
                    <div className="flex items-center gap-2">
                      {ws.pinned && <span className="text-xs">📌</span>}
                      <span className="text-sm font-medium">{ws.name}</span>
                    </div>
                  </button>
                  <div className="relative">
                    <button
                      onClick={(e) => {
                        e.stopPropagation();
                        toggleWorkspaceMenu(ws.id);
                      }}
                      className="px-2 py-1 rounded-lg bg-slate-800/40 hover:bg-slate-700/60 transition text-xs"
                      aria-expanded={workspaceMenuOpen === ws.id}
                    >
                      ⋮
                    </button>

                    {workspaceMenuOpen === ws.id && (
                      <div className={`absolute right-0 top-full mt-2 w-40 overflow-hidden rounded-xl border ${isDark ? 'border-slate-700 bg-slate-900' : 'border-slate-200 bg-white'} shadow-2xl z-20`}>
                        <button
                          onClick={(e) => {
                            e.stopPropagation();
                            setEditingWorkspaceId(ws.id);
                            setEditingWorkspaceName(ws.name);
                            setWorkspaceName(ws.name);
                            setWorkspaceMenuOpen(null);
                          }}
                          className={`w-full text-left px-4 py-2 text-sm transition hover:${isDark ? 'bg-slate-800 text-white' : 'bg-slate-100 text-slate-900'}`}
                        >
                          Edit
                        </button>
                        <button
                          onClick={(e) => {
                            e.stopPropagation();
                            deleteWorkspace(ws.id);
                            setWorkspaceMenuOpen(null);
                          }}
                          className={`w-full text-left px-4 py-2 text-sm text-red-400 transition hover:${isDark ? 'bg-slate-800 text-red-200' : 'bg-slate-100 text-red-600'}`}
                        >
                          Delete
                        </button>
                        <button
                          onClick={(e) => {
                            e.stopPropagation();
                            pinWorkspace(ws.id);
                          }}
                          className={`w-full text-left px-4 py-2 text-sm transition hover:${isDark ? 'bg-slate-800 text-white' : 'bg-slate-100 text-slate-900'}`}
                        >
                          {ws.pinned ? 'Unpin' : 'Pin'}
                        </button>
                      </div>
                    )}
                  </div>
                </div>
              ))}
            </div>

            <div className={`mt-4 rounded-xl p-3 space-y-3 ${isDark ? 'bg-slate-800/40 border border-slate-700/40' : 'bg-white border border-slate-200'}`}>
              <div className={`text-xs font-semibold uppercase ${isDark ? 'text-slate-400' : 'text-slate-500'}`}>{editingWorkspaceId ? 'Edit workspace' : 'New workspace'}</div>
              <input
                value={editingWorkspaceId ? editingWorkspaceName : workspaceName}
                onChange={(e) => {
                  if (editingWorkspaceId) {
                    setEditingWorkspaceName(e.target.value);
                  } else {
                    setWorkspaceName(e.target.value);
                  }
                }}
                placeholder="Workspace title"
                className={`w-full px-3 py-2 rounded-lg border focus:outline-none focus:border-blue-500/50 transition ${isDark ? 'bg-slate-900/60 border-slate-700/50 text-slate-100 placeholder-slate-500' : 'bg-white border-slate-300 text-slate-900 placeholder-slate-500'}`}
              />
              <div className="flex gap-2">
                <button
                  onClick={saveWorkspace}
                  className="flex-1 px-3 py-2 rounded-lg bg-blue-500 text-white hover:bg-blue-600 transition text-sm"
                >
                  {editingWorkspaceId ? 'Save' : 'Create'}
                </button>
                {editingWorkspaceId && (
                  <button
                    onClick={cancelEdit}
                    className="flex-1 px-3 py-2 rounded-lg bg-slate-700/80 text-slate-100 hover:bg-slate-600 transition text-sm"
                  >
                    Cancel
                  </button>
                )}
              </div>
            </div>
          </div>
        )}

        {/* Footer */}
        <div className="p-3 border-t border-slate-700/30">
          <button
            onClick={logout}
            className="w-full px-3 py-2 bg-red-500/20 text-red-400 hover:bg-red-500/30 rounded-lg transition text-sm"
          >
            {sidebarOpen ? "Logout" : "🚪"}
          </button>
        </div>
      </div>

      {/* MAIN CONTENT */}
      <div className="flex-1 flex flex-col min-h-0 overflow-hidden">
        {/* TOP BAR */}
      <div className={`backdrop-blur-xl p-4 flex flex-col gap-4 ${isDark ? 'bg-slate-900/30 border-b border-slate-700/50' : 'bg-white/90 border-b border-slate-200'}`}>
        <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
          <div>
            <div className="text-sm uppercase tracking-[0.2em] text-sky-400">Amir Rahemeto</div>
            <div className={`text-2xl font-semibold ${isDark ? 'text-white' : 'text-slate-900'}`}>
              Amir's Task Manager
            </div>
          </div>
          <div className="flex flex-wrap items-center gap-3">
            <div className={`rounded-full px-3 py-1 text-sm font-medium ${isDark ? 'bg-slate-800/70 text-slate-100' : 'bg-slate-100 text-slate-700'}`}>
              Hi, {getUserName(userEmail)}
            </div>
            <button
              onClick={() => setTheme(theme === "dark" ? "light" : "dark")}
              title={theme === "dark" ? "Switch to light mode" : "Switch to dark mode"}
              className="p-3 rounded-lg bg-slate-800/50 text-slate-200 hover:bg-slate-700/60 border border-slate-700/50 transition flex items-center justify-center"
            >
              {theme === "dark" ? <SunIcon /> : <MoonIcon />}
            </button>
            <div className="relative">
              <button
                onClick={() => setAccountOpen(!accountOpen)}
                className="px-4 py-2 rounded-lg bg-slate-800/50 text-slate-200 hover:bg-slate-700/50 border border-slate-700/50 transition flex items-center gap-2"
              >
                <span>👤</span>
                {getUserName(userEmail)}
              </button>
              {accountOpen && (
                <div className={`absolute right-0 mt-2 w-72 rounded-xl p-4 shadow-2xl ${isDark ? 'bg-slate-900/95 border border-slate-700/60 text-slate-100' : 'bg-white border border-slate-200 text-slate-900'}`}>
                  <div className="text-sm font-semibold mb-2">Manage account</div>
                  <div className="text-xs text-slate-500 mb-1">Signed in as</div>
                  <div className="text-sm break-words mb-4">{userEmail || "Loading..."}</div>
                  <button
                    onClick={logout}
                    className="w-full px-3 py-2 rounded-lg bg-red-500 text-white text-sm hover:bg-red-600 transition"
                  >
                    Logout
                  </button>
                </div>
              )}
            </div>
          </div>
        </div>

        <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
          <div className="relative flex-1 max-w-md">
            <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none text-slate-400">
              <SearchIcon />
            </div>
            <input
              type="text"
              placeholder="Search tasks..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className={`w-full pl-10 pr-4 py-2 rounded-lg border focus:outline-none transition ${isDark ? 'bg-slate-800/50 border-slate-700/50 text-slate-100 placeholder-slate-500' : 'bg-white border-slate-300 text-slate-900 placeholder-slate-500'}`}
            />
            <div className="absolute right-3 top-1/2 transform -translate-y-1/2 text-xs text-slate-500">
              Ctrl+K
            </div>
          </div>
          <div className={`text-sm ${isDark ? 'text-slate-400' : 'text-slate-600'}`}>
            {tasks.length} tasks • {groupedTasks.done.length} done
          </div>
        </div>
      </div>

      <div className={`px-4 py-4 border-b ${isDark ? 'border-slate-700/30 bg-slate-900/20' : 'border-slate-200 bg-slate-50'}`}>
          <div className="flex flex-col gap-3 sm:flex-row sm:items-end">
            <input
              type="text"
              placeholder="New task title..."
              value={taskTitle}
              onChange={(e) => setTaskTitle(e.target.value)}
              className={`w-full px-4 py-2 rounded-lg border focus:outline-none transition ${isDark ? 'bg-slate-800/60 border-slate-700/60 text-slate-100 placeholder-slate-500' : 'bg-white border-slate-300 text-slate-900 placeholder-slate-500'}`}
            />
            <input
              type="date"
              value={taskDueDate}
              onChange={(e) => setTaskDueDate(e.target.value)}
              className={`px-4 py-2 rounded-lg border focus:outline-none transition ${isDark ? 'bg-slate-800/60 border-slate-700/60 text-slate-100' : 'bg-white border-slate-300 text-slate-900'}`}
            />
            <select
              value={taskPriority}
              onChange={(e) => setTaskPriority(e.target.value)}
              className={`px-4 py-2 rounded-lg border focus:outline-none transition ${isDark ? 'bg-slate-800/60 border-slate-700/60 text-slate-100' : 'bg-white border-slate-300 text-slate-900'}`}
            >
              <option value="high">High</option>
              <option value="medium">Medium</option>
              <option value="low">Low</option>
            </select>
            <button
              onClick={() => createTask(taskTitle, taskDueDate, taskPriority)}
              className="px-4 py-2 rounded-lg bg-blue-500 text-white hover:bg-blue-600 transition"
            >
              Add Task
            </button>
          </div>
          <div className="text-xs text-slate-400 mt-2">
            Task cards show creation timestamp and deadlines. Overdue tasks turn red, due soon tasks turn yellow.
          </div>
        </div>

        {/* ERROR BANNER */}
        {error && (
          <div className="bg-red-500/20 border border-red-500/50 text-red-300 px-4 py-3 mx-4 mt-4 rounded-lg flex justify-between items-center">
            <span>{error}</span>
            <button onClick={() => setError("")} className="text-red-400 hover:text-red-300">✕</button>
          </div>
        )}

        {/* KANBAN BOARD */}
        <div className="flex-1 overflow-x-auto overflow-y-hidden p-6">
          {loading ? (
            <div className="flex items-center justify-center h-full text-slate-400">
              <div className="text-center">
                <div className="animate-spin rounded-full h-12 w-12 border border-slate-700 border-t-blue-500 mx-auto mb-4"></div>
                Loading tasks...
              </div>
            </div>
          ) : (
            <div className="flex gap-6 h-full min-w-max">
              {Object.entries(kanbanColumns).map(([status, config]) => (
                <div
                  key={status}
                  className="flex-shrink-0 w-96 flex flex-col bg-gradient-to-b from-slate-800/30 to-slate-900/30 border border-slate-700/30 rounded-xl p-4 backdrop-blur-sm"
                >
                  {/* Column Header */}
                  <div className={`mb-4 pb-3 border-b border-slate-700/50`}>
                    <h3 className={`text-lg font-semibold bg-gradient-to-r ${config.color} bg-clip-text text-transparent`}>
                      {config.title}
                    </h3>
                    <div className="text-sm text-slate-400 mt-1">{groupedTasks[status].length} items</div>
                  </div>

                  {/* Tasks */}
                  <div
                    className="flex-1 overflow-y-auto space-y-3"
                    onDragOver={(e) => e.preventDefault()}
                    onDrop={(e) => {
                      e.preventDefault();
                      if (draggedTask) {
                        updateTaskStatus(draggedTask.id, status);
                        setDraggedTask(null);
                      }
                    }}
                  >
                    {groupedTasks[status].length === 0 ? (
                      <div className="text-slate-500 text-sm text-center py-8 opacity-50">
                        No tasks here yet
                      </div>
                    ) : (
                      groupedTasks[status].map((task) => (
                        <div
                          key={task.id}
                          draggable
                          onDragStart={() => setDraggedTask(task)}
                          className={`p-3 rounded-lg ${getTaskStateClasses(task)} hover:border-slate-500/50 cursor-move transition group`}
                        >
                          <div className="flex gap-2 items-start mb-2">
                            <input
                              type="checkbox"
                              checked={task.completed}
                              onChange={() => toggleTaskCompletion(task)}
                              className="w-4 h-4 mt-0.5 accent-green-500"
                            />
                            <div className="flex-1">
                              <p className={`text-sm font-medium ${task.completed ? "line-through text-slate-500" : ""}`}>
                                {task.title}
                              </p>
                              <div className="text-xs text-slate-400 mt-1 space-y-1">
                                {task.description && <p>{task.description}</p>}
                                <p>Created: {formatDate(task.created_at)}</p>
                              </div>
                            </div>
                            <button
                              onClick={() => deleteTask(task.id)}
                              className="opacity-0 group-hover:opacity-100 text-slate-500 hover:text-red-400 transition text-xs"
                            >
                              ✕
                            </button>
                          </div>

                          {/* Priority Badge */}
                          <div className="flex flex-wrap items-center justify-between gap-2 mt-3">
                            <span className={`text-xs px-2 py-1 rounded border ${priorityColors[task.priority] || priorityColors.medium}`}>
                              {task.priority}
                            </span>
                            <div className="text-right text-xs text-slate-400 space-y-1">
                              {task.due_date && <p>Due: {formatDate(task.due_date)}</p>}
                              <p>Status: {task.status}</p>
                            </div>
                          </div>
                        </div>
                      ))
                    )}
                  </div>

                  {/* Add Task Button */}
                  <button
                    onClick={() => setCommandOpen(true)}
                    className="mt-4 w-full py-2 px-3 rounded-lg border-2 border-dashed border-slate-700/50 hover:border-slate-600/50 text-slate-400 hover:text-slate-300 text-sm transition flex items-center justify-center gap-2"
                  >
                    <PlusIcon /> Add Task
                  </button>
                </div>
              ))}
            </div>
          )}
        </div>

        <footer className={`w-full border-t ${isDark ? 'border-slate-800 bg-slate-950/80 text-slate-400' : 'border-slate-200 bg-slate-50 text-slate-600'} px-6 py-6 mt-auto flex-shrink-0`}>
          <div className="max-w-7xl mx-auto flex flex-col gap-4 sm:flex-row sm:justify-between sm:items-start">
            <div className="space-y-2">
              <div className="text-base font-semibold">Amir's Task Manager</div>
              <p className="text-sm text-slate-400 max-w-lg">Professional task and workspace management with deadline alerts, polished user controls, and secure team workflows.</p>
            </div>
            <div className="grid gap-2 text-sm text-slate-400">
              <div>
                <span className="font-semibold text-slate-200">Email:</span>{' '}
                <a href="mailto:amiroimage@gmail.com" className="text-sky-400 hover:text-sky-300">amiroimage@gmail.com</a>
              </div>
              <div>
                <span className="font-semibold text-slate-200">Phone:</span>{' '}
                <a href="tel:+25192285252" className="text-sky-400 hover:text-sky-300">+251 922 85 25 25</a>
              </div>
              <div>
                <span className="font-semibold text-slate-200">GitHub:</span>{' '}
                <a href="https://github.com/amir-susa" target="_blank" rel="noreferrer" className="text-sky-400 hover:text-sky-300">github.com/amirrahemeto</a>
              </div>
            </div>
            <div className="text-sm text-slate-500 sm:text-right">
              © {new Date().getFullYear()} Amir Rahemeto. All rights reserved.
            </div>
          </div>
        </footer>
      </div>

      {/* COMMAND PALETTE */}
      {commandOpen && (
        <div className="fixed inset-0 bg-black/50 backdrop-blur-sm flex items-start justify-center pt-20 z-50">
          <div className="w-full max-w-md rounded-lg overflow-hidden shadow-2xl border border-slate-700/50">
            <div className="bg-gradient-to-b from-slate-800 to-slate-900 p-4">
              <input
                ref={commandInputRef}
                type="text"
                placeholder='Type to search or create. Use "workspace:" prefix to create workspace...'
                onKeyDown={(e) => {
                  if (e.key === "Enter") {
                    const input = e.target.value;
                    if (input) {
                      handleCommand(input);
                      e.target.value = "";
                    }
                  }
                }}
                autoFocus
                className="w-full bg-transparent outline-none text-slate-100 placeholder-slate-500"
              />
            </div>
            <div className="bg-slate-900 px-4 py-3 text-xs text-slate-400 border-t border-slate-700/50">
              Press <kbd className="px-2 py-1 bg-slate-800 rounded">Enter</kbd> to create •{" "}
              <kbd className="px-2 py-1 bg-slate-800 rounded">Esc</kbd> to close
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default KanbanBoard;
