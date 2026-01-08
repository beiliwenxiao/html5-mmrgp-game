# 商店面板测试说明

## 问题说明

如果直接双击打开 `test-shop-panel.html` 文件，会发现"打开/关闭商店"按钮无反应。

**原因：** ES6模块（import/export）需要通过HTTP服务器运行，直接打开HTML文件会因为浏览器的CORS安全策略而无法加载模块。

## 正确的运行方法

### 方法1：使用Vite开发服务器（推荐）

1. 在项目根目录运行：
   ```bash
   npm run dev
   ```

2. 在浏览器中访问：
   ```
   http://localhost:5173/test/test-shop-panel.html
   ```

3. 打开浏览器开发者工具（F12）查看控制台日志

### 方法2：使用其他HTTP服务器

如果你有其他HTTP服务器工具，也可以使用：

```bash
# 使用http-server
npx http-server -p 8080

# 然后访问
http://localhost:8080/test/test-shop-panel.html
```

## 测试功能

商店面板包含以下功能：

- ✅ 购买/出售标签页切换
- ✅ 物品列表显示（带滚动条）
- ✅ 交易数量调整（+/- 按钮）
- ✅ 交易按钮和货币显示
- ✅ 物品详情提示框（鼠标悬停）
- ✅ 价格计算和库存管理

## 操作说明

1. **打开商店**：点击"打开/关闭商店"按钮
2. **切换模式**：点击"购买"或"出售"标签页
3. **选择物品**：点击物品列表中的物品
4. **调整数量**：使用 +/- 按钮调整交易数量
5. **完成交易**：点击"购买"或"出售"按钮
6. **查看详情**：鼠标悬停在物品上查看详细信息
7. **滚动列表**：使用鼠标滚轮查看更多物品

## 调试信息

打开浏览器控制台（F12），你应该能看到：

```
模块加载成功
ShopPanel: class ShopPanel { ... }
ShopSystem: class ShopSystem { ... }
InventorySystem: class InventorySystem { ... }
商店面板测试已启动
```

如果看到这些信息，说明模块加载成功，商店面板应该可以正常工作了！

## 常见问题

**Q: 为什么直接打开HTML文件不行？**

A: 现代浏览器的安全策略不允许从 `file://` 协议加载ES6模块。必须通过HTTP服务器（`http://` 或 `https://`）运行。

**Q: 控制台显示模块加载错误？**

A: 确保你在项目根目录运行 `npm run dev`，并且访问的URL是 `http://localhost:5173/test/test-shop-panel.html`。

**Q: 商店面板不显示？**

A: 检查浏览器控制台是否有错误信息。确保所有依赖的文件都存在：
- `src/prologue/ui/ShopPanel.js`
- `src/prologue/systems/ShopSystem.js`
- `src/prologue/systems/InventorySystem.js`
- `src/ui/UIElement.js`
