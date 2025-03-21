import { update, updateScore } from './render.js';
import { initializePlayer, player, playerReset, setIsGameOver } from './player.js';
import { arena } from './arena.js';
import { loadGameState, positionGameOverOverlay, positionPauseOverlay } from './utils.js';
import { backgroundMusic, setupAudioControls } from './audio.js';
import { setupControls } from './controls.js';
import { gameOverElement } from './dom.js';

document.addEventListener('DOMContentLoaded', () => {
    loadGameState();
    initializePlayer();
    backgroundMusic.play();
    setupAudioControls();
    setupControls();
    positionGameOverOverlay();
    positionPauseOverlay();
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