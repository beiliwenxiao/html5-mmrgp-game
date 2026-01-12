/**
 * ProgressiveTipsConfig - 渐进式提示配置文件
 * 
 * 定义所有渐进式提示的配置信息，包括：
 * - 提示基本信息（标题、描述、文本）
 * - 触发条件ID（对应ProgressiveTipsConditions中的条件函数）
 * - 显示位置和优先级
 * 
 * 共11个渐进式提示：
 * 1. 醒来
 * 2. 移动
 * 3. 发现火堆
 * 4. 发现物品
 * 5. 查看背包
 * 6. 使用消耗品
 * 7. 查看属性
 * 7.1 关闭面板
 * 8. 又发现物品
 * 9. 装备物品
 * 10. 查看装备
 */

export const ProgressiveTipsConfig = {
  // 1. 醒来（不显示火堆）
  progressive_tip_1: {
    id: 'progressive_tip_1',
    title: '提示',
    description: '你从黑暗中醒来',
    text: '你从黑暗中醒来,饥寒交迫。按任意键继续',
    position: 'center',
    priority: 100,
    triggerConditionId: 'progressive_tip_1_trigger'
  },

  // 2. 移动（火堆出现）
  progressive_tip_2: {
    id: 'progressive_tip_2',
    title: '提示',
    description: '四处走走看看',
    text: '四处走走。按<span class="key">W</span><span class="key">A</span><span class="key">S</span><span class="key">D</span>移动',
    position: 'center',
    priority: 99,
    triggerConditionId: 'progressive_tip_2_trigger'
  },

  // 3. 发现火堆
  progressive_tip_3: {
    id: 'progressive_tip_3',
    title: '提示',
    description: '发现火堆',
    text: '你发现一个熄灭的火堆。靠近并按<span class="key">E</span>键点燃火堆',
    position: 'center',
    priority: 98,
    triggerConditionId: 'progressive_tip_3_trigger'
  },

  // 4. 发现物品（点燃火堆后，只有残羹）
  progressive_tip_4: {
    id: 'progressive_tip_4',
    title: '提示',
    description: '发现物品',
    text: '点燃了篝火，你发现了一些物品。靠近物品，按<span class="key">E</span>键拾取',
    position: 'center',
    priority: 97,
    triggerConditionId: 'progressive_tip_4_trigger'
  },

  // 5. 查看背包（拾取1个物品后）
  progressive_tip_5: {
    id: 'progressive_tip_5',
    title: '提示',
    description: '查看背包',
    text: '物品到了背包里，查看一下背包，按<span class="key">B</span>键查看背包',
    position: 'center',
    priority: 96,
    triggerConditionId: 'progressive_tip_5_trigger'
  },

  // 6. 使用消耗品
  progressive_tip_6: {
    id: 'progressive_tip_6',
    title: '提示',
    description: '使用消耗品',
    text: '点击残羹使用，恢复生命值',
    position: 'center',
    priority: 95,
    triggerConditionId: 'progressive_tip_6_trigger'
  },

  // 7. 查看属性（使用残羹后）
  progressive_tip_7: {
    id: 'progressive_tip_7',
    title: '提示',
    description: '恢复了一点',
    text: '你发现自己舒服了一些。按 <span class="key">C</span> 查看属性',
    position: 'center',
    priority: 94,
    triggerConditionId: 'progressive_tip_7_trigger'
  },

  // 7.1 关闭属性，关闭背包
  progressive_tip_7_1: {
    id: 'progressive_tip_7_1',
    title: '提示',
    description: '关闭属性和背包',
    text: '再次按 <span class="key">C</span>关闭属性。再次按 <span class="key">B</span> 关闭背包',
    position: 'center',
    priority: 93,
    triggerConditionId: 'progressive_tip_7_1_trigger'
  },


  // 8. 又发现物品（查看属性后，2个装备）
  progressive_tip_8: {
    id: 'progressive_tip_8',
    title: '提示',
    description: '又发现了物品',
    text: '查看周围，你又发现了一些物品。靠近物品，按<span class="key">E</span>键拾取',
    position: 'center',
    priority: 90,
    triggerConditionId: 'progressive_tip_8_trigger'
  },

  // 9. 装备物品
  progressive_tip_9: {
    id: 'progressive_tip_9',
    title: '提示',
    description: '装备物品',
    text: '点击物品装备',
    position: 'center',
    priority: 80,
    triggerConditionId: 'progressive_tip_9_trigger'
  },

  // 10. 查看装备（装备2件物品后）
  progressive_tip_10: {
    id: 'progressive_tip_10',
    title: '提示',
    description: '查看装备',
    text: '按<span class="key">V</span>键查看装备',
    position: 'center',
    priority: 70,
    triggerConditionId: 'progressive_tip_10_trigger'
  }
};

export default ProgressiveTipsConfig;
