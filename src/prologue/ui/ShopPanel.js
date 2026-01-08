/**
 * 商店面板 (ShopPanel) - 序章专用
 * 
 * 显示和管理商店交易的UI面板
 * 
 * 功能:
 * - 购买/出售标签页切换
 * - 物品列表显示
 * - 交易按钮和货币显示
 * - 物品详情提示框
 * - 价格计算和交易确认
 * 
 * 需求: 16
 */

import { UIElement } from '../../ui/UIElement.js';

/**
 * 标签页类型
 */
const TabType = {
  BUY: 'buy',
  SELL: 'sell'
};

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
 * 商店面板类
 */
export class ShopPanel extends UIElement {
  /**
   * 创建商店面板
   * @param {Object} options - 配置选项
   * @param {number} options.x - X坐标
   * @param {number} options.y - Y坐标
   * @param {number} options.width - 宽度
   * @param {number} options.height - 高度
   * @param {ShopSystem} options.shopSystem - 商店系统实例
   * @param {InventorySystem} options.inventorySystem - 背包系统实例
   */
  constructor(options = {}) {
    super({
      x: options.x || 100,
      y: options.y || 100,
      width: options.width || 700,
      height: options.height || 550,
      visible: options.visible !== undefined ? options.visible : false,
      zIndex: options.zIndex || 100
    });
    
    this.shopSystem = options.shopSystem;
    this.inventorySystem = options.inventorySystem;
    this.player = null;
    this.currentShopId = null;
    
    // UI布局配置
    this.titleHeight = 40;
    this.tabHeight = 35;
    this.itemListHeight = 350;
    this.itemHeight = 60;
    this.itemPadding = 5;
    this.tooltipWidth = 280;
    this.tooltipMaxHeight = 400;
    
    // 当前标签页
    this.currentTab = TabType.BUY;
    
    // 滚动状态
    this.scrollOffset = 0;
    this.maxScroll = 0;
    
    // 交互状态
    this.hoveredItemIndex = null;
    this.selectedItemIndex = null;
    
    // 交易数量
    this.transactionQuantity = 1;
    
    // 事件回调
    this.onBuy = options.onBuy || null;
    this.onSell = options.onSell || null;
    this.onClose = options.onClose || null;
  }
  
  /**
   * 设置当前玩家
   * @param {Object} player - 玩家对象
   */
  setPlayer(player) {
    this.player = player;
  }
  
  /**
   * 打开商店
   * @param {string} shopId - 商店ID
   */
  openShop(shopId) {
    this.currentShopId = shopId;
    this.currentTab = TabType.BUY;
    this.scrollOffset = 0;
    this.selectedItemIndex = null;
    this.transactionQuantity = 1;
    this.show();
  }
  
  /**
   * 关闭商店
   */
  closeShop() {
    this.currentShopId = null;
    this.hide();
    if (this.onClose) {
      this.onClose();
    }
  }
  
  /**
   * 更新面板
   * @param {number} deltaTime - 帧间隔时间（毫秒）
   */
  update(deltaTime) {
    if (!this.visible) return;
    
    // 更新最大滚动值
    const items = this.getCurrentItems();
    const totalHeight = items.length * (this.itemHeight + this.itemPadding);
    this.maxScroll = Math.max(0, totalHeight - this.itemListHeight);
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
    
    // 渲染标签页
    this.renderTabs(ctx);
    
    // 渲染物品列表
    this.renderItemList(ctx);
    
    // 渲染货币信息
    this.renderCurrencyInfo(ctx);
    
    // 渲染交易区域
    this.renderTransactionArea(ctx);
    
    // 渲染提示框（如果有悬停的物品）
    if (this.hoveredItemIndex !== null) {
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
    // 商店名称
    const shop = this.shopSystem?.getShop(this.currentShopId);
    const shopName = shop ? shop.name : '商店';
    
    ctx.fillStyle = '#ffffff';
    ctx.font = 'bold 18px Arial, sans-serif';
    ctx.textAlign = 'left';
    ctx.textBaseline = 'middle';
    ctx.fillText(shopName, this.x + 20, this.y + this.titleHeight / 2);
    
    // 关闭按钮
    const closeButtonSize = 25;
    const closeButtonX = this.x + this.width - closeButtonSize - 10;
    const closeButtonY = this.y + (this.titleHeight - closeButtonSize) / 2;
    
    ctx.fillStyle = 'rgba(200, 60, 60, 0.8)';
    ctx.fillRect(closeButtonX, closeButtonY, closeButtonSize, closeButtonSize);
    
    ctx.strokeStyle = '#ff6666';
    ctx.lineWidth = 1;
    ctx.strokeRect(closeButtonX, closeButtonY, closeButtonSize, closeButtonSize);
    
    ctx.fillStyle = '#ffffff';
    ctx.font = 'bold 16px Arial, sans-serif';
    ctx.textAlign = 'center';
    ctx.fillText('×', closeButtonX + closeButtonSize / 2, closeButtonY + closeButtonSize / 2);
  }
  
  /**
   * 渲染标签页
   * @param {CanvasRenderingContext2D} ctx - 渲染上下文
   */
  renderTabs(ctx) {
    const tabY = this.y + this.titleHeight;
    const tabWidth = this.width / 2;
    
    // 购买标签
    const buyTabActive = this.currentTab === TabType.BUY;
    ctx.fillStyle = buyTabActive ? 'rgba(80, 120, 200, 0.6)' : 'rgba(60, 60, 60, 0.5)';
    ctx.fillRect(this.x, tabY, tabWidth, this.tabHeight);
    
    ctx.strokeStyle = buyTabActive ? '#6080ff' : '#555555';
    ctx.lineWidth = 1;
    ctx.strokeRect(this.x, tabY, tabWidth, this.tabHeight);
    
    ctx.fillStyle = buyTabActive ? '#ffffff' : '#cccccc';
    ctx.font = 'bold 14px Arial, sans-serif';
    ctx.textAlign = 'center';
    ctx.textBaseline = 'middle';
    ctx.fillText('购买', this.x + tabWidth / 2, tabY + this.tabHeight / 2);
    
    // 出售标签
    const sellTabActive = this.currentTab === TabType.SELL;
    ctx.fillStyle = sellTabActive ? 'rgba(80, 120, 200, 0.6)' : 'rgba(60, 60, 60, 0.5)';
    ctx.fillRect(this.x + tabWidth, tabY, tabWidth, this.tabHeight);
    
    ctx.strokeStyle = sellTabActive ? '#6080ff' : '#555555';
    ctx.lineWidth = 1;
    ctx.strokeRect(this.x + tabWidth, tabY, tabWidth, this.tabHeight);
    
    ctx.fillStyle = sellTabActive ? '#ffffff' : '#cccccc';
    ctx.fillText('出售', this.x + tabWidth + tabWidth / 2, tabY + this.tabHeight / 2);
  }
  
  /**
   * 渲染物品列表
   * @param {CanvasRenderingContext2D} ctx - 渲染上下文
   */
  renderItemList(ctx) {
    const listY = this.y + this.titleHeight + this.tabHeight;
    const listX = this.x + 10;
    const listWidth = this.width - 20;
    
    // 列表背景
    ctx.fillStyle = 'rgba(30, 30, 30, 0.8)';
    ctx.fillRect(listX, listY, listWidth, this.itemListHeight);
    
    ctx.strokeStyle = '#444444';
    ctx.lineWidth = 1;
    ctx.strokeRect(listX, listY, listWidth, this.itemListHeight);
    
    // 设置裁剪区域
    ctx.save();
    ctx.beginPath();
    ctx.rect(listX, listY, listWidth, this.itemListHeight);
    ctx.clip();
    
    // 渲染物品
    const items = this.getCurrentItems();
    
    if (items.length === 0) {
      // 空列表提示
      ctx.fillStyle = '#888888';
      ctx.font = '14px Arial, sans-serif';
      ctx.textAlign = 'center';
      ctx.textBaseline = 'middle';
      const emptyText = this.currentTab === TabType.BUY ? '商店暂无商品' : '背包中没有可出售的物品';
      ctx.fillText(emptyText, listX + listWidth / 2, listY + this.itemListHeight / 2);
    } else {
      items.forEach((item, index) => {
        const itemY = listY + index * (this.itemHeight + this.itemPadding) - this.scrollOffset;
        
        // 只渲染可见的物品
        if (itemY + this.itemHeight >= listY && itemY <= listY + this.itemListHeight) {
          this.renderItemRow(ctx, item, index, listX, itemY, listWidth);
        }
      });
    }
    
    ctx.restore();
    
    // 渲染滚动条（如果需要）
    if (this.maxScroll > 0) {
      this.renderScrollbar(ctx, listX, listY, listWidth, this.itemListHeight);
    }
  }
  
  /**
   * 渲染物品行
   * @param {CanvasRenderingContext2D} ctx - 渲染上下文
   * @param {Object} item - 物品对象
   * @param {number} index - 物品索引
   * @param {number} x - X坐标
   * @param {number} y - Y坐标
   * @param {number} width - 宽度
   */
  renderItemRow(ctx, item, index, x, y, width) {
    const isHovered = this.hoveredItemIndex === index;
    const isSelected = this.selectedItemIndex === index;
    
    // 行背景
    if (isSelected) {
      ctx.fillStyle = 'rgba(100, 140, 200, 0.4)';
    } else if (isHovered) {
      ctx.fillStyle = 'rgba(80, 80, 80, 0.4)';
    } else {
      ctx.fillStyle = 'rgba(50, 50, 50, 0.2)';
    }
    ctx.fillRect(x + 5, y, width - 10, this.itemHeight);
    
    // 物品图标区域
    const iconSize = 50;
    const iconX = x + 10;
    const iconY = y + (this.itemHeight - iconSize) / 2;
    
    // 物品类型背景
    const typeColor = ITEM_TYPE_COLORS[item.type] || '#ffffff';
    ctx.fillStyle = typeColor;
    ctx.globalAlpha = 0.2;
    ctx.fillRect(iconX, iconY, iconSize, iconSize);
    ctx.globalAlpha = 1.0;
    
    // 物品名称缩写
    ctx.fillStyle = '#ffffff';
    ctx.font = 'bold 16px Arial, sans-serif';
    ctx.textAlign = 'center';
    ctx.textBaseline = 'middle';
    const shortName = item.name.substring(0, 2);
    ctx.fillText(shortName, iconX + iconSize / 2, iconY + iconSize / 2);
    
    // 类型边框
    ctx.strokeStyle = typeColor;
    ctx.lineWidth = 2;
    ctx.strokeRect(iconX, iconY, iconSize, iconSize);
    
    // 物品名称
    ctx.fillStyle = typeColor;
    ctx.font = 'bold 14px Arial, sans-serif';
    ctx.textAlign = 'left';
    ctx.textBaseline = 'top';
    ctx.fillText(item.name, iconX + iconSize + 15, y + 8);
    
    // 物品类型
    ctx.fillStyle = '#aaaaaa';
    ctx.font = '11px Arial, sans-serif';
    const typeName = ITEM_TYPE_NAMES[item.type] || '未知';
    ctx.fillText(typeName, iconX + iconSize + 15, y + 28);
    
    // 价格信息
    const priceX = x + width - 150;
    const price = this.getItemPrice(item);
    
    ctx.fillStyle = '#ffd700';
    ctx.font = 'bold 16px Arial, sans-serif';
    ctx.textAlign = 'right';
    ctx.textBaseline = 'middle';
    ctx.fillText(`${price} 铜钱`, priceX, y + this.itemHeight / 2);
    
    // 库存信息（购买模式）
    if (this.currentTab === TabType.BUY && item.stock !== undefined) {
      ctx.fillStyle = item.stock > 0 ? '#00ff00' : '#ff6666';
      ctx.font = '11px Arial, sans-serif';
      ctx.textAlign = 'left';
      ctx.fillText(`库存: ${item.stock}`, iconX + iconSize + 15, y + 42);
    }
    
    // 数量信息（出售模式）
    if (this.currentTab === TabType.SELL && item.quantity !== undefined) {
      ctx.fillStyle = '#00ff00';
      ctx.font = '11px Arial, sans-serif';
      ctx.textAlign = 'left';
      ctx.fillText(`数量: ${item.quantity}`, iconX + iconSize + 15, y + 42);
    }
  }
  
  /**
   * 渲染滚动条
   * @param {CanvasRenderingContext2D} ctx - 渲染上下文
   * @param {number} x - X坐标
   * @param {number} y - Y坐标
   * @param {number} width - 宽度
   * @param {number} height - 高度
   */
  renderScrollbar(ctx, x, y, width, height) {
    const scrollbarWidth = 8;
    const scrollbarX = x + width - scrollbarWidth - 2;
    
    // 滚动条轨道
    ctx.fillStyle = 'rgba(60, 60, 60, 0.5)';
    ctx.fillRect(scrollbarX, y + 2, scrollbarWidth, height - 4);
    
    // 滚动条滑块
    const items = this.getCurrentItems();
    const totalHeight = items.length * (this.itemHeight + this.itemPadding);
    const scrollbarHeight = Math.max(30, (height / totalHeight) * height);
    const scrollbarY = y + 2 + (this.scrollOffset / this.maxScroll) * (height - 4 - scrollbarHeight);
    
    ctx.fillStyle = 'rgba(150, 150, 150, 0.8)';
    ctx.fillRect(scrollbarX, scrollbarY, scrollbarWidth, scrollbarHeight);
  }
  
  /**
   * 渲染货币信息
   * @param {CanvasRenderingContext2D} ctx - 渲染上下文
   */
  renderCurrencyInfo(ctx) {
    const infoY = this.y + this.titleHeight + this.tabHeight + this.itemListHeight + 10;
    const infoX = this.x + 20;
    
    // 玩家货币
    const currency = this.player?.currency || 0;
    
    ctx.fillStyle = '#ffffff';
    ctx.font = 'bold 14px Arial, sans-serif';
    ctx.textAlign = 'left';
    ctx.textBaseline = 'top';
    ctx.fillText('持有货币:', infoX, infoY);
    
    ctx.fillStyle = '#ffd700';
    ctx.font = 'bold 16px Arial, sans-serif';
    ctx.fillText(`${currency} 铜钱`, infoX + 90, infoY);
  }
  
  /**
   * 渲染交易区域
   * @param {CanvasRenderingContext2D} ctx - 渲染上下文
   */
  renderTransactionArea(ctx) {
    const areaY = this.y + this.titleHeight + this.tabHeight + this.itemListHeight + 40;
    const areaX = this.x + 20;
    const areaWidth = this.width - 40;
    const areaHeight = 80;
    
    // 区域背景
    ctx.fillStyle = 'rgba(40, 40, 40, 0.6)';
    ctx.fillRect(areaX, areaY, areaWidth, areaHeight);
    
    ctx.strokeStyle = '#555555';
    ctx.lineWidth = 1;
    ctx.strokeRect(areaX, areaY, areaWidth, areaHeight);
    
    // 如果没有选中物品
    if (this.selectedItemIndex === null) {
      ctx.fillStyle = '#888888';
      ctx.font = '13px Arial, sans-serif';
      ctx.textAlign = 'center';
      ctx.textBaseline = 'middle';
      ctx.fillText('请选择要交易的物品', areaX + areaWidth / 2, areaY + areaHeight / 2);
      return;
    }
    
    const items = this.getCurrentItems();
    const selectedItem = items[this.selectedItemIndex];
    if (!selectedItem) return;
    
    // 数量控制
    const quantityY = areaY + 15;
    
    ctx.fillStyle = '#ffffff';
    ctx.font = '13px Arial, sans-serif';
    ctx.textAlign = 'left';
    ctx.textBaseline = 'top';
    ctx.fillText('数量:', areaX + 20, quantityY);
    
    // 减少按钮
    const btnSize = 25;
    const btnY = quantityY - 3;
    const decreaseX = areaX + 70;
    
    ctx.fillStyle = this.transactionQuantity > 1 ? 'rgba(100, 100, 100, 0.8)' : 'rgba(60, 60, 60, 0.5)';
    ctx.fillRect(decreaseX, btnY, btnSize, btnSize);
    ctx.strokeStyle = '#666666';
    ctx.lineWidth = 1;
    ctx.strokeRect(decreaseX, btnY, btnSize, btnSize);
    
    ctx.fillStyle = this.transactionQuantity > 1 ? '#ffffff' : '#666666';
    ctx.font = 'bold 16px Arial, sans-serif';
    ctx.textAlign = 'center';
    ctx.textBaseline = 'middle';
    ctx.fillText('-', decreaseX + btnSize / 2, btnY + btnSize / 2);
    
    // 数量显示
    const quantityDisplayX = decreaseX + btnSize + 10;
    ctx.fillStyle = '#ffffff';
    ctx.font = 'bold 14px Arial, sans-serif';
    ctx.fillText(`${this.transactionQuantity}`, quantityDisplayX + 20, btnY + btnSize / 2);
    
    // 增加按钮
    const maxQuantity = this.getMaxTransactionQuantity(selectedItem);
    const increaseX = quantityDisplayX + 50;
    
    ctx.fillStyle = this.transactionQuantity < maxQuantity ? 'rgba(100, 100, 100, 0.8)' : 'rgba(60, 60, 60, 0.5)';
    ctx.fillRect(increaseX, btnY, btnSize, btnSize);
    ctx.strokeRect(increaseX, btnY, btnSize, btnSize);
    
    ctx.fillStyle = this.transactionQuantity < maxQuantity ? '#ffffff' : '#666666';
    ctx.fillText('+', increaseX + btnSize / 2, btnY + btnSize / 2);
    
    // 总价显示
    const totalPrice = this.getItemPrice(selectedItem) * this.transactionQuantity;
    const totalY = areaY + 50;
    
    ctx.fillStyle = '#ffffff';
    ctx.font = '13px Arial, sans-serif';
    ctx.textAlign = 'left';
    ctx.textBaseline = 'top';
    const priceLabel = this.currentTab === TabType.BUY ? '总价:' : '总收入:';
    ctx.fillText(priceLabel, areaX + 20, totalY);
    
    ctx.fillStyle = '#ffd700';
    ctx.font = 'bold 16px Arial, sans-serif';
    ctx.fillText(`${totalPrice} 铜钱`, areaX + 70, totalY - 2);
    
    // 交易按钮
    const btnWidth = 120;
    const btnHeight = 35;
    const btnX = areaX + areaWidth - btnWidth - 20;
    const transactBtnY = areaY + (areaHeight - btnHeight) / 2;
    
    const canTransact = this.canTransact(selectedItem);
    
    ctx.fillStyle = canTransact ? 'rgba(80, 160, 80, 0.8)' : 'rgba(100, 60, 60, 0.6)';
    ctx.fillRect(btnX, transactBtnY, btnWidth, btnHeight);
    
    ctx.strokeStyle = canTransact ? '#60c060' : '#c06060';
    ctx.lineWidth = 2;
    ctx.strokeRect(btnX, transactBtnY, btnWidth, btnHeight);
    
    ctx.fillStyle = '#ffffff';
    ctx.font = 'bold 16px Arial, sans-serif';
    ctx.textAlign = 'center';
    ctx.textBaseline = 'middle';
    const btnText = this.currentTab === TabType.BUY ? '购买' : '出售';
    ctx.fillText(btnText, btnX + btnWidth / 2, transactBtnY + btnHeight / 2);
  }
  
  /**
   * 渲染物品提示框
   * @param {CanvasRenderingContext2D} ctx - 渲染上下文
   */
  renderTooltip(ctx) {
    const items = this.getCurrentItems();
    if (this.hoveredItemIndex === null || this.hoveredItemIndex >= items.length) return;
    
    const item = items[this.hoveredItemIndex];
    
    // 提示框位置（显示在面板右侧）
    const tooltipX = this.x + this.width + 10;
    let tooltipY = this.y + 50;
    
    // 计算提示框高度
    let contentHeight = 0;
    const lineHeight = 20;
    const padding = 15;
    
    // 标题 + 类型 + 描述 + 价格
    contentHeight += lineHeight * 2; // 标题和类型
    if (item.description) {
      contentHeight += lineHeight * 2; // 描述（估算2行）
    }
    contentHeight += lineHeight; // 价格
    
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
    
    // 价格
    const price = this.getItemPrice(item);
    const priceLabel = this.currentTab === TabType.BUY ? '购买价格' : '出售价格';
    ctx.fillStyle = '#ffffff';
    ctx.font = '12px Arial, sans-serif';
    ctx.fillText(`${priceLabel}: `, tooltipX + padding, currentY);
    
    ctx.fillStyle = '#ffd700';
    ctx.font = 'bold 14px Arial, sans-serif';
    ctx.fillText(`${price} 铜钱`, tooltipX + padding + 70, currentY - 1);
    currentY += lineHeight + 5;
    
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
   * 获取当前标签页的物品列表
   * @returns {Array} 物品数组
   */
  getCurrentItems() {
    if (this.currentTab === TabType.BUY) {
      // 购买模式：显示商店物品
      if (!this.shopSystem || !this.currentShopId) return [];
      return this.shopSystem.getShopItems(this.currentShopId, { inStock: true }) || [];
    } else {
      // 出售模式：显示玩家背包物品
      if (!this.inventorySystem) {
        console.log('ShopPanel: inventorySystem 未设置');
        return [];
      }
      const allItems = this.inventorySystem.getAllItems();
      console.log('ShopPanel: 背包原始物品', allItems);
      
      // 过滤空槽位并转换为商店显示格式
      const filteredItems = allItems
        .filter(slot => slot && slot.item)
        .map(slot => ({
          ...slot.item,
          quantity: slot.quantity
        }));
      
      console.log('ShopPanel: 过滤后的物品', filteredItems);
      return filteredItems;
    }
  }
  
  /**
   * 获取物品价格
   * @param {Object} item - 物品对象
   * @returns {number} 价格
   */
  getItemPrice(item) {
    if (this.currentTab === TabType.BUY) {
      // 购买价格
      const shop = this.shopSystem?.getShop(this.currentShopId);
      const priceModifier = shop?.priceModifier || 1.0;
      return Math.floor((item.price || 0) * priceModifier);
    } else {
      // 出售价格（50%回收）
      return Math.floor((item.price || 0) * 0.5);
    }
  }
  
  /**
   * 获取最大交易数量
   * @param {Object} item - 物品对象
   * @returns {number} 最大数量
   */
  getMaxTransactionQuantity(item) {
    if (this.currentTab === TabType.BUY) {
      // 购买模式：受库存和货币限制
      const stock = item.stock !== undefined ? item.stock : 99;
      const price = this.getItemPrice(item);
      const affordableCount = price > 0 ? Math.floor((this.player?.currency || 0) / price) : 99;
      return Math.min(stock, affordableCount, 99);
    } else {
      // 出售模式：受背包数量限制
      return Math.min(item.quantity || 1, 99);
    }
  }
  
  /**
   * 检查是否可以交易
   * @param {Object} item - 物品对象
   * @returns {boolean} 是否可以交易
   */
  canTransact(item) {
    if (!item || this.transactionQuantity <= 0) return false;
    
    const totalPrice = this.getItemPrice(item) * this.transactionQuantity;
    
    if (this.currentTab === TabType.BUY) {
      // 购买检查
      if ((this.player?.currency || 0) < totalPrice) return false;
      if (item.stock !== undefined && item.stock < this.transactionQuantity) return false;
      if (this.inventorySystem && this.inventorySystem.isFull && this.inventorySystem.isFull()) return false;
      return true;
    } else {
      // 出售检查
      if (!item.quantity || item.quantity < this.transactionQuantity) return false;
      return true;
    }
  }
  
  /**
   * 执行交易
   */
  executeTransaction() {
    if (this.selectedItemIndex === null) return;
    
    const items = this.getCurrentItems();
    const item = items[this.selectedItemIndex];
    
    if (!this.canTransact(item)) return;
    
    if (this.currentTab === TabType.BUY) {
      // 执行购买
      const result = this.shopSystem.buyItem(
        this.player,
        this.currentShopId,
        item.id,
        this.transactionQuantity
      );
      
      if (result.success) {
        // 购买成功回调
        if (this.onBuy) {
          this.onBuy(item, this.transactionQuantity, result);
        }
        
        // 重置选择
        this.selectedItemIndex = null;
        this.transactionQuantity = 1;
      }
    } else {
      // 执行出售
      const result = this.shopSystem.sellItem(
        this.player,
        this.currentShopId,
        item.id,
        this.transactionQuantity
      );
      
      if (result.success) {
        // 出售成功回调
        if (this.onSell) {
          this.onSell(item, this.transactionQuantity, result);
        }
        
        // 重置选择
        this.selectedItemIndex = null;
        this.transactionQuantity = 1;
      }
    }
  }
  
  /**
   * 处理鼠标移动事件
   * @param {number} mouseX - 鼠标X坐标
   * @param {number} mouseY - 鼠标Y坐标
   */
  handleMouseMove(mouseX, mouseY) {
    if (!this.visible) {
      this.hoveredItemIndex = null;
      return;
    }
    
    // 检查鼠标是否在面板内
    if (!this.containsPoint(mouseX, mouseY)) {
      this.hoveredItemIndex = null;
      return;
    }
    
    // 检查是否悬停在物品列表上
    const listY = this.y + this.titleHeight + this.tabHeight;
    const listX = this.x + 10;
    const listWidth = this.width - 20;
    
    if (mouseX >= listX && mouseX <= listX + listWidth &&
        mouseY >= listY && mouseY <= listY + this.itemListHeight) {
      
      const items = this.getCurrentItems();
      const relativeY = mouseY - listY + this.scrollOffset;
      const itemIndex = Math.floor(relativeY / (this.itemHeight + this.itemPadding));
      
      if (itemIndex >= 0 && itemIndex < items.length) {
        this.hoveredItemIndex = itemIndex;
      } else {
        this.hoveredItemIndex = null;
      }
    } else {
      this.hoveredItemIndex = null;
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
    
    // 检查关闭按钮
    const closeButtonSize = 25;
    const closeButtonX = this.x + this.width - closeButtonSize - 10;
    const closeButtonY = this.y + (this.titleHeight - closeButtonSize) / 2;
    
    if (mouseX >= closeButtonX && mouseX <= closeButtonX + closeButtonSize &&
        mouseY >= closeButtonY && mouseY <= closeButtonY + closeButtonSize) {
      this.closeShop();
      return true;
    }
    
    // 检查标签页点击
    const tabY = this.y + this.titleHeight;
    const tabWidth = this.width / 2;
    
    if (mouseY >= tabY && mouseY <= tabY + this.tabHeight) {
      if (mouseX >= this.x && mouseX <= this.x + tabWidth) {
        // 点击购买标签
        this.currentTab = TabType.BUY;
        this.selectedItemIndex = null;
        this.transactionQuantity = 1;
        this.scrollOffset = 0;
        return true;
      } else if (mouseX >= this.x + tabWidth && mouseX <= this.x + this.width) {
        // 点击出售标签
        this.currentTab = TabType.SELL;
        this.selectedItemIndex = null;
        this.transactionQuantity = 1;
        this.scrollOffset = 0;
        return true;
      }
    }
    
    // 检查物品列表点击
    const listY = this.y + this.titleHeight + this.tabHeight;
    const listX = this.x + 10;
    const listWidth = this.width - 20;
    
    if (mouseX >= listX && mouseX <= listX + listWidth &&
        mouseY >= listY && mouseY <= listY + this.itemListHeight) {
      
      const items = this.getCurrentItems();
      const relativeY = mouseY - listY + this.scrollOffset;
      const itemIndex = Math.floor(relativeY / (this.itemHeight + this.itemPadding));
      
      if (itemIndex >= 0 && itemIndex < items.length) {
        this.selectedItemIndex = itemIndex;
        this.transactionQuantity = 1;
      }
      
      return true;
    }
    
    // 检查数量控制按钮
    if (this.selectedItemIndex !== null) {
      const areaY = this.y + this.titleHeight + this.tabHeight + this.itemListHeight + 40;
      const areaX = this.x + 20;
      const btnSize = 25;
      const btnY = areaY + 15 - 3;
      const decreaseX = areaX + 70;
      const increaseX = decreaseX + btnSize + 60;
      
      // 减少按钮
      if (mouseX >= decreaseX && mouseX <= decreaseX + btnSize &&
          mouseY >= btnY && mouseY <= btnY + btnSize) {
        if (this.transactionQuantity > 1) {
          this.transactionQuantity--;
        }
        return true;
      }
      
      // 增加按钮
      if (mouseX >= increaseX && mouseX <= increaseX + btnSize &&
          mouseY >= btnY && mouseY <= btnY + btnSize) {
        const items = this.getCurrentItems();
        const maxQuantity = this.getMaxTransactionQuantity(items[this.selectedItemIndex]);
        if (this.transactionQuantity < maxQuantity) {
          this.transactionQuantity++;
        }
        return true;
      }
      
      // 交易按钮
      const areaWidth = this.width - 40;
      const btnWidth = 120;
      const btnHeight = 35;
      const btnX = areaX + areaWidth - btnWidth - 20;
      const transactBtnY = areaY + (80 - btnHeight) / 2;
      
      if (mouseX >= btnX && mouseX <= btnX + btnWidth &&
          mouseY >= transactBtnY && mouseY <= transactBtnY + btnHeight) {
        this.executeTransaction();
        return true;
      }
    }
    
    // 点击了面板其他区域，也算处理了（阻止事件传播）
    return true;
  }
  
  /**
   * 处理鼠标滚轮事件
   * @param {number} deltaY - 滚轮滚动量
   */
  handleMouseWheel(deltaY) {
    if (!this.visible) return;
    
    const scrollSpeed = 30;
    this.scrollOffset = Math.max(0, Math.min(this.maxScroll, this.scrollOffset + deltaY * scrollSpeed));
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
    this.hoveredItemIndex = null;
    this.selectedItemIndex = null;
    this.scrollOffset = 0;
    this.transactionQuantity = 1;
  }
}

export default ShopPanel;
