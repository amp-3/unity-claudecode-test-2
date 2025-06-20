import { Game } from './core/Game.js';

document.addEventListener('DOMContentLoaded', async () => {
    const canvas = document.getElementById('game-canvas');
    
    if (!canvas) {
        console.error('Canvas element not found!');
        return;
    }
    
    const game = Game.getInstance();
    
    try {
        const initialized = await game.init(canvas);
        
        if (initialized) {
            console.log('Game initialized successfully');
            game.start();
        } else {
            console.error('Failed to initialize game');
        }
    } catch (error) {
        console.error('Error initializing game:', error);
    }
    
    window.addEventListener('visibilitychange', () => {
        if (document.hidden && game.gameState === 'PLAYING') {
            game.setState('PAUSED');
        }
    });
    
    window.addEventListener('beforeunload', () => {
        if (game.saveSystem) {
            game.saveSystem.save({
                totalPlayTime: game.gameTime,
                lastPlayed: Date.now()
            });
        }
    });
});