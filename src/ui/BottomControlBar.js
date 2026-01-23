/**
 * BottomControlBar.js
 * 底部控制栏 - 显示血量、蓝量和技能槽
 */

import { UIElement } from './UIElement.js';

/**
 * 底部控制栏
 */
export class BottomControlBar extends UIElement {
  /**
   * @param {Object} options - 配置选项
   */
  constructor(options = {}) {
    super({
      x: options.x || 0,
      y: options.y || 0,
      width: options.width || 800,
      height: options.height || 100,
      visible: options.visible !== false,
      zIndex: options.zIndex || 200
    });

    this.entity = null;
    
    // 血球配置
    this.hpOrb = {
      x: 60,
      y: 50,
      radius: 35,
      color: '#ff0000',
      glowColor: '#ff6666'
    };
    
    // 蓝球配置
    this.mpOrb = {
      x: this.width - 60,
      y: 50,
      radius: 35,
      color: '#0066ff',
      glowColor: '#6699ff'
    };
    
    // 技能槽配置（5个技能）
    this.skillSlots = [
      { x: this.width / 2 - 180, y: 50, size: 60, hotkey: '1', skillIndex: 0 },
      { x: this.width / 2 - 90, y: 50, size: 60, hotkey: '2', skillIndex: 1 },
      { x: this.width / 2, y: 50, size: 60, hotkey: '3', skillIndex: 2 },
      { x: this.width / 2 + 90, y: 50, size: 60, hotkey: '4', skillIndex: 3 },
      { x: this.width / 2 + 180, y: 50, size: 60, hotkey: '5', skillIndex: 4 }
    ];
    
    // 悬停状态
    this.hoveredSlot = -1;
    this.mouseX = 0;
    this.mouseY = 0;
    
    // 事件回调
    this.onSkillClick = options.onSkillClick || null;
  }

  /**
   * 设置实体
   * @param {Entity} entity - 实体对象
   */
  setEntity(entity) {
    this.entity = entity;
  }

  /**
   * 更新控制栏
   * @param {number} deltaTime - 帧间隔时间
   */
  update(deltaTime) {
    if (!this.visible || !this.entity) return;
  }

  /**
   * 渲染控制栏
   * @param {CanvasRenderingContext2D} ctx - 渲染上下文
   */
  render(ctx) {
    if (!this.visible) return;
    
    if (!this.entity) return;

    ctx.save();

    // 渲染背景
    this.renderBackground(ctx);
    
    // 渲染血球
    this.renderHpOrb(ctx);
    
    // 渲染蓝球
    this.renderMpOrb(ctx);
    
    // 渲染技能槽
    this.renderSkillSlots(ctx);

    ctx.restore();
  }

  /**
   * 渲染背景
   * @param {CanvasRenderingContext2D} ctx - 渲染上下文
   */
  renderBackground(ctx) {
    // 半透明黑色背景
    ctx.fillStyle = 'rgba(0, 0, 0, 0.5)';
    ctx.fillRect(this.x, this.y, this.width, this.height);
    
    // 顶部边框
    ctx.strokeStyle = '#444';
    ctx.lineWidth = 2;
    ctx.beginPath();
    ctx.moveTo(this.x, this.y);
    ctx.lineTo(this.x + this.width, this.y);
    ctx.stroke();
  }

  /**
   * 渲染血球
   * @param {CanvasRenderingContext2D} ctx - 渲染上下文
   */
  renderHpOrb(ctx) {
    if (!this.entity) return;
    
    const stats = this.entity.getComponent('stats');
    if (!stats) return;
    
    const hpRatio = stats.maxHp > 0 ? stats.hp / stats.maxHp : 0;
    const orbX = this.x + this.hpOrb.x;
    const orbY = this.y + this.hpOrb.y;
    const radius = this.hpOrb.radius;
    
    // 外发光效果
    const gradient = ctx.createRadialGradient(orbX, orbY, 0, orbX, orbY, radius + 10);
    gradient.addColorStop(0, this.hpOrb.glowColor);
    gradient.addColorStop(0.7, this.hpOrb.color);
    gradient.addColorStop(1, 'rgba(255, 0, 0, 0)');
    
    ctx.fillStyle = gradient;
    ctx.beginPath();
    ctx.arc(orbX, orbY, radius + 10, 0, Math.PI * 2);
    ctx.fill();
    
    // 球体背景（暗色）
    ctx.fillStyle = '#330000';
    ctx.beginPath();
    ctx.arc(orbX, orbY, radius, 0, Math.PI * 2);
    ctx.fill();
    
    // 血量填充（从下往上）
    if (hpRatio > 0) {
      ctx.save();
      ctx.beginPath();
      ctx.arc(orbX, orbY, radius, 0, Math.PI * 2);
      ctx.clip();
      
      const fillHeight = radius * 2 * hpRatio;
      const fillY = orbY + radius - fillHeight;
      
      const hpGradient = ctx.createLinearGradient(orbX, fillY, orbX, orbY + radius);
      hpGradient.addColorStop(0, '#ff6666');
      hpGradient.addColorStop(1, '#cc0000');
      
      ctx.fillStyle = hpGradient;
      ctx.fillRect(orbX - radius, fillY, radius * 2, fillHeight);
      
      ctx.restore();
    }
    
    // 球体边框
    ctx.strokeStyle = '#ff0000';
    ctx.lineWidth = 3;
    ctx.beginPath();
    ctx.arc(orbX, orbY, radius, 0, Math.PI * 2);
    ctx.stroke();
    
    // 高光效果
    ctx.fillStyle = 'rgba(255, 255, 255, 0.3)';
    ctx.beginPath();
    ctx.arc(orbX - 10, orbY - 10, 12, 0, Math.PI * 2);
    ctx.fill();
    
    // 血量文字
    ctx.fillStyle = '#ffffff';
    ctx.font = 'bold 14px Arial';
    ctx.textAlign = 'center';
    ctx.textBaseline = 'middle';
    ctx.fillText(`${Math.floor(stats.hp)}/${stats.maxHp}`, orbX, orbY);
  }

  /**
   * 渲染蓝球
   * @param {CanvasRenderingContext2D} ctx - 渲染上下文
   */
  renderMpOrb(ctx) {
    if (!this.entity) return;
    
    const stats = this.entity.getComponent('stats');
    if (!stats) return;
    
    const mpRatio = stats.maxMp > 0 ? stats.mp / stats.maxMp : 0;
    const orbX = this.x + this.mpOrb.x;
    const orbY = this.y + this.mpOrb.y;
    const radius = this.mpOrb.radius;
    
    // 外发光效果
    const gradient = ctx.createRadialGradient(orbX, orbY, 0, orbX, orbY, radius + 10);
    gradient.addColorStop(0, this.mpOrb.glowColor);
    gradient.addColorStop(0.7, this.mpOrb.color);
    gradient.addColorStop(1, 'rgba(0, 102, 255, 0)');
    
    ctx.fillStyle = gradient;
    ctx.beginPath();
    ctx.arc(orbX, orbY, radius + 10, 0, Math.PI * 2);
    ctx.fill();
    
    // 球体背景（暗色）
    ctx.fillStyle = '#000033';
    ctx.beginPath();
    ctx.arc(orbX, orbY, radius, 0, Math.PI * 2);
    ctx.fill();
    
    // 蓝量填充（从下往上）
    if (mpRatio > 0) {
      ctx.save();
      ctx.beginPath();
      ctx.arc(orbX, orbY, radius, 0, Math.PI * 2);
      ctx.clip();
      
      const fillHeight = radius * 2 * mpRatio;
      const fillY = orbY + radius - fillHeight;
      
      const mpGradient = ctx.createLinearGradient(orbX, fillY, orbX, orbY + radius);
      mpGradient.addColorStop(0, '#6699ff');
      mpGradient.addColorStop(1, '#0044cc');
      
      ctx.fillStyle = mpGradient;
      ctx.fillRect(orbX - radius, fillY, radius * 2, fillHeight);
      
      ctx.restore();
    }
    
    // 球体边框
    ctx.strokeStyle = '#0066ff';
    ctx.lineWidth = 3;
    ctx.beginPath();
    ctx.arc(orbX, orbY, radius, 0, Math.PI * 2);
    ctx.stroke();
    
    // 高光效果
    ctx.fillStyle = 'rgba(255, 255, 255, 0.3)';
    ctx.beginPath();
    ctx.arc(orbX - 10, orbY - 10, 12, 0, Math.PI * 2);
    ctx.fill();
    
    // 蓝量文字
    ctx.fillStyle = '#ffffff';
    ctx.font = 'bold 14px Arial';
    ctx.textAlign = 'center';
    ctx.textBaseline = 'middle';
    ctx.fillText(`${Math.floor(stats.mp)}/${stats.maxMp}`, orbX, orbY);
  }

  /**
   * 渲染技能槽
   * @param {CanvasRenderingContext2D} ctx - 渲染上下文
   */
  renderSkillSlots(ctx) {
    if (!this.entity) return;
    
    const combat = this.entity.getComponent('combat');
    if (!combat || !combat.skills) return;
    
    for (let i = 0; i < this.skillSlots.length; i++) {
      const slot = this.skillSlots[i];
      const slotX = this.x + slot.x;
      const slotY = this.y + slot.y;
      const halfSize = slot.size / 2;
      
      // 获取对应的技能（使用索引0-4）
      const skill = combat.skills[slot.skillIndex];
      
      const isHovered = this.hoveredSlot === i;
      
      // 槽位背景
      ctx.fillStyle = isHovered ? 'rgba(100, 100, 100, 0.8)' : 'rgba(50, 50, 50, 0.8)';
      ctx.fillRect(slotX - halfSize, slotY - halfSize, slot.size, slot.size);
      
      // 槽位边框
      ctx.strokeStyle = isHovered ? '#ffffff' : '#666';
      ctx.lineWidth = 2;
      ctx.strokeRect(slotX - halfSize, slotY - halfSize, slot.size, slot.size);
      
      // 渲染技能
      if (skill) {
        this.renderSkill(ctx, skill, slotX, slotY, slot.size, combat);
      }
      
      // 快捷键提示
      ctx.fillStyle = '#ffffff';
      ctx.font = 'bold 12px Arial';
      ctx.textAlign = 'center';
      ctx.fillText(slot.hotkey, slotX, slotY + halfSize + 15);
    }
  }

  /**
   * 渲染技能
   * @param {CanvasRenderingContext2D} ctx - 渲染上下文
   * @param {Object} skill - 技能对象
   * @param {number} x - X坐标
   * @param {number} y - Y坐标
   * @param {number} size - 尺寸
   * @param {Object} combatComponent - 战斗组件
   */
  renderSkill(ctx, skill, x, y, size, combatComponent) {
    const halfSize = size / 2;
    
    // 技能图标（简化为图形）
    this.renderSkillIcon(ctx, skill, x, y, size);
    
    // 冷却遮罩
    const currentTime = performance.now();
    const cooldownMs = combatComponent.getSkillCooldownRemaining(skill.id, currentTime);
    const cooldown = cooldownMs / 1000; // 转换为秒
    
    if (cooldown > 0) {
      const cooldownRatio = cooldown / skill.cooldown;
      
      ctx.save();
      ctx.globalAlpha = 0.7;
      ctx.fillStyle = '#000000';
      
      // 绘制扇形遮罩
      ctx.beginPath();
      ctx.moveTo(x, y);
      ctx.arc(x, y, halfSize, -Math.PI / 2, -Math.PI / 2 + Math.PI * 2 * cooldownRatio);
      ctx.closePath();
      ctx.fill();
      
      ctx.restore();
      
      // 冷却时间文字
      ctx.fillStyle = '#ffffff';
      ctx.font = 'bold 16px Arial';
      ctx.textAlign = 'center';
      ctx.textBaseline = 'middle';
      ctx.fillText(cooldown.toFixed(1), x, y);
    }
    
    // 魔法消耗
    if (skill.manaCost > 0) {
      ctx.fillStyle = '#00ccff';
      ctx.font = '10px Arial';
      ctx.textAlign = 'right';
      ctx.fillText(skill.manaCost, x + halfSize - 3, y - halfSize + 12);
    }
  }

  /**
   * 渲染技能图标
   * @param {CanvasRenderingContext2D} ctx - 渲染上下文
   * @param {Object} skill - 技能对象
   * @param {number} x - X坐标
   * @param {number} y - Y坐标
   * @param {number} size - 尺寸
   */
  renderSkillIcon(ctx, skill, x, y, size) {
    const halfSize = size / 2;
    
    // 根据技能类型显示不同图标
    ctx.save();
    ctx.translate(x, y);
    
    if (skill.effectType === 'flame_palm') {
      // 火焰掌 - 火焰图标
      ctx.fillStyle = '#ff6600';
      ctx.beginPath();
      ctx.arc(0, 0, 15, 0, Math.PI * 2);
      ctx.fill();
      
      ctx.fillStyle = '#ffaa00';
      ctx.font = 'bold 24px Arial';
      ctx.textAlign = 'center';
      ctx.textBaseline = 'middle';
      ctx.fillText('🔥', 0, 0);
    } else if (skill.effectType === 'one_yang_finger') {
      // 一阳指 - 金色光束图标
      ctx.fillStyle = '#ffdd00';
      ctx.beginPath();
      ctx.moveTo(0, -15);
      ctx.lineTo(5, 0);
      ctx.lineTo(0, 15);
      ctx.lineTo(-5, 0);
      ctx.closePath();
      ctx.fill();
      
      ctx.fillStyle = '#ffffff';
      ctx.font = 'bold 24px Arial';
      ctx.textAlign = 'center';
      ctx.textBaseline = 'middle';
      ctx.fillText('☀', 0, 0);
    } else if (skill.effectType === 'inferno_palm') {
      // 烈焰掌 - 爆炸图标
      ctx.fillStyle = '#ff0000';
      for (let i = 0; i < 8; i++) {
        const angle = (i / 8) * Math.PI * 2;
        ctx.beginPath();
        ctx.arc(Math.cos(angle) * 8, Math.sin(angle) * 8, 5, 0, Math.PI * 2);
        ctx.fill();
      }
      
      ctx.fillStyle = '#ffff00';
      ctx.font = 'bold 24px Arial';
      ctx.textAlign = 'center';
      ctx.textBaseline = 'middle';
      ctx.fillText('💥', 0, 0);
    } else if (skill.effectType === 'heal') {
      // 治疗 - 绿色十字图标
      ctx.fillStyle = '#00ff00';
      ctx.fillRect(-3, -15, 6, 30);
      ctx.fillRect(-15, -3, 30, 6);
      
      ctx.fillStyle = '#ffffff';
      ctx.font = 'bold 24px Arial';
      ctx.textAlign = 'center';
      ctx.textBaseline = 'middle';
      ctx.fillText('💚', 0, 0);
    } else if (skill.effectType === 'meditation') {
      // 打坐 - 烟雾图标
      ctx.fillStyle = '#88ccff';
      ctx.beginPath();
      ctx.arc(-8, 0, 8, 0, Math.PI * 2);
      ctx.arc(0, -5, 8, 0, Math.PI * 2);
      ctx.arc(8, 0, 8, 0, Math.PI * 2);
      ctx.fill();
      
      ctx.fillStyle = '#ffffff';
      ctx.font = 'bold 20px Arial';
      ctx.textAlign = 'center';
      ctx.textBaseline = 'middle';
      ctx.fillText('🧘', 0, 0);
    } else if (skill.effectType === 'fireball') {
      // 火球术 - 火焰图标（旧技能）
      ctx.fillStyle = '#ff6600';
      ctx.beginPath();
      ctx.arc(0, 0, 15, 0, Math.PI * 2);
      ctx.fill();
      
      ctx.fillStyle = '#ffaa00';
      ctx.font = 'bold 24px Arial';
      ctx.textAlign = 'center';
      ctx.textBaseline = 'middle';
      ctx.fillText('🔥', 0, 0);
    } else if (skill.effectType === 'ice_lance') {
      // 寒冰箭 - 冰晶图标（旧技能）
      ctx.fillStyle = '#00ccff';
      ctx.beginPath();
      ctx.moveTo(0, -15);
      ctx.lineTo(10, 0);
      ctx.lineTo(0, 15);
      ctx.lineTo(-10, 0);
      ctx.closePath();
      ctx.fill();
      
      ctx.fillStyle = '#ffffff';
      ctx.font = 'bold 24px Arial';
      ctx.textAlign = 'center';
      ctx.textBaseline = 'middle';
      ctx.fillText('❄', 0, 0);
    } else if (skill.effectType === 'flame_burst') {
      // 烈焰爆发 - 爆炸图标（旧技能）
      ctx.fillStyle = '#ff0000';
      for (let i = 0; i < 8; i++) {
        const angle = (i / 8) * Math.PI * 2;
        ctx.beginPath();
        ctx.arc(Math.cos(angle) * 8, Math.sin(angle) * 8, 5, 0, Math.PI * 2);
        ctx.fill();
      }
      
      ctx.fillStyle = '#ffff00';
      ctx.font = 'bold 24px Arial';
      ctx.textAlign = 'center';
      ctx.textBaseline = 'middle';
      ctx.fillText('💥', 0, 0);
    } else {
      // 默认图标
      ctx.fillStyle = '#888888';
      ctx.fillRect(-halfSize + 5, -halfSize + 5, size - 10, size - 10);
    }
    
    ctx.restore();
  }

  /**
   * 处理鼠标移动
   * @param {number} x - 鼠标X坐标
   * @param {number} y - 鼠标Y坐标
   */
  handleMouseMove(x, y) {
    if (!this.visible) return;

    this.mouseX = x;
    this.mouseY = y;
    this.hoveredSlot = -1;

    // 检查是否悬停在技能槽上
    for (let i = 0; i < this.skillSlots.length; i++) {
      const slot = this.skillSlots[i];
      const slotX = this.x + slot.x;
      const slotY = this.y + slot.y;
      const halfSize = slot.size / 2;

      if (x >= slotX - halfSize && x <= slotX + halfSize &&
          y >= slotY - halfSize && y <= slotY + halfSize) {
        this.hoveredSlot = i;
        break;
      }
    }
  }

  /**
   * 处理鼠标点击
   * @param {number} x - 鼠标X坐标
   * @param {number} y - 鼠标Y坐标
   * @returns {boolean} 是否处理了点击
   */
  handleMouseClick(x, y) {
    if (!this.visible || !this.containsPoint(x, y)) return false;

    // 检查技能槽点击
    for (let i = 0; i < this.skillSlots.length; i++) {
      const slot = this.skillSlots[i];
      const slotX = this.x + slot.x;
      const slotY = this.y + slot.y;
      const halfSize = slot.size / 2;

      if (x >= slotX - halfSize && x <= slotX + halfSize &&
          y >= slotY - halfSize && y <= slotY + halfSize) {
        
        if (this.onSkillClick && this.entity) {
          const combat = this.entity.getComponent('combat');
          if (combat && combat.skills) {
            const skill = combat.skills[slot.skillIndex];
            if (skill) {
              this.onSkillClick(skill);
            }
          }
        }
        
        return true;
      }
    }

    return true; // 阻止事件传播
  }

  /**
   * 切换显示状态
   */
  toggle() {
    this.visible = !this.visible;
  }

  /**
   * 显示控制栏
   */
  show() {
    this.visible = true;
  }

  /**
   * 隐藏控制栏
   */
  hide() {
    this.visible = false;
  }
}
