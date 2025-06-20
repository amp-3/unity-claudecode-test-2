export class Entity {
  constructor(x = 0, y = 0) {
    this.x = x;
    this.y = y;
    this.vx = 0;
    this.vy = 0;
    this.width = 32;
    this.height = 32;
    this.alive = true;
    this.type = 'entity';
    this.id = Entity.nextId++;
    this.collisionRadius = 16;
    this.rotation = 0;
  }

  static nextId = 0;

  update(dt) {
    this.x += this.vx * dt;
    this.y += this.vy * dt;
  }

  render(ctx) {
    ctx.save();
    ctx.translate(this.x, this.y);
    ctx.rotate(this.rotation);
    
    ctx.fillStyle = '#ffffff';
    ctx.fillRect(-this.width / 2, -this.height / 2, this.width, this.height);
    
    ctx.restore();
  }

  destroy() {
    this.alive = false;
  }

  getBounds() {
    return {
      left: this.x - this.width / 2,
      right: this.x + this.width / 2,
      top: this.y - this.height / 2,
      bottom: this.y + this.height / 2
    };
  }

  getCenter() {
    return { x: this.x, y: this.y };
  }

  distanceTo(other) {
    const dx = other.x - this.x;
    const dy = other.y - this.y;
    return Math.sqrt(dx * dx + dy * dy);
  }

  angleTo(other) {
    return Math.atan2(other.y - this.y, other.x - this.x);
  }

  collidesWith(other) {
    if (!this.alive || !other.alive) return false;
    
    const distance = this.distanceTo(other);
    return distance < this.collisionRadius + other.collisionRadius;
  }

  constrainToArea(x, y, radius) {
    const dx = this.x - x;
    const dy = this.y - y;
    const distance = Math.sqrt(dx * dx + dy * dy);
    
    if (distance > radius) {
      const angle = Math.atan2(dy, dx);
      this.x = x + Math.cos(angle) * radius;
      this.y = y + Math.sin(angle) * radius;
    }
  }

  reset() {
    this.x = 0;
    this.y = 0;
    this.vx = 0;
    this.vy = 0;
    this.alive = true;
  }
}