/**
 * 装备系统 (EquipmentSystem)
 * 
 * 管理玩家的装备获取、穿戴、卸下和属性计算
 * 
 * 功能:
 * - 装备数据结构管理
 * - 装备穿戴和卸下
 * - 装备属性计算（包括正属性和负属性）
 * - 装备槽位管理
 * 
 * 需求: 4, 10, 13, 14
 */

/**
 * 装备类型枚举
 */
export const EquipmentType = {
  WEAPON: 'weapon',      // 武器
  ARMOR: 'armor',        // 防具
  ACCESSORY: 'accessory' // 饰品
};

/**
 * 装备品质枚举
 */
export const EquipmentRarity = {
  COMMON: 'common',         // 普通（白色）
  UNCOMMON: 'uncommon',     // 优秀（绿色）
  RARE: 'rare',             // 稀有（蓝色）
  EPIC: 'epic',             // 史诗（紫色）
  LEGENDARY: 'legendary'    // 传说（橙色）
};

/**
 * 装备槽位枚举
 */
export const EquipmentSlot = {
  WEAPON: 'weapon',
  ARMOR: 'armor',
  ACCESSORY: 'accessory'
};

/**
 * 装备数据类
 * 
 * 表示一个装备物品的完整数据
 */
export class Equipment {
  /**
   * 创建装备实例
   * @param {Object} data - 装备数据
   * @param {string} data.id - 装备唯一ID
   * @param {string} data.name - 装备名称
   * @param {string} data.type - 装备类型（weapon/armor/accessory）
   * @param {string} data.rarity - 装备品质
   * @param {number} data.level - 装备等级
   * @param {Object} data.attributes - 正属性加成
   * @param {Object} data.negativeAttributes - 负属性
   * @param {Object} data.requirements - 装备需求
   */
  constructor(data) {
    this.id = data.id;
    this.name = data.name;
    this.type = data.type;
    this.rarity = data.rarity || EquipmentRarity.COMMON;
    this.level = data.level || 1;
    this.enhanceLevel = data.enhanceLevel || 0; // 强化等级 +0, +1, +2...
    
    // 基础属性（用于强化计算）
    this.baseAttributes = {
      attack: data.attributes?.attack || 0,
      defense: data.attributes?.defense || 0,
      health: data.attributes?.health || 0,
      speed: data.attributes?.speed || 0
    };
    
    // 当前属性（包含强化加成）
    this.attributes = { ...this.baseAttributes };
    
    // 负属性
    this.negativeAttributes = {
      durability: data.negativeAttributes?.durability || 0,
      weight: data.negativeAttributes?.weight || 0
    };
    
    // 装备需求
    this.requirements = {
      level: data.requirements?.level || 1,
      class: data.requirements?.class || null
    };
    
    // 描述
    this.description = data.description || '';
  }
  
  /**
   * 获取装备的显示名称（包含强化等级）
   * @returns {string} 显示名称
   */
  getDisplayName() {
    if (this.enhanceLevel > 0) {
      return `${this.name} +${this.enhanceLevel}`;
    }
    return this.name;
  }
  
  /**
   * 检查玩家是否满足装备需求
   * @param {Object} player - 玩家对象
   * @returns {boolean} 是否满足需求
   */
  canEquip(player) {
    // 检查等级需求
    if (player.level < this.requirements.level) {
      return false;
    }
    
    // 检查职业需求
    if (this.requirements.class && player.class !== this.requirements.class) {
      return false;
    }
    
    return true;
  }
  
  /**
   * 克隆装备实例
   * @returns {Equipment} 新的装备实例
   */
  clone() {
    return new Equipment({
      id: this.id,
      name: this.name,
      type: this.type,
      rarity: this.rarity,
      level: this.level,
      enhanceLevel: this.enhanceLevel,
      attributes: { ...this.baseAttributes },
      negativeAttributes: { ...this.negativeAttributes },
      requirements: { ...this.requirements },
      description: this.description
    });
  }
}

/**
 * 装备系统类
 * 
 * 管理玩家的装备穿戴、卸下和属性计算
 */
export class EquipmentSystem {
  constructor() {
    // 装备槽位（每个玩家有三个槽位）
    this.slots = {
      [EquipmentSlot.WEAPON]: null,
      [EquipmentSlot.ARMOR]: null,
      [EquipmentSlot.ACCESSORY]: null
    };
    
    // 事件监听器
    this.listeners = {
      onEquip: [],
      onUnequip: [],
      onAttributeChange: []
    };
  }
  
  /**
   * 装备物品到指定槽位
   * @param {Object} player - 玩家对象
   * @param {Equipment} equipment - 要装备的物品
   * @param {string} slot - 装备槽位
   * @returns {Object} 操作结果 { success: boolean, reason?: string, unequipped?: Equipment }
   */
  equipItem(player, equipment, slot) {
    // 验证装备类型和槽位匹配
    if (equipment.type !== slot) {
      return {
        success: false,
        reason: 'slot_mismatch',
        message: '装备类型与槽位不匹配'
      };
    }
    
    // 检查玩家是否满足装备需求
    if (!equipment.canEquip(player)) {
      return {
        success: false,
        reason: 'requirements_not_met',
        message: '不满足装备需求'
      };
    }
    
    // 如果槽位已有装备，先卸下
    let unequippedItem = null;
    if (this.slots[slot]) {
      const unequipResult = this.unequipItem(player, slot);
      if (unequipResult.success) {
        unequippedItem = unequipResult.equipment;
      }
    }
    
    // 装备新物品
    this.slots[slot] = equipment;
    
    // 更新玩家属性
    this.updatePlayerAttributes(player);
    
    // 触发装备事件
    this.triggerEvent('onEquip', { player, equipment, slot });
    
    return {
      success: true,
      unequipped: unequippedItem
    };
  }
  
  /**
   * 从指定槽位卸下装备
   * @param {Object} player - 玩家对象
   * @param {string} slot - 装备槽位
   * @returns {Object} 操作结果 { success: boolean, equipment?: Equipment }
   */
  unequipItem(player, slot) {
    const equipment = this.slots[slot];
    
    if (!equipment) {
      return {
        success: false,
        reason: 'slot_empty',
        message: '槽位为空'
      };
    }
    
    // 卸下装备
    this.slots[slot] = null;
    
    // 更新玩家属性
    this.updatePlayerAttributes(player);
    
    // 触发卸下事件
    this.triggerEvent('onUnequip', { player, equipment, slot });
    
    return {
      success: true,
      equipment: equipment
    };
  }
  
  /**
   * 获取指定槽位的装备
   * @param {string} slot - 装备槽位
   * @returns {Equipment|null} 装备对象或null
   */
  getEquipment(slot) {
    return this.slots[slot];
  }
  
  /**
   * 获取所有已装备的物品
   * @returns {Object} 所有装备 { weapon, armor, accessory }
   */
  getAllEquipment() {
    return { ...this.slots };
  }
  
  /**
   * 计算所有装备的属性加成
   * @returns {Object} 属性加成总和
   */
  calculateTotalAttributes() {
    const total = {
      attack: 0,
      defense: 0,
      health: 0,
      speed: 0
    };
    
    // 累加所有装备的属性
    for (const slot in this.slots) {
      const equipment = this.slots[slot];
      if (equipment) {
        total.attack += equipment.attributes.attack || 0;
        total.defense += equipment.attributes.defense || 0;
        total.health += equipment.attributes.health || 0;
        total.speed += equipment.attributes.speed || 0;
      }
    }
    
    return total;
  }
  
  /**
   * 计算所有装备的负属性
   * @returns {Object} 负属性总和
   */
  calculateTotalNegativeAttributes() {
    const total = {
      durability: 0,
      weight: 0
    };
    
    // 累加所有装备的负属性
    for (const slot in this.slots) {
      const equipment = this.slots[slot];
      if (equipment) {
        total.durability += equipment.negativeAttributes.durability || 0;
        total.weight += equipment.negativeAttributes.weight || 0;
      }
    }
    
    return total;
  }
  
  /**
   * 更新玩家属性（基于装备）
   * @param {Object} player - 玩家对象
   */
  updatePlayerAttributes(player) {
    if (!player.baseAttributes) {
      // 如果玩家没有基础属性，先保存当前属性作为基础属性
      player.baseAttributes = {
        attack: player.attack || 10,
        defense: player.defense || 5,
        health: player.health || 100,
        maxHealth: player.maxHealth || 100,
        speed: player.speed || 100
      };
    }
    
    // 计算装备属性加成
    const equipmentBonus = this.calculateTotalAttributes();
    
    // 更新玩家属性 = 基础属性 + 装备加成
    player.attack = player.baseAttributes.attack + equipmentBonus.attack;
    player.defense = player.baseAttributes.defense + equipmentBonus.defense;
    player.maxHealth = player.baseAttributes.maxHealth + equipmentBonus.health;
    player.speed = player.baseAttributes.speed + equipmentBonus.speed;
    
    // 如果当前生命值超过最大生命值，调整
    if (player.health > player.maxHealth) {
      player.health = player.maxHealth;
    }
    
    // 计算负属性影响
    const negativeAttributes = this.calculateTotalNegativeAttributes();
    player.durabilityPenalty = negativeAttributes.durability;
    player.weightPenalty = negativeAttributes.weight;
    
    // 触发属性变化事件
    this.triggerEvent('onAttributeChange', { player, equipmentBonus, negativeAttributes });
  }
  
  /**
   * 检查槽位是否为空
   * @param {string} slot - 装备槽位
   * @returns {boolean} 是否为空
   */
  isSlotEmpty(slot) {
    return this.slots[slot] === null;
  }
  
  /**
   * 清空所有装备
   * @param {Object} player - 玩家对象
   */
  clearAllEquipment(player) {
    for (const slot in this.slots) {
      if (this.slots[slot]) {
        this.unequipItem(player, slot);
      }
    }
  }
  
  /**
   * 注册事件监听器
   * @param {string} event - 事件名称
   * @param {Function} callback - 回调函数
   */
  on(event, callback) {
    if (this.listeners[event]) {
      this.listeners[event].push(callback);
    }
  }
  
  /**
   * 移除事件监听器
   * @param {string} event - 事件名称
   * @param {Function} callback - 回调函数
   */
  off(event, callback) {
    if (this.listeners[event]) {
      this.listeners[event] = this.listeners[event].filter(cb => cb !== callback);
    }
  }
  
  /**
   * 触发事件
   * @param {string} event - 事件名称
   * @param {Object} data - 事件数据
   */
  triggerEvent(event, data) {
    if (this.listeners[event]) {
      this.listeners[event].forEach(callback => callback(data));
    }
  }
  
  /**
   * 序列化装备系统状态（用于保存）
   * @returns {Object} 序列化数据
   */
  serialize() {
    return {
      slots: {
        weapon: this.slots.weapon ? {
          id: this.slots.weapon.id,
          enhanceLevel: this.slots.weapon.enhanceLevel
        } : null,
        armor: this.slots.armor ? {
          id: this.slots.armor.id,
          enhanceLevel: this.slots.armor.enhanceLevel
        } : null,
        accessory: this.slots.accessory ? {
          id: this.slots.accessory.id,
          enhanceLevel: this.slots.accessory.enhanceLevel
        } : null
      }
    };
  }
  
  /**
   * 从序列化数据恢复装备系统状态
   * @param {Object} data - 序列化数据
   * @param {Function} equipmentFactory - 装备工厂函数，根据ID创建装备
   */
  deserialize(data, equipmentFactory) {
    if (data.slots) {
      for (const slot in data.slots) {
        if (data.slots[slot]) {
          const equipment = equipmentFactory(data.slots[slot].id);
          if (equipment) {
            equipment.enhanceLevel = data.slots[slot].enhanceLevel || 0;
            this.slots[slot] = equipment;
          }
        }
      }
    }
  }
}

export default EquipmentSystem;
