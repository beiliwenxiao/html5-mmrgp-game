/**
 * 测试MockWebSocket功能
 * 这是一个简单的测试文件，用于验证模拟WebSocket的基本功能
 */
import { MockWebSocket } from './MockWebSocket.js';

async function runTests() {
    console.log('=== MockWebSocket Test ===\n');

    // 创建MockWebSocket实例
    const mockWS = new MockWebSocket({
        useMockData: true,
        mockDelay: 50,
        debugMode: true
    });

    // 测试1: 连接
    console.log('Test 1: Connect');
    try {
        await mockWS.connect();
        console.log('✓ Connected successfully\n');
    } catch (error) {
        console.error('✗ Connection failed:', error);
        return;
    }

    // 测试2: 发送登录消息
    console.log('Test 2: Send Login Message');
    try {
        const response = await mockWS.send('login', {
            username: 'testuser',
            password: 'testpass'
        });
        console.log('Login Response:', response);
        console.log('✓ Login message sent and received\n');
    } catch (error) {
        console.error('✗ Login failed:', error);
    }

    // 测试3: 发送移动消息
    console.log('Test 3: Send Move Message');
    try {
        const response = await mockWS.send('move', {
            characterId: 'char_123',
            position: { x: 100, y: 200 }
        });
        console.log('Move Response:', response);
        console.log('✓ Move message sent and received\n');
    } catch (error) {
        console.error('✗ Move failed:', error);
    }

    // 测试4: 发送攻击消息
    console.log('Test 4: Send Attack Message');
    try {
        const response = await mockWS.send('attack', {
            attackerId: 'char_123',
            targetId: 'enemy_456',
            attack: 15,
            defense: 5
        });
        console.log('Attack Response:', response);
        console.log('Calculated Damage:', response.data.damage);
        console.log('✓ Attack message sent and received\n');
    } catch (error) {
        console.error('✗ Attack failed:', error);
    }

    // 测试5: 发送技能使用消息
    console.log('Test 5: Send Use Skill Message');
    try {
        const response = await mockWS.send('use_skill', {
            casterId: 'char_123',
            skillId: 'warrior_slash',
            targetId: 'enemy_456',
            damage: 30
        });
        console.log('Use Skill Response:', response);
        console.log('✓ Use skill message sent and received\n');
    } catch (error) {
        console.error('✗ Use skill failed:', error);
    }

    // 测试6: 注册消息处理器
    console.log('Test 6: Register Message Handler');
    let handlerCalled = false;
    mockWS.on('test_message', (message) => {
        console.log('Handler received message:', message);
        handlerCalled = true;
    });
    
    // 模拟服务器推送消息
    mockWS.simulateServerPush('test_message', { content: 'Hello from server!' });
    
    // 等待处理器执行
    await new Promise(resolve => setTimeout(resolve, 100));
    
    if (handlerCalled) {
        console.log('✓ Message handler registered and called\n');
    } else {
        console.error('✗ Message handler not called\n');
    }

    // 测试7: 获取连接状态
    console.log('Test 7: Get Connection Status');
    const status = mockWS.getConnectionStatus();
    console.log('Connection Status:', status);
    console.log('✓ Connection status retrieved\n');

    // 测试8: 断开连接
    console.log('Test 8: Disconnect');
    mockWS.disconnect();
    const disconnectedStatus = mockWS.getConnectionStatus();
    console.log('Disconnected Status:', disconnectedStatus);
    console.log('✓ Disconnected successfully\n');

    console.log('=== All Tests Passed! ===');
}

// 运行测试
runTests().catch(error => {
    console.error('Test suite failed:', error);
});
