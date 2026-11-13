
//  TASK DATA AND APPLICATION VARIABLES


// Retrieve previously saved tasks from localStorage.
// If no tasks exist yet, start with an empty array.
const tasks = JSON.parse(localStorage.getItem("tasks")) || [];

// These variables help us know whether we are creating
// a new task or editing an existing one.
let editingTask = null;
let editingTaskCard = null;



//    GET HTML ELEMENTS

// Task form elements
const newTaskButton = document.getElementById("new-task-button");
const taskFormContainer = document.getElementById("task-form-container");
const cancelTaskButton = document.getElementById("cancel-task-button");

const taskTitleInput = document.getElementById("task-title");
const taskDescriptionInput = document.getElementById("task-description");
const taskDateInput = document.getElementById("task-date");
const taskPriorityInput = document.getElementById("task-priority");
const taskForm = document.getElementById("task-form");

// Task column containers
const todoList = document.getElementById("todo-list");
const inProgressList = document.getElementById("in-progress-list");
const completedList = document.getElementById("completed-list");

// Task count elements
const todoCount = document.getElementById("todo-count");
const progressCount = document.getElementById("progress-count");
const completedCount = document.getElementById("completed-count");

// Search and date filter elements
const searchInput = document.getElementById("search-input");
const dateFilter = document.getElementById("date-filter");

// SAVE TASKS TO LOCAL STORAGE


// JSON.stringify converts our JavaScript array into text.
// localStorage stores that text in the browser.
function saveTasks() {
    localStorage.setItem("tasks", JSON.stringify(tasks));
}


// SORT TASKS BY DUE DATE


// Arrange task cards from the earliest due date
// to the latest due date.
function sortTaskList(taskList) {
    const taskCards = Array.from(taskList.children);

    taskCards.sort(function (a, b) {
        return (a.dataset.date || "").localeCompare(b.dataset.date || "");
    });

    // Put the cards back into the container in their new order.
    taskCards.forEach(function (card) {
        taskList.appendChild(card);
    });
}


// UPDATE TASK COUNTS


// Count only the task cards currently visible
// after searching or applying a date filter.
function updateTaskCounts() {
    todoCount.textContent =
        todoList.querySelectorAll(".task-card:not([hidden])").length;

    progressCount.textContent =
        inProgressList.querySelectorAll(".task-card:not([hidden])").length;

    completedCount.textContent =
        completedList.querySelectorAll(".task-card:not([hidden])").length;
}


// SEARCH AND DATE FILTER


function filterTasks() {

    const searchTerm = searchInput.value.toLowerCase();
    const selectedDate = dateFilter.value;

    // Get today's date in YYYY-MM-DD format.
    const today = new Date();

    const todayString =
        today.getFullYear() + "-" +
        String(today.getMonth() + 1).padStart(2, "0") + "-" +
        String(today.getDate()).padStart(2, "0");

    // Calculate the beginning of the current week (Monday).
    const startOfWeek = new Date(today);

    startOfWeek.setDate(
        today.getDate() - ((today.getDay() + 6) % 7)
    );

    // Calculate the end of the current week (Sunday).
    const endOfWeek = new Date(startOfWeek);

    endOfWeek.setDate(startOfWeek.getDate() + 6);

    // Convert the week dates into YYYY-MM-DD format.
    const startOfWeekString =
        startOfWeek.getFullYear() + "-" +
        String(startOfWeek.getMonth() + 1).padStart(2, "0") + "-" +
        String(startOfWeek.getDate()).padStart(2, "0");

    const endOfWeekString =
        endOfWeek.getFullYear() + "-" +
        String(endOfWeek.getMonth() + 1).padStart(2, "0") + "-" +
        String(endOfWeek.getDate()).padStart(2, "0");

    // Select every task card across the three columns.
    const taskCards = document.querySelectorAll(".task-card");

    taskCards.forEach(function (card) {

        const taskText = card.textContent.toLowerCase();
        const taskDate = card.dataset.date;

        // Check whether the task matches the search input.
        const matchesSearch = taskText.includes(searchTerm);

        let matchesDate = false;

        // Check the selected date filter.
        if (selectedDate === "all") {
            matchesDate = true;

        } else if (selectedDate === "today") {
            matchesDate = taskDate === todayString;

        } else if (selectedDate === "week") {
            matchesDate =
                taskDate >= startOfWeekString &&
                taskDate <= endOfWeekString;
        }

        // A task is visible only when both conditions match.
        card.hidden = !(matchesSearch && matchesDate);
    });
}

// REFRESH DASHBOARD

// Reapply the filters and update the counts.
// Call this whenever the task list changes.
function refreshDashboard() {
    filterTasks();
    updateTaskCounts();
}


//  DISPLAY TASKS ON THE DASHBOARD


// Create a task card using the information
// stored in a task object.
function displayTask(task) {

    const taskCard = document.createElement("div");
    taskCard.classList.add("task-card");

    // Store the due date on the card for filtering and sorting.
    taskCard.dataset.date = task.date;

    // Create the elements that will appear on the card.
    const taskHeading = document.createElement("h4");
    const taskDescriptionElement = document.createElement("p");
    const taskDateElement = document.createElement("span");
    const taskPriorityElement = document.createElement("span");

    // Give the date and priority elements their own CSS classes.
    taskDateElement.classList.add("task-date");
    taskPriorityElement.classList.add("task-priority");

    // Create the task action buttons.
    const deleteButton = document.createElement("button");
    const editButton = document.createElement("button");
    const statusButton = document.createElement("button");


    /* ----- DISPLAY TASK INFORMATION ----- */

    taskHeading.textContent = task.title;
    taskDescriptionElement.textContent = task.description;
    taskDateElement.textContent = task.date;

    // Older tasks without a priority will default to Medium.
    const priority = task.priority || "medium";

    taskPriorityElement.textContent = "Priority: " + priority;

    // Apply the appropriate priority colour.
    taskPriorityElement.classList.add("priority-" + priority);


    /* ----- STATUS BUTTON ----- */

    // Change the button label according to the task status.
    if (task.status === "in-progress") {
        statusButton.textContent = "Mark Completed";

    } else if (task.status === "completed") {
        statusButton.textContent = "Reopen Task";

    } else {
        statusButton.textContent = "Start Task";
    }


    /* ----- DELETE TASK ----- */

    deleteButton.textContent = "Delete";

    deleteButton.addEventListener("click", function () {

        // Find the task in our array.
        const taskIndex = tasks.indexOf(task);

        // Remove it from the array.
        tasks.splice(taskIndex, 1);

        // Remove its card from the dashboard.
        taskCard.remove();

        // Save the updated array and refresh the dashboard.
        saveTasks();
        refreshDashboard();
    });


    /* ----- EDIT TASK ----- */

    editButton.textContent = "Edit";

    editButton.addEventListener("click", function () {

        // Display the form.
        taskFormContainer.hidden = false;

        // Remember which task is being edited.
        editingTask = task;
        editingTaskCard = taskCard;

        // Fill the form with the existing task information.
        taskTitleInput.value = task.title;
        taskDescriptionInput.value = task.description;
        taskDateInput.value = task.date;
        taskPriorityInput.value = priority;
    });


    /* ----- CHANGE TASK STATUS ----- */

    statusButton.addEventListener("click", function () {

        // Move the task to its next status.
        if (task.status === "todo") {
            task.status = "in-progress";

        } else if (task.status === "in-progress") {
            task.status = "completed";

        } else {
            task.status = "todo";
        }

        // Save the updated status.
        saveTasks();

        // Remove the old card and recreate it in the correct column.
        taskCard.remove();
        displayTask(task);

        refreshDashboard();
    });


    /* ----- ADD ELEMENTS TO THE TASK CARD ----- */

    taskCard.appendChild(taskHeading);
    taskCard.appendChild(taskDescriptionElement);
    taskCard.appendChild(taskDateElement);
    taskCard.appendChild(taskPriorityElement);

    taskCard.appendChild(deleteButton);
    taskCard.appendChild(editButton);
    taskCard.appendChild(statusButton);


    /* ----- PLACE TASK IN THE CORRECT COLUMN ----- */

    if (task.status === "in-progress") {
        inProgressList.appendChild(taskCard);

    } else if (task.status === "completed") {
        completedList.appendChild(taskCard);

    } else {
        todoList.appendChild(taskCard);
    }

    // Arrange all three columns by due date.
    sortTaskList(todoList);
    sortTaskList(inProgressList);
    sortTaskList(completedList);
}


// DISPLAY PREVIOUSLY SAVED TASKS


// When the page loads, recreate every task
// previously saved in localStorage.
tasks.forEach(function (task) {
    displayTask(task);
});

// Calculate the initial task counts.
refreshDashboard();


//  OPEN AND CLOSE THE TASK FORM


// Open the form for creating a new task.
newTaskButton.addEventListener("click", function () {

    // Make sure we are creating a new task, not editing an old one.
    editingTask = null;
    editingTaskCard = null;

    taskForm.reset();
    taskFormContainer.hidden = false;
});

// Close the form and clear editing information.
cancelTaskButton.addEventListener("click", function () {

    taskFormContainer.hidden = true;
    taskForm.reset();

    editingTask = null;
    editingTaskCard = null;
});



//   CREATE AND EDIT TASKS


taskForm.addEventListener("submit", function (event) {

    // Prevent the browser from reloading the page.
    event.preventDefault();

    // Collect the information entered into the form.
    const task = {
        title: taskTitleInput.value.trim(),
        description: taskDescriptionInput.value.trim(),
        date: taskDateInput.value,
        priority: taskPriorityInput.value,
        status: "todo"
    };


    // CHECK WHETHER WE ARE EDITING AN EXISTING TASK.
    if (editingTask) {

        // Update the existing task object.
        editingTask.title = task.title;
        editingTask.description = task.description;
        editingTask.date = task.date;
        editingTask.priority = task.priority;

        // Update the date stored on its card.
        editingTaskCard.dataset.date = task.date;

        // Update the visible information on the existing card.
        editingTaskCard.querySelector("h4").textContent = task.title;

        editingTaskCard.querySelector("p").textContent =
            task.description;

        editingTaskCard.querySelector(".task-date").textContent =
            task.date;

        // Update the priority text and colour immediately.
        const priorityElement =
            editingTaskCard.querySelector(".task-priority");

        priorityElement.textContent = "Priority: " + task.priority;

        priorityElement.className =
            "task-priority priority-" + task.priority;

    } else {

        // Otherwise, create a completely new task.
        tasks.push(task);

        displayTask(task);
    }


    // Sort the columns again in case a due date was changed.
    sortTaskList(todoList);
    sortTaskList(inProgressList);
    sortTaskList(completedList);

    // Save the updated tasks.
    saveTasks();

    // Clear and close the form.
    taskForm.reset();
    taskFormContainer.hidden = true;

    // Reset editing variables.
    editingTask = null;
    editingTaskCard = null;

    // Reapply search/date filters and update counts.
    refreshDashboard();
});


//  SEARCH TASKS


// Run the combined filter whenever the user types.
searchInput.addEventListener("input", function () {

    refreshDashboard();
});


// FILTER TASKS BY DATE


// Run the combined filter whenever the selected date changes.
dateFilter.addEventListener("change", function () {

    refreshDashboard();
});
