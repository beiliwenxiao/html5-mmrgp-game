/**
 * 装备强化面板 (EnhancementPanel) - 序章专用
 * 
 * 显示和管理装备强化的UI面板
 * 
 * 功能:
 * - 装备选择界面
 * - 成功率和消耗显示
 * - 属性对比预览
 * - 强化确认按钮
 * - 拆解装备功能
 * 
 * 需求: 18
 */

import { UIElement } from '../../ui/UIElement.js';

/**
 * 装备品质颜色映射
 */
const RARITY_COLORS = {
  common: '#c0c0c0',      // 普通 - 银色
  uncommon: '#40ff40',    // 优秀 - 绿色
  rare: '#4080ff',        // 稀有 - 蓝色
  epic: '#c040ff',        // 史诗 - 紫色
  legendary: '#ff8000'    // 传说 - 橙色
};

/**
 * 装备品质中文名称
 */
const RARITY_NAMES = {
  common: '普通',
  uncommon: '优秀',
  rare: '稀有',
  epic: '史诗',
  legendary: '传说'
};

/**
 * 装备强化面板类
 */
export class EnhancementPanel extends UIElement {
  /**
   * 创建装备强化面板
   * @param {Object} options - 配置选项
   * @param {number} options.x - X坐标
   * @param {number} options.y - Y坐标
   * @param {number} options.width - 宽度
   * @param {number} options.height - 高度
   * @param {EnhancementSystem} options.enhancementSystem - 装备强化系统实例
   * @param {InventorySystem} options.inventorySystem - 背包系统实例
   */
  constructor(options = {}) {
    super({
      x: options.x || 100,
      y: options.y || 100,
      width: options.width || 700,
      height: options.height || 500,
      visible: options.visible !== undefined ? options.visible : false,
      zIndex: options.zIndex || 100
    });
    
    this.enhancementSystem = options.enhancementSystem;
    this.inventorySystem = options.inventorySystem;
    this.player = null;
    
    // UI布局配置
    this.titleHeight = 40;
    this.padding = 20;
    
    // 左侧装备列表区域
    this.listWidth = 250;
    this.listItemHeight = 60;
    this.listStartY = this.titleHeight + 10;
    
    // 右侧强化预览区域
    this.previewStartX = this.listWidth + this.padding * 2;
    this.previewWidth = this.width - this.previewStartX - this.padding;
    
    // 按钮配置
    this.buttonWidth = 120;
    this.buttonHeight = 40;
    
    // 交互状态
    this.selectedEquipment = null;
    this.hoveredEquipment = null;
    this.hoveredButton = null;
    this.enhancePreview = null;
    this.scrollOffset = 0;
    this.maxScroll = 0;
    
    // 动画状态
    this.enhanceAnimation = null;
    this.enhanceAnimationTime = 0;
    
    // 事件回调
    this.onEnhanceSuccess = options.onEnhanceSuccess || null;
    this.onEnhanceFail = options.onEnhanceFail || null;
    this.onDismantle = options.onDismantle || null;
  }
  
  /**
   * 设置当前玩家
   * @param {Object} player - 玩家对象
   */
  setPlayer(player) {
    this.player = player;
    this.updateEquipmentList();
  }
  
  /**
   * 更新装备列表
   */
  updateEquipmentList() {
    if (!this.inventorySystem) return;
    
    // 获取所有装备类型的物品
    const allItems = this.inventorySystem.getAllItems();
    this.equipmentList = allItems
      .filter(slot => slot.item.type === 'equipment')
      .map(slot => slot.item);
    
    // 计算最大滚动距离
    const totalHeight = this.equipmentList.length * this.listItemHeight;
    const visibleHeight = this.height - this.listStartY - this.padding;
    this.maxScroll = Math.max(0, totalHeight - visibleHeight);
  }
  
  /**
   * 更新面板
   * @param {number} deltaTime - 帧间隔时间（毫秒）
   */
  update(deltaTime) {
    if (!this.visible) return;
    
    // 更新强化动画
    if (this.enhanceAnimation) {
      this.enhanceAnimationTime += deltaTime;
      
      if (this.enhanceAnimationTime >= this.enhanceAnimation.duration) {
        // 动画结束
        this.enhanceAnimation = null;
        this.enhanceAnimationTime = 0;
      }
    }
    
    // 更新强化预览
    if (this.selectedEquipment && this.enhancementSystem) {
      this.enhancePreview = this.enhancementSystem.previewEnhancedAttributes(
        this.selectedEquipment
      );
    }
  }
  
  /**
   * 渲染面板
   * @param {CanvasRenderingContext2D} ctx - Canvas渲染上下文
   */
  render(ctx) {
    if (!this.visible) return;
    
    ctx.save();
    
    // 渲染背景
    this.renderBackground(ctx);
    
    // 渲染标题
    this.renderTitle(ctx);
    
    // 渲染装备列表
    this.renderEquipmentList(ctx);
    
    // 渲染强化预览区域
    if (this.selectedEquipment) {
      this.renderEnhancePreview(ctx);
    } else {
      this.renderEmptyPreview(ctx);
    }
    
    // 渲染强化动画
    if (this.enhanceAnimation) {
      this.renderEnhanceAnimation(ctx);
    }
    
    ctx.restore();
  }
  
  /**
   * 渲染背景
   * @param {CanvasRenderingContext2D} ctx - 渲染上下文
   */
  renderBackground(ctx) {
    // 半透明黑色背景
    ctx.fillStyle = 'rgba(20, 20, 20, 0.95)';
    ctx.fillRect(this.x, this.y, this.width, this.height);
    
    // 边框
    ctx.strokeStyle = '#666666';
    ctx.lineWidth = 2;
    ctx.strokeRect(this.x, this.y, this.width, this.height);
    
    // 标题栏背景
    ctx.fillStyle = 'rgba(40, 40, 40, 0.8)';
    ctx.fillRect(this.x, this.y, this.width, this.titleHeight);
    
    // 分隔线
    ctx.strokeStyle = '#555555';
    ctx.lineWidth = 1;
    ctx.beginPath();
    ctx.moveTo(this.x + this.listWidth + this.padding, this.y + this.titleHeight);
    ctx.lineTo(this.x + this.listWidth + this.padding, this.y + this.height);
    ctx.stroke();
  }
  
  /**
   * 渲染标题
   * @param {CanvasRenderingContext2D} ctx - 渲染上下文
   */
  renderTitle(ctx) {
    // 标题文字
    ctx.fillStyle = '#ffffff';
    ctx.font = 'bold 18px Arial, sans-serif';
    ctx.textAlign = 'left';
    ctx.textBaseline = 'middle';
    ctx.fillText('装备强化', this.x + this.padding, this.y + this.titleHeight / 2);
    
    // 玩家货币显示
    if (this.player) {
      ctx.fillStyle = '#ffd700';
      ctx.font = '14px Arial, sans-serif';
      ctx.textAlign = 'right';
      ctx.fillText(
        `货币: ${this.player.currency}`,
        this.x + this.width - this.padding,
        this.y + this.titleHeight / 2
      );
    }
  }
  
  /**
   * 渲染装备列表
   * @param {CanvasRenderingContext2D} ctx - 渲染上下文
   */
  renderEquipmentList(ctx) {
    if (!this.equipmentList || this.equipmentList.length === 0) {
      // 显示空列表提示
      ctx.fillStyle = '#888888';
      ctx.font = '14px Arial, sans-serif';
      ctx.textAlign = 'center';
      ctx.textBaseline = 'middle';
      ctx.fillText(
        '背包中没有装备',
        this.x + this.listWidth / 2,
        this.y + this.listStartY + 50
      );
      return;
    }
    
    // 设置裁剪区域
    ctx.save();
    ctx.beginPath();
    ctx.rect(
      this.x,
      this.y + this.listStartY,
      this.listWidth + this.padding,
      this.height - this.listStartY - this.padding
    );
    ctx.clip();
    
    // 渲染每个装备项
    this.equipmentList.forEach((equipment, index) => {
      const itemY = this.y + this.listStartY + index * this.listItemHeight - this.scrollOffset;
      
      // 跳过不在可见区域的项
      if (itemY + this.listItemHeight < this.y + this.listStartY ||
          itemY > this.y + this.height) {
        return;
      }
      
      this.renderEquipmentItem(ctx, equipment, index, itemY);
    });
    
    ctx.restore();
    
    // 渲染滚动条（如果需要）
    if (this.maxScroll > 0) {
      this.renderScrollbar(ctx);
    }
  }
  
  /**
   * 渲染单个装备项
   * @param {CanvasRenderingContext2D} ctx - 渲染上下文
   * @param {Object} equipment - 装备对象
   * @param {number} index - 索引
   * @param {number} y - Y坐标
   */
  renderEquipmentItem(ctx, equipment, index, y) {
    const isSelected = this.selectedEquipment === equipment;
    const isHovered = this.hoveredEquipment === equipment;
    const rarityColor = RARITY_COLORS[equipment.rarity] || '#ffffff';
    
    // 背景
    if (isSelected) {
      ctx.fillStyle = 'rgba(80, 120, 200, 0.4)';
    } else if (isHovered) {
      ctx.fillStyle = 'rgba(100, 100, 100, 0.4)';
    } else {
      ctx.fillStyle = 'rgba(60, 60, 60, 0.3)';
    }
    ctx.fillRect(this.x + this.padding, y, this.listWidth, this.listItemHeight - 5);
    
    // 边框（使用品质颜色）
    ctx.strokeStyle = rarityColor;
    ctx.lineWidth = isSelected ? 2 : 1;
    ctx.strokeRect(this.x + this.padding, y, this.listWidth, this.listItemHeight - 5);
    
    // 装备名称
    ctx.fillStyle = rarityColor;
    ctx.font = 'bold 14px Arial, sans-serif';
    ctx.textAlign = 'left';
    ctx.textBaseline = 'top';
    
    const enhanceText = equipment.enhanceLevel > 0 ? ` +${equipment.enhanceLevel}` : '';
    ctx.fillText(
      `${equipment.name}${enhanceText}`,
      this.x + this.padding + 10,
      y + 8
    );
    
    // 装备类型和品质
    ctx.fillStyle = '#cccccc';
    ctx.font = '11px Arial, sans-serif';
    const rarityName = RARITY_NAMES[equipment.rarity] || '未知';
    ctx.fillText(
      `${equipment.type} | ${rarityName}`,
      this.x + this.padding + 10,
      y + 28
    );
    
    // 主要属性显示
    ctx.fillStyle = '#aaaaaa';
    ctx.font = '10px Arial, sans-serif';
    let attrText = '';
    if (equipment.attributes.attack > 0) {
      attrText += `攻击:${equipment.attributes.attack} `;
    }
    if (equipment.attributes.defense > 0) {
      attrText += `防御:${equipment.attributes.defense}`;
    }
    ctx.fillText(attrText, this.x + this.padding + 10, y + 44);
  }
  
  /**
   * 渲染滚动条
   * @param {CanvasRenderingContext2D} ctx - 渲染上下文
   */
  renderScrollbar(ctx) {
    const scrollbarWidth = 8;
    const scrollbarX = this.x + this.listWidth + this.padding - scrollbarWidth - 5;
    const scrollbarY = this.y + this.listStartY;
    const scrollbarHeight = this.height - this.listStartY - this.padding;
    
    // 滚动条背景
    ctx.fillStyle = 'rgba(60, 60, 60, 0.5)';
    ctx.fillRect(scrollbarX, scrollbarY, scrollbarWidth, scrollbarHeight);
    
    // 滚动条滑块
    const totalHeight = this.equipmentList.length * this.listItemHeight;
    const thumbHeight = Math.max(30, (scrollbarHeight / totalHeight) * scrollbarHeight);
    const thumbY = scrollbarY + (this.scrollOffset / this.maxScroll) * (scrollbarHeight - thumbHeight);
    
    ctx.fillStyle = 'rgba(150, 150, 150, 0.8)';
    ctx.fillRect(scrollbarX, thumbY, scrollbarWidth, thumbHeight);
  }
  
  /**
   * 渲染强化预览区域
   * @param {CanvasRenderingContext2D} ctx - 渲染上下文
   */
  renderEnhancePreview(ctx) {
    const startX = this.x + this.previewStartX;
    const startY = this.y + this.titleHeight + this.padding;
    
    // 装备信息标题
    ctx.fillStyle = '#ffffff';
    ctx.font = 'bold 16px Arial, sans-serif';
    ctx.textAlign = 'left';
    ctx.textBaseline = 'top';
    ctx.fillText('装备信息', startX, startY);
    
    let currentY = startY + 30;
    
    // 装备名称和强化等级
    const rarityColor = RARITY_COLORS[this.selectedEquipment.rarity] || '#ffffff';
    ctx.fillStyle = rarityColor;
    ctx.font = 'bold 18px Arial, sans-serif';
    const enhanceText = this.selectedEquipment.enhanceLevel > 0 
      ? ` +${this.selectedEquipment.enhanceLevel}` 
      : '';
    ctx.fillText(`${this.selectedEquipment.name}${enhanceText}`, startX, currentY);
    currentY += 30;
    
    // 当前属性
    ctx.fillStyle = '#ffff00';
    ctx.font = 'bold 14px Arial, sans-serif';
    ctx.fillText('当前属性:', startX, currentY);
    currentY += 25;
    
    this.renderAttributes(ctx, this.selectedEquipment.attributes, startX + 20, currentY);
    currentY += this.getAttributeCount(this.selectedEquipment.attributes) * 22 + 15;
    
    // 强化预览
    if (this.enhancePreview) {
      // 分隔线
      ctx.strokeStyle = '#555555';
      ctx.lineWidth = 1;
      ctx.beginPath();
      ctx.moveTo(startX, currentY);
      ctx.lineTo(startX + this.previewWidth - this.padding, currentY);
      ctx.stroke();
      currentY += 15;
      
      // 预览属性标题
      ctx.fillStyle = '#00ff00';
      ctx.font = 'bold 14px Arial, sans-serif';
      ctx.fillText(
        `强化后属性 (${this.enhancePreview.nextLevel}级):`,
        startX,
        currentY
      );
      currentY += 25;
      
      // 预览属性（带对比）
      this.renderAttributesComparison(
        ctx,
        this.enhancePreview.currentAttributes,
        this.enhancePreview.previewAttributes,
        startX + 20,
        currentY
      );
      currentY += this.getAttributeCount(this.enhancePreview.previewAttributes) * 22 + 20;
      
      // 强化信息
      ctx.fillStyle = '#ffffff';
      ctx.font = '13px Arial, sans-serif';
      ctx.fillText(
        `成功率: ${(this.enhancePreview.successRate * 100).toFixed(0)}%`,
        startX,
        currentY
      );
      currentY += 22;
      
      ctx.fillStyle = '#ffd700';
      ctx.fillText(
        `消耗货币: ${this.enhancePreview.cost}`,
        startX,
        currentY
      );
      currentY += 35;
      
      // 强化按钮
      this.renderEnhanceButton(ctx, startX, currentY);
      currentY += this.buttonHeight + 15;
    } else {
      // 已达到最大强化等级
      ctx.fillStyle = '#ff6666';
      ctx.font = 'bold 14px Arial, sans-serif';
      ctx.fillText('已达到最大强化等级', startX, currentY);
      currentY += 40;
    }
    
    // 拆解按钮
    this.renderDismantleButton(ctx, startX, currentY);
  }
  
  /**
   * 渲染空预览区域
   * @param {CanvasRenderingContext2D} ctx - 渲染上下文
   */
  renderEmptyPreview(ctx) {
    const startX = this.x + this.previewStartX;
    const startY = this.y + this.titleHeight + this.padding;
    
    ctx.fillStyle = '#888888';
    ctx.font = '14px Arial, sans-serif';
    ctx.textAlign = 'center';
    ctx.textBaseline = 'middle';
    ctx.fillText(
      '请从左侧选择要强化的装备',
      startX + this.previewWidth / 2,
      startY + 100
    );
  }
  
  /**
   * 渲染属性列表
   * @param {CanvasRenderingContext2D} ctx - 渲染上下文
   * @param {Object} attributes - 属性对象
   * @param {number} x - X坐标
   * @param {number} y - Y坐标
   */
  renderAttributes(ctx, attributes, x, y) {
    ctx.fillStyle = '#00ff00';
    ctx.font = '12px Arial, sans-serif';
    ctx.textAlign = 'left';
    ctx.textBaseline = 'top';
    
    let currentY = y;
    
    if (attributes.attack > 0) {
      ctx.fillText(`攻击力: ${attributes.attack}`, x, currentY);
      currentY += 22;
    }
    
    if (attributes.defense > 0) {
      ctx.fillText(`防御力: ${attributes.defense}`, x, currentY);
      currentY += 22;
    }
    
    if (attributes.health > 0) {
      ctx.fillText(`生命值: ${attributes.health}`, x, currentY);
      currentY += 22;
    }
    
    if (attributes.speed > 0) {
      ctx.fillText(`速度: ${attributes.speed}`, x, currentY);
      currentY += 22;
    }
  }
  
  /**
   * 渲染属性对比
   * @param {CanvasRenderingContext2D} ctx - 渲染上下文
   * @param {Object} currentAttrs - 当前属性
   * @param {Object} previewAttrs - 预览属性
   * @param {number} x - X坐标
   * @param {number} y - Y坐标
   */
  renderAttributesComparison(ctx, currentAttrs, previewAttrs, x, y) {
    ctx.font = '12px Arial, sans-serif';
    ctx.textAlign = 'left';
    ctx.textBaseline = 'top';
    
    let currentY = y;
    
    const renderAttr = (name, current, preview) => {
      if (preview > 0) {
        const increase = preview - current;
        
        // 属性名和当前值
        ctx.fillStyle = '#cccccc';
        ctx.fillText(`${name}: ${current}`, x, currentY);
        
        // 箭头
        ctx.fillStyle = '#ffffff';
        ctx.fillText('→', x + 120, currentY);
        
        // 预览值
        ctx.fillStyle = '#00ff00';
        ctx.fillText(`${preview}`, x + 140, currentY);
        
        // 增加值
        ctx.fillStyle = '#40ff40';
        ctx.font = 'bold 11px Arial, sans-serif';
        ctx.fillText(`(+${increase})`, x + 180, currentY);
        ctx.font = '12px Arial, sans-serif';
        
        currentY += 22;
      }
    };
    
    renderAttr('攻击力', currentAttrs.attack || 0, previewAttrs.attack || 0);
    renderAttr('防御力', currentAttrs.defense || 0, previewAttrs.defense || 0);
    renderAttr('生命值', currentAttrs.health || 0, previewAttrs.health || 0);
    renderAttr('速度', currentAttrs.speed || 0, previewAttrs.speed || 0);
  }
  
  /**
   * 获取属性数量
   * @param {Object} attributes - 属性对象
   * @returns {number} 属性数量
   */
  getAttributeCount(attributes) {
    let count = 0;
    if (attributes.attack > 0) count++;
    if (attributes.defense > 0) count++;
    if (attributes.health > 0) count++;
    if (attributes.speed > 0) count++;
    return count;
  }
  
  /**
   * 渲染强化按钮
   * @param {CanvasRenderingContext2D} ctx - 渲染上下文
   * @param {number} x - X坐标
   * @param {number} y - Y坐标
   */
  renderEnhanceButton(ctx, x, y) {
    const isHovered = this.hoveredButton === 'enhance';
    const canEnhance = this.player && this.enhancePreview && 
                       this.player.currency >= this.enhancePreview.cost;
    
    // 按钮背景
    if (!canEnhance) {
      ctx.fillStyle = 'rgba(100, 100, 100, 0.5)';
    } else if (isHovered) {
      ctx.fillStyle = 'rgba(80, 200, 80, 0.8)';
    } else {
      ctx.fillStyle = 'rgba(60, 180, 60, 0.7)';
    }
    ctx.fillRect(x, y, this.buttonWidth, this.buttonHeight);
    
    // 按钮边框
    ctx.strokeStyle = canEnhance ? '#40ff40' : '#666666';
    ctx.lineWidth = 2;
    ctx.strokeRect(x, y, this.buttonWidth, this.buttonHeight);
    
    // 按钮文字
    ctx.fillStyle = canEnhance ? '#ffffff' : '#888888';
    ctx.font = 'bold 14px Arial, sans-serif';
    ctx.textAlign = 'center';
    ctx.textBaseline = 'middle';
    ctx.fillText('强化装备', x + this.buttonWidth / 2, y + this.buttonHeight / 2);
  }
  
  /**
   * 渲染拆解按钮
   * @param {CanvasRenderingContext2D} ctx - 渲染上下文
   * @param {number} x - X坐标
   * @param {number} y - Y坐标
   */
  renderDismantleButton(ctx, x, y) {
    const isHovered = this.hoveredButton === 'dismantle';
    
    // 按钮背景
    if (isHovered) {
      ctx.fillStyle = 'rgba(200, 80, 80, 0.8)';
    } else {
      ctx.fillStyle = 'rgba(180, 60, 60, 0.7)';
    }
    ctx.fillRect(x, y, this.buttonWidth, this.buttonHeight);
    
    // 按钮边框
    ctx.strokeStyle = '#ff4040';
    ctx.lineWidth = 2;
    ctx.strokeRect(x, y, this.buttonWidth, this.buttonHeight);
    
    // 按钮文字
    ctx.fillStyle = '#ffffff';
    ctx.font = 'bold 14px Arial, sans-serif';
    ctx.textAlign = 'center';
    ctx.textBaseline = 'middle';
    ctx.fillText('拆解装备', x + this.buttonWidth / 2, y + this.buttonHeight / 2);
    
    // 拆解价值提示
    if (this.selectedEquipment && this.enhancementSystem) {
      const dismantleResult = this.enhancementSystem.dismantleEquipment(this.selectedEquipment);
      ctx.fillStyle = '#ffd700';
      ctx.font = '11px Arial, sans-serif';
      ctx.textAlign = 'left';
      ctx.fillText(
        `(返还 ${dismantleResult.currency} 货币)`,
        x + this.buttonWidth + 10,
        y + this.buttonHeight / 2
      );
    }
  }
  
  /**
   * 渲染强化动画
   * @param {CanvasRenderingContext2D} ctx - 渲染上下文
   */
  renderEnhanceAnimation(ctx) {
    if (!this.enhanceAnimation) return;
    
    const progress = this.enhanceAnimationTime / this.enhanceAnimation.duration;
    const centerX = this.x + this.width / 2;
    const centerY = this.y + this.height / 2;
    
    // 半透明遮罩
    ctx.fillStyle = 'rgba(0, 0, 0, 0.7)';
    ctx.fillRect(this.x, this.y, this.width, this.height);
    
    // 动画效果
    if (this.enhanceAnimation.success) {
      // 成功动画 - 绿色光芒
      ctx.save();
      ctx.globalAlpha = 1 - progress;
      
      const radius = 50 + progress * 100;
      const gradient = ctx.createRadialGradient(centerX, centerY, 0, centerX, centerY, radius);
      gradient.addColorStop(0, 'rgba(0, 255, 0, 0.8)');
      gradient.addColorStop(1, 'rgba(0, 255, 0, 0)');
      
      ctx.fillStyle = gradient;
      ctx.beginPath();
      ctx.arc(centerX, centerY, radius, 0, Math.PI * 2);
      ctx.fill();
      
      ctx.restore();
      
      // 成功文字
      ctx.fillStyle = '#00ff00';
      ctx.font = 'bold 32px Arial, sans-serif';
      ctx.textAlign = 'center';
      ctx.textBaseline = 'middle';
      ctx.fillText('强化成功！', centerX, centerY - 30);
      
      ctx.fillStyle = '#ffffff';
      ctx.font = '18px Arial, sans-serif';
      ctx.fillText(
        `${this.enhanceAnimation.equipmentName} +${this.enhanceAnimation.newLevel}`,
        centerX,
        centerY + 10
      );
    } else {
      // 失败动画 - 红色闪光
      ctx.save();
      ctx.globalAlpha = 1 - progress;
      
      const radius = 50 + progress * 80;
      const gradient = ctx.createRadialGradient(centerX, centerY, 0, centerX, centerY, radius);
      gradient.addColorStop(0, 'rgba(255, 0, 0, 0.6)');
      gradient.addColorStop(1, 'rgba(255, 0, 0, 0)');
      
      ctx.fillStyle = gradient;
      ctx.beginPath();
      ctx.arc(centerX, centerY, radius, 0, Math.PI * 2);
      ctx.fill();
      
      ctx.restore();
      
      // 失败文字
      ctx.fillStyle = '#ff4040';
      ctx.font = 'bold 32px Arial, sans-serif';
      ctx.textAlign = 'center';
      ctx.textBaseline = 'middle';
      ctx.fillText('强化失败', centerX, centerY);
    }
  }
  
  /**
   * 处理鼠标移动事件
   * @param {number} mouseX - 鼠标X坐标
   * @param {number} mouseY - 鼠标Y坐标
   */
  handleMouseMove(mouseX, mouseY) {
    if (!this.visible) {
      this.hoveredEquipment = null;
      this.hoveredButton = null;
      return;
    }
    
    // 检查鼠标是否在面板内
    if (!this.containsPoint(mouseX, mouseY)) {
      this.hoveredEquipment = null;
      this.hoveredButton = null;
      return;
    }
    
    // 检查是否悬停在装备列表上
    this.hoveredEquipment = this.getEquipmentAtPosition(mouseX, mouseY);
    
    // 检查是否悬停在按钮上
    this.hoveredButton = this.getButtonAtPosition(mouseX, mouseY);
  }
  
  /**
   * 处理鼠标按下事件
   * @param {number} mouseX - 鼠标X坐标
   * @param {number} mouseY - 鼠标Y坐标
   * @param {number} button - 鼠标按钮 (0=左键, 2=右键)
   * @returns {boolean} 是否处理了事件
   */
  handleMouseDown(mouseX, mouseY, button = 0) {
    if (!this.visible || !this.containsPoint(mouseX, mouseY)) {
      return false;
    }
    
    if (button !== 0) return true;  // 只处理左键
    
    // 检查是否点击了装备
    const equipment = this.getEquipmentAtPosition(mouseX, mouseY);
    if (equipment) {
      this.selectedEquipment = equipment;
      return true;
    }
    
    // 检查是否点击了按钮
    const clickedButton = this.getButtonAtPosition(mouseX, mouseY);
    if (clickedButton === 'enhance') {
      this.handleEnhanceClick();
      return true;
    } else if (clickedButton === 'dismantle') {
      this.handleDismantleClick();
      return true;
    }
    
    return true;  // 点击了面板其他区域，也算处理了
  }
  
  /**
   * 处理鼠标滚轮事件
   * @param {number} deltaY - 滚轮滚动量
   * @param {number} mouseX - 鼠标X坐标
   * @param {number} mouseY - 鼠标Y坐标
   * @returns {boolean} 是否处理了事件
   */
  handleMouseWheel(deltaY, mouseX, mouseY) {
    if (!this.visible || !this.containsPoint(mouseX, mouseY)) {
      return false;
    }
    
    // 检查是否在装备列表区域
    if (mouseX < this.x + this.listWidth + this.padding) {
      this.scrollOffset = Math.max(0, Math.min(this.maxScroll, this.scrollOffset + deltaY));
      return true;
    }
    
    return false;
  }
  
  /**
   * 根据鼠标坐标获取装备
   * @param {number} mouseX - 鼠标X坐标
   * @param {number} mouseY - 鼠标Y坐标
   * @returns {Object|null} 装备对象，如果不在任何装备上则返回null
   */
  getEquipmentAtPosition(mouseX, mouseY) {
    if (!this.equipmentList || this.equipmentList.length === 0) {
      return null;
    }
    
    // 检查是否在装备列表区域
    if (mouseX < this.x + this.padding || 
        mouseX > this.x + this.listWidth + this.padding) {
      return null;
    }
    
    const listStartY = this.y + this.listStartY;
    
    for (let i = 0; i < this.equipmentList.length; i++) {
      const itemY = listStartY + i * this.listItemHeight - this.scrollOffset;
      
      if (mouseY >= itemY && mouseY <= itemY + this.listItemHeight - 5) {
        return this.equipmentList[i];
      }
    }
    
    return null;
  }
  
  /**
   * 根据鼠标坐标获取按钮
   * @param {number} mouseX - 鼠标X坐标
   * @param {number} mouseY - 鼠标Y坐标
   * @returns {string|null} 按钮ID，如果不在任何按钮上则返回null
   */
  getButtonAtPosition(mouseX, mouseY) {
    if (!this.selectedEquipment) return null;
    
    const startX = this.x + this.previewStartX;
    let buttonY = this.y + this.titleHeight + this.padding;
    
    // 计算强化按钮位置
    buttonY += 30 + 30 + 25;  // 标题 + 装备名 + 当前属性标题
    buttonY += this.getAttributeCount(this.selectedEquipment.attributes) * 22 + 15;
    
    if (this.enhancePreview) {
      buttonY += 15 + 25;  // 分隔线 + 预览标题
      buttonY += this.getAttributeCount(this.enhancePreview.previewAttributes) * 22 + 20;
      buttonY += 22 + 22 + 35;  // 成功率 + 消耗 + 间距
      
      // 检查强化按钮
      if (mouseX >= startX && mouseX <= startX + this.buttonWidth &&
          mouseY >= buttonY && mouseY <= buttonY + this.buttonHeight) {
        return 'enhance';
      }
      
      buttonY += this.buttonHeight + 15;
    } else {
      buttonY += 40;  // 最大等级提示
    }
    
    // 检查拆解按钮
    if (mouseX >= startX && mouseX <= startX + this.buttonWidth &&
        mouseY >= buttonY && mouseY <= buttonY + this.buttonHeight) {
      return 'dismantle';
    }
    
    return null;
  }
  
  /**
   * 处理强化按钮点击
   */
  handleEnhanceClick() {
    if (!this.selectedEquipment || !this.player || !this.enhancementSystem) {
      return;
    }
    
    if (!this.enhancePreview) {
      return;  // 已达到最大等级
    }
    
    // 检查是否有足够货币
    if (this.player.currency < this.enhancePreview.cost) {
      console.log('货币不足');
      return;
    }
    
    // 执行强化
    const result = this.enhancementSystem.enhanceEquipment(
      this.selectedEquipment,
      this.player
    );
    
    // 播放强化动画
    this.enhanceAnimation = {
      success: result.success,
      equipmentName: this.selectedEquipment.name,
      newLevel: result.newLevel,
      duration: 1500  // 1.5秒
    };
    this.enhanceAnimationTime = 0;
    
    // 触发回调
    if (result.success && this.onEnhanceSuccess) {
      this.onEnhanceSuccess(this.selectedEquipment, result);
    } else if (!result.success && this.onEnhanceFail) {
      this.onEnhanceFail(this.selectedEquipment, result);
    }
    
    // 更新预览
    this.enhancePreview = this.enhancementSystem.previewEnhancedAttributes(
      this.selectedEquipment
    );
  }
  
  /**
   * 处理拆解按钮点击
   */
  handleDismantleClick() {
    if (!this.selectedEquipment || !this.player || !this.enhancementSystem) {
      return;
    }
    
    // 确认对话框（简化版，实际应该有UI确认）
    const confirmed = true;  // 在实际实现中应该弹出确认对话框
    
    if (confirmed) {
      // 执行拆解
      const result = this.enhancementSystem.dismantleEquipment(this.selectedEquipment);
      
      if (result.success) {
        // 增加玩家货币
        this.player.currency += result.currency;
        
        // 从背包移除装备
        if (this.inventorySystem) {
          this.inventorySystem.removeItem(this.selectedEquipment.id);
        }
        
        // 触发回调
        if (this.onDismantle) {
          this.onDismantle(this.selectedEquipment, result);
        }
        
        // 清除选择
        this.selectedEquipment = null;
        this.enhancePreview = null;
        
        // 更新装备列表
        this.updateEquipmentList();
      }
    }
  }
  
  /**
   * 切换面板显示/隐藏
   */
  toggle() {
    this.visible = !this.visible;
    if (this.visible) {
      this.updateEquipmentList();
    } else {
      this.resetState();
    }
  }
  
  /**
   * 显示面板
   */
  show() {
    this.visible = true;
    this.updateEquipmentList();
  }
  
  /**
   * 隐藏面板
   */
  hide() {
    this.visible = false;
    this.resetState();
  }
  
  /**
   * 重置交互状态
   */
  resetState() {
    this.selectedEquipment = null;
    this.hoveredEquipment = null;
    this.hoveredButton = null;
    this.enhancePreview = null;
    this.scrollOffset = 0;
    this.enhanceAnimation = null;
    this.enhanceAnimationTime = 0;
  }
}

export default EnhancementPanel;
