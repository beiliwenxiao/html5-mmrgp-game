# HTML5 MMRPG Game

一个基于 HTML5 Canvas 的即时战斗 MMRPG 游戏，采用 ECS（Entity-Component-System）架构。采用Kiro开发。

## 项目结构

```
.
├── index.html          # 主HTML文件
├── src/                # 源代码目录
│   ├── main.js        # 游戏入口点
│   ├── core/          # 核心模块
│   │   ├── GameEngine.js      # 游戏引擎
│   │   ├── AssetManager.js    # 资源管理器
│   │   ├── InputManager.js    # 输入管理器
│   │   ├── Scene.js           # 场景基类
│   │   └── SceneManager.js    # 场景管理器
│   ├── ecs/           # 实体组件系统
│   │   ├── Entity.js          # 实体类
│   │   ├── Component.js       # 组件基类
│   │   ├── EntityFactory.js   # 实体工厂
│   │   └── components/        # 组件集合
│   │       ├── TransformComponent.js   # 位置变换
│   │       ├── SpriteComponent.js      # 精灵渲染
│   │       ├── AnimationComponent.js   # 动画
│   │       ├── MovementComponent.js    # 移动
│   │       ├── StatsComponent.js       # 属性
│   │       ├── CombatComponent.js      # 战斗
│   │       └── SkillComponent.js       # 技能
│   ├── rendering/     # 渲染系统
│   │   ├── Camera.js          # 相机
│   │   ├── RenderSystem.js    # 渲染系统
│   │   ├── SpriteRenderer.js  # 精灵渲染器
│   │   ├── AnimationManager.js # 动画管理器
│   │   ├── Particle.js        # 粒子类
│   │   ├── ParticleSystem.js  # 粒子系统
│   │   ├── SkillEffects.js    # 技能特效
│   │   └── CombatEffects.js   # 战斗特效
│   ├── systems/       # 游戏系统
│   │   ├── MovementSystem.js  # 移动系统
│   │   └── CombatSystem.js    # 战斗系统
│   ├── ui/            # UI系统
│   │   ├── UISystem.js        # UI管理器
│   │   ├── UIElement.js       # UI元素基类
│   │   ├── HealthBar.js       # 生命值条
│   │   ├── ManaBar.js         # 魔法值条
│   │   ├── SkillBar.js        # 技能栏
│   │   ├── PlayerInfoPanel.js # 玩家信息面板
│   │   ├── Minimap.js         # 小地图
│   │   └── NotificationSystem.js # 通知系统
│   ├── scenes/        # 游戏场景
│   │   ├── LoginScene.js      # 登录场景
│   │   ├── CharacterScene.js  # 角色选择场景
│   │   └── GameScene.js       # 游戏主场景
│   ├── network/       # 网络模块
│   │   ├── NetworkManager.js  # 网络管理器
│   │   └── MockWebSocket.js   # 模拟WebSocket
│   └── data/          # 数据模块
│       └── MockDataService.js # 模拟数据服务
├── styles/            # 样式文件
│   └── main.css       # 主样式文件
├── assets/            # 游戏资源（图片、音频等）
├── package.json       # 项目配置
└── vite.config.js     # Vite构建配置
```

## 开发环境设置

### 安装依赖

```bash
npm install
```

### 运行开发服务器

```bash
npm run dev
```

游戏将在 http://localhost:3000 自动打开。

### 构建生产版本

```bash
npm run build
```

构建输出将在 `dist/` 目录中。

### 预览生产版本

```bash
npm run preview
```

## 技术栈

- **HTML5 Canvas** - 游戏渲染
- **JavaScript (ES6+ Modules)** - 游戏逻辑
- **ECS 架构** - 实体组件系统
- **CSS3** - UI 样式
- **Vite** - 开发服务器和构建工具
- **Vitest** - 单元测试框架

## 核心特性

- ✨ **ECS 架构** - 模块化、可扩展的游戏架构
- 🎮 **实时战斗** - 流畅的即时战斗系统
- 🎯 **智能 AI** - 多种敌人行为模式（被动、主动、巡逻）
- 🎨 **粒子特效** - 丰富的视觉效果系统
- 🗺️ **场景管理** - 登录、角色选择、游戏主场景
- 🎪 **技能系统** - 多样化的技能和特效
- 📊 **完整 UI** - 生命值条、技能栏、小地图等
- 🎯 **碰撞检测** - AABB 碰撞和地图边界检测
- 📷 **相机系统** - 平滑跟随和边界限制

## 浏览器兼容性

- Chrome (推荐)
- Firefox
- Safari
- Edge

需要支持 HTML5 Canvas 和 requestAnimationFrame API。

## 开发状态

### 已完成的核心系统

#### 🎮 游戏引擎 (Core)
- ✅ GameEngine - 游戏引擎核心框架
- ✅ Canvas 初始化和自适应
- ✅ 60 FPS 游戏循环
- ✅ AssetManager - 资源管理器
- ✅ InputManager - 输入管理器
- ✅ SceneManager - 场景管理系统

#### 🎭 场景系统 (Scenes)
- ✅ LoginScene - 登录场景
- ✅ CharacterScene - 角色选择场景
- ✅ GameScene - 游戏主场景（完整整合）

#### 🧩 ECS 系统 (Entity-Component-System)
- ✅ Entity - 实体类
- ✅ Component - 组件基类
- ✅ EntityFactory - 实体工厂
- ✅ 7 种核心组件（Transform、Sprite、Animation、Movement、Stats、Combat、Skill）

#### 🎨 渲染系统 (Rendering)
- ✅ Camera - 相机系统（跟随、边界限制）
- ✅ RenderSystem - 渲染系统（视锥剔除、深度排序）
- ✅ SpriteRenderer - 精灵渲染器
- ✅ AnimationManager - 动画管理器
- ✅ ParticleSystem - 粒子系统（对象池、2000+ 粒子）
- ✅ SkillEffects - 技能特效（8 种预设特效）
- ✅ CombatEffects - 战斗特效（伤害数字、闪烁效果）

#### 🏃 移动系统 (MovementSystem)
- ✅ 键盘移动控制 (WASD/方向键)
- ✅ 鼠标点击移动
- ✅ AABB 碰撞检测
- ✅ 地图边界检测
- ✅ 障碍物碰撞检测
- ✅ 相机平滑跟随
- ✅ 移动动画自动切换

#### ⚔️ 战斗系统 (CombatSystem)
- ✅ 目标选择（点击敌人、高亮显示）
- ✅ 普通攻击（自动攻击、范围检测、冷却计时）
- ✅ 伤害计算和应用
- ✅ 伤害数字飘字效果
- ✅ 技能系统（快捷键释放、冷却管理）
- ✅ 技能效果（伤害、治疗、Buff）
- ✅ 死亡处理（动画、实体移除、玩家复活）

#### 🤖 敌人 AI 系统
- ✅ 被动型 AI（受击反击）
- ✅ 主动型 AI（自动追击）
- ✅ 巡逻型 AI（区域巡逻）
- ✅ 智能追击和攻击逻辑

#### 🖼️ UI 系统 (UISystem)
- ✅ UISystem - UI 管理器
- ✅ HealthBar - 生命值条
- ✅ ManaBar - 魔法值条
- ✅ SkillBar - 技能栏（快捷键显示、冷却进度）
- ✅ PlayerInfoPanel - 玩家信息面板
- ✅ Minimap - 小地图
- ✅ NotificationSystem - 通知系统

#### 🌐 网络和数据
- ✅ NetworkManager - 网络管理器
- ✅ MockWebSocket - 模拟 WebSocket
- ✅ MockDataService - 模拟数据服务

### 测试覆盖

- ✅ 单元测试：80+ 测试用例全部通过
- ✅ 可视化测试页面：15+ 独立测试页面
- ✅ 系统集成测试：完整游戏场景测试

### 待实现功能

- 🔄 真实服务器通信
- 🔄 背包和装备系统
- 🔄 任务系统
- 🔄 社交和组队功能
- 🔄 游戏资源（精灵图、音效）
- 🔄 性能优化和监控
- 🔄 存档系统

## 测试页面

### 核心系统测试
- `test-ecs.html` - ECS 系统测试
- `test-mock-data.html` - 模拟数据服务测试
- `test-rendering.html` - 渲染系统测试

### 移动系统测试
- `test-movement.html` - 移动系统基础测试
- `test-movement-system.html` - 移动系统完整测试
- `test-click-movement.html` - 点击移动测试
- `test-collision.html` - 碰撞检测测试
- `test-collision-visual.html` - 碰撞可视化测试
- `test-collision-unit.html` - 碰撞单元测试
- `test-camera-follow.html` - 相机跟随测试

### 战斗系统测试
- `test-combat-system.html` - 战斗系统单元测试
- `test-combat-target-selection.html` - 目标选择测试
- `test-combat-debug.html` - 战斗调试测试
- `test-combat-effects.html` - 战斗特效测试

### 特效系统测试
- `test-particle-system.html` - 粒子系统测试
- `test-skill-effects.html` - 技能特效测试

### 场景测试
- `test-scene-switch.html` - 场景切换测试
- `test-character-to-game.html` - 角色到游戏场景测试
- `test-game-scene.html` - 游戏主场景完整测试 ⭐

### UI 系统测试
- `test-ui-system.html` - UI 系统测试

## 游戏控制

### 移动控制
- **WASD** 或 **方向键** - 键盘移动
- **鼠标左键点击** - 点击移动到目标位置

### 战斗控制
- **鼠标左键点击敌人** - 选中目标
- **ESC** - 取消选中目标
- **1-6 数字键** - 释放技能

### 调试控制
- **F12** - 打开浏览器开发者工具查看日志

## 架构设计

### ECS 架构
项目采用 Entity-Component-System 架构模式：

- **Entity（实体）**: 游戏对象的容器（玩家、敌人、NPC）
- **Component（组件）**: 数据容器（位置、精灵、属性等）
- **System（系统）**: 处理逻辑（移动、战斗、渲染等）

### 系统执行顺序

**Update 循环**:
1. Camera - 更新相机位置
2. MovementSystem - 处理实体移动
3. CombatSystem - 处理战斗逻辑
4. ParticleSystem - 更新粒子效果
5. SkillEffects - 更新技能特效
6. UISystem - 更新 UI 界面
7. AI - 更新敌人行为
8. Cleanup - 清理死亡实体

**Render 循环**:
1. Background - 渲染地图背景
2. Entities - 渲染实体（深度排序）
3. Particles - 渲染粒子效果
4. SkillEffects - 渲染技能特效
5. CombatUI - 渲染战斗 UI
6. UI - 渲染界面元素

## 性能指标

- **目标帧率**: 60 FPS
- **粒子系统**: 支持 2000+ 粒子
- **实体数量**: 支持 100+ 同屏实体
- **渲染优化**: 视锥剔除、深度排序
- **内存优化**: 对象池、自动清理

## 开发规范

### 代码风格
- 类名使用 PascalCase
- 方法和变量使用 camelCase
- 常量使用 UPPER_SNAKE_CASE
- 文件名使用 PascalCase（类文件）或 camelCase（工具文件）

### 测试要求
- 核心功能必须有单元测试
- 测试覆盖率目标：80%+
- 提供独立的可视化测试页面

### 文档要求
- 每个模块必须有 README.md
- 复杂函数需要 JSDoc 注释
- API 变更需要记录

## 相关文档

- `IMPLEMENTATION_SUMMARY.md` - 移动系统实现总结
- `TASK_8_COMBAT_SYSTEM_COMPLETE.md` - 战斗系统完成总结
- `TASK_10_PARTICLE_EFFECTS_COMPLETE.md` - 粒子特效系统完成总结
- `TASK_11_GAME_SCENE_COMPLETE.md` - 游戏主场景完成总结
- `src/*/README.md` - 各模块详细文档

## 许可证

MIT
