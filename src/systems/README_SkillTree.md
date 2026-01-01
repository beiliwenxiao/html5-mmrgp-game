# 技能树系统 (SkillTreeSystem)

## 概述

技能树系统是游戏中角色成长的核心机制，允许玩家通过消耗技能点来学习和升级各种技能。系统支持复杂的前置条件、技能分支和效果计算。

## 核心组件

### 1. SkillTreeNode（技能树节点）

表示技能树中的单个技能节点。

#### 主要属性
- `id`: 技能唯一标识符
- `name`: 技能显示名称
- `description`: 技能描述
- `type`: 技能类型（'active' | 'passive'）
- `maxLevel`: 技能最大等级
- `currentLevel`: 当前学习等级
- `prerequisites`: 前置技能ID数组
- `requiredLevel`: 学习所需角色等级
- `requiredPoints`: 学习所需技能点数
- `position`: UI中的显示位置 {x, y}
- `effects`: 技能效果配置对象

#### 主要方法
- `canLearn(character, skillTree)`: 检查是否可以学习
- `learn()`: 学习技能（提升1级）
- `reset()`: 重置技能到未学习状态
- `getCurrentEffects()`: 获取当前等级的技能效果

### 2. SkillTree（技能树）

管理单个职业的完整技能树。

#### 主要属性
- `className`: 职业名称
- `nodes`: 技能节点Map集合

#### 主要方法
- `getNode(skillId)`: 获取指定技能节点
- `getAllNodes()`: 获取所有技能节点
- `learnSkill(character, skillId)`: 学习指定技能
- `resetAllSkills(character)`: 重置所有技能
- `updateUnlockStatus()`: 更新技能解锁状态
- `getPassiveEffects()`: 获取所有被动技能效果
- `getActiveSkills()`: 获取所有已学习的主动技能

### 3. SkillTreeSystem（技能树系统）

管理所有职业的技能树，提供统一的接口。

#### 主要方法
- `getSkillTree(className)`: 获取指定职业的技能树
- `learnSkill(character, skillId)`: 学习技能
- `resetSkillTree(character)`: 重置技能树
- `canLearnSkill(character, skillId)`: 检查技能是否可学习
- `getPassiveEffects(character)`: 获取角色的被动效果
- `getActiveSkills(character)`: 获取角色的主动技能

## 技能树设计

### 战士技能树
```
基础战斗 (1,0)
├── 武器精通 (0,1)     护甲精通 (2,1)
│   └── 狂暴 (0,2)     └── 盾墙 (2,2)
│       └── 旋风斩 (0,3)   └── 要塞形态 (2,3)
```

### 法师技能树
```
法力精通 (1,0)
├── 火系精通 (0,1)     冰系精通 (2,1)
│   └── 流星术 (0,2)   └── 暴风雪 (2,2)
└── 奥术精通 (1,2)
    └── 时间停止 (1,3)
```

### 弓箭手技能树
```
精准射击 (1,0)
├── 敏捷 (0,1)         远程精通 (2,1)
│   └── 连射 (0,2)     └── 爆炸箭 (2,2)
│       └── 箭雨 (0,3)     └── 幻影射击 (2,3)
```

## 使用示例

### 基本使用

```javascript
import { SkillTreeSystem } from './SkillTreeSystem.js';

// 创建技能树系统
const skillTreeSystem = new SkillTreeSystem();

// 创建角色
const character = {
  class: 'warrior',
  level: 5,
  skillPoints: 3
};

// 检查技能是否可学习
const canLearn = skillTreeSystem.canLearnSkill(character, 'warrior_basic_combat');
console.log('可以学习基础战斗:', canLearn);

// 学习技能
if (canLearn) {
  const success = skillTreeSystem.learnSkill(character, 'warrior_basic_combat');
  console.log('学习成功:', success);
}

// 获取被动效果
const passiveEffects = skillTreeSystem.getPassiveEffects(character);
console.log('被动效果:', passiveEffects);

// 获取主动技能
const activeSkills = skillTreeSystem.getActiveSkills(character);
console.log('主动技能:', activeSkills);
```

### 技能效果配置

技能效果支持多种数据类型：

```javascript
const skillConfig = {
  id: 'example_skill',
  name: '示例技能',
  maxLevel: 3,
  effects: {
    // 数值型：按等级倍增
    attackBonus: 5,  // 1级=5, 2级=10, 3级=15
    
    // 数组型：按等级索引
    damageMultiplier: [1.2, 1.5, 2.0],  // 1级=1.2, 2级=1.5, 3级=2.0
    
    // 静态值：不变
    skillType: 'combat'
  }
};
```

### 前置条件设置

```javascript
const advancedSkill = new SkillTreeNode({
  id: 'advanced_skill',
  name: '高级技能',
  prerequisites: ['basic_skill_1', 'basic_skill_2'],  // 需要两个前置技能
  requiredLevel: 10,
  requiredPoints: 3
});
```

## 技能学习条件

技能学习需要满足以下所有条件：

1. **等级要求**: `character.level >= skill.requiredLevel`
2. **技能点要求**: `character.skillPoints >= skill.requiredPoints`
3. **前置技能**: 所有前置技能都必须已学习
4. **等级限制**: 技能当前等级 < 最大等级

## 技能点管理

- **初始技能点**: 角色创建时获得3个技能点
- **升级获得**: 每次升级获得2个技能点
- **学习消耗**: 根据技能配置消耗对应技能点
- **重置返还**: 重置技能树时返还所有已消耗的技能点

## 技能类型

### 被动技能 (Passive)
- 学习后自动生效
- 效果持续存在
- 通过 `getPassiveEffects()` 获取汇总效果

### 主动技能 (Active)
- 需要手动释放
- 通常有冷却时间和资源消耗
- 通过 `getActiveSkills()` 获取可用技能列表

## UI集成

技能树系统与 `SkillTreePanel` UI组件集成：

```javascript
import { SkillTreePanel } from '../ui/SkillTreePanel.js';

const skillTreePanel = new SkillTreePanel({
  x: 50, y: 50,
  width: 700, height: 500,
  skillTreeSystem: skillTreeSystem,
  character: character
});

// 设置事件回调
skillTreePanel.setOnSkillLearned((skill) => {
  console.log('学习了技能:', skill.name);
});

skillTreePanel.setOnSkillReset((returnedPoints) => {
  console.log('重置技能树，返还技能点:', returnedPoints);
});
```

## 扩展性

### 添加新职业

```javascript
// 在 SkillTreeSystem.initializeSkillTrees() 中添加
this.skillTrees.set('newClass', this.createNewClassSkillTree());
```

### 添加新技能

```javascript
// 在对应职业的技能树创建方法中添加
new SkillTreeNode({
  id: 'new_skill',
  name: '新技能',
  description: '新技能描述',
  type: 'active',
  maxLevel: 5,
  prerequisites: ['prerequisite_skill'],
  requiredLevel: 15,
  requiredPoints: 3,
  position: { x: 3, y: 2 },
  effects: {
    damage: 50,
    cooldown: [10, 8, 6, 4, 2]
  }
});
```

### 自定义效果计算

可以在 `SkillTreeNode.getCurrentEffects()` 中扩展效果计算逻辑：

```javascript
getCurrentEffects() {
  if (this.currentLevel === 0) return {};
  
  const effects = {};
  for (const [key, value] of Object.entries(this.effects)) {
    if (typeof value === 'function') {
      // 支持函数型效果计算
      effects[key] = value(this.currentLevel);
    } else {
      // 原有逻辑...
    }
  }
  return effects;
}
```

## 测试

运行技能树系统测试：

```javascript
import { runSkillTreeTests } from './SkillTreeSystem.test.js';

// 运行所有测试
const results = runSkillTreeTests();
console.log('测试结果:', results);
```

## 性能考虑

1. **缓存机制**: 技能效果计算结果可以缓存
2. **增量更新**: 只在技能学习/重置时更新解锁状态
3. **延迟计算**: 被动效果在需要时才计算
4. **内存管理**: 使用Map而非Object提高查找性能

## 注意事项

1. **数据一致性**: 确保角色数据与技能树状态同步
2. **错误处理**: 妥善处理无效的技能ID和角色数据
3. **版本兼容**: 技能树结构变更时考虑存档兼容性
4. **平衡性**: 技能效果和消耗需要仔细平衡