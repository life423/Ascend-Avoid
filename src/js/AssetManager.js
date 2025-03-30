/**
 * Manages loading and caching of game assets such as images and audio.
 * Ensures assets are loaded before the game starts.
 */
export default class AssetManager {
  /**
   * Creates a new AssetManager
   */
  constructor() {
    // Storage for loaded assets
    this.images = {};
    this.audio = {};
    
    // Promises for tracking loading status
    this.loadPromises = [];
    
    // Load status tracking
    this.totalAssets = 0;
    this.loadedAssets = 0;
    
    // Sound cache for efficient playback
    this.soundCache = new Map();
  }
  
  /**
   * Preload an image asset
   * @param {string} key - Identifier for the image
   * @param {string} src - Path to the image file
   * @returns {Promise} A promise that resolves when the image is loaded
   */
  preloadImage(key, src) {
    this.totalAssets++;
    
    return new Promise((resolve, reject) => {
      const img = new Image();
      
      img.onload = () => {
        this.images[key] = img;
        this.loadedAssets++;
        resolve(img);
      };
      
      img.onerror = (err) => {
        console.error(`Failed to load image: ${src}`, err);
        this.loadedAssets++;
        reject(err);
      };
      
      img.src = src;
    });
  }
  
  /**
   * Preload an audio asset
   * @param {string} key - Identifier for the audio
   * @param {string} src - Path to the audio file
   * @returns {Promise} A promise that resolves when the audio is loaded
   */
  preloadAudio(key, src) {
    this.totalAssets++;
    
    return new Promise((resolve, reject) => {
      const audio = new Audio();
      
      audio.oncanplaythrough = () => {
        this.audio[key] = audio;
        this.loadedAssets++;
        resolve(audio);
      };
      
      audio.onerror = (err) => {
        console.error(`Failed to load audio: ${src}`, err);
        this.loadedAssets++;
        reject(err);
      };
      
      audio.src = src;
      audio.load();
    });
  }
  
  /**
   * Load all game assets
   * @param {Array} imageAssets - Array of {key, src} objects for images
   * @param {Array} audioAssets - Array of {key, src} objects for audio
   * @returns {Promise} A promise that resolves when all assets are loaded
   */
  loadAssets(imageAssets = [], audioAssets = []) {
    // Clear any previous load operations
    this.loadPromises = [];
    this.totalAssets = 0;
    this.loadedAssets = 0;
    
    // Queue image loading
    for (const asset of imageAssets) {
      const promise = this.preloadImage(asset.key, asset.src);
      this.loadPromises.push(promise);
    }
    
    // Queue audio loading
    for (const asset of audioAssets) {
      const promise = this.preloadAudio(asset.key, asset.src);
      this.loadPromises.push(promise);
    }
    
    // Return a promise that resolves when all assets are loaded
    return Promise.all(this.loadPromises)
      .then(() => {
        console.log('All assets loaded successfully');
        return { success: true };
      })
      .catch((err) => {
        console.error('Some assets failed to load', err);
        return { success: false, error: err };
      });
  }
  
  /**
   * Get a loaded image
   * @param {string} key - Image identifier
   * @returns {HTMLImageElement|null} The loaded image or null if not found
   */
  getImage(key) {
    return this.images[key] || null;
  }
  
  /**
   * Get a loaded audio
   * @param {string} key - Audio identifier
   * @returns {HTMLAudioElement|null} The loaded audio or null if not found
   */
  getAudio(key) {
    return this.audio[key] || null;
  }
  
  /**
   * Play a sound with efficient caching for rapid playback
   * @param {string} key - Audio identifier
   * @param {number} volume - Volume level (0.0 to 1.0)
   */
  playSound(key, volume = 1.0) {
    // Check if sound exists
    if (!this.audio[key]) {
      console.warn(`Sound not found: ${key}`);
      return;
    }
    
    // Try to find an available sound from the cache
    let sound = null;
    
    // Get or create cache for this sound
    if (!this.soundCache.has(key)) {
      this.soundCache.set(key, []);
    }
    
    const cache = this.soundCache.get(key);
    
    // Find a sound that's not playing
    for (let i = 0; i < cache.length; i++) {
      if (cache[i].ended || cache[i].paused) {
        sound = cache[i];
        break;
      }
    }
    
    // If no available sound was found, create a new one
    if (!sound) {
      // Clone the original audio
      sound = this.audio[key].cloneNode();
      
      // Add to cache (limit cache size)
      if (cache.length < 10) {
        cache.push(sound);
      }
    }
    
    // Set volume and play
    sound.volume = volume;
    
    // Play the sound (with error handling)
    try {
      const playPromise = sound.play();
      
      // Catch play() errors (can happen with autoplay restrictions)
      if (playPromise !== undefined) {
        playPromise.catch(error => {
          console.warn(`Error playing sound ${key}:`, error);
        });
      }
    } catch (error) {
      console.warn(`Error playing sound ${key}:`, error);
    }
  }
  
  /**
   * Get the loading progress (0.0 to 1.0)
   * @returns {number} The loading progress
   */
  getLoadProgress() {
    if (this.totalAssets === 0) return 1.0;
    return this.loadedAssets / this.totalAssets;
  }
  
  /**
   * Check if all assets are loaded
   * @returns {boolean} Whether all assets are loaded
   */
  isLoaded() {
    return this.loadedAssets === this.totalAssets;
  }
  
  /**
   * Clean up resources
   */
  dispose() {
    // Clear all loaded assets
    this.images = {};
    this.audio = {};
    
    // Clear cache
    this.soundCache.forEach(cache => {
      cache.forEach(sound => {
        sound.pause();
        sound.src = '';
      });
    });
    
    this.soundCache.clear();
  }
}
