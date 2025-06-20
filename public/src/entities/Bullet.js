import { Entity } from '../core/Entity.js';

export class Bullet extends Entity {
  constructor(x, y, direction, speed = 500, damage = 1) {
    super(x, y);
    this.type = 'bullet';
    this.direction = direction;
    this.speed = speed;
    this.damage = damage;
    this.lifetime = 2;
    this.piercing = false;
    this.trail = [];
    this.maxTrailLength = 5;
    
    this.width = 8;
    this.height = 4;
    this.collisionRadius = 4;
    
    this.vx = Math.cos(direction) * speed;
    this.vy = Math.sin(direction) * speed;
    this.rotation = direction;
  }

  update(dt) {
    super.update(dt);
    
    this.lifetime -= dt;
    if (this.lifetime <= 0) {
      this.destroy();
    }
    
    // Update trail
    this.trail.push({ x: this.x, y: this.y });
    if (this.trail.length > this.maxTrailLength) {
      this.trail.shift();
    }
    
    // Check boundaries
    const centerX = 400;
    const centerY = 300;
    const boundaryRadius = 300;
    const distance = Math.sqrt(Math.pow(this.x - centerX, 2) + Math.pow(this.y - centerY, 2));
    
    if (distance > boundaryRadius) {
      this.destroy();
    }
  }

  render(ctx) {
    ctx.save();
    
    // Draw trail
    if (this.trail.length > 1) {
      ctx.strokeStyle = 'rgba(255, 255, 0, 0.3)';
      ctx.lineWidth = 2;
      ctx.beginPath();
      this.trail.forEach((point, index) => {
        if (index === 0) {
          ctx.moveTo(point.x, point.y);
        } else {
          ctx.lineTo(point.x, point.y);
        }
      });
      ctx.stroke();
    }
    
    // Draw bullet
    ctx.translate(this.x, this.y);
    ctx.rotate(this.rotation);
    
    ctx.fillStyle = '#ffff00';
    ctx.fillRect(-this.width / 2, -this.height / 2, this.width, this.height);
    
    // Add glow effect
    ctx.shadowBlur = 10;
    ctx.shadowColor = '#ffff00';
    ctx.fillRect(-this.width / 2, -this.height / 2, this.width, this.height);
    
    ctx.restore();
  }
}

export class SpreadBullet extends Bullet {
  constructor(x, y, direction, spread, speed = 400, damage = 0.75) {
    super(x, y, direction + spread, speed, damage);
    this.width = 6;
    this.height = 3;
    this.collisionRadius = 3;
  }
}

export class PowerBullet extends Bullet {
  constructor(x, y, direction, speed = 350, damage = 3) {
    super(x, y, direction, speed, damage);
    this.width = 12;
    this.height = 8;
    this.collisionRadius = 6;
    this.piercing = true;
    this.trail = [];
    this.maxTrailLength = 8;
  }

  render(ctx) {
    ctx.save();
    
    // Draw enhanced trail
    if (this.trail.length > 1) {
      ctx.strokeStyle = 'rgba(255, 128, 0, 0.5)';
      ctx.lineWidth = 4;
      ctx.beginPath();
      this.trail.forEach((point, index) => {
        if (index === 0) {
          ctx.moveTo(point.x, point.y);
        } else {
          ctx.lineTo(point.x, point.y);
        }
      });
      ctx.stroke();
    }
    
    ctx.translate(this.x, this.y);
    ctx.rotate(this.rotation);
    
    ctx.fillStyle = '#ff8800';
    ctx.fillRect(-this.width / 2, -this.height / 2, this.width, this.height);
    
    ctx.shadowBlur = 15;
    ctx.shadowColor = '#ff8800';
    ctx.fillRect(-this.width / 2, -this.height / 2, this.width, this.height);
    
    ctx.restore();
  }
}

export class LaserBullet extends Bullet {
  constructor(x, y, direction, speed = 800, damage = 0.5) {
    super(x, y, direction, speed, damage);
    this.width = 20;
    this.height = 2;
    this.collisionRadius = 4;
    this.lifetime = 0.5;
    this.trail = [];
    this.maxTrailLength = 10;
  }

  render(ctx) {
    ctx.save();
    
    // Draw laser beam trail
    if (this.trail.length > 1) {
      const gradient = ctx.createLinearGradient(
        this.trail[0].x, this.trail[0].y,
        this.x, this.y
      );
      gradient.addColorStop(0, 'rgba(0, 255, 255, 0)');
      gradient.addColorStop(1, 'rgba(0, 255, 255, 0.8)');
      
      ctx.strokeStyle = gradient;
      ctx.lineWidth = 3;
      ctx.beginPath();
      this.trail.forEach((point, index) => {
        if (index === 0) {
          ctx.moveTo(point.x, point.y);
        } else {
          ctx.lineTo(point.x, point.y);
        }
      });
      ctx.stroke();
    }
    
    ctx.translate(this.x, this.y);
    ctx.rotate(this.rotation);
    
    ctx.fillStyle = '#00ffff';
    ctx.fillRect(-this.width / 2, -this.height / 2, this.width, this.height);
    
    ctx.shadowBlur = 20;
    ctx.shadowColor = '#00ffff';
    ctx.fillRect(-this.width / 2, -this.height / 2, this.width, this.height);
    
    ctx.restore();
  }
}