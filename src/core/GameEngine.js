import { AssetManager } from './AssetManager.js';
import { InputManager } from './InputManager.js';
import { SceneManager } from './SceneManager.js';
import { NetworkManager } from '../network/NetworkManager.js';
import { LoginScene } from '../scenes/LoginScene.js';
import { CharacterScene } from '../scenes/CharacterScene.js';
import { GameScene } from '../scenes/GameScene.js';

/**
 * 游戏引擎核心类
 * 负责初始化、游戏循环和模块协调
 */
export class GameEngine {
    constructor(canvas) {
        this.canvas = canvas;
        this.ctx = null;
        this.isRunning = false;
        this.lastFrameTime = 0;
        this.targetFPS = 60;
        this.frameInterval = 1000 / this.targetFPS;
        
        // 游戏尺寸
        this.gameWidth = 1280;
        this.gameHeight = 720;
        
        // 子系统（将在后续任务中实现）
        this.sceneManager = null;
        this.assetManager = null;
        this.inputManager = null;
        this.networkManager = null;
    }

    /**
     * 初始化游戏引擎
     */
    async init() {
        console.log('GameEngine: Initializing...');
        
        // 初始化Canvas
        this.initCanvas();
        
        // 设置窗口大小调整监听
        window.addEventListener('resize', () => this.handleResize());
        
        // 初始化子系统（占位符，将在后续任务中实现）
        await this.initSystems();
        
        console.log('GameEngine: Initialization complete');
    }

    /**
     * 初始化Canvas和渲染上下文
     */
    initCanvas() {
        // 获取2D渲染上下文
        this.ctx = this.canvas.getContext('2d');
        if (!this.ctx) {
            throw new Error('Failed to get 2D context');
        }

        // 设置Canvas尺寸
        this.handleResize();

        // 禁用图像平滑以获得像素风格
        this.ctx.imageSmoothingEnabled = false;

        console.log('GameEngine: Canvas initialized');
    }

    /**
     * 处理窗口大小变化
     */
    handleResize() {
        // 获取窗口尺寸
        const windowWidth = window.innerWidth;
        const windowHeight = window.innerHeight;

        // 计算缩放比例，保持宽高比
        const scaleX = windowWidth / this.gameWidth;
        const scaleY = windowHeight / this.gameHeight;
        const scale = Math.min(scaleX, scaleY);

        // 设置Canvas显示尺寸
        this.canvas.style.width = `${this.gameWidth * scale}px`;
        this.canvas.style.height = `${this.gameHeight * scale}px`;

        // 设置Canvas实际尺寸
        this.canvas.width = this.gameWidth;
        this.canvas.height = this.gameHeight;

        console.log(`GameEngine: Canvas resized to ${this.canvas.width}x${this.canvas.height}`);
    }

    /**
     * 初始化子系统
     */
    async initSystems() {
        // 初始化资源管理器
        this.assetManager = new AssetManager();
        console.log('GameEngine: AssetManager initialized');
        
        // 初始化输入管理器
        this.inputManager = new InputManager(this.canvas);
        console.log('GameEngine: InputManager initialized');
        
        // 初始化场景管理器
        this.sceneManager = new SceneManager();
        console.log('GameEngine: SceneManager initialized');
        
        // 注册场景
        this.sceneManager.registerScene('Login', new LoginScene());
        this.sceneManager.registerScene('Character', new CharacterScene());
        this.sceneManager.registerScene('Game', new GameScene(this));
        
        // 初始化网络管理器
        this.networkManager = new NetworkManager({
            useMockData: true,
            mockDelay: 100,
            debugMode: true
        });
        await this.networkManager.connect();
        console.log('GameEngine: NetworkManager initialized');
        
        // 加载初始资源（如果有）
        // 当前没有资源需要加载，后续任务会添加
        if (this.assetManager.loadQueue.length > 0) {
            await this.assetManager.loadAll();
        }
        
        // 切换到初始场景（登录场景）
        this.sceneManager.switchTo('Login');
        console.log('GameEngine: Switched to initial scene (Login)');
        
        console.log('GameEngine: Systems initialized');
    }

    /**
     * 启动游戏循环
     */
    start() {
        if (this.isRunning) {
            console.warn('GameEngine: Already running');
            return;
        }

        this.isRunning = true;
        this.lastFrameTime = performance.now();
        console.log('GameEngine: Starting game loop');
        
        // 启动游戏循环
        this.gameLoop(this.lastFrameTime);
    }

    /**
     * 停止游戏循环
     */
    stop() {
        this.isRunning = false;
        console.log('GameEngine: Game loop stopped');
    }

    /**
     * 游戏循环
     */
    gameLoop(currentTime) {
        if (!this.isRunning) {
            return;
        }

        // 请求下一帧
        requestAnimationFrame((time) => this.gameLoop(time));

        // 计算时间差
        const deltaTime = currentTime - this.lastFrameTime;

        // 限制帧率到60 FPS
        if (deltaTime < this.frameInterval) {
            return;
        }

        // 更新最后帧时间
        this.lastFrameTime = currentTime - (deltaTime % this.frameInterval);

        // 转换为秒
        const dt = deltaTime / 1000;

        // 更新游戏状态
        this.update(dt);

        // 渲染游戏画面
        this.render();
    }

    /**
     * 更新游戏状态
     */
    update(deltaTime) {
        // 处理场景输入
        if (this.sceneManager && this.inputManager) {
            this.sceneManager.handleInput(this.inputManager);
        }
        
        // 更新场景管理器
        if (this.sceneManager) {
            this.sceneManager.update(deltaTime);
        }
        
        // 更新输入管理器（清除本帧状态）
        if (this.inputManager) {
            this.inputManager.update();
        }
    }

    /**
     * 渲染游戏画面
     */
    render() {
        // 清空Canvas
        this.ctx.fillStyle = '#1a1a2e';
        this.ctx.fillRect(0, 0, this.canvas.width, this.canvas.height);

        // 渲染场景
        if (this.sceneManager) {
            this.sceneManager.render(this.ctx);
        }
    }
}
