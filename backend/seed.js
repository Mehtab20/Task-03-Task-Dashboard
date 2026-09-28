const http = require('http');

const sampleTasks = [
  {
    title: 'Setup Microservice Architecture',
    description: 'Build Express backend REST API with sql.js persistence and input validation.',
    status: 'completed',
    priority: 'high',
    due_date: '2026-09-30',
  },
  {
    title: 'Design Responsive React Dashboard',
    description: 'Implement modern dark-mode UI with sidebar navigation, metric cards, and task filters.',
    status: 'completed',
    priority: 'high',
    due_date: '2026-10-02',
  },
  {
    title: 'Implement Full CRUD Operations',
    description: 'Enable creating, reading, updating status/details, and deleting tasks asynchronously.',
    status: 'in-progress',
    priority: 'high',
    due_date: '2026-10-05',
  },
  {
    title: 'Add Analytics & Metrics Charts',
    description: 'Calculate overdue items, high priority tasks, and completion rate summary.',
    status: 'in-progress',
    priority: 'medium',
    due_date: '2026-10-10',
  },
  {
    title: 'Write Technical Documentation & OpenAPI Spec',
    description: 'Document REST API schema, setup steps, and architecture overview in README.',
    status: 'todo',
    priority: 'medium',
    due_date: '2026-10-15',
  },
  {
    title: 'Prepare Task 3 Submission & GitHub Push',
    description: 'Verify code quality, zero lint/build errors, git commit, and remote repository push.',
    status: 'todo',
    priority: 'high',
    due_date: '2026-09-28',
  },
];

async function seed() {
  console.log('Seeding initial task data via API...');
  for (const task of sampleTasks) {
    const postData = JSON.stringify(task);

    const req = http.request(
      {
        hostname: 'localhost',
        port: 5000,
        path: '/api/tasks',
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Content-Length': Buffer.byteLength(postData),
        },
      },
      (res) => {
        let body = '';
        res.on('data', (chunk) => (body += chunk));
        res.on('end', () => {
          console.log(`Posted "${task.title}": Status ${res.statusCode}`);
        });
      }
    );

    req.on('error', (e) => {
      console.error(`Error posting "${task.title}":`, e.message);
    });

    req.write(postData);
    req.end();
    await new Promise((resolve) => setTimeout(resolve, 200));
  }
}

seed();
