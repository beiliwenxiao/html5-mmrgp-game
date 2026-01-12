/**
 * Act1Scene - 第一幕：绝望的开始
 * 
 * 【教程专用简化实现】
 * 本场景采用简化的实现方式,不依赖完整的 ECS 架构。
 * 主游戏场景将使用 src/systems/ 下的核心系统。
 * 
 * 内容：
 * - 角色创建界面
 * - 移动教程（简化实现,未使用 MovementSystem）
 * - 拾取教程（简化实现,未使用 CollisionSystem）
 * - 装备教程（简化实现,未使用 EquipmentSystem）
 * - 战斗教程（简化实现,未使用 CombatSystem）
 * 
 * 需求：1, 2, 3, 4
 */

import { PrologueScene } from './PrologueScene.js';
import { TutorialSystem } from '../../systems/TutorialSystem.js';
import { DialogueSystem } from '../../systems/DialogueSystem.js';
import { QuestSystem } from '../../systems/QuestSystem.js';
import { TutorialConfig } from '../config/TutorialConfig.js';
import { TutorialConditions } from '../conditions/TutorialConditions.js';

export class Act1Scene extends PrologueScene {
  constructor() {
    super(1, {});
    
    // 教程阶段
    this.tutorialPhase = 'character_creation'; // character_creation, movement, pickup, equipment, combat
    
    // 角色创建状态
    this.characterCreated = false;
    this.characterName = '';
    
    // 可拾取物品列表
    this.pickupItems = [];
    
    // 教程完成标记
    this.tutorialsCompleted = {
      movement: false,
      pickup: false,
      equipment: false,
      combat: false
    };
    
    // 移动距离追踪（用于教程）
    this.playerMovedDistance = 0;
    this.lastPlayerPosition = null;
    
    // 战斗系统
    this.combatWave = 0; // 0=野狗, 1=官府士兵, 2=土匪, 3=饥民围困
    this.currentEnemies = [];
    this.waveCompleted = false;
    
    // 死亡状态
    this.playerDied = false;
    this.deathTriggered = false;
    
    // 场景过渡
    this.isTransitioning = false;
    this.transitionAlpha = 0; // 0=透明, 1=完全黑屏
    this.transitionPhase = 'none'; // none, fade_out, show_text, fade_in
    this.transitionTimer = 0;
    this.transitionDuration = 2.0; // 淡入淡出持续时间（秒）
    this.textDisplayDuration = 3.0; // 文本显示持续时间（秒）
  }

  /**
   * 场景进入
   */
  enter(data = null) {
    super.enter(data);
    
    // 初始化序章专用系统
    this.tutorialSystem = new TutorialSystem();
    this.dialogueSystem = new DialogueSystem();
    this.questSystem = new QuestSystem();
    
    // 注意: 本场景不使用核心系统 (CombatSystem, MovementSystem, EquipmentSystem)
    // 这些系统需要完整的 ECS 架构支持,将在主游戏场景中使用
    this.questSystem = new QuestSystem();
    
    // 注册教程
    this.registerTutorials();
    
    // 显示角色创建界面
    this.showCharacterCreation();
    
    console.log('Act1Scene: 进入第一幕 - 绝望的开始');
  }

  /**
   * 显示角色创建界面
   */
  showCharacterCreation() {
    console.log('Act1Scene: 显示角色创建界面');
    
    // 这里应该显示UI界面让玩家输入角色名称
    // 暂时使用默认名称
    this.characterName = '灾民';
    this.characterCreated = true;
    
    // 创建玩家角色
    this.createPlayerCharacter();
    
    // 开始移动教程
    this.startMovementTutorial();
  }

  /**
   * 创建玩家角色
   */
  createPlayerCharacter() {
    // 这里应该创建玩家实体
    // 暂时只是标记状态
    console.log(`Act1Scene: 创建角色 - ${this.characterName}`);
    
    // 设置初始状态（低生命值、无装备、饥饿状态）
    if (this.player) {
      const stats = this.player.getComponent('stats');
      if (stats) {
        stats.hp = stats.maxHp * 0.3; // 30%生命值
      }
    }
  }

  /**
   * 注册教程
   */
  registerTutorials() {
    // 遍历教程配置，注册所有教程
    for (const tutorialId in TutorialConfig) {
      const config = TutorialConfig[tutorialId];
      
      // 构建教程配置对象
      const tutorialData = {
        title: config.title,
        description: config.description,
        steps: config.steps,
        pauseGame: config.pauseGame,
        canSkip: config.canSkip,
        priority: config.priority,
        // 触发条件：使用TutorialConditions中的条件函数
        triggerCondition: (gameState) => {
          return TutorialConditions.evaluate(
            config.triggerConditionId,
            this,
            gameState
          );
        },
        // 完成条件：使用TutorialConditions中的条件函数
        completionCondition: (gameState) => {
          return TutorialConditions.evaluate(
            config.completionConditionId,
            this,
            gameState
          );
        }
      };
      
      // 注册教程
      this.tutorialSystem.registerTutorial(tutorialId, tutorialData);
    }
    
    console.log(`Act1Scene: 已注册 ${Object.keys(TutorialConfig).length} 个教程`);
  }

  /**
   * 开始移动教程
   */
  startMovementTutorial() {
    console.log('Act1Scene: 开始移动教程');
    this.tutorialPhase = 'movement';
    
    // 显示移动教程
    this.tutorialSystem.showTutorial('movement');
  }

  /**
   * 开始拾取教程
   */
  startPickupTutorial() {
    console.log('Act1Scene: 开始拾取教程');
    this.tutorialPhase = 'pickup';
    
    // 生成可拾取物品
    this.spawnPickupItems();
    
    // 显示拾取教程
    this.tutorialSystem.showTutorial('pickup');
  }

  /**
   * 生成可拾取物品
   */
  spawnPickupItems() {
    // 生成破旧衣服、树棍、残羹
    const items = [
      { id: 'ragged_clothes', name: '破旧衣服', type: 'armor', x: 200, y: 200 },
      { id: 'wooden_stick', name: '树棍', type: 'weapon', x: 300, y: 250 },
      { id: 'leftover_food', name: '残羹', type: 'consumable', x: 250, y: 300 }
    ];
    
    for (const item of items) {
      this.pickupItems.push({
        ...item,
        picked: false
      });
      
      console.log(`Act1Scene: 生成物品 - ${item.name} at (${item.x}, ${item.y})`);
    }
  }

  /**
   * 开始装备教程
   */
  startEquipmentTutorial() {
    console.log('Act1Scene: 开始装备教程');
    this.tutorialPhase = 'equipment';
    
    // 显示装备教程
    this.tutorialSystem.showTutorial('equipment');
  }

  /**
   * 更新场景
   */
  update(deltaTime) {
    super.update(deltaTime);
    
    if (!this.isActive) {
      return;
    }
    
    // 更新场景过渡
    if (this.isTransitioning) {
      this.updateTransition(deltaTime);
      return; // 过渡期间不更新其他逻辑
    }
    
    if (this.isPaused) {
      return;
    }
    
    // 更新教程系统
    this.tutorialSystem.update(deltaTime, this.getGameState());
    
    // 更新教程阶段
    this.updateTutorialPhase(deltaTime);
    
    // 检查拾取
    this.checkPickup();
  }

  /**
   * 更新教程阶段
   */
  updateTutorialPhase(deltaTime) {
    // 移动教程阶段
    if (this.tutorialPhase === 'movement') {
      this.updateMovementTutorial(deltaTime);
    }
    // 拾取教程阶段
    else if (this.tutorialPhase === 'pickup') {
      this.updatePickupTutorial();
    }
    // 装备教程阶段
    else if (this.tutorialPhase === 'equipment') {
      this.updateEquipmentTutorial();
    }
    // 战斗教程阶段
    else if (this.tutorialPhase === 'combat') {
      this.updateCombatWave();
      this.checkPlayerDeath();
    }
  }

  /**
   * 更新移动教程
   */
  updateMovementTutorial(deltaTime) {
    if (!this.player) {
      return;
    }
    
    const transform = this.player.getComponent('transform');
    if (!transform) {
      return;
    }
    
    // 追踪移动距离
    if (this.lastPlayerPosition) {
      const dx = transform.position.x - this.lastPlayerPosition.x;
      const dy = transform.position.y - this.lastPlayerPosition.y;
      const distance = Math.sqrt(dx * dx + dy * dy);
      this.playerMovedDistance += distance;
    }
    
    this.lastPlayerPosition = { ...transform.position };
    
    // 检查是否完成移动教程
    if (this.playerMovedDistance >= 100 && !this.tutorialsCompleted.movement) {
      this.completeTutorial('movement');
      this.startPickupTutorial();
    }
  }

  /**
   * 更新拾取教程
   */
  updatePickupTutorial() {
    // 检查是否拾取了第一个物品
    const pickedCount = this.pickupItems.filter(item => item.picked).length;
    
    if (pickedCount > 0 && !this.tutorialsCompleted.pickup) {
      this.completeTutorial('pickup');
      this.startEquipmentTutorial();
    }
  }

  /**
   * 更新装备教程
   */
  updateEquipmentTutorial() {
    // 检查是否装备了武器
    if (this.player) {
      const equipment = this.player.getComponent('equipment');
      if (equipment && equipment.weapon && !this.tutorialsCompleted.equipment) {
        this.completeTutorial('equipment');
        // 装备教程完成后，进入战斗阶段
        console.log('Act1Scene: 装备教程完成，开始战斗教程');
        this.startCombatTutorial();
      }
    }
  }

  /**
   * 开始战斗教程
   */
  startCombatTutorial() {
    console.log('Act1Scene: 开始战斗教程');
    this.tutorialPhase = 'combat';
    
    // 显示战斗教程
    this.tutorialSystem.showTutorial('combat');
    
    // 生成第一波敌人（野狗）
    this.spawnCombatWave(0);
  }

  /**
   * 生成战斗波次
   * @param {number} waveIndex - 波次索引 (0=野狗, 1=官府士兵, 2=土匪, 3=饥民围困)
   */
  spawnCombatWave(waveIndex) {
    console.log(`Act1Scene: 生成第${waveIndex + 1}波敌人`);
    
    this.combatWave = waveIndex;
    this.waveCompleted = false;
    this.currentEnemies = [];
    
    // 根据波次生成不同的敌人
    switch (waveIndex) {
      case 0: // 野狗
        this.spawnWildDogs();
        break;
      case 1: // 官府士兵
        this.spawnSoldiers();
        break;
      case 2: // 土匪
        this.spawnBandits();
        break;
      case 3: // 饥民围困
        this.spawnStarvingMob();
        break;
    }
  }

  /**
   * 生成野狗
   */
  spawnWildDogs() {
    // 生成2只野狗
    for (let i = 0; i < 2; i++) {
      const enemy = {
        id: `wild_dog_${i}`,
        name: '野狗',
        type: 'wild_dog',
        level: 1,
        hp: 30,
        maxHp: 30,
        attack: 5,
        defense: 2,
        x: 400 + i * 100,
        y: 300,
        isDead: false
      };
      
      this.currentEnemies.push(enemy);
      console.log(`Act1Scene: 生成野狗 at (${enemy.x}, ${enemy.y})`);
    }
  }

  /**
   * 生成官府士兵
   */
  spawnSoldiers() {
    // 生成3个官府士兵
    for (let i = 0; i < 3; i++) {
      const enemy = {
        id: `soldier_${i}`,
        name: '官府士兵',
        type: 'soldier',
        level: 2,
        hp: 50,
        maxHp: 50,
        attack: 8,
        defense: 5,
        x: 400 + i * 80,
        y: 300,
        isDead: false
      };
      
      this.currentEnemies.push(enemy);
      console.log(`Act1Scene: 生成官府士兵 at (${enemy.x}, ${enemy.y})`);
    }
  }

  /**
   * 生成土匪
   */
  spawnBandits() {
    // 生成4个土匪
    for (let i = 0; i < 4; i++) {
      const enemy = {
        id: `bandit_${i}`,
        name: '土匪',
        type: 'bandit',
        level: 3,
        hp: 60,
        maxHp: 60,
        attack: 10,
        defense: 6,
        x: 400 + (i % 2) * 100,
        y: 300 + Math.floor(i / 2) * 80,
        isDead: false
      };
      
      this.currentEnemies.push(enemy);
      console.log(`Act1Scene: 生成土匪 at (${enemy.x}, ${enemy.y})`);
    }
  }

  /**
   * 生成饥民围困
   */
  spawnStarvingMob() {
    // 生成大量饥民（10个）
    for (let i = 0; i < 10; i++) {
      const angle = (i / 10) * Math.PI * 2;
      const radius = 150;
      const enemy = {
        id: `starving_${i}`,
        name: '饥民',
        type: 'starving',
        level: 2,
        hp: 40,
        maxHp: 40,
        attack: 6,
        defense: 3,
        x: 400 + Math.cos(angle) * radius,
        y: 300 + Math.sin(angle) * radius,
        isDead: false
      };
      
      this.currentEnemies.push(enemy);
    }
    
    console.log('Act1Scene: 生成饥民围困');
    
    // 显示对话
    this.showStarvingMobDialogue();
  }

  /**
   * 显示饥民围困对话
   */
  showStarvingMobDialogue() {
    // 注册对话
    this.dialogueSystem.registerDialogue('starving_mob', {
      title: '饥民围困',
      startNode: 'start',
      nodes: {
        start: {
          speaker: '饥民',
          text: '把食物交出来！',
          nextNode: null
        }
      }
    });
    
    // 播放对话
    this.dialogueSystem.startDialogue('starving_mob');
  }

  /**
   * 更新战斗波次
   */
  updateCombatWave() {
    // 检查当前波次的敌人是否全部死亡
    const aliveEnemies = this.currentEnemies.filter(e => !e.isDead);
    
    if (aliveEnemies.length === 0 && !this.waveCompleted) {
      this.waveCompleted = true;
      this.onWaveCompleted();
    }
  }

  /**
   * 波次完成回调
   */
  onWaveCompleted() {
    console.log(`Act1Scene: 第${this.combatWave + 1}波完成`);
    
    // 根据当前波次决定下一步
    if (this.combatWave === 0) {
      // 野狗波次完成，生成官府士兵
      setTimeout(() => {
        this.spawnCombatWave(1);
      }, 2000);
    } else if (this.combatWave === 1) {
      // 官府士兵波次完成，生成土匪
      setTimeout(() => {
        this.spawnCombatWave(2);
      }, 2000);
    } else if (this.combatWave === 2) {
      // 土匪波次完成，触发饥民围困
      this.tutorialsCompleted.combat = true;
      setTimeout(() => {
        this.spawnCombatWave(3);
      }, 2000);
    } else if (this.combatWave === 3) {
      // 饥民围困，玩家必然死亡
      // 这个波次不会完成，玩家会死亡
    }
  }

  /**
   * 检查玩家死亡
   */
  checkPlayerDeath() {
    if (!this.player || this.playerDied) {
      return;
    }
    
    const stats = this.player.getComponent('stats');
    if (!stats) {
      return;
    }
    
    // 检查生命值
    if (stats.hp <= 0) {
      this.triggerPlayerDeath();
    }
    
    // 在饥民围困波次，强制触发死亡（剧情需要）
    if (this.combatWave === 3 && !this.deathTriggered) {
      // 等待一段时间后触发死亡
      setTimeout(() => {
        if (!this.deathTriggered) {
          this.triggerPlayerDeath();
        }
      }, 5000);
    }
  }

  /**
   * 触发玩家死亡
   */
  triggerPlayerDeath() {
    if (this.deathTriggered) {
      return;
    }
    
    console.log('Act1Scene: 玩家死亡');
    
    this.playerDied = true;
    this.deathTriggered = true;
    
    // 播放死亡动画
    if (this.player) {
      const sprite = this.player.getComponent('sprite');
      if (sprite) {
        sprite.playAnimation('death');
      }
    }
    
    // 显示死亡文本后过渡到第二幕
    setTimeout(() => {
      this.showDeathText();
    }, 1000);
  }

  /**
   * 显示死亡文本
   */
  showDeathText() {
    console.log('Act1Scene: 显示死亡文本');
    
    // 开始场景过渡
    this.startTransition();
  }

  /**
   * 开始场景过渡
   */
  startTransition() {
    console.log('Act1Scene: 开始场景过渡');
    
    this.isTransitioning = true;
    this.transitionPhase = 'fade_out';
    this.transitionAlpha = 0;
    this.transitionTimer = 0;
  }

  /**
   * 更新场景过渡
   * @param {number} deltaTime - 时间增量（秒）
   */
  updateTransition(deltaTime) {
    this.transitionTimer += deltaTime;
    
    switch (this.transitionPhase) {
      case 'fade_out':
        // 淡出到黑屏
        this.transitionAlpha = Math.min(1, this.transitionTimer / this.transitionDuration);
        
        if (this.transitionAlpha >= 1) {
          // 淡出完成，显示文本
          this.transitionPhase = 'show_text';
          this.transitionTimer = 0;
        }
        break;
        
      case 'show_text':
        // 显示死亡文本
        if (this.transitionTimer >= this.textDisplayDuration) {
          // 文本显示完成，准备切换场景
          this.transitionPhase = 'switch_scene';
          this.transitionTimer = 0;
        }
        break;
        
      case 'switch_scene':
        // 切换到第二幕
        this.performSceneSwitch();
        break;
    }
  }

  /**
   * 执行场景切换
   */
  performSceneSwitch() {
    console.log('Act1Scene: 执行场景切换');
    
    // 准备传递给第二幕的数据
    const sceneData = {
      player: this.player,
      characterName: this.characterName,
      previousAct: 1
    };
    
    // 切换到第二幕
    this.goToNextScene(sceneData);
  }

  /**
   * 检查拾取
   */
  checkPickup() {
    if (!this.player) {
      return;
    }
    
    const transform = this.player.getComponent('transform');
    if (!transform) {
      return;
    }
    
    // 检查玩家是否靠近可拾取物品
    for (const item of this.pickupItems) {
      if (item.picked) {
        continue;
      }
      
      const dx = transform.position.x - item.x;
      const dy = transform.position.y - item.y;
      const distance = Math.sqrt(dx * dx + dy * dy);
      
      // 如果在拾取范围内（50像素）
      if (distance <= 50) {
        // 显示拾取提示
        item.showPrompt = true;
        
        // 检查是否按下E键
        // 这里应该通过InputManager检查，暂时简化
        // if (inputManager.isKeyPressed('interact')) {
        //   this.pickupItem(item);
        // }
      } else {
        item.showPrompt = false;
      }
    }
  }

  /**
   * 拾取物品
   */
  pickupItem(item) {
    if (item.picked) {
      return;
    }
    
    console.log(`Act1Scene: 拾取物品 - ${item.name}`);
    
    item.picked = true;
    
    // 添加到背包
    // 这里应该调用InventorySystem
    
    // 如果是残羹，恢复生命值
    if (item.id === 'leftover_food' && this.player) {
      const stats = this.player.getComponent('stats');
      if (stats) {
        stats.heal(20);
        console.log('Act1Scene: 恢复20点生命值');
      }
    }
  }

  /**
   * 完成教程
   */
  completeTutorial(tutorialId) {
    console.log(`Act1Scene: 完成教程 - ${tutorialId}`);
    
    if (tutorialId === 'movement') {
      this.tutorialsCompleted.movement = true;
      this.tutorialSystem.completeTutorial();
    } else if (tutorialId === 'pickup') {
      this.tutorialsCompleted.pickup = true;
      this.tutorialSystem.completeTutorial();
    } else if (tutorialId === 'equipment') {
      this.tutorialsCompleted.equipment = true;
      this.tutorialSystem.completeTutorial();
    }
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
    super.render(ctx);
    
    // 渲染玩家
    this.renderPlayer(ctx);
    
    // 渲染可拾取物品
    this.renderPickupItems(ctx);
    
    // 渲染拾取提示
    this.renderPickupPrompts(ctx);
    
    // 渲染敌人
    this.renderEnemies(ctx);
    
    // 渲染场景过渡效果
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
      if (item.picked) {
        continue;
      }
      
      // 绘制物品图标（简单的圆圈）
      ctx.fillStyle = '#ffaa00';
      ctx.beginPath();
      ctx.arc(item.x, item.y, 10, 0, Math.PI * 2);
      ctx.fill();
      
      // 绘制物品名称
      ctx.fillStyle = '#ffffff';
      ctx.font = '12px Arial';
      ctx.textAlign = 'center';
      ctx.fillText(item.name, item.x, item.y - 15);
    }
    
    ctx.restore();
  }

  /**
   * 渲染玩家
   */
  renderPlayer(ctx) {
    if (!this.player) {
      return;
    }
    
    const transform = this.player.getComponent('transform');
    if (!transform) {
      return;
    }
    
    ctx.save();
    
    // 绘制玩家（蓝色圆圈）
    ctx.fillStyle = '#00aaff';
    ctx.beginPath();
    ctx.arc(transform.position.x, transform.position.y, 20, 0, Math.PI * 2);
    ctx.fill();
    
    // 绘制玩家名称
    ctx.fillStyle = '#ffffff';
    ctx.font = 'bold 14px Arial';
    ctx.textAlign = 'center';
    ctx.fillText(this.characterName || '玩家', transform.position.x, transform.position.y - 30);
    
    // 绘制生命值条
    const stats = this.player.getComponent('stats');
    if (stats) {
      const hpBarWidth = 50;
      const hpBarHeight = 5;
      const hpPercent = stats.hp / stats.maxHp;
      
      // 背景
      ctx.fillStyle = '#333333';
      ctx.fillRect(
        transform.position.x - hpBarWidth / 2,
        transform.position.y + 25,
        hpBarWidth,
        hpBarHeight
      );
      
      // 生命值
      ctx.fillStyle = hpPercent > 0.5 ? '#00ff00' : hpPercent > 0.25 ? '#ffff00' : '#ff0000';
      ctx.fillRect(
        transform.position.x - hpBarWidth / 2,
        transform.position.y + 25,
        hpBarWidth * hpPercent,
        hpBarHeight
      );
    }
    
    ctx.restore();
  }

  /**
   * 渲染拾取提示
   */
  renderPickupPrompts(ctx) {
    ctx.save();
    
    for (const item of this.pickupItems) {
      if (item.picked || !item.showPrompt) {
        continue;
      }
      
      // 绘制提示文本
      ctx.fillStyle = '#ffffff';
      ctx.font = 'bold 14px Arial';
      ctx.textAlign = 'center';
      ctx.fillText('按E拾取', item.x, item.y + 25);
    }
    
    ctx.restore();
  }

  /**
   * 渲染敌人
   */
  renderEnemies(ctx) {
    ctx.save();
    
    for (const enemy of this.currentEnemies) {
      if (enemy.isDead) {
        continue;
      }
      
      // 绘制敌人（简单的红色圆圈）
      ctx.fillStyle = '#ff0000';
      ctx.beginPath();
      ctx.arc(enemy.x, enemy.y, 15, 0, Math.PI * 2);
      ctx.fill();
      
      // 绘制敌人名称
      ctx.fillStyle = '#ffffff';
      ctx.font = '12px Arial';
      ctx.textAlign = 'center';
      ctx.fillText(enemy.name, enemy.x, enemy.y - 20);
      
      // 绘制生命值条
      const hpBarWidth = 40;
      const hpBarHeight = 4;
      const hpPercent = enemy.hp / enemy.maxHp;
      
      // 背景
      ctx.fillStyle = '#333333';
      ctx.fillRect(enemy.x - hpBarWidth / 2, enemy.y + 20, hpBarWidth, hpBarHeight);
      
      // 生命值
      ctx.fillStyle = '#00ff00';
      ctx.fillRect(enemy.x - hpBarWidth / 2, enemy.y + 20, hpBarWidth * hpPercent, hpBarHeight);
    }
    
    ctx.restore();
  }

  /**
   * 渲染死亡文本
   */
  renderDeathText(ctx) {
    ctx.save();
    
    // 黑屏效果
    ctx.fillStyle = 'rgba(0, 0, 0, 0.8)';
    ctx.fillRect(0, 0, ctx.canvas.width, ctx.canvas.height);
    
    // 死亡文本
    ctx.fillStyle = '#ffffff';
    ctx.font = 'bold 32px Arial';
    ctx.textAlign = 'center';
    ctx.fillText('你死了...', ctx.canvas.width / 2, ctx.canvas.height / 2 - 20);
    
    ctx.font = '24px Arial';
    ctx.fillText('但这不是结局', ctx.canvas.width / 2, ctx.canvas.height / 2 + 20);
    
    ctx.restore();
  }

  /**
   * 渲染场景过渡效果
   */
  renderTransition(ctx) {
    ctx.save();
    
    // 黑屏效果（根据alpha值）
    ctx.fillStyle = `rgba(0, 0, 0, ${this.transitionAlpha})`;
    ctx.fillRect(0, 0, ctx.canvas.width, ctx.canvas.height);
    
    // 如果在显示文本阶段，渲染死亡文本
    if (this.transitionPhase === 'show_text' && this.transitionAlpha >= 1) {
      ctx.fillStyle = '#ffffff';
      ctx.font = 'bold 32px Arial';
      ctx.textAlign = 'center';
      ctx.fillText('你昏迷了过去...', ctx.canvas.width / 2, ctx.canvas.height / 2 - 20);
      
      ctx.font = '24px Arial';
      ctx.fillText('但这不是结局', ctx.canvas.width / 2, ctx.canvas.height / 2 + 20);
    }
    
    ctx.restore();
  }

  /**
   * 场景退出
   */
  exit() {
    console.log('Act1Scene: 退出第一幕');
    
    // 清理系统
    if (this.tutorialSystem) {
      this.tutorialSystem.reset();
    }
    if (this.dialogueSystem) {
      this.dialogueSystem.reset();
    }
    if (this.questSystem) {
      this.questSystem.reset();
    }
    
    super.exit();
  }
}

export default Act1Scene;
