import { BoardGenerator } from '../domain/BoardGenerator.js';
import { Player, Ghost, DonkeyKong, Mushroom, TeleportGhost, EnemyCollection } from '../domain/Entities.js';
import { ScoreManager, LifeSystem } from '../domain/Systems.js';
import { StorageSystem } from '../infra/StorageSystem.js';

export class GameController {
    constructor(renderer, ui, hud, audio, input, prng) {
        this.renderer = renderer; this.ui = ui; this.hud = hud;
        this.audio = audio; this.input = input; this.prng = prng;
        
        this.scoreManager = new ScoreManager();
        this.lifeSystem = new LifeSystem();
        this.enemies = new EnemyCollection();
        this.boardGen = new BoardGenerator(prng);
        
        this.state = 'MENU'; 
        this.level = 1; this.maxLevels = 10;
        this.updateMenu();
    }

    notify(sender, event, data) {
        if (event === 'INSERT_COIN') { StorageSystem.addCredit(); this.audio.playPowerUp(); this.updateMenu(); }
        else if (event === 'START_GAME') { 
            if (StorageSystem.useCredit()) {
                this.currentPlayerName = data.name;
                this.startGame(); 
            }
        }
        else if (event === 'RETURN_MENU') { this.state = 'MENU'; this.updateMenu(); }
    }

    updateMenu() {
        this.ui.showScreen('main-menu'); this.hud.toggle(false);
        const ranks = StorageSystem.getRanking();
        this.ui.updateMenuStats(StorageSystem.getCredits(), ranks[0] || 0);
    }

    startGame() {
        this.state = 'PLAYING';
        this.level = 10;
        this.scoreManager.reset();
        this.lifeSystem.reset();
        this.ui.showScreen(null);
        this.hud.toggle(true);
        this.audio.startBGM();
        
        this.board = this.boardGen.generate(this.level);
        this.pelletsEaten = 0;       // Track para el bicho
        this.boosterActive = false;  // Estado del bicho
        
        this.initEntities(); 
        this.loop();
    }

    initEntities() {
        this.player = new Player(10, 15);
        this.enemies.clear();
        
        const baseSpeed = 1 + (this.level * 0.2); 
        
        // REGLA 1: Enemigos base (Niveles 1-3)
        this.enemies.add(new Ghost(9, 9)); 
        this.enemies.add(new DonkeyKong(10, 9));

        // REGLA 2: Incrementan después del Nivel 4 (1 Fantasma extra por nivel)
        if (this.level >= 4) {
            const extras = this.level - 3; // Nivel 4 = 1 extra, Nivel 5 = 2 extras...
            for(let i=0; i < extras; i++) {
                // Aparecen en el cuarto central rotando su posición
                this.enemies.add(new Ghost(9 + (i % 3), 9));
            }
        }

        // REGLA 3: Teletransporte aleatorio desde el Nivel 6
        if (this.level >= 6) {
            this.enemies.add(new TeleportGhost(10, 10)); // Aparece en color Cyan (Celeste brillante)
        }

        // REGLA 4: Hongo Café "Goomba" desde el Nivel 7
        if (this.level >= 7) {
            this.enemies.add(new Mushroom(11, 9));
        }

        // Aplica la velocidad a todos los que hayan aparecido
        const iterator = this.enemies.createIterator();
        while(iterator.hasNext()) {
            let enemy = iterator.next();
            enemy.baseSpeed = baseSpeed;
            enemy.speed = baseSpeed;
        }
        this.player.speed = baseSpeed + 0.5;

        this.frightenedMode = false;
        this.frightenedTimer = 0;
        this.comboMultiplier = 200;
    }

    // --- LÓGICA DE BOOSTER BICHOS ---
    activateBooster() {
        this.boosterActive = true;
        this.boosterTimer = Date.now() + 10000; // Dura 10 segundos vivo
    }

    getBoosterData() {
        const lvl = this.level;
        if (lvl === 1) return { icon: '🐜', pts: 100 }; // Hormiga
        if (lvl === 2) return { icon: '🐞', pts: 300 }; // Escarabajo
        if (lvl === 3) return { icon: '🦗', pts: 500 }; // Grillo
        if (lvl === 4) return { icon: '🦋', pts: 700 }; // Libélula
        return { icon: '🦂', pts: 1000 };               // Escorpión
    }

    loop() {
        if (this.state !== 'PLAYING') return;
        this.update(); this.draw();
        requestAnimationFrame(() => this.loop());
    }

    update() {
        if (this.frightenedMode && Date.now() > this.frightenedTimer) {
            this.frightenedMode = false;
            const iterator = this.enemies.createIterator();
            while(iterator.hasNext()) { iterator.next().state = 'normal'; }
        }

        // Lógica Bicho Booster
        if (this.boosterActive) {
            if (Date.now() > this.boosterTimer) {
                this.boosterActive = false; // Se fue corriendo
            } else {
                // Comprobar si Pac-Man pisó la coordenada de origen donde está el bicho
                if (this.player.gridX === 10 && this.player.gridY === 15) {
                    this.boosterActive = false;
                    const bData = this.getBoosterData();
                    this.scoreManager.add(bData.pts);
                    this.audio.playPowerUp(); // Sonido especial al comer el bicho
                }
            }
        }

        const newDir = this.input.getDirection();
        if (newDir.x !== 0 || newDir.y !== 0) this.player.nextDir = newDir;
        this.player.update(this.board);

        let mapX = Math.round(this.player.x / 20);
        let mapY = Math.round(this.player.y / 20);
        if (mapX < 0) mapX = this.board.cols - 1; 
        if (mapX >= this.board.cols) mapX = 0;

        if (this.board.map[mapY] && this.board.map[mapY][mapX] === 2) {
            this.board.map[mapY][mapX] = 0;
            this.scoreManager.add(10);
            this.pelletsEaten++; // Contamos para los bichos
            
            // A las 30 y 80 bolitas, aparece el bicho correspondiente al nivel
            if (this.pelletsEaten === 30 || this.pelletsEaten === 80) this.activateBooster();

            this.audio.playEat();
            this.checkLevelComplete();
        } else if (this.board.map[mapY] && this.board.map[mapY][mapX] === 3) {
            this.board.map[mapY][mapX] = 0;
            this.scoreManager.add(50);
            this.audio.playPowerUp();
            
            this.frightenedMode = true;
            this.frightenedTimer = Date.now() + this.prng.frightenDuration(this.level);
            this.comboMultiplier = 200; 
            
            const iterator = this.enemies.createIterator();
            while(iterator.hasNext()) { iterator.next().state = 'frightened'; }
            this.checkLevelComplete();
        }

        const iterator = this.enemies.createIterator();
        while(iterator.hasNext()) {
            const enemy = iterator.next();
            enemy.update(this.board, this.player, this.prng);
            
            if (Math.abs(this.player.x - enemy.x) < 15 && Math.abs(this.player.y - enemy.y) < 15) {
                if (enemy.state === 'frightened') {
                    this.scoreManager.add(this.comboMultiplier);
                    this.comboMultiplier *= 2; 
                    this.audio.playPowerUp(); 
                    
                    enemy.gridX = 10; enemy.gridY = 9;
                    enemy.x = 10 * 20; enemy.y = 9 * 20;
                    enemy.targetX = enemy.x; enemy.targetY = enemy.y;
                    enemy.dir = {x:0, y:0};
                    enemy.state = 'normal';
                } else if (enemy.state === 'normal') {
                    this.handleDeath();
                    return;
                }
            }
        }
        this.hud.update(this.scoreManager.getScore(), this.level, this.lifeSystem.getLives());
    }

    checkLevelComplete() {
        let remaining = 0;
        for(let r=0; r<this.board.rows; r++){
            for(let c=0; c<this.board.cols; c++) {
                if(this.board.map[r][c] === 2 || this.board.map[r][c] === 3) remaining++;
            }
        }
        if (remaining === 0) {
            this.state = 'LEVEL_COMPLETE';
            this.audio.playWin();
            this.ui.showScreen('level-screen');
            setTimeout(() => {
                this.level++;
                this.lifeSystem.addLife(); // <-- MEJORA 1: ¡SUMAMOS UNA VIDA AL PASAR EL NIVEL!

                if (this.level > this.maxLevels) { this.gameOver(); } 
                else {
                    this.state = 'PLAYING';
                    this.ui.showScreen(null);
                    this.board = this.boardGen.generate(this.level); 
                    
                    this.pelletsEaten = 0;       // Reseteamos el conteo de bichos
                    this.boosterActive = false;  
                    
                    this.initEntities();
                    this.loop();
                }
            }, 3000);
        }
    }

    handleDeath() {
        this.state = 'PAUSED';
        this.audio.playDeath();
        if (this.lifeSystem.loseLife()) {
            this.gameOver();
        } else {
            setTimeout(() => {
                this.state = 'PLAYING';
                this.initEntities(); 
                this.loop();
            }, 1500);
        }
    }

    gameOver() {
        this.state = 'GAME_OVER';
        this.audio.stopBGM();
        StorageSystem.saveRanking(this.currentPlayerName, this.scoreManager.getScore(), this.level);
        document.getElementById('final-score').innerText = this.scoreManager.getScore();
        this.ui.showScreen('game-over-screen');
        this.hud.toggle(false);
    }

    draw() {
        this.renderer.clear();
        this.renderer.drawBoard(this.board);
        
        if (this.boosterActive) {
            this.renderer.drawBooster(this.getBoosterData(), 10 * 20, 15 * 20);
        }

        const iterator = this.enemies.createIterator();
        while(iterator.hasNext()) { 
            this.renderer.drawEnemy(iterator.next()); 
        }
        this.renderer.drawPlayer(this.player); 
    }
}