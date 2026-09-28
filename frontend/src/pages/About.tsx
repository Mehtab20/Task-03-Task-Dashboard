import { useState, useEffect } from 'react';
import { api } from '../api';

export default function About() {
  const [health, setHealth] = useState<{ message: string; timestamp: string } | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const checkHealth = async () => {
    setLoading(true);
    setError(null);
    try {
      const res = await api.healthCheck();
      setHealth(res);
    } catch (err: any) {
      setError(err.message || 'Failed to reach API server');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    let ignore = false;
    api.healthCheck()
      .then((res) => {
        if (!ignore) {
          setHealth(res);
          setLoading(false);
        }
      })
      .catch((err: any) => {
        if (!ignore) {
          setError(err.message || 'Failed to reach API server');
          setLoading(false);
        }
      });
    return () => {
      ignore = true;
    };
  }, []);

  return (
    <div style={{ maxWidth: '900px', margin: '0 auto' }}>
      <div className="card" style={{ marginBottom: '1.5rem' }}>
        <h2 style={{ fontSize: '1.5rem', fontWeight: 600, marginBottom: '0.75rem' }}>
          PROGREE Task 3 — Interactive Dynamic Task Dashboard
        </h2>
        <p style={{ color: 'var(--text-secondary)', lineHeight: 1.6, marginBottom: '1.25rem' }}>
          A modern full-stack web application built to fulfill all requirements of PROGREE Full Stack Development Task 3. Features asynchronous fetch communications, React + TypeScript frontend UI, Express microservice REST API, and persistent SQLite database logic.
        </p>

        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(220px, 1fr))', gap: '1rem', marginTop: '1rem' }}>
          <div style={{ padding: '1rem', backgroundColor: 'var(--bg-tertiary)', borderRadius: 'var(--radius-md)' }}>
            <h4 style={{ color: 'var(--accent-sky)', marginBottom: '0.25rem' }}>Frontend Stack</h4>
            <p style={{ fontSize: '0.875rem', color: 'var(--text-secondary)' }}>Vite + React 19 + TypeScript + Custom CSS Tokens</p>
          </div>

          <div style={{ padding: '1rem', backgroundColor: 'var(--bg-tertiary)', borderRadius: 'var(--radius-md)' }}>
            <h4 style={{ color: 'var(--accent-indigo)', marginBottom: '0.25rem' }}>Backend Microservice</h4>
            <p style={{ fontSize: '0.875rem', color: 'var(--text-secondary)' }}>Node.js + Express + express-validator + CORS</p>
          </div>

          <div style={{ padding: '1rem', backgroundColor: 'var(--bg-tertiary)', borderRadius: 'var(--radius-md)' }}>
            <h4 style={{ color: 'var(--accent-emerald)', marginBottom: '0.25rem' }}>Database Persistence</h4>
            <p style={{ fontSize: '0.875rem', color: 'var(--text-secondary)' }}>SQLite (sql.js) with file persistence</p>
          </div>
        </div>
      </div>

      {/* Health Check Card */}
      <div className="card" style={{ marginBottom: '1.5rem' }}>
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '1rem' }}>
          <h3 style={{ fontSize: '1.125rem', fontWeight: 600 }}>Backend Microservice Health Check</h3>
          <button className="btn btn-secondary" onClick={checkHealth} disabled={loading}>
            {loading ? 'Checking...' : 'Refresh Health'}
          </button>
        </div>

        {error ? (
          <div style={{ padding: '1rem', backgroundColor: 'var(--accent-rose-alpha)', borderRadius: 'var(--radius-md)', color: 'var(--accent-rose)' }}>
            <strong>Offline / Error:</strong> {error}
          </div>
        ) : health ? (
          <div style={{ padding: '1rem', backgroundColor: 'var(--green-subtle)', borderRadius: 'var(--radius-md)', color: 'var(--accent-emerald)' }}>
            <div style={{ fontWeight: 600, marginBottom: '0.25rem' }}>{health.message}</div>
            <div style={{ fontSize: '0.75rem', opacity: 0.8 }}>Server timestamp: {health.timestamp}</div>
          </div>
        ) : null}
      </div>

      {/* REST API Documentation Card */}
      <div className="card">
        <h3 style={{ fontSize: '1.125rem', fontWeight: 600, marginBottom: '1rem' }}>REST API Endpoints</h3>
        <div className="table-responsive">
          <table className="table">
            <thead>
              <tr>
                <th>Method</th>
                <th>Endpoint</th>
                <th>Description</th>
              </tr>
            </thead>
            <tbody>
              <tr>
                <td><span className="badge badge-info">GET</span></td>
                <td><code>/api/tasks</code></td>
                <td>List all tasks with optional search, status, priority, and sorting filters</td>
              </tr>
              <tr>
                <td><span className="badge badge-info">GET</span></td>
                <td><code>/api/tasks/stats</code></td>
                <td>Retrieve aggregated analytics (total, status breakdowns, overdue)</td>
              </tr>
              <tr>
                <td><span className="badge badge-info">GET</span></td>
                <td><code>/api/tasks/:id</code></td>
                <td>Retrieve single task by ID</td>
              </tr>
              <tr>
                <td><span className="badge badge-success">POST</span></td>
                <td><code>/api/tasks</code></td>
                <td>Create a new task with validation</td>
              </tr>
              <tr>
                <td><span className="badge badge-warning">PUT</span></td>
                <td><code>/api/tasks/:id</code></td>
                <td>Update an existing task details or status</td>
              </tr>
              <tr>
                <td><span className="badge badge-danger">DELETE</span></td>
                <td><code>/api/tasks/:id</code></td>
                <td>Permanently delete a task</td>
              </tr>
              <tr>
                <td><span className="badge badge-secondary">GET</span></td>
                <td><code>/api/health</code></td>
                <td>Backend microservice health check</td>
              </tr>
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
}
