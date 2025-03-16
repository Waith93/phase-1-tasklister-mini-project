document.addEventListener("DOMContentLoaded", () => {
  const taskForm = document.getElementById("task-form");
  const taskInput = document.getElementById("task-input");
  const durationInput = document.getElementById("duration-input");
  const dueDateInput = document.getElementById("due-date-input");
  const prioritySelect = document.getElementById("priority");
  const taskList = document.getElementById("task-list");
  const sortButton = document.getElementById("sort-btn");

  let sortAscending = true; 

  loadTasks();
  updateProgress();

  taskForm.addEventListener("submit", (event) => {
    event.preventDefault();

    const taskText = taskInput.value.trim();
    const duration = durationInput.value.trim();
    const dueDate = dueDateInput.value;
    const taskPriority = prioritySelect.value;

    if (!taskText || !duration || !dueDate || !taskPriority) {
      alert("Please fill in all fields.");
      return;
    }

    addTask(taskText, duration, dueDate, taskPriority);
    saveTask(taskText, duration, dueDate, taskPriority);
    sortTasks(); 
    updateProgress();

    taskForm.reset();
  });

  function addTask(text, duration, dueDate, priority, completed) {
    const taskItem = document.createElement("li");
    taskItem.classList.add(priority);

    const checkbox = document.createElement("input");
    checkbox.type = "checkbox";
    checkbox.checked = completed;
    checkbox.classList.add("task-checkbox");

    if (completed) taskItem.classList.add("completed");

    taskItem.innerHTML = `
      <strong class="task-text">${text}</strong> |
      Duration: <span class="task-duration">${duration} hrs</span> |
      Due: <span class="task-due">${dueDate}</span> |
      Priority: <span class="task-priority" style="color:${getPriorityColor(priority)}">${priority}</span>
      <button class="edit-btn">Edit</button>
      <button class="delete-btn">X</button>
    `;
     taskItem.prepend(checkbox);
     taskList.appendChild(taskItem);

     checkbox.addEventListener("change", () => {
      taskItem.classList.toggle("completed", checkbox.checked);
      updateTaskCompletion(text, checkbox.checked);
      updateProgress();
    });
     
    const deleteButton = taskItem.querySelector(".delete-btn");
    deleteButton.addEventListener("click", () => {
      taskList.removeChild(taskItem);
      removeTaskFromStorage(text);
      updateProgress();
    });

    const editButton = taskItem.querySelector(".edit-btn");
    editButton.addEventListener("click", () => editTask(taskItem, text));

    taskList.appendChild(taskItem);
  }

  function editTask(taskItem, oldText) {
    const taskText = taskItem.querySelector(".task-text");
    const taskDuration = taskItem.querySelector(".task-duration");
    const taskDue = taskItem.querySelector(".task-due");
    const taskPriority = taskItem.querySelector(".task-priority");

    const newText = prompt("Edit Task Name:", taskText.textContent);
    const newDuration = prompt("Edit Duration (hrs):", taskDuration.textContent.replace(" hrs", ""));
    const newDue = prompt("Edit Due Date:", taskDue.textContent);
    const newPriority = prompt("Edit Priority (high, medium, low):", taskPriority.textContent.toLowerCase());

    if (newText && newDuration && newDue && (newPriority === "high" || newPriority === "medium" || newPriority === "low")) {
      taskText.textContent = newText;
      taskDuration.textContent = `${newDuration} hrs`;
      taskDue.textContent = newDue;
      taskPriority.textContent = newPriority;
      taskPriority.style.color = getPriorityColor(newPriority);

      updateTaskInStorage(oldText, newText, newDuration, newDue, newPriority);
      sortTasks(); 
    } else {
      alert("Invalid input! Task was not updated.");
    }
  }

  function getPriorityColor() {
    switch (priority) {
      case "high": return "red";
      case "medium": return "orange";
      case "low": return "green";
    }
  }

  function saveTask(text, duration, dueDate, priority) {
    let tasks = JSON.parse(localStorage.getItem("tasks")) || [];
    tasks.push({ text, duration, dueDate, priority });
    localStorage.setItem("tasks", JSON.stringify(tasks));
  }

  function loadTasks() {
    let tasks = JSON.parse(localStorage.getItem("tasks")) || [];
    tasks.forEach(task => addTask(task.text, task.duration, task.dueDate, task.priority));
  }

  function removeTaskFromStorage(text) {
    let tasks = JSON.parse(localStorage.getItem("tasks")) || [];
    tasks = tasks.filter(task => task.text !== text);
    localStorage.setItem("tasks", JSON.stringify(tasks));
  }

  function updateTaskInStorage(oldText, newText, newDuration, newDue, newPriority) {
    let tasks = JSON.parse(localStorage.getItem("tasks")) || [];
    let taskIndex = tasks.findIndex(task => task.text === oldText);
    
    if (taskIndex !== -1) {
      tasks[taskIndex] = { text: newText, duration: newDuration, dueDate: newDue, priority: newPriority };
      localStorage.setItem("tasks", JSON.stringify(tasks));
      console.log(`Task Updated: "${oldText}" → "${newText}"`);
    }
  }

  function sortTasks() {
    let tasks = JSON.parse(localStorage.getItem("tasks")) || [];
    const priorityOrder = { high: 1, medium: 2, low: 3 };

    tasks.sort((a, b) => 
      sortAscending ? priorityOrder[a.priority] - priorityOrder[b.priority] 
                    : priorityOrder[b.priority] - priorityOrder[a.priority]
    );

    localStorage.setItem("tasks", JSON.stringify(tasks));
    taskList.innerHTML = ""; 
    tasks.forEach(task => addTask(task.text, task.duration, task.dueDate, task.priority));

    console.log(`Tasks sorted in ${sortAscending ? "ascending" : "descending"} order.`);
  }

  sortButton.addEventListener("click", () => {
    sortAscending = !sortAscending;
    sortTasks();
    sortButton.textContent = `Sort (${sortAscending ? "Ascending" : "Descending"})`;
  });
  function updateProgress() {
    let tasks = JSON.parse(localStorage.getItem("tasks")) || [];
    let completedTasks = tasks.filter(task => task.completed).length;
    let totalTasks = tasks.length;
  
    let progressPercent = totalTasks > 0 ? (completedTasks / totalTasks) * 100 : 0;
    document.getElementById("progress-bar").style.width = `${progressPercent}%`;
  } 
});