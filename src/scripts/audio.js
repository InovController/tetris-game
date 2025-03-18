export const backgroundMusic = new Audio('src/sounds/LoFi.wav');
export const rotateSound = new Audio('src/sounds/rotate-block.mp3');
export const blockHitSound = new Audio('src/sounds/block-hit.wav');
export const gameOverSound = new Audio('src/sounds/game-over-song.wav');

backgroundMusic.loop = true;
backgroundMusic.volume = 0.5;

export let currentTrackIndex = 0;
export const playlist = [
    { src: 'src/sounds/Boomopera - LoFied (Full Length).mp3', title: 'Boomopera - LoFied' },
    { src: 'src/sounds/LoFi (full version).mp3', title: 'Lofi Chill Vibes' },
    { src: 'src/sounds/Lofi.wav', title: 'Lofi Study Session' },
    { src: 'src/sounds/raspberrymusic - LoFi.mp3', title: 'raspberrymusic - LoFi' },
    { src: 'src/sounds/That Lofi .mp3', title: 'That Lofi ' },
];

const musicTitleElement = document.getElementById('music-title');

// 📌 Restaurar música salva no LocalStorage
const savedTrackIndex = localStorage.getItem('currentTrackIndex');
const savedMusicTime = localStorage.getItem('backgroundMusicTime');
if (savedTrackIndex !== null) {
    currentTrackIndex = parseInt(savedTrackIndex, 10);
    backgroundMusic.src = playlist[currentTrackIndex].src;
    musicTitleElement.innerText = playlist[currentTrackIndex].title;
}
if (savedMusicTime !== null) {
    backgroundMusic.currentTime = parseFloat(savedMusicTime);
}

// 📌 Detecta interação do usuário para iniciar a música
document.addEventListener('click', tryPlayMusic, { once: true });
document.addEventListener('keydown', tryPlayMusic, { once: true });

// 📌 Função para tocar a próxima música
export function playNextTrack() {
    currentTrackIndex = (currentTrackIndex + 1) % playlist.length;
    backgroundMusic.src = playlist[currentTrackIndex].src;
    musicTitleElement.innerText = playlist[currentTrackIndex].title;
    tryPlayMusic();
}

// 📌 Função para tocar a música após interação do usuário
export function tryPlayMusic() {
    backgroundMusic.play().catch(error => console.warn("🔇 Música bloqueada:", error));
}

// 📌 Atualiza a barra de progresso da música
function updateProgressBar() {
    const progressBar = document.getElementById('progress-bar');
    if (backgroundMusic && backgroundMusic.duration > 0) {
        const progress = (backgroundMusic.currentTime / backgroundMusic.duration) * 100;
        progressBar.style.width = `${progress}%`;
    }
}

// 📌 Eventos para atualizar a barra de progresso
backgroundMusic.addEventListener('timeupdate', updateProgressBar);
backgroundMusic.addEventListener('ended', () => {
    updateProgressBar();
    playNextTrack();
});

// 📌 Evento para pausar música ao alternar entre abas
document.addEventListener('visibilitychange', () => {
    if (document.visibilityState === 'visible' && backgroundMusic.paused) {
        tryPlayMusic();
    } else {
        backgroundMusic.pause();
    }
});

// 📌 Propriedade auxiliar para verificar se a música está tocando
Object.defineProperty(backgroundMusic, 'playing', {
    get: function () {
        return !this.paused && !this.ended;
    }
});

// 📌 Configurar controle de volume
const volumeButton = document.getElementById('volume-button');
const volumeControl = document.getElementById('volume-control');

// 📌 Restaurar volume salvo
const savedVolume = localStorage.getItem('backgroundMusicVolume');
if (savedVolume !== null) {
    backgroundMusic.volume = parseFloat(savedVolume);
    volumeControl.value = savedVolume;
    updateVolumeIcon(savedVolume);
}

// 📌 Exibir controle de volume ao clicar no botão
volumeButton.addEventListener('click', () => {
    volumeControl.style.display = (volumeControl.style.display === 'none') ? 'block' : 'none';
});

// 📌 Atualizar volume ao ajustar controle
volumeControl.addEventListener('input', () => {
    const volume = volumeControl.value;
    backgroundMusic.volume = volume;
    localStorage.setItem('backgroundMusicVolume', volume);
    updateVolumeIcon(volume);
});

// 📌 Atualizar ícone de volume
function updateVolumeIcon(volume) {
    volumeButton.textContent = volume == 0 ? '🔇' :
        volume <= 0.3 ? '🔈' :
        volume <= 0.7 ? '🔉' : '🔊';
}

// 📌 Salvar estado da música antes de sair da página
window.addEventListener('beforeunload', () => {
    localStorage.setItem('backgroundMusicTime', backgroundMusic.currentTime);
    localStorage.setItem('currentTrackIndex', currentTrackIndex);
});

// 📌 ✅ Adicione esta função para ser exportada corretamente
export function setupAudioControls() {
    document.getElementById('prev-track').addEventListener('click', () => {
        currentTrackIndex = (currentTrackIndex - 1 + playlist.length) % playlist.length;
        backgroundMusic.src = playlist[currentTrackIndex].src;
        musicTitleElement.innerText = playlist[currentTrackIndex].title;
        tryPlayMusic();
        updateProgressBar();
    });

    document.getElementById('next-track').addEventListener('click', () => {
        playNextTrack();
        updateProgressBar();
    });
}
