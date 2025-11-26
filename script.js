const GAME_STATES = {
    START: 'start',
    PLAYER_SELECT: 'player_select',
    GOALKEEPER_SELECT: 'goalkeeper_select',
    PLAYER_KICK: 'player_kick',
    PLAYER_SAVE: 'player_save',
    ANIMATION: 'animation',
    RESULT: 'result',
    GAME_OVER: 'game_over'
};

// Data pemain dan kiper
const players = {
    1: {
        id: 1,
        name: "Antony",
        number: 7,
        power: 95,
        accuracy: 92,
        weakFoot: 4,
        description: "GOAT hijau siap mendominasi La Liga"
    },
    2: {
        id: 2,
        name: "Mykhailo Mudryk",
        number: 10,
        power: 89,
        accuracy: 98,
        weakFoot: 5,
        description: "Master of precision with unmatched ball control"
    },
    3: {
        id: 3,
        name: "Darwin Núñez",
        number: 9,
        power: 97,
        accuracy: 90,
        weakFoot: 3,
        description: "Young powerhouse with devastating shot power"
    }
};

const goalkeepers = {
    1: {
        id: 1,
        name: "Goalkeeper",
        number: 1,
        reflex: 85,
        positioning: 88,
        experience: 90,
        description: "Reliable goalkeeper ready to make crucial saves"
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
        currentRound: 1,
        history: [],
        playerKicks: 0,
        computerKicks: 0
    },
    settings: {
        sound: true,
        difficulty: 'normal'
    },
    selectedPlayer: null,
    selectedGoalkeeper: null,
    currentRole: 'kicker',
    isSuddenDeath: false,
    currentPhase: 'player_kick' // 'player_kick' atau 'computer_kick'
};

// DOM Elements
const screens = {
    start: document.getElementById('start-screen'),
    playerSelect: document.getElementById('player-select-screen'),
    goalkeeperSelect: document.getElementById('goalkeeper-select-screen'),
    game: document.getElementById('game-screen'),
    result: document.getElementById('result-screen')
};

const elements = {
    playBtn: document.getElementById('play-btn'),
    backBtn: document.getElementById('back-btn'),
    backToPlayerBtn: document.getElementById('back-to-player-btn'),
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
    selectPlayerBtns: document.querySelectorAll('.select-player-btn'),
    goalkeeperCards: document.querySelectorAll('.player-card[data-goalkeeper]'),
    selectGoalkeeperBtns: document.querySelectorAll('.player-card[data-goalkeeper] .select-player-btn')
};

// Initialize Game
function initGame() {
    gameData.score.player = 0;
    gameData.score.computer = 0;
    gameData.kicks.currentRound = 1;
    gameData.kicks.history = [];
    gameData.kicks.playerKicks = 0;
    gameData.kicks.computerKicks = 0;
    gameData.settings.difficulty = elements.difficultySelect.value;
    gameData.currentRole = 'kicker';
    gameData.isSuddenDeath = false;
    gameData.currentPhase = 'player_kick';
    
    resetPositions();
    updateUI();
    enableKickButtons(true);
    
    showScreen('start');
}


// Show specific screen
function showScreen(screenName) {
    Object.values(screens).forEach(screen => {
        screen.classList.remove('active');
    });
    
    screens[screenName].classList.add('active');
    gameData.currentState = GAME_STATES[screenName.toUpperCase()];
}

// Update UI - HAPUS SCORE DISPLAY
function updateUI() {
    elements.playerScore.textContent = gameData.score.player;
    elements.computerScore.textContent = gameData.score.computer;
    
    // Update kicks remaining berdasarkan fase
    if (gameData.currentPhase === 'player_kick') {
        elements.kicksRemaining.textContent = gameData.kicks.total - gameData.kicks.playerKicks;
    } else {
        elements.kicksRemaining.textContent = gameData.kicks.total - gameData.kicks.computerKicks;
    }
    
    elements.muteBtn.textContent = gameData.settings.sound ? '🔊' : '🔇';
}

// Role indicator
function showRoleIndicator(role) {
    let existingIndicator = document.querySelector('.role-indicator');
    if (existingIndicator) {
        existingIndicator.remove();
    }
    
    const indicator = document.createElement('div');
    indicator.className = 'role-indicator';
    indicator.textContent = role === 'kicker' ? '🎯 YOUR TURN TO KICK' : '🧤 YOUR TURN TO SAVE';
    document.getElementById('game-screen').appendChild(indicator);
}

// Reset positions - HAPUS ANIMASI BOLA
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

// Hide result message
function hideResultMessage() {
    elements.resultMessage.style.display = 'none';
}

// AI Decision Making untuk tendangan
function getAIKickDirection() {
    const random = Math.random();
    
    switch(gameData.settings.difficulty) {
        case 'easy':
            return random < 0.4 ? 'left' : random < 0.7 ? 'center' : 'right';
        case 'normal':
            return random < 0.35 ? 'left' : random < 0.65 ? 'center' : 'right';
        case 'hard':
            return analyzePlayerPattern();
    }
}

// AI Decision Making untuk penyelamatan
function getAISaveDirection() {
    const random = Math.random();
    
    switch(gameData.settings.difficulty) {
        case 'easy':
            return random < 0.3 ? 'left' : random < 0.6 ? 'center' : 'right';
        case 'normal':
            return random < 0.35 ? 'left' : random < 0.65 ? 'center' : 'right';
        case 'hard':
            return analyzeKeeperPattern();
    }
}

function analyzeKeeperPattern() {
    const history = gameData.kicks.history;
    if (history.length === 0) {
        return Math.random() < 0.4 ? 'left' : Math.random() < 0.6 ? 'center' : 'right';
    }
    
    const recentKicks = history.slice(-3);
    const directionCount = { left: 0, center: 0, right: 0 };
    
    recentKicks.forEach(kick => {
        if (kick.playerChoice) directionCount[kick.playerChoice]++;
    });
    
    let mostCommon = 'left';
    if (directionCount.center > directionCount[mostCommon]) mostCommon = 'center';
    if (directionCount.right > directionCount[mostCommon]) mostCommon = 'right';
    
    if (Math.random() < 0.7) {
        return mostCommon;
    }
    
    const rand = Math.random();
    return rand < 0.4 ? 'left' : rand < 0.6 ? 'center' : 'right';
}

function analyzePlayerPattern() {
    const history = gameData.kicks.history;
    if (history.length === 0) {
        return Math.random() < 0.4 ? 'left' : Math.random() < 0.6 ? 'center' : 'right';
    }
    
    const directionCount = { left: 0, center: 0, right: 0 };
    history.forEach(kick => {
        if (kick.playerChoice) directionCount[kick.playerChoice]++;
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

function calculateWeakFootPenalty(weakFootRating) {
    return (5 - weakFootRating) * 0.06;
}

// Calculate penalty outcomes - PERBAIKI: post dan over terhitung sebagai gol
function calculatePenaltyResult(kickerChoice, keeperChoice, isPlayerKicking = true) {
    const player = isPlayerKicking ? gameData.selectedPlayer : players[Math.floor(Math.random() * 3) + 1];
    const weakFootPenalty = calculateWeakFootPenalty(player.weakFoot);
    const random = Math.random() * (1 - weakFootPenalty);
    
    if (random < 0.08) return 'post';
    if (random < 0.15) return 'over';
    
    return kickerChoice === keeperChoice ? 'saved' : 'goal';
}

// Player sebagai kiper - handle save
async function handlePlayerSave() {
    showRoleIndicator('keeper');
    enableKickButtons(true);
    
    return new Promise((resolve) => {
        const handleKick = async (e) => {
            const playerChoice = e.target.dataset.direction;
            const computerChoice = getAIKickDirection();
            const result = calculatePenaltyResult(computerChoice, playerChoice, false);
            
            enableKickButtons(false);
            playSound('kick');
            
            await animateKick(computerChoice, playerChoice, result, false);
            
            // Simpan hasil - PERBAIKI: post dan over TIDAK terhitung sebagai gol
            if (!gameData.kicks.history[gameData.kicks.currentRound - 1]) {
                gameData.kicks.history[gameData.kicks.currentRound - 1] = {};
            }
            gameData.kicks.history[gameData.kicks.currentRound - 1].computerResult = result;
            
            // HANYA goal yang terhitung sebagai gol
            if (result === 'goal') {
                gameData.score.computer++;
            }
            
            gameData.kicks.computerKicks++;
            updateUI();
            
            setTimeout(() => {
                resolve();
            }, 1500);
        };
        
        // Temporary event listener
        elements.kickButtons.forEach(btn => {
            btn.addEventListener('click', handleKick, { once: true });
        });
    });
}

// Animate kick sequence - HAPUS ANIMASI BOLA, SIMPAN ANIMASI KIPER
// Animate kick sequence - DENGAN ANIMASI BOLA SEDERHANA
async function animateKick(kickerChoice, keeperChoice, result, isPlayerKicking = true) {
    enableKickButtons(false);
    resetPositions();
    
    await new Promise(resolve => setTimeout(resolve, 300));
    
    // Animate keeper movement
    elements.goalkeeper.classList.add(`jump-${keeperChoice}`);
    
    await new Promise(resolve => setTimeout(resolve, 200));
    
    // Animate ball berdasarkan result dan arah tendangan
    let ballAnimationClass = '';
    
    if (result === 'goal') {
        ballAnimationClass = `moving-${kickerChoice}`;
    } else if (result === 'saved') {
        ballAnimationClass = `moving-${kickerChoice}`;
    } else if (result === 'post') {
        ballAnimationClass = `post-${kickerChoice}`;
    } else if (result === 'over') {
        ballAnimationClass = `over-${kickerChoice}`;
    }
    
    elements.ball.classList.add(ballAnimationClass);
    
    // Tampilkan hasil setelah animasi bola selesai
    const animationDuration = result === 'over' ? 900 : result === 'post' ? 800 : 600;
    
    setTimeout(() => {
        showResultMessage(result, kickerChoice, keeperChoice, isPlayerKicking);
        
        if (result === 'goal') {
            playSound('goal');
        } else if (result === 'saved') {
            playSound('save');
        } else {
            playSound('kick');
        }
    }, animationDuration - 300);
    
    await new Promise(resolve => setTimeout(resolve, animationDuration + 300));
    
    resetPositions();
    elements.goalkeeper.className = 'goalkeeper standby';
    
    await new Promise(resolve => setTimeout(resolve, 500));
    
    hideResultMessage();
    document.body.classList.remove('goal-celebration');
    
    enableKickButtons(true);
}

// Show result message - PERBAIKI PESAN UNTUK POST DAN OVER
function showResultMessage(result, kickerChoice, keeperChoice, isPlayerKicking) {
    const messages = {
        goal: isPlayerKicking ? 'GOAL! ⚽' : 'GOAL CONCEDED! ⚽',
        saved: isPlayerKicking ? 'SAVED! ✋' : 'GREAT SAVE! ✋',
        post: isPlayerKicking ? 'HIT THE POST! 🚪 (NO GOAL)' : 'HIT THE POST! 🚪 (NO GOAL)',
        over: isPlayerKicking ? 'OVER THE GOAL! ☁️ (NO GOAL)' : 'OVER THE GOAL! ☁️ (NO GOAL)'
    };
    
    elements.resultMessage.textContent = messages[result];
    elements.resultMessage.style.display = 'block';
}

async function playerKickPhase() {
    gameData.currentRole = 'kicker';
    gameData.currentPhase = 'player_kick';
    showRoleIndicator('kicker');
    
    await new Promise((resolve) => {
        const handleKick = async (e) => {
            const playerChoice = e.target.dataset.direction;
            const computerChoice = getAISaveDirection();
            const result = calculatePenaltyResult(playerChoice, computerChoice, true);
            
            enableKickButtons(false);
            playSound('kick');
            
            await animateKick(playerChoice, computerChoice, result, true);
            
            // Simpan hasil - HANYA goal yang terhitung sebagai gol
            if (!gameData.kicks.history[gameData.kicks.currentRound - 1]) {
                gameData.kicks.history[gameData.kicks.currentRound - 1] = {};
            }
            gameData.kicks.history[gameData.kicks.currentRound - 1].playerResult = result;
            
            if (result === 'goal') {
                gameData.score.player++;
            }
            
            gameData.kicks.playerKicks++;
            gameData.currentPhase = 'computer_kick'; // Pindah ke fase computer kick
            updateUI();
            resolve();
        };
        
        elements.kickButtons.forEach(btn => {
            btn.addEventListener('click', handleKick, { once: true });
        });
    });
}

async function computerKickPhase() {
    gameData.currentRole = 'keeper';
    gameData.currentPhase = 'computer_kick';
    await handlePlayerSave();
}

// Main game loop - DIPERBAIKI dengan sistem skor baru
async function playRound() {
    console.log(`Starting round ${gameData.currentRound}, Phase: ${gameData.currentPhase}`);
    
    // Player kicks first dalam ronde ini
    if (gameData.currentPhase === 'player_kick' && gameData.kicks.playerKicks < gameData.kicks.total) {
        await playerKickPhase();
    }
    
    // Computer kicks, player saves dalam ronde ini
    if (gameData.currentPhase === 'computer_kick' && gameData.kicks.computerKicks < gameData.kicks.total) {
        await computerKickPhase();
    }
    
    // Cek apakah semua tendangan sudah selesai
    if (gameData.kicks.playerKicks >= gameData.kicks.total && gameData.kicks.computerKicks >= gameData.kicks.total) {
        // Semua tendangan selesai, lanjut ke ronde berikutnya
        gameData.currentRound++;
        gameData.currentPhase = 'player_kick';
        
        // Cek apakah game harus berakhir
        if (shouldEndGame()) {
            endGame();
            return;
        } else {
            // Reset untuk ronde berikutnya
            gameData.kicks.playerKicks = 0;
            gameData.kicks.computerKicks = 0;
        }
    }
    
    // Lanjut ke fase berikutnya jika belum berakhir
    if (!shouldEndGame()) {
        setTimeout(playRound, 1000);
    } else {
        endGame();
    }
}

// PERBAIKI: Sistem akhir game dengan selisih 2 gol
function shouldEndGame() {
    const roundsCompleted = gameData.currentRound > 1 || 
                           (gameData.kicks.playerKicks >= gameData.kicks.total && 
                            gameData.kicks.computerKicks >= gameData.kicks.total);
    
    // Game berakhir setelah semua ronde selesai
    return roundsCompleted;
}

// End game and show results - UPDATE
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
    
    let historyHTML = '<h3>Shootout History:</h3>';
    gameData.kicks.history.forEach((kick, index) => {
        historyHTML += `
            <div class="kick-history-item">
                <strong>Round ${index + 1}:</strong><br>
                You: ${kick.playerResult === 'goal' ? '⚽ GOAL' : 
                       kick.playerResult === 'saved' ? '✋ SAVED' : 
                       kick.playerResult === 'post' ? '🚪 POST' : '☁️ OVER'} 
                | Computer: ${kick.computerResult === 'goal' ? '⚽ GOAL' : 
                            kick.computerResult === 'saved' ? '✋ SAVED' : 
                            kick.computerResult === 'post' ? '🚪 POST' : '☁️ OVER'}
            </div>
        `;
    });
    
    elements.scoreBreakdown.innerHTML = historyHTML;
    showScreen('result');
    playSound('whistle');
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
    
    let historyHTML = '<h3>Shootout History:</h3>';
    gameData.kicks.history.forEach((kick, index) => {
        const roundType = index >= 5 ? `SD${index - 4}` : `Round ${index + 1}`;
        
        historyHTML += `
            <div class="kick-history-item">
                <strong>${roundType}:</strong><br>
                You: ${kick.playerResult === 'goal' || kick.playerResult === 'post' || kick.playerResult === 'over' ? '⚽ GOAL' : '✋ SAVED'} 
                | Computer: ${kick.computerResult === 'goal' || kick.computerResult === 'post' || kick.computerResult === 'over' ? '⚽ GOAL' : '✋ SAVED'}
            </div>
        `;
    });
    
    elements.scoreBreakdown.innerHTML = historyHTML;
    showScreen('result');
    playSound('whistle');
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
            showScreen('goalkeeperSelect');
        });
    });
}

function selectPlayer(playerId) {
    elements.playerCards.forEach(card => {
        card.classList.remove('selected');
    });
    
    const selectedCard = document.querySelector(`.player-card[data-player="${playerId}"]`);
    selectedCard.classList.add('selected');
    
    gameData.selectedPlayer = players[playerId];
    console.log(`Selected player: ${gameData.selectedPlayer.name}`);
}

// Initialize goalkeeper selection
function initGoalkeeperSelection() {
    elements.goalkeeperCards.forEach(card => {
        card.addEventListener('click', (e) => {
            if (e.target.classList.contains('select-player-btn')) return;
            const goalkeeperId = card.dataset.goalkeeper;
            selectGoalkeeper(goalkeeperId);
        });
    });
    
    elements.selectGoalkeeperBtns.forEach(btn => {
        btn.addEventListener('click', (e) => {
            const card = e.target.closest('.player-card');
            const goalkeeperId = card.dataset.goalkeeper;
            selectGoalkeeper(goalkeeperId);
            startGame();
        });
    });
}

function selectGoalkeeper(goalkeeperId) {
    elements.goalkeeperCards.forEach(card => {
        card.classList.remove('selected');
    });
    
    const selectedCard = document.querySelector(`.player-card[data-goalkeeper="${goalkeeperId}"]`);
    selectedCard.classList.add('selected');
    
    gameData.selectedGoalkeeper = goalkeepers[goalkeeperId];
    console.log(`Selected goalkeeper: ${gameData.selectedGoalkeeper.name}`);
}

// Start game dengan pemain dan kiper yang dipilih
function startGame() {
    if (!gameData.selectedPlayer || !gameData.selectedGoalkeeper) {
        alert('Please select both a player and goalkeeper first!');
        return;
    }
    
    gameData.score.player = 0;
    gameData.score.computer = 0;
    gameData.kicks.currentRound = 1;
    gameData.kicks.history = [];
    gameData.kicks.playerKicks = 0;
    gameData.kicks.computerKicks = 0;
    gameData.currentRole = 'kicker';
    gameData.isSuddenDeath = false;
    gameData.currentPhase = 'player_kick';
    
    resetPositions();
    updateUI();
    enableKickButtons(true);
    
    showScreen('game');
    playSound('whistle');
    
    // Start the game loop
    setTimeout(playRound, 1000);
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
document.addEventListener('DOMContentLoaded', () => {
    initGame();
    initPlayerSelection();
    initGoalkeeperSelection();
    
    elements.playBtn.addEventListener('click', () => {
        showScreen('playerSelect');
    });
    
    elements.backBtn.addEventListener('click', () => {
        showScreen('start');
    });
    
    elements.backToPlayerBtn.addEventListener('click', () => {
        showScreen('playerSelect');
    });
    
    elements.restartBtn.addEventListener('click', () => {
        startGame();
    });
    
    elements.homeBtn.addEventListener('click', () => {
        initGame();
    });
    
    elements.muteBtn.addEventListener('click', () => {
        gameData.settings.sound = !gameData.settings.sound;
        updateUI();
    });
});

// Export untuk debugging
window.gameData = gameData;
console.log('Enhanced Penalty Shootout Simulator loaded!');