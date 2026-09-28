import type { Page } from '../App';

interface SidebarProps {
  currentPage: string;
  navigate: (page: Page) => void;
  isOpen: boolean;
}

export default function Sidebar({ currentPage, navigate, isOpen }: SidebarProps) {
  const navItems: { page: Page; label: string; icon: string; name: string }[] = [
    {
      name: 'dashboard',
      page: { name: 'dashboard' },
      label: 'Dashboard',
      icon: 'M3 12l2-2m0 0l7-7 7 7M5 10v10a1 1 0 001 1h3m10-11l2 2m-2-2v10a1 1 0 01-1 1h-3m-6 0a1 1 0 001-1v-4a1 1 0 011-1h2a1 1 0 011 1v4a1 1 0 001 1m-6 0h6',
    },
    {
      name: 'tasks',
      page: { name: 'tasks' },
      label: 'All Tasks',
      icon: 'M9 5H7a2 2 0 00-2 2v12a2 2 0 002 2h10a2 2 0 002-2V7a2 2 0 00-2-2h-2M9 5a2 2 0 002 2h2a2 2 0 002-2M9 5a2 2 0 012-2h2a2 2 0 012 2m-3 7h3m-3 4h3m-6-4h.01M9 16h.01',
    },
    {
      name: 'add-task',
      page: { name: 'add-task' },
      label: 'Create Task',
      icon: 'M12 9v3m0 0v3m0-3h3m-3 0H9m12 0a9 9 0 11-18 0 9 9 0 0118 0z',
    },
    {
      name: 'completed',
      page: { name: 'completed' },
      label: 'Completed',
      icon: 'M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z',
    },
    {
      name: 'about',
      page: { name: 'about' },
      label: 'About & API',
      icon: 'M13 16h-1v-4h-1m1-4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z',
    },
  ];

  return (
    <aside className={`sidebar ${isOpen ? 'open' : ''}`}>
      <div className="sidebar-brand">
        <div className="brand-logo">
          <svg fill="none" stroke="currentColor" viewBox="0 0 24 24" width="22" height="22">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M9 5H7a2 2 0 00-2 2v12a2 2 0 002 2h10a2 2 0 002-2V7a2 2 0 00-2-2h-2M9 5a2 2 0 002 2h2a2 2 0 002-2M9 5a2 2 0 012-2h2a2 2 0 012 2m-6 9l2 2 4-4" />
          </svg>
        </div>
        TaskPulse
      </div>

      <nav className="sidebar-nav">
        <div className="nav-section">
          <div className="nav-section-title">Navigation</div>
          {navItems.map((item) => (
            <button
              key={item.name}
              className={`nav-item ${currentPage === item.name ? 'active' : ''}`}
              onClick={() => navigate(item.page)}
            >
              <svg fill="none" stroke="currentColor" viewBox="0 0 24 24" width="20" height="20">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d={item.icon} />
              </svg>
              <span>{item.label}</span>
            </button>
          ))}
        </div>
      </nav>

      <div className="sidebar-footer">
        <div style={{ display: 'flex', alignItems: 'center', gap: '0.75rem' }}>
          <div className="user-avatar">A</div>
          <div>
            <div style={{ fontSize: '0.875rem', fontWeight: 600 }}>PROGREE User</div>
            <div style={{ fontSize: '0.75rem', color: 'var(--text-tertiary)' }}>Full-Stack Developer</div>
          </div>
        </div>
      </div>
    </aside>
  );
}
