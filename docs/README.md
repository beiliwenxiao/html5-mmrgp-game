# HTML5 MMRPG 游戏引擎文档

## 文档概述

本目录包含 HTML5 MMRPG 游戏引擎的完整文档。

## 快速开始

**推荐阅读顺序：**

1. **[ENGINE_FEATURES.md](./ENGINE_FEATURES.md)** - 引擎功能总览和使用指南（推荐首先阅读）
2. 根据需要查阅具体系统的详细文档

## 文档结构

### 核心文档

- **[ENGINE_FEATURES.md](./ENGINE_FEATURES.md)** - 引擎功能总览
  - 包含所有系统的功能说明和使用示例
  - 适合快速查找 API 和使用方法

### 系统详细文档

#### 角色系统
- **[ATTRIBUTE_SYSTEM_IMPLEMENTATION.md](./ATTRIBUTE_SYSTEM_IMPLEMENTATION.md)** - 属性系统详细实现
  - 五大属性体系
  - 属性点分配机制
  - 属性效果计算

- **[ELEMENT_SYSTEM_IMPLEMENTATION.md](./ELEMENT_SYSTEM_IMPLEMENTATION.md)** - 元素系统详细实现
  - 13种元素类型
  - 元素升级和合成
  - 五行相克关系

- **[SKILL_TREE_SYSTEM_IMPLEMENTATION.md](./SKILL_TREE_SYSTEM_IMPLEMENTATION.md)** - 技能树系统详细实现
  - 三职业技能树
  - 技能学习机制
  - 被动和主动技能

- **[STATUS_EFFECT_SYSTEM_IMPLEMENTATION.md](./STATUS_EFFECT_SYSTEM_IMPLEMENTATION.md)** - 状态效果系统详细实现
  - 6种核心状态效果
  - 效果叠加和管理
  - UI显示

- **[UNIT_SYSTEM_IMPLEMENTATION.md](./UNIT_SYSTEM_IMPLEMENTATION.md)** - 兵种系统详细实现
  - 9种兵种类型
  - 兵种升级路径
  - 相克关系

#### 游戏系统
- **[TASK_8_COMBAT_SYSTEM_COMPLETE.md](./TASK_8_COMBAT_SYSTEM_COMPLETE.md)** - 战斗系统详细实现
  - 目标选择
  - 攻击和技能
  - 伤害计算
  - 死亡处理

- **[IMPLEMENTATION_SUMMARY.md](./IMPLEMENTATION_SUMMARY.md)** - 移动系统详细实现
  - 键盘移动
  - 点击移动
  - 碰撞检测
  - 相机跟随

#### 视觉效果
- **[TASK_10_PARTICLE_EFFECTS_COMPLETE.md](./TASK_10_PARTICLE_EFFECTS_COMPLETE.md)** - 粒子特效系统详细实现
  - 基础粒子系统
  - 技能特效
  - 战斗特效

#### 性能和工具
- **[TASK_12_PERFORMANCE_OPTIMIZATION_COMPLETE.md](./TASK_12_PERFORMANCE_OPTIMIZATION_COMPLETE.md)** - 性能优化详细实现
  - 对象池
  - 渲染优化
  - 性能监控

- **[TASK_13_GAME_ASSETS_COMPLETE.md](./TASK_13_GAME_ASSETS_COMPLETE.md)** - 资源管理详细实现
  - 占位符资源生成
  - 音频管理

- **[TASK_14_ERROR_DEBUG_COMPLETE.md](./TASK_14_ERROR_DEBUG_COMPLETE.md)** - 错误处理和调试详细实现
  - 错误处理系统
  - 日志系统
  - 调试工具

## 使用建议

### 对于新手开发者
1. 先阅读 [ENGINE_FEATURES.md](./ENGINE_FEATURES.md) 了解引擎整体功能
2. 查看完整示例部分快速上手
3. 根据需要深入阅读具体系统的详细文档

### 对于有经验的开发者
1. 直接查阅 [ENGINE_FEATURES.md](./ENGINE_FEATURES.md) 中的 API 参考
2. 需要了解实现细节时查看对应的详细文档

### 对于系统维护者
1. 详细文档包含完整的实现说明和技术细节
2. 每个系统都有测试覆盖和性能考虑说明

## 文档维护

- 所有文档统一放在 `docs` 文件夹中
- 项目根目录只保留 `README.md` 文件
- 更新功能时需要同步更新相关文档

## 相关资源

- **源代码**: `src/` 目录
- **测试文件**: `test/` 目录
- **测试页面**: 项目根目录的 `test-*.html` 文件

## 技术支持

如有问题，请查阅：
1. 相关系统的详细文档
2. 源代码中的 JSDoc 注释
3. 测试文件中的使用示例
