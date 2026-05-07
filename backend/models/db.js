const sqlite3 = require('sqlite3').verbose();

const db = new sqlite3.Database('./database.db');

db.serialize(() => {
  // Users table
  db.run(`
    CREATE TABLE IF NOT EXISTS users (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      email TEXT UNIQUE,
      password TEXT,
      created_at DATETIME DEFAULT CURRENT_TIMESTAMP
    )
  `);

  // Workspaces table
  db.run(`
    CREATE TABLE IF NOT EXISTS workspaces (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      name TEXT NOT NULL,
      owner_id INTEGER NOT NULL,
      description TEXT,
      color TEXT DEFAULT '#3B82F6',
      created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
      FOREIGN KEY (owner_id) REFERENCES users(id) ON DELETE CASCADE
    )
  `);

  // Workspace members (for multi-user collaboration)
  db.run(`
    CREATE TABLE IF NOT EXISTS workspace_members (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      workspace_id INTEGER NOT NULL,
      user_id INTEGER NOT NULL,
      role TEXT DEFAULT 'member',
      joined_at DATETIME DEFAULT CURRENT_TIMESTAMP,
      FOREIGN KEY (workspace_id) REFERENCES workspaces(id) ON DELETE CASCADE,
      FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE CASCADE,
      UNIQUE(workspace_id, user_id)
    )
  `);

  // Unique workspace name per owner
  db.run(
    `CREATE UNIQUE INDEX IF NOT EXISTS idx_workspaces_owner_name ON workspaces(owner_id, name)`,
    (err) => {
      if (err) {
        if (err.message && err.message.includes('UNIQUE constraint failed')) {
          console.warn('Warning: duplicate workspace names detected for the same owner. Unique index could not be created.');
        } else {
          console.error('Error creating unique index idx_workspaces_owner_name:', err.message);
        }
      }
    }
  );

  // Enhanced tasks table
  db.run(`
    CREATE TABLE IF NOT EXISTS tasks (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      title TEXT NOT NULL,
      description TEXT,
      due_date TEXT,
      priority TEXT DEFAULT 'medium',
      status TEXT DEFAULT 'todo',
      completed INTEGER DEFAULT 0,
      user_id INTEGER NOT NULL,
      workspace_id INTEGER NOT NULL,
      created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
      updated_at DATETIME DEFAULT CURRENT_TIMESTAMP,
      FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE CASCADE,
      FOREIGN KEY (workspace_id) REFERENCES workspaces(id) ON DELETE CASCADE
    )
  `);

  // Task dependencies
  db.run(`
    CREATE TABLE IF NOT EXISTS task_dependencies (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      task_id INTEGER NOT NULL,
      depends_on_task_id INTEGER NOT NULL,
      created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
      FOREIGN KEY (task_id) REFERENCES tasks(id) ON DELETE CASCADE,
      FOREIGN KEY (depends_on_task_id) REFERENCES tasks(id) ON DELETE CASCADE,
      UNIQUE(task_id, depends_on_task_id)
    )
  `);

  // Task labels/tags
  db.run(`
    CREATE TABLE IF NOT EXISTS task_labels (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      task_id INTEGER NOT NULL,
      label TEXT NOT NULL,
      color TEXT DEFAULT '#gray',
      FOREIGN KEY (task_id) REFERENCES tasks(id) ON DELETE CASCADE
    )
  `);

  // Schema migrations
  const migrateTasksTable = () => {
    db.all(`PRAGMA table_info(tasks)`, (err, columns) => {
      if (err) return;
      const columnNames = columns.map(c => c.name);

      const newColumns = [
        { name: 'description', sql: 'ALTER TABLE tasks ADD COLUMN description TEXT' },
        { name: 'status', sql: 'ALTER TABLE tasks ADD COLUMN status TEXT DEFAULT \'todo\'' },
        { name: 'workspace_id', sql: 'ALTER TABLE tasks ADD COLUMN workspace_id INTEGER' },
        { name: 'updated_at', sql: 'ALTER TABLE tasks ADD COLUMN updated_at DATETIME' }
      ];

      newColumns.forEach(col => {
        if (!columnNames.includes(col.name)) {
          db.run(col.sql, (err) => {
            if (err) {
              console.error(`Migration error adding column ${col.name}:`, err.message);
            }
          });
        }
      });

      if (!columnNames.includes('updated_at')) {
        db.run(`UPDATE tasks SET updated_at = CURRENT_TIMESTAMP WHERE updated_at IS NULL`, (err) => {
          if (err) {
            console.error('Migration error updating updated_at:', err.message);
          }
        });
      }
    });
  };

  migrateTasksTable();
});

module.exports = db;