import { arena, collide, isRemovingLines } from './arena.js';
import { player, pieceColors, nextPiece, playerDrop, isGameOver, isPaused } from './player.js';
import { scoreElement, canvas, context, nextCanvas, nextContext} from './dom.js'
import { saveGameState } from './utils.js';

export let lastTime = 0;
export function setLastTime(value) {
    lastTime = value;
}

export let dropInterval = 1000; // Tempo em milissegundos para a peça cair

export let dropCounter = 0;
export function setDropCounter(value) {
    dropCounter = value;
}

export function update(time = 0) {
    if (isGameOver || isPaused || isRemovingLines) return;

    const deltaTime = time - lastTime;
    lastTime = time;

    dropCounter += deltaTime;
    if (dropCounter > dropInterval) {
        playerDrop();
    }

    draw();
    drawNextPiece();
    requestAnimationFrame(update);
    saveGameState();
}

export function draw() {
    context.fillStyle = '#000';
    context.fillRect(0, 0, canvas.width, canvas.height);

    drawMatrix(arena, { x: 0, y: 0 });
    drawGhostPiece(); // Desenhe a peça fantasma
    drawMatrix(player.matrix, player.pos);
}

export function drawNextPiece() {
    nextContext.fillStyle = '#000';
    nextContext.fillRect(0, 0, nextCanvas.width, nextCanvas.height);

    drawMatrix(nextPiece, { x: 1, y: 1 }, nextContext);
}

export function drawGhostPiece() {
    const ghostPos = { ...player.pos };
    while (!collide(arena, { ...player, pos: ghostPos })) {
        ghostPos.y++;
    }
    ghostPos.y--; // Ajuste para a última posição válida

    drawMatrix(player.matrix, ghostPos, context, 'rgba(255, 255, 255, 0.3)'); // Desenhe a peça fantasma com transparência
}

export function updateScore() {
    scoreElement.innerText = player.score;
}

export function drawMatrix(matrix, offset, ctx = context, color = null) {
    matrix.forEach((row, y) => {
        row.forEach((value, x) => {
            if (value !== 0) {
                if (value === -1) {
                    // Cor especial para linhas animadas
                    ctx.fillStyle = 'rgba(255, 255, 255, 0.8)'; // Branco com transparência
                } else {
                    ctx.fillStyle = color || pieceColors[value];
                }
                ctx.fillRect(x + offset.x, y + offset.y, 1, 1);
                ctx.shadowColor = 'rgba(0, 0, 0, 0.2)'; // Sombra leve
                ctx.shadowBlur = 10;
            }
        });
    });
}
