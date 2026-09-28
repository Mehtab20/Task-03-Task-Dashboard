import { useState, useEffect } from 'react';
import { api } from '../api';
import type { Task } from '../api';
import type { Page } from '../App';
import DeleteModal from '../components/DeleteModal';
import type { ToastType } from '../hooks/useToast';

interface TaskDetailProps {
  taskId: number;
  navigate: (page: Page) => void;
  addToast: (message: string, type?: ToastType) => void;
  triggerRefresh: () => void;
}

export default function TaskDetail({ taskId, navigate, addToast, triggerRefresh }: TaskDetailProps) {
  const [task, setTask] = useState<Task | null>(null);
  const [loading, setLoading] = useState(true);
  const [showDeleteModal, setShowDeleteModal] = useState(false);
  const [deleting, setDeleting] = useState(false);

  useEffect(() => {
    async function loadTask() {
      try {
        setLoading(true);
        const data = await api.getTask(taskId);
        setTask(data);
      } catch (err: any) {
        addToast(err.message || 'Failed to fetch task details', 'error');
        navigate({ name: 'tasks' });
      } finally {
        setLoading(false);
      }
    }
    loadTask();
  }, [taskId, navigate, addToast]);

  const handleStatusToggle = async () => {
    if (!task) return;
    const nextStatus: Task['status'] =
      task.status === 'completed'
        ? 'todo'
        : task.status === 'todo'
        ? 'in-progress'
        : 'completed';

    try {
      const updated = await api.updateTask(task.id, { status: nextStatus });
      setTask(updated);
      triggerRefresh();
      addToast(`Status updated to ${nextStatus}`, 'success');
    } catch (err: any) {
      addToast(err.message || 'Failed to update task status', 'error');
    }
  };

  const handleDelete = async () => {
    if (!task) return;
    try {
      setDeleting(true);
      await api.deleteTask(task.id);
      triggerRefresh();
      addToast(`Deleted task "${task.title}"`, 'success');
      navigate({ name: 'tasks' });
    } catch (err: any) {
      addToast(err.message || 'Failed to delete task', 'error');
    } finally {
      setDeleting(false);
    }
  };

  if (loading) {
    return (
      <div style={{ padding: '3rem 0', textAlign: 'center' }}>
        <div className="spinner"></div>
        <p style={{ marginTop: '1rem', color: 'var(--text-secondary)' }}>Loading task detail...</p>
      </div>
    );
  }

  if (!task) return null;

  return (
    <div style={{ maxWidth: '800px', margin: '0 auto' }}>
      {/* Navigation & Actions Top Bar */}
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '1.5rem' }}>
        <button className="btn btn-secondary" onClick={() => navigate({ name: 'tasks' })}>
          ← Back to Tasks
        </button>

        <div style={{ display: 'flex', gap: '0.75rem' }}>
          <button className="btn btn-secondary" onClick={() => navigate({ name: 'edit-task', taskId: task.id })}>
            ✏️ Edit Task
          </button>
          <button className="btn btn-danger" onClick={() => setShowDeleteModal(true)}>
            🗑️ Delete
          </button>
        </div>
      </div>

      {/* Main Task Card */}
      <div className="card" style={{ marginBottom: '1.5rem' }}>
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: '1.25rem' }}>
          <div>
            <h2 style={{ fontSize: '1.5rem', fontWeight: 600, color: 'var(--text-primary)', marginBottom: '0.5rem' }}>
              {task.title}
            </h2>
            <div style={{ fontSize: '0.875rem', color: 'var(--text-tertiary)' }}>
              Task ID: #{task.id}
            </div>
          </div>
          <button
            className={`btn btn-${task.status === 'completed' ? 'secondary' : 'primary'}`}
            onClick={handleStatusToggle}
          >
            {task.status === 'completed' ? 'Reopen Task' : task.status === 'todo' ? 'Start Task' : 'Complete Task'}
          </button>
        </div>

        {/* Metadata Badges Grid */}
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(180px, 1fr))', gap: '1rem', padding: '1rem', backgroundColor: 'var(--bg-tertiary)', borderRadius: 'var(--radius-md)', marginBottom: '1.5rem' }}>
          <div>
            <div style={{ fontSize: '0.75rem', color: 'var(--text-tertiary)', textTransform: 'uppercase' }}>Status</div>
            <span className={`badge badge-${task.status === 'completed' ? 'success' : task.status === 'in-progress' ? 'warning' : 'secondary'}`} style={{ marginTop: '0.25rem' }}>
              {task.status}
            </span>
          </div>

          <div>
            <div style={{ fontSize: '0.75rem', color: 'var(--text-tertiary)', textTransform: 'uppercase' }}>Priority</div>
            <span className={`badge badge-${task.priority === 'high' ? 'danger' : task.priority === 'medium' ? 'warning' : 'info'}`} style={{ marginTop: '0.25rem' }}>
              {task.priority}
            </span>
          </div>

          <div>
            <div style={{ fontSize: '0.75rem', color: 'var(--text-tertiary)', textTransform: 'uppercase' }}>Due Date</div>
            <div style={{ fontSize: '0.875rem', fontWeight: 600, marginTop: '0.25rem', color: task.due_date ? 'var(--text-primary)' : 'var(--text-tertiary)' }}>
              {task.due_date ? new Date(task.due_date).toLocaleDateString() : 'No due date'}
            </div>
          </div>

          <div>
            <div style={{ fontSize: '0.75rem', color: 'var(--text-tertiary)', textTransform: 'uppercase' }}>Created</div>
            <div style={{ fontSize: '0.875rem', color: 'var(--text-secondary)', marginTop: '0.25rem' }}>
              {new Date(task.created_at).toLocaleString()}
            </div>
          </div>
        </div>

        {/* Description */}
        <h3 style={{ fontSize: '1rem', fontWeight: 600, marginBottom: '0.5rem' }}>Description</h3>
        <div style={{ fontSize: '0.95rem', color: 'var(--text-secondary)', lineHeight: 1.6, whiteSpace: 'pre-wrap', backgroundColor: 'var(--bg-secondary)', padding: '1rem', borderRadius: 'var(--radius-sm)' }}>
          {task.description || 'No description provided for this task.'}
        </div>
      </div>

      {showDeleteModal && (
        <DeleteModal
          title={task.title}
          onConfirm={handleDelete}
          onCancel={() => setShowDeleteModal(false)}
          loading={deleting}
        />
      )}
    </div>
  );
}
