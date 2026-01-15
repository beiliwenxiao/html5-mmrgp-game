import { PrologueScene } from './PrologueScene.js';
import { DialogueSystem } from '../../systems/DialogueSystem.js';
import { TutorialSystem } from '../../systems/TutorialSystem.js';
import { AttributeSystem } from '../../systems/AttributeSystem.js';
import { SkillTreeSystem } from '../../systems/SkillTreeSystem.js';

/**
 * 第二幕场景：符水救灾
 * 
 * 内容：
 * - 复活在张角粥棚
 * - 符水剧情对话
 * - 装备升级
 * - 技能和属性提升教程
 * 
 * 需求：8, 9, 10, 11, 12
 */
export class Act2Scene extends PrologueScene {
  constructor() {
    super(2, {
      title: '第二幕：符水救灾',
      description: '你在张角的粥棚中醒来，了解符水的真相，并获得新的装备和能力'
    });

    // 对话阶段
    this.dialoguePhase = 'awakening'; // awakening, talisman_water, upgrade, skills, attributes
    
    // 是否已获得装备
    this.hasReceivedEquipment = false;
    
    // 是否已学习技能
    this.hasLearnedSkills = false;
    
    // 是否已分配属性
    this.hasAllocatedAttributes = false;
    
    // 张角NPC
    this.zhangjiaoNPC = null;
    
    // 场景完成标志
    this.isSceneComplete = false;
  }

  /**
   * 场景进入
   * @param {Object} data - 从上一个场景传递的数据
   */
  enter(data = null) {
    super.enter(data);
    
    console.log('Act2Scene: 进入第二幕场景');
    
    // 初始化系统
    this.initializeSystems();
    
    // 恢复玩家生命值
    if (this.player) {
      this.player.health = this.player.maxHealth || 100;
      this.player.hp = this.player.maxHp || 100;
      console.log('Act2Scene: 玩家生命值已恢复');
    }
    
    // 创建张角NPC
    this.createZhangjiaoNPC();
    
    // 开始觉醒对话
    this.startAwakeningDialogue();
  }

  /**
   * 初始化系统
   */
  initializeSystems() {
    // 初始化对话系统
    this.dialogueSystem = new DialogueSystem();
    
    // 初始化教程系统
    this.tutorialSystem = new TutorialSystem();
    
    // 初始化属性系统
    this.attributeSystem = new AttributeSystem();
    
    // 初始化技能树系统
    this.skillTreeSystem = new SkillTreeSystem();
    
    // 注册对话
    this.registerDialogues();
    
    // 注册教程
    this.registerTutorials();
    
    console.log('Act2Scene: 系统初始化完成');
  }

  /**
   * 注册对话
   */
  registerDialogues() {
    // 觉醒对话
    this.dialogueSystem.registerDialogue('awakening', {
      title: '觉醒',
      startNode: 'start',
      nodes: {
        start: {
          speaker: '张角',
          text: '你醒了。你在荒野中昏倒了，我们把你救了回来。',
          nextNode: 'player_response'
        },
        player_response: {
          speaker: '你',
          text: '这里是...？',
          nextNode: 'zhangjiao_explain'
        },
        zhangjiao_explain: {
          speaker: '张角',
          text: '这里是我们的粥棚。乱世之中，百姓流离失所，我们在这里施粥救济灾民。',
          nextNode: 'player_thanks'
        },
        player_thanks: {
          speaker: '你',
          text: '多谢救命之恩。',
          nextNode: 'zhangjiao_invite'
        },
        zhangjiao_invite: {
          speaker: '张角',
          text: '不必客气。如果你愿意，可以留下来帮忙。这乱世，需要更多有志之士。',
          nextNode: null,
          action: () => {
            // 对话结束后，开始符水对话
            setTimeout(() => {
              this.startTalismanWaterDialogue();
            }, 1000);
          }
        }
      }
    });

    // 符水对话
    this.dialogueSystem.registerDialogue('talisman_water', {
      title: '符水的真相',
      startNode: 'start',
      nodes: {
        start: {
          speaker: '张角',
          text: '来，喝碗符水吧。',
          nextNode: 'player_question'
        },
        player_question: {
          speaker: '你',
          text: '符水？',
          nextNode: 'zhangjiao_explain'
        },
        zhangjiao_explain: {
          speaker: '张角',
          text: '官府不允许私人施粥，但如果说这是"仙家符水"，就合法了。',
          nextNode: 'player_understand'
        },
        player_understand: {
          speaker: '你',
          text: '原来如此...这是智慧啊。',
          nextNode: 'zhangjiao_smile'
        },
        zhangjiao_smile: {
          speaker: '张角',
          text: '乱世求生，需要智慧。来，喝吧，这符水能恢复你的体力。',
          nextNode: null,
          action: () => {
            // 给予符水物品
            this.giveT
alismanWater();
            // 对话结束后，开始装备升级对话
            setTimeout(() => {
              this.startEquipmentUpgradeDialogue();
            }, 1000);
          }
        }
      }
    });

    // 装备升级对话
    this.dialogueSystem.registerDialogue('equipment_upgrade', {
      title: '装备升级',
      startNode: 'start',
      nodes: {
        start: {
          speaker: '张角',
          text: '你需要更好的装备来保护自己。这些给你。',
          nextNode: 'player_receive'
        },
        player_receive: {
          speaker: '你',
          text: '这些装备...太好了！',
          nextNode: 'zhangjiao_advice'
        },
        zhangjiao_advice: {
          speaker: '张角',
          text: '装备只是外物，真正的力量来自于你自己。让我教你如何提升自己的能力。',
          nextNode: null,
          action: () => {
            // 给予新装备
            this.giveNewEquipment();
            // 对话结束后，开始技能教程
            setTimeout(() => {
              this.startSkillTutorial();
            }, 1000);
          }
        }
      }
    });

    console.log('Act2Scene: 对话注册完成');
  }

  /**
   * 注册教程
   */
  registerTutorials() {
    // 技能学习教程
    this.tutorialSystem.registerTutorial('skill_learning', {
      title: '技能学习',
      description: '学习如何使用技能系统',
      steps: [
        {
          text: '你可以学习技能了。按 K 键打开技能树界面。',
          position: 'top'
        },
        {
          text: '在技能树中，你可以看到所有可学习的技能。点击技能可以查看详情。',
          position: 'center'
        },
        {
          text: '消耗技能点可以学习新技能。每次升级都会获得技能点。',
          position: 'center'
        }
      ],
      pauseGame: false,
      canSkip: true,
      priority: 100
    });

    // 属性提升教程
    this.tutorialSystem.registerTutorial('attribute_allocation', {
      title: '属性分配',
      description: '学习如何分配属性点',
      steps: [
        {
          text: '你可以提升属性了。按 C 键打开属性面板。',
          position: 'top'
        },
        {
          text: '在属性面板中，你可以分配属性点来提升角色能力。',
          position: 'center'
        },
        {
          text: '力量影响攻击力，敏捷影响速度，体质影响生命值，智力影响法力，精神影响抗性。',
          position: 'center'
        },
        {
          text: '合理分配属性点，可以让你的角色更强大。',
          position: 'center'
        }
      ],
      pauseGame: false,
      canSkip: true,
      priority: 90
    });

    console.log('Act2Scene: 教程注册完成');
  }

  /**
   * 创建张角NPC
   */
  createZhangjiaoNPC() {
    this.zhangjiaoNPC = {
      id: 'zhangjiao',
      name: '张角',
      title: '太平道创始人',
      position: { x: 400, y: 300 },
      sprite: null, // 实际项目中应该有精灵图
      dialogues: ['awakening', 'talisman_water', 'equipment_upgrade']
    };

    this.addNPC('zhangjiao', this.zhangjiaoNPC);
    console.log('Act2Scene: 张角NPC已创建');
  }

  /**
   * 开始觉醒对话
   */
  startAwakeningDialogue() {
    this.dialoguePhase = 'awakening';
    this.dialogueSystem.startDialogue('awakening');
    console.log('Act2Scene: 开始觉醒对话');
  }

  /**
   * 开始符水对话
   */
  startTalismanWaterDialogue() {
    this.dialoguePhase = 'talisman_water';
    this.dialogueSystem.startDialogue('talisman_water');
    console.log('Act2Scene: 开始符水对话');
  }

  /**
   * 开始装备升级对话
   */
  startEquipmentUpgradeDialogue() {
    this.dialoguePhase = 'upgrade';
    this.dialogueSystem.startDialogue('equipment_upgrade');
    console.log('Act2Scene: 开始装备升级对话');
  }

  /**
   * 给予符水物品
   */
  giveTalismanWater() {
    if (!this.player) return;

    // 添加符水到背包
    const talismanWater = {
      id: 'talisman_water',
      name: '符水',
      type: 'consumable',
      description: '张角的符水，实际上是烧了黄纸的白粥，可以恢复50点生命值',
      effect: {
        type: 'heal',
        value: 50
      },
      quantity: 3
    };

    if (this.player.inventory) {
      this.player.inventory.push(talismanWater);
    } else {
      this.player.inventory = [talismanWater];
    }

    console.log('Act2Scene: 已给予符水');
  }

  /**
   * 给予新装备
   */
  giveNewEquipment() {
    if (!this.player) return;

    // 布衣
    const clothArmor = {
      id: 'cloth_armor',
      name: '布衣',
      type: 'armor',
      rarity: 'common',
      attributes: {
        defense: 5,
        health: 20
      },
      description: '简单的布制衣服，提供基础防护'
    };

    // 木剑
    const woodenSword = {
      id: 'wooden_sword',
      name: '木剑',
      type: 'weapon',
      rarity: 'common',
      attributes: {
        attack: 10
      },
      description: '简单的木制剑，比树棍强多了'
    };

    // 添加到背包
    if (!this.player.inventory) {
      this.player.inventory = [];
    }
    
    this.player.inventory.push(clothArmor, woodenSword);
    this.hasReceivedEquipment = true;

    console.log('Act2Scene: 已给予新装备');
  }

  /**
   * 开始技能教程
   */
  startSkillTutorial() {
    // 给予技能点
    if (this.player) {
      this.player.skillPoints = (this.player.skillPoints || 0) + 5;
      console.log('Act2Scene: 给予5个技能点');
    }

    // 初始化角色的技能树（如果还没有）
    if (this.player && this.player.class) {
      const skillTree = this.skillTreeSystem.getSkillTree(this.player.class);
      if (skillTree) {
        console.log(`Act2Scene: 已加载${this.player.class}技能树`);
      }
    }

    // 显示技能学习教程
    this.tutorialSystem.showTutorial('skill_learning');
    console.log('Act2Scene: 开始技能教程');
  }

  /**
   * 开始属性教程
   */
  startAttributeTutorial() {
    // 给予属性点
    if (this.player) {
      // 初始化角色属性（如果还没有）
      if (!this.attributeSystem.getCharacterAttributes(this.player.id)) {
        this.attributeSystem.initializeCharacterAttributes(this.player.id, {
          strength: 10,
          agility: 10,
          intelligence: 10,
          constitution: 10,
          spirit: 10,
          availablePoints: 10
        });
      } else {
        // 添加属性点
        const attributeData = this.attributeSystem.getCharacterAttributes(this.player.id);
        attributeData.addAvailablePoints(10);
      }
      
      console.log('Act2Scene: 给予10个属性点');
    }

    // 显示属性分配教程
    this.tutorialSystem.showTutorial('attribute_allocation');
    console.log('Act2Scene: 开始属性教程');
  }

  /**
   * 更新场景
   * @param {number} deltaTime - 时间增量（秒）
   */
  update(deltaTime) {
    super.update(deltaTime);

    // 检查技能学习完成
    if (!this.hasLearnedSkills && this.player && this.player.skillPoints !== undefined) {
      // 如果玩家已经学习了至少一个技能
      const skillTree = this.skillTreeSystem.getSkillTree(this.player.class);
      if (skillTree) {
        const learnedSkills = skillTree.getAllNodes().filter(node => node.isLearned);
        if (learnedSkills.length > 0) {
          this.hasLearnedSkills = true;
          console.log('Act2Scene: 玩家已学习技能');
          
          // 开始属性教程
          setTimeout(() => {
            this.startAttributeTutorial();
          }, 1000);
        }
      }
    }

    // 检查属性分配完成
    if (!this.hasAllocatedAttributes && this.player) {
      const attributeData = this.attributeSystem.getCharacterAttributes(this.player.id);
      if (attributeData && attributeData.totalInvestedPoints > 0) {
        this.hasAllocatedAttributes = true;
        console.log('Act2Scene: 玩家已分配属性');
        
        // 标记场景完成
        this.isSceneComplete = true;
      }
    }
  }

  /**
   * 渲染场景
   * @param {CanvasRenderingContext2D} ctx - Canvas渲染上下文
   */
  render(ctx) {
    super.render(ctx);

    // 渲染场景标题
    this.renderSceneTitle(ctx);

    // 渲染张角NPC
    if (this.zhangjiaoNPC) {
      this.renderNPC(ctx, this.zhangjiaoNPC);
    }

    // 渲染提示信息
    this.renderHints(ctx);
  }

  /**
   * 渲染场景标题
   * @param {CanvasRenderingContext2D} ctx - Canvas渲染上下文
   */
  renderSceneTitle(ctx) {
    ctx.save();
    
    ctx.fillStyle = 'rgba(0, 0, 0, 0.7)';
    ctx.fillRect(0, 0, ctx.canvas.width, 80);
    
    ctx.fillStyle = '#FFD700';
    ctx.font = 'bold 32px Arial';
    ctx.textAlign = 'center';
    ctx.fillText('第二幕：符水救灾', ctx.canvas.width / 2, 50);
    
    ctx.restore();
  }

  /**
   * 渲染NPC
   * @param {CanvasRenderingContext2D} ctx - Canvas渲染上下文
   * @param {Object} npc - NPC对象
   */
  renderNPC(ctx, npc) {
    ctx.save();
    
    // 绘制NPC圆形
    ctx.fillStyle = '#4CAF50';
    ctx.beginPath();
    ctx.arc(npc.position.x, npc.position.y, 30, 0, Math.PI * 2);
    ctx.fill();
    
    // 绘制NPC名称
    ctx.fillStyle = '#FFFFFF';
    ctx.font = 'bold 16px Arial';
    ctx.textAlign = 'center';
    ctx.fillText(npc.name, npc.position.x, npc.position.y - 40);
    
    // 绘制NPC称号
    ctx.font = '12px Arial';
    ctx.fillStyle = '#FFD700';
    ctx.fillText(npc.title, npc.position.x, npc.position.y - 55);
    
    ctx.restore();
  }

  /**
   * 渲染提示信息
   * @param {CanvasRenderingContext2D} ctx - Canvas渲染上下文
   */
  renderHints(ctx) {
    ctx.save();
    
    let hints = [];
    
    // 根据当前阶段显示不同提示
    if (this.dialogueSystem.isDialogueActive()) {
      hints.push('按 空格键 继续对话');
    } else if (!this.hasLearnedSkills) {
      hints.push('按 K 键打开技能树');
    } else if (!this.hasAllocatedAttributes) {
      hints.push('按 C 键打开属性面板');
    } else if (this.isSceneComplete) {
      hints.push('按 Enter 键进入下一幕');
    }
    
    // 渲染提示
    if (hints.length > 0) {
      const hintY = ctx.canvas.height - 60;
      
      ctx.fillStyle = 'rgba(0, 0, 0, 0.7)';
      ctx.fillRect(0, hintY - 20, ctx.canvas.width, 60);
      
      ctx.fillStyle = '#FFFFFF';
      ctx.font = '16px Arial';
      ctx.textAlign = 'center';
      
      hints.forEach((hint, index) => {
        ctx.fillText(hint, ctx.canvas.width / 2, hintY + index * 25);
      });
    }
    
    ctx.restore();
  }

  /**
   * 渲染场景背景
   * @param {CanvasRenderingContext2D} ctx - Canvas渲染上下文
   */
  renderBackground(ctx) {
    // 绘制粥棚背景
    ctx.fillStyle = '#8B4513'; // 棕色背景
    ctx.fillRect(0, 0, ctx.canvas.width, ctx.canvas.height);
    
    // 绘制地面
    ctx.fillStyle = '#654321';
    ctx.fillRect(0, ctx.canvas.height - 100, ctx.canvas.width, 100);
    
    // 绘制简单的粥棚结构
    ctx.fillStyle = '#A0522D';
    ctx.fillRect(100, 150, 600, 300);
    
    // 绘制屋顶
    ctx.fillStyle = '#8B4513';
    ctx.beginPath();
    ctx.moveTo(50, 150);
    ctx.lineTo(400, 50);
    ctx.lineTo(750, 150);
    ctx.closePath();
    ctx.fill();
  }

  /**
   * 检查场景完成条件
   */
  checkCompletion() {
    if (this.isSceneComplete) {
      console.log('Act2Scene: 场景完成');
      // 可以在这里添加完成动画或效果
    }
  }

  /**
   * 处理键盘输入
   * @param {KeyboardEvent} event - 键盘事件
   */
  handleKeyPress(event) {
    // 空格键 - 继续对话
    if (event.code === 'Space' && this.dialogueSystem.isDialogueActive()) {
      this.dialogueSystem.continue();
    }
    
    // Enter键 - 进入下一幕
    if (event.code === 'Enter' && this.isSceneComplete) {
      this.goToNextScene();
    }
    
    // K键 - 打开技能树（由外部UI系统处理）
    // C键 - 打开属性面板（由外部UI系统处理）
  }

  /**
   * 场景退出
   */
  exit() {
    console.log('Act2Scene: 退出第二幕场景');
    
    // 保存玩家状态
    if (this.player) {
      // 应用属性效果到玩家
      const effects = this.attributeSystem.calculateCharacterEffects(this.player.id);
      if (effects) {
        console.log('Act2Scene: 应用属性效果', effects);
      }
    }
    
    super.exit();
  }

  /**
   * 获取属性系统
   * @returns {AttributeSystem} 属性系统实例
   */
  getAttributeSystem() {
    return this.attributeSystem;
  }

  /**
   * 获取技能树系统
   * @returns {SkillTreeSystem} 技能树系统实例
   */
  getSkillTreeSystem() {
    return this.skillTreeSystem;
  }

  /**
   * 获取对话系统
   * @returns {DialogueSystem} 对话系统实例
   */
  getDialogueSystem() {
    return this.dialogueSystem;
  }

  /**
   * 获取教程系统
   * @returns {TutorialSystem} 教程系统实例
   */
  getTutorialSystem() {
    return this.tutorialSystem;
  }
}

export default Act2Scene;
