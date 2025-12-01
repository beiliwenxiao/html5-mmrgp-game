# Mock Data Service

模拟数据服务，用于前端开发和测试。

## 概述

MockDataService 提供了游戏所需的所有模拟数据，包括：
- 角色模板（战士、法师、弓箭手）
- 敌人模板（史莱姆、哥布林、骷髅）
- 技能数据（普通攻击和职业技能）
- 地图数据（测试地图）

## 使用方法

### 基本用法

```javascript
import { MockDataService } from './data/MockDataService.js';

// 创建实例
const mockDataService = new MockDataService();

// 获取角色模板
const warriorTemplate = mockDataService.getCharacterTemplate('warrior');

// 创建角色实例
const character = mockDataService.createCharacter('MyHero', 'warrior');

// 获取技能数据
const skills = mockDataService.getCharacterSkills('mage');

// 获取地图数据
const map = mockDataService.getMapData('test_map');

// 创建敌人实例
const enemy = mockDataService.createEnemy('slime', { x: 100, y: 200 });
```

## API 文档

### 角色相关

#### `getCharacterTemplate(classType)`
获取角色模板数据。

**参数:**
- `classType` (string): 职业类型 ('warrior', 'mage', 'archer')

**返回:** 角色模板对象或 null

#### `getAllCharacterTemplates()`
获取所有角色模板。

**返回:** 包含所有角色模板的对象

#### `createCharacter(name, classType)`
创建角色实例。

**参数:**
- `name` (string): 角色名称
- `classType` (string): 职业类型

**返回:** 角色实例对象

### 敌人相关

#### `getEnemyTemplate(enemyId)`
获取敌人模板数据。

**参数:**
- `enemyId` (string): 敌人ID ('slime', 'goblin', 'skeleton')

**返回:** 敌人模板对象或 null

#### `getAllEnemyTemplates()`
获取所有敌人模板。

**返回:** 包含所有敌人模板的对象

#### `createEnemy(templateId, position)`
创建敌人实例。

**参数:**
- `templateId` (string): 敌人模板ID
- `position` (object): 位置 { x, y }

**返回:** 敌人实例对象

### 技能相关

#### `getSkillData(skillId)`
获取技能数据。

**参数:**
- `skillId` (string): 技能ID

**返回:** 技能数据对象或 null

#### `getCharacterSkills(classType)`
获取角色的所有技能。

**参数:**
- `classType` (string): 职业类型

**返回:** 技能数据数组

### 地图相关

#### `getMapData(mapId)`
获取地图数据。

**参数:**
- `mapId` (string): 地图ID ('test_map')

**返回:** 地图数据对象或 null

## 数据结构

### 角色模板
```javascript
{
    id: 'warrior',
    name: '战士',
    class: 'warrior',
    description: '近战物理职业，拥有高生命值和防御力',
    baseStats: {
        hp: 150,
        maxHp: 150,
        mp: 50,
        maxMp: 50,
        attack: 15,
        defense: 10,
        speed: 100
    },
    skills: ['basic_attack', 'warrior_slash', 'warrior_charge', 'warrior_defense'],
    spriteSheet: 'warrior_sprite',
    startPosition: { x: 400, y: 300 }
}
```

### 敌人模板
```javascript
{
    id: 'slime',
    name: '史莱姆',
    type: 'enemy',
    level: 1,
    stats: {
        hp: 30,
        maxHp: 30,
        attack: 5,
        defense: 2,
        speed: 50
    },
    aiType: 'passive',
    attackRange: 30,
    detectionRange: 100,
    expReward: 10,
    lootTable: [...],
    spriteSheet: 'slime_sprite'
}
```

### 技能数据
```javascript
{
    id: 'warrior_slash',
    name: '强力斩击',
    description: '造成150%物理伤害',
    icon: 'icon_warrior_slash',
    type: 'physical',
    cooldown: 5.0,
    manaCost: 15,
    castTime: 0.5,
    range: 60,
    damage: 1.5,
    effects: [],
    animation: 'skill_1',
    particleEffect: 'slash_heavy'
}
```

### 地图数据
```javascript
{
    id: 'test_map',
    name: '测试地图',
    width: 2000,
    height: 1500,
    tileSize: 32,
    backgroundColor: '#2d5016',
    layers: {
        background: [],
        collision: [...],
        decoration: []
    },
    spawnPoints: {
        player: { x: 400, y: 300 },
        enemies: [...]
    },
    boundaries: {
        minX: 0,
        minY: 0,
        maxX: 2000,
        maxY: 1500
    }
}
```

## 测试

运行测试文件：
```bash
# 在浏览器中打开
test-mock-data.html
```

或者在控制台中运行：
```javascript
import './data/MockDataService.test.js';
```
