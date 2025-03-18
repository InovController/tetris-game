import { update, updateScore } from './render.js';
import { initializePlayer, player, playerReset, setIsGameOver } from './player.js';
import { arena } from './arena.js';
import { loadGameState } from './utils.js';
import { backgroundMusic, setupAudioControls } from './audio.js';
import { setupControls } from './controls.js';
import { gameOverElement } from './dom.js';

document.addEventListener('DOMContentLoaded', () => {
    initializePlayer();
    loadGameState();
    backgroundMusic.play();
    setupAudioControls();
    setupControls();
    update();
});

export function restartGame() {
    setIsGameOver(false);
    gameOverElement.style.display = 'none';
    arena.forEach(row => row.fill(0));
    player.score = 0;
    updateScore();
    playerReset();
    localStorage.removeItem('tetrisGameState');
    update();
}

const pauseOverlay = document.getElementById('pause-overlay');
const tetrisCanvas = document.getElementById('tetris');

// Ajuste a posição do overlay para coincidir com o canvas
function positionPauseOverlay() {
    const canvasRect = tetrisCanvas.getBoundingClientRect();
    pauseOverlay.style.top = `${canvasRect.top}px`;
    pauseOverlay.style.left = `${canvasRect.left}px`;
    pauseOverlay.style.width = `${canvasRect.width}px`;
    pauseOverlay.style.height = `${canvasRect.height}px`;
}

// Atualize a posição do overlay ao redimensionar a janela
window.addEventListener('resize', positionPauseOverlay);

// Posicione o overlay ao carregar a página
positionPauseOverlay();