# 属性点分配系统使用指南

## 概述

属性点分配系统是HTML5 MMRPG游戏的核心角色成长机制，允许玩家通过分配属性点来定制角色的战斗能力和特性。

## 五大属性

### 力量 (Strength)
- **主要影响**: 物理攻击力和负重能力
- **效果**:
  - 每点增加0.8攻击力
  - 每点增加5负重
  - 每点增加2%武器伤害倍率

### 敏捷 (Agility)
- **主要影响**: 移动速度、攻击速度和闪避能力
- **效果**:
  - 每点增加1.5移动速度
  - 每点增加3%攻击速度
  - 每点增加0.5%闪避率（最大30%）
  - 每点增加0.3%暴击率（最大20%）

### 智力 (Intelligence)
- **主要影响**: 魔法攻击力和法力值
- **效果**:
  - 每点增加1.2魔法攻击力
  - 每点增加8最大法力值
  - 每点增加2.5%法术伤害倍率
  - 每点增加0.5元素攻击力

### 体质 (Constitution)
- **主要影响**: 生命值和防御能力
- **效果**:
  - 每点增加12最大生命值
  - 每点增加0.6防御力
  - 每点增加0.3生命回复
  - 每点增加0.2%伤害减免（最大15%）

### 精神 (Spirit)
- **主要影响**: 法力回复和状态抗性
- **效果**:
  - 每点增加0.8法力回复
  - 每点增加1%状态抗性（最大50%）
  - 每点增加0.4元素防御力
  - 每点减少0.5%技能冷却时间（最大25%）

## 属性点获得

### 升级获得
- 每次升级获得5个属性点
- 通过`AttributeSystem.onLevelUp()`方法触发

### 属性点分配
- 使用属性面板进行分配
- 支持单点分配和批量分配
- 实时显示效果预览

### 属性重置
- 支持一键重置所有属性点
- 返还所有已投入的属性点
- 重置为基础值（每属性10点）

## 使用方法

### 基础API

```javascript
import { AttributeSystem, AttributeType } from './AttributeSystem.js';

// 1. 创建属性系统
const attributeSystem = new AttributeSystem();

// 2. 初始化角色属性
attributeSystem.initializeCharacterAttributes('player1', {
  strength: 12,
  agility: 10,
  intelligence: 15,
  constitution: 11,
  spirit: 8,
  availablePoints: 20
});

// 3. 分配属性点
const success = attributeSystem.allocateAttribute('player1', AttributeType.STRENGTH, 3);

// 4. 计算属性效果
const effects = attributeSystem.calculateCharacterEffects('player1');

// 5. 应用效果到战斗属性
const baseStats = { attack: 10, defense: 5, maxHp: 100, maxMp: 50, speed: 100 };
const modifiedStats = attributeSystem.applyAttributeEffects('player1', baseStats);

// 6. 角色升级
attributeSystem.onLevelUp('player1', newLevel);

// 7. 重置属性
attributeSystem.resetCharacterAttributes('player1');
```

### UI集成

```javascript
import { AttributePanel } from '../ui/AttributePanel.js';

// 创建属性面板
const attributePanel = new AttributePanel(document.body, attributeSystem);

// 显示面板
attributePanel.show('player1');

// 监听属性变化
document.addEventListener('attributeChanged', (event) => {
  const { characterId, attributeData, effects } = event.detail;
  // 处理属性变化
});
```

### 游戏场景集成

```javascript
// 在GameScene中集成
class GameScene {
  initializePlayerAttributes(characterData) {
    // 初始化属性系统
    this.attributeSystem.initializeCharacterAttributes(this.player.id, characterData.attributes);
    
    // 应用属性效果
    this.applyAttributeEffectsToPlayer();
    
    // 监听属性变化
    document.addEventListener('attributeChanged', (event) => {
      if (event.detail.characterId === this.player.id) {
        this.applyAttributeEffectsToPlayer();
      }
    });
  }
  
  simulateLevelUp() {
    const statsComponent = this.player.getComponent('stats');
    statsComponent.levelUp();
    
    // 获得属性点
    this.attributeSystem.onLevelUp(this.player.id, statsComponent.level);
    
    // 应用属性效果
    this.applyAttributeEffectsToPlayer();
  }
}
```

## 快捷键

- **C键**: 打开/关闭属性面板
- **L键**: 模拟升级（测试用）
- **ESC键**: 关闭属性面板

## 属性建议

### 战士职业
- **推荐**: 力量 > 体质 > 敏捷 > 精神 > 智力
- **特点**: 高攻击力和生存能力

### 法师职业
- **推荐**: 智力 > 精神 > 体质 > 敏捷 > 力量
- **特点**: 高魔法伤害和法力管理

### 弓箭手职业
- **推荐**: 敏捷 > 力量 > 体质 > 精神 > 智力
- **特点**: 高攻击速度和暴击率

## 平衡性设计

### 属性上限
- 某些效果有上限限制（如闪避率最大30%）
- 防止单一属性过于强势
- 鼓励均衡发展

### 成长曲线
- 线性成长确保每点投入都有价值
- 基础值为10，确保所有角色都有基本能力
- 每级5点的获得量保持稳定成长

### 职业特色
- 不同职业有不同的属性倾向
- 支持多种构建方式
- 鼓励玩家实验不同的分配策略

## 测试和调试

### 单元测试
```bash
npm test -- src/systems/AttributeSystem.test.js --run
```

### 集成测试
- 打开 `test-attribute-system.html` 进行基础功能测试
- 打开 `test-attribute-point-allocation.html` 进行完整系统测试

### 调试模式
```javascript
// 启用调试日志
console.log('属性数据:', attributeSystem.getCharacterAttributes('player1'));
console.log('属性效果:', attributeSystem.calculateCharacterEffects('player1'));
```

## 扩展性

### 添加新属性
1. 在`AttributeType`中添加新的属性类型
2. 在`AttributeEffectCalculator`中添加效果计算方法
3. 在`getAllAttributeDescriptions`中添加描述信息
4. 更新UI显示逻辑

### 调整效果公式
- 修改`AttributeEffectCalculator`中的计算方法
- 调整各属性的影响系数
- 更新上限限制

### 添加复合效果
- 在`calculateTotalEffects`中添加属性间的交互效果
- 实现属性阈值奖励
- 添加职业特定的属性加成

## 常见问题

### Q: 如何重置属性点？
A: 使用属性面板中的"重置属性"按钮，或调用`resetCharacterAttributes()`方法。

### Q: 属性点不够怎么办？
A: 通过升级获得更多属性点，每升一级获得5点。

### Q: 如何查看属性效果？
A: 打开属性面板查看详细效果，或使用`calculateCharacterEffects()`方法。

### Q: 属性分配有上限吗？
A: 单个属性没有上限，但某些效果有上限限制（如闪避率）。

### Q: 如何保存属性分配？
A: 属性数据会自动保存在角色数据中，与其他角色信息一起持久化。

## 相关文档

- [属性系统实现总结](../../ATTRIBUTE_SYSTEM_IMPLEMENTATION.md)
- [技能树系统](./README_SkillTree.md)
- [装备系统](../data/README.md)
- [战斗系统](./README.md)