import { isPaused, setIsPaused, isGameOver, playerMove, playerRotate, playerDrop } from './player.js';
import { restartGame } from './game.js';
import { saveGameState } from './utils.js';
import { backgroundMusic } from './audio.js';
import { setLastTime, update} from './render.js';
import { pauseOverlay } from './dom.js';

export function setupControls() {
    document.addEventListener('keydown', handleKeyPress);
}

function handleKeyPress(event) {
    if (event.key === 'ArrowLeft') {
        event.preventDefault();
        playerMove(-1);
        saveGameState(); // Salva o estado após mover
    } else if (event.key === 'ArrowRight') {
        event.preventDefault();
        playerMove(1);
        saveGameState(); // Salva o estado após mover
    } else if (event.key === 'ArrowDown') {
        event.preventDefault();
        playerDrop();
        saveGameState(); // Salva o estado após a queda
    } else if (event.key === ' ') {
        event.preventDefault();
        playerRotate(1);
        saveGameState(); // Salva o estado após rotacionar
    }
    
    if (isPaused || isGameOver) {
        if (event.key === 'p' || event.key === 'P' || (isGameOver && event.key === 'Enter')) {
            // Permitir apenas a tecla de pausa ou Enter para reiniciar
        } else {
            event.preventDefault();
            return;
        }
    }

    if (event.key === 'p' || event.key === 'P') {
        event.preventDefault();
        togglePause();
        if (!isPaused) {
            pauseOverlay.style.display = 'none';
            backgroundMusic.play();
            setLastTime(performance.now());
            update();
        } else {
            pauseOverlay.style.display = 'flex';
            backgroundMusic.pause();
        }
    }

    if (event.key === 'r' || event.key === 'R') {
        event.preventDefault(); // Impede o comportamento padrão
        restartGame(); // Reinicia o jogo ao pressionar R
    }

    if (isGameOver && event.key === 'Enter') {
        event.preventDefault(); // Impede o comportamento padrão
        restartGame(); // Reinicia o jogo ao pressionar Enter após Game Over
    }
};

export function togglePause() {
    setIsPaused(!isPaused);
}
