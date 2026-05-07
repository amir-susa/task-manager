# Task Manager - UI/UX Specification
## High-End Dashboard Design Document

### 📋 Project Overview
A professional, high-density task manager dashboard built with React, Tailwind CSS, and modern design principles. Features glassmorphism styling, dark mode, Kanban board visualization, and advanced productivity features.

---

## 🎨 Design Philosophy

### Core Principles
1. **Minimalism** - Clean, uncluttered interface with purposeful whitespace
2. **Glassmorphism** - Frosted glass effect with backdrop blur for depth
3. **Dark Mode** - Deep charcoal (#0f172a) base with slate accents for reduced eye strain
4. **High Contrast** - Electric blue and emerald accents for clarity and visual hierarchy
5. **Responsiveness** - Seamless experience from desktop to mobile
6. **Performance** - Smooth animations, instant feedback, optimistic UI updates

---

## 🎭 Color Palette

### Primary Colors
| Name | Hex | Usage |
|------|-----|-------|
| Deep Charcoal | `#0f172a` | Background, base layer |
| Slate 900 | `#0f172a` | Cards, containers |
| Slate 800 | `#1e293b` | Secondary backgrounds |
| Slate 700 | `#334155` | Borders, dividers |

### Accent Colors
| Name | Hex | Usage |
|------|-----|-------|
| Electric Blue | `#3b82f6` | Primary actions, focus states |
| Emerald Green | `#10b981` | Success, completion states |
| Amber Yellow | `#f59e0b` | Warnings, medium priority |
| Rose Red | `#ef4444` | Errors, high priority |

### Text Colors
| Name | Hex | Usage |
|------|-----|-------|
| Slate 100 | `#f1f5f9` | Primary text |
| Slate 400 | `#cbd5e1` | Secondary text |
| Slate 500 | `#64748b` | Tertiary text, disabled |

---

## 🏗️ Layout Architecture

### 1. Sidebar (Left Navigation)
- **Width**: 256px (expanded) / 80px (collapsed)
- **Features**:
  - Collapsible menu button for focus
  - Workspace selector with color coding
  - Create new workspace quick action
  - Logout button
  - Smooth slide animation on collapse/expand

### 2. Top Navigation Bar
- **Height**: 72px
- **Features**:
  - Search bar with Ctrl+K shortcut indication
  - Live task counter (total / completed)
  - Focus Mode toggle button
  - New Task quick action button
  - Glassmorphic background with blur effect

### 3. Kanban Board (Main Content)
- **Layout**: Horizontal scrollable columns
- **Columns**: 
  - 📋 To Do (Slate)
  - ⚙️ In Progress (Blue)
  - ✅ Done (Emerald)
- **Width per column**: 384px (w-96 in Tailwind)
- **Features**:
  - Drag-and-drop task movement
  - Task count per column
  - Empty state messaging
  - Add task button at column bottom

---

## 🎯 Component Specifications

### Task Card
```
┌─────────────────────────────┐
│ ☑ Task Title               │ ✕
│ Subtitle/Description       │
│                             │
│ [Priority Badge] DD/MM/YY │
└─────────────────────────────┘
```
- **Height**: 120px (auto-expand with description)
- **Spacing**: 12px padding, 12px gap between cards
- **States**:
  - Normal: `bg-slate-800/50 border-slate-700/50`
  - Hover: `border-slate-600/50 shadow-lg`
  - Completed: `line-through text-slate-500`
  - Dragging: `opacity-50`

### Priority Badge
- **High**: Red (`bg-red-500/20 text-red-400 border-red-500/50`)
- **Medium**: Amber (`bg-yellow-500/20 text-yellow-400 border-yellow-500/50`)
- **Low**: Green (`bg-green-500/20 text-green-400 border-green-500/50`)
- **Style**: Rounded, small font, semi-transparent background with colored border

### Command Palette
- **Trigger**: `Ctrl+K` (Windows/Linux) or `Cmd+K` (Mac)
- **Appearance**: Modal overlay with dark backdrop blur
- **Position**: Centered, top 20% of viewport
- **Features**:
  - Real-time search/filtering
  - Keyboard navigation (↑/↓/Enter)
  - "workspace:" prefix for workspace creation
  - Quick hints for power users

### Focus Mode
- **Trigger**: Button in top-right corner or keyboard shortcut
- **Effect**: Dim non-focused columns to 30% opacity
- **Use Case**: Deep work sessions, reducing visual distractions
- **Toggle**: Instant activation/deactivation

---

## 🎬 Animations & Interactions

### Transitions
```css
transition: all 0.3s cubic-bezier(0.4, 0, 0.2, 1);
```

### Key Animations
1. **Sidebar Collapse**: 300ms smooth width transition
2. **Card Hover**: -2px Y-axis lift + shadow increase
3. **Command Palette**: Fade-in + scale-up (backdrop blur)
4. **Drag & Drop**: Visual feedback with opacity change
5. **Task Completion**: Immediate UI update + strikethrough

### Micro-interactions
- Hover effects on interactive elements
- Loading spinners for async operations
- Toast notifications for errors/success
- Smooth scroll behavior

---

## ⌨️ Keyboard Shortcuts

| Shortcut | Action |
|----------|--------|
| `Ctrl+K` / `Cmd+K` | Open Command Palette |
| `Escape` | Close Command Palette |
| `Enter` | Create task/workspace from palette |
| `Tab` | Navigate between columns |
| `Shift+Click` | Multi-select tasks |
| `Delete` | Remove task (with confirmation) |

---

## 📱 Responsive Breakpoints

### Desktop (1024px+)
- Full sidebar visible
- All columns displayed horizontally
- Hover effects active

### Tablet (768px - 1023px)
- Collapsible sidebar default
- Horizontal scroll for Kanban
- Touch-friendly spacing

### Mobile (< 768px)
- Sidebar hidden by default
- Kanban in vertical scroll or tab view
- Larger touch targets (min 44px)
- Simplified top navigation

---

## 🔧 Technical Implementation

### Frontend Stack
- **Framework**: React 18+
- **Styling**: Tailwind CSS 3+
- **Icons**: Inline SVG components
- **State Management**: React Hooks (useState, useCallback, useRef)
- **HTTP**: Axios API client

### Backend Stack
- **Runtime**: Node.js
- **Framework**: Express
- **Database**: SQLite3
- **Features**: NLP date parsing, Multi-workspace support

### Performance Targets
- **FCP** (First Contentful Paint): < 1.5s
- **LCP** (Largest Contentful Paint): < 2.5s
- **CLS** (Cumulative Layout Shift): < 0.1
- **Animations**: 60 FPS maintained

---

## 🚀 Feature Specifications

### 1. Multi-Workspace Support
- Create, switch, and manage multiple workspaces
- Each workspace isolated with own tasks and members
- Workspace color coding for quick visual identification
- Invite members to collaborate

### 2. Kanban Board
- Three-column layout (To Do, In Progress, Done)
- Drag-and-drop task movement between columns
- Task count per column
- Automatic status synchronization

### 3. Advanced Search
- Full-text search across title and description
- Filter by status, priority, due date
- Real-time results as user types
- Saved search filters

### 4. Command Palette
- Quick task creation with keyboard
- Natural language date parsing ("tomorrow", "next week")
- Workspace creation prefix support
- Power-user optimized

### 5. Focus Mode
- Highlight single workspace/column
- Dim other elements
- Reduce visual clutter
- Quick toggle on/off

### 6. Task Dependencies
- Link tasks for workflow management
- Visual indicators for blocking tasks
- Automatic status constraints

### 7. Natural Language Processing
- Parse dates: "tomorrow", "next week", "in 3 days"
- Convert to ISO format automatically
- Improve user experience with smart defaults

---

## 📊 Data Model

```
Task {
  id: integer
  title: string (required)
  description: string
  status: enum ['todo', 'in-progress', 'done']
  priority: enum ['high', 'medium', 'low']
  due_date: ISO 8601 date
  completed: boolean
  workspace_id: integer (FK)
  user_id: integer (FK)
  labels: string[]
  dependencies: integer[] (task IDs)
  created_at: timestamp
  updated_at: timestamp
}

Workspace {
  id: integer
  name: string
  description: string
  color: hex color code
  owner_id: integer (FK)
  members: user[]
  created_at: timestamp
}
```

---

## ✨ Accessibility Standards

- **WCAG 2.1 Level AA** compliance target
- Color contrast ratio ≥ 4.5:1 for text
- Keyboard navigation support
- Semantic HTML structure
- ARIA labels for interactive elements
- Focus indicators visible at all times
- Alt text for all images
- Reduced motion support for animations

---

## 🎓 Design Inspiration

- **Glassmorphism**: Apple's latest UI design language
- **Dark Mode**: Reduces eye strain, modern aesthetic
- **Kanban Board**: Proven productivity methodology
- **Command Palette**: VS Code, Figma efficiency patterns
- **Minimalism**: Dieter Rams' "Good Design" principles

---

## 📸 Visual Examples

### Color in Context
- **Deep Charcoal**: Primary background ensures content contrast
- **Slate 800**: Cards pop with slight elevation
- **Electric Blue**: CTA buttons draw attention appropriately
- **Emerald Green**: Successful task completion feels rewarding
- **Rose Red**: Errors communicate urgently but not aggressively

### Typography Hierarchy
1. **Headers** (24px, bold): Column titles
2. **Body** (16px, regular): Task titles
3. **Secondary** (14px, regular): Descriptions
4. **Tertiary** (12px, regular): Metadata (dates, priority)
5. **Captions** (11px, medium): Labels, hints

---

## 🔮 Future Enhancements

1. **Time Tracking**: Pomodoro timer integration
2. **Analytics**: Productivity dashboard with charts
3. **AI Assistant**: Smart task prioritization
4. **Mobile App**: React Native version
5. **Calendar View**: Timeline visualization
6. **Notifications**: Real-time alerts for due tasks
7. **Integrations**: Slack, Calendar, email connectors
8. **Offline Mode**: Progressive Web App support

---

## 📝 Notes for Developers

- Use Tailwind's arbitrary values for fine-tuning gradients
- Leverage CSS Grid for complex layouts
- Implement virtual scrolling for 1000+ tasks
- Consider Web Workers for heavy computations
- Monitor bundle size to maintain performance
- Test across browsers (Chrome, Firefox, Safari, Edge)
- Ensure touch targets minimum 44x44px for mobile

---

**Document Version**: 1.0  
**Last Updated**: May 6, 2026  
**Design Lead**: Task Manager Team
