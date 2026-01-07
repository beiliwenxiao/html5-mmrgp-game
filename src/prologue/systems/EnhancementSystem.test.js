/**
 * 装备强化系统测试
 */

import { describe, it, expect, beforeEach } from 'vitest';
import { EnhancementSystem } from './EnhancementSystem.js';

describe('EnhancementSystem', () => {
  let enhancementSystem;
  let player;
  let equipment;

  beforeEach(() => {
    enhancementSystem = new EnhancementSystem();
    
    // 创建测试玩家
    player = {
      currency: 10000
    };

    // 创建测试装备
    equipment = {
      id: 'test_sword',
      name: '测试剑',
      type: 'weapon',
      rarity: 'common',
      enhanceLevel: 0,
      attributes: {
        attack: 10,
        defense: 5
      }
    };
  });

  describe('强化功能', () => {
    it('应该能够成功强化装备', () => {
      const result = enhancementSystem.enhanceEquipment(equipment, player);
      
      // +0 -> +1 成功率100%，应该成功
      expect(result.success).toBe(true);
      expect(equipment.enhanceLevel).toBe(1);
      expect(result.newLevel).toBe(1);
    });

    it('应该正确扣除货币', () => {
      const initialCurrency = player.currency;
      const result = enhancementSystem.enhanceEquipment(equipment, player);
      
      expect(player.currency).toBeLessThan(initialCurrency);
      expect(player.currency).toBe(initialCurrency - result.cost);
    });

    it('应该在货币不足时失败', () => {
      player.currency = 10; // 不足以强化
      const result = enhancementSystem.enhanceEquipment(equipment, player);
      
      expect(result.success).toBe(false);
      expect(result.reason).toBe('insufficient_currency');
    });

    it('应该在达到最大等级时失败', () => {
      equipment.enhanceLevel = 10; // 最大等级
      const result = enhancementSystem.enhanceEquipment(equipment, player);
      
      expect(result.success).toBe(false);
      expect(result.reason).toBe('max_level_reached');
    });

    it('应该正确应用属性加成', () => {
      const originalAttack = equipment.attributes.attack;
      
      // 强化到+1
      enhancementSystem.enhanceEquipment(equipment, player);
      
      // +1应该增加10%属性
      const expectedAttack = Math.floor(originalAttack * 1.1);
      expect(equipment.attributes.attack).toBe(expectedAttack);
    });

    it('应该保存基础属性', () => {
      const originalAttack = equipment.attributes.attack;
      
      enhancementSystem.enhanceEquipment(equipment, player);
      
      expect(equipment.baseAttributes).toBeDefined();
      expect(equipment.baseAttributes.attack).toBe(originalAttack);
    });
  });

  describe('拆解功能', () => {
    it('应该能够拆解装备并返还货币', () => {
      const result = enhancementSystem.dismantleEquipment(equipment);
      
      expect(result.success).toBe(true);
      expect(result.currency).toBeGreaterThan(0);
    });

    it('应该根据品质返还不同比例的货币', () => {
      const commonEquipment = { ...equipment, rarity: 'common' };
      const rareEquipment = { ...equipment, rarity: 'rare' };
      
      const commonResult = enhancementSystem.dismantleEquipment(commonEquipment);
      const rareResult = enhancementSystem.dismantleEquipment(rareEquipment);
      
      // 稀有装备应该返还更多货币
      expect(rareResult.currency).toBeGreaterThan(commonResult.currency);
    });

    it('应该根据强化等级增加返还价值', () => {
      const level0Equipment = { ...equipment, enhanceLevel: 0 };
      const level5Equipment = { ...equipment, enhanceLevel: 5 };
      
      const result0 = enhancementSystem.dismantleEquipment(level0Equipment);
      const result5 = enhancementSystem.dismantleEquipment(level5Equipment);
      
      // +5装备应该返还更多货币
      expect(result5.currency).toBeGreaterThan(result0.currency);
    });

    it('应该处理无效装备', () => {
      const result = enhancementSystem.dismantleEquipment(null);
      
      expect(result.success).toBe(false);
      expect(result.reason).toBe('invalid_equipment');
      expect(result.currency).toBe(0);
    });
  });

  describe('消耗计算', () => {
    it('应该根据等级增加强化消耗', () => {
      const cost0 = enhancementSystem.calculateEnhanceCost({ ...equipment, enhanceLevel: 0 });
      const cost5 = enhancementSystem.calculateEnhanceCost({ ...equipment, enhanceLevel: 5 });
      
      expect(cost5).toBeGreaterThan(cost0);
    });

    it('应该根据品质调整强化消耗', () => {
      const commonCost = enhancementSystem.calculateEnhanceCost({ 
        ...equipment, 
        rarity: 'common',
        enhanceLevel: 0 
      });
      const rareCost = enhancementSystem.calculateEnhanceCost({ 
        ...equipment, 
        rarity: 'rare',
        enhanceLevel: 0 
      });
      
      expect(rareCost).toBeGreaterThan(commonCost);
    });
  });

  describe('成功率', () => {
    it('应该返回正确的成功率', () => {
      expect(enhancementSystem.getEnhanceRate(0)).toBe(1.0);  // 100%
      expect(enhancementSystem.getEnhanceRate(5)).toBe(0.5);  // 50%
      expect(enhancementSystem.getEnhanceRate(9)).toBe(0.1);  // 10%
    });

    it('应该为超出范围的等级返回默认成功率', () => {
      expect(enhancementSystem.getEnhanceRate(99)).toBe(0.1);
    });
  });

  describe('辅助功能', () => {
    it('应该正确检查是否可以强化', () => {
      const result = enhancementSystem.canEnhance(equipment, player);
      
      expect(result.canEnhance).toBe(true);
      expect(result.cost).toBeGreaterThan(0);
    });

    it('应该正确预览强化后的属性', () => {
      const preview = enhancementSystem.previewEnhancedAttributes(equipment);
      
      expect(preview).toBeDefined();
      expect(preview.currentLevel).toBe(0);
      expect(preview.nextLevel).toBe(1);
      expect(preview.previewAttributes.attack).toBeGreaterThan(equipment.attributes.attack);
    });

    it('应该在最大等级时返回null预览', () => {
      equipment.enhanceLevel = 10;
      const preview = enhancementSystem.previewEnhancedAttributes(equipment);
      
      expect(preview).toBeNull();
    });

    it('应该正确生成强化等级文本', () => {
      expect(enhancementSystem.getEnhanceLevelText(0)).toBe('');
      expect(enhancementSystem.getEnhanceLevelText(5)).toBe('+5');
      expect(enhancementSystem.getEnhanceLevelText(10)).toBe('+10');
    });

    it('应该能够重置装备强化', () => {
      // 先强化装备
      enhancementSystem.enhanceEquipment(equipment, player);
      expect(equipment.enhanceLevel).toBe(1);
      
      // 重置
      enhancementSystem.resetEnhancement(equipment);
      expect(equipment.enhanceLevel).toBe(0);
    });
  });

  describe('边界情况', () => {
    it('应该处理没有属性的装备', () => {
      const noAttrEquipment = {
        id: 'test',
        name: '测试',
        rarity: 'common',
        enhanceLevel: 0
      };
      
      const result = enhancementSystem.enhanceEquipment(noAttrEquipment, player);
      // 应该能处理，即使没有属性
      expect(result).toBeDefined();
    });

    it('应该处理负货币情况', () => {
      player.currency = -100;
      const result = enhancementSystem.enhanceEquipment(equipment, player);
      
      expect(result.success).toBe(false);
      expect(result.reason).toBe('insufficient_currency');
    });

    it('应该处理未知品质', () => {
      equipment.rarity = 'unknown';
      const value = enhancementSystem.getBaseValue(equipment.rarity);
      
      // 应该返回默认值（common的值）
      expect(value).toBe(100);
    });
  });
});
