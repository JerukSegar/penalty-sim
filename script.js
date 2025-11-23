// Game Constants
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
    
    updateUI();
    showScreen('start');
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

// AI Decision Making
function getAIDirection() {
    const random = Math.random();
    
    switch(gameData.settings.difficulty) {
        case 'easy':
            return random < 0.3 ? 'left' : random < 0.6 ? 'center' : 'right';
        case 'normal':
            return random < 0.33 ? 'left' : random < 0.66 ? 'center' : 'right';
        case 'hard':
            // For hard mode, analyze player pattern
            return analyzePlayerPattern();
    }
}

// Analyze player pattern for hard difficulty
function analyzePlayerPattern() {
    const history = gameData.kicks.history;
    if (history.length === 0) {
        return Math.random() < 0.33 ? 'left' : Math.random() < 0.66 ? 'center' : 'right';
    }
    
    // Simple pattern detection - favor most common player choice
    const lastKick = history[history.length - 1];
    const sameDirectionChance = 0.4; // 40% chance to choose same direction as last AI choice
    
    if (Math.random() < sameDirectionChance) {
        return lastKick.computerChoice;
    }
    
    // Otherwise random
    return Math.random() < 0.33 ? 'left' : Math.random() < 0.66 ? 'center' : 'right';
}

// Calculate penalty result
function calculatePenaltyResult(playerChoice, computerChoice) {
    return playerChoice === computerChoice ? 'saved' : 'goal';
}

// Show result message
function showResultMessage(result, playerChoice, computerChoice) {
    const messages = {
        goal: 'GOAL!',
        saved: 'SAVED!'
    };
    
    elements.resultMessage.textContent = messages[result];
    elements.resultMessage.style.display = 'block';
    
    // Add detailed info for debugging
    console.log(`Player: ${playerChoice}, AI: ${computerChoice}, Result: ${result}`);
}

// Hide result message
function hideResultMessage() {
    elements.resultMessage.style.display = 'none';
}

// Animate kick sequence
async function animateKick(playerChoice, computerChoice, result) {
    // Reset positions
    elements.ball.style.bottom = '20px';
    elements.ball.style.left = '50%';
    elements.ball.className = 'ball';
    elements.goalkeeper.className = 'goalkeeper standby';
    
    // Animate goalkeeper first
    await new Promise(resolve => setTimeout(resolve, 300));
    elements.goalkeeper.className = `goalkeeper ${computerChoice}`;
    
    // Animate ball movement with better positioning
    await new Promise(resolve => setTimeout(resolve, 200));
    
    // Move ball to target position based on player choice
    elements.ball.classList.add(`kick-${playerChoice}`);
    
    // If goal, make ball disappear at the top
    if (result === 'goal') {
        await new Promise(resolve => setTimeout(resolve, 400));
        elements.ball.classList.add('goal');
    }
    
    // Show result
    await new Promise(resolve => setTimeout(resolve, 300));
    showResultMessage(result, playerChoice, computerChoice);
    
    // Add celebration effects
    if (result === 'goal') {
        document.body.classList.add('goal-celebration');
    } else {
        elements.goalkeeper.classList.add('save-reaction');
    }
    
    // Wait and clean up
    await new Promise(resolve => setTimeout(resolve, 1500));
    hideResultMessage();
    document.body.classList.remove('goal-celebration');
    elements.goalkeeper.classList.remove('save-reaction');
    
    // Reset ball position for next kick
    elements.ball.style.bottom = '20px';
    elements.ball.style.left = '50%';
    elements.ball.className = 'ball';
}

// Process kick result
function processKickResult(playerChoice, computerChoice, result) {
    // Update score
    if (result === 'goal') {
        gameData.score.player++;
        playSound('goal');
    } else {
        gameData.score.computer++;
        playSound('save');
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
        }, 2000);
    } else {
        setTimeout(endGame, 2000);
    }
}

// End game and show results
function endGame() {
    const playerScore = gameData.score.player;
    const computerScore = gameData.score.computer;
    
    let resultText = '';
    if (playerScore > computerScore) {
        resultText = 'YOU WIN!';
    } else if (playerScore < computerScore) {
        resultText = 'YOU LOSE!';
    } else {
        resultText = 'DRAW!';
    }
    
    elements.finalResult.innerHTML = `
        <div style="color: ${playerScore > computerScore ? '#228b22' : playerScore < computerScore ? '#b22222' : '#ff8c00'};">
            ${resultText}<br>
            <span style="font-size: 1.2em;">Final Score: ${playerScore} - ${computerScore}</span>
        </div>
    `;
    
    // Show kick history
    let historyHTML = '<h3>Kick History:</h3>';
    gameData.kicks.history.forEach((kick, index) => {
        const resultIcon = kick.result === 'goal' ? '' : '';
        historyHTML += `
            <div class="kick-history-item">
                Kick ${index + 1}: You ${kick.playerChoice.toUpperCase()} vs AI ${kick.computerChoice.toUpperCase()} → ${resultIcon} ${kick.result.toUpperCase()}
            </div>
        `;
    });
    
    elements.scoreBreakdown.innerHTML = historyHTML;
    showScreen('result');
    playSound('whistle');
}

// Sound system (placeholder)
function playSound(soundName) {
    if (!gameData.settings.sound) return;
    
    const soundMessages = {
        kick: '🔊 Kick sound...',
        goal: '🎉 Goal celebration!',
        save: '👏 Applause!',
        whistle: '📯 Referee whistle!'
    };
    
    console.log(soundMessages[soundName] || `🔊 Playing: ${soundName}`);
    
    // In real implementation, this would play actual audio files
    // new Audio(`./assets/audio/${soundName}.mp3`).play();
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

// Kick button handlers
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

// Export for debugging (remove in production)
window.gameData = gameData;
console.log('Penalty Shootout Simulator loaded!');
console.log('Tips: Open browser console to see debug info');