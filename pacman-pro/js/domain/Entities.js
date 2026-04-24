import { RandomMovement, ChaseMovement, TeleportMovement } from './MovementStrategies.js';

class Entity {
    constructor(gridX, gridY, color, speed) {
        this.gridX = gridX; this.gridY = gridY;
        this.x = gridX * 20; this.y = gridY * 20;
        this.targetX = this.x; this.targetY = this.y;
        this.color = color; this.speed = speed;
        this.dir = {x:0, y:0};
    }
    isAtTarget() { return Math.abs(this.x - this.targetX) < 0.01 && Math.abs(this.y - this.targetY) < 0.01; }
    moveTowardsTarget() {
        if (this.x < this.targetX) this.x = Math.min(this.x + this.speed, this.targetX);
        else if (this.x > this.targetX) this.x = Math.max(this.x - this.speed, this.targetX);
        if (this.y < this.targetY) this.y = Math.min(this.y + this.speed, this.targetY);
        else if (this.y > this.targetY) this.y = Math.max(this.y - this.speed, this.targetY);
    }
    update(board) {
        if (this.isAtTarget()) {
            this.x = this.targetX; this.y = this.targetY; 
            if (this.gridX === 0 && this.dir.x === -1) { this.gridX = board.cols - 1; this.x = this.gridX * board.tileSize; } 
            else if (this.gridX === board.cols - 1 && this.dir.x === 1) { this.gridX = 0; this.x = 0; }
            let nx = this.gridX + this.dir.x; let ny = this.gridY + this.dir.y;
            if (nx < 0) nx = board.cols - 1; if (nx >= board.cols) nx = 0;
            if ((this.dir.x !== 0 || this.dir.y !== 0) && board.map[ny] && board.map[ny][nx] !== 1) {
                this.gridX = nx; this.gridY = ny; this.targetX = nx * board.tileSize; this.targetY = ny * board.tileSize;
            } else { this.dir = {x:0, y:0}; }
        } else { this.moveTowardsTarget(); }
    }
}

export class Player extends Entity {
    constructor(gridX, gridY) { super(gridX, gridY, '#FFD700', 2.5); this.nextDir = {x:0, y:0}; }
    update(board) {
        if (this.isAtTarget()) {
            let nnx = this.gridX + this.nextDir.x; let nny = this.gridY + this.nextDir.y;
            if (nnx < 0) nnx = board.cols - 1; else if (nnx >= board.cols) nnx = 0;
            if ((this.nextDir.x !== 0 || this.nextDir.y !== 0) && board.map[nny] && board.map[nny][nnx] !== 1) this.dir = {...this.nextDir};
        } else {
            if (this.nextDir.x === -this.dir.x && this.nextDir.y === -this.dir.y && (this.dir.x!==0||this.dir.y!==0)) {
                this.dir = {...this.nextDir}; let tmpX = this.targetX; let tmpY = this.targetY;
                this.targetX = this.gridX * board.tileSize; this.targetY = this.gridY * board.tileSize;
                this.gridX = Math.round(tmpX / board.tileSize); this.gridY = Math.round(tmpY / board.tileSize);
            }
        }
        super.update(board); 
    }
}

export class Enemy extends Entity {
    constructor(gridX, gridY, color, speed, strategy) {
        super(gridX, gridY, color, speed);
        this.baseSpeed = speed;
        this.strategy = strategy;
        this.state = 'normal';
        this.type = 'ghost'; // Etiqueta para renderizar
    }
    update(board, player, prng) {
        if (this.state === 'frightened') {
            this.speed = this.baseSpeed * 0.6;
            new RandomMovement().move(this, board, player, prng);
        } else {
            this.speed = this.baseSpeed;
            this.strategy.move(this, board, player, prng);
        }
        super.update(board);
    }
}

// Se asignan los tipos
export class Ghost extends Enemy { constructor(gx,gy) { super(gx, gy, '#FF0000', 1.8, new ChaseMovement()); this.type='ghost'; } } 
export class DonkeyKong extends Enemy { constructor(gx,gy) { super(gx, gy, '#5C3A21', 1.4, new ChaseMovement()); this.type='dk'; } } 
export class Mushroom extends Enemy { constructor(gx,gy) { super(gx, gy, '#8B4513', 2, new RandomMovement()); this.type='goomba'; } } 
export class TeleportGhost extends Enemy { constructor(gx,gy) { super(gx, gy, '#00FFFF', 1.8, new TeleportMovement()); this.type='teleport'; } }

export class EnemyIterator {
    constructor(enemies) { this.enemies = enemies; this.index = 0; }
    hasNext() { return this.index < this.enemies.length; }
    next() { return this.enemies[this.index++]; }
}
export class EnemyCollection {
    constructor() { this.enemies =[]; }
    add(enemy) { this.enemies.push(enemy); }
    clear() { this.enemies =[]; }
    createIterator() { return new EnemyIterator(this.enemies); }
}