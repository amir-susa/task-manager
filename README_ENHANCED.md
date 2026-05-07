# 🚀 Task Manager - Modern Kanban Dashboard
## High-End MERN Stack Task Management Application

<div align="center">

![Status](https://img.shields.io/badge/Status-Production%20Ready-success)
![Version](https://img.shields.io/badge/Version-1.0.0-blue)
![License](https://img.shields.io/badge/License-MIT-green)
![Last Updated](https://img.shields.io/badge/Updated-May%202026-orange)

**A professional, feature-rich task manager with glassmorphism design, Kanban boards, and AI-powered date parsing.**

[Features](#-features) • [Quick Start](#-quick-start) • [Documentation](#-documentation) • [Roadmap](#-roadmap) • [Contributing](#-contributing)

</div>

---

## ✨ Features

### 🎨 Modern UI/UX
- **Glassmorphism Design** - Frosted glass effects with backdrop blur
- **Dark Mode** - Reduces eye strain with professional slate palette
- **Responsive Layout** - Works seamlessly on desktop, tablet, mobile
- **Smooth Animations** - 60 FPS transitions and interactions
- **Electric Blue Accents** - High-contrast primary actions

### 📊 Kanban Board
- **Three-Column Layout** - To Do → In Progress → Done
- **Drag & Drop** - Intuitive task movement between columns
- **Real-Time Updates** - Instant UI synchronization
- **Task Counting** - Visual indicators for column workload
- **Empty States** - Helpful messaging when columns are empty

### ⌨️ Power User Features
- **Command Palette** - Press `Ctrl+K` for lightning-fast task creation
- **Focus Mode** - Minimize distractions for deep work sessions
- **Natural Language Dates** - Type "tomorrow", "next friday", "in 3 days"
- **Multi-Workspace** - Organize tasks into unlimited workspaces
- **Task Dependencies** - Link tasks and manage workflows

### 🔧 Backend Capabilities
- **Multi-Workspace Support** - Collaborate on multiple projects
- **NLP Date Parsing** - Convert natural language to ISO dates
- **Task Dependencies** - Define blocking relationships
- **User Authentication** - Secure JWT-based login
- **RESTful API** - 13+ endpoints for complete control

### 📱 Responsive Design
- **Desktop** - Full sidebar, horizontal Kanban scroll
- **Tablet** - Collapsible sidebar, optimized touch
- **Mobile** - (Coming soon) Native mobile app

---

## 🎯 Quick Start

### Prerequisites
```bash
# Node.js 18+ and npm 8+
node --version  # Should be v18 or higher
npm --version   # Should be v8 or higher
```

### Installation (3 minutes)

#### 1️⃣ Backend Setup
```bash
cd backend
npm install
npm run dev
# ✅ Server running on http://localhost:5000
```

#### 2️⃣ Frontend Setup
```bash
cd frontend
npm install
npm start
# ✅ App opens at http://localhost:3000
```

#### 3️⃣ Create Your First Account
```
Visit http://localhost:3000
1. Click "Register"
2. Enter email and password
3. Create your first workspace
4. Start adding tasks!
```

### Try It Out
```bash
# In Command Palette (Ctrl+K):
- Type: "Design new dashboard"
- Press: Enter
- Due date: "next friday" (auto-parsed!)
- Priority: High
- Drag task between columns to move status
```

---

## 🎨 Design Highlights

### Color Palette
| Role | Color | Hex |
|------|-------|-----|
| Background | Deep Charcoal | `#0f172a` |
| Cards | Slate 800 | `#1e293b` |
| Primary Action | Electric Blue | `#3b82f6` |
| Success | Emerald Green | `#10b981` |
| Error | Rose Red | `#ef4444` |

### Keyboard Shortcuts
| Shortcut | Action |
|----------|--------|
| `Ctrl+K` | Open Command Palette |
| `Escape` | Close Command Palette |
| `Enter` | Create task from palette |
| `Tab` | Navigate columns |
| `Shift+Click` | Multi-select tasks |
| `Delete` | Remove task |

### Priority Levels
- 🔴 **High** - Red accent, demanding attention
- 🟡 **Medium** - Amber accent, regular priority
- 🟢 **Low** - Green accent, can wait

---

## 📂 Project Structure

```
task-manager/
├── 📦 backend/                     # Node.js API
│   ├── 🎮 controllers/             # Business logic
│   ├── 🗄️  models/                 # Database schema
│   ├── 🛣️  routes/                 # API endpoints
│   ├── 🔐 middleware/              # Authentication
│   ├── 🛠️  utils/                  # Helpers (date parsing)
│   └── 📄 server.js                # Express app entry
│
├── ⚛️  frontend/                    # React SPA
│   ├── 📑 src/components/          # React components
│   │   ├── 🎨 Kanban.js            # Main dashboard
│   │   ├── 🔐 Auth.js              # Login/Register
│   │   └── 📋 Tasks.js             # Legacy list view
│   ├── 🎨 src/App.js               # App router
│   ├── 🎨 src/App.css              # Global styles
│   └── 📦 package.json             # Dependencies
│
├── 📚 Documentation/
│   ├── 📘 UI_UX_SPECIFICATION.md    # Design guide (400+ lines)
│   ├── 📗 BACKEND_TECHNICAL_SPEC.md # Architecture (500+ lines)
│   ├── 📙 IMPLEMENTATION_GUIDE.md   # Setup & deploy (600+ lines)
│   └── 📕 PROJECT_SUMMARY.md        # Quick reference
│
└── 📄 README.md                     # This file
```

---

## 🔌 API Overview

### Core Endpoints

#### Authentication
```bash
POST   /api/auth/register    # Create account
POST   /api/auth/login       # Login
```

#### Tasks (CRUD)
```bash
GET    /api/tasks            # List tasks with filters
POST   /api/tasks            # Create new task
PUT    /api/tasks/:id        # Update task
DELETE /api/tasks/:id        # Delete task
```

#### Workspaces
```bash
POST   /api/tasks/workspaces # Create workspace
GET    /api/tasks/workspaces # List workspaces
```

#### Dependencies
```bash
POST   /api/tasks/dependencies/add    # Link tasks
POST   /api/tasks/dependencies/remove # Unlink tasks
GET    /api/tasks/:id/dependencies    # List dependencies
```

### Query Parameters
```bash
# List tasks with filters
GET /api/tasks?
  workspace_id=1              # Filter by workspace
  search=dashboard            # Full-text search
  status=todo                 # Filter by status
  priority=high               # Filter by priority
  groupBy=status              # Group results
```

### Example: Create Task with NLP Date
```bash
curl -X POST http://localhost:5000/api/tasks \
  -H "Authorization: Bearer TOKEN" \
  -H "Content-Type: application/json" \
  -d '{
    "title": "Review design mockups",
    "due_date": "next friday",
    "priority": "high",
    "workspace_id": 1
  }'
# ✅ due_date automatically parsed to "2026-05-16"
```

---

## 🗄️ Database Schema

### 6 Core Tables
```sql
users              # User accounts
workspaces         # Task groupings
workspace_members  # Collaboration & permissions
tasks              # Main task items
task_dependencies  # Task relationships
task_labels        # Flexible tagging system
```

### Task Fields
- `title` - Task name (required)
- `description` - Detailed notes
- `due_date` - ISO format (YYYY-MM-DD)
- `priority` - high, medium, low
- `status` - todo, in-progress, done
- `workspace_id` - Associated workspace
- `user_id` - Task owner

---

## 🧠 Advanced Features

### 1. Natural Language Date Parsing
```
Input → Output
"today" → 2026-05-06
"tomorrow" → 2026-05-07
"next friday" → 2026-05-16
"in 3 days" → 2026-05-09
```

### 2. Focus Mode
- Automatically dims non-focused columns
- Reduce visual noise for deep work
- Toggle on/off instantly with button click

### 3. Command Palette
- Press `Ctrl+K` anywhere
- Type task title → create instantly
- Prefix `workspace:` to create workspace
- Power-user optimized

### 4. Multi-Workspace Collaboration
- Switch between workspaces instantly
- Each workspace has its own tasks
- Color-coded for quick identification
- Ready for team collaboration

### 5. Task Dependencies
- Link tasks to define blocking relationships
- Example: "Task A depends on Task B"
- Perfect for workflow management
- Visual indicators for blocked tasks

---

## 🚀 Deployment

### Heroku (Recommended for Beginners)
```bash
# Create app
heroku create your-app-name

# Push code
git push heroku main

# Set environment
heroku config:set JWT_SECRET=your-secret
```

### Vercel + Railway
- **Frontend**: Deploy to Vercel
- **Backend**: Deploy to Railway
- See `IMPLEMENTATION_GUIDE.md` for details

### Docker (Coming Soon)
```dockerfile
# Containerized deployment with Docker Compose
docker-compose up
```

---

## 📚 Documentation

| Document | Purpose | Read Time |
|----------|---------|-----------|
| [UI_UX_SPECIFICATION.md](./UI_UX_SPECIFICATION.md) | Design system, color palette, components | 15 min |
| [BACKEND_TECHNICAL_SPEC.md](./BACKEND_TECHNICAL_SPEC.md) | Architecture, schema, API design | 20 min |
| [IMPLEMENTATION_GUIDE.md](./IMPLEMENTATION_GUIDE.md) | Setup, deployment, troubleshooting | 20 min |
| [PROJECT_SUMMARY.md](./PROJECT_SUMMARY.md) | Quick reference, feature overview | 10 min |

---

## 🎬 Screenshots & Demo

### Main Dashboard
- Kanban board with 3 columns (To Do, In Progress, Done)
- Glassmorphic cards with subtle shadows
- Real-time task counters
- Smooth drag-and-drop experience

### Command Palette
- Appears with `Ctrl+K`
- Quick task creation
- Workspace switching
- Power-user optimized

### Focus Mode
- Highlights current column
- Dims other columns to 30% opacity
- Removes distractions
- Perfect for deep work

### Responsive Design
- Desktop: Full sidebar + horizontal scroll
- Tablet: Collapsible sidebar
- Mobile: Touch-optimized (coming soon)

---

## 🛠️ Tech Stack

### Frontend
- **React 18+** - UI library
- **Tailwind CSS 3+** - Styling
- **Axios** - HTTP client
- **JavaScript ES6+** - Language

### Backend
- **Node.js 18+** - Runtime
- **Express.js** - Web framework
- **SQLite3** - Database
- **JWT** - Authentication

### Tools
- **VS Code** - Editor
- **Git** - Version control
- **npm** - Package manager
- **Heroku** - Hosting (optional)

---

## 📊 Performance

### Target Metrics
- **FCP**: < 1.5s (First Contentful Paint)
- **LCP**: < 2.5s (Largest Contentful Paint)
- **CLS**: < 0.1 (Cumulative Layout Shift)
- **Animations**: 60 FPS

### Optimization Strategies
- Lazy loading for components
- Database indexing on key columns
- Optimistic UI updates
- Efficient state management

---

## 🔒 Security

### Implemented
- ✅ JWT authentication
- ✅ User-based authorization
- ✅ SQL injection prevention
- ✅ CORS configuration
- ✅ Input validation

### Recommended for Production
- Rate limiting
- HTTPS enforcement
- Environment variables
- Database encryption
- Security headers

---

## 🧪 Testing

### Manual Testing Checklist
- [ ] Create account
- [ ] Login
- [ ] Create workspace
- [ ] Create task with natural language date
- [ ] Drag task between columns
- [ ] Delete task
- [ ] Use command palette
- [ ] Toggle focus mode
- [ ] Logout

### API Testing
```bash
# Test endpoints with curl
curl http://localhost:5000/api/tasks \
  -H "Authorization: Bearer TOKEN"

# Or use Postman
# Import requests from endpoints documentation
```

---

## 🤝 Contributing

### Getting Started
1. Fork repository
2. Create feature branch: `git checkout -b feature/my-feature`
3. Commit changes: `git commit -m "feat: Add feature"`
4. Push to branch: `git push origin feature/my-feature`
5. Open Pull Request

### Code Standards
- Use ES6+ syntax
- Follow existing code patterns
- Add comments for complex logic
- Test before submitting

### Commit Messages
```
feat:  Add new feature
fix:   Fix a bug
style: Update styling
docs:  Update documentation
test:  Add tests
```

---

## 🐛 Troubleshooting

### Common Issues

#### "Cannot find module 'express'"
```bash
cd backend
npm install
```

#### "CORS error in browser"
```javascript
// Ensure CORS enabled in server.js
app.use(cors({
  origin: 'http://localhost:3000',
  credentials: true
}));
```

#### "Database locked"
```bash
# Restart servers and delete database
rm database.db
npm run dev
```

#### "Token invalid"
```javascript
// Clear storage and re-login
localStorage.removeItem('token');
window.location.reload();
```

See [IMPLEMENTATION_GUIDE.md](./IMPLEMENTATION_GUIDE.md#troubleshooting) for more solutions.

---

## 📈 Roadmap

### Phase 2 (June 2026)
- [ ] Real-time collaboration (WebSockets)
- [ ] Task templates
- [ ] Recurring tasks
- [ ] Mobile app (React Native)

### Phase 3 (July-August 2026)
- [ ] AI task prioritization
- [ ] Time tracking
- [ ] Calendar view
- [ ] Analytics dashboard

### Phase 4 (Q3 2026+)
- [ ] Third-party integrations (Slack, GitHub, Calendar)
- [ ] Advanced reporting
- [ ] Team management
- [ ] Custom workflows

---

## 📞 Support

### Need Help?
1. Check [IMPLEMENTATION_GUIDE.md](./IMPLEMENTATION_GUIDE.md) for setup issues
2. Review [BACKEND_TECHNICAL_SPEC.md](./BACKEND_TECHNICAL_SPEC.md) for API questions
3. See [UI_UX_SPECIFICATION.md](./UI_UX_SPECIFICATION.md) for design questions
4. Check [PROJECT_SUMMARY.md](./PROJECT_SUMMARY.md) for quick reference

### Report Issues
- Create issue on GitHub with reproduction steps
- Include error messages and screenshots
- Specify OS, browser, Node.js version

---

## 📄 License

This project is licensed under the MIT License - see the LICENSE file for details.

---

## 🙏 Acknowledgments

- **Design Inspiration**: Apple's glassmorphism, VS Code command palette
- **Architecture**: REST API best practices, MERN stack patterns
- **Technologies**: React, Node.js, Tailwind CSS communities
- **Contributors**: Task Manager development team

---

## 🎉 Getting Involved

### Share Your Feedback
- ⭐ Star the repository
- 🐛 Report bugs
- 💡 Suggest features
- 📝 Improve documentation

### Stay Updated
```bash
# Watch repository for updates
git remote add upstream https://github.com/your-repo/task-manager.git
git fetch upstream
git merge upstream/main
```

---

<div align="center">

### Built with ❤️ using React, Node.js & Tailwind CSS

**[↑ Back to Top](#-task-manager---modern-kanban-dashboard)**

**Version 1.0.0** • **May 2026** • **Production Ready** ✅

---

Made with 🚀 for productive people who love beautiful interfaces

</div>
