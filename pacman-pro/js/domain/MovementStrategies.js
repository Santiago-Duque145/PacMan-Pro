export class EnemyMovementStrategy { move(enemy, board, player, prng) { throw new Error("Not implemented."); } }

export class RandomMovement extends EnemyMovementStrategy {
    move(enemy, board, player, prng) {
        if(enemy.isAtTarget()) {
            const dirs =[{x:0,y:-1}, {x:0,y:1}, {x:-1,y:0}, {x:1,y:0}];
            let validDirs = dirs.filter(d => {
                if (d.x === -enemy.dir.x && d.y === -enemy.dir.y && (enemy.dir.x!==0||enemy.dir.y!==0)) return false;
                let nx = enemy.gridX + d.x; let ny = enemy.gridY + d.y;
                if (nx < 0 || nx >= board.cols) return true;
                return board.map[ny] && board.map[ny][nx] !== 1;
            });
            if(validDirs.length === 0) validDirs = dirs.filter(d => {
                let nx = enemy.gridX + d.x; let ny = enemy.gridY + d.y;
                return board.map[ny] && board.map[ny][nx] !== 1;
            });
            if(validDirs.length > 0) enemy.dir = prng.pick(validDirs);
        }
    }
}

export class ChaseMovement extends EnemyMovementStrategy {
    move(enemy, board, player, prng) {
        if(enemy.isAtTarget()) {
            const dirs =[{x:0,y:-1}, {x:0,y:1}, {x:-1,y:0}, {x:1,y:0}];
            let validDirs = dirs.filter(d => {
                if (d.x === -enemy.dir.x && d.y === -enemy.dir.y && (enemy.dir.x!==0||enemy.dir.y!==0)) return false;
                let nx = enemy.gridX + d.x; let ny = enemy.gridY + d.y;
                if (nx < 0 || nx >= board.cols) return true;
                return board.map[ny] && board.map[ny][nx] !== 1;
            });
            if(validDirs.length === 0) validDirs = dirs.filter(d => {
                let nx = enemy.gridX + d.x; let ny = enemy.gridY + d.y;
                return board.map[ny] && board.map[ny][nx] !== 1;
            });
            if(validDirs.length > 0) {
                let bestDir = validDirs[0];
                let minDist = Infinity;
                validDirs.forEach(d => {
                    let nx = enemy.gridX + d.x; let ny = enemy.gridY + d.y;
                    let dist = Math.pow(nx - player.gridX, 2) + Math.pow(ny - player.gridY, 2);
                    if (dist < minDist) { minDist = dist; bestDir = d; }
                });
                enemy.dir = bestDir;
            }
        }
    }
}

export class TeleportMovement extends EnemyMovementStrategy {
    move(enemy, board, player, prng) {
        // Probabilidad Aprox. 1 vez cada 1.5 segundos
        if (enemy.isAtTarget() && prng.chance(0.02)) { 
            let emptySpots =[];
            for(let r=1; r<board.rows-1; r++) {
                for(let c=1; c<board.cols-1; c++) {
                    if(board.map[r][c] !== 1) {
                        // Seguro: Que no se teletransporte muy cerca de Pac-Man para no matarlo injustamente 
                        let distToPlayer = Math.abs(c - player.gridX) + Math.abs(r - player.gridY);
                        if (distToPlayer > 5) emptySpots.push({c, r});
                    }
                }
            }
            if(emptySpots.length > 0) {
                let spot = prng.pick(emptySpots);
                enemy.gridX = spot.c; enemy.gridY = spot.r;
                enemy.x = spot.c * board.tileSize; enemy.y = spot.r * board.tileSize;
                enemy.targetX = enemy.x; enemy.targetY = enemy.y;
                return; // Teletransportado instantáneamente
            }
        }
        new RandomMovement().move(enemy, board, player, prng);
    }
}