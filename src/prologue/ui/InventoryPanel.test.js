/**
 * 背包面板单元测试
 */

import { describe, it, test, expect, beforeEach, vi } from 'vitest';
import { InventoryPanel } from './InventoryPanel.js';
import { InventorySystem } from '../systems/InventorySystem.js';

describe('InventoryPanel', () => {
  let inventorySystem;
  let inventoryPanel;
  let mockCanvas;
  let mockCtx;

  beforeEach(() => {
    // 创建背包系统
    inventorySystem = new InventorySystem(30);

    // 创建模拟Canvas上下文
    mockCtx = {
      save: vi.fn(),
      restore: vi.fn(),
      fillRect: vi.fn(),
      strokeRect: vi.fn(),
      fillText: vi.fn(),
      measureText: vi.fn(() => ({ width: 50 })),
      beginPath: vi.fn(),
      moveTo: vi.fn(),
      lineTo: vi.fn(),
      stroke: vi.fn(),
      set fillStyle(value) {},
      set strokeStyle(value) {},
      set lineWidth(value) {},
      set font(value) {},
      set textAlign(value) {},
      set textBaseline(value) {},
      set globalAlpha(value) {}
    };

    // 创建背包面板
    inventoryPanel = new InventoryPanel({
      x: 50,
      y: 50,
      width: 600,
      height: 500,
      inventorySystem: inventorySystem,
      visible: true
    });
  });

  describe('构造函数', () => {
    test('应该创建背包面板实例', () => {
      expect(inventoryPanel).toBeDefined();
      expect(inventoryPanel.inventorySystem).toBe(inventorySystem);
      expect(inventoryPanel.visible).toBe(true);
    });

    test('应该设置默认配置', () => {
      const defaultPanel = new InventoryPanel({});
      expect(defaultPanel.x).toBe(50);
      expect(defaultPanel.y).toBe(50);
      expect(defaultPanel.width).toBe(600);
      expect(defaultPanel.height).toBe(500);
      expect(defaultPanel.visible).toBe(false);
    });

    test('应该初始化网格配置', () => {
      expect(inventoryPanel.gridCols).toBe(8);
      expect(inventoryPanel.gridRows).toBe(5);
      expect(inventoryPanel.slotSize).toBe(60);
    });
  });

  describe('setPlayer', () => {
    test('应该设置玩家对象', () => {
      const player = { id: 'player1', name: '测试玩家' };
      inventoryPanel.setPlayer(player);
      expect(inventoryPanel.player).toBe(player);
    });
  });

  describe('render', () => {
    test('应该在可见时渲染面板', () => {
      inventoryPanel.visible = true;
      inventoryPanel.render(mockCtx);
      
      expect(mockCtx.save).toHaveBeenCalled();
      expect(mockCtx.restore).toHaveBeenCalled();
      expect(mockCtx.fillRect).toHaveBeenCalled();
    });

    test('应该在不可见时跳过渲染', () => {
      inventoryPanel.visible = false;
      inventoryPanel.render(mockCtx);
      
      expect(mockCtx.save).not.toHaveBeenCalled();
    });
  });

  describe('getSlotAtPosition', () => {
    test('应该返回正确的槽位索引', () => {
      // 第一个槽位的位置
      const firstSlotX = inventoryPanel.x + inventoryPanel.gridStartX + 10;
      const firstSlotY = inventoryPanel.y + inventoryPanel.gridStartY + 40 + 10;
      
      const slotIndex = inventoryPanel.getSlotAtPosition(firstSlotX, firstSlotY);
      expect(slotIndex).toBe(0);
    });

    test('应该对无效位置返回null', () => {
      const slotIndex = inventoryPanel.getSlotAtPosition(0, 0);
      expect(slotIndex).toBeNull();
    });
  });

  describe('getFilteredItems', () => {
    beforeEach(() => {
      inventorySystem.addItem({ id: 'sword', name: '剑', type: 'equipment' });
      inventorySystem.addItem({ id: 'potion', name: '药水', type: 'consumable' });
      inventorySystem.addItem({ id: 'wood', name: '木材', type: 'material' });
    });

    test('应该返回所有物品（筛选类型为all）', () => {
      inventoryPanel.filterType = 'all';
      const items = inventoryPanel.getFilteredItems();
      expect(items.length).toBe(3);
    });

    test('应该只返回装备类型物品', () => {
      inventoryPanel.filterType = 'equipment';
      const items = inventoryPanel.getFilteredItems();
      expect(items.length).toBe(1);
      expect(items[0].item.type).toBe('equipment');
    });

    test('应该只返回消耗品类型物品', () => {
      inventoryPanel.filterType = 'consumable';
      const items = inventoryPanel.getFilteredItems();
      expect(items.length).toBe(1);
      expect(items[0].item.type).toBe('consumable');
    });
  });

  describe('handleMouseMove', () => {
    test('应该更新悬停槽位', () => {
      const x = inventoryPanel.x + inventoryPanel.gridStartX + 10;
      const y = inventoryPanel.y + inventoryPanel.gridStartY + 40 + 10;
      
      inventoryPanel.handleMouseMove(x, y);
      expect(inventoryPanel.hoveredSlot).toBe(0);
    });

    test('应该在鼠标移出时清除悬停状态', () => {
      inventoryPanel.hoveredSlot = 0;
      inventoryPanel.handleMouseMove(0, 0);
      expect(inventoryPanel.hoveredSlot).toBeNull();
    });

    test('应该在拖拽时更新拖拽位置', () => {
      inventoryPanel.draggedSlot = 0;
      inventoryPanel.handleMouseMove(100, 100);
      
      expect(inventoryPanel.dragCurrentPos).toEqual({ x: 100, y: 100 });
    });
  });

  describe('handleMouseDown', () => {
    beforeEach(() => {
      inventorySystem.addItem({ id: 'item1', name: '物品1', type: 'equipment' });
    });

    test('应该开始拖拽物品（左键）', () => {
      const x = inventoryPanel.x + inventoryPanel.gridStartX + 10;
      const y = inventoryPanel.y + inventoryPanel.gridStartY + 40 + 10;
      
      const handled = inventoryPanel.handleMouseDown(x, y, 0);
      
      expect(handled).toBe(true);
      expect(inventoryPanel.draggedSlot).toBe(0);
      expect(inventoryPanel.selectedSlot).toBe(0);
    });

    test('应该触发物品操作（右键）', () => {
      const onItemEquip = vi.fn();
      inventoryPanel.onItemEquip = onItemEquip;
      
      const x = inventoryPanel.x + inventoryPanel.gridStartX + 10;
      const y = inventoryPanel.y + inventoryPanel.gridStartY + 40 + 10;
      
      inventoryPanel.handleMouseDown(x, y, 2);
      
      expect(onItemEquip).toHaveBeenCalled();
    });

    test('应该切换筛选类型', () => {
      inventoryPanel.filterType = 'all';
      
      // 点击装备筛选按钮
      const buttonX = inventoryPanel.x + inventoryPanel.gridStartX + 80;
      const buttonY = inventoryPanel.y + inventoryPanel.titleHeight + 15;
      
      inventoryPanel.handleMouseDown(buttonX, buttonY, 0);
      
      expect(inventoryPanel.filterType).toBe('equipment');
    });
  });

  describe('handleMouseUp', () => {
    beforeEach(() => {
      inventorySystem.addItem({ id: 'item1', name: '物品1', type: 'equipment' });
      inventorySystem.addItem({ id: 'item2', name: '物品2', type: 'consumable' });
    });

    test('应该交换物品槽位', () => {
      inventoryPanel.draggedSlot = 0;
      
      const targetX = inventoryPanel.x + inventoryPanel.gridStartX + 70;
      const targetY = inventoryPanel.y + inventoryPanel.gridStartY + 40 + 10;
      
      inventoryPanel.handleMouseUp(targetX, targetY);
      
      // 验证槽位已交换
      const slot0 = inventorySystem.getItemAtSlot(0);
      const slot1 = inventorySystem.getItemAtSlot(1);
      
      expect(slot0.item.id).toBe('item2');
      expect(slot1.item.id).toBe('item1');
    });

    test('应该重置拖拽状态', () => {
      inventoryPanel.draggedSlot = 0;
      inventoryPanel.dragStartPos = { x: 100, y: 100 };
      inventoryPanel.dragCurrentPos = { x: 150, y: 150 };
      
      inventoryPanel.handleMouseUp(200, 200);
      
      expect(inventoryPanel.draggedSlot).toBeNull();
      expect(inventoryPanel.dragStartPos).toBeNull();
      expect(inventoryPanel.dragCurrentPos).toBeNull();
    });
  });

  describe('toggle', () => {
    test('应该切换面板可见性', () => {
      inventoryPanel.visible = false;
      inventoryPanel.toggle();
      expect(inventoryPanel.visible).toBe(true);
      
      inventoryPanel.toggle();
      expect(inventoryPanel.visible).toBe(false);
    });

    test('应该在隐藏时重置状态', () => {
      inventoryPanel.hoveredSlot = 0;
      inventoryPanel.selectedSlot = 1;
      inventoryPanel.visible = true;
      
      inventoryPanel.toggle();
      
      expect(inventoryPanel.hoveredSlot).toBeNull();
      expect(inventoryPanel.selectedSlot).toBeNull();
    });
  });

  describe('show/hide', () => {
    test('show应该显示面板', () => {
      inventoryPanel.visible = false;
      inventoryPanel.show();
      expect(inventoryPanel.visible).toBe(true);
    });

    test('hide应该隐藏面板并重置状态', () => {
      inventoryPanel.visible = true;
      inventoryPanel.hoveredSlot = 0;
      
      inventoryPanel.hide();
      
      expect(inventoryPanel.visible).toBe(false);
      expect(inventoryPanel.hoveredSlot).toBeNull();
    });
  });

  describe('事件回调', () => {
    test('应该在使用消耗品时触发回调', () => {
      const onItemUse = vi.fn();
      inventoryPanel.onItemUse = onItemUse;
      
      const item = { id: 'potion', name: '药水', type: 'consumable' };
      inventorySystem.addItem(item);
      
      const slot = inventorySystem.getItemAtSlot(0);
      inventoryPanel.handleItemAction(slot);
      
      expect(onItemUse).toHaveBeenCalledWith(item);
    });

    test('应该在装备物品时触发回调', () => {
      const onItemEquip = vi.fn();
      inventoryPanel.onItemEquip = onItemEquip;
      inventoryPanel.equipmentSystem = {};
      
      const item = { id: 'sword', name: '剑', type: 'equipment' };
      inventorySystem.addItem(item);
      
      const slot = inventorySystem.getItemAtSlot(0);
      inventoryPanel.handleItemAction(slot);
      
      expect(onItemEquip).toHaveBeenCalledWith(item);
    });
  });
});
