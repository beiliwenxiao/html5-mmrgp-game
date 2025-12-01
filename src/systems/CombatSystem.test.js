/**
 * CombatSystem 单元测试
 */

import { CombatSystem } from './CombatSystem.js';
import { Entity } from '../ecs/Entity.js';
import { TransformComponent } from '../ecs/components/TransformComponent.js';
import { StatsComponent } from '../ecs/components/StatsComponent.js';
import { CombatComponent } from '../ecs/components/CombatComponent.js';

console.log('=== CombatSystem 单元测试 ===\n');

// 模拟 InputManager
class MockInputManager {
  constructor() {
    this.mouseClicked = false;
    this.mouseButton = -1;
    this.mouseWorldX = 0;
    this.mouseWorldY = 0;
    this.keyPressed = new Map();
  }

  isMouseClicked() {
    return this.mouseClicked;
  }

  getMouseButton() {
    return this.mouseButton;
  }

  getMouseWorldPosition() {
    return { x: this.mouseWorldX, y: this.mouseWorldY };
  }

  isKeyPressed(key) {
    return this.keyPressed.get(key) === true;
  }

  setCameraPosition(x, y) {
    // Mock implementation
  }

  simulateClick(x, y, button = 0) {
    this.mouseClicked = true;
    this.mouseButton = button;
    this.mouseWorldX = x;
    this.mouseWorldY = y;
  }

  simulateKeyPress(key) {
    this.keyPressed.set(key, true);
  }

  reset() {
    this.mouseClicked = false;
    this.mouseButton = -1;
    this.keyPressed.clear();
  }
}

// 模拟 Camera
class MockCamera {
  constructor() {
    this.viewBounds = { left: 0, top: 0, right: 800, bottom: 600 };
  }

  getViewBounds() {
    return this.viewBounds;
  }

  update() {}
}

// 测试1: 创建 CombatSystem
console.log('测试1: 创建 CombatSystem');
try {
  const inputManager = new MockInputManager();
  const camera = new MockCamera();
  const combatSystem = new CombatSystem({ inputManager, camera });
  
  console.assert(combatSystem !== null, 'CombatSystem 应该被创建');
  console.assert(combatSystem.inputManager === inputManager, '应该保存 inputManager 引用');
  console.assert(combatSystem.camera === camera, '应该保存 camera 引用');
  console.assert(combatSystem.selectedTarget === null, '初始时没有选中目标');
  
  console.log('✓ CombatSystem 创建成功\n');
} catch (error) {
  console.error('✗ 测试失败:', error.message);
}

// 测试2: 设置玩家实体
console.log('测试2: 设置玩家实体');
try {
  const inputManager = new MockInputManager();
  const camera = new MockCamera();
  const combatSystem = new CombatSystem({ inputManager, camera });
  
  const player = new Entity('player_1', 'player');
  player.addComponent(new TransformComponent({ x: 100, y: 100 }));
  player.addComponent(new CombatComponent());
  
  combatSystem.setPlayerEntity(player);
  
  console.assert(combatSystem.playerEntity === player, '应该保存玩家实体引用');
  
  console.log('✓ 玩家实体设置成功\n');
} catch (error) {
  console.error('✗ 测试失败:', error.message);
}

// 测试3: 查找指定位置的敌人
console.log('测试3: 查找指定位置的敌人');
try {
  const inputManager = new MockInputManager();
  const camera = new MockCamera();
  const combatSystem = new CombatSystem({ inputManager, camera });
  
  // 创建敌人
  const enemy1 = new Entity('enemy_1', 'enemy');
  enemy1.addComponent(new TransformComponent({ x: 200, y: 200 }));
  
  const enemy2 = new Entity('enemy_2', 'enemy');
  enemy2.addComponent(new TransformComponent({ x: 300, y: 300 }));
  
  const entities = [enemy1, enemy2];
  
  // 测试点击 enemy1 附近
  const foundEnemy1 = combatSystem.findEnemyAtPosition({ x: 210, y: 210 }, entities);
  console.assert(foundEnemy1 === enemy1, '应该找到 enemy1');
  
  // 测试点击 enemy2 附近
  const foundEnemy2 = combatSystem.findEnemyAtPosition({ x: 295, y: 295 }, entities);
  console.assert(foundEnemy2 === enemy2, '应该找到 enemy2');
  
  // 测试点击空白处
  const foundNone = combatSystem.findEnemyAtPosition({ x: 500, y: 500 }, entities);
  console.assert(foundNone === null, '应该找不到敌人');
  
  console.log('✓ 敌人查找功能正常\n');
} catch (error) {
  console.error('✗ 测试失败:', error.message);
}

// 测试4: 选中目标
console.log('测试4: 选中目标');
try {
  const inputManager = new MockInputManager();
  const camera = new MockCamera();
  const combatSystem = new CombatSystem({ inputManager, camera });
  
  const player = new Entity('player_1', 'player');
  player.addComponent(new TransformComponent({ x: 100, y: 100 }));
  player.addComponent(new CombatComponent());
  
  const enemy = new Entity('enemy_1', 'enemy');
  enemy.addComponent(new TransformComponent({ x: 200, y: 200 }));
  enemy.addComponent(new StatsComponent({ hp: 50, maxHp: 50 }));
  
  combatSystem.setPlayerEntity(player);
  combatSystem.selectTarget(enemy);
  
  console.assert(combatSystem.selectedTarget === enemy, '应该选中敌人');
  console.assert(combatSystem.getSelectedTarget() === enemy, 'getSelectedTarget 应该返回选中的敌人');
  
  const playerCombat = player.getComponent('combat');
  console.assert(playerCombat.target === enemy, '玩家的战斗组件应该设置目标');
  
  console.log('✓ 目标选中功能正常\n');
} catch (error) {
  console.error('✗ 测试失败:', error.message);
}

// 测试5: 清除目标
console.log('测试5: 清除目标');
try {
  const inputManager = new MockInputManager();
  const camera = new MockCamera();
  const combatSystem = new CombatSystem({ inputManager, camera });
  
  const player = new Entity('player_1', 'player');
  player.addComponent(new TransformComponent({ x: 100, y: 100 }));
  player.addComponent(new CombatComponent());
  
  const enemy = new Entity('enemy_1', 'enemy');
  enemy.addComponent(new TransformComponent({ x: 200, y: 200 }));
  enemy.addComponent(new StatsComponent({ hp: 50, maxHp: 50 }));
  
  combatSystem.setPlayerEntity(player);
  combatSystem.selectTarget(enemy);
  combatSystem.clearTarget();
  
  console.assert(combatSystem.selectedTarget === null, '应该清除选中的目标');
  console.assert(combatSystem.getSelectedTarget() === null, 'getSelectedTarget 应该返回 null');
  
  const playerCombat = player.getComponent('combat');
  console.assert(playerCombat.target === null, '玩家的战斗组件应该清除目标');
  
  console.log('✓ 目标清除功能正常\n');
} catch (error) {
  console.error('✗ 测试失败:', error.message);
}

// 测试6: 处理目标选择输入（点击敌人）
console.log('测试6: 处理目标选择输入（点击敌人）');
try {
  const inputManager = new MockInputManager();
  const camera = new MockCamera();
  const combatSystem = new CombatSystem({ inputManager, camera });
  
  const player = new Entity('player_1', 'player');
  player.addComponent(new TransformComponent({ x: 100, y: 100 }));
  player.addComponent(new CombatComponent());
  
  const enemy = new Entity('enemy_1', 'enemy');
  enemy.addComponent(new TransformComponent({ x: 200, y: 200 }));
  enemy.addComponent(new StatsComponent({ hp: 50, maxHp: 50 }));
  
  const entities = [player, enemy];
  
  combatSystem.setPlayerEntity(player);
  
  // 模拟点击敌人
  inputManager.simulateClick(205, 205, 0);
  combatSystem.handleTargetSelection(entities);
  
  console.assert(combatSystem.selectedTarget === enemy, '应该选中被点击的敌人');
  
  console.log('✓ 点击选中敌人功能正常\n');
} catch (error) {
  console.error('✗ 测试失败:', error.message);
}

// 测试7: 处理目标选择输入（按ESC取消）
console.log('测试7: 处理目标选择输入（按ESC取消）');
try {
  const inputManager = new MockInputManager();
  const camera = new MockCamera();
  const combatSystem = new CombatSystem({ inputManager, camera });
  
  const player = new Entity('player_1', 'player');
  player.addComponent(new TransformComponent({ x: 100, y: 100 }));
  player.addComponent(new CombatComponent());
  
  const enemy = new Entity('enemy_1', 'enemy');
  enemy.addComponent(new TransformComponent({ x: 200, y: 200 }));
  enemy.addComponent(new StatsComponent({ hp: 50, maxHp: 50 }));
  
  const entities = [player, enemy];
  
  combatSystem.setPlayerEntity(player);
  combatSystem.selectTarget(enemy);
  
  // 模拟按ESC键
  inputManager.simulateKeyPress('escape');
  combatSystem.handleTargetSelection(entities);
  
  console.assert(combatSystem.selectedTarget === null, '应该清除选中的目标');
  
  console.log('✓ 按ESC取消选中功能正常\n');
} catch (error) {
  console.error('✗ 测试失败:', error.message);
}

// 测试8: 自动清除死亡目标
console.log('测试8: 自动清除死亡目标');
try {
  const inputManager = new MockInputManager();
  const camera = new MockCamera();
  const combatSystem = new CombatSystem({ inputManager, camera });
  
  const player = new Entity('player_1', 'player');
  player.addComponent(new TransformComponent({ x: 100, y: 100 }));
  player.addComponent(new CombatComponent());
  
  const enemy = new Entity('enemy_1', 'enemy');
  enemy.addComponent(new TransformComponent({ x: 200, y: 200 }));
  const enemyStats = new StatsComponent({ hp: 50, maxHp: 50 });
  enemy.addComponent(enemyStats);
  
  const entities = [player, enemy];
  
  combatSystem.setPlayerEntity(player);
  combatSystem.selectTarget(enemy);
  
  // 模拟敌人死亡
  enemyStats.hp = 0;
  
  // 更新系统（应该自动清除死亡目标）
  inputManager.reset();
  combatSystem.handleTargetSelection(entities);
  
  console.assert(combatSystem.selectedTarget === null, '应该自动清除死亡的目标');
  
  console.log('✓ 自动清除死亡目标功能正常\n');
} catch (error) {
  console.error('✗ 测试失败:', error.message);
}

// 测试9: 更新系统
console.log('测试9: 更新系统');
try {
  const inputManager = new MockInputManager();
  const camera = new MockCamera();
  const combatSystem = new CombatSystem({ inputManager, camera });
  
  const player = new Entity('player_1', 'player');
  player.addComponent(new TransformComponent({ x: 100, y: 100 }));
  player.addComponent(new CombatComponent());
  
  const enemy = new Entity('enemy_1', 'enemy');
  enemy.addComponent(new TransformComponent({ x: 200, y: 200 }));
  enemy.addComponent(new StatsComponent({ hp: 50, maxHp: 50 }));
  enemy.addComponent(new CombatComponent());
  
  const entities = [player, enemy];
  
  combatSystem.setPlayerEntity(player);
  
  // 更新系统应该不抛出错误
  combatSystem.update(0.016, entities);
  
  console.log('✓ 系统更新功能正常\n');
} catch (error) {
  console.error('✗ 测试失败:', error.message);
}

// 测试10: 检查是否在攻击范围内
console.log('测试10: 检查是否在攻击范围内');
try {
  const inputManager = new MockInputManager();
  const camera = new MockCamera();
  const combatSystem = new CombatSystem({ inputManager, camera });
  
  const attacker = new Entity('attacker', 'player');
  attacker.addComponent(new TransformComponent({ x: 100, y: 100 }));
  
  const target = new Entity('target', 'enemy');
  target.addComponent(new TransformComponent({ x: 130, y: 100 }));
  
  // 在范围内（距离30，范围50）
  console.assert(
    combatSystem.isInRange(attacker, target, 50) === true,
    '应该在攻击范围内'
  );
  
  // 不在范围内（距离30，范围20）
  console.assert(
    combatSystem.isInRange(attacker, target, 20) === false,
    '应该不在攻击范围内'
  );
  
  console.log('✓ 攻击范围检测功能正常\n');
} catch (error) {
  console.error('✗ 测试失败:', error.message);
}

// 测试11: 执行攻击
console.log('测试11: 执行攻击');
try {
  const inputManager = new MockInputManager();
  const camera = new MockCamera();
  const combatSystem = new CombatSystem({ inputManager, camera });
  
  const attacker = new Entity('attacker', 'player');
  attacker.name = '玩家';
  attacker.addComponent(new TransformComponent({ x: 100, y: 100 }));
  attacker.addComponent(new StatsComponent({ attack: 20, defense: 5 }));
  const attackerCombat = new CombatComponent({ attackCooldown: 1000 });
  attacker.addComponent(attackerCombat);
  
  const target = new Entity('target', 'enemy');
  target.name = '敌人';
  target.addComponent(new TransformComponent({ x: 130, y: 100 }));
  target.addComponent(new StatsComponent({ hp: 50, maxHp: 50, attack: 10, defense: 8 }));
  
  const currentTime = performance.now();
  
  console.log(`  调试: currentTime = ${currentTime}`);
  console.log(`  调试: lastAttackTime (before) = ${attackerCombat.lastAttackTime}`);
  console.log(`  调试: attackCooldown = ${attackerCombat.attackCooldown}`);
  console.log(`  调试: canAttack = ${attackerCombat.canAttack(currentTime)}`);
  
  // 执行攻击
  combatSystem.performAttack(attacker, target, currentTime);
  
  console.log(`  调试: lastAttackTime (after) = ${attackerCombat.lastAttackTime}`);
  
  // 检查攻击是否执行
  console.assert(
    attackerCombat.lastAttackTime > 0,
    '应该记录攻击时间'
  );
  
  // 检查冷却
  console.assert(
    !attackerCombat.canAttack(currentTime),
    '攻击后应该进入冷却'
  );
  
  console.log('✓ 攻击执行功能正常\n');
} catch (error) {
  console.error('✗ 测试失败:', error.message);
}

// 测试12: 自动攻击逻辑
console.log('测试12: 自动攻击逻辑');
try {
  const inputManager = new MockInputManager();
  const camera = new MockCamera();
  const combatSystem = new CombatSystem({ inputManager, camera });
  
  const player = new Entity('player', 'player');
  player.name = '玩家';
  player.addComponent(new TransformComponent({ x: 100, y: 100 }));
  player.addComponent(new StatsComponent({ attack: 20, defense: 5 }));
  const playerCombat = new CombatComponent({ 
    attackRange: 50,
    attackCooldown: 1000 
  });
  player.addComponent(playerCombat);
  
  const enemy = new Entity('enemy', 'enemy');
  enemy.name = '敌人';
  enemy.addComponent(new TransformComponent({ x: 130, y: 100 }));
  enemy.addComponent(new StatsComponent({ hp: 50, maxHp: 50, attack: 10, defense: 8 }));
  
  const entities = [player, enemy];
  
  combatSystem.setPlayerEntity(player);
  combatSystem.selectTarget(enemy);
  
  const currentTime = performance.now();
  
  // 处理自动攻击
  combatSystem.handleAutoAttack(currentTime, entities);
  
  // 检查是否执行了攻击
  console.assert(
    playerCombat.lastAttackTime > 0,
    '应该自动执行攻击'
  );
  
  console.log('✓ 自动攻击逻辑正常\n');
} catch (error) {
  console.error('✗ 测试失败:', error.message);
}

// 测试13: 攻击范围外不攻击
console.log('测试13: 攻击范围外不攻击');
try {
  const inputManager = new MockInputManager();
  const camera = new MockCamera();
  const combatSystem = new CombatSystem({ inputManager, camera });
  
  const player = new Entity('player', 'player');
  player.addComponent(new TransformComponent({ x: 100, y: 100 }));
  const playerCombat = new CombatComponent({ 
    attackRange: 50,
    attackCooldown: 1000 
  });
  player.addComponent(playerCombat);
  
  const enemy = new Entity('enemy', 'enemy');
  enemy.addComponent(new TransformComponent({ x: 300, y: 300 })); // 远距离
  enemy.addComponent(new StatsComponent({ hp: 50, maxHp: 50 }));
  
  const entities = [player, enemy];
  
  combatSystem.setPlayerEntity(player);
  combatSystem.selectTarget(enemy);
  
  const currentTime = performance.now();
  
  // 处理自动攻击
  combatSystem.handleAutoAttack(currentTime, entities);
  
  // 检查是否没有执行攻击
  console.assert(
    playerCombat.lastAttackTime === 0,
    '超出范围不应该攻击'
  );
  
  console.log('✓ 攻击范围限制正常\n');
} catch (error) {
  console.error('✗ 测试失败:', error.message);
}

// 测试14: 获取攻击冷却进度
console.log('测试14: 获取攻击冷却进度');
try {
  const inputManager = new MockInputManager();
  const camera = new MockCamera();
  const combatSystem = new CombatSystem({ inputManager, camera });
  
  const entity = new Entity('entity', 'player');
  const combat = new CombatComponent({ attackCooldown: 1000 });
  entity.addComponent(combat);
  
  // 初始状态，冷却完成
  const currentTime = performance.now();
  let progress = combatSystem.getAttackCooldownProgress(entity, currentTime);
  console.assert(progress === 1, '初始冷却进度应该是1（完成）');
  
  // 执行攻击后，冷却进度应该接近0
  combat.attack(currentTime);
  progress = combatSystem.getAttackCooldownProgress(entity, currentTime);
  console.assert(progress < 0.1, '攻击后冷却进度应该接近0');
  
  console.log('✓ 攻击冷却进度计算正常\n');
} catch (error) {
  console.error('✗ 测试失败:', error.message);
}

// 测试15: 计算伤害
console.log('测试15: 计算伤害');
try {
  const inputManager = new MockInputManager();
  const camera = new MockCamera();
  const combatSystem = new CombatSystem({ inputManager, camera });
  
  const attacker = new Entity('attacker', 'player');
  attacker.addComponent(new StatsComponent({ attack: 20, defense: 5 }));
  
  const target = new Entity('target', 'enemy');
  target.addComponent(new StatsComponent({ attack: 10, defense: 8 }));
  
  // 计算伤害：20 - 8 = 12（基础伤害）
  const damage = combatSystem.calculateDamage(attacker, target);
  
  console.assert(damage >= 10 && damage <= 14, `伤害应该在10-14之间（考虑随机波动），实际: ${damage}`);
  
  console.log('✓ 伤害计算功能正常\n');
} catch (error) {
  console.error('✗ 测试失败:', error.message);
}

// 测试16: 应用伤害
console.log('测试16: 应用伤害');
try {
  const inputManager = new MockInputManager();
  const camera = new MockCamera();
  const combatSystem = new CombatSystem({ inputManager, camera });
  
  const target = new Entity('target', 'enemy');
  target.addComponent(new TransformComponent({ x: 200, y: 200 }));
  const targetStats = new StatsComponent({ hp: 50, maxHp: 50 });
  target.addComponent(targetStats);
  
  const initialHp = targetStats.hp;
  const damage = 15;
  
  // 应用伤害
  combatSystem.applyDamage(target, damage);
  
  console.assert(targetStats.hp === initialHp - damage, `生命值应该减少${damage}点`);
  console.assert(combatSystem.damageNumbers.length > 0, '应该创建伤害数字');
  
  console.log('✓ 伤害应用功能正常\n');
} catch (error) {
  console.error('✗ 测试失败:', error.message);
}

// 测试17: 伤害数字更新
console.log('测试17: 伤害数字更新');
try {
  const inputManager = new MockInputManager();
  const camera = new MockCamera();
  const combatSystem = new CombatSystem({ inputManager, camera });
  
  // 创建伤害数字
  combatSystem.showDamageNumber({ x: 100, y: 100 }, 25);
  
  console.assert(combatSystem.damageNumbers.length === 1, '应该有1个伤害数字');
  
  const initialY = combatSystem.damageNumbers[0].y;
  
  // 更新伤害数字
  combatSystem.updateDamageNumbers(0.1);
  
  console.assert(combatSystem.damageNumbers[0].y < initialY, '伤害数字应该向上移动');
  console.assert(combatSystem.damageNumbers[0].life < 1.0, '生命周期应该减少');
  
  // 更新到生命周期结束
  combatSystem.updateDamageNumbers(1.0);
  
  console.assert(combatSystem.damageNumbers.length === 0, '过期的伤害数字应该被移除');
  
  console.log('✓ 伤害数字更新功能正常\n');
} catch (error) {
  console.error('✗ 测试失败:', error.message);
}

// 测试18: 完整攻击流程（包含伤害）
console.log('测试18: 完整攻击流程（包含伤害）');
try {
  const inputManager = new MockInputManager();
  const camera = new MockCamera();
  const combatSystem = new CombatSystem({ inputManager, camera });
  
  const player = new Entity('player', 'player');
  player.name = '玩家';
  player.addComponent(new TransformComponent({ x: 100, y: 100 }));
  player.addComponent(new StatsComponent({ attack: 20, defense: 5 }));
  const playerCombat = new CombatComponent({ 
    attackRange: 50,
    attackCooldown: 1000 
  });
  player.addComponent(playerCombat);
  
  const enemy = new Entity('enemy', 'enemy');
  enemy.name = '敌人';
  enemy.addComponent(new TransformComponent({ x: 130, y: 100 }));
  const enemyStats = new StatsComponent({ hp: 50, maxHp: 50, attack: 10, defense: 8 });
  enemy.addComponent(enemyStats);
  
  const initialHp = enemyStats.hp;
  const currentTime = performance.now();
  
  // 执行攻击
  combatSystem.performAttack(player, enemy, currentTime);
  
  // 检查伤害是否应用
  console.assert(enemyStats.hp < initialHp, '敌人应该受到伤害');
  console.assert(combatSystem.damageNumbers.length > 0, '应该显示伤害数字');
  
  console.log('✓ 完整攻击流程正常\n');
} catch (error) {
  console.error('✗ 测试失败:', error.message);
}

// 测试19: 加载技能
console.log('测试19: 加载技能');
try {
  // 创建模拟数据服务
  class MockDataService {
    getSkillData(skillId) {
      return {
        id: skillId,
        name: '测试技能',
        cooldown: 5000,
        manaCost: 20,
        castTime: 0.5,
        range: 100,
        damage: 1.5,
        type: 'physical'
      };
    }
  }
  
  const inputManager = new MockInputManager();
  const camera = new MockCamera();
  const dataService = new MockDataService();
  const combatSystem = new CombatSystem({ inputManager, camera, dataService });
  
  const entity = new Entity('entity', 'player');
  entity.addComponent(new CombatComponent());
  
  // 加载技能
  combatSystem.loadSkills(entity, ['skill1', 'skill2']);
  
  const combat = entity.getComponent('combat');
  console.assert(combat.skills.length === 2, '应该加载2个技能');
  console.assert(combat.skills[0].id === 'skill1', '第一个技能ID应该是skill1');
  
  console.log('✓ 技能加载功能正常\n');
} catch (error) {
  console.error('✗ 测试失败:', error.message);
}

// 测试20: 计算技能伤害
console.log('测试20: 计算技能伤害');
try {
  const inputManager = new MockInputManager();
  const camera = new MockCamera();
  const combatSystem = new CombatSystem({ inputManager, camera });
  
  const caster = new Entity('caster', 'player');
  caster.addComponent(new StatsComponent({ attack: 20, defense: 5 }));
  
  const target = new Entity('target', 'enemy');
  target.addComponent(new StatsComponent({ attack: 10, defense: 8 }));
  
  const skill = {
    id: 'test_skill',
    damage: 1.5, // 1.5倍攻击力
    type: 'physical'
  };
  
  // 计算技能伤害：20 * 1.5 - 8 = 22（基础伤害）
  const damage = combatSystem.calculateSkillDamage(caster, target, skill);
  
  console.assert(damage >= 19 && damage <= 25, `技能伤害应该在19-25之间（考虑随机波动），实际: ${damage}`);
  
  console.log('✓ 技能伤害计算功能正常\n');
} catch (error) {
  console.error('✗ 测试失败:', error.message);
}

// 测试21: 获取技能冷却进度
console.log('测试21: 获取技能冷却进度');
try {
  const inputManager = new MockInputManager();
  const camera = new MockCamera();
  const combatSystem = new CombatSystem({ inputManager, camera });
  
  const entity = new Entity('entity', 'player');
  const combat = new CombatComponent();
  entity.addComponent(combat);
  
  // 添加技能
  const skill = {
    id: 'test_skill',
    cooldown: 5000,
    manaCost: 20
  };
  combat.addSkill(skill);
  
  // 初始状态，冷却完成
  const currentTime = performance.now();
  let progress = combatSystem.getSkillCooldownProgress(entity, 0, currentTime);
  console.assert(progress === 1, '初始冷却进度应该是1（完成）');
  
  // 使用技能后，冷却进度应该接近0
  combat.useSkill(skill.id, currentTime);
  progress = combatSystem.getSkillCooldownProgress(entity, 0, currentTime);
  console.assert(progress < 0.1, '使用技能后冷却进度应该接近0');
  
  console.log('✓ 技能冷却进度计算正常\n');
} catch (error) {
  console.error('✗ 测试失败:', error.message);
}

// 测试22: 检查死亡
console.log('测试22: 检查死亡');
try {
  const inputManager = new MockInputManager();
  const camera = new MockCamera();
  const combatSystem = new CombatSystem({ inputManager, camera });
  
  const entity = new Entity('entity', 'enemy');
  entity.name = '敌人';
  const stats = new StatsComponent({ hp: 10, maxHp: 50 });
  entity.addComponent(stats);
  
  const entities = [entity];
  
  // 实体还活着
  console.assert(!entity.isDying, '实体应该还活着');
  
  // 扣除生命值至0
  stats.takeDamage(10);
  
  // 检查死亡
  combatSystem.checkDeath(entities);
  
  console.assert(entity.isDying === true, '实体应该被标记为正在死亡');
  
  console.log('✓ 死亡检查功能正常\n');
} catch (error) {
  console.error('✗ 测试失败:', error.message);
}

// 测试23: 处理死亡
console.log('测试23: 处理死亡');
try {
  const inputManager = new MockInputManager();
  const camera = new MockCamera();
  const combatSystem = new CombatSystem({ inputManager, camera });
  
  const enemy = new Entity('enemy', 'enemy');
  enemy.name = '敌人';
  enemy.addComponent(new StatsComponent({ hp: 0, maxHp: 50 }));
  enemy.addComponent(new CombatComponent());
  
  // 处理死亡
  combatSystem.handleDeath(enemy);
  
  console.assert(enemy.isDying === true, '敌人应该被标记为正在死亡');
  
  const combat = enemy.getComponent('combat');
  console.assert(combat.target === null, '死亡后应该清除目标');
  
  console.log('✓ 死亡处理功能正常\n');
} catch (error) {
  console.error('✗ 测试失败:', error.message);
}

// 测试24: 玩家复活
console.log('测试24: 玩家复活');
try {
  const inputManager = new MockInputManager();
  const camera = new MockCamera();
  const combatSystem = new CombatSystem({ inputManager, camera });
  
  const player = new Entity('player', 'player');
  player.name = '玩家';
  const stats = new StatsComponent({ hp: 0, maxHp: 100, mp: 0, maxMp: 50 });
  player.addComponent(stats);
  
  player.isDying = true;
  player.isDead = true;
  
  // 复活玩家
  combatSystem.revivePlayer(player);
  
  console.assert(stats.hp === stats.maxHp, '生命值应该恢复满');
  console.assert(stats.mp === stats.maxMp, '魔法值应该恢复满');
  console.assert(player.isDying === false, '应该清除正在死亡标记');
  console.assert(player.isDead === false, '应该清除死亡标记');
  
  console.log('✓ 玩家复活功能正常\n');
} catch (error) {
  console.error('✗ 测试失败:', error.message);
}

// 测试25: 获取死亡和存活实体
console.log('测试25: 获取死亡和存活实体');
try {
  const inputManager = new MockInputManager();
  const camera = new MockCamera();
  const combatSystem = new CombatSystem({ inputManager, camera });
  
  const alive1 = new Entity('alive1', 'enemy');
  alive1.addComponent(new StatsComponent({ hp: 50, maxHp: 50 }));
  
  const alive2 = new Entity('alive2', 'enemy');
  alive2.addComponent(new StatsComponent({ hp: 30, maxHp: 50 }));
  
  const dead1 = new Entity('dead1', 'enemy');
  dead1.addComponent(new StatsComponent({ hp: 0, maxHp: 50 }));
  dead1.isDead = true;
  
  const dead2 = new Entity('dead2', 'enemy');
  dead2.addComponent(new StatsComponent({ hp: 0, maxHp: 50 }));
  dead2.isDead = true;
  
  const entities = [alive1, dead1, alive2, dead2];
  
  const aliveEntities = combatSystem.getAliveEntities(entities);
  const deadEntities = combatSystem.getDeadEntities(entities);
  
  console.assert(aliveEntities.length === 2, '应该有2个存活实体');
  console.assert(deadEntities.length === 2, '应该有2个死亡实体');
  
  console.log('✓ 获取死亡和存活实体功能正常\n');
} catch (error) {
  console.error('✗ 测试失败:', error.message);
}

console.log('=== 所有测试完成 ===');
