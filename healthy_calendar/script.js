// ==========================================
// 1. KẾT NỐI FIREBASE ONLINE (Bắt buộc ở đầu file)
// ==========================================
import { initializeApp } from "https://www.gstatic.com/firebasejs/10.8.1/firebase-app.js";
import { getDatabase, ref, onValue, set } from "https://www.gstatic.com/firebasejs/10.8.1/firebase-database.js";

const firebaseConfig = {
    apiKey: "AIzaSyBBk5N2H_z6pLOM-YB9_nKWUBn0qox9N0o",
    authDomain: "teamtracker-edeee.firebaseapp.com",
    databaseURL: "https://teamtracker-edeee-default-rtdb.firebaseio.com",
    projectId: "teamtracker-edeee",
    storageBucket: "teamtracker-edeee.firebasestorage.app",
    messagingSenderId: "424800634605",
    appId: "1:424800634605:web:a1f2e023379f9a94886ee4"
};

const app = initializeApp(firebaseConfig);
const db = getDatabase(app);

// ==========================================
// 2. BIẾN GLOBAL & TRẠNG THÁI
// ==========================================
let usersList = ["Khoi Nguyen"];
let currentUser = localStorage.getItem('appCurrentUser') || "Khoi Nguyen";
let currentSelectedDay = new Date().getDate();
let tasksData = {};
let waterData = { goalLiters: 0, bottleVolLiters: 0, consumedLiters: 0, history: [], lastDate: new Date().toDateString() };
let waterUnsubscribe = null;

const defaultSuggestedTasks = ["💧 Uống đủ 2L nước", "🚫 Không uống đồ ngọt", "🚶 Đi đủ 7000 bước"];

// ==========================================
// 3. GẮN HÀM VÀO WINDOW (Để HTML gọi được từ Module)
// ==========================================
window.handleUserChange = function() {
    const select = document.getElementById('userSelect');
    if (select.value === "ADD_NEW") {
        const newName = prompt("Nhập tên người dùng mới:");
        if (newName && newName.trim() !== "" && !usersList.includes(newName.trim())) {
            usersList.push(newName.trim());
            currentUser = newName.trim();
            set(ref(db, 'users'), usersList); 
        } 
    } else {
        currentUser = select.value;
    }
    localStorage.setItem('appCurrentUser', currentUser);
    renderUserDropdown();
    loadWaterDataOnline();
    renderTasks(currentSelectedDay);
};

window.deleteCurrentUser = function() {
    if (usersList.length <= 1) return alert("Không thể xóa user cuối cùng!");
    if (confirm(`Xóa vĩnh viễn [${currentUser}] khỏi hệ thống? (Dữ liệu nước sẽ mất, task vẫn giữ)`)) {
        set(ref(db, `water/${currentUser}`), null);
        usersList = usersList.filter(u => u !== currentUser);
        currentUser = usersList[0]; 
        set(ref(db, 'users'), usersList); 
        localStorage.setItem('appCurrentUser', currentUser);
        loadWaterDataOnline();
        renderTasks(currentSelectedDay);
    }
};

window.selectDay = function(element, dayNumber) {
    currentSelectedDay = dayNumber; 
    document.querySelectorAll('.day').forEach(d => d.classList.remove('active'));
    element.classList.add('active');
    renderTasks(dayNumber);
};

window.toggleTask = function(dayNumber, taskIndex) {
    tasksData[dayNumber][taskIndex].completed = !tasksData[dayNumber][taskIndex].completed;
    set(ref(db, 'tasks'), tasksData); 
};

window.addTask = function() {
    const inputField = document.getElementById('newTaskInput');
    if(!inputField) return;
    const title = inputField.value.trim(); 
    if (title === "") return; 
    window.addSpecificTaskOnline(title);
    inputField.value = ""; 
};

window.addSpecificTaskOnline = function(titleText) {
    if (!tasksData[currentSelectedDay]) tasksData[currentSelectedDay] = [];
    tasksData[currentSelectedDay].push({ 
        id: "t_" + Date.now(), 
        color: "blue", 
        title: `${titleText} của ${currentUser}`, 
        owner: currentUser, 
        completed: false 
    });
    set(ref(db, 'tasks'), tasksData); 
};

window.handleKeyPress = function(event) { 
    if (event.key === "Enter" || event.keyCode === 13) {
        event.preventDefault(); window.addTask(); 
    }
};

window.deleteTask = function(dayNumber, taskIndex) {
    tasksData[dayNumber].splice(taskIndex, 1);
    set(ref(db, 'tasks'), tasksData); 
};

window.toggleWaterModal = function() { document.getElementById('waterModalOverlay').classList.toggle('open'); };

window.calculateGoal = function() {
    const weight = parseFloat(document.getElementById('weightInput').value);
    if (isNaN(weight) || weight <= 0) { document.getElementById('weightError').style.display = 'block'; return; }
    document.getElementById('weightError').style.display = 'none';

    const minL = weight * 0.03; const maxL = weight * 0.04;
    document.getElementById('waterRecommendationText').innerHTML = `💡 Cần uống từ <b>${minL.toFixed(1)}L - ${maxL.toFixed(1)}L</b> mỗi ngày.`;

    const select = document.getElementById('goalSelect'); select.innerHTML = ''; 
    for (let i = Math.ceil(minL * 10); i <= Math.floor(maxL * 10); i++) {
        const val = (i / 10).toFixed(1);
        select.innerHTML += `<option value="${val}">${val} L</option>`;
    }
    document.getElementById('goalSelectionArea').style.display = 'block';
};

window.goToScreenBottle = function() {
    waterData.goalLiters = parseFloat(document.getElementById('goalSelect').value);
    set(ref(db, `water/${currentUser}`), waterData);
    showWaterScreen('screen-bottle');
};

window.goToScreenTracker = function() {
    const bottleMl = parseInt(document.getElementById('bottleInput').value);
    if (isNaN(bottleMl) || bottleMl <= 0) { document.getElementById('bottleError').style.display = 'block'; return; }
    document.getElementById('bottleError').style.display = 'none';
    waterData.bottleVolLiters = bottleMl / 1000; 
    set(ref(db, `water/${currentUser}`), waterData);
    showWaterScreen('screen-tracker');
};

window.addBottle = function() {
    waterData.consumedLiters += waterData.bottleVolLiters;
    const now = new Date(); const time = `${String(now.getHours()).padStart(2, '0')}:${String(now.getMinutes()).padStart(2, '0')}`;
    if(!waterData.history) waterData.history = []; 
    waterData.history.unshift({ text: `💦 Đã uống ${waterData.bottleVolLiters * 1000}ml`, time: time });
    set(ref(db, `water/${currentUser}`), waterData);
};

window.resetWaterApp = function() {
    if(confirm(`Cài đặt lại app nước của [${currentUser}]?`)) { 
        set(ref(db, `water/${currentUser}`), null);
        document.getElementById('weightInput').value = '';
        document.getElementById('bottleInput').value = '';
        document.getElementById('goalSelectionArea').style.display = 'none';
    }
};

// ==========================================
// 4. HÀM HIỂN THỊ UI
// ==========================================
function renderUserDropdown() {
    const select = document.getElementById('userSelect');
    if(!select) return;
    select.innerHTML = '';
    usersList.forEach(user => {
        select.innerHTML += `<option value="${user}" ${user === currentUser ? 'selected' : ''}>${user}</option>`;
    });
    select.innerHTML += `<option value="ADD_NEW">➕ Thêm User mới...</option>`;
    const nameDisplay = document.getElementById("userNameDisplay");
    if(nameDisplay) nameDisplay.textContent = currentUser;
}

function renderCalendar() {
    const calendarGrid = document.getElementById('calendarGrid');
    if (!calendarGrid) return;
    let html = `
        <div class="weekday">S</div><div class="weekday">M</div><div class="weekday">T</div>
        <div class="weekday">W</div><div class="weekday">T</div><div class="weekday">F</div><div class="weekday">S</div>
    `;
    for(let i = 22; i <= 28; i++) html += `<div class="day muted">${i}</div>`;
    for(let i = 1; i <= 31; i++) {
        let activeClass = (i === currentSelectedDay) ? "active" : "";
        html += `<div class="day ${activeClass}" onclick="window.selectDay(this, ${i})">${i}</div>`;
    }
    calendarGrid.innerHTML = html;
}

function renderProgressBars(tasks) {
    const container = document.getElementById('progressBarsContainer');
    if(!container) return;
    container.innerHTML = "";
    if (!tasks || tasks.length === 0) return;

    const colors = ['#3498db', '#af52de', '#ff9500', '#2ecc71', '#e74c3c'];
    usersList.forEach((user, index) => {
        const uTasks = tasks.filter(t => t.owner === user);
        if (uTasks.length === 0) return;
        const done = uTasks.filter(t => t.completed).length;
        const percent = Math.round((done / uTasks.length) * 100);
        
        container.innerHTML += `
            <div class="user-progress-item">
                <div class="user-progress-label"><span>${user}</span><span>${percent}%</span></div>
                <div class="user-progress-track"><div class="user-progress-fill" style="width: ${percent}%; background-color: ${colors[index % colors.length]}"></div></div>
            </div>`;
    });
}

function renderTasks(dayNumber) {
    const tasks = tasksData[dayNumber] || [];
    renderProgressBars(tasks);

    const taskList = document.getElementById('taskList');
    if(!taskList) return;
    taskList.innerHTML = ""; 

    if (tasks.length === 0) {
        taskList.innerHTML = `<div class="task-item empty"><div class="task-content"><p class="task-title" style="color: var(--text-muted); font-size: 15px;">Chưa có công việc nào.</p></div></div>`;
        return;
    }

    tasks.forEach((task, index) => {
        const isChecked = task.completed ? "checked" : "";
        const opacity = (task.owner === currentUser) ? "1" : "0.5";
        const delBtn = (task.owner === currentUser) ? `<button class="delete-btn" onclick="window.deleteTask(${dayNumber}, ${index})">✕</button>` : "";

        taskList.innerHTML += `
            <div class="task-item ${task.color}" style="opacity: ${opacity}">
                <div class="checkbox-wrapper">
                    <input type="checkbox" id="${task.id}" ${isChecked} onchange="window.toggleTask(${dayNumber}, ${index})">
                </div>
                <div class="task-content">
                    <div class="task-info"><label for="${task.id}" class="task-title">${task.title}</label></div>
                    ${delBtn}
                </div>
            </div>`;
    });
}

function renderSuggestedTasks() {
    const container = document.getElementById('suggestedTasksContainer');
    if (!container) return;
    container.innerHTML = '';
    defaultSuggestedTasks.forEach(taskStr => {
        const btn = document.createElement('button');
        btn.className = 'suggested-task-btn';
        btn.textContent = "+ " + taskStr;
        btn.onclick = () => window.addSpecificTaskOnline(taskStr);
        container.appendChild(btn);
    });
}

function showWaterScreen(id) { 
    document.querySelectorAll('.water-screen').forEach(s => s.classList.remove('active')); 
    if(document.getElementById(id)) document.getElementById(id).classList.add('active'); 
}

function updateWaterUI() {
    const consumed = document.getElementById('consumedText');
    const bar = document.getElementById('progressBar');
    if(!consumed || !bar) return;

    consumed.textContent = waterData.consumedLiters.toFixed(2);
    let p = (waterData.consumedLiters / waterData.goalLiters) * 100;
    bar.style.width = Math.min(p, 100) + '%';
    bar.style.backgroundColor = (p >= 100) ? '#2ecc71' : 'var(--water-primary)'; 
}

function renderWaterHistory() {
    const container = document.getElementById('historyContainer'), list = document.getElementById('historyList');
    if (!container || !list) return;
    if (!waterData.history || waterData.history.length === 0) return container.style.display = 'none';
    container.style.display = 'block'; list.innerHTML = waterData.history.map(i => `<li><span>${i.text}</span> <span class="time-badge">${i.time}</span></li>`).join('');
}

// ==========================================
// 5. ĐỒNG BỘ REAL-TIME (LẮNG NGHE MÂY)
// ==========================================
function loadWaterDataOnline() {
    if(waterUnsubscribe) waterUnsubscribe(); 

    waterUnsubscribe = onValue(ref(db, `water/${currentUser}`), (snapshot) => {
        const data = snapshot.val();
        const today = new Date().toDateString();

        if (data) {
            waterData = data;
            if (waterData.lastDate !== today) {
                waterData.consumedLiters = 0; waterData.history = []; waterData.lastDate = today;
                set(ref(db, `water/${currentUser}`), waterData);
            }
            if (waterData.goalLiters > 0) {
                document.getElementById('goalText').textContent = waterData.goalLiters.toFixed(1);
                document.getElementById('btnBottleVol').textContent = waterData.bottleVolLiters * 1000;
                updateWaterUI(); renderWaterHistory();
                showWaterScreen('screen-tracker');
            } else {
                showWaterScreen('screen-goal');
            }
        } else {
            waterData = { goalLiters: 0, bottleVolLiters: 0, consumedLiters: 0, history: [], lastDate: today };
            showWaterScreen('screen-goal');
        }
    });
}

// Khởi động toàn bộ app khi load xong file
renderCalendar();
renderSuggestedTasks();

onValue(ref(db, 'users'), (snapshot) => {
    const data = snapshot.val();
    if (data) {
        usersList = data;
        if (!usersList.includes(currentUser)) currentUser = usersList[0];
    } else {
        usersList = ["Khoi Nguyen", "Khách"];
        set(ref(db, 'users'), usersList); 
    }
    localStorage.setItem('appCurrentUser', currentUser);
    renderUserDropdown();
});

onValue(ref(db, 'tasks'), (snapshot) => {
    tasksData = snapshot.val() || {};
    renderTasks(currentSelectedDay);
});

loadWaterDataOnline();
