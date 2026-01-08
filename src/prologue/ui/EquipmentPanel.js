/**
 * 装备面板 (EquipmentPanel) - 序章专用
 * 
 * 显示和管理玩家装备的UI面板
 * 
 * 功能:
 * - 显示装备槽位（武器、防具、饰品）
 * - 显示装备属性和强化等级
 * - 显示负属性（红色标注）
 * - 支持装备穿戴和卸下
 * - 显示装备详情提示框
 * 
 * 需求: 4, 14, 18
 */

import { UIElement } from '../../ui/UIElement.js';
import { EquipmentSlot, EquipmentRarity } from '../systems/EquipmentSystem.js';

/**
 * 装备品质颜色映射
 */
const RARITY_COLORS = {
  [EquipmentRarity.COMMON]: '#ffffff',      // 普通 - 白色
  [EquipmentRarity.UNCOMMON]: '#00ff00',    // 优秀 - 绿色
  [EquipmentRarity.RARE]: '#0080ff',        // 稀有 - 蓝色
  [EquipmentRarity.EPIC]: '#a020f0',        // 史诗 - 紫色
  [EquipmentRarity.LEGENDARY]: '#ff8000'    // 传说 - 橙色
};

/**
 * 装备槽位中文名称
 */
const SLOT_NAMES = {
  [EquipmentSlot.WEAPON]: '武器',
  [EquipmentSlot.ARMOR]: '防具',
  [EquipmentSlot.ACCESSORY]: '饰品'
};

/**
 * 装备面板类
 */
export class EquipmentPanel extends UIElement {
  /**
   * 创建装备面板
   * @param {Object} options - 配置选项
   * @param {number} options.x - X坐标
   * @param {number} options.y - Y坐标
   * @param {number} options.width - 宽度
   * @param {number} options.height - 高度
   * @param {EquipmentSystem} options.equipmentSystem - 装备系统实例
   */
  constructor(options = {}) {
    super({
      x: options.x || 50,
      y: options.y || 50,
      width: options.width || 350,
      height: options.height || 450,
      visible: options.visible !== undefined ? options.visible : false,
      zIndex: options.zIndex || 100
    });
    
    this.equipmentSystem = options.equipmentSystem;
    this.player = null;
    
    // UI布局配置
    this.titleHeight = 40;
    this.slotSize = 64;
    this.slotPadding = 20;
    this.tooltipWidth = 280;
    this.tooltipMaxHeight = 400;
    
    // 装备槽位布局（相对于面板的位置）
    this.slotLayout = {
      [EquipmentSlot.WEAPON]: { x: 50, y: 80 },
      [EquipmentSlot.ARMOR]: { x: 150, y: 80 },
      [EquipmentSlot.ACCESSORY]: { x: 250, y: 80 }
    };
    
    // 交互状态
    this.hoveredSlot = null;
    this.selectedSlot = null;
    
    // 事件回调
    this.onSlotClick = options.onSlotClick || null;
    this.onEquipmentChange = options.onEquipmentChange || null;
  }
  
  /**
   * 设置当前玩家
   * @param {Object} player - 玩家对象
   */
  setPlayer(player) {
    this.player = player;
  }
  
  /**
   * 更新面板
   * @param {number} deltaTime - 帧间隔时间（毫秒）
   */
  update(deltaTime) {
    if (!this.visible) return;
    
    // 可以在这里添加动画效果
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
    
    // 渲染装备槽位
    this.renderSlots(ctx);
    
    // 渲染装备
    this.renderEquipment(ctx);
    
    // 渲染属性总览
    this.renderAttributeSummary(ctx);
    
    // 渲染提示框（如果有悬停的装备）
    if (this.hoveredSlot) {
      this.renderTooltip(ctx);
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
  }
  
  /**
   * 渲染标题
   * @param {CanvasRenderingContext2D} ctx - 渲染上下文
   */
  renderTitle(ctx) {
    ctx.fillStyle = '#ffffff';
    ctx.font = 'bold 18px Arial, sans-serif';
    ctx.textAlign = 'center';
    ctx.textBaseline = 'middle';
    ctx.fillText('装备栏', this.x + this.width / 2, this.y + this.titleHeight / 2);
  }
  
  /**
   * 渲染装备槽位
   * @param {CanvasRenderingContext2D} ctx - 渲染上下文
   */
  renderSlots(ctx) {
    for (const slotType in this.slotLayout) {
      const layout = this.slotLayout[slotType];
      const slotX = this.x + layout.x;
      const slotY = this.y + layout.y;
      
      // 槽位背景
      const isHovered = this.hoveredSlot === slotType;
      const isSelected = this.selectedSlot === slotType;
      
      if (isHovered) {
        ctx.fillStyle = 'rgba(100, 100, 100, 0.6)';
      } else {
        ctx.fillStyle = 'rgba(60, 60, 60, 0.5)';
      }
      ctx.fillRect(slotX, slotY, this.slotSize, this.slotSize);
      
      // 槽位边框
      if (isSelected) {
        ctx.strokeStyle = '#ffff00';
        ctx.lineWidth = 3;
      } else if (isHovered) {
        ctx.strokeStyle = '#aaaaaa';
        ctx.lineWidth = 2;
      } else {
        ctx.strokeStyle = '#555555';
        ctx.lineWidth = 1;
      }
      ctx.strokeRect(slotX, slotY, this.slotSize, this.slotSize);
      
      // 槽位标签
      ctx.fillStyle = '#cccccc';
      ctx.font = '12px Arial, sans-serif';
      ctx.textAlign = 'center';
      ctx.textBaseline = 'top';
      ctx.fillText(
        SLOT_NAMES[slotType] || slotType,
        slotX + this.slotSize / 2,
        slotY + this.slotSize + 5
      );
    }
  }
  
  /**
   * 渲染装备
   * @param {CanvasRenderingContext2D} ctx - 渲染上下文
   */
  renderEquipment(ctx) {
    if (!this.equipmentSystem) return;
    
    for (const slotType in this.slotLayout) {
      const equipment = this.equipmentSystem.getEquipment(slotType);
      if (equipment) {
        const layout = this.slotLayout[slotType];
        const slotX = this.x + layout.x;
        const slotY = this.y + layout.y;
        
        this.renderEquipmentIcon(ctx, equipment, slotX, slotY);
      }
    }
  }
  
  /**
   * 渲染装备图标
   * @param {CanvasRenderingContext2D} ctx - 渲染上下文
   * @param {Equipment} equipment - 装备对象
   * @param {number} x - X坐标
   * @param {number} y - Y坐标
   */
  renderEquipmentIcon(ctx, equipment, x, y) {
    // 品质背景光晕
    const rarityColor = RARITY_COLORS[equipment.rarity] || '#ffffff';
    ctx.fillStyle = rarityColor;
    ctx.globalAlpha = 0.2;
    ctx.fillRect(x + 4, y + 4, this.slotSize - 8, this.slotSize - 8);
    ctx.globalAlpha = 1.0;
    
    // 装备名称缩写（简化显示）
    ctx.fillStyle = '#ffffff';
    ctx.font = 'bold 14px Arial, sans-serif';
    ctx.textAlign = 'center';
    ctx.textBaseline = 'middle';
    const shortName = equipment.name.substring(0, 2);
    ctx.fillText(shortName, x + this.slotSize / 2, y + this.slotSize / 2);
    
    // 强化等级显示
    if (equipment.enhanceLevel > 0) {
      ctx.fillStyle = '#00ff00';
      ctx.font = 'bold 12px Arial, sans-serif';
      ctx.textAlign = 'right';
      ctx.textBaseline = 'top';
      ctx.fillText(`+${equipment.enhanceLevel}`, x + this.slotSize - 4, y + 4);
    }
    
    // 品质边框
    ctx.strokeStyle = rarityColor;
    ctx.lineWidth = 2;
    ctx.strokeRect(x + 2, y + 2, this.slotSize - 4, this.slotSize - 4);
  }
  
  /**
   * 渲染属性总览
   * @param {CanvasRenderingContext2D} ctx - 渲染上下文
   */
  renderAttributeSummary(ctx) {
    if (!this.equipmentSystem || !this.player) return;
    
    const startY = this.y + 200;
    const lineHeight = 25;
    let currentY = startY;
    
    // 标题
    ctx.fillStyle = '#ffff00';
    ctx.font = 'bold 14px Arial, sans-serif';
    ctx.textAlign = 'left';
    ctx.textBaseline = 'top';
    ctx.fillText('装备属性加成:', this.x + 20, currentY);
    currentY += lineHeight + 5;
    
    // 计算总属性
    const totalAttributes = this.equipmentSystem.calculateTotalAttributes();
    
    // 显示正属性
    ctx.fillStyle = '#00ff00';
    ctx.font = '13px Arial, sans-serif';
    
    if (totalAttributes.attack > 0) {
      ctx.fillText(`攻击力: +${totalAttributes.attack}`, this.x + 30, currentY);
      currentY += lineHeight;
    }
    
    if (totalAttributes.defense > 0) {
      ctx.fillText(`防御力: +${totalAttributes.defense}`, this.x + 30, currentY);
      currentY += lineHeight;
    }
    
    if (totalAttributes.health > 0) {
      ctx.fillText(`生命值: +${totalAttributes.health}`, this.x + 30, currentY);
      currentY += lineHeight;
    }
    
    if (totalAttributes.speed > 0) {
      ctx.fillText(`速度: +${totalAttributes.speed}`, this.x + 30, currentY);
      currentY += lineHeight;
    }
    
    // 显示负属性（红色标注）
    const negativeAttributes = this.equipmentSystem.calculateTotalNegativeAttributes();
    
    if (negativeAttributes.durability !== 0 || negativeAttributes.weight !== 0) {
      currentY += 10;
      ctx.fillStyle = '#ff6666';
      ctx.font = 'bold 14px Arial, sans-serif';
      ctx.fillText('负属性:', this.x + 20, currentY);
      currentY += lineHeight + 5;
      
      ctx.fillStyle = '#ff0000';
      ctx.font = '13px Arial, sans-serif';
      
      if (negativeAttributes.durability !== 0) {
        ctx.fillText(`耐久度: ${negativeAttributes.durability}`, this.x + 30, currentY);
        currentY += lineHeight;
      }
      
      if (negativeAttributes.weight !== 0) {
        ctx.fillText(`负重: ${negativeAttributes.weight}`, this.x + 30, currentY);
        currentY += lineHeight;
      }
    }
    
    // 如果没有任何装备
    if (totalAttributes.attack === 0 && totalAttributes.defense === 0 && 
        totalAttributes.health === 0 && totalAttributes.speed === 0) {
      ctx.fillStyle = '#888888';
      ctx.font = '13px Arial, sans-serif';
      ctx.fillText('未装备任何物品', this.x + 30, startY + lineHeight + 5);
    }
  }
  
  /**
   * 渲染装备提示框
   * @param {CanvasRenderingContext2D} ctx - 渲染上下文
   */
  renderTooltip(ctx) {
    if (!this.equipmentSystem || !this.hoveredSlot) return;
    
    const equipment = this.equipmentSystem.getEquipment(this.hoveredSlot);
    if (!equipment) return;
    
    // 提示框位置（显示在面板右侧）
    const tooltipX = this.x + this.width + 10;
    let tooltipY = this.y + 50;
    
    // 计算提示框高度
    let contentHeight = 0;
    const lineHeight = 20;
    const padding = 15;
    
    // 标题 + 等级品质 + 描述 + 属性
    contentHeight += lineHeight * 2; // 标题和等级
    if (equipment.description) {
      contentHeight += lineHeight * 2; // 描述（估算2行）
    }
    contentHeight += lineHeight; // 属性标题
    
    // 计算属性行数
    let attrCount = 0;
    if (equipment.attributes.attack > 0) attrCount++;
    if (equipment.attributes.defense > 0) attrCount++;
    if (equipment.attributes.health > 0) attrCount++;
    if (equipment.attributes.speed > 0) attrCount++;
    contentHeight += lineHeight * attrCount;
    
    // 负属性
    if (equipment.negativeAttributes.durability !== 0 || equipment.negativeAttributes.weight !== 0) {
      contentHeight += lineHeight; // 负属性标题
      if (equipment.negativeAttributes.durability !== 0) contentHeight += lineHeight;
      if (equipment.negativeAttributes.weight !== 0) contentHeight += lineHeight;
    }
    
    const tooltipHeight = Math.min(contentHeight + padding * 2, this.tooltipMaxHeight);
    
    // 绘制提示框背景
    ctx.fillStyle = 'rgba(0, 0, 0, 0.95)';
    ctx.fillRect(tooltipX, tooltipY, this.tooltipWidth, tooltipHeight);
    
    // 绘制边框（使用品质颜色）
    const rarityColor = RARITY_COLORS[equipment.rarity] || '#ffffff';
    ctx.strokeStyle = rarityColor;
    ctx.lineWidth = 2;
    ctx.strokeRect(tooltipX, tooltipY, this.tooltipWidth, tooltipHeight);
    
    // 绘制内容
    let currentY = tooltipY + padding;
    
    // 装备名称（带强化等级）
    ctx.fillStyle = rarityColor;
    ctx.font = 'bold 16px Arial, sans-serif';
    ctx.textAlign = 'left';
    ctx.textBaseline = 'top';
    ctx.fillText(equipment.getDisplayName(), tooltipX + padding, currentY);
    currentY += lineHeight + 5;
    
    // 等级和品质
    ctx.fillStyle = '#cccccc';
    ctx.font = '12px Arial, sans-serif';
    const rarityNames = {
      [EquipmentRarity.COMMON]: '普通',
      [EquipmentRarity.UNCOMMON]: '优秀',
      [EquipmentRarity.RARE]: '稀有',
      [EquipmentRarity.EPIC]: '史诗',
      [EquipmentRarity.LEGENDARY]: '传说'
    };
    const rarityText = rarityNames[equipment.rarity] || '未知';
    ctx.fillText(`等级 ${equipment.level} | ${rarityText}`, tooltipX + padding, currentY);
    currentY += lineHeight + 5;
    
    // 描述
    if (equipment.description) {
      ctx.fillStyle = '#aaaaaa';
      ctx.font = '11px Arial, sans-serif';
      this.wrapText(ctx, equipment.description, tooltipX + padding, currentY, this.tooltipWidth - padding * 2, lineHeight);
      currentY += lineHeight * 2 + 5;
    }
    
    // 属性标题
    ctx.fillStyle = '#ffff00';
    ctx.font = 'bold 13px Arial, sans-serif';
    ctx.fillText('属性:', tooltipX + padding, currentY);
    currentY += lineHeight;
    
    // 正属性（绿色）
    ctx.fillStyle = '#00ff00';
    ctx.font = '12px Arial, sans-serif';
    
    if (equipment.attributes.attack > 0) {
      ctx.fillText(`  攻击力: +${equipment.attributes.attack}`, tooltipX + padding, currentY);
      currentY += lineHeight;
    }
    
    if (equipment.attributes.defense > 0) {
      ctx.fillText(`  防御力: +${equipment.attributes.defense}`, tooltipX + padding, currentY);
      currentY += lineHeight;
    }
    
    if (equipment.attributes.health > 0) {
      ctx.fillText(`  生命值: +${equipment.attributes.health}`, tooltipX + padding, currentY);
      currentY += lineHeight;
    }
    
    if (equipment.attributes.speed > 0) {
      ctx.fillText(`  速度: +${equipment.attributes.speed}`, tooltipX + padding, currentY);
      currentY += lineHeight;
    }
    
    // 负属性（红色标注）
    if (equipment.negativeAttributes.durability !== 0 || equipment.negativeAttributes.weight !== 0) {
      currentY += 5;
      ctx.fillStyle = '#ff6666';
      ctx.font = 'bold 13px Arial, sans-serif';
      ctx.fillText('负属性:', tooltipX + padding, currentY);
      currentY += lineHeight;
      
      ctx.fillStyle = '#ff0000';
      ctx.font = '12px Arial, sans-serif';
      
      if (equipment.negativeAttributes.durability !== 0) {
        ctx.fillText(`  耐久度: ${equipment.negativeAttributes.durability}`, tooltipX + padding, currentY);
        currentY += lineHeight;
      }
      
      if (equipment.negativeAttributes.weight !== 0) {
        ctx.fillText(`  负重: ${equipment.negativeAttributes.weight}`, tooltipX + padding, currentY);
        currentY += lineHeight;
      }
    }
  }
  
  /**
   * 文字换行辅助函数
   * @param {CanvasRenderingContext2D} ctx - 渲染上下文
   * @param {string} text - 文本
   * @param {number} x - X坐标
   * @param {number} y - Y坐标
   * @param {number} maxWidth - 最大宽度
   * @param {number} lineHeight - 行高
   */
  wrapText(ctx, text, x, y, maxWidth, lineHeight) {
    const words = text.split('');
    let line = '';
    let currentY = y;
    
    for (let i = 0; i < words.length; i++) {
      const testLine = line + words[i];
      const metrics = ctx.measureText(testLine);
      
      if (metrics.width > maxWidth && i > 0) {
        ctx.fillText(line, x, currentY);
        line = words[i];
        currentY += lineHeight;
      } else {
        line = testLine;
      }
    }
    ctx.fillText(line, x, currentY);
  }
  
  /**
   * 处理鼠标移动事件
   * @param {number} mouseX - 鼠标X坐标
   * @param {number} mouseY - 鼠标Y坐标
   */
  handleMouseMove(mouseX, mouseY) {
    if (!this.visible) {
      this.hoveredSlot = null;
      return;
    }
    
    // 检查鼠标是否在面板内
    if (!this.containsPoint(mouseX, mouseY)) {
      this.hoveredSlot = null;
      return;
    }
    
    // 检查鼠标是否悬停在某个装备槽上
    this.hoveredSlot = null;
    for (const slotType in this.slotLayout) {
      const layout = this.slotLayout[slotType];
      const slotX = this.x + layout.x;
      const slotY = this.y + layout.y;
      
      if (mouseX >= slotX && mouseX <= slotX + this.slotSize &&
          mouseY >= slotY && mouseY <= slotY + this.slotSize) {
        this.hoveredSlot = slotType;
        break;
      }
    }
  }
  
  /**
   * 处理鼠标点击事件
   * @param {number} mouseX - 鼠标X坐标
   * @param {number} mouseY - 鼠标Y坐标
   * @returns {boolean} 是否处理了点击事件
   */
  handleMouseClick(mouseX, mouseY) {
    if (!this.visible || !this.containsPoint(mouseX, mouseY)) {
      return false;
    }
    
    // 检查是否点击了装备槽
    for (const slotType in this.slotLayout) {
      const layout = this.slotLayout[slotType];
      const slotX = this.x + layout.x;
      const slotY = this.y + layout.y;
      
      if (mouseX >= slotX && mouseX <= slotX + this.slotSize &&
          mouseY >= slotY && mouseY <= slotY + this.slotSize) {
        this.selectedSlot = slotType;
        
        // 触发槽位点击回调
        if (this.onSlotClick) {
          this.onSlotClick(slotType, this.equipmentSystem?.getEquipment(slotType));
        }
        
        return true;
      }
    }
    
    // 点击了面板其他区域，也算处理了（阻止事件传播）
    return true;
  }
  
  /**
   * 切换面板显示/隐藏
   */
  toggle() {
    this.visible = !this.visible;
  }
  
  /**
   * 显示面板
   */
  show() {
    this.visible = true;
  }
  
  /**
   * 隐藏面板
   */
  hide() {
    this.visible = false;
    this.hoveredSlot = null;
    this.selectedSlot = null;
  }
}

export default EquipmentPanel;
