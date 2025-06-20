export class InputManager {
  constructor(canvas) {
    this.canvas = canvas;
    this.keys = new Set();
    this.mouse = { x: 0, y: 0, pressed: false, justClicked: false };
    this.touch = { x: 0, y: 0, active: false, identifier: null };
    this.gamepad = null;
    this.canvasScale = 1;
    this.canvasOffsetX = 0;
    this.canvasOffsetY = 0;
    
    this.preventedKeys = new Set(['F1', 'F5', 'F11', 'F12']);
    
    this.bindEvents();
  }

  updateCanvasScale(scale) {
    this.canvasScale = scale;
  }

  updateCanvasPosition(offsetX, offsetY) {
    this.canvasOffsetX = offsetX;
    this.canvasOffsetY = offsetY;
  }

  bindEvents() {
    document.addEventListener('keydown', (e) => this.handleKeyDown(e));
    document.addEventListener('keyup', (e) => this.handleKeyUp(e));
    
    this.canvas.addEventListener('mousemove', (e) => this.handleMouseMove(e));
    this.canvas.addEventListener('mousedown', (e) => this.handleMouseDown(e));
    this.canvas.addEventListener('mouseup', (e) => this.handleMouseUp(e));
    this.canvas.addEventListener('contextmenu', (e) => e.preventDefault());
    
    this.canvas.addEventListener('touchstart', (e) => this.handleTouchStart(e));
    this.canvas.addEventListener('touchmove', (e) => this.handleTouchMove(e));
    this.canvas.addEventListener('touchend', (e) => this.handleTouchEnd(e));
    this.canvas.addEventListener('touchcancel', (e) => this.handleTouchEnd(e));
    
    window.addEventListener('gamepadconnected', (e) => this.handleGamepadConnected(e));
    window.addEventListener('gamepaddisconnected', (e) => this.handleGamepadDisconnected(e));
    
    window.addEventListener('blur', () => this.reset());
  }

  handleKeyDown(e) {
    if (this.preventedKeys.has(e.code)) {
      e.preventDefault();
    }
    this.keys.add(e.code);
  }

  handleKeyUp(e) {
    this.keys.delete(e.code);
  }

  handleMouseMove(e) {
    const viewportWidth = window.innerWidth;
    const viewportHeight = window.innerHeight;
    
    const canvasRealWidth = this.canvas.width * this.canvasScale;
    const canvasRealHeight = this.canvas.height * this.canvasScale;
    
    const canvasX = (viewportWidth - canvasRealWidth) / 2;
    const canvasY = (viewportHeight - canvasRealHeight) / 2;
    
    const rawX = e.clientX - canvasX;
    const rawY = e.clientY - canvasY;
    
    this.mouse.x = rawX / this.canvasScale;
    this.mouse.y = rawY / this.canvasScale;
  }

  handleMouseDown(e) {
    if (e.button === 0) {
      this.mouse.pressed = true;
      this.mouse.justClicked = true;
      e.preventDefault();
    }
  }

  handleMouseUp(e) {
    if (e.button === 0) {
      this.mouse.pressed = false;
    }
  }

  handleTouchStart(e) {
    e.preventDefault();
    if (e.touches.length > 0) {
      const touch = e.touches[0];
      const viewportWidth = window.innerWidth;
      const viewportHeight = window.innerHeight;
      
      const canvasRealWidth = this.canvas.width * this.canvasScale;
      const canvasRealHeight = this.canvas.height * this.canvasScale;
      
      const canvasX = (viewportWidth - canvasRealWidth) / 2;
      const canvasY = (viewportHeight - canvasRealHeight) / 2;
      
      const rawX = touch.clientX - canvasX;
      const rawY = touch.clientY - canvasY;
      
      this.touch.x = rawX / this.canvasScale;
      this.touch.y = rawY / this.canvasScale;
      this.touch.active = true;
      this.touch.identifier = touch.identifier;
      
      this.mouse.x = this.touch.x;
      this.mouse.y = this.touch.y;
      this.mouse.pressed = true;
      this.mouse.justClicked = true;
    }
  }

  handleTouchMove(e) {
    e.preventDefault();
    for (let i = 0; i < e.touches.length; i++) {
      const touch = e.touches[i];
      if (touch.identifier === this.touch.identifier) {
        const viewportWidth = window.innerWidth;
        const viewportHeight = window.innerHeight;
        
        const canvasRealWidth = this.canvas.width * this.canvasScale;
        const canvasRealHeight = this.canvas.height * this.canvasScale;
        
        const canvasX = (viewportWidth - canvasRealWidth) / 2;
        const canvasY = (viewportHeight - canvasRealHeight) / 2;
        
        const rawX = touch.clientX - canvasX;
        const rawY = touch.clientY - canvasY;
        
        this.touch.x = rawX / this.canvasScale;
        this.touch.y = rawY / this.canvasScale;
        
        this.mouse.x = this.touch.x;
        this.mouse.y = this.touch.y;
        break;
      }
    }
  }

  handleTouchEnd(e) {
    e.preventDefault();
    for (let i = 0; i < e.changedTouches.length; i++) {
      const touch = e.changedTouches[i];
      if (touch.identifier === this.touch.identifier) {
        this.touch.active = false;
        this.touch.identifier = null;
        this.mouse.pressed = false;
        break;
      }
    }
  }

  handleGamepadConnected(e) {
    console.log('Gamepad connected:', e.gamepad.id);
    this.gamepad = e.gamepad;
  }

  handleGamepadDisconnected(e) {
    console.log('Gamepad disconnected:', e.gamepad.id);
    if (this.gamepad && this.gamepad.index === e.gamepad.index) {
      this.gamepad = null;
    }
  }

  getMovementInput() {
    const movement = { x: 0, y: 0 };
    
    if (this.keys.has('KeyW') || this.keys.has('ArrowUp')) movement.y -= 1;
    if (this.keys.has('KeyS') || this.keys.has('ArrowDown')) movement.y += 1;
    if (this.keys.has('KeyA') || this.keys.has('ArrowLeft')) movement.x -= 1;
    if (this.keys.has('KeyD') || this.keys.has('ArrowRight')) movement.x += 1;
    
    if (this.gamepad) {
      const gamepads = navigator.getGamepads();
      const gp = gamepads[this.gamepad.index];
      if (gp) {
        const deadzone = 0.2;
        const leftX = gp.axes[0];
        const leftY = gp.axes[1];
        
        if (Math.abs(leftX) > deadzone) movement.x += leftX;
        if (Math.abs(leftY) > deadzone) movement.y += leftY;
        
        if (gp.buttons[12].pressed) movement.y -= 1;
        if (gp.buttons[13].pressed) movement.y += 1;
        if (gp.buttons[14].pressed) movement.x -= 1;
        if (gp.buttons[15].pressed) movement.x += 1;
      }
    }
    
    if (this.touch.active) {
      const centerX = this.canvas.width / 2;
      const centerY = this.canvas.height / 2;
      const dx = this.touch.x - centerX;
      const dy = this.touch.y - centerY;
      const distance = Math.sqrt(dx * dx + dy * dy);
      
      if (distance > 50) {
        movement.x = dx / distance;
        movement.y = dy / distance;
      }
    }
    
    return movement;
  }

  isKeyPressed(key) {
    return this.keys.has(key);
  }

  isMousePressed() {
    if (this.gamepad) {
      const gamepads = navigator.getGamepads();
      const gp = gamepads[this.gamepad.index];
      if (gp && gp.buttons[0].pressed) {
        return true;
      }
    }
    return this.mouse.pressed;
  }

  getMousePosition() {
    return { x: this.mouse.x, y: this.mouse.y };
  }

  update() {
    if (this.gamepad) {
      const gamepads = navigator.getGamepads();
      const gp = gamepads[this.gamepad.index];
      if (gp) {
        const rightX = gp.axes[2];
        const rightY = gp.axes[3];
        const deadzone = 0.2;
        
        if (Math.abs(rightX) > deadzone || Math.abs(rightY) > deadzone) {
          const centerX = this.canvas.width / 2;
          const centerY = this.canvas.height / 2;
          this.mouse.x = centerX + rightX * 200;
          this.mouse.y = centerY + rightY * 200;
        }
        
        if (gp.buttons[7].pressed || gp.buttons[0].pressed) {
          this.mouse.pressed = true;
        } else if (!this.touch.active) {
          this.mouse.pressed = false;
        }
      }
    }
    
    // justClickedフラグを次のフレームでリセット
    this.mouse.justClicked = false;
  }

  reset() {
    this.keys.clear();
    this.mouse.pressed = false;
    this.mouse.justClicked = false;
    this.touch.active = false;
  }

  checkLevelUpCardClick(game) {
    if (!this.mouse.justClicked || !game.levelingSystem) return -1;
    
    const upgrades = game.levelingSystem.getAvailableUpgrades();
    if (upgrades.length === 0) return -1;
    
    const centerX = this.canvas.width / 2;
    const centerY = this.canvas.height / 2;
    const cardWidth = 180;
    const cardHeight = 140;
    const cardSpacing = 20;
    const totalWidth = (cardWidth * 3) + (cardSpacing * 2);
    const startX = centerX - totalWidth / 2;
    const cardY = centerY - 40;
    
    for (let i = 0; i < upgrades.length; i++) {
      const cardX = startX + (cardWidth + cardSpacing) * i;
      
      if (this.mouse.x >= cardX && this.mouse.x <= cardX + cardWidth &&
          this.mouse.y >= cardY && this.mouse.y <= cardY + cardHeight) {
        return i;
      }
    }
    
    return -1;
  }
}