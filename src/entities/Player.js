import { Entity } from '../core/Entity.js';

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
    
    this.width = 24;
    this.height = 24;
    this.collisionRadius = 12;
    
    this.speedMultiplier = 1;
    this.fireRateMultiplier = 1;
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
    ctx.rotate(this.rotation);
    
    if (this.invulnerableTime > 0 && Math.floor(this.invulnerableTime * 10) % 2 === 0) {
      ctx.globalAlpha = 0.5;
    }
    
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
    
    ctx.restore();
  }
}