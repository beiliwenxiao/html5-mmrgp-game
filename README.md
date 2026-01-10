# 张角黄巾起义序章 - HTML5 MMRPG

一个基于完整 ECS 架构的 HTML5 多人在线角色扮演游戏。

## 🎮 立即开始

### 快速启动

1. **克隆项目**
   ```bash
   git clone <repository-url>
   cd <project-directory>
   ```

2. **启动本地服务器**
   ```bash
   # 使用 Python
   python -m http.server 8000
   
   # 或使用 Node.js
   npx http-server
   ```

3. **打开浏览器**
   ```
   http://localhost:8000
   ```

4. **开始游戏！** 🎉

### 或者直接打开

直接在浏览器中打开 `index.html` 文件即可开始游戏。

## 📖 游戏介绍

### 故事背景

东汉末年，天下大乱。你是一名饥寒交迫的灾民，在绝望中遇到了张角。他给了你一碗粥，一个希望，以及改变命运的机会...

### 第一幕：绝望的开始

- **角色创建**: 成为一名灾民
- **移动教程**: 学习如何在世界中移动
- **拾取教程**: 拾取破旧的衣服和武器
- **装备教程**: 装备你的第一件武器
- **战斗教程**: 与野狗、官府士兵、土匪战斗
- **剧情转折**: 饥民围困，必然的死亡...但这不是结局

## 🎯 游戏特性

### 完整的 ECS 架构

- ✅ **Entity-Component-System**: 高性能的游戏架构
- ✅ **模块化设计**: 易于扩展和维护
- ✅ **核心系统集成**: 战斗、移动、装备、渲染等

### 核心系统

- **InputManager**: 统一的输入处理（键盘、鼠标、触摸）
- **Camera**: 智能相机系统（跟随、边界、坐标转换）
- **CombatSystem**: 完整的战斗系统（目标选择、伤害计算、技能）
- **MovementSystem**: 移动系统（WASD、点击移动、寻路）
- **EquipmentSystem**: 装备系统（穿戴、属性计算）
- **RenderSystem**: 渲染系统（视锥剔除、批量渲染）
- **CombatEffects**: 战斗特效（伤害数字、攻击特效）

### 游戏机制

- **教程系统**: 循序渐进的教学
- **战斗系统**: 实时战斗，技能释放
- **装备系统**: 武器、防具、饰品
- **背包系统**: 物品管理
- **任务系统**: 主线和支线任务
- **对话系统**: NPC 对话和剧情

## 🎮 控制方式

### 键盘

| 按键 | 功能 |
|------|------|
| W / ↑ | 向上移动 |
| S / ↓ | 向下移动 |
| A / ← | 向左移动 |
| D / → | 向右移动 |
| E | 拾取物品 |
| I | 打开/关闭背包 |
| 空格 | 攻击 |
| 1-6 | 使用技能 |
| ESC | 暂停/菜单 |

### 鼠标

- **左键点击**: 移动到目标位置
- **右键点击**: 选择目标（战斗）

### 触摸（移动端）

- **点击**: 移动到目标位置
- **长按**: 选择目标

## 🏗️ 项目结构

```
.
├── index.html                 # 主入口文件
├── src/
│   ├── main.js               # 游戏主程序
│   ├── core/                 # 核心系统
│   │   ├── GameEngine.js
│   │   ├── InputManager.js
│   │   ├── SceneManager.js
│   │   └── ...
│   ├── ecs/                  # ECS 架构
│   │   ├── Entity.js
│   │   ├── Component.js
│   │   ├── EntityFactory.js
│   │   └── components/
│   ├── systems/              # 游戏系统
│   │   ├── CombatSystem.js
│   │   ├── MovementSystem.js
│   │   ├── EquipmentSystem.js
│   │   └── ...
│   ├── rendering/            # 渲染系统
│   │   ├── Camera.js
│   │   ├── RenderSystem.js
│   │   ├── CombatEffects.js
│   │   └── ...
│   ├── prologue/             # 序章场景
│   │   ├── scenes/
│   │   │   ├── Act1SceneECS.js
│   │   │   └── ...
│   │   ├── systems/
│   │   └── ui/
│   └── ui/                   # UI 组件
├── test/                     # 测试文件
├── docs/                     # 文档
│   ├── QUICK_START_ECS.md
│   ├── ACT1_SCENE_ECS_REFACTOR.md
│   └── ...
└── styles/                   # 样式文件
```

## 📚 文档

### 快速开始

- [快速启动指南](docs/QUICK_START_ECS.md) - 5分钟上手
- [游戏控制说明](docs/QUICK_START_ECS.md#游戏控制) - 所有控制方式

### 开发文档

- [ECS 架构重构](docs/ACT1_SCENE_ECS_REFACTOR.md) - 架构设计
- [实现文档](docs/ACT1_SCENE_IMPLEMENTATION.md) - 详细实现
- [重构总结](docs/ECS_REFACTOR_SUMMARY.md) - 完整总结

### API 文档

- [Entity 系统](src/ecs/README.md)
- [核心系统](src/core/)
- [游戏系统](src/systems/)
- [渲染系统](src/rendering/)

## 🔧 开发

### 环境要求

- **浏览器**: Chrome 90+, Firefox 88+, Edge 90+
- **Node.js**: 14+ (可选，用于开发工具)
- **Python**: 3.6+ (可选，用于本地服务器)

### 开发模式

1. **启动开发服务器**
   ```bash
   npm run dev
   # 或
   python -m http.server 8000
   ```

2. **打开浏览器**
   ```
   http://localhost:8000
   ```

3. **打开开发者工具** (F12)
   - 查看控制台日志
   - 调试代码
   - 监控性能

### 调试

```javascript
// 在控制台中
scene.getGameState()        // 查看游戏状态
scene.playerEntity          // 查看玩家实体
scene.entities              // 查看所有实体
scene.camera.position       // 查看相机位置
scene.renderSystem.setDebugMode(true)  // 开启调试模式
```

### 测试

```bash
# 运行单元测试
npm test

# 运行特定测试
npm test -- Entity.test.js
```

## 🚀 性能

### 目标性能

- **FPS**: 60 (稳定)
- **实体数量**: 100+
- **内存使用**: < 100MB
- **加载时间**: < 3秒

### 优化措施

- **视锥剔除**: 只渲染可见实体
- **对象池**: 减少 GC 压力
- **批量渲染**: 提高渲染效率
- **离屏 Canvas**: 缓存静态内容

## 🐛 问题反馈

### 报告 Bug

请提供以下信息：
1. 浏览器和版本
2. 控制台错误信息
3. 重现步骤
4. 截图或录屏

### 功能建议

欢迎提出：
1. 新的游戏机制
2. UI 改进建议
3. 性能优化建议
4. 文档改进建议

## 🤝 贡献

欢迎贡献代码！请遵循以下步骤：

1. Fork 项目
2. 创建特性分支 (`git checkout -b feature/AmazingFeature`)
3. 提交更改 (`git commit -m 'Add some AmazingFeature'`)
4. 推送到分支 (`git push origin feature/AmazingFeature`)
5. 开启 Pull Request

### 代码规范

- 使用 ES6+ 语法
- 类名使用 PascalCase
- 方法和变量使用 camelCase
- 添加 JSDoc 注释
- 遵循 ECS 架构

## 📄 许可证

本项目采用 MIT 许可证 - 查看 [LICENSE](LICENSE) 文件了解详情。

## 🙏 致谢

### 核心系统开发者

感谢所有核心系统的开发者和贡献者。

### 使用的技术

- **HTML5 Canvas**: 游戏渲染
- **ES6+ JavaScript**: 现代 JavaScript
- **ECS 架构**: 高性能游戏架构
- **WebSocket**: 多人在线通信（计划中）

### 灵感来源

- 三国历史
- 经典 MMORPG 游戏
- 现代 Web 技术

## 📞 联系方式

- **项目主页**: [GitHub Repository]
- **问题追踪**: [GitHub Issues]
- **讨论区**: [GitHub Discussions]

## 🗺️ 路线图

### 已完成 ✅

- [x] 完整的 ECS 架构
- [x] 核心系统集成
- [x] 第一幕场景
- [x] 教程系统
- [x] 战斗系统
- [x] 装备系统

### 进行中 🚧

- [ ] 第二幕和第三幕
- [ ] UI 系统完善
- [ ] 音效系统

### 计划中 📋

- [ ] 网络多人功能
- [ ] 完整的六幕场景
- [ ] 高级战斗系统
- [ ] 社交系统
- [ ] 公会系统

## 🎉 开始你的冒险！

现在就打开 `index.html`，开始你的黄巾起义之旅！

记住：
- 这只是开始，更多精彩内容即将到来
- 死亡不是结局，而是新的开始
- 探索、战斗、成长，成为传奇！

祝你游戏愉快！ 🎮✨

---

**项目状态**: 活跃开发中  
**当前版本**: 0.1.0 (第一幕)  
**最后更新**: 2026-01-11
