// Selecting elements
const taskInput = document.getElementById('task-input');
const addTaskBtn = document.getElementById('add-task-btn');
const filterBtns = document.querySelectorAll('.filter-btn');
const errorMessage = document.getElementById('error-message');
const taskPriority = document.getElementById('task-priority');
const pendingList = document.getElementById('pending-list');
const completedList = document.getElementById('completed-list');

// Event listeners
addTaskBtn.addEventListener('click', function(event) {
    event.preventDefault();
    addTask();
});

pendingList.addEventListener('click', handleTaskAction);
completedList.addEventListener('click', handleTaskAction);

// Load tasks from local storage on DOM load
document.addEventListener('DOMContentLoaded', loadTasksFromLocalStorage);

// Filter tasks event listener
filterBtns.forEach(btn => btn.addEventListener('click', filterTasks));

// Helper function to create task elements
function createTaskItem(task) {
    const taskItem = document.createElement('li');
    taskItem.classList.add('task-item');
    taskItem.setAttribute('data-id', task.id);
    taskItem.setAttribute('data-priority', task.priority);
    if (task.completed) {
        taskItem.classList.add('completed');
    }

    const taskContent = document.createElement('div');
    taskContent.classList.add('task-content');

    const taskText = document.createElement('p');
    taskText.classList.add('task-text');
    taskText.innerText = task.text;

    const taskPriority = document.createElement('p');
    taskPriority.classList.add('task-tag');
    taskPriority.innerText = task.priority;

    taskContent.appendChild(taskText);
    taskContent.appendChild(taskPriority);

    const completeBtn = document.createElement('button');
    completeBtn.innerHTML = '<i class="fas fa-check"></i>';
    completeBtn.classList.add('complete-btn');

    const deleteBtn = document.createElement('button');
    deleteBtn.innerHTML = '<i class="fas fa-trash"></i>';
    deleteBtn.classList.add('delete-btn');

    taskItem.appendChild(taskContent);
    taskItem.appendChild(completeBtn);
    taskItem.appendChild(deleteBtn);

    return taskItem;
}

// Add a new task
// Handle priority selection with checkboxes
const priorityCheckboxes = document.querySelectorAll('.priority-checkbox');

priorityCheckboxes.forEach(checkbox => {
  checkbox.addEventListener('change', function () {
    // Uncheck other checkboxes when one is selected
    priorityCheckboxes.forEach(box => {
      if (box !== this) {
        box.checked = false;
      }
    });
  });
});

function getSelectedPriority() {
  const selected = document.querySelector('.priority-checkbox:checked');
  return selected ? selected.value : 'Low'; // Default to 'low' if none is selected
}

// Inside addTask function, update this to get the priority from checkboxes
function addTask() {
  const taskText = taskInput.value;
  const priority = getSelectedPriority();

  if (!validateInput(taskText)) {
    return;
  }

  const task = {
    id: Date.now(),
    text: taskText,
    priority: priority,
    completed: false
  };

  saveTaskToLocalStorage(task);
  const taskItem = createTaskItem(task);

  pendingList.appendChild(taskItem);
  taskInput.value = '';
  priorityCheckboxes.forEach(box => box.checked = false); // Reset checkboxes
}


// Render task on the appropriate list
function renderTask(task) {
    const taskItem = createTaskItem(task);
    if (task.completed) {
        completedList.appendChild(taskItem);
    } else {
        pendingList.appendChild(taskItem);
    }
}

// Validate task input
function validateInput(taskText) {
    if (taskText.trim() === '') {
        errorMessage.innerText = 'Please enter a task.';
        errorMessage.classList.add('visible');

        setTimeout(() => {
            errorMessage.classList.remove('visible');
        }, 3000);

        return false;
    }
    errorMessage.classList.remove('visible');
    return true;
}

function handleTaskAction(e) {
  // Find the closest 'li' element regardless of whether the button or icon is clicked
  const taskItem = e.target.closest('.task-item');
  
  // If the task item is not found, exit early
  if (!taskItem) return;

  // Get the task ID
  const id = taskItem.getAttribute('data-id');

  // Check if a delete or complete button was clicked
  if (e.target.closest('.delete-btn')) {
    // Delete the task
    removeTaskFromLocalStorage(id);
    taskItem.remove();
  } else if (e.target.closest('.complete-btn')) {
    // Toggle task completion
    toggleTaskCompletion(id);
    taskItem.classList.toggle('completed');

    // Move the task between pending and completed lists
    if (taskItem.classList.contains('completed')) {
      completedList.appendChild(taskItem);
    } else {
      pendingList.appendChild(taskItem);
    }
  }

  // Check for empty lists and toggle messages
  toggleNoTasksMessage();
}


// Toggle the visibility of "no tasks" messages
function toggleNoTasksMessage() {
    const noPendingMessage = document.getElementById('pending-message');
    const noCompletedMessage = document.getElementById('completed-message');

    noPendingMessage.style.display = pendingList.children.length === 0 ? 'block' : 'none';
    noCompletedMessage.style.display = completedList.children.length === 0 ? 'block' : 'none';
}

// Toggle task completion in local storage
function toggleTaskCompletion(id) {
    const tasks = getTasksFromLocalStorage();
    const updatedTasks = tasks.map(task => {
        if (task.id == id) task.completed = !task.completed;
        return task;
    });
    localStorage.setItem('tasks', JSON.stringify(updatedTasks));
}

// Filter tasks (all, completed, pending)
function filterTasks(event) {
    const filterType = event.target.getAttribute('data-filter');
    const taskItems = document.querySelectorAll('.task-item');

    const pendingContainer = document.getElementById('pending-list-container');
    const completedContainer = document.getElementById('completed-list-container');

    taskItems.forEach(taskItem => {
        const isCompleted = taskItem.classList.contains('completed');

        if (filterType === 'all') {
            taskItem.style.display = 'flex';
            pendingContainer.style.display = 'flex';
            completedContainer.style.display = 'flex';
        } else if (filterType === 'completed') {
            taskItem.style.display = isCompleted ? 'flex' : 'none';
            pendingContainer.style.display = 'none';
            completedContainer.style.display = 'flex';
        } else if (filterType === 'pending') {
            taskItem.style.display = !isCompleted ? 'flex' : 'none';
            pendingContainer.style.display = 'flex';
            completedContainer.style.display = 'none';
        }
    });

    toggleNoTasksMessage();
}

// Save task to local storage
function saveTaskToLocalStorage(task) {
    const tasks = getTasksFromLocalStorage();
    tasks.push(task);
    localStorage.setItem('tasks', JSON.stringify(tasks));
}

// Get tasks from local storage
function getTasksFromLocalStorage() {
    return localStorage.getItem('tasks') ? JSON.parse(localStorage.getItem('tasks')) : [];
}

// Remove task from local storage
function removeTaskFromLocalStorage(id) {
    let tasks = getTasksFromLocalStorage();
    tasks = tasks.filter(task => task.id != id);
    localStorage.setItem('tasks', JSON.stringify(tasks));
}

// Load tasks from local storage
function loadTasksFromLocalStorage() {
    const tasks = getTasksFromLocalStorage();
    tasks.forEach(task => renderTask(task));
    toggleNoTasksMessage();
}
