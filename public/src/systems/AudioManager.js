export class AudioManager {
  constructor() {
    this.sounds = new Map();
    this.music = new Map();
    this.currentMusic = null;
    this.soundVolume = 0.5;
    this.musicVolume = 0.3;
    this.muted = false;
    
    this.audioContext = null;
    this.masterGain = null;
    this.soundGain = null;
    this.musicGain = null;
    
    this.initAudioContext();
    this.soundPool = new Map();
  }

  initAudioContext() {
    try {
      const AudioContext = window.AudioContext || window.webkitAudioContext;
      this.audioContext = new AudioContext();
      
      this.masterGain = this.audioContext.createGain();
      this.masterGain.connect(this.audioContext.destination);
      
      this.soundGain = this.audioContext.createGain();
      this.soundGain.connect(this.masterGain);
      this.soundGain.gain.value = this.soundVolume;
      
      this.musicGain = this.audioContext.createGain();
      this.musicGain.connect(this.masterGain);
      this.musicGain.gain.value = this.musicVolume;
      
      // Resume audio context on user interaction
      document.addEventListener('click', () => {
        if (this.audioContext.state === 'suspended') {
          this.audioContext.resume();
        }
      }, { once: true });
    } catch (error) {
      console.warn('Web Audio API not supported:', error);
    }
  }

  async loadAudio() {
    // Since we don't have actual audio files, we'll create synthesized sounds
    this.createSynthesizedSounds();
  }

  createSynthesizedSounds() {
    // Define sound configurations
    const soundConfigs = {
      shoot: { frequency: 440, duration: 0.1, type: 'square', volume: 0.3 },
      explosion: { frequency: 80, duration: 0.3, type: 'noise', volume: 0.5 },
      hit: { frequency: 200, duration: 0.15, type: 'sawtooth', volume: 0.4 },
      powerup: { frequency: 880, duration: 0.2, type: 'sine', volume: 0.4 },
      highscore: { frequency: 660, duration: 0.5, type: 'sine', volume: 0.5 }
    };
    
    for (const [name, config] of Object.entries(soundConfigs)) {
      this.sounds.set(name, config);
    }
    
    // Music would be more complex, but for now we'll use a simple placeholder
    this.music.set('bgm', { 
      frequencies: [220, 293.66, 329.63, 440], 
      duration: 4, 
      type: 'sine',
      volume: 0.2
    });
  }

  playSound(soundName, volume = 1) {
    if (this.muted || !this.audioContext || !this.sounds.has(soundName)) return;
    
    const config = this.sounds.get(soundName);
    const adjustedVolume = config.volume * volume;
    
    if (config.type === 'noise') {
      this.playNoise(config.duration, adjustedVolume);
    } else {
      this.playTone(config.frequency, config.duration, config.type, adjustedVolume);
    }
  }

  playTone(frequency, duration, type, volume) {
    const oscillator = this.audioContext.createOscillator();
    const gainNode = this.audioContext.createGain();
    
    oscillator.connect(gainNode);
    gainNode.connect(this.soundGain);
    
    oscillator.type = type;
    oscillator.frequency.setValueAtTime(frequency, this.audioContext.currentTime);
    
    gainNode.gain.setValueAtTime(volume, this.audioContext.currentTime);
    gainNode.gain.exponentialRampToValueAtTime(0.01, this.audioContext.currentTime + duration);
    
    oscillator.start(this.audioContext.currentTime);
    oscillator.stop(this.audioContext.currentTime + duration);
  }

  playNoise(duration, volume) {
    const bufferSize = this.audioContext.sampleRate * duration;
    const buffer = this.audioContext.createBuffer(1, bufferSize, this.audioContext.sampleRate);
    const output = buffer.getChannelData(0);
    
    for (let i = 0; i < bufferSize; i++) {
      output[i] = Math.random() * 2 - 1;
    }
    
    const source = this.audioContext.createBufferSource();
    const gainNode = this.audioContext.createGain();
    
    source.buffer = buffer;
    source.connect(gainNode);
    gainNode.connect(this.soundGain);
    
    gainNode.gain.setValueAtTime(volume, this.audioContext.currentTime);
    gainNode.gain.exponentialRampToValueAtTime(0.01, this.audioContext.currentTime + duration);
    
    source.start(this.audioContext.currentTime);
  }

  playMusic(musicName) {
    if (this.muted || !this.audioContext || !this.music.has(musicName)) return;
    
    this.stopMusic();
    
    const config = this.music.get(musicName);
    this.currentMusic = [];
    
    // Create a simple looping pattern
    const playPattern = () => {
      if (!this.currentMusic) return;
      
      config.frequencies.forEach((freq, index) => {
        setTimeout(() => {
          if (this.currentMusic) {
            this.playTone(freq, 0.2, config.type, config.volume);
          }
        }, index * 250);
      });
      
      // Loop the pattern
      if (this.currentMusic) {
        setTimeout(playPattern, config.duration * 1000);
      }
    };
    
    playPattern();
  }

  stopMusic() {
    this.currentMusic = null;
  }

  setSoundVolume(volume) {
    this.soundVolume = Math.max(0, Math.min(1, volume));
    if (this.soundGain) {
      this.soundGain.gain.value = this.soundVolume;
    }
  }

  setMusicVolume(volume) {
    this.musicVolume = Math.max(0, Math.min(1, volume));
    if (this.musicGain) {
      this.musicGain.gain.value = this.musicVolume;
    }
  }

  setMasterVolume(volume) {
    const masterVolume = Math.max(0, Math.min(1, volume));
    if (this.masterGain) {
      this.masterGain.gain.value = masterVolume;
    }
  }

  toggleMute() {
    this.muted = !this.muted;
    if (this.masterGain) {
      this.masterGain.gain.value = this.muted ? 0 : 1;
    }
  }

  getMuted() {
    return this.muted;
  }
}