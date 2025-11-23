const GAME_STATES = {
    START: 'start',
    KICK_PREPARATION: 'kick_prep',
    KICK_SELECTION: 'kick_selection',
    ANIMATION: 'animation',
    RESULT: 'result',
    GAME_OVER: 'game_over'
};

// Game Data
const gameData = {
    currentState: GAME_STATES.START,
    score: {
        player: 0,
        computer: 0
    },
    kicks: {
        total: 5,
        remaining: 5,
        history: []
    },
    settings: {
        sound: true,
        difficulty: 'normal'
    }
};

// DOM Elements
const screens = {
    start: document.getElementById('start-screen'),
    game: document.getElementById('game-screen'),
    result: document.getElementById('result-screen')
};

const elements = {
    startBtn: document.getElementById('start-btn'),
    restartBtn: document.getElementById('restart-btn'),
    homeBtn: document.getElementById('home-btn'),
    muteBtn: document.getElementById('mute-btn'),
    difficultySelect: document.getElementById('difficulty-select'),
    playerScore: document.getElementById('player-score'),
    computerScore: document.getElementById('computer-score'),
    kicksRemaining: document.getElementById('kicks-remaining'),
    goalkeeper: document.getElementById('goalkeeper'),
    ball: document.getElementById('ball'),
    resultMessage: document.getElementById('result-message'),
    finalResult: document.getElementById('final-result'),
    scoreBreakdown: document.getElementById('score-breakdown'),
    kickButtons: document.querySelectorAll('.kick-btn')
};

// Initialize Game
function initGame() {
    // Reset game data
    gameData.score.player = 0;
    gameData.score.computer = 0;
    gameData.kicks.remaining = gameData.kicks.total;
    gameData.kicks.history = [];
    gameData.settings.difficulty = elements.difficultySelect.value;
    
    // Reset positions
    resetPositions();
    updateUI();
    enableKickButtons(true);
    showScreen('start');
}

// Reset semua posisi ke awal
function resetPositions() {
    elements.ball.className = 'ball';
    elements.goalkeeper.className = 'goalkeeper standby';
    elements.ball.style.bottom = '15px';
    elements.ball.style.left = '50%';
    elements.ball.style.opacity = '1';
    elements.ball.style.transform = 'translateX(-50%)';
}

// Enable/disable kick buttons
function enableKickButtons(enable) {
    elements.kickButtons.forEach(button => {
        button.disabled = !enable;
        button.style.opacity = enable ? '1' : '0.5';
        button.style.cursor = enable ? 'pointer' : 'not-allowed';
    });
}

// Show specific screen
function showScreen(screenName) {
    // Hide all screens
    Object.values(screens).forEach(screen => {
        screen.classList.remove('active');
    });
    
    // Show target screen
    screens[screenName].classList.add('active');
    gameData.currentState = GAME_STATES[screenName.toUpperCase()];
}

// Update UI elements
function updateUI() {
    elements.playerScore.textContent = gameData.score.player;
    elements.computerScore.textContent = gameData.score.computer;
    elements.kicksRemaining.textContent = gameData.kicks.remaining;
    elements.muteBtn.textContent = gameData.settings.sound ? '🔊' : '🔇';
}

// AI Decision Making - IMPROVED: mengurangi kemungkinan center
function getAIDirection() {
    const random = Math.random();
    
    switch(gameData.settings.difficulty) {
        case 'easy':
            // easy: 25% left, 25% center, 50% right
            return random < 0.25 ? 'left' : random < 0.5 ? 'center' : 'right';
        case 'normal':
            // normal: 35% left, 30% center, 35% right
            return random < 0.35 ? 'left' : random < 0.65 ? 'center' : 'right';
        case 'hard':
            // hard: 40% left, 20% center, 40% right + pattern analysis
            return analyzePlayerPattern();
    }
}

// Analyze player pattern for hard difficulty - IMPROVED
function analyzePlayerPattern() {
    const history = gameData.kicks.history;
    if (history.length === 0) {
        return Math.random() < 0.4 ? 'left' : Math.random() < 0.6 ? 'center' : 'right';
    }
    
    // Count player's most common choice
    const directionCount = { left: 0, center: 0, right: 0 };
    history.forEach(kick => {
        directionCount[kick.playerChoice]++;
    });
    
    // Find most common player choice
    let mostCommon = 'left';
    if (directionCount.center > directionCount[mostCommon]) mostCommon = 'center';
    if (directionCount.right > directionCount[mostCommon]) mostCommon = 'right';
    
    // 60% chance to choose the direction that counters player's most common choice
    if (Math.random() < 0.6) {
        return mostCommon;
    }
    
    // Otherwise random with bias away from center
    const rand = Math.random();
    return rand < 0.45 ? 'left' : rand < 0.55 ? 'center' : 'right';
}

// NEW: Calculate additional penalty outcomes
function calculatePenaltyResult(playerChoice, computerChoice) {
    const random = Math.random();
    
    // 10% chance of hitting post (regardless of goalkeeper position)
    if (random < 0.1) {
        return 'post';
    }
    
    // 5% chance of ball going over the goal
    if (random < 0.15) {
        return 'over';
    }
    
    // Normal calculation
    return playerChoice === computerChoice ? 'saved' : 'goal';
}

// Show result message - UPDATED dengan hasil baru
function showResultMessage(result, playerChoice, computerChoice) {
    const messages = {
        goal: 'GOAL! ⚽',
        saved: 'SAVED! ✋',
        post: 'HIT THE POST! 🚪',
        over: 'OVER THE GOAL! ☁️'
    };
    
    elements.resultMessage.textContent = messages[result];
    elements.resultMessage.style.display = 'block';
    
    console.log(`Player: ${playerChoice}, AI: ${computerChoice}, Result: ${result}`);
}

// Hide result message
function hideResultMessage() {
    elements.resultMessage.style.display = 'none';
}

// Animate kick sequence - IMPROVED dengan animasi baru
async function animateKick(playerChoice, computerChoice, result) {
    // Disable kick buttons selama animasi
    enableKickButtons(false);
    
    // Reset positions
    resetPositions();
    
    // Small delay before animation starts
    await new Promise(resolve => setTimeout(resolve, 300));
    
    // Animate goalkeeper dive
    elements.goalkeeper.className = `goalkeeper ${computerChoice}`;
    
    // Delay sebelum bola bergerak
    await new Promise(resolve => setTimeout(resolve, 200));
    
    // Animate ball movement berdasarkan arah tendangan
    elements.ball.classList.add(`moving-${playerChoice}`);
    
    // Tunggu animasi bola selesai
    await new Promise(resolve => setTimeout(resolve, 600));
    
    // Animasi berdasarkan hasil
    if (result === 'goal') {
        // NEW: Animasi goal - bola memudar dan muncul kembali
        elements.ball.style.opacity = '0';
        await new Promise(resolve => setTimeout(resolve, 500));
    } else if (result === 'saved') {
        elements.ball.classList.add('saved');
        await new Promise(resolve => setTimeout(resolve, 500));
    } else if (result === 'post') {
        // NEW: Animasi bola memantul dari tiang
        elements.ball.classList.add('post');
        await new Promise(resolve => setTimeout(resolve, 700));
    } else if (result === 'over') {
        // NEW: Animasi bola melambung tinggi
        elements.ball.classList.add('over');
        await new Promise(resolve => setTimeout(resolve, 800));
    }
    
    // Show result
    showResultMessage(result, playerChoice, computerChoice);
    
    // Add celebration effects
    if (result === 'goal') {
        document.body.classList.add('goal-celebration');
        playSound('goal');
    } else if (result === 'saved') {
        elements.goalkeeper.classList.add('save-reaction');
        playSound('save');
    } else {
        playSound('kick'); // Sound untuk post dan over
    }
    
    // Tunggu sebentar untuk melihat hasil
    await new Promise(resolve => setTimeout(resolve, 1200));
    
    // Reset untuk tendangan berikutnya
    resetPositions();
    elements.goalkeeper.className = 'goalkeeper standby';
    
    // Tunggu sedikit lagi kemudian reset semua
    await new Promise(resolve => setTimeout(resolve, 500));
    
    // Clean up
    hideResultMessage();
    document.body.classList.remove('goal-celebration');
    elements.goalkeeper.classList.remove('save-reaction');
    
    // Enable kick buttons kembali
    enableKickButtons(true);
}

// Process kick result - UPDATED dengan hasil baru
function processKickResult(playerChoice, computerChoice, result) {
    // Update score
    if (result === 'goal') {
        gameData.score.player++;
    } else if (result === 'saved' || result === 'post' || result === 'over') {
        gameData.score.computer++;
    }
    
    // Record history
    gameData.kicks.history.push({
        playerChoice,
        computerChoice,
        result
    });
    
    gameData.kicks.remaining--;
    updateUI();
    
    // Check if game should continue
    if (gameData.kicks.remaining > 0) {
        setTimeout(() => {
            gameData.currentState = GAME_STATES.KICK_PREPARATION;
        }, 1500);
    } else {
        setTimeout(endGame, 1500);
    }
}

// End game and show results - UPDATED dengan hasil baru
function endGame() {
    const playerScore = gameData.score.player;
    const computerScore = gameData.score.computer;
    
    let resultText = '';
    if (playerScore > computerScore) {
        resultText = 'YOU WIN! 🏆';
    } else if (playerScore < computerScore) {
        resultText = 'YOU LOSE! 😔';
    } else {
        resultText = 'DRAW! 🤝';
    }
    
    elements.finalResult.innerHTML = `
        <div style="color: ${playerScore > computerScore ? '#2d5016' : playerScore < computerScore ? '#c53030' : '#d69e2e'};">
            ${resultText}<br>
            <span style="font-size: 1.1em;">Final Score: ${playerScore} - ${computerScore}</span>
        </div>
    `;
    
    // Show kick history dengan hasil baru
    let historyHTML = '<h3>Kick History:</h3>';
    gameData.kicks.history.forEach((kick, index) => {
        let resultIcon, resultColor, resultText;
        
        switch(kick.result) {
            case 'goal':
                resultIcon = '⚽';
                resultColor = '#2d5016';
                resultText = 'GOAL';
                break;
            case 'saved':
                resultIcon = '✋';
                resultColor = '#c53030';
                resultText = 'SAVED';
                break;
            case 'post':
                resultIcon = '🚪';
                resultColor = '#d69e2e';
                resultText = 'POST';
                break;
            case 'over':
                resultIcon = '☁️';
                resultColor = '#3182ce';
                resultText = 'OVER';
                break;
        }
        
        historyHTML += `
            <div class="kick-history-item" style="border-left: 4px solid ${resultColor}">
                Kick ${index + 1}: You shot <strong>${kick.playerChoice.toUpperCase()}</strong> 
                vs AI moved <strong>${kick.computerChoice.toUpperCase()}</strong> 
                → ${resultIcon} <strong style="color: ${resultColor}">${resultText}</strong>
            </div>
        `;
    });
    
    elements.scoreBreakdown.innerHTML = historyHTML;
    showScreen('result');
    playSound('whistle');
}

// Sound system
function playSound(soundName) {
    if (!gameData.settings.sound) return;
    
    const soundMessages = {
        kick: '🔊 Kick sound...',
        goal: '🎉 Goal celebration!',
        save: '👏 Save applause!',
        whistle: '📯 Referee whistle!'
    };
    
    console.log(soundMessages[soundName] || `🔊 Playing: ${soundName}`);
}

// Event Listeners
elements.startBtn.addEventListener('click', () => {
    initGame();
    showScreen('game');
    gameData.currentState = GAME_STATES.KICK_PREPARATION;
    playSound('whistle');
});

elements.restartBtn.addEventListener('click', () => {
    initGame();
    showScreen('game');
    gameData.currentState = GAME_STATES.KICK_PREPARATION;
    playSound('whistle');
});

elements.homeBtn.addEventListener('click', () => {
    initGame();
});

elements.muteBtn.addEventListener('click', () => {
    gameData.settings.sound = !gameData.settings.sound;
    updateUI();
});

// Kick button handlers - UPDATED dengan state management
elements.kickButtons.forEach(button => {
    button.addEventListener('click', async (e) => {
        if (gameData.currentState !== GAME_STATES.KICK_PREPARATION) return;
        
        const playerChoice = e.target.dataset.direction;
        const computerChoice = getAIDirection();
        const result = calculatePenaltyResult(playerChoice, computerChoice);
        
        gameData.currentState = GAME_STATES.ANIMATION;
        
        // Play kick sound
        playSound('kick');
        
        // Animate and process result
        await animateKick(playerChoice, computerChoice, result);
        processKickResult(playerChoice, computerChoice, result);
    });
});

// Initialize game on load
document.addEventListener('DOMContentLoaded', initGame);

// Export for debugging
window.gameData = gameData;
console.log('Penalty Shootout Simulator loaded!');
console.log('Tips: Open browser console to see debug info');