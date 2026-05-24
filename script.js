// --- State Management ---
let tasks = JSON.parse(localStorage.getItem("tasks")) || [];

// --- Selectors ---
const taskForm = document.getElementById("taskForm");
const taskInput = document.getElementById("taskInput");
const prioritySelect = document.getElementById("prioritySelect");
const taskList = document.getElementById("taskList");
const taskStats = document.getElementById("taskStats");
const errorMsg = document.getElementById("errorMsg");
const celebration = document.getElementById("celebration");
const themeSwitcher = document.getElementById("themeSwitcher");

// --- Initialization ---
document.addEventListener("DOMContentLoaded", () => {
  renderTasks();
  initTheme();
});

// --- Core Functions ---

function addTask() {
  const text = taskInput.value.trim();

  if (text === "") {
    errorMsg.textContent = "Please enter a task.";
    taskInput.focus();
    return;
  }

  errorMsg.textContent = "";

  const now = new Date();
  const dayNames = ["Sunday", "Monday", "Tuesday", "Wednesday", "Thursday", "Friday", "Saturday"];
  const day = dayNames[now.getDay()];
  const date = `${now.getDate()} ${now.toLocaleString("default", { month: "long" })} ${now.getFullYear()}`;
  const time = now.toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" });

  // Read priority from the selector (default to "medium" if element is missing)
  const priority = prioritySelect ? prioritySelect.value : "medium";

  const newTask = {
    id: Date.now(),
    text: text,
    completed: false,
    priority: priority,
    timestamp: `(${day}, ${date} at ${time})`
  };

  tasks.push(newTask);
  // Sort tasks: high → medium → low, completed go to bottom
  sortTasks();
  saveAndRender();
  taskInput.value = "";
  if (prioritySelect) prioritySelect.value = "medium";
}

function removeTask(id) {
  tasks = tasks.filter(task => task.id !== id);
  saveAndRender();
}

function toggleTask(id) {
  tasks = tasks.map(task => {
    if (task.id === id) {
      return { ...task, completed: !task.completed };
    }
    return task;
  });
  sortTasks();
  saveAndRender();
}

function editTask(id) {
  const task = tasks.find(t => t.id === id);
  if (!task) return;

  const newText = prompt("Edit task:", task.text);
  if (newText !== null && newText.trim() !== "") {
    task.text = newText.trim();
    saveAndRender();
  }
}

/**
 * Sorts tasks so that:
 *  - Incomplete tasks appear before completed ones.
 *  - Within each group, high > medium > low priority.
 */
function sortTasks() {
  const priorityOrder = { high: 0, medium: 1, low: 2 };
  tasks.sort((a, b) => {
    if (a.completed !== b.completed) return a.completed ? 1 : -1;
    const pa = priorityOrder[a.priority] ?? 1;
    const pb = priorityOrder[b.priority] ?? 1;
    return pa - pb;
  });
}

function saveAndRender() {
  localStorage.setItem("tasks", JSON.stringify(tasks));
  renderTasks();
}

// --- Priority helpers ---
const PRIORITY_LABELS = {
  high: { emoji: "🔴", label: "High" },
  medium: { emoji: "🟡", label: "Medium" },
  low: { emoji: "🟢", label: "Low" }
};

function getPriorityBadgeHTML(priority) {
  const p = PRIORITY_LABELS[priority] || PRIORITY_LABELS.medium;
  return `<span class="priority-badge priority-badge--${priority}" aria-label="Priority: ${p.label}">${p.emoji} ${p.label}</span>`;
}

function renderTasks() {
  taskList.innerHTML = "";

  tasks.forEach(task => {
    const priority = task.priority || "medium";
    const li = document.createElement("li");
    li.classList.add(`priority-${priority}`);
    if (task.completed) li.classList.add("completed");

    li.innerHTML = `
      <input type="checkbox" ${task.completed ? "checked" : ""} onchange="toggleTask(${task.id})" aria-label="Mark '${task.text.replace(/'/g, "\\'")}' as ${task.completed ? "incomplete" : "complete"}">
      <span>
        ${task.text}
        <small>${task.timestamp}</small>
      </span>
      ${getPriorityBadgeHTML(priority)}
      <div style="display: flex; gap: 5px;">
        <button onclick="editTask(${task.id})" style="padding: 0.5rem; font-size: 0.8rem;" aria-label="Edit task: ${task.text.replace(/"/g, '&quot;')}">Edit</button>
        <button onclick="removeTask(${task.id})" style="padding: 0.5rem; font-size: 0.8rem; background: var(--error-color, #ef4444);" aria-label="Remove task: ${task.text.replace(/"/g, '&quot;')}">Remove</button>
      </div>
    `;

    taskList.appendChild(li);
  });

  updateStats();
}

function updateStats() {
  const completedCount = tasks.filter(t => t.completed).length;
  const totalCount = tasks.length;
  const highCount = tasks.filter(t => t.priority === "high" && !t.completed).length;

  if (taskStats) {
    let statsText = `✅ ${completedCount} / ${totalCount} completed`;
    if (highCount > 0) {
      statsText += ` · 🔴 ${highCount} high-priority pending`;
    }
    taskStats.innerText = statsText;
  }

  if (celebration) {
    if (totalCount > 0 && completedCount === totalCount) {
      celebration.classList.remove("hidden");
      setTimeout(() => celebration.classList.add("show"), 10);
    } else {
      celebration.classList.remove("show");
      celebration.classList.add("hidden");
    }
  }
}

// --- Theme Management ---

function initTheme() {
  const savedTheme = localStorage.getItem("theme") || "light";
  document.documentElement.setAttribute("data-theme", savedTheme);

  if (themeSwitcher) {
    themeSwitcher.value = savedTheme;
    themeSwitcher.addEventListener("change", (e) => {
      const selectedTheme = e.target.value;
      document.documentElement.setAttribute("data-theme", selectedTheme);
      localStorage.setItem("theme", selectedTheme);
    });
  }
}

// Expose functions to window for inline event handlers
window.addTask = addTask;
window.toggleTask = toggleTask;
window.removeTask = removeTask;
window.editTask = editTask;
