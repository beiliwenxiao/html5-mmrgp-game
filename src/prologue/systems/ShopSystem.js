/**
 * 商店系统
 * 
 * 职责：
 * - 商店注册和物品管理
 * - 购买交易逻辑
 * - 出售交易逻辑
 * - 价格计算和货币管理
 * 
 * 需求：15, 16
 */

export class ShopSystem {
  constructor() {
    // 商店注册表
    this.shops = new Map();
    
    // 默认价格修正系数
    this.defaultPriceModifier = 1.0;
    
    // 出售价格比例（相对于购买价格）
    this.sellPriceRatio = 0.5; // 50%回收价
    
    // 交易历史记录
    this.transactionHistory = [];
    
    // 最大交易历史记录数
    this.maxHistorySize = 100;
  }

  /**
   * 注册商店
   * @param {string} shopId - 商店ID
   * @param {Object} shopData - 商店数据
   * @returns {boolean} 是否注册成功
   */
  registerShop(shopId, shopData) {
    if (!shopId || !shopData) {
      console.error('ShopSystem: 无效的商店ID或数据');
      return false;
    }

    const shop = {
      id: shopId,
      name: shopData.name || '未命名商店',
      items: shopData.items || [],
      priceModifier: shopData.priceModifier || this.defaultPriceModifier,
      description: shopData.description || '',
      npcId: shopData.npcId || null,
      isOpen: shopData.isOpen !== undefined ? shopData.isOpen : true
    };

    this.shops.set(shopId, shop);
    return true;
  }

  /**
   * 获取商店信息
   * @param {string} shopId - 商店ID
   * @returns {Object|null} 商店信息
   */
  getShop(shopId) {
    return this.shops.get(shopId) || null;
  }

  /**
   * 获取所有商店
   * @returns {Array} 商店列表
   */
  getAllShops() {
    return Array.from(this.shops.values());
  }

  /**
   * 购买物品
   * @param {Object} player - 玩家对象
   * @param {string} shopId - 商店ID
   * @param {string} itemId - 物品ID
   * @param {number} quantity - 购买数量
   * @returns {Object} 购买结果
   */
  buyItem(player, shopId, itemId, quantity = 1) {
    // 验证参数
    if (!player || !shopId || !itemId) {
      return { 
        success: false, 
        reason: 'invalid_parameters',
        message: '无效的参数'
      };
    }

    if (quantity <= 0) {
      return { 
        success: false, 
        reason: 'invalid_quantity',
        message: '购买数量必须大于0'
      };
    }

    // 获取商店
    const shop = this.shops.get(shopId);
    if (!shop) {
      return { 
        success: false, 
        reason: 'shop_not_found',
        message: '商店不存在'
      };
    }

    // 检查商店是否开放
    if (!shop.isOpen) {
      return { 
        success: false, 
        reason: 'shop_closed',
        message: '商店未开放'
      };
    }

    // 查找物品
    const item = shop.items.find(i => i.id === itemId);
    if (!item) {
      return { 
        success: false, 
        reason: 'item_not_found',
        message: '物品不存在'
      };
    }

    // 检查库存（如果有库存限制）
    if (item.stock !== undefined && item.stock < quantity) {
      return { 
        success: false, 
        reason: 'insufficient_stock',
        message: '库存不足',
        available: item.stock
      };
    }

    // 计算总价
    const totalCost = this.calculateBuyPrice(item, quantity, shop.priceModifier);

    // 检查玩家货币
    if (!player.currency || player.currency < totalCost) {
      return { 
        success: false, 
        reason: 'insufficient_currency',
        message: '货币不足',
        required: totalCost,
        current: player.currency || 0
      };
    }

    // 检查背包空间（如果玩家有背包系统）
    if (player.inventory) {
      if (player.inventory.isFull && player.inventory.isFull()) {
        return { 
          success: false, 
          reason: 'inventory_full',
          message: '背包已满'
        };
      }
    }

    // 执行交易
    player.currency -= totalCost;

    // 添加物品到背包
    if (player.inventory && player.inventory.addItem) {
      const addResult = player.inventory.addItem(item, quantity);
      if (!addResult.success) {
        // 添加失败，退款
        player.currency += totalCost;
        return { 
          success: false, 
          reason: 'add_item_failed',
          message: '添加物品失败',
          details: addResult
        };
      }
    } else {
      // 如果没有背包系统，直接添加到物品数组
      if (!player.items) {
        player.items = [];
      }
      for (let i = 0; i < quantity; i++) {
        player.items.push({ ...item });
      }
    }

    // 更新库存
    if (item.stock !== undefined) {
      item.stock -= quantity;
    }

    // 记录交易
    this.recordTransaction({
      type: 'buy',
      shopId,
      itemId,
      itemName: item.name,
      quantity,
      totalCost,
      timestamp: Date.now()
    });

    return { 
      success: true,
      itemName: item.name,
      quantity,
      totalCost,
      remainingCurrency: player.currency
    };
  }

  /**
   * 出售物品
   * @param {Object} player - 玩家对象
   * @param {string} shopId - 商店ID
   * @param {string} itemId - 物品ID
   * @param {number} quantity - 出售数量
   * @returns {Object} 出售结果
   */
  sellItem(player, shopId, itemId, quantity = 1) {
    // 验证参数
    if (!player || !shopId || !itemId) {
      return { 
        success: false, 
        reason: 'invalid_parameters',
        message: '无效的参数'
      };
    }

    if (quantity <= 0) {
      return { 
        success: false, 
        reason: 'invalid_quantity',
        message: '出售数量必须大于0'
      };
    }

    // 获取商店
    const shop = this.shops.get(shopId);
    if (!shop) {
      return { 
        success: false, 
        reason: 'shop_not_found',
        message: '商店不存在'
      };
    }

    // 检查商店是否开放
    if (!shop.isOpen) {
      return { 
        success: false, 
        reason: 'shop_closed',
        message: '商店未开放'
      };
    }

    // 查找玩家物品
    let item = null;
    let itemCount = 0;

    if (player.inventory && player.inventory.getItemCount) {
      itemCount = player.inventory.getItemCount(itemId);
      if (itemCount > 0) {
        // 从背包获取物品信息
        const slots = player.inventory.items || [];
        const slot = slots.find(s => s && s.item && s.item.id === itemId);
        if (slot) {
          item = slot.item;
        }
      }
    } else if (player.items) {
      // 简单物品数组
      const playerItems = player.items.filter(i => i.id === itemId);
      itemCount = playerItems.length;
      if (itemCount > 0) {
        item = playerItems[0];
      }
    }

    if (!item || itemCount < quantity) {
      return { 
        success: false, 
        reason: 'insufficient_items',
        message: '物品数量不足',
        required: quantity,
        available: itemCount
      };
    }

    // 计算出售价格
    const totalValue = this.calculateSellPrice(item, quantity);

    // 从背包移除物品
    if (player.inventory && player.inventory.removeItem) {
      const removeResult = player.inventory.removeItem(itemId, quantity);
      if (!removeResult) {
        return { 
          success: false, 
          reason: 'remove_item_failed',
          message: '移除物品失败'
        };
      }
    } else if (player.items) {
      // 简单物品数组
      for (let i = 0; i < quantity; i++) {
        const index = player.items.findIndex(it => it.id === itemId);
        if (index !== -1) {
          player.items.splice(index, 1);
        }
      }
    }

    // 增加玩家货币
    player.currency = (player.currency || 0) + totalValue;

    // 记录交易
    this.recordTransaction({
      type: 'sell',
      shopId,
      itemId,
      itemName: item.name,
      quantity,
      totalValue,
      timestamp: Date.now()
    });

    return { 
      success: true,
      itemName: item.name,
      quantity,
      totalValue,
      remainingCurrency: player.currency
    };
  }

  /**
   * 计算购买价格
   * @param {Object} item - 物品对象
   * @param {number} quantity - 数量
   * @param {number} priceModifier - 价格修正系数
   * @returns {number} 总价
   */
  calculateBuyPrice(item, quantity = 1, priceModifier = 1.0) {
    const basePrice = item.price || 0;
    return Math.floor(basePrice * quantity * priceModifier);
  }

  /**
   * 计算出售价格
   * @param {Object} item - 物品对象
   * @param {number} quantity - 数量
   * @returns {number} 总价
   */
  calculateSellPrice(item, quantity = 1) {
    const basePrice = item.price || item.sellPrice || 0;
    return Math.floor(basePrice * quantity * this.sellPriceRatio);
  }

  /**
   * 添加物品到商店
   * @param {string} shopId - 商店ID
   * @param {Object} item - 物品对象
   * @returns {boolean} 是否添加成功
   */
  addItemToShop(shopId, item) {
    const shop = this.shops.get(shopId);
    if (!shop) {
      return false;
    }

    // 检查物品是否已存在
    const existingItem = shop.items.find(i => i.id === item.id);
    if (existingItem) {
      // 如果有库存系统，增加库存
      if (existingItem.stock !== undefined) {
        existingItem.stock += (item.stock || 1);
      }
    } else {
      // 添加新物品
      shop.items.push({ ...item });
    }

    return true;
  }

  /**
   * 从商店移除物品
   * @param {string} shopId - 商店ID
   * @param {string} itemId - 物品ID
   * @returns {boolean} 是否移除成功
   */
  removeItemFromShop(shopId, itemId) {
    const shop = this.shops.get(shopId);
    if (!shop) {
      return false;
    }

    const index = shop.items.findIndex(i => i.id === itemId);
    if (index !== -1) {
      shop.items.splice(index, 1);
      return true;
    }

    return false;
  }

  /**
   * 更新商店物品库存
   * @param {string} shopId - 商店ID
   * @param {string} itemId - 物品ID
   * @param {number} stock - 新库存数量
   * @returns {boolean} 是否更新成功
   */
  updateItemStock(shopId, itemId, stock) {
    const shop = this.shops.get(shopId);
    if (!shop) {
      return false;
    }

    const item = shop.items.find(i => i.id === itemId);
    if (item) {
      item.stock = stock;
      return true;
    }

    return false;
  }

  /**
   * 设置商店开放状态
   * @param {string} shopId - 商店ID
   * @param {boolean} isOpen - 是否开放
   * @returns {boolean} 是否设置成功
   */
  setShopOpen(shopId, isOpen) {
    const shop = this.shops.get(shopId);
    if (!shop) {
      return false;
    }

    shop.isOpen = isOpen;
    return true;
  }

  /**
   * 记录交易
   * @param {Object} transaction - 交易记录
   */
  recordTransaction(transaction) {
    this.transactionHistory.push(transaction);

    // 限制历史记录大小
    if (this.transactionHistory.length > this.maxHistorySize) {
      this.transactionHistory.shift();
    }
  }

  /**
   * 获取交易历史
   * @param {number} limit - 限制数量
   * @returns {Array} 交易历史
   */
  getTransactionHistory(limit = 10) {
    return this.transactionHistory.slice(-limit);
  }

  /**
   * 清除交易历史
   */
  clearTransactionHistory() {
    this.transactionHistory = [];
  }

  /**
   * 获取商店物品列表
   * @param {string} shopId - 商店ID
   * @param {Object} filters - 过滤条件
   * @returns {Array} 物品列表
   */
  getShopItems(shopId, filters = {}) {
    const shop = this.shops.get(shopId);
    if (!shop) {
      return [];
    }

    let items = [...shop.items];

    // 应用过滤条件
    if (filters.type) {
      items = items.filter(item => item.type === filters.type);
    }

    if (filters.rarity) {
      items = items.filter(item => item.rarity === filters.rarity);
    }

    if (filters.minPrice !== undefined) {
      items = items.filter(item => (item.price || 0) >= filters.minPrice);
    }

    if (filters.maxPrice !== undefined) {
      items = items.filter(item => (item.price || 0) <= filters.maxPrice);
    }

    if (filters.inStock) {
      items = items.filter(item => item.stock === undefined || item.stock > 0);
    }

    return items;
  }

  /**
   * 检查玩家是否能购买物品
   * @param {Object} player - 玩家对象
   * @param {string} shopId - 商店ID
   * @param {string} itemId - 物品ID
   * @param {number} quantity - 数量
   * @returns {Object} 检查结果
   */
  canBuy(player, shopId, itemId, quantity = 1) {
    const shop = this.shops.get(shopId);
    if (!shop) {
      return { canBuy: false, reason: 'shop_not_found' };
    }

    if (!shop.isOpen) {
      return { canBuy: false, reason: 'shop_closed' };
    }

    const item = shop.items.find(i => i.id === itemId);
    if (!item) {
      return { canBuy: false, reason: 'item_not_found' };
    }

    if (item.stock !== undefined && item.stock < quantity) {
      return { canBuy: false, reason: 'insufficient_stock', available: item.stock };
    }

    const totalCost = this.calculateBuyPrice(item, quantity, shop.priceModifier);
    if ((player.currency || 0) < totalCost) {
      return { canBuy: false, reason: 'insufficient_currency', required: totalCost };
    }

    if (player.inventory && player.inventory.isFull && player.inventory.isFull()) {
      return { canBuy: false, reason: 'inventory_full' };
    }

    return { canBuy: true, cost: totalCost };
  }

  /**
   * 批量购买物品
   * @param {Object} player - 玩家对象
   * @param {string} shopId - 商店ID
   * @param {Array} purchases - 购买列表 [{itemId, quantity}]
   * @returns {Object} 批量购买结果
   */
  buyMultiple(player, shopId, purchases) {
    const results = [];
    let totalCost = 0;
    let successCount = 0;

    for (const purchase of purchases) {
      const result = this.buyItem(player, shopId, purchase.itemId, purchase.quantity);
      results.push(result);

      if (result.success) {
        totalCost += result.totalCost;
        successCount++;
      }
    }

    return {
      success: successCount > 0,
      results,
      totalCost,
      successCount,
      failCount: purchases.length - successCount
    };
  }

  /**
   * 重置商店（用于测试或特殊情况）
   * @param {string} shopId - 商店ID
   */
  resetShop(shopId) {
    this.shops.delete(shopId);
  }

  /**
   * 清除所有商店
   */
  clearAllShops() {
    this.shops.clear();
    this.transactionHistory = [];
  }
}

export default ShopSystem;
