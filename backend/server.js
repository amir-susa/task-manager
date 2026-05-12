const express = require('express');
const cors = require('cors');

const app = express();

// Use dynamic port for Render, fallback to 5000 for local dev
const PORT = process.env.PORT || 5000;

app.use(cors({
  origin: '*'
}));

app.use(express.json());

const authRoutes = require('./routes/authRoutes');
const taskRoutes = require('./routes/taskRoutes');

// Routes are prefixed with /api for better organization
app.use('/api/auth', authRoutes);
app.use('/api/tasks', taskRoutes);

app.get('/', (req, res) => {
  res.send('Backend is running successfully!');
});

app.listen(PORT, () => console.log(`Server running on port ${PORT}`));