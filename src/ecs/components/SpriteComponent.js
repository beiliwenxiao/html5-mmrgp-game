/**
 * SpriteComponent.js
 * 精灵组件 - 管理实体的精灵图和动画状态
 */

import { Component } from '../Component.js';

/**
 * 精灵组件
 * 存储精灵渲染所需的信息
 */
export class SpriteComponent extends Component {
  /**
   * @param {string} spriteSheet - 精灵图集名称
   * @param {Object} config - 配置
   */
  constructor(spriteSheet, config = {}) {
    super('sprite');
    
    this.spriteSheet = spriteSheet;
    this.currentAnimation = config.defaultAnimation || 'idle';
    this.frame = 0;
    this.frameTime = 0;
    this.animations = new Map();
    
    // 渲染属性
    this.width = config.width || 32;
    this.height = config.height || 32;
    this.offsetX = config.offsetX || 0;
    this.offsetY = config.offsetY || 0;
    this.flipX = false;
    this.flipY = false;
    this.alpha = 1.0;
    this.tint = null; // 颜色叠加
    
    // 九宫格方向支持
    this.useDirectionalSprite = config.useDirectionalSprite || false;
    this.direction = config.direction || 'down'; // up, down, left, right, up-left, up-right, down-left, down-right
    this.directionFrameMap = config.directionFrameMap || {
      'up-left': 0,
      'up': 1,
      'up-right': 2,
      'left': 3,
      'idle': 4,
      'down': 4,  // 默认朝下
      'right': 5,
      'down-left': 6,
      'down-right': 8
    };
    
    // 可见性
    this.visible = true;
  }

  /**
   * 添加动画
   * @param {string} name - 动画名称
   * @param {Object} animation - 动画数据
   * @param {number[]} animation.frames - 帧序列
   * @param {number} animation.frameRate - 帧率（帧/秒）
   * @param {boolean} animation.loop - 是否循环
   */
  addAnimation(name, animation) {
    this.animations.set(name, {
      frames: animation.frames || [0],
      frameRate: animation.frameRate || 10,
      loop: animation.loop !== undefined ? animation.loop : true,
      frameDuration: 1000 / (animation.frameRate || 10)
    });
  }

  /**
   * 播放动画
   * @param {string} name - 动画名称
   * @param {boolean} force - 是否强制重新播放
   */
  playAnimation(name, force = false) {
    if (!this.animations.has(name)) {
      console.warn(`Animation "${name}" not found`);
      return;
    }
    
    if (this.currentAnimation !== name || force) {
      this.currentAnimation = name;
      this.frame = 0;
      this.frameTime = 0;
    }
  }

  /**
   * 更新动画
   * @param {number} deltaTime - 帧间隔时间（毫秒）
   */
  update(deltaTime) {
    if (!this.visible) return;
    
    const animation = this.animations.get(this.currentAnimation);
    if (!animation) return;
    
    this.frameTime += deltaTime;
    
    if (this.frameTime >= animation.frameDuration) {
      this.frameTime -= animation.frameDuration;
      this.frame++;
      
      if (this.frame >= animation.frames.length) {
        if (animation.loop) {
          this.frame = 0;
        } else {
          this.frame = animation.frames.length - 1;
        }
      }
    }
  }

  /**
   * 获取当前帧索引
   * @returns {number}
   */
  getCurrentFrame() {
    // 如果使用方向精灵，返回方向对应的帧
    if (this.useDirectionalSprite) {
      return this.directionFrameMap[this.direction] || this.directionFrameMap['idle'];
    }
    
    const animation = this.animations.get(this.currentAnimation);
    if (!animation) return 0;
    return animation.frames[this.frame] || 0;
  }

  /**
   * 设置精灵方向（用于九宫格精灵）
   * @param {string} direction - 方向 (up, down, left, right, up-left, up-right, down-left, down-right)
   */
  setDirection(direction) {
    if (this.useDirectionalSprite) {
      this.direction = direction;
    }
  }

  /**
   * 根据速度向量设置方向
   * @param {number} vx - X方向速度
   * @param {number} vy - Y方向速度
   */
  setDirectionFromVelocity(vx, vy) {
    if (!this.useDirectionalSprite) return;
    
    // 如果速度为0，保持当前方向
    if (vx === 0 && vy === 0) {
      return;
    }
    
    // 计算角度
    const angle = Math.atan2(vy, vx);
    const degrees = angle * 180 / Math.PI;
    
    // 根据角度确定方向（8方向）
    if (degrees >= -22.5 && degrees < 22.5) {
      this.direction = 'right';
    } else if (degrees >= 22.5 && degrees < 67.5) {
      this.direction = 'down-right';
    } else if (degrees >= 67.5 && degrees < 112.5) {
      this.direction = 'down';
    } else if (degrees >= 112.5 && degrees < 157.5) {
      this.direction = 'down-left';
    } else if (degrees >= 157.5 || degrees < -157.5) {
      this.direction = 'left';
    } else if (degrees >= -157.5 && degrees < -112.5) {
      this.direction = 'up-left';
    } else if (degrees >= -112.5 && degrees < -67.5) {
      this.direction = 'up';
    } else if (degrees >= -67.5 && degrees < -22.5) {
      this.direction = 'up-right';
    }
  }

  /**
   * 设置水平翻转
   * @param {boolean} flip - 是否翻转
   */
  setFlipX(flip) {
    this.flipX = flip;
  }

  /**
   * 设置垂直翻转
   * @param {boolean} flip - 是否翻转
   */
  setFlipY(flip) {
    this.flipY = flip;
  }

  /**
   * 设置透明度
   * @param {number} alpha - 透明度 (0-1)
   */
  setAlpha(alpha) {
    this.alpha = Math.max(0, Math.min(1, alpha));
  }

  /**
   * 设置颜色叠加
   * @param {string} color - 颜色值
   */
  setTint(color) {
    this.tint = color;
  }

  /**
   * 清除颜色叠加
   */
  clearTint() {
    this.tint = null;
  }

  /**
   * 显示精灵
   */
  show() {
    this.visible = true;
  }

  /**
   * 隐藏精灵
   */
  hide() {
    this.visible = false;
  }
}
