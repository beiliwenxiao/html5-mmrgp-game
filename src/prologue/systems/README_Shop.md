# 商店系统 (ShopSystem)

## 概述

商店系统负责管理游戏中的商店交易，包括物品购买、出售、价格计算和库存管理。是序章中第三幕"铜钱法器"的重要组成部分。

## 功能特性

### 1. 商店管理
- 注册和管理多个商店
- 商店开放状态控制
- 物品库存管理
- 价格修正系数

### 2. 购买系统
- 单个/批量购买物品
- 货币检查和扣除
- 库存检查和更新
- 背包空间检查

### 3. 出售系统
- 出售背包物品
- 价格计算（默认50%回收）
- 物品数量验证

### 4. 交易记录
- 记录所有交易历史
- 支持查询历史记录
- 自动限制记录数量

## 使用示例

```javascript
import { ShopSystem } from './ShopSystem.js';

// 创建系统实例
const shopSystem = new ShopSystem();

// 注册商店
shopSystem.registerShop('weapon_shop', {
  name: '武器商店',
  items: [
    {
      id: 'iron_sword',
      name: '铁剑',
      type: 'weapon',
      price: 200,
      rarity: 'common',
      stock: 10
    }
  ],
  priceModifier: 1.0,
  isOpen: true
});

// 创建玩家
const player = {
  currency: 1000,
  items: []
};

// 购买物品
const buyResult = shopSystem.buyItem(player, 'weapon_shop', 'iron_sword', 1);
if (buyResult.success) {
  console.log(`购买成功！消耗：${buyResult.totalCost}铜钱`);
}

// 出售物品
const sellResult = shopSystem.sellItem(player, 'weapon_shop', 'iron_sword', 1);
if (sellResult.success) {
  console.log(`出售成功！获得：${sellResult.totalValue}铜钱`);
}
```

## API 文档

### 构造函数

```javascript
new ShopSystem()
```

创建商店系统实例。

### 商店管理方法

#### registerShop(shopId, shopData)

注册商店。

**参数：**
- `shopId` (string): 商店ID
- `shopData` (Object): 商店数据
  - `name` (string): 商店名称
  - `items` (Array): 物品列表
  - `priceModifier` (number): 价格修正系数（默认1.0）
  - `description` (string): 商店描述
  - `npcId` (string): 关联的NPC ID
  - `isOpen` (boolean): 是否开放（默认true）

**返回值：**
- `boolean`: 是否注册成功

#### getShop(shopId)

获取商店信息。

**参数：**
- `shopId` (string): 商店ID

**返回值：**
- `Object|null`: 商店信息

#### getAllShops()

获取所有商店。

**返回值：**
- `Array`: 商店列表

### 交易方法

#### buyItem(player, shopId, itemId, quantity)

购买物品。

**参数：**
- `player` (Object): 玩家对象
  - `currency` (number): 玩家货币
  - `items` (Array): 玩家物品数组
  - `inventory` (Object): 背包系统（可选）
- `shopId` (string): 商店ID
- `itemId` (string): 物品ID
- `quantity` (number): 购买数量（默认1）

**返回值：**
```javascript
{
  success: boolean,           // 是否成功
  itemName?: string,          // 物品名称
  quantity?: number,          // 购买数量
  totalCost?: number,         // 总消耗
  remainingCurrency?: number, // 剩余货币
  reason?: string,            // 失败原因
  message?: string            // 提示信息
}
```

**失败原因：**
- `invalid_parameters`: 无效的参数
- `invalid_quantity`: 无效的数量
- `shop_not_found`: 商店不存在
- `shop_closed`: 商店未开放
- `item_not_found`: 物品不存在
- `insufficient_stock`: 库存不足
- `insufficient_currency`: 货币不足
- `inventory_full`: 背包已满

#### sellItem(player, shopId, itemId, quantity)

出售物品。

**参数：**
- `player` (Object): 玩家对象
- `shopId` (string): 商店ID
- `itemId` (string): 物品ID
- `quantity` (number): 出售数量（默认1）

**返回值：**
```javascript
{
  success: boolean,           // 是否成功
  itemName?: string,          // 物品名称
  quantity?: number,          // 出售数量
  totalValue?: number,        // 总价值
  remainingCurrency?: number, // 剩余货币
  reason?: string,            // 失败原因
  message?: string            // 提示信息
}
```

**失败原因：**
- `invalid_parameters`: 无效的参数
- `invalid_quantity`: 无效的数量
- `shop_not_found`: 商店不存在
- `shop_closed`: 商店未开放
- `insufficient_items`: 物品数量不足

### 价格计算方法

#### calculateBuyPrice(item, quantity, priceModifier)

计算购买价格。

**参数：**
- `item` (Object): 物品对象
- `quantity` (number): 数量（默认1）
- `priceModifier` (number): 价格修正系数（默认1.0）

**返回值：**
- `number`: 总价

#### calculateSellPrice(item, quantity)

计算出售价格。

**参数：**
- `item` (Object): 物品对象
- `quantity` (number): 数量（默认1）

**返回值：**
- `number`: 总价（默认为购买价的50%）

### 物品管理方法

#### addItemToShop(shopId, item)

添加物品到商店。

**参数：**
- `shopId` (string): 商店ID
- `item` (Object): 物品对象

**返回值：**
- `boolean`: 是否添加成功

#### removeItemFromShop(shopId, itemId)

从商店移除物品。

**参数：**
- `shopId` (string): 商店ID
- `itemId` (string): 物品ID

**返回值：**
- `boolean`: 是否移除成功

#### updateItemStock(shopId, itemId, stock)

更新物品库存。

**参数：**
- `shopId` (string): 商店ID
- `itemId` (string): 物品ID
- `stock` (number): 新库存数量

**返回值：**
- `boolean`: 是否更新成功

#### setShopOpen(shopId, isOpen)

设置商店开放状态。

**参数：**
- `shopId` (string): 商店ID
- `isOpen` (boolean): 是否开放

**返回值：**
- `boolean`: 是否设置成功

### 查询方法

#### getShopItems(shopId, filters)

获取商店物品列表（支持过滤）。

**参数：**
- `shopId` (string): 商店ID
- `filters` (Object): 过滤条件（可选）
  - `type` (string): 物品类型
  - `rarity` (string): 物品品质
  - `minPrice` (number): 最低价格
  - `maxPrice` (number): 最高价格
  - `inStock` (boolean): 是否有库存

**返回值：**
- `Array`: 过滤后的物品列表

#### canBuy(player, shopId, itemId, quantity)

检查是否可以购买。

**参数：**
- `player` (Object): 玩家对象
- `shopId` (string): 商店ID
- `itemId` (string): 物品ID
- `quantity` (number): 数量（默认1）

**返回值：**
```javascript
{
  canBuy: boolean,    // 是否可以购买
  cost?: number,      // 所需货币
  reason?: string     // 不能购买的原因
}
```

#### getTransactionHistory(limit)

获取交易历史。

**参数：**
- `limit` (number): 限制数量（默认10）

**返回值：**
- `Array`: 交易历史记录

### 批量操作方法

#### buyMultiple(player, shopId, purchases)

批量购买物品。

**参数：**
- `player` (Object): 玩家对象
- `shopId` (string): 商店ID
- `purchases` (Array): 购买列表
  - 每项格式：`{itemId: string, quantity: number}`

**返回值：**
```javascript
{
  success: boolean,      // 是否有成功的购买
  results: Array,        // 每项购买的结果
  totalCost: number,     // 总消耗
  successCount: number,  // 成功数量
  failCount: number      // 失败数量
}
```

## 配置参数

### 默认价格修正系数
```javascript
defaultPriceModifier = 1.0
```

### 出售价格比例
```javascript
sellPriceRatio = 0.5  // 50%回收价
```

### 最大交易历史记录数
```javascript
maxHistorySize = 100
```

## 物品数据结构

```javascript
{
  id: string,           // 物品ID
  name: string,         // 物品名称
  type: string,         // 物品类型（weapon/armor/consumable/accessory）
  price: number,        // 购买价格
  sellPrice?: number,   // 出售价格（可选，默认为price * sellPriceRatio）
  rarity: string,       // 品质（common/uncommon/rare/epic/legendary）
  stock?: number,       // 库存数量（可选，undefined表示无限）
  description?: string  // 物品描述
}
```

## 测试

### 单元测试
```bash
npm test src/prologue/systems/ShopSystem.test.js
```

### 浏览器测试
打开 `test/test-shop-system.html` 进行交互式测试。

## 集成示例

### 与UI集成

```javascript
// 在商店面板中使用
class ShopPanel {
  constructor(shopSystem) {
    this.shopSystem = shopSystem;
    this.currentShopId = null;
  }

  openShop(shopId, player) {
    this.currentShopId = shopId;
    const shop = this.shopSystem.getShop(shopId);
    
    if (!shop || !shop.isOpen) {
      this.showMessage('商店未开放');
      return;
    }

    this.displayShopItems(shop.items, player);
  }

  onBuyClick(player, itemId, quantity) {
    const result = this.shopSystem.buyItem(
      player, 
      this.currentShopId, 
      itemId, 
      quantity
    );

    if (result.success) {
      this.showSuccessMessage(`购买成功！消耗${result.totalCost}铜钱`);
      this.updateDisplay(player);
    } else {
      this.showErrorMessage(result.message);
    }
  }

  onSellClick(player, itemId, quantity) {
    const result = this.shopSystem.sellItem(
      player, 
      this.currentShopId, 
      itemId, 
      quantity
    );

    if (result.success) {
      this.showSuccessMessage(`出售成功！获得${result.totalValue}铜钱`);
      this.updateDisplay(player);
    } else {
      this.showErrorMessage(result.message);
    }
  }
}
```

### 与背包系统集成

```javascript
// 商店系统会自动检测并使用玩家的背包系统
const player = {
  currency: 1000,
  inventory: new InventorySystem(30)  // 30格背包
};

// 购买时会自动调用 inventory.addItem()
const result = shopSystem.buyItem(player, 'shop1', 'item1', 1);

// 出售时会自动调用 inventory.removeItem()
const sellResult = shopSystem.sellItem(player, 'shop1', 'item1', 1);
```

### 动态商店内容

```javascript
// 根据玩家等级动态调整商店物品
function updateShopForPlayer(shopSystem, shopId, player) {
  const shop = shopSystem.getShop(shopId);
  
  // 移除低级物品
  shop.items = shop.items.filter(item => {
    return item.requiredLevel === undefined || 
           item.requiredLevel <= player.level;
  });

  // 添加新物品
  if (player.level >= 10) {
    shopSystem.addItemToShop(shopId, {
      id: 'advanced_sword',
      name: '精钢剑',
      price: 500,
      requiredLevel: 10
    });
  }
}
```

## 需求映射

- **需求 15**: 货币系统 - 货币检查和扣除
- **需求 16**: 商店系统 - 购买和出售功能

## 注意事项

1. **货币扣除时机**：购买时货币立即扣除，失败会自动退款
2. **库存管理**：`stock` 为 `undefined` 表示无限库存
3. **背包集成**：自动检测并使用玩家的 `inventory` 对象
4. **价格修正**：每个商店可以有独立的价格修正系数
5. **交易记录**：自动记录所有交易，限制最大记录数

## 未来扩展

- [ ] 支持物品折扣和促销
- [ ] 支持会员等级和价格优惠
- [ ] 支持物品回购功能
- [ ] 支持商店刷新机制
- [ ] 支持特殊货币（如积分、代币）
- [ ] 支持物品交换（以物易物）
