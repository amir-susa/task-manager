const db = require('../models/db');
const { parseNaturalLanguageDate } = require('../utils/dateParser');

// GET TASKS (with Kanban grouping support)
exports.getTasks = (req, res) => {
  const userId = req.user.id;
  const { 
    search, 
    status,
    priority, 
    due_date,
    workspace_id,
    groupBy = 'status',
    sort_by = 'created_at',
    order = 'DESC'
  } = req.query;

  let query = `SELECT t.*, GROUP_CONCAT(l.label) as labels FROM tasks t 
               LEFT JOIN task_labels l ON t.id = l.task_id
               WHERE t.user_id = ?`;
  let params = [userId];

  // Workspace filter
  if (workspace_id) {
    query += ` AND t.workspace_id = ?`;
    params.push(workspace_id);
  }

  // Search
  if (search) {
    query += ` AND (t.title LIKE ? OR t.description LIKE ?)`;
    params.push(`%${search}%`, `%${search}%`);
  }

  // Status filter (todo, in-progress, done)
  if (status) {
    query += ` AND t.status = ?`;
    params.push(status);
  }

  // Priority filter
  if (priority) {
    query += ` AND t.priority = ?`;
    params.push(priority);
  }

  // Due date filter
  if (due_date) {
    query += ` AND DATE(t.due_date) = DATE(?)`;
    params.push(due_date);
  }

  // Sorting
  const allowedSort = ['created_at', 'due_date', 'priority', 'title', 'status'];
  const safeSort = allowedSort.includes(sort_by) ? sort_by : 'created_at';
  const safeOrder = order.toUpperCase() === 'ASC' ? 'ASC' : 'DESC';

  query += ` GROUP BY t.id ORDER BY t.${safeSort} ${safeOrder}`;

  db.all(query, params, (err, rows) => {
    if (err) {
      console.error(err);
      return res.status(500).json({ error: 'Database error' });
    }

    // Convert labels from comma-separated string to array
    const tasks = rows.map(task => ({
      ...task,
      labels: task.labels ? task.labels.split(',') : []
    }));

    // Group by requested field for Kanban view
    let grouped = {};
    if (groupBy === 'status') {
      const statuses = ['todo', 'in-progress', 'done'];
      statuses.forEach(s => grouped[s] = []);
      tasks.forEach(t => {
        if (grouped[t.status] !== undefined) {
          grouped[t.status].push(t);
        }
      });
    } else if (groupBy === 'priority') {
      const priorities = ['high', 'medium', 'low'];
      priorities.forEach(p => grouped[p] = []);
      tasks.forEach(t => {
        if (grouped[t.priority] !== undefined) {
          grouped[t.priority].push(t);
        }
      });
    }

    res.json({
      data: tasks,
      grouped: groupBy ? grouped : null,
      count: tasks.length
    });
  });
};

exports.updateWorkspace = (req, res) => {
  const { id } = req.params;
  const { name, description, color } = req.body;
  const userId = req.user.id;

  if (!name || name.trim() === '') {
    return res.status(400).json({ error: 'Workspace name is required' });
  }

  db.get(
    `SELECT id FROM workspaces WHERE owner_id = ? AND name = ? AND id != ?`,
    [userId, name.trim(), id],
    (err, row) => {
      if (err) {
        return res.status(500).json({ error: 'Database error' });
      }
      if (row) {
        return res.status(400).json({ error: 'Workspace title already exists' });
      }

      db.run(
        `UPDATE workspaces SET name = ?, description = ?, color = ? WHERE id = ? AND owner_id = ?`,
        [name.trim(), description || null, color || '#3B82F6', id, userId],
        function (err) {
          if (err) {
            return res.status(500).json({ error: err.message });
          }
          if (this.changes === 0) {
            return res.status(403).json({ error: 'Not authorized or workspace not found' });
          }
          db.get(
            `SELECT * FROM workspaces WHERE id = ? AND owner_id = ?`,
            [id, userId],
            (err, row) => {
              if (err) {
                return res.status(500).json({ error: err.message });
              }
              res.json(row);
            }
          );
        }
      );
    }
  );
};

exports.deleteWorkspace = (req, res) => {
  const { id } = req.params;
  const userId = req.user.id;

  db.run(
    `DELETE FROM workspaces WHERE id = ? AND owner_id = ?`,
    [id, userId],
    function (err) {
      if (err) {
        return res.status(500).json({ error: err.message });
      }
      if (this.changes === 0) {
        return res.status(403).json({ error: 'Not authorized or workspace not found' });
      }
      res.json({ message: 'Workspace deleted' });
    }
  );
};

// CREATE TASK (with NLP date parsing)
exports.createTask = (req, res) => {
  const { title, description, due_date, priority, workspace_id, status = 'todo' } = req.body;
  const userId = req.user.id;

  if (!title || title.trim() === '') {
    return res.status(400).json({ error: 'Title is required' });
  }

  // Parse natural language dates
  let parsedDueDate = due_date;
  if (due_date) {
    parsedDueDate = parseNaturalLanguageDate(due_date) || due_date;
  }

  db.run(
    `INSERT INTO tasks (title, description, due_date, priority, status, user_id, workspace_id, created_at, updated_at) 
     VALUES (?, ?, ?, ?, ?, ?, ?, CURRENT_TIMESTAMP, CURRENT_TIMESTAMP)`,
    [title, description || null, parsedDueDate || null, priority || 'medium', status, userId, workspace_id || null],
    function (err) {
      if (err) {
        return res.status(500).json({ error: err.message });
      }

      db.get(
        `SELECT * FROM tasks WHERE id = ?`,
        [this.lastID],
        (err, row) => {
          if (err) {
            return res.status(500).json({ error: err.message });
          }
          res.status(201).json(row);
        }
      );
    }
  );
};

// UPDATE TASK (with NLP date parsing & new fields)
exports.updateTask = (req, res) => {
  const { id } = req.params;
  const { title, description, completed, status, due_date, priority } = req.body;
  const userId = req.user.id;

  const updates = ['updated_at = CURRENT_TIMESTAMP'];
  const params = [];

  if (title !== undefined) {
    updates.push('title = ?');
    params.push(title);
  }

  if (description !== undefined) {
    updates.push('description = ?');
    params.push(description);
  }

  if (completed !== undefined && completed !== null && completed !== '') {
    updates.push('completed = ?');
    params.push(completed);
  }

  if (status !== undefined) {
    updates.push('status = ?');
    params.push(status);
  }

  if (due_date !== undefined) {
    let parsedDate = due_date;
    if (due_date) {
      parsedDate = parseNaturalLanguageDate(due_date) || due_date;
    }
    updates.push('due_date = ?');
    params.push(parsedDate);
  }

  if (priority !== undefined) {
    updates.push('priority = ?');
    params.push(priority);
  }

  if (updates.length === 1) {
    return res.status(400).json({ error: 'No update fields provided' });
  }

  const query = `UPDATE tasks SET ${updates.join(', ')} WHERE id = ? AND user_id = ?`;
  params.push(id, userId);

  db.run(query, params, function (err) {
    if (err) {
      return res.status(500).json({ error: err.message });
    }

    if (this.changes === 0) {
      return res.status(403).json({ error: 'Not authorized or task not found' });
    }

    db.get(
      `SELECT * FROM tasks WHERE id = ? AND user_id = ?`,
      [id, userId],
      (err, row) => {
        if (err) {
          return res.status(500).json({ error: err.message });
        }
        res.json(row);
      }
    );
  });
};

// DELETE TASK
exports.deleteTask = (req, res) => {
  db.run(
    `DELETE FROM tasks WHERE id = ? AND user_id = ?`,
    [req.params.id, req.user.id],
    function (err) {
      if (err) {
        return res.status(500).json({ error: err.message });
      }
      if (this.changes === 0) {
        return res.status(403).json({ error: 'Not authorized' });
      }
      res.json({ message: 'Task deleted successfully' });
    }
  );
};

// ADD TASK DEPENDENCY
exports.addDependency = (req, res) => {
  const { taskId, dependsOnTaskId } = req.body;
  const userId = req.user.id;

  // Verify both tasks belong to user
  db.all(
    `SELECT id FROM tasks WHERE (id = ? OR id = ?) AND user_id = ?`,
    [taskId, dependsOnTaskId, userId],
    (err, rows) => {
      if (err || rows.length !== 2) {
        return res.status(403).json({ error: 'Tasks not found or not authorized' });
      }

      db.run(
        `INSERT OR IGNORE INTO task_dependencies (task_id, depends_on_task_id) VALUES (?, ?)`,
        [taskId, dependsOnTaskId],
        function (err) {
          if (err) {
            return res.status(500).json({ error: err.message });
          }
          res.status(201).json({ message: 'Dependency added' });
        }
      );
    }
  );
};

// REMOVE TASK DEPENDENCY
exports.removeDependency = (req, res) => {
  const { taskId, dependsOnTaskId } = req.body;

  db.run(
    `DELETE FROM task_dependencies WHERE task_id = ? AND depends_on_task_id = ?`,
    [taskId, dependsOnTaskId],
    function (err) {
      if (err) {
        return res.status(500).json({ error: err.message });
      }
      res.json({ message: 'Dependency removed' });
    }
  );
};

// GET TASK DEPENDENCIES
exports.getDependencies = (req, res) => {
  const { taskId } = req.params;
  const userId = req.user.id;

  db.all(
    `SELECT td.*, t.title as depends_on_title FROM task_dependencies td
     JOIN tasks t ON td.depends_on_task_id = t.id
     WHERE td.task_id = ? AND t.user_id = ?`,
    [taskId, userId],
    (err, rows) => {
      if (err) {
        return res.status(500).json({ error: err.message });
      }
      res.json({ dependencies: rows });
    }
  );
};

// CREATE WORKSPACE
exports.createWorkspace = (req, res) => {
  const { name, description, color } = req.body;
  const userId = req.user.id;

  if (!name || name.trim() === '') {
    return res.status(400).json({ error: 'Workspace name is required' });
  }

  const trimmedName = name.trim();

  db.get(
    `SELECT 1 FROM workspaces WHERE owner_id = ? AND name = ?`,
    [userId, trimmedName],
    (err, row) => {
      if (err) {
        return res.status(500).json({ error: err.message });
      }
      if (row) {
        return res.status(400).json({ error: 'Workspace title already exists' });
      }

      db.run(
        `INSERT INTO workspaces (name, description, color, owner_id, created_at) VALUES (?, ?, ?, ?, CURRENT_TIMESTAMP)`,
        [trimmedName, description || null, color || '#3B82F6', userId],
        function (err) {
          if (err) {
            if (err.code === 'SQLITE_CONSTRAINT' && err.message.includes('workspaces.owner_id, workspaces.name')) {
              return res.status(400).json({ error: 'Workspace title already exists' });
            }
            return res.status(500).json({ error: err.message });
          }

          const workspaceId = this.lastID;

          db.run(
            `INSERT INTO workspace_members (workspace_id, user_id, role) VALUES (?, ?, ?)`,
            [workspaceId, userId, 'owner'],
            (err) => {
              if (err) {
                return res.status(500).json({ error: err.message });
              }

              db.get(`SELECT * FROM workspaces WHERE id = ?`, [workspaceId], (err, row) => {
                if (err) {
                  return res.status(500).json({ error: err.message });
                }
                res.status(201).json(row);
              });
            }
          );
        }
      );
    }
  );
};

// GET USER WORKSPACES
exports.getWorkspaces = (req, res) => {
  const userId = req.user.id;

  db.all(
    `SELECT w.* FROM workspaces w
     JOIN workspace_members wm ON w.id = wm.workspace_id
     WHERE wm.user_id = ? ORDER BY w.created_at DESC`,
    [userId],
    (err, rows) => {
      if (err) {
        return res.status(500).json({ error: err.message });
      }
      res.json({ workspaces: rows });
    }
  );
};