export class InputHandler {
    constructor() {
        this.currentDir = {x:0, y:0};
        
        window.addEventListener('keydown', (e) => {
            // Si está escribiendo el nombre, no bloquea nada (a,s,d,w)
            if (document.activeElement && document.activeElement.tagName === 'INPUT') {
                return; 
            }

            if(['ArrowUp','w','W'].includes(e.key)) { e.preventDefault(); this.currentDir = {x:0, y:-1}; }
            if(['ArrowDown','s','S'].includes(e.key)) { e.preventDefault(); this.currentDir = {x:0, y:1}; }
            if(['ArrowLeft','a','A'].includes(e.key)) { e.preventDefault(); this.currentDir = {x:-1, y:0}; }
            if(['ArrowRight','d','D'].includes(e.key)) { e.preventDefault(); this.currentDir = {x:1, y:0}; }
        });
    }
    getDirection() { return this.currentDir; }
}