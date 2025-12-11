// --- STATE ---
let state = {
    target: 50,
    sensitivity: 8, // Default
    jumps: 0,
    totalXP: 0,
    baselineY: 0,
    isAirborne: false,
    milestone50: false,
    milestone90: false,
    completed: false
};

// --- CONFIG ---
const NOISE_FILTER = 1000;   

// --- DOM ELEMENTS ---
const screens = {
    setup: document.getElementById('setup-screen'),
    calib: document.getElementById('calibration-screen'),
    game: document.getElementById('game-screen')
};
const video = document.getElementById('video-feed');
const gameCanvas = document.createElement('canvas'); 
const gameCtx = gameCanvas.getContext('2d');
const msg = document.getElementById('overlay-msg');

// --- SOUNDS ---
const sounds = {
    coin: document.getElementById('snd-coin'),
    alert: document.getElementById('snd-alert'),
    win: document.getElementById('snd-win')
};

function playSound(name) {
    if (state.completed && name !== 'win') return;
    try {
        sounds[name].pause();
        sounds[name].currentTime = 0;
        sounds[name].play();
    } catch(e) {}
}

// --- SETUP ---
document.getElementById('calibBtn').onclick = () => {
    // 1. Get Target
    state.target = parseInt(document.getElementById('targetInput').value) || 50;
    
    // 2. Get Sensitivity (Slider)
    // Invert logic: Higher slider value = Smaller pixel threshold (More sensitive)
    // Wait, let's keep it simple: "Sensitivity" usually means "How easy it triggers".
    // So High Sensitivity = Low Threshold.
    // Slider Value: 3 (Hard) -> 20 (Easy)
    // We map Slider 20 -> Threshold 3. Slider 3 -> Threshold 20.
    const sliderVal = parseInt(document.getElementById('sensInput').value);
    
    // Actually, let's just use the slider value directly as the threshold pixels.
    // Slider Value 8 means you must move 8 pixels to trigger.
    // If user says "Too Sensitive", they want to jump HIGHER to trigger.
    // So they should INCREASE the threshold.
    // Let's make the label clear: "THRESHOLD".
    // Or just map it directly: Slider = "Motion Required".
    // Low (3px) -> High (20px).
    state.sensitivity = sliderVal; 
    
    document.getElementById('target-display').innerText = `TARGET: ${state.target}`;
    switchScreen('calib');
    startCamera();
};

document.getElementById('restartBtn').onclick = () => window.location.reload();

function switchScreen(name) {
    Object.values(screens).forEach(s => {
        s.classList.remove('active');
        s.style.display = 'none';
    });
    screens[name].classList.add('active');
    screens[name].style.display = 'flex';
    if(name === 'game') screens[name].style.display = 'block';
}

// --- CAMERA ---
async function startCamera() {
    try {
        const stream = await navigator.mediaDevices.getUserMedia({ 
            video: { width: 640, height: 480, facingMode: "user" } 
        });
        video.srcObject = stream;
        video.play();
        
        let count = 5;
        msg.innerText = "STAND STILL " + count;
        const timer = setInterval(() => {
            count--;
            msg.innerText = "STAND STILL " + count;
            if (count <= 0) {
                clearInterval(timer);
                startGame();
            }
        }, 1000);
    } catch (e) { alert("Camera Error: " + e.message); }
}

// --- MOTION ENGINE ---
function startGame() {
    switchScreen('game');
    gameCanvas.width = 640; 
    gameCanvas.height = 480;
    requestAnimationFrame(processFrame);
}

let lastFrameData = null;

function processFrame() {
    if (state.completed) return; 

    gameCtx.drawImage(video, 0, 0, 640, 480);
    const frame = gameCtx.getImageData(0, 0, 640, 480);
    const data = frame.data;
    
    if (!lastFrameData) {
        lastFrameData = data;
        requestAnimationFrame(processFrame);
        return;
    }

    let sumY = 0;
    let pixelCount = 0;
    
    for (let i = 0; i < data.length; i += 32) {
        const diff = Math.abs(data[i] - lastFrameData[i]) + 
                     Math.abs(data[i+1] - lastFrameData[i+1]) + 
                     Math.abs(data[i+2] - lastFrameData[i+2]);
        
        if (diff > 80) { 
            const y = Math.floor((i / 4) / 640); 
            sumY += y;
            pixelCount++;
        }
    }
    
    lastFrameData = data;

    if (pixelCount > (NOISE_FILTER / 2)) { 
        const currentY = sumY / pixelCount;
        
        if (state.baselineY === 0) state.baselineY = currentY;
        
        if (!state.isAirborne) {
            state.baselineY = (state.baselineY * 0.95) + (currentY * 0.05);
        }
        
        const displacement = state.baselineY - currentY;
        
        if (!state.isAirborne) {
            // DYNAMIC SENSITIVITY CHECK
            if (displacement > state.sensitivity) state.isAirborne = true;
        } else {
            if (displacement < 2) { 
                state.isAirborne = false;
                addJump();
            }
        }
    }

    requestAnimationFrame(processFrame);
}

// --- GAME LOGIC ---
function addJump() {
    state.jumps++;
    
    document.getElementById('counter').innerText = state.jumps;
    const pct = (state.jumps / state.target) * 100;
    document.getElementById('progress-fill').style.width = Math.min(100, pct) + "%";
    
    const root = document.documentElement;
    let earnedXP = 0;
    let playCoin = false;
    let justHitMilestone = false; 

    if (pct >= 100) {
        if (!state.completed) {
            playSound('win');
            state.completed = true;
            document.getElementById('status-msg').innerText = "MISSION COMPLETE";
            spawnXP("VICTORY!");
        }
        return;
    }

    if (pct >= 90) {
        root.style.setProperty('--theme-color', '#ff003c');
        if (!state.milestone90) { 
            playSound('alert'); state.milestone90 = true; justHitMilestone = true;
            document.getElementById('badge-90').classList.add('active');
            earnedXP = 100;
        }
    } else if (pct >= 50) {
        root.style.setProperty('--theme-color', '#ffbf00');
        if (!state.milestone50) { 
            playSound('alert'); state.milestone50 = true; justHitMilestone = true;
            document.getElementById('badge-50').classList.add('active');
            earnedXP = 50;
        }
    }

    if (state.jumps % 10 === 0) {
        playCoin = true;
        earnedXP += 10;
    }

    if (earnedXP > 0) {
        state.totalXP += earnedXP;
        document.getElementById('xp-display').innerText = `XP: ${state.totalXP}`;
        spawnXP(`+${earnedXP} XP`);
        
        if (playCoin && !justHitMilestone) {
            playSound('coin');
        }
    }
}

function spawnXP(text) {
    const el = document.createElement('div');
    el.className = 'xp-float';
    el.innerText = text;
    document.body.appendChild(el);
    setTimeout(() => el.remove(), 1500);
}
