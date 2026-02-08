/**
 * Act5Scene - 第五幕：四场战斗
 * 
 * 继承自 BaseGameScene，包含第五幕特有功能：
 * - 四场大型战役（起义之战、广宗之战、阳城之战、黄巾终战）
 * - 历史武将登场系统
 * - NPC招募系统（管骇、周仓）
 * - 战斗选择系统
 * - 大规模战斗系统
 * 
 * 需求：24, 25, 26, 27, 28, 29, 30, 31
 */

import { BaseGameScene } from './BaseGameScene.js';
import { NPCRecruitmentSystem } from '../../systems/NPCRecruitmentSystem.js';

export class Act5Scene extends BaseGameScene {
  constructor() {
    super(5, {
      title: '第五幕：四场战斗',
      description: '黄巾起义的关键战役'
    });

    // 第五幕特有：战斗管理
    this.currentBattle = 0;  // 0=起义, 1=广宗, 2=阳城, 3=黄巾终战
    this.battleResults = [];
    this.battleState = 'intro';  // intro, battle, choice, result, complete
    
    // 第五幕特有：NPC招募系统
    this.npcRecruitmentSystem = null;
    this.recruitedNPCs = [];
    
    // 第五幕特有：历史武将
    this.historicalGenerals = [];
    
    // 第五幕特有：大规模战斗
    this.friendlyUnits = [];
    this.enemyUnits = [];
    this.battleMorale = 100;  // 友军士气
    
    // 第五幕特有：战斗选择
    this.currentChoice = null;
    this.choiceTimer = 0;
    
    // 第五幕特有：对话完成标志
    this.introDialogueCompleted = false;
    
    // 第五幕特有：场景完成标志
    this.isSceneComplete = false;
  }

  /**
   * 场景进入
   */
  enter(data = null) {
    // 调用父类的 enter，初始化所有基础系统
    super.enter(data);
    
    console.log('Act5Scene: 进入第五幕场景', data);
    
    // 重置玩家位置
    if (this.playerEntity) {
      const transform = this.playerEntity.getComponent('transform');
      if (transform) {
        transform.position.x = 400;
        transform.position.y = 500;
      }
    }
    
    // 清除前面幕次的敌人和物品
    this.enemyEntities = [];
    this.pickupItems = [];
    this.equipmentItems = [];
    
    // 初始化第五幕特有系统
    this.initializeAct5Systems();
    
    // 开始介绍对话
    this.startIntroDialogue();
  }

  /**
   * 初始化第五幕特有系统
   */
  initializeAct5Systems() {
    // 初始化NPC招募系统
    this.npcRecruitmentSystem = new NPCRecruitmentSystem();
    
    // 注册可招募的NPC
    this.registerRecruitableNPCs();
    
    // 注册第五幕对话
    this.registerAct5Dialogues();
    
    // 注册第五幕教程
    this.registerAct5Tutorials();
    
    console.log('Act5Scene: 第五幕系统初始化完成');
  }

  /**
   * 注册可招募的NPC
   */
  registerRecruitableNPCs() {
    // 管骇 - 广宗之战后可招募
    this.npcRecruitmentSystem.registerNPC('guanhai', {
      id: 'guanhai',
      name: '管骇',
      title: '黄巾猛将',
      class: 'warrior',
      level: 10,
      stats: {
        maxHp: 300,
        hp: 300,
        attack: 40,
        defense: 25,
        speed: 100
      },
      recruitCondition: 'rescue_zhangliang',
      description: '黄巾军猛将，擅长近战'
    });
    
    // 周仓 - 阳城之战后可招募
    this.npcRecruitmentSystem.registerNPC('zhoucang', {
      id: 'zhoucang',
      name: '周仓',
      title: '黄巾勇士',
      class: 'warrior',
      level: 12,
      stats: {
        maxHp: 350,
        hp: 350,
        attack: 45,
        defense: 30,
        speed: 110
      },
      recruitCondition: 'rescue_zhangbao',
      description: '黄巾军勇士，力大无穷'
    });
  }

  /**
   * 注册第五幕对话
   */
  registerAct5Dialogues() {
    // 介绍对话
    this.dialogueSystem.registerDialogue('act5_intro', {
      title: '四场战斗',
      startNode: 'start',
      nodes: {
        start: { 
          speaker: '张角', 
          portrait: 'zhangjiao', 
          text: '苍天已死，黄天当立！岁在甲子，天下大吉！', 
          nextNode: 'player_ready' 
        },
        player_ready: { 
          speaker: '你', 
          portrait: 'player', 
          text: '我已准备好战斗！', 
          nextNode: 'zhangjiao_explain' 
        },
        zhangjiao_explain: { 
          speaker: '张角', 
          portrait: 'zhangjiao', 
          text: '我们将面临四场关键战役。每一场都关系到黄巾军的命运。', 
          nextNode: 'zhangjiao_warning' 
        },
        zhangjiao_warning: { 
          speaker: '张角', 
          portrait: 'zhangjiao', 
          text: '朝廷派出了众多名将。你要小心应对，保护好我的兄弟们。', 
          nextNode: null 
        }
      }
    });

    // 起义之战对话
    this.dialogueSystem.registerDialogue('battle_uprising', {
      title: '起义之战',
      startNode: 'start',
      nodes: {
        start: { 
          speaker: '张角', 
          portrait: 'zhangjiao', 
          text: '第一战：占领县城！让朝廷看看我们的力量！', 
          nextNode: null 
        }
      }
    });

    // 广宗之战对话
    this.dialogueSystem.registerDialogue('battle_guangzong', {
      title: '广宗之战',
      startNode: 'start',
      nodes: {
        start: { 
          speaker: '张角', 
          portrait: 'zhangjiao', 
          text: '张梁在广宗被皇甫嵩围困！我们必须救援！', 
          nextNode: 'player_concern' 
        },
        player_concern: { 
          speaker: '你', 
          portrait: 'player', 
          text: '敌军势大，我们能成功吗？', 
          nextNode: 'zhangjiao_determination' 
        },
        zhangjiao_determination: { 
          speaker: '张角', 
          portrait: 'zhangjiao', 
          text: '不管如何，我们不能抛弃兄弟！', 
          nextNode: null 
        }
      }
    });

    // 阳城之战对话
    this.dialogueSystem.registerDialogue('battle_yangcheng', {
      title: '阳城之战',
      startNode: 'start',
      nodes: {
        start: { 
          speaker: '张角', 
          portrait: 'zhangjiao', 
          text: '张宝在阳城遭遇刘备军！刘关张三兄弟都在！', 
          nextNode: 'player_worry' 
        },
        player_worry: { 
          speaker: '你', 
          portrait: 'player', 
          text: '刘关张...他们的名声我听说过。', 
          nextNode: 'zhangjiao_encourage' 
        },
        zhangjiao_encourage: { 
          speaker: '张角', 
          portrait: 'zhangjiao', 
          text: '名声再大，也只是凡人。我们有信仰的力量！', 
          nextNode: null 
        }
      }
    });

    // 黄巾终战对话
    this.dialogueSystem.registerDialogue('battle_final', {
      title: '黄巾终战',
      startNode: 'start',
      nodes: {
        start: { 
          speaker: '张角', 
          portrait: 'zhangjiao', 
          text: '我...病重了。朝廷大军压境，这可能是最后一战。', 
          nextNode: 'player_refuse' 
        },
        player_refuse: { 
          speaker: '你', 
          portrait: 'player', 
          text: '不！我们一定能赢！', 
          nextNode: 'zhangjiao_calm' 
        },
        zhangjiao_calm: { 
          speaker: '张角', 
          portrait: 'zhangjiao', 
          text: '生死有命...但黄天之志，永不磨灭！', 
          nextNode: null 
        }
      }
    });
  }

  /**
   * 注册第五幕教程
   */
  registerAct5Tutorials() {
    // 大规模战斗教程
    this.tutorialSystem.registerTutorial('large_scale_battle', {
      id: 'large_scale_battle',
      title: '大规模战斗',
      content: '战场上有大量友军和敌军。击败敌军指挥官可以提升友军士气！',
      triggerCondition: () => this.currentBattle === 0 && this.battleState === 'battle',
      completionCondition: () => true,
      pauseGame: false
    });

    // 救援选择教程
    this.tutorialSystem.registerTutorial('rescue_choice', {
      id: 'rescue_choice',
      title: '救援选择',
      content: '战斗中会出现关键选择。你的决定将影响战斗结果和NPC招募！',
      triggerCondition: () => this.currentChoice !== null,
      completionCondition: () => true,
      pauseGame: false
    });

    // 历史武将教程
    this.tutorialSystem.registerTutorial('historical_generals', {
      id: 'historical_generals',
      title: '历史武将',
      content: '历史武将拥有特殊技能和强大属性。小心应对！',
      triggerCondition: () => this.historicalGenerals.length > 0,
      completionCondition: () => true,
      pauseGame: false
    });
  }

  /**
   * 开始介绍对话
   */
  startIntroDialogue() {
    this.battleState = 'intro';
    this.dialogueSystem.startDialogue('act5_intro');
  }

  /**
   * 开始战斗
   * @param {number} battleIndex - 战斗索引 (0-3)
   */
  startBattle(battleIndex) {
    this.currentBattle = battleIndex;
    this.battleState = 'battle';
    
    // 清除之前的战斗单位
    this.friendlyUnits = [];
    this.enemyUnits = [];
    this.historicalGenerals = [];
    
    // 重置士气
    this.battleMorale = 100;
    
    console.log(`Act5Scene: 开始战斗 ${battleIndex}`);
    
    // 根据战斗索引开始对应的战斗
    switch (battleIndex) {
      case 0:
        this.startUprisingBattle();
        break;
      case 1:
        this.startGuangzongBattle();
        break;
      case 2:
        this.startYangchengBattle();
        break;
      case 3:
        this.startFinalBattle();
        break;
    }
  }

  /**
   * 结束战斗
   * @param {Object} result - 战斗结果
   */
  endBattle(result) {
    this.battleResults.push(result);
    this.battleState = 'result';
    
    console.log(`Act5Scene: 战斗结束`, result);
    
    // 显示战斗结果
    this.showBattleResult(result);
    
    // 延迟后进入下一场战斗或结束场景
    setTimeout(() => {
      if (this.currentBattle < 3) {
        this.startBattle(this.currentBattle + 1);
      } else {
        this.completeScene();
      }
    }, 3000);
  }

  /**
   * 显示战斗结果
   * @param {Object} result - 战斗结果
   */
  showBattleResult(result) {
    if (!this.playerEntity) return;
    
    const transform = this.playerEntity.getComponent('transform');
    if (!transform) return;
    
    const resultText = result.victory ? '战斗胜利！' : '战斗失败...';
    const resultColor = result.victory ? '#00ff00' : '#ff0000';
    
    this.floatingTextManager.addText(
      transform.position.x,
      transform.position.y - 100,
      resultText,
      resultColor
    );
    
    // 如果有救援成功，显示招募信息
    if (result.rescued && result.recruitedNPC) {
      setTimeout(() => {
        this.floatingTextManager.addText(
          transform.position.x,
          transform.position.y - 120,
          `${result.recruitedNPC} 加入队伍！`,
          '#ffff00'
        );
      }, 1000);
    }
  }

  /**
   * 完成场景
   */
  completeScene() {
    this.isSceneComplete = true;
    this.battleState = 'complete';
    
    console.log('Act5Scene: 第五幕完成');
    
    // 显示完成提示
    if (this.playerEntity) {
      const transform = this.playerEntity.getComponent('transform');
      if (transform) {
        this.floatingTextManager.addText(
          transform.position.x,
          transform.position.y - 100,
          '第五幕完成！',
          '#ffd700'
        );
      }
    }
  }

  /**
   * 起义之战 - 占领县城
   * 需求: 24, 30
   */
  startUprisingBattle() {
    console.log('Act5Scene: 开始起义之战');
    
    // 播放战斗对话
    this.dialogueSystem.startDialogue('battle_uprising');
    
    // 生成友军单位（50个黄巾军）
    for (let i = 0; i < 50; i++) {
      const friendlyUnit = this.createFriendlyUnit(
        `friendly_${i}`,
        '黄巾军',
        {
          x: 200 + Math.random() * 200,
          y: 400 + Math.random() * 100
        }
      );
      this.friendlyUnits.push(friendlyUnit);
      this.entities.push(friendlyUnit);
    }
    
    // 生成敌军单位（40个官府士兵）
    for (let i = 0; i < 40; i++) {
      const enemyUnit = this.createEnemyUnit(
        `enemy_${i}`,
        '官府士兵',
        {
          x: 600 + Math.random() * 200,
          y: 200 + Math.random() * 100
        },
        {
          maxHp: 80,
          hp: 80,
          attack: 12,
          defense: 8,
          speed: 100
        }
      );
      this.enemyUnits.push(enemyUnit);
      this.entities.push(enemyUnit);
      this.enemyEntities.push(enemyUnit);
    }
    
    // 生成敌军指挥官
    const commander = this.createEnemyUnit(
      'commander_uprising',
      '县令',
      { x: 700, y: 250 },
      {
        maxHp: 200,
        hp: 200,
        attack: 25,
        defense: 15,
        speed: 110
      }
    );
    commander.isCommander = true;
    this.enemyUnits.push(commander);
    this.entities.push(commander);
    this.enemyEntities.push(commander);
    
    console.log(`Act5Scene: 起义之战 - 友军${this.friendlyUnits.length}，敌军${this.enemyUnits.length}`);
  }

  /**
   * 广宗之战 - 救援张梁，曹操登场
   * 需求: 25, 29, 31
   */
  startGuangzongBattle() {
    console.log('Act5Scene: 开始广宗之战');
    
    // 播放战斗对话
    this.dialogueSystem.startDialogue('battle_guangzong');
    
    // 生成张梁（被包围）
    const zhangliang = this.createAllyNPC(
      'zhangliang',
      '张梁',
      { x: 700, y: 300 },
      {
        maxHp: 400,
        hp: 200,  // 生命值较低
        attack: 50,
        defense: 30,
        speed: 120
      }
    );
    zhangliang.needsRescue = true;
    this.friendlyUnits.push(zhangliang);
    this.entities.push(zhangliang);
    
    // 生成友军单位（30个黄巾军）
    for (let i = 0; i < 30; i++) {
      const friendlyUnit = this.createFriendlyUnit(
        `friendly_guangzong_${i}`,
        '黄巾军',
        {
          x: 200 + Math.random() * 200,
          y: 400 + Math.random() * 100
        }
      );
      this.friendlyUnits.push(friendlyUnit);
      this.entities.push(friendlyUnit);
    }
    
    // 生成敌军单位（50个官府士兵，包围张梁）
    for (let i = 0; i < 50; i++) {
      const angle = (i / 50) * Math.PI * 2;
      const radius = 150;
      const enemyUnit = this.createEnemyUnit(
        `enemy_guangzong_${i}`,
        '官府士兵',
        {
          x: 700 + Math.cos(angle) * radius,
          y: 300 + Math.sin(angle) * radius
        },
        {
          maxHp: 100,
          hp: 100,
          attack: 15,
          defense: 10,
          speed: 110
        }
      );
      this.enemyUnits.push(enemyUnit);
      this.entities.push(enemyUnit);
      this.enemyEntities.push(enemyUnit);
    }
    
    // 生成历史武将：曹操
    const caocao = this.createHistoricalGeneral(
      'caocao',
      '曹操',
      '孟德',
      { x: 800, y: 200 },
      {
        maxHp: 500,
        hp: 500,
        attack: 60,
        defense: 40,
        speed: 150
      }
    );
    this.historicalGenerals.push(caocao);
    this.enemyUnits.push(caocao);
    this.entities.push(caocao);
    this.enemyEntities.push(caocao);
    
    console.log(`Act5Scene: 广宗之战 - 友军${this.friendlyUnits.length}，敌军${this.enemyUnits.length}，武将${this.historicalGenerals.length}`);
  }

  /**
   * 阳城之战 - 救援张宝，刘关张登场，周仓加入
   * 需求: 26, 29, 31
   */
  startYangchengBattle() {
    console.log('Act5Scene: 开始阳城之战');
    
    // 播放战斗对话
    this.dialogueSystem.startDialogue('battle_yangcheng');
    
    // 生成张宝（被包围）
    const zhangbao = this.createAllyNPC(
      'zhangbao',
      '张宝',
      { x: 700, y: 300 },
      {
        maxHp: 380,
        hp: 180,  // 生命值较低
        attack: 55,
        defense: 28,
        speed: 130
      }
    );
    zhangbao.needsRescue = true;
    this.friendlyUnits.push(zhangbao);
    this.entities.push(zhangbao);
    
    // 生成周仓（拖住赵云）
    const zhoucang = this.createAllyNPC(
      'zhoucang',
      '周仓',
      { x: 600, y: 200 },
      {
        maxHp: 350,
        hp: 350,
        attack: 45,
        defense: 30,
        speed: 110
      }
    );
    zhoucang.canRecruit = true;
    this.friendlyUnits.push(zhoucang);
    this.entities.push(zhoucang);
    
    // 生成友军单位（25个黄巾军）
    for (let i = 0; i < 25; i++) {
      const friendlyUnit = this.createFriendlyUnit(
        `friendly_yangcheng_${i}`,
        '黄巾军',
        {
          x: 200 + Math.random() * 200,
          y: 400 + Math.random() * 100
        }
      );
      this.friendlyUnits.push(friendlyUnit);
      this.entities.push(friendlyUnit);
    }
    
    // 生成敌军单位（40个官府士兵）
    for (let i = 0; i < 40; i++) {
      const enemyUnit = this.createEnemyUnit(
        `enemy_yangcheng_${i}`,
        '官府士兵',
        {
          x: 600 + Math.random() * 200,
          y: 200 + Math.random() * 100
        },
        {
          maxHp: 110,
          hp: 110,
          attack: 18,
          defense: 12,
          speed: 115
        }
      );
      this.enemyUnits.push(enemyUnit);
      this.entities.push(enemyUnit);
      this.enemyEntities.push(enemyUnit);
    }
    
    // 生成历史武将：刘备、关羽、张飞
    const liubei = this.createHistoricalGeneral(
      'liubei',
      '刘备',
      '玄德',
      { x: 750, y: 150 },
      {
        maxHp: 450,
        hp: 450,
        attack: 50,
        defense: 35,
        speed: 140
      }
    );
    this.historicalGenerals.push(liubei);
    this.enemyUnits.push(liubei);
    this.entities.push(liubei);
    this.enemyEntities.push(liubei);
    
    const guanyu = this.createHistoricalGeneral(
      'guanyu',
      '关羽',
      '云长',
      { x: 800, y: 180 },
      {
        maxHp: 550,
        hp: 550,
        attack: 70,
        defense: 45,
        speed: 160
      }
    );
    this.historicalGenerals.push(guanyu);
    this.enemyUnits.push(guanyu);
    this.entities.push(guanyu);
    this.enemyEntities.push(guanyu);
    
    const zhangfei = this.createHistoricalGeneral(
      'zhangfei',
      '张飞',
      '翼德',
      { x: 850, y: 200 },
      {
        maxHp: 600,
        hp: 600,
        attack: 75,
        defense: 40,
        speed: 155
      }
    );
    this.historicalGenerals.push(zhangfei);
    this.enemyUnits.push(zhangfei);
    this.entities.push(zhangfei);
    this.enemyEntities.push(zhangfei);
    
    console.log(`Act5Scene: 阳城之战 - 友军${this.friendlyUnits.length}，敌军${this.enemyUnits.length}，武将${this.historicalGenerals.length}`);
  }

  /**
   * 黄巾终战 - 救援张角，众多武将登场
   * 需求: 27, 31
   */
  startFinalBattle() {
    console.log('Act5Scene: 开始黄巾终战');
    
    // 播放战斗对话
    this.dialogueSystem.startDialogue('battle_final');
    
    // 生成张角（病重）
    const zhangjiao = this.createAllyNPC(
      'zhangjiao',
      '张角',
      { x: 400, y: 300 },
      {
        maxHp: 500,
        hp: 100,  // 生命值很低
        attack: 80,
        defense: 50,
        speed: 100
      }
    );
    zhangjiao.needsRescue = true;
    zhangjiao.isDying = true;
    this.friendlyUnits.push(zhangjiao);
    this.entities.push(zhangjiao);
    
    // 生成友军单位（20个黄巾军，士气低落）
    for (let i = 0; i < 20; i++) {
      const friendlyUnit = this.createFriendlyUnit(
        `friendly_final_${i}`,
        '黄巾军',
        {
          x: 300 + Math.random() * 200,
          y: 400 + Math.random() * 100
        }
      );
      this.friendlyUnits.push(friendlyUnit);
      this.entities.push(friendlyUnit);
    }
    
    // 生成敌军单位（60个官府士兵）
    for (let i = 0; i < 60; i++) {
      const enemyUnit = this.createEnemyUnit(
        `enemy_final_${i}`,
        '官府士兵',
        {
          x: 600 + Math.random() * 300,
          y: 200 + Math.random() * 200
        },
        {
          maxHp: 120,
          hp: 120,
          attack: 20,
          defense: 15,
          speed: 120
        }
      );
      this.enemyUnits.push(enemyUnit);
      this.entities.push(enemyUnit);
      this.enemyEntities.push(enemyUnit);
    }
    
    // 生成众多历史武将
    const generals = [
      { id: 'luzhi', name: '卢植', title: '北中郎将', x: 700, y: 150, hp: 480, attack: 55, defense: 38 },
      { id: 'zhujun', name: '朱儁', title: '右中郎将', x: 750, y: 180, hp: 500, attack: 58, defense: 40 },
      { id: 'huangfusong', name: '皇甫嵩', title: '左中郎将', x: 800, y: 200, hp: 520, attack: 60, defense: 42 },
      { id: 'zoujing', name: '邹靖', title: '护军', x: 850, y: 220, hp: 450, attack: 52, defense: 36 },
      { id: 'caocao2', name: '曹操', title: '骑都尉', x: 900, y: 240, hp: 500, attack: 60, defense: 40 },
      { id: 'caohong', name: '曹洪', title: '曹军将领', x: 950, y: 260, hp: 480, attack: 56, defense: 38 },
      { id: 'sunjian', name: '孙坚', title: '破虏将军', x: 1000, y: 280, hp: 550, attack: 65, defense: 45 }
    ];
    
    for (const generalData of generals) {
      const general = this.createHistoricalGeneral(
        generalData.id,
        generalData.name,
        generalData.title,
        { x: generalData.x, y: generalData.y },
        {
          maxHp: generalData.hp,
          hp: generalData.hp,
          attack: generalData.attack,
          defense: generalData.defense,
          speed: 150
        }
      );
      this.historicalGenerals.push(general);
      this.enemyUnits.push(general);
      this.entities.push(general);
      this.enemyEntities.push(general);
    }
    
    // 降低友军士气
    this.battleMorale = 50;
    
    console.log(`Act5Scene: 黄巾终战 - 友军${this.friendlyUnits.length}，敌军${this.enemyUnits.length}，武将${this.historicalGenerals.length}`);
  }

  /**
   * 创建友军单位
   */
  createFriendlyUnit(id, name, position) {
    const unit = this.entityFactory.createEnemy({
      id: id,
      name: name,
      position: position,
      stats: {
        maxHp: 100,
        hp: 100,
        attack: 15,
        defense: 10,
        speed: 100
      },
      aiType: 'aggressive'
    });
    
    // 标记为友军
    unit.type = 'friendly';
    unit.isFriendly = true;
    
    // 修改颜色为绿色
    const sprite = unit.getComponent('sprite');
    if (sprite) {
      sprite.color = '#4CAF50';
    }
    
    return unit;
  }

  /**
   * 创建敌军单位
   */
  createEnemyUnit(id, name, position, stats) {
    const unit = this.entityFactory.createEnemy({
      id: id,
      name: name,
      position: position,
      stats: stats,
      aiType: 'aggressive'
    });
    
    return unit;
  }

  /**
   * 创建盟友NPC
   */
  createAllyNPC(id, name, position, stats) {
    const npc = this.entityFactory.createEnemy({
      id: id,
      name: name,
      position: position,
      stats: stats,
      aiType: 'defensive'
    });
    
    // 标记为盟友
    npc.type = 'ally';
    npc.isAlly = true;
    npc.isFriendly = true;
    
    // 修改颜色为蓝色
    const sprite = npc.getComponent('sprite');
    if (sprite) {
      sprite.color = '#2196F3';
    }
    
    // 修改名字颜色为金色
    const nameComp = npc.getComponent('name');
    if (nameComp) {
      nameComp.color = '#FFD700';
    }
    
    return npc;
  }

  /**
   * 创建历史武将
   */
  createHistoricalGeneral(id, name, title, position, stats) {
    const general = this.entityFactory.createEnemy({
      id: id,
      name: `${name}·${title}`,
      position: position,
      stats: stats,
      aiType: 'aggressive'
    });
    
    // 标记为历史武将
    general.isHistoricalGeneral = true;
    general.title = title;
    general.retreatThreshold = stats.maxHp * 0.2;  // 生命值低于20%时撤退
    
    // 修改颜色为紫色
    const sprite = general.getComponent('sprite');
    if (sprite) {
      sprite.color = '#9C27B0';
      sprite.width = 40;  // 更大的体型
      sprite.height = 40;
    }
    
    // 修改名字颜色为紫色
    const nameComp = general.getComponent('name');
    if (nameComp) {
      nameComp.color = '#9C27B0';
      nameComp.fontSize = 16;
    }
    
    return general;
  }

  /**
   * 更新场景 - 覆盖父类方法，添加第五幕特有逻辑
   */
  update(deltaTime) {
    // 调用父类的 update
    super.update(deltaTime);
    
    // 更新NPC招募系统
    if (this.npcRecruitmentSystem) {
      this.npcRecruitmentSystem.update(deltaTime);
    }
    
    // 第五幕特有：检查对话流程
    this.updateDialogueFlow();
    
    // 第五幕特有：更新战斗状态
    if (this.battleState === 'battle') {
      this.updateBattleState(deltaTime);
    }
    
    // 第五幕特有：更新历史武将
    this.updateHistoricalGenerals();
    
    // 第五幕特有：更新战斗选择
    if (this.currentChoice) {
      this.updateBattleChoice(deltaTime);
    }
  }

  /**
   * 更新对话流程
   */
  updateDialogueFlow() {
    if (this.dialogueSystem && !this.dialogueSystem.isDialogueActive()) {
      // 介绍对话结束 -> 开始第一场战斗
      if (this.battleState === 'intro' && !this.introDialogueCompleted) {
        this.introDialogueCompleted = true;
        setTimeout(() => {
          this.startBattle(0);
        }, 1000);
      }
    }
  }

  /**
   * 更新战斗状态
   */
  updateBattleState(deltaTime) {
    // 检查胜利条件：所有敌军被击败
    const aliveEnemies = this.enemyUnits.filter(e => !e.isDead && !e.isDying);
    if (aliveEnemies.length === 0) {
      this.endBattle({
        victory: true,
        battleIndex: this.currentBattle,
        rescued: false,
        recruitedNPC: null
      });
      return;
    }
    
    // 检查失败条件：所有友军被击败
    const aliveFriendlies = this.friendlyUnits.filter(e => !e.isDead && !e.isDying);
    if (aliveFriendlies.length === 0) {
      this.endBattle({
        victory: false,
        battleIndex: this.currentBattle,
        rescued: false,
        recruitedNPC: null
      });
      return;
    }
    
    // 更新士气
    this.updateMorale();
    
    // 检查救援条件
    this.checkRescueConditions();
  }

  /**
   * 更新士气
   */
  updateMorale() {
    const aliveFriendlies = this.friendlyUnits.filter(e => !e.isDead && !e.isDying).length;
    const aliveEnemies = this.enemyUnits.filter(e => !e.isDead && !e.isDying).length;
    
    // 根据友军和敌军数量比例计算士气
    const ratio = aliveFriendlies / (aliveEnemies + 1);
    this.battleMorale = Math.min(100, Math.max(0, ratio * 50 + 50));
    
    // 士气影响友军战斗力
    for (const unit of this.friendlyUnits) {
      if (unit.isDead || unit.isDying) continue;
      
      const stats = unit.getComponent('stats');
      if (stats) {
        // 士气高时提升攻击力
        const moraleBonus = (this.battleMorale - 50) / 100;
        stats.attackBonus = moraleBonus * 10;
      }
    }
  }

  /**
   * 检查救援条件
   */
  checkRescueConditions() {
    // 检查是否有需要救援的NPC
    for (const unit of this.friendlyUnits) {
      if (!unit.needsRescue || unit.rescued) continue;
      
      const stats = unit.getComponent('stats');
      const transform = unit.getComponent('transform');
      if (!stats || !transform) continue;
      
      // 检查玩家是否靠近
      if (this.playerEntity) {
        const playerTransform = this.playerEntity.getComponent('transform');
        if (playerTransform) {
          const dx = transform.position.x - playerTransform.position.x;
          const dy = transform.position.y - playerTransform.position.y;
          const distance = Math.sqrt(dx * dx + dy * dy);
          
          // 如果玩家靠近且周围敌人较少，触发救援选择
          if (distance < 100) {
            const nearbyEnemies = this.countNearbyEnemies(transform.position, 200);
            if (nearbyEnemies < 5) {
              this.triggerRescueChoice(unit);
            }
          }
        }
      }
    }
  }

  /**
   * 计算附近敌人数量
   */
  countNearbyEnemies(position, radius) {
    let count = 0;
    for (const enemy of this.enemyUnits) {
      if (enemy.isDead || enemy.isDying) continue;
      
      const transform = enemy.getComponent('transform');
      if (!transform) continue;
      
      const dx = transform.position.x - position.x;
      const dy = transform.position.y - position.y;
      const distance = Math.sqrt(dx * dx + dy * dy);
      
      if (distance <= radius) {
        count++;
      }
    }
    return count;
  }

  /**
   * 触发救援选择
   */
  triggerRescueChoice(npc) {
    if (this.currentChoice) return;  // 已有选择在进行中
    
    this.currentChoice = {
      type: 'rescue',
      npc: npc,
      options: [
        { id: 'rescue', text: `救援${npc.name}`, action: () => this.rescueNPC(npc) },
        { id: 'retreat', text: '撤退', action: () => this.retreatFromRescue() }
      ],
      timer: 10  // 10秒选择时间
    };
    
    this.choiceTimer = 10;
    
    console.log(`Act5Scene: 触发救援选择 - ${npc.name}`);
  }

  /**
   * 救援NPC
   */
  rescueNPC(npc) {
    npc.rescued = true;
    npc.needsRescue = false;
    
    // 恢复NPC生命值
    const stats = npc.getComponent('stats');
    if (stats) {
      stats.heal(stats.maxHp);
    }
    
    // 显示救援成功提示
    const transform = npc.getComponent('transform');
    if (transform) {
      this.floatingTextManager.addText(
        transform.position.x,
        transform.position.y - 60,
        `${npc.name} 获救！`,
        '#00ff00'
      );
    }
    
    // 检查是否可以招募NPC
    this.checkNPCRecruitment(npc);
    
    this.currentChoice = null;
    
    console.log(`Act5Scene: 救援成功 - ${npc.name}`);
  }

  /**
   * 从救援中撤退
   */
  retreatFromRescue() {
    this.currentChoice = null;
    
    // 显示撤退提示
    if (this.playerEntity) {
      const transform = this.playerEntity.getComponent('transform');
      if (transform) {
        this.floatingTextManager.addText(
          transform.position.x,
          transform.position.y - 60,
          '放弃救援',
          '#ff6666'
        );
      }
    }
    
    console.log('Act5Scene: 放弃救援');
  }

  /**
   * 检查NPC招募
   */
  checkNPCRecruitment(npc) {
    // 根据战斗索引和NPC判断是否可以招募
    let recruitNPCId = null;
    
    if (this.currentBattle === 1 && npc.id === 'zhangliang') {
      // 广宗之战救援张梁后，招募管骇
      recruitNPCId = 'guanhai';
    } else if (this.currentBattle === 2 && npc.id === 'zhangbao') {
      // 阳城之战救援张宝后，招募周仓
      recruitNPCId = 'zhoucang';
    }
    
    if (recruitNPCId) {
      const recruited = this.npcRecruitmentSystem.recruitNPC(recruitNPCId, this.playerEntity);
      if (recruited) {
        this.recruitedNPCs.push(recruitNPCId);
        
        // 显示招募提示
        const npcData = this.npcRecruitmentSystem.getNPC(recruitNPCId);
        if (npcData && this.playerEntity) {
          const transform = this.playerEntity.getComponent('transform');
          if (transform) {
            this.floatingTextManager.addText(
              transform.position.x,
              transform.position.y - 80,
              `${npcData.name} 加入队伍！`,
              '#ffff00'
            );
          }
        }
      }
    }
  }

  /**
   * 更新战斗选择
   */
  updateBattleChoice(deltaTime) {
    if (!this.currentChoice) return;
    
    this.choiceTimer -= deltaTime;
    
    // 超时自动选择撤退
    if (this.choiceTimer <= 0) {
      this.retreatFromRescue();
    }
  }

  /**
   * 更新历史武将
   */
  updateHistoricalGenerals() {
    for (const general of this.historicalGenerals) {
      if (general.isDead || general.isDying) continue;
      
      const stats = general.getComponent('stats');
      if (!stats) continue;
      
      // 检查是否应该撤退
      if (stats.hp <= general.retreatThreshold && !general.isRetreating) {
        this.generalRetreat(general);
      }
    }
  }

  /**
   * 武将撤退
   */
  generalRetreat(general) {
    general.isRetreating = true;
    
    // 显示撤退提示
    const transform = general.getComponent('transform');
    if (transform) {
      this.floatingTextManager.addText(
        transform.position.x,
        transform.position.y - 60,
        `${general.name} 撤退！`,
        '#ffaa00'
      );
    }
    
    // 标记为死亡（实际是撤退）
    general.isDead = true;
    
    console.log(`Act5Scene: ${general.name} 撤退`);
  }

  /**
   * 处理输入 - 覆盖父类方法，添加第五幕特有输入
   */
  handleInput(input) {
    // 调用父类的输入处理
    super.handleInput(input);
    
    // 处理战斗选择输入
    if (this.currentChoice) {
      // 1键 - 选择第一个选项
      if (input.keyPressed('Digit1')) {
        if (this.currentChoice.options[0]) {
          this.currentChoice.options[0].action();
        }
      }
      // 2键 - 选择第二个选项
      else if (input.keyPressed('Digit2')) {
        if (this.currentChoice.options[1]) {
          this.currentChoice.options[1].action();
        }
      }
    }
  }

  /**
   * 渲染背景 - 覆盖父类方法，渲染第五幕背景
   */
  renderBackground(ctx) {
    // 调用父类渲染网格背景
    super.renderBackground(ctx);
  }

  /**
   * 渲染场景 - 覆盖父类方法，添加第五幕特有渲染
   */
  render(ctx) {
    // 调用父类的 render
    super.render(ctx);
    
    // 渲染场景标题
    this.renderSceneTitle(ctx);
    
    // 渲染战斗信息
    this.renderBattleInfo(ctx);
    
    // 渲染士气条
    this.renderMoraleBar(ctx);
    
    // 渲染战斗选择
    if (this.currentChoice) {
      this.renderBattleChoice(ctx);
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
    ctx.fillText('第五幕：四场战斗', this.logicalWidth / 2, 50);
    ctx.restore();
  }

  /**
   * 渲染战斗信息
   */
  renderBattleInfo(ctx) {
    if (this.battleState !== 'battle') return;
    
    const battleNames = ['起义之战', '广宗之战', '阳城之战', '黄巾终战'];
    const battleName = battleNames[this.currentBattle] || '未知战斗';
    
    const aliveFriendlies = this.friendlyUnits.filter(e => !e.isDead && !e.isDying).length;
    const aliveEnemies = this.enemyUnits.filter(e => !e.isDead && !e.isDying).length;
    
    ctx.save();
    
    // 战斗信息面板
    const panelX = 10;
    const panelY = 90;
    const panelWidth = 200;
    const panelHeight = 120;
    
    ctx.fillStyle = 'rgba(0, 0, 0, 0.7)';
    ctx.fillRect(panelX, panelY, panelWidth, panelHeight);
    
    ctx.strokeStyle = '#FFD700';
    ctx.lineWidth = 2;
    ctx.strokeRect(panelX, panelY, panelWidth, panelHeight);
    
    // 战斗名称
    ctx.fillStyle = '#FFD700';
    ctx.font = 'bold 18px Arial';
    ctx.textAlign = 'left';
    ctx.fillText(battleName, panelX + 10, panelY + 25);
    
    // 友军数量
    ctx.fillStyle = '#4CAF50';
    ctx.font = '16px Arial';
    ctx.fillText(`友军: ${aliveFriendlies}`, panelX + 10, panelY + 50);
    
    // 敌军数量
    ctx.fillStyle = '#F44336';
    ctx.fillText(`敌军: ${aliveEnemies}`, panelX + 10, panelY + 75);
    
    // 历史武将数量
    const aliveGenerals = this.historicalGenerals.filter(g => !g.isDead && !g.isDying).length;
    ctx.fillStyle = '#9C27B0';
    ctx.fillText(`武将: ${aliveGenerals}`, panelX + 10, panelY + 100);
    
    ctx.restore();
  }

  /**
   * 渲染士气条
   */
  renderMoraleBar(ctx) {
    if (this.battleState !== 'battle') return;
    
    ctx.save();
    
    const barX = 10;
    const barY = 220;
    const barWidth = 200;
    const barHeight = 20;
    
    // 背景
    ctx.fillStyle = 'rgba(0, 0, 0, 0.7)';
    ctx.fillRect(barX, barY, barWidth, barHeight);
    
    // 士气条
    const moraleRatio = this.battleMorale / 100;
    const moraleColor = moraleRatio > 0.7 ? '#4CAF50' : moraleRatio > 0.4 ? '#FFC107' : '#F44336';
    ctx.fillStyle = moraleColor;
    ctx.fillRect(barX, barY, barWidth * moraleRatio, barHeight);
    
    // 边框
    ctx.strokeStyle = '#FFD700';
    ctx.lineWidth = 2;
    ctx.strokeRect(barX, barY, barWidth, barHeight);
    
    // 文字
    ctx.fillStyle = '#FFFFFF';
    ctx.font = 'bold 14px Arial';
    ctx.textAlign = 'center';
    ctx.fillText(`士气: ${Math.floor(this.battleMorale)}%`, barX + barWidth / 2, barY + 15);
    
    ctx.restore();
  }

  /**
   * 渲染战斗选择
   */
  renderBattleChoice(ctx) {
    if (!this.currentChoice) return;
    
    ctx.save();
    
    // 选择面板
    const panelWidth = 500;
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
    ctx.font = 'bold 24px Arial';
    ctx.textAlign = 'center';
    
    let titleText = '战斗选择';
    if (this.currentChoice.type === 'rescue') {
      titleText = `救援 ${this.currentChoice.npc.name}？`;
    }
    ctx.fillText(titleText, panelX + panelWidth / 2, panelY + 40);
    
    // 倒计时
    ctx.fillStyle = '#FF5722';
    ctx.font = '18px Arial';
    ctx.fillText(`剩余时间: ${Math.ceil(this.choiceTimer)}秒`, panelX + panelWidth / 2, panelY + 70);
    
    // 选项
    const optionY = panelY + 110;
    const optionSpacing = 50;
    
    for (let i = 0; i < this.currentChoice.options.length; i++) {
      const option = this.currentChoice.options[i];
      const optionX = panelX + panelWidth / 2;
      const y = optionY + i * optionSpacing;
      
      // 选项背景
      ctx.fillStyle = 'rgba(255, 255, 255, 0.1)';
      ctx.fillRect(optionX - 200, y - 20, 400, 35);
      
      // 选项文字
      ctx.fillStyle = '#FFFFFF';
      ctx.font = 'bold 18px Arial';
      ctx.textAlign = 'center';
      ctx.fillText(`[${i + 1}] ${option.text}`, optionX, y);
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
    } else if (this.battleState === 'battle') {
      hints.push('消灭所有敌军获得胜利');
      if (this.currentChoice) {
        hints.push('按 1 或 2 键选择');
      }
    } else if (this.isSceneComplete) {
      hints.push('第五幕完成！');
    }
    
    // 渲染提示
    if (hints.length > 0) {
      ctx.fillStyle = 'rgba(0, 0, 0, 0.7)';
      ctx.fillRect(this.logicalWidth / 2 - 250, this.logicalHeight - 60, 500, 40);
      
      ctx.fillStyle = '#FFFFFF';
      ctx.font = '16px Arial';
      ctx.textAlign = 'center';
      ctx.fillText(hints[0], this.logicalWidth / 2, this.logicalHeight - 35);
      
      if (hints.length > 1) {
        ctx.font = '14px Arial';
        ctx.fillStyle = '#CCCCCC';
        ctx.fillText(hints[1], this.logicalWidth / 2, this.logicalHeight - 15);
      }
    }
    
    ctx.restore();
  }

  /**
   * 退出场景
   */
  exit() {
    // 清理第五幕特有资源
    this.npcRecruitmentSystem = null;
    this.friendlyUnits = [];
    this.enemyUnits = [];
    this.historicalGenerals = [];
    
    // 调用父类的 exit
    super.exit();
  }
}

export default Act5Scene;
