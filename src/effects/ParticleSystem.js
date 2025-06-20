export class Particle {
  constructor(x, y, vx, vy, color, lifetime, size = 2) {
    this.x = x;
    this.y = y;
    this.vx = vx;
    this.vy = vy;
    this.color = color;
    this.lifetime = lifetime;
    this.maxLifetime = lifetime;
    this.size = size;
    this.rotation = Math.random() * Math.PI * 2;
    this.rotationSpeed = (Math.random() - 0.5) * 10;
    this.gravity = 0;
    this.friction = 0.98;
    this.fadeOut = true;
    this.scaleOut = true;
  }

  update(dt) {
    this.lifetime -= dt;
    
    this.vx *= this.friction;
    this.vy *= this.friction;
    this.vy += this.gravity * dt;
    
    this.x += this.vx * dt;
    this.y += this.vy * dt;
    this.rotation += this.rotationSpeed * dt;
    
    return this.lifetime > 0;
  }

  render(ctx) {
    ctx.save();
    
    const lifeRatio = this.lifetime / this.maxLifetime;
    const alpha = this.fadeOut ? lifeRatio : 1;
    const scale = this.scaleOut ? 0.5 + lifeRatio * 0.5 : 1;
    
    ctx.globalAlpha = alpha;
    ctx.translate(this.x, this.y);
    ctx.rotate(this.rotation);
    ctx.scale(scale, scale);
    
    ctx.fillStyle = this.color;
    ctx.fillRect(-this.size / 2, -this.size / 2, this.size, this.size);
    
    ctx.restore();
  }
}

export class ParticleSystem {
  constructor() {
    this.particles = [];
    this.maxParticles = 500;
  }

  update(dt) {
    for (let i = this.particles.length - 1; i >= 0; i--) {
      if (!this.particles[i].update(dt)) {
        this.particles.splice(i, 1);
      }
    }
  }

  render(ctx) {
    ctx.save();
    
    // Use additive blending for better visual effects
    ctx.globalCompositeOperation = 'lighter';
    
    this.particles.forEach(particle => {
      particle.render(ctx);
    });
    
    ctx.restore();
  }

  createExplosion(x, y, options = {}) {
    const {
      count = 20,
      speed = 200,
      speedVariance = 100,
      lifetime = 1,
      lifetimeVariance = 0.5,
      colors = ['#ff0000', '#ff8800', '#ffff00'],
      size = 4,
      sizeVariance = 2
    } = options;
    
    for (let i = 0; i < count; i++) {
      const angle = (Math.PI * 2 * i) / count + (Math.random() - 0.5) * 0.5;
      const velocity = speed + (Math.random() - 0.5) * speedVariance;
      const vx = Math.cos(angle) * velocity;
      const vy = Math.sin(angle) * velocity;
      const color = colors[Math.floor(Math.random() * colors.length)];
      const particleLifetime = lifetime + (Math.random() - 0.5) * lifetimeVariance;
      const particleSize = size + (Math.random() - 0.5) * sizeVariance;
      
      const particle = new Particle(x, y, vx, vy, color, particleLifetime, particleSize);
      particle.friction = 0.95;
      particle.gravity = 50;
      
      this.addParticle(particle);
    }
  }

  createHit(x, y, direction, options = {}) {
    const {
      count = 10,
      spread = Math.PI / 4,
      speed = 150,
      lifetime = 0.5,
      color = '#ffff00',
      size = 3
    } = options;
    
    for (let i = 0; i < count; i++) {
      const angle = direction + Math.PI + (Math.random() - 0.5) * spread;
      const velocity = speed * (0.5 + Math.random() * 0.5);
      const vx = Math.cos(angle) * velocity;
      const vy = Math.sin(angle) * velocity;
      const particleLifetime = lifetime * (0.5 + Math.random() * 0.5);
      
      const particle = new Particle(x, y, vx, vy, color, particleLifetime, size);
      particle.friction = 0.9;
      
      this.addParticle(particle);
    }
  }

  createPowerUp(x, y, options = {}) {
    const {
      count = 15,
      speed = 100,
      lifetime = 1.5,
      colors = ['#00ff00', '#00ffff', '#ffffff'],
      size = 3
    } = options;
    
    for (let i = 0; i < count; i++) {
      const angle = (Math.PI * 2 * i) / count;
      const vx = Math.cos(angle) * speed;
      const vy = Math.sin(angle) * speed;
      const color = colors[Math.floor(Math.random() * colors.length)];
      
      const particle = new Particle(x, y, vx, vy, color, lifetime, size);
      particle.friction = 0.92;
      particle.fadeOut = true;
      particle.scaleOut = false;
      
      this.addParticle(particle);
    }
  }

  createTrail(x, y, vx, vy, options = {}) {
    const {
      count = 1,
      spread = 10,
      lifetime = 0.3,
      color = 'rgba(255, 255, 0, 0.5)',
      size = 2
    } = options;
    
    for (let i = 0; i < count; i++) {
      const particleVx = -vx * 0.1 + (Math.random() - 0.5) * spread;
      const particleVy = -vy * 0.1 + (Math.random() - 0.5) * spread;
      
      const particle = new Particle(x, y, particleVx, particleVy, color, lifetime, size);
      particle.fadeOut = true;
      particle.friction = 0.8;
      
      this.addParticle(particle);
    }
  }

  createSpark(x, y, options = {}) {
    const {
      count = 5,
      speed = 300,
      lifetime = 0.3,
      color = '#ffffff',
      size = 2
    } = options;
    
    for (let i = 0; i < count; i++) {
      const angle = Math.random() * Math.PI * 2;
      const velocity = speed * (0.5 + Math.random() * 0.5);
      const vx = Math.cos(angle) * velocity;
      const vy = Math.sin(angle) * velocity;
      
      const particle = new Particle(x, y, vx, vy, color, lifetime, size);
      particle.friction = 0.85;
      particle.gravity = 200;
      
      this.addParticle(particle);
    }
  }

  addParticle(particle) {
    if (this.particles.length < this.maxParticles) {
      this.particles.push(particle);
    }
  }

  clear() {
    this.particles = [];
  }

  getParticleCount() {
    return this.particles.length;
  }
}