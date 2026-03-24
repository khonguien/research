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
let usersList = [];
let currentUser = localStorage.getItem('appCurrentUser') || "Khoi Nguyen";
let currentSelectedDay = new Date().getDate();
let tasksData = {};
let waterData = { goalLiters: 0, bottleVolLiters: 0, consumedLiters: 0, history: [], lastDate: new Date().toDateString() };
let waterUnsubscribe = null;

const defaultSuggestedTasks = ["💧 Uống đủ 2L nước", "🚫 Không uống đồ ngọt", "🚶 Đi đủ 7000 bước"];

// ==========================================
// 3. GẮN HÀM VÀO WINDOW (SỬA LỖI XÓA USER)
// ==========================================

window.handleUserChange = function() {
    const select = document.getElementById('userSelect');
    if (select.value === "ADD_NEW") {
        const newName = prompt("Nhập tên người dùng mới:");
        if (newName && newName.trim() !== "" && !usersList.includes(newName.trim())) {
            const newList = [...usersList, newName.trim()];
            currentUser = newName.trim();
            set(ref(db, 'users'), newList); 
        } 
    } else {
        currentUser = select.value;
    }
    localStorage.setItem('appCurrentUser', currentUser);
    loadWaterDataOnline();
    renderTasks(currentSelectedDay);
};

// --- HÀM XÓA USER ĐÃ FIX ---
window.deleteCurrentUser = function() {
    if (usersList.length <= 1) {
        alert("Phải có ít nhất 1 người dùng trong hệ thống. Bạn không thể xóa!");
        return;
    }

    const userToDelete = currentUser; // Lưu lại tên người cần xóa
    if (confirm(`⚠️ CẢNH BÁO: Bạn có chắc muốn xóa vĩnh viễn người dùng [${userToDelete}]? Dữ liệu nước sẽ bị xóa sạch.`)) {
        
        // 1. Tạo danh sách mới sau khi lọc bỏ người dùng cũ
        const newUsersList = usersList.filter(u => u !== userToDelete);

        // 2. Chuyển ngay sang người dùng đầu tiên trong danh sách còn lại
        currentUser = newUsersList[0];
        localStorage.setItem('appCurrentUser', currentUser);

        // 3. Cập nhật Firebase
        // Xóa data nước của user đó
        set(ref(db, `water/${userToDelete}`), null);
        // Cập nhật lại danh sách users
        set(ref(db, 'users'), newUsersList)
            .then(() => {
                alert(`Đã xóa thành công: ${userToDelete}`);
                loadWaterDataOnline(); // Load lại data nước cho user mới
                renderTasks(currentSelectedDay);
            })
            .catch(err => alert("Lỗi khi xóa dữ liệu trên Cloud: " + err.message));
    }
};

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

window.handleKeyPress = (e) => { if (e.key === "Enter") window.addTask(); };
window.toggleWaterModal = () => document.getElementById('waterModalOverlay').classList.toggle('open');

// ==========================================
// 4. HÀM HIỂN THỊ UI
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

    if(progress) {
        progress.innerHTML = usersList.map(user => {
            const uTasks = tasks.filter(t => t.owner === user);
            if (uTasks.length === 0) return "";
            const pc = Math.round((uTasks.filter(t => t.completed).length / uTasks.length) * 100);
            return `<div class="user-progress-item"><div class="user-progress-label"><span>${user}</span><span>${pc}%</span></div><div class="user-progress-track"><div class="user-progress-fill" style="width:${pc}%; background:#3498db"></div></div></div>`;
        }).join('');
    }

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
// 5. ĐỒNG BỘ REAL-TIME (FIREBASE)
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
            updateWaterUI();
        } else {
            waterData = { goalLiters: 0, bottleVolLiters: 0, consumedLiters: 0, history: [], lastDate: today };
        }
    });
}

function updateWaterUI() {
    if(!document.getElementById('consumedText')) return;
    document.getElementById('consumedText').textContent = waterData.consumedLiters.toFixed(2);
    document.getElementById('goalText').textContent = waterData.goalLiters.toFixed(1);
    const p = (waterData.consumedLiters / (waterData.goalLiters || 1)) * 100;
    document.getElementById('progressBar').style.width = Math.min(p, 100) + '%';
    document.getElementById('userNameDisplay').textContent = currentUser;
}

// KHỞI CHẠY
window.onload = () => {
    renderCalendar();
    const container = document.getElementById('suggestedTasksContainer');
    if(container) container.innerHTML = defaultSuggestedTasks.map(t => `<button class="suggested-task-btn" onclick="window.addSpecificTaskOnline('${t}')">+ ${t}</button>`).join('');

    onValue(ref(db, 'users'), (snap) => {
        const data = snap.val();
        if (data) {
            usersList = data;
            // Nếu User hiện tại bị ai đó xóa ở máy khác, tự nhảy về User đầu tiên
            if (!usersList.includes(currentUser)) {
                currentUser = usersList[0];
                localStorage.setItem('appCurrentUser', currentUser);
                loadWaterDataOnline();
            }
        } else {
            usersList = ["Khoi Nguyen"];
            set(ref(db, 'users'), usersList);
        }
        renderUserDropdown();
        renderTasks(currentSelectedDay);
    });

    onValue(ref(db, 'tasks'), (snap) => {
        tasksData = snap.val() || {};
        renderTasks(currentSelectedDay);
    });

    loadWaterDataOnline();
};
