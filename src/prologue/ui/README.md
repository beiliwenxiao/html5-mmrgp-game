# 序章UI组件

本目录包含张角黄巾起义序章的所有UI组件。

## 组件列表

### 1. EquipmentPanel (装备面板)
- **文件**: `EquipmentPanel.js`
- **功能**: 显示和管理玩家装备
- **特性**:
  - 显示装备槽位（武器、防具、饰品）
  - 显示装备属性和强化等级
  - 显示负属性（红色标注）
  - 装备详情提示框
- **需求**: 4, 14, 18

### 2. InventoryPanel (背包面板)
- **文件**: `InventoryPanel.js`
- **功能**: 显示和管理背包物品
- **特性**:
  - 6×5网格式物品显示
  - 物品拖拽功能
  - 物品筛选（全部、装备、消耗品、材料）
  - 物品使用/装备
  - 物品详情提示框
- **需求**: 3, 4

### 3. ShopPanel (商店面板)
- **文件**: `ShopPanel.js`
- **功能**: 显示商店界面
- **特性**:
  - 购买/出售标签页切换
  - 物品列表显示
  - 价格和货币显示
  - 交易确认
- **需求**: 16

### 4. EnhancementPanel (强化面板)
- **文件**: `EnhancementPanel.js`
- **功能**: 显示装备强化界面
- **特性**:
  - 装备选择
  - 强化成功率显示
  - 强化消耗显示
  - 属性对比预览
- **需求**: 18

### 5. ClassSelectionPanel (职业选择面板)
- **文件**: `ClassSelectionPanel.js`
- **功能**: 显示职业选择界面
- **特性**:
  - 三个职业卡片（战士、弓箭手、法师）
  - 教官NPC显示（张梁、张宝、张角）
  - 职业基础属性和推荐属性
  - 技能树预览功能
  - 职业颜色主题
  - 悬停和选中状态高亮
- **需求**: 19, 20
- **测试**: `test/test-class-selection-panel.html`

### 6. DialogueBox (对话框)
- **文件**: `DialogueBox.js`
- **功能**: 显示NPC对话和剧情对话
- **特性**:
  - 打字机效果（逐字显示，可跳过）
  - 角色头像显示（占位符）
  - 对话选项按钮（悬停高亮）
  - 继续提示动画（闪烁效果）
  - 音效集成（打字机、悬停、选择）
  - 文本自动换行
- **需求**: 6, 9, 35
- **测试**: `test/test-dialogue-box.html`

## 待实现组件

### 7. TutorialTooltip (教程提示)
- **功能**: 显示教程提示信息
- **特性**: 目标元素高亮、提示文本、多步骤导航
- **需求**: 2, 3, 4, 5, 37

### 8. QuestTracker (任务追踪器)
- **功能**: 显示当前任务目标
- **特性**: 任务列表、进度显示、任务完成提示
- **需求**: 36

## 设计原则

### 1. 继承UIElement基类
所有UI组件都继承自 `src/ui/UIElement.js`，获得基础的位置、尺寸、可见性管理功能。

### 2. 事件驱动
组件通过回调函数与外部系统通信：
- `onXxx`: 事件回调（如 `onClassSelect`, `onConfirm`）
- 组件不直接修改游戏状态，而是通过回调通知外部

### 3. 系统集成
组件通过构造函数接收系统实例：
- `classSystem`: 职业系统
- `equipmentSystem`: 装备系统
- `inventorySystem`: 背包系统
- `shopSystem`: 商店系统

### 4. 交互状态管理
组件内部管理交互状态：
- `hoveredXxx`: 悬停状态
- `selectedXxx`: 选中状态
- `draggedXxx`: 拖拽状态

### 5. 渲染优化
- 只在 `visible=true` 时渲染
- 使用 `ctx.save()` 和 `ctx.restore()` 保护渲染状态
- 合理使用透明度和阴影效果

## 使用示例

```javascript
import { ClassSelectionPanel } from './prologue/ui/ClassSelectionPanel.js';
import { ClassSystem } from './prologue/systems/ClassSystem.js';

// 初始化系统
const classSystem = new ClassSystem();

// 创建面板
const panel = new ClassSelectionPanel({
  x: 0,
  y: 0,
  width: 1200,
  height: 700,
  classSystem: classSystem,
  visible: false,
  onClassSelect: (classType) => {
    console.log('选择职业:', classType);
  },
  onConfirm: (classType) => {
    console.log('确认职业:', classType);
    // 应用职业到玩家
    classSystem.selectClass(player.id, classType);
  }
});

// 显示面板
panel.show();

// 渲染循环
function render(ctx) {
  panel.render(ctx);
}

// 事件处理
canvas.addEventListener('mousemove', (e) => {
  panel.handleMouseMove(e.clientX, e.clientY);
});

canvas.addEventListener('click', (e) => {
  panel.handleMouseClick(e.clientX, e.clientY);
});
```

## 测试

每个UI组件都应该有对应的测试页面：
- `test/test-equipment-panel.html`
- `test/test-inventory-panel.html`
- `test/test-shop-panel.html`
- `test/test-class-selection-panel.html`

测试页面应该包含：
1. 组件的完整功能演示
2. 交互测试（鼠标悬停、点击、拖拽）
3. 状态显示和日志输出
4. 控制按钮（显示、隐藏、重置）

## 注意事项

1. **Canvas坐标系**: 所有坐标都是相对于Canvas的绝对坐标
2. **事件传播**: 组件的 `handleMouseClick` 返回 `true` 表示事件已处理，阻止传播
3. **字体渲染**: 使用 `Arial, sans-serif` 确保中文显示正常
4. **颜色主题**: 使用半透明背景和职业/类型特定的颜色
5. **响应式**: 组件尺寸应该可配置，适应不同屏幕大小
