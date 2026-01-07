# 职业系统 (ClassSystem)

## 概述

职业系统管理玩家的职业选择、技能树、兵种特化和属性分配。系统集成了现有的 SkillTreeSystem、UnitSystem 和 AttributeSystem，提供完整的职业成长体系。

## 功能特性

### 三大职业

1. **战士 (Warrior)**
   - 教官：张梁（地公将军）
   - 特点：高生命值和防御力
   - 基础兵种：刀盾步兵
   - 特化选项：
     - 重甲步兵：专注防御和生存
     - 狂战士：专注攻击和爆发

2. **弓箭手 (Archer)**
   - 教官：张宝（人公将军）
   - 特点：高攻击力和敏捷
   - 基础兵种：弓弩兵
   - 特化选项：
     - 弓骑兵：高机动性和持续输出
     - 连弩步兵：爆发伤害和范围攻击

3. **法师 (Mage)**
   - 教官：张角（天公将军）
   - 特点：强大的法术伤害
   - 基础兵种：弓弩兵（远程）
   - 特化选项：
     - 火系法师：极高的爆发伤害
     - 冰系法师：强大的控制和持续伤害

### 系统集成

- **技能树系统**：每个职业有独立的技能树
- **兵种系统**：职业关联基础兵种，特化提供高级兵种
- **属性系统**：五大属性（力量、敏捷、智力、体质、精神）

## 使用示例

### 基础使用

```javascript
import { ClassSystem, ClassType } from './ClassSystem.js';

// 创建职业系统
const classSystem = new ClassSystem();

// 选择职业
const characterId = 'player1';
classSystem.selectClass(characterId, ClassType.WARRIOR);

// 获取职业数据
const classData = classSystem.getCharacterClassData(characterId);
console.log(classData.displayName); // "战士"
```

### 属性分配

```javascript
import { AttributeType } from '../../systems/AttributeSystem.js';

// 分配属性点
classSystem.allocateAttribute(characterId, AttributeType.STRENGTH, 3);
classSystem.allocateAttribute(characterId, AttributeType.CONSTITUTION, 2);

// 获取属性
const attributes = classSystem.getCharacterAttributes(characterId);
console.log(attributes.strength); // 13
console.log(attributes.availablePoints); // 0
```

### 兵种特化

```javascript
// 检查是否可以选择特化
const canSelect = classSystem.canSelectSpecialization(characterId, 10);

if (canSelect) {
  // 选择特化
  classSystem.selectSpecialization(characterId, 'warrior_heavy_infantry', 10);
  
  // 获取特化信息
  const spec = classSystem.getCharacterSpecialization(characterId);
  console.log(spec.name); // "重甲步兵"
  console.log(spec.unitType); // UnitTypes.HEAVY_INFANTRY
}
```

### 技能学习

```javascript
// 获取技能树
const skillTree = classSystem.getCharacterSkillTree(characterId);

// 学习技能
const character = { level: 5, skillPoints: 10 };
classSystem.learnSkill(characterId, 'warrior_basic_combat', character);

// 重置技能树
const returnedPoints = classSystem.resetSkillTree(characterId, character);
```

### 最终属性计算

```javascript
// 计算角色最终属性（包含职业、属性、特化加成）
const character = { level: 10, hp: 150, mp: 30 };
const finalStats = classSystem.calculateFinalStats(characterId, character);

console.log(finalStats.maxHp);    // 基础 + 成长 + 属性加成
console.log(finalStats.attack);   // 基础 + 成长 + 属性加成 + 特化加成
console.log(finalStats.unitType); // 兵种类型
```

### 角色升级

```javascript
// 角色升级时调用
classSystem.onLevelUp(characterId, 11);

// 自动给予5个属性点
const attributes = classSystem.getCharacterAttributes(characterId);
console.log(attributes.availablePoints); // +5
```

## API 参考

### 职业管理

- `getClassData(classType)` - 获取职业数据
- `getAllClasses()` - 获取所有职业
- `selectClass(characterId, classType)` - 选择职业
- `getCharacterClass(characterId)` - 获取角色职业
- `getCharacterClassData(characterId)` - 获取角色职业数据

### 特化管理

- `selectSpecialization(characterId, specializationId, characterLevel)` - 选择特化
- `getCharacterSpecialization(characterId)` - 获取角色特化
- `canSelectSpecialization(characterId, characterLevel)` - 检查是否可选择特化
- `getAvailableSpecializations(characterId, characterLevel)` - 获取可用特化
- `getCharacterUnitType(characterId)` - 获取角色兵种类型

### 技能管理

- `learnSkill(characterId, skillId, character)` - 学习技能
- `getCharacterSkillTree(characterId)` - 获取技能树
- `resetSkillTree(characterId, character)` - 重置技能树

### 属性管理

- `allocateAttribute(characterId, attributeType, points)` - 分配属性点
- `getCharacterAttributes(characterId)` - 获取角色属性
- `resetAttributes(characterId)` - 重置属性点

### 综合计算

- `calculateFinalStats(characterId, character)` - 计算最终属性
- `onLevelUp(characterId, newLevel)` - 角色升级

### 信息查询

- `getRecommendedAttributes(classType)` - 获取推荐属性
- `getStartingEquipment(classType)` - 获取初始装备
- `getInstructor(classType)` - 获取教官信息
- `getAllInstructors()` - 获取所有教官

## 数据结构

### ClassData

```javascript
{
  id: 'warrior',
  name: 'warrior',
  displayName: '战士',
  description: '近战专家...',
  instructor: { id, name, title, description },
  baseAttributes: { health, mana, attack, defense, speed },
  attributeGrowth: { health, mana, attack, defense, speed },
  recommendedAttributes: { primary, secondary, tertiary },
  baseUnitType: UnitTypes.SWORD_SHIELD,
  specializations: [SpecializationData, ...],
  startingEquipment: [...]
}
```

### SpecializationData

```javascript
{
  id: 'warrior_heavy_infantry',
  name: '重甲步兵',
  description: '专注于防御和生存...',
  unitType: UnitTypes.HEAVY_INFANTRY,
  requiredLevel: 10,
  bonuses: {
    defenseMultiplier: 1.3,
    healthMultiplier: 1.2,
    damageReduction: 0.1
  },
  specialSkills: ['warrior_fortress', 'warrior_shield_wall']
}
```

## 设计原则

1. **职业平衡**：每个职业有独特的优势和劣势
2. **成长多样性**：通过属性、技能、特化提供多种成长路径
3. **系统集成**：充分复用现有系统，避免重复实现
4. **数据驱动**：职业数据易于配置和扩展

## 测试

运行单元测试：
```bash
npm test ClassSystem.test.js
```

运行浏览器测试：
打开 `test/test-class-system.html`

## 注意事项

1. 职业选择后不可更改
2. 特化选择后不可更改
3. 属性点和技能点可以重置（可能需要消耗道具）
4. 特化需要达到指定等级才能选择
5. 最终属性计算包含多个系统的加成

## 相关文档

- [技能树系统](../../systems/README_SkillTree.md)
- [兵种系统](../../systems/README_Unit.md)
- [属性系统](../../systems/README_Attribute.md)
