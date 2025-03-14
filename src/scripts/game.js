const canvas = document.getElementById('tetris');
const context = canvas.getContext('2d');

// Configuração do canvas principal
context.scale(30, 30); // Cada unidade será ampliada para 30px

const nextCanvas = document.getElementById('next');
const nextContext = nextCanvas.getContext('2d');

// Configuração do canvas "Next Piece"
nextContext.scale(30, 30); // Cada unidade será ampliada para 30px

const scoreElement = document.getElementById('score');
const highScoreElement = document.getElementById('high-score');
const gameOverElement = document.getElementById('game-over');
const finalScoreElement = document.getElementById('final-score');

// Arena do jogo (10x20)
const arena = createMatrix(10, 20);

// Jogador
const player = {
    pos: { x: 0, y: 0 },
    matrix: null,
    score: 0,
};

// Próximo bloco
let nextPiece = createPiece(randomPieceType()); // Inicialize com um bloco aleatório

// Cores para cada tipo de peça
const pieceColors = {
    1: '#b48ead', // T - Roxo pastel
    2: '#ebcb8b', // O - Amarelo pastel
    3: '#88c0d0', // I - Azul claro pastel
    4: '#d08770', // L - Laranja pastel
    5: '#5e81ac', // J - Azul escuro pastel
    6: '#a3be8c', // S - Verde pastel
    7: '#bf616a', // Z - Vermelho pastel
};

let dropCounter = 0;
let dropInterval = 1000; // Intervalo de queda (1 segundo)
let lastTime = 0;
let highScore = 0;
let isGameOver = false; // Indica se o jogo está em estado de Game Over
let isPaused = false;

// Carregar o High Score do localStorage
highScore = localStorage.getItem('highScore') || 0; // Use 0 se não houver High Score salvo
highScoreElement.innerText = highScore; // Exiba o High Score na tela

const rotateSound = new Audio('src/sounds/rotate-block.mp3');
const lineClearSound = new Audio('src/sounds/lineclear.wav');
const gameOverSound = new Audio('src/sounds/game-over-song.wav');
const blockHitSound = new Audio('src/sounds/block-hit.wav');

const playlist = [
    { src: 'src/sounds/Boomopera - LoFied (Full Length).mp3', title: 'Boomopera - LoFied' },
    { src: 'src/sounds/LoFi (full version).mp3', title: 'Lofi Chill Vibes' },
    { src: 'src/sounds/Lofi.wav', title: 'Lofi Study Session' },
    { src: 'src/sounds/raspberrymusic - LoFi.mp3', title: 'raspberrymusic - LoFi' },
    { src: 'src/sounds/That Lofi .mp3', title: 'That Lofi ' },
];

let currentTrackIndex = 0; // Índice da música atual
const backgroundMusic = new Audio(playlist[currentTrackIndex].src);
backgroundMusic.loop = false; // Desative o loop para alternar entre músicas
backgroundMusic.volume = 0.5; // Ajuste o volume

// Atualize o título da música
const musicTitleElement = document.getElementById('music-title');
musicTitleElement.innerText = playlist[currentTrackIndex].title;

// Função para tocar a próxima música
function playNextTrack() {
    currentTrackIndex = (currentTrackIndex + 1) % playlist.length; // Avança para a próxima música (volta ao início se for a última)
    backgroundMusic.src = playlist[currentTrackIndex].src; // Atualiza a fonte da música
    musicTitleElement.innerText = playlist[currentTrackIndex].title; // Atualiza o título
    backgroundMusic.play(); // Toca a próxima música
}

// Evento para detectar quando a música termina
backgroundMusic.addEventListener('ended', playNextTrack);

// Inicie a reprodução da primeira música
backgroundMusic.play();

// Função para criar a arena (matriz 2D)
function createMatrix(width, height) {
    const matrix = [];
    while (height--) {
        matrix.push(new Array(width).fill(0));
    }
    return matrix;
}

// Função para criar peças
function createPiece(type) {
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

// Função para gerar um tipo de peça aleatório
function randomPieceType() {
    const pieces = 'IOTLJSZ';
    return pieces[Math.floor(Math.random() * pieces.length)];
}

// Função para desenhar uma matriz no canvas
function drawMatrix(matrix, offset, ctx = context, color = null) {
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

// Função para mesclar a peça do jogador na arena
function merge(arena, player) {
    player.matrix.forEach((row, y) => {
        row.forEach((value, x) => {
            if (value !== 0) {
                arena[y + player.pos.y][x + player.pos.x] = value;
            }
        });
    });
}

// Função para verificar colisões
function collide(arena, player) {
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

// Função para remover linhas completas e atualizar a velocidade da gravidade com base na pontuação
function arenaSweep() {
    let rowCount = 1;
    let rowsToRemove = [];

    // Identifique as linhas completas
    for (let y = arena.length - 1; y >= 0; --y) {
        if (arena[y].every(value => value !== 0)) {
            rowsToRemove.push(y); // Adicione a linha à lista de remoção
        }
    }

    if (rowsToRemove.length > 0) {
        // Animação: Flash nas linhas completas
        rowsToRemove.forEach(y => {
            arena[y].fill(-1); // Use -1 para indicar que a linha está animando
        });

        draw(); // Redesenhe a arena com as linhas animadas

        // Aguarde um pequeno tempo antes de remover todas as linhas juntas
        setTimeout(() => {
            rowsToRemove.forEach(y => {
                arena.splice(y, 1); // Remova a linha
                arena.unshift(new Array(arena[0].length).fill(0)); // Adicione uma nova linha no topo
            });

            // Atualize a pontuação
            player.score += rowCount * 10 * rowsToRemove.length; // Multiplica pela quantidade de linhas removidas
            rowCount *= 2;

            lineClearSound.play(); // Som de linha completa
            updateScore(); // Atualize o placar

            // Continue verificando até que nenhuma linha completa reste
            arenaSweep();
        }, 200); // Tempo de animação (200ms)
    }
}

// Função para mover o jogador
function playerMove(dir) {
    player.pos.x += dir;
    if (collide(arena, player)) {
        player.pos.x -= dir;
    }
}

// Função para girar a peça do jogador
function rotate(matrix, dir) {
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

// Função para girar a peça e lidar com colisões
function playerRotate(dir) {
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

    // Reinicie o som antes de reproduzi-lo
    rotateSound.currentTime = 0; // Reinicia o som
    rotateSound.play(); // Reproduz o som de rotação
}

// Função para redefinir o jogador com um novo bloco e atualizar a tela de Game Over para incluir a mensagem
function playerReset() {
    if (isGameOver) return; // Não reinicie o jogador se o jogo estiver em Game Over

    player.matrix = nextPiece; // O próximo bloco se torna o bloco atual
    nextPiece = createPiece(randomPieceType()); // Gere um novo próximo bloco
    player.pos.y = -getInitialYOffset(player.matrix); // Ajuste a posição inicial com base nas linhas vazias
    player.pos.x = (arena[0].length / 2 | 0) - (player.matrix[0].length / 2 | 0);

    // Verifique se o bloco colide imediatamente (Game Over)
    if (collide(arena, player)) {
        // Atualize o High Score
        if (player.score > highScore) {
            highScore = player.score;
            localStorage.setItem('highScore', highScore); // Salve no localStorage
            highScoreElement.innerText = highScore; // Atualize o High Score na tela
        }

        // Exiba a tela de Game Over
        finalScoreElement.innerText = player.score;
        gameOverElement.style.display = 'block';
        gameOverSound.play(); // Som de Game Over

        // Pausar a música ambiente
        backgroundMusic.pause();
        backgroundMusic.play(); // Reinicie a música para evitar atrasos

        // Pausar o jogo
        isGameOver = true;
        return;
    }
}

// Função para fazer o jogador descer
function playerDrop() {
    if (isPaused) return; // Não permita que o bloco caia se o jogo estiver pausado

    player.pos.y++;
    if (collide(arena, player)) {
        player.pos.y--;
        merge(arena, player);
        blockHitSound.currentTime = 0; // Reinicia o som
        blockHitSound.play(); // Reproduz o som de impacto
        arenaSweep();
        playerReset();
    }
    dropCounter = 0;
}

// Função para desenhar o jogo
function draw() {
    context.fillStyle = '#000';
    context.fillRect(0, 0, canvas.width, canvas.height);

    drawMatrix(arena, { x: 0, y: 0 });
    drawGhostPiece(); // Desenhe a peça fantasma
    drawMatrix(player.matrix, player.pos);
}

// Função para desenhar o próximo bloco
function drawNextPiece() {
    nextContext.fillStyle = '#000';
    nextContext.fillRect(0, 0, nextCanvas.width, nextCanvas.height);

    drawMatrix(nextPiece, { x: 1, y: 1 }, nextContext);
}

// Função para atualizar o jogo
function update(time = 0) {
    if (isGameOver || isPaused) return; // Pausa o loop se o jogo estiver pausado ou em Game Over

    const deltaTime = time - lastTime;
    lastTime = time;

    dropCounter += deltaTime;
    if (dropCounter > dropInterval) {
        playerDrop();
    }

    draw();
    drawNextPiece();
    requestAnimationFrame(update);
}

// Função para atualizar o placar
function updateScore() {
    scoreElement.innerText = player.score;
}

// Função para reiniciar o jogo
function restartGame() {
    isGameOver = false;
    gameOverElement.style.display = 'none';
    arena.forEach(row => row.fill(0));
    player.score = 0;
    updateScore();
    playerReset();
    localStorage.removeItem('tetrisGameState'); // Remove o estado salvo
    update();
}

// Função para obter o deslocamento inicial Y de uma matriz
function getInitialYOffset(matrix) {
    for (let y = 0; y < matrix.length; y++) {
        if (matrix[y].some(value => value !== 0)) {
            return y; // Retorna o índice da primeira linha não vazia
        }
    }
    return 0; // Caso todas as linhas sejam vazias (não deve acontecer)
}

// Função para desenhar a peça fantasma
function drawGhostPiece() {
    const ghostPos = { ...player.pos };
    while (!collide(arena, { ...player, pos: ghostPos })) {
        ghostPos.y++;
    }
    ghostPos.y--; // Ajuste para a última posição válida

    drawMatrix(player.matrix, ghostPos, context, 'rgba(255, 255, 255, 0.3)'); // Desenhe a peça fantasma com transparência
}

// Função para salvar o estado do jogo
function saveGameState() {
    const gameState = {
        arena: arena,
        player: player,
        nextPiece: nextPiece,
        score: player.score,
        isPaused: isPaused,
    };
    localStorage.setItem('tetrisGameState', JSON.stringify(gameState));
}

// Função para carregar o estado do jogo
function loadGameState() {
    const savedState = localStorage.getItem('tetrisGameState');
    if (savedState) {
        const gameState = JSON.parse(savedState);
        arena.forEach((row, y) => row.fill(0)); // Limpa a arena
        gameState.arena.forEach((row, y) => {
            arena[y] = [...row]; // Restaura a arena
        });
        player.pos = { ...gameState.player.pos };
        player.matrix = gameState.player.matrix;
        player.score = gameState.score;
        nextPiece = gameState.nextPiece;
        isPaused = gameState.isPaused;

        updateScore(); // Atualiza o placar
        draw(); // Redesenha o jogo
        drawNextPiece(); // Redesenha a próxima peça
    }
}

// Event listener para capturar teclas
document.addEventListener('keydown', event => {
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

    const pauseOverlay = document.getElementById('pause-overlay');
    if (event.key === 'p' || event.key === 'P') {
        event.preventDefault();
        isPaused = !isPaused;
        if (!isPaused) {
            pauseOverlay.style.display = 'none';
            backgroundMusic.play();
            lastTime = performance.now();
            update();
        } else {
            pauseOverlay.style.display = 'flex';
            backgroundMusic.pause();
        }
        saveGameState(); // Salva o estado ao pausar ou retomar
    }

    if (event.key === 'r' || event.key === 'R') {
        event.preventDefault(); // Impede o comportamento padrão
        restartGame(); // Reinicia o jogo ao pressionar R
    }

    if (isGameOver && event.key === 'Enter') {
        event.preventDefault(); // Impede o comportamento padrão
        restartGame(); // Reinicia o jogo ao pressionar Enter após Game Over
    }
});

document.addEventListener('visibilitychange', () => {
    if (document.visibilityState === 'visible') {
        // A guia está ativa, retome a música
        if (backgroundMusic.paused) {
            backgroundMusic.play();
        }
    } else {
        // A guia não está ativa, pause a música
        backgroundMusic.pause();
    }
});

// Propriedade auxiliar para verificar se a música está tocando
Object.defineProperty(backgroundMusic, 'playing', {
    get: function () {
        return !this.paused && !this.ended;
    }
});

// Atualize a barra de progresso
function updateProgressBar() {
    const progressBar = document.getElementById('progress-bar');
    if (backgroundMusic && backgroundMusic.duration > 0) {
        const progress = (backgroundMusic.currentTime / backgroundMusic.duration) * 100;
        progressBar.style.width = `${progress}%`;
    }
}

// Atualize a barra de progresso em tempo real
backgroundMusic.addEventListener('timeupdate', updateProgressBar);

// Reinicie a barra de progresso ao trocar de música
backgroundMusic.addEventListener('ended', () => {
    updateProgressBar(); // Atualiza para 100% antes de trocar
    playNextTrack(); // Toca a próxima música
});

// Botões de controle
document.getElementById('prev-track').addEventListener('click', () => {
    currentTrackIndex = (currentTrackIndex - 1 + playlist.length) % playlist.length; // Volta para a música anterior
    backgroundMusic.src = playlist[currentTrackIndex].src;
    musicTitleElement.innerText = playlist[currentTrackIndex].title;
    backgroundMusic.play();
    updateProgressBar(); // Reinicia a barra de progresso
});

document.getElementById('next-track').addEventListener('click', () => {
    playNextTrack();
    updateProgressBar(); // Reinicia a barra de progresso
});

// Prepare a música para tocar assim que a página carregar
document.addEventListener('DOMContentLoaded', () => {
    loadGameState(); // Carrega o estado salvo
    backgroundMusic.load(); // Carrega a música
});

// Detecta a interação do usuário para iniciar a música
document.addEventListener('click', () => {
    if (!isPaused && backgroundMusic.paused) {
        backgroundMusic.play(); // Inicia a música se o jogo não estiver pausado
    }
}, { once: true }); // O evento será executado apenas uma vez

// Detecta a interação do usuário para iniciar a música ao pressionar uma tecla
document.addEventListener('keydown', () => {
    if (!isPaused && backgroundMusic.paused) {
        backgroundMusic.play(); // Inicia a música se o jogo não estiver pausado
    }
}, { once: true }); // O evento será executado apenas uma vez

playerReset();
backgroundMusic.play(); // Inicia a música ambiente
update();