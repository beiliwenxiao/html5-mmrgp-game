# 游戏系统 (Game Systems)

本目录包含游戏的各种系统实现。系统负责处理游戏逻辑和实体行为。

## MovementSystem（移动系统）

移动系统处理实体的移动逻辑，包括键盘移动、点击移动、碰撞检测和相机跟随。

### 功能特性

1. **键盘移动**
   - 支持 WASD 和方向键控制
   - 自动归一化斜向移动速度
   - 实时更新移动动画

2. **点击移动**
   - 鼠标左键点击目标位置
   - 直线路径移动
   - 自动到达目标点停止

3. **碰撞检测**
   - AABB（轴对齐包围盒）碰撞检测
   - 地图边界检测
   - 基于瓦片的障碍物检测
   - 自动阻止角色穿过障碍物
   - 点击移动遇到障碍物自动停止

4. **相机跟随**
   - 平滑跟随玩家
   - 相机边界限制
   - 死区检测避免抖动

### 使用示例

```javascript
import { MovementSystem } from './systems/MovementSystem.js';
import { InputManager } from './core/InputManager.js';
import { Camera } from './rendering/Camera.js';

// 创建输入管理器和相机
const inputManager = new InputManager(canvas);
const camera = new Camera(400, 300, 800, 600);

// 创建碰撞地图（可选）
const collisionMap = [
  [false, false, true, false],
  [false, false, true, false],
  [false, false, false, false]
];

// 创建移动系统
const movementSystem = new MovementSystem({
  inputManager,
  camera,
  mapBounds: { minX: 0, minY: 0, maxX: 2000, maxY: 2000 },
  collisionMap,
  tileSize: 32
});

// 设置玩家实体
movementSystem.setPlayerEntity(playerEntity);

// 在游戏循环中更新
function gameLoop(deltaTime) {
  movementSystem.update(deltaTime, entities);
  inputManager.update(); // 清除本帧输入状态
}
```

### 配置选项

```javascript
{
  inputManager: InputManager,    // 输入管理器（必需）
  camera: Camera,                 // 相机（可选）
  mapBounds: {                    // 地图边界（可选）
    minX: 0,
    minY: 0,
    maxX: 2000,
    maxY: 2000
  },
  collisionMap: Array<Array<boolean>>,  // 碰撞地图（可选）
  tileSize: 32                    // 瓦片大小（默认32）
}
```

### 实体要求

MovementSystem 需要实体包含以下组件：

- **TransformComponent**（必需）：存储位置信息
- **MovementComponent**（必需）：存储移动状态和速度
- **SpriteComponent**（可选）：用于切换移动动画

### API 方法

#### `setPlayerEntity(entity)`
设置玩家实体，用于键盘控制和相机跟随。

#### `setCollisionMap(collisionMap, tileSize)`
设置碰撞地图数据。

#### `setMapBounds(minX, minY, maxX, maxY)`
设置地图边界，同时更新相机边界。

#### `update(deltaTime, entities)`
更新系统，处理所有实体的移动逻辑。

#### `canMoveTo(x, y, entity)`
检查实体是否可以移动到指定位置。

#### `checkAABBCollision(rect1, rect2)`
AABB 碰撞检测工具方法。

#### `isWithinMapBounds(x, y)`
检查坐标是否在地图边界内。

#### `checkCollisionMap(x, y)`
检查指定坐标是否与碰撞地图中的障碍物碰撞。

### 碰撞检测详解

#### 地图边界检测

地图边界通过 `mapBounds` 配置定义：
```javascript
mapBounds: {
  minX: 0,    // 左边界
  minY: 0,    // 上边界
  maxX: 2000, // 右边界
  maxY: 2000  // 下边界
}
```

当实体尝试移动到边界外时，移动会被自动阻止。

#### 障碍物碰撞检测

障碍物通过碰撞地图定义，这是一个二维布尔数组：
```javascript
const collisionMap = [
  [false, false, true, false],  // 第一行，第3列是障碍物
  [false, false, true, false],  // 第二行，第3列是障碍物
  [false, false, false, false]  // 第三行，全部可通行
];
```

- `true` 表示该瓦片有障碍物，不可通行
- `false` 表示该瓦片可通行

系统会自动将世界坐标转换为瓦片坐标进行检测：
```javascript
const tileX = Math.floor(worldX / tileSize);
const tileY = Math.floor(worldY / tileSize);
```

#### AABB 碰撞检测

AABB（Axis-Aligned Bounding Box）用于检测两个矩形是否重叠：
```javascript
const rect1 = { x: 0, y: 0, width: 50, height: 50 };
const rect2 = { x: 25, y: 25, width: 50, height: 50 };

if (movementSystem.checkAABBCollision(rect1, rect2)) {
  console.log('碰撞！');
}
```

这个方法可用于实体间碰撞检测（未来功能）。

#### 碰撞响应

当检测到碰撞时，系统会：
1. **键盘移动**：阻止位置更新，实体停留在当前位置
2. **点击移动**：清除移动路径，切换到待机动画

### 测试

运行单元测试：
```bash
node src/systems/MovementSystem.test.js
```

查看可视化演示：
```bash
# 在浏览器中打开以下文件
test-movement.html          # 基础移动测试
test-click-movement.html    # 点击移动测试
test-collision-visual.html  # 碰撞检测可视化测试
```

### 需求映射

- **需求 4.1**：键盘移动控制（WASD/方向键）
- **需求 4.2**：点击移动
- **需求 4.3**：移动动画切换
- **需求 4.4**：碰撞检测和障碍物
- **需求 4.5**：相机跟随

### 注意事项

1. 键盘移动优先级高于点击移动
2. 碰撞检测基于实体中心点
3. 相机跟随使用平滑插值，可通过 `camera.followSpeed` 调整
4. 地图边界和碰撞地图是可选的，不设置则不进行相应检测
5. 每帧需要调用 `inputManager.update()` 清除输入状态

### 未来扩展

- [ ] A* 寻路算法支持
- [ ] 实体间碰撞检测
- [ ] 多路径点支持
- [ ] 移动速度修正（地形影响）
- [ ] 跳跃和冲刺功能

---

## CombatSystem（战斗系统）

战斗系统处理目标选择、攻击、技能释放和伤害计算等战斗逻辑。

### 功能特性

1. **目标选择**
   - 鼠标左键点击敌人选中目标
   - 目标高亮显示（黄色圆圈）
   - 目标框架UI显示（右上角）
   - 按ESC取消选中
   - 自动清除死亡目标

2. **普通攻击**
   - 自动攻击选中的目标
   - 攻击范围检测
   - 攻击冷却计时器
   - 攻击动画播放
   - 超出范围自动停止攻击

3. **伤害计算和应用**
   - 基础伤害公式（攻击力 - 防御力）
   - 随机伤害波动（±10%）
   - 最小伤害保证（至少1点）
   - 伤害数字飘字效果
   - 生命值条实时更新
   - 受击闪烁效果

4. **技能系统**
   - 从数据服务加载技能
   - 技能快捷键绑定（1-6数字键）
   - 技能释放条件验证（冷却、魔法值、范围）
   - 技能伤害计算（基于倍率）
   - 技能效果应用（伤害、治疗、Buff）
   - 技能冷却计时器
   - 技能动画播放

5. **死亡处理**
   - 自动检测生命值为零
   - 播放死亡动画
   - 清除战斗目标
   - 移除死亡实体
   - 玩家死亡显示复活界面
   - 玩家自动复活（5秒后）

6. **目标框架UI**
   - 显示目标名称和等级
   - 显示生命值条和数值
   - 生命值条颜色根据百分比变化（绿/黄/红）
   - 固定在屏幕右上角

7. **目标高亮**
   - 黄色圆圈标记选中的敌人
   - 跟随目标位置移动
   - 可配置颜色、线宽和半径

### 使用示例

```javascript
import { CombatSystem } from './systems/CombatSystem.js';
import { InputManager } from './core/InputManager.js';
import { Camera } from './rendering/Camera.js';

// 创建输入管理器和相机
const inputManager = new InputManager(canvas);
const camera = new Camera(400, 300, 800, 600);

// 创建战斗系统
const combatSystem = new CombatSystem({
  inputManager,
  camera
});

// 设置玩家实体
combatSystem.setPlayerEntity(playerEntity);

// 在游戏循环中更新
function gameLoop(deltaTime) {
  combatSystem.update(deltaTime, entities);
  inputManager.update(); // 清除本帧输入状态
}

// 在渲染循环中渲染UI
function render(ctx) {
  // ... 渲染其他内容 ...
  combatSystem.render(ctx); // 渲染目标高亮和目标框架
}
```

### 配置选项

```javascript
{
  inputManager: InputManager,    // 输入管理器（必需）
  camera: Camera                  // 相机（可选，用于坐标转换）
}
```

### 实体要求

CombatSystem 需要实体包含以下组件：

- **TransformComponent**（必需）：存储位置信息
- **CombatComponent**（必需）：存储战斗状态和目标
- **StatsComponent**（必需）：存储生命值等属性

### API 方法

#### `setPlayerEntity(entity)`
设置玩家实体，用于目标选择和战斗逻辑。

#### `update(deltaTime, entities)`
更新系统，处理目标选择输入和战斗逻辑。

#### `render(ctx)`
渲染战斗系统UI，包括目标高亮和目标框架。

#### `selectTarget(target)`
手动选中目标实体。

#### `clearTarget()`
清除当前选中的目标。

#### `getSelectedTarget()`
获取当前选中的目标实体。

#### `findEnemyAtPosition(position, entities)`
查找指定位置的敌人实体（用于点击检测）。

#### `handleAutoAttack(currentTime, entities)`
处理自动攻击逻辑，在范围内且冷却完成时自动攻击目标。

#### `isInRange(attacker, target, range)`
检查攻击者是否在目标的攻击范围内。

#### `performAttack(attacker, target, currentTime)`
执行攻击，播放攻击动画并更新冷却时间。

#### `getAttackCooldownProgress(entity)`
获取实体的攻击冷却进度（0-1）。

#### `calculateDamage(attacker, target)`
计算攻击者对目标造成的伤害值。

#### `applyDamage(target, damage)`
对目标应用伤害，扣除生命值并显示伤害数字。

#### `showDamageNumber(position, damage)`
在指定位置显示伤害数字飘字效果。

#### `updateDamageNumbers(deltaTime)`
更新所有伤害数字的位置和生命周期。

#### `playHitEffect(target)`
播放目标的受击效果（闪烁）。

#### `loadSkills(entity, skillIds)`
从数据服务加载技能到实体的战斗组件。

#### `handleSkillInput(currentTime, entities)`
处理技能快捷键输入（1-6数字键）。

#### `tryUseSkill(caster, skill, currentTime, entities)`
尝试使用技能，验证所有释放条件。

#### `applySkillEffects(caster, target, skill, currentTime)`
应用技能效果（伤害、治疗、Buff等）。

#### `calculateSkillDamage(caster, target, skill)`
计算技能伤害（基于攻击力和技能倍率）。

#### `applyHeal(target, skill)`
应用治疗效果，恢复生命值。

#### `getSkillCooldownProgress(entity, skillIndex)`
获取指定技能的冷却进度（0-1）。

#### `checkDeath(entities)`
检查所有实体的生命值，处理死亡。

#### `handleDeath(entity)`
处理实体死亡，播放动画并标记状态。

#### `handlePlayerDeath(player)`
处理玩家死亡，显示复活界面。

#### `revivePlayer(player)`
复活玩家，恢复生命值和魔法值。

#### `removeDeadEntity(entity)`
移除死亡的实体。

#### `getDeadEntities(entities)`
获取所有死亡的实体列表。

#### `getAliveEntities(entities)`
获取所有存活的实体列表。

### 目标选择机制

#### 点击检测

系统使用圆形区域进行点击检测：
```javascript
const clickRadius = 30; // 点击检测半径（像素）
```

当玩家点击时，系统会：
1. 获取鼠标世界坐标
2. 查找点击位置附近的所有敌人
3. 选中距离最近的敌人（在检测半径内）

#### 目标验证

系统会自动验证目标的有效性：
- 检查目标是否仍然存在
- 检查目标生命值是否大于0
- 自动清除死亡或无效的目标

#### 取消选中

玩家可以通过以下方式取消选中：
- 按ESC键
- 目标死亡时自动清除
- 选中新目标时自动替换

### 目标高亮配置

可以自定义目标高亮的外观：
```javascript
combatSystem.highlightConfig = {
  color: '#ffff00',    // 高亮颜色（黄色）
  lineWidth: 2,        // 线条宽度
  radius: 30           // 圆圈半径
};
```

### 测试

运行单元测试：
```bash
# 在浏览器中打开
test-combat-system.html
```

查看可视化演示：
```bash
# 在浏览器中打开
test-combat-target-selection.html
```

### 普通攻击机制

#### 自动攻击条件

系统会在每帧检查以下条件，满足时自动执行攻击：
1. 玩家已选中目标
2. 目标仍然存活（HP > 0）
3. 玩家在目标的攻击范围内
4. 攻击冷却已完成

#### 攻击范围检测

使用欧几里得距离计算：
```javascript
const dx = targetX - attackerX;
const dy = targetY - attackerY;
const distance = Math.sqrt(dx * dx + dy * dy);
return distance <= attackRange;
```

#### 攻击冷却

每次攻击后会进入冷却状态：
- 冷却时间由 `CombatComponent.attackCooldown` 定义（毫秒）
- 可以通过 `getAttackCooldownProgress()` 获取冷却进度（0-1）
- 冷却完成后才能再次攻击

#### 攻击动画

攻击时会自动播放攻击动画：
1. 切换到 'attack' 动画
2. 300ms 后恢复到 'idle' 动画
3. 动画时长可以根据实际精灵动画调整

### 伤害计算机制

#### 伤害公式

基础伤害计算公式：
```javascript
baseDamage = attacker.attack - target.defense;
damage = Math.max(1, baseDamage); // 最小伤害为1
```

#### 随机波动

为了增加战斗的不确定性，伤害会有±10%的随机波动：
```javascript
const variance = 0.1;
const randomFactor = 1 + (Math.random() * 2 - 1) * variance;
finalDamage = Math.floor(damage * randomFactor);
```

例如，基础伤害为10点，实际伤害会在9-11点之间随机。

#### 伤害应用

伤害应用流程：
1. 计算伤害值
2. 扣除目标生命值
3. 显示伤害数字飘字
4. 播放受击闪烁效果
5. 更新生命值条显示

#### 伤害数字飘字

伤害数字特效：
- 从目标上方开始显示
- 向上飘动并逐渐消失
- 持续时间1秒
- 红色粗体文字，带黑色描边
- 透明度随时间递减

#### 受击效果

目标受击时会触发：
- 精灵闪烁效果（200ms）
- 可以扩展为颜色变化、震动等效果

### 技能系统机制

#### 技能数据结构

技能数据包含以下字段：
```javascript
{
  id: 'skill_id',           // 技能ID
  name: '技能名称',          // 技能名称
  cooldown: 5000,           // 冷却时间（毫秒）
  manaCost: 20,             // 魔法消耗
  castTime: 0.5,            // 施法时间（秒）
  range: 100,               // 施法范围
  damage: 1.5,              // 伤害倍率
  type: 'physical',         // 类型：physical/magic/heal/buff
  effects: [],              // 额外效果列表
  animation: 'skill_1',     // 动画名称
  particleEffect: 'fire'    // 粒子特效
}
```

#### 技能快捷键

技能通过数字键1-6触发：
- 按键1：使用第1个技能
- 按键2：使用第2个技能
- 按键3：使用第3个技能
- 按键4：使用第4个技能
- 按键5：使用第5个技能
- 按键6：使用第6个技能

#### 技能释放条件

使用技能前会验证以下条件：
1. **冷却检查**：技能冷却是否完成
2. **魔法值检查**：是否有足够的魔法值
3. **目标检查**：需要目标的技能是否已选中目标
4. **范围检查**：目标是否在技能范围内

任何条件不满足都会阻止技能释放。

#### 技能伤害计算

技能伤害基于攻击力和技能倍率：
```javascript
baseDamage = caster.attack * skill.damage;
if (skill.type === 'physical') {
  baseDamage -= target.defense;
}
finalDamage = Math.max(1, baseDamage) * randomFactor;
```

例如：
- 攻击力20，技能倍率1.5
- 基础伤害 = 20 * 1.5 = 30
- 减去防御力8 = 22
- 加上随机波动 = 19-25

#### 技能类型

支持多种技能类型：

**物理/魔法伤害技能**：
- 对目标造成伤害
- 物理技能受防御力影响
- 魔法技能不受防御力影响（可扩展）

**治疗技能**：
- 恢复生命值
- 显示绿色治疗数字
- 可以治疗自己或队友

**Buff技能**：
- 增强自身属性
- 持续一定时间
- 可以叠加多个Buff

#### 技能效果

技能可以附带额外效果：
- 眩晕（stun）
- 减速（slow）
- 持续伤害（burn/poison）
- 属性增强（defense_buff）
- 定身（root）

#### 技能冷却

每个技能独立冷却：
- 使用后立即进入冷却
- 冷却期间无法再次使用
- 可以通过UI显示冷却进度

### 死亡处理机制

#### 死亡检测

系统每帧检查所有实体的生命值：
```javascript
if (stats.hp <= 0 && !entity.isDying && !entity.isDead) {
  handleDeath(entity);
}
```

#### 死亡流程

实体死亡时的处理流程：
1. 标记为正在死亡（`isDying = true`）
2. 播放死亡动画
3. 清除战斗目标
4. 区分玩家和敌人处理

#### 敌人死亡

敌人死亡后：
- 播放死亡动画（1秒）
- 动画结束后移除实体
- 标记为已死亡（`isDead = true`）
- 如果是当前目标，自动清除选中

#### 玩家死亡

玩家死亡后：
- 播放死亡动画
- 清除选中的目标
- 显示复活界面（待实现）
- 5秒后自动复活

#### 玩家复活

复活时会：
- 恢复满生命值和魔法值
- 清除死亡标记
- 恢复待机动画
- 可以继续战斗

#### 实体过滤

提供工具方法过滤实体：
```javascript
// 获取存活的实体
const aliveEntities = combatSystem.getAliveEntities(entities);

// 获取死亡的实体
const deadEntities = combatSystem.getDeadEntities(entities);
```

这对于场景管理器清理死亡实体很有用。

### 需求映射

- **需求 5.1**：目标选择（点击敌人）
- **需求 5.2**：普通攻击（自动攻击、范围检测、冷却）
- **需求 5.3**：技能快捷键释放
- **需求 5.4**：技能冷却显示
- **需求 5.5**：伤害计算、应用、伤害数字显示、生命值更新
- **需求 5.6**：死亡检测、死亡动画、实体移除、玩家复活
- **需求 6.1**：技能列表加载
- **需求 6.2**：技能释放条件验证
- **需求 6.3**：技能动画和音效
- **需求 6.4**：技能效果计算和应用
- **需求 6.5**：技能冷却计时器
- **需求 7.3**：目标框架UI显示

### 注意事项

1. 点击敌人时会选中目标，点击空白处不会取消选中（避免与移动冲突）
2. 目标框架固定在屏幕右上角，不受相机移动影响
3. 目标高亮跟随目标实体移动
4. 系统会自动清除死亡的目标
5. 每帧需要调用 `inputManager.update()` 清除输入状态

### 未来扩展

- [x] 普通攻击逻辑
- [x] 攻击范围检测
- [x] 伤害计算和应用
- [x] 技能系统
- [x] 死亡处理
- [ ] 完整的Buff/Debuff系统
- [ ] 技能连击系统
- [ ] 经验值和掉落物系统
- [ ] 复活界面UI
- [ ] 更多战斗特效和动画
