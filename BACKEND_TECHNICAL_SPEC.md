# Task Manager - Backend Technical Specification
## MERN Stack Architecture & Data Schema

---

## 🏗️ System Architecture

```
┌─────────────────────────────────────────────────────────────────┐
│                     React Frontend (SPA)                        │
│              (Kanban Board, Command Palette, UI)                │
└────────────────────┬────────────────────────────────────────────┘
                     │ HTTP/REST API
┌────────────────────▼────────────────────────────────────────────┐
│                   Express.js Server (Node.js)                   │
│   ┌──────────────────────────────────────────────────────────┐  │
│   │  Routes  │  Controllers  │  Middleware  │  Auth Logic    │  │
│   └──────────────────────────────────────────────────────────┘  │
└────────────────────┬────────────────────────────────────────────┘
                     │ SQL Queries
┌────────────────────▼────────────────────────────────────────────┐
│               SQLite3 Database                                  │
│   (Tasks, Workspaces, Users, Dependencies, Labels)            │
└──────────────────────────────────────────────────────────────────┘
```

---

## 📦 Database Schema

### 1. Users Table
```sql
CREATE TABLE users (
  id INTEGER PRIMARY KEY AUTOINCREMENT,
  email TEXT UNIQUE NOT NULL,
  password TEXT NOT NULL,
  created_at DATETIME DEFAULT CURRENT_TIMESTAMP
);
```

**Purpose**: Authentication and user identification
**Constraints**: Email must be unique, password hashed (bcrypt)
**Indexes**: email (for login queries)

---

### 2. Workspaces Table
```sql
CREATE TABLE workspaces (
  id INTEGER PRIMARY KEY AUTOINCREMENT,
  name TEXT NOT NULL,
  owner_id INTEGER NOT NULL,
  description TEXT,
  color TEXT DEFAULT '#3B82F6',
  created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
  FOREIGN KEY (owner_id) REFERENCES users(id) ON DELETE CASCADE
);
```

**Purpose**: Organize tasks into logical groupings, enable multi-workspace support
**Features**:
- Color coding for visual differentiation
- Owner field for multi-user collaboration
- Soft delete capability via owner reference

---

### 3. Workspace Members Table
```sql
CREATE TABLE workspace_members (
  id INTEGER PRIMARY KEY AUTOINCREMENT,
  workspace_id INTEGER NOT NULL,
  user_id INTEGER NOT NULL,
  role TEXT DEFAULT 'member',
  joined_at DATETIME DEFAULT CURRENT_TIMESTAMP,
  FOREIGN KEY (workspace_id) REFERENCES workspaces(id) ON DELETE CASCADE,
  FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE CASCADE,
  UNIQUE(workspace_id, user_id)
);
```

**Purpose**: Enable multi-user collaboration and permission management
**Roles**: 'owner', 'admin', 'member', 'viewer'
**Unique Constraint**: Prevents duplicate memberships

---

### 4. Tasks Table (Enhanced)
```sql
CREATE TABLE tasks (
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
);
```

**Columns**:
| Name | Type | Purpose |
|------|------|---------|
| title | TEXT | Task name (required) |
| description | TEXT | Detailed task notes |
| due_date | TEXT | ISO 8601 format (YYYY-MM-DD) |
| priority | TEXT | Enum: 'high', 'medium', 'low' |
| status | TEXT | Enum: 'todo', 'in-progress', 'done' |
| completed | INTEGER | Boolean (1/0) for backward compat |
| user_id | INTEGER | Task owner |
| workspace_id | INTEGER | Associated workspace |

**Indexes**: 
- workspace_id (for filtering)
- user_id (for authorization)
- status (for Kanban grouping)
- due_date (for sorting/filtering)

---

### 5. Task Dependencies Table
```sql
CREATE TABLE task_dependencies (
  id INTEGER PRIMARY KEY AUTOINCREMENT,
  task_id INTEGER NOT NULL,
  depends_on_task_id INTEGER NOT NULL,
  created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
  FOREIGN KEY (task_id) REFERENCES tasks(id) ON DELETE CASCADE,
  FOREIGN KEY (depends_on_task_id) REFERENCES tasks(id) ON DELETE CASCADE,
  UNIQUE(task_id, depends_on_task_id)
);
```

**Purpose**: Define task blocking relationships and workflow dependencies
**Use Cases**:
- "Task A can't start until Task B is done"
- Create dependency graphs
- Prevent circular dependencies (application-level)

**Query Pattern**:
```sql
-- Find blocking tasks
SELECT * FROM tasks 
WHERE id IN (
  SELECT depends_on_task_id FROM task_dependencies 
  WHERE task_id = ?
)
```

---

### 6. Task Labels Table
```sql
CREATE TABLE task_labels (
  id INTEGER PRIMARY KEY AUTOINCREMENT,
  task_id INTEGER NOT NULL,
  label TEXT NOT NULL,
  color TEXT DEFAULT '#gray',
  FOREIGN KEY (task_id) REFERENCES tasks(id) ON DELETE CASCADE
);
```

**Purpose**: Flexible tagging system without requiring schema changes
**Color**: Hex code or Tailwind color name
**Example**: labels like 'bug', 'feature', 'urgent', 'backend'

---

## 🔌 API Endpoints

### Authentication Routes (`/api/auth`)
```
POST   /api/auth/register     - Create new user
POST   /api/auth/login        - User login (returns JWT)
POST   /api/auth/logout       - Invalidate token
GET    /api/auth/me           - Get current user info
```

### Tasks Routes (`/api/tasks`)

#### CRUD Operations
```
GET    /api/tasks             - List all user's tasks (with filters)
POST   /api/tasks             - Create new task
PUT    /api/tasks/:id         - Update task
DELETE /api/tasks/:id         - Delete task
```

#### Query Parameters
```
GET /api/tasks?
  workspace_id=1              - Filter by workspace
  search=query                - Full-text search
  status=todo                 - Filter by status
  priority=high               - Filter by priority
  due_date=2026-05-10        - Filter by due date
  groupBy=status              - Group results (status/priority)
  sort_by=created_at          - Sort field
  order=DESC                  - Sort order (ASC/DESC)
```

**Response Format**:
```json
{
  "data": [
    {
      "id": 1,
      "title": "Build Kanban board",
      "description": "Create React component...",
      "status": "in-progress",
      "priority": "high",
      "due_date": "2026-05-15",
      "completed": 0,
      "workspace_id": 1,
      "user_id": 1,
      "labels": ["frontend", "urgent"],
      "created_at": "2026-05-06T10:30:00Z",
      "updated_at": "2026-05-06T14:20:00Z"
    }
  ],
  "grouped": {
    "todo": [...],
    "in-progress": [...],
    "done": [...]
  },
  "count": 15
}
```

#### Dependencies
```
POST   /api/tasks/dependencies/add      - Create dependency
POST   /api/tasks/dependencies/remove   - Remove dependency
GET    /api/tasks/:taskId/dependencies  - List task's dependencies
```

#### Workspaces
```
POST   /api/tasks/workspaces           - Create workspace
GET    /api/tasks/workspaces           - List user's workspaces
PUT    /api/tasks/workspaces/:id       - Update workspace
DELETE /api/tasks/workspaces/:id       - Delete workspace
```

---

## 🔐 Authentication & Authorization

### Middleware Chain
```
1. authMiddleware         - Verify JWT token
   ├─ Extract user from token
   ├─ Attach to req.user
   └─ Return 401 if invalid

2. Authorization Check    - Verify resource ownership
   ├─ Check user_id matches
   ├─ Verify workspace membership
   └─ Return 403 if unauthorized
```

### JWT Token Structure
```json
{
  "id": 1,
  "email": "user@example.com",
  "iat": 1715000000,
  "exp": 1715086400
}
```

### Secure Queries (Always Include user_id)
```javascript
// ✅ SECURE - Prevents user accessing others' tasks
db.run(
  `UPDATE tasks SET status = ? WHERE id = ? AND user_id = ?`,
  [newStatus, taskId, userId]
);

// ❌ INSECURE - Any user could modify any task
db.run(
  `UPDATE tasks SET status = ? WHERE id = ?`,
  [newStatus, taskId]
);
```

---

## 📝 NLP Date Parsing

### Supported Formats
```javascript
// Relative dates
"today"           → Today's date
"tomorrow"        → Tomorrow's date
"next week"       → Date 7 days from now
"in 3 days"       → 3 days from today
"in 2 weeks"      → 14 days from today

// Day names
"Monday"          → Next Monday
"next Friday"     → Friday of next week

// ISO format
"2026-05-15"      → Direct ISO format (passthrough)
"05/15/2026"      → US date format (parsed)
```

### Implementation
```javascript
const { parseNaturalLanguageDate } = require('../utils/dateParser');

// Usage in task creation
const due_date = req.body.due_date;
const parsedDate = parseNaturalLanguageDate(due_date) || due_date;

// Result: "tomorrow" → "2026-05-07" (ISO format)
```

### Benefits
- Improved UX - Users type naturally
- Reduced errors - Consistent date format
- Enables voice/AI input
- Mobile-friendly interface

---

## 🚀 Performance Optimizations

### 1. Database Indexes
```sql
-- Frequently filtered columns
CREATE INDEX idx_tasks_workspace ON tasks(workspace_id);
CREATE INDEX idx_tasks_user ON tasks(user_id);
CREATE INDEX idx_tasks_status ON tasks(status);
CREATE INDEX idx_tasks_due_date ON tasks(due_date);

-- Foreign keys
CREATE INDEX idx_workspace_owner ON workspaces(owner_id);
CREATE INDEX idx_members_user ON workspace_members(user_id);
```

### 2. Query Optimization
```javascript
// Batch load related data
db.all(`
  SELECT t.*, GROUP_CONCAT(l.label) as labels 
  FROM tasks t
  LEFT JOIN task_labels l ON t.id = l.task_id
  WHERE t.user_id = ?
  GROUP BY t.id
`, [userId]);

// Pagination for large result sets
const offset = (page - 1) * limit;
query += ` LIMIT ? OFFSET ?`;
params.push(limit, offset);
```

### 3. Connection Pooling (Future Enhancement)
```javascript
// For high-traffic scenarios
const sqlite3 = require('sqlite3');
const db = new sqlite3.Database('./database.db');
db.configure('busyTimeout', 5000); // 5 second timeout
```

### 4. Caching Strategy
```javascript
// Client-side caching (optimistic updates)
// Update UI immediately, sync with server
setTasks(prev => 
  prev.map(t => t.id === taskId ? {...t, status: newStatus} : t)
);
// Then fetch from server to confirm
```

---

## 🛡️ Security Measures

### 1. Input Validation
```javascript
// Sanitize user inputs
if (!title || title.trim() === '') {
  return res.status(400).json({ error: 'Title required' });
}

// Type validation
const priority = ['high', 'medium', 'low'];
if (!priority.includes(req.body.priority)) {
  return res.status(400).json({ error: 'Invalid priority' });
}
```

### 2. SQL Injection Prevention
```javascript
// ✅ Use parameterized queries
db.run(
  `SELECT * FROM tasks WHERE id = ? AND user_id = ?`,
  [taskId, userId]
);

// ❌ Avoid string concatenation
const query = `SELECT * FROM tasks WHERE id = ${taskId}`;
```

### 3. Rate Limiting (Future)
```javascript
const rateLimit = require('express-rate-limit');
const limiter = rateLimit({
  windowMs: 15 * 60 * 1000,
  max: 100 // 100 requests per 15 minutes
});
app.use(limiter);
```

### 4. CORS Configuration
```javascript
app.use(cors({
  origin: process.env.FRONTEND_URL || 'http://localhost:3000',
  credentials: true
}));
```

---

## 📊 Data Relationships Diagram

```
┌─────────┐
│  Users  │
└────┬────┘
     │
     ├─────────────┬────────────────────────────┐
     │             │                            │
     ▼             ▼                            ▼
┌──────────────┐  ┌─────────────────┐    ┌──────────────────┐
│ Workspaces   │  │ Tasks           │    │ Workspace Members│
│ (owner_id)   │  │ (user_id)       │    │ (user_id)        │
└──────┬───────┘  └────┬────────────┘    └──────────────────┘
       │               │
       │       ┌───────┴────────┐
       │       │                │
       │       ▼                ▼
       │   ┌─────────────────┐  ┌──────────────────┐
       │   │ Task Dependencies
       │   │ (Links tasks)   │  │ Task Labels      │
       │   └─────────────────┘  │ (Flexible tags)  │
       │                        └──────────────────┘
       │
       └──────────────────────────────────────────
           (workspace_id linking)
```

---

## 🔄 Common API Workflows

### 1. Create Task with NLP Date
```javascript
POST /api/tasks
Body: {
  "title": "Review design mockups",
  "description": "Check the new dashboard UI",
  "due_date": "next friday",
  "priority": "high",
  "workspace_id": 1
}

Response:
{
  "id": 42,
  "title": "Review design mockups",
  "due_date": "2026-05-16",  // Parsed to ISO
  "status": "todo",
  "priority": "high",
  "created_at": "2026-05-06T..."
}
```

### 2. Filter Tasks by Status (Kanban)
```javascript
GET /api/tasks?workspace_id=1&groupBy=status

Response:
{
  "data": [...all tasks...],
  "grouped": {
    "todo": [task1, task2, ...],
    "in-progress": [task3, task4, ...],
    "done": [task5, task6, ...]
  }
}
```

### 3. Move Task Between Columns
```javascript
PUT /api/tasks/42
Body: {
  "status": "in-progress"
}

Response: {
  "id": 42,
  "status": "in-progress",
  "updated_at": "2026-05-06T15:30:00Z"
}
```

### 4. Create Task Dependency
```javascript
POST /api/tasks/dependencies/add
Body: {
  "taskId": 42,           // Design review
  "dependsOnTaskId": 41   // Mockups creation
}

// Task 42 can't be marked done until Task 41 is done
```

---

## 🚨 Error Handling

### Standard Error Responses
```javascript
// 400 Bad Request - Invalid input
{ error: "Title is required" }

// 401 Unauthorized - No/invalid token
{ error: "Invalid or expired token" }

// 403 Forbidden - User lacks permission
{ error: "Not authorized to access this resource" }

// 404 Not Found - Resource doesn't exist
{ error: "Task not found" }

// 500 Server Error
{ error: "Database error" }
```

---

## 📈 Future Enhancements

1. **Real-time Collaboration** (WebSockets)
   - Live task updates across users
   - Presence indicators

2. **Advanced Filtering**
   - Saved filter presets
   - Smart recommendations

3. **Analytics Dashboard**
   - Productivity metrics
   - Task completion trends

4. **Integration APIs**
   - Slack webhooks
   - Google Calendar sync
   - GitHub issue import

5. **Mobile API**
   - Optimized endpoints
   - Offline sync

---

## 🧪 Testing Strategy

### Unit Tests
```javascript
// Test date parser
test('parse "tomorrow" correctly', () => {
  const result = parseNaturalLanguageDate('tomorrow');
  expect(result).toMatch(/\d{4}-\d{2}-\d{2}/);
});
```

### Integration Tests
```javascript
// Test full task creation flow
test('create task with NLP date', async () => {
  const response = await request(app)
    .post('/api/tasks')
    .set('Authorization', 'Bearer ' + token)
    .send({title: 'Test', due_date: 'tomorrow'});
  expect(response.status).toBe(201);
  expect(response.body.due_date).toMatch(/\d{4}-\d{2}-\d{2}/);
});
```

---

**Document Version**: 1.0  
**Last Updated**: May 6, 2026  
**Backend Team**: Task Manager Development
