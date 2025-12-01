/**
 * Particle - 粒子类
 * 表示单个粒子的属性和行为
 */
export class Particle {
  /**
   * @param {Object} config - 粒子配置
   * @param {Object} config.position - 初始位置 {x, y}
   * @param {Object} config.velocity - 初始速度 {x, y}
   * @param {number} config.life - 生命周期（毫秒）
   * @param {number} config.size - 粒子大小
   * @param {string} config.color - 粒子颜色
   * @param {number} [config.alpha=1] - 初始透明度
   * @param {number} [config.gravity=0] - 重力加速度
   * @param {number} [config.friction=1] - 摩擦系数
   */
  constructor(config) {
    this.position = { ...config.position };
    this.velocity = { ...config.velocity };
    this.life = config.life;
    this.maxLife = config.life;
    this.size = config.size;
    this.color = config.color;
    this.alpha = config.alpha !== undefined ? config.alpha : 1;
    this.initialAlpha = this.alpha;
    this.gravity = config.gravity || 0;
    this.friction = config.friction !== undefined ? config.friction : 1;
    this.active = true;
  }

  /**
   * 更新粒子状态
   * @param {number} deltaTime - 时间增量（秒）
   */
  update(deltaTime) {
    if (!this.active) return;

    // 更新生命周期
    this.life -= deltaTime * 1000;
    if (this.life <= 0) {
      this.active = false;
      return;
    }

    // 应用重力
    this.velocity.y += this.gravity * deltaTime;

    // 应用摩擦
    this.velocity.x *= this.friction;
    this.velocity.y *= this.friction;

    // 更新位置
    this.position.x += this.velocity.x * deltaTime;
    this.position.y += this.velocity.y * deltaTime;

    // 更新透明度（随生命周期衰减）
    const lifeRatio = this.life / this.maxLife;
    this.alpha = this.initialAlpha * lifeRatio;
  }

  /**
   * 渲染粒子
   * @param {CanvasRenderingContext2D} ctx - Canvas 渲染上下文
   * @param {Object} camera - 相机对象
   */
  render(ctx, camera) {
    if (!this.active) return;

    // 获取视野边界
    const viewBounds = camera.getViewBounds();
    const screenX = this.position.x - viewBounds.left;
    const screenY = this.position.y - viewBounds.top;

    ctx.save();
    ctx.globalAlpha = this.alpha;
    ctx.fillStyle = this.color;
    ctx.beginPath();
    ctx.arc(screenX, screenY, this.size, 0, Math.PI * 2);
    ctx.fill();
    ctx.restore();
  }

  /**
   * 重置粒子（用于对象池）
   * @param {Object} config - 新的粒子配置
   */
  reset(config) {
    this.position = { ...config.position };
    this.velocity = { ...config.velocity };
    this.life = config.life;
    this.maxLife = config.life;
    this.size = config.size;
    this.color = config.color;
    this.alpha = config.alpha !== undefined ? config.alpha : 1;
    this.initialAlpha = this.alpha;
    this.gravity = config.gravity || 0;
    this.friction = config.friction !== undefined ? config.friction : 1;
    this.active = true;
  }
}
