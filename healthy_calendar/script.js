// ==========================================
// 1. KẾT NỐI FIREBASE ONLINE
// ==========================================
import { initializeApp } from "https://www.gstatic.com/firebasejs/10.8.1/firebase-app.js";
import { getDatabase, ref, onValue, set, remove } from "https://www.gstatic.com/firebasejs/10.8.1/firebase-database.js";

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
// 2. BIẾN GLOBAL
// ==========================================
let usersList = [];
let currentUser = localStorage.getItem('appCurrentUser') || "Khoi Nguyen";
let currentSelectedDay = new Date().getDate();
let tasksData = {};
let waterData = { goalLiters: 0, bottleVolLiters: 0, consumedLiters: 0, history: [], lastDate: new Date().toDateString() };
let waterUnsubscribe = null;

const defaultSuggestedTasks = ["💧 Uống đủ 2L nước", "🚫 Không uống đồ ngọt", "🚶 Đi đủ 7000 bước"];

// ==========================================
// 3. CÁC HÀM GẮN VÀO WINDOW (ĐỂ HTML BẤM ĐƯỢC)
// ==========================================

// --- QUẢN LÝ USER ---
window.handleUserChange = function() {
    const select = document.getElementById('userSelect');
    if (select.value === "ADD_NEW") {
        const newName = prompt("Nhập tên người dùng mới:");
        if (newName && newName.trim() !== "" && !usersList.includes(newName.trim())) {
            const newList = [...usersList, newName.trim()];
            currentUser = newName.trim();
            set(ref(db, 'users'), newList).then(() => {
                localStorage.setItem('appCurrentUser', currentUser);
            });
        } 
    } else {
        currentUser = select.value;
        localStorage.setItem('appCurrentUser', currentUser);
        loadWaterDataOnline();
        renderTasks(currentSelectedDay);
    }
};

window.deleteCurrentUser = function() {
    if (usersList.length <= 1) return alert("Không thể xóa người cuối cùng!");
    const userToDelete = currentUser;
    if (confirm(`⚠️ Xóa vĩnh viễn [${userToDelete}]?`)) {
        const newUsersList = usersList.filter(u => u !== userToDelete);
        remove(ref(db, `water/${userToDelete}`)); // Xóa data nước trên mây
        set(ref(db, 'users'), newUsersList).then(() => {
            currentUser = newUsersList[0];
            localStorage.setItem('appCurrentUser', currentUser);
            loadWaterDataOnline();
            renderTasks(currentSelectedDay);
        });
    }
};

// --- QUẢN LÝ LỊCH & TASK ---
window.selectDay = (el, day) => {
    currentSelectedDay = day;
    document.querySelectorAll('.day').forEach(d => d.classList.remove('active'));
    el.classList.add('active');
    renderTasks(day);
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
        id: "t_" + Date.now(), title: `${titleText} của ${currentUser}`, owner: currentUser, completed: false 
    });
    set(ref(db, 'tasks'), tasksData); 
};

window.toggleTask = function(day, index) {
    if (!tasksData[day] || !tasksData[day][index]) return;
    tasksData[day][index].completed = !tasksData[day][index].completed;
    set(ref(db, 'tasks'), tasksData);
};

window.deleteTask = function(day, index) {
    tasksData[day].splice(index, 1);
    set(ref(db, 'tasks'), tasksData);
};

window.handleKeyPress = (e) => { if (e.key === "Enter") window.addTask(); };

// --- QUẢN LÝ NƯỚC (WATER TRACKER) - ĐÃ FIX LỖI TÍNH TOÁN ---
window.toggleWaterModal = () => document.getElementById('waterModalOverlay').classList.toggle('open');

window.calculateGoal = function() {
    const weightInput = document.getElementById('weightInput');
    const weightError = document.getElementById('weightError');
    const goalArea = document.getElementById('goalSelectionArea');
    const recText = document.getElementById('waterRecommendationText');
    const goalSelect = document.getElementById('goalSelect');

    const weight = parseFloat(weightInput.value);
    
    // Kiểm tra đầu vào
    if (isNaN(weight) || weight <= 0) {
        weightError.style.display = 'block';
        goalArea.style.display = 'none';
        return;
    }
    weightError.style.display = 'none';

    // Tính toán lượng nước (30-40ml trên mỗi kg)
    const minL = weight * 0.03; 
    const maxL = weight * 0.04;
    
    // Hiển thị dòng gợi ý
    recText.innerHTML = `💡 Dựa trên cân nặng <b>${weight}kg</b>, bạn nên uống từ <b>${minL.toFixed(1)}L - ${maxL.toFixed(1)}L</b> mỗi ngày.`;

    // Đổ dữ liệu vào ô chọn Lít
    goalSelect.innerHTML = ''; 
    for (let i = Math.ceil(minL * 10); i <= Math.floor(maxL * 10); i++) {
        const val = (i / 10).toFixed(1);
        goalSelect.innerHTML += `<option value="${val}">${val} L</option>`;
    }
    
    // Hiện vùng chọn mục tiêu
    goalArea.style.display = 'block';
};

window.goToScreenBottle = function() {
    const goalVal = parseFloat(document.getElementById('goalSelect').value);
    waterData.goalLiters = goalVal;
    set(ref(db, `water/${currentUser}`), waterData); // Lưu mục tiêu lên Cloud
    showWaterScreen('screen-bottle');
};

window.goToScreenTracker = function() {
    const bottleMl = parseInt(document.getElementById('bottleInput').value);
    const error = document.getElementById('bottleError');
    if (isNaN(bottleMl) || bottleMl <= 0) {
        error.style.display = 'block';
        return;
    }
    error.style.display = 'none';
    waterData.bottleVolLiters = bottleMl / 1000;
    set(ref(db, `water/${currentUser}`), waterData); // Lưu bình nước lên Cloud
    showWaterScreen('screen-tracker');
};

window.addBottle = function() {
    waterData.consumedLiters += waterData.bottleVolLiters;
    const now = new Date();
    const time = `${String(now.getHours()).padStart(2, '0')}:${String(now.getMinutes()).padStart(2, '0')}`;
    if(!waterData.history) waterData.history = [];
    waterData.history.unshift({ text: `💦 Đã uống ${waterData.bottleVolLiters * 1000}ml`, time: time });
    set(ref(db, `water/${currentUser}`), waterData);
};

window.resetWaterApp = function() {
    if(confirm(`Cài đặt lại app nước của [${currentUser}]?`)) { 
        set(ref(db, `water/${currentUser}`), null);
        document.getElementById('weightInput').value = '';
        document.getElementById('goalSelectionArea').style.display = 'none';
    }
};

// ==========================================
// 4. HIỂN THỊ UI & ĐỒNG BỘ REAL-TIME
// ==========================================

function renderUserDropdown() {
    const select = document.getElementById('userSelect');
    if(!select) return;
    select.innerHTML = usersList.map(u => `<option value="${u}" ${u === currentUser ? 'selected' : ''}>${u}</option>`).join('') + `<option value="ADD_NEW">➕ Thêm User mới...</option>`;
    if(document.getElementById('userNameDisplay')) document.getElementById('userNameDisplay').textContent = currentUser;
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

    if(progress) {
        progress.innerHTML = usersList.map(user => {
            const uTasks = tasks.filter(t => t.owner === user);
            if (uTasks.length === 0) return "";
            const pc = Math.round((uTasks.filter(t => t.completed).length / uTasks.length) * 100);
            return `<div class="user-progress-item"><div class="user-progress-label"><span>${user}</span><span>${pc}%</span></div><div class="user-progress-track"><div class="user-progress-fill" style="width:${pc}%; background:#3498db"></div></div></div>`;
        }).join('');
    }

    taskList.innerHTML = tasks.length === 0 ? `<p style="text-align:center; color:#8e8e93; margin-top:20px;">Trống.</p>` : "";
    tasks.forEach((t, i) => {
        taskList.innerHTML += `<div class="task-item blue" style="opacity:${t.owner === currentUser ? 1 : 0.5}"><div class="checkbox-wrapper"><input type="checkbox" ${t.completed ? "checked" : ""} onchange="window.toggleTask(${day}, ${i})"></div><div class="task-content"><div class="task-info"><label class="task-title">${t.title}</label></div>${t.owner === currentUser ? `<button class="delete-btn" onclick="window.deleteTask(${day}, ${i})">✕</button>` : ""}</div></div>`;
    });
}

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
            updateWaterUI();
            if (waterData.goalLiters > 0) {
                showWaterScreen(waterData.bottleVolLiters > 0 ? 'screen-tracker' : 'screen-bottle');
            } else {
                showWaterScreen('screen-goal');
            }
        } else {
            waterData = { goalLiters: 0, bottleVolLiters: 0, consumedLiters: 0, history: [], lastDate: today };
            showWaterScreen('screen-goal');
        }
    });
}

function updateWaterUI() {
    if(!document.getElementById('consumedText')) return;
    document.getElementById('consumedText').textContent = waterData.consumedLiters.toFixed(2);
    document.getElementById('goalText').textContent = waterData.goalLiters.toFixed(1);
    document.getElementById('btnBottleVol').textContent = (waterData.bottleVolLiters * 1000) || 0;
    const p = (waterData.consumedLiters / (waterData.goalLiters || 1)) * 100;
    document.getElementById('progressBar').style.width = Math.min(p, 100) + '%';
    document.getElementById('historyList').innerHTML = (waterData.history || []).map(h => `<li><span>${h.text}</span><span class="time-badge">${h.time}</span></li>`).join('');
    document.getElementById('historyContainer').style.display = waterData.history?.length ? 'block' : 'none';
}

function showWaterScreen(id) { 
    document.querySelectorAll('.water-screen').forEach(s => s.classList.remove('active')); 
    const screen = document.getElementById(id);
    if(screen) screen.classList.add('active'); 
}

// KHỞI CHẠY
window.onload = () => {
    renderCalendar();
    const suggested = document.getElementById('suggestedTasksContainer');
    if(suggested) suggested.innerHTML = defaultSuggestedTasks.map(t => `<button class="suggested-task-btn" onclick="window.addSpecificTaskOnline('${t}')">+ ${t}</button>`).join('');

    onValue(ref(db, 'users'), (snap) => {
        const data = snap.val();
        if (data) {
            usersList = data;
            if (!usersList.includes(currentUser)) {
                currentUser = usersList[0];
                localStorage.setItem('appCurrentUser', currentUser);
            }
        } else {
            usersList = ["Khoi Nguyen"];
            set(ref(db, 'users'), usersList);
        }
        renderUserDropdown();
        loadWaterDataOnline();
        renderTasks(currentSelectedDay);
    });

    onValue(ref(db, 'tasks'), (snap) => {
        tasksData = snap.val() || {};
        renderTasks(currentSelectedDay);
    });
};
