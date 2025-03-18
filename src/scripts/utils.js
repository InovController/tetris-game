import { player } from './player.js';
import { arena } from './arena.js';
import { draw, drawNextPiece, updateScore } from './render.js';
import { setIsPaused, nextPiece, setNextPiece } from './player.js';
import { pauseOverlay } from './dom.js';

export function saveGameState() {
    const cleanedArena = arena.map(row => row.map(value => (value === -1 ? 0 : value)));

    const gameState = {
        arena: cleanedArena,
        player: player,
        nextPiece: nextPiece,
        score: player.score,
    };
    localStorage.setItem('tetrisGameState', JSON.stringify(gameState));
}

export function loadGameState() {
    const savedState = localStorage.getItem('tetrisGameState');
    if (savedState) {
        const gameState = JSON.parse(savedState);

        gameState.arena.forEach((row, y) => {
            arena[y] = row.map(value => (value === -1 ? 0 : value));
        });

        player.pos = { ...gameState.player.pos };
        player.matrix = gameState.player.matrix;
        player.score = gameState.score;
        setNextPiece(gameState.nextPiece);

        updateScore();
        draw();
        drawNextPiece();

        setIsPaused(true);
        pauseOverlay.style.display = 'flex';
    }
}
