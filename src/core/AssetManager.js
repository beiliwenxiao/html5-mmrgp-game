/**
 * 资源管理器
 * 负责加载和管理游戏资源（图片、音频等）
 */
export class AssetManager {
    constructor() {
        // 资源缓存
        this.images = new Map();
        this.audio = new Map();
        
        // 加载队列
        this.loadQueue = [];
        this.loadedCount = 0;
        this.totalCount = 0;
        
        // 加载状态
        this.isLoading = false;
        this.loadProgress = 0;
        
        // 精灵图集数据
        this.spriteSheets = new Map();
    }

    /**
     * 添加图片资源到加载队列
     * @param {string} key - 资源键名
     * @param {string} url - 资源URL
     */
    addImage(key, url) {
        this.loadQueue.push({
            type: 'image',
            key,
            url
        });
        this.totalCount++;
    }

    /**
     * 添加音频资源到加载队列
     * @param {string} key - 资源键名
     * @param {string} url - 资源URL
     */
    addAudio(key, url) {
        this.loadQueue.push({
            type: 'audio',
            key,
            url
        });
        this.totalCount++;
    }

    /**
     * 添加精灵图集
     * @param {string} key - 图集键名
     * @param {object} data - 图集数据
     */
    addSpriteSheet(key, data) {
        this.spriteSheets.set(key, data);
    }

    /**
     * 加载所有队列中的资源
     * @returns {Promise<void>}
     */
    async loadAll() {
        if (this.loadQueue.length === 0) {
            console.log('AssetManager: No assets to load');
            return;
        }

        this.isLoading = true;
        this.loadedCount = 0;
        this.loadProgress = 0;

        console.log(`AssetManager: Loading ${this.totalCount} assets...`);

        const promises = this.loadQueue.map(asset => this.loadAsset(asset));
        
        try {
            await Promise.all(promises);
            console.log('AssetManager: All assets loaded successfully');
        } catch (error) {
            console.error('AssetManager: Failed to load some assets', error);
            throw error;
        } finally {
            this.isLoading = false;
            this.loadQueue = [];
        }
    }

    /**
     * 加载单个资源
     * @param {object} asset - 资源对象
     * @returns {Promise<void>}
     */
    async loadAsset(asset) {
        try {
            if (asset.type === 'image') {
                await this.loadImage(asset.key, asset.url);
            } else if (asset.type === 'audio') {
                await this.loadAudioFile(asset.key, asset.url);
            }
            
            this.loadedCount++;
            this.loadProgress = this.loadedCount / this.totalCount;
            
            console.log(`AssetManager: Loaded ${asset.key} (${this.loadedCount}/${this.totalCount})`);
        } catch (error) {
            console.error(`AssetManager: Failed to load ${asset.key}`, error);
            throw error;
        }
    }

    /**
     * 加载图片资源
     * @param {string} key - 资源键名
     * @param {string} url - 图片URL
     * @returns {Promise<HTMLImageElement>}
     */
    loadImage(key, url) {
        return new Promise((resolve, reject) => {
            const img = new Image();
            
            img.onload = () => {
                this.images.set(key, img);
                resolve(img);
            };
            
            img.onerror = () => {
                reject(new Error(`Failed to load image: ${url}`));
            };
            
            img.src = url;
        });
    }

    /**
     * 加载音频资源
     * @param {string} key - 资源键名
     * @param {string} url - 音频URL
     * @returns {Promise<HTMLAudioElement>}
     */
    loadAudioFile(key, url) {
        return new Promise((resolve, reject) => {
            const audio = new Audio();
            
            audio.oncanplaythrough = () => {
                this.audio.set(key, audio);
                resolve(audio);
            };
            
            audio.onerror = () => {
                reject(new Error(`Failed to load audio: ${url}`));
            };
            
            audio.src = url;
        });
    }

    /**
     * 获取图片资源
     * @param {string} key - 资源键名
     * @returns {HTMLImageElement|null}
     */
    getImage(key) {
        if (!this.images.has(key)) {
            console.warn(`AssetManager: Image '${key}' not found`);
            return null;
        }
        return this.images.get(key);
    }

    /**
     * 获取音频资源
     * @param {string} key - 资源键名
     * @returns {HTMLAudioElement|null}
     */
    getAudio(key) {
        if (!this.audio.has(key)) {
            console.warn(`AssetManager: Audio '${key}' not found`);
            return null;
        }
        return this.audio.get(key);
    }

    /**
     * 获取精灵图集
     * @param {string} key - 图集键名
     * @returns {object|null}
     */
    getSpriteSheet(key) {
        if (!this.spriteSheets.has(key)) {
            console.warn(`AssetManager: Sprite sheet '${key}' not found`);
            return null;
        }
        return this.spriteSheets.get(key);
    }

    /**
     * 获取加载进度
     * @returns {number} 0-1之间的进度值
     */
    getProgress() {
        return this.loadProgress;
    }

    /**
     * 检查资源是否已加载
     * @param {string} key - 资源键名
     * @returns {boolean}
     */
    hasImage(key) {
        return this.images.has(key);
    }

    /**
     * 检查音频是否已加载
     * @param {string} key - 资源键名
     * @returns {boolean}
     */
    hasAudio(key) {
        return this.audio.has(key);
    }

    /**
     * 清除所有资源
     */
    clear() {
        this.images.clear();
        this.audio.clear();
        this.spriteSheets.clear();
        this.loadQueue = [];
        this.loadedCount = 0;
        this.totalCount = 0;
        this.loadProgress = 0;
        console.log('AssetManager: All assets cleared');
    }

    /**
     * 清除特定资源
     * @param {string} key - 资源键名
     */
    remove(key) {
        this.images.delete(key);
        this.audio.delete(key);
        this.spriteSheets.delete(key);
    }
}
