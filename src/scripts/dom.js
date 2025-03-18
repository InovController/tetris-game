export const gameOverElement = document.getElementById('game-over');
export const highScoreElement = document.getElementById('high-score');
export const finalScoreElement = document.getElementById('final-score');
export const scoreElement = document.getElementById('score');
export const canvas = document.getElementById('tetris');
export const context = canvas.getContext('2d');
export const nextCanvas = document.getElementById('next');
export const nextContext = nextCanvas.getContext('2d');
export const pauseOverlay = document.getElementById('pause-overlay');

context.scale(30, 30);
nextContext.scale(30, 30);