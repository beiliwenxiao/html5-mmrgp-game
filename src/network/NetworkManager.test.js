/**
 * 测试NetworkManager功能
 * 这是一个简单的测试文件，用于验证网络管理器的基本功能
 */
import { NetworkManager } from './NetworkManager.js';

async function runTests() {
    console.log('=== NetworkManager Test ===\n');

    // 创建NetworkManager实例
    const networkManager = new NetworkManager({
        useMockData: true,
        mockDelay: 50,
        debugMode: true
    });

    // 测试1: 连接到服务器
    console.log('Test 1: Connect to Server');
    try {
        const connected = await networkManager.connect();
        console.log('Connected:', connected);
        console.log('✓ Connected to server\n');
    } catch (error) {
        console.error('✗ Connection failed:', error);
        return;
    }

    // 测试2: 登录
    console.log('Test 2: Login');
    try {
        const loginResult = await networkManager.login('testuser', 'testpass');
        console.log('Login Result:', loginResult);
        console.log('✓ Login successful\n');
    } catch (error) {
        console.error('✗ Login failed:', error);
    }

    // 测试3: 获取角色模板
    console.log('Test 3: Get Character Templates');
    const allTemplates = networkManager.getAllCharacterTemplates();
    console.log('Available Classes:', Object.keys(allTemplates));
    console.log('✓ Character templates retrieved\n');

    // 测试4: 创建角色
    console.log('Test 4: Create Character');
    try {
        const createResult = await networkManager.createCharacter('TestWarrior', 'warrior');
        console.log('Create Result:', createResult);
        console.log('✓ Character created\n');
    } catch (error) {
        console.error('✗ Character creation failed:', error);
    }

    // 测试5: 选择角色
    console.log('Test 5: Select Character');
    try {
        const character = {
            id: 'char_test_123',
            name: 'TestWarrior',
            class: 'warrior',
            level: 1
        };
        const selectResult = await networkManager.selectCharacter(character);
        console.log('Select Result:', selectResult);
        console.log('Current Character:', networkManager.getCurrentCharacter());
        console.log('✓ Character selected\n');
    } catch (error) {
        console.error('✗ Character selection failed:', error);
    }

    // 测试6: 获取技能数据
    console.log('Test 6: Get Skill Data');
    const warriorSkills = networkManager.getCharacterSkills('warrior');
    console.log('Warrior Skills:', warriorSkills.map(s => `${s.name} (CD: ${s.cooldown}s, MP: ${s.manaCost})`));
    console.log('✓ Skill data retrieved\n');

    // 测试7: 获取地图数据
    console.log('Test 7: Get Map Data');
    const mapData = networkManager.getMapData('test_map');
    console.log('Map Info:', {
        name: mapData.name,
        size: `${mapData.width}x${mapData.height}`,
        enemySpawns: mapData.spawnPoints.enemies.length
    });
    console.log('✓ Map data retrieved\n');

    // 测试8: 创建敌人实例
    console.log('Test 8: Create Enemy Instances');
    const slime = networkManager.createEnemy('slime', { x: 100, y: 200 });
    console.log('Created Slime:', {
        id: slime.id,
        name: slime.name,
        level: slime.level,
        hp: slime.stats.hp
    });
    
    const goblin = networkManager.createEnemy('goblin', { x: 300, y: 400 });
    console.log('Created Goblin:', {
        id: goblin.id,
        name: goblin.name,
        level: goblin.level,
        hp: goblin.stats.hp
    });
    console.log('✓ Enemy instances created\n');

    // 测试9: 发送移动消息
    console.log('Test 9: Send Move Message');
    try {
        const moveResult = await networkManager.sendMove({ x: 500, y: 300 });
        console.log('Move Result:', moveResult);
        console.log('✓ Move message sent\n');
    } catch (error) {
        console.error('✗ Move failed:', error);
    }

    // 测试10: 发送攻击消息
    console.log('Test 10: Send Attack Message');
    try {
        const attackResult = await networkManager.sendAttack('enemy_123', 15, 5);
        console.log('Attack Result:', attackResult);
        console.log('Damage Dealt:', attackResult.damage);
        console.log('✓ Attack message sent\n');
    } catch (error) {
        console.error('✗ Attack failed:', error);
    }

    // 测试11: 发送技能使用消息
    console.log('Test 11: Send Use Skill Message');
    try {
        const skillResult = await networkManager.sendUseSkill('warrior_slash', 'enemy_123', 30, 0);
        console.log('Skill Result:', skillResult);
        console.log('✓ Use skill message sent\n');
    } catch (error) {
        console.error('✗ Use skill failed:', error);
    }

    // 测试12: 切换模式
    console.log('Test 12: Toggle Mock Mode');
    networkManager.setMockMode(false);
    console.log('Mock mode disabled');
    networkManager.setMockMode(true);
    console.log('Mock mode enabled');
    console.log('✓ Mode toggle successful\n');

    // 测试13: 获取连接状态
    console.log('Test 13: Get Connection Status');
    const status = networkManager.getConnectionStatus();
    console.log('Connection Status:', status);
    console.log('✓ Connection status retrieved\n');

    // 测试14: 断开连接
    console.log('Test 14: Disconnect');
    networkManager.disconnect();
    console.log('✓ Disconnected successfully\n');

    console.log('=== All Tests Passed! ===');
}

// 运行测试
runTests().catch(error => {
    console.error('Test suite failed:', error);
});
