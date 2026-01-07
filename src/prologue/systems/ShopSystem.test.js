/**
 * 商店系统测试
 */

import { describe, it, expect, beforeEach } from 'vitest';
import { ShopSystem } from './ShopSystem.js';

describe('ShopSystem', () => {
  let shopSystem;
  let player;
  let testShop;

  beforeEach(() => {
    shopSystem = new ShopSystem();
    
    // 创建测试玩家
    player = {
      currency: 1000,
      items: []
    };

    // 创建测试商店数据
    testShop = {
      name: '测试商店',
      items: [
        {
          id: 'potion',
          name: '生命药水',
          type: 'consumable',
          price: 50,
          rarity: 'common',
          stock: 10
        },
        {
          id: 'sword',
          name: '铁剑',
          type: 'weapon',
          price: 200,
          rarity: 'uncommon',
          stock: 5
        },
        {
          id: 'armor',
          name: '皮甲',
          type: 'armor',
          price: 300,
          rarity: 'rare',
          stock: 3
        }
      ],
      priceModifier: 1.0,
      isOpen: true
    };

    // 注册测试商店
    shopSystem.registerShop('test_shop', testShop);
  });

  describe('商店注册', () => {
    it('应该能注册商店', () => {
      const result = shopSystem.registerShop('new_shop', {
        name: '新商店',
        items: []
      });
      
      expect(result).toBe(true);
      expect(shopSystem.getShop('new_shop')).toBeDefined();
    });

    it('应该拒绝无效的商店数据', () => {
      const result = shopSystem.registerShop(null, null);
      expect(result).toBe(false);
    });

    it('应该能获取所有商店', () => {
      shopSystem.registerShop('shop2', { name: '商店2', items: [] });
      const shops = shopSystem.getAllShops();
      
      expect(shops.length).toBeGreaterThanOrEqual(2);
    });
  });

  describe('购买功能', () => {
    it('应该能成功购买物品', () => {
      const result = shopSystem.buyItem(player, 'test_shop', 'potion', 1);
      
      expect(result.success).toBe(true);
      expect(result.totalCost).toBe(50);
      expect(player.currency).toBe(950);
      expect(player.items.length).toBe(1);
    });

    it('应该能购买多个物品', () => {
      const result = shopSystem.buyItem(player, 'test_shop', 'potion', 3);
      
      expect(result.success).toBe(true);
      expect(result.totalCost).toBe(150);
      expect(player.currency).toBe(850);
      expect(player.items.length).toBe(3);
    });

    it('应该在货币不足时失败', () => {
      player.currency = 30;
      const result = shopSystem.buyItem(player, 'test_shop', 'potion', 1);
      
      expect(result.success).toBe(false);
      expect(result.reason).toBe('insufficient_currency');
    });

    it('应该在库存不足时失败', () => {
      const result = shopSystem.buyItem(player, 'test_shop', 'potion', 20);
      
      expect(result.success).toBe(false);
      expect(result.reason).toBe('insufficient_stock');
    });

    it('应该在商店不存在时失败', () => {
      const result = shopSystem.buyItem(player, 'nonexistent', 'potion', 1);
      
      expect(result.success).toBe(false);
      expect(result.reason).toBe('shop_not_found');
    });

    it('应该在物品不存在时失败', () => {
      const result = shopSystem.buyItem(player, 'test_shop', 'nonexistent', 1);
      
      expect(result.success).toBe(false);
      expect(result.reason).toBe('item_not_found');
    });

    it('应该正确更新库存', () => {
      const shop = shopSystem.getShop('test_shop');
      const initialStock = shop.items.find(i => i.id === 'potion').stock;
      
      shopSystem.buyItem(player, 'test_shop', 'potion', 2);
      
      const newStock = shop.items.find(i => i.id === 'potion').stock;
      expect(newStock).toBe(initialStock - 2);
    });
  });

  describe('出售功能', () => {
    beforeEach(() => {
      // 给玩家添加一些物品
      player.items = [
        { id: 'potion', name: '生命药水', price: 50 },
        { id: 'potion', name: '生命药水', price: 50 },
        { id: 'sword', name: '铁剑', price: 200 }
      ];
    });

    it('应该能成功出售物品', () => {
      const initialCurrency = player.currency;
      const result = shopSystem.sellItem(player, 'test_shop', 'potion', 1);
      
      expect(result.success).toBe(true);
      expect(result.totalValue).toBe(25); // 50 * 0.5
      expect(player.currency).toBe(initialCurrency + 25);
      expect(player.items.length).toBe(2);
    });

    it('应该能出售多个物品', () => {
      const initialCurrency = player.currency;
      const result = shopSystem.sellItem(player, 'test_shop', 'potion', 2);
      
      expect(result.success).toBe(true);
      expect(result.totalValue).toBe(50); // 50 * 2 * 0.5
      expect(player.currency).toBe(initialCurrency + 50);
      expect(player.items.length).toBe(1);
    });

    it('应该在物品数量不足时失败', () => {
      const result = shopSystem.sellItem(player, 'test_shop', 'potion', 5);
      
      expect(result.success).toBe(false);
      expect(result.reason).toBe('insufficient_items');
    });

    it('应该在物品不存在时失败', () => {
      const result = shopSystem.sellItem(player, 'test_shop', 'nonexistent', 1);
      
      expect(result.success).toBe(false);
      expect(result.reason).toBe('insufficient_items');
    });
  });

  describe('价格计算', () => {
    it('应该正确计算购买价格', () => {
      const item = { price: 100 };
      const price = shopSystem.calculateBuyPrice(item, 3, 1.0);
      
      expect(price).toBe(300);
    });

    it('应该应用价格修正系数', () => {
      const item = { price: 100 };
      const price = shopSystem.calculateBuyPrice(item, 1, 1.5);
      
      expect(price).toBe(150);
    });

    it('应该正确计算出售价格', () => {
      const item = { price: 100 };
      const price = shopSystem.calculateSellPrice(item, 2);
      
      expect(price).toBe(100); // 100 * 2 * 0.5
    });
  });

  describe('商店管理', () => {
    it('应该能添加物品到商店', () => {
      const newItem = {
        id: 'new_item',
        name: '新物品',
        price: 100,
        stock: 5
      };
      
      const result = shopSystem.addItemToShop('test_shop', newItem);
      expect(result).toBe(true);
      
      const shop = shopSystem.getShop('test_shop');
      expect(shop.items.find(i => i.id === 'new_item')).toBeDefined();
    });

    it('应该能从商店移除物品', () => {
      const result = shopSystem.removeItemFromShop('test_shop', 'potion');
      expect(result).toBe(true);
      
      const shop = shopSystem.getShop('test_shop');
      expect(shop.items.find(i => i.id === 'potion')).toBeUndefined();
    });

    it('应该能更新物品库存', () => {
      const result = shopSystem.updateItemStock('test_shop', 'potion', 20);
      expect(result).toBe(true);
      
      const shop = shopSystem.getShop('test_shop');
      expect(shop.items.find(i => i.id === 'potion').stock).toBe(20);
    });

    it('应该能设置商店开放状态', () => {
      shopSystem.setShopOpen('test_shop', false);
      
      const shop = shopSystem.getShop('test_shop');
      expect(shop.isOpen).toBe(false);
      
      // 关闭的商店不能购买
      const result = shopSystem.buyItem(player, 'test_shop', 'potion', 1);
      expect(result.success).toBe(false);
      expect(result.reason).toBe('shop_closed');
    });
  });

  describe('交易历史', () => {
    it('应该记录购买交易', () => {
      shopSystem.buyItem(player, 'test_shop', 'potion', 1);
      
      const history = shopSystem.getTransactionHistory();
      expect(history.length).toBeGreaterThan(0);
      expect(history[history.length - 1].type).toBe('buy');
    });

    it('应该记录出售交易', () => {
      player.items = [{ id: 'potion', name: '生命药水', price: 50 }];
      shopSystem.sellItem(player, 'test_shop', 'potion', 1);
      
      const history = shopSystem.getTransactionHistory();
      expect(history.length).toBeGreaterThan(0);
      expect(history[history.length - 1].type).toBe('sell');
    });

    it('应该能清除交易历史', () => {
      shopSystem.buyItem(player, 'test_shop', 'potion', 1);
      shopSystem.clearTransactionHistory();
      
      const history = shopSystem.getTransactionHistory();
      expect(history.length).toBe(0);
    });
  });

  describe('物品过滤', () => {
    it('应该能按类型过滤物品', () => {
      const items = shopSystem.getShopItems('test_shop', { type: 'weapon' });
      
      expect(items.length).toBe(1);
      expect(items[0].id).toBe('sword');
    });

    it('应该能按品质过滤物品', () => {
      const items = shopSystem.getShopItems('test_shop', { rarity: 'rare' });
      
      expect(items.length).toBe(1);
      expect(items[0].id).toBe('armor');
    });

    it('应该能按价格范围过滤物品', () => {
      const items = shopSystem.getShopItems('test_shop', { 
        minPrice: 100, 
        maxPrice: 250 
      });
      
      expect(items.length).toBe(1);
      expect(items[0].id).toBe('sword');
    });

    it('应该能过滤有库存的物品', () => {
      const shop = shopSystem.getShop('test_shop');
      shop.items[0].stock = 0; // 设置第一个物品无库存
      
      const items = shopSystem.getShopItems('test_shop', { inStock: true });
      
      expect(items.length).toBe(2);
    });
  });

  describe('辅助功能', () => {
    it('应该能检查是否可以购买', () => {
      const result = shopSystem.canBuy(player, 'test_shop', 'potion', 1);
      
      expect(result.canBuy).toBe(true);
      expect(result.cost).toBe(50);
    });

    it('应该能批量购买物品', () => {
      const purchases = [
        { itemId: 'potion', quantity: 2 },
        { itemId: 'sword', quantity: 1 }
      ];
      
      const result = shopSystem.buyMultiple(player, 'test_shop', purchases);
      
      expect(result.success).toBe(true);
      expect(result.successCount).toBe(2);
      expect(result.totalCost).toBe(300); // 50*2 + 200
    });
  });

  describe('边界情况', () => {
    it('应该处理无效的购买数量', () => {
      const result = shopSystem.buyItem(player, 'test_shop', 'potion', 0);
      
      expect(result.success).toBe(false);
      expect(result.reason).toBe('invalid_quantity');
    });

    it('应该处理负数购买数量', () => {
      const result = shopSystem.buyItem(player, 'test_shop', 'potion', -1);
      
      expect(result.success).toBe(false);
      expect(result.reason).toBe('invalid_quantity');
    });

    it('应该处理没有价格的物品', () => {
      const item = { id: 'free_item', name: '免费物品' };
      const price = shopSystem.calculateBuyPrice(item, 1, 1.0);
      
      expect(price).toBe(0);
    });
  });
});
