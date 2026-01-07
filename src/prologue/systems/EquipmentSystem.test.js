/**
 * 装备系统单元测试
 * 
 * 测试装备系统的核心功能：
 * - 装备穿戴和卸下
 * - 属性计算
 * - 负属性处理
 * - 装备需求检查
 */

import { describe, it, expect, beforeEach } from 'vitest';
import { 
  Equipment, 
  EquipmentSystem, 
  EquipmentType, 
  EquipmentRarity,
  EquipmentSlot 
} from './EquipmentSystem.js';

describe('Equipment 类', () => {
  it('应该正确创建装备实例', () => {
    const equipment = new Equipment({
      id: 'sword_001',
      name: '铁剑',
      type: EquipmentType.WEAPON,
      rarity: EquipmentRarity.COMMON,
      level: 1,
      attributes: {
        attack: 10,
        defense: 0,
        health: 0,
        speed: 0
      },
      negativeAttributes: {
        durability: 0,
        weight: 0
      },
      requirements: {
        level: 1,
        class: null
      }
    });
    
    expect(equipment.id).toBe('sword_001');
    expect(equipment.name).toBe('铁剑');
    expect(equipment.type).toBe(EquipmentType.WEAPON);
    expect(equipment.attributes.attack).toBe(10);
  });
  
  it('应该正确显示强化等级', () => {
    const equipment = new Equipment({
      id: 'sword_001',
      name: '铁剑',
      type: EquipmentType.WEAPON,
      level: 1,
      attributes: { attack: 10 }
    });
    
    expect(equipment.getDisplayName()).toBe('铁剑');
    
    equipment.enhanceLevel = 3;
    expect(equipment.getDisplayName()).toBe('铁剑 +3');
  });
  
  it('应该正确检查装备需求', () => {
    const equipment = new Equipment({
      id: 'sword_001',
      name: '高级铁剑',
      type: EquipmentType.WEAPON,
      level: 1,
      attributes: { attack: 20 },
      requirements: {
        level: 5,
        class: 'warrior'
      }
    });
    
    const lowLevelPlayer = { level: 3, class: 'warrior' };
    expect(equipment.canEquip(lowLevelPlayer)).toBe(false);
    
    const wrongClassPlayer = { level: 10, class: 'mage' };
    expect(equipment.canEquip(wrongClassPlayer)).toBe(false);
    
    const validPlayer = { level: 10, class: 'warrior' };
    expect(equipment.canEquip(validPlayer)).toBe(true);
  });
  
  it('应该正确克隆装备', () => {
    const original = new Equipment({
      id: 'sword_001',
      name: '铁剑',
      type: EquipmentType.WEAPON,
      level: 1,
      attributes: { attack: 10 }
    });
    
    const cloned = original.clone();
    
    expect(cloned.id).toBe(original.id);
    expect(cloned.name).toBe(original.name);
    expect(cloned).not.toBe(original); // 不是同一个对象
  });
});

describe('EquipmentSystem 类', () => {
  let equipmentSystem;
  let player;
  let weapon;
  let armor;
  
  beforeEach(() => {
    equipmentSystem = new EquipmentSystem();
    
    player = {
      level: 10,
      class: 'warrior',
      attack: 10,
      defense: 5,
      health: 100,
      maxHealth: 100,
      speed: 100
    };
    
    weapon = new Equipment({
      id: 'sword_001',
      name: '铁剑',
      type: EquipmentType.WEAPON,
      level: 1,
      attributes: {
        attack: 15,
        defense: 0,
        health: 0,
        speed: 0
      }
    });
    
    armor = new Equipment({
      id: 'armor_001',
      name: '布甲',
      type: EquipmentType.ARMOR,
      level: 1,
      attributes: {
        attack: 0,
        defense: 10,
        health: 20,
        speed: 0
      }
    });
  });
  
  describe('装备穿戴', () => {
    it('应该成功装备武器', () => {
      const result = equipmentSystem.equipItem(player, weapon, EquipmentSlot.WEAPON);
      
      expect(result.success).toBe(true);
      expect(equipmentSystem.getEquipment(EquipmentSlot.WEAPON)).toBe(weapon);
    });
    
    it('应该拒绝类型不匹配的装备', () => {
      const result = equipmentSystem.equipItem(player, weapon, EquipmentSlot.ARMOR);
      
      expect(result.success).toBe(false);
      expect(result.reason).toBe('slot_mismatch');
    });
    
    it('应该拒绝不满足需求的装备', () => {
      const highLevelWeapon = new Equipment({
        id: 'sword_002',
        name: '神剑',
        type: EquipmentType.WEAPON,
        level: 1,
        attributes: { attack: 50 },
        requirements: { level: 20 }
      });
      
      const result = equipmentSystem.equipItem(player, highLevelWeapon, EquipmentSlot.WEAPON);
      
      expect(result.success).toBe(false);
      expect(result.reason).toBe('requirements_not_met');
    });
    
    it('装备新物品时应该自动卸下旧物品', () => {
      // 先装备第一把武器
      equipmentSystem.equipItem(player, weapon, EquipmentSlot.WEAPON);
      
      // 装备第二把武器
      const weapon2 = new Equipment({
        id: 'sword_002',
        name: '钢剑',
        type: EquipmentType.WEAPON,
        level: 1,
        attributes: { attack: 20 }
      });
      
      const result = equipmentSystem.equipItem(player, weapon2, EquipmentSlot.WEAPON);
      
      expect(result.success).toBe(true);
      expect(result.unequipped).toBe(weapon);
      expect(equipmentSystem.getEquipment(EquipmentSlot.WEAPON)).toBe(weapon2);
    });
  });
  
  describe('装备卸下', () => {
    it('应该成功卸下装备', () => {
      equipmentSystem.equipItem(player, weapon, EquipmentSlot.WEAPON);
      
      const result = equipmentSystem.unequipItem(player, EquipmentSlot.WEAPON);
      
      expect(result.success).toBe(true);
      expect(result.equipment).toBe(weapon);
      expect(equipmentSystem.getEquipment(EquipmentSlot.WEAPON)).toBe(null);
    });
    
    it('卸下空槽位应该失败', () => {
      const result = equipmentSystem.unequipItem(player, EquipmentSlot.WEAPON);
      
      expect(result.success).toBe(false);
      expect(result.reason).toBe('slot_empty');
    });
  });
  
  describe('属性计算', () => {
    it('应该正确计算装备属性加成', () => {
      equipmentSystem.equipItem(player, weapon, EquipmentSlot.WEAPON);
      equipmentSystem.equipItem(player, armor, EquipmentSlot.ARMOR);
      
      const totalAttributes = equipmentSystem.calculateTotalAttributes();
      
      expect(totalAttributes.attack).toBe(15);
      expect(totalAttributes.defense).toBe(10);
      expect(totalAttributes.health).toBe(20);
    });
    
    it('装备后应该更新玩家属性', () => {
      const initialAttack = player.attack;
      const initialDefense = player.defense;
      
      equipmentSystem.equipItem(player, weapon, EquipmentSlot.WEAPON);
      equipmentSystem.equipItem(player, armor, EquipmentSlot.ARMOR);
      
      expect(player.attack).toBe(initialAttack + 15);
      expect(player.defense).toBe(initialDefense + 10);
      expect(player.maxHealth).toBe(100 + 20);
    });
    
    it('卸下装备后应该恢复玩家属性', () => {
      const initialAttack = player.attack;
      
      equipmentSystem.equipItem(player, weapon, EquipmentSlot.WEAPON);
      expect(player.attack).toBe(initialAttack + 15);
      
      equipmentSystem.unequipItem(player, EquipmentSlot.WEAPON);
      expect(player.attack).toBe(initialAttack);
    });
  });
  
  describe('负属性处理', () => {
    it('应该正确计算负属性', () => {
      const coinSword = new Equipment({
        id: 'coin_sword',
        name: '铜钱剑',
        type: EquipmentType.WEAPON,
        level: 1,
        attributes: { attack: 5 },
        negativeAttributes: {
          durability: -10,
          weight: 5
        }
      });
      
      equipmentSystem.equipItem(player, coinSword, EquipmentSlot.WEAPON);
      
      const negativeAttributes = equipmentSystem.calculateTotalNegativeAttributes();
      
      expect(negativeAttributes.durability).toBe(-10);
      expect(negativeAttributes.weight).toBe(5);
      expect(player.durabilityPenalty).toBe(-10);
      expect(player.weightPenalty).toBe(5);
    });
  });
  
  describe('装备管理', () => {
    it('应该正确获取所有装备', () => {
      equipmentSystem.equipItem(player, weapon, EquipmentSlot.WEAPON);
      equipmentSystem.equipItem(player, armor, EquipmentSlot.ARMOR);
      
      const allEquipment = equipmentSystem.getAllEquipment();
      
      expect(allEquipment.weapon).toBe(weapon);
      expect(allEquipment.armor).toBe(armor);
      expect(allEquipment.accessory).toBe(null);
    });
    
    it('应该正确检查槽位是否为空', () => {
      expect(equipmentSystem.isSlotEmpty(EquipmentSlot.WEAPON)).toBe(true);
      
      equipmentSystem.equipItem(player, weapon, EquipmentSlot.WEAPON);
      
      expect(equipmentSystem.isSlotEmpty(EquipmentSlot.WEAPON)).toBe(false);
    });
    
    it('应该能清空所有装备', () => {
      equipmentSystem.equipItem(player, weapon, EquipmentSlot.WEAPON);
      equipmentSystem.equipItem(player, armor, EquipmentSlot.ARMOR);
      
      equipmentSystem.clearAllEquipment(player);
      
      expect(equipmentSystem.isSlotEmpty(EquipmentSlot.WEAPON)).toBe(true);
      expect(equipmentSystem.isSlotEmpty(EquipmentSlot.ARMOR)).toBe(true);
    });
  });
  
  describe('事件系统', () => {
    it('装备时应该触发 onEquip 事件', () => {
      let eventTriggered = false;
      let eventData = null;
      
      equipmentSystem.on('onEquip', (data) => {
        eventTriggered = true;
        eventData = data;
      });
      
      equipmentSystem.equipItem(player, weapon, EquipmentSlot.WEAPON);
      
      expect(eventTriggered).toBe(true);
      expect(eventData.equipment).toBe(weapon);
      expect(eventData.slot).toBe(EquipmentSlot.WEAPON);
    });
    
    it('卸下时应该触发 onUnequip 事件', () => {
      let eventTriggered = false;
      
      equipmentSystem.on('onUnequip', () => {
        eventTriggered = true;
      });
      
      equipmentSystem.equipItem(player, weapon, EquipmentSlot.WEAPON);
      equipmentSystem.unequipItem(player, EquipmentSlot.WEAPON);
      
      expect(eventTriggered).toBe(true);
    });
    
    it('属性变化时应该触发 onAttributeChange 事件', () => {
      let eventTriggered = false;
      
      equipmentSystem.on('onAttributeChange', () => {
        eventTriggered = true;
      });
      
      equipmentSystem.equipItem(player, weapon, EquipmentSlot.WEAPON);
      
      expect(eventTriggered).toBe(true);
    });
  });
  
  describe('序列化和反序列化', () => {
    it('应该正确序列化装备系统状态', () => {
      equipmentSystem.equipItem(player, weapon, EquipmentSlot.WEAPON);
      weapon.enhanceLevel = 3;
      
      const serialized = equipmentSystem.serialize();
      
      expect(serialized.slots.weapon.id).toBe('sword_001');
      expect(serialized.slots.weapon.enhanceLevel).toBe(3);
    });
    
    it('应该正确反序列化装备系统状态', () => {
      const serialized = {
        slots: {
          weapon: { id: 'sword_001', enhanceLevel: 2 },
          armor: null,
          accessory: null
        }
      };
      
      const equipmentFactory = (id) => {
        if (id === 'sword_001') {
          return weapon;
        }
        return null;
      };
      
      equipmentSystem.deserialize(serialized, equipmentFactory);
      
      const equippedWeapon = equipmentSystem.getEquipment(EquipmentSlot.WEAPON);
      expect(equippedWeapon).toBe(weapon);
      expect(equippedWeapon.enhanceLevel).toBe(2);
    });
  });
});
