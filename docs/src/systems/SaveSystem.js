export class SaveSystem {
  constructor() {
    this.storageKey = 'spaceSurvivorSave';
    this.defaultData = {
      highScore: 0,
      totalPlayTime: 0,
      gamesPlayed: 0,
      enemiesKilled: 0,
      powerUpsCollected: 0,
      settings: {
        soundVolume: 0.5,
        musicVolume: 0.3,
        masterVolume: 1,
        muted: false
      },
      achievements: [],
      statistics: {
        totalScore: 0,
        longestSurvivalTime: 0,
        highestWave: 0,
        favoriteWeapon: 'normal',
        weaponUsage: {
          normal: 0,
          spread: 0,
          power: 0,
          rapid: 0,
          laser: 0
        }
      }
    };
    
    this.currentData = this.load();
  }

  save(additionalData = {}) {
    try {
      const dataToSave = {
        ...this.currentData,
        ...additionalData,
        lastSaved: new Date().toISOString()
      };
      
      localStorage.setItem(this.storageKey, JSON.stringify(dataToSave));
      this.currentData = dataToSave;
      return true;
    } catch (error) {
      console.error('Failed to save game data:', error);
      return false;
    }
  }

  load() {
    try {
      const savedData = localStorage.getItem(this.storageKey);
      if (savedData) {
        const parsedData = JSON.parse(savedData);
        // Merge with default data to ensure all fields exist
        return this.mergeWithDefaults(parsedData);
      }
    } catch (error) {
      console.error('Failed to load game data:', error);
    }
    
    return { ...this.defaultData };
  }

  mergeWithDefaults(savedData) {
    const merged = { ...this.defaultData };
    
    // Deep merge to preserve nested objects
    const deepMerge = (target, source) => {
      for (const key in source) {
        if (source[key] && typeof source[key] === 'object' && !Array.isArray(source[key])) {
          target[key] = target[key] || {};
          deepMerge(target[key], source[key]);
        } else {
          target[key] = source[key];
        }
      }
    };
    
    deepMerge(merged, savedData);
    return merged;
  }

  updateHighScore(score) {
    if (score > this.currentData.highScore) {
      this.currentData.highScore = score;
      this.save();
      return true;
    }
    return false;
  }

  updateStatistics(stats) {
    const statistics = this.currentData.statistics;
    
    if (stats.score) {
      statistics.totalScore += stats.score;
    }
    
    if (stats.survivalTime && stats.survivalTime > statistics.longestSurvivalTime) {
      statistics.longestSurvivalTime = stats.survivalTime;
    }
    
    if (stats.wave && stats.wave > statistics.highestWave) {
      statistics.highestWave = stats.wave;
    }
    
    if (stats.weaponUsed) {
      statistics.weaponUsage[stats.weaponUsed] = 
        (statistics.weaponUsage[stats.weaponUsed] || 0) + 1;
      
      // Update favorite weapon
      let maxUsage = 0;
      let favoriteWeapon = 'normal';
      for (const [weapon, usage] of Object.entries(statistics.weaponUsage)) {
        if (usage > maxUsage) {
          maxUsage = usage;
          favoriteWeapon = weapon;
        }
      }
      statistics.favoriteWeapon = favoriteWeapon;
    }
    
    this.save();
  }

  saveSettings(settings) {
    this.currentData.settings = {
      ...this.currentData.settings,
      ...settings
    };
    this.save();
  }

  getSettings() {
    return { ...this.currentData.settings };
  }

  unlockAchievement(achievementId) {
    if (!this.currentData.achievements.includes(achievementId)) {
      this.currentData.achievements.push(achievementId);
      this.save();
      return true;
    }
    return false;
  }

  getAchievements() {
    return [...this.currentData.achievements];
  }

  reset() {
    this.currentData = { ...this.defaultData };
    this.save();
  }

  resetProgress() {
    // Reset game progress but keep settings
    const settings = { ...this.currentData.settings };
    this.currentData = { ...this.defaultData, settings };
    this.save();
  }

  exportSave() {
    return btoa(JSON.stringify(this.currentData));
  }

  importSave(encodedData) {
    try {
      const decodedData = JSON.parse(atob(encodedData));
      this.currentData = this.mergeWithDefaults(decodedData);
      this.save();
      return true;
    } catch (error) {
      console.error('Failed to import save data:', error);
      return false;
    }
  }

  getSaveData() {
    return { ...this.currentData };
  }
}