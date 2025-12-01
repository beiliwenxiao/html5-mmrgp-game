# UI系统

UI系统负责管理游戏中所有的用户界面元素，包括生命值条、技能栏、小地图等。

## 架构

### UISystem
UI系统的核心类，负责管理所有UI元素的生命周期。

**主要功能：**
- 添加/移除UI元素
- 更新所有UI元素
- 按层级渲染UI元素
- 处理UI交互

### UIElement
所有UI组件的基类，定义了UI元素的基本属性和行为。

**基本属性：**
- `x, y`: 位置坐标
- `width, height`: 尺寸
- `visible`: 可见性
- `zIndex`: 渲染层级
- `alpha`: 透明度

**基本方法：**
- `update(deltaTime)`: 更新逻辑
- `render(ctx)`: 渲染逻辑
- `show()/hide()`: 显示/隐藏
- `containsPoint(x, y)`: 点击检测

## UI组件

### HealthBar（生命值条）
显示角色或敌人的生命值。

**特性：**
- 平滑过渡动画
- 百分比显示
- 支持玩家和目标显示

### ManaBar（魔法值条）
显示角色的魔法值。

**特性：**
- 平滑过渡动画
- 百分比显示

### SkillBar（技能栏）
显示角色的技能图标和冷却状态。

**特性：**
- 4-6个技能图标
- 冷却遮罩动画
- 快捷键提示
- 魔法值不足提示

### Minimap（小地图）
显示简化的地图视图和实体位置。

**特性：**
- 地图视图
- 玩家位置标记（蓝点）
- 敌人位置标记（红点）

### NotificationSystem（通知系统）
显示游戏消息和通知。

**特性：**
- 消息队列
- 淡入淡出动画
- 经验值、升级通知

## 使用示例

```javascript
import { UISystem } from './ui/UISystem.js';
import { HealthBar } from './ui/HealthBar.js';

// 创建UI系统
const uiSystem = new UISystem();

// 创建生命值条
const healthBar = new HealthBar({
  x: 20,
  y: 20,
  width: 200,
  height: 20,
  currentValue: 80,
  maxValue: 100
});

// 添加到UI系统
uiSystem.addElement(healthBar);

// 在游戏循环中更新和渲染
function gameLoop(deltaTime) {
  uiSystem.update(deltaTime);
  uiSystem.render(ctx);
}
```

## 渲染层级

UI元素按照 `zIndex` 进行分层渲染：

- 0-9: 背景UI
- 10-19: 游戏内UI（生命值条、目标框架）
- 20-29: 技能栏、小地图
- 30-39: 通知消息
- 40+: 模态对话框

## 性能优化

- 只更新和渲染可见的UI元素
- 使用对象池管理频繁创建的UI元素
- 缓存静态UI元素的渲染结果
- 按需更新，避免每帧重绘

## 扩展性

所有UI组件都继承自 `UIElement`，可以轻松添加新的UI组件：

1. 创建新类继承 `UIElement`
2. 实现 `update()` 和 `render()` 方法
3. 添加到 `UISystem` 中

## 测试

每个UI组件都应该有对应的测试文件和独立的测试页面。

测试内容包括：
- 基本渲染
- 数值更新
- 动画效果
- 交互响应
