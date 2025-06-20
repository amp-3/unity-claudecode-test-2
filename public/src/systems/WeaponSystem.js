import { Bullet, SpreadBullet, PowerBullet, LaserBullet } from '../entities/Bullet.js';

export class WeaponSystem {
  constructor() {
    this.weapons = {
      normal: {
        name: 'Normal',
        fireRate: 8,
        damage: 1,
        speed: 500,
        spread: 0,
        bulletCount: 1,
        bulletClass: Bullet
      },
      spread: {
        name: 'Spread',
        fireRate: 6,
        damage: 0.75,
        speed: 400,
        spread: 0.3,
        bulletCount: 5,
        bulletClass: SpreadBullet
      },
      power: {
        name: 'Power',
        fireRate: 3,
        damage: 3,
        speed: 350,
        spread: 0,
        bulletCount: 1,
        bulletClass: PowerBullet
      },
      rapid: {
        name: 'Rapid',
        fireRate: 15,
        damage: 0.5,
        speed: 600,
        spread: 0.1,
        bulletCount: 1,
        bulletClass: Bullet
      },
      laser: {
        name: 'Laser',
        fireRate: 20,
        damage: 0.5,
        speed: 800,
        spread: 0,
        bulletCount: 1,
        bulletClass: LaserBullet
      }
    };
    
    this.currentWeapon = 'normal';
    this.weaponDuration = 10; // seconds
    this.weaponTimer = 0;
    this.defaultWeapon = 'normal';
  }

  reset() {
    this.currentWeapon = this.defaultWeapon;
    this.weaponTimer = 0;
  }

  update(dt) {
    if (this.currentWeapon !== this.defaultWeapon && this.weaponTimer > 0) {
      this.weaponTimer -= dt;
      if (this.weaponTimer <= 0) {
        this.currentWeapon = this.defaultWeapon;
      }
    }
  }

  setWeapon(weaponType, duration = null) {
    if (this.weapons[weaponType]) {
      this.currentWeapon = weaponType;
      if (duration !== null) {
        this.weaponTimer = duration;
      } else {
        this.weaponTimer = this.weaponDuration;
      }
    }
  }

  fire(x, y, direction) {
    const weapon = this.weapons[this.currentWeapon];
    const bullets = [];
    
    if (weapon.bulletCount === 1) {
      const bullet = new weapon.bulletClass(
        x,
        y,
        direction + (Math.random() - 0.5) * weapon.spread,
        weapon.speed,
        weapon.damage
      );
      bullets.push(bullet);
    } else {
      const spreadAngle = weapon.spread;
      const angleStep = spreadAngle / (weapon.bulletCount - 1);
      const startAngle = direction - spreadAngle / 2;
      
      for (let i = 0; i < weapon.bulletCount; i++) {
        const bulletAngle = startAngle + angleStep * i;
        const bullet = new weapon.bulletClass(
          x,
          y,
          bulletAngle,
          weapon.speed,
          weapon.damage
        );
        bullets.push(bullet);
      }
    }
    
    return bullets;
  }

  getFireRate() {
    return this.weapons[this.currentWeapon].fireRate;
  }

  getCurrentWeapon() {
    return this.weapons[this.currentWeapon];
  }

  getWeaponTimeRemaining() {
    return Math.max(0, this.weaponTimer);
  }

  getWeaponList() {
    return Object.keys(this.weapons);
  }
}