/**
 * StatusEffectComponent.test.js
 * 状态效果组件单元测试
 */

import { StatusEffectComponent, StatusEffectType, StatusEffect } from './StatusEffectComponent.js';
import { Entity } from '../Entity.js';
import { StatsComponent } from './StatsComponent.js';

// 简单的测试框架
class TestRunner {
  constructor() {
    this.tests = [];
    this.passed = 0;
    this.failed = 0;
  }

  test(name, fn) {
    this.tests.push({ name, fn });
  }

  async run() {
    console.log('开始运行状态效果组件测试...\n');
    
    for (const test of this.tests) {
      try {
        await test.fn();
        console.log(`✅ ${test.name}`);
        this.passed++;
      } catch (error) {
        console.error(`❌ ${test.name}: ${error.message}`);
        this.failed++;
      }
    }
    
    console.log(`\n测试完成: ${this.passed} 通过, ${this.failed} 失败`);
    return this.failed === 0;
  }
}

function assert(condition, message) {
  if (!condition) {
    throw new Error(message || 'Assertion failed');
  }
}

function assertApproxEqual(actual, expected, tolerance = 0.01, message) {
  if (Math.abs(actual - expected) > tolerance) {
    throw new Error(message || `Expected ${expected}, got ${actual}`);
  }
}

// 创建测试实体
function createTestEntity() {
  const entity = new Entity('test-entity', 'player');
  const stats = new StatsComponent({
    maxHp: 100,
    maxMp: 100,
    attack: 20,
    defense: 10,
    speed: 100
  });
  entity.addComponent(stats);
  return entity;
}

// 测试用例
const runner = new TestRunner();

runner.test('StatusEffect 基础功能', () => {
  const effect = new StatusEffect(StatusEffectType.POISON, 5.0, 1);
  
  assert(effect.type === StatusEffectType.POISON, '状态效果类型应该正确');
  assert(effect.duration === 5.0, '持续时间应该正确');
  assert(effect.remainingTime === 5.0, '剩余时间应该等于持续时间');
  assert(effect.intensity === 1, '强度应该正确');
  assert(effect.data.name === '中毒', '状态效果数据应该正确');
});

runner.test('StatusEffect 时间更新', () => {
  const effect = new StatusEffect(StatusEffectType.HASTE, 3.0, 1);
  
  // 更新1秒
  const stillActive = effect.update(1.0);
  assert(stillActive === true, '效果应该仍然活跃');
  assertApproxEqual(effect.remainingTime, 2.0, 0.01, '剩余时间应该减少1秒');
  
  // 更新到过期
  effect.update(2.5);
  assert(effect.isExpired() === true, '效果应该过期');
});

runner.test('StatusEffectComponent 添加效果', () => {
  const component = new StatusEffectComponent();
  
  // 添加中毒效果
  const success = component.addEffect(StatusEffectType.POISON, 5.0, 1);
  assert(success === true, '应该成功添加效果');
  assert(component.hasEffect(StatusEffectType.POISON) === true, '应该有中毒效果');
  assert(component.getEffectCount() === 1, '效果数量应该为1');
});

runner.test('StatusEffectComponent 效果替换', () => {
  const component = new StatusEffectComponent();
  
  // 添加弱中毒效果
  component.addEffect(StatusEffectType.POISON, 3.0, 1);
  
  // 添加强中毒效果（应该替换）
  const success = component.addEffect(StatusEffectType.POISON, 5.0, 2);
  assert(success === true, '应该成功替换效果');
  
  const effect = component.getEffect(StatusEffectType.POISON);
  assert(effect.duration === 5.0, '持续时间应该更新');
  assert(effect.intensity === 2, '强度应该更新');
});

runner.test('StatusEffectComponent 属性修改器', () => {
  const component = new StatusEffectComponent();
  
  // 添加狂暴效果（攻击力+30%）
  component.addEffect(StatusEffectType.RAGE, 5.0, 1);
  
  // 添加护盾效果（防御力+20）
  component.addEffect(StatusEffectType.SHIELD, 5.0, 1);
  
  // 添加加速效果（速度+50%）
  component.addEffect(StatusEffectType.HASTE, 5.0, 1);
  
  // 强制重新计算修改器
  component.needsRecalculation = true;
  component.recalculateModifiers();
  
  // 测试修改后的属性
  const modifiedAttack = component.getModifiedAttack(100);
  const modifiedDefense = component.getModifiedDefense(50);
  const modifiedSpeed = component.getModifiedSpeed(100);
  
  assertApproxEqual(modifiedAttack, 130, 1, '攻击力应该增加30%');
  assertApproxEqual(modifiedDefense, 70, 1, '防御力应该增加20');
  assertApproxEqual(modifiedSpeed, 150, 1, '速度应该增加50%');
});

runner.test('StatusEffectComponent 效果更新', async () => {
  const entity = createTestEntity();
  const component = new StatusEffectComponent();
  entity.addComponent(component);
  
  // 添加恢复效果
  component.addEffect(StatusEffectType.REGENERATION, 2.0, 1);
  
  const stats = entity.getComponent('stats');
  const initialHp = stats.hp;
  
  // 模拟1秒更新
  component.update(1.0, entity);
  
  // 检查生命值是否恢复（恢复效果每秒+5HP）
  // 注意：实际的恢复在 triggerEffect 中处理
  assert(component.hasEffect(StatusEffectType.REGENERATION) === true, '恢复效果应该仍然存在');
  
  // 模拟效果过期
  component.update(1.5, entity);
  assert(component.hasEffect(StatusEffectType.REGENERATION) === false, '恢复效果应该过期');
});

runner.test('StatusEffectComponent 清除效果', () => {
  const component = new StatusEffectComponent();
  
  // 添加多个效果
  component.addEffect(StatusEffectType.POISON, 5.0, 1);
  component.addEffect(StatusEffectType.HASTE, 5.0, 1);
  component.addEffect(StatusEffectType.RAGE, 5.0, 1);
  component.addEffect(StatusEffectType.WEAKNESS, 5.0, 1);
  
  assert(component.getEffectCount() === 4, '应该有4个效果');
  
  // 清除Buff
  component.clearEffectsByType('buff');
  assert(component.hasEffect(StatusEffectType.HASTE) === false, '加速效果应该被清除');
  assert(component.hasEffect(StatusEffectType.RAGE) === false, '狂暴效果应该被清除');
  assert(component.hasEffect(StatusEffectType.POISON) === true, '中毒效果应该保留');
  assert(component.hasEffect(StatusEffectType.WEAKNESS) === true, '虚弱效果应该保留');
  
  // 清除Debuff
  component.clearEffectsByType('debuff');
  assert(component.getEffectCount() === 0, '所有效果应该被清除');
});

runner.test('StatusEffectComponent Buff/Debuff 计数', () => {
  const component = new StatusEffectComponent();
  
  // 添加Buff
  component.addEffect(StatusEffectType.HASTE, 5.0, 1);
  component.addEffect(StatusEffectType.RAGE, 5.0, 1);
  
  // 添加Debuff
  component.addEffect(StatusEffectType.POISON, 5.0, 1);
  component.addEffect(StatusEffectType.WEAKNESS, 5.0, 1);
  
  assert(component.getBuffCount() === 2, 'Buff数量应该为2');
  assert(component.getDebuffCount() === 2, 'Debuff数量应该为2');
  assert(component.getEffectCount() === 4, '总效果数量应该为4');
});

// 运行测试
runner.run().then(success => {
  if (success) {
    console.log('\n🎉 所有测试通过！');
  } else {
    console.log('\n💥 有测试失败！');
  }
});