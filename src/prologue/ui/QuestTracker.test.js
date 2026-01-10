/**
 * QuestTracker 单元测试
 * 
 * 测试任务追踪器的核心功能
 */

import { describe, it, expect, beforeEach, vi } from 'vitest';
import { QuestTracker } from './QuestTracker.js';
import { QuestSystem } from '../systems/QuestSystem.js';

describe('QuestTracker', () => {
  let questTracker;
  let questSystem;
  let mockCanvas;
  let mockCtx;

  beforeEach(() => {
    // 创建模拟的 Canvas 和 Context
    mockCanvas = {
      width: 1024,
      height: 768
    };

    mockCtx = {
      canvas: mockCanvas,
      save: vi.fn(),
      restore: vi.fn(),
      fillRect: vi.fn(),
      strokeRect: vi.fn(),
      fillText: vi.fn(),
      measureText: vi.fn((text) => ({ width: text.length * 8 })),
      createLinearGradient: vi.fn(() => ({
        addColorStop: vi.fn()
      })),
      fillStyle: '',
      strokeStyle: '',
      lineWidth: 1,
      font: '',
      textAlign: '',
      textBaseline: '',
      globalAlpha: 1
    };

    // 创建任务系统
    questSystem = new QuestSystem();

    // 创建任务追踪器
    questTracker = new QuestTracker({
      questSystem: questSystem,
      x: 700,
      y: 20,
      width: 300,
      maxHeight: 600
    });
  });

  describe('初始化', () => {
    it('应该正确初始化任务追踪器', () => {
      expect(questTracker).toBeDefined();
      expect(questTracker.questSystem).toBe(questSystem);
      expect(questTracker.visible).toBe(true);
      expect(questTracker.width).toBe(300);
    });

    it('应该初始化空的展开任务集合', () => {
      expect(questTracker.expandedQuests.size).toBe(0);
    });

    it('应该初始化空的完成动画数组', () => {
      expect(questTracker.completionAnimations.length).toBe(0);
    });
  });

  describe('任务显示', () => {
    beforeEach(() => {
      // 注册测试任务
      questSystem.registerQuest({
        id: 'test_quest_1',
        name: '测试任务1',
        description: '这是一个测试任务',
        objectives: [
          {
            id: 'obj1',
            description: '击败5个敌人',
            type: 'kill',
            target: 'enemy',
            required: 5
          },
          {
            id: 'obj2',
            description: '收集3个物品',
            type: 'collect',
            target: 'item',
            required: 3
          }
        ],
        rewards: {
          experience: 100,
          currency: 50
        }
      });

      questSystem.startQuest('test_quest_1');
    });

    it('应该渲染激活的任务', () => {
      questTracker.render(mockCtx);

      // 验证渲染方法被调用
      expect(mockCtx.fillRect).toHaveBeenCalled();
      expect(mockCtx.strokeRect).toHaveBeenCalled();
      expect(mockCtx.fillText).toHaveBeenCalled();
    });

    it('应该在没有激活任务时不渲染', () => {
      questSystem.completeQuest('test_quest_1');
      mockCtx.fillRect.mockClear();

      questTracker.render(mockCtx);

      // 由于没有激活任务，不应该调用渲染方法
      expect(mockCtx.fillRect).not.toHaveBeenCalled();
    });

    it('应该正确计算任务进度', () => {
      const quest = questSystem.getQuest('test_quest_1');
      
      // 更新进度
      questSystem.updateProgress('test_quest_1', 'obj1', 3);
      
      const completedObjectives = quest.objectives.filter(obj => obj.completed).length;
      const totalObjectives = quest.objectives.length;
      
      expect(completedObjectives).toBe(0);  // 还没完成
      expect(totalObjectives).toBe(2);
    });
  });

  describe('任务展开/折叠', () => {
    beforeEach(() => {
      questSystem.registerQuest({
        id: 'test_quest_2',
        name: '测试任务2',
        description: '可展开的任务',
        objectives: [
          { id: 'obj1', description: '目标1', required: 1 }
        ]
      });
      questSystem.startQuest('test_quest_2');
    });

    it('应该能够切换任务展开状态', () => {
      expect(questTracker.expandedQuests.has('test_quest_2')).toBe(false);

      questTracker.toggleQuestExpansion('test_quest_2');
      expect(questTracker.expandedQuests.has('test_quest_2')).toBe(true);

      questTracker.toggleQuestExpansion('test_quest_2');
      expect(questTracker.expandedQuests.has('test_quest_2')).toBe(false);
    });

    it('应该能够展开所有任务', () => {
      questSystem.registerQuest({
        id: 'test_quest_3',
        name: '测试任务3',
        objectives: [{ id: 'obj1', description: '目标1', required: 1 }]
      });
      questSystem.startQuest('test_quest_3');

      questTracker.expandAll();

      expect(questTracker.expandedQuests.has('test_quest_2')).toBe(true);
      expect(questTracker.expandedQuests.has('test_quest_3')).toBe(true);
    });

    it('应该能够折叠所有任务', () => {
      questTracker.expandedQuests.add('test_quest_2');
      questTracker.expandedQuests.add('test_quest_3');

      questTracker.collapseAll();

      expect(questTracker.expandedQuests.size).toBe(0);
    });
  });

  describe('完成动画', () => {
    it('应该在任务完成时显示动画', () => {
      questSystem.registerQuest({
        id: 'test_quest_4',
        name: '完成测试',
        objectives: [
          { id: 'obj1', description: '目标1', required: 1 }
        ]
      });
      questSystem.startQuest('test_quest_4');

      const quest = questSystem.getQuest('test_quest_4');
      questTracker.showCompletionAnimation(quest);

      expect(questTracker.completionAnimations.length).toBe(1);
      expect(questTracker.completionAnimations[0].questId).toBe('test_quest_4');
      expect(questTracker.completionAnimations[0].text).toContain('完成测试');
    });

    it('应该更新完成动画状态', () => {
      const quest = { id: 'test', name: '测试' };
      questTracker.showCompletionAnimation(quest);

      const initialY = questTracker.completionAnimations[0].y;
      const initialAlpha = questTracker.completionAnimations[0].alpha;

      questTracker.update(100);

      expect(questTracker.completionAnimations[0].y).toBeLessThan(initialY);
      expect(questTracker.completionAnimations[0].alpha).toBeLessThanOrEqual(initialAlpha);
    });

    it('应该移除完成的动画', () => {
      const quest = { id: 'test', name: '测试' };
      questTracker.showCompletionAnimation(quest);

      // 模拟动画完成
      questTracker.completionAnimations[0].duration = 0;
      questTracker.update(100);

      expect(questTracker.completionAnimations.length).toBe(0);
    });

    it('应该能够清除所有动画', () => {
      questTracker.showCompletionAnimation({ id: 'test1', name: '测试1' });
      questTracker.showCompletionAnimation({ id: 'test2', name: '测试2' });

      expect(questTracker.completionAnimations.length).toBe(2);

      questTracker.clearAnimations();

      expect(questTracker.completionAnimations.length).toBe(0);
    });
  });

  describe('鼠标交互', () => {
    beforeEach(() => {
      questSystem.registerQuest({
        id: 'test_quest_5',
        name: '交互测试',
        objectives: [
          { id: 'obj1', description: '目标1', required: 1 }
        ]
      });
      questSystem.startQuest('test_quest_5');
    });

    it('应该处理鼠标移动事件', () => {
      questTracker.handleMouseMove(750, 50);

      // 鼠标在任务块内，应该设置悬停状态
      expect(questTracker.hoveredQuest).toBe('test_quest_5');
    });

    it('应该在鼠标移出时清除悬停状态', () => {
      questTracker.hoveredQuest = 'test_quest_5';
      questTracker.handleMouseMove(100, 100);

      expect(questTracker.hoveredQuest).toBeNull();
    });

    it('应该处理鼠标点击事件', () => {
      const handled = questTracker.handleMouseClick(750, 50);

      expect(handled).toBe(true);
      expect(questTracker.expandedQuests.has('test_quest_5')).toBe(true);
    });

    it('应该在点击外部时返回false', () => {
      const handled = questTracker.handleMouseClick(100, 100);

      expect(handled).toBe(false);
    });
  });

  describe('工具方法', () => {
    it('应该正确获取激活任务数量', () => {
      expect(questTracker.getActiveQuestCount()).toBe(0);

      questSystem.registerQuest({
        id: 'test_quest_6',
        name: '计数测试',
        objectives: [{ id: 'obj1', description: '目标1', required: 1 }]
      });
      questSystem.startQuest('test_quest_6');

      expect(questTracker.getActiveQuestCount()).toBe(1);
    });

    it('应该能够重置追踪器状态', () => {
      questTracker.expandedQuests.add('test_quest');
      questTracker.hoveredQuest = 'test_quest';
      questTracker.showCompletionAnimation({ id: 'test', name: '测试' });

      questTracker.reset();

      expect(questTracker.expandedQuests.size).toBe(0);
      expect(questTracker.hoveredQuest).toBeNull();
      expect(questTracker.completionAnimations.length).toBe(0);
    });
  });

  describe('可见性控制', () => {
    it('应该在不可见时不渲染', () => {
      questSystem.registerQuest({
        id: 'test_quest_7',
        name: '可见性测试',
        objectives: [{ id: 'obj1', description: '目标1', required: 1 }]
      });
      questSystem.startQuest('test_quest_7');

      questTracker.hide();
      mockCtx.fillRect.mockClear();

      questTracker.render(mockCtx);

      expect(mockCtx.fillRect).not.toHaveBeenCalled();
    });

    it('应该在可见时渲染', () => {
      questSystem.registerQuest({
        id: 'test_quest_8',
        name: '可见性测试2',
        objectives: [{ id: 'obj1', description: '目标1', required: 1 }]
      });
      questSystem.startQuest('test_quest_8');

      questTracker.show();
      questTracker.render(mockCtx);

      expect(mockCtx.fillRect).toHaveBeenCalled();
    });
  });
});
