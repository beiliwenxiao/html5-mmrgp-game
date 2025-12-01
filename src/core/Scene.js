/**
 * 场景基类
 * 所有游戏场景都应继承此类
 */
export class Scene {
    constructor(name) {
        this.name = name;
        this.isActive = false;
    }

    /**
     * 场景进入时调用
     * @param {Object} data - 从上一个场景传递的数据
     */
    enter(data = null) {
        this.isActive = true;
        console.log(`Scene: Entering ${this.name}`);
    }

    /**
     * 更新场景逻辑
     * @param {number} deltaTime - 时间增量（秒）
     */
    update(deltaTime) {
        // 子类实现
    }

    /**
     * 渲染场景
     * @param {CanvasRenderingContext2D} ctx - Canvas渲染上下文
     */
    render(ctx) {
        // 子类实现
    }

    /**
     * 场景退出时调用
     */
    exit() {
        this.isActive = false;
        console.log(`Scene: Exiting ${this.name}`);
    }

    /**
     * 处理输入事件
     * @param {InputManager} inputManager - 输入管理器
     */
    handleInput(inputManager) {
        // 子类可选实现
    }
}
