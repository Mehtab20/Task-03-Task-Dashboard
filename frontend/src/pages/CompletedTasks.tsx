import { useState, useEffect } from 'react';
import { api } from '../api';
import type { Task } from '../api';
import type { Page } from '../App';
import DeleteModal from '../components/DeleteModal';
import type { ToastType } from '../hooks/useToast';

interface CompletedTasksProps {
  navigate: (page: Page) => void;
  addToast: (message: string, type?: ToastType) => void;
}

export default function CompletedTasks({ navigate, addToast }: CompletedTasksProps) {
  const [tasks, setTasks] = useState<Task[]>([]);
  const [loading, setLoading] = useState(true);
  const [taskToDelete, setTaskToDelete] = useState<Task | null>(null);
  const [deleting, setDeleting] = useState(false);

  useEffect(() => {
    async function fetchCompleted() {
      try {
        setLoading(true);
        const data = await api.getTasks({ status: 'completed' });
        setTasks(data);
      } catch (err: any) {
        addToast(err.message || 'Failed to fetch completed tasks', 'error');
      } finally {
        setLoading(false);
      }
    }
    fetchCompleted();
  }, [addToast]);

  const handleReopen = async (task: Task) => {
    try {
      const updated = await api.updateTask(task.id, { status: 'todo' });
      setTasks((prev) => prev.filter((t) => t.id !== task.id));
      addToast(`Reopened task "${updated.title}"`, 'success');
    } catch (err: any) {
      addToast(err.message || 'Failed to reopen task', 'error');
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
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '1.5rem' }}>
        <div>
          <h2 style={{ fontSize: '1.25rem', fontWeight: 600 }}>Completed Tasks Archive</h2>
          <p style={{ fontSize: '0.875rem', color: 'var(--text-secondary)' }}>
            Total completed: {tasks.length}
          </p>
        </div>
      </div>

      <div className="card">
        {loading ? (
          <div style={{ padding: '3rem 0', textAlign: 'center' }}>
            <div className="spinner"></div>
            <p style={{ marginTop: '1rem', color: 'var(--text-secondary)' }}>Loading completed tasks...</p>
          </div>
        ) : tasks.length === 0 ? (
          <div className="empty-state">
            <div className="empty-icon">🎉</div>
            <h4 className="empty-title">No completed tasks yet</h4>
            <p className="empty-description">Mark active tasks as completed to populate this archive.</p>
            <button className="btn btn-primary" onClick={() => navigate({ name: 'tasks' })}>
              View Active Tasks
            </button>
          </div>
        ) : (
          <div className="table-responsive">
            <table className="table">
              <thead>
                <tr>
                  <th>Title & Description</th>
                  <th>Priority</th>
                  <th>Completed Date</th>
                  <th style={{ textAlign: 'right' }}>Actions</th>
                </tr>
              </thead>
              <tbody>
                {tasks.map((task) => (
                  <tr key={task.id}>
                    <td>
                      <div style={{ fontWeight: 600, color: 'var(--text-primary)' }}>{task.title}</div>
                      <div className="table-description">{task.description || 'No description provided'}</div>
                    </td>
                    <td>
                      <span className={`badge badge-${task.priority === 'high' ? 'danger' : task.priority === 'medium' ? 'warning' : 'info'}`}>
                        {task.priority}
                      </span>
                    </td>
                    <td style={{ color: 'var(--text-secondary)', fontSize: '0.875rem' }}>
                      {new Date(task.updated_at).toLocaleDateString()}
                    </td>
                    <td>
                      <div className="table-actions">
                        <button className="btn btn-secondary" style={{ padding: '0.25rem 0.6rem', fontSize: '0.75rem' }} onClick={() => handleReopen(task)}>
                          Reopen
                        </button>
                        <button className="btn-icon btn-icon-danger" title="Delete Task" onClick={() => setTaskToDelete(task)}>
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
