// ==========================================
// 1. KẾT NỐI FIREBASE ONLINE
// ==========================================
import { initializeApp } from "https://www.gstatic.com/firebasejs/10.8.1/firebase-app.js";
import { getDatabase, ref, onValue, set } from "https://www.gstatic.com/firebasejs/10.8.1/firebase-database.js";

const firebaseConfig = {
    apiKey: "AIzaSyBBk5N2H_z6pLOM-YB9_nKWUBn0qox9N0o",
    authDomain: "teamtracker-edeee.firebaseapp.com",
    databaseURL: "https://teamtracker-edeee-default-rtdb.asia-southeast1.firebasedatabase.app/", 
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
// 3. GẮN HÀM VÀO WINDOW (Cho HTML gọi được)
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
    loadWaterDataOnline();
    renderTasks(currentSelectedDay);
};

window.addTask = function() {
    const inputField = document.getElementById('newTaskInput');
    const title = inputField.value.trim(); 
    if (title === "") return; 
    window.addSpecificTaskOnline(title);
    inputField.value = ""; 
};

window.addSpecificTaskOnline = function(titleText) {
    if (!tasksData[currentSelectedDay]) tasksData[currentSelectedDay] = [];
    tasksData[currentSelectedDay].push({ 
        id: "t_" + Date.now(), 
        title: `${titleText} của ${currentUser}`, 
        owner: currentUser, 
        completed: false 
    });
    set(ref(db, 'tasks'), tasksData); 
};

window.toggleTask = function(day, index) {
    tasksData[day][index].completed = !tasksData[day][index].completed;
    set(ref(db, 'tasks'), tasksData);
};

window.deleteTask = function(day, index) {
    tasksData[day].splice(index, 1);
    set(ref(db, 'tasks'), tasksData);
};

window.selectDay = (el, day) => {
    currentSelectedDay = day;
    document.querySelectorAll('.day').forEach(d => d.classList.remove('active'));
    el.classList.add('active');
    renderTasks(day);
};

window.handleKeyPress = (e) => { if (e.key === "Enter") window.addTask(); };
window.toggleWaterModal = () => document.getElementById('waterModalOverlay').classList.toggle('open');

// --- CÁC HÀM NƯỚC (WATER) ---
window.calculateGoal = function() {
    const weight = parseFloat(document.getElementById('weightInput').value);
    if (isNaN(weight) || weight <= 0) { document.getElementById('weightError').style.display = 'block'; return; }
    document.getElementById('weightError').style.display = 'none';
    const minL = weight * 0.03; const maxL = weight * 0.04;
    document.getElementById('waterRecommendationText').innerHTML = `💡 Cần uống từ <b>${minL.toFixed(1)}L - ${maxL.toFixed(1)}L</b> mỗi ngày.`;
    const select = document.getElementById('goalSelect'); select.innerHTML = ''; 
    for (let i = Math.ceil(minL * 10); i <= Math.floor(maxL * 10); i++) {
        const val = (i / 10).toFixed(1); select.innerHTML += `<option value="${val}">${val} L</option>`;
    }
    document.getElementById('goalSelectionArea').style.display = 'block';
};

window.goToScreenBottle = () => {
    waterData.goalLiters = parseFloat(document.getElementById('goalSelect').value);
    set(ref(db, `water/${currentUser}`), waterData);
};

window.goToScreenTracker = () => {
    const ml = parseInt(document.getElementById('bottleInput').value);
    if (isNaN(ml) || ml <= 0) { document.getElementById('bottleError').style.display = 'block'; return; }
    waterData.bottleVolLiters = ml / 1000;
    set(ref(db, `water/${currentUser}`), waterData);
};

window.addBottle = () => {
    waterData.consumedLiters += waterData.bottleVolLiters;
    const time = new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });
    if(!waterData.history) waterData.history = [];
    waterData.history.unshift({ text: `💦 Đã uống ${waterData.bottleVolLiters * 1000}ml`, time: time });
    set(ref(db, `water/${currentUser}`), waterData);
};

window.resetWaterApp = () => {
    if(confirm("Cài đặt lại app nước?")) set(ref(db, `water/${currentUser}`), null);
};

// ==========================================
// 4. HIỂN THỊ UI
// ==========================================
function renderUserDropdown() {
    const select = document.getElementById('userSelect');
    if(!select) return;
    select.innerHTML = usersList.map(u => `<option value="${u}" ${u === currentUser ? 'selected' : ''}>${u}</option>`).join('') + `<option value="ADD_NEW">➕ Thêm User mới...</option>`;
}

function renderCalendar() {
    const grid = document.getElementById('calendarGrid');
    if(!grid) return;
    let html = `<div class="weekday">S</div><div class="weekday">M</div><div class="weekday">T</div><div class="weekday">W</div><div class="weekday">T</div><div class="weekday">F</div><div class="weekday">S</div>`;
    for(let i = 22; i <= 28; i++) html += `<div class="day muted">${i}</div>`;
    for(let i = 1; i <= 31; i++) html += `<div class="day ${i === currentSelectedDay ? 'active' : ''}" onclick="window.selectDay(this, ${i})">${i}</div>`;
    grid.innerHTML = html;
}

function renderTasks(day) {
    const tasks = tasksData[day] || [];
    const taskList = document.getElementById('taskList');
    const progress = document.getElementById('progressBarsContainer');
    if(!taskList) return;

    // Thanh %
    if(progress) {
        progress.innerHTML = usersList.map(user => {
            const uTasks = tasks.filter(t => t.owner === user);
            if (uTasks.length === 0) return "";
            const pc = Math.round((uTasks.filter(t => t.completed).length / uTasks.length) * 100);
            return `<div class="user-progress-item"><div class="user-progress-label"><span>${user}</span><span>${pc}%</span></div><div class="user-progress-track"><div class="user-progress-fill" style="width:${pc}%; background:#3498db"></div></div></div>`;
        }).join('');
    }

    // Danh sách Task
    taskList.innerHTML = tasks.length === 0 ? `<p style="text-align:center; color:#8e8e93; margin-top:20px;">Chưa có công việc nào.</p>` : "";
    tasks.forEach((t, i) => {
        taskList.innerHTML += `
            <div class="task-item blue" style="opacity:${t.owner === currentUser ? 1 : 0.5}">
                <div class="checkbox-wrapper"><input type="checkbox" ${t.completed ? "checked" : ""} onchange="window.toggleTask(${day}, ${i})"></div>
                <div class="task-content">
                    <div class="task-info"><label class="task-title">${t.title}</label></div>
                    ${t.owner === currentUser ? `<button class="delete-btn" onclick="window.deleteTask(${day}, ${i})">✕</button>` : ""}
                </div>
            </div>`;
    });
}

// ==========================================
// 5. ĐỒNG BỘ REAL-TIME (LẮNG NGHE MÂY)
// ==========================================
function loadWaterDataOnline() {
    if(waterUnsubscribe) waterUnsubscribe();
    waterUnsubscribe = onValue(ref(db, `water/${currentUser}`), (snap) => {
        const data = snap.val();
        const today = new Date().toDateString();
        if (data) {
            waterData = data;
            if (waterData.lastDate !== today) {
                waterData.consumedLiters = 0; waterData.history = []; waterData.lastDate = today;
                set(ref(db, `water/${currentUser}`), waterData);
            }
            // Update UI
            document.getElementById('consumedText').textContent = waterData.consumedLiters.toFixed(2);
            document.getElementById('goalText').textContent = waterData.goalLiters.toFixed(1);
            const p = (waterData.consumedLiters / waterData.goalLiters) * 100;
            document.getElementById('progressBar').style.width = Math.min(p, 100) + '%';
            document.getElementById('historyList').innerHTML = (waterData.history || []).map(h => `<li><span>${h.text}</span><span class="time-badge">${h.time}</span></li>`).join('');
            document.getElementById('historyContainer').style.display = waterData.history?.length ? 'block' : 'none';
            document.getElementById('userNameDisplay').textContent = currentUser;
            document.querySelectorAll('.water-screen').forEach(s => s.classList.remove('active'));
            document.getElementById(waterData.goalLiters > 0 ? (waterData.bottleVolLiters > 0 ? 'screen-tracker' : 'screen-bottle') : 'screen-goal').classList.add('active');
        }
    });
}

// KHỞI CHẠY
window.onload = () => {
    renderCalendar();
    const container = document.getElementById('suggestedTasksContainer');
    if(container) container.innerHTML = defaultSuggestedTasks.map(t => `<button class="suggested-task-btn" onclick="window.addSpecificTaskOnline('${t}')">+ ${t}</button>`).join('');

    onValue(ref(db, 'users'), (snap) => {
        usersList = snap.val() || ["Khoi Nguyen"];
        renderUserDropdown();
    });

    onValue(ref(db, 'tasks'), (snap) => {
        tasksData = snap.val() || {};
        renderTasks(currentSelectedDay);
    });

    loadWaterDataOnline();
};
