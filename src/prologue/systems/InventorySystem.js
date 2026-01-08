/**
 * 背包系统 (InventorySystem) - 序章专用
 * 
 * 管理玩家的物品背包，支持物品的添加、移除、堆叠等功能
 * 
 * 功能:
 * - 物品添加和移除
 * - 可堆叠物品管理
 * - 槽位管理和交换
 * - 物品查询和筛选
 * - 容量管理
 * - 事件通知
 * - 序列化和反序列化
 * 
 * 需求: 3, 4
 */

/**
 * 背包系统类
 */
export class InventorySystem {
  /**
   * 创建背包系统
   * @param {number} maxSlots - 最大槽位数，默认 30
   */
  constructor(maxSlots = 30) {
    this.maxSlots = maxSlots;
    this.items = [];  // 物品槽位数组 [{item, quantity}, ...]
    this.listeners = [];  // 事件监听器
  }
  
  /**
   * 添加物品到背包
   * @param {Object} item - 物品对象
   * @param {number} quantity - 数量，默认 1
   * @returns {boolean} 是否成功添加
   */
  addItem(item, quantity = 1) {
    // 验证参数
    if (!item || !item.id || quantity <= 0) {
      return false;
    }
    
    // 如果物品可堆叠，尝试堆叠到现有槽位
    if (item.stackable) {
      return this.addStackableItem(item, quantity);
    } else {
      // 不可堆叠物品，每个占用一个槽位
      return this.addNonStackableItem(item);
    }
  }
  
  /**
   * 添加可堆叠物品
   * @param {Object} item - 物品对象
   * @param {number} quantity - 数量
   * @returns {boolean} 是否成功添加
   */
  addStackableItem(item, quantity) {
    const maxStack = item.maxStack || 99;
    let remainingQuantity = quantity;
    
    // 先尝试堆叠到现有槽位
    for (const slot of this.items) {
      if (slot.item.id === item.id && slot.quantity < maxStack) {
        const canAdd = Math.min(remainingQuantity, maxStack - slot.quantity);
        slot.quantity += canAdd;
        remainingQuantity -= canAdd;
        
        if (remainingQuantity <= 0) {
          this.notifyListeners('itemAdded', { item, quantity });
          return true;
        }
      }
    }
    
    // 如果还有剩余，创建新槽位
    while (remainingQuantity > 0) {
      if (this.isFull()) {
        return false;  // 背包已满
      }
      
      const addQuantity = Math.min(remainingQuantity, maxStack);
      this.items.push({
        item: { ...item },
        quantity: addQuantity
      });
      remainingQuantity -= addQuantity;
    }
    
    this.notifyListeners('itemAdded', { item, quantity });
    return true;
  }
  
  /**
   * 添加不可堆叠物品
   * @param {Object} item - 物品对象
   * @returns {boolean} 是否成功添加
   */
  addNonStackableItem(item) {
    if (this.isFull()) {
      return false;
    }
    
    this.items.push({
      item: { ...item },
      quantity: 1
    });
    
    this.notifyListeners('itemAdded', { item, quantity: 1 });
    return true;
  }
  
  /**
   * 从背包移除物品
   * @param {string} itemId - 物品 ID
   * @param {number} quantity - 数量，默认 1
   * @returns {boolean} 是否成功移除
   */
  removeItem(itemId, quantity = 1) {
    // 验证参数
    if (!itemId || quantity <= 0) {
      return false;
    }
    
    // 检查是否有足够的物品
    if (!this.hasItem(itemId, quantity)) {
      return false;
    }
    
    let remainingQuantity = quantity;
    
    // 从槽位中移除物品
    for (let i = this.items.length - 1; i >= 0; i--) {
      const slot = this.items[i];
      
      if (slot.item.id === itemId) {
        if (slot.quantity <= remainingQuantity) {
          // 移除整个槽位
          remainingQuantity -= slot.quantity;
          this.items.splice(i, 1);
        } else {
          // 减少数量
          slot.quantity -= remainingQuantity;
          remainingQuantity = 0;
        }
        
        if (remainingQuantity <= 0) {
          break;
        }
      }
    }
    
    this.notifyListeners('itemRemoved', { itemId, quantity });
    return true;
  }
  
  /**
   * 获取物品数量
   * @param {string} itemId - 物品 ID
   * @returns {number} 物品总数量
   */
  getItemCount(itemId) {
    let count = 0;
    
    for (const slot of this.items) {
      if (slot.item.id === itemId) {
        count += slot.quantity;
      }
    }
    
    return count;
  }
  
  /**
   * 检查是否拥有指定数量的物品
   * @param {string} itemId - 物品 ID
   * @param {number} quantity - 数量，默认 1
   * @returns {boolean} 是否拥有
   */
  hasItem(itemId, quantity = 1) {
    return this.getItemCount(itemId) >= quantity;
  }
  
  /**
   * 获取指定槽位的物品
   * @param {number} slotIndex - 槽位索引
   * @returns {Object|null} 物品槽位对象，如果不存在则返回 null
   */
  getItemAtSlot(slotIndex) {
    if (slotIndex < 0 || slotIndex >= this.items.length) {
      return null;
    }
    
    return this.items[slotIndex];
  }
  
  /**
   * 获取所有物品
   * @returns {Array} 物品槽位数组
   */
  getAllItems() {
    return [...this.items];
  }
  
  /**
   * 根据类型获取物品
   * @param {string} type - 物品类型
   * @returns {Array} 物品槽位数组
   */
  getItemsByType(type) {
    return this.items.filter(slot => slot.item.type === type);
  }
  
  /**
   * 交换两个槽位的物品
   * @param {number} slotIndex1 - 槽位1索引
   * @param {number} slotIndex2 - 槽位2索引
   * @returns {boolean} 是否成功交换
   */
  swapSlots(slotIndex1, slotIndex2) {
    if (slotIndex1 < 0 || slotIndex1 >= this.items.length ||
        slotIndex2 < 0 || slotIndex2 >= this.items.length) {
      return false;
    }
    
    const temp = this.items[slotIndex1];
    this.items[slotIndex1] = this.items[slotIndex2];
    this.items[slotIndex2] = temp;
    
    this.notifyListeners('slotsSwapped', { slotIndex1, slotIndex2 });
    return true;
  }
  
  /**
   * 清空背包
   */
  clear() {
    this.items = [];
    this.notifyListeners('cleared', {});
  }
  
  /**
   * 获取已使用的槽位数
   * @returns {number} 已使用槽位数
   */
  getUsedSlots() {
    return this.items.length;
  }
  
  /**
   * 获取剩余槽位数
   * @returns {number} 剩余槽位数
   */
  getRemainingSlots() {
    return this.maxSlots - this.items.length;
  }
  
  /**
   * 检查背包是否已满
   * @returns {boolean} 是否已满
   */
  isFull() {
    return this.items.length >= this.maxSlots;
  }
  
  /**
   * 添加事件监听器
   * @param {Function} listener - 监听器函数
   */
  addListener(listener) {
    if (typeof listener === 'function' && !this.listeners.includes(listener)) {
      this.listeners.push(listener);
    }
  }
  
  /**
   * 移除事件监听器
   * @param {Function} listener - 监听器函数
   */
  removeListener(listener) {
    const index = this.listeners.indexOf(listener);
    if (index !== -1) {
      this.listeners.splice(index, 1);
    }
  }
  
  /**
   * 通知所有监听器
   * @param {string} eventType - 事件类型
   * @param {Object} data - 事件数据
   */
  notifyListeners(eventType, data) {
    for (const listener of this.listeners) {
      try {
        listener(eventType, data);
      } catch (error) {
        console.error('监听器执行错误:', error);
      }
    }
  }
  
  /**
   * 序列化背包数据
   * @returns {Object} 序列化后的数据
   */
  serialize() {
    return {
      maxSlots: this.maxSlots,
      items: this.items.map(slot => ({
        item: { ...slot.item },
        quantity: slot.quantity
      }))
    };
  }
  
  /**
   * 从序列化数据恢复背包
   * @param {Object} data - 序列化的数据
   */
  deserialize(data) {
    if (!data) return;
    
    this.maxSlots = data.maxSlots || 30;
    this.items = (data.items || []).map(slot => ({
      item: { ...slot.item },
      quantity: slot.quantity
    }));
    
    this.notifyListeners('deserialized', {});
  }
}

export default InventorySystem;
