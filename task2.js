document.addEventListener('DOMContentLoaded', function() {
    const taskInput = document.getElementById('taskInput');
    const addTaskBtn = document.getElementById('addTaskBtn');
    const taskList = document.getElementById('taskList');
    const filterBtns = document.querySelectorAll('.filter-btn');
    const remainingCount = document.getElementById('remainingCount');
    const clearCompletedBtn = document.getElementById('clearCompleted');
    
    let tasks = JSON.parse(localStorage.getItem('tasks')) || [];
    let currentFilter = 'all';
    
    // Initialize the app
    function init() {
        renderTasks();
        updateRemainingCount();
        addEventListeners();
    }
    
    // Add event listeners
    function addEventListeners() {
        addTaskBtn.addEventListener('click', addTask);
        taskInput.addEventListener('keypress', function(e) {
            if (e.key === 'Enter') addTask();
        });
        
        filterBtns.forEach(btn => {
            btn.addEventListener('click', function() {
                filterBtns.forEach(b => b.classList.remove('active'));
                this.classList.add('active');
                currentFilter = this.dataset.filter;
                renderTasks();
            });
        });
        
        clearCompletedBtn.addEventListener('click', clearCompletedTasks);
    }
    
    // Add a new task
    function addTask() {
        const taskText = taskInput.value.trim();
        if (taskText === '') return;
        
        const newTask = {
            id: Date.now(),
            text: taskText,
            completed: false
        };
        
        tasks.unshift(newTask);
        saveTasks();
        renderTasks();
        updateRemainingCount();
        
        taskInput.value = '';
        taskInput.focus();
    }
    
    // Render tasks based on current filter
    function renderTasks() {
        taskList.innerHTML = '';
        
        let filteredTasks = [];
        switch (currentFilter) {
            case 'active':
                filteredTasks = tasks.filter(task => !task.completed);
                break;
            case 'completed':
                filteredTasks = tasks.filter(task => task.completed);
                break;
            default:
                filteredTasks = [...tasks];
        }
        
        if (filteredTasks.length === 0) {
            const emptyMessage = document.createElement('li');
            emptyMessage.textContent = currentFilter === 'all' ? 'No tasks yet!' : 
                                      currentFilter === 'active' ? 'No active tasks!' : 'No completed tasks!';
            emptyMessage.classList.add('empty-message');
            taskList.appendChild(emptyMessage);
            return;
        }
        
        filteredTasks.forEach(task => {
            const taskItem = document.createElement('li');
            taskItem.className = 'task-item';
            taskItem.dataset.id = task.id;
            
            taskItem.innerHTML = `
                <input type="checkbox" class="task-checkbox" ${task.completed ? 'checked' : ''}>
                <span class="task-text ${task.completed ? 'completed' : ''}">${task.text}</span>
                <button class="delete-btn"><i class="fas fa-trash"></i></button>
            `;
            
            const checkbox = taskItem.querySelector('.task-checkbox');
            const taskText = taskItem.querySelector('.task-text');
            const deleteBtn = taskItem.querySelector('.delete-btn');
            
            checkbox.addEventListener('change', function() {
                toggleTaskComplete(task.id);
            });
            
            taskText.addEventListener('dblclick', function() {
                editTask(task.id, taskText);
            });
            
            deleteBtn.addEventListener('click', function() {
                deleteTask(task.id);
            });
            
            taskList.appendChild(taskItem);
        });
    }
    
    // Toggle task completion status
    function toggleTaskComplete(id) {
        tasks = tasks.map(task => {
            if (task.id === id) {
                return {...task, completed: !task.completed};
            }
            return task;
        });
        
        saveTasks();
        updateRemainingCount();
        
        if (currentFilter !== 'all') {
            renderTasks();
        }
    }
    
    // Edit task text
    function editTask(id, taskTextElement) {
        const currentText = taskTextElement.textContent;
        const input = document.createElement('input');
        input.type = 'text';
        input.value = currentText;
        input.classList.add('edit-input');
        
        taskTextElement.replaceWith(input);
        input.focus();
        
        function saveEdit() {
            const newText = input.value.trim();
            if (newText && newText !== currentText) {
                tasks = tasks.map(task => {
                    if (task.id === id) {
                        return {...task, text: newText};
                    }
                    return task;
                });
                saveTasks();
            }
            
            // Revert back to text display
            taskTextElement.textContent = newText || currentText;
            input.replaceWith(taskTextElement);
        }
        
        input.addEventListener('blur', saveEdit);
        input.addEventListener('keypress', function(e) {
            if (e.key === 'Enter') {
                saveEdit();
            }
        });
    }
    
    // Delete a task
    function deleteTask(id) {
        tasks = tasks.filter(task => task.id !== id);
        saveTasks();
        renderTasks();
        updateRemainingCount();
    }
    
    // Clear all completed tasks
    function clearCompletedTasks() {
        tasks = tasks.filter(task => !task.completed);
        saveTasks();
        renderTasks();
        updateRemainingCount();
    }
    
    // Update the remaining tasks count
    function updateRemainingCount() {
        const remainingTasks = tasks.filter(task => !task.completed).length;
        remainingCount.textContent = `${remainingTasks} ${remainingTasks === 1 ? 'task' : 'tasks'} remaining`;
    }
    
    // Save tasks to localStorage
    function saveTasks() {
        localStorage.setItem('tasks', JSON.stringify(tasks));
    }
    
    // Initialize the application
    init();
});