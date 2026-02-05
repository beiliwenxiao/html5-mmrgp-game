/**
 * 场景管理器
 * 负责场景注册、切换和生命周期管理
 */
export class SceneManager {
    constructor() {
        this.scenes = new Map();
        this.currentScene = null;
        this.nextScene = null;
        this.transitionData = null;
        
        // 转场效果配置
        this.isTransitioning = false;
        this.transitionDuration = 0.5; // 秒
        this.transitionProgress = 0;
        this.transitionPhase = 'fadeOut'; // 'fadeOut' or 'fadeIn'
    }

    /**
     * 注册场景
     * @param {string} name - 场景名称
     * @param {Scene} scene - 场景实例
     */
    registerScene(name, scene) {
        if (this.scenes.has(name)) {
            console.warn(`SceneManager: Scene "${name}" already registered`);
            return;
        }
        
        this.scenes.set(name, scene);
        console.log(`SceneManager: Registered scene "${name}"`);
    }

    /**
     * 切换到指定场景
     * @param {string} name - 场景名称
     * @param {Object} data - 传递给新场景的数据
     */
    switchTo(name, data = null) {
        if (!this.scenes.has(name)) {
            console.error(`SceneManager: Scene "${name}" not found`);
            return;
        }

        if (this.isTransitioning) {
            console.warn('SceneManager: Already transitioning');
            return;
        }

        const nextScene = this.scenes.get(name);
        
        // 如果没有当前场景，直接进入新场景
        if (!this.currentScene) {
            this.currentScene = nextScene;
            this.currentScene.enter(data);
            console.log(`SceneManager: Entered scene "${name}"`);
            return;
        }

        // 如果切换到相同场景，重新进入（允许传递新数据）
        if (this.currentScene === nextScene) {
            console.log(`SceneManager: Re-entering scene "${name}" with new data`);
            this.currentScene.exit();
            this.currentScene.enter(data);
            return;
        }

        // 开始转场
        this.nextScene = nextScene;
        this.transitionData = data;
        this.isTransitioning = true;
        this.transitionProgress = 0;
        this.transitionPhase = 'fadeOut';
        
        console.log(`SceneManager: Transitioning from "${this.currentScene.name}" to "${name}"`);
        console.log(`SceneManager: Transition data stored:`, this.transitionData);
    }

    /**
     * 更新场景管理器
     * @param {number} deltaTime - 时间增量（秒）
     */
    update(deltaTime) {
        // 处理转场效果
        if (this.isTransitioning) {
            this.updateTransition(deltaTime);
            return;
        }

        // 更新当前场景
        if (this.currentScene && this.currentScene.isActive) {
            this.currentScene.update(deltaTime);
        } else if (this.currentScene && !this.currentScene.isActive) {
            console.warn('SceneManager: 场景存在但未激活！', this.currentScene.name);
        }
    }

    /**
     * 更新转场效果
     * @param {number} deltaTime - 时间增量（秒）
     */
    updateTransition(deltaTime) {
        this.transitionProgress += deltaTime / this.transitionDuration;

        if (this.transitionProgress >= 1) {
            this.transitionProgress = 1;

            if (this.transitionPhase === 'fadeOut') {
                // 淡出完成，切换场景
                if (this.currentScene) {
                    this.currentScene.exit();
                }
                
                this.currentScene = this.nextScene;
                console.log(`SceneManager: Entering scene "${this.currentScene.name}" with data:`, this.transitionData);
                this.currentScene.enter(this.transitionData);
                
                // 开始淡入
                this.transitionPhase = 'fadeIn';
                this.transitionProgress = 0;
            } else {
                // 淡入完成，结束转场
                this.isTransitioning = false;
                this.nextScene = null;
                this.transitionData = null;
                this.transitionProgress = 0;
            }
        }
    }

    /**
     * 渲染场景
     * @param {CanvasRenderingContext2D} ctx - Canvas渲染上下文
     */
    render(ctx) {
        // 渲染当前场景
        if (this.currentScene) {
            this.currentScene.render(ctx);
        }

        // 渲染转场效果
        if (this.isTransitioning) {
            this.renderTransition(ctx);
        }
    }

    /**
     * 渲染转场效果（淡入淡出）
     * @param {CanvasRenderingContext2D} ctx - Canvas渲染上下文
     */
    renderTransition(ctx) {
        const canvas = ctx.canvas;
        let alpha;

        if (this.transitionPhase === 'fadeOut') {
            // 淡出：从透明到不透明
            alpha = this.transitionProgress;
        } else {
            // 淡入：从不透明到透明
            alpha = 1 - this.transitionProgress;
        }

        ctx.fillStyle = `rgba(0, 0, 0, ${alpha})`;
        ctx.fillRect(0, 0, canvas.width, canvas.height);
    }

    /**
     * 处理输入
     * @param {InputManager} inputManager - 输入管理器
     */
    handleInput(inputManager) {
        // 转场期间不处理输入
        if (this.isTransitioning) {
            return;
        }

        // 传递输入到当前场景
        if (this.currentScene && this.currentScene.isActive) {
            this.currentScene.handleInput(inputManager);
        }
    }

    /**
     * 获取当前场景
     * @returns {Scene|null}
     */
    getCurrentScene() {
        return this.currentScene;
    }

    /**
     * 检查是否正在转场
     * @returns {boolean}
     */
    isInTransition() {
        return this.isTransitioning;
    }
}
