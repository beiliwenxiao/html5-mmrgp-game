/**
 * QuestSystem 单元测试
 */

import { describe, it, expect, beforeEach, vi } from 'vitest';
import { QuestSystem } from './QuestSystem.js';

describe('QuestSystem', () => {
  let questSystem;

  beforeEach(() => {
    questSystem = new QuestSystem();
  });

  describe('任务注册', () => {
    it('应该成功注册任务', () => {
      const quest = {
        id: 'quest1',
        name: '测试任务',
        description: '这是一个测试任务',
        objectives: [
          { id: 'obj1', description: '击败5个敌人', type: 'kill', target: 'enemy', required: 5 }
        ],
        rewards: { exp: 100, gold: 50 }
      };

      questSystem.registerQuest(quest);
      const registered = questSystem.getQuest('quest1');

      expect(registered).toBeDefined();
      expect(registered.name).toBe('测试任务');
      expect(registered.objectives).toHaveLength(1);
      expect(registered.status).toBe('registered');
    });

    it('应该拒绝没有ID的任务', () => {
      const quest = {
        name: '无效任务',
        objectives: [{ id: 'obj1', description: '目标' }]
      };

      expect(() => questSystem.registerQuest(quest)).toThrow('Quest must have an id');
    });

    it('应该拒绝没有名称的任务', () => {
      const quest = {
        id: 'quest1',
        objectives: [{ id: 'obj1', description: '目标' }]
      };

      expect(() => questSystem.registerQuest(quest)).toThrow('Quest must have a name');
    });

    it('应该拒绝没有目标的任务', () => {
      const quest = {
        id: 'quest1',
        name: '无效任务',
        objectives: []
      };

      expect(() => questSystem.registerQuest(quest)).toThrow('Quest must have at least one objective');
    });

    it('应该自动开始设置了autoStart的任务', () => {
      const quest = {
        id: 'quest1',
        name: '自动任务',
        objectives: [{ id: 'obj1', description: '目标' }],
        autoStart: true
      };

      questSystem.registerQuest(quest);
      expect(questSystem.isQuestActive('quest1')).toBe(true);
    });
  });

  describe('任务开始', () => {
    beforeEach(() => {
      questSystem.registerQuest({
        id: 'quest1',
        name: '任务1',
        objectives: [{ id: 'obj1', description: '目标1' }]
      });
    });

    it('应该成功开始任务', () => {
      const result = questSystem.startQuest('quest1');
      expect(result).toBe(true);
      expect(questSystem.isQuestActive('quest1')).toBe(true);
    });

    it('应该触发onQuestStart回调', () => {
      const callback = vi.fn();
      questSystem.on('questStart', callback);

      questSystem.startQuest('quest1');
      expect(callback).toHaveBeenCalledWith(expect.objectContaining({ id: 'quest1' }));
    });

    it('应该拒绝开始不存在的任务', () => {
      const result = questSystem.startQuest('nonexistent');
      expect(result).toBe(false);
    });

    it('应该拒绝重复开始已激活的任务', () => {
      questSystem.startQuest('quest1');
      const result = questSystem.startQuest('quest1');
      expect(result).toBe(false);
    });
  });

  describe('前置任务', () => {
    beforeEach(() => {
      questSystem.registerQuest({
        id: 'quest1',
        name: '任务1',
        objectives: [{ id: 'obj1', description: '目标1' }]
      });

      questSystem.registerQuest({
        id: 'quest2',
        name: '任务2',
        objectives: [{ id: 'obj2', description: '目标2' }],
        prerequisites: ['quest1']
      });
    });

    it('应该在前置任务未完成时拒绝开始任务', () => {
      const result = questSystem.tryStartQuest('quest2');
      expect(result).toBe(false);
    });

    it('应该在前置任务完成后允许开始任务', () => {
      questSystem.startQuest('quest1');
      questSystem.completeQuest('quest1');

      const result = questSystem.tryStartQuest('quest2');
      expect(result).toBe(true);
    });
  });

  describe('任务进度', () => {
    beforeEach(() => {
      questSystem.registerQuest({
        id: 'quest1',
        name: '击败敌人',
        objectives: [
          { id: 'obj1', description: '击败5个敌人', required: 5 }
        ]
      });
      questSystem.startQuest('quest1');
    });

    it('应该正确更新任务进度', () => {
      questSystem.updateProgress('quest1', 'obj1', 2);
      const progress = questSystem.getQuestProgress('quest1');
      expect(progress.objectives[0].current).toBe(2);
    });

    it('应该触发onQuestProgress回调', () => {
      const callback = vi.fn();
      questSystem.on('questProgress', callback);

      questSystem.updateProgress('quest1', 'obj1', 1);
      expect(callback).toHaveBeenCalled();
    });

    it('应该在达到目标时标记目标为完成', () => {
      questSystem.updateProgress('quest1', 'obj1', 5);
      const progress = questSystem.getQuestProgress('quest1');
      expect(progress.objectives[0].completed).toBe(true);
    });

    it('应该防止进度超过要求值', () => {
      questSystem.updateProgress('quest1', 'obj1', 10);
      const progress = questSystem.getQuestProgress('quest1');
      expect(progress.objectives[0].current).toBe(5);
    });

    it('应该支持直接设置进度', () => {
      questSystem.setProgress('quest1', 'obj1', 3);
      const progress = questSystem.getQuestProgress('quest1');
      expect(progress.objectives[0].current).toBe(3);
    });
  });

  describe('任务完成', () => {
    beforeEach(() => {
      questSystem.registerQuest({
        id: 'quest1',
        name: '多目标任务',
        objectives: [
          { id: 'obj1', description: '目标1', required: 1 },
          { id: 'obj2', description: '目标2', required: 1 }
        ],
        rewards: { exp: 100, gold: 50 }
      });
      questSystem.startQuest('quest1');
    });

    it('应该在所有目标完成时自动完成任务', () => {
      const callback = vi.fn();
      questSystem.on('questComplete', callback);

      questSystem.updateProgress('quest1', 'obj1', 1);
      questSystem.updateProgress('quest1', 'obj2', 1);

      expect(callback).toHaveBeenCalled();
      expect(questSystem.isQuestCompleted('quest1')).toBe(true);
      expect(questSystem.isQuestActive('quest1')).toBe(false);
    });

    it('应该返回任务奖励', () => {
      questSystem.updateProgress('quest1', 'obj1', 1);
      questSystem.updateProgress('quest1', 'obj2', 1);

      const quest = questSystem.getQuest('quest1');
      expect(quest.rewards).toEqual({ exp: 100, gold: 50 });
    });

    it('应该移除任务标记', () => {
      questSystem.quests.get('quest1').marker = { x: 100, y: 100 };
      questSystem.questMarkers.set('quest1', { x: 100, y: 100 });

      questSystem.updateProgress('quest1', 'obj1', 1);
      questSystem.updateProgress('quest1', 'obj2', 1);

      expect(questSystem.getQuestMarker('quest1')).toBeNull();
    });
  });

  describe('任务失败', () => {
    beforeEach(() => {
      questSystem.registerQuest({
        id: 'quest1',
        name: '任务1',
        objectives: [{ id: 'obj1', description: '目标1' }]
      });
      questSystem.startQuest('quest1');
    });

    it('应该正确处理任务失败', () => {
      const callback = vi.fn();
      questSystem.on('questFail', callback);

      questSystem.failQuest('quest1');

      expect(callback).toHaveBeenCalled();
      expect(questSystem.isQuestActive('quest1')).toBe(false);
      expect(questSystem.getQuest('quest1').status).toBe('failed');
    });
  });

  describe('任务标记', () => {
    it('应该正确管理任务标记', () => {
      questSystem.registerQuest({
        id: 'quest1',
        name: '任务1',
        objectives: [{ id: 'obj1', description: '目标1' }],
        marker: { x: 100, y: 200 }
      });

      questSystem.startQuest('quest1');
      const marker = questSystem.getQuestMarker('quest1');

      expect(marker).toEqual({ x: 100, y: 200 });
    });

    it('应该返回所有任务标记', () => {
      questSystem.registerQuest({
        id: 'quest1',
        name: '任务1',
        objectives: [{ id: 'obj1', description: '目标1' }],
        marker: { x: 100, y: 200 }
      });

      questSystem.registerQuest({
        id: 'quest2',
        name: '任务2',
        objectives: [{ id: 'obj2', description: '目标2' }],
        marker: { x: 300, y: 400 }
      });

      questSystem.startQuest('quest1');
      questSystem.startQuest('quest2');

      const markers = questSystem.getAllMarkers();
      expect(markers.size).toBe(2);
    });
  });

  describe('状态保存和加载', () => {
    beforeEach(() => {
      questSystem.registerQuest({
        id: 'quest1',
        name: '任务1',
        objectives: [{ id: 'obj1', description: '目标1', required: 5 }]
      });

      questSystem.registerQuest({
        id: 'quest2',
        name: '任务2',
        objectives: [{ id: 'obj2', description: '目标2' }]
      });

      questSystem.startQuest('quest1');
      questSystem.updateProgress('quest1', 'obj1', 3);
      questSystem.startQuest('quest2');
      questSystem.completeQuest('quest2');
    });

    it('应该正确保存状态', () => {
      const state = questSystem.saveState();

      expect(state.activeQuests).toContain('quest1');
      expect(state.completedQuests).toContain('quest2');
      expect(state.questProgress).toHaveLength(2);
    });

    it('应该正确加载状态', () => {
      const state = questSystem.saveState();
      const newSystem = new QuestSystem();

      // 先注册任务
      newSystem.registerQuest({
        id: 'quest1',
        name: '任务1',
        objectives: [{ id: 'obj1', description: '目标1', required: 5 }]
      });

      newSystem.registerQuest({
        id: 'quest2',
        name: '任务2',
        objectives: [{ id: 'obj2', description: '目标2' }]
      });

      newSystem.loadState(state);

      expect(newSystem.isQuestActive('quest1')).toBe(true);
      expect(newSystem.isQuestCompleted('quest2')).toBe(true);
      
      const progress = newSystem.getQuestProgress('quest1');
      expect(progress.objectives[0].current).toBe(3);
    });
  });

  describe('系统重置', () => {
    beforeEach(() => {
      questSystem.registerQuest({
        id: 'quest1',
        name: '任务1',
        objectives: [{ id: 'obj1', description: '目标1' }]
      });
      questSystem.startQuest('quest1');
      questSystem.completeQuest('quest1');
    });

    it('应该正确重置系统', () => {
      questSystem.reset();

      expect(questSystem.getActiveQuests()).toHaveLength(0);
      expect(questSystem.isQuestCompleted('quest1')).toBe(false);
      expect(questSystem.getQuest('quest1').status).toBe('registered');
    });

    it('应该清空所有任务', () => {
      questSystem.clear();

      expect(questSystem.getQuest('quest1')).toBeNull();
      expect(questSystem.getActiveQuests()).toHaveLength(0);
    });
  });

  describe('查询功能', () => {
    beforeEach(() => {
      questSystem.registerQuest({
        id: 'quest1',
        name: '任务1',
        objectives: [
          { id: 'obj1', description: '目标1', required: 5 },
          { id: 'obj2', description: '目标2', required: 3 }
        ]
      });
      questSystem.startQuest('quest1');
      questSystem.updateProgress('quest1', 'obj1', 5);
    });

    it('应该返回所有激活的任务', () => {
      const activeQuests = questSystem.getActiveQuests();
      expect(activeQuests).toHaveLength(1);
      expect(activeQuests[0].id).toBe('quest1');
    });

    it('应该返回正确的任务进度', () => {
      const progress = questSystem.getQuestProgress('quest1');
      
      expect(progress.questId).toBe('quest1');
      expect(progress.status).toBe('active');
      expect(progress.progress).toBe(0.5); // 1/2 目标完成
      expect(progress.objectives[0].completed).toBe(true);
      expect(progress.objectives[1].completed).toBe(false);
    });
  });
});
