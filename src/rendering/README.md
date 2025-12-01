# 渲染系统 (Rendering System)

渲染系统负责游戏的视觉呈现，包括相机管理、精灵渲染、动画播放和视锥剔除优化。

## 模块组成

### Camera (相机)
管理游戏视野和坐标转换。

**主要功能:**
- 相机位置控制
- 平滑跟随目标
- 边界限制
- 世界坐标与屏幕坐标转换
- 视锥剔除检测

**使用示例:**
```javascript
import { Camera } from './rendering/Camera.js';

const camera = new Camera(0, 0, 1280, 720);
camera.setBounds(0, 0, 2000, 2000);
camera.setTarget(playerTransform);
camera.update(deltaTime);
```

### RenderSystem (渲染系统)
核心渲染系统，管理整个渲染流程。

**主要功能:**
- 视锥剔除（只渲染可见实体）
- 实体按Y坐标排序（深度效果）
- 分层渲染（背景、实体、UI）
- 相机变换应用
- 调试信息显示

**使用示例:**
```javascript
import { RenderSystem } from './rendering/RenderSystem.js';

const renderSystem = new RenderSystem(ctx, assetManager, 1280, 720);
renderSystem.setDebugMode(true);
renderSystem.update(deltaTime);
renderSystem.render(entities);
```

### SpriteRenderer (精灵渲染器)
负责精灵图的绘制和特效。

**主要功能:**
- 精灵图绘制（支持精灵图集）
- 精灵翻转（水平/垂直）
- 透明度控制
- 颜色叠加
- 调试绘制（碰撞盒、坐标）

**使用示例:**
```javascript
import { SpriteRenderer } from './rendering/SpriteRenderer.js';

const spriteRenderer = new SpriteRenderer(assetManager);
spriteRenderer.render(ctx, entity, transform, sprite);
```

### AnimationManager (动画管理器)
管理精灵动画和动画状态机。

**主要功能:**
- 动画模板管理
- 动画播放控制
- 帧更新逻辑
- 动画状态机

**动画状态:**
- `IDLE` - 待机
- `WALK` - 行走
- `ATTACK` - 攻击
- `SKILL` - 技能
- `HIT` - 受击
- `DEATH` - 死亡

**使用示例:**
```javascript
import { AnimationManager, AnimationState } from './rendering/AnimationManager.js';

const animationManager = new AnimationManager();
animationManager.applyAnimationTemplate(entity, 'player');
animationManager.updateAll(entities, deltaTime);

// 播放动画
const sprite = entity.getComponent('sprite');
sprite.playAnimation(AnimationState.WALK);
```

### AnimationStateMachine (动画状态机)
管理动画状态转换逻辑。

**使用示例:**
```javascript
import { AnimationStateMachine, AnimationState } from './rendering/AnimationManager.js';

const stateMachine = new AnimationStateMachine(entity);
stateMachine.transitionTo(AnimationState.ATTACK);
stateMachine.update(deltaTime);
```

## 渲染流程

1. **清空Canvas** - 清除上一帧内容
2. **应用相机变换** - 将世界坐标转换为屏幕坐标
3. **渲染背景层** - 绘制背景和网格
4. **视锥剔除** - 过滤出可见实体
5. **深度排序** - 按Y坐标排序实体
6. **渲染实体** - 使用SpriteRenderer绘制每个实体
7. **渲染UI层** - 绘制UI元素（不受相机影响）
8. **渲染调试信息** - 显示调试数据（如果启用）

## 性能优化

### 视锥剔除
只渲染在相机视野内的实体，大幅减少绘制调用。

```javascript
// 自动在RenderSystem中执行
const visibleEntities = renderSystem.cullEntities(entities);
```

### 深度排序
按Y坐标排序实体，实现正确的遮挡关系。

```javascript
// 自动在RenderSystem中执行
const sortedEntities = renderSystem.sortEntitiesByDepth(visibleEntities);
```

### 批量渲染
按精灵图集分组渲染，减少纹理切换。

```javascript
spriteRenderer.batchRender(ctx, renderList);
```

## 调试功能

启用调试模式后会显示：
- 实体碰撞盒（红色边框）
- 实体中心点（绿色圆点）
- 实体坐标和ID
- 动画状态信息
- 翻转状态
- 相机位置
- 实体数量统计

```javascript
renderSystem.setDebugMode(true);
```

## 测试

运行 `test-rendering.html` 查看渲染系统演示：
- 使用WASD移动相机
- 点击实体选中
- 切换调试模式
- 添加新实体
- 播放不同动画
- 切换精灵翻转

## 与其他系统集成

渲染系统需要与以下组件配合使用：

### 必需组件
- `TransformComponent` - 提供位置、旋转、缩放信息
- `SpriteComponent` - 提供精灵和动画信息

### 可选组件
- `AssetManager` - 加载和管理精灵图资源
- `MovementComponent` - 提供移动状态用于动画切换
- `CombatComponent` - 提供战斗状态用于动画切换

## 未来扩展

- 粒子系统集成
- 光照和阴影效果
- 后处理效果（模糊、发光等）
- 多相机支持
- 视差滚动背景
- 精灵批处理优化
