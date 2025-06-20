export class Game {
  constructor() {
    this.canvas = null;
    this.ctx = null;
    this.lastTime = 0;
    this.deltaTime = 0;
    this.gameState = 'MENU';
    this.entities = new Map();
    this.systems = new Map();
    this.score = 0;
    this.highScore = 0;
    this.isPaused = false;
    this.gameTime = 0;
    
    this.gameArea = {
      x: 0,
      y: 0,
      width: 800,
      height: 600,
      boundaryRadius: 300
    };
    
    this.player = null;
    this.inputManager = null;
    this.weaponSystem = null;
    this.spawnSystem = null;
    this.uiManager = null;
    this.audioManager = null;
    this.particleSystem = null;
    this.saveSystem = null;
    this.levelingSystem = null;
    this.permanentUpgrades = null;
    
    Game.instance = this;
  }

  static getInstance() {
    if (!Game.instance) {
      Game.instance = new Game();
    }
    return Game.instance;
  }

  async init(canvas) {
    this.canvas = canvas;
    this.ctx = canvas.getContext('2d');
    
    this.setupCanvas();
    
    await this.loadSystems();
    await this.loadAssets();
    
    this.setState('MENU');
    
    return true;
  }

  setupCanvas() {
    this.canvas.width = this.gameArea.width;
    this.canvas.height = this.gameArea.height;
    this.gameArea.x = this.canvas.width / 2;
    this.gameArea.y = this.canvas.height / 2;
    
    this.ctx.imageSmoothingEnabled = false;
    
    window.addEventListener('resize', () => this.handleResize());
    this.handleResize();
  }

  handleResize() {
    const viewportWidth = window.innerWidth;
    const viewportHeight = window.innerHeight;
    
    const borderWidth = window.innerWidth <= 768 ? 2 : 4;
    const availableWidth = viewportWidth - borderWidth;
    const availableHeight = viewportHeight - borderWidth;
    
    const scaleX = availableWidth / this.canvas.width;
    const scaleY = availableHeight / this.canvas.height;
    const scale = Math.min(scaleX, scaleY);
    
    this.canvas.style.transform = `translate(-50%, -50%) scale(${scale})`;
    this.canvas.style.transformOrigin = 'center';
    this.canvas.style.position = 'absolute';
    this.canvas.style.top = '50%';
    this.canvas.style.left = '50%';
    
    if (this.inputManager) {
      this.inputManager.updateCanvasScale(scale);
      this.inputManager.updateCanvasPosition(
        viewportWidth / 2 - (this.canvas.width * scale) / 2,
        viewportHeight / 2 - (this.canvas.height * scale) / 2
      );
    }
  }

  async loadSystems() {
    const { InputManager } = await import('../systems/InputManager.js');
    const { WeaponSystem } = await import('../systems/WeaponSystem.js');
    const { SpawnSystem } = await import('../systems/SpawnSystem.js');
    const { UIManager } = await import('../ui/UIManager.js');
    const { AudioManager } = await import('../systems/AudioManager.js');
    const { ParticleSystem } = await import('../effects/ParticleSystem.js');
    const { SaveSystem } = await import('../systems/SaveSystem.js');
    const { LevelingSystem } = await import('../systems/LevelingSystem.js');
    const { PermanentUpgrades } = await import('../systems/PermanentUpgrades.js');
    
    this.inputManager = new InputManager(this.canvas);
    this.weaponSystem = new WeaponSystem();
    this.spawnSystem = new SpawnSystem(this.gameArea.width, this.gameArea.height);
    this.uiManager = new UIManager(this.canvas);
    this.audioManager = new AudioManager();
    this.particleSystem = new ParticleSystem();
    this.saveSystem = new SaveSystem();
    this.levelingSystem = new LevelingSystem();
    this.permanentUpgrades = new PermanentUpgrades();
    
    this.systems.set('input', this.inputManager);
    this.systems.set('weapon', this.weaponSystem);
    this.systems.set('spawn', this.spawnSystem);
    this.systems.set('ui', this.uiManager);
    this.systems.set('audio', this.audioManager);
    this.systems.set('particle', this.particleSystem);
    this.systems.set('save', this.saveSystem);
    this.systems.set('leveling', this.levelingSystem);
    this.systems.set('upgrades', this.permanentUpgrades);
  }

  async loadAssets() {
    try {
      const { AssetLoader } = await import('../utils/AssetLoader.js');
      this.assetLoader = AssetLoader.getInstance();
      
      await Promise.all([
        this.audioManager.loadAudio(),
        this.assetLoader.loadAllSprites()
      ]);
      
      const savedData = this.saveSystem.load();
      this.highScore = savedData.highScore;
      
      console.log('🎮 All game assets loaded successfully');
    } catch (error) {
      console.warn('Failed to load some assets:', error);
    }
  }

  setState(newState) {
    const prevState = this.gameState;
    this.gameState = newState;
    
    switch (newState) {
      case 'MENU':
        this.showMenu();
        break;
      case 'PLAYING':
        if (prevState !== 'PAUSED' && prevState !== 'LEVEL_UP') {
          this.startNewGame();
        }
        // レベルアップ画面から戻った時は花びらをクリア
        if (prevState === 'LEVEL_UP' && this.uiManager) {
          this.uiManager.clearPetals();
        }
        break;
      case 'PAUSED':
        this.pause();
        break;
      case 'GAME_OVER':
        this.gameOver();
        break;
      case 'LEVEL_UP':
        this.handleLevelUp();
        break;
    }
  }

  showMenu() {
    this.entities.clear();
    this.score = 0;
    this.gameTime = 0;
    if (this.levelingSystem) {
      this.levelingSystem.reset();
    }
    if (this.permanentUpgrades) {
      this.permanentUpgrades.reset();
    }
  }

  async startNewGame() {
    this.entities.clear();
    this.score = 0;
    this.gameTime = 0;
    
    const { Player } = await import('../entities/Player.js');
    this.player = new Player(this.gameArea.x, this.gameArea.y);
    this.entities.set('player', this.player);
    
    this.spawnSystem.reset();
    this.weaponSystem.reset();
    this.levelingSystem.reset();
    this.permanentUpgrades.reset();
    
    if (this.audioManager.currentMusic) {
      this.audioManager.playMusic('bgm');
    }
  }

  pause() {
    this.isPaused = true;
  }

  unpause() {
    this.isPaused = false;
    this.setState('PLAYING');
  }

  handleLevelUp() {
    this.isPaused = true;
    // レベルアップ画面遷移時に継続中の入力をクリア
    if (this.inputManager) {
      this.inputManager.reset();
    }
    
    // レベルアップ時のクラッカー演出
    if (this.particleSystem) {
      this.particleSystem.createLevelUpCelebration(this.canvas.width, this.canvas.height);
    }
  }

  selectUpgrade(upgradeIndex) {
    const selectedUpgrade = this.levelingSystem.selectUpgrade(upgradeIndex);
    
    if (selectedUpgrade) {
      this.permanentUpgrades.applyUpgrade(selectedUpgrade);
      this.audioManager.playSound('powerup');
      
      // プレイヤーのステータスを更新
      if (this.player) {
        this.player.applyPermanentUpgrades(this.permanentUpgrades);
      }
      
      // パーティクルとUIの花びらをフェードアウト
      if (this.particleSystem) {
        this.particleSystem.fadeOutAll(0.2);
      }
      if (this.uiManager) {
        this.uiManager.fadeOutPetals(0.2);
      }
      
      this.isPaused = false;
      this.setState('PLAYING');
    }
  }

  gameOver() {
    const isNewHighScore = this.saveSystem.updateHighScore(this.score);
    
    this.saveSystem.save({
      totalPlayTime: this.gameTime,
      gamesPlayed: this.saveSystem.load().gamesPlayed + 1,
      enemiesKilled: this.saveSystem.load().enemiesKilled + this.getEnemiesKilled()
    });
    
    if (isNewHighScore) {
      this.audioManager.playSound('highscore');
    }
  }

  getEnemiesKilled() {
    let count = 0;
    this.entities.forEach(entity => {
      if (entity.type === 'enemy' && !entity.alive) count++;
    });
    return count;
  }

  update(currentTime) {
    if (!this.lastTime) this.lastTime = currentTime;
    
    this.deltaTime = Math.min((currentTime - this.lastTime) / 1000, 0.1);
    this.lastTime = currentTime;
    
    if (this.gameState === 'PLAYING' && !this.isPaused) {
      this.gameTime += this.deltaTime;
      this.updateGameplay(this.deltaTime);
    }
    
    this.inputManager.update();
    this.handleInput();
    
    this.render();
    
    requestAnimationFrame((time) => this.update(time));
  }

  updateGameplay(dt) {
    if (this.player) {
      this.player.update(dt, this.inputManager);
      this.player.constrainToArea(this.gameArea.x, this.gameArea.y, this.gameArea.boundaryRadius);
    }
    
    this.spawnSystem.update(dt, this.gameTime);
    const newEnemies = this.spawnSystem.getNewEnemies();
    newEnemies.forEach(enemy => {
      this.entities.set(`enemy_${enemy.id}`, enemy);
    });
    
    this.entities.forEach((entity, id) => {
      if (entity !== this.player) {
        entity.update(dt, this.player);
      }
      
      if (!entity.alive) {
        if (entity.type === 'enemy') {
          this.score += entity.scoreValue || 10;
          this.audioManager.playSound('explosion');
          this.particleSystem.createExplosion(entity.x, entity.y);
          
          // 経験値獲得
          const expGained = entity.expValue || 10;
          const leveledUp = this.levelingSystem.addExperience(expGained);
          
          if (leveledUp) {
            this.setState('LEVEL_UP');
            return; // レベルアップ時はゲームを一時停止
          }
          
          const powerUp = this.spawnSystem.trySpawnPowerUp(entity.x, entity.y);
          if (powerUp) {
            this.entities.set(`powerup_${powerUp.id}`, powerUp);
          }
        }
        this.entities.delete(id);
      }
    });
    
    this.checkCollisions();
    
    this.weaponSystem.update(dt);
    this.particleSystem.update(dt);
  }

  checkCollisions() {
    const entities = Array.from(this.entities.values());
    
    for (let i = 0; i < entities.length; i++) {
      for (let j = i + 1; j < entities.length; j++) {
        const a = entities[i];
        const b = entities[j];
        
        if (a.collidesWith(b)) {
          this.handleCollision(a, b);
        }
      }
    }
  }

  handleCollision(a, b) {
    if (a.type === 'player' && b.type === 'enemy') {
      a.takeDamage(b.damage || 1);
      b.destroy();
      this.audioManager.playSound('hit');
    } else if (a.type === 'enemy' && b.type === 'player') {
      b.takeDamage(a.damage || 1);
      a.destroy();
      this.audioManager.playSound('hit');
    } else if (a.type === 'bullet' && b.type === 'enemy') {
      const destroyed = b.takeDamage(a.damage);
      if (!a.piercing) a.destroy();
      if (destroyed) {
        this.particleSystem.createExplosion(b.x, b.y);
        // ライフスティール効果処理
        if (this.player && this.permanentUpgrades) {
          this.permanentUpgrades.processLifesteal(this.player, a.damage);
        }
      }
    } else if (a.type === 'enemy' && b.type === 'bullet') {
      const destroyed = a.takeDamage(b.damage);
      if (!b.piercing) b.destroy();
      if (destroyed) {
        this.particleSystem.createExplosion(a.x, a.y);
        // ライフスティール効果処理
        if (this.player && this.permanentUpgrades) {
          this.permanentUpgrades.processLifesteal(this.player, b.damage);
        }
      }
    } else if (a.type === 'player' && b.type === 'powerup') {
      b.applyTo(a);
      b.destroy();
      this.audioManager.playSound('powerup');
    } else if (a.type === 'powerup' && b.type === 'player') {
      a.applyTo(b);
      a.destroy();
      this.audioManager.playSound('powerup');
    }
  }

  handleInput() {
    if (this.inputManager.keys.has('Escape')) {
      if (this.gameState === 'PLAYING') {
        this.setState('PAUSED');
      } else if (this.gameState === 'PAUSED') {
        this.unpause();
      }
    }
    
    if (this.gameState === 'MENU') {
      if (this.inputManager.keys.has('Enter') || this.inputManager.mouse.pressed) {
        this.setState('PLAYING');
      }
    }
    
    if (this.gameState === 'GAME_OVER') {
      if (this.inputManager.keys.has('Enter') || this.inputManager.mouse.pressed) {
        this.setState('MENU');
      }
    }
    
    if (this.gameState === 'LEVEL_UP') {
      // キーボードでの選択（1, 2, 3キー）
      if (this.inputManager.keys.has('Digit1')) {
        this.selectUpgrade(0);
      } else if (this.inputManager.keys.has('Digit2')) {
        this.selectUpgrade(1);
      } else if (this.inputManager.keys.has('Digit3')) {
        this.selectUpgrade(2);
      }
      
      // マウスクリックでの選択
      const clickedCard = this.inputManager.checkLevelUpCardClick(this);
      if (clickedCard >= 0) {
        this.selectUpgrade(clickedCard);
      }
    }
  }

  render() {
    this.ctx.clearRect(0, 0, this.canvas.width, this.canvas.height);
    
    this.ctx.fillStyle = '#111';
    this.ctx.fillRect(0, 0, this.canvas.width, this.canvas.height);
    
    if (this.gameState === 'PLAYING' || this.gameState === 'PAUSED' || this.gameState === 'LEVEL_UP') {
      this.renderGameplay();
    }
    
    this.uiManager.render(this);
  }

  renderGameplay() {
    this.ctx.save();
    
    this.renderBoundary();
    
    this.entities.forEach(entity => {
      entity.render(this.ctx);
    });
    
    this.particleSystem.render(this.ctx);
    
    this.ctx.restore();
  }

  renderBoundary() {
    this.ctx.strokeStyle = 'rgba(255, 255, 255, 0.2)';
    this.ctx.lineWidth = 2;
    this.ctx.beginPath();
    this.ctx.arc(this.gameArea.x, this.gameArea.y, this.gameArea.boundaryRadius, 0, Math.PI * 2);
    this.ctx.stroke();
  }

  addEntity(entity) {
    this.entities.set(`${entity.type}_${entity.id}`, entity);
  }

  addScore(points) {
    this.score += points;
    if (this.score > this.highScore) {
      this.highScore = this.score;
    }
  }

  start() {
    requestAnimationFrame((time) => this.update(time));
  }
}