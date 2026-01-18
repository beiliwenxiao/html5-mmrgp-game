import { UIElement } from './UIElement.js';

/**
 * 玩家信息面板
 * 显示玩家的姓名、职业、等级、属性和技能列表
 */
export class PlayerInfoPanel extends UIElement {
  /**
   * @param {Object} options - 配置选项
   * @param {Entity} options.player - 玩家实体
   * @param {string} [options.backgroundColor='rgba(0, 0, 0, 0.7)'] - 背景颜色
   * @param {string} [options.borderColor='#4a9eff'] - 边框颜色
   * @param {string} [options.textColor='#ffffff'] - 文字颜色
   * @param {Function} [options.onAttributeAllocate] - 属性加点按钮点击回调
   */
  constructor(options = {}) {
    super({
      x: options.x || 10,
      y: options.y || 10,
      width: options.width || 280,
      height: options.height || 320,
      visible: options.visible !== undefined ? options.visible : true,
      zIndex: options.zIndex || 100
    });
    
    this.player = options.player || null;
    this.backgroundColor = options.backgroundColor || 'rgba(0, 0, 0, 0.7)';
    this.borderColor = options.borderColor || '#4a9eff';
    this.textColor = options.textColor || '#ffffff';
    this.labelColor = options.labelColor || '#aaaaaa';
    
    this.borderWidth = 2;
    this.padding = 15;
    this.lineHeight = 20;
    
    // 属性加点按钮回调
    this.onAttributeAllocate = options.onAttributeAllocate || null;
    
    // 属性加点按钮状态
    this.attributeButtonHovered = false;
    this.attributeButtonRect = null;
    
    // 职业颜色映射
    this.classColors = {
      'warrior': '#ff6b6b',
      'mage': '#4a9eff',
      'archer': '#51cf66'
    };
    
    // 职业中文名映射
    this.classNames = {
      'warrior': '战士',
      'mage': '法师',
      'archer': '弓箭手'
    };
  }

  /**
   * 设置玩家实体
   * @param {Entity} player - 玩家实体
   */
  setPlayer(player) {
    this.player = player;
  }
  
  /**
   * 设置属性加点回调
   * @param {Function} callback - 回调函数
   */
  setOnAttributeAllocate(callback) {
    this.onAttributeAllocate = callback;
  }

  /**
   * 更新面板
   * @param {number} deltaTime - 帧间隔时间（毫秒）
   */
  update(deltaTime) {
    // 面板内容实时从玩家实体读取，无需更新
  }

  /**
   * 渲染面板
   * @param {CanvasRenderingContext2D} ctx - Canvas渲染上下文
   */
  render(ctx) {
    if (!this.visible || !this.player) return;

    // 绘制背景
    ctx.fillStyle = this.backgroundColor;
    ctx.fillRect(this.x, this.y, this.width, this.height);

    // 绘制边框
    ctx.strokeStyle = this.borderColor;
    ctx.lineWidth = this.borderWidth;
    ctx.strokeRect(this.x, this.y, this.width, this.height);

    // 获取玩家数据
    const stats = this.player.getComponent('stats');
    const combat = this.player.getComponent('combat');
    
    if (!stats) return;

    let currentY = this.y + this.padding;

    // 绘制标题
    ctx.fillStyle = this.borderColor;
    ctx.font = 'bold 18px Arial';
    ctx.textAlign = 'left';
    ctx.fillText('角色信息', this.x + this.padding, currentY);
    currentY += this.lineHeight + 5;

    // 绘制分隔线
    ctx.strokeStyle = this.borderColor;
    ctx.lineWidth = 1;
    ctx.beginPath();
    ctx.moveTo(this.x + this.padding, currentY);
    ctx.lineTo(this.x + this.width - this.padding, currentY);
    ctx.stroke();
    currentY += 10;

    // 绘制角色名称
    ctx.fillStyle = this.textColor;
    ctx.font = 'bold 16px Arial';
    ctx.fillText(`${this.player.name}`, this.x + this.padding, currentY);
    currentY += this.lineHeight + 3;

    // 绘制职业和等级
    const className = this.classNames[this.player.class] || this.player.class;
    const classColor = this.classColors[this.player.class] || '#ffffff';
    
    ctx.fillStyle = this.labelColor;
    ctx.font = '14px Arial';
    ctx.fillText('职业:', this.x + this.padding, currentY);
    
    ctx.fillStyle = classColor;
    ctx.font = 'bold 14px Arial';
    ctx.fillText(className, this.x + this.padding + 50, currentY);
    
    ctx.fillStyle = this.labelColor;
    ctx.fillText('等级:', this.x + this.padding + 130, currentY);
    
    ctx.fillStyle = this.textColor;
    ctx.fillText(`${stats.level}`, this.x + this.padding + 180, currentY);
    currentY += this.lineHeight + 8;

    // 绘制属性标题和加点按钮
    ctx.fillStyle = this.borderColor;
    ctx.font = 'bold 14px Arial';
    ctx.fillText('属性', this.x + this.padding, currentY);
    
    // 绘制属性加点按钮 [+]
    const buttonX = this.x + this.padding + 50;
    const buttonY = currentY - 12;
    const buttonWidth = 24;
    const buttonHeight = 16;
    
    // 保存按钮位置用于点击检测
    this.attributeButtonRect = {
      x: buttonX,
      y: buttonY,
      width: buttonWidth,
      height: buttonHeight
    };
    
    // 按钮背景
    ctx.fillStyle = this.attributeButtonHovered ? '#4a9eff' : '#2a5a8f';
    ctx.fillRect(buttonX, buttonY, buttonWidth, buttonHeight);
    
    // 按钮边框
    ctx.strokeStyle = this.borderColor;
    ctx.lineWidth = 1;
    ctx.strokeRect(buttonX, buttonY, buttonWidth, buttonHeight);
    
    // 按钮文字
    ctx.fillStyle = '#ffffff';
    ctx.font = 'bold 12px Arial';
    ctx.textAlign = 'center';
    ctx.fillText('+', buttonX + buttonWidth / 2, buttonY + 12);
    ctx.textAlign = 'left';
    
    currentY += this.lineHeight;

    // 绘制属性列表
    const attributes = [
      { label: 'HP', value: `${Math.round(stats.hp)}/${stats.maxHp}`, color: '#ff4444' },
      { label: 'MP', value: `${Math.round(stats.mp)}/${stats.maxMp}`, color: '#4444ff' },
      { label: '攻击', value: stats.attack, color: '#ffaa00' },
      { label: '防御', value: stats.defense, color: '#00aaff' },
      { label: '速度', value: stats.speed, color: '#00ff00' }
    ];

    ctx.font = '13px Arial';
    for (const attr of attributes) {
      // 标签
      ctx.fillStyle = this.labelColor;
      ctx.fillText(`${attr.label}:`, this.x + this.padding, currentY);
      
      // 值
      ctx.fillStyle = attr.color;
      ctx.fillText(attr.value.toString(), this.x + this.padding + 60, currentY);
      currentY += this.lineHeight;
    }

    currentY += 5;

    // 绘制技能标题
    ctx.fillStyle = this.borderColor;
    ctx.font = 'bold 14px Arial';
    ctx.fillText('技能', this.x + this.padding, currentY);
    currentY += this.lineHeight;

    // 绘制技能列表
    if (combat && combat.skills && combat.skills.length > 0) {
      ctx.font = '12px Arial';
      
      for (let i = 0; i < Math.min(combat.skills.length, 6); i++) {
        const skill = combat.skills[i];
        
        // 技能快捷键
        ctx.fillStyle = this.borderColor;
        ctx.fillText(`[${i + 1}]`, this.x + this.padding, currentY);
        
        // 技能名称
        ctx.fillStyle = this.textColor;
        ctx.fillText(skill.name, this.x + this.padding + 30, currentY);
        
        // 技能消耗
        if (skill.manaCost > 0) {
          ctx.fillStyle = '#4444ff';
          ctx.fillText(`${skill.manaCost}MP`, this.x + this.padding + 180, currentY);
        }
        
        currentY += this.lineHeight - 2;
      }
    } else {
      ctx.fillStyle = this.labelColor;
      ctx.font = '12px Arial';
      ctx.fillText('无技能', this.x + this.padding, currentY);
    }
  }

  /**
   * 处理鼠标移动事件
   * @param {number} x - 鼠标X坐标
   * @param {number} y - 鼠标Y坐标
   */
  handleMouseMove(x, y) {
    if (!this.visible) return;
    
    // 检查是否悬停在属性加点按钮上
    if (this.attributeButtonRect) {
      const btn = this.attributeButtonRect;
      this.attributeButtonHovered = (
        x >= btn.x && x <= btn.x + btn.width &&
        y >= btn.y && y <= btn.y + btn.height
      );
    }
  }

  /**
   * 处理鼠标点击事件
   * @param {number} x - 鼠标X坐标
   * @param {number} y - 鼠标Y坐标
   * @param {string} button - 鼠标按钮 ('left' | 'right')
   * @returns {boolean} 是否处理了点击事件
   */
  handleMouseClick(x, y, button = 'left') {
    // 如果不可见或点击不在面板内，返回 false
    if (!this.visible || !this.containsPoint(x, y)) {
      return false;
    }
    
    // 检查是否点击了属性加点按钮
    if (this.attributeButtonRect && button === 'left') {
      const btn = this.attributeButtonRect;
      if (x >= btn.x && x <= btn.x + btn.width &&
          y >= btn.y && y <= btn.y + btn.height) {
        console.log('PlayerInfoPanel: 点击属性加点按钮');
        if (this.onAttributeAllocate) {
          this.onAttributeAllocate(this.player);
        }
        return true;
      }
    }
    
    // 点击在面板内任何位置都算处理了（阻止事件传播）
    return true;
  }
}
