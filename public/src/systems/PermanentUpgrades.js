export class PermanentUpgrades {
  constructor() {
    this.upgrades = {
      damage: 0,           // ダメージ倍率
      fireRate: 0,         // 射撃レート倍率
      speed: 0,            // 移動速度倍率
      health: 0,           // 追加HP
      multiShot: 0,        // 追加弾数
      piercing: 0,         // 貫通レベル
      explosive: 0,        // 爆発レベル
      lifesteal: 0         // ライフスティールレベル
    };
  }

  applyUpgrade(upgrade) {
    if (!upgrade || !upgrade.effect) return;

    const { type, value } = upgrade.effect;
    
    if (this.upgrades.hasOwnProperty(type)) {
      this.upgrades[type] += value;
      return true;
    }
    
    return false;
  }

  // Player用のステータス計算
  getPlayerStats(baseStats) {
    return {
      damage: baseStats.damage * (1 + this.upgrades.damage),
      fireRate: baseStats.fireRate * (1 + this.upgrades.fireRate),
      speed: baseStats.speed * (1 + this.upgrades.speed),
      maxHealth: baseStats.maxHealth + this.upgrades.health,
      multiShot: 1 + this.upgrades.multiShot,
      piercing: this.upgrades.piercing > 0,
      explosive: this.upgrades.explosive > 0,
      lifesteal: this.upgrades.lifesteal > 0
    };
  }

  // 弾丸用のステータス計算
  getBulletStats(baseBullet) {
    const stats = { ...baseBullet };
    
    // ダメージ倍率適用
    stats.damage *= (1 + this.upgrades.damage);
    
    // 貫通効果
    if (this.upgrades.piercing > 0) {
      stats.piercing = true;
      stats.piercingCount = this.upgrades.piercing;
    }
    
    // 爆発効果
    if (this.upgrades.explosive > 0) {
      stats.explosive = true;
      stats.explosionRadius = 30 + (this.upgrades.explosive * 10);
      stats.explosionDamage = stats.damage * 0.5;
    }
    
    return stats;
  }

  // マルチショット用の角度計算
  getMultiShotAngles(baseAngle) {
    const shotCount = 1 + this.upgrades.multiShot;
    const angles = [];
    
    if (shotCount === 1) {
      angles.push(baseAngle);
    } else {
      const spreadAngle = Math.PI / 8; // 22.5度の拡散
      const angleStep = (spreadAngle * 2) / (shotCount - 1);
      
      for (let i = 0; i < shotCount; i++) {
        const offset = -spreadAngle + (angleStep * i);
        angles.push(baseAngle + offset);
      }
    }
    
    return angles;
  }

  // ライフスティール処理
  processLifesteal(player, damage) {
    if (this.upgrades.lifesteal > 0) {
      const healAmount = Math.max(1, Math.floor(damage * 0.1 * this.upgrades.lifesteal));
      player.heal(healAmount);
      return healAmount;
    }
    return 0;
  }

  // 爆発ダメージ処理
  createExplosion(x, y, entities, particleSystem) {
    if (this.upgrades.explosive <= 0) return [];

    const explosionRadius = 30 + (this.upgrades.explosive * 10);
    const explosionDamage = this.upgrades.explosive * 20;
    const hitEntities = [];

    entities.forEach(entity => {
      if (entity.type === 'enemy' && entity.alive) {
        const distance = Math.sqrt(
          Math.pow(entity.x - x, 2) + Math.pow(entity.y - y, 2)
        );
        
        if (distance <= explosionRadius) {
          const destroyed = entity.takeDamage(explosionDamage);
          hitEntities.push({ entity, destroyed });
        }
      }
    });

    // パーティクル効果
    if (particleSystem) {
      particleSystem.createExplosion(x, y);
    }

    return hitEntities;
  }

  // アップグレード情報取得
  getUpgradeLevel(type) {
    return this.upgrades[type] || 0;
  }

  // 全アップグレード情報取得
  getAllUpgrades() {
    return { ...this.upgrades };
  }

  // リセット
  reset() {
    Object.keys(this.upgrades).forEach(key => {
      this.upgrades[key] = 0;
    });
  }

  // デバッグ用表示テキスト
  getDebugText() {
    const active = Object.entries(this.upgrades)
      .filter(([key, value]) => value > 0)
      .map(([key, value]) => `${key}:${value}`)
      .join(' ');
    
    return active || 'No upgrades';
  }
}