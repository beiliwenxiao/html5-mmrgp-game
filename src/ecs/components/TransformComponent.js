/**
 * TransformComponent.js
 * 变换组件 - 管理实体的位置、旋转和缩放
 */

import { Component } from '../Component.js';

/**
 * 变换组件
 * 存储实体的空间变换信息
 */
export class TransformComponent extends Component {
  /**
   * @param {number|Object} x - X坐标或配置对象 {x, y, rotation, scaleX, scaleY}
   * @param {number} y - Y坐标
   * @param {number} rotation - 旋转角度（弧度）
   * @param {number} scaleX - X轴缩放
   * @param {number} scaleY - Y轴缩放
   */
  constructor(x = 0, y = 0, rotation = 0, scaleX = 1, scaleY = 1) {
    super('transform');
    
    // 支持对象参数
    if (typeof x === 'object' && x !== null) {
      const config = x;
      this.position = { x: config.x || 0, y: config.y || 0 };
      this.rotation = config.rotation || 0;
      this.scale = { 
        x: config.scaleX || config.scale?.x || 1, 
        y: config.scaleY || config.scale?.y || 1 
      };
    } else {
      // 传统的独立参数
      this.position = { x, y };
      this.rotation = rotation;
      this.scale = { x: scaleX, y: scaleY };
    }
  }

  /**
   * 设置位置
   * @param {number} x - X坐标
   * @param {number} y - Y坐标
   */
  setPosition(x, y) {
    this.position.x = x;
    this.position.y = y;
  }

  /**
   * 移动位置
   * @param {number} dx - X轴偏移
   * @param {number} dy - Y轴偏移
   */
  translate(dx, dy) {
    this.position.x += dx;
    this.position.y += dy;
  }

  /**
   * 设置旋转
   * @param {number} rotation - 旋转角度（弧度）
   */
  setRotation(rotation) {
    this.rotation = rotation;
  }

  /**
   * 旋转
   * @param {number} angle - 旋转角度增量（弧度）
   */
  rotate(angle) {
    this.rotation += angle;
  }

  /**
   * 设置缩放
   * @param {number} scaleX - X轴缩放
   * @param {number} scaleY - Y轴缩放
   */
  setScale(scaleX, scaleY = scaleX) {
    this.scale.x = scaleX;
    this.scale.y = scaleY;
  }

  /**
   * 获取世界坐标
   * @returns {{x: number, y: number}}
   */
  getWorldPosition() {
    return { ...this.position };
  }
}
