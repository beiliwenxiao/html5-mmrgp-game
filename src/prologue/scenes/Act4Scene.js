/**
 * Act4Scene - 第四幕：职业选择
 * 
 * 继承自 BaseGameScene，包含第四幕特有功能：
 * - 职业选择界面
 * - 三位教官 NPC 系统（张梁、张宝、张角）
 * - 集成 SkillTreeSystem（职业技能树）
 * - 集成 UnitSystem（兵种特化）
 * - 集成 AttributeSystem（天赋树）
 * 
 * 需求：19, 20, 21, 22, 23
 */

import { BaseGameScene } from './BaseGameScene.js';
import { ClassSystem, ClassType, ClassNames } from '../../systems/ClassSystem.js';
import { SkillTreePanel } from '../../ui/SkillTreePanel.js';
import { UnitInfoPanel } from '../../ui/UnitInfoPanel.js';
import { AttributePanel } from '../../ui/AttributePanel.js';

export class Act4Scene extends BaseGameScene {
  constructor() {
    super(4, {
      title: '第四幕：职业选择',
      description: '选择你的职业，开启新的征程'
    });

    // 第四幕特有：职业系统
    this.classSystem = null;
    
    // 第四幕特有：UI面板
    this.skillTreePanel = null;
    this.unitInfoPanel = null;
    this.attributePanel = null;
    
    // 第四幕特有：教官NPCs
    this.instructors = [];
    
    // 第四幕特有：职业选择状态
    this.classSelected = false;
    this.selectedClass = null;
    this.hoveredInstructor = null;
    
    // 第四幕特有：对话阶段
    this.dialoguePhase = 'intro';
    
    // 第四幕特有：对话完成标志
    this.introDialogueCompleted = false;
    this.classSelectionDialogueCompleted = false;
    
    // 第四幕特有：场景完成标志
    this.isSceneComplete = false;
    
    // 第四幕特有：通知回调
    this.onNotification = null;
  }

  /**
   * 场景进入
   */
  enter(data = null) {
    // 调用父类的 enter，初始化所有基础系统
    super.enter(data);
    
    console.log('Act4Scene: 进入第四幕场景', data);
    
    // 重置玩家位置
    if (this.playerEntity) {
      const transform = this.playerEntity.getComponent('transform');
      if (transform) {
        transform.position.x = 400;
        transform.position.y = 450;
      }
    }
    
    // 清除前面幕次的敌人和物品
    this.enemyEntities = [];
    this.pickupItems = [];
    this.equipmentItems = [];
    
    // 初始化第四幕特有系统
    this.initializeAct4Systems();
    
    // 创建教官NPCs
    this.createInstructors();
    
    // 开始介绍对话
    this.startIntroDialogue();
  }

  /**
   * 初始化第四幕特有系统
   */
  initializeAct4Systems() {
    // 初始化职业系统
    this.classSystem = new ClassSystem();
    
    // 初始化技能树面板
    this.skillTreePanel = new SkillTreePanel({
      x: 50,
      y: 50,
      width: 700,
      height: 500,
      skillTreeSystem: this.classSystem.skillTreeSystem,
      character: this.getPlayerCharacterData()
    });
    
    // 初始化兵种信息面板
    this.unitInfoPanel = new UnitInfoPanel();
    this.unitInfoPanel.setPosition(this.logicalWidth - 320, 100);
    
    // 初始化属性面板（HTML面板）
    const container = document.body;
    this.attributePanel = new AttributePanel(container, this.classSystem.attributeSystem);
    
    // 注册UI元素
    this.uiClickHandler.registerElement(this.skillTreePanel);
    
    // 注册第四幕对话
    this.registerAct4Dialogues();
    
    // 注册第四幕教程
    this.registerAct4Tutorials();
    
    console.log('Act4Scene: 第四幕系统初始化完成');
  }

  /**
   * 获取玩家角色数据（用于技能树系统）
   */
  getPlayerCharacterData() {
    if (!this.playerEntity) return null;
    
    const stats = this.playerEntity.getComponent('stats');
    const name = this.playerEntity.getComponent('name');
    
    return {
      id: 'player',
      name: name ? name.name : '玩家',
      class: this.selectedClass || 'warrior',
      level: stats ? stats.level : 1,
      skillPoints: stats ? stats.skillPoints : 5
    };
  }

  /**
   * 注册第四幕对话
   */
  registerAct4Dialogues() {
    // 介绍对话
    this.dialogueSystem.registerDialogue('intro', {
      title: '职业选择',
      startNode: 'start',
      nodes: {
        start: { 
          speaker: '张角', 
          portrait: 'zhangjiao', 
          text: '你已经掌握了基本的生存技能。现在，是时候选择你的道路了。', 
          nextNode: 'player_question' 
        },
        player_question: { 
          speaker: '你', 
          portrait: 'player', 
          text: '我该如何选择？', 
          nextNode: 'zhangjiao_explain' 
        },
        zhangjiao_explain: { 
          speaker: '张角', 
          portrait: 'zhangjiao', 
          text: '我和我的两位兄弟，各自精通不同的战斗之道。你可以向我们学习。', 
          nextNode: 'zhangjiao_introduce' 
        },
        zhangjiao_introduce: { 
          speaker: '张角', 
          portrait: 'zhangjiao', 
          text: '张梁精通近战，张宝擅长远程，而我则掌握法术之道。选择适合你的职业吧。', 
          nextNode: null 
        }
      }
    });

    // 战士职业对话
    this.dialogueSystem.registerDialogue('warrior_intro', {
      title: '战士之道',
      startNode: 'start',
      nodes: {
        start: { 
          speaker: '张梁', 
          portrait: 'zhangliang', 
          text: '你想学习战士之道？很好！战士是战场上的铁壁，拥有强大的生命值和防御力。', 
          nextNode: 'player_interest' 
        },
        player_interest: { 
          speaker: '你', 
          portrait: 'player', 
          text: '请教我战士的技能。', 
          nextNode: 'zhangliang_teach' 
        },
        zhangliang_teach: { 
          speaker: '张梁', 
          portrait: 'zhangliang', 
          text: '战士可以选择成为重甲步兵或狂战士。重甲步兵专注防御，狂战士专注攻击。', 
          nextNode: null 
        }
      }
    });

    // 弓箭手职业对话
    this.dialogueSystem.registerDialogue('archer_intro', {
      title: '弓箭手之道',
      startNode: 'start',
      nodes: {
        start: { 
          speaker: '张宝', 
          portrait: 'zhangbao', 
          text: '你想学习弓箭手之道？明智的选择！弓箭手拥有高攻击力和敏捷，擅长风筝和爆发。', 
          nextNode: 'player_interest' 
        },
        player_interest: { 
          speaker: '你', 
          portrait: 'player', 
          text: '请教我弓箭手的技能。', 
          nextNode: 'zhangbao_teach' 
        },
        zhangbao_teach: { 
          speaker: '张宝', 
          portrait: 'zhangbao', 
          text: '弓箭手可以选择成为弓骑兵或连弩步兵。弓骑兵机动性强，连弩步兵爆发伤害高。', 
          nextNode: null 
        }
      }
    });

    // 法师职业对话
    this.dialogueSystem.registerDialogue('mage_intro', {
      title: '法师之道',
      startNode: 'start',
      nodes: {
        start: { 
          speaker: '张角', 
          portrait: 'zhangjiao', 
          text: '你想学习法师之道？法师拥有强大的法术伤害和控制能力，但生命值较低。', 
          nextNode: 'player_interest' 
        },
        player_interest: { 
          speaker: '你', 
          portrait: 'player', 
          text: '请教我法师的技能。', 
          nextNode: 'zhangjiao_teach' 
        },
        zhangjiao_teach: { 
          speaker: '张角', 
          portrait: 'zhangjiao', 
          text: '法师可以选择火系或冰系。火系专注爆发伤害，冰系专注控制和持续伤害。', 
          nextNode: null 
        }
      }
    });
  }

  /**
   * 注册第四幕教程
   */
  registerAct4Tutorials() {
    // 职业选择教程
    this.tutorialSystem.registerTutorial('class_selection', {
      id: 'class_selection',
      title: '职业选择',
      content: '点击教官NPC选择你的职业。每个职业都有独特的技能树和兵种特化。',
      triggerCondition: () => this.introDialogueCompleted && !this.classSelected,
      completionCondition: () => this.classSelected,
      pauseGame: false
    });

    // 技能树教程
    this.tutorialSystem.registerTutorial('skill_tree', {
      id: 'skill_tree',
      title: '技能树系统',
      content: '按 T 键打开技能树，学习职业专属技能。',
      triggerCondition: () => this.classSelected,
      completionCondition: () => true,
      pauseGame: false
    });

    // 属性分配教程
    this.tutorialSystem.registerTutorial('attribute_allocation', {
      id: 'attribute_allocation',
      title: '属性分配',
      content: '按 A 键打开属性面板，分配属性点提升角色能力。',
      triggerCondition: () => this.classSelected,
      completionCondition: () => true,
      pauseGame: false
    });

    // 兵种特化教程
    this.tutorialSystem.registerTutorial('unit_specialization', {
      id: 'unit_specialization',
      title: '兵种特化',
      content: '按 U 键查看兵种信息，了解兵种相克关系和升级路径。',
      triggerCondition: () => this.classSelected,
      completionCondition: () => true,
      pauseGame: false
    });
  }

  /**
   * 创建教官NPCs
   */
  createInstructors() {
    // 张梁 - 战士教官
    this.instructors.push({
      id: 'zhangliang',
      name: '张梁',
      title: '地公将军',
      classType: ClassType.WARRIOR,
      position: { x: 200, y: 300 },
      color: '#FF5722'
    });

    // 张宝 - 弓箭手教官
    this.instructors.push({
      id: 'zhangbao',
      name: '张宝',
      title: '人公将军',
      classType: ClassType.ARCHER,
      position: { x: 400, y: 300 },
      color: '#4CAF50'
    });

    // 张角 - 法师教官
    this.instructors.push({
      id: 'zhangjiao',
      name: '张角',
      title: '天公将军',
      classType: ClassType.MAGE,
      position: { x: 600, y: 300 },
      color: '#2196F3'
    });
  }

  /**
   * 开始介绍对话
   */
  startIntroDialogue() {
    this.dialoguePhase = 'intro';
    this.dialogueSystem.startDialogue('intro');
  }

  /**
   * 选择职业
   */
  selectClass(classType) {
    if (this.classSelected) {
      console.log('Act4Scene: 已经选择过职业');
      return;
    }

    // 使用职业系统选择职业
    const success = this.classSystem.selectClass('player', classType);
    if (!success) {
      console.error('Act4Scene: 职业选择失败');
      return;
    }

    this.selectedClass = classType;
    this.classSelected = true;

    // 更新玩家实体的职业
    if (this.playerEntity) {
      const stats = this.playerEntity.getComponent('stats');
      if (stats) {
        stats.class = classType;
        stats.skillPoints = 5; // 给予初始技能点
      }
    }

    // 更新技能树面板
    if (this.skillTreePanel) {
      this.skillTreePanel.character = this.getPlayerCharacterData();
      this.skillTreePanel.updateSkillTree();
    }

    // 给予职业初始装备
    this.giveClassEquipment(classType);

    // 显示职业选择成功提示
    const className = ClassNames[classType];
    this.notify(`你选择了 ${className} 职业！`, 'success');

    console.log(`Act4Scene: 选择职业 ${className}`);
  }

  /**
   * 给予职业初始装备
   */
  giveClassEquipment(classType) {
    const startingEquipment = this.classSystem.getStartingEquipment(classType);
    
    if (!this.playerEntity || !startingEquipment) return;

    const inventory = this.playerEntity.getComponent('inventory');
    if (!inventory) return;

    for (const equipData of startingEquipment) {
      const equipment = {
        id: equipData.id,
        name: equipData.name,
        type: 'equipment',
        subType: equipData.type,
        rarity: 1,
        maxStack: 1,
        stats: this.getEquipmentStats(classType, equipData.type)
      };

      inventory.addItem(equipment, 1);
      this.notify(`得到 ${equipment.name}`, 'success');
    }
  }

  /**
   * 获取装备属性（根据职业和装备类型）
   */
  getEquipmentStats(classType, equipType) {
    const stats = {};

    if (equipType === 'weapon') {
      switch (classType) {
        case ClassType.WARRIOR:
          stats.attack = 20;
          break;
        case ClassType.ARCHER:
          stats.attack = 25;
          break;
        case ClassType.MAGE:
          stats.attack = 15;
          stats.magicAttack = 30;
          break;
      }
    } else if (equipType === 'armor') {
      switch (classType) {
        case ClassType.WARRIOR:
          stats.defense = 15;
          stats.maxHp = 50;
          break;
        case ClassType.ARCHER:
          stats.defense = 8;
          stats.maxHp = 30;
          break;
        case ClassType.MAGE:
          stats.defense = 5;
          stats.maxMp = 50;
          break;
      }
    } else if (equipType === 'accessory') {
      switch (classType) {
        case ClassType.WARRIOR:
          stats.defense = 10;
          break;
        case ClassType.ARCHER:
          stats.speed = 20;
          break;
        case ClassType.MAGE:
          stats.maxMp = 30;
          break;
      }
    }

    return stats;
  }

  /**
   * 设置通知回调
   */
  setNotificationCallback(callback) {
    this.onNotification = callback;
  }

  /**
   * 发送通知
   */
  notify(message, type = 'info') {
    console.log(`Act4Scene 通知: ${message}`);
    if (this.onNotification) {
      this.onNotification(message, type);
    }
  }

  /**
   * 更新场景 - 覆盖父类方法，添加第四幕特有逻辑
   */
  update(deltaTime) {
    // 调用父类的 update
    super.update(deltaTime);

    // 更新职业系统
    if (this.classSystem) {
      // 职业系统没有update方法，不需要更新
    }

    // 更新技能树面板
    if (this.skillTreePanel) {
      this.skillTreePanel.update(deltaTime);
    }

    // 更新兵种信息面板
    if (this.unitInfoPanel && this.playerEntity) {
      // 兵种信息面板没有update方法，不需要更新
    }

    // 第四幕特有：检查对话流程
    this.updateDialogueFlow();

    // 第四幕特有：检查教官悬停
    this.updateInstructorHover();
  }

  /**
   * 更新对话流程
   */
  updateDialogueFlow() {
    if (this.dialogueSystem && !this.dialogueSystem.isDialogueActive()) {
      // 介绍对话结束
      if (this.dialoguePhase === 'intro' && !this.introDialogueCompleted) {
        this.introDialogueCompleted = true;
      }
      // 职业选择对话结束
      else if (this.dialoguePhase === 'class_selection' && !this.classSelectionDialogueCompleted) {
        this.classSelectionDialogueCompleted = true;
      }
    }
  }

  /**
   * 更新教官悬停状态
   */
  updateInstructorHover() {
    if (!this.inputManager || this.classSelected) {
      this.hoveredInstructor = null;
      return;
    }

    const mouseWorldPos = this.inputManager.getMouseWorldPosition(this.camera);
    this.hoveredInstructor = null;

    for (const instructor of this.instructors) {
      const dx = mouseWorldPos.x - instructor.position.x;
      const dy = mouseWorldPos.y - instructor.position.y;
      const distance = Math.sqrt(dx * dx + dy * dy);

      if (distance <= 40) {
        this.hoveredInstructor = instructor;
        break;
      }
    }
  }

  /**
   * 处理输入 - 覆盖父类方法，添加第四幕特有输入
   */
  handleInput(input) {
    // 调用父类的输入处理
    super.handleInput(input);

    // T键 - 打开技能树
    if (input.keyPressed('KeyT') && this.classSelected && this.skillTreePanel) {
      this.skillTreePanel.toggle();
    }

    // A键 - 打开属性面板
    if (input.keyPressed('KeyA') && this.classSelected && this.attributePanel) {
      if (this.attributePanel.isOpen()) {
        this.attributePanel.hide();
      } else {
        this.attributePanel.show('player');
      }
    }

    // U键 - 打开兵种信息面板
    if (input.keyPressed('KeyU') && this.classSelected && this.unitInfoPanel && this.playerEntity) {
      if (this.unitInfoPanel.isVisible()) {
        this.unitInfoPanel.hide();
      } else {
        this.unitInfoPanel.show(this.playerEntity);
      }
    }

    // 点击教官选择职业
    if (!this.classSelected && this.inputManager.isMouseClicked() && !this.inputManager.isMouseClickHandled()) {
      this.handleInstructorClick();
    }
  }

  /**
   * 处理教官点击
   */
  handleInstructorClick() {
    if (!this.hoveredInstructor) return;

    const instructor = this.hoveredInstructor;

    // 开始职业对话
    this.dialoguePhase = 'class_selection';
    
    switch (instructor.classType) {
      case ClassType.WARRIOR:
        this.dialogueSystem.startDialogue('warrior_intro');
        break;
      case ClassType.ARCHER:
        this.dialogueSystem.startDialogue('archer_intro');
        break;
      case ClassType.MAGE:
        this.dialogueSystem.startDialogue('mage_intro');
        break;
    }

    // 对话结束后选择职业
    setTimeout(() => {
      if (!this.dialogueSystem.isDialogueActive()) {
        this.selectClass(instructor.classType);
      }
    }, 100);

    this.inputManager.markMouseClickHandled();
  }

  /**
   * 渲染背景 - 覆盖父类方法，渲染第四幕背景
   */
  renderBackground(ctx) {
    // 绘制训练场背景
    ctx.fillStyle = '#87CEEB';
    ctx.fillRect(0, 0, this.logicalWidth, this.logicalHeight);

    // 绘制地面
    ctx.fillStyle = '#8B7355';
    ctx.fillRect(0, this.logicalHeight - 150, this.logicalWidth, 150);

    // 绘制训练场标记
    ctx.strokeStyle = '#FFFFFF';
    ctx.lineWidth = 3;
    ctx.setLineDash([10, 5]);
    ctx.strokeRect(100, 200, 600, 250);
    ctx.setLineDash([]);
  }

  /**
   * 渲染场景 - 覆盖父类方法，添加第四幕特有渲染
   */
  render(ctx) {
    // 调用父类的 render
    super.render(ctx);

    // 渲染场景标题
    this.renderSceneTitle(ctx);

    // 渲染教官NPCs（在相机变换之后）
    ctx.save();
    const viewBounds = this.camera.getViewBounds();
    ctx.translate(-viewBounds.left, -viewBounds.top);

    for (const instructor of this.instructors) {
      this.renderInstructor(ctx, instructor);
    }

    ctx.restore();

    // 渲染技能树面板
    if (this.skillTreePanel && this.skillTreePanel.isVisible) {
      this.skillTreePanel.render(ctx);
    }

    // 渲染兵种信息面板
    if (this.unitInfoPanel && this.unitInfoPanel.isVisible()) {
      this.unitInfoPanel.render(ctx);
    }

    // 渲染提示信息
    this.renderHints(ctx);

    // 渲染职业选择UI
    if (!this.classSelected && this.introDialogueCompleted) {
      this.renderClassSelectionUI(ctx);
    }
  }

  /**
   * 渲染场景标题
   */
  renderSceneTitle(ctx) {
    ctx.save();

    ctx.fillStyle = 'rgba(0, 0, 0, 0.7)';
    ctx.fillRect(0, 0, this.logicalWidth, 80);

    ctx.fillStyle = '#FFD700';
    ctx.font = 'bold 32px Arial';
    ctx.textAlign = 'center';
    ctx.fillText('第四幕：职业选择', this.logicalWidth / 2, 50);

    ctx.restore();
  }

  /**
   * 渲染教官NPC
   */
  renderInstructor(ctx, instructor) {
    ctx.save();

    const isHovered = this.hoveredInstructor === instructor;
    const radius = isHovered ? 45 : 40;

    // 绘制悬停光晕
    if (isHovered && !this.classSelected) {
      ctx.fillStyle = 'rgba(255, 255, 255, 0.3)';
      ctx.beginPath();
      ctx.arc(instructor.position.x, instructor.position.y, radius + 10, 0, Math.PI * 2);
      ctx.fill();
    }

    // 绘制教官圆形
    ctx.fillStyle = instructor.color;
    ctx.beginPath();
    ctx.arc(instructor.position.x, instructor.position.y, radius, 0, Math.PI * 2);
    ctx.fill();

    // 绘制边框
    ctx.strokeStyle = isHovered ? '#FFFFFF' : '#000000';
    ctx.lineWidth = 3;
    ctx.stroke();

    // 绘制教官名称
    ctx.fillStyle = '#FFFFFF';
    ctx.font = 'bold 18px Arial';
    ctx.textAlign = 'center';
    ctx.fillText(instructor.name, instructor.position.x, instructor.position.y - 55);

    // 绘制教官称号
    ctx.font = '14px Arial';
    ctx.fillStyle = '#FFD700';
    ctx.fillText(instructor.title, instructor.position.x, instructor.position.y - 75);

    // 绘制职业名称
    const className = ClassNames[instructor.classType];
    ctx.font = 'bold 16px Arial';
    ctx.fillStyle = '#FFFFFF';
    ctx.fillText(className, instructor.position.x, instructor.position.y + 5);

    // 如果悬停，显示"点击选择"提示
    if (isHovered && !this.classSelected) {
      ctx.font = '12px Arial';
      ctx.fillStyle = '#FFFF00';
      ctx.fillText('点击选择', instructor.position.x, instructor.position.y + 60);
    }

    ctx.restore();
  }

  /**
   * 渲染职业选择UI
   */
  renderClassSelectionUI(ctx) {
    ctx.save();

    // 绘制职业介绍背景
    const panelY = this.logicalHeight - 200;
    ctx.fillStyle = 'rgba(0, 0, 0, 0.8)';
    ctx.fillRect(0, panelY, this.logicalWidth, 200);

    ctx.strokeStyle = '#FFD700';
    ctx.lineWidth = 2;
    ctx.strokeRect(0, panelY, this.logicalWidth, 200);

    // 绘制标题
    ctx.fillStyle = '#FFD700';
    ctx.font = 'bold 24px Arial';
    ctx.textAlign = 'center';
    ctx.fillText('选择你的职业', this.logicalWidth / 2, panelY + 35);

    // 绘制职业介绍
    const classDescriptions = {
      [ClassType.WARRIOR]: {
        name: '战士',
        desc: '近战专家，拥有强大的生命值和防御力',
        features: ['高生命值', '高防御力', '近战攻击']
      },
      [ClassType.ARCHER]: {
        name: '弓箭手',
        desc: '远程专家，拥有高攻击力和敏捷',
        features: ['高攻击力', '高敏捷', '远程攻击']
      },
      [ClassType.MAGE]: {
        name: '法师',
        desc: '魔法专家，拥有强大的法术伤害和控制能力',
        features: ['高魔法攻击', '高法力值', '范围控制']
      }
    };

    let startX = 50;
    const spacing = (this.logicalWidth - 100) / 3;

    for (const [classType, data] of Object.entries(classDescriptions)) {
      const x = startX + spacing / 2;
      const y = panelY + 70;

      ctx.fillStyle = '#FFFFFF';
      ctx.font = 'bold 18px Arial';
      ctx.textAlign = 'center';
      ctx.fillText(data.name, x, y);

      ctx.font = '12px Arial';
      ctx.fillStyle = '#CCCCCC';
      ctx.fillText(data.desc, x, y + 20);

      // 绘制特性
      ctx.font = '11px Arial';
      ctx.fillStyle = '#4CAF50';
      for (let i = 0; i < data.features.length; i++) {
        ctx.fillText(`• ${data.features[i]}`, x, y + 40 + i * 15);
      }

      startX += spacing;
    }

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
    } else if (!this.classSelected && this.introDialogueCompleted) {
      hints.push('点击教官选择职业');
    } else if (this.classSelected) {
      hints.push('按 T 键打开技能树 | 按 A 键分配属性 | 按 U 键查看兵种');
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
    // 清理第四幕特有资源
    this.classSystem = null;
    this.skillTreePanel = null;
    this.unitInfoPanel = null;
    
    // 隐藏属性面板
    if (this.attributePanel) {
      this.attributePanel.hide();
    }

    // 调用父类的 exit
    super.exit();
  }
}

export default Act4Scene;
