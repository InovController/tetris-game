import { update, updateScore } from './render.js';
import { initializePlayer, player, playerReset, setIsGameOver } from './player.js';
import { arena } from './arena.js';
import { loadGameState } from './utils.js';
import { backgroundMusic, setupAudioControls } from './audio.js';
import { setupControls } from './controls.js';
import { gameOverElement, tetrisCanvas, pauseOverlay } from './dom.js';

document.addEventListener('DOMContentLoaded', () => {
    loadGameState();
    initializePlayer();
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

function positionGameOverOverlay() {
    const canvasRect = tetrisCanvas.getBoundingClientRect();
    const computedStyle = window.getComputedStyle(tetrisCanvas);
    const borderWidth = parseFloat(computedStyle.borderLeftWidth) + parseFloat(computedStyle.borderRightWidth);
    const borderHeight = parseFloat(computedStyle.borderTopWidth) + parseFloat(computedStyle.borderBottomWidth);

    gameOverElement.style.top = `${canvasRect.top + 0.5 * borderHeight}px`;
    gameOverElement.style.left = `${canvasRect.left + 0.5 * borderWidth}px`;
    gameOverElement.style.width = `${canvasRect.width - borderWidth}px`;
    gameOverElement.style.height = `${canvasRect.height - borderHeight}px`;
}

function positionPauseOverlay() {
    const canvasRect = tetrisCanvas.getBoundingClientRect();
    const computedStyle = window.getComputedStyle(tetrisCanvas);
    const borderWidth = parseFloat(computedStyle.borderLeftWidth) + parseFloat(computedStyle.borderRightWidth);
    const borderHeigth = parseFloat(computedStyle.borderTopWidth) + parseFloat(computedStyle.borderBottomWidth);

    pauseOverlay.style.top = `${canvasRect.top + 0.5*borderHeigth}px`;
    pauseOverlay.style.left = `${canvasRect.left + 0.5*borderWidth}px`;
    pauseOverlay.style.width = `${canvasRect.width - borderWidth}px`;
    pauseOverlay.style.height = `${canvasRect.height - borderHeigth}px`;
}

window.addEventListener('resize', positionPauseOverlay);
window.addEventListener('resize', positionGameOverOverlay);

positionGameOverOverlay();
positionPauseOverlay();