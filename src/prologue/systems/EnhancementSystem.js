/**
 * 装备强化系统
 * 
 * 职责：
 * - 装备强化（消耗货币，有成功率）
 * - 装备拆解（返还货币）
 * - 强化等级管理
 * - 属性加成计算
 * 
 * 需求：17, 18
 */

export class EnhancementSystem {
  constructor() {
    // 强化成功率配置（根据当前强化等级）
    this.enhanceRates = {
      0: 1.0,    // +0 -> +1: 100%
      1: 0.9,    // +1 -> +2: 90%
      2: 0.8,    // +2 -> +3: 80%
      3: 0.7,    // +3 -> +4: 70%
      4: 0.6,    // +4 -> +5: 60%
      5: 0.5,    // +5 -> +6: 50%
      6: 0.4,    // +6 -> +7: 40%
      7: 0.3,    // +7 -> +8: 30%
      8: 0.2,    // +8 -> +9: 20%
      9: 0.1     // +9 -> +10: 10%
    };

    // 强化消耗货币配置（基础消耗 * 等级系数）
    this.enhanceCostBase = 100;
    this.enhanceCostMultiplier = 1.5;

    // 拆解返还比例配置
    this.dismantleRateByRarity = {
      'common': 0.3,      // 普通装备返还30%
      'uncommon': 0.4,    // 优秀装备返还40%
      'rare': 0.5,        // 稀有装备返还50%
      'epic': 0.6,        // 史诗装备返还60%
      'legendary': 0.7    // 传说装备返还70%
    };

    // 装备基础价值配置
    this.baseValueByRarity = {
      'common': 100,
      'uncommon': 300,
      'rare': 1000,
      'epic': 3000,
      'legendary': 10000
    };

    // 强化属性加成比例（每级增加10%）
    this.enhanceBonusPerLevel = 0.1;

    // 最大强化等级
    this.maxEnhanceLevel = 10;
  }

  /**
   * 强化装备
   * @param {Object} equipment - 装备对象
   * @param {Object} player - 玩家对象
   * @returns {Object} 强化结果 { success: boolean, newLevel?: number, reason?: string }
   */
  enhanceEquipment(equipment, player) {
    // 验证装备
    if (!equipment) {
      return { success: false, reason: 'invalid_equipment' };
    }

    // 检查是否已达到最大强化等级
    const currentLevel = equipment.enhanceLevel || 0;
    if (currentLevel >= this.maxEnhanceLevel) {
      return { success: false, reason: 'max_level_reached' };
    }

    // 计算强化消耗
    const cost = this.calculateEnhanceCost(equipment);

    // 检查玩家货币是否足够
    if (player.currency < cost) {
      return { success: false, reason: 'insufficient_currency', cost };
    }

    // 扣除货币
    player.currency -= cost;

    // 获取成功率
    const successRate = this.getEnhanceRate(currentLevel);

    // 执行强化判定
    const success = Math.random() < successRate;

    if (success) {
      // 强化成功
      equipment.enhanceLevel = currentLevel + 1;
      
      // 应用强化加成
      this.applyEnhanceBonus(equipment);

      return { 
        success: true, 
        newLevel: equipment.enhanceLevel,
        cost,
        successRate
      };
    } else {
      // 强化失败
      return { 
        success: false, 
        reason: 'enhance_failed',
        cost,
        successRate
      };
    }
  }

  /**
   * 计算强化消耗
   * @param {Object} equipment - 装备对象
   * @returns {number} 消耗的货币数量
   */
  calculateEnhanceCost(equipment) {
    const currentLevel = equipment.enhanceLevel || 0;
    const rarityMultiplier = this.getRarityMultiplier(equipment.rarity);
    
    // 消耗 = 基础消耗 * (1 + 等级 * 系数) * 品质系数
    const cost = Math.floor(
      this.enhanceCostBase * 
      Math.pow(this.enhanceCostMultiplier, currentLevel) * 
      rarityMultiplier
    );

    return cost;
  }

  /**
   * 获取强化成功率
   * @param {number} currentLevel - 当前强化等级
   * @returns {number} 成功率（0-1）
   */
  getEnhanceRate(currentLevel) {
    return this.enhanceRates[currentLevel] || 0.1;
  }

  /**
   * 应用强化加成到装备属性
   * @param {Object} equipment - 装备对象
   */
  applyEnhanceBonus(equipment) {
    // 如果没有基础属性，先保存
    if (!equipment.baseAttributes) {
      equipment.baseAttributes = { ...equipment.attributes };
    }

    // 计算强化加成倍率
    const bonusMultiplier = 1 + (equipment.enhanceLevel * this.enhanceBonusPerLevel);

    // 应用加成到所有属性
    for (const attr in equipment.baseAttributes) {
      equipment.attributes[attr] = Math.floor(
        equipment.baseAttributes[attr] * bonusMultiplier
      );
    }
  }

  /**
   * 拆解装备
   * @param {Object} equipment - 装备对象
   * @returns {Object} 拆解结果 { success: boolean, currency: number }
   */
  dismantleEquipment(equipment) {
    // 验证装备
    if (!equipment) {
      return { success: false, reason: 'invalid_equipment', currency: 0 };
    }

    // 计算返还货币
    const currency = this.calculateDismantleValue(equipment);

    return { 
      success: true, 
      currency,
      equipmentName: equipment.name,
      equipmentRarity: equipment.rarity,
      enhanceLevel: equipment.enhanceLevel || 0
    };
  }

  /**
   * 计算拆解返还价值
   * @param {Object} equipment - 装备对象
   * @returns {number} 返还的货币数量
   */
  calculateDismantleValue(equipment) {
    // 获取装备基础价值
    const baseValue = this.getBaseValue(equipment.rarity);

    // 获取拆解返还比例
    const dismantleRate = this.dismantleRateByRarity[equipment.rarity] || 0.3;

    // 计算强化加成（每级强化增加额外价值）
    const enhanceLevel = equipment.enhanceLevel || 0;
    const enhanceBonus = enhanceLevel * 100;

    // 总价值 = (基础价值 + 强化加成) * 返还比例
    const totalValue = Math.floor((baseValue + enhanceBonus) * dismantleRate);

    return totalValue;
  }

  /**
   * 获取装备基础价值
   * @param {string} rarity - 装备品质
   * @returns {number} 基础价值
   */
  getBaseValue(rarity) {
    return this.baseValueByRarity[rarity] || this.baseValueByRarity['common'];
  }

  /**
   * 获取品质系数
   * @param {string} rarity - 装备品质
   * @returns {number} 品质系数
   */
  getRarityMultiplier(rarity) {
    const multipliers = {
      'common': 1.0,
      'uncommon': 1.5,
      'rare': 2.0,
      'epic': 3.0,
      'legendary': 5.0
    };
    return multipliers[rarity] || 1.0;
  }

  /**
   * 获取强化等级显示文本
   * @param {number} level - 强化等级
   * @returns {string} 显示文本（如 "+5"）
   */
  getEnhanceLevelText(level) {
    return level > 0 ? `+${level}` : '';
  }

  /**
   * 检查是否可以强化
   * @param {Object} equipment - 装备对象
   * @param {Object} player - 玩家对象
   * @returns {Object} 检查结果 { canEnhance: boolean, reason?: string, cost?: number }
   */
  canEnhance(equipment, player) {
    if (!equipment) {
      return { canEnhance: false, reason: 'invalid_equipment' };
    }

    const currentLevel = equipment.enhanceLevel || 0;
    if (currentLevel >= this.maxEnhanceLevel) {
      return { canEnhance: false, reason: 'max_level_reached' };
    }

    const cost = this.calculateEnhanceCost(equipment);
    if (player.currency < cost) {
      return { canEnhance: false, reason: 'insufficient_currency', cost };
    }

    return { canEnhance: true, cost };
  }

  /**
   * 预览强化后的属性
   * @param {Object} equipment - 装备对象
   * @returns {Object} 预览属性
   */
  previewEnhancedAttributes(equipment) {
    const currentLevel = equipment.enhanceLevel || 0;
    const nextLevel = currentLevel + 1;

    if (nextLevel > this.maxEnhanceLevel) {
      return null;
    }

    // 计算下一级的加成倍率
    const bonusMultiplier = 1 + (nextLevel * this.enhanceBonusPerLevel);

    // 计算预览属性
    const baseAttributes = equipment.baseAttributes || equipment.attributes;
    const previewAttributes = {};

    for (const attr in baseAttributes) {
      previewAttributes[attr] = Math.floor(baseAttributes[attr] * bonusMultiplier);
    }

    return {
      currentLevel,
      nextLevel,
      currentAttributes: { ...equipment.attributes },
      previewAttributes,
      successRate: this.getEnhanceRate(currentLevel),
      cost: this.calculateEnhanceCost(equipment)
    };
  }

  /**
   * 重置装备强化等级（用于测试或特殊情况）
   * @param {Object} equipment - 装备对象
   */
  resetEnhancement(equipment) {
    if (equipment.baseAttributes) {
      equipment.attributes = { ...equipment.baseAttributes };
    }
    equipment.enhanceLevel = 0;
  }
}

export default EnhancementSystem;
