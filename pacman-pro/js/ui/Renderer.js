export class Renderer {
    constructor(canvasId) {
        this.canvas = document.getElementById(canvasId);
        this.ctx = this.canvas.getContext('2d');
    }

    clear() { this.ctx.clearRect(0, 0, this.canvas.width, this.canvas.height); }

    drawBoard(board) {
        for(let y=0; y<board.rows; y++) {
            for(let x=0; x<board.cols; x++) {
                const tile = board.map[y][x];
                if(tile === 1) { 
                    this.ctx.fillStyle = '#1919A6'; 
                    this.ctx.fillRect(x*board.tileSize, y*board.tileSize, board.tileSize, board.tileSize);
                    this.ctx.strokeStyle = '#000'; 
                    this.ctx.strokeRect(x*board.tileSize, y*board.tileSize, board.tileSize, board.tileSize);
                } else if(tile === 2) { 
                    this.ctx.fillStyle = '#FFB8AE'; 
                    this.ctx.fillRect(x*board.tileSize+8, y*board.tileSize+8, 4, 4); 
                } else if(tile === 3) { 
                    this.ctx.fillStyle = '#FFB8AE';
                    this.ctx.beginPath(); this.ctx.arc(x*board.tileSize+10, y*board.tileSize+10, 6, 0, Math.PI*2); this.ctx.fill();
                }
            }
        }
    }

    drawPlayer(player) {
        const cx = player.x + 10; const cy = player.y + 10;
        let angle = player.lastAngle || 0;
        if (player.dir.x === 1) angle = 0;
        else if (player.dir.x === -1) angle = Math.PI;
        else if (player.dir.y === 1) angle = Math.PI / 2;
        else if (player.dir.y === -1) angle = -Math.PI / 2;
        player.lastAngle = angle;

        const mouthOpen = (Math.sin(Date.now() / 150) + 1) / 2; 
        const mouthAngle = 0.2 * Math.PI * mouthOpen;

        this.ctx.fillStyle = player.color;
        this.ctx.beginPath();
        this.ctx.arc(cx, cy, 9, angle + mouthAngle, angle + 2*Math.PI - mouthAngle);
        this.ctx.lineTo(cx, cy);
        this.ctx.fill();
    }

    // DISPENSADOR CENTRAL DE ENEMIGOS
    drawEnemy(enemy) {
        if (enemy.state === 'frightened') { this.drawFrightened(enemy); return; }
        if (enemy.type === 'ghost' || enemy.type === 'teleport') this.drawGhost(enemy);
        else if (enemy.type === 'dk') this.drawDonkeyKong(enemy);
        else if (enemy.type === 'goomba') this.drawGoomba(enemy);
    }

    // 1. FANTASMAS CLÁSICOS
    drawGhost(ghost) {
        const cx = ghost.x + 10; const cy = ghost.y + 10; const radius = 9;
        this.ctx.fillStyle = ghost.color;
        this.ctx.beginPath();
        this.ctx.arc(cx, cy - 1, radius, Math.PI, 0); 
        this.ctx.lineTo(cx + radius, cy + radius); 
        const waves = 3; const waveWidth = (radius * 2) / waves;
        for (let i = waves; i > 0; i--) {
            this.ctx.lineTo(cx + radius - waveWidth * (waves - i + 0.5), cy + radius - 3);
            this.ctx.lineTo(cx + radius - waveWidth * (waves - i + 1), cy + radius);
        }
        this.ctx.lineTo(cx - radius, cy + radius); 
        this.ctx.closePath(); this.ctx.fill();

        this.ctx.fillStyle = '#FFF'; this.ctx.beginPath();
        this.ctx.arc(cx - 3, cy - 3, 3, 0, Math.PI * 2);
        this.ctx.arc(cx + 3, cy - 3, 3, 0, Math.PI * 2); this.ctx.fill();
        const px = ghost.dir.x * 1.5; const py = ghost.dir.y * 1.5;
        this.ctx.fillStyle = '#0000FF'; this.ctx.beginPath();
        this.ctx.arc(cx - 3 + px, cy - 3 + py, 1.5, 0, Math.PI * 2);
        this.ctx.arc(cx + 3 + px, cy - 3 + py, 1.5, 0, Math.PI * 2); this.ctx.fill();
    }

    // 2. DONKEY KONG (MONO)
    drawDonkeyKong(enemy) {
        const cx = enemy.x + 10; const cy = enemy.y + 10;
        this.ctx.fillStyle = '#5C3A21'; // Pelo Café
        this.ctx.beginPath(); this.ctx.arc(cx, cy, 9, 0, Math.PI * 2); this.ctx.fill();
        this.ctx.fillStyle = '#EDC9AF'; // Cara Color Durazno
        this.ctx.beginPath(); this.ctx.arc(cx, cy + 3, 6, 0, Math.PI * 2); this.ctx.fill();
        this.ctx.beginPath(); this.ctx.arc(cx - 3, cy - 2, 4, 0, Math.PI * 2);
        this.ctx.arc(cx + 3, cy - 2, 4, 0, Math.PI * 2); this.ctx.fill();
        this.ctx.fillStyle = '#000'; // Ojos
        this.ctx.beginPath(); this.ctx.arc(cx - 3, cy - 2, 1.5, 0, Math.PI*2);
        this.ctx.arc(cx + 3, cy - 2, 1.5, 0, Math.PI*2); this.ctx.fill();
        this.ctx.fillRect(cx - 2, cy + 2, 4, 1); // Nariz
    }

    // 3. HONGO GOOMBA
    drawGoomba(enemy) {
        const cx = enemy.x + 10; const cy = enemy.y + 10;
        this.ctx.fillStyle = '#8B4513'; // Sombrero
        this.ctx.beginPath(); this.ctx.arc(cx, cy, 8, Math.PI, 0); 
        this.ctx.lineTo(cx + 8, cy + 4); this.ctx.lineTo(cx - 8, cy + 4); this.ctx.fill();
        this.ctx.fillStyle = '#F5DEB3'; this.ctx.fillRect(cx - 4, cy + 4, 8, 4); // Tallo
        this.ctx.fillStyle = '#000'; // Pies
        this.ctx.beginPath(); this.ctx.arc(cx - 4, cy + 8, 3, Math.PI, 0);
        this.ctx.arc(cx + 4, cy + 8, 3, Math.PI, 0); this.ctx.fill();
        this.ctx.fillStyle = '#FFF'; this.ctx.fillRect(cx - 5, cy - 1, 3, 4); this.ctx.fillRect(cx + 2, cy - 1, 3, 4);
        this.ctx.fillStyle = '#000'; this.ctx.fillRect(cx - 4, cy, 2, 2); this.ctx.fillRect(cx + 2, cy, 2, 2);
        this.ctx.strokeStyle = '#000'; this.ctx.lineWidth = 2; // Cejas de Enojado
        this.ctx.beginPath(); this.ctx.moveTo(cx - 6, cy - 3); this.ctx.lineTo(cx - 2, cy - 1);
        this.ctx.moveTo(cx + 6, cy - 3); this.ctx.lineTo(cx + 2, cy - 1); this.ctx.stroke();
    }

    // 4. Modo asustado azul aplica a todos cuando hay power up
    drawFrightened(enemy) {
        const cx = enemy.x + 10; const cy = enemy.y + 10; const radius = 9;
        this.ctx.fillStyle = '#0000FF'; 
        this.ctx.beginPath(); this.ctx.arc(cx, cy - 1, radius, Math.PI, 0); this.ctx.lineTo(cx + radius, cy + radius); 
        const waves = 3; const waveWidth = (radius * 2) / waves;
        for (let i = waves; i > 0; i--) {
            this.ctx.lineTo(cx + radius - waveWidth * (waves - i + 0.5), cy + radius - 3);
            this.ctx.lineTo(cx + radius - waveWidth * (waves - i + 1), cy + radius);
        }
        this.ctx.lineTo(cx - radius, cy + radius); this.ctx.closePath(); this.ctx.fill();
        this.ctx.fillStyle = '#FFB8AE';
        this.ctx.fillRect(cx - 4, cy - 3, 2, 2); this.ctx.fillRect(cx + 2, cy - 3, 2, 2);
        this.ctx.beginPath(); this.ctx.moveTo(cx - 5, cy + 3); this.ctx.lineTo(cx - 2, cy + 1);
        this.ctx.lineTo(cx, cy + 3); this.ctx.lineTo(cx + 2, cy + 1); this.ctx.lineTo(cx + 5, cy + 3);
        this.ctx.strokeStyle = '#FFB8AE'; this.ctx.lineWidth = 1; this.ctx.stroke();
    }

    drawBooster(booster, x, y) {
        this.ctx.font = '18px Arial'; this.ctx.textAlign = 'center'; this.ctx.textBaseline = 'middle';
        this.ctx.shadowColor = '#FFD700'; this.ctx.shadowBlur = 10;
        this.ctx.fillText(booster.icon, x + 10, y + 10);
        this.ctx.shadowBlur = 0; 
    }
}