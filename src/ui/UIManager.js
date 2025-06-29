export class UIManager {
  constructor(canvas) {
    this.canvas = canvas;
    this.ctx = canvas.getContext('2d');
    this.fadeAlpha = 0;
    this.fadeDirection = 0;
    this.notifications = [];
    this.notificationDuration = 3;
    this.petalTimer = 0;
    this.petalInterval = 0.3; // 花びら生成間隔（秒）
    this.petals = []; // レベルアップ画面専用の花びら
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
    
    // Made with Claude Code
    ctx.font = '14px Arial';
    ctx.fillStyle = '#666666';
    ctx.fillText('Made with Claude Code', centerX, this.canvas.height - 20);
    
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
    
    // Weapon info - WaveUIと左端を揃える
    const leftMargin = 20; // Wave情報と同じ左マージン
    const weapon = game.weaponSystem.getCurrentWeapon();
    ctx.font = '16px Arial';
    ctx.fillStyle = '#ffffff';
    ctx.textAlign = 'left'; // 左揃えを明示
    
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
        ctx.fillText(weapon.name, leftMargin, 150);
      } else {
        ctx.fillText(shortWeaponText, leftMargin, 150);
      }
    } else {
      ctx.fillText(weaponText, leftMargin, 150);
    }
    
    const weaponTimer = game.weaponSystem.getWeaponTimeRemaining();
    if (weaponTimer > 0) {
      ctx.fillStyle = '#00ffff';
      ctx.fillText(`Time: ${weaponTimer.toFixed(1)}s`, leftMargin, 170);
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
    
    // 花びらパーティクルの生成と管理
    this.petalTimer += game.deltaTime || 0.016;
    if (this.petalTimer >= this.petalInterval) {
      this.createPetals();
      this.petalTimer = 0;
    }
    
    // 花びらの更新と描画
    this.updatePetals(game.deltaTime || 0.016);
    this.renderPetals(ctx);
    
    ctx.save();
    
    // レベルアップテキスト（キラキラ効果付き）
    ctx.font = 'bold 42px Arial';
    ctx.textAlign = 'center';
    ctx.textBaseline = 'middle';
    
    // アニメーション効果
    const time = Date.now() * 0.005;
    const pulse = 1 + Math.sin(time * 3) * 0.1;
    const rainbow = Math.sin(time * 2) * 0.5 + 0.5;
    
    // レインボー効果
    const hue = (time * 50) % 360;
    ctx.fillStyle = `hsl(${hue}, 100%, 60%)`;
    ctx.shadowBlur = 20 + Math.sin(time * 4) * 5;
    ctx.shadowColor = ctx.fillStyle;
    
    ctx.save();
    ctx.scale(pulse, pulse);
    ctx.fillText('LEVEL UP!', centerX / pulse, (centerY - 120) / pulse);
    ctx.restore();
    
    // 追加の輝きエフェクト
    ctx.fillStyle = '#ffffff';
    ctx.shadowBlur = 30;
    ctx.shadowColor = '#ffffff';
    ctx.globalAlpha = 0.3 + Math.sin(time * 6) * 0.2;
    ctx.fillText('LEVEL UP!', centerX, centerY - 120);
    ctx.globalAlpha = 1;
    
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
  
  createPetals() {
    const colors = ['#ff69b4', '#ffb6c1', '#ffc0cb', '#ffdbec', '#fff0f5'];
    const count = 2;
    
    for (let i = 0; i < count; i++) {
      const baseX = Math.random() * this.canvas.width;
      const petal = {
        x: baseX,
        y: -20,
        baseX: baseX, // 基準位置を保存
        vx: (Math.random() - 0.5) * 5, // 横方向の初期速度をさらに抑制
        vy: 30 + Math.random() * 20, // 落下速度を一定に
        color: colors[Math.floor(Math.random() * colors.length)],
        width: 6 + Math.random() * 4,
        height: 8 + Math.random() * 6,
        rotation: Math.random() * Math.PI * 2,
        rotationSpeed: (Math.random() - 0.5) * 2, // 回転速度をさらに抑制
        swayAmplitude: 5 + Math.random() * 10, // 揺れ幅をさらに抑制
        swayFrequency: 0.2 + Math.random() * 0.4, // 揺れ周波数をゆるやかに
        windForce: (Math.random() - 0.5) * 3, // 風の力をさらに抑制
        gravity: 20 + Math.random() * 10, // 重力加速度
        mass: 0.5 + Math.random() * 0.5, // 質量（風の影響度）
        timeAlive: 0,
        alpha: 1
      };
      this.petals.push(petal);
    }
  }
  
  updatePetals(dt) {
    for (let i = this.petals.length - 1; i >= 0; i--) {
      const petal = this.petals[i];
      
      petal.timeAlive += dt;
      
      // 重力の影響で徐々に加速
      petal.vy += petal.gravity * dt;
      
      // 風の影響（左右にふらつく）- よりゆるやかに
      const windEffect = Math.sin(petal.timeAlive * 1) * petal.windForce * dt / petal.mass;
      petal.vx += windEffect;
      
      // 空気抵抗で横方向の速度を減衰 - より強く減衰
      petal.vx *= 0.95;
      
      // 最大落下速度を制限
      petal.vy = Math.min(petal.vy, 80);
      
      // 基準位置の更新（風の影響）
      petal.baseX += petal.vx * dt;
      petal.y += petal.vy * dt;
      
      // より自然な左右の揺れ（複数の周波数を組み合わせ）
      const sway1 = Math.sin(petal.timeAlive * petal.swayFrequency * Math.PI * 2) * petal.swayAmplitude * 0.7;
      const sway2 = Math.sin(petal.timeAlive * petal.swayFrequency * 1.7 * Math.PI * 2) * petal.swayAmplitude * 0.3;
      
      // 最終位置 = 基準位置 + 揺れ
      petal.x = petal.baseX + sway1 + sway2;
      
      // 回転も風の影響を受ける - よりゆるやかに
      const rotationWind = Math.sin(petal.timeAlive * 0.8) * 0.3;
      petal.rotation += (petal.rotationSpeed + rotationWind) * dt;
      
      // 画面端での境界処理（跳ね返り）
      if (petal.baseX < -petal.swayAmplitude || petal.baseX > this.canvas.width + petal.swayAmplitude) {
        petal.vx *= -0.3; // 弱い跳ね返り
        petal.baseX = Math.max(-petal.swayAmplitude, Math.min(this.canvas.width + petal.swayAmplitude, petal.baseX));
      }
      
      // 画面下に到達したら削除
      if (petal.y > this.canvas.height + 20) {
        this.petals.splice(i, 1);
      }
    }
  }
  
  renderPetals(ctx) {
    ctx.save();
    
    this.petals.forEach(petal => {
      ctx.save();
      ctx.globalAlpha = petal.alpha * 0.8;
      ctx.translate(petal.x, petal.y);
      ctx.rotate(petal.rotation);
      ctx.fillStyle = petal.color;
      ctx.fillRect(-petal.width / 2, -petal.height / 2, petal.width, petal.height);
      ctx.restore();
    });
    
    ctx.restore();
  }
  
  clearPetals() {
    this.petals = [];
  }
  
  fadeOutPetals(duration = 0.2) {
    this.petals.forEach(petal => {
      if (!petal.fadeStartTime) {
        petal.fadeStartTime = 0;
        petal.fadeDuration = duration;
        petal.originalAlpha = petal.alpha;
      }
    });
    
    // フェードアウト処理をupdatePetalsに統合
    const fadeInterval = setInterval(() => {
      let allFaded = true;
      this.petals.forEach(petal => {
        if (petal.fadeStartTime !== undefined) {
          petal.fadeStartTime += 0.016;
          const fadeProgress = Math.min(1, petal.fadeStartTime / petal.fadeDuration);
          petal.alpha = petal.originalAlpha * (1 - fadeProgress);
          if (fadeProgress < 1) allFaded = false;
        }
      });
      
      if (allFaded) {
        clearInterval(fadeInterval);
        this.clearPetals();
      }
    }, 16);
  }
}