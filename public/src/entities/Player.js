import { Entity } from '../core/Entity.js';
import { AssetLoader } from '../utils/AssetLoader.js';

export class Player extends Entity {
  constructor(x, y) {
    super(x, y);
    this.type = 'player';
    this.speed = 200;
    this.health = 3;
    this.maxHealth = 3;
    this.fireRate = 8;
    this.lastShotTime = 0;
    this.weapon = 'normal';
    this.boundaryRadius = 150;
    this.invulnerableTime = 0;
    this.invulnerableDuration = 1.5;
    
    this.width = 32;
    this.height = 32;
    this.collisionRadius = 16;
    
    this.speedMultiplier = 1;
    this.fireRateMultiplier = 1;
    
    // 永続アップグレード効果
    this.baseDamage = 1;
    this.damageMultiplier = 1;
    this.baseSpeed = 200;
    this.baseFireRate = 8;
    this.multiShotCount = 1;
    this.hasPiercing = false;
    this.hasExplosive = false;
    this.hasLifesteal = false;
    
    this.assetLoader = AssetLoader.getInstance();
  }

  update(dt, input) {
    super.update(dt);
    
    if (this.invulnerableTime > 0) {
      this.invulnerableTime -= dt;
    }
    
    this.handleMovement(dt, input);
    this.handleShooting(dt, input);
  }

  handleMovement(dt, input) {
    const movement = input.getMovementInput();
    
    const length = Math.sqrt(movement.x * movement.x + movement.y * movement.y);
    if (length > 0) {
      movement.x /= length;
      movement.y /= length;
    }
    
    this.vx = movement.x * this.speed * this.speedMultiplier;
    this.vy = movement.y * this.speed * this.speedMultiplier;
    
    if (movement.x !== 0 || movement.y !== 0) {
      this.rotation = Math.atan2(movement.y, movement.x);
    }
  }

  handleShooting(dt, input) {
    this.lastShotTime += dt;
    
    const canShoot = this.lastShotTime >= (1 / (this.fireRate * this.fireRateMultiplier));
    
    if (input.mouse.pressed && canShoot) {
      const direction = this.getShootDirection(input);
      this.shoot(direction);
      this.lastShotTime = 0;
    }
  }

  getShootDirection(input) {
    return Math.atan2(input.mouse.y - this.y, input.mouse.x - this.x);
  }

  async shoot(direction) {
    const { Game } = await import('../core/Game.js');
    const game = Game.getInstance();
    const bullets = game.weaponSystem.fire(this.x, this.y, direction);
    
    bullets.forEach(bullet => {
      game.addEntity(bullet);
    });
    
    game.audioManager.playSound('shoot', 0.3);
  }

  takeDamage(amount) {
    if (this.invulnerableTime > 0) return false;
    
    this.health -= amount;
    this.invulnerableTime = this.invulnerableDuration;
    
    if (this.health <= 0) {
      this.destroy();
      import('../core/Game.js').then(module => {
        const game = module.Game.getInstance();
        game.setState('GAME_OVER');
      });
      return true;
    }
    
    return false;
  }

  heal(amount) {
    this.health = Math.min(this.health + amount, this.maxHealth);
  }

  applySpeedBoost(multiplier, duration) {
    this.speedMultiplier = multiplier;
    setTimeout(() => {
      this.speedMultiplier = 1;
    }, duration * 1000);
  }

  applyFireRateBoost(multiplier, duration) {
    this.fireRateMultiplier = multiplier;
    setTimeout(() => {
      this.fireRateMultiplier = 1;
    }, duration * 1000);
  }

  render(ctx) {
    ctx.save();
    ctx.translate(this.x, this.y);
    
    if (this.invulnerableTime > 0 && Math.floor(this.invulnerableTime * 10) % 2 === 0) {
      ctx.globalAlpha = 0.5;
    }
    
    const rocketSprite = this.assetLoader.getImage('rocket');
    
    if (rocketSprite && this.assetLoader.isLoaded('rocket')) {
      ctx.rotate(this.rotation + Math.PI / 2);
      const spriteWidth = this.width;
      const spriteHeight = this.height;
      
      ctx.drawImage(
        rocketSprite,
        -spriteWidth / 2,
        -spriteHeight / 2,
        spriteWidth,
        spriteHeight
      );
    } else {
      ctx.rotate(this.rotation);
      ctx.fillStyle = '#00ff00';
      ctx.beginPath();
      ctx.moveTo(this.width / 2, 0);
      ctx.lineTo(-this.width / 2, -this.height / 2);
      ctx.lineTo(-this.width / 4, 0);
      ctx.lineTo(-this.width / 2, this.height / 2);
      ctx.closePath();
      ctx.fill();
      
      ctx.strokeStyle = '#00dd00';
      ctx.lineWidth = 2;
      ctx.stroke();
    }
    
    ctx.restore();
  }

  applyPermanentUpgrades(upgradeSystem) {
    const stats = upgradeSystem.getPlayerStats({
      damage: this.baseDamage,
      fireRate: this.baseFireRate,
      speed: this.baseSpeed,
      maxHealth: this.maxHealth
    });

    // ステータス更新
    this.damageMultiplier = stats.damage / this.baseDamage;
    this.fireRate = stats.fireRate;
    this.speed = stats.speed;
    
    // 最大HP増加時に現在HPも回復
    const healthIncrease = stats.maxHealth - this.maxHealth;
    if (healthIncrease > 0) {
      this.maxHealth = stats.maxHealth;
      this.heal(healthIncrease);
    }
    
    this.multiShotCount = stats.multiShot;
    this.hasPiercing = stats.piercing;
    this.hasExplosive = stats.explosive;
    this.hasLifesteal = stats.lifesteal;
  }

  heal(amount) {
    this.health = Math.min(this.maxHealth, this.health + amount);
  }

  getCurrentDamage() {
    return this.baseDamage * this.damageMultiplier;
  }
}