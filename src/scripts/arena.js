import { player } from './player.js';
import { updateScore } from './render.js';

export let isRemovingLines = false;

export function createMatrix(width, height) {
    const matrix = [];
    while (height--) {
        matrix.push(new Array(width).fill(0));
    }
    return matrix;
}

export const arena = createMatrix(10, 20);

export function collide(arena, player) {
    const [m, o] = [player.matrix, player.pos];
    for (let y = 0; y < m.length; ++y) {
        for (let x = 0; x < m[y].length; ++x) {
            if (m[y][x] !== 0) {
                // Permitir que o bloco fique fora da matriz no topo
                if (!arena[y + o.y] || arena[y + o.y][x + o.x] !== 0) {
                    if (y + o.y >= 0) {
                        return true; // Colisão válida apenas se estiver dentro da matriz visível
                    }
                }
            }
        }
    }
    return false;
}

export function merge(arena, player) {
    player.matrix.forEach((row, y) => {
        row.forEach((value, x) => {
            if (value !== 0) {
                arena[y + player.pos.y][x + player.pos.x] = value; // Mescla o valor do bloco à arena
            }
        });
    });
}

export function arenaSweep() {
    let linesCleared = 0;

    for (let y = arena.length - 1; y >= 0; --y) {
        if (arena[y].every(value => value !== 0)) {
            const row = arena.splice(y, 1)[0].fill(0); // Remove a linha completa
            arena.unshift(row); // Adiciona uma nova linha no topo
            linesCleared++;
            y++; // Reavalie a mesma linha após o deslocamento
        }
    }

    if (linesCleared > 0) {
        // Multiplicadores de pontuação
        const pointsPerLine = 100; // Pontos base por linha
        const multiplier = linesCleared; // Multiplicador baseado no número de linhas
        const pointsEarned = pointsPerLine * linesCleared * multiplier;

        player.score += pointsEarned; // Atualize a pontuação do jogador
        updateScore(); // Atualize o placar na interface
    }
}

export function randomPieceType() {
    const pieces = 'IOTLJSZ';
    return pieces[Math.floor(Math.random() * pieces.length)];
}

export function createPiece(type) {
    if (type === 'T') {
        return [
            [0, 1, 0],
            [1, 1, 1],
            [0, 0, 0],
        ];
    } else if (type === 'O') {
        return [
            [2, 2],
            [2, 2],
        ];
    } else if (type === 'I') {
        return [
            [0, 0, 0, 0],
            [3, 3, 3, 3],
            [0, 0, 0, 0],
            [0, 0, 0, 0],
        ];
    } else if (type === 'L') {
        return [
            [0, 0, 4],
            [4, 4, 4],
            [0, 0, 0],
        ];
    } else if (type === 'J') {
        return [
            [5, 0, 0],
            [5, 5, 5],
            [0, 0, 0],
        ];
    } else if (type === 'S') {
        return [
            [0, 6, 6],
            [6, 6, 0],
            [0, 0, 0],
        ];
    } else if (type === 'Z') {
        return [
            [7, 7, 0],
            [0, 7, 7],
            [0, 0, 0],
        ];
    }
}