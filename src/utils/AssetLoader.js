export class AssetLoader {
  constructor() {
    this.images = new Map();
    this.loadingPromises = new Map();
    this.loadedCount = 0;
    this.totalCount = 0;
  }

  async loadImage(name, path) {
    if (this.images.has(name)) {
      return this.images.get(name);
    }

    if (this.loadingPromises.has(name)) {
      return this.loadingPromises.get(name);
    }

    const promise = new Promise((resolve, reject) => {
      const img = new Image();
      
      img.onload = () => {
        this.images.set(name, img);
        this.loadedCount++;
        console.log(`✅ Loaded sprite: ${name}`);
        resolve(img);
      };
      
      img.onerror = () => {
        console.error(`❌ Failed to load sprite: ${name} from ${path}`);
        reject(new Error(`Failed to load image: ${path}`));
      };
      
      img.src = path;
    });

    this.loadingPromises.set(name, promise);
    this.totalCount++;
    
    return promise;
  }

  getImage(name) {
    return this.images.get(name);
  }

  isLoaded(name) {
    return this.images.has(name);
  }

  getLoadingProgress() {
    return this.totalCount > 0 ? this.loadedCount / this.totalCount : 1;
  }

  async loadAllSprites() {
    const sprites = {
      'player': 'assets/sprites/player.png'
    };

    const loadPromises = Object.entries(sprites).map(([name, path]) => 
      this.loadImage(name, path).catch(error => {
        console.warn(`Non-critical asset load failure: ${error.message}`);
        return null;
      })
    );

    await Promise.allSettled(loadPromises);
    console.log(`🎨 Asset loading complete: ${this.loadedCount}/${this.totalCount} sprites loaded`);
  }

  static instance = null;

  static getInstance() {
    if (!AssetLoader.instance) {
      AssetLoader.instance = new AssetLoader();
    }
    return AssetLoader.instance;
  }
}