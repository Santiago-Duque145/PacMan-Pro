export class StorageSystem {
    static saveRanking(name, score, level) {
        let ranks = this.getRanking();
        ranks.push({ name: name || 'ANON', score, level });
        ranks.sort((a,b) => b.score - a.score);
        ranks = ranks.slice(0, 5); // Guardamos el Top 5
        localStorage.setItem('pacman_ranking_v3', JSON.stringify(ranks));
    }
    
    static getRanking() {
        let raw = JSON.parse(localStorage.getItem('pacman_ranking_v3'));
        // Rellenamos con bots la primera vez
        if (!raw) {
            raw =[
                {name: 'PAC', score: 5000, level: 5},
                {name: 'MAN', score: 3000, level: 3},
                {name: 'PRO', score: 1000, level: 2}
            ];
        }
        return raw;
    }
    
    static getCredits() { return parseInt(localStorage.getItem('pacman_credits')) || 0; }
    static addCredit() { localStorage.setItem('pacman_credits', this.getCredits() + 1); }
    static useCredit() { 
        const c = this.getCredits();
        if(c > 0) { localStorage.setItem('pacman_credits', c - 1); return true; }
        return false;
    }
}