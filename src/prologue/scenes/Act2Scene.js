import { PrologueScene } from './PrologueScene.js';
import { DialogueSystem } from '../../systems/DialogueSystem.js';
import { TutorialSystem } from '../../systems/TutorialSystem.js';
import { AttributeSystem } from '../../systems/AttributeSystem.js';
import { SkillTreeSystem } from '../../systems/SkillTreeSystem.js';
import { EntityFactory } from '../../ecs/EntityFactory.js';
import { InputManager } from '../../core/InputManager.js';
import { MovementSystem } from '../../systems/MovementSystem.js';
import { RenderSystem } from '../../rendering/RenderSystem.js';

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
    
    // 对话完成标志
    this.awakeningDialogueCompleted = false;
    this.talismanWaterDialogueCompleted = false;
    this.equipmentUpgradeDialogueCompleted = false;
    
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
    
    // 符水使用流程状态
    this.talismanWaterGiven = false;      // 是否已给予符水
    this.waitingForTalismanUse = false;   // 是否等待使用符水
    this.talismanWaterUsed = false;       // 是否已使用符水
    this.showedAttributeHint = false;     // 是否已显示属性面板提示
    this.waitingForAttributePanel = false; // 是否等待属性面板关闭
    
    // 通知系统回调
    this.onNotification = null;
    
    // 玩家实体引用（用于背包系统）
    this.playerEntity = null;
    
    // 敌人实体数组（保持与第一幕数据结构一致）
    this.enemyEntities = [];
    
    // 教程阶段（保持与第一幕数据结构一致）
    this.tutorialPhase = 'awakening';
  }

  /**
   * 场景进入
   * @param {Object} data - 从上一个场景传递的数据
   */
  enter(data = null) {
    super.enter(data);
    
    console.log('Act2Scene: 进入第二幕场景', data);
    
    // 获取 canvas
    const canvas = document.getElementById('gameCanvas');
    if (!canvas) {
      console.error('Act2Scene: Canvas not found');
      return;
    }
    
    const ctx = canvas.getContext('2d');
    
    // 初始化渲染系统（包含 Camera）
    this.renderSystem = new RenderSystem(ctx, null, 800, 600);
    this.camera = this.renderSystem.getCamera();
    this.camera.setBounds(0, 0, 800, 600);
    
    // 初始化输入管理器
    this.inputManager = new InputManager(canvas);
    
    // 初始化移动系统
    this.movementSystem = new MovementSystem({
      inputManager: this.inputManager,
      camera: this.camera
    });
    
    // 设置地图边界
    this.movementSystem.setMapBounds(0, 0, 800, 600);
    
    // 实体列表
    this.entities = [];
    
    // 从上一个场景继承玩家实体
    if (data && data.playerEntity) {
      this.playerEntity = data.playerEntity;
      // 重置玩家位置
      const transform = this.playerEntity.getComponent('transform');
      if (transform) {
        transform.position.x = 200;
        transform.position.y = 300;
      }
      console.log('Act2Scene: 继承玩家实体', this.playerEntity);
    } else {
      // 如果没有继承玩家实体，创建一个新的
      this.createPlayerEntity();
    }
    
    // 将玩家添加到实体列表
    if (this.playerEntity) {
      this.entities.push(this.playerEntity);
      
      // 设置相机跟随玩家
      const transform = this.playerEntity.getComponent('transform');
      if (transform) {
        this.camera.setTarget(transform);
      }
      
      // 设置移动系统的玩家实体
      this.movementSystem.setPlayerEntity(this.playerEntity);
    }
    
    // 初始化系统
    this.initializeSystems();
    
    // 恢复玩家生命值
    if (this.playerEntity) {
      const stats = this.playerEntity.getComponent('stats');
      if (stats) {
        stats.hp = stats.maxHp;
        console.log('Act2Scene: 玩家生命值已恢复');
      }
    }
    if (this.player) {
      this.player.health = this.player.maxHealth || 100;
      this.player.hp = this.player.maxHp || 100;
    }
    
    // 创建张角NPC
    this.createZhangjiaoNPC();
    
    // 开始觉醒对话
    this.startAwakeningDialogue();
  }
  
  /**
   * 创建玩家实体
   */
  createPlayerEntity() {
    const entityFactory = new EntityFactory();
    
    this.playerEntity = entityFactory.createPlayer({
      name: '灾民',
      class: 'refugee',
      level: 1,
      position: { x: 200, y: 300 },
      stats: {
        maxHp: 150,
        hp: 150,
        maxMp: 100,
        mp: 100,
        attack: 15,
        defense: 8,
        speed: 120
      },
      skills: [
        { id: 'basic_attack', name: '普通攻击', damage: 15, manaCost: 0, cooldown: 1.0, range: 150 },
        { id: 'fireball', name: '火球术', damage: 45, manaCost: 15, cooldown: 2.0, range: 500 },
        { id: 'ice_lance', name: '寒冰箭', damage: 40, manaCost: 12, cooldown: 1.8, range: 550 },
        { id: 'flame_burst', name: '烈焰爆发', damage: 65, manaCost: 25, cooldown: 4.0, range: 450 }
      ],
      equipment: {},
      inventory: []
    });
    
    console.log('Act2Scene: 创建玩家实体', this.playerEntity);
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
          nextNode: null
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
          nextNode: null
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
          nextNode: null
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
    this.tutorialPhase = 'awakening';
    this.dialogueSystem.startDialogue('awakening');
    console.log('Act2Scene: 开始觉醒对话');
  }

  /**
   * 开始符水对话
   */
  startTalismanWaterDialogue() {
    this.dialoguePhase = 'talisman_water';
    this.tutorialPhase = 'talisman_water';
    this.dialogueSystem.startDialogue('talisman_water');
    console.log('Act2Scene: 开始符水对话');
  }

  /**
   * 开始装备升级对话
   */
  startEquipmentUpgradeDialogue() {
    this.dialoguePhase = 'upgrade';
    this.tutorialPhase = 'upgrade';
    this.dialogueSystem.startDialogue('equipment_upgrade');
    
    // 设置对话结束回调
    const originalOnEnd = this.dialogueSystem._onEndCallback;
    this.dialogueSystem.onEnd(() => {
      if (originalOnEnd) originalOnEnd();
      
      if (!this.equipmentUpgradeDialogueCompleted) {
        this.equipmentUpgradeDialogueCompleted = true;
        this.giveNewEquipment();
        setTimeout(() => {
          this.startSkillTutorial();
        }, 1500);
      }
    });
    
    console.log('Act2Scene: 开始装备升级对话');
  }

  /**
   * 设置通知回调
   * @param {Function} callback - 通知回调函数
   */
  setNotificationCallback(callback) {
    this.onNotification = callback;
  }

  /**
   * 发送通知
   * @param {string} message - 通知消息
   * @param {string} type - 通知类型
   */
  notify(message, type = 'info') {
    console.log(`Act2Scene 通知: ${message}`);
    if (this.onNotification) {
      this.onNotification(message, type);
    }
  }

  /**
   * 设置玩家实体（用于背包系统）
   * @param {Entity} entity - 玩家实体
   */
  setPlayerEntity(entity) {
    this.playerEntity = entity;
    console.log('Act2Scene: 设置玩家实体', entity);
  }

  /**
   * 给予符水物品
   */
  giveTalismanWater() {
    // 创建符水物品数据
    const talismanWater = {
      id: 'talisman_water',
      name: '符水',
      type: 'consumable',
      usable: true,
      maxStack: 10,
      rarity: 1, // 不凡
      description: '张角的符水，实际上是烧了黄纸的白粥，可以恢复50点生命值',
      effect: {
        type: 'heal',
        value: 50
      },
      value: 10
    };

    // 尝试添加到玩家实体的背包组件
    if (this.playerEntity) {
      const inventoryComponent = this.playerEntity.getComponent('inventory');
      if (inventoryComponent) {
        inventoryComponent.addItem(talismanWater, 1);
        console.log('Act2Scene: 符水已添加到背包组件');
      }
    }
    
    // 同时添加到 player 对象（兼容旧代码）
    if (this.player) {
      if (this.player.inventory) {
        this.player.inventory.push({ ...talismanWater, quantity: 1 });
      } else {
        this.player.inventory = [{ ...talismanWater, quantity: 1 }];
      }
    }

    // 标记已给予符水
    this.talismanWaterGiven = true;
    this.waitingForTalismanUse = true;

    // 发送通知
    this.notify('得到 符水x1', 'success');
    
    // 显示提示：按B打开背包
    setTimeout(() => {
      this.showTalismanUseTutorial();
    }, 1500);

    console.log('Act2Scene: 已给予符水');
  }

  /**
   * 显示符水使用教程
   */
  showTalismanUseTutorial() {
    if (!this.waitingForTalismanUse) return;
    
    // 注册并显示符水使用教程
    this.tutorialSystem.registerTutorial('use_talisman_water', {
      title: '使用符水',
      description: '学习如何使用背包中的物品',
      steps: [
        {
          text: '按 <span class="key">B</span> 键打开背包，使用符水恢复生命值。',
          position: 'top'
        }
      ],
      pauseGame: false,
      canSkip: false,
      priority: 110
    });
    
    this.tutorialSystem.showTutorial('use_talisman_water');
    console.log('Act2Scene: 显示符水使用教程');
  }

  /**
   * 处理符水使用事件
   * @param {Object} item - 使用的物品
   * @param {number} healAmount - 恢复的生命值
   */
  onTalismanWaterUsed(item, healAmount) {
    if (item && item.id === 'talisman_water' && this.waitingForTalismanUse) {
      this.waitingForTalismanUse = false;
      this.talismanWaterUsed = true;
      
      // 隐藏符水使用教程
      this.tutorialSystem.hideTutorial();
      
      // 发送恢复通知
      this.notify(`恢复了 ${healAmount} 点生命值`, 'success');
      
      // 显示属性面板提示
      setTimeout(() => {
        this.showAttributePanelHint();
      }, 1500);
      
      console.log('Act2Scene: 符水已使用，恢复了', healAmount, '点生命值');
    }
  }

  /**
   * 显示属性面板提示
   */
  showAttributePanelHint() {
    if (this.showedAttributeHint) return;
    this.showedAttributeHint = true;
    
    // 注册并显示属性面板提示
    this.tutorialSystem.registerTutorial('check_attribute_panel', {
      title: '查看属性',
      description: '查看角色属性变化',
      steps: [
        {
          text: '按 <span class="key">C</span> 键打开属性面板，查看生命值的变化。',
          position: 'top'
        }
      ],
      pauseGame: false,
      canSkip: true,
      priority: 105
    });
    
    this.tutorialSystem.showTutorial('check_attribute_panel');
    console.log('Act2Scene: 显示属性面板提示');
  }

  /**
   * 给予新装备
   */
  giveNewEquipment() {
    // 布衣
    const clothArmor = {
      id: 'cloth_armor',
      name: '布衣',
      type: 'equipment',
      subType: 'armor',
      rarity: 0, // 普通
      maxStack: 1,
      usable: false,
      stats: {
        defense: 5,
        maxHp: 20
      },
      description: '简单的布制衣服，提供基础防护'
    };

    // 木剑
    const woodenSword = {
      id: 'wooden_sword',
      name: '木剑',
      type: 'equipment',
      subType: 'weapon',
      rarity: 0, // 普通
      maxStack: 1,
      usable: false,
      stats: {
        attack: 10
      },
      description: '简单的木制剑，比树棍强多了'
    };

    // 添加到玩家实体的背包组件
    if (this.playerEntity) {
      const inventoryComponent = this.playerEntity.getComponent('inventory');
      if (inventoryComponent) {
        inventoryComponent.addItem(clothArmor, 1);
        inventoryComponent.addItem(woodenSword, 1);
        console.log('Act2Scene: 装备已添加到背包组件');
      }
    }
    
    // 同时添加到 player 对象（兼容旧代码）
    if (this.player) {
      if (!this.player.inventory) {
        this.player.inventory = [];
      }
      this.player.inventory.push(clothArmor, woodenSword);
    }
    
    this.hasReceivedEquipment = true;

    // 发送通知
    this.notify('得到 布衣x1', 'success');
    setTimeout(() => {
      this.notify('得到 木剑x1', 'success');
    }, 500);

    console.log('Act2Scene: 已给予新装备');
  }

  /**
   * 开始技能教程
   */
  startSkillTutorial() {
    this.tutorialPhase = 'skills';
    
    // 给予技能点
    if (this.player) {
      this.player.skillPoints = (this.player.skillPoints || 0) + 5;
      console.log('Act2Scene: 给予5个技能点');
      this.notify('获得 5 技能点', 'success');
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
    this.tutorialPhase = 'attributes';
    
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
      this.notify('获得 10 属性点', 'success');
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
    // 不调用 super.update()，因为 Act2Scene 使用数组而不是 Map 存储实体
    if (!this.isActive || this.isPaused) {
      return;
    }
    
    // 更新相机
    if (this.camera) {
      this.camera.update(deltaTime);
    }
    
    // 更新所有实体
    for (const entity of this.entities) {
      entity.update(deltaTime);
    }
    
    // 更新移动系统
    if (this.movementSystem) {
      this.movementSystem.update(deltaTime, this.entities);
    }
    
    // 更新输入管理器（清除本帧的输入状态）
    if (this.inputManager) {
      this.inputManager.update();
    }
    
    // 更新教程系统
    if (this.tutorialSystem) {
      this.tutorialSystem.update(deltaTime, {});
    }
    
    // 更新对话系统
    if (this.dialogueSystem) {
      this.dialogueSystem.update(deltaTime);
    }

    // 检查对话结束并触发下一个对话
    if (this.dialogueSystem && !this.dialogueSystem.isDialogueActive()) {
      // 觉醒对话结束 -> 符水对话
      if (this.dialoguePhase === 'awakening' && !this.awakeningDialogueCompleted) {
        this.awakeningDialogueCompleted = true;
        setTimeout(() => {
          this.startTalismanWaterDialogue();
        }, 1000);
      }
      // 符水对话结束 -> 给予符水并等待使用
      else if (this.dialoguePhase === 'talisman_water' && !this.talismanWaterDialogueCompleted) {
        this.talismanWaterDialogueCompleted = true;
        this.giveTalismanWater();
        // 不再自动开始下一个对话，等待玩家使用符水
      }
      // 符水已使用且属性面板提示已显示 -> 装备升级对话
      else if (this.talismanWaterUsed && this.showedAttributeHint && !this.equipmentUpgradeDialogueCompleted) {
        // 等待玩家关闭属性面板后继续
        if (!this.waitingForAttributePanel) {
          this.waitingForAttributePanel = true;
          setTimeout(() => {
            this.startEquipmentUpgradeDialogue();
          }, 2000);
        }
      }
      // 装备升级对话结束 -> 技能教程
      else if (this.dialoguePhase === 'upgrade' && this.equipmentUpgradeDialogueCompleted && !this.hasReceivedEquipment) {
        // 这个逻辑已经在 equipmentUpgradeDialogueCompleted 设置时处理
      }
    }

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
    // 清空Canvas
    ctx.fillStyle = '#1a1a2e';
    ctx.fillRect(0, 0, ctx.canvas.width, ctx.canvas.height);
    
    // 渲染背景
    this.renderBackground(ctx);

    // 保存上下文状态
    ctx.save();
    
    // 应用相机变换
    if (this.camera) {
      const viewBounds = this.camera.getViewBounds();
      ctx.translate(-viewBounds.left, -viewBounds.top);
    }
    
    // 渲染玩家
    if (this.playerEntity) {
      this.renderPlayer(ctx);
    }

    // 渲染张角NPC
    if (this.zhangjiaoNPC) {
      this.renderNPC(ctx, this.zhangjiaoNPC);
    }
    
    // 恢复上下文状态
    ctx.restore();

    // 渲染场景标题（不受相机影响）
    this.renderSceneTitle(ctx);

    // 渲染提示信息（不受相机影响）
    this.renderHints(ctx);
  }
  
  /**
   * 渲染玩家
   * @param {CanvasRenderingContext2D} ctx - Canvas渲染上下文
   */
  renderPlayer(ctx) {
    const transform = this.playerEntity.getComponent('transform');
    if (!transform) return;
    
    ctx.save();
    
    // 绘制玩家（蓝色方块）
    ctx.fillStyle = '#4a9eff';
    ctx.fillRect(transform.position.x - 15, transform.position.y - 15, 30, 30);
    
    // 绘制玩家名称
    ctx.fillStyle = '#FFFFFF';
    ctx.font = '14px Arial';
    ctx.textAlign = 'center';
    ctx.fillText(this.playerEntity.name || '玩家', transform.position.x, transform.position.y - 25);
    
    // 绘制血条
    const stats = this.playerEntity.getComponent('stats');
    if (stats) {
      const barWidth = 40;
      const barHeight = 4;
      const barX = transform.position.x - barWidth / 2;
      const barY = transform.position.y - 35;
      
      // 血条背景
      ctx.fillStyle = '#333';
      ctx.fillRect(barX, barY, barWidth, barHeight);
      
      // 血条
      const hpPercent = stats.hp / stats.maxHp;
      ctx.fillStyle = hpPercent > 0.3 ? '#4CAF50' : '#ff4444';
      ctx.fillRect(barX, barY, barWidth * hpPercent, barHeight);
    }
    
    ctx.restore();
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
    if (this.dialogueSystem && this.dialogueSystem.isDialogueActive()) {
      hints.push('按 空格键 继续对话');
    } else if (this.waitingForTalismanUse) {
      hints.push('按 B 键打开背包，使用符水');
    } else if (this.talismanWaterUsed && !this.showedAttributeHint) {
      hints.push('按 C 键打开属性面板');
    } else if (!this.hasLearnedSkills && this.hasReceivedEquipment) {
      hints.push('按 K 键打开技能树');
    } else if (!this.hasAllocatedAttributes && this.hasLearnedSkills) {
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
