function addTask() {
  const input = document.getElementById("taskInput");
  const task = input.value.trim();
  const errorMsg = document.getElementById("errorMsg");

  if (task === "") {
    errorMsg.textContent = "Please enter a task.";
    return;
  };
  errorMsg.textContent = "";
  const li = document.createElement("li");


  const checkbox = document.createElement("input");
  checkbox.type = "checkbox";
  checkbox.addEventListener("change", function () {
    toggleTask(checkbox);
  });

  const span = document.createElement("span");
  span.textContent = task;

  const now = new Date();
  const dayNames = ["Sunday", "Monday", "Tuesday", "Wednesday", "Thursday", "Friday", "Saturday"];
  const day = dayNames[now.getDay()];
  const date =`${now.getDate()} ${now.toLocaleString("default", { month: "long" })} ${now.getFullYear()}`;
  const time = now.toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" });
  const timeElement = document.createElement("small");
  timeElement.textContent = ` ${day}, ${date} at ${time}`;

  // Text wrapper 
  const textWrapper = document.createElement("div");
  textWrapper.className = "task-text-wrapper";
  textWrapper.appendChild(span);
  textWrapper.appendChild(timeElement);

  // Edit button
  const editButton = document.createElement("button");
  editButton.textContent = "Edit";
  editButton.setAttribute("aria-label", "Edit task");
  editButton.setAttribute("title", "Edit task");
  editButton.addEventListener("click", function () {
    const newTask = prompt("Edit task:", span.textContent);
    if (newTask !== null && newTask.trim() !== "") {
      span.textContent = newTask.trim();
    }
  });
  
  // Remove button
  const removeButton = document.createElement("button");
  removeButton.textContent = "Remove";
  removeButton.setAttribute("title", "Remove task");
  removeButton.setAttribute("aria-label", "Remove task");
  removeButton.addEventListener("click", function () {
    li.remove();

    taskTracker();
    
  });



  li.appendChild(checkbox);
  li.appendChild(textWrapper);
  li.appendChild(editButton);
  li.appendChild(removeButton);

  document.getElementById("taskList").appendChild(li);
  
  input.value = "";

  taskTracker();

}

/* =========================
   MULTI-THEME SWITCHER
========================= */

const themeSwitcher = document.getElementById("themeSwitcher");

// Load saved theme
const savedTheme = localStorage.getItem("theme") || "light";
document.documentElement.setAttribute("data-theme", savedTheme);

if (themeSwitcher) {
  themeSwitcher.value = savedTheme;

  themeSwitcher.addEventListener("change", function (e) {
    const selectedTheme = e.target.value;

    document.documentElement.setAttribute("data-theme", selectedTheme);
    localStorage.setItem("theme", selectedTheme);
  });
}




function toggleTask(checkbox) {
  const textWrapper = checkbox.nextElementSibling;
  const span = textWrapper.querySelector("span");
  span.classList.toggle("completed");

  taskTracker();
}


function taskTracker() {
  const tasks = document.querySelectorAll("#taskList li");
  const completed = document.querySelectorAll("#taskList input:checked");

  const empty = document.getElementById("emptyState");
  if (empty) {
    empty.style.display = tasks.length === 0 ? "block" : "none";
  }

  const stats = document.getElementById("taskStats");
  if (stats) {
    stats.innerText = `✅ ${completed.length} / ${tasks.length} completed`;
  }

  const celebration = document.getElementById("celebration");

  if (tasks.length > 0 && tasks.length === completed.length) {
    celebration.classList.remove("hidden");

    setTimeout(() => {
      celebration.classList.add("show");
    }, 100);
  } else {
    celebration.classList.remove("show");
    celebration.classList.add("hidden");
  }
}


