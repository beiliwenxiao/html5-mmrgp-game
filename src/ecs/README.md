# ECS（实体组件系统）

## 概述

本模块实现了一个简化的实体组件系统（Entity Component System），用于管理游戏中的所有对象。

## 架构

### 核心类

#### Entity（实体）
实体是游戏对象的容器，通过组合不同的组件来实现不同的功能。

```javascript
import { Entity } from './ecs/Entity.js';

const entity = new Entity('player_1', 'player');
entity.addComponent(new TransformComponent(100, 200));
entity.addComponent(new StatsComponent({ maxHp: 100 }));
```

#### Component（组件）
组件是数据的容器，定义了实体的属性和行为。

```javascript
import { Component } from './ecs/Component.js';

class CustomComponent extends Component {
  constructor() {
    super('custom');
    this.data = {};
  }
  
  update(deltaTime) {
    // 更新逻辑
  }
}
```

#### EntityFactory（实体工厂）
工厂类用于根据模板数据创建实体。

```javascript
import { EntityFactory } from './ecs/EntityFactory.js';

const factory = new EntityFactory();

// 创建玩家
const player = factory.createPlayer({
  name: '战士',
  class: 'warrior',
  level: 1,
  stats: { maxHp: 100, attack: 15 },
  position: { x: 100, y: 200 }
});

// 创建敌人
const enemy = factory.createEnemy({
  templateId: 'slime',
  name: '史莱姆',
  level: 1,
  stats: { maxHp: 30, attack: 5 },
  position: { x: 300, y: 400 }
});
```

## 组件类型

### TransformComponent（变换组件）
管理实体的位置、旋转和缩放。

```javascript
const transform = entity.getComponent('transform');
transform.setPosition(100, 200);
transform.translate(10, 0); // 移动
transform.setRotation(Math.PI / 4); // 旋转45度
transform.setScale(2, 2); // 放大2倍
```

### StatsComponent（属性组件）
管理实体的生命值、魔法值和战斗属性。

```javascript
const stats = entity.getComponent('stats');

// 生命值操作
stats.takeDamage(10);
stats.heal(5);
console.log(stats.isAlive()); // true/false

// 魔法值操作
stats.consumeMana(20);
stats.restoreMana(10);

// 经验和升级
stats.addExp(100);
stats.levelUp();
```

### SpriteComponent（精灵组件）
管理实体的精灵图和动画。

```javascript
const sprite = entity.getComponent('sprite');

// 添加动画
sprite.addAnimation('walk', {
  frames: [0, 1, 2, 3],
  frameRate: 8,
  loop: true
});

// 播放动画
sprite.playAnimation('walk');

// 翻转和透明度
sprite.setFlipX(true);
sprite.setAlpha(0.5);
```

### CombatComponent（战斗组件）
管理实体的战斗状态和技能。

```javascript
const combat = entity.getComponent('combat');

// 设置目标
combat.setTarget(enemyEntity);

// 攻击
const currentTime = Date.now();
if (combat.canAttack(currentTime)) {
  combat.attack(currentTime);
}

// 技能
combat.addSkill({
  id: 'fireball',
  name: '火球术',
  cooldown: 5000,
  manaCost: 20
});

if (combat.canUseSkill('fireball', currentTime)) {
  const skill = combat.useSkill('fireball', currentTime);
}
```

### MovementComponent（移动组件）
管理实体的移动状态和路径。

```javascript
const movement = entity.getComponent('movement');

// 设置移动路径
movement.setPath([
  { x: 100, y: 100 },
  { x: 200, y: 200 },
  { x: 300, y: 300 }
]);

// 键盘移动
movement.startKeyboardMovement(100, 0); // 向右移动

// 停止移动
movement.stop();

// 检查移动状态
console.log(movement.isCurrentlyMoving());
```

## 使用示例

### 创建玩家角色

```javascript
import { EntityFactory } from './ecs/EntityFactory.js';

const factory = new EntityFactory();

const player = factory.createPlayer({
  name: '勇者',
  class: 'warrior',
  level: 5,
  stats: {
    maxHp: 150,
    maxMp: 80,
    attack: 20,
    defense: 15,
    speed: 100
  },
  position: { x: 400, y: 300 },
  skills: [
    {
      id: 'slash',
      name: '斩击',
      cooldown: 1000,
      manaCost: 10,
      damage: 30
    }
  ]
});

// 使用组件
const transform = player.getComponent('transform');
const stats = player.getComponent('stats');
const combat = player.getComponent('combat');

console.log(`${player.name} 位于 (${transform.position.x}, ${transform.position.y})`);
console.log(`生命值: ${stats.hp}/${stats.maxHp}`);
```

### 创建敌人

```javascript
const enemy = factory.createEnemy({
  templateId: 'goblin',
  name: '哥布林',
  level: 3,
  stats: {
    maxHp: 50,
    attack: 8,
    defense: 5,
    speed: 80
  },
  position: { x: 500, y: 300 },
  aiType: 'aggressive'
});
```

### 战斗示例

```javascript
// 玩家攻击敌人
const playerCombat = player.getComponent('combat');
const enemyStats = enemy.getComponent('stats');

playerCombat.setTarget(enemy);

const currentTime = Date.now();
if (playerCombat.canAttack(currentTime)) {
  playerCombat.attack(currentTime);
  
  // 计算伤害
  const playerStats = player.getComponent('stats');
  const damage = Math.max(1, playerStats.attack - enemyStats.defense);
  enemyStats.takeDamage(damage);
  
  console.log(`${player.name} 对 ${enemy.name} 造成 ${damage} 点伤害`);
  console.log(`${enemy.name} 剩余生命值: ${enemyStats.hp}/${enemyStats.maxHp}`);
  
  if (enemyStats.isDead()) {
    console.log(`${enemy.name} 被击败了！`);
  }
}
```

### 移动示例

```javascript
const movement = player.getComponent('movement');
const transform = player.getComponent('transform');

// 设置移动路径
movement.setPath([
  { x: 450, y: 300 },
  { x: 500, y: 350 }
]);

// 游戏循环中更新
function gameLoop(deltaTime) {
  if (movement.isMoving) {
    // 计算朝向目标的速度
    movement.calculateVelocityToTarget(transform.position);
    
    // 更新位置
    const dt = deltaTime / 1000; // 转换为秒
    transform.translate(
      movement.velocity.x * dt,
      movement.velocity.y * dt
    );
    
    // 检查是否到达目标点
    if (movement.hasReachedTarget(transform.position)) {
      if (!movement.moveToNextPathPoint()) {
        console.log('到达目的地');
      }
    }
  }
  
  // 更新实体
  player.update(deltaTime);
}
```

## 测试

访问 `test-ecs.html` 页面可以运行ECS系统的测试。

```bash
npm run dev
# 然后在浏览器中打开 http://localhost:3000/test-ecs.html
```

## 注意事项

1. **组件类型唯一性**: 每个实体只能有一个相同类型的组件
2. **组件更新顺序**: 组件按添加顺序更新
3. **实体生命周期**: 使用 `entity.destroy()` 销毁实体时会自动清理所有组件
4. **性能考虑**: 大量实体时应考虑使用对象池和空间分区优化

## 扩展

如果需要添加新的组件类型：

1. 继承 `Component` 基类
2. 在构造函数中调用 `super(type)` 设置组件类型
3. 实现 `update(deltaTime)` 方法（如果需要）
4. 在 `EntityFactory` 中添加创建逻辑（如果需要）

```javascript
import { Component } from './Component.js';

export class InventoryComponent extends Component {
  constructor() {
    super('inventory');
    this.items = [];
    this.maxSlots = 20;
  }
  
  addItem(item) {
    if (this.items.length < this.maxSlots) {
      this.items.push(item);
      return true;
    }
    return false;
  }
  
  removeItem(itemId) {
    const index = this.items.findIndex(item => item.id === itemId);
    if (index !== -1) {
      return this.items.splice(index, 1)[0];
    }
    return null;
  }
}
```
