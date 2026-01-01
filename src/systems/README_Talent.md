# 天赋系统 (Talent System)

## 概述

天赋系统是角色成长系统的重要组成部分，提供被动效果增强角色能力。与技能树系统不同，天赋系统专注于提供持续性的被动加成，而非主动技能。

## 核心特性

### 1. 天赋类型

系统支持四种天赋类型：

- **战斗 (Combat)**: 提高攻击力、暴击率等进攻属性
- **生存 (Survival)**: 提高生命值、防御力等防御属性
- **实用 (Utility)**: 提高移动速度、法力回复等辅助属性
- **元素 (Element)**: 提高特定元素的伤害

### 2. 天赋树结构

每个职业拥有独立的天赋树，包含：

- **多层级结构**: 从基础天赋到终极天赋
- **前置条件**: 部分天赋需要先学习前置天赋
- **等级限制**: 高级天赋需要角色达到一定等级
- **多等级天赋**: 部分天赋可以学习多次，效果叠加

### 3. 天赋点获取

- 角色每升一级获得1个天赋点
- 可通过特殊活动或任务获得额外天赋点

## 使用方法

### 初始化天赋系统

```javascript
import { TalentSystem } from './systems/TalentSystem.js';

const talentSystem = new TalentSystem();
```

### 学习天赋

```javascript
const character = {
  class: 'warrior',
  level: 10,
  talentPoints: 5
};

// 检查是否可以学习
const canLearn = talentSystem.canLearnTalent(character, 'warrior_iron_will');
if (canLearn.canLearn) {
  const result = talentSystem.learnTalent(character, 'warrior_iron_will');
  console.log(result.message);
}
```

### 获取天赋效果

```javascript
// 获取所有天赋效果
const effects = talentSystem.getTalentEffects(character);

// 应用天赋效果到角色属性
const baseStats = { maxHp: 100, attack: 10, defense: 5 };
const modifiedStats = talentSystem.applyTalentEffects(character, baseStats);
```

### 重置天赋

```javascript
const returnedPoints = talentSystem.resetTalentTree(character);
console.log(`返还 ${returnedPoints} 天赋点`);
```

## 职业天赋树

### 战士天赋树

| 天赋名称 | 类型 | 最大等级 | 效果 |
|---------|------|---------|------|
| 钢铁意志 | 生存 | 5 | +50生命值/级 |
| 蛮力 | 战斗 | 5 | +5攻击力/级 |
| 厚皮 | 生存 | 5 | +3防御力/级 |
| 血怒 | 战斗 | 3 | 低血量时攻击力提升 |
| 盾牌精通 | 生存 | 3 | 提高格挡几率和减伤 |
| 活力 | 生存 | 3 | +2生命回复/级 |
| 致命打击 | 战斗 | 3 | 提高暴击率和暴击伤害 |
| 背水一战 | 生存 | 3 | 低血量时伤害减免 |
| 势不可挡 | 战斗 | 1 | 免疫控制，全属性提升 |

### 法师天赋树

| 天赋名称 | 类型 | 最大等级 | 效果 |
|---------|------|---------|------|
| 奥术智慧 | 实用 | 5 | +30法力值/级 |
| 法术强化 | 战斗 | 5 | +8法术伤害/级 |
| 法力涌动 | 实用 | 5 | +2法力回复/级 |
| 火焰亲和 | 元素 | 3 | +10火系伤害/级 |
| 冰霜亲和 | 元素 | 3 | +10冰系伤害/级 |
| 冥想 | 实用 | 3 | 战斗外法力回复提升 |
| 法术穿透 | 战斗 | 3 | +5法术穿透/级 |
| 法力护盾 | 生存 | 3 | 部分伤害由法力承担 |
| 奥术大师 | 战斗 | 1 | 法术伤害+20%，法力消耗-15% |

### 弓箭手天赋树

| 天赋名称 | 类型 | 最大等级 | 效果 |
|---------|------|---------|------|
| 锐眼 | 战斗 | 5 | +2%命中率/级 |
| 迅捷射击 | 战斗 | 5 | +3%攻击速度/级 |
| 灵活 | 实用 | 5 | +5速度，+1%闪避/级 |
| 致命瞄准 | 战斗 | 3 | +4%暴击率/级 |
| 穿透射击 | 战斗 | 3 | +5护甲穿透/级 |
| 闪避专精 | 生存 | 3 | +3%闪避率/级 |
| 爆头 | 战斗 | 3 | +25%暴击伤害/级 |
| 风行者 | 实用 | 3 | 移动时攻击力提升 |
| 鹰眼 | 战斗 | 1 | +50攻击范围，+10%暴击，+30%暴击伤害 |

## UI组件

### TalentPanel

天赋面板UI组件，用于显示和操作天赋树。

```javascript
import { TalentPanel } from './ui/TalentPanel.js';

const talentPanel = new TalentPanel({
  x: 50,
  y: 50,
  width: 700,
  height: 500,
  talentSystem: talentSystem,
  character: character
});

// 显示/隐藏面板
talentPanel.show();
talentPanel.hide();
talentPanel.toggle();

// 设置回调
talentPanel.setOnTalentLearned((node) => {
  console.log(`学习了天赋: ${node.name}`);
});

talentPanel.setOnTalentReset((points) => {
  console.log(`返还了 ${points} 天赋点`);
});

// 渲染
talentPanel.render(ctx);

// 处理输入
talentPanel.handleClick(mouseX, mouseY);
talentPanel.handleMouseMove(mouseX, mouseY);
```

## 与其他系统集成

### 与属性系统集成

```javascript
// 先应用属性效果，再应用天赋效果
let stats = attributeSystem.applyAttributeEffects(characterId, baseStats);
stats = talentSystem.applyTalentEffects(character, stats);
```

### 与战斗系统集成

```javascript
// 在战斗计算中使用天赋效果
const talentEffects = talentSystem.getTalentEffects(character);
if (talentEffects.criticalChance) {
  // 应用暴击率加成
}
```

## 测试

运行单元测试：

```bash
npx vitest run src/systems/TalentSystem.test.js
```

打开测试页面进行可视化测试：

```
test-talent-system.html
```

## 文件结构

```
src/
├── systems/
│   ├── TalentSystem.js      # 天赋系统核心逻辑
│   ├── TalentSystem.test.js # 单元测试
│   └── README_Talent.md     # 本文档
└── ui/
    └── TalentPanel.js       # 天赋面板UI组件
```

## 扩展建议

1. **天赋预设**: 允许玩家保存和加载天赋配置
2. **天赋重置消耗**: 添加重置天赋的金币消耗
3. **天赋专精**: 在某一类型天赋投入足够点数后解锁专精奖励
4. **天赋成就**: 学习特定天赋组合解锁成就
