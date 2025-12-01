import { UIElement } from './UIElement.js';

/**
 * 技能栏组件
 * 显示角色的技能图标、冷却状态和快捷键
 */
export class SkillBar extends UIElement {
  /**
   * @param {Object} options - 配置选项
   * @param {Array} options.skills - 技能列表
   * @param {number} [options.slotSize=50] - 技能槽大小
   * @param {number} [options.slotSpacing=10] - 技能槽间距
   * @param {string} [options.backgroundColor='rgba(0, 0, 0, 0.7)'] - 背景颜色
   * @param {string} [options.borderColor='#ffffff'] - 边框颜色
   * @param {string} [options.cooldownColor='rgba(0, 0, 0, 0.6)'] - 冷却遮罩颜色
   */
  constructor(options = {}) {
    super(options);
    
    this.skills = options.skills || [];
    this.slotSize = options.slotSize || 50;
    this.slotSpacing = options.slotSpacing || 10;
    this.backgroundColor = options.backgroundColor || 'rgba(0, 0, 0, 0.7)';
    this.borderColor = options.borderColor || '#ffffff';
    this.cooldownColor = options.cooldownColor || 'rgba(0, 0, 0, 0.6)';
    this.insufficientManaColor = options.insufficientManaColor || '#ff0000';
    
    this.borderWidth = 2;
    this.padding = 5;
    
    // 计算总宽度和高度
    this.updateSize();
  }

  /**
   * 更新尺寸
   */
  updateSize() {
    const slotCount = Math.min(this.skills.length, 6);
    this.width = slotCount * this.slotSize + (slotCount - 1) * this.slotSpacing + this.padding * 2;
    this.height = this.slotSize + this.padding * 2;
  }

  /**
   * 设置技能列表
   * @param {Array} skills - 技能列表
   */
  setSkills(skills) {
    this.skills = skills || [];
    this.updateSize();
  }

  /**
   * 更新技能栏
   * @param {number} deltaTime - 帧间隔时间（毫秒）
   */
  update(deltaTime) {
    // 技能冷却在技能对象本身更新
  }

  /**
   * 渲染技能栏
   * @param {CanvasRenderingContext2D} ctx - Canvas渲染上下文
   */
  render(ctx) {
    if (!this.visible) return;

    // 绘制背景
    ctx.fillStyle = this.backgroundColor;
    ctx.fillRect(this.x, this.y, this.width, this.height);

    // 绘制边框
    ctx.strokeStyle = this.borderColor;
    ctx.lineWidth = this.borderWidth;
    ctx.strokeRect(this.x, this.y, this.width, this.height);

    // 绘制技能槽
    const maxSlots = Math.min(this.skills.length, 6);
    for (let i = 0; i < maxSlots; i++) {
      const skill = this.skills[i];
      const slotX = this.x + this.padding + i * (this.slotSize + this.slotSpacing);
      const slotY = this.y + this.padding;
      
      this.renderSkillSlot(ctx, skill, slotX, slotY, i + 1);
    }
  }

  /**
   * 渲染单个技能槽
   * @param {CanvasRenderingContext2D} ctx - Canvas渲染上下文
   * @param {Object} skill - 技能对象
   * @param {number} x - X坐标
   * @param {number} y - Y坐标
   * @param {number} hotkey - 快捷键数字
   */
  renderSkillSlot(ctx, skill, x, y, hotkey) {
    // 绘制槽位背景
    ctx.fillStyle = '#222222';
    ctx.fillRect(x, y, this.slotSize, this.slotSize);

    // 绘制槽位边框
    ctx.strokeStyle = this.borderColor;
    ctx.lineWidth = 1;
    ctx.strokeRect(x, y, this.slotSize, this.slotSize);

    if (!skill) {
      // 空槽位，显示快捷键
      this.renderHotkey(ctx, hotkey, x, y);
      return;
    }

    // 绘制技能图标（使用颜色代替图片）
    this.renderSkillIcon(ctx, skill, x, y);

    // 检查魔法值是否足够
    const hasEnoughMana = !skill.manaCost || (skill.currentMana !== undefined && skill.currentMana >= skill.manaCost);
    
    // 绘制魔法值不足的红色边框
    if (!hasEnoughMana) {
      ctx.strokeStyle = this.insufficientManaColor;
      ctx.lineWidth = 3;
      ctx.strokeRect(x, y, this.slotSize, this.slotSize);
    }

    // 绘制冷却遮罩
    if (skill.remainingCooldown && skill.remainingCooldown > 0) {
      this.renderCooldownMask(ctx, skill, x, y);
    }

    // 绘制快捷键
    this.renderHotkey(ctx, hotkey, x, y);

    // 绘制冷却时间文字
    if (skill.remainingCooldown && skill.remainingCooldown > 0) {
      this.renderCooldownText(ctx, skill.remainingCooldown, x, y);
    }
  }

  /**
   * 渲染技能图标
   * @param {CanvasRenderingContext2D} ctx - Canvas渲染上下文
   * @param {Object} skill - 技能对象
   * @param {number} x - X坐标
   * @param {number} y - Y坐标
   */
  renderSkillIcon(ctx, skill, x, y) {
    // 使用渐变色代替图标
    const gradient = ctx.createRadialGradient(
      x + this.slotSize / 2, y + this.slotSize / 2, 5,
      x + this.slotSize / 2, y + this.slotSize / 2, this.slotSize / 2
    );
    
    // 根据技能类型设置颜色
    const color = this.getSkillColor(skill);
    gradient.addColorStop(0, color);
    gradient.addColorStop(1, 'rgba(0, 0, 0, 0.5)');
    
    ctx.fillStyle = gradient;
    ctx.fillRect(x + 5, y + 5, this.slotSize - 10, this.slotSize - 10);

    // 绘制技能名称首字母
    if (skill.name) {
      ctx.fillStyle = '#ffffff';
      ctx.font = 'bold 20px Arial';
      ctx.textAlign = 'center';
      ctx.textBaseline = 'middle';
      ctx.fillText(skill.name.charAt(0), x + this.slotSize / 2, y + this.slotSize / 2);
    }
  }

  /**
   * 获取技能颜色
   * @param {Object} skill - 技能对象
   * @returns {string} 颜色值
   */
  getSkillColor(skill) {
    if (skill.type === 'attack') return '#ff4444';
    if (skill.type === 'heal') return '#44ff44';
    if (skill.type === 'buff') return '#4444ff';
    return '#ffaa00';
  }

  /**
   * 渲染冷却遮罩（扇形）
   * @param {CanvasRenderingContext2D} ctx - Canvas渲染上下文
   * @param {Object} skill - 技能对象
   * @param {number} x - X坐标
   * @param {number} y - Y坐标
   */
  renderCooldownMask(ctx, skill, x, y) {
    const cooldownPercentage = skill.remainingCooldown / skill.cooldown;
    const centerX = x + this.slotSize / 2;
    const centerY = y + this.slotSize / 2;
    const radius = this.slotSize / 2;

    ctx.save();
    ctx.fillStyle = this.cooldownColor;
    
    // 绘制扇形遮罩
    ctx.beginPath();
    ctx.moveTo(centerX, centerY);
    ctx.arc(
      centerX, centerY, radius,
      -Math.PI / 2,
      -Math.PI / 2 + Math.PI * 2 * cooldownPercentage
    );
    ctx.closePath();
    ctx.fill();
    
    ctx.restore();
  }

  /**
   * 渲染快捷键
   * @param {CanvasRenderingContext2D} ctx - Canvas渲染上下文
   * @param {number} hotkey - 快捷键数字
   * @param {number} x - X坐标
   * @param {number} y - Y坐标
   */
  renderHotkey(ctx, hotkey, x, y) {
    ctx.fillStyle = '#ffffff';
    ctx.font = 'bold 10px Arial';
    ctx.textAlign = 'left';
    ctx.textBaseline = 'top';
    
    // 添加文字阴影
    ctx.shadowColor = 'rgba(0, 0, 0, 0.8)';
    ctx.shadowBlur = 2;
    ctx.fillText(hotkey.toString(), x + 3, y + 3);
    ctx.shadowBlur = 0;
  }

  /**
   * 渲染冷却时间文字
   * @param {CanvasRenderingContext2D} ctx - Canvas渲染上下文
   * @param {number} cooldown - 剩余冷却时间（秒）
   * @param {number} x - X坐标
   * @param {number} y - Y坐标
   */
  renderCooldownText(ctx, cooldown, x, y) {
    const seconds = Math.ceil(cooldown / 1000);
    
    ctx.fillStyle = '#ffffff';
    ctx.font = 'bold 16px Arial';
    ctx.textAlign = 'center';
    ctx.textBaseline = 'middle';
    
    // 添加文字阴影
    ctx.shadowColor = 'rgba(0, 0, 0, 0.9)';
    ctx.shadowBlur = 3;
    ctx.fillText(seconds.toString(), x + this.slotSize / 2, y + this.slotSize / 2);
    ctx.shadowBlur = 0;
  }

  /**
   * 获取指定位置的技能索引
   * @param {number} x - X坐标
   * @param {number} y - Y坐标
   * @returns {number} 技能索引，-1表示未找到
   */
  getSkillIndexAt(x, y) {
    if (!this.containsPoint(x, y)) return -1;

    const relativeX = x - this.x - this.padding;
    const slotIndex = Math.floor(relativeX / (this.slotSize + this.slotSpacing));
    
    if (slotIndex >= 0 && slotIndex < this.skills.length) {
      return slotIndex;
    }
    
    return -1;
  }
}
