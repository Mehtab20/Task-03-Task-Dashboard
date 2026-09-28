const express = require('express');
const { getDb, saveDatabase } = require('./database');
const {
  handleValidationErrors,
  createTaskRules,
  updateTaskRules,
  idParamRule,
} = require('./validators');

const router = express.Router();

/** Helper: run a SELECT query and return all rows as an array of objects */
function queryAll(sql, params = []) {
  const db = getDb();
  const stmt = db.prepare(sql);
  if (params.length) stmt.bind(params);
  const rows = [];
  while (stmt.step()) {
    rows.push(stmt.getAsObject());
  }
  stmt.free();
  return rows;
}

/** Helper: run a SELECT query and return the first row as an object or null */
function queryOne(sql, params = []) {
  const db = getDb();
  const stmt = db.prepare(sql);
  if (params.length) stmt.bind(params);
  const row = stmt.step() ? stmt.getAsObject() : null;
  stmt.free();
  return row;
}

/** Helper: run an INSERT/UPDATE/DELETE statement */
function execute(sql, params = []) {
  const db = getDb();
  db.run(sql, params);
  saveDatabase();
}

// ──────────────────────────────────────────────
// GET /api/tasks — List all tasks with search, filter, sort
// ──────────────────────────────────────────────
router.get('/', (req, res) => {
  try {
    const { search, status, priority, sort, order } = req.query;

    let sql = 'SELECT * FROM tasks WHERE 1=1';
    const params = [];

    if (search && typeof search === 'string' && search.trim()) {
      sql += ' AND (title LIKE ? OR description LIKE ?)';
      const term = `%${search.trim()}%`;
      params.push(term, term);
    }

    if (status && ['todo', 'in-progress', 'completed'].includes(status)) {
      sql += ' AND status = ?';
      params.push(status);
    }

    if (priority && ['low', 'medium', 'high'].includes(priority)) {
      sql += ' AND priority = ?';
      params.push(priority);
    }

    const allowedSortColumns = ['due_date', 'priority', 'created_at', 'updated_at', 'title', 'status'];
    const sortColumn = allowedSortColumns.includes(sort) ? sort : 'created_at';
    const sortOrder = order === 'asc' ? 'ASC' : 'DESC';

    if (sortColumn === 'priority') {
      sql += ` ORDER BY CASE priority WHEN 'high' THEN 1 WHEN 'medium' THEN 2 WHEN 'low' THEN 3 END ${sortOrder}`;
    } else {
      sql += ` ORDER BY ${sortColumn} ${sortOrder}`;
    }

    const tasks = queryAll(sql, params);
    res.json({ success: true, count: tasks.length, data: tasks });
  } catch (error) {
    console.error('[API] GET /tasks error:', error.message);
    res.status(500).json({ success: false, message: 'Failed to retrieve tasks' });
  }
});

// ──────────────────────────────────────────────
// GET /api/tasks/stats — Dashboard statistics
// ──────────────────────────────────────────────
router.get('/stats', (req, res) => {
  try {
    const total = queryOne('SELECT COUNT(*) as count FROM tasks').count;
    const todo = queryOne("SELECT COUNT(*) as count FROM tasks WHERE status = 'todo'").count;
    const inProgress = queryOne("SELECT COUNT(*) as count FROM tasks WHERE status = 'in-progress'").count;
    const completed = queryOne("SELECT COUNT(*) as count FROM tasks WHERE status = 'completed'").count;
    const highPriority = queryOne("SELECT COUNT(*) as count FROM tasks WHERE priority = 'high'").count;
    const overdue = queryOne(
      "SELECT COUNT(*) as count FROM tasks WHERE due_date < datetime('now') AND status != 'completed'"
    ).count;

    res.json({
      success: true,
      data: { total, todo, inProgress, completed, highPriority, overdue },
    });
  } catch (error) {
    console.error('[API] GET /tasks/stats error:', error.message);
    res.status(500).json({ success: false, message: 'Failed to retrieve statistics' });
  }
});

// ──────────────────────────────────────────────
// GET /api/tasks/:id — Get single task
// ──────────────────────────────────────────────
router.get('/:id', idParamRule, handleValidationErrors, (req, res) => {
  try {
    const task = queryOne('SELECT * FROM tasks WHERE id = ?', [Number(req.params.id)]);
    if (!task) {
      return res.status(404).json({ success: false, message: `Task with ID ${req.params.id} not found` });
    }
    res.json({ success: true, data: task });
  } catch (error) {
    console.error('[API] GET /tasks/:id error:', error.message);
    res.status(500).json({ success: false, message: 'Failed to retrieve task' });
  }
});

// ──────────────────────────────────────────────
// POST /api/tasks — Create new task
// ──────────────────────────────────────────────
router.post('/', createTaskRules, handleValidationErrors, (req, res) => {
  try {
    const { title, description = '', status = 'todo', priority = 'medium', due_date = null } = req.body;
    const now = new Date().toISOString();

    const db = getDb();
    db.run(
      `INSERT INTO tasks (title, description, status, priority, due_date, created_at, updated_at)
       VALUES (?, ?, ?, ?, ?, ?, ?)`,
      [title.trim(), description.trim(), status, priority, due_date, now, now]
    );

    // Get the newly inserted task (MAX(id) is safe for single-writer SQLite)
    const newTask = queryOne('SELECT * FROM tasks WHERE id = (SELECT MAX(id) FROM tasks)');
    saveDatabase();

    res.status(201).json({
      success: true,
      message: 'Task created successfully',
      data: newTask,
    });
  } catch (error) {
    console.error('[API] POST /tasks error:', error.message);
    res.status(500).json({ success: false, message: 'Failed to create task' });
  }
});

// ──────────────────────────────────────────────
// PUT /api/tasks/:id — Update existing task
// ──────────────────────────────────────────────
router.put('/:id', updateTaskRules, handleValidationErrors, (req, res) => {
  try {
    const id = Number(req.params.id);
    const existing = queryOne('SELECT * FROM tasks WHERE id = ?', [id]);

    if (!existing) {
      return res.status(404).json({ success: false, message: `Task with ID ${id} not found` });
    }

    const title = req.body.title !== undefined ? req.body.title.trim() : existing.title;
    const description = req.body.description !== undefined ? req.body.description.trim() : existing.description;
    const status = req.body.status !== undefined ? req.body.status : existing.status;
    const priority = req.body.priority !== undefined ? req.body.priority : existing.priority;
    const due_date = req.body.due_date !== undefined ? req.body.due_date : existing.due_date;
    const updated_at = new Date().toISOString();

    execute(
      `UPDATE tasks SET title = ?, description = ?, status = ?, priority = ?, due_date = ?, updated_at = ? WHERE id = ?`,
      [title, description, status, priority, due_date, updated_at, id]
    );

    const updatedTask = queryOne('SELECT * FROM tasks WHERE id = ?', [id]);
    res.json({ success: true, message: 'Task updated successfully', data: updatedTask });
  } catch (error) {
    console.error('[API] PUT /tasks/:id error:', error.message);
    res.status(500).json({ success: false, message: 'Failed to update task' });
  }
});

// ──────────────────────────────────────────────
// DELETE /api/tasks/:id — Delete task
// ──────────────────────────────────────────────
router.delete('/:id', idParamRule, handleValidationErrors, (req, res) => {
  try {
    const id = Number(req.params.id);
    const existing = queryOne('SELECT * FROM tasks WHERE id = ?', [id]);

    if (!existing) {
      return res.status(404).json({ success: false, message: `Task with ID ${id} not found` });
    }

    execute('DELETE FROM tasks WHERE id = ?', [id]);
    res.json({ success: true, message: `Task "${existing.title}" deleted successfully`, data: existing });
  } catch (error) {
    console.error('[API] DELETE /tasks/:id error:', error.message);
    res.status(500).json({ success: false, message: 'Failed to delete task' });
  }
});

module.exports = router;
