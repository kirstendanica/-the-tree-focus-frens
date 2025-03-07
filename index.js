const WORK_DURATION = 25 * 60;
const SHORT_BREAK_DURATION = 5 * 60;
const LONG_BREAK_DURATION = 15 * 60;

// --- "Fren" data ---
const frens = [
    { id: 'stinky-jay', name: 'Stinky Jay', src: "./assets/img/stnkyjy.png", unlockAt: 0 }, // Start with Stinky Jay unlocked
    { id: 'squinny', name: 'Squinny', src: "./assets/img/squin.png", unlockAt: 2 },
    { id: 'hobblelobble', name: 'Hobblelobble', src: "./assets/img/hobbs.png", unlockAt: 5 },
    { id: 'nuthatch', name: 'Nuttea + Honnea', src: "./assets/img/nuthatch.png", unlockAt: 10 },
    { id: 'downy', name: 'Downy', src: "./assets/img/downy.png", unlockAt: 20 }
];

let currentSessionType = 'work'; 
let timeLeft = WORK_DURATION;
let isRunning = false;
let timerInterval = null;
let sessionsCompleted = 0;
let totalSessions = 0;
let streak = 0;
let unlockedFrens = [];

const timerDisplay = document.getElementById('timer');
const startBtn = document.getElementById('start-btn');
const pauseBtn = document.getElementById('pause-btn');
const resetBtn = document.getElementById('reset-btn');
const customTimeInput = document.getElementById('custom-time');
const streakDisplay = document.getElementById('streak');
const sessionNumberDisplay = document.getElementById('session-number');
const frensList = document.getElementById('frens-list');
const focusNoise = document.getElementById('focus-noise');

// Timer functionality
function formatTime(seconds) {
    const minutes = Math.floor(seconds / 60);
    const secs = seconds % 60;
    return `${minutes.toString().padStart(2, '0')}:${secs.toString().padStart(2, '0')}`;
}

function updateTimerDisplay() {
    timerDisplay.textContent = formatTime(timeLeft);
    timerDisplay.className = `text-4xl font-mono mt-4 ${currentSessionType === 'shortBreak' ? 'text-short-break' : currentSessionType === 'longBreak' ? 'text-long-break' : ''}`;
}

function handleSessionComplete() {
    isRunning = false;
    clearInterval(timerInterval);
    timerInterval = null;

    totalSessions++; 
    localStorage.setItem('totalSessions', totalSessions.toString());

    if (currentSessionType === 'work') {
        sessionsCompleted++;
        localStorage.setItem('sessionsCompleted', sessionsCompleted.toString());
        sessionNumberDisplay.textContent = `focus frentime: ${sessionsCompleted}`;
        checkUnlockFren(); 

        if (sessionsCompleted % 3 === 0) {
            currentSessionType = 'longBreak';
            timeLeft = LONG_BREAK_DURATION;
        } else {
            currentSessionType = 'shortBreak';
            timeLeft = SHORT_BREAK_DURATION;
        }
    } else {
        currentSessionType = 'work';
        timeLeft = parseInt(customTimeInput.value) * 60; 
    }

    focusNoise.pause();
    focusNoise.currentTime = 0;
    updateTimerDisplay();
     if (!isRunning) startTimer();
}

// "Fren" reward system
function checkUnlockFren() {
    const newFrens = frens.filter(
        (fren) => fren.unlockAt <= sessionsCompleted && !unlockedFrens.some((uf) => uf.id === fren.id)
    );

    if (newFrens.length > 0) {
        unlockedFrens = [...unlockedFrens, ...newFrens];
        localStorage.setItem('unlockedFrens', JSON.stringify(unlockedFrens));
        renderFrens(); 
    }
}

function renderFrens() {
    frensList.innerHTML = ''; 
    unlockedFrens.forEach((fren) => {
        const img = document.createElement('img');
        img.src = fren.src;
        img.alt = fren.name;
        img.className = `fren unlocked w-20 h-20 object-cover rounded-full`; // Tailwind classes
        frensList.appendChild(img);
    });
}

// --- Ev Handlrs ---

function handleStartPause() {
    if (isRunning) {
        clearInterval(timerInterval);
        timerInterval = null;
        pauseBtn.textContent = "resume";
        isRunning = false;
    } else {
        isRunning = true;
        pauseBtn.textContent = "pause";
        pauseBtn.disabled = false;
         if (timeLeft === 0) {
            timeLeft = parseInt(customTimeInput.value) * 60;
        }
        updateTimerDisplay();
        focusNoise.play();
        timerInterval = setInterval(() => {
            if (timeLeft > 0) {
                timeLeft--;
                updateTimerDisplay();
            } else {
                handleSessionComplete();
            }
        }, 1000);
    }
}

function handleReset() {
    clearInterval(timerInterval);
    timerInterval = null;
    isRunning = false;
    currentSessionType = 'work';
    timeLeft = parseInt(customTimeInput.value) * 60;
    updateTimerDisplay();
    pauseBtn.textContent = 'pause';
    pauseBtn.disabled = true;
    focusNoise.pause();
    focusNoise.currentTime = 0;
}

function initialize() {
    const storedSessions = localStorage.getItem('sessionsCompleted');
    const storedTotalSessions = localStorage.getItem('totalSessions')
    const storedStreak = localStorage.getItem('streak');
    const storedUnlockedFrens = localStorage.getItem('unlockedFrens');
    const storedWorkDuration = localStorage.getItem('workDuration');
    const lastFocusDate = localStorage.getItem('lastFocusDate');
    const today = new Date().toDateString();

    if (storedSessions) sessionsCompleted = parseInt(storedSessions);
    if (storedTotalSessions) totalSessions = parseInt(storedTotalSessions);
    if (storedStreak) streak = parseInt(storedStreak);
    if (storedUnlockedFrens) unlockedFrens = JSON.parse(storedUnlockedFrens);
    if (storedWorkDuration) customTimeInput.value = (parseInt(storedWorkDuration) / 60).toString();


    if (lastFocusDate !== today) {
         const newStreak = lastFocusDate ? streak + 1 : 1;
        streak = newStreak
        localStorage.setItem('streak', streak.toString());
        localStorage.setItem('lastFocusDate', today);
    }

    streakDisplay.textContent = `streak: ${streak} -day streak`;
    sessionNumberDisplay.textContent = `focus frentime: ${sessionsCompleted}`;
    updateTimerDisplay();
    renderFrens();

    // Ev Lstnrs
    startBtn.addEventListener('click', handleStartPause);
    pauseBtn.addEventListener('click', handleStartPause);
    resetBtn.addEventListener('click', handleReset);
    customTimeInput.addEventListener('change', () => {
        if (!isRunning) {
            timeLeft = parseInt(customTimeInput.value) * 60;
            updateTimerDisplay();
        }
    });
}

initialize();