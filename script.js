const GAME_STATES = {
    START: 'start',
    PLAYER_SELECT: 'player_select',
    KICK_PREPARATION: 'kick_prep',
    KICK_SELECTION: 'kick_selection',
    ANIMATION: 'animation',
    RESULT: 'result',
    GAME_OVER: 'game_over'
};

// Data pemain
const players = {
    1: {
        id: 1,
        name: "Antony",
        number: 7,
        team: "Brazil",
        power: 95,
        accuracy: 92,
        experience: 98,
        description: "The complete striker with powerful shots and incredible experience in pressure situations."
    },
    2: {
        id: 2,
        name: "Mykhailo Mudryk",
        number: 10,
        team: "Ukraine",
        power: 88,
        accuracy: 98,
        experience: 96,
        description: "Master of precision with unmatched ball control and placement accuracy."
    },
    3: {
        id: 3,
        name: "Darwin Núñez",
        number: 9,
        team: "Uruguay",
        power: 97,
        accuracy: 90,
        experience: 85,
        description: "Young powerhouse with devastating shot power and clinical finishing."
    }
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
    },
    selectedPlayer: null
};

// DOM Elements
const screens = {
    start: document.getElementById('start-screen'),
    playerSelect: document.getElementById('player-select-screen'),
    game: document.getElementById('game-screen'),
    result: document.getElementById('result-screen')
};

const elements = {
    playBtn: document.getElementById('play-btn'),
    backBtn: document.getElementById('back-btn'),
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
    kickButtons: document.querySelectorAll('.kick-btn'),
    playerCards: document.querySelectorAll('.player-card'),
    selectPlayerBtns: document.querySelectorAll('.select-player-btn')
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
    
    // Reset to start screen
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

// AI Decision Making
function getAIDirection() {
    const random = Math.random();
    
    switch(gameData.settings.difficulty) {
        case 'easy':
            return random < 0.25 ? 'left' : random < 0.5 ? 'center' : 'right';
        case 'normal':
            return random < 0.35 ? 'left' : random < 0.65 ? 'center' : 'right';
        case 'hard':
            return analyzePlayerPattern();
    }
}

// Analyze player pattern for hard difficulty
function analyzePlayerPattern() {
    const history = gameData.kicks.history;
    if (history.length === 0) {
        return Math.random() < 0.4 ? 'left' : Math.random() < 0.6 ? 'center' : 'right';
    }
    
    const directionCount = { left: 0, center: 0, right: 0 };
    history.forEach(kick => {
        directionCount[kick.playerChoice]++;
    });
    
    let mostCommon = 'left';
    if (directionCount.center > directionCount[mostCommon]) mostCommon = 'center';
    if (directionCount.right > directionCount[mostCommon]) mostCommon = 'right';
    
    if (Math.random() < 0.6) {
        return mostCommon;
    }
    
    const rand = Math.random();
    return rand < 0.45 ? 'left' : rand < 0.55 ? 'center' : 'right';
}

// Calculate penalty outcomes
function calculatePenaltyResult(playerChoice, computerChoice) {
    const random = Math.random();
    
    // 10% chance of hitting post
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

// Show result message
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

// Animate kick sequence
async function animateKick(playerChoice, computerChoice, result) {
    enableKickButtons(false);
    resetPositions();
    
    await new Promise(resolve => setTimeout(resolve, 300));
    
    elements.goalkeeper.className = `goalkeeper ${computerChoice}`;
    
    await new Promise(resolve => setTimeout(resolve, 200));
    
    elements.ball.classList.add(`moving-${playerChoice}`);
    
    await new Promise(resolve => setTimeout(resolve, 600));
    
    if (result === 'goal') {
        elements.ball.style.opacity = '0';
        await new Promise(resolve => setTimeout(resolve, 500));
    } else if (result === 'saved') {
        elements.ball.style.opacity = '0';
        await new Promise(resolve => setTimeout(resolve, 500));
    } else if (result === 'post') {
        elements.ball.classList.add('post');
        await new Promise(resolve => setTimeout(resolve, 400));
        elements.ball.style.opacity = '0';
        await new Promise(resolve => setTimeout(resolve, 300));
    } else if (result === 'over') {
        elements.ball.classList.add('over');
        await new Promise(resolve => setTimeout(resolve, 600));
        elements.ball.style.opacity = '0';
        await new Promise(resolve => setTimeout(resolve, 200));
    }
    
    showResultMessage(result, playerChoice, computerChoice);
    
    if (result === 'goal') {
        document.body.classList.add('goal-celebration');
        playSound('goal');
    } else if (result === 'saved') {
        elements.goalkeeper.classList.add('save-reaction');
        playSound('save');
    } else {
        playSound('kick');
    }
    
    await new Promise(resolve => setTimeout(resolve, 1200));
    
    resetPositions();
    elements.goalkeeper.className = 'goalkeeper standby';
    
    await new Promise(resolve => setTimeout(resolve, 500));
    
    hideResultMessage();
    document.body.classList.remove('goal-celebration');
    elements.goalkeeper.classList.remove('save-reaction');
    
    enableKickButtons(true);
}

// Process kick result
function processKickResult(playerChoice, computerChoice, result) {
    if (result === 'goal') {
        gameData.score.player++;
    } else if (result === 'saved' || result === 'post' || result === 'over') {
        gameData.score.computer++;
    }
    
    gameData.kicks.history.push({
        playerChoice,
        computerChoice,
        result
    });
    
    gameData.kicks.remaining--;
    updateUI();
    
    if (gameData.kicks.remaining > 0) {
        setTimeout(() => {
            gameData.currentState = GAME_STATES.KICK_PREPARATION;
        }, 1500);
    } else {
        setTimeout(endGame, 1500);
    }
}

// End game and show results
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

// Initialize player selection
function initPlayerSelection() {
    elements.playerCards.forEach(card => {
        card.addEventListener('click', (e) => {
            if (e.target.classList.contains('select-player-btn')) return;
            
            const playerId = card.dataset.player;
            selectPlayer(playerId);
        });
    });
    
    elements.selectPlayerBtns.forEach(btn => {
        btn.addEventListener('click', (e) => {
            const card = e.target.closest('.player-card');
            const playerId = card.dataset.player;
            selectPlayer(playerId);
            startGameWithPlayer();
        });
    });
}

// Tambahkan di fungsi initPlayerSelection() atau tempat yang sesuai
function initPlayerSelection() {
    elements.playerCards.forEach(card => {
        card.addEventListener('click', (e) => {
            if (e.target.classList.contains('select-player-btn')) return;
            
            const playerId = card.dataset.player;
            selectPlayer(playerId);
        });
    });
    
    elements.selectPlayerBtns.forEach(btn => {
        btn.addEventListener('click', (e) => {
            const card = e.target.closest('.player-card');
            const playerId = card.dataset.player;
            selectPlayer(playerId);
            
            // Scroll ke card yang dipilih untuk mobile
            if (window.innerWidth <= 600) {
                card.scrollIntoView({ behavior: 'smooth', block: 'center' });
            }
            
            startGameWithPlayer();
        });
    });
    
    // Handle scroll behavior untuk container
    const playerSelectCard = document.querySelector('#player-select-screen .card');
    if (playerSelectCard) {
        playerSelectCard.addEventListener('scroll', function() {
            // Memastikan tombol back tetap terlihat
            const backBtn = document.getElementById('back-btn');
            const scrollBottom = this.scrollHeight - this.scrollTop - this.clientHeight;
            
            if (scrollBottom < 60) { // Jika mendekati bagian bawah
                backBtn.style.position = 'relative';
            } else {
                backBtn.style.position = 'sticky';
            }
        });
    }
}

// Select player function
function selectPlayer(playerId) {
    elements.playerCards.forEach(card => {
        card.classList.remove('selected');
    });
    
    const selectedCard = document.querySelector(`.player-card[data-player="${playerId}"]`);
    selectedCard.classList.add('selected');
    
    gameData.selectedPlayer = players[playerId];
    
    console.log(`Selected player: ${gameData.selectedPlayer.name}`);
}

// Start game dengan pemain yang dipilih
function startGameWithPlayer() {
    if (!gameData.selectedPlayer) {
        alert('Please select a player first!');
        return;
    }
    
    // Reset game state untuk memulai permainan baru
    gameData.score.player = 0;
    gameData.score.computer = 0;
    gameData.kicks.remaining = gameData.kicks.total;
    gameData.kicks.history = [];
    
    resetPositions();
    updateUI();
    enableKickButtons(true);
    
    showScreen('game');
    gameData.currentState = GAME_STATES.KICK_PREPARATION;
    playSound('whistle');
}

// Event Listeners
elements.playBtn.addEventListener('click', () => {
    showScreen('playerSelect');
});

elements.backBtn.addEventListener('click', () => {
    showScreen('start');
});

elements.restartBtn.addEventListener('click', () => {
    startGameWithPlayer();
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
        
        playSound('kick');
        
        await animateKick(playerChoice, computerChoice, result);
        processKickResult(playerChoice, computerChoice, result);
    });
});

// Initialize game on load
document.addEventListener('DOMContentLoaded', () => {
    initGame();
    initPlayerSelection();
});

// Export for debugging
window.gameData = gameData;
console.log('Penalty Shootout Simulator loaded!');
console.log('Tips: Open browser console to see debug info');