/**
 * BaseGameScene - 游戏场景基类
 * 
 * 包含所有场景通用的基础功能：
 * - ECS 实体系统
 * - 输入管理
 * - 相机系统
 * - 移动系统
 * - 战斗系统
 * - UI 面板（背包、装备、人物信息）
 * - 粒子系统和特效
 * 
 * 第一幕和第二幕都继承此类
 */

import { PrologueScene } from './PrologueScene.js';
import { EntityFactory } from '../../ecs/EntityFactory.js';
import { InputManager } from '../../core/InputManager.js';
import UIClickHandler from '../../core/UIClickHandler.js';
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
import { PlayerInfoPanel } from '../../ui/PlayerInfoPanel.js';
import { EquipmentPanel } from '../../ui/EquipmentPanel.js';
import { BottomControlBar } from '../../ui/BottomControlBar.js';
import { FloatingTextManager } from '../../ui/FloatingText.js';
import { ParticleSystem } from '../../rendering/ParticleSystem.js';
import { Entity } from '../../ecs/Entity.js';
import { TransformComponent } from '../../ecs/components/TransformComponent.js';
import { SpriteComponent } from '../../ecs/components/SpriteComponent.js';
import { NameComponent } from '../../ecs/components/NameComponent.js';

export class BaseGameScene extends PrologueScene {
  constructor(actNumber, sceneData = {}) {
    super(actNumber, sceneData);
    
    // ECS 核心
    this.entityFactory = new EntityFactory();
    this.entities = [];
    
    // 逻辑尺寸（用于渲染计算，不受 devicePixelRatio 影响）
    this.logicalWidth = 800;
    this.logicalHeight = 600;
    
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
    this.uiClickHandler = new UIClickHandler();
    
    // 序章系统
    this.tutorialSystem = new TutorialSystem();
    this.dialogueSystem = new DialogueSystem();
    this.questSystem = new QuestSystem();
    
    // UI 面板
    this.inventoryPanel = null;
    this.playerInfoPanel = null;
    this.equipmentPanel = null;
    this.bottomControlBar = null;
    
    // 飘动文字管理器
    this.floatingTextManager = new FloatingTextManager();
    
    // 粒子系统
    this.particleSystem = new ParticleSystem(500);
    
    // 玩家实体
    this.playerEntity = null;
    
    // 敌人实体
    this.enemyEntities = [];
    
    // 可拾取物品
    this.pickupItems = [];
    this.equipmentItems = [];
    
    // 教程状态
    this.tutorialPhase = 'init';
    
    // 面板切换冷却时间
    this.lastPlayerInfoToggleTime = 0;
    this.lastInventoryToggleTime = 0;
    this.lastEquipmentToggleTime = 0;
    this.lastPickupTime = 0;
    
    // 场景过渡状态
    this.isTransitioning = false;
    this.transitionAlpha = 0;
    this.transitionPhase = 'none'; // 'none', 'fade_out', 'show_text', 'switch_scene'
    this.transitionTimer = 0;
    this.transitionDuration = 2.0;
    this.textDisplayDuration = 3.0;
    this.transitionText = { main: '', sub: '' };
  }

  /**
   * 场景进入 - 初始化所有基础系统
   */
  enter(data = null) {
    super.enter(data);
    
    // 获取 canvas
    const canvas = document.getElementById('gameCanvas');
    if (!canvas) {
      console.error('BaseGameScene: Canvas not found');
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
      inputManager: this.inputManager,
      camera: this.camera
    });
    this.movementSystem.setMapBounds(0, 0, 800, 600);
    
    this.equipmentSystem = new EquipmentSystem();
    
    // 初始化AI系统
    this.aiSystem = new AISystem();
    
    // 初始化 UI 面板
    this.initializeUIPanels();
    
    // 创建玩家实体
    this.createPlayerEntity();
    
    console.log(`BaseGameScene: 进入场景 ${this.name}`);
  }

  /**
   * 初始化 UI 面板
   */
  initializeUIPanels() {
    // 角色信息面板
    this.playerInfoPanel = new PlayerInfoPanel({
      x: 10,
      y: 10,
      width: 280,
      height: 320,
      visible: false,
      onAttributeAllocate: (player) => {
        console.log('BaseGameScene: 属性加点按钮被点击');
      }
    });
    
    // 装备面板
    this.equipmentPanel = new EquipmentPanel({
      x: 10,
      y: 340,
      width: 280,
      height: 250,
      visible: false,
      onEquipmentChange: (messages) => {
        this.onEquipmentChanged(messages);
      }
    });
    
    // 背包面板
    this.inventoryPanel = new InventoryPanel({
      x: 420,
      y: 10,
      width: 370,
      height: 350,
      visible: false,
      onItemUse: (item, healAmount, manaAmount) => {
        this.onItemUsed(item, healAmount, manaAmount);
      },
      onEquipmentChange: (messages) => {
        this.onEquipmentChanged(messages);
      }
    });
    
    // 底部控制栏
    this.bottomControlBar = new BottomControlBar({
      x: 0,
      y: this.logicalHeight - 100,
      width: this.logicalWidth,
      height: 100,
      visible: true,
      onSkillClick: (skill) => {
        this.onSkillClicked(skill);
      }
    });
    
    // 注册 UI 元素到 UIClickHandler
    this.uiClickHandler.registerElement(this.inventoryPanel);
    this.uiClickHandler.registerElement(this.equipmentPanel);
    this.uiClickHandler.registerElement(this.playerInfoPanel);
    this.uiClickHandler.registerElement(this.bottomControlBar);
  }

  /**
   * 物品使用回调
   */
  onItemUsed(item, healAmount, manaAmount) {
    if (this.playerEntity) {
      const transform = this.playerEntity.getComponent('transform');
      if (transform) {
        if (healAmount > 0) {
          this.floatingTextManager.addHeal(transform.position.x, transform.position.y - 30, healAmount);
        }
        if (manaAmount > 0) {
          this.floatingTextManager.addManaRestore(transform.position.x, transform.position.y - 50, manaAmount);
        }
      }
    }
  }

  /**
   * 装备变化回调
   * @param {Array} messages - 消息数组
   */
  onEquipmentChanged(messages) {
    if (!messages || messages.length === 0) return;
    
    if (this.playerEntity) {
      const transform = this.playerEntity.getComponent('transform');
      if (transform) {
        // 显示每条消息
        let yOffset = -30;
        for (const message of messages) {
          this.floatingTextManager.addText(
            transform.position.x, 
            transform.position.y + yOffset, 
            message,
            message.includes('+') ? '#00ff00' : (message.includes('-') ? '#ff6666' : '#ffff00')
          );
          yOffset -= 25;
        }
      }
    }
    
    console.log('BaseGameScene: 装备变化', messages);
  }

  /**
   * 技能点击回调
   * @param {Object} skill - 技能对象
   */
  onSkillClicked(skill) {
    console.log('BaseGameScene: 技能点击', skill);
    
    // 如果有选中的目标，使用技能
    if (this.combatSystem && this.combatSystem.selectedTarget && this.playerEntity) {
      this.combatSystem.useSkill(this.playerEntity, skill.id, this.combatSystem.selectedTarget);
    }
  }

  /**
   * 创建玩家实体 - 子类可覆盖
   */
  createPlayerEntity() {
    this.playerEntity = this.entityFactory.createPlayer({
      name: '玩家',
      class: 'refugee',
      level: 1,
      position: { x: 400, y: 300 },
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
        { id: 'basic_attack', name: '普通攻击', type: 'physical', damage: 15, manaCost: 0, cooldown: 1.0, range: 150, effectType: 'melee', hotkey: '1', isAutoAttack: true },
        { id: 'fireball', name: '火球术', type: 'magic', damage: 45, manaCost: 15, cooldown: 2.0, range: 500, aoeRadius: 100, effectType: 'fireball', projectileSpeed: 450, hotkey: '2' },
        { id: 'ice_lance', name: '寒冰箭', type: 'magic', damage: 40, manaCost: 12, cooldown: 1.8, range: 550, aoeRadius: 80, effectType: 'ice_lance', projectileSpeed: 500, hotkey: '3' },
        { id: 'flame_burst', name: '烈焰爆发', type: 'magic', damage: 65, manaCost: 25, cooldown: 4.0, range: 450, aoeRadius: 150, effectType: 'flame_burst', projectileSpeed: 400, hotkey: '4' }
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
    
    // 设置各系统的玩家实体
    this.combatSystem.setPlayerEntity(this.playerEntity);
    this.movementSystem.setPlayerEntity(this.playerEntity);
    this.inventoryPanel.setEntity(this.playerEntity);
    this.playerInfoPanel.setPlayer(this.playerEntity);
    this.equipmentPanel.setEntity(this.playerEntity);
    this.bottomControlBar.setEntity(this.playerEntity);
    
    console.log('BaseGameScene: 创建玩家实体', this.playerEntity);
  }


  /**
   * 更新场景
   */
  update(deltaTime) {
    if (!this.isActive || this.isPaused) return;
    
    // 更新场景过渡
    if (this.isTransitioning) {
      this.updateTransition(deltaTime);
      // 过渡期间不更新其他逻辑
      if (this.transitionPhase === 'show_text' || this.transitionPhase === 'switch_scene') {
        return;
      }
    }
    
    // 更新相机
    this.camera.update(deltaTime);
    
    // 更新所有实体
    for (const entity of this.entities) {
      entity.update(deltaTime);
    }
    
    // UI 点击处理
    this.handleUIClick();
    
    // 更新移动系统
    this.movementSystem.update(deltaTime, this.entities);
    
    // 检查实体之间的碰撞
    this.checkEntityCollisions();
    
    // 处理敌人选中
    this.handleEnemySelection();
    
    // 自动攻击逻辑
    this.handleAutoAttack();
    
    // 更新AI系统
    this.aiSystem.update(deltaTime, this.entities, this.combatSystem);
    
    // 更新战斗系统
    this.combatSystem.update(deltaTime, this.entities);
    
    // 更新装备系统
    this.equipmentSystem.update(deltaTime, this.entities);
    
    // 更新序章系统
    this.tutorialSystem.update(deltaTime, this.getGameState());
    this.dialogueSystem.update(deltaTime);
    this.questSystem.update(deltaTime);
    
    // 更新特效
    this.combatEffects.update(deltaTime);
    this.skillEffects.update(deltaTime);
    this.floatingTextManager.update(deltaTime);
    this.particleSystem.update(deltaTime);
    
    // 检查面板切换
    this.checkPlayerInfoToggle();
    this.checkInventoryToggle();
    this.checkEquipmentToggle();
    
    // 更新面板
    this.inventoryPanel.update(deltaTime);
    this.equipmentPanel.update(deltaTime);
    this.playerInfoPanel.update(deltaTime);
    this.bottomControlBar.update(deltaTime);
    
    // 更新鼠标悬停状态
    this.updatePanelHover();
    
    // 检查拾取
    this.checkPickup();
    
    // 移除死亡实体
    this.removeDeadEntities();
    
    // 更新输入管理器
    this.inputManager.update();
  }

  /**
   * 检查实体之间的碰撞（玩家与敌人）
   */
  checkEntityCollisions() {
    const aliveEntities = this.entities.filter(e => !e.isDead && !e.isDying);
    const entityRadius = 20;
    const collisionWidthRatio = 0.8;
    const collisionHeightRatio = 0.75;
    
    for (let i = 0; i < aliveEntities.length; i++) {
      const entityA = aliveEntities[i];
      const transformA = entityA.getComponent('transform');
      if (!transformA) continue;
      
      for (let j = i + 1; j < aliveEntities.length; j++) {
        const entityB = aliveEntities[j];
        const transformB = entityB.getComponent('transform');
        if (!transformB) continue;
        
        const radiusA = entityRadius * collisionWidthRatio;
        const radiusB = entityRadius * collisionWidthRatio;
        const heightA = entityRadius * 2 * collisionHeightRatio;
        const heightB = entityRadius * 2 * collisionHeightRatio;
        
        const aLeft = transformA.position.x - radiusA;
        const aRight = transformA.position.x + radiusA;
        const aTop = transformA.position.y - heightA / 2;
        const aBottom = transformA.position.y + heightA / 2;
        
        const bLeft = transformB.position.x - radiusB;
        const bRight = transformB.position.x + radiusB;
        const bTop = transformB.position.y - heightB / 2;
        const bBottom = transformB.position.y + heightB / 2;
        
        if (aRight > bLeft && aLeft < bRight && aBottom > bTop && aTop < bBottom) {
          const dx = transformA.position.x - transformB.position.x;
          const dy = transformA.position.y - transformB.position.y;
          const distance = Math.sqrt(dx * dx + dy * dy);
          
          if (distance === 0) continue;
          
          const nx = dx / distance;
          const ny = dy / distance;
          const overlapX = (radiusA + radiusB) - Math.abs(dx);
          const overlapY = (heightA / 2 + heightB / 2) - Math.abs(dy);
          const pushDistance = Math.min(overlapX, overlapY) / 2;
          
          if (Math.abs(overlapX) < Math.abs(overlapY)) {
            transformA.position.x += nx * pushDistance;
            transformB.position.x -= nx * pushDistance;
          } else {
            transformA.position.y += ny * pushDistance;
            transformB.position.y -= ny * pushDistance;
          }
        }
      }
    }
  }

  /**
   * 开始场景过渡
   */
  startTransition(mainText = '场景切换中...', subText = '') {
    console.log('BaseGameScene: 开始场景过渡');
    this.isTransitioning = true;
    this.transitionPhase = 'fade_out';
    this.transitionTimer = 0;
    this.transitionAlpha = 0;
    this.transitionText = { main: mainText, sub: subText };
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
   * 渲染场景过渡
   */
  renderTransition(ctx) {
    ctx.save();
    ctx.fillStyle = `rgba(0, 0, 0, ${this.transitionAlpha})`;
    ctx.fillRect(0, 0, this.logicalWidth, this.logicalHeight);
    
    if (this.transitionPhase === 'show_text') {
      ctx.fillStyle = '#ffffff';
      ctx.font = 'bold 48px Arial';
      ctx.textAlign = 'center';
      ctx.fillText(this.transitionText.main, this.logicalWidth / 2, this.logicalHeight / 2 - 30);
      
      if (this.transitionText.sub) {
        ctx.font = '24px Arial';
        ctx.fillText(this.transitionText.sub, this.logicalWidth / 2, this.logicalHeight / 2 + 30);
      }
    }
    
    ctx.restore();
  }

  /**
   * 处理 UI 点击
   */
  handleUIClick() {
    if (this.inputManager.isMouseClicked() && !this.inputManager.isMouseClickHandled()) {
      const mousePos = this.inputManager.getMousePosition();
      const button = this.inputManager.getMouseButton() === 2 ? 'right' : 'left';
      
      const uiHandled = this.uiClickHandler.handleClick(mousePos.x, mousePos.y, button);
      
      if (uiHandled) {
        this.inputManager.markMouseClickHandled();
      }
    }
  }

  /**
   * 处理敌人选中
   */
  handleEnemySelection() {
    if (this.inputManager.isMouseClicked() && !this.inputManager.isMouseClickHandled()) {
      const mouseWorldPos = this.inputManager.getMouseWorldPosition(this.camera);
      const clickedEnemy = this.combatSystem.findEnemyAtPosition(mouseWorldPos, this.entities);
      
      if (clickedEnemy) {
        this.combatSystem.selectTarget(clickedEnemy);
      } else {
        this.combatSystem.selectTarget(null);
      }
    }
  }

  /**
   * 处理自动攻击
   */
  handleAutoAttack() {
    if (this.combatSystem.selectedTarget && this.playerEntity) {
      const skills = this.playerEntity.getComponent('skills');
      if (skills) {
        const autoAttackSkill = skills.skills.find(s => s.isAutoAttack);
        if (autoAttackSkill) {
          const cooldownRemaining = skills.getCooldownRemaining(autoAttackSkill.id);
          if (cooldownRemaining <= 0) {
            this.combatSystem.useSkill(this.playerEntity, autoAttackSkill.id, this.combatSystem.selectedTarget);
          }
        }
      }
    }
  }

  /**
   * 检查人物信息面板切换
   */
  checkPlayerInfoToggle() {
    if (this.inputManager.isKeyDown('c') || this.inputManager.isKeyDown('C')) {
      const now = Date.now();
      if (!this.lastPlayerInfoToggleTime || now - this.lastPlayerInfoToggleTime > 300) {
        this.playerInfoPanel.toggle();
        this.lastPlayerInfoToggleTime = now;
      }
    }
  }

  /**
   * 检查背包切换
   */
  checkInventoryToggle() {
    if (this.inputManager.isKeyDown('b') || this.inputManager.isKeyDown('B')) {
      const now = Date.now();
      if (!this.lastInventoryToggleTime || now - this.lastInventoryToggleTime > 300) {
        this.inventoryPanel.toggle();
        this.lastInventoryToggleTime = now;
      }
    }
  }

  /**
   * 检查装备面板切换
   */
  checkEquipmentToggle() {
    if (this.inputManager.isKeyDown('v') || this.inputManager.isKeyDown('V')) {
      const now = Date.now();
      if (!this.lastEquipmentToggleTime || now - this.lastEquipmentToggleTime > 300) {
        this.equipmentPanel.toggle();
        this.lastEquipmentToggleTime = now;
      }
    }
  }

  /**
   * 更新面板悬停状态
   */
  updatePanelHover() {
    const mousePos = this.inputManager.getMousePosition();
    
    if (this.inventoryPanel.visible) {
      this.inventoryPanel.handleMouseMove(mousePos.x, mousePos.y);
    }
    if (this.equipmentPanel.visible) {
      this.equipmentPanel.handleMouseMove(mousePos.x, mousePos.y);
    }
    if (this.playerInfoPanel.visible) {
      this.playerInfoPanel.handleMouseMove(mousePos.x, mousePos.y);
    }
    if (this.bottomControlBar.visible) {
      this.bottomControlBar.handleMouseMove(mousePos.x, mousePos.y);
    }
  }

  /**
   * 检查拾取
   */
  checkPickup() {
    const ePressed = this.inputManager.isKeyDown('e') || this.inputManager.isKeyDown('E');
    if (!ePressed) return;
    
    const transform = this.playerEntity.getComponent('transform');
    if (!transform) return;
    
    const playerX = transform.position.x;
    const playerY = transform.position.y;
    
    const now = Date.now();
    if (this.lastPickupTime && now - this.lastPickupTime < 300) return;
    
    // 检查可拾取物品
    for (const item of this.pickupItems) {
      if (item.picked) continue;
      
      const dx = item.x - playerX;
      const dy = item.y - playerY;
      const distance = Math.sqrt(dx * dx + dy * dy);
      
      if (distance <= 50) {
        this.pickupItem(item);
        this.lastPickupTime = now;
        return;
      }
    }
    
    // 检查装备物品
    for (let i = this.equipmentItems.length - 1; i >= 0; i--) {
      const item = this.equipmentItems[i];
      if (item.picked) continue;
      
      const itemTransform = item.getComponent ? item.getComponent('transform') : null;
      const itemX = itemTransform ? itemTransform.position.x : item.x;
      const itemY = itemTransform ? itemTransform.position.y : item.y;
      
      const dx = itemX - playerX;
      const dy = itemY - playerY;
      const distance = Math.sqrt(dx * dx + dy * dy);
      
      if (distance <= 50) {
        if (item.tags && item.tags.includes('loot')) {
          this.pickupLoot(item);
          this.equipmentItems.splice(i, 1);
          this.entities = this.entities.filter(e => e !== item);
        } else {
          this.pickupItem(item);
        }
        this.lastPickupTime = now;
        return;
      }
    }
  }

  /**
   * 拾取物品
   */
  pickupItem(item) {
    if (item.picked) return;
    
    item.picked = true;
    
    const inventory = this.playerEntity.getComponent('inventory');
    if (inventory) {
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
        stats: item.stats || {}
      };
      
      if (item.heal) itemData.heal = item.heal;
      
      inventory.addItem(itemData);
      console.log('BaseGameScene: 拾取物品', itemData);
    }
  }

  /**
   * 拾取掉落物
   */
  pickupLoot(lootEntity) {
    const itemData = lootEntity.itemData;
    if (!itemData) return;
    
    const stats = this.playerEntity.getComponent('stats');
    if (!stats) return;
    
    if (itemData.type === 'health_potion') {
      const healAmount = stats.heal(itemData.value);
      const transform = this.playerEntity.getComponent('transform');
      if (transform && healAmount > 0) {
        this.floatingTextManager.addHeal(transform.position.x, transform.position.y - 30, healAmount);
      }
    } else if (itemData.type === 'mana_potion') {
      const manaAmount = stats.restoreMana(itemData.value);
      const transform = this.playerEntity.getComponent('transform');
      if (transform && manaAmount > 0) {
        this.floatingTextManager.addManaRestore(transform.position.x, transform.position.y - 50, manaAmount);
      }
    }
  }

  /**
   * 生成掉落物
   */
  spawnLootItems(position, lootItems) {
    if (!lootItems || lootItems.length === 0) return;
    
    lootItems.forEach((item, index) => {
      const angle = (index / lootItems.length) * Math.PI * 2;
      const radius = 30;
      const dropX = position.x + Math.cos(angle) * radius;
      const dropY = position.y + Math.sin(angle) * radius;
      
      const lootEntity = this.createLootEntity(item, dropX, dropY);
      this.entities.push(lootEntity);
      this.equipmentItems.push(lootEntity);
    });
  }

  /**
   * 创建掉落物实体 - 子类可覆盖
   */
  createLootEntity(item, x, y) {
    const entity = new Entity(`loot_${Date.now()}_${Math.random()}`, 'loot');
    
    // 添加变换组件
    entity.addComponent(new TransformComponent(x, y));
    
    // 添加精灵组件 - 小长方形瓶子
    const color = item.type === 'health_potion' ? '#ff3333' : '#3333ff';
    const sprite = new SpriteComponent('loot_sprite', {
      width: 16,
      height: 24,
      color: color,
      visible: true,
      defaultAnimation: 'idle'
    });
    
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
    
    return entity;
  }

  /**
   * 移除死亡实体
   */
  removeDeadEntities() {
    const deadEntities = this.entities.filter(entity => entity.isDead);
    
    for (const entity of deadEntities) {
      const index = this.entities.indexOf(entity);
      if (index > -1) {
        this.entities.splice(index, 1);
      }
      
      const enemyIndex = this.enemyEntities.indexOf(entity);
      if (enemyIndex > -1) {
        this.enemyEntities.splice(enemyIndex, 1);
      }
    }
  }

  /**
   * 获取游戏状态
   */
  getGameState() {
    return {
      tutorialPhase: this.tutorialPhase,
      pickupItems: this.pickupItems
    };
  }


  /**
   * 渲染场景
   */
  render(ctx) {
    // 清空Canvas
    ctx.fillStyle = '#1a1a2e';
    ctx.fillRect(0, 0, this.logicalWidth, this.logicalHeight);
    
    // 保存上下文状态
    ctx.save();
    
    // 应用相机变换
    const viewBounds = this.camera.getViewBounds();
    ctx.translate(-viewBounds.left, -viewBounds.top);
    
    // 渲染背景 - 子类覆盖
    this.renderBackground(ctx);
    
    // 渲染可拾取物品
    this.renderPickupItems(ctx);
    
    // 渲染世界对象 - 子类可覆盖以添加自定义渲染
    this.renderWorldObjects(ctx);
    
    // 恢复上下文状态
    ctx.restore();
    
    // 渲染粒子系统
    this.particleSystem.render(ctx, this.camera);
    
    // 渲染技能特效
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
    
    // 渲染战斗系统
    if (this.combatSystem) {
      this.combatSystem.render(ctx);
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
    
    // 渲染底部控制栏
    if (this.bottomControlBar) {
      this.bottomControlBar.render(ctx);
    }
    
    // 渲染场景过渡
    if (this.isTransitioning) {
      this.renderTransition(ctx);
    }
  }

  /**
   * 渲染世界对象（实体等）- 子类可覆盖以添加自定义渲染顺序
   */
  renderWorldObjects(ctx) {
    // 默认按Y坐标排序渲染实体
    const sortedEntities = [...this.entities].sort((a, b) => {
      const transformA = a.getComponent('transform');
      const transformB = b.getComponent('transform');
      const yA = transformA ? transformA.position.y : 0;
      const yB = transformB ? transformB.position.y : 0;
      return yA - yB;
    });
    
    for (const entity of sortedEntities) {
      this.renderEntity(ctx, entity);
    }
  }

  /**
   * 渲染背景 - 子类覆盖
   */
  renderBackground(ctx) {
    ctx.fillStyle = '#2a2a2a';
    ctx.fillRect(0, 0, this.logicalWidth, this.logicalHeight);
  }

  /**
   * 渲染可拾取物品
   */
  renderPickupItems(ctx) {
    for (const item of this.pickupItems) {
      if (item.picked) continue;
      
      ctx.fillStyle = '#ffaa00';
      ctx.beginPath();
      ctx.arc(item.x, item.y, 10, 0, Math.PI * 2);
      ctx.fill();
      
      ctx.fillStyle = '#ffffff';
      ctx.font = '12px Arial';
      ctx.textAlign = 'center';
      ctx.fillText(item.name, item.x, item.y - 15);
    }
    
    for (const item of this.equipmentItems) {
      if (item.picked) continue;
      
      const x = item.x;
      const y = item.y;
      
      ctx.fillStyle = '#ffaa00';
      ctx.beginPath();
      ctx.arc(x, y, 10, 0, Math.PI * 2);
      ctx.fill();
      
      ctx.fillStyle = '#ffffff';
      ctx.font = '12px Arial';
      ctx.textAlign = 'center';
      ctx.fillText(item.name, x, y - 15);
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
    const size = sprite?.width || 32;
    const height = sprite?.height || 32;
    
    // 检查是否被选中
    const isSelected = this.combatSystem && this.combatSystem.selectedTarget === entity;
    
    // 渲染精灵
    if (sprite && sprite.visible) {
      if (isSelected) {
        ctx.strokeStyle = '#ffff00';
        ctx.lineWidth = 3;
        ctx.strokeRect(x - size/2 - 3, y - height/2 - 3, size + 6, height + 6);
      }
      
      ctx.fillStyle = sprite.color || '#00ff00';
      ctx.fillRect(x - size/2, y - height/2, size, height);
      
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
      
      const textWidth = ctx.measureText(nameComponent.name).width;
      const padding = 4;
      
      ctx.fillStyle = 'rgba(0, 0, 0, 0.6)';
      ctx.fillRect(x - textWidth / 2 - padding, nameY - 16, textWidth + padding * 2, 18);
      
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
      
      ctx.fillStyle = '#333333';
      ctx.fillRect(barX, barY, barWidth, barHeight);
      
      const hpRatio = stats.hp / stats.maxHp;
      ctx.fillStyle = hpRatio > 0.5 ? '#00ff00' : hpRatio > 0.2 ? '#ffaa00' : '#ff0000';
      ctx.fillRect(barX, barY, barWidth * hpRatio, barHeight);
      
      ctx.strokeStyle = '#ffffff';
      ctx.lineWidth = 1;
      ctx.strokeRect(barX, barY, barWidth, barHeight);
    }
  }

  /**
   * 切换到下一幕
   */
  switchToNextScene() {
    const stats = this.playerEntity.getComponent('stats');
    const inventory = this.playerEntity.getComponent('inventory');
    const equipment = this.playerEntity.getComponent('equipment');
    
    const sceneData = {
      player: {
        id: this.playerEntity.id,
        name: this.playerEntity.name || '玩家',
        class: this.playerEntity.class || 'refugee',
        level: stats?.level || 1,
        hp: stats?.hp || 100,
        maxHp: stats?.maxHp || 100,
        mp: stats?.mp || 100,
        maxMp: stats?.maxMp || 100,
        attack: stats?.attack || 10,
        defense: stats?.defense || 5,
        speed: stats?.speed || 100,
        inventory: inventory?.getAllItems() || [],
        equipment: equipment?.slots || {}
      },
      playerEntity: this.playerEntity,
      previousAct: this.actNumber
    };
    
    console.log(`BaseGameScene: 切换到下一幕，传递数据`, sceneData);
    this.goToNextScene(sceneData);
  }

  /**
   * 场景退出
   */
  exit() {
    super.exit();
    
    if (this.inputManager) {
      this.inputManager.destroy();
    }
    
    this.tutorialSystem.cleanup();
    
    for (const entity of this.entities) {
      entity.destroy();
    }
    this.entities = [];
    
    console.log(`BaseGameScene: 退出场景 ${this.name}`);
  }
}

export default BaseGameScene;
