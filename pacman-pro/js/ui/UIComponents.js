import { StorageSystem } from '../infra/StorageSystem.js';

export class MenuUI {
    constructor(mediator) {
        this.mediator = mediator;
        this.mainMenu = document.getElementById('main-menu');
        this.pauseScreen = document.getElementById('pause-screen');
        this.levelScreen = document.getElementById('level-screen');
        this.gameOverScreen = document.getElementById('game-over-screen');
        this.rankingScreen = document.getElementById('ranking-screen');
        
        document.getElementById('btn-insert-coin').addEventListener('click', () => this.mediator.notify(this, 'INSERT_COIN'));
        
        document.getElementById('btn-play').addEventListener('click', () => {
            // AHORA PERMITE Y CAPTURA 15 CARACTERES
            const nameInput = document.getElementById('player-name').value.trim() || 'ANONIMO';
            this.mediator.notify(this, 'START_GAME', { name: nameInput.substring(0, 15).toUpperCase() });
        });

        document.getElementById('btn-ranking').addEventListener('click', () => this.showRanking());
        document.getElementById('btn-close-ranking').addEventListener('click', () => {
            this.rankingScreen.classList.add('hidden');
            this.mainMenu.classList.remove('hidden');
        });
        document.getElementById('btn-restart').addEventListener('click', () => {
            this.gameOverScreen.classList.add('hidden');
            this.mediator.notify(this, 'RETURN_MENU');
        });
    }

    updateMenuStats(credits, topPlayer) {
        document.getElementById('menu-credits').innerText = credits;
        document.getElementById('menu-highscore').innerText = topPlayer ? `${topPlayer.score} (${topPlayer.name})` : 0;
        
        const playBtn = document.getElementById('btn-play');
        if (credits > 0) {
            playBtn.disabled = false; playBtn.classList.remove('disabled');
        } else {
            playBtn.disabled = true; playBtn.classList.add('disabled');
        }
    }

    showScreen(screenId) {[this.mainMenu, this.pauseScreen, this.levelScreen, this.gameOverScreen, this.rankingScreen].forEach(s => s.classList.add('hidden'));
        if(screenId) document.getElementById(screenId).classList.remove('hidden');
    }

    showRanking() {
        this.mainMenu.classList.add('hidden');
        this.rankingScreen.classList.remove('hidden');
        const list = document.getElementById('ranking-list');
        const ranks = StorageSystem.getRanking();
        
        list.innerHTML = ranks.map((r,i) => `<li>${i+1}. ${r.name} - ${r.score} Pts (Nv ${r.level})</li>`).join('');
    }
}

export class HUD {
    update(score, level, lives) {
        document.getElementById('score').innerText = score;
        document.getElementById('level').innerText = level;
        document.getElementById('lives').innerText = lives;
    }
    toggle(show) {
        const h = document.getElementById('hud');
        show ? h.classList.remove('hidden') : h.classList.add('hidden');
    }
}