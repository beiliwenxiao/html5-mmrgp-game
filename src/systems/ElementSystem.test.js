/**
 * ElementSystem.test.js
 * 五行元素系统单元测试
 */

import { ElementSystem, ElementTypes, ElementNames, ElementUpgrades, ElementSynthesis, ElementCounters } from './ElementSystem.js';

/**
 * 简单的测试框架
 */
class TestFramework {
  constructor() {
    this.tests = [];
    this.passed = 0;
    this.failed = 0;
  }
  
  test(name, testFn) {
    this.tests.push({ name, testFn });
  }
  
  assertEqual(actual, expected, message = '') {
    if (actual === expected) {
      return true;
    } else {
      throw new Error(`断言失败: ${message}\n期望: ${expected}\n实际: ${actual}`);
    }
  }
  
  assertTrue(condition, message = '') {
    if (condition) {
      return true;
    } else {
      throw new Error(`断言失败: ${message}\n期望: true\n实际: ${condition}`);
    }
  }
  
  assertFalse(condition, message = '') {
    if (!condition) {
      return true;
    } else {
      throw new Error(`断言失败: ${message}\n期望: false\n实际: ${condition}`);
    }
  }
  
  run() {
    console.log('开始运行元素系统测试...\n');
    
    for (const { name, testFn } of this.tests) {
      try {
        testFn.call(this);
        console.log(`✅ ${name}`);
        this.passed++;
      } catch (error) {
        console.error(`❌ ${name}`);
        console.error(`   ${error.message}\n`);
        this.failed++;
      }
    }
    
    console.log(`\n测试完成: ${this.passed} 通过, ${this.failed} 失败`);
    return this.failed === 0;
  }
}

// 创建测试实例
const test = new TestFramework();
const elementSystem = new ElementSystem();

// 测试元素类型定义
test.test('元素类型定义正确', function() {
  this.assertEqual(ElementTypes.FIRE, 0, '火元素ID应为0');
  this.assertEqual(ElementTypes.WATER, 2, '水元素ID应为2');
  this.assertEqual(ElementTypes.THUNDERSTORM, 8, '雷暴元素ID应为8');
  this.assertEqual(Object.keys(ElementTypes).length, 13, '应有13种元素类型');
});

// 测试元素名称映射
test.test('元素名称映射正确', function() {
  this.assertEqual(ElementNames[ElementTypes.FIRE], '火', '火元素名称应为"火"');
  this.assertEqual(ElementNames[ElementTypes.ICE], '冰', '冰元素名称应为"冰"');
  this.assertEqual(ElementNames[ElementTypes.THUNDERSTORM], '雷暴', '雷暴元素名称应为"雷暴"');
});

// 测试元素升级关系
test.test('元素升级关系正确', function() {
  this.assertEqual(ElementUpgrades[ElementTypes.FIRE], ElementTypes.EXPLOSION, '火应升级为爆');
  this.assertEqual(ElementUpgrades[ElementTypes.WATER], ElementTypes.ICE, '水应升级为冰');
  this.assertEqual(ElementUpgrades[ElementTypes.WIND], ElementTypes.STORM, '风应升级为暴风');
});

// 测试元素合成关系
test.test('元素合成关系正确', function() {
  const key1 = `${ElementTypes.STORM}_${ElementTypes.THUNDER}`;
  const key2 = `${ElementTypes.THUNDER}_${ElementTypes.STORM}`;
  
  this.assertEqual(ElementSynthesis[key1], ElementTypes.THUNDERSTORM, '暴风+雷电应合成雷暴');
  this.assertEqual(ElementSynthesis[key2], ElementTypes.THUNDERSTORM, '雷电+暴风应合成雷暴');
});

// 测试五行相克关系
test.test('五行相克关系正确', function() {
  // 火克木
  this.assertTrue(ElementCounters[ElementTypes.FIRE].includes(ElementTypes.WOOD), '火应克制木');
  this.assertTrue(ElementCounters[ElementTypes.EXPLOSION].includes(ElementTypes.TIMBER), '爆应克制落木');
  
  // 木克土
  this.assertTrue(ElementCounters[ElementTypes.WOOD].includes(ElementTypes.EARTH), '木应克制土');
  
  // 土克水
  this.assertTrue(ElementCounters[ElementTypes.EARTH].includes(ElementTypes.WATER), '土应克制水');
  
  // 水克火
  this.assertTrue(ElementCounters[ElementTypes.WATER].includes(ElementTypes.FIRE), '水应克制火');
  
  // 金(风电)克木
  this.assertTrue(ElementCounters[ElementTypes.WIND].includes(ElementTypes.WOOD), '风应克制木');
  this.assertTrue(ElementCounters[ElementTypes.ELECTRIC].includes(ElementTypes.WOOD), '电应克制木');
});

// 测试ElementSystem方法
test.test('getElementName方法正确', function() {
  this.assertEqual(elementSystem.getElementName(ElementTypes.FIRE), '火', 'getElementName应返回正确名称');
  this.assertEqual(elementSystem.getElementName(999), '未知', '未知元素应返回"未知"');
});

test.test('canUpgradeElement方法正确', function() {
  this.assertTrue(elementSystem.canUpgradeElement(ElementTypes.FIRE), '火元素应可升级');
  this.assertFalse(elementSystem.canUpgradeElement(ElementTypes.EXPLOSION), '爆元素应不可升级');
  this.assertFalse(elementSystem.canUpgradeElement(ElementTypes.THUNDERSTORM), '雷暴元素应不可升级');
});

test.test('upgradeElement方法正确', function() {
  this.assertEqual(elementSystem.upgradeElement(ElementTypes.FIRE), ElementTypes.EXPLOSION, '火应升级为爆');
  this.assertEqual(elementSystem.upgradeElement(ElementTypes.WATER), ElementTypes.ICE, '水应升级为冰');
  this.assertEqual(elementSystem.upgradeElement(ElementTypes.EXPLOSION), null, '爆应无法升级');
});

test.test('canSynthesizeElements方法正确', function() {
  this.assertTrue(elementSystem.canSynthesizeElements(ElementTypes.STORM, ElementTypes.THUNDER), '暴风和雷电应可合成');
  this.assertTrue(elementSystem.canSynthesizeElements(ElementTypes.THUNDER, ElementTypes.STORM), '雷电和暴风应可合成');
  this.assertFalse(elementSystem.canSynthesizeElements(ElementTypes.FIRE, ElementTypes.WATER), '火和水应不可合成');
});

test.test('synthesizeElements方法正确', function() {
  this.assertEqual(elementSystem.synthesizeElements(ElementTypes.STORM, ElementTypes.THUNDER), ElementTypes.THUNDERSTORM, '暴风+雷电应合成雷暴');
  this.assertEqual(elementSystem.synthesizeElements(ElementTypes.THUNDER, ElementTypes.STORM), ElementTypes.THUNDERSTORM, '雷电+暴风应合成雷暴');
  this.assertEqual(elementSystem.synthesizeElements(ElementTypes.FIRE, ElementTypes.WATER), null, '火+水应无法合成');
});

test.test('isElementCountering方法正确', function() {
  this.assertTrue(elementSystem.isElementCountering(ElementTypes.FIRE, ElementTypes.WOOD), '火应克制木');
  this.assertTrue(elementSystem.isElementCountering(ElementTypes.WATER, ElementTypes.FIRE), '水应克制火');
  this.assertFalse(elementSystem.isElementCountering(ElementTypes.FIRE, ElementTypes.WATER), '火应不克制水');
});

test.test('getBaseElements方法正确', function() {
  const baseElements = elementSystem.getBaseElements();
  this.assertEqual(baseElements.length, 6, '应有6个基础元素');
  this.assertTrue(baseElements.includes(ElementTypes.FIRE), '应包含火元素');
  this.assertTrue(baseElements.includes(ElementTypes.WATER), '应包含水元素');
  this.assertFalse(baseElements.includes(ElementTypes.EXPLOSION), '不应包含爆元素');
});

test.test('getAdvancedElements方法正确', function() {
  const advancedElements = elementSystem.getAdvancedElements();
  this.assertEqual(advancedElements.length, 7, '应有7个高级元素');
  this.assertTrue(advancedElements.includes(ElementTypes.EXPLOSION), '应包含爆元素');
  this.assertTrue(advancedElements.includes(ElementTypes.ICE), '应包含冰元素');
  this.assertFalse(advancedElements.includes(ElementTypes.FIRE), '不应包含火元素');
});

test.test('isBaseElement方法正确', function() {
  this.assertTrue(elementSystem.isBaseElement(ElementTypes.FIRE), '火应为基础元素');
  this.assertTrue(elementSystem.isBaseElement(ElementTypes.WATER), '水应为基础元素');
  this.assertFalse(elementSystem.isBaseElement(ElementTypes.EXPLOSION), '爆应不为基础元素');
});

test.test('isAdvancedElement方法正确', function() {
  this.assertTrue(elementSystem.isAdvancedElement(ElementTypes.EXPLOSION), '爆应为高级元素');
  this.assertTrue(elementSystem.isAdvancedElement(ElementTypes.ICE), '冰应为高级元素');
  this.assertFalse(elementSystem.isAdvancedElement(ElementTypes.FIRE), '火应不为高级元素');
});

test.test('getBaseElementType方法正确', function() {
  this.assertEqual(elementSystem.getBaseElementType(ElementTypes.FIRE), ElementTypes.FIRE, '火的基础形态应为火');
  this.assertEqual(elementSystem.getBaseElementType(ElementTypes.EXPLOSION), ElementTypes.FIRE, '爆的基础形态应为火');
  this.assertEqual(elementSystem.getBaseElementType(ElementTypes.ICE), ElementTypes.WATER, '冰的基础形态应为水');
  this.assertEqual(elementSystem.getBaseElementType(ElementTypes.THUNDERSTORM), ElementTypes.WIND, '雷暴的基础形态应为风');
});

// 测试相克倍率表
test.test('ElementCounterTable初始化正确', function() {
  const counterTable = elementSystem.counterTable;
  
  // 测试火克木
  this.assertEqual(counterTable.getCounterMultiplier(ElementTypes.FIRE, ElementTypes.WOOD), 1.5, '火克木应有1.5倍伤害');
  this.assertEqual(counterTable.getCounterMultiplier(ElementTypes.WOOD, ElementTypes.FIRE), 0.75, '木被火克应有0.75倍伤害');
  
  // 测试无相克关系
  this.assertEqual(counterTable.getCounterMultiplier(ElementTypes.FIRE, ElementTypes.ELECTRIC), 1.0, '火对电应无相克关系');
  
  // 测试边界情况
  this.assertEqual(counterTable.getCounterMultiplier(-1, 0), 1.0, '无效元素应返回1.0');
  this.assertEqual(counterTable.getCounterMultiplier(0, 99), 1.0, '无效元素应返回1.0');
});

test.test('getElementCounterInfo方法正确', function() {
  // 测试相克优势
  const advantageInfo = elementSystem.getElementCounterInfo(ElementTypes.FIRE, ElementTypes.WOOD);
  this.assertEqual(advantageInfo.relationship, 'advantage', '火对木应为优势关系');
  this.assertEqual(advantageInfo.multiplier, 1.5, '火对木应有1.5倍伤害');
  
  // 测试相克劣势
  const disadvantageInfo = elementSystem.getElementCounterInfo(ElementTypes.WOOD, ElementTypes.FIRE);
  this.assertEqual(disadvantageInfo.relationship, 'disadvantage', '木对火应为劣势关系');
  this.assertEqual(disadvantageInfo.multiplier, 0.75, '木对火应有0.75倍伤害');
  
  // 测试无相克
  const normalInfo = elementSystem.getElementCounterInfo(ElementTypes.FIRE, ElementTypes.ELECTRIC);
  this.assertEqual(normalInfo.relationship, 'normal', '火对电应为普通关系');
  this.assertEqual(normalInfo.multiplier, 1.0, '火对电应有1.0倍伤害');
});

// 测试伤害计算
test.test('calculateElementDamage方法正确', function() {
  // 构造测试数据
  const attacker = {
    elementAttack: { [ElementTypes.FIRE]: 20 },
    mainElement: ElementTypes.FIRE
  };
  
  const defender = {
    elementDefense: { [ElementTypes.FIRE]: 10 },
    mainElement: ElementTypes.WOOD
  };
  
  const baseDamage = 30;
  const skillElement = ElementTypes.FIRE;
  
  // 计算预期伤害
  // 元素伤害 = 20 - 10 = 10
  // 相克倍率 = 1.5 (火克木)
  // 最终伤害 = (30 + 10) * 1.5 = 60
  const expectedDamage = Math.floor((baseDamage + 10) * 1.5);
  
  const actualDamage = elementSystem.calculateElementDamage(attacker, defender, skillElement, baseDamage);
  this.assertEqual(actualDamage, expectedDamage, '伤害计算应正确');
});

test.test('calculateElementDamage边界情况', function() {
  // 测试最小伤害
  const attacker = {
    elementAttack: { [ElementTypes.FIRE]: 5 },
    mainElement: ElementTypes.FIRE
  };
  
  const defender = {
    elementDefense: { [ElementTypes.FIRE]: 20 },
    mainElement: ElementTypes.FIRE
  };
  
  const baseDamage = 0;
  const skillElement = ElementTypes.FIRE;
  
  const actualDamage = elementSystem.calculateElementDamage(attacker, defender, skillElement, baseDamage);
  this.assertTrue(actualDamage >= 1, '最终伤害应至少为1');
});

test.test('calculateElementDamage缺少元素属性', function() {
  // 测试缺少元素攻击力
  const attacker = {
    elementAttack: {},
    mainElement: ElementTypes.FIRE
  };
  
  const defender = {
    elementDefense: {},
    mainElement: ElementTypes.WOOD
  };
  
  const baseDamage = 25;
  const skillElement = ElementTypes.FIRE;
  
  // 元素伤害 = 0 - 0 = 0，但最小为1
  // 相克倍率 = 1.5 (火克木)
  // 最终伤害 = (25 + 1) * 1.5 = 39
  const expectedDamage = Math.floor((baseDamage + 1) * 1.5);
  
  const actualDamage = elementSystem.calculateElementDamage(attacker, defender, skillElement, baseDamage);
  this.assertEqual(actualDamage, expectedDamage, '缺少元素属性时应使用默认值');
});

// 运行所有测试
export function runElementSystemTests() {
  return test.run();
}

// 如果直接运行此文件，执行测试
if (typeof window !== 'undefined') {
  // 浏览器环境
  window.runElementSystemTests = runElementSystemTests;
  console.log('元素系统测试已加载，调用 runElementSystemTests() 来运行测试');
} else {
  // Node.js环境
  runElementSystemTests();
}