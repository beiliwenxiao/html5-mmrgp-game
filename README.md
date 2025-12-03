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

#### ⚙️ 性能优化系统
- ✅ ObjectPool - 对象池（粒子、伤害数字复用）
- ✅ PerformanceMonitor - 性能监控（FPS、帧时间、绘制调用）
- ✅ 视锥剔除 - 只渲染可见实体
- ✅ 静态背景缓存 - 离屏 Canvas 优化

#### 🎵 资源系统
- ✅ PlaceholderAssets - 占位符资源生成器
- ✅ AudioManager - 音频管理器（音效、背景音乐）
- ✅ 资源加载进度跟踪

#### 🐛 调试和错误处理
- ✅ ErrorHandler - 全局错误处理器
- ✅ Logger - 日志系统（DEBUG/INFO/WARN/ERROR）
- ✅ DebugTools - 调试工具（碰撞盒、路径、实体信息）

### 测试覆盖

- ✅ **单元测试**: 80+ 测试用例全部通过
- ✅ **可视化测试页面**: 30+ 独立测试页面
- ✅ **系统集成测试**: 完整游戏场景测试
- ✅ **完整流程测试**: 登录→角色选择→游戏全流程
- ✅ **浏览器兼容性测试**: Chrome/Firefox/Safari/Edge
- ✅ **性能压力测试**: 大量实体、粒子、内存泄漏检测

### 待实现功能

- 🔄 真实服务器通信（WebSocket 后端）
- 🔄 背包和装备系统
- 🔄 任务系统
- 🔄 社交和组队功能
- 🔄 完整游戏资源（精灵图、音效）
- 🔄 存档系统
- 🔄 更多地图和敌人类型
- 🔄 PVP 战斗系统

## 测试页面

### 🧪 综合测试
- `test-complete-flow.html` - **完整游戏流程测试** ⭐ (登录→角色选择→游戏)
- `test-browser-compatibility.html` - **浏览器兼容性测试** 🌐 (Chrome/Firefox/Safari/Edge)
- `test-performance-stress.html` - **性能压力测试** ⚡ (大量实体、粒子、内存泄漏)

### 核心系统测试
- `test-ecs.html` - ECS 系统测试
- `test-mock-data.html` - 模拟数据服务测试
- `test-rendering.html` - 渲染系统测试
- `test-simple-render.html` - 简单渲染测试
- `test-render-optimization.html` - 渲染优化测试

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
- `test-game-scene.html` - 游戏主场景完整测试

### UI 系统测试
- `test-ui-system.html` - UI 系统测试

### 性能和调试测试
- `test-performance-monitor.html` - 性能监控测试
- `test-error-debug.html` - 错误处理和调试工具测试

### 资源测试
- `test-placeholder-assets.html` - 占位符资源测试
- `test-audio-manager.html` - 音频管理器测试

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

## 快速开始

### 1. 克隆项目
```bash
git clone <repository-url>
cd html5-mmrpg-game
```

### 2. 安装依赖
```bash
npm install
```

### 3. 启动开发服务器
```bash
npm run dev
```

### 4. 打开浏览器
访问 http://localhost:3000

### 5. 开始游戏
1. 点击"开始游戏"按钮
2. 创建或选择角色
3. 进入游戏世界，开始冒险！

## 测试指南

### 运行单元测试
```bash
npm test
```

### 运行完整流程测试
在浏览器中打开 `test-complete-flow.html`，点击"测试完整流程"按钮。

### 运行浏览器兼容性测试
在不同浏览器中打开 `test-browser-compatibility.html`，查看兼容性报告。

### 运行性能压力测试
打开 `test-performance-stress.html`，使用控制面板添加大量实体和粒子，观察性能指标。

## 已知问题

### 性能相关
- 当实体数量超过 200 时，帧率可能下降到 30-40 FPS
- 大量粒子（1000+）可能导致性能下降
- 长时间运行（30分钟+）可能出现轻微内存增长

### 浏览器兼容性
- Safari 中某些 CSS 动画可能表现不一致
- Firefox 中粒子渲染性能略低于 Chrome
- 移动端浏览器性能有限，建议在桌面端运行

### 游戏逻辑
- 敌人 AI 在某些边界情况下可能卡住
- 技能冷却显示偶尔不同步
- 碰撞检测在高速移动时可能穿透

## 未来计划

### 短期目标（1-2个月）
- [ ] 完善游戏资源（精灵图、音效、背景音乐）
- [ ] 实现背包和装备系统
- [ ] 添加更多地图和敌人类型
- [ ] 优化性能，支持更多同屏实体

### 中期目标（3-6个月）
- [ ] 实现真实服务器通信（WebSocket 后端）
- [ ] 添加任务系统
- [ ] 实现社交和组队功能
- [ ] 添加 PVP 战斗系统

### 长期目标（6个月+）
- [ ] 多人在线功能
- [ ] 公会系统
- [ ] 世界 Boss
- [ ] 跨服战场

## 贡献指南

欢迎贡献代码！请遵循以下步骤：

1. Fork 本项目
2. 创建特性分支 (`git checkout -b feature/AmazingFeature`)
3. 提交更改 (`git commit -m 'Add some AmazingFeature'`)
4. 推送到分支 (`git push origin feature/AmazingFeature`)
5. 开启 Pull Request

### 代码规范
- 遵循项目现有的代码风格
- 添加必要的注释和文档
- 为新功能编写单元测试
- 确保所有测试通过

## 相关文档

### 实现总结文档
- `IMPLEMENTATION_SUMMARY.md` - 移动系统实现总结
- `TASK_7.2_COMPLETE.md` - 点击移动实现总结
- `TASK_7.3_COLLISION_COMPLETE.md` - 碰撞检测实现总结
- `TASK_7.4_CAMERA_FOLLOW.md` - 相机跟随实现总结
- `TASK_8_COMBAT_SYSTEM_COMPLETE.md` - 战斗系统完成总结
- `TASK_10_PARTICLE_EFFECTS_COMPLETE.md` - 粒子特效系统完成总结
- `TASK_10.2_SKILL_EFFECTS_COMPLETE.md` - 技能特效完成总结
- `TASK_11_GAME_SCENE_COMPLETE.md` - 游戏主场景完成总结
- `TASK_12_PERFORMANCE_OPTIMIZATION_COMPLETE.md` - 性能优化完成总结
- `TASK_13_GAME_ASSETS_COMPLETE.md` - 游戏资源完成总结
- `TASK_14_ERROR_DEBUG_COMPLETE.md` - 错误处理和调试完成总结

### 模块文档
- `src/ecs/README.md` - ECS 系统详细文档
- `src/rendering/README.md` - 渲染系统详细文档
- `src/rendering/INTEGRATION.md` - 渲染系统集成指南
- `src/systems/README.md` - 游戏系统详细文档
- `src/systems/CHANGELOG.md` - 系统变更日志
- `src/ui/README.md` - UI 系统详细文档
- `src/network/README.md` - 网络模块详细文档
- `src/data/README.md` - 数据模块详细文档
- `assets/README.md` - 资源说明文档
- `assets/audio/README.md` - 音频资源说明

### 规范文档
- `.kiro/specs/html5-mmrpg-game/requirements.md` - 需求文档
- `.kiro/specs/html5-mmrpg-game/design.md` - 设计文档
- `.kiro/specs/html5-mmrpg-game/tasks.md` - 任务列表

## 致谢

本项目使用 Kiro AI 辅助开发，采用规范化的开发流程和测试驱动开发方法。

## 许可证

MIT License

Copyright (c) 2024

Permission is hereby granted, free of charge, to any person obtaining a copy
of this software and associated documentation files (the "Software"), to deal
in the Software without restriction, including without limitation the rights
to use, copy, modify, merge, publish, distribute, sublicense, and/or sell
copies of the Software, and to permit persons to whom the Software is
furnished to do so, subject to the following conditions:

The above copyright notice and this permission notice shall be included in all
copies or substantial portions of the Software.

THE SOFTWARE IS PROVIDED "AS IS", WITHOUT WARRANTY OF ANY KIND, EXPRESS OR
IMPLIED, INCLUDING BUT NOT LIMITED TO THE WARRANTIES OF MERCHANTABILITY,
FITNESS FOR A PARTICULAR PURPOSE AND NONINFRINGEMENT. IN NO EVENT SHALL THE
AUTHORS OR COPYRIGHT HOLDERS BE LIABLE FOR ANY CLAIM, DAMAGES OR OTHER
LIABILITY, WHETHER IN AN ACTION OF CONTRACT, TORT OR OTHERWISE, ARISING FROM,
OUT OF OR IN CONNECTION WITH THE SOFTWARE OR THE USE OR OTHER DEALINGS IN THE
SOFTWARE.
