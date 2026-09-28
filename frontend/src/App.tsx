import { useState, useCallback } from 'react';
import Sidebar from './components/Sidebar';
import Topbar from './components/Topbar';
import Dashboard from './pages/Dashboard';
import TaskList from './pages/TaskList';
import TaskForm from './pages/TaskForm';
import TaskDetail from './pages/TaskDetail';
import CompletedTasks from './pages/CompletedTasks';
import About from './pages/About';
import ToastContainer from './components/ToastContainer';
import { useToast } from './hooks/useToast';

export type Page =
  | { name: 'dashboard' }
  | { name: 'tasks' }
  | { name: 'add-task' }
  | { name: 'edit-task'; taskId: number }
  | { name: 'view-task'; taskId: number }
  | { name: 'completed' }
  | { name: 'about' };

export default function App() {
  const [page, setPage] = useState<Page>({ name: 'dashboard' });
  const [sidebarOpen, setSidebarOpen] = useState(false);
  const [refreshKey, setRefreshKey] = useState(0);
  const { toasts, addToast, removeToast } = useToast();

  const navigate = useCallback((p: Page) => {
    setPage(p);
    setSidebarOpen(false);
  }, []);

  const triggerRefresh = useCallback(() => {
    setRefreshKey(k => k + 1);
  }, []);

  function renderPage() {
    switch (page.name) {
      case 'dashboard':
        return <Dashboard key={refreshKey} navigate={navigate} />;
      case 'tasks':
        return <TaskList key={refreshKey} navigate={navigate} addToast={addToast} />;
      case 'add-task':
        return <TaskForm navigate={navigate} addToast={addToast} triggerRefresh={triggerRefresh} />;
      case 'edit-task':
        return <TaskForm taskId={page.taskId} navigate={navigate} addToast={addToast} triggerRefresh={triggerRefresh} />;
      case 'view-task':
        return <TaskDetail taskId={page.taskId} navigate={navigate} addToast={addToast} triggerRefresh={triggerRefresh} />;
      case 'completed':
        return <CompletedTasks key={refreshKey} navigate={navigate} addToast={addToast} />;
      case 'about':
        return <About />;
      default:
        return <Dashboard key={refreshKey} navigate={navigate} />;
    }
  }

  const pageTitle = (() => {
    switch (page.name) {
      case 'dashboard': return { title: 'Dashboard', subtitle: 'Overview of all tasks' };
      case 'tasks': return { title: 'All Tasks', subtitle: 'Manage your task list' };
      case 'add-task': return { title: 'Create Task', subtitle: 'Add a new task' };
      case 'edit-task': return { title: 'Edit Task', subtitle: 'Update task details' };
      case 'view-task': return { title: 'Task Details', subtitle: 'View full task information' };
      case 'completed': return { title: 'Completed', subtitle: 'Finished tasks archive' };
      case 'about': return { title: 'About', subtitle: 'Application information' };
      default: return { title: 'Dashboard', subtitle: '' };
    }
  })();

  return (
    <div className="app-layout">
      {sidebarOpen && <div className="sidebar-overlay open" onClick={() => setSidebarOpen(false)} />}
      <Sidebar currentPage={page.name} navigate={navigate} isOpen={sidebarOpen} />
      <div className="main-content">
        <Topbar
          title={pageTitle.title}
          subtitle={pageTitle.subtitle}
          onMenuClick={() => setSidebarOpen(!sidebarOpen)}
        />
        <div className="page-container">
          {renderPage()}
        </div>
      </div>
      <ToastContainer toasts={toasts} onRemove={removeToast} />
    </div>
  );
}
