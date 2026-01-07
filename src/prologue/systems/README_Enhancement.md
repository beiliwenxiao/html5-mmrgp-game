# 装备强化系统 (EnhancementSystem)

## 概述

装备强化系统负责管理装备的强化和拆解功能，是序章中第三幕"铜钱法器"的核心系统。

## 功能特性

### 1. 装备强化
- 消耗货币强化装备
- 强化成功率随等级递减（+0→+1: 100%, +5→+6: 50%, +9→+10: 10%）
- 每级强化增加10%属性
- 最大强化等级：+10

### 2. 装备拆解
- 拆解装备返还货币
- 返还比例根据装备品质：
  - 普通(common): 30%
  - 优秀(uncommon): 40%
  - 稀有(rare): 50%
  - 史诗(epic): 60%
  - 传说(legendary): 70%
- 强化等级越高，返还价值越高

### 3. 消耗计算
- 基础消耗：100铜钱
- 消耗随等级指数增长（系数1.5）
- 品质越高，消耗越大

## 使用示例

```javascript
import { EnhancementSystem } from './EnhancementSystem.js';

// 创建系统实例
const enhancementSystem = new EnhancementSystem();

// 创建玩家和装备
const player = { currency: 10000 };
const equipment = {
  id: 'iron_sword',
  name: '铁剑',
  rarity: 'common',
  enhanceLevel: 0,
  attributes: {
    attack: 10,
    defense: 0
  }
};

// 强化装备
const result = enhancementSystem.enhanceEquipment(equipment, player);
if (result.success) {
  console.log(`强化成功！新等级：${result.newLevel}`);
  console.log(`消耗：${result.cost}铜钱`);
} else {
  console.log(`强化失败：${result.reason}`);
}

// 预览强化效果
const preview = enhancementSystem.previewEnhancedAttributes(equipment);
console.log('预览属性：', preview.previewAttributes);
console.log('成功率：', preview.successRate);
console.log('消耗：', preview.cost);

// 拆解装备
const dismantleResult = enhancementSystem.dismantleEquipment(equipment);
if (dismantleResult.success) {
  player.currency += dismantleResult.currency;
  console.log(`拆解成功！获得${dismantleResult.currency}铜钱`);
}
```

## API 文档

### 构造函数

```javascript
new EnhancementSystem()
```

创建装备强化系统实例。

### 方法

#### enhanceEquipment(equipment, player)

强化装备。

**参数：**
- `equipment` (Object): 装备对象
  - `id` (string): 装备ID
  - `name` (string): 装备名称
  - `rarity` (string): 品质（common/uncommon/rare/epic/legendary）
  - `enhanceLevel` (number): 当前强化等级
  - `attributes` (Object): 属性对象
- `player` (Object): 玩家对象
  - `currency` (number): 玩家货币

**返回值：**
```javascript
{
  success: boolean,        // 是否成功
  newLevel?: number,       // 新的强化等级（成功时）
  cost: number,           // 消耗的货币
  successRate: number,    // 成功率
  reason?: string         // 失败原因（失败时）
}
```

**失败原因：**
- `invalid_equipment`: 无效的装备
- `max_level_reached`: 已达到最大强化等级
- `insufficient_currency`: 货币不足
- `enhance_failed`: 强化失败（概率失败）

#### dismantleEquipment(equipment)

拆解装备。

**参数：**
- `equipment` (Object): 装备对象

**返回值：**
```javascript
{
  success: boolean,           // 是否成功
  currency: number,          // 返还的货币
  equipmentName: string,     // 装备名称
  equipmentRarity: string,   // 装备品质
  enhanceLevel: number,      // 强化等级
  reason?: string            // 失败原因（失败时）
}
```

#### calculateEnhanceCost(equipment)

计算强化消耗。

**参数：**
- `equipment` (Object): 装备对象

**返回值：**
- `number`: 强化所需货币

#### getEnhanceRate(currentLevel)

获取强化成功率。

**参数：**
- `currentLevel` (number): 当前强化等级

**返回值：**
- `number`: 成功率（0-1）

#### previewEnhancedAttributes(equipment)

预览强化后的属性。

**参数：**
- `equipment` (Object): 装备对象

**返回值：**
```javascript
{
  currentLevel: number,           // 当前等级
  nextLevel: number,              // 下一级
  currentAttributes: Object,      // 当前属性
  previewAttributes: Object,      // 预览属性
  successRate: number,            // 成功率
  cost: number                    // 消耗
}
```

如果已达到最大等级，返回 `null`。

#### canEnhance(equipment, player)

检查是否可以强化。

**参数：**
- `equipment` (Object): 装备对象
- `player` (Object): 玩家对象

**返回值：**
```javascript
{
  canEnhance: boolean,    // 是否可以强化
  cost?: number,          // 所需货币
  reason?: string         // 不能强化的原因
}
```

#### getEnhanceLevelText(level)

获取强化等级显示文本。

**参数：**
- `level` (number): 强化等级

**返回值：**
- `string`: 显示文本（如 "+5"，等级0返回空字符串）

#### resetEnhancement(equipment)

重置装备强化等级（用于测试或特殊情况）。

**参数：**
- `equipment` (Object): 装备对象

## 配置参数

### 强化成功率
```javascript
enhanceRates = {
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
}
```

### 拆解返还比例
```javascript
dismantleRateByRarity = {
  'common': 0.3,      // 30%
  'uncommon': 0.4,    // 40%
  'rare': 0.5,        // 50%
  'epic': 0.6,        // 60%
  'legendary': 0.7    // 70%
}
```

### 装备基础价值
```javascript
baseValueByRarity = {
  'common': 100,
  'uncommon': 300,
  'rare': 1000,
  'epic': 3000,
  'legendary': 10000
}
```

## 测试

### 单元测试
```bash
npm test src/prologue/systems/EnhancementSystem.test.js
```

### 浏览器测试
打开 `test/test-enhancement-system.html` 进行交互式测试。

## 集成示例

### 与UI集成

```javascript
// 在强化面板中使用
class EnhancementPanel {
  constructor(enhancementSystem) {
    this.enhancementSystem = enhancementSystem;
  }

  showEnhancePreview(equipment, player) {
    const preview = this.enhancementSystem.previewEnhancedAttributes(equipment);
    
    if (!preview) {
      this.showMessage('装备已达到最大强化等级');
      return;
    }

    // 显示预览信息
    this.displayPreview({
      currentLevel: preview.currentLevel,
      nextLevel: preview.nextLevel,
      attributes: preview.previewAttributes,
      successRate: `${(preview.successRate * 100).toFixed(0)}%`,
      cost: preview.cost
    });
  }

  onEnhanceClick(equipment, player) {
    const result = this.enhancementSystem.enhanceEquipment(equipment, player);
    
    if (result.success) {
      this.showSuccessEffect();
      this.updateEquipmentDisplay(equipment);
    } else {
      this.showFailureEffect(result.reason);
    }
    
    this.updatePlayerCurrency(player.currency);
  }
}
```

### 与进度系统集成

```javascript
// 保存强化记录
class ProgressManager {
  saveEnhancementHistory(equipment, result) {
    const history = {
      equipmentId: equipment.id,
      timestamp: Date.now(),
      success: result.success,
      level: equipment.enhanceLevel,
      cost: result.cost
    };
    
    this.enhancementHistory.push(history);
  }
}
```

## 需求映射

- **需求 17**: 装备拆解系统 - `dismantleEquipment()` 方法
- **需求 18**: 装备强化系统 - `enhanceEquipment()` 方法

## 注意事项

1. **货币扣除时机**：货币在强化判定前扣除，失败也不返还
2. **属性计算**：首次强化时会保存 `baseAttributes`，后续强化基于此计算
3. **最大等级**：默认最大强化等级为 +10
4. **随机性**：强化成功与否基于 `Math.random()`，可能需要设置随机种子用于测试
5. **装备验证**：所有方法都会验证装备对象的有效性

## 未来扩展

- [ ] 支持强化保护道具（防止失败）
- [ ] 支持强化祝福道具（提高成功率）
- [ ] 支持装备降级机制（失败时降级）
- [ ] 支持强化特效和音效
- [ ] 支持强化历史记录和统计
