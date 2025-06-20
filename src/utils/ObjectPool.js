export class ObjectPool {
  constructor(createFunction, resetFunction, initialSize = 10, maxSize = 100) {
    this.createFunction = createFunction;
    this.resetFunction = resetFunction;
    this.maxSize = maxSize;
    this.available = [];
    this.inUse = new Set();
    
    // Pre-populate the pool
    for (let i = 0; i < initialSize; i++) {
      this.available.push(this.createFunction());
    }
  }

  acquire(...args) {
    let obj;
    
    if (this.available.length > 0) {
      obj = this.available.pop();
    } else if (this.inUse.size < this.maxSize) {
      obj = this.createFunction();
    } else {
      console.warn('Object pool has reached maximum size');
      return null;
    }
    
    this.inUse.add(obj);
    
    if (this.resetFunction) {
      this.resetFunction(obj, ...args);
    }
    
    return obj;
  }

  release(obj) {
    if (!this.inUse.has(obj)) {
      console.warn('Attempting to release object not in use');
      return false;
    }
    
    this.inUse.delete(obj);
    
    if (this.available.length < this.maxSize) {
      this.available.push(obj);
      return true;
    }
    
    return false;
  }

  releaseAll() {
    this.inUse.forEach(obj => {
      if (this.available.length < this.maxSize) {
        this.available.push(obj);
      }
    });
    this.inUse.clear();
  }

  getStats() {
    return {
      available: this.available.length,
      inUse: this.inUse.size,
      total: this.available.length + this.inUse.size,
      maxSize: this.maxSize
    };
  }

  clear() {
    this.available = [];
    this.inUse.clear();
  }
}

// Specialized pool managers for common game objects
export class BulletPool extends ObjectPool {
  constructor() {
    super(
      // Create function
      async () => {
        const { Bullet } = await import('../entities/Bullet.js');
        return new Bullet(0, 0, 0, 0, 0);
      },
      // Reset function
      (bullet, x, y, direction, speed, damage) => {
        bullet.x = x;
        bullet.y = y;
        bullet.direction = direction;
        bullet.speed = speed;
        bullet.damage = damage;
        bullet.vx = Math.cos(direction) * speed;
        bullet.vy = Math.sin(direction) * speed;
        bullet.rotation = direction;
        bullet.lifetime = 2;
        bullet.alive = true;
        bullet.trail = [];
      },
      50, // Initial size
      200 // Max size
    );
  }
}

export class ParticlePool extends ObjectPool {
  constructor() {
    super(
      // Create function
      async () => {
        const { Particle } = await import('../effects/ParticleSystem.js');
        return new Particle(0, 0, 0, 0, '#ffffff', 1);
      },
      // Reset function
      (particle, x, y, vx, vy, color, lifetime, size = 2) => {
        particle.x = x;
        particle.y = y;
        particle.vx = vx;
        particle.vy = vy;
        particle.color = color;
        particle.lifetime = lifetime;
        particle.maxLifetime = lifetime;
        particle.size = size;
        particle.rotation = Math.random() * Math.PI * 2;
        particle.rotationSpeed = (Math.random() - 0.5) * 10;
      },
      100, // Initial size
      500 // Max size
    );
  }
}

export class EnemyPool extends ObjectPool {
  constructor(enemyClass) {
    super(
      // Create function
      () => new enemyClass(0, 0),
      // Reset function
      (enemy, x, y) => {
        enemy.x = x;
        enemy.y = y;
        enemy.vx = 0;
        enemy.vy = 0;
        enemy.alive = true;
        enemy.health = enemy.maxHealth;
        enemy.shootCooldown = 0;
        enemy.wanderAngle = Math.random() * Math.PI * 2;
      },
      10, // Initial size
      50 // Max size
    );
  }
}

// Generic pool manager that manages multiple pools
export class PoolManager {
  constructor() {
    this.pools = new Map();
  }

  createPool(name, createFunction, resetFunction, initialSize, maxSize) {
    const pool = new ObjectPool(createFunction, resetFunction, initialSize, maxSize);
    this.pools.set(name, pool);
    return pool;
  }

  getPool(name) {
    return this.pools.get(name);
  }

  acquire(poolName, ...args) {
    const pool = this.pools.get(poolName);
    if (!pool) {
      console.warn(`Pool '${poolName}' not found`);
      return null;
    }
    return pool.acquire(...args);
  }

  release(poolName, obj) {
    const pool = this.pools.get(poolName);
    if (!pool) {
      console.warn(`Pool '${poolName}' not found`);
      return false;
    }
    return pool.release(obj);
  }

  releaseAll(poolName = null) {
    if (poolName) {
      const pool = this.pools.get(poolName);
      if (pool) {
        pool.releaseAll();
      }
    } else {
      this.pools.forEach(pool => pool.releaseAll());
    }
  }

  getStats() {
    const stats = {};
    this.pools.forEach((pool, name) => {
      stats[name] = pool.getStats();
    });
    return stats;
  }

  clear() {
    this.pools.forEach(pool => pool.clear());
    this.pools.clear();
  }
}