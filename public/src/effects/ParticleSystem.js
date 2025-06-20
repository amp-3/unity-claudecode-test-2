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
    this.shape = 'square'; // 'square', 'circle', 'confetti'
    this.width = size;
    this.height = size;
    
    // フェードアウト効果用
    this.isFading = false;
    this.fadeStartTime = 0;
    this.fadeDuration = 0;
    this.originalLifetime = lifetime;
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
    let alpha = this.fadeOut ? lifeRatio : 1;
    
    // フェードアウト効果の適用
    if (this.isFading && this.fadeDuration > 0) {
      const fadeProgress = Math.min(1, (this.maxLifetime - this.lifetime - this.fadeStartTime) / this.fadeDuration);
      alpha *= (1 - fadeProgress);
    }
    
    const scale = this.scaleOut ? 0.5 + lifeRatio * 0.5 : 1;
    
    ctx.globalAlpha = alpha;
    ctx.translate(this.x, this.y);
    ctx.rotate(this.rotation);
    ctx.scale(scale, scale);
    
    ctx.fillStyle = this.color;
    
    switch (this.shape) {
      case 'circle':
        ctx.beginPath();
        ctx.arc(0, 0, this.size / 2, 0, Math.PI * 2);
        ctx.fill();
        break;
      case 'confetti':
        // 紙吹雪風の長方形
        ctx.fillRect(-this.width / 2, -this.height / 2, this.width, this.height);
        break;
      default: // 'square'
        ctx.fillRect(-this.size / 2, -this.size / 2, this.size, this.size);
        break;
    }
    
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

  createLevelUpCelebration(canvasWidth, canvasHeight, options = {}) {
    const {
      count = 80,
      colors = [
        '#ff1744', '#e91e63', '#9c27b0', '#673ab7',
        '#3f51b5', '#2196f3', '#03a9f4', '#00bcd4',
        '#009688', '#4caf50', '#8bc34a', '#cddc39',
        '#ffeb3b', '#ffc107', '#ff9800', '#ff5722'
      ]
    } = options;

    // 画面上部からクラッカーを撃ち出す
    const shootPoints = [
      { x: canvasWidth * 0.1, y: canvasHeight * 0.1 },
      { x: canvasWidth * 0.3, y: canvasHeight * 0.05 },
      { x: canvasWidth * 0.7, y: canvasHeight * 0.05 },
      { x: canvasWidth * 0.9, y: canvasHeight * 0.1 }
    ];

    shootPoints.forEach(point => {
      for (let i = 0; i < count / 4; i++) {
        // 角度を下向きに集中させる
        const angle = Math.PI / 2 + (Math.random() - 0.5) * Math.PI / 3;
        const speed = 200 + Math.random() * 300;
        const vx = Math.cos(angle) * speed;
        const vy = Math.sin(angle) * speed;
        
        const color = colors[Math.floor(Math.random() * colors.length)];
        const lifetime = 2 + Math.random() * 2;
        
        const particle = new Particle(point.x, point.y, vx, vy, color, lifetime);
        
        // 紙吹雪の形状設定
        particle.shape = 'confetti';
        particle.width = 3 + Math.random() * 4;
        particle.height = 8 + Math.random() * 6;
        particle.rotationSpeed = (Math.random() - 0.5) * 15;
        particle.gravity = 150 + Math.random() * 100;
        particle.friction = 0.98;
        particle.fadeOut = true;
        particle.scaleOut = false;
        
        this.addParticle(particle);
      }
    });

    // 中央からの爆発的な効果も追加
    const centerX = canvasWidth / 2;
    const centerY = canvasHeight / 2;
    
    for (let i = 0; i < 40; i++) {
      const angle = (Math.PI * 2 * i) / 40 + (Math.random() - 0.5) * 0.3;
      const speed = 150 + Math.random() * 200;
      const vx = Math.cos(angle) * speed;
      const vy = Math.sin(angle) * speed;
      
      const color = colors[Math.floor(Math.random() * colors.length)];
      const lifetime = 1.5 + Math.random() * 1.5;
      
      const particle = new Particle(centerX, centerY, vx, vy, color, lifetime);
      particle.shape = Math.random() > 0.7 ? 'circle' : 'confetti';
      
      if (particle.shape === 'confetti') {
        particle.width = 2 + Math.random() * 3;
        particle.height = 6 + Math.random() * 4;
      }
      
      particle.rotationSpeed = (Math.random() - 0.5) * 12;
      particle.gravity = 100 + Math.random() * 50;
      particle.friction = 0.97;
      particle.fadeOut = true;
      particle.scaleOut = false;
      
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

  createPetalAnimation(canvasWidth, canvasHeight, options = {}) {
    const {
      count = 2,
      colors = ['#ff69b4', '#ffb6c1', '#ffc0cb', '#ffdbec', '#fff0f5'],
      minSpeed = 20,
      maxSpeed = 50
    } = options;
    
    // ランダムな位置から花びらを生成
    for (let i = 0; i < count; i++) {
      const x = Math.random() * canvasWidth;
      const y = -20; // 画面上部から開始
      
      // ゆらゆらと落ちる動き
      const baseVx = (Math.random() - 0.5) * 30;
      const vy = minSpeed + Math.random() * (maxSpeed - minSpeed);
      
      const color = colors[Math.floor(Math.random() * colors.length)];
      const lifetime = (canvasHeight + 40) / vy; // 画面下まで落ちる時間
      
      const particle = new Particle(x, y, baseVx, vy, color, lifetime);
      
      // 花びらの形状設定
      particle.shape = 'confetti';
      particle.width = 8 + Math.random() * 6;
      particle.height = 10 + Math.random() * 8;
      particle.rotationSpeed = (Math.random() - 0.5) * 5;
      particle.gravity = 0; // 重力は速度で制御
      particle.friction = 1; // 摩擦なし
      particle.fadeOut = false; // フェードアウトしない
      particle.scaleOut = false; // スケールアウトしない
      
      // 横揺れのためのプロパティ追加
      particle.swayAmplitude = 20 + Math.random() * 30;
      particle.swayFrequency = 0.5 + Math.random() * 1;
      particle.initialX = x;
      particle.timeAlive = 0;
      
      this.addParticle(particle);
    }
  }
  
  updatePetals(dt) {
    // 花びら専用の更新処理
    this.particles.forEach(particle => {
      if (particle.shape === 'confetti' && particle.swayAmplitude !== undefined) {
        particle.timeAlive = (particle.timeAlive || 0) + dt;
        // 横揺れ動作
        const swayOffset = Math.sin(particle.timeAlive * particle.swayFrequency * Math.PI * 2) * particle.swayAmplitude;
        particle.x = particle.initialX + swayOffset;
      }
    });
  }
  
  fadeOutAll(duration = 0.2) {
    this.particles.forEach(particle => {
      if (!particle.isFading) {
        particle.isFading = true;
        particle.fadeStartTime = particle.maxLifetime - particle.lifetime;
        particle.fadeDuration = duration;
        // フェードアウト期間だけライフタイムを延長
        particle.lifetime = Math.max(particle.lifetime, duration);
      }
    });
  }
}