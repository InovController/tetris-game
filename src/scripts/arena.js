import { player, isPaused } from './player.js';
import { draw, updateScore, update } from './render.js';

export let isRemovingLines = false;

export function createMatrix(width, height) {
    return Array.from({ length: height }, () => Array(width).fill(0));
}

export const arena = createMatrix(10, 20);

export function collide(arena, player) {
    const [m, o] = [player.matrix, player.pos];
    for (let y = 0; y < m.length; ++y) {
        for (let x = 0; x < m[y].length; ++x) {
            if (m[y][x] !== 0 &&
                (arena[y + o.y] && arena[y + o.y][x + o.x]) !== 0) {
                return true;
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
    const rowsToRemove = [];

    for (let y = arena.length - 1; y >= 0; --y) {
        if (arena[y].every(value => value !== 0)) {
            rowsToRemove.push(y);
        }
    }

    if (rowsToRemove.length > 0) {
        isRemovingLines = true;

        rowsToRemove.forEach(y => {
            arena[y].fill(-1);
        });

        draw();
        
        setTimeout(() => {
            rowsToRemove.sort((a, b) => a - b).forEach(y => {
                arena.splice(y, 1);
                arena.unshift(new Array(arena[0].length).fill(0));
            });

            player.score += rowsToRemove.length * 10;
            updateScore();

            isRemovingLines = false;

            if (!isPaused) {
                update();
            }
        }, 200);
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