export class AudioManager {
    constructor() {
        if (AudioManager.instance) return AudioManager.instance;
        AudioManager.instance = this;
        this.ctx = new (window.AudioContext || window.webkitAudioContext)();
        this.enabled = true;
    }

    playTone(freq, type, duration, vol=0.1) {
        if (!this.enabled || this.ctx.state === 'suspended') return;
        const osc = this.ctx.createOscillator();
        const gain = this.ctx.createGain();
        osc.type = type;
        osc.frequency.setValueAtTime(freq, this.ctx.currentTime);
        gain.gain.setValueAtTime(vol, this.ctx.currentTime);
        gain.gain.exponentialRampToValueAtTime(0.01, this.ctx.currentTime + duration);
        osc.connect(gain);
        gain.connect(this.ctx.destination);
        osc.start();
        osc.stop(this.ctx.currentTime + duration);
    }

    playEat() { this.playTone(600, 'sine', 0.1, 0.1); }
    playPowerUp() { this.playTone(900, 'square', 0.3, 0.1); }
    playDeath() { this.playTone(150, 'sawtooth', 1.0, 0.2); }
    playWin() { this.playTone(800, 'triangle', 0.5, 0.2); }
    
    // Música procedural de fondo básica (bip-bop)
    startBGM() {
        this.stopBGM();
        this.bgmInterval = setInterval(() => {
            if(Math.random() > 0.5) this.playTone(200, 'square', 0.2, 0.05);
            else this.playTone(250, 'square', 0.2, 0.05);
        }, 500);
    }
    stopBGM() { clearInterval(this.bgmInterval); }
}