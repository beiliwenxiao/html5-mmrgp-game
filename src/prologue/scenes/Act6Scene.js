/**
 * Act6Scene - 第六幕：结局
 * 
 * 继承自 BaseGameScene，包含第六幕特有功能：
 * - 结局分支系统（根据玩家选择计算结局）
 * - 进度继承系统（准备数据继承到正式游戏）
 * - 序章完成奖励（根据表现给予奖励）
 * - 序章统计显示
 * 
 * 需求：32, 33, 34
 */

import { BaseGameScene } from './BaseGameScene.js';
import { ProgressManager } from '../../systems/ProgressManager.js';

export class Act6Scene extends BaseGameScene {
  constructor() {
    super(6, {
      title: '第六幕：结局',
      description: '黄巾起义的终章'
    });

    // 第六幕特有：进度管理器
    this.progressManager = null;
    
    // 第六幕特有：结局类型
    this.endingType = null;  // 'savior', 'witness', 'leader', 'survivor'
    this.endingTitle = '';
    this.endingDescription = '';
    
    // 第六幕特有：序章统计
    this.prologueStats = {
      battlesWon: 0,
      enemiesDefeated: 0,
      alliesRescued: 0,
      npcsRecruited: 0,
      questsCompleted: 0,
      playTime: 0
    };
    
    // 第六幕特有：完成奖励
    this.completionRewards = [];
    
    // 第六幕特有：场景状态
    this.sceneState = 'intro';  // intro, ending, stats, rewards, inherit, complete
    
    // 第六幕特有：对话完成标志
    this.introDialogueCompleted = false;
    this.endingDialogueCompleted = false;
  }

  /**
   * 场景进入
   */
  enter(data = null) {
    // 调用父类的 enter，初始化所有基础系统
    super.enter(data);
    
    console.log('Act6Scene: 进入第六幕场景', data);
    
    // 重置玩家位置
    if (this.playerEntity) {
      const transform = this.playerEntity.getComponent('transform');
      if (transform) {
        transform.position.x = 400;
        transform.position.y = 400;
      }
    }
    
    // 清除敌人和物品
    this.enemyEntities = [];
    this.pickupItems = [];
    this.equipmentItems = [];
    
    // 初始化第六幕特有系统
    this.initializeAct6Systems();
    
    // 从data中获取第五幕的战斗结果
    if (data && data.battleResults) {
      this.processBattleResults(data.battleResults);
    }
    
    // 计算结局类型
    this.calculateEnding();
    
    // 开始介绍对话
    this.startIntroDialogue();
  }

  /**
   * 初始化第六幕特有系统
   */
  initializeAct6Systems() {
    // 初始化进度管理器
    this.progressManager = new ProgressManager();
    
    // 注册第六幕对话
    this.registerAct6Dialogues();
    
    console.log('Act6Scene: 第六幕系统初始化完成');
  }

  /**
   * 处理战斗结果
   */
  processBattleResults(battleResults) {
    console.log('Act6Scene: 处理战斗结果', battleResults);
    
    for (const result of battleResults) {
      if (result.victory) {
        this.prologueStats.battlesWon++;
      }
      
      if (result.rescued) {
        this.prologueStats.alliesRescued++;
      }
      
      if (result.recruitedNPC) {
        this.prologueStats.npcsRecruited++;
      }
    }
  }

  /**
   * 计算结局类型
   * 根据玩家的选择和表现决定结局
   */
  calculateEnding() {
    const { alliesRescued, npcsRecruited, battlesWon } = this.prologueStats;
    
    // 拯救者结局：救援了所有盟友
    if (alliesRescued >= 3) {
      this.endingType = 'savior';
      this.endingTitle = '拯救者';
      this.endingDescription = '你救援了张角三兄弟，成为黄巾军的英雄。虽然起义最终失败，但你的勇气和忠诚将被铭记。';
    }
    // 领袖结局：招募了所有NPC
    else if (npcsRecruited >= 2) {
      this.endingType = 'leader';
      this.endingTitle = '领袖';
      this.endingDescription = '你招募了众多勇士，展现了领导才能。黄巾军虽败，但你的队伍将继续战斗。';
    }
    // 见证者结局：赢得了所有战斗但没有救援
    else if (battlesWon >= 4) {
      this.endingType = 'witness';
      this.endingTitle = '见证者';
      this.endingDescription = '你见证了黄巾起义的兴衰，经历了无数战斗。历史将记住这段岁月。';
    }
    // 幸存者结局：默认结局
    else {
      this.endingType = 'survivor';
      this.endingTitle = '幸存者';
      this.endingDescription = '你在乱世中艰难求生，虽然起义失败，但你活了下来。未来的路还很长。';
    }
    
    console.log(`Act6Scene: 结局类型 - ${this.endingType} (${this.endingTitle})`);
  }

  /**
   * 计算完成奖励
   * 根据玩家表现给予不同奖励
   */
  calculateRewards() {
    this.completionRewards = [];
    
    // 基础奖励：完成序章
    this.completionRewards.push({
      type: 'title',
      name: '黄巾余党',
      description: '完成序章的称号'
    });
    
    // 结局奖励
    switch (this.endingType) {
      case 'savior':
        this.completionRewards.push({
          type: 'title',
          name: this.endingTitle,
          description: '救援所有盟友的称号'
        });
        this.completionRewards.push({
          type: 'equipment',
          name: '英雄之证',
          description: '传说级饰品，全属性+10'
        });
        this.completionRewards.push({
          type: 'currency',
          amount: 5000,
          description: '5000铜钱'
        });
        break;
        
      case 'leader':
        this.completionRewards.push({
          type: 'title',
          name: this.endingTitle,
          description: '招募所有NPC的称号'
        });
        this.completionRewards.push({
          type: 'equipment',
          name: '统帅之印',
          description: '史诗级饰品，领导力+20'
        });
        this.completionRewards.push({
          type: 'currency',
          amount: 3000,
          description: '3000铜钱'
        });
        break;
        
      case 'witness':
        this.completionRewards.push({
          type: 'title',
          name: this.endingTitle,
          description: '赢得所有战斗的称号'
        });
        this.completionRewards.push({
          type: 'equipment',
          name: '战士之魂',
          description: '稀有级饰品，攻击力+15'
        });
        this.completionRewards.push({
          type: 'currency',
          amount: 2000,
          description: '2000铜钱'
        });
        break;
        
      case 'survivor':
        this.completionRewards.push({
          type: 'title',
          name: this.endingTitle,
          description: '完成序章的称号'
        });
        this.completionRewards.push({
          type: 'currency',
          amount: 1000,
          description: '1000铜钱'
        });
        break;
    }
    
    // 额外奖励：战斗胜利
    if (this.prologueStats.battlesWon >= 4) {
      this.completionRewards.push({
        type: 'experience',
        amount: 1000,
        description: '1000经验值'
      });
    }
    
    console.log('Act6Scene: 奖励计算完成', this.completionRewards);
  }

  /**
   * 注册第六幕对话
   */
  registerAct6Dialogues() {
    // 介绍对话 - 张角病逝
    this.dialogueSystem.registerDialogue('act6_intro', {
      title: '张角病逝',
      startNode: 'start',
      nodes: {
        start: { 
          speaker: '张角', 
          portrait: 'zhangjiao', 
          text: '咳咳...我的时日不多了...', 
          nextNode: 'player_sad' 
        },
        player_sad: { 
          speaker: '你', 
          portrait: 'player', 
          text: '天公将军！您一定会好起来的！', 
          nextNode: 'zhangjiao_calm' 
        },
        zhangjiao_calm: { 
          speaker: '张角', 
          portrait: 'zhangjiao', 
          text: '生死有命...我已经看到了黄天的未来...', 
          nextNode: 'zhangjiao_legacy' 
        },
        zhangjiao_legacy: { 
          speaker: '张角', 
          portrait: 'zhangjiao', 
          text: '虽然起义失败了，但黄天之志永不磨灭。你要记住，苍天已死，黄天当立！', 
          nextNode: 'zhangjiao_farewell' 
        },
        zhangjiao_farewell: { 
          speaker: '张角', 
          portrait: 'zhangjiao', 
          text: '去吧...在乱世中活下去...这就是我最后的愿望...', 
          nextNode: null 
        }
      }
    });

    // 结局对话 - 根据结局类型动态生成
    this.registerEndingDialogues();
  }

  /**
   * 注册结局对话
   */
  registerEndingDialogues() {
    // 拯救者结局
    this.dialogueSystem.registerDialogue('ending_savior', {
      title: '拯救者',
      startNode: 'start',
      nodes: {
        start: { 
          speaker: '旁白', 
          portrait: null, 
          text: '你救援了张角三兄弟，成为黄巾军的英雄。', 
          nextNode: 'legacy' 
        },
        legacy: { 
          speaker: '旁白', 
          portrait: null, 
          text: '虽然起义最终失败，但你的勇气和忠诚将被铭记。', 
          nextNode: 'future' 
        },
        future: { 
          speaker: '旁白', 
          portrait: null, 
          text: '在乱世中，你将继续战斗，守护那些需要帮助的人。', 
          nextNode: null 
        }
      }
    });

    // 领袖结局
    this.dialogueSystem.registerDialogue('ending_leader', {
      title: '领袖',
      startNode: 'start',
      nodes: {
        start: { 
          speaker: '旁白', 
          portrait: null, 
          text: '你招募了众多勇士，展现了领导才能。', 
          nextNode: 'team' 
        },
        team: { 
          speaker: '旁白', 
          portrait: null, 
          text: '黄巾军虽败，但你的队伍将继续战斗。', 
          nextNode: 'future' 
        },
        future: { 
          speaker: '旁白', 
          portrait: null, 
          text: '在未来的日子里，你将带领他们创造新的传奇。', 
          nextNode: null 
        }
      }
    });

    // 见证者结局
    this.dialogueSystem.registerDialogue('ending_witness', {
      title: '见证者',
      startNode: 'start',
      nodes: {
        start: { 
          speaker: '旁白', 
          portrait: null, 
          text: '你见证了黄巾起义的兴衰，经历了无数战斗。', 
          nextNode: 'history' 
        },
        history: { 
          speaker: '旁白', 
          portrait: null, 
          text: '历史将记住这段岁月，记住那些为理想而战的人们。', 
          nextNode: 'future' 
        },
        future: { 
          speaker: '旁白', 
          portrait: null, 
          text: '你的故事还在继续，新的冒险即将开始。', 
          nextNode: null 
        }
      }
    });

    // 幸存者结局
    this.dialogueSystem.registerDialogue('ending_survivor', {
      title: '幸存者',
      startNode: 'start',
      nodes: {
        start: { 
          speaker: '旁白', 
          portrait: null, 
          text: '你在乱世中艰难求生，虽然起义失败，但你活了下来。', 
          nextNode: 'survival' 
        },
        survival: { 
          speaker: '旁白', 
          portrait: null, 
          text: '活着就是希望，活着就有未来。', 
          nextNode: 'future' 
        },
        future: { 
          speaker: '旁白', 
          portrait: null, 
          text: '未来的路还很长，你的旅程才刚刚开始。', 
          nextNode: null 
        }
      }
    });
  }

  /**
   * 开始介绍对话
   */
  startIntroDialogue() {
    this.sceneState = 'intro';
    this.dialogueSystem.startDialogue('act6_intro');
  }

  /**
   * 开始结局对话
   */
  startEndingDialogue() {
    this.sceneState = 'ending';
    const dialogueId = `ending_${this.endingType}`;
    this.dialogueSystem.startDialogue(dialogueId);
  }

  /**
   * 显示序章统计
   */
  showPrologueStats() {
    this.sceneState = 'stats';
    console.log('Act6Scene: 显示序章统计', this.prologueStats);
    
    // 显示统计信息（在渲染中处理）
    setTimeout(() => {
      this.showRewards();
    }, 5000);  // 5秒后显示奖励
  }

  /**
   * 显示奖励
   */
  showRewards() {
    this.sceneState = 'rewards';
    this.calculateRewards();
    console.log('Act6Scene: 显示奖励', this.completionRewards);
    
    // 显示奖励信息（在渲染中处理）
    setTimeout(() => {
      this.prepareInheritance();
    }, 5000);  // 5秒后准备继承
  }

  /**
   * 准备进度继承
   */
  prepareInheritance() {
    this.sceneState = 'inherit';
    console.log('Act6Scene: 准备进度继承');
    
    // 准备继承数据
    if (this.playerEntity) {
      const playerData = this.extractPlayerData();
      const inheritData = this.progressManager.prepareInheritData(playerData);
      
      // 保存继承数据
      const progressData = {
        characterName: playerData.name,
        currentAct: 6,
        currentScene: 'Act6Scene',
        playTime: this.prologueStats.playTime,
        player: playerData,
        prologueStats: this.prologueStats,
        endingType: this.endingType,
        completionRewards: this.completionRewards,
        inheritData: inheritData,
        isCompleted: true
      };
      
      this.progressManager.saveProgress(progressData);
      
      console.log('Act6Scene: 进度继承数据已保存', inheritData);
    }
    
    // 显示继承信息（在渲染中处理）
    setTimeout(() => {
      this.completeScene();
    }, 3000);  // 3秒后完成场景
  }

  /**
   * 提取玩家数据
   */
  extractPlayerData() {
    if (!this.playerEntity) {
      return {
        name: '无名氏',
        level: 1,
        experience: 0,
        class: '',
        attributes: {},
        skills: [],
        equipment: [],
        inventory: [],
        currency: 0,
        allies: [],
        completedQuests: []
      };
    }
    
    const stats = this.playerEntity.getComponent('stats');
    const equipment = this.playerEntity.getComponent('equipment');
    const inventory = this.playerEntity.getComponent('inventory');
    
    return {
      name: this.playerEntity.name || '无名氏',
      level: stats?.level || 1,
      experience: stats?.experience || 0,
      class: this.playerEntity.class || '',
      attributes: {
        maxHp: stats?.maxHp || 100,
        attack: stats?.attack || 10,
        defense: stats?.defense || 5,
        speed: stats?.speed || 100
      },
      skills: this.playerEntity.skills || [],
      equipment: equipment ? this.extractEquipment(equipment) : [],
      inventory: inventory ? this.extractInventory(inventory) : [],
      currency: this.playerEntity.currency || 0,
      allies: this.playerEntity.allies || [],
      completedQuests: this.playerEntity.completedQuests || []
    };
  }

  /**
   * 提取装备数据
   */
  extractEquipment(equipmentComponent) {
    const equipment = [];
    
    if (equipmentComponent.weapon) {
      equipment.push({ slot: 'weapon', ...equipmentComponent.weapon });
    }
    if (equipmentComponent.armor) {
      equipment.push({ slot: 'armor', ...equipmentComponent.armor });
    }
    if (equipmentComponent.accessory) {
      equipment.push({ slot: 'accessory', ...equipmentComponent.accessory });
    }
    
    return equipment;
  }

  /**
   * 提取背包数据
   */
  extractInventory(inventoryComponent) {
    if (inventoryComponent.items && Array.isArray(inventoryComponent.items)) {
      return [...inventoryComponent.items];
    }
    return [];
  }

  /**
   * 完成场景
   */
  completeScene() {
    this.sceneState = 'complete';
    console.log('Act6Scene: 序章完成！');
    
    // 显示完成提示
    if (this.playerEntity) {
      const transform = this.playerEntity.getComponent('transform');
      if (transform) {
        this.floatingTextManager.addText(
          transform.position.x,
          transform.position.y - 100,
          '序章完成！',
          '#ffd700'
        );
      }
    }
  }

  /**
   * 更新场景 - 覆盖父类方法，添加第六幕特有逻辑
   */
  update(deltaTime) {
    // 调用父类的 update
    super.update(deltaTime);
    
    // 更新游戏时间
    this.prologueStats.playTime += deltaTime;
    
    // 第六幕特有：检查对话流程
    this.updateDialogueFlow();
  }

  /**
   * 更新对话流程
   */
  updateDialogueFlow() {
    if (this.dialogueSystem && !this.dialogueSystem.isDialogueActive()) {
      // 介绍对话结束 -> 开始结局对话
      if (this.sceneState === 'intro' && !this.introDialogueCompleted) {
        this.introDialogueCompleted = true;
        setTimeout(() => {
          this.startEndingDialogue();
        }, 2000);
      }
      // 结局对话结束 -> 显示统计
      else if (this.sceneState === 'ending' && !this.endingDialogueCompleted) {
        this.endingDialogueCompleted = true;
        setTimeout(() => {
          this.showPrologueStats();
        }, 2000);
      }
    }
  }

  /**
   * 渲染背景 - 覆盖父类方法，渲染第六幕背景
   */
  renderBackground(ctx) {
    // 调用父类渲染网格背景
    super.renderBackground(ctx);
  }

  /**
   * 渲染场景 - 覆盖父类方法，添加第六幕特有渲染
   */
  render(ctx) {
    // 调用父类的 render
    super.render(ctx);
    
    // 渲染场景标题
    this.renderSceneTitle(ctx);
    
    // 根据场景状态渲染不同内容
    switch (this.sceneState) {
      case 'stats':
        this.renderPrologueStats(ctx);
        break;
      case 'rewards':
        this.renderRewards(ctx);
        break;
      case 'inherit':
        this.renderInheritInfo(ctx);
        break;
      case 'complete':
        this.renderCompleteInfo(ctx);
        break;
    }
    
    // 渲染提示信息
    this.renderHints(ctx);
  }

  /**
   * 渲染场景标题
   */
  renderSceneTitle(ctx) {
    if (!this._titleStartTime) {
      this._titleStartTime = performance.now();
    }
    const elapsed = (performance.now() - this._titleStartTime) / 1000;
    if (elapsed > 5) return;
    
    let alpha = 1;
    if (elapsed > 4) alpha = 1 - (elapsed - 4);
    
    ctx.save();
    ctx.fillStyle = `rgba(0, 0, 0, ${0.7 * alpha})`;
    ctx.fillRect(0, 0, this.logicalWidth, 80);
    ctx.fillStyle = `rgba(255, 215, 0, ${alpha})`;
    ctx.font = 'bold 32px Arial';
    ctx.textAlign = 'center';
    ctx.fillText('第六幕：结局', this.logicalWidth / 2, 50);
    ctx.restore();
  }

  /**
   * 渲染序章统计
   */
  renderPrologueStats(ctx) {
    ctx.save();
    
    // 统计面板
    const panelWidth = 600;
    const panelHeight = 400;
    const panelX = (this.logicalWidth - panelWidth) / 2;
    const panelY = (this.logicalHeight - panelHeight) / 2;
    
    // 背景
    ctx.fillStyle = 'rgba(0, 0, 0, 0.9)';
    ctx.fillRect(panelX, panelY, panelWidth, panelHeight);
    
    // 边框
    ctx.strokeStyle = '#FFD700';
    ctx.lineWidth = 3;
    ctx.strokeRect(panelX, panelY, panelWidth, panelHeight);
    
    // 标题
    ctx.fillStyle = '#FFD700';
    ctx.font = 'bold 28px Arial';
    ctx.textAlign = 'center';
    ctx.fillText('序章统计', panelX + panelWidth / 2, panelY + 50);
    
    // 结局类型
    ctx.fillStyle = '#FFA500';
    ctx.font = 'bold 24px Arial';
    ctx.fillText(`结局：${this.endingTitle}`, panelX + panelWidth / 2, panelY + 90);
    
    // 统计数据
    const stats = [
      { label: '战斗胜利', value: this.prologueStats.battlesWon },
      { label: '击败敌人', value: this.prologueStats.enemiesDefeated },
      { label: '救援盟友', value: this.prologueStats.alliesRescued },
      { label: '招募NPC', value: this.prologueStats.npcsRecruited },
      { label: '完成任务', value: this.prologueStats.questsCompleted },
      { label: '游戏时间', value: `${Math.floor(this.prologueStats.playTime / 60)}分钟` }
    ];
    
    ctx.fillStyle = '#FFFFFF';
    ctx.font = '20px Arial';
    ctx.textAlign = 'left';
    
    let y = panelY + 140;
    for (const stat of stats) {
      ctx.fillText(`${stat.label}:`, panelX + 100, y);
      ctx.textAlign = 'right';
      ctx.fillText(String(stat.value), panelX + panelWidth - 100, y);
      ctx.textAlign = 'left';
      y += 35;
    }
    
    ctx.restore();
  }

  /**
   * 渲染奖励
   */
  renderRewards(ctx) {
    ctx.save();
    
    // 奖励面板
    const panelWidth = 600;
    const panelHeight = 500;
    const panelX = (this.logicalWidth - panelWidth) / 2;
    const panelY = (this.logicalHeight - panelHeight) / 2;
    
    // 背景
    ctx.fillStyle = 'rgba(0, 0, 0, 0.9)';
    ctx.fillRect(panelX, panelY, panelWidth, panelHeight);
    
    // 边框
    ctx.strokeStyle = '#FFD700';
    ctx.lineWidth = 3;
    ctx.strokeRect(panelX, panelY, panelWidth, panelHeight);
    
    // 标题
    ctx.fillStyle = '#FFD700';
    ctx.font = 'bold 28px Arial';
    ctx.textAlign = 'center';
    ctx.fillText('序章奖励', panelX + panelWidth / 2, panelY + 50);
    
    // 奖励列表
    ctx.fillStyle = '#FFFFFF';
    ctx.font = '18px Arial';
    ctx.textAlign = 'left';
    
    let y = panelY + 100;
    for (const reward of this.completionRewards) {
      // 奖励类型图标
      let icon = '';
      let color = '#FFFFFF';
      
      switch (reward.type) {
        case 'title':
          icon = '🏆';
          color = '#FFD700';
          break;
        case 'equipment':
          icon = '⚔️';
          color = '#9C27B0';
          break;
        case 'currency':
          icon = '💰';
          color = '#FFC107';
          break;
        case 'experience':
          icon = '⭐';
          color = '#4CAF50';
          break;
      }
      
      // 奖励名称
      ctx.fillStyle = color;
      ctx.font = 'bold 20px Arial';
      ctx.fillText(`${icon} ${reward.name || reward.description}`, panelX + 50, y);
      
      // 奖励描述
      if (reward.description && reward.name) {
        ctx.fillStyle = '#CCCCCC';
        ctx.font = '16px Arial';
        ctx.fillText(reward.description, panelX + 70, y + 25);
        y += 50;
      } else {
        y += 35;
      }
    }
    
    ctx.restore();
  }

  /**
   * 渲染继承信息
   */
  renderInheritInfo(ctx) {
    ctx.save();
    
    // 继承面板
    const panelWidth = 500;
    const panelHeight = 300;
    const panelX = (this.logicalWidth - panelWidth) / 2;
    const panelY = (this.logicalHeight - panelHeight) / 2;
    
    // 背景
    ctx.fillStyle = 'rgba(0, 0, 0, 0.9)';
    ctx.fillRect(panelX, panelY, panelWidth, panelHeight);
    
    // 边框
    ctx.strokeStyle = '#FFD700';
    ctx.lineWidth = 3;
    ctx.strokeRect(panelX, panelY, panelWidth, panelHeight);
    
    // 标题
    ctx.fillStyle = '#FFD700';
    ctx.font = 'bold 28px Arial';
    ctx.textAlign = 'center';
    ctx.fillText('进度继承', panelX + panelWidth / 2, panelY + 60);
    
    // 说明文字
    ctx.fillStyle = '#FFFFFF';
    ctx.font = '20px Arial';
    ctx.fillText('你的序章进度已保存', panelX + panelWidth / 2, panelY + 120);
    ctx.fillText('角色、装备、技能将继承到正式游戏', panelX + panelWidth / 2, panelY + 160);
    
    // 提示
    ctx.fillStyle = '#4CAF50';
    ctx.font = 'bold 22px Arial';
    ctx.fillText('准备开始新的冒险！', panelX + panelWidth / 2, panelY + 220);
    
    ctx.restore();
  }

  /**
   * 渲染完成信息
   */
  renderCompleteInfo(ctx) {
    ctx.save();
    
    // 完成面板
    const panelWidth = 600;
    const panelHeight = 200;
    const panelX = (this.logicalWidth - panelWidth) / 2;
    const panelY = (this.logicalHeight - panelHeight) / 2;
    
    // 背景
    ctx.fillStyle = 'rgba(0, 0, 0, 0.9)';
    ctx.fillRect(panelX, panelY, panelWidth, panelHeight);
    
    // 边框
    ctx.strokeStyle = '#FFD700';
    ctx.lineWidth = 3;
    ctx.strokeRect(panelX, panelY, panelWidth, panelHeight);
    
    // 标题
    ctx.fillStyle = '#FFD700';
    ctx.font = 'bold 36px Arial';
    ctx.textAlign = 'center';
    ctx.fillText('序章完成！', panelX + panelWidth / 2, panelY + 70);
    
    // 感谢文字
    ctx.fillStyle = '#FFFFFF';
    ctx.font = '20px Arial';
    ctx.fillText('感谢游玩张角黄巾起义序章', panelX + panelWidth / 2, panelY + 120);
    
    // 提示
    ctx.fillStyle = '#4CAF50';
    ctx.font = '18px Arial';
    ctx.fillText('正式游戏即将开始...', panelX + panelWidth / 2, panelY + 160);
    
    ctx.restore();
  }

  /**
   * 渲染提示信息
   */
  renderHints(ctx) {
    ctx.save();
    
    let hints = [];
    
    if (this.dialogueSystem && this.dialogueSystem.isDialogueActive()) {
      hints.push('按 空格键 继续对话');
    } else if (this.sceneState === 'complete') {
      hints.push('序章已完成');
    }
    
    // 渲染提示
    if (hints.length > 0) {
      ctx.fillStyle = 'rgba(0, 0, 0, 0.7)';
      ctx.fillRect(this.logicalWidth / 2 - 250, this.logicalHeight - 60, 500, 40);
      
      ctx.fillStyle = '#FFFFFF';
      ctx.font = '16px Arial';
      ctx.textAlign = 'center';
      ctx.fillText(hints[0], this.logicalWidth / 2, this.logicalHeight - 35);
    }
    
    ctx.restore();
  }

  /**
   * 退出场景
   */
  exit() {
    // 清理第六幕特有资源
    this.progressManager = null;
    this.completionRewards = [];
    
    // 调用父类的 exit
    super.exit();
  }
}

export default Act6Scene;
