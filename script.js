// ===== STATE MANAGEMENT =====
const state = {
    settings: JSON.parse(localStorage.getItem('nf_settings')) || {
        wakeTime: '07:00',
        sleepTime: '23:00',
        lastSleep: 8,
        chronotype: 'balanced',
        dailyGoal: 4
    },
    tasks: JSON.parse(localStorage.getItem('nf_tasks')) || [],
    sessions: JSON.parse(localStorage.getItem('nf_sessions')) || [],
    streak: JSON.parse(localStorage.getItem('nf_streak')) || { count: 0, lastDate: null },
    achievements: JSON.parse(localStorage.getItem('nf_achievements')) || []
};

// ===== TIMER STATE =====
let timer = {
    duration: 25 * 60,
    remaining: 25 * 60,
    interval: null,
    isRunning: false,
    mode: 'work',
    sessionsToday: 0
};

// ===== TAB SWITCHING =====
document.querySelectorAll('.tab-btn').forEach(btn => {
    btn.addEventListener('click', () => {
        const tabName = btn.dataset.tab;

        document.querySelectorAll('.tab-btn').forEach(b => b.classList.remove('active'));
        document.querySelectorAll('.tab-content').forEach(c => c.classList.remove('active'));

        btn.classList.add('active');
        document.getElementById(tabName).classList.add('active');

        if (tabName === 'stats') renderStats();
        if (tabName === 'dashboard') renderDashboard();
    });
});

// ===== CIRCADIAN ALGORITHM =====
function calculateOptimalTimes() {
    const wakeTime = state.settings.wakeTime;
    const [h, m] = wakeTime.split(':').map(Number);

    const peak1Start = new Date();
    peak1Start.setHours(h + 2, m, 0);
    const peak1End = new Date();
    peak1End.setHours(h + 4, m, 0);

    const peak2Start = new Date();
    peak2Start.setHours(h + 6, m, 0);
    const peak2End = new Date();
    peak2End.setHours(h + 8, m, 0);

    return {
        peaks: [
            { start: peak1Start, end: peak1End, label: 'Birinchi cho\'qqi (Eng yuqori)' },
            { start: peak2Start, end: peak2End, label: 'Ikkinchi cho\'qqi (Yuqori)' }
        ]
    };
}

function formatTime(date) {
    return date.toTimeString().slice(0, 5);
}

function calculateEnergy() {
    const sleepHours = state.settings.lastSleep;
    const now = new Date();
    const wakeTime = state.settings.wakeTime.split(':').map(Number);
    const wakeDate = new Date();
    wakeDate.setHours(wakeTime[0], wakeTime[1], 0);

    const hoursAwake = (now - wakeDate) / (1000 * 60 * 60);

    let energy = 100;

    if (sleepHours < 6) energy -= 30;
    else if (sleepHours < 7) energy -= 15;
    else if (sleepHours < 8) energy -= 5;

    if (hoursAwake > 0) {
        if (hoursAwake >= 2 && hoursAwake <= 4) energy += 10;
        else if (hoursAwake >= 6 && hoursAwake <= 8) energy += 5;
        else if (hoursAwake > 12) energy -= 20;
        else if (hoursAwake > 16) energy -= 40;
    }

    return Math.max(0, Math.min(100, energy));
}

function getRecommendation(energy) {
    if (energy >= 80) return { text: '🚀 Ajoyib! Eng murakkab vazifalarni hozir bajaring!', color: 'success' };
    if (energy >= 60) return { text: '✨ Yaxshi holat. Asosiy ishlarni boshlang.', color: 'success' };
    if (energy >= 40) return { text: '📚 O\'rtacha. Yengil takrorlash uchun yaxshi vaqt.', color: 'warning' };
    if (energy >= 20) return { text: '☕ Past energiya. 15-20 daqiqa dam oling.', color: 'warning' };
    return { text: '😴 Juda past. Uxlash yoki kuchli dam olish kerak.', color: 'danger' };
}

// ===== RENDER DASHBOARD =====
function renderDashboard() {
    const optimal = calculateOptimalTimes();
    const optimalDiv = document.getElementById('optimalTimes');

    optimalDiv.innerHTML = optimal.peaks.map((peak, i) => `
        <div class="time-block ${i === 0 ? 'peak' : ''}">
            <div>
                <div class="time-range">${formatTime(peak.start)} - ${formatTime(peak.end)}</div>
                <div class="time-label">${peak.label}</div>
            </div>
            <div style="font-size: 1.5rem;">${i === 0 ? '🔥' : '⭐'}</div>
        </div>
    `).join('');

    const energy = calculateEnergy();
    document.getElementById('energyFill').style.width = energy + '%';
    document.getElementById('energyText').textContent = `Energiya darajasi: ${energy}%`;

    const rec = getRecommendation(energy);
    document.getElementById('recommendation').textContent = rec.text;

    // Today's stats
    const today = new Date().toDateString();
    const todaySessions = state.sessions.filter(s => new Date(s.date).toDateString() === today);
    const todayPomodoros = todaySessions.length;
    const todayMinutes = todaySessions.reduce((sum, s) => sum + s.duration, 0);
    const todayHours = (todayMinutes / 60).toFixed(1);
    const todayTasks = state.tasks.filter(t => t.done && new Date(t.completedAt).toDateString() === today).length;

    document.getElementById('todayHours').textContent = todayHours;
    document.getElementById('todayPomodoros').textContent = todayPomodoros;
    document.getElementById('todayTasks').textContent = todayTasks;
    document.getElementById('focusScore').textContent = Math.min(100, todayPomodoros * 10) + '%';
    document.getElementById('streakCount').textContent = state.streak.count;

    // Motivation
    const motivations = [
        'Bugun ajoyib kun bo\'lishi mumkin!',
        'Har bir daqiqa - kelajakka investitsiya!',
        'Siz qila olasiz! 💪',
        'Bilim - eng katta boylik!',
        'Bugun kechagi sizdan yaxshiroq bo\'ling!'
    ];
    document.getElementById('motivationText').textContent = motivations[Math.floor(Math.random() * motivations.length)];
}

// ===== TIMER FUNCTIONS =====
document.querySelectorAll('.mode-btn').forEach(btn => {
    btn.addEventListener('click', () => {
        if (timer.isRunning) {
            showNotification('Avval taymerni to\'xtating', 'warning');
            return;
        }

        document.querySelectorAll('.mode-btn').forEach(b => b.classList.remove('active'));
        btn.classList.add('active');

        const minutes = parseInt(btn.dataset.time);
        timer.duration = minutes * 60;
        timer.remaining = timer.duration;
        timer.mode = btn.dataset.mode;

        const labels = { work: 'Ishlash vaqti', short: 'Qisqa dam olish', long: 'Uzoq dam olish' };
        document.getElementById('timerLabel').textContent = labels[timer.mode];

        updateTimerDisplay();
    });
});

function updateTimerDisplay() {
    const min = Math.floor(timer.remaining / 60);
    const sec = timer.remaining % 60;
    document.getElementById('timerDisplay').textContent =
        `${String(min).padStart(2, '0')}:${String(sec).padStart(2, '0')}`;

    const progress = (timer.remaining / timer.duration);
    const offset = 565 * (1 - progress);
    document.getElementById('timerProgress').style.strokeDashoffset = offset;
}

document.getElementById('startBtn').addEventListener('click', () => {
    timer.isRunning = true;
    document.getElementById('startBtn').disabled = true;
    document.getElementById('pauseBtn').disabled = false;

    timer.interval = setInterval(() => {
        timer.remaining--;
        updateTimerDisplay();

        if (timer.remaining <= 0) {
            clearInterval(timer.interval);
            timer.isRunning = false;
            timerComplete();
        }
    }, 1000);
});

document.getElementById('pauseBtn').addEventListener('click', () => {
    clearInterval(timer.interval);
    timer.isRunning = false;
    document.getElementById('startBtn').disabled = false;
    document.getElementById('pauseBtn').disabled = true;
});

document.getElementById('resetBtn').addEventListener('click', () => {
    clearInterval(timer.interval);
    timer.isRunning = false;
    timer.remaining = timer.duration;
    document.getElementById('startBtn').disabled = false;
    document.getElementById('pauseBtn').disabled = true;
    updateTimerDisplay();
});

function timerComplete() {
    document.getElementById('startBtn').disabled = false;
    document.getElementById('pauseBtn').disabled = true;

    // Play sound
    playSound();

    if (timer.mode === 'work') {
        const task = document.getElementById('currentTask').value || 'Umumiy o\'qish';
        state.sessions.push({
            date: new Date().toISOString(),
            duration: timer.duration / 60,
            task: task
        });
        localStorage.setItem('nf_sessions', JSON.stringify(state.sessions));

        timer.sessionsToday++;
        document.getElementById('sessionCount').textContent = timer.sessionsToday;

        updateStreak();
        checkAchievements();
        showNotification('🎉 Pomodoro tugadi! Dam oling.', 'success');

        // Browser notification
        if (Notification.permission === 'granted') {
            new Notification('NeuroFlow', {
                body: '🎉 Sessiya tugadi! 5 daqiqa dam oling.',
                icon: '🧠'
            });
        }
    } else {
        showNotification('☕ Dam olish tugadi! Ishni davom ettiring.', 'success');
    }

    timer.remaining = timer.duration;
    updateTimerDisplay();
}

function playSound() {
    const audio = new AudioContext();
    const oscillator = audio.createOscillator();
    const gainNode = audio.createGain();
    oscillator.connect(gainNode);
    gainNode.connect(audio.destination);
    oscillator.frequency.value = 800;
    gainNode.gain.setValueAtTime(0.3, audio.currentTime);
    gainNode.gain.exponentialRampToValueAtTime(0.01, audio.currentTime + 0.5);
    oscillator.start();
    oscillator.stop(audio.currentTime + 0.5);
}

// ===== TASKS / NOTES =====
document.getElementById('addTaskBtn').addEventListener('click', addTask);
document.getElementById('taskInput').addEventListener('keypress', (e) => {
    if (e.key === 'Enter') addTask();
});

function addTask() {
    const input = document.getElementById('taskInput');
    const priority = document.getElementById('taskPriority').value;
    const text = input.value.trim();

    if (!text) {
        showNotification('Vazifa matnini kiriting', 'warning');
        return;
    }

    // Auto-prioritize
    const autoPriority = autoPrioritize(text);
    const finalPriority = priority || autoPriority;

    const task = {
        id: Date.now(),
        text: text,
        priority: finalPriority,
        done: false,
        createdAt: new Date().toISOString()
    };

    state.tasks.push(task);
    localStorage.setItem('nf_tasks', JSON.stringify(state.tasks));

    input.value = '';
    renderTasks();
    showNotification('✅ Vazifa qo\'shildi', 'success');
}

function autoPrioritize(text) {
    const lower = text.toLowerCase();
    if (/imtihon|deadline|tez|hozir|shoshilinch|bugun/i.test(lower)) return 'critical';
    if (/muhim|kerak|loyiha/i.test(lower)) return 'important';
    if (/keyin|ehtimol|ixtiyoriy/i.test(lower)) return 'bonus';
    return 'urgent';
}

function renderTasks() {
    const lists = {
        critical: document.getElementById('criticalTasks'),
        important: document.getElementById('importantTasks'),
        urgent: document.getElementById('urgentTasks'),
        bonus: document.getElementById('bonusTasks')
    };

    Object.values(lists).forEach(list => list.innerHTML = '');

    state.tasks.forEach(task => {
        const list = lists[task.priority];
        if (!list) return;

        const li = document.createElement('li');
        li.className = `task-item ${task.done ? 'done' : ''}`;
        li.innerHTML = `
            <input type="checkbox" class="task-checkbox" ${task.done ? 'checked' : ''}>
            <span class="task-text">${task.text}</span>
            <button class="task-delete">✕</button>
        `;

        li.querySelector('.task-checkbox').addEventListener('change', (e) => {
            task.done = e.target.checked;
            if (task.done) task.completedAt = new Date().toISOString();
            localStorage.setItem('nf_tasks', JSON.stringify(state.tasks));
            renderTasks();
            checkAchievements();
        });

        li.querySelector('.task-delete').addEventListener('click', () => {
            state.tasks = state.tasks.filter(t => t.id !== task.id);
            localStorage.setItem('nf_tasks', JSON.stringify(state.tasks));
            renderTasks();
        });

        list.appendChild(li);
    });
}

// ===== STATS =====
function renderStats() {
    renderWeeklyChart();
    renderHeatmap();
    renderAchievements();
}

function renderWeeklyChart() {
    const days = ['Du', 'Se', 'Ch', 'Pa', 'Ju', 'Sh', 'Ya'];
    const today = new Date();
    const weekData = [];

    for (let i = 6; i >= 0; i--) {
        const date = new Date(today);
        date.setDate(today.getDate() - i);
        const dayStr = date.toDateString();

        const sessions = state.sessions.filter(s => new Date(s.date).toDateString() === dayStr);
        const hours = sessions.reduce((sum, s) => sum + s.duration, 0) / 60;

        weekData.push({
            day: days[(date.getDay() + 6) % 7],
            hours: hours
        });
    }

    const maxHours = Math.max(...weekData.map(d => d.hours), 1);
    const barsHTML = weekData.map(d => `
        <div class="bar-wrapper">
            <div class="bar" style="height: ${(d.hours / maxHours) * 100}%">
                <span class="bar-value">${d.hours.toFixed(1)}h</span>
            </div>
            <div class="bar-label">${d.day}</div>
        </div>
    `).join('');

    document.getElementById('weeklyBars').innerHTML = barsHTML;
}

function renderHeatmap() {
    const heatmap = document.getElementById('heatmap');
    heatmap.innerHTML = '';

    // Calculate intensity for each hour
    const hourCounts = new Array(24).fill(0);
    state.sessions.forEach(s => {
        const hour = new Date(s.date).getHours();
        hourCounts[hour]++;
    });

    const maxCount = Math.max(...hourCounts, 1);

    for (let h = 0; h < 24; h++) {
        const cell = document.createElement('div');
        cell.className = 'heat-cell';
        const intensity = hourCounts[h] / maxCount;
        cell.style.background = `rgba(0, 245, 255, ${0.05 + intensity * 0.7})`;
        cell.title = `${h}:00 - ${hourCounts[h]} sessiya`;
        heatmap.appendChild(cell);
    }
}

function renderAchievements() {
    const totalSessions = state.sessions.length;
    const totalHours = state.sessions.reduce((sum, s) => sum + s.duration, 0) / 60;

    const checks = [
        { id: 'first', condition: totalSessions >= 1 },
        { id: 'fire', condition: state.streak.count >= 7 },
        { id: 'diamond', condition: totalSessions >= 100 },
        { id: 'thinker', condition: totalHours >= 50 }
    ];

    document.querySelectorAll('.achievement').forEach((el, i) => {
        if (checks[i].condition) {
            el.classList.remove('locked');
            el.classList.add('unlocked');
        }
    });
}

function checkAchievements() {
    const totalSessions = state.sessions.length;

    if (totalSessions === 1 && !state.achievements.includes('first')) {
        state.achievements.push('first');
        localStorage.setItem('nf_achievements', JSON.stringify(state.achievements));
        showNotification('🏆 Yangi yutuq: Birinchi Qadam!', 'success');
    }
}

// ===== STREAK =====
function updateStreak() {
    const today = new Date().toDateString();
    const lastDate = state.streak.lastDate;

    if (lastDate === today) return;

    const yesterday = new Date();
    yesterday.setDate(yesterday.getDate() - 1);

    if (lastDate === yesterday.toDateString()) {
        state.streak.count++;
    } else if (lastDate !== today) {
        state.streak.count = 1;
    }

    state.streak.lastDate = today;
    localStorage.setItem('nf_streak', JSON.stringify(state.streak));
}

// ===== SETTINGS =====
document.getElementById('saveSettings').addEventListener('click', () => {
    state.settings.wakeTime = document.getElementById('wakeTime').value;
    state.settings.sleepTime = document.getElementById('sleepTime').value;
    state.settings.lastSleep = parseFloat(document.getElementById('lastSleep').value);
    state.settings.chronotype = document.getElementById('chronotype').value;
    state.settings.dailyGoal = parseInt(document.getElementById('dailyGoal').value);

    localStorage.setItem('nf_settings', JSON.stringify(state.settings));
    showNotification('💾 Sozlamalar saqlandi!', 'success');
    renderDashboard();
});

document.getElementById('resetData').addEventListener('click', () => {
    if (confirm('Haqiqatan ham barcha ma\'lumotlarni o\'chirmoqchimisiz?')) {
        localStorage.clear();
        location.reload();
    }
});

function loadSettings() {
    document.getElementById('wakeTime').value = state.settings.wakeTime;
    document.getElementById('sleepTime').value = state.settings.sleepTime;
    document.getElementById('lastSleep').value = state.settings.lastSleep;
    document.getElementById('chronotype').value = state.settings.chronotype;
    document.getElementById('dailyGoal').value = state.settings.dailyGoal;
}

// ===== NOTIFICATIONS =====
function showNotification(text, type = 'success') {
    const notif = document.getElementById('notification');
    notif.textContent = text;
    notif.className = `notification ${type} show`;

    setTimeout(() => {
        notif.classList.remove('show');
    }, 3000);
}

// Request notification permission
if ('Notification' in window && Notification.permission === 'default') {
    Notification.requestPermission();
}

// ===== PWA SERVICE WORKER =====
if ('serviceWorker' in navigator) {
    window.addEventListener('load', () => {
        navigator.serviceWorker.register('sw.js').catch(() => { });
    });
}

// ===== INIT =====
loadSettings();
renderDashboard();
renderTasks();
updateTimerDisplay();

// Auto-update dashboard every minute
setInterval(renderDashboard, 60000);

console.log('🧠 NeuroFlow ishga tushdi!');