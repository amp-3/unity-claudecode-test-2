import { Entity } from '../core/Entity.js';

export class PowerUp extends Entity {
  constructor(x, y, type = 'health') {
    super(x, y);
    this.type = 'powerup';
    this.powerUpType = type;
    this.lifetime = 10;
    this.bobAmount = 10;
    this.bobSpeed = 2;
    this.baseY = y;
    this.rotationSpeed = 2;
    this.collected = false;
    this.magnetRange = 100;
    this.magnetSpeed = 300;
    
    this.width = 24;
    this.height = 24;
    this.collisionRadius = 12;
    
    this.setupPowerUpProperties();
  }

  setupPowerUpProperties() {
    const powerUpConfigs = {
      health: {
        color: '#00ff00',
        icon: 'cross',
        effect: (player) => {
          player.heal(1);
        },
        description: 'Restore 1 health'
      },
      speed: {
        color: '#00ffff',
        icon: 'arrow',
        effect: (player) => {
          player.applySpeedBoost(1.5, 5);
        },
        description: 'Speed boost for 5 seconds'
      },
      fireRate: {
        color: '#ff00ff',
        icon: 'bullets',
        effect: (player) => {
          player.applyFireRateBoost(2, 5);
        },
        description: 'Fire rate boost for 5 seconds'
      },
      weaponSpread: {
        color: '#ffff00',
        icon: 'spread',
        effect: async (player) => {
          const game = (await import('../core/Game.js')).Game.getInstance();
          game.weaponSystem.setWeapon('spread', 10);
        },
        description: 'Spread weapon for 10 seconds'
      },
      weaponPower: {
        color: '#ff8800',
        icon: 'power',
        effect: async (player) => {
          const game = (await import('../core/Game.js')).Game.getInstance();
          game.weaponSystem.setWeapon('power', 10);
        },
        description: 'Power weapon for 10 seconds'
      },
      weaponRapid: {
        color: '#ff0088',
        icon: 'rapid',
        effect: async (player) => {
          const game = (await import('../core/Game.js')).Game.getInstance();
          game.weaponSystem.setWeapon('rapid', 10);
        },
        description: 'Rapid weapon for 10 seconds'
      },
      weaponLaser: {
        color: '#00ffff',
        icon: 'laser',
        effect: async (player) => {
          const game = (await import('../core/Game.js')).Game.getInstance();
          game.weaponSystem.setWeapon('laser', 10);
        },
        description: 'Laser weapon for 10 seconds'
      },
      shield: {
        color: '#8888ff',
        icon: 'shield',
        effect: (player) => {
          player.invulnerableTime = 3;
        },
        description: 'Shield for 3 seconds'
      }
    };
    
    const config = powerUpConfigs[this.powerUpType] || powerUpConfigs.health;
    this.color = config.color;
    this.icon = config.icon;
    this.effect = config.effect;
    this.description = config.description;
  }

  update(dt, player) {
    super.update(dt);
    
    this.lifetime -= dt;
    if (this.lifetime <= 0) {
      this.destroy();
      return;
    }
    
    // Bobbing animation
    this.y = this.baseY + Math.sin(Date.now() * 0.001 * this.bobSpeed) * this.bobAmount;
    
    // Rotation
    this.rotation += this.rotationSpeed * dt;
    
    // Magnetic attraction to player
    if (player && player.alive) {
      const distance = this.distanceTo(player);
      if (distance < this.magnetRange) {
        const angle = this.angleTo(player);
        const attractionStrength = (1 - distance / this.magnetRange) * this.magnetSpeed;
        this.vx = Math.cos(angle) * attractionStrength;
        this.vy = Math.sin(angle) * attractionStrength;
      } else {
        this.vx *= 0.9;
        this.vy *= 0.9;
      }
    }
    
    // Fade out when about to expire
    if (this.lifetime < 2) {
      this.opacity = this.lifetime / 2;
    }
  }

  applyTo(player) {
    if (this.collected) return;
    
    this.collected = true;
    this.effect(player);
    
    // Show notification and update statistics
    import('../core/Game.js').then(module => {
      const game = module.Game.getInstance();
      if (game.uiManager) {
        game.uiManager.addNotification(this.description);
      }
      
      // Update statistics
      if (game.saveSystem) {
        const saveData = game.saveSystem.getSaveData();
        saveData.powerUpsCollected = (saveData.powerUpsCollected || 0) + 1;
        game.saveSystem.save(saveData);
      }
    });
  }

  render(ctx) {
    ctx.save();
    
    ctx.translate(this.x, this.y);
    ctx.rotate(this.rotation);
    
    // Apply opacity if fading
    if (this.opacity !== undefined) {
      ctx.globalAlpha = this.opacity;
    }
    
    // Outer glow
    ctx.shadowBlur = 20;
    ctx.shadowColor = this.color;
    
    // Background circle
    ctx.fillStyle = 'rgba(0, 0, 0, 0.5)';
    ctx.beginPath();
    ctx.arc(0, 0, this.width / 2, 0, Math.PI * 2);
    ctx.fill();
    
    // Border
    ctx.strokeStyle = this.color;
    ctx.lineWidth = 2;
    ctx.stroke();
    
    // Draw icon based on type
    ctx.fillStyle = this.color;
    ctx.strokeStyle = this.color;
    ctx.lineWidth = 2;
    
    switch (this.icon) {
      case 'cross':
        this.drawCross(ctx);
        break;
      case 'arrow':
        this.drawArrow(ctx);
        break;
      case 'bullets':
        this.drawBullets(ctx);
        break;
      case 'spread':
        this.drawSpread(ctx);
        break;
      case 'power':
        this.drawPower(ctx);
        break;
      case 'rapid':
        this.drawRapid(ctx);
        break;
      case 'laser':
        this.drawLaser(ctx);
        break;
      case 'shield':
        this.drawShield(ctx);
        break;
    }
    
    ctx.restore();
  }

  drawCross(ctx) {
    const size = 8;
    ctx.fillRect(-2, -size, 4, size * 2);
    ctx.fillRect(-size, -2, size * 2, 4);
  }

  drawArrow(ctx) {
    ctx.beginPath();
    ctx.moveTo(8, 0);
    ctx.lineTo(-4, -6);
    ctx.lineTo(-4, -2);
    ctx.lineTo(-8, -2);
    ctx.lineTo(-8, 2);
    ctx.lineTo(-4, 2);
    ctx.lineTo(-4, 6);
    ctx.closePath();
    ctx.fill();
  }

  drawBullets(ctx) {
    for (let i = 0; i < 3; i++) {
      const y = (i - 1) * 6;
      ctx.fillRect(-6, y - 1, 12, 2);
    }
  }

  drawSpread(ctx) {
    ctx.save();
    for (let i = -1; i <= 1; i++) {
      ctx.save();
      ctx.rotate(i * 0.3);
      ctx.fillRect(0, -1, 10, 2);
      ctx.restore();
    }
    ctx.restore();
  }

  drawPower(ctx) {
    ctx.beginPath();
    ctx.arc(0, 0, 6, 0, Math.PI * 2);
    ctx.fill();
    ctx.beginPath();
    ctx.arc(0, 0, 3, 0, Math.PI * 2);
    ctx.fillStyle = 'rgba(0, 0, 0, 0.5)';
    ctx.fill();
  }

  drawRapid(ctx) {
    for (let i = 0; i < 4; i++) {
      const x = i * 4 - 6;
      ctx.fillRect(x, -1, 2, 2);
    }
  }

  drawLaser(ctx) {
    ctx.fillRect(-10, -1, 20, 2);
    ctx.fillRect(-12, -2, 24, 1);
    ctx.fillRect(-12, 1, 24, 1);
  }

  drawShield(ctx) {
    ctx.beginPath();
    ctx.moveTo(0, -8);
    ctx.lineTo(-6, -4);
    ctx.lineTo(-6, 2);
    ctx.lineTo(0, 8);
    ctx.lineTo(6, 2);
    ctx.lineTo(6, -4);
    ctx.closePath();
    ctx.stroke();
  }
}