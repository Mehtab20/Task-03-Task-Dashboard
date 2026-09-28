import { useState, useEffect } from 'react';
import { api } from '../api';
import type { TaskFormData } from '../api';
import type { Page } from '../App';
import type { ToastType } from '../hooks/useToast';

interface TaskFormProps {
  taskId?: number;
  navigate: (page: Page) => void;
  addToast: (message: string, type?: ToastType) => void;
  triggerRefresh: () => void;
}

export default function TaskForm({ taskId, navigate, addToast, triggerRefresh }: TaskFormProps) {
  const isEdit = Boolean(taskId);
  const [formData, setFormData] = useState<TaskFormData>({
    title: '',
    description: '',
    status: 'todo',
    priority: 'medium',
    due_date: null,
  });

  const [loading, setLoading] = useState(false);
  const [initialLoading, setInitialLoading] = useState(isEdit);
  const [fieldErrors, setFieldErrors] = useState<Record<string, string>>({});

  useEffect(() => {
    if (!taskId) return;

    async function loadTask() {
      try {
        setInitialLoading(true);
        const task = await api.getTask(taskId!);
        setFormData({
          title: task.title,
          description: task.description || '',
          status: task.status,
          priority: task.priority,
          due_date: task.due_date ? task.due_date.split('T')[0] : null,
        });
      } catch (err: any) {
        addToast(err.message || 'Failed to load task details', 'error');
        navigate({ name: 'tasks' });
      } finally {
        setInitialLoading(false);
      }
    }
    loadTask();
  }, [taskId, navigate, addToast]);

  const validate = (): boolean => {
    const errors: Record<string, string> = {};
    if (!formData.title.trim()) {
      errors.title = 'Title is required';
    } else if (formData.title.length > 100) {
      errors.title = 'Title must be less than 100 characters';
    }
    if (formData.description && formData.description.length > 1000) {
      errors.description = 'Description must be less than 1000 characters';
    }
    setFieldErrors(errors);
    return Object.keys(errors).length === 0;
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!validate()) return;

    try {
      setLoading(true);
      if (isEdit && taskId) {
        await api.updateTask(taskId, formData);
        addToast(`Task "${formData.title}" updated successfully!`, 'success');
      } else {
        await api.createTask(formData);
        addToast(`Task "${formData.title}" created successfully!`, 'success');
      }
      triggerRefresh();
      navigate({ name: 'tasks' });
    } catch (err: any) {
      if (err.errors) {
        const serverErrors: Record<string, string> = {};
        err.errors.forEach((e: { field: string; message: string }) => {
          serverErrors[e.field] = e.message;
        });
        setFieldErrors(serverErrors);
      }
      addToast(err.message || 'Failed to save task', 'error');
    } finally {
      setLoading(false);
    }
  };

  if (initialLoading) {
    return (
      <div style={{ padding: '3rem 0', textAlign: 'center' }}>
        <div className="spinner"></div>
        <p style={{ marginTop: '1rem', color: 'var(--text-secondary)' }}>Loading task for editing...</p>
      </div>
    );
  }

  return (
    <div style={{ maxWidth: '700px', margin: '0 auto' }}>
      <div className="card">
        <h2 style={{ fontSize: '1.25rem', fontWeight: 600, marginBottom: '1.5rem' }}>
          {isEdit ? 'Edit Task' : 'Create New Task'}
        </h2>

        <form onSubmit={handleSubmit}>
          {/* Title */}
          <div className="form-group">
            <label className="form-label" htmlFor="title">
              Task Title <span style={{ color: 'var(--accent-rose)' }}>*</span>
            </label>
            <input
              id="title"
              type="text"
              className={`form-control ${fieldErrors.title ? 'is-invalid' : ''}`}
              placeholder="e.g. Implement user authentication microservice"
              value={formData.title}
              onChange={(e) => setFormData({ ...formData, title: e.target.value })}
              maxLength={100}
              required
            />
            {fieldErrors.title && <div className="invalid-feedback">{fieldErrors.title}</div>}
          </div>

          {/* Description */}
          <div className="form-group">
            <label className="form-label" htmlFor="description">
              Description
            </label>
            <textarea
              id="description"
              className={`form-control ${fieldErrors.description ? 'is-invalid' : ''}`}
              placeholder="Detailed task instructions, links, or acceptance criteria..."
              value={formData.description}
              onChange={(e) => setFormData({ ...formData, description: e.target.value })}
              rows={4}
              maxLength={1000}
            />
            {fieldErrors.description && <div className="invalid-feedback">{fieldErrors.description}</div>}
          </div>

          {/* Status & Priority Row */}
          <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '1.25rem' }}>
            <div className="form-group">
              <label className="form-label" htmlFor="status">
                Status
              </label>
              <select
                id="status"
                className="form-select"
                value={formData.status}
                onChange={(e) => setFormData({ ...formData, status: e.target.value as any })}
              >
                <option value="todo">To Do</option>
                <option value="in-progress">In Progress</option>
                <option value="completed">Completed</option>
              </select>
            </div>

            <div className="form-group">
              <label className="form-label" htmlFor="priority">
                Priority
              </label>
              <select
                id="priority"
                className="form-select"
                value={formData.priority}
                onChange={(e) => setFormData({ ...formData, priority: e.target.value as any })}
              >
                <option value="low">Low</option>
                <option value="medium">Medium</option>
                <option value="high">High</option>
              </select>
            </div>
          </div>

          {/* Due Date */}
          <div className="form-group">
            <label className="form-label" htmlFor="due_date">
              Due Date
            </label>
            <input
              id="due_date"
              type="date"
              className="form-control"
              value={formData.due_date || ''}
              onChange={(e) => setFormData({ ...formData, due_date: e.target.value || null })}
            />
          </div>

          {/* Buttons */}
          <div style={{ display: 'flex', gap: '1rem', justifyContent: 'flex-end', marginTop: '2rem' }}>
            <button
              type="button"
              className="btn btn-secondary"
              onClick={() => navigate({ name: 'tasks' })}
              disabled={loading}
            >
              Cancel
            </button>
            <button type="submit" className="btn btn-primary" disabled={loading}>
              {loading ? 'Saving...' : isEdit ? 'Update Task' : 'Create Task'}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}
