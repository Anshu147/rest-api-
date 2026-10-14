const API_BASE = 'http://localhost:5000/api';

const logPass = (title) => console.log(`  \x1b[32m✔ PASS:\x1b[0m ${title}`);
const logFail = (title, error) => {
  console.error(`  \x1b[31m✖ FAIL:\x1b[0m ${title}`);
  if (error) console.error(error);
  process.exit(1);
};

const assert = (condition, message) => {
  if (!condition) {
    throw new Error(message || 'Assertion failed');
  }
};

const runTests = async () => {
  console.log('\n======================================================');
  console.log('🧪 Starting Project & Task Management API Test Suite');
  console.log('======================================================\n');

  try {
    // 1. Health Check
    console.log('[Test Group 1] System Health');
    const healthRes = await fetch(`${API_BASE}/health`);
    const healthJson = await healthRes.json();
    assert(healthRes.status === 200, `Expected status 200, got ${healthRes.status}`);
    assert(healthJson.success === true, 'Health check should return success: true');
    logPass('GET /api/health returned 200 OK');

    // 2. Auth - Register User 1
    console.log('\n[Test Group 2] Authentication & Profile');
    const testEmail1 = `alice_${Date.now()}@example.com`;
    const regRes = await fetch(`${API_BASE}/auth/register`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        name: 'Alice Developer',
        email: testEmail1,
        password: 'password123'
      })
    });
    const regJson = await regRes.json();
    assert(regRes.status === 201, `Register failed with status ${regRes.status}: ${JSON.stringify(regJson)}`);
    assert(regJson.success === true, 'Register success should be true');
    assert(Boolean(regJson.data.token), 'Register response must include token');
    assert(regJson.data.user.email === testEmail1, 'Register response must include user email');
    assert(!regJson.data.user.password, 'User password must NOT be in response');
    const token1 = regJson.data.token;
    logPass('POST /api/auth/register created user and returned JWT');

    // 3. Auth - Duplicate Email
    const dupRes = await fetch(`${API_BASE}/auth/register`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        name: 'Alice Duplicate',
        email: testEmail1,
        password: 'password123'
      })
    });
    const dupJson = await dupRes.json();
    assert(dupRes.status === 409, `Expected 409 Conflict for duplicate email, got ${dupRes.status}`);
    assert(dupJson.success === false, 'Duplicate email should return success: false');
    logPass('POST /api/auth/register prevented duplicate email (409 Conflict)');

    // 4. Auth - Validation Failure
    const invalidRegRes = await fetch(`${API_BASE}/auth/register`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        name: '',
        email: 'not-an-email',
        password: '123'
      })
    });
    const invalidRegJson = await invalidRegRes.json();
    assert(invalidRegRes.status === 400, `Expected 400 Bad Request, got ${invalidRegRes.status}`);
    assert(invalidRegJson.errors.length >= 3, 'Expected validation error messages for name, email, password');
    logPass('POST /api/auth/register rejected invalid fields (400 Bad Request)');

    // 5. Auth - Login
    const loginRes = await fetch(`${API_BASE}/auth/login`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        email: testEmail1,
        password: 'password123'
      })
    });
    const loginJson = await loginRes.json();
    assert(loginRes.status === 200, `Login failed: ${JSON.stringify(loginJson)}`);
    assert(Boolean(loginJson.data.token), 'Login should return token');
    logPass('POST /api/auth/login verified credentials and returned JWT');

    // 6. Auth - Login Invalid Password
    const badLoginRes = await fetch(`${API_BASE}/auth/login`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        email: testEmail1,
        password: 'wrong_password'
      })
    });
    assert(badLoginRes.status === 401, `Expected 401 Unauthorized, got ${badLoginRes.status}`);
    logPass('POST /api/auth/login rejected wrong password (401 Unauthorized)');

    // 7. Auth - GET /api/auth/me
    const meRes = await fetch(`${API_BASE}/auth/me`, {
      headers: { Authorization: `Bearer ${token1}` }
    });
    const meJson = await meRes.json();
    assert(meRes.status === 200, 'GET /api/auth/me failed');
    assert(meJson.data.user.email === testEmail1, 'Profile email mismatch');
    logPass('GET /api/auth/me retrieved authenticated user profile');

    // 8. Auth - PUT /api/auth/profile
    const updateProfileRes = await fetch(`${API_BASE}/auth/profile`, {
      method: 'PUT',
      headers: {
        'Content-Type': 'application/json',
        Authorization: `Bearer ${token1}`
      },
      body: JSON.stringify({
        name: 'Alice Senior Engineer'
      })
    });
    const updateProfileJson = await updateProfileRes.json();
    assert(updateProfileRes.status === 200, 'PUT /api/auth/profile failed');
    assert(updateProfileJson.data.user.name === 'Alice Senior Engineer', 'Name was not updated');
    logPass('PUT /api/auth/profile successfully updated user name');

    // 9. Project Management - Create Projects
    console.log('\n[Test Group 3] Project Management (MySQL)');
    const p1Res = await fetch(`${API_BASE}/projects`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        Authorization: `Bearer ${token1}`
      },
      body: JSON.stringify({
        title: 'Backend API Revamp',
        description: 'Microservices architecture overhaul',
        status: 'active'
      })
    });
    const p1Json = await p1Res.json();
    assert(p1Res.status === 201, `Create Project 1 failed: ${JSON.stringify(p1Json)}`);
    const project1 = p1Json.data.project;
    assert(project1.title === 'Backend API Revamp', 'Project 1 title mismatch');
    logPass('POST /api/projects created active project');

    const p2Res = await fetch(`${API_BASE}/projects`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        Authorization: `Bearer ${token1}`
      },
      body: JSON.stringify({
        title: 'Mobile App Launch',
        description: 'React Native iOS & Android release',
        status: 'completed'
      })
    });
    const p2Json = await p2Res.json();
    assert(p2Res.status === 201, 'Create Project 2 failed');
    const project2 = p2Json.data.project;
    logPass('POST /api/projects created completed project');

    // 10. Project Management - List Projects
    const listProjRes = await fetch(`${API_BASE}/projects`, {
      headers: { Authorization: `Bearer ${token1}` }
    });
    const listProjJson = await listProjRes.json();
    assert(listProjRes.status === 200, 'List projects failed');
    assert(listProjJson.data.projects.length >= 2, 'Should list at least 2 projects');
    logPass('GET /api/projects retrieved user projects list');

    // 11. Project Management - Get Project By ID
    const getProjRes = await fetch(`${API_BASE}/projects/${project1.id}`, {
      headers: { Authorization: `Bearer ${token1}` }
    });
    const getProjJson = await getProjRes.json();
    assert(getProjRes.status === 200, 'Get single project failed');
    assert(getProjJson.data.project.id === project1.id, 'Project ID mismatch');
    logPass(`GET /api/projects/${project1.id} retrieved project details`);

    // 12. Project Management - Update Project
    const updateProjRes = await fetch(`${API_BASE}/projects/${project1.id}`, {
      method: 'PUT',
      headers: {
        'Content-Type': 'application/json',
        Authorization: `Bearer ${token1}`
      },
      body: JSON.stringify({
        description: 'Updated description for project',
        status: 'active'
      })
    });
    const updateProjJson = await updateProjRes.json();
    assert(updateProjRes.status === 200, 'Update project failed');
    assert(updateProjJson.data.project.description === 'Updated description for project', 'Update project failed');
    logPass(`PUT /api/projects/${project1.id} updated project details`);

    // 13. Task Management (MongoDB) - Create Tasks
    console.log('\n[Test Group 4] Task Management (MongoDB)');
    const t1Res = await fetch(`${API_BASE}/tasks`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        Authorization: `Bearer ${token1}`
      },
      body: JSON.stringify({
        title: 'Design MySQL Schema',
        description: 'Setup users and projects tables with foreign keys',
        status: 'todo',
        priority: 'high',
        projectId: project1.id,
        dueDate: new Date(Date.now() + 86400000).toISOString()
      })
    });
    const t1Json = await t1Res.json();
    assert(t1Res.status === 201, `Create Task 1 failed: ${JSON.stringify(t1Json)}`);
    const task1 = t1Json.data.task;
    assert(task1.title === 'Design MySQL Schema', 'Task 1 title mismatch');
    assert(task1.projectId === project1.id, 'Task 1 projectId mismatch');
    logPass('POST /api/tasks created high-priority todo task in MongoDB');

    const t2Res = await fetch(`${API_BASE}/tasks`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        Authorization: `Bearer ${token1}`
      },
      body: JSON.stringify({
        title: 'Implement JWT Auth',
        description: 'Write auth middleware and bcrypt hash hooks',
        status: 'in_progress',
        priority: 'high',
        projectId: project1.id
      })
    });
    const t2Json = await t2Res.json();
    assert(t2Res.status === 201, 'Create Task 2 failed');
    const task2 = t2Json.data.task;
    logPass('POST /api/tasks created in_progress task');

    const t3Res = await fetch(`${API_BASE}/tasks`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        Authorization: `Bearer ${token1}`
      },
      body: JSON.stringify({
        title: 'App Store Submission',
        description: 'Upload build to App Store Connect',
        status: 'completed',
        priority: 'low',
        projectId: project2.id
      })
    });
    const t3Json = await t3Res.json();
    assert(t3Res.status === 201, 'Create Task 3 failed');
    const task3 = t3Json.data.task;
    logPass('POST /api/tasks created completed low-priority task');

    // 14. Task Pagination & Filtering
    console.log('\n[Test Group 5] Filtering & Pagination');
    // Filter by status=todo
    const filterStatusRes = await fetch(`${API_BASE}/tasks?status=todo`, {
      headers: { Authorization: `Bearer ${token1}` }
    });
    const filterStatusJson = await filterStatusRes.json();
    assert(filterStatusRes.status === 200, 'Filter tasks by status failed');
    assert(filterStatusJson.pagination.totalRecords === 1, `Expected 1 todo task, got ${filterStatusJson.pagination.totalRecords}`);
    assert(filterStatusJson.data[0].status === 'todo', 'Task status is not todo');
    logPass('GET /api/tasks?status=todo filtered tasks by status');

    // Filter by priority=high
    const filterPriorityRes = await fetch(`${API_BASE}/tasks?priority=high`, {
      headers: { Authorization: `Bearer ${token1}` }
    });
    const filterPriorityJson = await filterPriorityRes.json();
    assert(filterPriorityRes.status === 200, 'Filter tasks by priority failed');
    assert(filterPriorityJson.pagination.totalRecords === 2, `Expected 2 high priority tasks, got ${filterPriorityJson.pagination.totalRecords}`);
    logPass('GET /api/tasks?priority=high filtered tasks by priority');

    // Filter by projectId
    const filterProjRes = await fetch(`${API_BASE}/tasks?projectId=${project1.id}`, {
      headers: { Authorization: `Bearer ${token1}` }
    });
    const filterProjJson = await filterProjRes.json();
    assert(filterProjRes.status === 200, 'Filter tasks by projectId failed');
    assert(filterProjJson.pagination.totalRecords === 2, `Expected 2 tasks for project1, got ${filterProjJson.pagination.totalRecords}`);
    logPass(`GET /api/tasks?projectId=${project1.id} filtered tasks by projectId`);

    // Pagination test: page=1&limit=2
    const paginatedRes = await fetch(`${API_BASE}/tasks?page=1&limit=2`, {
      headers: { Authorization: `Bearer ${token1}` }
    });
    const paginatedJson = await paginatedRes.json();
    assert(paginatedRes.status === 200, 'Pagination failed');
    assert(paginatedJson.data.length === 2, 'Page 1 should have exactly 2 records');
    assert(paginatedJson.pagination.totalRecords === 3, 'Total records should be 3');
    assert(paginatedJson.pagination.totalPages === 2, 'Total pages should be 2');
    assert(paginatedJson.pagination.hasNextPage === true, 'Page 1 should have next page');
    assert(paginatedJson.pagination.hasPrevPage === false, 'Page 1 should not have prev page');
    logPass('GET /api/tasks?page=1&limit=2 returned paginated data with pagination metadata');

    // 15. Task Get by ID and Invalid ID
    console.log('\n[Test Group 6] Task Single Resource & Validation');
    const getTaskRes = await fetch(`${API_BASE}/tasks/${task1.id}`, {
      headers: { Authorization: `Bearer ${token1}` }
    });
    const getTaskJson = await getTaskRes.json();
    assert(getTaskRes.status === 200, 'Get single task failed');
    assert(getTaskJson.data.task.id === task1.id, 'Task ID mismatch');
    logPass(`GET /api/tasks/${task1.id} retrieved single task`);

    const invalidTaskRes = await fetch(`${API_BASE}/tasks/invalid-mongo-id-xyz`, {
      headers: { Authorization: `Bearer ${token1}` }
    });
    assert(invalidTaskRes.status === 400, `Expected 400 for invalid mongo ID, got ${invalidTaskRes.status}`);
    logPass('GET /api/tasks/invalid-id properly handled invalid MongoDB ObjectId (400)');

    // 16. Update Task
    const updateTaskRes = await fetch(`${API_BASE}/tasks/${task1.id}`, {
      method: 'PUT',
      headers: {
        'Content-Type': 'application/json',
        Authorization: `Bearer ${token1}`
      },
      body: JSON.stringify({
        status: 'in_progress',
        priority: 'high'
      })
    });
    const updateTaskJson = await updateTaskRes.json();
    assert(updateTaskRes.status === 200, 'Update task failed');
    assert(updateTaskJson.data.task.status === 'in_progress', 'Task status was not updated');
    logPass(`PUT /api/tasks/${task1.id} updated task status to in_progress`);

    // 17. Multi-User Isolation & Authorization
    console.log('\n[Test Group 7] Multi-Tenant Security & Ownership Authorization');
    const testEmail2 = `bob_${Date.now()}@example.com`;
    const user2Reg = await fetch(`${API_BASE}/auth/register`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        name: 'Bob Tester',
        email: testEmail2,
        password: 'password123'
      })
    });
    const user2Json = await user2Reg.json();
    const token2 = user2Json.data.token;

    // Bob tries to access Alice's project -> 403 Forbidden
    const unauthProjRes = await fetch(`${API_BASE}/projects/${project1.id}`, {
      headers: { Authorization: `Bearer ${token2}` }
    });
    assert(unauthProjRes.status === 403, `Expected 403 Forbidden, got ${unauthProjRes.status}`);
    logPass('User 2 blocked from accessing User 1 project (403 Forbidden)');

    // Bob tries to access Alice's task -> 403 Forbidden
    const unauthTaskRes = await fetch(`${API_BASE}/tasks/${task1.id}`, {
      headers: { Authorization: `Bearer ${token2}` }
    });
    assert(unauthTaskRes.status === 403, `Expected 403 Forbidden, got ${unauthTaskRes.status}`);
    logPass('User 2 blocked from accessing User 1 task (403 Forbidden)');

    // Bob tries to create a task assigned to Alice's project -> 403 Forbidden
    const unauthCreateTaskRes = await fetch(`${API_BASE}/tasks`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        Authorization: `Bearer ${token2}`
      },
      body: JSON.stringify({
        title: 'Malicious Task',
        projectId: project1.id
      })
    });
    assert(unauthCreateTaskRes.status === 403, `Expected 403 Forbidden, got ${unauthCreateTaskRes.status}`);
    logPass('User 2 blocked from assigning task to User 1 project (403 Forbidden)');

    // 18. Dashboard API
    console.log('\n[Test Group 8] Cross-Database Dashboard API');
    const dashRes = await fetch(`${API_BASE}/dashboard`, {
      headers: { Authorization: `Bearer ${token1}` }
    });
    const dashJson = await dashRes.json();
    assert(dashRes.status === 200, `Dashboard failed: ${JSON.stringify(dashJson)}`);
    const stats = dashJson.data;

    // Assert exact dashboard fields
    assert(stats.totalProjects === 2, `Expected totalProjects=2, got ${stats.totalProjects}`);
    assert(stats.activeProjects === 1, `Expected activeProjects=1, got ${stats.activeProjects}`);
    assert(stats.completedProjects === 1, `Expected completedProjects=1, got ${stats.completedProjects}`);
    assert(stats.totalTasks === 3, `Expected totalTasks=3, got ${stats.totalTasks}`);
    // pending tasks are: task1 (in_progress) + task2 (in_progress) = 2
    assert(stats.pendingTasks === 2, `Expected pendingTasks=2, got ${stats.pendingTasks}`);
    // completed tasks: task3 = 1
    assert(stats.completedTasks === 1, `Expected completedTasks=1, got ${stats.completedTasks}`);
    // high priority tasks: task1 (high) + task2 (high) = 2
    assert(stats.highPriorityTasks === 2, `Expected highPriorityTasks=2, got ${stats.highPriorityTasks}`);
    logPass('GET /api/dashboard retrieved accurate consolidated MySQL & MongoDB stats');

    // 19. Task Deletion
    console.log('\n[Test Group 9] Resource Cleanup & Cascading');
    const delTaskRes = await fetch(`${API_BASE}/tasks/${task3.id}`, {
      method: 'DELETE',
      headers: { Authorization: `Bearer ${token1}` }
    });
    assert(delTaskRes.status === 200, 'Delete task failed');
    logPass(`DELETE /api/tasks/${task3.id} deleted task`);

    // Verify task is gone
    const checkDeletedTask = await fetch(`${API_BASE}/tasks/${task3.id}`, {
      headers: { Authorization: `Bearer ${token1}` }
    });
    assert(checkDeletedTask.status === 404, `Expected 404 for deleted task, got ${checkDeletedTask.status}`);
    logPass('Task properly returns 404 Not Found after deletion');

    // 20. Project Deletion with MongoDB Task Cascade
    const delProjRes = await fetch(`${API_BASE}/projects/${project1.id}`, {
      method: 'DELETE',
      headers: { Authorization: `Bearer ${token1}` }
    });
    assert(delProjRes.status === 200, 'Delete project failed');
    logPass(`DELETE /api/projects/${project1.id} deleted project and cascaded tasks`);

    // Verify project is gone
    const checkDeletedProj = await fetch(`${API_BASE}/projects/${project1.id}`, {
      headers: { Authorization: `Bearer ${token1}` }
    });
    assert(checkDeletedProj.status === 404, `Expected 404 for deleted project, got ${checkDeletedProj.status}`);
    logPass('Project properly returns 404 Not Found after deletion');

    // Verify cascaded tasks are also gone
    const checkCascadedTask = await fetch(`${API_BASE}/tasks/${task1.id}`, {
      headers: { Authorization: `Bearer ${token1}` }
    });
    assert(checkCascadedTask.status === 404, `Expected 404 for cascaded task, got ${checkCascadedTask.status}`);
    logPass('Cascaded tasks were cleaned up from MongoDB on project deletion');

    console.log('\n======================================================');
    console.log('🎉 ALL 20+ INTEGRATION TESTS PASSED SUCCESSFULLY! 🎉');
    console.log('======================================================\n');
    process.exit(0);
  } catch (err) {
    logFail('Test Suite Failed', err);
  }
};

runTests();
