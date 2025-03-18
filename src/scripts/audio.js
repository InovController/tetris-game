export const rotateSound = new Audio('src/sounds/rotate-block.mp3');
export const blockHitSound = new Audio('src/sounds/block-hit.wav');
export const backgroundMusic = new Audio('src/sounds/LoFi.wav');
export const gameOverSound = new Audio('src/sounds/game-over-song.wav');
backgroundMusic.loop = true;
backgroundMusic.volume = 0.5;

export function setupAudioControls() {
    document.getElementById('volume-control').addEventListener('input', event => {
        backgroundMusic.volume = event.target.value;
    });
}
