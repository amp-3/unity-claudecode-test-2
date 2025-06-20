export class UIManager {
  constructor(canvas) {
    this.canvas = canvas;
    this.ctx = canvas.getContext('2d');
    this.fadeAlpha = 0;
    this.fadeDirection = 0;
    this.notifications = [];
    this.notificationDuration = 3;
  }

  render(game) {
    switch (game.gameState) {
      case 'MENU':
        this.renderMenu(game);
        break;
      case 'PLAYING':
        this.renderHUD(game);
        break;
      case 'PAUSED':
        this.renderHUD(game);
        this.renderPauseMenu(game);
        break;
      case 'LEVEL_UP':
        this.renderHUD(game);
        this.renderLevelUpMenu(game);
        break;
      case 'GAME_OVER':
        this.renderGameOver(game);
        break;
    }
    
    this.renderNotifications();
  }

  renderMenu(game) {
    const ctx = this.ctx;
    const centerX = this.canvas.width / 2;
    const centerY = this.canvas.height / 2;
    
    // Title
    ctx.save();
    ctx.font = 'bold 48px Arial';
    ctx.fillStyle = '#ffffff';
    ctx.textAlign = 'center';
    ctx.textBaseline = 'middle';
    ctx.shadowBlur = 10;
    ctx.shadowColor = '#00ff00';
    ctx.fillText('SPACE SURVIVOR', centerX, centerY - 100);
    
    // Subtitle
    ctx.font = '24px Arial';
    ctx.fillStyle = '#aaaaaa';
    ctx.shadowBlur = 5;
    ctx.fillText('A Unity-Inspired Game', centerX, centerY - 50);
    
    // Play button
    const buttonWidth = 200;
    const buttonHeight = 50;
    const buttonX = centerX - buttonWidth / 2;
    const buttonY = centerY;
    
    ctx.fillStyle = 'rgba(0, 255, 0, 0.2)';
    ctx.fillRect(buttonX, buttonY, buttonWidth, buttonHeight);
    
    ctx.strokeStyle = '#00ff00';
    ctx.lineWidth = 2;
    ctx.strokeRect(buttonX, buttonY, buttonWidth, buttonHeight);
    
    ctx.font = '24px Arial';
    ctx.fillStyle = '#ffffff';
    ctx.fillText('PLAY', centerX, buttonY + buttonHeight / 2);
    
    // Instructions
    ctx.font = '16px Arial';
    ctx.fillStyle = '#888888';
    ctx.fillText('Use WASD to move, Mouse to aim and shoot', centerX, centerY + 100);
    ctx.fillText('Press ESC to pause', centerX, centerY + 130);
    
    // High score
    if (game.highScore > 0) {
      ctx.font = '20px Arial';
      ctx.fillStyle = '#ffff00';
      ctx.fillText(`High Score: ${game.highScore}`, centerX, centerY + 180);
    }
    
    ctx.restore();
  }

  renderHUD(game) {
    const ctx = this.ctx;
    const player = game.player;
    
    if (!player) return;
    
    ctx.save();
    
    // Score
    ctx.font = 'bold 24px Arial';
    ctx.fillStyle = '#ffffff';
    ctx.textAlign = 'left';
    ctx.textBaseline = 'top';
    ctx.fillText(`Score: ${game.score}`, 20, 20);
    
    // Wave info - 左側に配置、適切なサイズで
    ctx.font = '18px Arial';
    ctx.fillStyle = '#ffffff';
    const maxLeftWidth = Math.min(200, this.canvas.width / 2 - 40);
    const waveText = `Wave: ${game.spawnSystem.getCurrentWave()}`;
    ctx.fillText(waveText, 20, 50);
    
    if (game.spawnSystem.isInBetweenWaves()) {
      ctx.fillStyle = '#ffff00';
      ctx.fillText('Wave Complete!', 20, 75);
    } else {
      ctx.fillStyle = '#ffffff';
      const enemiesText = `Enemies: ${game.spawnSystem.getEnemiesRemaining()}`;
      ctx.fillText(enemiesText, 20, 75);
    }
    
    // Health
    this.renderHealthBar(20, 110, player.health, player.maxHealth);
    
    // Experience Bar and Level
    if (game.levelingSystem) {
      this.renderExperienceBar(game);
      this.renderLevel(game);
    }
    
    // Weapon info - 左側、適切な幅で
    const weapon = game.weaponSystem.getCurrentWeapon();
    ctx.font = '16px Arial';
    ctx.fillStyle = '#ffffff';
    
    // 武器名の表示幅制限
    const maxWeaponTextWidth = Math.min(180, this.canvas.width / 2 - 40);
    const weaponText = `Weapon: ${weapon.name}`;
    
    // テキスト幅を測定
    const textWidth = ctx.measureText(weaponText).width;
    
    if (textWidth > maxWeaponTextWidth) {
      // 長すぎる場合は武器名を短縮
      const shortWeaponText = `Weap: ${weapon.name}`;
      const shortTextWidth = ctx.measureText(shortWeaponText).width;
      
      if (shortTextWidth > maxWeaponTextWidth) {
        // それでも長い場合は武器名のみ表示
        ctx.fillText(weapon.name, 20, 150);
      } else {
        ctx.fillText(shortWeaponText, 20, 150);
      }
    } else {
      ctx.fillText(weaponText, 20, 150);
    }
    
    const weaponTimer = game.weaponSystem.getWeaponTimeRemaining();
    if (weaponTimer > 0) {
      ctx.fillStyle = '#00ffff';
      ctx.fillText(`Time: ${weaponTimer.toFixed(1)}s`, 20, 170);
    }
    
    // Game time - 右側、余白を確保
    ctx.textAlign = 'right';
    ctx.fillStyle = '#ffffff';
    const minutes = Math.floor(game.gameTime / 60);
    const seconds = Math.floor(game.gameTime % 60);
    const timeText = `Time: ${minutes}:${seconds.toString().padStart(2, '0')}`;
    const rightMargin = 20;
    ctx.fillText(timeText, this.canvas.width - rightMargin, 20);
    
    // FPS - 右側、時間表示の下
    if (game.deltaTime > 0) {
      const fps = Math.round(1 / game.deltaTime);
      ctx.font = '14px Arial';
      ctx.fillStyle = '#888888';
      ctx.fillText(`FPS: ${fps}`, this.canvas.width - rightMargin, 45);
    }
    
    ctx.restore();
  }

  renderHealthBar(x, y, health, maxHealth) {
    const ctx = this.ctx;
    const barWidth = 150;
    const barHeight = 20;
    const healthPercentage = health / maxHealth;
    
    // Background
    ctx.fillStyle = 'rgba(255, 255, 255, 0.2)';
    ctx.fillRect(x, y, barWidth, barHeight);
    
    // Health fill
    const healthColor = healthPercentage > 0.5 ? '#00ff00' :
                       healthPercentage > 0.25 ? '#ffff00' : '#ff0000';
    ctx.fillStyle = healthColor;
    ctx.fillRect(x, y, barWidth * healthPercentage, barHeight);
    
    // Border
    ctx.strokeStyle = '#ffffff';
    ctx.lineWidth = 2;
    ctx.strokeRect(x, y, barWidth, barHeight);
    
    // Text
    ctx.font = '14px Arial';
    ctx.fillStyle = '#ffffff';
    ctx.textAlign = 'center';
    ctx.textBaseline = 'middle';
    ctx.fillText(`${health}/${maxHealth}`, x + barWidth / 2, y + barHeight / 2);
  }

  renderExperienceBar(game) {
    const ctx = this.ctx;
    const progress = game.levelingSystem.getCurrentLevelProgress();
    
    // 経験値バーを画面上部中央に配置
    const barWidth = 300;
    const barHeight = 12;
    const x = (this.canvas.width - barWidth) / 2;
    const y = 10;
    
    // Background
    ctx.fillStyle = 'rgba(0, 0, 0, 0.5)';
    ctx.fillRect(x, y, barWidth, barHeight);
    
    // Experience fill
    ctx.fillStyle = '#00aaff';
    ctx.fillRect(x, y, barWidth * progress.percentage, barHeight);
    
    // Border
    ctx.strokeStyle = '#ffffff';
    ctx.lineWidth = 1;
    ctx.strokeRect(x, y, barWidth, barHeight);
    
    // Text
    ctx.font = '11px Arial';
    ctx.fillStyle = '#ffffff';
    ctx.textAlign = 'center';
    ctx.textBaseline = 'middle';
    ctx.fillText(`${progress.current}/${progress.total} EXP`, x + barWidth / 2, y + barHeight / 2);
  }

  renderLevel(game) {
    const ctx = this.ctx;
    const level = game.levelingSystem.getLevel();
    
    // レベル表示を経験値バーの左側に配置
    const barWidth = 300;
    const x = (this.canvas.width - barWidth) / 2 - 60;
    const y = 16;
    
    ctx.font = 'bold 16px Arial';
    ctx.fillStyle = '#ffff00';
    ctx.textAlign = 'center';
    ctx.textBaseline = 'middle';
    ctx.fillText(`LV ${level}`, x, y);
  }

  renderPauseMenu(game) {
    const ctx = this.ctx;
    const centerX = this.canvas.width / 2;
    const centerY = this.canvas.height / 2;
    
    // Darken background
    ctx.fillStyle = 'rgba(0, 0, 0, 0.7)';
    ctx.fillRect(0, 0, this.canvas.width, this.canvas.height);
    
    // Pause text
    ctx.save();
    ctx.font = 'bold 48px Arial';
    ctx.fillStyle = '#ffffff';
    ctx.textAlign = 'center';
    ctx.textBaseline = 'middle';
    ctx.shadowBlur = 10;
    ctx.shadowColor = '#ffffff';
    ctx.fillText('PAUSED', centerX, centerY - 50);
    
    ctx.font = '20px Arial';
    ctx.fillStyle = '#aaaaaa';
    ctx.shadowBlur = 0;
    ctx.fillText('Press ESC to resume', centerX, centerY + 20);
    ctx.fillText('Press R to restart', centerX, centerY + 50);
    
    ctx.restore();
  }

  renderGameOver(game) {
    const ctx = this.ctx;
    const centerX = this.canvas.width / 2;
    const centerY = this.canvas.height / 2;
    
    // Background fade
    ctx.fillStyle = 'rgba(0, 0, 0, 0.8)';
    ctx.fillRect(0, 0, this.canvas.width, this.canvas.height);
    
    ctx.save();
    
    // Game Over text
    ctx.font = 'bold 56px Arial';
    ctx.fillStyle = '#ff0000';
    ctx.textAlign = 'center';
    ctx.textBaseline = 'middle';
    ctx.shadowBlur = 20;
    ctx.shadowColor = '#ff0000';
    ctx.fillText('GAME OVER', centerX, centerY - 100);
    
    // Score
    ctx.font = '32px Arial';
    ctx.fillStyle = '#ffffff';
    ctx.shadowBlur = 10;
    ctx.shadowColor = '#ffffff';
    ctx.fillText(`Final Score: ${game.score}`, centerX, centerY - 30);
    
    // High score
    if (game.score >= game.highScore) {
      ctx.font = '28px Arial';
      ctx.fillStyle = '#ffff00';
      ctx.shadowColor = '#ffff00';
      ctx.fillText('NEW HIGH SCORE!', centerX, centerY + 20);
    }
    
    // Stats
    ctx.font = '20px Arial';
    ctx.fillStyle = '#aaaaaa';
    ctx.shadowBlur = 0;
    const minutes = Math.floor(game.gameTime / 60);
    const seconds = Math.floor(game.gameTime % 60);
    ctx.fillText(`Time Survived: ${minutes}:${seconds.toString().padStart(2, '0')}`, centerX, centerY + 70);
    ctx.fillText(`Waves Completed: ${game.spawnSystem.getCurrentWave() - 1}`, centerX, centerY + 100);
    
    // Restart prompt
    ctx.font = '24px Arial';
    ctx.fillStyle = '#00ff00';
    ctx.fillText('Press ENTER to return to menu', centerX, centerY + 150);
    
    ctx.restore();
  }

  addNotification(text, duration = 3) {
    this.notifications.push({
      text,
      duration,
      timeRemaining: duration,
      alpha: 1
    });
  }

  renderNotifications() {
    const ctx = this.ctx;
    const centerX = this.canvas.width / 2;
    let y = 200;
    
    for (let i = this.notifications.length - 1; i >= 0; i--) {
      const notification = this.notifications[i];
      
      ctx.save();
      ctx.font = '20px Arial';
      ctx.fillStyle = `rgba(255, 255, 0, ${notification.alpha})`;
      ctx.textAlign = 'center';
      ctx.textBaseline = 'middle';
      ctx.shadowBlur = 10;
      ctx.shadowColor = `rgba(255, 255, 0, ${notification.alpha})`;
      ctx.fillText(notification.text, centerX, y);
      ctx.restore();
      
      y += 30;
      
      notification.timeRemaining -= 1/60; // Assuming 60 FPS
      notification.alpha = Math.min(1, notification.timeRemaining);
      
      if (notification.timeRemaining <= 0) {
        this.notifications.splice(i, 1);
      }
    }
  }

  renderLevelUpMenu(game) {
    const ctx = this.ctx;
    const centerX = this.canvas.width / 2;
    const centerY = this.canvas.height / 2;
    
    // 半透明の背景
    ctx.fillStyle = 'rgba(0, 0, 0, 0.8)';
    ctx.fillRect(0, 0, this.canvas.width, this.canvas.height);
    
    ctx.save();
    
    // レベルアップテキスト
    ctx.font = 'bold 42px Arial';
    ctx.fillStyle = '#ffff00';
    ctx.textAlign = 'center';
    ctx.textBaseline = 'middle';
    ctx.shadowBlur = 15;
    ctx.shadowColor = '#ffff00';
    ctx.fillText('LEVEL UP!', centerX, centerY - 120);
    
    // アップグレード選択肢
    const upgrades = game.levelingSystem.getAvailableUpgrades();
    const cardWidth = 180;
    const cardHeight = 140;
    const cardSpacing = 20;
    const totalWidth = (cardWidth * 3) + (cardSpacing * 2);
    const startX = centerX - totalWidth / 2;
    
    for (let i = 0; i < upgrades.length; i++) {
      const upgrade = upgrades[i];
      const cardX = startX + (cardWidth + cardSpacing) * i;
      const cardY = centerY - 40;
      
      // カード背景
      ctx.fillStyle = 'rgba(50, 50, 50, 0.9)';
      ctx.fillRect(cardX, cardY, cardWidth, cardHeight);
      
      // カード枠
      ctx.strokeStyle = '#00aaff';
      ctx.lineWidth = 2;
      ctx.strokeRect(cardX, cardY, cardWidth, cardHeight);
      
      // アイコン
      ctx.font = '36px Arial';
      ctx.fillStyle = '#ffffff';
      ctx.textAlign = 'center';
      ctx.shadowBlur = 0;
      ctx.fillText(upgrade.icon, cardX + cardWidth / 2, cardY + 40);
      
      // 名前
      ctx.font = 'bold 16px Arial';
      ctx.fillStyle = '#ffff00';
      ctx.fillText(upgrade.name, cardX + cardWidth / 2, cardY + 70);
      
      // 説明
      ctx.font = '12px Arial';
      ctx.fillStyle = '#cccccc';
      const description = upgrade.description;
      const maxWidth = cardWidth - 10;
      
      // 長い説明文を複数行に分割
      const words = description.split(' ');
      let line = '';
      let y = cardY + 90;
      
      for (let n = 0; n < words.length; n++) {
        const testLine = line + words[n] + ' ';
        const metrics = ctx.measureText(testLine);
        const testWidth = metrics.width;
        
        if (testWidth > maxWidth && n > 0) {
          ctx.fillText(line, cardX + cardWidth / 2, y);
          line = words[n] + ' ';
          y += 14;
        } else {
          line = testLine;
        }
      }
      ctx.fillText(line, cardX + cardWidth / 2, y);
      
      // キー番号
      ctx.font = 'bold 14px Arial';
      ctx.fillStyle = '#00ff00';
      ctx.fillText(`[${i + 1}]`, cardX + cardWidth / 2, cardY + cardHeight - 10);
    }
    
    // 指示テキスト
    ctx.font = '18px Arial';
    ctx.fillStyle = '#aaaaaa';
    ctx.fillText('数字キー(1-3)または該当のカードをクリックして選択', centerX, centerY + 140);
    
    ctx.restore();
  }
}