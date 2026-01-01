/**
 * QuestSystem.test.js
 * 任务系统单元测试
 */

import { describe, it, expect, beforeEach, vi } from 'vitest';
import {
  QuestType,
  QuestState,
  ObjectiveType,
  QuestObjective,
  QuestReward,
  Quest,
  QuestSystem
} from './QuestSystem.js';

describe('QuestType', () => {
  it('should have all quest types defined', () => {
    expect(QuestType.MAIN).toBe('main');
    expect(QuestType.SIDE).toBe('side');
    expect(QuestType.DAILY).toBe('daily');
    expect(QuestType.WEEKLY).toBe('weekly');
  });
});

describe('QuestState', () => {
  it('should have all states defined', () => {
    expect(QuestState.AVAILABLE).toBe('available');
    expect(QuestState.ACTIVE).toBe('active');
    expect(QuestState.COMPLETED).toBe('completed');
    expect(QuestState.TURNED_IN).toBe('turned_in');
  });
});

describe('QuestObjective', () => {
  it('should create objective with default values', () => {
    const obj = new QuestObjective();
    expect(obj.requiredCount).toBe(1);
    expect(obj.currentCount).toBe(0);
  });

  it('should update progress', () => {
    const obj = new QuestObjective({ requiredCount: 5 });
    obj.updateProgress(2);
    expect(obj.currentCount).toBe(2);
  });

  it('should not exceed required count', () => {
    const obj = new QuestObjective({ requiredCount: 3 });
    obj.updateProgress(10);
    expect(obj.currentCount).toBe(3);
  });

  it('should check completion', () => {
    const obj = new QuestObjective({ requiredCount: 2 });
    expect(obj.isComplete()).toBe(false);
    obj.updateProgress(2);
    expect(obj.isComplete()).toBe(true);
  });

  it('should calculate progress percent', () => {
    const obj = new QuestObjective({ requiredCount: 4 });
    obj.updateProgress(2);
    expect(obj.getProgressPercent()).toBe(50);
  });

  it('should reset progress', () => {
    const obj = new QuestObjective({ requiredCount: 5, currentCount: 3 });
    obj.reset();
    expect(obj.currentCount).toBe(0);
  });
});

describe('Quest', () => {
  let quest;

  beforeEach(() => {
    quest = new Quest({
      id: 'test_quest',
      name: 'Test Quest',
      type: QuestType.SIDE,
      minLevel: 5,
      objectives: [
        { id: 'obj1', type: ObjectiveType.KILL, targetId: 'wolf', requiredCount: 3 }
      ],
      reward: { exp: 100, gold: 50 }
    });
  });

  it('should create quest with correct properties', () => {
    expect(quest.id).toBe('test_quest');
    expect(quest.name).toBe('Test Quest');
    expect(quest.type).toBe(QuestType.SIDE);
    expect(quest.state).toBe(QuestState.LOCKED);
  });

  it('should check if can accept', () => {
    expect(quest.canAccept({ level: 3 })).toBe(false);
    expect(quest.canAccept({ level: 5 })).toBe(true);
  });

  it('should not accept if already active', () => {
    expect(quest.canAccept({ level: 5, activeQuests: ['test_quest'] })).toBe(false);
  });

  it('should accept quest', () => {
    quest.state = QuestState.AVAILABLE;
    expect(quest.accept()).toBe(true);
    expect(quest.state).toBe(QuestState.ACTIVE);
    expect(quest.acceptedTime).not.toBeNull();
  });

  it('should abandon quest', () => {
    quest.state = QuestState.AVAILABLE;
    quest.accept();
    expect(quest.abandon()).toBe(true);
    expect(quest.state).toBe(QuestState.AVAILABLE);
  });

  it('should update objective progress', () => {
    quest.state = QuestState.AVAILABLE;
    quest.accept();
    
    const updated = quest.updateObjective(ObjectiveType.KILL, 'wolf', 2);
    expect(updated).toBe(true);
    expect(quest.objectives[0].currentCount).toBe(2);
  });

  it('should complete when all objectives done', () => {
    quest.state = QuestState.AVAILABLE;
    quest.accept();
    quest.updateObjective(ObjectiveType.KILL, 'wolf', 3);
    
    expect(quest.state).toBe(QuestState.COMPLETED);
  });

  it('should turn in quest', () => {
    quest.state = QuestState.AVAILABLE;
    quest.accept();
    quest.updateObjective(ObjectiveType.KILL, 'wolf', 3);
    
    const reward = quest.turnIn();
    expect(reward).not.toBeNull();
    expect(reward.exp).toBe(100);
    expect(quest.state).toBe(QuestState.TURNED_IN);
  });

  it('should calculate progress percent', () => {
    quest.state = QuestState.AVAILABLE;
    quest.accept();
    quest.updateObjective(ObjectiveType.KILL, 'wolf', 1);
    
    expect(quest.getProgressPercent()).toBeCloseTo(33.33, 1);
  });

  it('should serialize and deserialize', () => {
    quest.state = QuestState.AVAILABLE;
    quest.accept();
    quest.updateObjective(ObjectiveType.KILL, 'wolf', 2);
    
    const data = quest.serialize();
    
    const newQuest = new Quest({ id: 'test_quest', objectives: [{ id: 'obj1', requiredCount: 3 }] });
    newQuest.deserialize(data);
    
    expect(newQuest.state).toBe(QuestState.ACTIVE);
    expect(newQuest.objectives[0].currentCount).toBe(2);
  });
});

describe('QuestSystem', () => {
  let system;

  beforeEach(() => {
    system = new QuestSystem();
  });

  it('should initialize with default quests', () => {
    expect(system.quests.size).toBeGreaterThan(0);
    expect(system.getQuest('quest_tutorial')).not.toBeNull();
  });

  it('should register custom quest', () => {
    const quest = new Quest({ id: 'custom_quest', name: 'Custom' });
    system.registerQuest(quest);
    expect(system.getQuest('custom_quest')).toBe(quest);
  });

  it('should get available quests', () => {
    const available = system.getAvailableQuests({ level: 1, completedQuests: [], activeQuests: [] });
    expect(available.length).toBeGreaterThan(0);
  });

  it('should accept quest', () => {
    const onAccepted = vi.fn();
    system.on('questAccepted', onAccepted);
    
    const result = system.acceptQuest('quest_tutorial', { level: 1, completedQuests: [], activeQuests: [] });
    
    expect(result).toBe(true);
    expect(system.activeQuests.has('quest_tutorial')).toBe(true);
    expect(onAccepted).toHaveBeenCalled();
  });

  it('should abandon quest', () => {
    system.acceptQuest('quest_tutorial', { level: 1, completedQuests: [], activeQuests: [] });
    
    const result = system.abandonQuest('quest_tutorial');
    
    expect(result).toBe(true);
    expect(system.activeQuests.has('quest_tutorial')).toBe(false);
  });

  it('should update progress', () => {
    const onProgress = vi.fn();
    system.on('questProgress', onProgress);
    
    system.acceptQuest('quest_first_hunt', { level: 1, completedQuests: ['quest_tutorial'], activeQuests: [] });
    system.updateProgress(ObjectiveType.KILL, 'wolf', 2);
    
    expect(onProgress).toHaveBeenCalled();
  });

  it('should turn in quest', () => {
    system.acceptQuest('quest_tutorial', { level: 1, completedQuests: [], activeQuests: [] });
    
    const quest = system.activeQuests.get('quest_tutorial');
    quest.updateObjective(ObjectiveType.TALK, 'village_chief', 1);
    
    const reward = system.turnInQuest('quest_tutorial');
    
    expect(reward).not.toBeNull();
    expect(system.completedQuests.has('quest_tutorial')).toBe(true);
  });

  it('should get quests for NPC', () => {
    const quests = system.getQuestsForNPC('village_chief', { level: 1, completedQuests: [], activeQuests: [] });
    expect(quests.length).toBeGreaterThan(0);
  });

  it('should toggle tracking', () => {
    system.acceptQuest('quest_tutorial', { level: 1, completedQuests: [], activeQuests: [] });
    
    const tracked = system.toggleTracking('quest_tutorial');
    expect(tracked).toBe(true);
    
    const untracked = system.toggleTracking('quest_tutorial');
    expect(untracked).toBe(false);
  });

  it('should get stats', () => {
    const stats = system.getStats();
    expect(stats.totalQuests).toBeGreaterThan(0);
    expect(stats.activeQuests).toBe(0);
  });

  it('should serialize and deserialize', () => {
    system.acceptQuest('quest_tutorial', { level: 1, completedQuests: [], activeQuests: [] });
    
    const data = system.serialize();
    
    const newSystem = new QuestSystem();
    newSystem.deserialize(data);
    
    expect(newSystem.activeQuests.has('quest_tutorial')).toBe(true);
  });

  it('should reset system', () => {
    system.acceptQuest('quest_tutorial', { level: 1, completedQuests: [], activeQuests: [] });
    system.reset();
    
    expect(system.activeQuests.size).toBe(0);
    expect(system.completedQuests.size).toBe(0);
  });
});
