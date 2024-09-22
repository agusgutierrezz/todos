// Selecting elements
const taskInput = document.getElementById('task-input');
const addTaskBtn = document.getElementById('add-task-btn');
const taskList = document.getElementById('pending-tasks');
const filterBtns = document.querySelectorAll('.filter-btn');
const errorMessage = document.getElementById('error-message');
const taskPriority = document.getElementById('task-priority');
const pendingList = document.getElementById('pending-list');
const completedList = document.getElementById('completed-list');
// Event listeners
addTaskBtn.addEventListener('click', function(event) {
      event.preventDefault(); // Prevent default action (if in a form)
      addTask(); // Call the addTask function
});

pendingList.addEventListener('click', handleTaskAction);
completedList.addEventListener('click', handleTaskAction);

// Load tasks from local storage
document.addEventListener('DOMContentLoaded', loadTasksFromLocalStorage);

// Validate the input
let errorDisplayed = false; // Flag to track if an error message is shown

// Validate the input
function validateInput(taskText) {
  if (taskText.trim() === '') {
      errorMessage.innerText = 'Please enter a task.'; // Set error message
      errorMessage.classList.add('visible'); // Show error message

      // Automatically hide the error message after 3 seconds
      setTimeout(() => {
          errorMessage.classList.remove('visible');
      }, 3000); // Duration to display the error message

      return false; // Input is invalid
  } else {
      errorMessage.classList.remove('visible'); // Hide error message if valid
      return true; // Input is valid
  }
}
function addTask() {
  const taskText = taskInput.value;
  const priority = taskPriority.value;

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

  // Select lists in the DOM
  const pendingList = document.getElementById('pending-list');
  const completedList = document.getElementById('completed-list');

  if (!pendingList || !completedList) {
    console.error('Task lists not found in the DOM.');
    return;
  }

  // Create the task element
  const taskItem = document.createElement('li');
  taskItem.classList.add('task-item');
  taskItem.setAttribute('data-id', task.id);
  taskItem.setAttribute('data-priority', task.priority);

  const taskContent = document.createElement('span');
  taskContent.classList.add('task-content');
  taskContent.innerText = `${task.text} (${task.priority})`;
  taskItem.appendChild(taskContent);

  const completeBtn = document.createElement('button');
  completeBtn.innerHTML = '<i class="fas fa-check"></i>';
  completeBtn.classList.add('complete-btn');
  taskItem.appendChild(completeBtn);

  const deleteBtn = document.createElement('button');
  deleteBtn.innerHTML = '<i class="fas fa-trash"></i>';
  deleteBtn.classList.add('delete-btn');
  taskItem.appendChild(deleteBtn);

  // Append the task to the pending list by default
  pendingList.appendChild(taskItem);

  taskInput.value = '';
  taskPriority.value = 'low'; // Reset priority to low
}




function renderTask(task) {
  const taskItem = document.createElement('li');
  taskItem.classList.add('task-item');
  taskItem.setAttribute('data-id', task.id);
  taskItem.setAttribute('data-priority', task.priority);

  if (task.completed) {
    taskItem.classList.add('completed');
  }

  // Create task content container
  const taskContent = document.createElement('div');
  taskContent.classList.add('task-content');

  // Create separate <p> for task text
  const taskText = document.createElement('p');
  taskText.classList.add('task-text');
  taskText.innerText = task.text; // Task text

  // Create separate <p> for task priority
  const taskPriority = document.createElement('p');
  taskPriority.innerText = `Priority: ${task.priority}`; // Task priority

  // Append the task text and priority to the task content container
  taskContent.appendChild(taskText);
  taskContent.appendChild(taskPriority);

  // Append task content to the task item
  taskItem.appendChild(taskContent);

  // Complete button
  const completeBtn = document.createElement('button');
  completeBtn.innerHTML = '<i class="fas fa-check"></i>';
  completeBtn.classList.add('complete-btn');
  taskItem.appendChild(completeBtn);

  // Delete button
  const deleteBtn = document.createElement('button');
  deleteBtn.innerHTML = '<i class="fas fa-trash"></i>';
  deleteBtn.classList.add('delete-btn');
  taskItem.appendChild(deleteBtn);

  // Ensure the pending and completed lists are present in the DOM
  const pendingList = document.getElementById('pending-list');
  const completedList = document.getElementById('completed-list');

  if (!pendingList || !completedList) {
    console.error('Task lists not found in the DOM.');
    return;
  }

  // Append task to the appropriate list
  if (task.completed) {
    completedList.appendChild(taskItem);
  } else {
    pendingList.appendChild(taskItem);
  }
}


// Handle task actions (complete or delete)
function handleTaskAction(e) {
  const taskItem = e.target.parentElement;
  const id = taskItem.getAttribute('data-id');
console.log("click")
  if (e.target.classList.contains('delete-btn')) {
      removeTaskFromLocalStorage(id);
      taskItem.remove();
  } else if (e.target.classList.contains('complete-btn')) {
      toggleTaskCompletion(id);

      // Move task item between columns
      if (taskItem.classList.contains('completed')) {
          taskItem.classList.remove('completed');
          document.getElementById('pending-list').appendChild(taskItem);
      } else {
          taskItem.classList.add('completed');
          document.getElementById('completed-list').appendChild(taskItem);
      }
  }

  // Check for empty lists and toggle messages
  toggleNoTasksMessage('pending-tasks', 'pending-message');
  toggleNoTasksMessage('completed-tasks', 'completed-message');
}
function toggleNoTasksMessage() {
  const pendingList = document.getElementById('pending-list');
  const completedList = document.getElementById('completed-list');
  const noPendingMessage = document.getElementById('pending-message');
  const noCompletedMessage = document.getElementById('completed-message');

  // Check if the lists exist before attempting to access children
  if (!pendingList || !completedList) {
    console.error('Pending or Completed list not found in the DOM.');
    return;
  }

  // Show or hide "no tasks" messages based on whether tasks exist
  if (pendingList.children.length === 0) {
    noPendingMessage.style.display = 'block';
  } else {
    noPendingMessage.style.display = 'none';
  }

  if (completedList.children.length === 0) {
    noCompletedMessage.style.display = 'block';
  } else {
    noCompletedMessage.style.display = 'none';
  }
}


// Check the lists initially
toggleNoTasksMessage('pending-list', 'pending-message');
toggleNoTasksMessage('completed-list', 'completed-message');


// Toggle task completion
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
  const filterType = event.target.getAttribute('data-filter'); // Get the filter type
  const taskItems = document.querySelectorAll('.task-item'); // Get all task items

  const pendingContainer = document.getElementById('pending-list-container');
  const completedContainer = document.getElementById('completed-list-container');

  taskItems.forEach(taskItem => {
    const isCompleted = taskItem.classList.contains('completed');

    // Show or hide task items based on the filter type
    if (filterType === 'all') {
      taskItem.style.display = 'block'; // Show all tasks
      pendingContainer.style.display = 'block'; // Show pending column
      completedContainer.style.display = 'block'; // Show completed column
    } else if (filterType === 'completed') {
      if (isCompleted) {
        taskItem.style.display = 'block'; // Show completed tasks
        completedContainer.style.display = 'block'; // Show completed column
      } else {
        taskItem.style.display = 'none'; // Hide incomplete tasks
      }
      pendingContainer.style.display = 'none'; // Hide pending column
    } else if (filterType === 'pending') {
      if (!isCompleted) {
        taskItem.style.display = 'block'; // Show pending tasks
        pendingContainer.style.display = 'block'; // Show pending column
      } else {
        taskItem.style.display = 'none'; // Hide completed tasks
      }
      completedContainer.style.display = 'none'; // Hide completed column
    }
  });

  toggleNoTasksMessage(); // Update the "no tasks" message visibility
}


// Event listeners for filtering
document.querySelectorAll('.filter-btn').forEach(btn => {
    btn.addEventListener('click', filterTasks);
});

// Attach the filter event listeners
document.querySelectorAll('.filter-btn').forEach(btn => {
  btn.addEventListener('click', filterTasks);
});




function saveTaskToLocalStorage(task) {
  const tasks = getTasksFromLocalStorage();
  tasks.push(task);
  localStorage.setItem('tasks', JSON.stringify(tasks));
}



function getTasksFromLocalStorage() {
  return localStorage.getItem('tasks') ? JSON.parse(localStorage.getItem('tasks')) : [];
}



// Remove task from local storage
function removeTaskFromLocalStorage(id) {
  let tasks = getTasksFromLocalStorage();
  tasks = tasks.filter(task => task.id != id);
  localStorage.setItem('tasks', JSON.stringify(tasks));
}



function loadTasksFromLocalStorage() {
  const tasks = getTasksFromLocalStorage();
  tasks.forEach(task => renderTask(task));

  toggleNoTasksMessage('pending-tasks', 'pending-message');
  toggleNoTasksMessage('completed-tasks', 'completed-message');
}
