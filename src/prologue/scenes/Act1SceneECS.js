/**
 * Act1SceneECS - 第一幕：绝望的开始（完整 ECS 架构版本）
 * 
 * 【完整 ECS 实现】
 * 本场景使用完整的 ECS 架构和核心系统：
 * - Entity 和 Component 系统
 * - InputManager 处理输入
 * - Camera 系统管理视野
 * - CombatSystem 处理战斗
 * - MovementSystem 处理移动
 * - EquipmentSystem 处理装备
 * 
 * 需求：1, 2, 3, 4, 5, 6, 7
 */

import { PrologueScene } from './PrologueScene.js';
import { EntityFactory } from '../../ecs/EntityFactory.js';
import { InputManager } from '../../core/InputManager.js';
import { Camera } from '../../rendering/Camera.js';
import { CombatSystem } from '../../systems/CombatSystem.js';
import { MovementSystem } from '../../systems/MovementSystem.js';
import { EquipmentSystem } from '../../systems/EquipmentSystem.js';
import { TutorialSystem } from '../systems/TutorialSystem.js';
import { DialogueSystem } from '../systems/DialogueSystem.js';
import { QuestSystem } from '../systems/QuestSystem.js';
import { RenderSystem } from '../../rendering/RenderSystem.js';
import { CombatEffects } from '../../rendering/CombatEffects.js';
import { InventoryPanel } from '../../ui/InventoryPanel.js';
import { PlayerInfoPanel } from '../../ui/PlayerInfoPanel.js';
import { EquipmentPanel } from '../../ui/EquipmentPanel.js';
import { FloatingTextManager } from '../../ui/FloatingText.js';
import { ParticleSystem } from '../../rendering/ParticleSystem.js';

export class Act1SceneECS extends PrologueScene {
  constructor() {
    super(1, {});
    
    // ECS 核心
    this.entityFactory = new EntityFactory();
    this.entities = [];
    
    // 核心系统
    this.inputManager = null;
    this.camera = null;
    this.combatSystem = null;
    this.movementSystem = null;
    this.equipmentSystem = null;
    this.renderSystem = null;
    this.combatEffects = null;
    
    // 序章系统
    this.tutorialSystem = new TutorialSystem();
    this.dialogueSystem = new DialogueSystem();
    this.questSystem = new QuestSystem();
    
    // UI 面板
    this.inventoryPanel = null;
    this.playerInfoPanel = null;
    this.equipmentPanel = null;
    
    // 飘动文字管理器
    this.floatingTextManager = new FloatingTextManager();
    
    // 粒子系统
    this.particleSystem = new ParticleSystem(500);
    
    // 玩家实体
    this.playerEntity = null;
    
    // 教程状态
    this.tutorialPhase = 'character_creation';
    this.tutorialsCompleted = {
      movement: false,
      pickup: false,
      equipment: false,
      consumable: false,
      combat: false
    };
    
    // 教程追踪
    this.playerMovedDistance = 0;
    this.lastPlayerPosition = null;
    this.lastPickupTime = 0; // 拾取冷却时间
    this.lastPlayerInfoToggleTime = 0; // 人物信息面板切换冷却时间
    this.lastInventoryToggleTime = 0; // 背包切换冷却时间
    this.lastEquipmentToggleTime = 0; // 装备面板切换冷却时间
    
    // 可拾取物品（简化为实体）
    this.pickupItems = [];
    
    // 火堆
    this.campfire = {
      x: 350,
      y: 250,
      lit: false,
      emitters: [], // 多个火焰发射器
      emitterSmoke: null
    };
    
    // 战斗状态
    this.combatWave = 0;
    this.enemyEntities = [];
    
    // 死亡和过渡
    this.playerDied = false;
    this.isTransitioning = false;
    this.transitionAlpha = 0;
    this.transitionPhase = 'none';
    this.transitionTimer = 0;
    this.transitionDuration = 2.0;
    this.textDisplayDuration = 3.0;
    
    // 角色名称
    this.characterName = '';
  }

  /**
   * 场景进入
   */
  enter(data = null) {
    super.enter(data);
    
    // 获取 canvas
    const canvas = document.getElementById('gameCanvas');
    if (!canvas) {
      console.error('Act1SceneECS: Canvas not found');
      return;
    }
    
    const ctx = canvas.getContext('2d');
    
    // 初始化渲染系统（包含 Camera）
    this.renderSystem = new RenderSystem(ctx, null, 800, 600);
    this.camera = this.renderSystem.getCamera();
    this.camera.setBounds(0, 0, 800, 600);
    
    // 初始化输入管理器
    this.inputManager = new InputManager(canvas);
    
    // 初始化战斗特效
    this.combatEffects = new CombatEffects(ctx, this.camera);
    
    // 初始化游戏系统
    this.combatSystem = new CombatSystem({
      inputManager: this.inputManager,
      camera: this.camera,
      skillEffects: this.combatEffects
    });
    
    this.movementSystem = new MovementSystem({
      inputManager: this.inputManager
    });
    
    this.equipmentSystem = new EquipmentSystem();
    
    // 初始化 UI 面板
    // 角色信息面板 - 最左侧
    this.playerInfoPanel = new PlayerInfoPanel({
      x: 10,
      y: 10,
      width: 280,
      height: 320,
      visible: false  // 默认隐藏，按 C 键打开
    });
    
    // 装备面板 - 角色信息面板右边
    this.equipmentPanel = new EquipmentPanel({
      x: 300,
      y: 10,
      width: 180,
      height: 400,
      visible: false
    });
    
    // 背包面板 - 最右侧
    this.inventoryPanel = new InventoryPanel({
      x: 420,
      y: 10,
      width: 370,
      height: 350,
      visible: false,
      onItemUse: (item, healAmount, manaAmount) => {
        // 使用物品时显示飘动文字
        if (this.playerEntity) {
          const transform = this.playerEntity.getComponent('transform');
          if (transform) {
            // 显示治疗飘动文字
            if (healAmount > 0) {
              this.floatingTextManager.addHeal(
                transform.position.x,
                transform.position.y - 30,
                healAmount
              );
            }
            // 显示魔法恢复飘动文字
            if (manaAmount > 0) {
              this.floatingTextManager.addManaRestore(
                transform.position.x,
                transform.position.y - 50,
                manaAmount
              );
            }
          }
        }
      }
    });
    
    // 创建玩家实体
    this.createPlayerEntity();
    
    // 注册教程
    this.registerTutorials();
    
    // 显示角色创建
    this.showCharacterCreation();
    
    console.log('Act1SceneECS: 进入第一幕 - 绝望的开始（完整 ECS 版本）');
  }

  /**
   * 创建玩家实体
   */
  createPlayerEntity() {
    this.characterName = '灾民';
    
    this.playerEntity = this.entityFactory.createPlayer({
      name: this.characterName,
      class: 'refugee',
      level: 1,
      position: { x: 400, y: 300 },
      stats: {
        maxHp: 100,
        hp: 30, // 30% 生命值
        maxMp: 50,
        mp: 50,
        attack: 10,
        defense: 5,
        speed: 100
      },
      skills: [],
      equipment: {},
      inventory: []
    });
    
    this.entities.push(this.playerEntity);
    
    // 设置相机跟随玩家
    const transform = this.playerEntity.getComponent('transform');
    if (transform) {
      this.camera.setTarget(transform);
    }
    
    // 设置战斗系统的玩家实体
    this.combatSystem.setPlayerEntity(this.playerEntity);
    
    // 设置 UI 面板的实体
    this.inventoryPanel.setEntity(this.playerEntity);
    this.playerInfoPanel.setPlayer(this.playerEntity);
    this.equipmentPanel.setEntity(this.playerEntity);
    
    console.log('Act1SceneECS: 创建玩家实体', this.playerEntity);
  }

  /**
   * 显示角色创建界面
   */
  showCharacterCreation() {
    console.log('Act1SceneECS: 显示角色创建界面');
    this.characterCreated = true;
    
    // 手动显示第一个渐进式提示
    this.tutorialSystem.showTutorial('progressive_tip_1');
    
    // 开始移动教程
    this.startMovementTutorial();
  }

  /**
   * 注册教程
   */
  registerTutorials() {
    // 渐进式提示 1: 按C查看属性
    this.tutorialSystem.registerTutorial('progressive_tip_1', {
      title: '提示',
      description: '你从黑暗中醒来',
      steps: [
        { text: '你从黑暗中醒来,饥寒交迫。按 <span class="key">C</span> 查看属性', position: 'center' }
      ],
      triggerCondition: (gameState) => {
        return this.tutorialPhase === 'character_creation' && !this.tutorialsCompleted.progressive_tip_1;
      },
      pauseGame: false,
      canSkip: false,
      priority: 100,
      autoTrigger: true
    });

    // 渐进式提示 2: 按C关闭属性
    this.tutorialSystem.registerTutorial('progressive_tip_2', {
      title: '提示',
      description: '发现自己受伤了',
      steps: [
        { text: '你发现自己受伤了，很虚弱。按 <span class="key">C</span> 关闭属性', position: 'center' }
      ],
      triggerCondition: (gameState) => {
        return this.tutorialsCompleted.progressive_tip_1 && this.playerInfoPanel?.visible && !this.tutorialsCompleted.progressive_tip_2;
      },
      pauseGame: false,
      canSkip: false,
      priority: 99,
      autoTrigger: true
    });

    // 渐进式提示 3: 按WASD移动
    this.tutorialSystem.registerTutorial('progressive_tip_3', {
      title: '提示',
      description: '四处走走看看',
      steps: [
        { text: '你四处走了走，看了看。按<span class="key">W</span><span class="key">A</span><span class="key">S</span><span class="key">D</span>移动', position: 'center' }
      ],
      triggerCondition: (gameState) => {
        return this.tutorialsCompleted.progressive_tip_2 && !this.tutorialsCompleted.progressive_tip_3;
      },
      pauseGame: false,
      canSkip: false,
      priority: 98,
      autoTrigger: true
    });

    // 渐进式提示 3.5: 点燃火堆
    this.tutorialSystem.registerTutorial('progressive_tip_3_5', {
      title: '提示',
      description: '发现火堆',
      steps: [
        { text: '你发现一个熄灭的火堆。靠近并按<span class="key">E</span>键点燃火堆', position: 'center' }
      ],
      triggerCondition: (gameState) => {
        return this.tutorialsCompleted.progressive_tip_3 && !this.campfire.lit && !this.tutorialsCompleted.progressive_tip_3_5;
      },
      pauseGame: false,
      canSkip: false,
      priority: 97.5,
      autoTrigger: true
    });

    // 渐进式提示 4: 按E键拾取
    this.tutorialSystem.registerTutorial('progressive_tip_4', {
      title: '提示',
      description: '发现物品',
      steps: [
        { text: '你发现一些物品。按<span class="key">E</span>键拾取', position: 'center' }
      ],
      triggerCondition: (gameState) => {
        return this.pickupItems && this.pickupItems.length > 0 && !this.tutorialsCompleted.progressive_tip_4;
      },
      pauseGame: false,
      canSkip: false,
      priority: 97,
      autoTrigger: true
    });

    // 渐进式提示 5: 按B键查看背包
    this.tutorialSystem.registerTutorial('progressive_tip_5', {
      title: '提示',
      description: '查看背包',
      steps: [
        { text: '按<span class="key">B</span>键查看背包', position: 'center' }
      ],
      triggerCondition: (gameState) => {
        const inventory = this.playerEntity?.getComponent('inventory');
        // 修改触发条件：拾取完3个物品
        return inventory && inventory.items && inventory.items.length >= 3 && !this.tutorialsCompleted.progressive_tip_5;
      },
      pauseGame: false,
      canSkip: false,
      priority: 96,
      autoTrigger: true
    });

    // 渐进式提示 6: 点击物品装备
    this.tutorialSystem.registerTutorial('progressive_tip_6', {
      title: '提示',
      description: '装备物品',
      steps: [
        { text: '点击物品装备或使用', position: 'center' }
      ],
      triggerCondition: (gameState) => {
        return this.inventoryPanel?.visible && !this.tutorialsCompleted.progressive_tip_6;
      },
      pauseGame: false,
      canSkip: false,
      priority: 95,
      autoTrigger: true
    });

    // 渐进式提示 7: 按V键查看装备
    this.tutorialSystem.registerTutorial('progressive_tip_7', {
      title: '提示',
      description: '查看装备',
      steps: [
        { text: '按<span class="key">V</span>键查看装备', position: 'center' }
      ],
      triggerCondition: (gameState) => {
        const equipment = this.playerEntity?.getComponent('equipment');
        return equipment && equipment.slots && Object.keys(equipment.slots).some(slot => equipment.slots[slot]) && !this.tutorialsCompleted.progressive_tip_7;
      },
      pauseGame: false,
      canSkip: false,
      priority: 94,
      autoTrigger: true
    });

    // 渐进式提示 8: 使用消耗品
    this.tutorialSystem.registerTutorial('progressive_tip_8', {
      title: '提示',
      description: '使用消耗品',
      steps: [
        { text: '你感到很虚弱。点击残羹使用，恢复生命值', position: 'center' }
      ],
      triggerCondition: (gameState) => {
        return this.tutorialPhase === 'consumable' && !this.tutorialsCompleted.progressive_tip_8;
      },
      pauseGame: false,
      canSkip: false,
      priority: 93,
      autoTrigger: true
    });

    // 移动教程
    this.tutorialSystem.registerTutorial('movement', {
      title: '移动教程',
      description: '学习如何移动角色',
      steps: [
        { text: '使用WASD或方向键移动角色，或点击鼠标移动', position: 'top' }
      ],
      triggerCondition: (gameState) => {
        return this.tutorialPhase === 'movement' && !this.tutorialsCompleted.movement;
      },
      completionCondition: (gameState) => {
        return this.playerMovedDistance >= 100;
      },
      pauseGame: false,
      canSkip: false,
      priority: 10
    });

    // 拾取教程
    this.tutorialSystem.registerTutorial('pickup', {
      title: '拾取教程',
      description: '学习如何拾取物品',
      steps: [
        { text: '靠近物品并按<span class="key">E</span>键拾取', position: 'top' }
      ],
      triggerCondition: (gameState) => {
        return this.tutorialPhase === 'pickup' && !this.tutorialsCompleted.pickup;
      },
      pauseGame: false,
      canSkip: false,
      priority: 9
    });

    // 装备教程
    this.tutorialSystem.registerTutorial('equipment', {
      title: '装备教程',
      description: '学习如何装备物品',
      steps: [
        { text: '打开背包（按B键）', position: 'top' },
        { text: '点击物品查看详情', position: 'center' },
        { text: '点击"装备"按钮装备物品', position: 'center' }
      ],
      triggerCondition: (gameState) => {
        return this.tutorialPhase === 'equipment' && !this.tutorialsCompleted.equipment;
      },
      pauseGame: false,
      canSkip: false,
      priority: 8
    });

    // 战斗教程
    this.tutorialSystem.registerTutorial('combat', {
      title: '战斗教程',
      description: '学习如何战斗',
      steps: [
        { text: '按空格键攻击敌人', position: 'top' },
        { text: '注意生命值，低于30%时要小心', position: 'top' }
      ],
      triggerCondition: (gameState) => {
        return this.tutorialPhase === 'combat' && !this.tutorialsCompleted.combat;
      },
      pauseGame: false,
      canSkip: false,
      priority: 7
    });
  }

  /**
   * 开始移动教程
   */
  startMovementTutorial() {
    console.log('Act1SceneECS: 开始移动教程');
    this.tutorialPhase = 'movement';
    this.tutorialSystem.showTutorial('movement');
    
    // 记录初始位置
    const transform = this.playerEntity.getComponent('transform');
    if (transform) {
      this.lastPlayerPosition = { x: transform.position.x, y: transform.position.y };
    }
  }

  /**
   * 开始拾取教程
   */
  startPickupTutorial() {
    console.log('Act1SceneECS: 开始拾取教程');
    this.tutorialPhase = 'pickup';
    this.spawnPickupItems();
    this.tutorialSystem.showTutorial('pickup');
  }

  /**
   * 生成可拾取物品
   */
  spawnPickupItems() {
    const items = [
      { 
        id: 'ragged_clothes', 
        name: '破旧衣服', 
        type: 'equipment',
        subType: 'armor',
        x: 200, 
        y: 200,
        stats: {
          defense: 2
        },
        description: '破旧的衣服，聊胜于无',
        rarity: 0,
        maxStack: 1
      },
      { 
        id: 'wooden_stick', 
        name: '树棍', 
        type: 'equipment',
        subType: 'weapon',
        x: 300, 
        y: 250,
        stats: {
          attack: 5
        },
        description: '简陋的木棍，可以用来防身',
        rarity: 0,
        maxStack: 1
      },
      { 
        id: 'leftover_food', 
        name: '残羹', 
        type: 'consumable', 
        x: 250, 
        y: 300, 
        heal: 20,
        description: '剩余的食物，可以恢复少量生命值',
        rarity: 0,
        maxStack: 10,
        usable: true,
        effect: {
          type: 'heal',
          value: 20
        }
      }
    ];
    
    for (const item of items) {
      this.pickupItems.push({
        ...item,
        picked: false
      });
    }
    
    console.log('Act1SceneECS: 生成拾取物品', this.pickupItems);
  }

  /**
   * 拾取物品
   */
  pickupItem(item) {
    if (item.picked) return;
    
    console.log(`Act1SceneECS: 拾取物品 - ${item.name}`);
    item.picked = true;
    
    // 添加到背包
    const inventory = this.playerEntity.getComponent('inventory');
    if (inventory) {
      // 创建完整的物品对象
      const itemData = {
        id: item.id,
        name: item.name,
        type: item.type,
        subType: item.subType,
        description: item.description || '',
        rarity: item.rarity || 0,
        maxStack: item.maxStack || 1,
        usable: item.usable || false,
        effect: item.effect || null,
        stats: {}
      };
      
      // 添加装备属性
      if (item.attack) itemData.stats.attack = item.attack;
      if (item.defense) itemData.stats.defense = item.defense;
      if (item.heal) itemData.heal = item.heal;
      
      inventory.addItem(itemData);
      console.log('Act1SceneECS: 物品已添加到背包', itemData);
      
      // 完成渐进式提示4: 按E键拾取
      if (!this.tutorialsCompleted.progressive_tip_4) {
        this.completeTutorial('progressive_tip_4');
        console.log('Act1SceneECS: 完成渐进式提示4 - 按E键拾取');
      }
    }
  }

  /**
   * 开始装备教程
   */
  startEquipmentTutorial() {
    console.log('Act1SceneECS: 开始装备教程');
    this.tutorialPhase = 'equipment';
    this.tutorialSystem.showTutorial('equipment');
  }

  /**
   * 开始战斗教程
   */
  startCombatTutorial() {
    console.log('Act1SceneECS: 开始战斗教程');
    this.tutorialPhase = 'combat';
    this.tutorialSystem.showTutorial('combat');
    this.spawnCombatWave(0);
  }

  /**
   * 生成战斗波次
   */
  spawnCombatWave(waveIndex) {
    console.log(`Act1SceneECS: 生成第${waveIndex + 1}波敌人`);
    this.combatWave = waveIndex;
    
    // 清除旧敌人
    for (const enemy of this.enemyEntities) {
      const index = this.entities.indexOf(enemy);
      if (index > -1) {
        this.entities.splice(index, 1);
      }
    }
    this.enemyEntities = [];
    
    // 生成新敌人
    const waves = [
      // 第一波：野狗
      [
        { name: '野狗', templateId: 'wild_dog', level: 1, stats: { maxHp: 30, attack: 5, defense: 2 }, x: 500, y: 300 },
        { name: '野狗', templateId: 'wild_dog', level: 1, stats: { maxHp: 30, attack: 5, defense: 2 }, x: 600, y: 300 }
      ],
      // 第二波：官府士兵
      [
        { name: '官府士兵', templateId: 'soldier', level: 2, stats: { maxHp: 50, attack: 8, defense: 5 }, x: 450, y: 250 },
        { name: '官府士兵', templateId: 'soldier', level: 2, stats: { maxHp: 50, attack: 8, defense: 5 }, x: 550, y: 300 },
        { name: '官府士兵', templateId: 'soldier', level: 2, stats: { maxHp: 50, attack: 8, defense: 5 }, x: 650, y: 350 }
      ],
      // 第三波：土匪
      [
        { name: '土匪', templateId: 'bandit', level: 3, stats: { maxHp: 60, attack: 10, defense: 6 }, x: 500, y: 250 },
        { name: '土匪', templateId: 'bandit', level: 3, stats: { maxHp: 60, attack: 10, defense: 6 }, x: 600, y: 250 },
        { name: '土匪', templateId: 'bandit', level: 3, stats: { maxHp: 60, attack: 10, defense: 6 }, x: 500, y: 350 },
        { name: '土匪', templateId: 'bandit', level: 3, stats: { maxHp: 60, attack: 10, defense: 6 }, x: 600, y: 350 }
      ],
      // 第四波：饥民围困
      []
    ];
    
    // 第四波特殊处理（圆形包围）
    if (waveIndex === 3) {
      const radius = 150;
      const count = 10;
      for (let i = 0; i < count; i++) {
        const angle = (i / count) * Math.PI * 2;
        const x = 400 + Math.cos(angle) * radius;
        const y = 300 + Math.sin(angle) * radius;
        waves[3].push({
          name: '饥民', templateId: 'starving', level: 2,
          stats: { maxHp: 40, attack: 6, defense: 3 },
          x, y
        });
      }
    }
    
    const waveData = waves[waveIndex] || [];
    for (const enemyData of waveData) {
      const enemy = this.entityFactory.createEnemy({
        name: enemyData.name,
        templateId: enemyData.templateId,
        level: enemyData.level,
        position: { x: enemyData.x, y: enemyData.y },
        stats: enemyData.stats,
        aiType: 'aggressive'
      });
      
      this.entities.push(enemy);
      this.enemyEntities.push(enemy);
    }
    
    console.log(`Act1SceneECS: 生成了 ${waveData.length} 个敌人`);
  }

  /**
   * 更新场景
   */
  update(deltaTime) {
    if (!this.isActive) return;
    
    // 更新相机
    this.camera.update(deltaTime);
    
    // 更新教程阶段
    this.updateTutorialPhase(deltaTime);
    
    // 更新所有实体
    for (const entity of this.entities) {
      entity.update(deltaTime);
    }
    
    // 更新移动系统
    this.movementSystem.update(deltaTime, this.entities);
    
    // 检查火堆碰撞（阻止玩家穿过火堆）
    this.checkCampfireCollision();
    
    // 更新战斗系统
    this.combatSystem.update(deltaTime, this.entities);
    
    // 更新装备系统
    this.equipmentSystem.update(deltaTime, this.entities);
    
    // 更新序章系统
    this.tutorialSystem.update(deltaTime, this.getGameState());
    this.dialogueSystem.update(deltaTime);
    this.questSystem.update(deltaTime);
    
    // 更新战斗特效
    this.combatEffects.update(deltaTime);
    
    // 更新飘动文字
    this.floatingTextManager.update(deltaTime);
    
    // 更新粒子系统
    this.particleSystem.update(deltaTime);
    
    // 更新火焰发射器（底部稳定，顶部形成摆动的火舌）
    if (this.campfire.lit) {
      const time = performance.now() / 1000;
      
      // 更新所有火焰发射器
      this.campfire.emitters.forEach((emitter, index) => {
        if (emitter) {
          // 底部只有很小的随机摆动
          const randomFlicker = (Math.random() - 0.5) * 3;
          emitter.particleConfig.velocity.x = randomFlicker;
          
          // 火焰的垂直速度变化 - 保持向上的跳动
          const baseVelocityY = emitter.particleConfig.velocity.y;
          const verticalFlicker = Math.sin(time * 5 + index) * 10 + (Math.random() - 0.5) * 12;
          emitter.particleConfig.velocity.y = baseVelocityY + verticalFlicker;
          
          this.particleSystem.updateEmitter(emitter, deltaTime);
        }
      });
      
      // 更新烟雾
      if (this.campfire.emitterSmoke) {
        const smokeWave = Math.sin(time * 1.5) * 15 + (Math.random() - 0.5) * 12;
        this.campfire.emitterSmoke.particleConfig.velocity.x = smokeWave;
        this.particleSystem.updateEmitter(this.campfire.emitterSmoke, deltaTime);
      }
    }
    
    // 检查 C 键打开/关闭人物信息面板
    this.checkPlayerInfoToggle();
    
    // 检查 B 键打开/关闭背包
    this.checkInventoryToggle();
    
    // 检查 I 键打开/关闭装备面板
    this.checkEquipmentToggle();
    
    // 更新背包面板
    this.inventoryPanel.update(deltaTime);
    
    // 更新装备面板
    this.equipmentPanel.update(deltaTime);
    
    // 更新人物信息面板
    this.playerInfoPanel.update(deltaTime);
    
    // 处理UI面板的鼠标事件
    let uiHandledClick = false;
    
    if (this.inputManager.isMouseClicked()) {
      const mousePos = this.inputManager.getMousePosition();
      
      // 检查背包面板
      if (this.inventoryPanel.visible) {
        this.inventoryPanel.handleMouseMove(mousePos.x, mousePos.y);
        const button = this.inputManager.getMouseButton() === 2 ? 'right' : 'left';
        const handled = this.inventoryPanel.handleMouseClick(mousePos.x, mousePos.y, button);
        if (handled) {
          uiHandledClick = true;
        }
      }
      
      // 检查装备面板
      if (this.equipmentPanel.visible && !uiHandledClick) {
        this.equipmentPanel.handleMouseMove(mousePos.x, mousePos.y);
        const button = this.inputManager.getMouseButton() === 2 ? 'right' : 'left';
        const handled = this.equipmentPanel.handleMouseClick(mousePos.x, mousePos.y, button);
        if (handled) {
          uiHandledClick = true;
        }
      }
      
      // 检查人物信息面板
      if (this.playerInfoPanel.visible && !uiHandledClick) {
        if (mousePos.x >= this.playerInfoPanel.x && 
            mousePos.x <= this.playerInfoPanel.x + this.playerInfoPanel.width &&
            mousePos.y >= this.playerInfoPanel.y && 
            mousePos.y <= this.playerInfoPanel.y + this.playerInfoPanel.height) {
          uiHandledClick = true;
        }
      }
      
      // 检查教程提示框（HTML元素）
      if (this.tutorialSystem && !uiHandledClick) {
        const tutorialElement = document.getElementById('tutorial-panel');
        if (tutorialElement && !tutorialElement.classList.contains('hidden')) {
          const rect = tutorialElement.getBoundingClientRect();
          const canvas = document.getElementById('gameCanvas');
          const canvasRect = canvas.getBoundingClientRect();
          
          // 将canvas坐标转换为页面坐标
          const pageX = canvasRect.left + mousePos.x;
          const pageY = canvasRect.top + mousePos.y;
          
          if (pageX >= rect.left && pageX <= rect.right &&
              pageY >= rect.top && pageY <= rect.bottom) {
            uiHandledClick = true;
          }
        }
      }
    } else {
      // 即使没有点击，也要更新鼠标悬停状态
      const mousePos = this.inputManager.getMousePosition();
      
      if (this.inventoryPanel.visible) {
        this.inventoryPanel.handleMouseMove(mousePos.x, mousePos.y);
      }
      
      if (this.equipmentPanel.visible) {
        this.equipmentPanel.handleMouseMove(mousePos.x, mousePos.y);
      }
    }
    
    // 如果UI处理了点击，清除鼠标点击状态，防止移动系统响应
    if (uiHandledClick) {
      this.inputManager.mouse.clicked = false;
    }
    
    // 检查拾取
    this.checkPickup();
    
    // 检查点燃火堆
    this.checkCampfire();
    
    // 检查波次完成
    this.checkWaveCompletion();
    
    // 更新场景过渡
    if (this.isTransitioning) {
      this.updateTransition(deltaTime);
    }
    
    // 最后更新输入管理器（清除本帧的输入状态）
    this.inputManager.update();
  }

  /**
   * 更新教程阶段
   */
  updateTutorialPhase(deltaTime) {
    // 移动教程
    if (this.tutorialPhase === 'movement') {
      const transform = this.playerEntity.getComponent('transform');
      if (transform && this.lastPlayerPosition) {
        const dx = transform.position.x - this.lastPlayerPosition.x;
        const dy = transform.position.y - this.lastPlayerPosition.y;
        const distance = Math.sqrt(dx * dx + dy * dy);
        this.playerMovedDistance += distance;
        this.lastPlayerPosition = { x: transform.position.x, y: transform.position.y };
        
        // 完成渐进式提示3: 按WASD移动
        if (this.playerMovedDistance >= 10 && !this.tutorialsCompleted.progressive_tip_3) {
          this.completeTutorial('progressive_tip_3');
          console.log('Act1SceneECS: 完成渐进式提示3 - 按WASD移动');
        }
      }
      
      if (this.playerMovedDistance >= 100 && !this.tutorialsCompleted.movement) {
        this.completeTutorial('movement');
        // 不直接进入拾取教程，等待点燃火堆
        this.tutorialPhase = 'campfire';
        console.log('Act1SceneECS: 等待点燃火堆');
      }
    }
    // 火堆阶段
    else if (this.tutorialPhase === 'campfire') {
      // 等待玩家点燃火堆
      if (this.campfire.lit && !this.tutorialsCompleted.campfire) {
        this.tutorialsCompleted.campfire = true;
        console.log('Act1SceneECS: 火堆已点燃');
        
        // 完成渐进式提示3.5: 点燃火堆
        if (!this.tutorialsCompleted.progressive_tip_3_5) {
          this.completeTutorial('progressive_tip_3_5');
          console.log('Act1SceneECS: 完成渐进式提示3.5 - 点燃火堆');
        }
        
        // 进入拾取教程
        this.startPickupTutorial();
      }
    }
    // 拾取教程
    else if (this.tutorialPhase === 'pickup') {
      const pickedCount = this.pickupItems.filter(item => item.picked).length;
      if (pickedCount > 0 && !this.tutorialsCompleted.pickup) {
        this.completeTutorial('pickup');
        this.startEquipmentTutorial();
      }
    }
    // 装备教程
    else if (this.tutorialPhase === 'equipment') {
      const equipment = this.playerEntity.getComponent('equipment');
      const inventory = this.playerEntity.getComponent('inventory');
      
      // 检查是否装备了武器
      if (equipment && equipment.weapon && !this.tutorialsCompleted.equipment) {
        this.completeTutorial('equipment');
        
        // 完成渐进式提示6: 点击物品装备
        if (!this.tutorialsCompleted.progressive_tip_6) {
          this.completeTutorial('progressive_tip_6');
          console.log('Act1SceneECS: 完成渐进式提示6 - 点击物品装备');
        }
        
        // 检查背包中是否还有残羹
        let hasConsumable = false;
        if (inventory) {
          const items = inventory.getAllItems();
          hasConsumable = items.some(({ slot }) => 
            slot.item.type === 'consumable' && slot.item.id === 'leftover_food'
          );
        }
        
        // 如果有残羹，进入消耗品使用阶段；否则直接进入战斗
        if (hasConsumable) {
          this.tutorialPhase = 'consumable';
          console.log('Act1SceneECS: 进入消耗品使用阶段');
        } else {
          this.startCombatTutorial();
        }
      }
    }
    // 消耗品使用阶段
    else if (this.tutorialPhase === 'consumable') {
      const inventory = this.playerEntity.getComponent('inventory');
      
      // 检查背包中是否还有残羹
      let hasConsumable = false;
      if (inventory) {
        const items = inventory.getAllItems();
        hasConsumable = items.some(({ slot }) => 
          slot.item.type === 'consumable' && slot.item.id === 'leftover_food'
        );
      }
      
      // 如果残羹用完了，进入战斗教程
      if (!hasConsumable && !this.tutorialsCompleted.consumable) {
        this.tutorialsCompleted.consumable = true;
        console.log('Act1SceneECS: 完成消耗品使用阶段');
        
        // 完成渐进式提示8: 使用消耗品
        if (!this.tutorialsCompleted.progressive_tip_8) {
          this.completeTutorial('progressive_tip_8');
          console.log('Act1SceneECS: 完成渐进式提示8 - 使用消耗品');
        }
        
        this.startCombatTutorial();
      }
    }
  }

  /**
   * 检查人物信息面板切换
   */
  checkPlayerInfoToggle() {
    // 使用 isKeyDown 检测 C 键（Character），添加冷却时间防止连续切换
    if (this.inputManager.isKeyDown('c') || this.inputManager.isKeyDown('C')) {
      const now = Date.now();
      if (!this.lastPlayerInfoToggleTime || now - this.lastPlayerInfoToggleTime > 300) {
        const wasVisible = this.playerInfoPanel.visible;
        this.playerInfoPanel.toggle();
        this.lastPlayerInfoToggleTime = now;
        console.log('Act1SceneECS: 切换人物信息面板显示', this.playerInfoPanel.visible);
        
        // 完成渐进式提示1: 按C查看属性（打开面板）
        if (!this.tutorialsCompleted.progressive_tip_1 && this.playerInfoPanel.visible) {
          this.completeTutorial('progressive_tip_1');
          console.log('Act1SceneECS: 完成渐进式提示1 - 按C查看属性');
        }
        
        // 完成渐进式提示2: 按C关闭属性（关闭面板）
        if (!this.tutorialsCompleted.progressive_tip_2 && wasVisible && !this.playerInfoPanel.visible) {
          this.completeTutorial('progressive_tip_2');
          console.log('Act1SceneECS: 完成渐进式提示2 - 按C关闭属性');
        }
      }
    }
  }

  /**
   * 检查背包切换
   */
  checkInventoryToggle() {
    // 使用 isKeyDown 检测 B 键（Bag），添加冷却时间防止连续切换
    if (this.inputManager.isKeyDown('b') || this.inputManager.isKeyDown('B')) {
      const now = Date.now();
      if (!this.lastInventoryToggleTime || now - this.lastInventoryToggleTime > 300) {
        this.inventoryPanel.toggle();
        this.lastInventoryToggleTime = now;
        console.log('Act1SceneECS: 切换背包显示', this.inventoryPanel.visible);
        
        // 完成渐进式提示5: 按B键查看背包
        if (!this.tutorialsCompleted.progressive_tip_5) {
          this.completeTutorial('progressive_tip_5');
          console.log('Act1SceneECS: 完成渐进式提示5 - 按B键查看背包');
        }
      }
    }
  }

  /**
   * 检查装备面板切换
   */
  checkEquipmentToggle() {
    // 使用 isKeyDown 检测 V 键（inVentory），添加冷却时间防止连续切换
    if (this.inputManager.isKeyDown('v') || this.inputManager.isKeyDown('V')) {
      const now = Date.now();
      if (!this.lastEquipmentToggleTime || now - this.lastEquipmentToggleTime > 300) {
        this.equipmentPanel.toggle();
        this.lastEquipmentToggleTime = now;
        console.log('Act1SceneECS: 切换装备面板显示', this.equipmentPanel.visible);
        
        // 完成渐进式提示7: 按V键查看装备
        if (!this.tutorialsCompleted.progressive_tip_7) {
          this.completeTutorial('progressive_tip_7');
          console.log('Act1SceneECS: 完成渐进式提示7 - 按V键查看装备');
        }
      }
    }
  }

  /**
   * 检查拾取
   */
  checkPickup() {
    // 使用 isKeyDown 而不是 isKeyPressed，因为 isKeyPressed 在帧开始时已被清除
    if (!this.inputManager.isKeyDown('e') && !this.inputManager.isKeyDown('E')) return;
    
    const transform = this.playerEntity.getComponent('transform');
    if (!transform) return;
    
    const playerX = transform.position.x;
    const playerY = transform.position.y;
    
    // 防止连续拾取，添加冷却时间
    const now = Date.now();
    if (this.lastPickupTime && now - this.lastPickupTime < 300) return;
    
    for (const item of this.pickupItems) {
      if (item.picked) continue;
      
      const dx = item.x - playerX;
      const dy = item.y - playerY;
      const distance = Math.sqrt(dx * dx + dy * dy);
      
      if (distance <= 50) {
        this.pickupItem(item);
        this.lastPickupTime = now;
        break;
      }
    }
  }

  /**
   * 检查点燃火堆
   */
  checkCampfire() {
    // 如果火堆已点燃，不再检查
    if (this.campfire.lit) return;
    
    // 使用 isKeyDown 检测 E 键
    if (!this.inputManager.isKeyDown('e') && !this.inputManager.isKeyDown('E')) return;
    
    const transform = this.playerEntity.getComponent('transform');
    if (!transform) return;
    
    const playerX = transform.position.x;
    const playerY = transform.position.y;
    
    // 计算玩家与火堆的距离
    const dx = this.campfire.x - playerX;
    const dy = this.campfire.y - playerY;
    const distance = Math.sqrt(dx * dx + dy * dy);
    
    // 如果玩家靠近火堆（距离小于60），点燃火堆
    if (distance <= 60) {
      this.lightCampfire();
    }
  }

  /**
   * 检查火堆碰撞（阻止玩家穿过火堆）
   */
  checkCampfireCollision() {
    const transform = this.playerEntity.getComponent('transform');
    if (!transform) return;
    
    const playerX = transform.position.x;
    const playerY = transform.position.y;
    
    // 计算玩家与火堆中心的距离
    const dx = this.campfire.x - playerX;
    const dy = this.campfire.y - playerY;
    const distance = Math.sqrt(dx * dx + dy * dy);
    
    // 火堆的碰撞半径（比视觉效果稍小）
    const collisionRadius = 30;
    
    // 如果玩家进入火堆的碰撞范围
    if (distance < collisionRadius) {
      // 计算推开的方向（从火堆中心指向玩家）
      const angle = Math.atan2(dy, dx);
      
      // 将玩家推到碰撞半径边缘
      transform.position.x = this.campfire.x - Math.cos(angle) * collisionRadius;
      transform.position.y = this.campfire.y - Math.sin(angle) * collisionRadius;
    }
  }

  /**
   * 点燃火堆
   */
  lightCampfire() {
    if (this.campfire.lit) return;
    
    console.log('Act1SceneECS: 点燃火堆');
    this.campfire.lit = true;
    
    // 创建火焰粒子发射器 - 减少密度，增加变化，形成火舌效果
    // 火堆中心和周围的木材位置
    const firePoints = [
      { x: this.campfire.x, y: this.campfire.y },           // 中心
      { x: this.campfire.x - 12, y: this.campfire.y + 8 },  // 左侧木材
      { x: this.campfire.x + 12, y: this.campfire.y + 8 },  // 右侧木材
      { x: this.campfire.x - 6, y: this.campfire.y - 3 },   // 左上木材
      { x: this.campfire.x + 6, y: this.campfire.y - 3 }    // 右上木材
    ];
    
    // 为每个火点创建发射器
    this.campfire.emitters = [];
    
    firePoints.forEach((point, index) => {
      // 亮黄色核心（最内层，小而亮）
      this.campfire.emitters.push(this.particleSystem.createEmitter({
        position: { x: point.x, y: point.y },
        rate: 6, // 减少发射速率
        duration: Infinity,
        particleConfig: {
          position: { x: point.x, y: point.y },
          velocity: { x: 0, y: -80 }, // 更快的上升
          life: 0.5, // 更短的生命
          size: 6,
          color: '#ffffcc', // 非常亮的黄白色
          alpha: 1.0,
          gravity: -50,
          friction: 0.88
        }
      }));
      
      // 橙黄色火焰（中层，中等大小）
      this.campfire.emitters.push(this.particleSystem.createEmitter({
        position: { x: point.x, y: point.y },
        rate: 5,
        duration: Infinity,
        particleConfig: {
          position: { x: point.x, y: point.y },
          velocity: { x: 0, y: -70 },
          life: 0.7,
          size: 10,
          color: '#ffbb33', // 亮橙黄色
          alpha: 0.95,
          gravity: -45,
          friction: 0.86
        }
      }));
      
      // 橙红色火焰（外层，大）
      this.campfire.emitters.push(this.particleSystem.createEmitter({
        position: { x: point.x, y: point.y },
        rate: 4,
        duration: Infinity,
        particleConfig: {
          position: { x: point.x, y: point.y },
          velocity: { x: 0, y: -60 },
          life: 0.9,
          size: 14,
          color: '#ff7722', // 橙红色
          alpha: 0.85,
          gravity: -40,
          friction: 0.84
        }
      }));
      
      // 深红色火焰边缘（最外层，最大）
      this.campfire.emitters.push(this.particleSystem.createEmitter({
        position: { x: point.x, y: point.y },
        rate: 3,
        duration: Infinity,
        particleConfig: {
          position: { x: point.x, y: point.y },
          velocity: { x: 0, y: -50 },
          life: 1.1,
          size: 18,
          color: '#dd3311', // 深红色
          alpha: 0.7,
          gravity: -35,
          friction: 0.82
        }
      }));
    });
    
    // 烟雾效果（从火堆上方发射）
    this.campfire.emitterSmoke = this.particleSystem.createEmitter({
      position: { x: this.campfire.x, y: this.campfire.y - 40 },
      rate: 5,
      duration: Infinity,
      particleConfig: {
        position: { x: this.campfire.x, y: this.campfire.y - 40 },
        velocity: { x: 0, y: -30 },
        life: 2.5,
        size: 16,
        color: '#444444', // 深灰色烟雾
        alpha: 0.15,
        gravity: -10,
        friction: 0.98
      }
    });
    
    console.log('Act1SceneECS: 火焰粒子发射器已创建（火舌效果）');
  }

  /**
   * 检查波次完成
   */
  checkWaveCompletion() {
    if (this.tutorialPhase !== 'combat') return;
    
    const aliveEnemies = this.enemyEntities.filter(enemy => {
      const stats = enemy.getComponent('stats');
      return stats && stats.hp > 0;
    });
    
    if (aliveEnemies.length === 0 && this.enemyEntities.length > 0) {
      console.log(`Act1SceneECS: 第${this.combatWave + 1}波完成`);
      
      if (this.combatWave === 0) {
        setTimeout(() => this.spawnCombatWave(1), 2000);
      } else if (this.combatWave === 1) {
        setTimeout(() => this.spawnCombatWave(2), 2000);
      } else if (this.combatWave === 2) {
        this.tutorialsCompleted.combat = true;
        setTimeout(() => this.spawnCombatWave(3), 2000);
      } else if (this.combatWave === 3) {
        // 饥民围困后触发死亡
        setTimeout(() => this.triggerPlayerDeath(), 5000);
      }
    }
  }

  /**
   * 完成教程
   */
  completeTutorial(tutorialId) {
    console.log(`Act1SceneECS: 完成教程 - ${tutorialId}`);
    this.tutorialsCompleted[tutorialId] = true;
    this.tutorialSystem.completeTutorial();
  }

  /**
   * 触发玩家死亡
   */
  triggerPlayerDeath() {
    if (this.playerDied) return;
    
    console.log('Act1SceneECS: 触发玩家死亡');
    this.playerDied = true;
    
    const stats = this.playerEntity.getComponent('stats');
    if (stats) {
      stats.hp = 0;
    }
    
    setTimeout(() => this.startTransition(), 1000);
  }

  /**
   * 开始场景过渡
   */
  startTransition() {
    console.log('Act1SceneECS: 开始场景过渡');
    this.isTransitioning = true;
    this.transitionPhase = 'fade_out';
    this.transitionTimer = 0;
    this.transitionAlpha = 0;
  }

  /**
   * 更新场景过渡
   */
  updateTransition(deltaTime) {
    this.transitionTimer += deltaTime;
    
    if (this.transitionPhase === 'fade_out') {
      this.transitionAlpha = Math.min(1, this.transitionTimer / this.transitionDuration);
      if (this.transitionAlpha >= 1) {
        this.transitionPhase = 'show_text';
        this.transitionTimer = 0;
      }
    } else if (this.transitionPhase === 'show_text') {
      if (this.transitionTimer >= this.textDisplayDuration) {
        this.transitionPhase = 'switch_scene';
        this.switchToNextScene();
      }
    }
  }

  /**
   * 切换到下一幕
   */
  switchToNextScene() {
    console.log('Act1SceneECS: 切换到第二幕');
    // 这里应该调用 SceneManager 切换场景
    // sceneManager.switchScene('Act2Scene', { player: this.playerEntity });
  }

  /**
   * 获取游戏状态
   */
  getGameState() {
    return {
      tutorialPhase: this.tutorialPhase,
      playerMovedDistance: this.playerMovedDistance,
      pickupItems: this.pickupItems,
      tutorialsCompleted: this.tutorialsCompleted
    };
  }

  /**
   * 渲染场景
   */
  render(ctx) {
    // 不调用 super.render(ctx)，因为我们使用不同的实体管理方式
    
    // 使用渲染系统渲染所有实体
    this.renderSystem.render(this.entities);
    
    // 渲染可拾取物品
    this.renderPickupItems(ctx);
    
    // 渲染火堆
    this.renderCampfire(ctx);
    
    // 渲染粒子系统
    this.particleSystem.render(ctx, this.camera);
    
    // 渲染战斗特效
    this.combatEffects.render();
    
    // 渲染飘动文字
    this.floatingTextManager.render(ctx, this.camera);
    
    // 渲染教程系统
    if (this.tutorialSystem) {
      this.tutorialSystem.render(ctx);
    }
    
    // 渲染对话系统
    if (this.dialogueSystem) {
      this.dialogueSystem.render(ctx);
    }
    
    // 渲染任务系统
    if (this.questSystem) {
      this.questSystem.render(ctx);
    }
    
    // 渲染人物信息面板
    if (this.playerInfoPanel) {
      this.playerInfoPanel.render(ctx);
    }
    
    // 渲染装备面板
    if (this.equipmentPanel) {
      this.equipmentPanel.render(ctx);
    }
    
    // 渲染背包面板
    if (this.inventoryPanel) {
      this.inventoryPanel.render(ctx);
    }
    
    // 渲染场景过渡
    if (this.isTransitioning) {
      this.renderTransition(ctx);
    }
  }

  /**
   * 渲染可拾取物品
   */
  renderPickupItems(ctx) {
    ctx.save();
    
    for (const item of this.pickupItems) {
      if (item.picked) continue;
      
      // 转换为屏幕坐标
      const screenPos = this.camera.worldToScreen(item.x, item.y);
      
      // 绘制物品图标
      ctx.fillStyle = '#ffaa00';
      ctx.beginPath();
      ctx.arc(screenPos.x, screenPos.y, 10, 0, Math.PI * 2);
      ctx.fill();
      
      // 绘制物品名称
      ctx.fillStyle = '#ffffff';
      ctx.font = '12px Arial';
      ctx.textAlign = 'center';
      ctx.fillText(item.name, screenPos.x, screenPos.y - 15);
    }
    
    ctx.restore();
  }

  /**
   * 渲染火堆
   */
  renderCampfire(ctx) {
    ctx.save();
    
    // 转换为屏幕坐标
    const screenPos = this.camera.worldToScreen(this.campfire.x, this.campfire.y);
    
    if (!this.campfire.lit) {
      // 渲染熄灭的火堆 - 木材堆
      // 绘制底部的灰烬圆圈
      ctx.fillStyle = '#3a3a3a';
      ctx.beginPath();
      ctx.arc(screenPos.x, screenPos.y, 25, 0, Math.PI * 2);
      ctx.fill();
      
      // 绘制木材（5根木棍交叉堆放）
      ctx.strokeStyle = '#5a4a3a';
      ctx.lineWidth = 6;
      ctx.lineCap = 'round';
      
      // 木材1 - 左下到右上
      ctx.beginPath();
      ctx.moveTo(screenPos.x - 20, screenPos.y + 10);
      ctx.lineTo(screenPos.x + 20, screenPos.y - 10);
      ctx.stroke();
      
      // 木材2 - 右下到左上
      ctx.beginPath();
      ctx.moveTo(screenPos.x + 20, screenPos.y + 10);
      ctx.lineTo(screenPos.x - 20, screenPos.y - 10);
      ctx.stroke();
      
      // 木材3 - 水平
      ctx.beginPath();
      ctx.moveTo(screenPos.x - 18, screenPos.y);
      ctx.lineTo(screenPos.x + 18, screenPos.y);
      ctx.stroke();
      
      // 木材4 - 左侧斜
      ctx.strokeStyle = '#4a3a2a';
      ctx.beginPath();
      ctx.moveTo(screenPos.x - 15, screenPos.y + 8);
      ctx.lineTo(screenPos.x - 5, screenPos.y - 12);
      ctx.stroke();
      
      // 木材5 - 右侧斜
      ctx.beginPath();
      ctx.moveTo(screenPos.x + 15, screenPos.y + 8);
      ctx.lineTo(screenPos.x + 5, screenPos.y - 12);
      ctx.stroke();
      
      // 绘制提示文字
      ctx.fillStyle = '#ffffff';
      ctx.font = 'bold 14px Arial';
      ctx.textAlign = 'center';
      ctx.shadowColor = '#000000';
      ctx.shadowBlur = 4;
      ctx.fillText('熄灭的火堆', screenPos.x, screenPos.y - 40);
      ctx.fillText('按 E 点燃', screenPos.x, screenPos.y - 25);
      ctx.shadowBlur = 0;
    } else {
      // 渲染点燃的火堆
      // 绘制燃烧的木材底座（深棕色）
      ctx.strokeStyle = '#3a2a1a';
      ctx.lineWidth = 8;
      ctx.lineCap = 'round';
      
      // 木材轮廓（简化，因为火焰会覆盖大部分）
      ctx.beginPath();
      ctx.moveTo(screenPos.x - 20, screenPos.y + 10);
      ctx.lineTo(screenPos.x + 20, screenPos.y - 10);
      ctx.stroke();
      
      ctx.beginPath();
      ctx.moveTo(screenPos.x + 20, screenPos.y + 10);
      ctx.lineTo(screenPos.x - 20, screenPos.y - 10);
      ctx.stroke();
      
      // 绘制火堆底部的发光效果（大范围）
      const gradient = ctx.createRadialGradient(screenPos.x, screenPos.y, 0, screenPos.x, screenPos.y, 60);
      gradient.addColorStop(0, 'rgba(255, 200, 0, 0.4)');
      gradient.addColorStop(0.5, 'rgba(255, 100, 0, 0.2)');
      gradient.addColorStop(1, 'rgba(255, 50, 0, 0)');
      ctx.fillStyle = gradient;
      ctx.beginPath();
      ctx.arc(screenPos.x, screenPos.y, 60, 0, Math.PI * 2);
      ctx.fill();
      
      // 绘制火堆中心的亮光
      const centerGlow = ctx.createRadialGradient(screenPos.x, screenPos.y, 0, screenPos.x, screenPos.y, 20);
      centerGlow.addColorStop(0, 'rgba(255, 255, 200, 0.6)');
      centerGlow.addColorStop(0.5, 'rgba(255, 150, 0, 0.3)');
      centerGlow.addColorStop(1, 'rgba(255, 100, 0, 0)');
      ctx.fillStyle = centerGlow;
      ctx.beginPath();
      ctx.arc(screenPos.x, screenPos.y, 20, 0, Math.PI * 2);
      ctx.fill();
    }
    
    ctx.restore();
  }

  /**
   * 渲染场景过渡
   */
  renderTransition(ctx) {
    ctx.save();
    ctx.fillStyle = `rgba(0, 0, 0, ${this.transitionAlpha})`;
    ctx.fillRect(0, 0, ctx.canvas.width, ctx.canvas.height);
    
    if (this.transitionPhase === 'show_text') {
      ctx.fillStyle = '#ffffff';
      ctx.font = 'bold 48px Arial';
      ctx.textAlign = 'center';
      ctx.fillText('你死了...', ctx.canvas.width / 2, ctx.canvas.height / 2 - 30);
      
      ctx.font = '24px Arial';
      ctx.fillText('但这不是结局', ctx.canvas.width / 2, ctx.canvas.height / 2 + 30);
    }
    
    ctx.restore();
  }

  /**
   * 场景退出
   */
  exit() {
    super.exit();
    
    // 清理系统
    if (this.inputManager) {
      this.inputManager.destroy();
    }
    
    this.tutorialSystem.cleanup();
    
    // 清理实体
    for (const entity of this.entities) {
      entity.destroy();
    }
    this.entities = [];
    
    console.log('Act1SceneECS: 退出场景');
  }
}
