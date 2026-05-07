# Task Manager - Implementation & Deployment Guide
## Complete Setup, Development, and Deployment Instructions

---

## 📋 Table of Contents
1. Project Structure
2. Local Development Setup
3. Database Initialization
4. Running the Application
5. API Usage Examples
6. Deployment Instructions
7. Troubleshooting
8. Contributing Guidelines

---

## 📁 Project Structure

```
task-manager/
├── frontend/                    # React SPA
│   ├── public/
│   │   ├── index.html
│   │   ├── manifest.json
│   │   └── robots.txt
│   ├── src/
│   │   ├── components/
│   │   │   ├── Auth.js         # Login/Register
│   │   │   ├── Login.js        # Login component
│   │   │   ├── Register.js     # Registration component
│   │   │   ├── Kanban.js       # Main Kanban board
│   │   │   └── Tasks.js        # Legacy task list (optional)
│   │   ├── api.js              # Axios configuration
│   │   ├── App.js              # Main app component
│   │   ├── App.css             # Global styles
│   │   ├── index.js            # React entry point
│   │   ├── index.css           # Base styles
│   │   └── setupTests.js       # Test configuration
│   ├── package.json
│   ├── tailwind.config.js      # Tailwind configuration
│   ├── postcss.config.js       # PostCSS configuration
│   └── README.md
│
├── backend/                     # Node.js Express API
│   ├── controllers/
│   │   ├── authController.js   # Auth logic
│   │   └── taskController.js   # Task CRUD + workspaces
│   ├── middleware/
│   │   └── authMiddleware.js   # JWT verification
│   ├── models/
│   │   └── db.js              # Database setup
│   ├── routes/
│   │   ├── authRoutes.js      # Auth endpoints
│   │   └── taskRoutes.js      # Task endpoints
│   ├── utils/
│   │   └── dateParser.js      # NLP date parsing
│   ├── server.js              # Express app
│   ├── package.json
│   ├── database.db            # SQLite database (generated)
│   └── .env                   # Environment variables
│
├── UI_UX_SPECIFICATION.md     # Design documentation
├── BACKEND_TECHNICAL_SPEC.md  # Backend architecture
├── README.md                  # Project overview
└── .gitignore
```

---

## 🚀 Local Development Setup

### Prerequisites
- Node.js 18+ (https://nodejs.org/)
- npm 8+ (comes with Node.js)
- Git
- A code editor (VS Code recommended)

### Step 1: Clone/Setup Project
```bash
cd task-manager

# Initialize git (if new)
git init

# Create .gitignore
echo "node_modules/" > .gitignore
echo "database.db" >> .gitignore
echo ".env" >> .gitignore
echo "*.log" >> .gitignore
```

### Step 2: Install Backend Dependencies
```bash
cd backend

npm install express cors sqlite3

# Optional: install dev dependencies
npm install --save-dev nodemon

# Create package.json scripts
```

**backend/package.json**:
```json
{
  "name": "task-manager-backend",
  "version": "1.0.0",
  "description": "Task Manager API",
  "main": "server.js",
  "scripts": {
    "start": "node server.js",
    "dev": "nodemon server.js"
  },
  "keywords": ["task", "kanban"],
  "author": "",
  "license": "ISC",
  "dependencies": {
    "express": "^4.18.2",
    "cors": "^2.8.5",
    "sqlite3": "^5.1.6"
  },
  "devDependencies": {
    "nodemon": "^3.0.1"
  }
}
```

### Step 3: Install Frontend Dependencies
```bash
cd ../frontend

npm install react react-dom axios
npm install -D tailwindcss postcss autoprefixer

# Initialize Tailwind
npx tailwindcss init -p
```

**frontend/tailwind.config.js**:
```javascript
module.exports = {
  content: [
    "./public/index.html",
    "./src/**/*.{js,jsx,ts,tsx}",
  ],
  theme: {
    extend: {
      colors: {
        'slate': {
          '950': '#030712',
        },
      },
    },
  },
  plugins: [],
}
```

**frontend/postcss.config.js**:
```javascript
module.exports = {
  plugins: {
    tailwindcss: {},
    autoprefixer: {},
  },
}
```

### Step 4: Environment Configuration
```bash
# backend/.env
PORT=5000
DATABASE_URL=./database.db
JWT_SECRET=your-secret-key-here-change-in-production
NODE_ENV=development
```

---

## 🗄️ Database Initialization

The database is automatically created when the backend server starts. The schema includes:

1. **users** - User accounts
2. **workspaces** - Task workspaces
3. **workspace_members** - Collaboration
4. **tasks** - Task items with enhanced fields
5. **task_dependencies** - Task relationships
6. **task_labels** - Flexible tagging

**Automatic Setup**: Run `node server.js` - tables are created if they don't exist.

**Manual Reset** (if needed):
```bash
# Delete database to recreate schema
rm database.db
node server.js
```

---

## ▶️ Running the Application

### Terminal 1: Backend Server
```bash
cd backend
npm run dev
# Output: Server running on 5000
```

### Terminal 2: Frontend Development Server
```bash
cd frontend
npm start
# Output: Compiled successfully!
# Opens http://localhost:3000 in browser
```

### Verify Both Running
```bash
# Test API connection
curl http://localhost:5000/api/auth/health

# Frontend should load at http://localhost:3000
```

---

## 📡 API Usage Examples

### 1. Authentication

#### Register New User
```bash
curl -X POST http://localhost:5000/api/auth/register \
  -H "Content-Type: application/json" \
  -d '{
    "email": "user@example.com",
    "password": "secure-password"
  }'

# Response:
# {"token": "eyJhbGciOiJIUzI1NiIs...", "user": {"id": 1, "email": "..."}}
```

#### Login
```bash
curl -X POST http://localhost:5000/api/auth/login \
  -H "Content-Type: application/json" \
  -d '{
    "email": "user@example.com",
    "password": "secure-password"
  }'
```

### 2. Workspace Management

#### Create Workspace
```bash
curl -X POST http://localhost:5000/api/tasks/workspaces \
  -H "Authorization: Bearer YOUR_TOKEN" \
  -H "Content-Type: application/json" \
  -d '{
    "name": "Q2 Projects",
    "description": "Second quarter initiatives",
    "color": "#3B82F6"
  }'
```

#### List User's Workspaces
```bash
curl http://localhost:5000/api/tasks/workspaces \
  -H "Authorization: Bearer YOUR_TOKEN"

# Response:
# {
#   "workspaces": [
#     {"id": 1, "name": "Q2 Projects", "color": "#3B82F6", ...}
#   ]
# }
```

### 3. Task Management

#### Create Task (with NLP date parsing)
```bash
curl -X POST http://localhost:5000/api/tasks \
  -H "Authorization: Bearer YOUR_TOKEN" \
  -H "Content-Type: application/json" \
  -d '{
    "title": "Design dashboard UI",
    "description": "Create Figma mockups for new dashboard",
    "due_date": "next friday",
    "priority": "high",
    "workspace_id": 1,
    "status": "todo"
  }'

# Response:
# {
#   "id": 42,
#   "title": "Design dashboard UI",
#   "due_date": "2026-05-16",  # Parsed from "next friday"
#   "status": "todo",
#   "priority": "high",
#   "created_at": "2026-05-06T10:30:00Z"
# }
```

#### Get Tasks (with Kanban grouping)
```bash
# Get all tasks grouped by status
curl "http://localhost:5000/api/tasks?workspace_id=1&groupBy=status" \
  -H "Authorization: Bearer YOUR_TOKEN"

# Filter by status
curl "http://localhost:5000/api/tasks?workspace_id=1&status=todo" \
  -H "Authorization: Bearer YOUR_TOKEN"

# Search tasks
curl "http://localhost:5000/api/tasks?workspace_id=1&search=dashboard" \
  -H "Authorization: Bearer YOUR_TOKEN"

# Response:
# {
#   "data": [...all tasks...],
#   "grouped": {
#     "todo": [task1, task2],
#     "in-progress": [task3],
#     "done": [task4, task5]
#   },
#   "count": 5
# }
```

#### Update Task Status (Kanban drag-drop)
```bash
curl -X PUT http://localhost:5000/api/tasks/42 \
  -H "Authorization: Bearer YOUR_TOKEN" \
  -H "Content-Type: application/json" \
  -d '{
    "status": "in-progress"
  }'
```

#### Mark Task Complete
```bash
curl -X PUT http://localhost:5000/api/tasks/42 \
  -H "Authorization: Bearer YOUR_TOKEN" \
  -H "Content-Type: application/json" \
  -d '{
    "status": "done",
    "completed": 1
  }'
```

#### Delete Task
```bash
curl -X DELETE http://localhost:5000/api/tasks/42 \
  -H "Authorization: Bearer YOUR_TOKEN"
```

### 4. Task Dependencies

#### Add Dependency
```bash
curl -X POST http://localhost:5000/api/tasks/dependencies/add \
  -H "Authorization: Bearer YOUR_TOKEN" \
  -H "Content-Type: application/json" \
  -d '{
    "taskId": 42,           # Design review task
    "dependsOnTaskId": 41   # Mockups creation task
  }'

# Task 42 now can't be completed until Task 41 is done
```

#### Get Task Dependencies
```bash
curl http://localhost:5000/api/tasks/42/dependencies \
  -H "Authorization: Bearer YOUR_TOKEN"

# Response:
# {
#   "dependencies": [
#     {"id": 1, "task_id": 42, "depends_on_task_id": 41, "depends_on_title": "Create mockups"}
#   ]
# }
```

---

## 🛠️ Development Workflow

### Adding a New Feature

#### 1. Backend API Endpoint
```javascript
// backend/controllers/taskController.js
exports.getTaskStats = (req, res) => {
  const userId = req.user.id;
  const { workspace_id } = req.query;

  db.all(`
    SELECT status, COUNT(*) as count
    FROM tasks
    WHERE user_id = ? AND workspace_id = ?
    GROUP BY status
  `, [userId, workspace_id], (err, rows) => {
    if (err) return res.status(500).json({ error: err.message });
    res.json({ stats: rows });
  });
};
```

#### 2. Add Route
```javascript
// backend/routes/taskRoutes.js
router.get('/stats', authMiddleware, task.getTaskStats);
```

#### 3. Frontend Component
```javascript
// frontend/src/components/Stats.js
import { useEffect, useState } from 'react';
import API from '../api';

export function TaskStats({ workspaceId }) {
  const [stats, setStats] = useState(null);

  useEffect(() => {
    API.get('/tasks/stats', { params: { workspace_id: workspaceId } })
      .then(res => setStats(res.data.stats));
  }, [workspaceId]);

  return (
    <div>
      {stats?.map(s => (
        <div key={s.status}>{s.status}: {s.count}</div>
      ))}
    </div>
  );
}
```

#### 4. Test
```bash
# Backend test
curl http://localhost:5000/api/tasks/stats?workspace_id=1 \
  -H "Authorization: Bearer TOKEN"

# Frontend component usage
// Add to Kanban.js
import { TaskStats } from './Stats';
<TaskStats workspaceId={currentWorkspace?.id} />
```

---

## 🚀 Deployment Instructions

### Prepare for Production

#### 1. Environment Setup
```bash
# backend/.env (production)
PORT=5000
DATABASE_URL=./database.db
JWT_SECRET=generate-secure-random-string-here
NODE_ENV=production
FRONTEND_URL=https://yourdomain.com
```

#### 2. Build Frontend
```bash
cd frontend
npm run build

# Output: Creates 'build' folder with optimized production build
```

#### 3. Serve Frontend from Backend
```javascript
// backend/server.js
const express = require('express');
const path = require('path');

app.use(express.static(path.join(__dirname, '../frontend/build')));

// Serve index.html for all routes (SPA)
app.get('*', (req, res) => {
  res.sendFile(path.join(__dirname, '../frontend/build/index.html'));
});
```

### Deploy to Heroku

#### 1. Create Heroku App
```bash
heroku login
heroku create your-app-name
```

#### 2. Push Code
```bash
git add .
git commit -m "Initial deployment"
git push heroku main
```

#### 3. Set Environment Variables
```bash
heroku config:set JWT_SECRET=your-secret-key
heroku config:set NODE_ENV=production
```

#### 4. Open App
```bash
heroku open
```

### Deploy to Vercel (Frontend) + Railway (Backend)

#### Frontend to Vercel
```bash
cd frontend
npm install -g vercel
vercel
# Follow prompts to deploy
```

#### Backend to Railway
```bash
cd backend
# Connect to Railway and deploy
# Set environment variables in Railway dashboard
```

---

## 🐛 Troubleshooting

### Issue: "Cannot find module 'express'"
```bash
# Solution: Install dependencies
cd backend
npm install
```

### Issue: "Database is locked"
```bash
# Solution: SQLite file is being accessed by multiple processes
# Restart both servers and delete database.db
rm database.db
npm run dev
```

### Issue: "CORS error in frontend"
```bash
# Solution: Ensure backend CORS is properly configured
// backend/server.js
app.use(cors({
  origin: 'http://localhost:3000',
  credentials: true
}));
```

### Issue: "Token expired/invalid"
```bash
# Solution: Logout and login again to refresh token
localStorage.removeItem('token');
window.location.reload();
```

### Issue: Frontend doesn't update in real-time
```bash
# Solution: Use refetch or websockets
// Temporary: Manual refetch every 30 seconds
setInterval(() => {
  fetchTasks();
}, 30000);
```

---

## 📊 Performance Monitoring

### Database Query Performance
```sql
-- Find slow queries
PRAGMA query_only = ON;
EXPLAIN QUERY PLAN 
SELECT * FROM tasks WHERE workspace_id = ? AND status = 'todo';
```

### Frontend Performance
```javascript
// Measure component render time
console.time('Kanban render');
// ... component renders ...
console.timeEnd('Kanban render');
```

### Monitor API Response Times
```javascript
// In Axios interceptor
API.interceptors.response.use(
  response => {
    console.log(`API response time: ${Date.now() - startTime}ms`);
    return response;
  }
);
```

---

## 👥 Contributing Guidelines

### Code Style
- Use ES6+ syntax
- Follow existing code patterns
- Add comments for complex logic
- Keep functions focused and small

### Commit Messages
```
feat: Add task dependency feature
fix: Resolve Kanban board scroll issue
style: Update dark mode color palette
refactor: Simplify date parsing logic
docs: Update API documentation
test: Add unit tests for dateParser
```

### Pull Request Process
1. Fork the repository
2. Create feature branch: `git checkout -b feature/my-feature`
3. Make changes and commit: `git commit -m "feat: Add feature"`
4. Push to branch: `git push origin feature/my-feature`
5. Open Pull Request with description

### Testing Before Submit
```bash
# Backend
npm run dev
curl http://localhost:5000/api/tasks (verify API works)

# Frontend
npm start
(verify no console errors)
```

---

## 📚 Additional Resources

- [Express.js Documentation](https://expressjs.com/)
- [React Documentation](https://react.dev/)
- [Tailwind CSS Documentation](https://tailwindcss.com/)
- [SQLite Documentation](https://www.sqlite.org/docs.html)
- [REST API Best Practices](https://restfulapi.net/)

---

## 📞 Support

For issues or questions:
1. Check the troubleshooting section
2. Review API documentation (BACKEND_TECHNICAL_SPEC.md)
3. Check UI/UX spec (UI_UX_SPECIFICATION.md)
4. Open an issue on GitHub

---

**Last Updated**: May 6, 2026  
**Version**: 1.0.0  
**Maintainers**: Task Manager Development Team
