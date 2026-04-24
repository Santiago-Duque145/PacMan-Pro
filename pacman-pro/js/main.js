import { AudioManager } from './infra/AudioManager.js';
import { InputHandler } from './infra/InputHandler.js';
import { Renderer } from './ui/Renderer.js';
import { MenuUI, HUD } from './ui/UIComponents.js';
import { GameController } from './app/GameController.js';

window.onload = () => {
    // 1. Instanciar Librería provista (Generador PRNG)
    // Se asume que AleaPacMen se cargó globalmente a través de la etiqueta <script>
    const prng = new window.AleaPacMen({ digits: 6, method: 'midsquare' });

    // 2. Infraestructura
    const audio = new AudioManager();
    const input = new InputHandler();

    // 3. UI
    const renderer = new Renderer('gameCanvas');
    const hud = new HUD();
    
    // 4. Se usa un Mediator Dummy o directo. En este caso el propio GameController es el Mediator.
    // Usamos lazy instantiation / setter para resolver la dependencia circular de UI y Controlador
    
    let gameController;
    const uiMediatorProxy = {
        notify: (sender, event, data) => gameController.notify(sender, event, data)
    };
    
    const ui = new MenuUI(uiMediatorProxy);

    // 5. Controlador (Mediador Central)
    gameController = new GameController(renderer, ui, hud, audio, input, prng);

    // Interacción inicial para desbloquear el Audio Context en navegadores modernos
    document.addEventListener('click', () => {
        if(audio.ctx.state === 'suspended') {
            audio.ctx.resume();
        }
    }, { once: true });
};