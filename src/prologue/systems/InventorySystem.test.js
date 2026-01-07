/**
 * 背包系统单元测试
 */

import { describe, it, test, expect, beforeEach, vi } from 'vitest';
import { InventorySystem } from './InventorySystem.js';

describe('InventorySystem', () => {
    let inventory;

    beforeEach(() => {
        inventory = new InventorySystem(10); // 10 个槽位的背包
    });

    describe('构造函数', () => {
        test('应该创建指定槽位数的背包', () => {
            expect(inventory.maxSlots).toBe(10);
            expect(inventory.items).toEqual([]);
        });

        test('应该使用默认槽位数 30', () => {
            const defaultInventory = new InventorySystem();
            expect(defaultInventory.maxSlots).toBe(30);
        });
    });

    describe('addItem', () => {
        test('应该能添加单个物品', () => {
            const item = { id: 'sword1', name: '木剑', type: 'equipment', stackable: false };
            const result = inventory.addItem(item);

            expect(result).toBe(true);
            expect(inventory.getUsedSlots()).toBe(1);
            expect(inventory.getItemCount('sword1')).toBe(1);
        });

        test('应该能添加可堆叠物品', () => {
            const item = { id: 'potion', name: '药水', type: 'consumable', stackable: true, maxStack: 99 };
            
            inventory.addItem(item, 5);
            expect(inventory.getItemCount('potion')).toBe(5);
            expect(inventory.getUsedSlots()).toBe(1);

            inventory.addItem(item, 3);
            expect(inventory.getItemCount('potion')).toBe(8);
            expect(inventory.getUsedSlots()).toBe(1); // 应该堆叠在同一个槽位
        });

        test('应该在达到最大堆叠数时创建新槽位', () => {
            const item = { id: 'coin', name: '铜钱', type: 'currency', stackable: true, maxStack: 10 };
            
            inventory.addItem(item, 15);
            expect(inventory.getItemCount('coin')).toBe(15);
            expect(inventory.getUsedSlots()).toBe(2); // 10 + 5
        });

        test('应该在背包满时拒绝添加', () => {
            // 填满背包
            for (let i = 0; i < 10; i++) {
                inventory.addItem({ id: `item${i}`, name: `物品${i}`, stackable: false });
            }

            const result = inventory.addItem({ id: 'extra', name: '额外物品', stackable: false });
            expect(result).toBe(false);
            expect(inventory.getUsedSlots()).toBe(10);
        });

        test('应该拒绝无效的物品或数量', () => {
            expect(inventory.addItem(null)).toBe(false);
            expect(inventory.addItem({ id: 'test' }, 0)).toBe(false);
            expect(inventory.addItem({ id: 'test' }, -1)).toBe(false);
        });
    });

    describe('removeItem', () => {
        beforeEach(() => {
            const item = { id: 'potion', name: '药水', type: 'consumable', stackable: true, maxStack: 99 };
            inventory.addItem(item, 10);
        });

        test('应该能移除指定数量的物品', () => {
            const result = inventory.removeItem('potion', 3);
            expect(result).toBe(true);
            expect(inventory.getItemCount('potion')).toBe(7);
        });

        test('应该在移除全部数量时删除槽位', () => {
            inventory.removeItem('potion', 10);
            expect(inventory.getItemCount('potion')).toBe(0);
            expect(inventory.getUsedSlots()).toBe(0);
        });

        test('应该在数量不足时返回 false', () => {
            const result = inventory.removeItem('potion', 20);
            expect(result).toBe(false);
            expect(inventory.getItemCount('potion')).toBe(10); // 数量不变
        });

        test('应该拒绝无效的物品 ID 或数量', () => {
            expect(inventory.removeItem(null)).toBe(false);
            expect(inventory.removeItem('potion', 0)).toBe(false);
            expect(inventory.removeItem('potion', -1)).toBe(false);
        });
    });

    describe('getItemCount', () => {
        test('应该返回物品的总数量', () => {
            const item = { id: 'arrow', name: '箭', stackable: true, maxStack: 50 };
            inventory.addItem(item, 30);
            inventory.addItem(item, 40); // 会分成两个槽位：50 + 20

            expect(inventory.getItemCount('arrow')).toBe(70);
        });

        test('应该对不存在的物品返回 0', () => {
            expect(inventory.getItemCount('nonexistent')).toBe(0);
        });
    });

    describe('hasItem', () => {
        beforeEach(() => {
            inventory.addItem({ id: 'key', name: '钥匙', stackable: false });
        });

        test('应该正确检查物品是否存在', () => {
            expect(inventory.hasItem('key')).toBe(true);
            expect(inventory.hasItem('key', 1)).toBe(true);
            expect(inventory.hasItem('key', 2)).toBe(false);
            expect(inventory.hasItem('nonexistent')).toBe(false);
        });
    });

    describe('getItemAtSlot', () => {
        beforeEach(() => {
            inventory.addItem({ id: 'item1', name: '物品1' });
            inventory.addItem({ id: 'item2', name: '物品2' });
        });

        test('应该返回指定槽位的物品', () => {
            const slot = inventory.getItemAtSlot(0);
            expect(slot).not.toBeNull();
            expect(slot.item.id).toBe('item1');
        });

        test('应该对无效索引返回 null', () => {
            expect(inventory.getItemAtSlot(-1)).toBeNull();
            expect(inventory.getItemAtSlot(10)).toBeNull();
        });
    });

    describe('getItemsByType', () => {
        beforeEach(() => {
            inventory.addItem({ id: 'sword', name: '剑', type: 'equipment' });
            inventory.addItem({ id: 'potion', name: '药水', type: 'consumable' });
            inventory.addItem({ id: 'shield', name: '盾', type: 'equipment' });
        });

        test('应该返回指定类型的所有物品', () => {
            const equipment = inventory.getItemsByType('equipment');
            expect(equipment.length).toBe(2);
            expect(equipment.every(slot => slot.item.type === 'equipment')).toBe(true);
        });
    });

    describe('swapSlots', () => {
        beforeEach(() => {
            inventory.addItem({ id: 'item1', name: '物品1' });
            inventory.addItem({ id: 'item2', name: '物品2' });
        });

        test('应该能交换两个槽位的物品', () => {
            const result = inventory.swapSlots(0, 1);
            expect(result).toBe(true);
            expect(inventory.getItemAtSlot(0).item.id).toBe('item2');
            expect(inventory.getItemAtSlot(1).item.id).toBe('item1');
        });

        test('应该拒绝无效的槽位索引', () => {
            expect(inventory.swapSlots(-1, 0)).toBe(false);
            expect(inventory.swapSlots(0, 10)).toBe(false);
        });
    });

    describe('clear', () => {
        test('应该清空背包', () => {
            inventory.addItem({ id: 'item1', name: '物品1' });
            inventory.addItem({ id: 'item2', name: '物品2' });

            inventory.clear();
            expect(inventory.getUsedSlots()).toBe(0);
            expect(inventory.getAllItems()).toEqual([]);
        });
    });

    describe('容量管理', () => {
        test('getUsedSlots 应该返回已使用的槽位数', () => {
            expect(inventory.getUsedSlots()).toBe(0);
            inventory.addItem({ id: 'item1', name: '物品1' });
            expect(inventory.getUsedSlots()).toBe(1);
        });

        test('getRemainingSlots 应该返回剩余槽位数', () => {
            expect(inventory.getRemainingSlots()).toBe(10);
            inventory.addItem({ id: 'item1', name: '物品1' });
            expect(inventory.getRemainingSlots()).toBe(9);
        });

        test('isFull 应该正确判断背包是否已满', () => {
            expect(inventory.isFull()).toBe(false);
            
            for (let i = 0; i < 10; i++) {
                inventory.addItem({ id: `item${i}`, name: `物品${i}` });
            }
            
            expect(inventory.isFull()).toBe(true);
        });
    });

    describe('监听器', () => {
        test('应该在添加物品时通知监听器', () => {
            const listener = jest.fn();
            inventory.addListener(listener);

            inventory.addItem({ id: 'item1', name: '物品1' });
            expect(listener).toHaveBeenCalledWith('itemAdded', expect.any(Object));
        });

        test('应该在移除物品时通知监听器', () => {
            inventory.addItem({ id: 'item1', name: '物品1' });
            
            const listener = jest.fn();
            inventory.addListener(listener);

            inventory.removeItem('item1');
            expect(listener).toHaveBeenCalledWith('itemRemoved', expect.any(Object));
        });

        test('应该能移除监听器', () => {
            const listener = jest.fn();
            inventory.addListener(listener);
            inventory.removeListener(listener);

            inventory.addItem({ id: 'item1', name: '物品1' });
            expect(listener).not.toHaveBeenCalled();
        });
    });

    describe('序列化和反序列化', () => {
        test('应该能序列化背包数据', () => {
            inventory.addItem({ id: 'item1', name: '物品1' }, 5);
            inventory.addItem({ id: 'item2', name: '物品2' }, 3);

            const data = inventory.serialize();
            expect(data.maxSlots).toBe(10);
            expect(data.items.length).toBe(2);
            expect(data.items[0].quantity).toBe(5);
        });

        test('应该能从序列化数据恢复背包', () => {
            const data = {
                maxSlots: 20,
                items: [
                    { item: { id: 'item1', name: '物品1' }, quantity: 5 },
                    { item: { id: 'item2', name: '物品2' }, quantity: 3 }
                ]
            };

            inventory.deserialize(data);
            expect(inventory.maxSlots).toBe(20);
            expect(inventory.getUsedSlots()).toBe(2);
            expect(inventory.getItemCount('item1')).toBe(5);
            expect(inventory.getItemCount('item2')).toBe(3);
        });
    });
});
