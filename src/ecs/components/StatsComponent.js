/**
 * StatsComponent.js
 * 属性组件 - 管理实体的生命值、魔法值和战斗属性
 */

import { Component } from '../Component.js';

/**
 * 属性组件
 * 存储角色的各项属性数据
 */
export class StatsComponent extends Component {
  /**
   * @param {Object} stats - 属性配置
   * @param {number} stats.maxHp - 最大生命值
   * @param {number} stats.maxMp - 最大魔法值
   * @param {number} stats.attack - 攻击力
   * @param {number} stats.defense - 防御力
   * @param {number} stats.speed - 移动速度
   * @param {number} stats.level - 等级
   * @param {number} stats.exp - 经验值
   */
  constructor(stats = {}) {
    super('stats');
    
    // 生命值和魔法值
    this.maxHp = stats.maxHp || 100;
    this.hp = stats.hp !== undefined ? stats.hp : this.maxHp;
    this.maxMp = stats.maxMp || 100;
    this.mp = stats.mp !== undefined ? stats.mp : this.maxMp;
    
    // 战斗属性
    this.attack = stats.attack || 10;
    this.defense = stats.defense || 5;
    this.speed = stats.speed || 100;
    
    // 等级和经验
    this.level = stats.level || 1;
    this.exp = stats.exp || 0;
  }

  /**
   * 受到伤害
   * @param {number} damage - 伤害值
   * @returns {number} 实际受到的伤害
   */
  takeDamage(damage) {
    const actualDamage = Math.max(0, damage);
    this.hp = Math.max(0, this.hp - actualDamage);
    return actualDamage;
  }

  /**
   * 恢复生命值
   * @param {number} amount - 恢复量
   * @returns {number} 实际恢复量
   */
  heal(amount) {
    const oldHp = this.hp;
    this.hp = Math.min(this.maxHp, this.hp + amount);
    return this.hp - oldHp;
  }

  /**
   * 消耗魔法值
   * @param {number} amount - 消耗量
   * @returns {boolean} 是否成功消耗
   */
  consumeMana(amount) {
    if (this.mp >= amount) {
      this.mp -= amount;
      return true;
    }
    return false;
  }

  /**
   * 恢复魔法值
   * @param {number} amount - 恢复量
   * @returns {number} 实际恢复量
   */
  restoreMana(amount) {
    const oldMp = this.mp;
    this.mp = Math.min(this.maxMp, this.mp + amount);
    return this.mp - oldMp;
  }

  /**
   * 检查是否存活
   * @returns {boolean}
   */
  isAlive() {
    return this.hp > 0;
  }

  /**
   * 检查是否死亡
   * @returns {boolean}
   */
  isDead() {
    return this.hp <= 0;
  }

  /**
   * 获取生命值百分比
   * @returns {number} 0-1之间的值
   */
  getHpPercent() {
    return this.maxHp > 0 ? this.hp / this.maxHp : 0;
  }

  /**
   * 获取魔法值百分比
   * @returns {number} 0-1之间的值
   */
  getMpPercent() {
    return this.maxMp > 0 ? this.mp / this.maxMp : 0;
  }

  /**
   * 增加经验值
   * @param {number} amount - 经验值
   */
  addExp(amount) {
    this.exp += amount;
  }

  /**
   * 升级
   */
  levelUp() {
    this.level++;
    // 升级时恢复满血满蓝
    this.hp = this.maxHp;
    this.mp = this.maxMp;
  }

  /**
   * 完全恢复
   */
  fullRestore() {
    this.hp = this.maxHp;
    this.mp = this.maxMp;
  }
}
