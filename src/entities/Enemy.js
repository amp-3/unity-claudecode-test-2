import { Entity } from '../core/Entity.js';

export class Enemy extends Entity {
  constructor(x, y) {
    super(x, y);
    this.type = 'enemy';
    this.health = 1;
    this.maxHealth = 1;
    this.speed = 100;
    this.damage = 1;
    this.scoreValue = 10;
    this.behaviorType = 'chase';
    this.shootCooldown = 0;
    this.shootInterval = 2;
    this.aggroRange = 200;
    this.wanderAngle = Math.random() * Math.PI * 2;
    this.dropChance = 0.1;
    
    this.width = 20;
    this.height = 20;
    this.collisionRadius = 10;
  }

  update(dt, player) {
    super.update(dt);
    
    if (!player || !player.alive) {
      this.behaviorType = 'wander';
    }
    
    switch (this.behaviorType) {
      case 'chase':
        this.chasePlayer(dt, player);
        break;
      case 'orbit':
        this.orbitPlayer(dt, player);
        break;
      case 'sniper':
        this.sniperBehavior(dt, player);
        break;
      case 'wander':
        this.wander(dt);
        break;
    }
    
    this.constrainToArea(400, 300, 290);
  }

  chasePlayer(dt, player) {
    if (!player) return;
    
    const angle = this.angleTo(player);
    this.vx = Math.cos(angle) * this.speed;
    this.vy = Math.sin(angle) * this.speed;
    this.rotation = angle;
  }

  orbitPlayer(dt, player) {
    if (!player) return;
    
    const distance = this.distanceTo(player);
    const angle = this.angleTo(player);
    
    if (distance > 150) {
      this.vx = Math.cos(angle) * this.speed;
      this.vy = Math.sin(angle) * this.speed;
    } else if (distance < 100) {
      this.vx = -Math.cos(angle) * this.speed;
      this.vy = -Math.sin(angle) * this.speed;
    } else {
      const tangentAngle = angle + Math.PI / 2;
      this.vx = Math.cos(tangentAngle) * this.speed;
      this.vy = Math.sin(tangentAngle) * this.speed;
    }
    
    this.rotation = Math.atan2(this.vy, this.vx);
  }

  sniperBehavior(dt, player) {
    if (!player) return;
    
    const distance = this.distanceTo(player);
    const angle = this.angleTo(player);
    
    if (distance > 200) {
      this.vx = Math.cos(angle) * this.speed * 0.5;
      this.vy = Math.sin(angle) * this.speed * 0.5;
    } else {
      this.vx *= 0.95;
      this.vy *= 0.95;
      
      this.shootCooldown -= dt;
      if (this.shootCooldown <= 0) {
        this.shoot(angle);
        this.shootCooldown = this.shootInterval;
      }
    }
    
    this.rotation = angle;
  }

  wander(dt) {
    this.wanderAngle += (Math.random() - 0.5) * 2 * dt;
    this.vx = Math.cos(this.wanderAngle) * this.speed * 0.5;
    this.vy = Math.sin(this.wanderAngle) * this.speed * 0.5;
    this.rotation = this.wanderAngle;
  }

  async shoot(angle) {
    const game = (await import('../core/Game.js')).Game.getInstance();
    const { Bullet } = await import('./Bullet.js');
    
    const bullet = new Bullet(this.x, this.y, angle, 300, 1);
    bullet.type = 'enemyBullet';
    game.addEntity(bullet);
  }

  takeDamage(amount) {
    this.health -= amount;
    
    if (this.health <= 0) {
      this.destroy();
      return true;
    }
    
    return false;
  }

  render(ctx) {
    ctx.save();
    ctx.translate(this.x, this.y);
    ctx.rotate(this.rotation);
    
    const healthPercentage = this.health / this.maxHealth;
    ctx.fillStyle = `rgb(${255 * (1 - healthPercentage)}, ${255 * healthPercentage}, 0)`;
    
    ctx.fillRect(-this.width / 2, -this.height / 2, this.width, this.height);
    
    ctx.strokeStyle = '#ff0000';
    ctx.lineWidth = 2;
    ctx.strokeRect(-this.width / 2, -this.height / 2, this.width, this.height);
    
    ctx.restore();
  }
}

export class FastEnemy extends Enemy {
  constructor(x, y) {
    super(x, y);
    this.speed = 180;
    this.health = 1;
    this.scoreValue = 15;
    this.width = 16;
    this.height = 16;
    this.collisionRadius = 8;
    this.dropChance = 0.15;
  }

  render(ctx) {
    ctx.save();
    ctx.translate(this.x, this.y);
    ctx.rotate(this.rotation);
    
    ctx.fillStyle = '#ff00ff';
    ctx.beginPath();
    ctx.moveTo(this.width / 2, 0);
    ctx.lineTo(-this.width / 2, -this.height / 2);
    ctx.lineTo(-this.width / 2, this.height / 2);
    ctx.closePath();
    ctx.fill();
    
    ctx.strokeStyle = '#dd00dd';
    ctx.lineWidth = 2;
    ctx.stroke();
    
    ctx.restore();
  }
}

export class TankEnemy extends Enemy {
  constructor(x, y) {
    super(x, y);
    this.speed = 50;
    this.health = 5;
    this.maxHealth = 5;
    this.damage = 2;
    this.scoreValue = 30;
    this.width = 30;
    this.height = 30;
    this.collisionRadius = 15;
    this.dropChance = 0.25;
  }

  render(ctx) {
    ctx.save();
    ctx.translate(this.x, this.y);
    ctx.rotate(this.rotation);
    
    const healthPercentage = this.health / this.maxHealth;
    ctx.fillStyle = `rgb(${100}, ${100 * healthPercentage}, ${100 * healthPercentage})`;
    
    ctx.fillRect(-this.width / 2, -this.height / 2, this.width, this.height);
    
    ctx.fillStyle = '#444';
    ctx.fillRect(-this.width / 3, -this.height / 3, this.width * 2/3, this.height * 2/3);
    
    ctx.strokeStyle = '#666';
    ctx.lineWidth = 3;
    ctx.strokeRect(-this.width / 2, -this.height / 2, this.width, this.height);
    
    ctx.restore();
  }
}

export class SniperEnemy extends Enemy {
  constructor(x, y) {
    super(x, y);
    this.behaviorType = 'sniper';
    this.speed = 70;
    this.health = 2;
    this.maxHealth = 2;
    this.scoreValue = 25;
    this.shootInterval = 1.5;
    this.width = 24;
    this.height = 18;
    this.collisionRadius = 12;
    this.dropChance = 0.2;
  }

  render(ctx) {
    ctx.save();
    ctx.translate(this.x, this.y);
    ctx.rotate(this.rotation);
    
    ctx.fillStyle = '#0088ff';
    ctx.fillRect(-this.width / 2, -this.height / 2, this.width, this.height);
    
    // Draw gun barrel
    ctx.fillStyle = '#0066cc';
    ctx.fillRect(this.width / 2, -2, 10, 4);
    
    ctx.strokeStyle = '#0066cc';
    ctx.lineWidth = 2;
    ctx.strokeRect(-this.width / 2, -this.height / 2, this.width, this.height);
    
    ctx.restore();
  }
}

export class OrbitEnemy extends Enemy {
  constructor(x, y) {
    super(x, y);
    this.behaviorType = 'orbit';
    this.speed = 120;
    this.health = 2;
    this.maxHealth = 2;
    this.scoreValue = 20;
    this.width = 20;
    this.height = 20;
    this.collisionRadius = 10;
    this.dropChance = 0.15;
  }

  render(ctx) {
    ctx.save();
    ctx.translate(this.x, this.y);
    ctx.rotate(this.rotation + Date.now() * 0.005);
    
    ctx.fillStyle = '#ff8800';
    ctx.beginPath();
    for (let i = 0; i < 6; i++) {
      const angle = (i / 6) * Math.PI * 2;
      const radius = i % 2 === 0 ? this.width / 2 : this.width / 3;
      const x = Math.cos(angle) * radius;
      const y = Math.sin(angle) * radius;
      if (i === 0) {
        ctx.moveTo(x, y);
      } else {
        ctx.lineTo(x, y);
      }
    }
    ctx.closePath();
    ctx.fill();
    
    ctx.strokeStyle = '#cc6600';
    ctx.lineWidth = 2;
    ctx.stroke();
    
    ctx.restore();
  }
}