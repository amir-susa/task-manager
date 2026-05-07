const router = require('express').Router();
const task = require('../controllers/taskController');
const authMiddleware = require('../middleware/authMiddleware');

// Tasks CRUD
router.get('/', authMiddleware, task.getTasks);
router.post('/', authMiddleware, task.createTask);
router.put('/:id', authMiddleware, task.updateTask);
router.delete('/:id', authMiddleware, task.deleteTask);

// Dependencies
router.post('/dependencies/add', authMiddleware, task.addDependency);
router.post('/dependencies/remove', authMiddleware, task.removeDependency);
router.get('/:taskId/dependencies', authMiddleware, task.getDependencies);

// Workspaces
router.post('/workspaces', authMiddleware, task.createWorkspace);
router.get('/workspaces', authMiddleware, task.getWorkspaces);
router.put('/workspaces/:id', authMiddleware, task.updateWorkspace);
router.patch('/workspaces/:id', authMiddleware, task.updateWorkspace);
router.delete('/workspaces/:id', authMiddleware, task.deleteWorkspace);

// Aliases for incoming requests that may use singular path segments or PATCH
router.put('/workspace/:id', authMiddleware, task.updateWorkspace);
router.patch('/workspace/:id', authMiddleware, task.updateWorkspace);
router.delete('/workspace/:id', authMiddleware, task.deleteWorkspace);

module.exports = router;