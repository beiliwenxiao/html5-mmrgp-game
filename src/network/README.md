# Network Module

网络模块，提供模拟WebSocket通信和网络管理功能。

## 概述

网络模块包含三个主要组件：
- **MockWebSocket**: 模拟WebSocket客户端
- **NetworkManager**: 网络管理器，统一管理网络通信和数据服务
- 支持在模拟模式和真实服务器模式之间切换

## 组件

### MockWebSocket

模拟WebSocket客户端，用于前端开发和测试。

#### 使用方法

```javascript
import { MockWebSocket } from './network/MockWebSocket.js';

// 创建实例
const mockWS = new MockWebSocket({
    useMockData: true,
    mockDelay: 100,
    serverUrl: 'ws://localhost:8080'
});

// 连接
await mockWS.connect();

// 发送消息
const response = await mockWS.send('login', {
    username: 'player1',
    password: 'password'
});

// 注册消息处理器
mockWS.on('damage', (message) => {
    console.log('Received damage:', message.data);
});

// 断开连接
mockWS.disconnect();
```

#### 配置选项

- `useMockData` (boolean): 是否使用模拟数据，默认 true
- `mockDelay` (number): 模拟网络延迟（毫秒），默认 100
- `serverUrl` (string): 真实服务器地址，默认 'ws://localhost:8080'

#### 消息类型

支持的消息类型：
- `login`: 登录
- `create_character`: 创建角色
- `select_character`: 选择角色
- `move`: 移动
- `attack`: 攻击
- `use_skill`: 使用技能
- `damage`: 伤害
- `death`: 死亡
- `respawn`: 复活

#### 消息格式

```javascript
{
    id: 1,                    // 消息ID
    type: 'attack',           // 消息类型
    data: {                   // 消息数据
        attackerId: 'char_1',
        targetId: 'enemy_1',
        damage: 15
    },
    timestamp: 1234567890     // 时间戳
}
```

### NetworkManager

网络管理器，统一管理网络通信和数据服务。

#### 使用方法

```javascript
import { NetworkManager } from './network/NetworkManager.js';

// 创建实例
const networkManager = new NetworkManager({
    useMockData: true,
    mockDelay: 100,
    debugMode: true
});

// 连接到服务器
await networkManager.connect();

// 登录
const loginResult = await networkManager.login('username', 'password');

// 创建角色
const createResult = await networkManager.createCharacter('Hero', 'warrior');

// 选择角色
const selectResult = await networkManager.selectCharacter(character);

// 获取角色模板
const template = networkManager.getCharacterTemplate('warrior');

// 获取技能数据
const skills = networkManager.getCharacterSkills('mage');

// 获取地图数据
const map = networkManager.getMapData('test_map');

// 创建敌人
const enemy = networkManager.createEnemy('slime', { x: 100, y: 200 });

// 发送游戏消息
await networkManager.sendMove({ x: 100, y: 200 });
await networkManager.sendAttack('enemy_1', 15, 5);
await networkManager.sendUseSkill('warrior_slash', 'enemy_1', 30, 0);

// 注册消息处理器
networkManager.onMessage('damage', (message) => {
    console.log('Damage received:', message.data);
});

// 断开连接
networkManager.disconnect();
```

#### API 方法

##### 连接管理
- `connect()`: 连接到服务器
- `disconnect()`: 断开连接
- `getConnectionStatus()`: 获取连接状态

##### 认证和角色
- `login(username, password)`: 登录
- `createCharacter(name, classType)`: 创建角色
- `selectCharacter(character)`: 选择角色
- `getCurrentCharacter()`: 获取当前角色

##### 游戏消息
- `sendMove(position)`: 发送移动消息
- `sendAttack(targetId, attack, defense)`: 发送攻击消息
- `sendUseSkill(skillId, targetId, damage, heal)`: 发送技能使用消息
- `sendDamage(targetId, damage, currentHp)`: 发送伤害消息
- `sendDeath(entityId, killerId, expReward)`: 发送死亡消息

##### 数据访问
- `getCharacterTemplate(classType)`: 获取角色模板
- `getAllCharacterTemplates()`: 获取所有角色模板
- `getEnemyTemplate(enemyId)`: 获取敌人模板
- `getSkillData(skillId)`: 获取技能数据
- `getCharacterSkills(classType)`: 获取角色技能列表
- `getMapData(mapId)`: 获取地图数据
- `createEnemy(templateId, position)`: 创建敌人实例

##### 消息处理
- `onMessage(messageType, handler)`: 注册消息处理器
- `offMessage(messageType, handler)`: 移除消息处理器

##### 配置
- `setMockMode(useMockData)`: 切换模拟/真实服务器模式

## 集成到游戏引擎

在 GameEngine 中使用 NetworkManager：

```javascript
import { NetworkManager } from './network/NetworkManager.js';

class GameEngine {
    async initSystems() {
        // 初始化网络管理器
        this.networkManager = new NetworkManager({
            useMockData: true,
            mockDelay: 100,
            debugMode: true
        });
        
        await this.networkManager.connect();
        
        // 网络管理器现在可以在整个游戏中使用
        // 通过 window.gameEngine.networkManager 访问
    }
}
```

## 模拟延迟

MockWebSocket 会模拟网络延迟，默认为 100ms。这有助于：
- 测试异步操作
- 模拟真实网络环境
- 发现竞态条件

可以通过配置调整延迟：

```javascript
const networkManager = new NetworkManager({
    mockDelay: 50  // 50ms 延迟
});
```

## 切换到真实服务器

当后端就绪时，可以切换到真实服务器模式：

```javascript
const networkManager = new NetworkManager({
    useMockData: false,
    serverUrl: 'ws://your-server.com:8080'
});
```

注意：真实WebSocket连接功能尚未实现，需要在后续开发中添加。

## 调试

启用调试模式以查看详细日志：

```javascript
const networkManager = new NetworkManager({
    debugMode: true
});
```

这将在控制台输出所有网络操作的详细信息。

## 测试

运行测试：
```bash
# 在浏览器中打开
test-mock-data.html
```

或者在控制台中运行：
```javascript
import './network/MockWebSocket.test.js';
import './network/NetworkManager.test.js';
```

## 消息队列

MockWebSocket 内部维护一个消息队列，确保消息按顺序处理。所有消息都是异步的，使用 Promise 处理响应。

## 错误处理

所有网络操作都会返回 Promise，可以使用 try-catch 处理错误：

```javascript
try {
    const result = await networkManager.sendAttack('enemy_1', 15, 5);
    console.log('Attack successful:', result);
} catch (error) {
    console.error('Attack failed:', error);
}
```

## 未来扩展

计划添加的功能：
- 真实WebSocket连接实现
- 消息压缩
- 断线重连机制
- 心跳保活
- 客户端预测
- 状态同步
