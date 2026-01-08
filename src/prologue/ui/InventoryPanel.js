/**
 * 背包面板 (InventoryPanel) - 序章专用
 * 
 * 显示和管理玩家背包的UI面板
 * 
 * 功能:
 * - 网格式物品显示
 * - 物品拖拽功能
 * - 物品使用/装备按钮
 * - 物品详情提示框
 * - 物品排序和筛选
 * 
 * 需求: 3, 4
 */

import { UIElement } from '../../ui/UIElement.js';

/**
 * 物品类型颜色映射
 */
const ITEM_TYPE_COLORS = {
  equipment: '#4080ff',    // 装备 - 蓝色
  consumable: '#40ff40',   // 消耗品 - 绿色
  material: '#c0c0c0',     // 材料 - 银色
  quest: '#ffff00',        // 任务物品 - 黄色
  currency: '#ffd700'      // 货币 - 金色
};

/**
 * 物品类型中文名称
 */
const ITEM_TYPE_NAMES = {
  equipment: '装备',
  consumable: '消耗品',
  material: '材料',
  quest: '任务物品',
  currency: '货币'
};

/**
 * 背包面板类
 */
export class InventoryPanel extends UIElement {
  /**
   * 创建背包面板
   * @param {Object} options - 配置选项
   * @param {number} options.x - X坐标
   * @param {number} options.y - Y坐标
   * @param {number} options.width - 宽度
   * @param {number} options.height - 高度
   * @param {InventorySystem} options.inventorySystem - 背包系统实例
   * @param {EquipmentSystem} options.equipmentSystem - 装备系统实例（用于装备物品）
   */
  constructor(options = {}) {
    super({
      x: options.x || 50,
      y: options.y || 50,
      width: options.width || 600,
      height: options.height || 500,
      visible: options.visible !== undefined ? options.visible : false,
      zIndex: options.zIndex || 100
    });
    
    this.inventorySystem = options.inventorySystem;
    this.equipmentSystem = options.equipmentSystem;
    this.player = null;
    
    // UI布局配置
    this.titleHeight = 40;
    this.gridCols = 6;  // 6列
    this.gridRows = 5;  // 5行，共30个槽位
    this.slotSize = 60;
    this.slotPadding = 5;
    this.tooltipWidth = 280;
    this.tooltipMaxHeight = 400;
    
    // 计算网格起始位置
    this.gridStartX = 20;
    this.gridStartY = this.titleHeight + 20;
    
    // 交互状态
    this.hoveredSlot = null;
    this.selectedSlot = null;
    this.draggedSlot = null;
    this.dragStartPos = null;
    this.dragCurrentPos = null;
    
    // 筛选和排序
    this.filterType = 'all';  // all, equipment, consumable, material, quest
    this.sortMode = 'default';  // default, name, type, quantity
    
    // 事件回调
    this.onItemUse = options.onItemUse || null;
    this.onItemEquip = options.onItemEquip || null;
    this.onItemDrop = options.onItemDrop || null;
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
    
    // 渲染标题和容量信息
    this.renderTitle(ctx);
    
    // 渲染筛选按钮
    this.renderFilterButtons(ctx);
    
    // 渲染物品网格
    this.renderGrid(ctx);
    
    // 渲染物品
    this.renderItems(ctx);
    
    // 渲染拖拽中的物品
    if (this.draggedSlot !== null && this.dragCurrentPos) {
      this.renderDraggedItem(ctx);
    }
    
    // 渲染提示框（如果有悬停的物品）
    if (this.hoveredSlot !== null && this.draggedSlot === null) {
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
   * 渲染标题和容量信息
   * @param {CanvasRenderingContext2D} ctx - 渲染上下文
   */
  renderTitle(ctx) {
    // 标题
    ctx.fillStyle = '#ffffff';
    ctx.font = 'bold 18px Arial, sans-serif';
    ctx.textAlign = 'left';
    ctx.textBaseline = 'middle';
    ctx.fillText('背包', this.x + 20, this.y + this.titleHeight / 2);
    
    // 容量信息
    if (this.inventorySystem) {
      const used = this.inventorySystem.getUsedSlots();
      const max = this.inventorySystem.maxSlots;
      const capacityText = `${used}/${max}`;
      
      ctx.fillStyle = used >= max ? '#ff6666' : '#cccccc';
      ctx.font = '14px Arial, sans-serif';
      ctx.textAlign = 'right';
      ctx.fillText(capacityText, this.x + this.width - 20, this.y + this.titleHeight / 2);
    }
  }
  
  /**
   * 渲染筛选按钮
   * @param {CanvasRenderingContext2D} ctx - 渲染上下文
   */
  renderFilterButtons(ctx) {
    const filters = [
      { id: 'all', name: '全部' },
      { id: 'equipment', name: '装备' },
      { id: 'consumable', name: '消耗品' },
      { id: 'material', name: '材料' }
    ];
    
    const buttonWidth = 70;
    const buttonHeight = 25;
    const buttonSpacing = 10;
    const startX = this.x + this.gridStartX;
    const startY = this.y + this.titleHeight + 5;
    
    filters.forEach((filter, index) => {
      const buttonX = startX + index * (buttonWidth + buttonSpacing);
      const buttonY = startY;
      const isActive = this.filterType === filter.id;
      
      // 按钮背景
      ctx.fillStyle = isActive ? 'rgba(80, 120, 200, 0.6)' : 'rgba(60, 60, 60, 0.5)';
      ctx.fillRect(buttonX, buttonY, buttonWidth, buttonHeight);
      
      // 按钮边框
      ctx.strokeStyle = isActive ? '#6080ff' : '#555555';
      ctx.lineWidth = 1;
      ctx.strokeRect(buttonX, buttonY, buttonWidth, buttonHeight);
      
      // 按钮文字
      ctx.fillStyle = isActive ? '#ffffff' : '#cccccc';
      ctx.font = '12px Arial, sans-serif';
      ctx.textAlign = 'center';
      ctx.textBaseline = 'middle';
      ctx.fillText(filter.name, buttonX + buttonWidth / 2, buttonY + buttonHeight / 2);
    });
  }
  
  /**
   * 渲染物品网格
   * @param {CanvasRenderingContext2D} ctx - 渲染上下文
   */
  renderGrid(ctx) {
    const gridY = this.y + this.gridStartY + 40;  // 筛选按钮下方
    
    for (let row = 0; row < this.gridRows; row++) {
      for (let col = 0; col < this.gridCols; col++) {
        const slotIndex = row * this.gridCols + col;
        const slotX = this.x + this.gridStartX + col * (this.slotSize + this.slotPadding);
        const slotY = gridY + row * (this.slotSize + this.slotPadding);
        
        // 槽位背景
        const isHovered = this.hoveredSlot === slotIndex;
        const isSelected = this.selectedSlot === slotIndex;
        const isDragTarget = this.draggedSlot !== null && this.draggedSlot !== slotIndex;
        
        if (isHovered && isDragTarget) {
          ctx.fillStyle = 'rgba(100, 150, 100, 0.6)';  // 拖拽目标高亮
        } else if (isHovered) {
          ctx.fillStyle = 'rgba(100, 100, 100, 0.6)';
        } else {
          ctx.fillStyle = 'rgba(60, 60, 60, 0.5)';
        }
        ctx.fillRect(slotX, slotY, this.slotSize, this.slotSize);
        
        // 槽位边框
        if (isSelected) {
          ctx.strokeStyle = '#ffff00';
          ctx.lineWidth = 2;
        } else if (isHovered) {
          ctx.strokeStyle = '#aaaaaa';
          ctx.lineWidth = 2;
        } else {
          ctx.strokeStyle = '#555555';
          ctx.lineWidth = 1;
        }
        ctx.strokeRect(slotX, slotY, this.slotSize, this.slotSize);
      }
    }
  }
  
  /**
   * 渲染物品
   * @param {CanvasRenderingContext2D} ctx - 渲染上下文
   */
  renderItems(ctx) {
    if (!this.inventorySystem) return;
    
    const items = this.getFilteredItems();
    const gridY = this.y + this.gridStartY + 40;
    
    items.forEach((slot, index) => {
      if (index === this.draggedSlot) return;  // 跳过正在拖拽的物品
      
      const row = Math.floor(index / this.gridCols);
      const col = index % this.gridCols;
      const slotX = this.x + this.gridStartX + col * (this.slotSize + this.slotPadding);
      const slotY = gridY + row * (this.slotSize + this.slotPadding);
      
      this.renderItemIcon(ctx, slot, slotX, slotY);
    });
  }
  
  /**
   * 渲染物品图标
   * @param {CanvasRenderingContext2D} ctx - 渲染上下文
   * @param {Object} slot - 物品槽位对象
   * @param {number} x - X坐标
   * @param {number} y - Y坐标
   */
  renderItemIcon(ctx, slot, x, y) {
    const item = slot.item;
    const quantity = slot.quantity;
    
    // 物品类型背景光晕
    const typeColor = ITEM_TYPE_COLORS[item.type] || '#ffffff';
    ctx.fillStyle = typeColor;
    ctx.globalAlpha = 0.2;
    ctx.fillRect(x + 4, y + 4, this.slotSize - 8, this.slotSize - 8);
    ctx.globalAlpha = 1.0;
    
    // 物品名称缩写（简化显示）
    ctx.fillStyle = '#ffffff';
    ctx.font = 'bold 14px Arial, sans-serif';
    ctx.textAlign = 'center';
    ctx.textBaseline = 'middle';
    const shortName = item.name.substring(0, 2);
    ctx.fillText(shortName, x + this.slotSize / 2, y + this.slotSize / 2 - 5);
    
    // 数量显示
    if (quantity > 1) {
      ctx.fillStyle = '#ffffff';
      ctx.font = 'bold 12px Arial, sans-serif';
      ctx.textAlign = 'right';
      ctx.textBaseline = 'bottom';
      ctx.fillText(`×${quantity}`, x + this.slotSize - 4, y + this.slotSize - 4);
    }
    
    // 类型边框
    ctx.strokeStyle = typeColor;
    ctx.lineWidth = 2;
    ctx.strokeRect(x + 2, y + 2, this.slotSize - 4, this.slotSize - 4);
  }
  
  /**
   * 渲染拖拽中的物品
   * @param {CanvasRenderingContext2D} ctx - 渲染上下文
   */
  renderDraggedItem(ctx) {
    if (!this.inventorySystem || this.draggedSlot === null || !this.dragCurrentPos) return;
    
    const slot = this.inventorySystem.getItemAtSlot(this.draggedSlot);
    if (!slot) return;
    
    const x = this.dragCurrentPos.x - this.slotSize / 2;
    const y = this.dragCurrentPos.y - this.slotSize / 2;
    
    // 半透明效果
    ctx.globalAlpha = 0.8;
    this.renderItemIcon(ctx, slot, x, y);
    ctx.globalAlpha = 1.0;
  }
  
  /**
   * 渲染物品提示框
   * @param {CanvasRenderingContext2D} ctx - 渲染上下文
   */
  renderTooltip(ctx) {
    if (!this.inventorySystem || this.hoveredSlot === null) return;
    
    const slot = this.inventorySystem.getItemAtSlot(this.hoveredSlot);
    if (!slot) return;
    
    const item = slot.item;
    const quantity = slot.quantity;
    
    // 提示框位置（显示在面板右侧）
    const tooltipX = this.x + this.width + 10;
    let tooltipY = this.y + 50;
    
    // 计算提示框高度
    let contentHeight = 0;
    const lineHeight = 20;
    const padding = 15;
    
    // 标题 + 类型 + 描述 + 数量 + 操作按钮
    contentHeight += lineHeight * 2; // 标题和类型
    if (item.description) {
      contentHeight += lineHeight * 2; // 描述（估算2行）
    }
    contentHeight += lineHeight; // 数量
    
    // 装备属性
    if (item.type === 'equipment' && item.attributes) {
      contentHeight += lineHeight; // 属性标题
      let attrCount = 0;
      if (item.attributes.attack > 0) attrCount++;
      if (item.attributes.defense > 0) attrCount++;
      if (item.attributes.health > 0) attrCount++;
      if (item.attributes.speed > 0) attrCount++;
      contentHeight += lineHeight * attrCount;
    }
    
    // 操作按钮
    contentHeight += lineHeight * 2;
    
    const tooltipHeight = Math.min(contentHeight + padding * 2, this.tooltipMaxHeight);
    
    // 绘制提示框背景
    ctx.fillStyle = 'rgba(0, 0, 0, 0.95)';
    ctx.fillRect(tooltipX, tooltipY, this.tooltipWidth, tooltipHeight);
    
    // 绘制边框（使用类型颜色）
    const typeColor = ITEM_TYPE_COLORS[item.type] || '#ffffff';
    ctx.strokeStyle = typeColor;
    ctx.lineWidth = 2;
    ctx.strokeRect(tooltipX, tooltipY, this.tooltipWidth, tooltipHeight);
    
    // 绘制内容
    let currentY = tooltipY + padding;
    
    // 物品名称
    ctx.fillStyle = typeColor;
    ctx.font = 'bold 16px Arial, sans-serif';
    ctx.textAlign = 'left';
    ctx.textBaseline = 'top';
    ctx.fillText(item.name, tooltipX + padding, currentY);
    currentY += lineHeight + 5;
    
    // 类型
    ctx.fillStyle = '#cccccc';
    ctx.font = '12px Arial, sans-serif';
    const typeName = ITEM_TYPE_NAMES[item.type] || '未知';
    ctx.fillText(`类型: ${typeName}`, tooltipX + padding, currentY);
    currentY += lineHeight + 5;
    
    // 描述
    if (item.description) {
      ctx.fillStyle = '#aaaaaa';
      ctx.font = '11px Arial, sans-serif';
      this.wrapText(ctx, item.description, tooltipX + padding, currentY, this.tooltipWidth - padding * 2, lineHeight);
      currentY += lineHeight * 2 + 5;
    }
    
    // 数量
    if (quantity > 1) {
      ctx.fillStyle = '#ffffff';
      ctx.font = '12px Arial, sans-serif';
      ctx.fillText(`数量: ${quantity}`, tooltipX + padding, currentY);
      currentY += lineHeight + 5;
    }
    
    // 装备属性
    if (item.type === 'equipment' && item.attributes) {
      ctx.fillStyle = '#ffff00';
      ctx.font = 'bold 13px Arial, sans-serif';
      ctx.fillText('属性:', tooltipX + padding, currentY);
      currentY += lineHeight;
      
      ctx.fillStyle = '#00ff00';
      ctx.font = '12px Arial, sans-serif';
      
      if (item.attributes.attack > 0) {
        ctx.fillText(`  攻击力: +${item.attributes.attack}`, tooltipX + padding, currentY);
        currentY += lineHeight;
      }
      
      if (item.attributes.defense > 0) {
        ctx.fillText(`  防御力: +${item.attributes.defense}`, tooltipX + padding, currentY);
        currentY += lineHeight;
      }
      
      if (item.attributes.health > 0) {
        ctx.fillText(`  生命值: +${item.attributes.health}`, tooltipX + padding, currentY);
        currentY += lineHeight;
      }
      
      if (item.attributes.speed > 0) {
        ctx.fillText(`  速度: +${item.attributes.speed}`, tooltipX + padding, currentY);
        currentY += lineHeight;
      }
      
      currentY += 5;
    }
    
    // 操作提示
    currentY += 5;
    ctx.fillStyle = '#888888';
    ctx.font = '11px Arial, sans-serif';
    
    if (item.type === 'equipment') {
      ctx.fillText('右键: 装备', tooltipX + padding, currentY);
      currentY += lineHeight;
    } else if (item.type === 'consumable') {
      ctx.fillText('右键: 使用', tooltipX + padding, currentY);
      currentY += lineHeight;
    }
    
    ctx.fillText('拖拽: 移动物品', tooltipX + padding, currentY);
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
   * 获取筛选后的物品列表
   * @returns {Array} 物品槽位数组
   */
  getFilteredItems() {
    if (!this.inventorySystem) return [];
    
    const allItems = this.inventorySystem.getAllItems();
    
    if (this.filterType === 'all') {
      return allItems;
    }
    
    return allItems.filter(slot => slot.item.type === this.filterType);
  }
  
  /**
   * 获取槽位在网格中的位置
   * @param {number} slotIndex - 槽位索引
   * @returns {Object} {x, y} 坐标
   */
  getSlotPosition(slotIndex) {
    const row = Math.floor(slotIndex / this.gridCols);
    const col = slotIndex % this.gridCols;
    const gridY = this.y + this.gridStartY + 40;
    
    return {
      x: this.x + this.gridStartX + col * (this.slotSize + this.slotPadding),
      y: gridY + row * (this.slotSize + this.slotPadding)
    };
  }
  
  /**
   * 根据鼠标坐标获取槽位索引
   * @param {number} mouseX - 鼠标X坐标
   * @param {number} mouseY - 鼠标Y坐标
   * @returns {number|null} 槽位索引，如果不在任何槽位上则返回null
   */
  getSlotAtPosition(mouseX, mouseY) {
    const gridY = this.y + this.gridStartY + 40;
    
    for (let row = 0; row < this.gridRows; row++) {
      for (let col = 0; col < this.gridCols; col++) {
        const slotIndex = row * this.gridCols + col;
        const slotX = this.x + this.gridStartX + col * (this.slotSize + this.slotPadding);
        const slotY = gridY + row * (this.slotSize + this.slotPadding);
        
        if (mouseX >= slotX && mouseX <= slotX + this.slotSize &&
            mouseY >= slotY && mouseY <= slotY + this.slotSize) {
          return slotIndex;
        }
      }
    }
    
    return null;
  }
  
  /**
   * 检查鼠标是否在筛选按钮上
   * @param {number} mouseX - 鼠标X坐标
   * @param {number} mouseY - 鼠标Y坐标
   * @returns {string|null} 筛选类型ID，如果不在按钮上则返回null
   */
  getFilterButtonAtPosition(mouseX, mouseY) {
    const filters = ['all', 'equipment', 'consumable', 'material'];
    const buttonWidth = 70;
    const buttonHeight = 25;
    const buttonSpacing = 10;
    const startX = this.x + this.gridStartX;
    const startY = this.y + this.titleHeight + 5;
    
    for (let i = 0; i < filters.length; i++) {
      const buttonX = startX + i * (buttonWidth + buttonSpacing);
      const buttonY = startY;
      
      if (mouseX >= buttonX && mouseX <= buttonX + buttonWidth &&
          mouseY >= buttonY && mouseY <= buttonY + buttonHeight) {
        return filters[i];
      }
    }
    
    return null;
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
    
    // 更新拖拽位置
    if (this.draggedSlot !== null) {
      this.dragCurrentPos = { x: mouseX, y: mouseY };
      return;
    }
    
    // 检查鼠标是否在面板内
    if (!this.containsPoint(mouseX, mouseY)) {
      this.hoveredSlot = null;
      return;
    }
    
    // 检查鼠标是否悬停在某个槽位上
    this.hoveredSlot = this.getSlotAtPosition(mouseX, mouseY);
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
    
    // 检查是否点击了筛选按钮
    const filterButton = this.getFilterButtonAtPosition(mouseX, mouseY);
    if (filterButton) {
      this.filterType = filterButton;
      return true;
    }
    
    // 检查是否点击了物品槽位
    const slotIndex = this.getSlotAtPosition(mouseX, mouseY);
    if (slotIndex !== null) {
      const slot = this.inventorySystem?.getItemAtSlot(slotIndex);
      
      if (slot) {
        if (button === 0) {
          // 左键：开始拖拽
          this.draggedSlot = slotIndex;
          this.dragStartPos = { x: mouseX, y: mouseY };
          this.dragCurrentPos = { x: mouseX, y: mouseY };
          this.selectedSlot = slotIndex;
        } else if (button === 2) {
          // 右键：使用或装备物品
          this.handleItemAction(slot);
        }
      }
      
      return true;
    }
    
    // 点击了面板其他区域，也算处理了（阻止事件传播）
    return true;
  }
  
  /**
   * 处理鼠标释放事件
   * @param {number} mouseX - 鼠标X坐标
   * @param {number} mouseY - 鼠标Y坐标
   * @returns {boolean} 是否处理了事件
   */
  handleMouseUp(mouseX, mouseY) {
    if (this.draggedSlot === null) {
      return false;
    }
    
    // 检查是否在槽位上释放
    const targetSlot = this.getSlotAtPosition(mouseX, mouseY);
    
    if (targetSlot !== null && targetSlot !== this.draggedSlot) {
      // 交换物品
      if (this.inventorySystem) {
        this.inventorySystem.swapSlots(this.draggedSlot, targetSlot);
      }
    }
    
    // 重置拖拽状态
    this.draggedSlot = null;
    this.dragStartPos = null;
    this.dragCurrentPos = null;
    
    return true;
  }
  
  /**
   * 处理物品操作（使用或装备）
   * @param {Object} slot - 物品槽位对象
   */
  handleItemAction(slot) {
    const item = slot.item;
    
    if (item.type === 'equipment') {
      // 装备物品
      if (this.equipmentSystem && this.onItemEquip) {
        this.onItemEquip(item);
      }
    } else if (item.type === 'consumable') {
      // 使用消耗品
      if (this.onItemUse) {
        this.onItemUse(item);
      }
    }
  }
  
  /**
   * 切换面板显示/隐藏
   */
  toggle() {
    this.visible = !this.visible;
    if (!this.visible) {
      this.resetState();
    }
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
    this.resetState();
  }
  
  /**
   * 重置交互状态
   */
  resetState() {
    this.hoveredSlot = null;
    this.selectedSlot = null;
    this.draggedSlot = null;
    this.dragStartPos = null;
    this.dragCurrentPos = null;
  }
}

export default InventoryPanel;
