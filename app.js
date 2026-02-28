// ============================================
//   TASK MANAGER - Gerenciador de Tarefas
//   Desenvolvido com HTML, CSS e JavaScript
//   Conceitos: CRUD, LocalStorage, DOM, ES6+
// ============================================

// ---- ESTADO GLOBAL ----
let tasks = JSON.parse(localStorage.getItem('tasks')) || [];
let currentFilter = 'all';

// ---- INICIALIZAÇÃO ----
document.addEventListener('DOMContentLoaded', () => {
  renderTasks();

  // Permite pressionar Enter para adicionar tarefa
  document.getElementById('taskInput').addEventListener('keypress', (e) => {
    if (e.key === 'Enter') addTask();
  });
});

// ---- SALVAR NO LOCALSTORAGE ----
function saveToStorage() {
  localStorage.setItem('tasks', JSON.stringify(tasks));
}

// ---- GERAR ID ÚNICO ----
function generateId() {
  return Date.now().toString(36) + Math.random().toString(36).substring(2);
}

// ---- FORMATAR DATA ----
function formatDate(isoDate) {
  const date = new Date(isoDate);
  return date.toLocaleDateString('pt-BR', {
    day: '2-digit',
    month: '2-digit',
    year: '2-digit',
    hour: '2-digit',
    minute: '2-digit'
  });
}

// ---- ADICIONAR TAREFA (CREATE) ----
function addTask() {
  const input = document.getElementById('taskInput');
  const select = document.getElementById('prioritySelect');
  const text = input.value.trim();

  if (!text) {
    input.style.borderColor = '#dc3545';
    input.focus();
    setTimeout(() => input.style.borderColor = '', 1500);
    return;
  }

  const newTask = {
    id: generateId(),
    text: text,
    priority: select.value,
    done: false,
    createdAt: new Date().toISOString()
  };

  tasks.unshift(newTask); // Adiciona no início da lista
  saveToStorage();
  renderTasks();

  input.value = '';
  input.focus();
}

// ---- ALTERNAR CONCLUSÃO (UPDATE) ----
function toggleTask(id) {
  tasks = tasks.map(task =>
    task.id === id ? { ...task, done: !task.done } : task
  );
  saveToStorage();
  renderTasks();
}

// ---- DELETAR TAREFA (DELETE) ----
function deleteTask(id) {
  tasks = tasks.filter(task => task.id !== id);
  saveToStorage();
  renderTasks();
}

// ---- LIMPAR CONCLUÍDAS ----
function clearCompleted() {
  const completedCount = tasks.filter(t => t.done).length;

  if (completedCount === 0) {
    alert('Não há tarefas concluídas para remover!');
    return;
  }

  if (confirm(`Remover ${completedCount} tarefa(s) concluída(s)?`)) {
    tasks = tasks.filter(task => !task.done);
    saveToStorage();
    renderTasks();
  }
}

// ---- FILTRAR TAREFAS ----
function filterTasks(filter, btn) {
  currentFilter = filter;

  // Atualiza botão ativo
  document.querySelectorAll('.filter-btn').forEach(b => b.classList.remove('active'));
  btn.classList.add('active');

  renderTasks();
}

// ---- OBTER TAREFAS FILTRADAS ----
function getFilteredTasks() {
  switch (currentFilter) {
    case 'pending': return tasks.filter(t => !t.done);
    case 'done':    return tasks.filter(t => t.done);
    default:        return tasks;
  }
}

// ---- ATUALIZAR CONTADORES ----
function updateCounters() {
  const total = tasks.length;
  const done  = tasks.filter(t => t.done).length;
  const pending = total - done;

  document.getElementById('totalCount').textContent   = total;
  document.getElementById('pendingCount').textContent = pending;
  document.getElementById('doneCount').textContent    = done;
}

// ---- RENDERIZAR TAREFAS (READ) ----
function renderTasks() {
  const list = document.getElementById('taskList');
  const emptyState = document.getElementById('emptyState');
  const filtered = getFilteredTasks();

  list.innerHTML = '';

  if (filtered.length === 0) {
    emptyState.style.display = 'block';
  } else {
    emptyState.style.display = 'none';

    filtered.forEach(task => {
      const li = document.createElement('li');
      li.className = `task-item ${task.done ? 'done' : ''}`;

      li.innerHTML = `
        <input
          type="checkbox"
          class="task-checkbox"
          ${task.done ? 'checked' : ''}
          onchange="toggleTask('${task.id}')"
          title="Marcar como ${task.done ? 'pendente' : 'concluída'}"
        />
        <div class="task-content">
          <span class="task-text">${escapeHTML(task.text)}</span>
          <div class="task-meta">
            <span class="badge ${task.priority}">${priorityLabel(task.priority)}</span>
            <span class="task-date">
              <i class="fas fa-clock"></i> ${formatDate(task.createdAt)}
            </span>
          </div>
        </div>
        <button class="delete-btn" onclick="deleteTask('${task.id}')" title="Excluir tarefa">
          <i class="fas fa-trash"></i>
        </button>
      `;

      list.appendChild(li);
    });
  }

  updateCounters();
}

// ---- HELPERS ----
function priorityLabel(priority) {
  const labels = { alta: '🔴 Alta', media: '🟡 Média', baixa: '🟢 Baixa' };
  return labels[priority] || priority;
}

// Segurança: evitar injeção de HTML
function escapeHTML(str) {
  return str
    .replace(/&/g, '&amp;')
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;')
    .replace(/"/g, '&quot;')
    .replace(/'/g, '&#039;');
}
