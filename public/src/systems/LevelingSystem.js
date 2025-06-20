export class LevelingSystem {
  constructor() {
    this.experience = 0;
    this.level = 1;
    this.availableUpgrades = [];
    this.selectedUpgrade = null;
    
    // レベルアップに必要な経験値のベーステーブル
    this.expTable = this.generateExpTable();
  }

  generateExpTable() {
    const table = [];
    let baseExp = 100;
    
    for (let level = 1; level <= 100; level++) {
      table.push(baseExp);
      baseExp = Math.floor(baseExp * 1.4); // 指数関数的増加
    }
    
    return table;
  }

  addExperience(amount) {
    this.experience += amount;
    return this.checkLevelUp();
  }

  checkLevelUp() {
    const requiredExp = this.getRequiredExpForLevel(this.level + 1);
    
    if (this.experience >= requiredExp && this.level < 100) {
      this.level++;
      this.generateUpgradeChoices();
      return true;
    }
    
    return false;
  }

  getRequiredExpForLevel(level) {
    if (level <= 1) return 0;
    return this.expTable[level - 2] || this.expTable[this.expTable.length - 1];
  }

  getCurrentLevelProgress() {
    const currentLevelExp = this.getRequiredExpForLevel(this.level);
    const nextLevelExp = this.getRequiredExpForLevel(this.level + 1);
    const progressExp = this.experience - currentLevelExp;
    const totalNeeded = nextLevelExp - currentLevelExp;
    
    return {
      current: progressExp,
      total: totalNeeded,
      percentage: Math.min(1, progressExp / totalNeeded)
    };
  }

  generateUpgradeChoices() {
    const allUpgrades = [
      {
        id: 'damage',
        name: '攻撃力UP',
        description: 'ダメージが25%増加',
        icon: '⚔️',
        effect: { type: 'damage', value: 0.25 }
      },
      {
        id: 'fireRate',
        name: '攻撃速度UP', 
        description: '射撃レートが20%向上',
        icon: '🔥',
        effect: { type: 'fireRate', value: 0.20 }
      },
      {
        id: 'speed',
        name: '移動速度UP',
        description: '移動速度が15%向上',
        icon: '💨',
        effect: { type: 'speed', value: 0.15 }
      },
      {
        id: 'health',
        name: '体力UP',
        description: '最大HPが1増加',
        icon: '❤️',
        effect: { type: 'health', value: 1 }
      },
      {
        id: 'multiShot',
        name: '弾数増加',
        description: '同時発射弾数が1増加',
        icon: '🔫',
        effect: { type: 'multiShot', value: 1 }
      },
      {
        id: 'piercing',
        name: '貫通力',
        description: '弾が敵を貫通する',
        icon: '🎯',
        effect: { type: 'piercing', value: 1 }
      },
      {
        id: 'explosive',
        name: '範囲攻撃',
        description: '爆発範囲ダメージ',
        icon: '💥',
        effect: { type: 'explosive', value: 1 }
      },
      {
        id: 'lifesteal',
        name: 'ライフスティール',
        description: '敵撃破時HP回復',
        icon: '🩸',
        effect: { type: 'lifesteal', value: 1 }
      }
    ];

    // ランダムに3つ選択
    const shuffled = [...allUpgrades].sort(() => Math.random() - 0.5);
    this.availableUpgrades = shuffled.slice(0, 3);
  }

  selectUpgrade(upgradeIndex) {
    if (upgradeIndex >= 0 && upgradeIndex < this.availableUpgrades.length) {
      this.selectedUpgrade = this.availableUpgrades[upgradeIndex];
      this.availableUpgrades = [];
      return this.selectedUpgrade;
    }
    return null;
  }

  getLevel() {
    return this.level;
  }

  getExperience() {
    return this.experience;
  }

  getAvailableUpgrades() {
    return this.availableUpgrades;
  }

  hasAvailableUpgrades() {
    return this.availableUpgrades.length > 0;
  }

  reset() {
    this.experience = 0;
    this.level = 1;
    this.availableUpgrades = [];
    this.selectedUpgrade = null;
  }

  // セーブ用データ取得
  getSaveData() {
    return {
      maxLevel: this.level
    };
  }
}