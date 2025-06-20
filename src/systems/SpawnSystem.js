import { Enemy, FastEnemy, TankEnemy, SniperEnemy, OrbitEnemy } from '../entities/Enemy.js';
import { PowerUp } from '../entities/PowerUp.js';

export class SpawnSystem {
  constructor(gameWidth, gameHeight) {
    this.gameWidth = gameWidth;
    this.gameHeight = gameHeight;
    this.centerX = gameWidth / 2;
    this.centerY = gameHeight / 2;
    this.spawnRadius = 280;
    
    this.wave = 0;
    this.enemiesSpawned = 0;
    this.enemiesInWave = 0;
    this.timeSinceLastSpawn = 0;
    this.waveDelay = 3;
    this.betweenWaveDelay = 5;
    this.inBetweenWaves = false;
    
    this.spawnQueue = [];
    this.newEnemies = [];
    
    this.enemyTypes = [
      { class: Enemy, weight: 5, minWave: 0 },
      { class: FastEnemy, weight: 3, minWave: 2 },
      { class: TankEnemy, weight: 2, minWave: 4 },
      { class: SniperEnemy, weight: 2, minWave: 3 },
      { class: OrbitEnemy, weight: 2, minWave: 5 }
    ];
    
    this.powerUpTypes = [
      'health',
      'speed',
      'fireRate',
      'weaponSpread',
      'weaponPower',
      'weaponRapid',
      'weaponLaser',
      'shield'
    ];
  }

  reset() {
    this.wave = 0;
    this.enemiesSpawned = 0;
    this.enemiesInWave = 0;
    this.timeSinceLastSpawn = 0;
    this.inBetweenWaves = false;
    this.spawnQueue = [];
    this.newEnemies = [];
  }

  update(dt, gameTime) {
    this.newEnemies = [];
    this.timeSinceLastSpawn += dt;
    
    if (this.inBetweenWaves) {
      if (this.timeSinceLastSpawn >= this.betweenWaveDelay) {
        this.startNewWave();
        this.inBetweenWaves = false;
      }
      return;
    }
    
    if (this.enemiesSpawned >= this.enemiesInWave && this.spawnQueue.length === 0) {
      this.inBetweenWaves = true;
      this.timeSinceLastSpawn = 0;
      return;
    }
    
    const spawnDelay = Math.max(0.3, 2 - this.wave * 0.1);
    
    if (this.timeSinceLastSpawn >= spawnDelay && this.enemiesSpawned < this.enemiesInWave) {
      this.spawnEnemy();
      this.timeSinceLastSpawn = 0;
    }
  }

  startNewWave() {
    this.wave++;
    this.enemiesSpawned = 0;
    this.enemiesInWave = Math.floor(5 + this.wave * 2 + Math.pow(this.wave, 1.5));
    
    // Create spawn pattern for the wave
    const availableEnemies = this.enemyTypes.filter(type => type.minWave <= this.wave);
    const totalWeight = availableEnemies.reduce((sum, type) => sum + type.weight, 0);
    
    for (let i = 0; i < this.enemiesInWave; i++) {
      let randomWeight = Math.random() * totalWeight;
      let selectedType = null;
      
      for (const type of availableEnemies) {
        randomWeight -= type.weight;
        if (randomWeight <= 0) {
          selectedType = type.class;
          break;
        }
      }
      
      if (!selectedType) {
        selectedType = Enemy;
      }
      
      this.spawnQueue.push(selectedType);
    }
    
    // Shuffle spawn queue for variety
    for (let i = this.spawnQueue.length - 1; i > 0; i--) {
      const j = Math.floor(Math.random() * (i + 1));
      [this.spawnQueue[i], this.spawnQueue[j]] = [this.spawnQueue[j], this.spawnQueue[i]];
    }
  }

  spawnEnemy() {
    if (this.spawnQueue.length === 0) return;
    
    const EnemyClass = this.spawnQueue.shift();
    const angle = Math.random() * Math.PI * 2;
    const x = this.centerX + Math.cos(angle) * this.spawnRadius;
    const y = this.centerY + Math.sin(angle) * this.spawnRadius;
    
    const enemy = new EnemyClass(x, y);
    
    // Scale enemy stats based on wave
    const statMultiplier = 1 + (this.wave - 1) * 0.1;
    enemy.health *= statMultiplier;
    enemy.maxHealth *= statMultiplier;
    enemy.scoreValue = Math.floor(enemy.scoreValue * (1 + this.wave * 0.2));
    
    this.newEnemies.push(enemy);
    this.enemiesSpawned++;
  }

  getNewEnemies() {
    return this.newEnemies;
  }

  trySpawnPowerUp(x, y) {
    const dropRoll = Math.random();
    const baseDropChance = 0.1;
    const waveBonus = this.wave * 0.02;
    const dropChance = Math.min(0.5, baseDropChance + waveBonus);
    
    if (dropRoll < dropChance) {
      const powerUpType = this.powerUpTypes[Math.floor(Math.random() * this.powerUpTypes.length)];
      return new PowerUp(x, y, powerUpType);
    }
    
    return null;
  }

  getCurrentWave() {
    return this.wave;
  }

  getEnemiesRemaining() {
    return this.enemiesInWave - this.enemiesSpawned;
  }

  isInBetweenWaves() {
    return this.inBetweenWaves;
  }
}