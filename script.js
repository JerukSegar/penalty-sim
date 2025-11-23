const GAME_STATES = {
  START: 'start',
  KICK_PREPARATION: 'kick_prep',
  KICK_SELECTION: 'kick_selection',
  ANIMATION: 'animation',
  RESULT: 'result',
  GAME_OVER: 'game_over'
};

const gameData = {
  currentState: GAME_STATES.START,
  score: { player: 0, computer: 0 },
  kicks: { total: 5, remaining: 5, history: [] },
  settings: { sound: true, difficulty: 'normal' }
};