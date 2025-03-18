import { player } from './player.js';
import { arena } from './arena.js';
import { draw, drawNextPiece, updateScore } from './render.js';
import { setIsPaused, nextPiece, setNextPiece, isGameOver, setIsGameOver } from './player.js';
import { pauseOverlay, finalScoreElement, gameOverElement } from './dom.js';

export function saveGameState() {
    const cleanedArena = arena.map(row => row.map(value => (value === -1 ? 0 : value)));

    const gameState = {
        arena: cleanedArena,
        player: player,
        nextPiece: nextPiece,
        score: player.score,
        gameover: isGameOver
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
        player.score = gameState.player.score;
        setNextPiece(gameState.nextPiece)
        draw();
        updateScore();
        
        if (gameState.gameover) {
            setIsGameOver(true);
            finalScoreElement.innerText = player.score;
            gameOverElement.style.display = 'block';
            return
        }
        else {
            drawNextPiece();
            setIsPaused(true);
            pauseOverlay.style.display = 'flex';
        }

    }
}
