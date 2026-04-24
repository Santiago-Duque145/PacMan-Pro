export class ScoreManager {
    constructor() { this.score = 0; }
    add(points) { this.score += points; }
    getScore() { return this.score; }
    reset() { this.score = 0; }
}

export class LifeSystem {
    constructor(initialLives = 3) { this.lives = initialLives; }
    loseLife() { this.lives--; return this.lives <= 0; }
    addLife() { this.lives++; }
    getLives() { return this.lives; }
    reset(lives=3) { this.lives = lives; }
}