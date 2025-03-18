import { arena, arenaSweep, createPiece, randomPieceType, collide, merge, isRemovingLines } from './arena.js';
import { backgroundMusic, blockHitSound, rotateSound, gameOverSound } from './audio.js';
import { highScoreElement, finalScoreElement, gameOverElement } from './dom.js';
import { setDropCounter } from './render.js';

export let isGameOver = false;
export let isPaused = false;
export let highScore = localStorage.getItem('highScore') || 0;
highScoreElement.innerText = highScore; // Exiba o High Score na tela

export const player = {
    pos: { x: 0, y: 0 },
    matrix: null,
    score: 0,
};

export const pieceColors = {
    1: '#88c0d0', // Azul claro pastel
    2: '#5e81ac', // Azul escuro pastel
    3: '#d08770', // Laranja pastel
    4: '#ebcb8b', // Amarelo pastel
    5: '#a3be8c', // Verde pastel
    6: '#b48ead', // Roxo pastel
    7: '#bf616a', // Vermelho pastel
};

export let nextPiece;
export function setNextPiece(piece) {
    nextPiece = piece; // ✅ Agora `nextPiece` pode ser atualizado de fora.
}

export function initializePlayer() {
    if (!nextPiece) {
        nextPiece = createPiece(randomPieceType());
        playerReset();
    }
}

export function setIsPaused(value) {
    isPaused = value;
}

export function setIsGameOver(value) {
    isGameOver = value;
}

export function playerMove(dir) {
    player.pos.x += dir;
    if (collide(arena, player)) {
        player.pos.x -= dir;
    }
}

export function rotate(matrix, dir) {
    for (let y = 0; y < matrix.length; ++y) {
        for (let x = 0; x < y; x++) {
            [matrix[x][y], matrix[y][x]] = [matrix[y][x], matrix[x][y]];
        }
    }
    if (dir > 0) {
        matrix.forEach(row => row.reverse());
    } else {
        matrix.reverse();
    }
}


export function playerRotate(dir) {
    const pos = player.pos.x;
    let offset = 1;
    rotate(player.matrix, dir);
    while (collide(arena, player)) {
        player.pos.x += offset;
        offset = -(offset + (offset > 0 ? 1 : -1));
        if (offset > player.matrix[0].length) {
            rotate(player.matrix, -dir);
            player.pos.x = pos;
            return;
        }
    }

    rotateSound.currentTime = 0;
    rotateSound.play();
}

export function playerDrop() {
    if (isGameOver || isPaused || isRemovingLines) return;

    player.pos.y++;
    if (collide(arena, player)) {
        player.pos.y--;
        merge(arena, player);
        blockHitSound.currentTime = 0;
        blockHitSound.play();
        arenaSweep();
        playerReset();
    }
    setDropCounter(0);
}

export function playerReset() {
    if (isGameOver) return;

    player.matrix = nextPiece;
    nextPiece = createPiece(randomPieceType());
    player.pos.y = -getInitialYOffset(player.matrix);
    player.pos.x = (arena[0].length / 2 | 0) - (player.matrix[0].length / 2 | 0);

    if (collide(arena, player)) {
        if (player.score > highScore) {
            highScore = player.score;
            localStorage.setItem('highScore', highScore);
            highScoreElement.innerText = highScore;
        }

        finalScoreElement.innerText = player.score;
        gameOverElement.style.display = 'block';

        backgroundMusic.pause();
        gameOverSound.play();
        backgroundMusic.play();

        setIsGameOver(true);
        return;
    }
    setDropCounter(0);
}

export function getInitialYOffset(matrix) {
    for (let y = 0; y < matrix.length; y++) {
        if (matrix[y].some(value => value !== 0)) {
            return y; // Retorna o índice da primeira linha não vazia
        }
    }
    return 0; // Caso todas as linhas sejam vazias (não deve acontecer)
}
