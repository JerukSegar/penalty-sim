const GAME_STATES = {
    START: 'start',
    PLAYER_SELECT: 'player_select',
    PLAYER_KICK: 'player_kick',
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

// Initialize elements object
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
    console.log('Initializing game...');
    
    gameData.score.player = 0;
    gameData.score.computer = 0;
    gameData.kicks.remaining = 5;
    gameData.kicks.history = [];
    gameData.settings.difficulty = elements.difficultySelect.value;
    gameData.selectedPlayer = null;
    
    resetPositions();
    updateUI();
    enableKickButtons(true);
    
    showScreen('start');
}

// Show specific screen
function showScreen(screenName) {
    console.log('Showing screen:', screenName);
    
    Object.values(screens).forEach(screen => {
        if (screen) {
            screen.classList.remove('active');
        }
    });
    
    // Map screen names to actual screen elements
    const screenMap = {
        'start': screens.start,
        'player_select': screens.playerSelect,
        'game': screens.game,
        'result': screens.result
    };
    
    const targetScreen = screenMap[screenName];
    if (targetScreen) {
        targetScreen.classList.add('active');
        gameData.currentState = GAME_STATES[screenName.toUpperCase()];
    } else {
        console.error('Screen not found:', screenName);
    }
}

// Update UI
function updateUI() {
    if (elements.playerScore) elements.playerScore.textContent = gameData.score.player;
    if (elements.computerScore) elements.computerScore.textContent = gameData.score.computer;
    if (elements.muteBtn) elements.muteBtn.textContent = gameData.settings.sound ? '🔊' : '🔇';
}

// Reset positions
function resetPositions() {
    if (!elements.ball || !elements.goalkeeper) return;
    
    // PERBAIKAN: Hapus semua class animasi
    elements.ball.className = 'ball';
    elements.goalkeeper.className = 'goalkeeper standby';
    
    // PERBAIKAN: Reset style secara eksplisit
    elements.ball.style.cssText = `
        bottom: 15px;
        left: 50%;
        opacity: 1;
        transform: translateX(-50%);
    `;
    
    // PERBAIKAN: Hapus inline style yang mungkin mengganggu
    elements.ball.style.animation = '';
    elements.ball.style.transition = '';
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
    if (elements.resultMessage) {
        elements.resultMessage.style.display = 'none';
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
            return analyzePlayerPattern();
        default:
            return random < 0.35 ? 'left' : random < 0.65 ? 'center' : 'right';
    }
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

// Calculate penalty outcomes
// Calculate penalty outcomes - TAMBAH DEBUG
function calculatePenaltyResult(kickerChoice, keeperChoice) {
    const player = gameData.selectedPlayer;
    if (!player) return 'over';
    
    const weakFootPenalty = calculateWeakFootPenalty(player.weakFoot);
    const random = Math.random() * (1 - weakFootPenalty);
    
    let result;
    if (random < 0.08) {
        result = 'post';
    } else if (random < 0.15) {
        result = 'over';
    } else {
        result = kickerChoice === keeperChoice ? 'saved' : 'goal';
    }
    
    // DEBUG: Lihat probabilitas yang dihasilkan
    console.log(`Penalty calculation: 
        Player: ${player.name}
        WeakFoot: ${player.weakFoot} (penalty: ${weakFootPenalty})
        Random: ${random}
        Kicker: ${kickerChoice}, Keeper: ${keeperChoice}
        Result: ${result}
    `);
    
    return result;
}

// Animate kick sequence
async function animateKick(kickerChoice, keeperChoice, result) {
    enableKickButtons(false);
    resetPositions();
    
    await new Promise(resolve => setTimeout(resolve, 300));
    
    // Animate keeper movement
    if (elements.goalkeeper) {
        elements.goalkeeper.classList.add(`jump-${keeperChoice}`);
    }
    
    await new Promise(resolve => setTimeout(resolve, 200));
    
    // PERBAIKAN: Gunakan class animasi yang benar berdasarkan result
    let ballAnimationClass = '';
    
    if (result === 'goal') {
        ballAnimationClass = `moving-${kickerChoice}`;
        document.body.classList.add('goal-celebration');
    } else if (result === 'saved') {
        ballAnimationClass = `moving-${kickerChoice}`;
    } else if (result === 'post') {
        ballAnimationClass = `post-${kickerChoice}`;
    } else if (result === 'over') {
        ballAnimationClass = `over-${kickerChoice}`;
    }
    
    if (elements.ball) {
        elements.ball.classList.add(ballAnimationClass);
    }
    
    // PERBAIKAN: Timing yang lebih baik untuk result message
    const animationDuration = result === 'over' ? 900 : result === 'post' ? 800 : 600;
    
    setTimeout(() => {
        showResultMessage(result, kickerChoice, keeperChoice);
        
        if (result === 'goal') {
            playSound('goal');
        } else if (result === 'saved') {
            playSound('save');
        } else {
            playSound('kick');
        }
    }, animationDuration - 200);
    
    // PERBAIKAN: Tunggu animasi selesai sebelum reset
    await new Promise(resolve => setTimeout(resolve, animationDuration + 500));
    
    // Reset untuk tendangan berikutnya
    resetPositions();
    if (elements.goalkeeper) {
        elements.goalkeeper.className = 'goalkeeper standby';
    }
    
    hideResultMessage();
    document.body.classList.remove('goal-celebration');
    
    // PERBAIKAN: Enable buttons hanya jika masih ada tendangan tersisa
    if (gameData.kicks.remaining > 0) {
        enableKickButtons(true);
    }
    
    console.log(`Animation complete. Current score: ${gameData.score.player}`);
}

// Show result message
function showResultMessage(result, kickerChoice, keeperChoice) {
    const messages = {
        goal: 'GOAL! ⚽',
        saved: 'SAVE! ✋',
        post: 'HIT THE POST, NO GOAL! 🚪',
        over: 'OVER THE GOAL, NO GOAL! ☁️'
    };
    
    if (elements.resultMessage) {
        elements.resultMessage.textContent = messages[result] || 'Unknown result';
        elements.resultMessage.style.display = 'block';
    }
}

// Handle player kick
async function handlePlayerKick(playerChoice) {
    if (!gameData.selectedPlayer) {
        alert('Please select a player first!');
        return;
    }
    
    const computerChoice = getAISaveDirection();
    const result = calculatePenaltyResult(playerChoice, computerChoice);
    
    enableKickButtons(false);
    playSound('kick');
    
    // PERBAIKAN: Simpan hasil SEBELUM animasi
    gameData.kicks.history.push({
        playerChoice: playerChoice,
        keeperChoice: computerChoice,
        result: result
    });
    
    // PERBAIKAN: Update skor hanya jika gol - SEBELUM animasi
    if (result === 'goal') {
        gameData.score.player++;
        updateUI(); // PERBAIKAN: Update UI langsung
    }
    
    // PERBAIKAN: Update tendangan tersisa - SEBELUM animasi
    gameData.kicks.remaining--;
    updateUI();
    
    console.log(`Kick result: ${result}, Score: ${gameData.score.player}, Kicks left: ${gameData.kicks.remaining}`);
    
    await animateKick(playerChoice, computerChoice, result);
    
    // PERBAIKAN: Cek apakah game sudah berakhir - SETELAH animasi
    if (gameData.kicks.remaining <= 0) {
        setTimeout(() => {
            endGame();
        }, 1000);
    }
}
// Main game loop
function startGame() {
    if (!gameData.selectedPlayer) {
        alert('Please select a player first!');
        showScreen('player_select');
        return;
    }
    
    console.log('Starting game with player:', gameData.selectedPlayer.name);
    
    gameData.score.player = 0;
    gameData.score.computer = 0;
    gameData.kicks.remaining = 5;
    gameData.kicks.history = [];
    
    resetPositions();
    updateUI();
    enableKickButtons(true);
    
    showScreen('game');
    playSound('whistle');
}

// End game and show results
function endGame() {
    const playerScore = gameData.score.player;
    
    let resultText = '';
    if (playerScore >= 3) {
        resultText = 'YOU WIN! 🏆';
    } else {
        resultText = 'YOU LOSE! 😔';
    }
    
    if (elements.finalResult) {
        elements.finalResult.innerHTML = `
            <div style="color: ${playerScore >= 3 ? '#2d5016' : '#c53030'};">
                ${resultText}<br>
                <span style="font-size: 1.1em;">Goal: ${playerScore}</span><br>
                <span style="font-size: 0.9em; color: #666;">You scored ${playerScore} out of 5 penalties</span>
            </div>
        `;
    }
    
    let historyHTML = '<h3>Penalty History:</h3>';
    gameData.kicks.history.forEach((kick, index) => {
        // Format hasil sesuai permintaan
        let resultText = '';
        if (kick.result === 'goal') {
            resultText = '⚽ GOAL';
        } else if (kick.result === 'saved') {
            resultText = '✋ SAVE';
        } else if (kick.result === 'post') {
            resultText = '🚪 HIT THE POST, NO GOAL';
        } else if (kick.result === 'over') {
            resultText = '☁️ OVER THE GOAL, NO GOAL';
        }
        
        historyHTML += `
            <div class="kick-history-item">
                <strong>Penalty ${index + 1}:</strong><br>
                Your choice: ${kick.playerChoice.toUpperCase()} | 
                Keeper choice: ${kick.keeperChoice.toUpperCase()}<br>
                Result: ${resultText}
            </div>
        `;
    });
    
    // Tambahkan statistik akhir
    historyHTML += `
        <div class="kick-history-item" style="background: #e2e8f0; font-weight: bold;">
            <strong>FINAL STATS:</strong><br>
            Goals: ${playerScore}<br>
            Success Rate: ${Math.round((playerScore / 5) * 100)}%
        </div>
    `;
    
    if (elements.scoreBreakdown) {
        elements.scoreBreakdown.innerHTML = historyHTML;
    }
    
    showScreen('result');
    playSound('whistle');
}

// Initialize player selection
function initPlayerSelection() {
    console.log('Initializing player selection...');
    
    // Event listener untuk klik pada card
    document.querySelectorAll('.player-card').forEach(card => {
        card.addEventListener('click', (e) => {
            // Jangan hentikan jika tombol yang diklik
            if (e.target.classList.contains('select-player-btn')) {
                return;
            }
            const playerId = card.dataset.player;
            console.log('Card clicked, player:', playerId);
            selectPlayer(playerId);
        });
    });
    
    // Event listener untuk tombol SELECT PLAYER
    document.querySelectorAll('.select-player-btn').forEach(btn => {
        btn.addEventListener('click', (e) => {
            e.stopPropagation(); // Prevent event bubbling
            const card = e.target.closest('.player-card');
            if (card) {
                const playerId = card.dataset.player;
                console.log('Select button clicked, player:', playerId);
                selectPlayer(playerId);
                
                // Langsung mulai game setelah memilih pemain
                setTimeout(() => {
                    startGame();
                }, 300);
            }
        });
    });
}

function selectPlayer(playerId) {
    console.log('Selecting player:', playerId);
    
    // Hapus seleksi sebelumnya
    document.querySelectorAll('.player-card').forEach(card => {
        card.classList.remove('selected');
    });
    
    // Tambah seleksi baru
    const selectedCard = document.querySelector(`.player-card[data-player="${playerId}"]`);
    if (selectedCard) {
        selectedCard.classList.add('selected');
        gameData.selectedPlayer = players[playerId];
        console.log('Player selected:', gameData.selectedPlayer.name);
    }
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
    console.log('DOM loaded, initializing game...');
    
    // Debug: Check if elements are properly selected
    console.log('Elements check:', {
        playBtn: elements.playBtn,
        backBtn: elements.backBtn,
        playerCards: elements.playerCards.length,
        selectPlayerBtns: elements.selectPlayerBtns.length,
        kickButtons: elements.kickButtons.length
    });
    
    initGame();
    initPlayerSelection();
    
    // Main navigation event listeners
    if (elements.playBtn) {
        elements.playBtn.addEventListener('click', () => {
            console.log('Play button clicked');
            showScreen('player_select');
        });
    }
    
    if (elements.backBtn) {
        elements.backBtn.addEventListener('click', () => {
            console.log('Back button clicked');
            showScreen('start');
        });
    }
    
    if (elements.restartBtn) {
        elements.restartBtn.addEventListener('click', () => {
            console.log('Restart button clicked');
            startGame();
        });
    }
    
    if (elements.homeBtn) {
        elements.homeBtn.addEventListener('click', () => {
            console.log('Home button clicked');
            initGame();
        });
    }
    
    if (elements.muteBtn) {
        elements.muteBtn.addEventListener('click', () => {
            gameData.settings.sound = !gameData.settings.sound;
            updateUI();
        });
    }
    
    // Event listeners for kick buttons
    elements.kickButtons.forEach(button => {
        button.addEventListener('click', (e) => {
            const direction = e.target.dataset.direction;
            console.log('Kick button clicked:', direction);
            handlePlayerKick(direction);
        });
    });
    
    // Event listener untuk difficulty select
    if (elements.difficultySelect) {
        elements.difficultySelect.addEventListener('change', (e) => {
            gameData.settings.difficulty = e.target.value;
            console.log('Difficulty changed to:', gameData.settings.difficulty);
        });
    }
    
    console.log('Game initialization complete!');
});

// Export untuk debugging
window.gameData = gameData;
window.players = players;
console.log('Penalty Shootout Simulator loaded!');