/**
 * InventoryPanel.js
 * 背包UI组件 - 显示和管理物品
 */

import { UIElement } from './UIElement.js';
import { ItemRarity } from '../data/ItemData.js';

/**
 * 背包面板
 */
export class InventoryPanel extends UIElement {
  /**
   * @param {Object} options - 配置选项
   */
  constructor(options = {}) {
    super({
      x: options.x || 400,
      y: options.y || 50,
      width: options.width || 400,
      height: options.height || 500,
      visible: options.visible || false,
      zIndex: options.zIndex || 100
    });

    this.title = '背包';
    this.entity = null;
    this.slotSize = 40;
    this.slotPadding = 4;
    this.slotsPerRow = 8;
    this.maxVisibleRows = 8;
    
    // 计算槽位布局
    this.slotStartX = 20;
    this.slotStartY = 80;
    
    // 过滤器按钮
    this.filterButtons = [
      { name: 'all', label: '全部', x: 20, y: 45, width: 60, height: 25 },
      { name: 'equipment', label: '装备', x: 90, y: 45, width: 60, height: 25 },
      { name: 'consumable', label: '消耗品', x: 160, y: 45, width: 60, height: 25 },
      { name: 'material', label: '材料', x: 230, y: 45, width: 60, height: 25 },
      { name: 'quest', label: '任务', x: 300, y: 45, width: 60, height: 25 }
    ];
    
    // 交互状态
    this.hoveredSlot = -1;
    this.selectedSlot = -1;
    this.draggedItem = null;
    this.dragOffset = { x: 0, y: 0 };
    
    // 右键菜单
    this.contextMenu = {
      visible: false,
      x: 0,
      y: 0,
      slotIndex: -1,
      options: []
    };
    
    // 事件回调
    this.onItemUse = options.onItemUse || null;
    this.onItemDrop = options.onItemDrop || null;
    this.onFilterChange = options.onFilterChange || null;
  }

  /**
   * 设置显示的实体
   * @param {Entity} entity - 实体对象
   */
  setEntity(entity) {
    this.entity = entity;
  }

  /**
   * 更新背包面板
   * @param {number} deltaTime - 帧间隔时间
   */
  update(deltaTime) {
    if (!this.visible || !this.entity) return;
  }

  /**
   * 渲染背包面板
   * @param {CanvasRenderingContext2D} ctx - 渲染上下文
   */
  render(ctx) {
    if (!this.visible) return;

    ctx.save();

    // 绘制面板背景
    this.renderBackground(ctx);
    
    // 绘制标题
    this.renderTitle(ctx);
    
    // 绘制过滤器按钮
    this.renderFilterButtons(ctx);
    
    // 绘制物品槽位
    this.renderItemSlots(ctx);
    
    // 绘制右键菜单
    this.renderContextMenu(ctx);
    
    // 绘制物品提示框
    this.renderItemTooltip(ctx);
    
    // 绘制拖拽物品
    this.renderDraggedItem(ctx);

    ctx.restore();
  }

  /**
   * 渲染背景
   * @param {CanvasRenderingContext2D} ctx - 渲染上下文
   */
  renderBackground(ctx) {
    // 背景
    ctx.fillStyle = 'rgba(0, 0, 0, 0.85)';
    ctx.fillRect(this.x, this.y, this.width, this.height);
    
    // 边框
    ctx.strokeStyle = '#666';
    ctx.lineWidth = 2;
    ctx.strokeRect(this.x, this.y, this.width, this.height);
  }

  /**
   * 渲染标题
   * @param {CanvasRenderingContext2D} ctx - 渲染上下文
   */
  renderTitle(ctx) {
    ctx.fillStyle = '#ffffff';
    ctx.font = 'bold 16px Arial';
    ctx.textAlign = 'left';
    ctx.fillText(this.title, this.x + 20, this.y + 25);
    
    // 显示背包使用情况
    if (this.entity) {
      const inventoryComponent = this.entity.getComponent('inventory');
      if (inventoryComponent) {
        const used = inventoryComponent.getUsedSlotCount();
        const total = inventoryComponent.maxSlots;
        ctx.fillStyle = '#cccccc';
        ctx.font = '12px Arial';
        ctx.textAlign = 'right';
        ctx.fillText(`${used}/${total}`, this.x + this.width - 20, this.y + 25);
      }
    }
  }

  /**
   * 渲染过滤器按钮
   * @param {CanvasRenderingContext2D} ctx - 渲染上下文
   */
  renderFilterButtons(ctx) {
    if (!this.entity) return;
    
    const inventoryComponent = this.entity.getComponent('inventory');
    if (!inventoryComponent) return;

    for (const button of this.filterButtons) {
      const buttonX = this.x + button.x;
      const buttonY = this.y + button.y;
      const isActive = inventoryComponent.currentFilter === button.name;
      
      // 按钮背景
      ctx.fillStyle = isActive ? 'rgba(100, 150, 255, 0.8)' : 'rgba(100, 100, 100, 0.5)';
      ctx.fillRect(buttonX, buttonY, button.width, button.height);
      
      // 按钮边框
      ctx.strokeStyle = isActive ? '#6496ff' : '#888';
      ctx.lineWidth = 1;
      ctx.strokeRect(buttonX, buttonY, button.width, button.height);
      
      // 按钮文字
      ctx.fillStyle = '#ffffff';
      ctx.font = '11px Arial';
      ctx.textAlign = 'center';
      ctx.fillText(button.label, buttonX + button.width / 2, buttonY + button.height / 2 + 4);
    }
  }

  /**
   * 渲染物品槽位
   * @param {CanvasRenderingContext2D} ctx - 渲染上下文
   */
  renderItemSlots(ctx) {
    if (!this.entity) return;
    
    const inventoryComponent = this.entity.getComponent('inventory');
    if (!inventoryComponent) return;

    // 获取筛选后的物品
    const filteredItems = this.getFilteredItems(inventoryComponent);
    
    // 渲染筛选后的物品
    for (let i = 0; i < filteredItems.length; i++) {
      const row = Math.floor(i / this.slotsPerRow);
      const col = i % this.slotsPerRow;
      
      if (row >= this.maxVisibleRows) break;
      
      const slotX = this.x + this.slotStartX + col * (this.slotSize + this.slotPadding);
      const slotY = this.y + this.slotStartY + row * (this.slotSize + this.slotPadding);
      
      const filteredItem = filteredItems[i];
      this.renderFilteredSlot(ctx, filteredItem, slotX, slotY, i);
    }
    
    // 如果是显示全部，还需要渲染空槽位
    if (inventoryComponent.currentFilter === 'all') {
      const totalSlots = inventoryComponent.maxSlots;
      const usedSlots = inventoryComponent.getUsedSlotCount();
      
      for (let i = usedSlots; i < totalSlots; i++) {
        const row = Math.floor(i / this.slotsPerRow);
        const col = i % this.slotsPerRow;
        
        if (row >= this.maxVisibleRows) break;
        
        const slotX = this.x + this.slotStartX + col * (this.slotSize + this.slotPadding);
        const slotY = this.y + this.slotStartY + row * (this.slotSize + this.slotPadding);
        
        this.renderEmptySlot(ctx, slotX, slotY, i);
      }
    }
  }

  /**
   * 获取筛选后的物品
   * @param {InventoryComponent} inventoryComponent - 背包组件
   * @returns {Array} 筛选后的物品列表
   */
  getFilteredItems(inventoryComponent) {
    const allItems = inventoryComponent.getAllItems();
    const currentFilter = inventoryComponent.currentFilter;
    
    if (currentFilter === 'all') {
      return allItems;
    }
    
    const filter = inventoryComponent.filters[currentFilter];
    if (!filter) {
      return allItems;
    }
    
    return allItems.filter(({ slot }) => filter(slot.item));
  }

  /**
   * 渲染筛选后的槽位
   * @param {CanvasRenderingContext2D} ctx - 渲染上下文
   * @param {Object} filteredItem - 筛选后的物品
   * @param {number} x - X坐标
   * @param {number} y - Y坐标
   * @param {number} displayIndex - 显示索引
   */
  renderFilteredSlot(ctx, filteredItem, x, y, displayIndex) {
    const { slot, index: originalIndex } = filteredItem;
    const isHovered = this.hoveredSlot === originalIndex;
    const isSelected = this.selectedSlot === originalIndex;
    
    // 槽位背景
    ctx.fillStyle = isHovered ? 'rgba(255, 255, 255, 0.2)' : 'rgba(100, 100, 100, 0.3)';
    ctx.fillRect(x, y, this.slotSize, this.slotSize);
    
    // 槽位边框
    ctx.strokeStyle = isSelected ? '#ffff00' : (isHovered ? '#ffffff' : '#666');
    ctx.lineWidth = 1;
    ctx.strokeRect(x, y, this.slotSize, this.slotSize);
    
    // 渲染物品
    if (slot) {
      this.renderItem(ctx, slot, x, y);
    }
  }

  /**
   * 渲染空槽位
   * @param {CanvasRenderingContext2D} ctx - 渲染上下文
   * @param {number} x - X坐标
   * @param {number} y - Y坐标
   * @param {number} slotIndex - 槽位索引
   */
  renderEmptySlot(ctx, x, y, slotIndex) {
    const isHovered = this.hoveredSlot === slotIndex;
    const isSelected = this.selectedSlot === slotIndex;
    
    // 槽位背景
    ctx.fillStyle = isHovered ? 'rgba(255, 255, 255, 0.2)' : 'rgba(100, 100, 100, 0.3)';
    ctx.fillRect(x, y, this.slotSize, this.slotSize);
    
    // 槽位边框
    ctx.strokeStyle = isSelected ? '#ffff00' : (isHovered ? '#ffffff' : '#666');
    ctx.lineWidth = 1;
    ctx.strokeRect(x, y, this.slotSize, this.slotSize);
  }

  /**
   * 渲染单个槽位
   * @param {CanvasRenderingContext2D} ctx - 渲染上下文
   * @param {number} slotIndex - 槽位索引
   * @param {number} x - X坐标
   * @param {number} y - Y坐标
   * @param {InventoryComponent} inventoryComponent - 背包组件
   */
  renderSlot(ctx, slotIndex, x, y, inventoryComponent) {
    const slot = inventoryComponent.getSlot(slotIndex);
    const isHovered = this.hoveredSlot === slotIndex;
    const isSelected = this.selectedSlot === slotIndex;
    
    // 槽位背景
    ctx.fillStyle = isHovered ? 'rgba(255, 255, 255, 0.2)' : 'rgba(100, 100, 100, 0.3)';
    ctx.fillRect(x, y, this.slotSize, this.slotSize);
    
    // 槽位边框
    ctx.strokeStyle = isSelected ? '#ffff00' : (isHovered ? '#ffffff' : '#666');
    ctx.lineWidth = 1;
    ctx.strokeRect(x, y, this.slotSize, this.slotSize);
    
    // 渲染物品
    if (slot) {
      this.renderItem(ctx, slot, x, y);
    }
  }

  /**
   * 渲染物品
   * @param {CanvasRenderingContext2D} ctx - 渲染上下文
   * @param {ItemStack} itemStack - 物品堆叠
   * @param {number} x - X坐标
   * @param {number} y - Y坐标
   */
  renderItem(ctx, itemStack, x, y) {
    const item = itemStack.item;
    
    // 物品背景（根据稀有度）
    const rarityColors = ['#ffffff', '#1eff00', '#0070dd', '#a335ee', '#ff8000'];
    ctx.fillStyle = rarityColors[item.rarity] || '#ffffff';
    ctx.globalAlpha = 0.3;
    ctx.fillRect(x + 2, y + 2, this.slotSize - 4, this.slotSize - 4);
    ctx.globalAlpha = 1.0;
    
    // 物品图标（简化为文字）
    ctx.fillStyle = '#ffffff';
    ctx.font = '12px Arial';
    ctx.textAlign = 'center';
    const iconText = item.name.substring(0, 2);
    ctx.fillText(iconText, x + this.slotSize / 2, y + this.slotSize / 2 + 4);
    
    // 数量显示
    if (itemStack.quantity > 1) {
      ctx.fillStyle = '#ffffff';
      ctx.font = 'bold 10px Arial';
      ctx.textAlign = 'right';
      ctx.fillText(itemStack.quantity.toString(), x + this.slotSize - 2, y + this.slotSize - 2);
    }
  }

  /**
   * 渲染物品提示框
   * @param {CanvasRenderingContext2D} ctx - 渲染上下文
   */
  renderItemTooltip(ctx) {
    if (this.hoveredSlot === -1 || !this.entity) return;
    
    const inventoryComponent = this.entity.getComponent('inventory');
    if (!inventoryComponent) return;
    
    const slot = inventoryComponent.getSlot(this.hoveredSlot);
    if (!slot) return;
    
    const item = slot.item;
    const tooltipWidth = 280;
    const tooltipHeight = 180;
    
    // 计算提示框位置（避免超出屏幕）
    let tooltipX = this.x + this.width + 10;
    let tooltipY = this.y + 100;
    
    // 如果超出右边界，显示在左侧
    if (tooltipX + tooltipWidth > 1200) { // 假设屏幕宽度1200
      tooltipX = this.x - tooltipWidth - 10;
    }
    
    // 提示框背景
    ctx.fillStyle = 'rgba(0, 0, 0, 0.95)';
    ctx.fillRect(tooltipX, tooltipY, tooltipWidth, tooltipHeight);
    
    // 提示框边框
    const rarityColors = ['#ffffff', '#1eff00', '#0070dd', '#a335ee', '#ff8000'];
    ctx.strokeStyle = rarityColors[item.rarity] || '#ffffff';
    ctx.lineWidth = 2;
    ctx.strokeRect(tooltipX, tooltipY, tooltipWidth, tooltipHeight);

    let yOffset = 20;
    
    // 物品名称
    ctx.fillStyle = rarityColors[item.rarity] || '#ffffff';
    ctx.font = 'bold 14px Arial';
    ctx.textAlign = 'left';
    ctx.fillText(item.name, tooltipX + 10, tooltipY + yOffset);
    yOffset += 20;
    
    // 物品类型和稀有度
    ctx.fillStyle = '#cccccc';
    ctx.font = '11px Arial';
    const rarityNames = ['普通', '不凡', '稀有', '史诗', '传说'];
    const typeNames = {
      'consumable': '消耗品',
      'material': '材料',
      'equipment': '装备',
      'quest': '任务物品'
    };
    const typeName = typeNames[item.type] || item.type;
    const rarityName = rarityNames[item.rarity] || '未知';
    ctx.fillText(`${typeName} | ${rarityName}`, tooltipX + 10, tooltipY + yOffset);
    yOffset += 15;
    
    // 数量
    if (slot.quantity > 1) {
      ctx.fillStyle = '#ffff00';
      ctx.fillText(`数量: ${slot.quantity}`, tooltipX + 10, tooltipY + yOffset);
      yOffset += 15;
    }
    
    // 物品描述
    if (item.description) {
      ctx.fillStyle = '#aaaaaa';
      ctx.font = '10px Arial';
      yOffset += 5;
      this.wrapText(ctx, item.description, tooltipX + 10, tooltipY + yOffset, tooltipWidth - 20, 12);
      yOffset += 30;
    }
    
    // 物品效果（消耗品）
    if (item.effect && item.usable) {
      ctx.fillStyle = '#00ff00';
      ctx.font = '11px Arial';
      ctx.fillText('使用效果:', tooltipX + 10, tooltipY + yOffset);
      yOffset += 15;
      
      ctx.fillStyle = '#ffffff';
      ctx.font = '10px Arial';
      let effectText = '';
      
      switch (item.effect.type) {
        case 'heal':
          effectText = `恢复 ${item.effect.value} 点生命值`;
          break;
        case 'restore_mana':
          effectText = `恢复 ${item.effect.value} 点魔法值`;
          break;
        case 'buff':
          effectText = `提升 ${item.effect.stat} ${Math.round(item.effect.value * 100)}%，持续 ${item.effect.duration} 秒`;
          break;
        default:
          effectText = '特殊效果';
      }
      
      ctx.fillText(effectText, tooltipX + 15, tooltipY + yOffset);
      yOffset += 15;
    }
    
    // 装备属性（如果是装备）
    if (item.type === 'equipment' && item.stats) {
      ctx.fillStyle = '#ffff00';
      ctx.font = '11px Arial';
      ctx.fillText('装备属性:', tooltipX + 10, tooltipY + yOffset);
      yOffset += 15;
      
      ctx.fillStyle = '#ffffff';
      ctx.font = '10px Arial';
      
      if (item.stats.attack) {
        ctx.fillText(`攻击力: +${item.stats.attack}`, tooltipX + 15, tooltipY + yOffset);
        yOffset += 12;
      }
      if (item.stats.defense) {
        ctx.fillText(`防御力: +${item.stats.defense}`, tooltipX + 15, tooltipY + yOffset);
        yOffset += 12;
      }
      if (item.stats.maxHp) {
        ctx.fillText(`生命值: +${item.stats.maxHp}`, tooltipX + 15, tooltipY + yOffset);
        yOffset += 12;
      }
      if (item.stats.maxMp) {
        ctx.fillText(`魔法值: +${item.stats.maxMp}`, tooltipX + 15, tooltipY + yOffset);
        yOffset += 12;
      }
      if (item.stats.speed) {
        ctx.fillText(`速度: +${item.stats.speed}`, tooltipX + 15, tooltipY + yOffset);
        yOffset += 12;
      }
    }
    
    // 物品价值
    if (item.value) {
      ctx.fillStyle = '#ffaa00';
      ctx.font = '10px Arial';
      ctx.fillText(`价值: ${item.value} 金币`, tooltipX + 10, tooltipY + tooltipHeight - 15);
    }
  }

  /**
   * 文字换行
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
      const testWidth = metrics.width;

      if (testWidth > maxWidth && i > 0) {
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
   * 渲染右键菜单
   * @param {CanvasRenderingContext2D} ctx - 渲染上下文
   */
  renderContextMenu(ctx) {
    if (!this.contextMenu.visible) return;
    
    const menuWidth = 100;
    const menuHeight = this.contextMenu.options.length * 25;
    
    // 菜单背景
    ctx.fillStyle = 'rgba(0, 0, 0, 0.9)';
    ctx.fillRect(this.contextMenu.x, this.contextMenu.y, menuWidth, menuHeight);
    
    // 菜单边框
    ctx.strokeStyle = '#666';
    ctx.lineWidth = 1;
    ctx.strokeRect(this.contextMenu.x, this.contextMenu.y, menuWidth, menuHeight);
    
    // 菜单选项
    ctx.fillStyle = '#ffffff';
    ctx.font = '12px Arial';
    ctx.textAlign = 'left';
    
    for (let i = 0; i < this.contextMenu.options.length; i++) {
      const option = this.contextMenu.options[i];
      const optionY = this.contextMenu.y + (i + 1) * 20;
      ctx.fillText(option.label, this.contextMenu.x + 10, optionY);
    }
  }

  /**
   * 渲染拖拽中的物品
   * @param {CanvasRenderingContext2D} ctx - 渲染上下文
   */
  renderDraggedItem(ctx) {
    if (!this.draggedItem) return;
    
    // 这里可以渲染正在拖拽的物品
    // 暂时省略实现
  }

  /**
   * 处理鼠标移动事件
   * @param {number} x - 鼠标X坐标
   * @param {number} y - 鼠标Y坐标
   */
  handleMouseMove(x, y) {
    if (!this.visible) return;

    this.hoveredSlot = -1;

    // 检查是否悬停在物品槽上
    if (this.entity) {
      const inventoryComponent = this.entity.getComponent('inventory');
      if (inventoryComponent) {
        const slotIndex = this.getSlotAtPosition(x, y);
        if (slotIndex >= 0 && slotIndex < inventoryComponent.maxSlots) {
          this.hoveredSlot = slotIndex;
        }
      }
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
    if (!this.visible || !this.containsPoint(x, y)) return false;

    // 隐藏右键菜单
    this.contextMenu.visible = false;

    // 检查过滤器按钮点击
    for (const filterButton of this.filterButtons) {
      const buttonX = this.x + filterButton.x;
      const buttonY = this.y + filterButton.y;
      
      if (x >= buttonX && x <= buttonX + filterButton.width &&
          y >= buttonY && y <= buttonY + filterButton.height) {
        this.setFilter(filterButton.name);
        return true;
      }
    }

    // 检查物品槽点击
    const slotIndex = this.getSlotAtPosition(x, y);
    if (slotIndex >= 0) {
      if (button === 'left') {
        this.handleSlotLeftClick(slotIndex);
      } else if (button === 'right') {
        this.handleSlotRightClick(slotIndex, x, y);
      }
      return true;
    }

    return true;
  }

  /**
   * 获取指定位置的槽位索引
   * @param {number} x - X坐标
   * @param {number} y - Y坐标
   * @returns {number} 槽位索引，-1表示无效
   */
  getSlotAtPosition(x, y) {
    const relativeX = x - this.x - this.slotStartX;
    const relativeY = y - this.y - this.slotStartY;
    
    if (relativeX < 0 || relativeY < 0) return -1;
    
    const col = Math.floor(relativeX / (this.slotSize + this.slotPadding));
    const row = Math.floor(relativeY / (this.slotSize + this.slotPadding));
    
    if (col >= this.slotsPerRow || row >= this.maxVisibleRows) return -1;
    
    const slotX = col * (this.slotSize + this.slotPadding);
    const slotY = row * (this.slotSize + this.slotPadding);
    
    // 检查是否在槽位内部
    if (relativeX >= slotX && relativeX <= slotX + this.slotSize &&
        relativeY >= slotY && relativeY <= slotY + this.slotSize) {
      
      const displayIndex = row * this.slotsPerRow + col;
      
      // 根据当前筛选器获取实际槽位索引
      if (this.entity) {
        const inventoryComponent = this.entity.getComponent('inventory');
        if (inventoryComponent) {
          const filteredItems = this.getFilteredItems(inventoryComponent);
          
          if (inventoryComponent.currentFilter === 'all') {
            // 显示全部时，直接返回显示索引
            return displayIndex < inventoryComponent.maxSlots ? displayIndex : -1;
          } else {
            // 筛选模式时，返回筛选后物品的原始索引
            if (displayIndex < filteredItems.length) {
              return filteredItems[displayIndex].index;
            }
          }
        }
      }
    }
    
    return -1;
  }

  /**
   * 处理槽位左键点击
   * @param {number} slotIndex - 槽位索引
   */
  handleSlotLeftClick(slotIndex) {
    this.selectedSlot = slotIndex;
    console.log(`选中槽位: ${slotIndex}`);
  }

  /**
   * 处理槽位右键点击
   * @param {number} slotIndex - 槽位索引
   * @param {number} x - 鼠标X坐标
   * @param {number} y - 鼠标Y坐标
   */
  handleSlotRightClick(slotIndex, x, y) {
    if (!this.entity) return;
    
    const inventoryComponent = this.entity.getComponent('inventory');
    if (!inventoryComponent) return;
    
    const slot = inventoryComponent.getSlot(slotIndex);
    if (!slot) return;
    
    // 显示右键菜单
    this.contextMenu = {
      visible: true,
      x: x,
      y: y,
      slotIndex: slotIndex,
      options: []
    };
    
    // 添加菜单选项
    if (slot.item.usable) {
      this.contextMenu.options.push({
        label: '使用',
        action: 'use'
      });
    }
    
    this.contextMenu.options.push({
      label: '丢弃',
      action: 'drop'
    });
  }

  /**
   * 设置过滤器
   * @param {string} filterName - 过滤器名称
   */
  setFilter(filterName) {
    if (!this.entity) return;
    
    const inventoryComponent = this.entity.getComponent('inventory');
    if (inventoryComponent) {
      inventoryComponent.setFilter(filterName);
      
      if (this.onFilterChange) {
        this.onFilterChange(filterName);
      }
    }
  }

  /**
   * 切换面板显示状态
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
    this.contextMenu.visible = false;
  }
}