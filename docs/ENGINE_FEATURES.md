# HTML5 MMRPG 游戏引擎功能文档

## 概述

本文档描述了 HTML5 MMRPG 游戏引擎已实现的核心功能、API 接口和使用示例。

## 目录

1. [核心架构](#核心架构)
2. [角色属性系统](#角色属性系统)
3. [元素系统](#元素系统)
4. [技能树系统](#技能树系统)
5. [状态效果系统](#状态效果系统)
6. [兵种系统](#兵种系统)
7. [战斗系统](#战斗系统)
8. [移动系统](#移动系统)
9. [粒子特效系统](#粒子特效系统)
10. [性能优化](#性能优化)
11. [资源管理](#资源管理)
12. [错误处理和调试](#错误处理和调试)

---

## 核心架构

### ECS 架构

游戏采用 Entity-Component-System (ECS) 架构：

- **Entity（实体）**: 游戏对象的容器
- **Component（组件）**: 存储数据的纯数据结构
- **System（系统）**: 处理逻辑的功能模块

### 核心组件

```javascript
// TransformComponent - 位置和变换
const transform = new TransformComponent(x, y, rotation, scaleX, scaleY);

// SpriteComponent - 精灵渲染
const sprite = new SpriteComponent(spriteSheet, animations);

// StatsComponent - 角色属性
const stats = new StatsComponent({
  maxHp: 100,
  maxMp: 50,
  attack: 20,
  defense: 10,
  speed: 100
});

// MovementComponent - 移动控制
const movement = new MovementComponent(speed);

// CombatComponent - 战斗数据
const combat = new CombatComponent(attackRange, attackCooldown);
```

---

## 角色属性系统

### 功能概述

五大属性体系，影响角色的战斗能力：
- **力量 (Strength)** - 影响攻击力和负重
- **敏捷 (Agility)** - 影响速度和闪避
- **智力 (Intelligence)** - 影响魔法攻击和法力值
- **体质 (Constitution)** - 影响生命值和防御力
- **精神 (Spirit)** - 影响法力回复和抗性

### 使用示例

```javascript
import { AttributeSystem, AttributeType } from './src/systems/AttributeSystem.js';

// 创建属性系统
const attributeSystem = new AttributeSystem();

// 初始化角色属性
attributeSystem.initializeCharacterAttributes('player1', {
  strength: 12,
  agility: 10,
  intelligence: 10,
  constitution: 10,
  spirit: 10,
  availablePoints: 15
});

// 分配属性点
attributeSystem.allocateAttribute('player1', AttributeType.STRENGTH, 5);

// 计算属性效果
const effects = attributeSystem.calculateCharacterEffects('player1');
console.log(effects);
// {
//   attackBonus: 4,
//   carryCapacityBonus: 25,
//   weaponDamageMultiplier: 1.04,
//   ...
// }

// 应用到角色基础属性
const baseStats = { attack: 20, defense: 10, maxHp: 100, ... };
const modifiedStats = attributeSystem.applyAttributeEffects('player1', baseStats);
```

### 属性效果公式

| 属性 | 效果 |
|------|------|
| 力量 | 每点 +0.8 攻击力，+5 负重，+2% 武器伤害 |
| 敏捷 | 每点 +1.5 速度，+3% 攻速，+0.5% 闪避，+0.3% 暴击 |
| 智力 | 每点 +1.2 魔攻，+8 法力，+2.5% 法术伤害，+0.5 元素攻击 |
| 体质 | 每点 +12 生命，+0.6 防御，+0.3 生命回复，+0.2% 伤减 |
| 精神 | 每点 +0.8 法力回复，+1% 状态抗性，+0.4 元素防御，-0.5% 技能CD |

### UI 集成

```javascript
import { AttributePanel } from './src/ui/AttributePanel.js';

// 创建属性面板
const attributePanel = new AttributePanel(container, attributeSystem);

// 显示面板
attributePanel.show('player1');

// 监听属性变化
document.addEventListener('attributeChanged', (event) => {
  const { characterId, attributeData, effects } = event.detail;
  console.log('属性已变化:', effects);
});
```

---

## 元素系统

### 功能概述

13 种元素类型，包含基础元素、高级元素和合成元素：

**基础元素 (6种)**
- 火 (Fire)、水 (Water)、风 (Wind)
- 电 (Electric)、土 (Earth)、木 (Wood)

**高级元素 (6种)**
- 爆 (Explosion)、冰 (Ice)、暴风 (Storm)
- 雷电 (Thunder)、滚石 (Rockfall)、落木 (Timber)

**合成元素 (1种)**
- 雷暴 (Thunderstorm) = 暴风 + 雷电

### 使用示例

```javascript
import { ElementSystem, ElementType } from './src/systems/ElementSystem.js';

const elementSystem = new ElementSystem();

// 检查元素升级
const canUpgrade = elementSystem.canUpgrade(ElementType.FIRE);
console.log(canUpgrade); // true

// 升级元素
const upgraded = elementSystem.upgradeElement(ElementType.FIRE);
console.log(upgraded); // ElementType.EXPLOSION

// 检查元素合成
const canCombine = elementSystem.canCombine(
  ElementType.STORM, 
  ElementType.THUNDER
);
console.log(canCombine); // true

// 合成元素
const combined = elementSystem.combineElements(
  ElementType.STORM, 
  ElementType.THUNDER
);
console.log(combined); // ElementType.THUNDERSTORM

// 计算元素伤害
const attacker = { elementAttack: { fire: 50 } };
const defender = { elementDefense: { fire: 10 } };
const damage = elementSystem.calculateElementDamage(
  attacker, 
  defender, 
  ElementType.FIRE
);
console.log(damage); // 40

// 获取相克倍率
const multiplier = elementSystem.getCounterMultiplier(
  ElementType.FIRE, 
  ElementType.WOOD
);
console.log(multiplier); // 1.5 (火克木)
```

### 五行相克关系

- 火克木 (1.5x 伤害)
- 木克土 (1.5x 伤害)
- 土克水 (1.5x 伤害)
- 水克火 (1.5x 伤害)
- 金(风电)克木 (1.5x 伤害)

被克制时受到 0.75x 伤害。

---

## 技能树系统

### 功能概述

为每个职业提供独特的技能树，支持：
- 技能学习和升级
- 前置技能要求
- 技能点分配
- 被动技能和主动技能

### 使用示例

```javascript
import { SkillTreeSystem } from './src/systems/SkillTreeSystem.js';

const skillTreeSystem = new SkillTreeSystem();

// 获取职业技能树
const warriorTree = skillTreeSystem.getSkillTree('warrior');

// 学习技能
const character = { level: 5, skillPoints: 10 };
const result = skillTreeSystem.learnSkill(
  character, 
  warriorTree, 
  'basic_combat'
);

if (result.success) {
  console.log('技能学习成功');
  console.log('剩余技能点:', character.skillPoints);
}

// 获取被动技能效果
const passiveEffects = skillTreeSystem.getPassiveEffects(warriorTree);
console.log(passiveEffects);
// {
//   attackBonus: 10,
//   defenseBonus: 5,
//   ...
// }

// 获取主动技能列表
const activeSkills = skillTreeSystem.getActiveSkills(warriorTree);
console.log(activeSkills);
// [
//   { id: 'berserk', name: '狂暴', level: 1, ... },
//   ...
// ]

// 重置技能树
skillTreeSystem.resetSkillTree(character, warriorTree);
```

### 职业技能树

**战士技能树**
- 基础战斗（被动）→ 狂暴（主动）→ 旋风斩（主动）
- 武器精通（被动）→ 盾墙（主动）→ 要塞形态（主动）

**法师技能树**
- 法力精通（被动）→ 流星术（主动）→ 时间停止（主动）
- 火系精通（被动）→ 暴风雪（主动）

**弓箭手技能树**
- 精准射击（被动）→ 连射（主动）→ 箭雨（主动）
- 敏捷（被动）→ 爆炸箭（主动）→ 幻影射击（主动）

### UI 集成

```javascript
import { SkillTreePanel } from './src/ui/SkillTreePanel.js';

// 创建技能树面板
const skillTreePanel = new SkillTreePanel(
  canvas, 
  skillTreeSystem, 
  'warrior'
);

// 显示面板
skillTreePanel.show(character);

// 处理技能学习
skillTreePanel.on('skillLearned', (skillId) => {
  console.log('学习了技能:', skillId);
});
```

---

## 状态效果系统

### 功能概述

支持 6 种核心状态效果：
- **中毒 (POISON)** - 持续伤害
- **恢复 (REGENERATION)** - 持续治疗
- **加速 (HASTE)** - 提升移动速度
- **护盾 (SHIELD)** - 增加防御力
- **虚弱 (WEAKNESS)** - 降低攻击力
- **狂暴 (RAGE)** - 提升攻击力

### 使用示例

```javascript
import { StatusEffectSystem, StatusEffectType } from './src/systems/StatusEffectSystem.js';

const statusEffectSystem = new StatusEffectSystem();

// 应用中毒效果
statusEffectSystem.applyPoison(
  targetEntity,
  8,    // 持续时间（秒）
  1,    // 强度
  sourceEntity
);

// 应用恢复效果
statusEffectSystem.applyRegeneration(targetEntity, 5, 1);

// 应用加速效果
statusEffectSystem.applyHaste(targetEntity, 10, 1);

// 应用护盾效果
statusEffectSystem.applyShield(targetEntity, 15, 1);

// 移除特定状态效果
statusEffectSystem.removeStatusEffect(targetEntity, StatusEffectType.POISON);

// 清除所有 Debuff
statusEffectSystem.clearStatusEffectsByType(targetEntity, 'debuff');

// 清除所有状态效果
statusEffectSystem.clearAllStatusEffects(targetEntity);

// 获取修改后的属性
const modifiedStats = statusEffectSystem.getModifiedStats(targetEntity);
console.log(modifiedStats);
// {
//   attack: 25,      // 基础 20 + 狂暴 +5
//   defense: 30,     // 基础 10 + 护盾 +20
//   speed: 150,      // 基础 100 + 加速 +50
// }

// 在游戏循环中更新
function gameLoop(deltaTime) {
  statusEffectSystem.update(deltaTime, entities);
}
```

### 组件使用

```javascript
import { StatusEffectComponent } from './src/ecs/components/StatusEffectComponent.js';

// 添加组件到实体
const statusEffect = new StatusEffectComponent();
entity.addComponent('statusEffect', statusEffect);

// 手动添加效果
statusEffect.addEffect(StatusEffectType.POISON, 8, 1, sourceEntity);

// 检查是否有特定效果
if (statusEffect.hasEffect(StatusEffectType.POISON)) {
  console.log('实体中毒了');
}

// 获取所有效果
const effects = statusEffect.getAllEffects();

// 获取修改后的属性
const modifiedAttack = statusEffect.getModifiedAttack(baseAttack);
const modifiedDefense = statusEffect.getModifiedDefense(baseDefense);
const modifiedSpeed = statusEffect.getModifiedSpeed(baseSpeed);
```

### UI 显示

```javascript
import { StatusEffectBar } from './src/ui/StatusEffectBar.js';

// 创建状态效果栏
const statusBar = new StatusEffectBar({
  position: { x: 10, y: 10 },
  iconSize: 32,
  maxIcons: 10,
  layout: 'horizontal'
});

// 更新显示
statusBar.update(entity);

// 渲染
statusBar.render(ctx);
```

---

## 兵种系统

### 功能概述

3 个兵种体系，9 种兵种类型：

**步兵系**
- 刀盾步兵 → 轻甲步兵 → 重甲步兵

**远程系**
- 弓弩兵 → 弓骑兵 / 连弩步兵（分支升级）

**枪骑系**
- 长枪兵 → 轻骑兵 → 重甲骑兵

### 使用示例

```javascript
import { UnitSystem, UnitTypes } from './src/systems/UnitSystem.js';

const unitSystem = new UnitSystem();

// 获取兵种名称
const unitName = unitSystem.getUnitName(UnitTypes.SWORD_SHIELD);
console.log(unitName); // "刀盾步兵"

// 检查是否可以升级
const canUpgrade = unitSystem.canUpgradeUnit(UnitTypes.SWORD_SHIELD);
console.log(canUpgrade); // true

// 升级兵种
const upgraded = unitSystem.upgradeUnit(UnitTypes.SWORD_SHIELD, 0);
console.log(upgraded); // UnitTypes.LIGHT_INFANTRY

// 分支升级（弓弩兵可以升级为两种兵种）
const branch0 = unitSystem.upgradeUnit(UnitTypes.ARCHER, 0); // 弓骑兵
const branch1 = unitSystem.upgradeUnit(UnitTypes.ARCHER, 1); // 连弩步兵

// 获取相克信息
const counterInfo = unitSystem.getUnitCounterInfo(
  UnitTypes.SPEARMAN,
  UnitTypes.LIGHT_CAVALRY
);
console.log(counterInfo);
// {
//   hasAdvantage: true,
//   multiplier: 1.3,
//   description: "枪兵克制轻骑兵"
// }

// 计算兵种伤害加成
const baseDamage = 100;
const finalDamage = unitSystem.calculateUnitDamage(
  UnitTypes.SPEARMAN,
  UnitTypes.LIGHT_CAVALRY,
  baseDamage
);
console.log(finalDamage); // 130 (100 * 1.3)
```

### 相克关系

- 枪兵克轻骑兵 (1.3x)
- 轻骑兵克远程兵 (1.3x)
- 远程兵克轻步兵 (1.3x)
- 轻步兵克枪兵 (1.3x)
- 重甲兵种无克制关系

被克制时受到 0.8x 伤害。

### 战斗系统集成

```javascript
// 兵种加成会自动应用到战斗伤害计算中
const damage = combatSystem.calculateDamage(attacker, defender);
// 伤害已包含兵种相克加成
```

---

## 战斗系统

### 功能概述

完整的战斗系统，包括：
- 目标选择
- 普通攻击
- 技能释放
- 伤害计算
- 死亡处理

### 使用示例

```javascript
import { CombatSystem } from './src/systems/CombatSystem.js';

// 创建战斗系统
const combatSystem = new CombatSystem({
  inputManager: inputManager,
  camera: camera,
  dataService: dataService,
  skillEffects: skillEffects  // 可选：技能特效系统
});

// 设置玩家实体
combatSystem.setPlayerEntity(playerEntity);

// 加载技能
const skillIds = ['warrior_slash', 'warrior_charge', 'warrior_defense'];
combatSystem.loadSkills(playerEntity, skillIds);

// 在游戏循环中更新
function gameLoop(deltaTime) {
  const currentTime = performance.now();
  combatSystem.update(deltaTime, entities);
  
  // 渲染战斗UI（目标高亮、伤害数字等）
  combatSystem.render(ctx);
  
  // 清理死亡实体
  const deadEntities = combatSystem.getDeadEntities(entities);
  for (const dead of deadEntities) {
    entities.splice(entities.indexOf(dead), 1);
  }
}
```

### 目标选择

```javascript
// 手动选择目标
combatSystem.selectTarget(enemyEntity);

// 清除目标
combatSystem.clearTarget();

// 获取当前目标
const target = combatSystem.getCurrentTarget();

// 自动处理点击选择（在 update 中自动调用）
// 玩家点击敌人会自动选中
```

### 攻击和技能

```javascript
// 普通攻击（自动攻击）
// 当有目标且在范围内时，系统会自动执行攻击

// 手动执行攻击
combatSystem.performAttack(attacker, target, currentTime);

// 使用技能（通过快捷键 1-6）
// 系统会自动处理技能输入

// 手动使用技能
const skill = attacker.getComponent('combat').skills[0];
combatSystem.tryUseSkill(attacker, skill, currentTime, entities);

// 获取攻击冷却进度
const progress = combatSystem.getAttackCooldownProgress(entity);
console.log(progress); // 0.0 到 1.0

// 获取技能冷却进度
const skillProgress = combatSystem.getSkillCooldownProgress(entity, 0);
console.log(skillProgress); // 0.0 到 1.0
```

### 伤害计算

```javascript
// 计算普通攻击伤害
const damage = combatSystem.calculateDamage(attacker, defender);

// 计算技能伤害
const skillDamage = combatSystem.calculateSkillDamage(
  attacker, 
  defender, 
  skill
);

// 应用伤害
combatSystem.applyDamage(target, damage);

// 应用治疗
combatSystem.applyHeal(target, skill);
```

### 死亡处理

```javascript
// 检查死亡
combatSystem.checkDeath(entities);

// 获取死亡实体列表
const deadEntities = combatSystem.getDeadEntities(entities);

// 获取存活实体列表
const aliveEntities = combatSystem.getAliveEntities(entities);

// 复活玩家
combatSystem.revivePlayer(playerEntity);
```

---

## 移动系统

### 功能概述

完整的移动系统，支持：
- 键盘移动（WASD/方向键）
- 点击移动
- 碰撞检测
- 相机跟随

### 使用示例

```javascript
import { MovementSystem } from './src/systems/MovementSystem.js';

// 创建移动系统
const movementSystem = new MovementSystem({
  inputManager: inputManager,
  camera: camera,
  mapBounds: { minX: 0, minY: 0, maxX: 2000, maxY: 2000 },
  collisionMap: collisionMapArray,  // 可选
  tileSize: 32                       // 可选
});

// 设置玩家实体（自动设置相机跟随）
movementSystem.setPlayerEntity(playerEntity);

// 在游戏循环中更新
function gameLoop(deltaTime) {
  movementSystem.update(deltaTime, entities);
}
```

### 键盘移动

```javascript
// 系统会自动处理 WASD 和方向键输入
// 支持斜向移动（速度会自动归一化）

// 手动控制移动
const movement = entity.getComponent('movement');
movement.setVelocity(100, 0);  // 向右移动

// 停止移动
movement.stop();
```

### 点击移动

```javascript
// 系统会自动处理鼠标点击
// 点击地图任意位置，角色会移动到该位置

// 手动设置路径
const movement = entity.getComponent('movement');
movement.setPath([
  { x: 100, y: 100 },
  { x: 200, y: 200 },
  { x: 300, y: 100 }
]);

// 清除路径
movement.clearPath();

// 检查是否到达目标
if (movement.hasReachedTarget(transform.position)) {
  console.log('已到达目标');
}
```

### 碰撞检测

```javascript
// 设置碰撞地图
const collisionMap = [
  [true, true, true, true],
  [true, false, false, true],
  [true, false, false, true],
  [true, true, true, true]
];
movementSystem.setCollisionMap(collisionMap, 32);

// 设置地图边界
movementSystem.setMapBounds(0, 0, 800, 600);

// 检查位置是否可通行
if (movementSystem.canMoveTo(x, y, entity)) {
  console.log('可以移动到这个位置');
}

// AABB 碰撞检测
const rect1 = { x: 0, y: 0, width: 50, height: 50 };
const rect2 = { x: 25, y: 25, width: 50, height: 50 };
if (movementSystem.checkAABBCollision(rect1, rect2)) {
  console.log('发生碰撞');
}
```

### 相机跟随

```javascript
// 相机会自动跟随玩家实体
// 可以配置跟随参数

const camera = movementSystem.camera;
camera.followSpeed = 0.1;  // 跟随速度 (0-1)
camera.deadzone = { x: 100, y: 100 };  // 死区大小

// 设置相机边界
camera.setBounds(0, 0, mapWidth, mapHeight);

// 手动设置相机目标
camera.setTarget(targetTransform);
```

---

## 粒子特效系统

### 功能概述

高性能的粒子系统，支持：
- 基础粒子发射
- 粒子爆发效果
- 持续发射器
- 技能特效
- 战斗特效

### 使用示例

```javascript
import { ParticleSystem } from './src/rendering/ParticleSystem.js';
import { SkillEffects } from './src/rendering/SkillEffects.js';
import { CombatEffects } from './src/rendering/CombatEffects.js';

// 创建粒子系统
const particleSystem = new ParticleSystem(2000);  // 最大粒子数

// 创建技能特效系统
const skillEffects = new SkillEffects(particleSystem);

// 创建战斗特效系统
const combatEffects = new CombatEffects(particleSystem);

// 在游戏循环中更新和渲染
function gameLoop(deltaTime) {
  particleSystem.update(deltaTime);
  skillEffects.update(deltaTime);
  combatEffects.update(deltaTime);
  
  particleSystem.render(ctx, camera);
  skillEffects.render(ctx, camera);
  combatEffects.render(ctx, camera);
}
```

### 基础粒子

```javascript
// 发射单个粒子
particleSystem.emit({
  position: { x: 100, y: 100 },
  velocity: { x: 50, y: -50 },
  life: 1000,      // 生命周期（毫秒）
  size: 5,
  color: '#ff0000',
  gravity: 100     // 重力
});

// 粒子爆发
particleSystem.emitBurst({
  position: { x: 100, y: 100 },
  velocity: { x: 0, y: 0 },
  velocityVariance: { x: 100, y: 100 },
  life: 1000,
  size: 5,
  color: '#ff0000'
}, 30);  // 粒子数量

// 创建持续发射器
const emitter = particleSystem.createEmitter({
  position: { x: 100, y: 100 },
  velocity: { x: 0, y: -50 },
  life: 500,
  size: 3,
  color: '#00ff00',
  emitRate: 20,    // 每秒发射数量
  duration: 3000   // 发射器持续时间
});

// 停止发射器
particleSystem.stopEmitter(emitter.id);
```

### 技能特效

```javascript
// 播放完整技能特效（施法 + 投射物 + 命中）
const projectile = skillEffects.playSkillEffect(
  'fireball',           // 技能ID
  { x: 0, y: 0 },      // 施法者位置
  { x: 100, y: 100 },  // 目标位置
  500                   // 投射物速度
);

// 更新投射物
if (projectile) {
  skillEffects.updateProjectileEffect(projectile, deltaTime);
}

// 支持的技能特效
// - fireball: 火球术
// - ice_lance: 冰枪术
// - lightning: 闪电链
// - heal: 治疗术
// - basic_attack: 普通攻击
// - heavy_strike: 重击
// - arrow: 箭矢
// - shield: 魔法护盾
```

### 战斗特效

```javascript
// 伤害数字
combatEffects.createDamageNumber(
  100,                  // 伤害值
  { x: 100, y: 100 },  // 位置
  'damage'             // 类型: 'damage', 'critical', 'heal'
);

// 暴击特效
combatEffects.createCriticalEffect({ x: 100, y: 100 }, 200);

// 治疗特效
combatEffects.createHealEffect({ x: 100, y: 100 }, 50);

// 格挡特效
combatEffects.createBlockEffect({ x: 100, y: 100 });

// 闪避特效
combatEffects.createDodgeEffect({ x: 100, y: 100 });

// 受击闪烁效果
combatEffects.createFlashEffect(
  entity,
  300,        // 持续时间
  '#ffffff'   // 颜色
);
```

---

## 性能优化

### 功能概述

完整的性能优化系统，包括：
- 对象池管理
- 渲染优化（视锥剔除、背景缓存）
- 性能监控

### 对象池

```javascript
import { ObjectPool } from './src/core/ObjectPool.js';

// 创建对象池
const particlePool = new ObjectPool(
  // 工厂函数
  () => ({ x: 0, y: 0, vx: 0, vy: 0, life: 0, active: false }),
  // 重置函数
  (obj) => {
    obj.x = 0;
    obj.y = 0;
    obj.vx = 0;
    obj.vy = 0;
    obj.life = 0;
    obj.active = false;
  },
  100,  // 初始大小
  500   // 最大大小
);

// 获取对象
const particle = particlePool.acquire();
particle.x = 100;
particle.y = 200;
particle.active = true;

// 归还对象
particlePool.release(particle);

// 批量归还
particlePool.releaseAll(inactiveParticles);

// 获取统计信息
console.log('池大小:', particlePool.getPoolSize());
console.log('活跃对象:', particlePool.getActiveCount());
console.log('可用对象:', particlePool.getAvailableCount());

// 清空对象池
particlePool.clear();
```

### 渲染优化

```javascript
import { RenderSystem } from './src/rendering/RenderSystem.js';

const renderSystem = new RenderSystem(camera);

// 启用背景缓存（适用于静态背景）
renderSystem.setBackgroundCacheEnabled(true);

// 设置地图大小（自动生成背景缓存）
renderSystem.setMapSize(2000, 2000);

// 标记缓存需要更新
renderSystem.invalidateBackgroundCache();

// 获取渲染统计
const stats = renderSystem.getRenderStats(entities);
console.log('总实体数:', stats.totalEntities);
console.log('可见实体:', stats.visibleEntities);
console.log('剔除实体:', stats.culledEntities);
console.log('背景缓存:', stats.backgroundCached);

// 视锥剔除（自动执行）
// 只渲染相机视野内的实体
```

### 性能监控

```javascript
import { PerformanceMonitor } from './src/core/PerformanceMonitor.js';

// 创建性能监控器
const perfMonitor = new PerformanceMonitor({
  enabled: true,
  position: { x: 10, y: 10 },
  showGraph: true,
  updateInterval: 500  // 更新间隔（毫秒）
});

// 在游戏循环中更新
function gameLoop(deltaTime) {
  // 开始计时
  perfMonitor.startTimer('update');
  
  // 更新游戏逻辑
  updateGame(deltaTime);
  
  const updateTime = perfMonitor.endTimer('update');
  
  // 开始渲染计时
  perfMonitor.startTimer('render');
  
  // 渲染游戏
  renderGame(ctx);
  
  const renderTime = perfMonitor.endTimer('render');
  
  // 更新性能监控
  perfMonitor.update(deltaTime, {
    entityCount: entities.length,
    visibleEntityCount: visibleCount,
    drawCalls: drawCallCount,
    particleCount: particleSystem.getActiveCount(),
    updateTime: updateTime,
    renderTime: renderTime
  });
  
  // 渲染性能面板
  perfMonitor.render(ctx);
}

// 切换显示
perfMonitor.toggle();

// 切换图表
perfMonitor.toggleGraph();

// 导出性能数据
const data = perfMonitor.exportData();
console.log(data);

// 重置统计
perfMonitor.reset();

// 获取当前统计
const stats = perfMonitor.getStats();
console.log('FPS:', stats.fps);
console.log('帧时间:', stats.frameTime);
console.log('更新时间:', stats.updateTime);
console.log('渲染时间:', stats.renderTime);
```

### 性能最佳实践

```javascript
// 1. 使用对象池避免频繁创建/销毁对象
const pool = new ObjectPool(factory, reset, 100, 500);

// 2. 启用背景缓存（静态背景）
renderSystem.setBackgroundCacheEnabled(true);

// 3. 限制粒子数量
const particleSystem = new ParticleSystem(2000);  // 最大2000个粒子

// 4. 使用性能监控定位瓶颈
perfMonitor.startTimer('expensiveOperation');
expensiveOperation();
const time = perfMonitor.endTimer('expensiveOperation');
console.log('操作耗时:', time, 'ms');

// 5. 批量处理而非逐个处理
entities.forEach(entity => {
  // 批量更新
});
```

---

## 资源管理

### 功能概述

完整的资源管理系统，包括：
- 资源加载和缓存
- 占位符资源生成
- 音频管理

### 资源加载

```javascript
import { AssetManager } from './src/core/AssetManager.js';

const assetManager = new AssetManager();

// 加载图片
await assetManager.loadImage('player', 'assets/sprites/player.png');

// 加载精灵图集
await assetManager.loadSpriteSheet('characters', {
  imagePath: 'assets/sprites/characters.png',
  frameWidth: 64,
  frameHeight: 64,
  animations: {
    idle: { frames: [0, 1, 2, 3], frameRate: 8 },
    walk: { frames: [4, 5, 6, 7], frameRate: 12 },
    attack: { frames: [8, 9, 10], frameRate: 15 }
  }
});

// 批量加载资源
await assetManager.loadAssets([
  { type: 'image', id: 'background', path: 'assets/bg.png' },
  { type: 'image', id: 'tileset', path: 'assets/tiles.png' },
  { type: 'audio', id: 'bgm', path: 'assets/audio/music/bgm.mp3' }
]);

// 获取资源
const playerImage = assetManager.getImage('player');
const spriteSheet = assetManager.getSpriteSheet('characters');

// 检查资源是否已加载
if (assetManager.isLoaded('player')) {
  console.log('玩家精灵已加载');
}

// 卸载资源
assetManager.unload('player');

// 清空所有资源
assetManager.clear();
```

### 占位符资源

```javascript
import { PlaceholderAssets } from './src/core/PlaceholderAssets.js';

const placeholderAssets = new PlaceholderAssets();

// 创建角色精灵
const warriorSprite = placeholderAssets.createCharacterSprite('warrior', 64);
const mageSprite = placeholderAssets.createCharacterSprite('mage', 64);
const archerSprite = placeholderAssets.createCharacterSprite('archer', 64);

// 创建敌人精灵
const slimeSprite = placeholderAssets.createEnemySprite('slime', 64);
const goblinSprite = placeholderAssets.createEnemySprite('goblin', 64);
const skeletonSprite = placeholderAssets.createEnemySprite('skeleton', 64);

// 创建技能图标
const fireballIcon = placeholderAssets.createSkillIcon('fireball', 48);
const healIcon = placeholderAssets.createSkillIcon('heal', 48);
const shieldIcon = placeholderAssets.createSkillIcon('shield', 48);

// 创建UI元素
const healthBarBg = placeholderAssets.createUIElement('healthbar_bg', 200, 20);
const healthBarFill = placeholderAssets.createUIElement('healthbar_fill', 200, 20);
const button = placeholderAssets.createUIElement('button', 120, 40);

// 创建粒子纹理
const fireParticle = placeholderAssets.createParticleTexture('fire', 16);
const healParticle = placeholderAssets.createParticleTexture('heal', 16);
const iceParticle = placeholderAssets.createParticleTexture('ice', 16);

// 清除缓存
placeholderAssets.clearCache();
```

### 音频管理

```javascript
import { AudioManager } from './src/core/AudioManager.js';

const audioManager = new AudioManager();

// 添加音效
audioManager.addSound('attack', 'assets/audio/sfx/attack.mp3');
audioManager.addSound('skill', 'assets/audio/sfx/skill.mp3');
audioManager.addSound('hit', 'assets/audio/sfx/hit.mp3');

// 添加背景音乐
audioManager.addMusic('menu', 'assets/audio/music/menu.mp3');
audioManager.addMusic('battle', 'assets/audio/music/battle.mp3');

// 播放音效
audioManager.playSound('attack');
audioManager.playSound('skill', 0.8);  // 音量 0.8

// 播放背景音乐
audioManager.playMusic('menu', true);  // 循环播放

// 停止背景音乐
audioManager.stopMusic();

// 暂停/恢复背景音乐
audioManager.pauseMusic();
audioManager.resumeMusic();

// 切换背景音乐（带淡入淡出）
audioManager.switchMusic('battle', 1000);  // 1秒淡入淡出

// 音量控制
audioManager.setMasterVolume(0.8);   // 主音量
audioManager.setSoundVolume(0.7);    // 音效音量
audioManager.setMusicVolume(0.5);    // 音乐音量

// 静音
audioManager.setMuted(true);

// 获取统计信息
const stats = audioManager.getStats();
console.log('音效数量:', stats.soundCount);
console.log('音乐数量:', stats.musicCount);
console.log('活跃音效:', stats.activeSounds);
console.log('当前音乐:', stats.currentMusic);
```

---

## 错误处理和调试

### 功能概述

完整的错误处理和调试系统，包括：
- 全局错误捕获
- 日志系统
- 调试工具

### 错误处理

```javascript
import { ErrorHandler } from './src/core/ErrorHandler.js';

// 全局错误处理器会自动创建
// 可通过 window.errorHandler 访问

// 手动处理错误
errorHandler.handleError({
  type: 'custom',
  message: '自定义错误',
  context: 'myFunction',
  timestamp: Date.now()
});

// 包装函数（自动捕获错误）
const safeFunction = errorHandler.wrap(riskyFunction, 'contextName');

// 包装异步函数
const safeAsyncFunction = errorHandler.wrapAsync(asyncFunction, 'contextName');

// 添加错误回调
errorHandler.onError((error) => {
  console.log('发生错误:', error);
  // 可以在这里上报错误到服务器
});

// 获取错误历史
const errors = errorHandler.getErrors();

// 清除错误
errorHandler.clearErrors();

// 启用/禁用错误UI
errorHandler.setErrorUIEnabled(true);
```

### 日志系统

```javascript
import { logger, LogLevel } from './src/core/Logger.js';

// 记录不同级别的日志
logger.debug('调试信息');
logger.info('普通信息');
logger.warn('警告信息');
logger.error('错误信息');

// 设置日志级别
logger.setLevel(LogLevel.DEBUG);  // 显示所有日志
logger.setLevel(LogLevel.INFO);   // 只显示 INFO 及以上
logger.setLevel(LogLevel.WARN);   // 只显示 WARN 及以上
logger.setLevel(LogLevel.ERROR);  // 只显示 ERROR

// 添加日志过滤器
logger.addFilter(/^Player/);  // 只显示以 "Player" 开头的日志

// 添加函数过滤器
logger.addFilter((log) => log.message.includes('important'));

// 清除过滤器
logger.clearFilters();

// 添加日志监听器
logger.addListener((log) => {
  console.log('新日志:', log);
  // 可以在这里将日志发送到服务器
});

// 获取日志历史
const allLogs = logger.getLogs();
const errorLogs = logger.getLogsByLevel(LogLevel.ERROR);
const recentLogs = logger.getRecentLogs(10);  // 最近10条

// 导出日志
logger.downloadLogs('text');  // 导出为文本文件
logger.downloadLogs('json');  // 导出为JSON文件

// 创建子日志器
const gameLogger = logger.createChild('Game');
gameLogger.info('游戏开始');  // 日志会带有 [Game] 前缀

// 清除日志
logger.clear();
```

### 调试工具

```javascript
import { DebugTools } from './src/core/DebugTools.js';

// 创建调试工具
const debugTools = new DebugTools({
  enabled: true,
  position: { x: 10, y: 10 }
});

// 在游戏循环中更新和渲染
function gameLoop(deltaTime) {
  // 更新调试工具
  debugTools.update(deltaTime, entities);
  
  // 渲染调试信息
  debugTools.render(ctx, camera);
}

// 切换调试模式（F3）
debugTools.toggle();

// 设置调试选项
debugTools.setOption('showColliders', true);   // 显示碰撞盒
debugTools.setOption('showPaths', true);       // 显示路径
debugTools.setOption('showRanges', true);      // 显示攻击范围
debugTools.setOption('showGrid', true);        // 显示网格
debugTools.setOption('showEntityIds', true);   // 显示实体ID

// 选择实体查看详细信息
debugTools.selectEntity(entity);

// 更新性能统计
debugTools.updateStats({
  fps: 60,
  frameTime: 16.67,
  entityCount: 100,
  visibleEntityCount: 45,
  drawCalls: 50,
  particleCount: 200
});

// 键盘快捷键
// F3: 切换调试模式
// F4: 切换碰撞盒显示
// F5: 切换路径显示
// F6: 切换攻击范围显示
// F7: 切换网格显示
// F8: 导出日志
```

### 调试最佳实践

```javascript
// 1. 使用日志记录关键操作
logger.info('玩家进入游戏场景');
logger.debug('加载地图数据:', mapData);

// 2. 使用错误包装保护关键代码
const safeUpdate = errorHandler.wrap(() => {
  // 可能出错的更新逻辑
}, 'GameLoop.update');

// 3. 使用性能监控定位瓶颈
perfMonitor.startTimer('heavyOperation');
heavyOperation();
perfMonitor.endTimer('heavyOperation');

// 4. 使用调试工具可视化游戏状态
debugTools.setOption('showColliders', true);
debugTools.setOption('showPaths', true);

// 5. 生产环境禁用调试功能
if (process.env.NODE_ENV === 'production') {
  logger.setLevel(LogLevel.ERROR);
  debugTools.setEnabled(false);
  perfMonitor.setEnabled(false);
}
```

---

## 完整示例

### 创建一个简单的游戏

```javascript
import { GameEngine } from './src/core/GameEngine.js';
import { GameScene } from './src/scenes/GameScene.js';
import { CharacterScene } from './src/scenes/CharacterScene.js';

// 创建游戏引擎
const gameEngine = new GameEngine({
  canvasId: 'gameCanvas',
  width: 1280,
  height: 720,
  targetFPS: 60
});

// 注册场景
gameEngine.sceneManager.registerScene('Character', CharacterScene);
gameEngine.sceneManager.registerScene('Game', GameScene);

// 启动游戏
await gameEngine.start();

// 切换到角色选择场景
gameEngine.sceneManager.switchTo('Character');
```

### 创建自定义场景

```javascript
import { Scene } from './src/core/Scene.js';

class MyScene extends Scene {
  constructor(engine) {
    super(engine);
    this.entities = [];
  }
  
  async enter(data) {
    // 场景进入时的初始化
    logger.info('进入自定义场景');
    
    // 创建实体
    this.player = this.createPlayer();
    this.entities.push(this.player);
  }
  
  update(deltaTime) {
    // 更新游戏逻辑
    this.entities.forEach(entity => {
      // 更新实体
    });
  }
  
  render(ctx) {
    // 渲染游戏
    ctx.fillStyle = '#000';
    ctx.fillRect(0, 0, this.engine.width, this.engine.height);
    
    this.entities.forEach(entity => {
      // 渲染实体
    });
  }
  
  exit() {
    // 场景退出时的清理
    logger.info('退出自定义场景');
    this.entities = [];
  }
}
```

---

## 总结

HTML5 MMRPG 游戏引擎提供了完整的游戏开发功能：

### 核心系统
- ✅ ECS 架构
- ✅ 场景管理
- ✅ 实体和组件系统

### 游戏系统
- ✅ 角色属性系统（五大属性）
- ✅ 元素系统（13种元素，五行相克）
- ✅ 技能树系统（三职业技能树）
- ✅ 状态效果系统（6种状态效果）
- ✅ 兵种系统（9种兵种，相克关系）
- ✅ 战斗系统（目标选择、攻击、技能）
- ✅ 移动系统（键盘、点击、碰撞、相机）

### 视觉效果
- ✅ 粒子特效系统
- ✅ 技能特效
- ✅ 战斗特效
- ✅ 动画系统

### 性能和工具
- ✅ 对象池
- ✅ 渲染优化
- ✅ 性能监控
- ✅ 资源管理
- ✅ 错误处理
- ✅ 日志系统
- ✅ 调试工具

### 特点
- 🚀 高性能（目标 60 FPS）
- 🎨 丰富的视觉效果
- 🔧 完善的开发工具
- 📚 详细的文档和示例
- 🧪 完整的测试覆盖

所有系统都经过充分测试，提供了清晰的 API 和使用示例，可以快速开始游戏开发。
