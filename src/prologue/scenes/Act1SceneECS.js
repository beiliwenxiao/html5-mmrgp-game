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
import UIClickHandler from '../../core/UIClickHandler.js';
import { Camera } from '../../rendering/Camera.js';
import { CombatSystem } from '../../systems/CombatSystem.js';
import { MovementSystem } from '../../systems/MovementSystem.js';
import { EquipmentSystem } from '../../systems/EquipmentSystem.js';
import { AISystem } from '../../systems/AISystem.js';
import { TutorialSystem } from '../../systems/TutorialSystem.js';
import { DialogueSystem } from '../../systems/DialogueSystem.js';
import { QuestSystem } from '../../systems/QuestSystem.js';
import { RenderSystem } from '../../rendering/RenderSystem.js';
import { CombatEffects } from '../../rendering/CombatEffects.js';
import { SkillEffects } from '../../rendering/SkillEffects.js';
import { InventoryPanel } from '../../ui/InventoryPanel.js';
import { TutorialConfig } from '../config/TutorialConfig.js';
import { TutorialConditions } from '../conditions/TutorialConditions.js';
import { ProgressiveTipsConfig } from '../config/ProgressiveTipsConfig.js';
import { ProgressiveTipsConditions } from '../conditions/ProgressiveTipsConditions.js';
import { PlayerInfoPanel } from '../../ui/PlayerInfoPanel.js';
import { EquipmentPanel } from '../../ui/EquipmentPanel.js';
import { FloatingTextManager } from '../../ui/FloatingText.js';
import { ParticleSystem } from '../../rendering/ParticleSystem.js';
import { Entity } from '../../ecs/Entity.js';
import { TransformComponent } from '../../ecs/components/TransformComponent.js';
import { SpriteComponent } from '../../ecs/components/SpriteComponent.js';
import { NameComponent } from '../../ecs/components/NameComponent.js';

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
    this.aiSystem = null;
    this.renderSystem = null;
    this.combatEffects = null;
    this.skillEffects = null;
    this.uiClickHandler = new UIClickHandler();  // UI 点击处理器
    
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
    
    // 装备物品（第二批出现）
    this.equipmentItems = [];
    
    // 火堆
    this.campfire = {
      x: 350,
      y: 250,
      lit: false,
      emitters: [], // 多个火焰发射器
      emitterSmoke: null,
      fireImage: null, // 火焰图片
      imageLoaded: false,
      // 帧动画配置（图片：658x712px，4列3行，共12帧）
      frameWidth: 658 / 4,     // 每帧宽度：164.5px
      frameHeight: 712 / 3,    // 每帧高度：237.33px
      frameCols: 4,            // 列数
      frameRows: 3,            // 行数
      frameCount: 12,          // 总帧数
      currentFrame: 0,         // 当前帧
      frameTime: 0,            // 帧计时器
      frameDuration: 0.16      // 每帧持续时间（秒），6.25 FPS
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
    this.combatEffects = new CombatEffects(this.particleSystem);
    
    // 初始化技能特效
    this.skillEffects = new SkillEffects(this.particleSystem);
    
    // 初始化游戏系统
    this.combatSystem = new CombatSystem({
      inputManager: this.inputManager,
      camera: this.camera,
      skillEffects: this.skillEffects
    });
    
    // 设置掉落回调
    this.combatSystem.setLootDropCallback((position, lootItems) => {
      this.spawnLootItems(position, lootItems);
    });
    
    this.movementSystem = new MovementSystem({
      inputManager: this.inputManager
    });
    
    this.equipmentSystem = new EquipmentSystem();
    
    // 初始化AI系统
    this.aiSystem = new AISystem();
    
    // 初始化 UI 面板
    // 角色信息面板 - 最左侧
    this.playerInfoPanel = new PlayerInfoPanel({
      x: 10,
      y: 10,
      width: 280,
      height: 320,
      visible: false  // 默认隐藏，按 C 键打开
    });
    
    // 装备面板 - 角色信息面板下方
    this.equipmentPanel = new EquipmentPanel({
      x: 10,
      y: 340,  // 角色信息面板下方（10 + 320 + 10）
      width: 280,  // 与角色信息面板同宽
      height: 250,  // 缩短高度
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
    
    // 注册所有 UI 元素到 UIClickHandler
    this.uiClickHandler.registerElement(this.inventoryPanel);
    this.uiClickHandler.registerElement(this.equipmentPanel);
    this.uiClickHandler.registerElement(this.playerInfoPanel);
    
    // 创建玩家实体
    this.createPlayerEntity();
    
    // 注册教程
    this.registerTutorials();
    
    // 加载火焰gif图片
    this.loadFireImage();
    
    // 显示角色创建
    this.showCharacterCreation();
    
    console.log('Act1SceneECS: 进入第一幕 - 绝望的开始（完整 ECS 版本）');
  }

  /**
   * 加载火焰图片
   */
  loadFireImage() {
    this.campfire.fireImage = new Image();
    this.campfire.fireImage.onload = () => {
      this.campfire.imageLoaded = true;
      console.log('Act1SceneECS: 火焰图片加载成功');
    };
    this.campfire.fireImage.onerror = () => {
      console.warn('Act1SceneECS: 火焰图片加载失败，将使用粒子效果');
      this.campfire.imageLoaded = false;
    };
    // 使用本地火焰图片
    this.campfire.fireImage.src = 'images/fire.webp';
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
        // 基础属性
        maxHp: 150,
        hp: 45, // 30% 生命值
        maxMp: 100,
        mp: 100,
        
        // 攻击属性
        attack: 15,
        magicPower: 12,
        attackSpeed: 1.0, // 每秒攻击次数
        critRate: 0.05, // 暴击率 5%
        critDamage: 1.5, // 暴击伤害倍率
        
        // 防御属性
        defense: 8,
        magicResist: 5,
        dodge: 0.05, // 闪避率 5%
        block: 0.03, // 格挡率 3%
        
        // 移动属性
        speed: 120,
        
        // 恢复属性
        hpRegen: 0.5, // 每秒恢复生命值
        mpRegen: 1.0  // 每秒恢复魔法值
      },
      skills: [
        {
          id: 'basic_attack',
          name: '普通攻击',
          type: 'physical',
          damage: 15,
          manaCost: 0,
          cooldown: 1.0,
          range: 150,
          effectType: 'melee',
          description: '靠近自动攻击，鼠标可切换目标',
          hotkey: '1',
          isAutoAttack: true // 标记为自动攻击
        },
        {
          id: 'fireball',
          name: '火球术',
          type: 'magic',
          damage: 45,
          manaCost: 15,
          cooldown: 2.0,
          range: 500,
          aoeRadius: 100, // AOE范围
          effectType: 'fireball',
          projectileSpeed: 450,
          description: '发射炽热的火球，造成范围火焰伤害',
          hotkey: '2'
        },
        {
          id: 'ice_lance',
          name: '寒冰箭',
          type: 'magic',
          damage: 40,
          manaCost: 12,
          cooldown: 1.8,
          range: 550,
          aoeRadius: 80, // AOE范围
          effectType: 'ice_lance',
          projectileSpeed: 500,
          description: '发射寒冰箭，冻结范围内敌人',
          hotkey: '3'
        },
        {
          id: 'flame_burst',
          name: '烈焰爆发',
          type: 'magic',
          damage: 65,
          manaCost: 25,
          cooldown: 4.0,
          range: 450,
          aoeRadius: 150, // AOE范围
          effectType: 'flame_burst',
          projectileSpeed: 400,
          description: '释放强大的火焰能量，造成大范围伤害',
          hotkey: '4'
        }
      ],
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
    
    // 不立即开始移动教程，等待按任意键
  }

  /**
   * 渐进式提示配置
   * 使用配置文件和条件判断器
   */
  getProgressiveTipsConfig() {
    const tips = [];
    
    // 遍历渐进式提示配置
    for (const tipId in ProgressiveTipsConfig) {
      const config = ProgressiveTipsConfig[tipId];
      
      tips.push({
        id: config.id,
        title: config.title,
        description: config.description,
        text: config.text,
        position: config.position,
        priority: config.priority,
        triggerCondition: () => {
          return ProgressiveTipsConditions.evaluate(
            config.triggerConditionId,
            this
          );
        }
      });
    }
    
    return tips;
  }

  /**
   * 基础教程配置
   * 使用配置文件和条件判断器
   */
  getBasicTutorialsConfig() {
    const tutorials = [];
    
    // 遍历教程配置
    for (const tutorialId in TutorialConfig) {
      const config = TutorialConfig[tutorialId];
      
      tutorials.push({
        id: config.id,
        title: config.title,
        description: config.description,
        steps: config.steps,
        priority: config.priority,
        triggerCondition: () => {
          return TutorialConditions.evaluate(
            config.triggerConditionId,
            this,
            this.getGameState()
          );
        },
        completionCondition: () => {
          return TutorialConditions.evaluate(
            config.completionConditionId,
            this,
            this.getGameState()
          );
        }
      });
    }
    
    return tutorials;
  }

  /**
   * 注册教程（仅渐进式提示）
   */
  registerTutorials() {
    // 只注册渐进式提示，不注册基础教程
    const progressiveTips = this.getProgressiveTipsConfig();
    for (const tip of progressiveTips) {
      this.tutorialSystem.registerTutorial(tip.id, {
        title: tip.title,
        description: tip.description,
        steps: [{ text: tip.text, position: tip.position }],
        triggerCondition: tip.triggerCondition,
        pauseGame: false,
        canSkip: false,
        priority: tip.priority,
        autoTrigger: true
      });
    }
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
   * 生成可拾取物品（第一批：只有残羹）
   */
  spawnPickupItems() {
    const items = [
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
    
    console.log('Act1SceneECS: 生成第一批拾取物品（残羹）', this.pickupItems);
  }

  /**
   * 生成装备物品（第二批：武器和护甲）
   */
  spawnEquipmentItems() {
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
      }
    ];
    
    for (const item of items) {
      this.equipmentItems.push({
        ...item,
        picked: false
      });
    }
    
    console.log('Act1SceneECS: 生成第二批拾取物品（装备）', this.equipmentItems);
  }

  /**
   * 拾取物品（支持两个数组）
   */
  pickupItem(item, fromEquipmentItems = false) {
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
      if (item.stats) itemData.stats = { ...itemData.stats, ...item.stats };
      
      inventory.addItem(itemData);
      console.log('Act1SceneECS: 物品已添加到背包', itemData);
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
      
      // 调试：检查名字组件
      const nameComp = enemy.getComponent('name');
      console.log(`创建敌人: ${enemy.name}, 名字组件:`, nameComp);
      
      this.entities.push(enemy);
      this.enemyEntities.push(enemy);
      
      // 注册AI控制器（让敌人主动攻击）
      this.aiSystem.registerAI(enemy, 'aggressive');
    }
    
    console.log(`Act1SceneECS: 生成了 ${waveData.length} 个敌人，已注册AI`);
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
    
    // ===== UI 点击处理（必须在 MovementSystem 之前） =====
    // 处理 UI 面板的鼠标事件
    if (this.inputManager.isMouseClicked() && !this.inputManager.isMouseClickHandled()) {
      const mousePos = this.inputManager.getMousePosition();
      const button = this.inputManager.getMouseButton() === 2 ? 'right' : 'left';
      
      // 使用 UIClickHandler 检查 UI 是否处理了点击
      const uiHandled = this.uiClickHandler.handleClick(mousePos.x, mousePos.y, button);
      
      if (uiHandled) {
        // UI 处理了点击，标记为已处理
        this.inputManager.markMouseClickHandled();
      } else {
        // 检查教程提示框（HTML元素）
        if (this.tutorialSystem) {
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
              // 教程提示框处理了点击
              this.inputManager.markMouseClickHandled();
            }
          }
        }
      }
    }
    
    // 更新移动系统
    this.movementSystem.update(deltaTime, this.entities);
    
    // 检查火堆碰撞（阻止玩家穿过火堆）
    this.checkCampfireCollision();
    
    // 处理敌人选中（鼠标点击）
    if (this.inputManager.isMouseClicked() && !this.inputManager.isMouseClickHandled()) {
      const mouseWorldPos = this.inputManager.getMouseWorldPosition(this.camera);
      const clickedEnemy = this.combatSystem.findEnemyAtPosition(mouseWorldPos, this.entities);
      
      if (clickedEnemy) {
        this.combatSystem.selectTarget(clickedEnemy);
        console.log('选中敌人:', clickedEnemy.id);
      } else {
        // 点击空白处取消选中
        this.combatSystem.selectTarget(null);
      }
    }
    
    // 自动攻击逻辑
    if (this.combatSystem.selectedTarget && this.playerEntity) {
      const skills = this.playerEntity.getComponent('skills');
      if (skills) {
        // 找到自动攻击技能（普通攻击）
        const autoAttackSkill = skills.skills.find(s => s.isAutoAttack);
        if (autoAttackSkill) {
          // 检查冷却
          const cooldownRemaining = skills.getCooldownRemaining(autoAttackSkill.id);
          if (cooldownRemaining <= 0) {
            // 尝试使用自动攻击
            this.combatSystem.useSkill(this.playerEntity, autoAttackSkill.id, this.combatSystem.selectedTarget);
          }
        }
      }
    }
    
    // 更新AI系统（敌人AI）
    this.aiSystem.update(deltaTime, this.entities, this.combatSystem);
    
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
    
    // 更新技能特效
    this.skillEffects.update(deltaTime);
    
    // 更新飘动文字
    this.floatingTextManager.update(deltaTime);
    
    // 更新粒子系统
    this.particleSystem.update(deltaTime);
    
    // 更新火焰帧动画
    if (this.campfire.lit && this.campfire.imageLoaded) {
      this.campfire.frameTime += deltaTime;
      if (this.campfire.frameTime >= this.campfire.frameDuration) {
        this.campfire.frameTime = 0;
        this.campfire.currentFrame = (this.campfire.currentFrame + 1) % this.campfire.frameCount;
      }
    }
    
    // 更新火焰粒子效果
    if (this.campfire.lit) {
      const time = performance.now() / 1000;
      
      // 更新所有火焰发射器（只有1个发射点，7个发射器）
      this.campfire.emitters.forEach((emitter, index) => {
        if (emitter) {
          // 前两个发射器（大火焰粒子）使用更大的摆动幅度
          let swayAmount;
          if (index < 2) {
            // 大火焰粒子：随机摆动幅度5px
            swayAmount = (Math.random() - 0.5) * 10;  // ±5px
          } else {
            // 其他粒子：原有的摆动
            swayAmount = Math.sin(time * 2 + index * 0.5) * 4 + (Math.random() - 0.5) * 2;
          }
          
          // 更新发射器位置（基于原始位置摆动）
          const baseX = this.campfire.x;
          const baseY = this.campfire.y + 2;  // 向上移动8像素
          
          emitter.position.x = baseX + swayAmount;
          emitter.position.y = baseY;
          
          // 添加轻微的水平随机速度
          emitter.particleConfig.velocity.x = (Math.random() - 0.5) * 10;
          
          this.particleSystem.updateEmitter(emitter, deltaTime);
        }
      });
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
    
    // 更新鼠标悬停状态（即使没有点击也需要更新）
    const mousePos = this.inputManager.getMousePosition();
    
    if (this.inventoryPanel.visible) {
      this.inventoryPanel.handleMouseMove(mousePos.x, mousePos.y);
    }
    
    if (this.equipmentPanel.visible) {
      this.equipmentPanel.handleMouseMove(mousePos.x, mousePos.y);
    }
    
    // 检查拾取
    this.checkPickup();
    
    // 检查点燃火堆
    this.checkCampfire();
    
    // 调试：检查E键状态
    if (this.inputManager.isKeyDown('e') || this.inputManager.isKeyDown('E')) {
      console.log('Act1SceneECS: E键被检测到');
    }
    
    // 检查波次完成
    this.checkWaveCompletion();
    
    // 移除死亡的实体
    this.removeDeadEntities();
    
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
    // 阶段1: 按任意键继续
    if (this.tutorialPhase === 'character_creation') {
      // 检测任意键按下
      if (this.inputManager.isAnyKeyPressed()) {
        if (!this.tutorialsCompleted.progressive_tip_1) {
          this.completeTutorial('progressive_tip_1');
          console.log('Act1SceneECS: 完成tip_1，进入移动阶段');
          // 进入移动阶段，tip_2会自动触发
          this.startMovementTutorial();
        }
      }
    }
    // 阶段2: 移动教程
    else if (this.tutorialPhase === 'movement') {
      const transform = this.playerEntity.getComponent('transform');
      if (transform && this.lastPlayerPosition) {
        const dx = transform.position.x - this.lastPlayerPosition.x;
        const dy = transform.position.y - this.lastPlayerPosition.y;
        const distance = Math.sqrt(dx * dx + dy * dy);
        this.playerMovedDistance += distance;
        this.lastPlayerPosition = { x: transform.position.x, y: transform.position.y };
        
        // 完成tip_2: 移动
        if (this.playerMovedDistance >= 10 && !this.tutorialsCompleted.progressive_tip_2) {
          this.completeTutorial('progressive_tip_2');
          console.log('Act1SceneECS: 完成tip_2 - 移动');
        }
      }
      
      if (this.playerMovedDistance >= 100 && !this.tutorialsCompleted.movement) {
        this.completeTutorial('movement');
        this.tutorialPhase = 'campfire';
        console.log('Act1SceneECS: 等待点燃火堆');
      }
    }
    // 阶段3: 火堆阶段
    else if (this.tutorialPhase === 'campfire') {
      if (this.campfire.lit && !this.tutorialsCompleted.campfire) {
        this.tutorialsCompleted.campfire = true;
        console.log('Act1SceneECS: 火堆已点燃');
        
        // 完成tip_3: 点燃火堆
        if (!this.tutorialsCompleted.progressive_tip_3) {
          this.completeTutorial('progressive_tip_3');
          console.log('Act1SceneECS: 完成tip_3 - 点燃火堆');
        }
        
        // 生成第一批物品（残羹）
        this.startPickupTutorial();
      }
    }
    // 阶段4: 拾取教程（第一批：残羹）
    else if (this.tutorialPhase === 'pickup') {
      const pickedCount = this.pickupItems.filter(item => item.picked).length;
      if (pickedCount >= 1 && !this.tutorialsCompleted.pickup) {
        this.completeTutorial('pickup');
        
        // 完成tip_4: 拾取物品
        if (!this.tutorialsCompleted.progressive_tip_4) {
          this.completeTutorial('progressive_tip_4');
          console.log('Act1SceneECS: 完成tip_4 - 拾取物品');
        }
        
        // tip_5会自动触发，不在这里手动完成
        // 进入背包查看阶段
        this.tutorialPhase = 'view_inventory';
        console.log('Act1SceneECS: 进入背包查看阶段');
      }
    }
    // 阶段4.5: 背包查看阶段
    else if (this.tutorialPhase === 'view_inventory') {
      // 等待玩家打开背包后进入查看属性阶段
      if (this.tutorialsCompleted.progressive_tip_5) {
        this.tutorialPhase = 'view_stats';
        console.log('Act1SceneECS: 进入查看属性阶段');
      }
    }
    // 阶段5: 查看属性阶段
    else if (this.tutorialPhase === 'view_stats') {
      // 等待玩家查看属性后进入消耗品使用阶段
      if (this.tutorialsCompleted.progressive_tip_6) {
        this.tutorialPhase = 'consumable';
        console.log('Act1SceneECS: 进入消耗品使用阶段');
      }
    }
    // 阶段6: 消耗品使用阶段
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
      
      // 如果残羹用完了，进入关闭面板阶段
      if (!hasConsumable && !this.tutorialsCompleted.consumable) {
        this.tutorialsCompleted.consumable = true;
        console.log('Act1SceneECS: 完成消耗品使用阶段');
        
        // 完成tip_7: 使用消耗品
        if (!this.tutorialsCompleted.progressive_tip_7) {
          this.completeTutorial('progressive_tip_7');
          console.log('Act1SceneECS: 完成tip_7 - 使用消耗品');
        }
        
        // 进入关闭面板阶段，等待 tip_7_1 完成
        this.tutorialPhase = 'close_panels';
        console.log('Act1SceneECS: 进入关闭面板阶段');
      }
    }
    // 阶段6.5: 关闭面板阶段
    else if (this.tutorialPhase === 'close_panels') {
      // 检查两个面板是否都已关闭
      const bothPanelsClosed = !this.playerInfoPanel?.visible && !this.inventoryPanel?.visible;
      
      // 如果两个面板都关闭了，完成 tip_7.1
      if (bothPanelsClosed && !this.tutorialsCompleted.progressive_tip_7_1) {
        this.completeTutorial('progressive_tip_7_1');
        console.log('Act1SceneECS: 完成tip_7.1 - 关闭面板');
      }
      
      // 等待玩家完成 tip_7_1（关闭两个面板）后生成装备物品
      if (this.tutorialsCompleted.progressive_tip_7_1) {
        // 生成第二批物品（装备）
        if (this.equipmentItems.length === 0) {
          this.spawnEquipmentItems();
          console.log('Act1SceneECS: 生成第二批物品（装备）');
        }
        
        // tip_8会自动触发，不在这里手动完成
        // 进入装备拾取阶段
        this.tutorialPhase = 'pickup_equipment';
        console.log('Act1SceneECS: 进入装备拾取阶段');
      }
    }
    // 阶段7: 装备拾取阶段
    else if (this.tutorialPhase === 'pickup_equipment') {
      // 等待玩家拾取装备后进入装备教程
      const pickedCount = this.equipmentItems.filter(item => item.picked).length;
      if (pickedCount >= 2) {
        // 完成tip_8: 发现装备
        if (!this.tutorialsCompleted.progressive_tip_8) {
          this.completeTutorial('progressive_tip_8');
          console.log('Act1SceneECS: 完成tip_8 - 拾取装备');
        }
        
        // 进入装备教程
        this.startEquipmentTutorial();
      }
    }
    // 阶段8: 装备教程
    else if (this.tutorialPhase === 'equipment') {
      const equipment = this.playerEntity.getComponent('equipment');
      
      // 检查是否装备了2件物品（武器和护甲）
      const equippedCount = equipment && equipment.slots ? 
        Object.keys(equipment.slots).filter(slot => equipment.slots[slot]).length : 0;
      
      if (equippedCount >= 2 && !this.tutorialsCompleted.equipment) {
        this.completeTutorial('equipment');
        
        // 完成tip_9: 装备物品
        if (!this.tutorialsCompleted.progressive_tip_9) {
          this.completeTutorial('progressive_tip_9');
          console.log('Act1SceneECS: 完成tip_9 - 装备物品');
        }
        
        // 完成tip_10: 查看装备
        if (!this.tutorialsCompleted.progressive_tip_10) {
          this.completeTutorial('progressive_tip_10');
          console.log('Act1SceneECS: 完成tip_10 - 查看装备');
        }
        
        // 进入战斗教程
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
        
        // 完成tip_6: 查看属性（在view_stats阶段打开面板）
        if (this.tutorialPhase === 'view_stats' && !this.tutorialsCompleted.progressive_tip_6 && this.playerInfoPanel.visible) {
          this.completeTutorial('progressive_tip_6');
          console.log('Act1SceneECS: 完成tip_6 - 查看属性');
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
        
        // 完成tip_5: 按B键查看背包（在view_inventory阶段打开背包）
        if (this.tutorialPhase === 'view_inventory' && !this.tutorialsCompleted.progressive_tip_5 && this.inventoryPanel.visible) {
          this.completeTutorial('progressive_tip_5');
          console.log('Act1SceneECS: 完成tip_5 - 按B键查看背包');
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
      }
    }
  }

  /**
   * 检查拾取（支持两个数组）
   */
  checkPickup() {
    // 使用 isKeyDown 而不是 isKeyPressed，因为 isKeyPressed 在帧开始时已被清除
    const ePressed = this.inputManager.isKeyDown('e') || this.inputManager.isKeyDown('E');
    if (!ePressed) return;
    
    const transform = this.playerEntity.getComponent('transform');
    if (!transform) return;
    
    const playerX = transform.position.x;
    const playerY = transform.position.y;
    
    // 防止连续拾取，添加冷却时间
    const now = Date.now();
    if (this.lastPickupTime && now - this.lastPickupTime < 300) return;
    
    // 检查第一批物品（残羹）
    for (const item of this.pickupItems) {
      if (item.picked) continue;
      
      const dx = item.x - playerX;
      const dy = item.y - playerY;
      const distance = Math.sqrt(dx * dx + dy * dy);
      
      if (distance <= 50) {
        this.pickupItem(item, false);
        this.lastPickupTime = now;
        return;
      }
    }
    
    // 检查第二批物品（装备和掉落物）
    for (let i = this.equipmentItems.length - 1; i >= 0; i--) {
      const item = this.equipmentItems[i];
      if (item.picked) continue;
      
      // 获取物品位置
      const itemTransform = item.getComponent ? item.getComponent('transform') : null;
      const itemX = itemTransform ? itemTransform.position.x : item.x;
      const itemY = itemTransform ? itemTransform.position.y : item.y;
      
      const dx = itemX - playerX;
      const dy = itemY - playerY;
      const distance = Math.sqrt(dx * dx + dy * dy);
      
      if (distance <= 50) {
        // 检查是否是掉落物实体
        if (item.tags && item.tags.includes('loot')) {
          this.pickupLoot(item);
          this.equipmentItems.splice(i, 1);
          this.entities = this.entities.filter(e => e !== item);
        } else {
          this.pickupItem(item, true);
        }
        this.lastPickupTime = now;
        return;
      }
    }
  }

  /**
   * 拾取掉落物
   * @param {Entity} lootEntity - 掉落物实体
   */
  pickupLoot(lootEntity) {
    const itemData = lootEntity.itemData;
    if (!itemData) return;
    
    const stats = this.playerEntity.getComponent('stats');
    if (!stats) return;
    
    console.log(`拾取掉落物: ${itemData.name}`);
    
    // 根据物品类型处理
    if (itemData.type === 'health_potion') {
      // 恢复生命值
      const healAmount = stats.heal(itemData.value);
      
      // 显示治疗飘动文字
      const transform = this.playerEntity.getComponent('transform');
      if (transform && healAmount > 0) {
        this.floatingTextManager.addHeal(
          transform.position.x,
          transform.position.y - 30,
          healAmount
        );
      }
      
      console.log(`使用生命药水，恢复 ${healAmount} 生命值`);
    } else if (itemData.type === 'mana_potion') {
      // 恢复魔法值
      const manaAmount = stats.restoreMana(itemData.value);
      
      // 显示魔法恢复飘动文字
      const transform = this.playerEntity.getComponent('transform');
      if (transform && manaAmount > 0) {
        this.floatingTextManager.addManaRestore(
          transform.position.x,
          transform.position.y - 50,
          manaAmount
        );
      }
      
      console.log(`使用魔法药水，恢复 ${manaAmount} 魔法值`);
    }
  }

  /**
   * 检查点燃火堆
   */
  checkCampfire() {
    // 如果火堆已点燃，不再检查
    if (this.campfire.lit) return;
    
    // 使用 isKeyDown 检测 E 键
    const ePressed = this.inputManager.isKeyDown('e') || this.inputManager.isKeyDown('E');
    if (!ePressed) return;
    
    console.log('Act1SceneECS: E键被按下，检查火堆距离');
    
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
    const playerRadius = 20; // 玩家半径
    
    // 火堆的碰撞区域
    // 宽度：中间8/10（左右各1/10可以靠近）
    // 高度：上部3/4（下部1/4可以靠近）
    const fullWidth = 50;
    const fullHeight = 30;
    const collisionWidth = fullWidth * 0.8; // 中间8/10宽度 = 40
    const collisionHeight = fullHeight * 0.75; // 上部3/4高度 = 22.5
    
    const campfireLeft = this.campfire.x - collisionWidth / 2;
    const campfireRight = this.campfire.x + collisionWidth / 2;
    const campfireTop = this.campfire.y - 15;
    const campfireBottom = this.campfire.y - 15 + collisionHeight;
    
    // 检查玩家是否与火堆碰撞（AABB碰撞检测）
    const playerLeft = playerX - playerRadius;
    const playerRight = playerX + playerRadius;
    const playerTop = playerY - playerRadius;
    const playerBottom = playerY + playerRadius;
    
    // 检测碰撞
    if (playerRight > campfireLeft && 
        playerLeft < campfireRight && 
        playerBottom > campfireTop && 
        playerTop < campfireBottom) {
      
      // 发生碰撞，计算推开方向
      const dx = playerX - this.campfire.x;
      const dy = playerY - this.campfire.y;
      
      // 计算重叠量
      const overlapX = dx > 0 
        ? (campfireRight - playerLeft) 
        : (campfireLeft - playerRight);
      const overlapY = dy > 0 
        ? (campfireBottom - playerTop) 
        : (campfireTop - playerBottom);
      
      // 沿重叠较小的方向推开
      if (Math.abs(overlapX) < Math.abs(overlapY)) {
        // 水平推开
        transform.position.x += overlapX;
      } else {
        // 垂直推开
        transform.position.y += overlapY;
      }
    }
  }

  /**
   * 点燃火堆
   */
  lightCampfire() {
    if (this.campfire.lit) return;
    
    console.log('Act1SceneECS: 点燃火堆');
    this.campfire.lit = true;
    
    // 创建简洁的火焰粒子效果
    this.campfire.emitters = [];
    
    // 火堆底部的1个发射点（中心位置）
    const fireBaseY = this.campfire.y + 2;  // 向上移动8像素
    const firePoint = { x: this.campfire.x, y: fireBaseY };
    
    // 大火焰粒子（7-10像素，向上移动10-15像素，较少）
    this.campfire.emitters.push(this.particleSystem.createEmitter({
      position: { x: firePoint.x, y: firePoint.y },
      rate: 6,
      duration: Infinity,
      particleConfig: {
        position: { x: firePoint.x, y: firePoint.y },
        velocity: { x: 0, y: -50 },  // 速度50，生命周期0.25秒，移动12.5像素
        life: 250,
        size: 8.5,
        color: '#ffaa22',
        alpha: 0.85,
        gravity: 0,
        friction: 0.95
      }
    }));
    
    // 中火焰粒子（5-7像素，向上移动5-10像素）
    this.campfire.emitters.push(this.particleSystem.createEmitter({
      position: { x: firePoint.x, y: firePoint.y },
      rate: 8,
      duration: Infinity,
      particleConfig: {
        position: { x: firePoint.x, y: firePoint.y },
        velocity: { x: 0, y: -35 },  // 速度35，生命周期0.2秒，移动7像素
        life: 200,
        size: 6,
        color: '#ff8833',
        alpha: 0.8,
        gravity: 0,
        friction: 0.95
      }
    }));
    
    // 白色亮点（4-5像素，向上移动40-50像素，少量）
    this.campfire.emitters.push(this.particleSystem.createEmitter({
      position: { x: firePoint.x, y: firePoint.y },
      rate: 4,
      duration: Infinity,
      particleConfig: {
        position: { x: firePoint.x, y: firePoint.y },
        velocity: { x: 0, y: -120 },
        life: 400,
        size: 4.5,
        color: '#ffffee',
        alpha: 1.0,
        gravity: 0,
        friction: 0.95
      }
    }));
    
    // 亮黄色火星（3-4像素，向上移动30-40像素）
    this.campfire.emitters.push(this.particleSystem.createEmitter({
      position: { x: firePoint.x, y: firePoint.y },
      rate: 10,
      duration: Infinity,
      particleConfig: {
        position: { x: firePoint.x, y: firePoint.y },
        velocity: { x: 0, y: -100 },
        life: 350,
        size: 3.5,
        color: '#ffee44',
        alpha: 0.9,
        gravity: 0,
        friction: 0.95
      }
    }));
    
    // 橙色火星（2-3像素，向上移动20-30像素）
    this.campfire.emitters.push(this.particleSystem.createEmitter({
      position: { x: firePoint.x, y: firePoint.y },
      rate: 8,
      duration: Infinity,
      particleConfig: {
        position: { x: firePoint.x, y: firePoint.y },
        velocity: { x: 0, y: -80 },
        life: 300,
        size: 2.5,
        color: '#ff9933',
        alpha: 0.85,
        gravity: 0,
        friction: 0.95
      }
    }));
    
    // 红色火星（2像素，向上移动10-20像素）
    this.campfire.emitters.push(this.particleSystem.createEmitter({
      position: { x: firePoint.x, y: firePoint.y },
      rate: 6,
      duration: Infinity,
      particleConfig: {
        position: { x: firePoint.x, y: firePoint.y },
        velocity: { x: 0, y: -60 },
        life: 250,
        size: 2,
        color: '#ff5522',
        alpha: 0.8,
        gravity: 0,
        friction: 0.95
      }
    }));
    
    // 小火星（2像素，向上移动5-10像素，较多）
    this.campfire.emitters.push(this.particleSystem.createEmitter({
      position: { x: firePoint.x, y: firePoint.y },
      rate: 12,
      duration: Infinity,
      particleConfig: {
        position: { x: firePoint.x, y: firePoint.y },
        velocity: { x: 0, y: -40 },
        life: 200,
        size: 2,
        color: '#ff6633',
        alpha: 0.7,
        gravity: 0,
        friction: 0.95
      }
    }));
    
    console.log('Act1SceneECS: 火焰粒子效果已创建（1个发射点，7种粒子）');
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
   * 移除死亡的实体
   */
  removeDeadEntities() {
    // 过滤出死亡的实体
    const deadEntities = this.entities.filter(entity => entity.isDead);
    
    if (deadEntities.length === 0) return;
    
    for (const entity of deadEntities) {
      // 从实体列表中移除
      const index = this.entities.indexOf(entity);
      if (index > -1) {
        this.entities.splice(index, 1);
      }
      
      // 从敌人列表中移除
      const enemyIndex = this.enemyEntities.indexOf(entity);
      if (enemyIndex > -1) {
        this.enemyEntities.splice(enemyIndex, 1);
      }
      
      console.log(`移除死亡实体: ${entity.name || entity.id}`);
    }
  }

  /**
   * 生成掉落物
   * @param {Object} position - 掉落位置
   * @param {Array} lootItems - 掉落物品列表
   */
  spawnLootItems(position, lootItems) {
    console.log('Act1SceneECS.spawnLootItems 被调用', { position, lootItems });
    
    if (!lootItems || lootItems.length === 0) {
      console.log('没有掉落物品');
      return;
    }
    
    console.log(`在 (${position.x}, ${position.y}) 生成 ${lootItems.length} 个掉落物`);
    
    // 为每个掉落物创建实体
    lootItems.forEach((item, index) => {
      // 计算掉落位置（散开分布）
      const angle = (index / lootItems.length) * Math.PI * 2;
      const radius = 30;
      const dropX = position.x + Math.cos(angle) * radius;
      const dropY = position.y + Math.sin(angle) * radius;
      
      console.log(`创建掉落物: ${item.name} 在 (${dropX}, ${dropY})`);
      
      // 创建掉落物实体
      const lootEntity = this.createLootEntity(item, dropX, dropY);
      this.entities.push(lootEntity);
      this.equipmentItems.push(lootEntity);
      
      console.log('掉落物实体已创建并添加到列表', lootEntity);
    });
  }

  /**
   * 创建掉落物实体
   * @param {Object} item - 物品数据
   * @param {number} x - X坐标
   * @param {number} y - Y坐标
   * @returns {Entity}
   */
  createLootEntity(item, x, y) {
    const entity = new Entity(`loot_${Date.now()}_${Math.random()}`, 'loot');
    
    // 添加变换组件
    entity.addComponent(new TransformComponent(x, y));
    
    // 添加精灵组件 - 小长方形瓶子（加大尺寸）
    const color = item.type === 'health_potion' ? '#ff3333' : '#3333ff';
    const sprite = new SpriteComponent('loot_sprite', {
      width: 16,   // 宽度：加大
      height: 24,  // 高度：加大
      color: color,
      visible: true,
      defaultAnimation: 'idle'
    });
    
    // 添加简单的待机动画
    sprite.addAnimation('idle', {
      frames: [0],
      frameRate: 1,
      loop: true
    });
    sprite.playAnimation('idle');
    
    entity.addComponent(sprite);
    
    // 添加名字组件
    const nameComp = new NameComponent(item.name, {
      color: '#ffff00',
      fontSize: 14,
      offsetY: -20,
      visible: true
    });
    entity.addComponent(nameComp);
    
    // 存储物品数据
    entity.itemData = item;
    entity.tags = ['loot'];
    
    console.log('掉落物实体详情:', {
      id: entity.id,
      type: entity.type,
      position: entity.getComponent('transform').position,
      sprite: entity.getComponent('sprite'),
      name: entity.getComponent('name'),
      hasNameComponent: entity.hasComponent('name')
    });
    
    return entity;
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
    // 清空Canvas
    ctx.fillStyle = '#1a1a2e';
    ctx.fillRect(0, 0, ctx.canvas.width, ctx.canvas.height);
    
    // 保存上下文状态
    ctx.save();
    
    // 应用相机变换
    const viewBounds = this.camera.getViewBounds();
    ctx.translate(-viewBounds.left, -viewBounds.top);
    
    // 渲染可拾取物品
    this.renderPickupItems(ctx);
    
    // 创建渲染队列，包含所有需要渲染的对象
    const renderQueue = [];
    
    // 添加实体到渲染队列
    for (const entity of this.entities) {
      const transform = entity.getComponent('transform');
      if (transform) {
        renderQueue.push({
          type: 'entity',
          y: transform.position.y,
          entity: entity
        });
      }
    }
    
    // 添加火堆到渲染队列（只在完成tip_2后显示）
    if (this.tutorialsCompleted.progressive_tip_2) {
      renderQueue.push({
        type: 'campfire_bottom',
        y: this.campfire.y,
        render: () => this.renderCampfireBottom(ctx)
      });
      
      renderQueue.push({
        type: 'campfire_top',
        y: this.campfire.y - 1, // 稍微靠前一点，确保在同一Y坐标的实体之后渲染
        render: () => this.renderCampfireTop(ctx)
      });
    }
    
    // 按 Y 坐标排序（从小到大，Y 小的在后面渲染，会遮挡前面的）
    renderQueue.sort((a, b) => a.y - b.y);
    
    // 按顺序渲染
    for (const item of renderQueue) {
      if (item.type === 'entity') {
        this.renderEntity(ctx, item.entity);
      } else if (item.render) {
        item.render();
      }
    }
    
    // 恢复上下文状态
    ctx.restore();
    
    // 渲染粒子系统
    this.particleSystem.render(ctx, this.camera);
    
    // 渲染技能特效（抛射物）
    this.skillEffects.render(ctx, this.camera);
    
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
    
    // 注意：QuestSystem 没有 render 方法，任务UI由其他组件负责
    
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
   * 渲染单个实体
   */
  renderEntity(ctx, entity) {
    const transform = entity.getComponent('transform');
    const sprite = entity.getComponent('sprite');
    const stats = entity.getComponent('stats');
    
    if (!transform) return;
    
    const x = transform.position.x;
    const y = transform.position.y;
    const size = sprite?.width || sprite?.size || 32; // 使用精灵的宽度
    const height = sprite?.height || sprite?.size || 32; // 使用精灵的高度
    
    // 检查是否被选中
    const isSelected = this.combatSystem && this.combatSystem.selectedTarget === entity;
    
    // 渲染精灵（矩形）
    if (sprite && sprite.visible) {
      // 如果被选中，绘制选中框
      if (isSelected) {
        ctx.strokeStyle = '#ffff00';
        ctx.lineWidth = 3;
        ctx.strokeRect(x - size/2 - 3, y - height/2 - 3, size + 6, height + 6);
      }
      
      // 绘制实体矩形
      ctx.fillStyle = sprite.color || '#00ff00';
      ctx.fillRect(x - size/2, y - height/2, size, height);
      
      // 绘制边框
      ctx.strokeStyle = entity.type === 'player' ? '#4CAF50' : '#ff4444';
      ctx.lineWidth = 2;
      ctx.strokeRect(x - size/2, y - height/2, size, height);
    }
    
    // 渲染名字
    const nameComponent = entity.getComponent('name');
    if (nameComponent && nameComponent.visible) {
      const nameY = y - height/2 + (nameComponent.offsetY || -10);
      
      ctx.save();
      ctx.font = `bold ${nameComponent.fontSize || 14}px Arial`;
      ctx.textAlign = 'center';
      ctx.textBaseline = 'bottom';
      
      // 测量文字宽度
      const textWidth = ctx.measureText(nameComponent.name).width;
      const padding = 4;
      
      // 绘制背景
      ctx.fillStyle = 'rgba(0, 0, 0, 0.6)';
      ctx.fillRect(
        x - textWidth / 2 - padding,
        nameY - 16,
        textWidth + padding * 2,
        18
      );
      
      // 绘制文字阴影
      ctx.shadowColor = 'rgba(0, 0, 0, 0.8)';
      ctx.shadowBlur = 3;
      ctx.shadowOffsetX = 1;
      ctx.shadowOffsetY = 1;
      
      // 使用名字组件中的颜色
      ctx.fillStyle = nameComponent.color || '#ffffff';
      ctx.fillText(nameComponent.name, x, nameY);
      ctx.restore();
    }
    
    // 渲染生命值条
    if (stats && stats.maxHp > 0) {
      const barWidth = 40;
      const barHeight = 4;
      const barX = x - barWidth / 2;
      const barY = y - 30;
      
      // 背景
      ctx.fillStyle = '#333333';
      ctx.fillRect(barX, barY, barWidth, barHeight);
      
      // 生命值
      const hpRatio = stats.hp / stats.maxHp;
      ctx.fillStyle = hpRatio > 0.5 ? '#00ff00' : hpRatio > 0.2 ? '#ffaa00' : '#ff0000';
      ctx.fillRect(barX, barY, barWidth * hpRatio, barHeight);
      
      // 边框
      ctx.strokeStyle = '#ffffff';
      ctx.lineWidth = 1;
      ctx.strokeRect(barX, barY, barWidth, barHeight);
    }
  }

  /**
   * 渲染可拾取物品（支持两个数组）
   */
  renderPickupItems(ctx) {
    // 渲染第一批物品（残羹）
    for (const item of this.pickupItems) {
      if (item.picked) continue;
      
      // 直接使用世界坐标（已经应用了相机变换）
      const x = item.x;
      const y = item.y;
      
      // 绘制物品图标
      ctx.fillStyle = '#ffaa00';
      ctx.beginPath();
      ctx.arc(x, y, 10, 0, Math.PI * 2);
      ctx.fill();
      
      // 绘制物品名称
      ctx.fillStyle = '#ffffff';
      ctx.font = '12px Arial';
      ctx.textAlign = 'center';
      ctx.fillText(item.name, x, y - 15);
    }
    
    // 渲染第二批物品（装备）
    for (const item of this.equipmentItems) {
      if (item.picked) continue;
      
      // 直接使用世界坐标（已经应用了相机变换）
      const x = item.x;
      const y = item.y;
      
      // 绘制物品图标
      ctx.fillStyle = '#ffaa00';
      ctx.beginPath();
      ctx.arc(x, y, 10, 0, Math.PI * 2);
      ctx.fill();
      
      // 绘制物品名称
      ctx.fillStyle = '#ffffff';
      ctx.font = '12px Arial';
      ctx.textAlign = 'center';
      ctx.fillText(item.name, x, y - 15);
    }
  }

  /**
   * 渲染火堆下半部分（木材下半部分和底部发光）
   */
  renderCampfireBottom(ctx) {
    // 直接使用世界坐标（已经应用了相机变换）
    const x = this.campfire.x;
    const y = this.campfire.y;
    
    if (!this.campfire.lit) {
      // 渲染熄灭的火堆 - 木材堆（下半部分）
      // 绘制木材下半部分（使用裁剪）
      ctx.save();
      ctx.beginPath();
      ctx.rect(x - 30, y, 60, 30); // 只渲染中心线以下的部分
      ctx.clip();
      
      ctx.strokeStyle = '#5a4a3a';
      ctx.lineWidth = 6;
      ctx.lineCap = 'round';
      
      // 木材1 - 左下到右上
      ctx.beginPath();
      ctx.moveTo(x - 20, y + 10);
      ctx.lineTo(x + 20, y - 10);
      ctx.stroke();
      
      // 木材2 - 右下到左上
      ctx.beginPath();
      ctx.moveTo(x + 20, y + 10);
      ctx.lineTo(x - 20, y - 10);
      ctx.stroke();
      
      // 木材3 - 水平
      ctx.beginPath();
      ctx.moveTo(x - 18, y);
      ctx.lineTo(x + 18, y);
      ctx.stroke();
      
      // 木材4 - 左侧斜
      ctx.strokeStyle = '#4a3a2a';
      ctx.beginPath();
      ctx.moveTo(x - 15, y + 8);
      ctx.lineTo(x - 5, y - 12);
      ctx.stroke();
      
      // 木材5 - 右侧斜
      ctx.beginPath();
      ctx.moveTo(x + 15, y + 8);
      ctx.lineTo(x + 5, y - 12);
      ctx.stroke();
      
      ctx.restore();
    } else {
      // 渲染点燃的火堆 - 下半部分
      // 绘制燃烧的木材底座下半部分（使用裁剪）
      ctx.save();
      ctx.beginPath();
      ctx.rect(x - 30, y, 60, 30); // 只渲染中心线以下的部分
      ctx.clip();
      
      ctx.strokeStyle = '#3a2a1a';
      ctx.lineWidth = 8;
      ctx.lineCap = 'round';
      
      // 木材轮廓（简化，因为火焰会覆盖大部分）
      ctx.beginPath();
      ctx.moveTo(x - 20, y + 10);
      ctx.lineTo(x + 20, y - 10);
      ctx.stroke();
      
      ctx.beginPath();
      ctx.moveTo(x + 20, y + 10);
      ctx.lineTo(x - 20, y - 10);
      ctx.stroke();
      
      ctx.restore();
      
      // 绘制火堆底部的发光效果（大范围）
      const gradient = ctx.createRadialGradient(x, y, 0, x, y, 60);
      gradient.addColorStop(0, 'rgba(255, 200, 0, 0.4)');
      gradient.addColorStop(0.5, 'rgba(255, 100, 0, 0.2)');
      gradient.addColorStop(1, 'rgba(255, 50, 0, 0)');
      ctx.fillStyle = gradient;
      ctx.beginPath();
      ctx.arc(x, y, 60, 0, Math.PI * 2);
      ctx.fill();
      
      // 绘制火堆中心的亮光
      const centerGlow = ctx.createRadialGradient(x, y, 0, x, y, 20);
      centerGlow.addColorStop(0, 'rgba(255, 255, 200, 0.6)');
      centerGlow.addColorStop(0.5, 'rgba(255, 150, 0, 0.3)');
      centerGlow.addColorStop(1, 'rgba(255, 100, 0, 0)');
      ctx.fillStyle = centerGlow;
      ctx.beginPath();
      ctx.arc(x, y, 20, 0, Math.PI * 2);
      ctx.fill();
    }
  }

  /**
   * 渲染火堆上半部分（木材上半部分和火焰图片）
   */
  renderCampfireTop(ctx) {
    // 直接使用世界坐标（已经应用了相机变换）
    const x = this.campfire.x;
    const y = this.campfire.y;
    
    if (!this.campfire.lit) {
      // 渲染熄灭的火堆 - 木材上半部分
      ctx.save();
      ctx.beginPath();
      ctx.rect(x - 30, y - 30, 60, 30); // 只渲染中心线以上的部分
      ctx.clip();
      
      ctx.strokeStyle = '#5a4a3a';
      ctx.lineWidth = 6;
      ctx.lineCap = 'round';
      
      // 木材1 - 左下到右上
      ctx.beginPath();
      ctx.moveTo(x - 20, y + 10);
      ctx.lineTo(x + 20, y - 10);
      ctx.stroke();
      
      // 木材2 - 右下到左上
      ctx.beginPath();
      ctx.moveTo(x + 20, y + 10);
      ctx.lineTo(x - 20, y - 10);
      ctx.stroke();
      
      // 木材3 - 水平
      ctx.beginPath();
      ctx.moveTo(x - 18, y);
      ctx.lineTo(x + 18, y);
      ctx.stroke();
      
      // 木材4 - 左侧斜
      ctx.strokeStyle = '#4a3a2a';
      ctx.beginPath();
      ctx.moveTo(x - 15, y + 8);
      ctx.lineTo(x - 5, y - 12);
      ctx.stroke();
      
      // 木材5 - 右侧斜
      ctx.beginPath();
      ctx.moveTo(x + 15, y + 8);
      ctx.lineTo(x + 5, y - 12);
      ctx.stroke();
      
      ctx.restore();
      
      // 绘制提示文字
      ctx.fillStyle = '#ffffff';
      ctx.font = 'bold 14px Arial';
      ctx.textAlign = 'center';
      ctx.shadowColor = '#000000';
      ctx.shadowBlur = 4;
      ctx.fillText('熄灭的火堆', x, y - 40);
      ctx.fillText('按 E 点燃', x, y - 25);
      ctx.shadowBlur = 0;
      
      return;
    }
    
    // 渲染点燃的火堆 - 上半部分
    // 绘制燃烧的木材上半部分（使用裁剪）
    ctx.save();
    ctx.beginPath();
    ctx.rect(x - 30, y - 30, 60, 30); // 只渲染中心线以上的部分
    ctx.clip();
    
    ctx.strokeStyle = '#3a2a1a';
    ctx.lineWidth = 8;
    ctx.lineCap = 'round';
    
    // 木材轮廓（简化，因为火焰会覆盖大部分）
    ctx.beginPath();
    ctx.moveTo(x - 20, y + 10);
    ctx.lineTo(x + 20, y - 10);
    ctx.stroke();
    
    ctx.beginPath();
    ctx.moveTo(x + 20, y + 10);
    ctx.lineTo(x - 20, y - 10);
    ctx.stroke();
    
    ctx.restore();
    
    // 绘制火焰帧动画（如果已加载）
    if (this.campfire.imageLoaded && this.campfire.fireImage) {
      // 计算当前帧在精灵图中的位置（4列3行布局）
      const col = this.campfire.currentFrame % this.campfire.frameCols;
      const row = Math.floor(this.campfire.currentFrame / this.campfire.frameCols);
      const frameX = col * this.campfire.frameWidth;
      const frameY = row * this.campfire.frameHeight;
      
      // 计算图片绘制位置和大小（缩小为50%）
      const fireWidth = 40;  // 原来80，现在40
      const fireHeight = 60; // 原来120，现在60
      const fireX = x - fireWidth / 2;
      const fireY = y - fireHeight + 10; // 向上偏移，让火焰从木材上方升起
      
      // 绘制当前帧
      ctx.globalAlpha = 0.9;
      ctx.drawImage(
        this.campfire.fireImage,
        frameX, frameY, this.campfire.frameWidth, this.campfire.frameHeight, // 源矩形
        fireX, fireY, fireWidth, fireHeight // 目标矩形
      );
      ctx.globalAlpha = 1.0;
    }
  }

  /**
   * 渲染火堆（保留用于兼容，实际使用 renderCampfireBottom 和 renderCampfireTop）
   */
  renderCampfire(ctx) {
    this.renderCampfireBottom(ctx);
    this.renderCampfireTop(ctx);
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
      ctx.fillText('你又昏过去了...', ctx.canvas.width / 2, ctx.canvas.height / 2 - 30);
      
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
