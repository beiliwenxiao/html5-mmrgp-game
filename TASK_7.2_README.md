# Task 7.2 - 点击移动功能

## 快速测试

### 启动开发服务器
```bash
npm run dev
```

### 访问测试页面
打开浏览器访问: http://localhost:3000/test-click-movement.html

### 操作说明
1. 点击画布上的任意位置
2. 蓝色方块（玩家）将移动到点击位置
3. 观察实时状态显示：
   - 玩家位置
   - 目标位置
   - 移动状态
   - 速度向量
   - 距离目标

## 功能特性

- ✅ 左键点击触发移动
- ✅ 直线路径移动
- ✅ 平滑移动动画
- ✅ 到达目标自动停止
- ✅ 显示速度向量箭头
- ✅ 显示目标点标记

## 技术实现

### 核心组件
1. **InputManager** - 处理鼠标输入和坐标转换
2. **MovementComponent** - 存储移动状态和路径数据
3. **MovementSystem** - 处理移动逻辑和更新

### 关键方法
- `getMouseWorldPosition()` - 获取鼠标世界坐标
- `setPath()` - 设置移动路径
- `calculateVelocityToTarget()` - 计算移动速度
- `hasReachedTarget()` - 判断是否到达目标

## 代码位置

- 移动系统: `src/systems/MovementSystem.js`
- 移动组件: `src/ecs/components/MovementComponent.js`
- 输入管理: `src/core/InputManager.js`
- 测试页面: `test-click-movement.html`
