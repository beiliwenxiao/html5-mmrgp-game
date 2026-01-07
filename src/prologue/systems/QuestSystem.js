/**
 * QuestSystem - 任务引导系统
 * 
 * 功能：
 * - 任务注册和管理
 * - 任务触发和进度跟踪
 * - 任务完成和奖励发放
 * - 任务目标标记
 * - 任务状态保存和加载
 * 
 * @author Kiro
 * @date 2026-01-07
 */

export class QuestSystem {
  constructor() {
    // 所有注册的任务
    this.quests = new Map();
    
    // 当前激活的任务
    this.activeQuests = new Map();
    
    // 已完成的任务
    this.completedQuests = new Set();
    
    // 任务目标标记
    this.questMarkers = new Map();
    
    // 回调函数
    this.callbacks = {
      onQuestStart: null,
      onQuestProgress: null,
      onQuestComplete: null,
      onQuestFail: null
    };
  }

  /**
   * 注册任务
   * @param {Object} quest - 任务配置
   * @param {string} quest.id - 任务ID
   * @param {string} quest.name - 任务名称
   * @param {string} quest.description - 任务描述
   * @param {Array} quest.objectives - 任务目标列表
   * @param {Object} quest.rewards - 任务奖励
   * @param {Array} quest.prerequisites - 前置任务ID列表
   * @param {boolean} quest.autoStart - 是否自动开始
   * @param {Object} quest.marker - 任务标记位置
   */
  registerQuest(quest) {
    if (!quest.id) {
      throw new Error('Quest must have an id');
    }

    if (!quest.name) {
      throw new Error('Quest must have a name');
    }

    if (!quest.objectives || quest.objectives.length === 0) {
      throw new Error('Quest must have at least one objective');
    }

    // 初始化任务数据
    const questData = {
      id: quest.id,
      name: quest.name,
      description: quest.description || '',
      objectives: quest.objectives.map(obj => ({
        id: obj.id,
        description: obj.description,
        type: obj.type || 'custom', // custom, kill, collect, reach, interact
        target: obj.target || null,
        current: 0,
        required: obj.required || 1,
        completed: false
      })),
      rewards: quest.rewards || {},
      prerequisites: quest.prerequisites || [],
      autoStart: quest.autoStart !== undefined ? quest.autoStart : false,
      marker: quest.marker || null,
      status: 'registered' // registered, active, completed, failed
    };

    this.quests.set(quest.id, questData);

    // 如果设置了自动开始，检查前置条件
    if (questData.autoStart) {
      this.tryStartQuest(quest.id);
    }
  }

  /**
   * 尝试开始任务（检查前置条件）
   * @param {string} questId - 任务ID
   * @returns {boolean} 是否成功开始
   */
  tryStartQuest(questId) {
    const quest = this.quests.get(questId);
    if (!quest) {
      console.warn(`Quest ${questId} not found`);
      return false;
    }

    // 检查任务是否已经激活或完成
    if (quest.status === 'active' || quest.status === 'completed') {
      return false;
    }

    // 检查前置任务
    for (const prereqId of quest.prerequisites) {
      if (!this.completedQuests.has(prereqId)) {
        return false;
      }
    }

    // 开始任务
    return this.startQuest(questId);
  }

  /**
   * 开始任务
   * @param {string} questId - 任务ID
   * @returns {boolean} 是否成功开始
   */
  startQuest(questId) {
    const quest = this.quests.get(questId);
    if (!quest) {
      console.warn(`Quest ${questId} not found`);
      return false;
    }

    if (quest.status === 'active') {
      console.warn(`Quest ${questId} is already active`);
      return false;
    }

    // 激活任务
    quest.status = 'active';
    this.activeQuests.set(questId, quest);

    // 添加任务标记
    if (quest.marker) {
      this.questMarkers.set(questId, quest.marker);
    }

    // 触发回调
    if (this.callbacks.onQuestStart) {
      this.callbacks.onQuestStart(quest);
    }

    return true;
  }

  /**
   * 更新任务进度
   * @param {string} questId - 任务ID
   * @param {string} objectiveId - 目标ID
   * @param {number} progress - 进度增量（默认为1）
   */
  updateProgress(questId, objectiveId, progress = 1) {
    const quest = this.activeQuests.get(questId);
    if (!quest) {
      return;
    }

    // 查找目标
    const objective = quest.objectives.find(obj => obj.id === objectiveId);
    if (!objective || objective.completed) {
      return;
    }

    // 更新进度
    objective.current = Math.min(objective.current + progress, objective.required);

    // 检查目标是否完成
    if (objective.current >= objective.required) {
      objective.completed = true;
    }

    // 触发进度回调
    if (this.callbacks.onQuestProgress) {
      this.callbacks.onQuestProgress(quest, objective);
    }

    // 检查任务是否完成
    this.checkQuestCompletion(questId);
  }

  /**
   * 设置任务目标进度（直接设置，而不是增量）
   * @param {string} questId - 任务ID
   * @param {string} objectiveId - 目标ID
   * @param {number} value - 进度值
   */
  setProgress(questId, objectiveId, value) {
    const quest = this.activeQuests.get(questId);
    if (!quest) {
      return;
    }

    const objective = quest.objectives.find(obj => obj.id === objectiveId);
    if (!objective || objective.completed) {
      return;
    }

    objective.current = Math.min(value, objective.required);

    if (objective.current >= objective.required) {
      objective.completed = true;
    }

    if (this.callbacks.onQuestProgress) {
      this.callbacks.onQuestProgress(quest, objective);
    }

    this.checkQuestCompletion(questId);
  }

  /**
   * 检查任务是否完成
   * @param {string} questId - 任务ID
   */
  checkQuestCompletion(questId) {
    const quest = this.activeQuests.get(questId);
    if (!quest) {
      return;
    }

    // 检查所有目标是否完成
    const allCompleted = quest.objectives.every(obj => obj.completed);
    if (allCompleted) {
      this.completeQuest(questId);
    }
  }

  /**
   * 完成任务
   * @param {string} questId - 任务ID
   * @returns {Object|null} 任务奖励
   */
  completeQuest(questId) {
    const quest = this.activeQuests.get(questId);
    if (!quest) {
      console.warn(`Quest ${questId} is not active`);
      return null;
    }

    // 更新状态
    quest.status = 'completed';
    this.activeQuests.delete(questId);
    this.completedQuests.add(questId);

    // 移除任务标记
    this.questMarkers.delete(questId);

    // 触发回调
    if (this.callbacks.onQuestComplete) {
      this.callbacks.onQuestComplete(quest);
    }

    return quest.rewards;
  }

  /**
   * 任务失败
   * @param {string} questId - 任务ID
   */
  failQuest(questId) {
    const quest = this.activeQuests.get(questId);
    if (!quest) {
      return;
    }

    quest.status = 'failed';
    this.activeQuests.delete(questId);
    this.questMarkers.delete(questId);

    if (this.callbacks.onQuestFail) {
      this.callbacks.onQuestFail(quest);
    }
  }

  /**
   * 获取任务信息
   * @param {string} questId - 任务ID
   * @returns {Object|null} 任务信息
   */
  getQuest(questId) {
    return this.quests.get(questId) || null;
  }

  /**
   * 获取所有激活的任务
   * @returns {Array} 激活的任务列表
   */
  getActiveQuests() {
    return Array.from(this.activeQuests.values());
  }

  /**
   * 获取任务进度
   * @param {string} questId - 任务ID
   * @returns {Object|null} 任务进度信息
   */
  getQuestProgress(questId) {
    const quest = this.quests.get(questId);
    if (!quest) {
      return null;
    }

    const completedObjectives = quest.objectives.filter(obj => obj.completed).length;
    const totalObjectives = quest.objectives.length;

    return {
      questId: quest.id,
      name: quest.name,
      status: quest.status,
      objectives: quest.objectives.map(obj => ({
        id: obj.id,
        description: obj.description,
        current: obj.current,
        required: obj.required,
        completed: obj.completed
      })),
      progress: totalObjectives > 0 ? completedObjectives / totalObjectives : 0
    };
  }

  /**
   * 获取任务标记
   * @param {string} questId - 任务ID
   * @returns {Object|null} 标记位置
   */
  getQuestMarker(questId) {
    return this.questMarkers.get(questId) || null;
  }

  /**
   * 获取所有任务标记
   * @returns {Map} 所有标记
   */
  getAllMarkers() {
    return new Map(this.questMarkers);
  }

  /**
   * 检查任务是否完成
   * @param {string} questId - 任务ID
   * @returns {boolean} 是否完成
   */
  isQuestCompleted(questId) {
    return this.completedQuests.has(questId);
  }

  /**
   * 检查任务是否激活
   * @param {string} questId - 任务ID
   * @returns {boolean} 是否激活
   */
  isQuestActive(questId) {
    return this.activeQuests.has(questId);
  }

  /**
   * 设置回调函数
   * @param {string} event - 事件名称
   * @param {Function} callback - 回调函数
   */
  on(event, callback) {
    if (this.callbacks.hasOwnProperty(`on${event.charAt(0).toUpperCase()}${event.slice(1)}`)) {
      this.callbacks[`on${event.charAt(0).toUpperCase()}${event.slice(1)}`] = callback;
    }
  }

  /**
   * 保存任务状态
   * @returns {Object} 任务状态数据
   */
  saveState() {
    return {
      activeQuests: Array.from(this.activeQuests.keys()),
      completedQuests: Array.from(this.completedQuests),
      questProgress: Array.from(this.quests.values()).map(quest => ({
        id: quest.id,
        status: quest.status,
        objectives: quest.objectives.map(obj => ({
          id: obj.id,
          current: obj.current,
          completed: obj.completed
        }))
      }))
    };
  }

  /**
   * 加载任务状态
   * @param {Object} state - 任务状态数据
   */
  loadState(state) {
    if (!state) {
      return;
    }

    // 恢复完成的任务
    if (state.completedQuests) {
      this.completedQuests = new Set(state.completedQuests);
    }

    // 恢复任务进度
    if (state.questProgress) {
      for (const questData of state.questProgress) {
        const quest = this.quests.get(questData.id);
        if (quest) {
          quest.status = questData.status;
          
          // 恢复目标进度
          for (const objData of questData.objectives) {
            const objective = quest.objectives.find(obj => obj.id === objData.id);
            if (objective) {
              objective.current = objData.current;
              objective.completed = objData.completed;
            }
          }
        }
      }
    }

    // 恢复激活的任务
    if (state.activeQuests) {
      for (const questId of state.activeQuests) {
        const quest = this.quests.get(questId);
        if (quest && quest.status === 'active') {
          this.activeQuests.set(questId, quest);
          
          // 恢复任务标记
          if (quest.marker) {
            this.questMarkers.set(questId, quest.marker);
          }
        }
      }
    }
  }

  /**
   * 重置系统
   */
  reset() {
    this.activeQuests.clear();
    this.completedQuests.clear();
    this.questMarkers.clear();
    
    // 重置所有任务状态
    for (const quest of this.quests.values()) {
      quest.status = 'registered';
      for (const objective of quest.objectives) {
        objective.current = 0;
        objective.completed = false;
      }
    }
  }

  /**
   * 清空所有任务
   */
  clear() {
    this.quests.clear();
    this.activeQuests.clear();
    this.completedQuests.clear();
    this.questMarkers.clear();
  }
}
