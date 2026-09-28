import { useState, useEffect, useCallback } from 'react';
import { api } from '../api';
import type { Task, TaskFilters } from '../api';
import type { Page } from '../App';
import DeleteModal from '../components/DeleteModal';
import type { ToastType } from '../hooks/useToast';

interface TaskListProps {
  navigate: (page: Page) => void;
  addToast: (message: string, type?: ToastType) => void;
}

export default function TaskList({ navigate, addToast }: TaskListProps) {
  const [tasks, setTasks] = useState<Task[]>([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState('');
  const [status, setStatus] = useState('');
  const [priority, setPriority] = useState('');
  const [sort, setSort] = useState('created_at');
  const [order, setOrder] = useState('desc');

  // Delete modal state
  const [taskToDelete, setTaskToDelete] = useState<Task | null>(null);
  const [deleting, setDeleting] = useState(false);

  const fetchTasks = useCallback(async () => {
    try {
      setLoading(true);
      const filters: TaskFilters = {
        search: search || undefined,
        status: status || undefined,
        priority: priority || undefined,
        sort,
        order,
      };
      const data = await api.getTasks(filters);
      setTasks(data);
    } catch (err: any) {
      addToast(err.message || 'Failed to fetch tasks', 'error');
    } finally {
      setLoading(false);
    }
  }, [search, status, priority, sort, order, addToast]);

  useEffect(() => {
    const timer = setTimeout(() => {
      fetchTasks();
    }, 200);
    return () => clearTimeout(timer);
  }, [fetchTasks]);

  const handleStatusToggle = async (task: Task) => {
    const nextStatus: Task['status'] =
      task.status === 'completed'
        ? 'todo'
        : task.status === 'todo'
        ? 'in-progress'
        : 'completed';

    try {
      const updated = await api.updateTask(task.id, { status: nextStatus });
      setTasks((prev) => prev.map((t) => (t.id === task.id ? updated : t)));
      addToast(`Task marked as ${nextStatus}`, 'success');
    } catch (err: any) {
      addToast(err.message || 'Failed to update task status', 'error');
    }
  };

  const handleDeleteConfirm = async () => {
    if (!taskToDelete) return;
    try {
      setDeleting(true);
      await api.deleteTask(taskToDelete.id);
      setTasks((prev) => prev.filter((t) => t.id !== taskToDelete.id));
      addToast(`Deleted task "${taskToDelete.title}"`, 'success');
      setTaskToDelete(null);
    } catch (err: any) {
      addToast(err.message || 'Failed to delete task', 'error');
    } finally {
      setDeleting(false);
    }
  };

  return (
    <div>
      {/* Header controls */}
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '1.5rem', flexWrap: 'wrap', gap: '1rem' }}>
        <div>
          <h2 style={{ fontSize: '1.25rem', fontWeight: 600 }}>Task Management</h2>
          <p style={{ fontSize: '0.875rem', color: 'var(--text-secondary)' }}>
            Showing {tasks.length} task{tasks.length === 1 ? '' : 's'}
          </p>
        </div>

        <button className="btn btn-primary" onClick={() => navigate({ name: 'add-task' })}>
          <svg fill="none" stroke="currentColor" viewBox="0 0 24 24" width="18" height="18">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M12 4v16m8-8H4" />
          </svg>
          Add Task
        </button>
      </div>

      {/* Filter and Search Bar */}
      <div className="card" style={{ marginBottom: '1.5rem', padding: '1.25rem' }}>
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(180px, 1fr))', gap: '1rem' }}>
          <div>
            <label className="form-label" style={{ fontSize: '0.75rem', textTransform: 'uppercase', letterSpacing: '0.05em' }}>Search</label>
            <input
              type="text"
              className="form-control"
              placeholder="Search by title or description..."
              value={search}
              onChange={(e) => setSearch(e.target.value)}
            />
          </div>

          <div>
            <label className="form-label" style={{ fontSize: '0.75rem', textTransform: 'uppercase', letterSpacing: '0.05em' }}>Status</label>
            <select className="form-select" value={status} onChange={(e) => setStatus(e.target.value)}>
              <option value="">All Statuses</option>
              <option value="todo">To Do</option>
              <option value="in-progress">In Progress</option>
              <option value="completed">Completed</option>
            </select>
          </div>

          <div>
            <label className="form-label" style={{ fontSize: '0.75rem', textTransform: 'uppercase', letterSpacing: '0.05em' }}>Priority</label>
            <select className="form-select" value={priority} onChange={(e) => setPriority(e.target.value)}>
              <option value="">All Priorities</option>
              <option value="low">Low</option>
              <option value="medium">Medium</option>
              <option value="high">High</option>
            </select>
          </div>

          <div>
            <label className="form-label" style={{ fontSize: '0.75rem', textTransform: 'uppercase', letterSpacing: '0.05em' }}>Sort By</label>
            <select className="form-select" value={sort} onChange={(e) => setSort(e.target.value)}>
              <option value="created_at">Date Created</option>
              <option value="due_date">Due Date</option>
              <option value="title">Title</option>
              <option value="priority">Priority</option>
            </select>
          </div>

          <div>
            <label className="form-label" style={{ fontSize: '0.75rem', textTransform: 'uppercase', letterSpacing: '0.05em' }}>Order</label>
            <select className="form-select" value={order} onChange={(e) => setOrder(e.target.value)}>
              <option value="desc">Descending</option>
              <option value="asc">Ascending</option>
            </select>
          </div>
        </div>
      </div>

      {/* Main Task List Table / Empty State */}
      <div className="card">
        {loading ? (
          <div style={{ padding: '3rem 0', textAlign: 'center' }}>
            <div className="spinner"></div>
            <p style={{ marginTop: '1rem', color: 'var(--text-secondary)' }}>Loading task entries...</p>
          </div>
        ) : tasks.length === 0 ? (
          <div className="empty-state">
            <div className="empty-icon">🔍</div>
            <h4 className="empty-title">No matching tasks</h4>
            <p className="empty-description">
              {search || status || priority
                ? 'Try clearing filters or search query.'
                : 'Your task list is empty. Create a new task to get started.'}
            </p>
            {(search || status || priority) && (
              <button
                className="btn btn-secondary"
                onClick={() => {
                  setSearch('');
                  setStatus('');
                  setPriority('');
                }}
              >
                Clear Filters
              </button>
            )}
          </div>
        ) : (
          <div className="table-responsive">
            <table className="table">
              <thead>
                <tr>
                  <th style={{ width: '40px' }}>Done</th>
                  <th>Title & Description</th>
                  <th>Status</th>
                  <th>Priority</th>
                  <th>Due Date</th>
                  <th style={{ textAlign: 'right' }}>Actions</th>
                </tr>
              </thead>
              <tbody>
                {tasks.map((task) => (
                  <tr key={task.id}>
                    <td>
                      <input
                        type="checkbox"
                        checked={task.status === 'completed'}
                        onChange={() => handleStatusToggle(task)}
                        style={{ cursor: 'pointer', width: '18px', height: '18px', accentColor: 'var(--accent-emerald)' }}
                        title="Click to toggle completion status"
                      />
                    </td>
                    <td>
                      <div
                        style={{
                          fontWeight: 600,
                          color: task.status === 'completed' ? 'var(--text-tertiary)' : 'var(--text-primary)',
                          textDecoration: task.status === 'completed' ? 'line-through' : 'none',
                          cursor: 'pointer',
                        }}
                        onClick={() => navigate({ name: 'view-task', taskId: task.id })}
                      >
                        {task.title}
                      </div>
                      <div className="table-description">{task.description || 'No details provided'}</div>
                    </td>
                    <td>
                      <span
                        className={`badge badge-${
                          task.status === 'completed'
                            ? 'success'
                            : task.status === 'in-progress'
                            ? 'warning'
                            : 'secondary'
                        }`}
                        style={{ cursor: 'pointer' }}
                        onClick={() => handleStatusToggle(task)}
                        title="Click to advance status"
                      >
                        {task.status}
                      </span>
                    </td>
                    <td>
                      <span
                        className={`badge badge-${
                          task.priority === 'high'
                            ? 'danger'
                            : task.priority === 'medium'
                            ? 'warning'
                            : 'info'
                        }`}
                      >
                        {task.priority}
                      </span>
                    </td>
                    <td style={{ color: 'var(--text-secondary)', fontSize: '0.875rem' }}>
                      {task.due_date ? new Date(task.due_date).toLocaleDateString() : '—'}
                    </td>
                    <td>
                      <div className="table-actions">
                        <button
                          className="btn-icon"
                          title="View Task Details"
                          onClick={() => navigate({ name: 'view-task', taskId: task.id })}
                        >
                          👁️
                        </button>
                        <button
                          className="btn-icon"
                          title="Edit Task"
                          onClick={() => navigate({ name: 'edit-task', taskId: task.id })}
                        >
                          ✏️
                        </button>
                        <button
                          className="btn-icon btn-icon-danger"
                          title="Delete Task"
                          onClick={() => setTaskToDelete(task)}
                        >
                          🗑️
                        </button>
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>

      {/* Delete Modal */}
      {taskToDelete && (
        <DeleteModal
          title={taskToDelete.title}
          onConfirm={handleDeleteConfirm}
          onCancel={() => setTaskToDelete(null)}
          loading={deleting}
        />
      )}
    </div>
  );
}
