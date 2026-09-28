import { useEffect, useState } from 'react';
import { api } from '../api';
import type { DashboardStats, Task } from '../api';
import type { Page } from '../App';

interface DashboardProps {
  navigate: (page: Page) => void;
}

export default function Dashboard({ navigate }: DashboardProps) {
  const [stats, setStats] = useState<DashboardStats | null>(null);
  const [recentTasks, setRecentTasks] = useState<Task[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    async function loadDashboard() {
      try {
        setLoading(true);
        setError(null);
        const [statsData, tasksData] = await Promise.all([
          api.getStats(),
          api.getTasks({ sort: 'created_at', order: 'desc' }),
        ]);
        setStats(statsData);
        setRecentTasks(tasksData.slice(0, 5));
      } catch (err: any) {
        setError(err.message || 'Failed to load dashboard metrics');
      } finally {
        setLoading(false);
      }
    }
    loadDashboard();
  }, []);

  if (loading) {
    return (
      <div style={{ padding: '3rem 0', textAlign: 'center' }}>
        <div className="spinner"></div>
        <p style={{ marginTop: '1rem', color: 'var(--text-secondary)' }}>Loading dashboard analytics...</p>
      </div>
    );
  }

  if (error) {
    return (
      <div className="card" style={{ borderColor: 'var(--accent-rose-alpha)', textAlign: 'center', padding: '2.5rem 1.5rem' }}>
        <h3 style={{ color: 'var(--accent-rose)', marginBottom: '0.5rem' }}>Connection Failure</h3>
        <p style={{ color: 'var(--text-secondary)', marginBottom: '1.5rem' }}>{error}</p>
        <button className="btn btn-primary" onClick={() => window.location.reload()}>
          Retry Connection
        </button>
      </div>
    );
  }

  const statCards = [
    {
      title: 'Total Tasks',
      value: stats?.total || 0,
      badge: 'All Items',
      badgeClass: 'badge-info',
      accent: 'var(--accent-indigo)',
    },
    {
      title: 'To Do',
      value: stats?.todo || 0,
      badge: 'Pending',
      badgeClass: 'badge-secondary',
      accent: 'var(--accent-sky)',
    },
    {
      title: 'In Progress',
      value: stats?.inProgress || 0,
      badge: 'Active Work',
      badgeClass: 'badge-warning',
      accent: 'var(--accent-amber)',
    },
    {
      title: 'Completed',
      value: stats?.completed || 0,
      badge: 'Done',
      badgeClass: 'badge-success',
      accent: 'var(--accent-emerald)',
    },
    {
      title: 'High Priority',
      value: stats?.highPriority || 0,
      badge: 'Urgent',
      badgeClass: 'badge-danger',
      accent: 'var(--accent-rose)',
    },
    {
      title: 'Overdue Tasks',
      value: stats?.overdue || 0,
      badge: 'Action Required',
      badgeClass: 'badge-danger',
      accent: 'var(--accent-rose)',
    },
  ];

  return (
    <div>
      {/* Quick Action Header */}
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '1.5rem' }}>
        <div>
          <h2 style={{ fontSize: '1.25rem', fontWeight: 600 }}>Analytics & Overview</h2>
          <p style={{ fontSize: '0.875rem', color: 'var(--text-secondary)' }}>Real-time stats from SQLite backend</p>
        </div>
        <button className="btn btn-primary" onClick={() => navigate({ name: 'add-task' })}>
          <svg fill="none" stroke="currentColor" viewBox="0 0 24 24" width="18" height="18">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M12 4v16m8-8H4" />
          </svg>
          New Task
        </button>
      </div>

      {/* Metric Cards Grid */}
      <div className="stats-grid" style={{ marginBottom: '2rem' }}>
        {statCards.map((card, idx) => (
          <div className="stat-card" key={idx} style={{ borderTop: `3px solid ${card.accent}` }}>
            <div className="stat-header">
              <span className="stat-title">{card.title}</span>
              <span className={`badge ${card.badgeClass}`}>{card.badge}</span>
            </div>
            <div className="stat-value">{card.value}</div>
          </div>
        ))}
      </div>

      {/* Recent Activity Table */}
      <div className="card">
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '1.25rem' }}>
          <div>
            <h3 style={{ fontSize: '1.125rem', fontWeight: 600 }}>Recent Activity</h3>
            <p style={{ fontSize: '0.875rem', color: 'var(--text-secondary)' }}>Latest updated or created tasks</p>
          </div>
          <button className="btn btn-secondary" onClick={() => navigate({ name: 'tasks' })}>
            View All ({stats?.total || 0})
          </button>
        </div>

        {recentTasks.length === 0 ? (
          <div className="empty-state">
            <div className="empty-icon">📋</div>
            <h4 className="empty-title">No tasks found</h4>
            <p className="empty-description">Get started by creating your first task.</p>
            <button className="btn btn-primary" onClick={() => navigate({ name: 'add-task' })}>
              Create First Task
            </button>
          </div>
        ) : (
          <div className="table-responsive">
            <table className="table">
              <thead>
                <tr>
                  <th>Title</th>
                  <th>Status</th>
                  <th>Priority</th>
                  <th>Due Date</th>
                  <th style={{ textAlign: 'right' }}>Actions</th>
                </tr>
              </thead>
              <tbody>
                {recentTasks.map((task) => (
                  <tr key={task.id}>
                    <td>
                      <div
                        style={{ fontWeight: 600, color: 'var(--text-primary)', cursor: 'pointer' }}
                        onClick={() => navigate({ name: 'view-task', taskId: task.id })}
                      >
                        {task.title}
                      </div>
                      <div className="table-description">{task.description || 'No description provided'}</div>
                    </td>
                    <td>
                      <span className={`badge badge-${task.status === 'completed' ? 'success' : task.status === 'in-progress' ? 'warning' : 'secondary'}`}>
                        {task.status}
                      </span>
                    </td>
                    <td>
                      <span className={`badge badge-${task.priority === 'high' ? 'danger' : task.priority === 'medium' ? 'warning' : 'info'}`}>
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
                          title="View Task"
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
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>
    </div>
  );
}
