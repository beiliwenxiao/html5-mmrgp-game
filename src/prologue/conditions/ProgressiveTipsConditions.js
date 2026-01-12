/**
 * ProgressiveTipsConditions - 渐进式提示条件判断器
 * 
 * 定义所有渐进式提示的触发条件判断函数。
 * 每个条件函数接收场景实例作为参数，返回布尔值。
 * 
 * 条件函数命名规范：
 * - 触发条件：{tipId}_trigger
 * 
 * 共11个渐进式提示的触发条件
 */

export class ProgressiveTipsConditions {
  /**
   * 提示1 - 醒来
   * @param {Object} scene - 场景实例
   * @returns {boolean}
   */
  static progressive_tip_1_trigger(scene) {
    return scene.tutorialPhase === 'character_creation' && 
           !scene.tutorialsCompleted.progressive_tip_1;
  }

  /**
   * 提示2 - 移动
   * @param {Object} scene - 场景实例
   * @returns {boolean}
   */
  static progressive_tip_2_trigger(scene) {
    return scene.tutorialsCompleted.progressive_tip_1 && 
           !scene.tutorialsCompleted.progressive_tip_2;
  }

  /**
   * 提示3 - 发现火堆
   * @param {Object} scene - 场景实例
   * @returns {boolean}
   */
  static progressive_tip_3_trigger(scene) {
    return scene.tutorialsCompleted.progressive_tip_2 && 
           !scene.campfire.lit && 
           !scene.tutorialsCompleted.progressive_tip_3;
  }

  /**
   * 提示4 - 发现物品
   * @param {Object} scene - 场景实例
   * @returns {boolean}
   */
  static progressive_tip_4_trigger(scene) {
    return scene.campfire.lit && 
           scene.pickupItems && 
           scene.pickupItems.length > 0 && 
           !scene.tutorialsCompleted.progressive_tip_4;
  }

  /**
   * 提示5 - 查看背包
   * @param {Object} scene - 场景实例
   * @returns {boolean}
   */
  static progressive_tip_5_trigger(scene) {
    return scene.tutorialPhase === 'view_inventory' && 
           !scene.tutorialsCompleted.progressive_tip_5;
  }

  /**
   * 提示6 - 使用消耗品
   * @param {Object} scene - 场景实例
   * @returns {boolean}
   */
  static progressive_tip_6_trigger(scene) {
    return scene.tutorialPhase === 'consumable' && 
           !scene.tutorialsCompleted.progressive_tip_6;
  }

  /**
   * 提示7 - 查看属性
   * @param {Object} scene - 场景实例
   * @returns {boolean}
   */
  static progressive_tip_7_trigger(scene) {
    return scene.tutorialsCompleted.progressive_tip_6 && 
           !scene.tutorialsCompleted.progressive_tip_7;
  }

  /**
   * 提示7.1 - 关闭属性面板和背包面板
   * 当属性面板和背包面板都关闭时触发
   * @param {Object} scene - 场景实例
   * @returns {boolean}
   */
  static progressive_tip_7_1_trigger(scene) {
    // 必须完成提示7，且两个面板都已关闭
    const bothPanelsClosed = !scene.playerInfoPanel?.visible && !scene.inventoryPanel?.visible;
    return scene.tutorialsCompleted.progressive_tip_7 && 
           bothPanelsClosed &&
           !scene.tutorialsCompleted.progressive_tip_7_1;
  }

  /**
   * 提示8 - 又发现物品
   * @param {Object} scene - 场景实例
   * @returns {boolean}
   */
  static progressive_tip_8_trigger(scene) {
    return scene.tutorialPhase === 'pickup_equipment' && 
           !scene.tutorialsCompleted.progressive_tip_8;
  }

  /**
   * 提示9 - 装备物品
   * @param {Object} scene - 场景实例
   * @returns {boolean}
   */
  static progressive_tip_9_trigger(scene) {
    return scene.inventoryPanel?.visible && 
           !scene.tutorialsCompleted.progressive_tip_9;
  }

  /**
   * 提示10 - 查看装备
   * @param {Object} scene - 场景实例
   * @returns {boolean}
   */
  static progressive_tip_10_trigger(scene) {
    const equipment = scene.playerEntity?.getComponent('equipment');
    // 必须装备两件物品（武器和护甲）
    const equippedCount = equipment && equipment.slots ? 
      Object.keys(equipment.slots).filter(slot => equipment.slots[slot]).length : 0;
    return equippedCount >= 2 && !scene.tutorialsCompleted.progressive_tip_10;
  }

  /**
   * 根据条件ID获取条件函数
   * @param {string} conditionId - 条件ID
   * @returns {Function|null}
   */
  static getCondition(conditionId) {
    if (typeof this[conditionId] === 'function') {
      return this[conditionId].bind(this);
    }
    
    console.warn(`ProgressiveTipsConditions: 未找到条件函数 - ${conditionId}`);
    return null;
  }

  /**
   * 执行条件判断
   * @param {string} conditionId - 条件ID
   * @param {Object} scene - 场景实例
   * @returns {boolean}
   */
  static evaluate(conditionId, scene) {
    const condition = this.getCondition(conditionId);
    
    if (!condition) {
      return false;
    }
    
    try {
      return condition(scene);
    } catch (error) {
      console.error(`ProgressiveTipsConditions: 条件判断出错 - ${conditionId}`, error);
      return false;
    }
  }
}

export default ProgressiveTipsConditions;
