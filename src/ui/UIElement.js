/**
 * UI元素基类
 * 所有UI组件的基础类，定义位置、尺寸、可见性等基本属性
 */
export class UIElement {
  /**
   * @param {Object} options - UI元素配置
   * @param {number} options.x - X坐标
   * @param {number} options.y - Y坐标
   * @param {number} options.width - 宽度
   * @param {number} options.height - 高度
   * @param {boolean} [options.visible=true] - 是否可见
   * @param {number} [options.zIndex=0] - 渲染层级
   */
  constructor(options = {}) {
    this.x = options.x || 0;
    this.y = options.y || 0;
    this.width = options.width || 100;
    this.height = options.height || 50;
    this.visible = options.visible !== undefined ? options.visible : true;
    this.zIndex = options.zIndex || 0;
    this.alpha = options.alpha !== undefined ? options.alpha : 1.0;
  }

  /**
   * 更新UI元素
   * @param {number} deltaTime - 帧间隔时间（毫秒）
   */
  update(deltaTime) {
    // 子类实现具体更新逻辑
  }

  /**
   * 渲染UI元素
   * @param {CanvasRenderingContext2D} ctx - Canvas渲染上下文
   */
  render(ctx) {
    // 子类实现具体渲染逻辑
  }

  /**
   * 显示UI元素
   */
  show() {
    this.visible = true;
  }

  /**
   * 隐藏UI元素
   */
  hide() {
    this.visible = false;
  }

  /**
   * 切换UI元素显示状态
   */
  toggle() {
    this.visible = !this.visible;
  }

  /**
   * 设置位置
   * @param {number} x - X坐标
   * @param {number} y - Y坐标
   */
  setPosition(x, y) {
    this.x = x;
    this.y = y;
  }

  /**
   * 设置尺寸
   * @param {number} width - 宽度
   * @param {number} height - 高度
   */
  setSize(width, height) {
    this.width = width;
    this.height = height;
  }

  /**
   * 检查点是否在UI元素内
   * @param {number} x - X坐标
   * @param {number} y - Y坐标
   * @returns {boolean}
   */
  containsPoint(x, y) {
    return x >= this.x && x <= this.x + this.width &&
           y >= this.y && y <= this.y + this.height;
  }
}
