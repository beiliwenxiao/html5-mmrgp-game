/**
 * CombatSystem.js
 * 战斗系统 - 处理目标选择、攻击、技能释放等战斗逻辑
 */

import { ElementSystem } from './ElementSystem.js';
import { UnitSystem } from './UnitSystem.js';

/**
 * 战斗系统
 * 处理目标选择、攻击范围检测、伤害计算等
 */
export class CombatSystem {
  /**
   * @param {Object} config - 配置
   * @param {InputManager} config.inputManager - 输入管理器
   * @param {Camera} config.camera - 相机
   * @param {MockDataService} config.dataService - 数据服务（可选）
   * @param {SkillEffects} config.skillEffects - 技能特效系统（可选）
   * @param {StatusEffectSystem} config.statusEffectSystem - 状态效果系统（可选）
   */
  constructor(config = {}) {
    this.inputManager = config.inputManager;
    this.camera = config.camera;
    this.dataService = config.dataService;
    this.skillEffects = config.skillEffects;
    this.statusEffectSystem = config.statusEffectSystem;
    
    // 初始化元素系统
    this.elementSystem = new ElementSystem();
    
    // 初始化兵种系统
    this.unitSystem = new UnitSystem();
    
    // 玩家实体引用
    this.playerEntity = null;
    
    // 当前选中的目标
    this.selectedTarget = null;
    
    // 目标高亮配置
    this.highlightConfig = {
      color: '#ffff00',
      lineWidth: 2,
      radius: 30
    };
    
    // 伤害数字列表
    this.damageNumbers = [];
    
    // 技能快捷键映射
    this.skillKeyMap = {
      'skill1': 0,
      'skill2': 1,
      'skill3': 2,
      'skill4': 3,
      'skill5': 4,
      'skill6': 5
    };
    
    console.log('CombatSystem: Initialized');
  }

  /**
   * 设置玩家实体
   * @param {Entity} entity - 玩家实体
   */
  setPlayerEntity(entity) {
    this.playerEntity = entity;
  }

  /**
   * 更新系统
   * @param {number} deltaTime - 帧间隔时间（秒）
   * @param {Array<Entity>} entities - 实体列表
   */
  update(deltaTime, entities) {
    const currentTime = performance.now();
    
    // 更新大规模战斗（如果激活）
    if (this.largeBattle && this.largeBattle.active) {
      this.updateLargeScaleBattle(deltaTime, currentTime);
    }
    
    // 处理目标选择输入
    this.handleTargetSelection(entities);
    
    // 自动选中最近的敌人（如果没有目标）
    this.autoSelectNearestEnemy(entities);
    
    // 处理技能输入
    this.handleSkillInput(currentTime, entities);
    
    // 处理自动攻击
    this.handleAutoAttack(currentTime, entities);
    
    // 检查死亡
    this.checkDeath(entities);
    
    // 更新伤害数字
    this.updateDamageNumbers(deltaTime);
    
    // 更新战斗组件
    for (const entity of entities) {
      const combat = entity.getComponent('combat');
      if (combat) {
        combat.update(deltaTime);
      }
    }
  }

  /**
   * 处理目标选择
   * @param {Array<Entity>} entities - 实体列表
   */
  handleTargetSelection(entities) {
    if (!this.inputManager || !this.playerEntity) return;
    
    // 检测鼠标点击（左键）
    if (this.inputManager.isMouseClicked() && this.inputManager.getMouseButton() === 0) {
      const clickPos = this.inputManager.getMouseWorldPosition();
      
      // 查找点击位置的敌人
      const clickedEnemy = this.findEnemyAtPosition(clickPos, entities);
      
      if (clickedEnemy) {
        // 选中敌人
        this.selectTarget(clickedEnemy);
        console.log(`CombatSystem: Selected target: ${clickedEnemy.name || clickedEnemy.id}`);
      } else {
        // 点击空白处，取消选中
        // 注意：这里不取消选中，因为点击空白处可能是移动指令
        // 只有在点击到其他敌人或按ESC时才取消选中
      }
    }
    
    // 按ESC取消选中
    if (this.inputManager.isKeyPressed('escape')) {
      this.clearTarget();
    }
    
    // 检查当前目标是否仍然有效
    if (this.selectedTarget) {
      const stats = this.selectedTarget.getComponent('stats');
      if (!stats || stats.hp <= 0) {
        // 目标已死亡，清除选中
        this.clearTarget();
      }
    }
  }

  /**
   * 查找指定位置的敌人
   * @param {Object} position - 位置 {x, y}
   * @param {Array<Entity>} entities - 实体列表
   * @returns {Entity|null}
   */
  findEnemyAtPosition(position, entities) {
    // 点击检测半径
    const clickRadius = 30;
    
    // 查找所有敌人
    const enemies = entities.filter(e => e.type === 'enemy');
    
    // 查找最近的敌人
    let closestEnemy = null;
    let closestDistance = Infinity;
    
    for (const enemy of enemies) {
      const transform = enemy.getComponent('transform');
      if (!transform) {
        console.warn(`Enemy ${enemy.id} has no transform component`);
        continue;
      }
      
      // 计算距离
      const dx = transform.position.x - position.x;
      const dy = transform.position.y - position.y;
      const distance = Math.sqrt(dx * dx + dy * dy);
      
      // 如果在点击范围内且更近
      if (distance <= clickRadius && distance < closestDistance) {
        closestDistance = distance;
        closestEnemy = enemy;
      }
    }
    
    return closestEnemy;
  }

  /**
   * 选中目标
   * @param {Entity} target - 目标实体
   */
  selectTarget(target) {
    // 清除之前的目标
    if (this.selectedTarget) {
      const oldCombat = this.playerEntity.getComponent('combat');
      if (oldCombat) {
        oldCombat.clearTarget();
      }
    }
    
    // 设置新目标
    this.selectedTarget = target;
    
    // 更新玩家的战斗组件
    const combat = this.playerEntity.getComponent('combat');
    if (combat) {
      combat.setTarget(target);
    }
  }

  /**
   * 清除目标
   */
  clearTarget() {
    if (this.selectedTarget) {
      console.log('CombatSystem: Target cleared');
    }
    
    this.selectedTarget = null;
    
    // 清除玩家的战斗组件目标
    if (this.playerEntity) {
      const combat = this.playerEntity.getComponent('combat');
      if (combat) {
        combat.clearTarget();
      }
    }
  }

  /**
   * 获取当前选中的目标
   * @returns {Entity|null}
   */
  getSelectedTarget() {
    return this.selectedTarget;
  }
  
  /**
   * 自动选中最近的敌人
   * @param {Array<Entity>} entities - 实体列表
   */
  autoSelectNearestEnemy(entities) {
    if (!this.playerEntity) return;
    
    // 如果已经有目标
    if (this.selectedTarget) {
      const stats = this.selectedTarget.getComponent('stats');
      // 只有当目标死亡时才清除选中
      if (!stats || stats.hp <= 0 || this.selectedTarget.isDead) {
        this.clearTarget();
      } else {
        // 目标还活着，保持选中状态
        return;
      }
    }
    
    // 没有目标时，自动选中最近的敌人
    const playerTransform = this.playerEntity.getComponent('transform');
    if (!playerTransform) return;
    
    // 查找最近的敌人
    const enemies = entities.filter(e => e.type === 'enemy' && !e.isDead);
    if (enemies.length === 0) return;
    
    let nearestEnemy = null;
    let nearestDistance = 200; // 自动选中范围：200像素
    
    for (const enemy of enemies) {
      const enemyTransform = enemy.getComponent('transform');
      const enemyStats = enemy.getComponent('stats');
      
      if (!enemyTransform || !enemyStats || enemyStats.hp <= 0) continue;
      
      const dx = enemyTransform.position.x - playerTransform.position.x;
      const dy = enemyTransform.position.y - playerTransform.position.y;
      const distance = Math.sqrt(dx * dx + dy * dy);
      
      if (distance < nearestDistance) {
        nearestDistance = distance;
        nearestEnemy = enemy;
      }
    }
    
    // 如果找到了最近的敌人，自动选中
    if (nearestEnemy) {
      this.selectTarget(nearestEnemy);
    }
  }

  /**
   * 渲染战斗系统UI
   * @param {CanvasRenderingContext2D} ctx - 渲染上下文
   */
  render(ctx) {
    // 渲染大规模战斗态势UI
    if (this.largeBattle && this.largeBattle.active) {
      this.renderBattleSituation(ctx);
    }
    
    // 渲染目标高亮
    if (this.selectedTarget) {
      this.renderTargetHighlight(ctx, this.selectedTarget);
    }
    
    // 渲染目标框架UI
    if (this.selectedTarget) {
      this.renderTargetFrame(ctx, this.selectedTarget);
    }
    
    // 渲染伤害数字
    this.renderDamageNumbers(ctx);
  }

  /**
   * 渲染伤害数字
   * @param {CanvasRenderingContext2D} ctx - 渲染上下文
   */
  renderDamageNumbers(ctx) {
    ctx.save();
    
    for (const dn of this.damageNumbers) {
      // 转换为屏幕坐标
      const screenPos = this.worldToScreen({ x: dn.x, y: dn.y });
      
      // 计算透明度（根据生命周期）
      const alpha = dn.life / dn.maxLife;
      
      // 绘制数字
      ctx.globalAlpha = alpha;
      ctx.fillStyle = dn.isHeal ? '#00ff00' : '#ff0000'; // 治疗为绿色，伤害为红色
      ctx.strokeStyle = '#000000';
      ctx.font = 'bold 20px Arial';
      ctx.textAlign = 'center';
      ctx.lineWidth = 3;
      
      const text = dn.isHeal ? `+${dn.damage}` : dn.damage.toString();
      
      // 描边
      ctx.strokeText(text, screenPos.x, screenPos.y);
      // 填充
      ctx.fillText(text, screenPos.x, screenPos.y);
    }
    
    ctx.restore();
  }

  /**
   * 渲染目标高亮
   * @param {CanvasRenderingContext2D} ctx - 渲染上下文
   * @param {Entity} target - 目标实体
   */
  renderTargetHighlight(ctx, target) {
    const transform = target.getComponent('transform');
    if (!transform) return;
    
    // 转换为屏幕坐标
    const screenPos = this.worldToScreen(transform.position);
    
    // 绘制高亮圆圈
    ctx.save();
    ctx.strokeStyle = this.highlightConfig.color;
    ctx.lineWidth = this.highlightConfig.lineWidth;
    ctx.beginPath();
    ctx.arc(
      screenPos.x,
      screenPos.y,
      this.highlightConfig.radius,
      0,
      Math.PI * 2
    );
    ctx.stroke();
    ctx.restore();
  }

  /**
   * 渲染目标框架UI
   * @param {CanvasRenderingContext2D} ctx - 渲染上下文
   * @param {Entity} target - 目标实体
   */
  renderTargetFrame(ctx, target) {
    const stats = target.getComponent('stats');
    if (!stats) return;
    
    // 目标框架位置（屏幕右上角）
    const frameX = ctx.canvas.width - 250;
    const frameY = 20;
    const frameWidth = 230;
    const frameHeight = 80;
    
    // 绘制背景
    ctx.save();
    ctx.fillStyle = 'rgba(0, 0, 0, 0.7)';
    ctx.fillRect(frameX, frameY, frameWidth, frameHeight);
    
    // 绘制边框
    ctx.strokeStyle = '#ffff00';
    ctx.lineWidth = 2;
    ctx.strokeRect(frameX, frameY, frameWidth, frameHeight);
    
    // 绘制目标名称
    ctx.fillStyle = '#ffffff';
    ctx.font = 'bold 16px Arial';
    ctx.textAlign = 'left';
    ctx.fillText(target.name || 'Unknown', frameX + 10, frameY + 25);
    
    // 绘制等级
    ctx.fillStyle = '#aaaaaa';
    ctx.font = '14px Arial';
    ctx.fillText(`Lv.${target.level || 1}`, frameX + 10, frameY + 45);
    
    // 绘制生命值条
    const hpBarX = frameX + 10;
    const hpBarY = frameY + 55;
    const hpBarWidth = frameWidth - 20;
    const hpBarHeight = 15;
    
    // 生命值条背景
    ctx.fillStyle = '#333333';
    ctx.fillRect(hpBarX, hpBarY, hpBarWidth, hpBarHeight);
    
    // 生命值条
    const hpPercent = stats.hp / stats.maxHp;
    ctx.fillStyle = this.getHealthBarColor(hpPercent);
    ctx.fillRect(hpBarX, hpBarY, hpBarWidth * hpPercent, hpBarHeight);
    
    // 生命值文本
    ctx.fillStyle = '#ffffff';
    ctx.font = '12px Arial';
    ctx.textAlign = 'center';
    ctx.fillText(
      `${Math.ceil(stats.hp)} / ${stats.maxHp}`,
      hpBarX + hpBarWidth / 2,
      hpBarY + hpBarHeight - 3
    );
    
    ctx.restore();
  }

  /**
   * 获取生命值条颜色
   * @param {number} percent - 生命值百分比
   * @returns {string}
   */
  getHealthBarColor(percent) {
    if (percent > 0.5) {
      return '#00ff00'; // 绿色
    } else if (percent > 0.25) {
      return '#ffff00'; // 黄色
    } else {
      return '#ff0000'; // 红色
    }
  }

  /**
   * 处理自动攻击
   * @param {number} currentTime - 当前时间（毫秒）
   * @param {Array<Entity>} entities - 实体列表
   */
  handleAutoAttack(currentTime, entities) {
    if (!this.playerEntity) return;
    
    const combat = this.playerEntity.getComponent('combat');
    if (!combat || !combat.hasTarget()) return;
    
    const target = combat.target;
    
    // 检查目标是否有效
    const targetStats = target.getComponent('stats');
    if (!targetStats || targetStats.hp <= 0) {
      this.clearTarget();
      return;
    }
    
    // 检查是否在攻击范围内
    if (!this.isInRange(this.playerEntity, target, combat.attackRange)) {
      return;
    }
    
    // 检查攻击冷却
    if (!combat.canAttack(currentTime)) {
      return;
    }
    
    // 执行攻击
    this.performAttack(this.playerEntity, target, currentTime);
  }

  /**
   * 检查是否在攻击范围内
   * @param {Entity} attacker - 攻击者
   * @param {Entity} target - 目标
   * @param {number} range - 攻击范围
   * @returns {boolean}
   */
  isInRange(attacker, target, range) {
    const attackerTransform = attacker.getComponent('transform');
    const targetTransform = target.getComponent('transform');
    
    if (!attackerTransform || !targetTransform) return false;
    
    const dx = targetTransform.position.x - attackerTransform.position.x;
    const dy = targetTransform.position.y - attackerTransform.position.y;
    const distance = Math.sqrt(dx * dx + dy * dy);
    
    return distance <= range;
  }

  /**
   * 执行攻击
   * @param {Entity} attacker - 攻击者
   * @param {Entity} target - 目标
   * @param {number} currentTime - 当前时间（毫秒）
   */
  performAttack(attacker, target, currentTime) {
    const combat = attacker.getComponent('combat');
    const sprite = attacker.getComponent('sprite');
    const attackerTransform = attacker.getComponent('transform');
    
    if (!combat) return;
    
    // 执行攻击（更新冷却时间）
    if (combat.attack(currentTime)) {
      // 播放攻击动画
      if (sprite) {
        sprite.playAnimation('attack');
        
        // 攻击动画结束后恢复待机动画
        setTimeout(() => {
          if (sprite.currentAnimation === 'attack') {
            sprite.playAnimation('idle');
          }
        }, 300); // 假设攻击动画持续300ms
      }
      
      // 创建攻击特效
      if (this.skillEffects && attackerTransform) {
        this.skillEffects.createSkillEffect('basic_attack', attackerTransform.position);
      }
      
      // 计算并应用伤害
      const damage = this.calculateDamage(attacker, target);
      this.applyDamage(target, damage);
      
      console.log(`${attacker.name || attacker.id} 攻击 ${target.name || target.id}，造成 ${damage} 点伤害`);
    }
  }

  /**
   * 计算伤害
   * @param {Entity} attacker - 攻击者
   * @param {Entity} target - 目标
   * @param {number} skillElementType - 技能元素类型（可选，默认为攻击者主元素）
   * @returns {number} 伤害值
   */
  calculateDamage(attacker, target, skillElementType = null) {
    const attackerStats = attacker.getComponent('stats');
    const targetStats = target.getComponent('stats');
    
    if (!attackerStats || !targetStats) return 0;
    
    // 获取修改后的属性（考虑状态效果）
    let attack = attackerStats.attack;
    let defense = targetStats.defense;
    
    if (this.statusEffectSystem) {
      const modifiedAttackerStats = this.statusEffectSystem.getModifiedStats(attacker);
      const modifiedTargetStats = this.statusEffectSystem.getModifiedStats(target);
      attack = modifiedAttackerStats.attack;
      defense = modifiedTargetStats.defense;
    }
    
    // 应用士气加成（大规模战斗）
    if (attackerStats.moraleMultiplier) {
      attack *= attackerStats.moraleMultiplier;
    }
    if (targetStats.moraleMultiplier) {
      defense *= targetStats.moraleMultiplier;
    }
    
    // 基础伤害公式：攻击力 - 防御力
    let baseDamage = attack - defense;
    baseDamage = Math.max(1, baseDamage);
    
    // 计算兵种相克加成
    const unitDamage = this.unitSystem.calculateUnitDamage(
      attackerStats,
      targetStats,
      baseDamage
    );
    
    // 如果没有指定技能元素类型，使用攻击者的主元素
    const elementType = skillElementType !== null ? skillElementType : attackerStats.getMainElement();
    
    // 计算元素伤害
    const finalDamage = this.elementSystem.calculateElementDamage(
      attackerStats,
      targetStats,
      elementType,
      unitDamage
    );
    
    // 添加随机波动（±10%）
    const variance = 0.1;
    const randomFactor = 1 + (Math.random() * 2 - 1) * variance;
    const damage = Math.floor(finalDamage * randomFactor);
    
    return Math.max(1, damage);
  }

  /**
   * 应用伤害
   * @param {Entity} target - 目标
   * @param {number} damage - 伤害值
   */
  applyDamage(target, damage) {
    const stats = target.getComponent('stats');
    const transform = target.getComponent('transform');
    
    if (!stats) return;
    
    // 扣除生命值
    stats.takeDamage(damage);
    
    // 显示伤害数字
    if (transform) {
      this.showDamageNumber(transform.position, damage);
    }
    
    // 播放受击动画（如果有）
    const sprite = target.getComponent('sprite');
    if (sprite) {
      // 可以添加受击闪烁效果
      this.playHitEffect(target);
    }
  }

  /**
   * 显示伤害数字
   * @param {Object} position - 位置 {x, y}
   * @param {number} damage - 伤害值
   */
  showDamageNumber(position, damage) {
    const damageNumber = {
      x: position.x,
      y: position.y - 20, // 从实体上方开始
      damage: damage,
      life: 1.0, // 生命周期（秒）
      maxLife: 1.0,
      velocity: { x: (Math.random() - 0.5) * 20, y: -50 } // 向上飘动
    };
    
    this.damageNumbers.push(damageNumber);
  }

  /**
   * 更新伤害数字
   * @param {number} deltaTime - 帧间隔时间（秒）
   */
  updateDamageNumbers(deltaTime) {
    // 更新所有伤害数字
    for (let i = this.damageNumbers.length - 1; i >= 0; i--) {
      const dn = this.damageNumbers[i];
      
      // 更新位置
      dn.x += dn.velocity.x * deltaTime;
      dn.y += dn.velocity.y * deltaTime;
      
      // 减速
      dn.velocity.y += 100 * deltaTime; // 重力效果
      
      // 减少生命周期
      dn.life -= deltaTime;
      
      // 移除过期的伤害数字
      if (dn.life <= 0) {
        this.damageNumbers.splice(i, 1);
      }
    }
  }

  /**
   * 播放受击效果
   * @param {Entity} target - 目标
   */
  playHitEffect(target) {
    const sprite = target.getComponent('sprite');
    if (!sprite) return;
    
    // 简单的闪烁效果
    sprite.flash = true;
    sprite.flashTime = 0.2; // 闪烁持续时间
    
    setTimeout(() => {
      if (sprite) {
        sprite.flash = false;
      }
    }, 200);
  }

  /**
   * 加载角色技能
   * @param {Entity} entity - 实体
   * @param {Array<string>} skillIds - 技能ID列表
   */
  loadSkills(entity, skillIds) {
    if (!this.dataService) {
      console.warn('CombatSystem: No data service provided, cannot load skills');
      return;
    }
    
    const combat = entity.getComponent('combat');
    if (!combat) return;
    
    // 清空现有技能
    combat.skills = [];
    combat.skillCooldowns.clear();
    
    // 加载技能数据
    for (const skillId of skillIds) {
      const skillData = this.dataService.getSkillData(skillId);
      if (skillData) {
        combat.addSkill(skillData);
      }
    }
    
    console.log(`CombatSystem: Loaded ${combat.skills.length} skills for ${entity.name || entity.id}`);
  }

  /**
   * 处理技能输入
   * @param {number} currentTime - 当前时间（毫秒）
   * @param {Array<Entity>} entities - 实体列表
   */
  handleSkillInput(currentTime, entities) {
    if (!this.inputManager || !this.playerEntity) return;
    
    const combat = this.playerEntity.getComponent('combat');
    if (!combat) return;
    
    // 检查技能快捷键
    for (const [key, index] of Object.entries(this.skillKeyMap)) {
      if (this.inputManager.isKeyPressed(key)) {
        // 获取对应的技能
        if (index < combat.skills.length) {
          const skill = combat.skills[index];
          
          // 普通攻击需要目标，其他技能使用鼠标位置
          if (skill.isAutoAttack) {
            // 普通攻击：需要选中目标
            if (this.selectedTarget) {
              this.tryUseSkill(this.playerEntity, skill, currentTime, entities);
            } else {
              console.log('普通攻击需要选择目标');
            }
          } else {
            // 其他技能：使用鼠标位置作为目标点
            const mouseWorldPos = this.inputManager.getMouseWorldPosition(this.camera);
            this.tryUseSkillAtPosition(this.playerEntity, skill, mouseWorldPos, currentTime, entities);
          }
        }
      }
    }
  }

  /**
   * 尝试使用技能（针对单个目标）
   * @param {Entity} caster - 施法者
   * @param {Object} skill - 技能数据
   * @param {number} currentTime - 当前时间（毫秒）
   * @param {Array<Entity>} entities - 实体列表
   * @returns {boolean} 是否成功使用
   */
  tryUseSkill(caster, skill, currentTime, entities) {
    const combat = caster.getComponent('combat');
    const stats = caster.getComponent('stats');
    
    if (!combat || !stats) return false;
    
    // 检查冷却
    if (!combat.canUseSkill(skill.id, currentTime)) {
      console.log(`技能 ${skill.name} 冷却中`);
      return false;
    }
    
    // 检查魔法值
    if (stats.mp < skill.manaCost) {
      console.log(`魔法值不足，需要 ${skill.manaCost}，当前 ${stats.mp}`);
      return false;
    }
    
    // 检查目标（如果需要目标）
    let target = combat.target;
    if (skill.range > 0 && !target) {
      console.log(`技能 ${skill.name} 需要目标`);
      return false;
    }
    
    // 检查范围（如果有目标）
    if (target && skill.range > 0) {
      if (!this.isInRange(caster, target, skill.range)) {
        console.log(`目标超出技能范围`);
        return false;
      }
    }
    
    // 使用技能
    const usedSkill = combat.useSkill(skill.id, currentTime);
    if (!usedSkill) return false;
    
    // 消耗魔法值
    stats.consumeMana(skill.manaCost);
    
    // 应用技能效果
    this.applySkillEffects(caster, target, skill, currentTime);
    
    console.log(`${caster.name || caster.id} 使用技能 ${skill.name}`);
    return true;
  }

  /**
   * 尝试在指定位置使用技能（AOE技能）
   * @param {Entity} caster - 施法者
   * @param {Object} skill - 技能数据
   * @param {Object} targetPos - 目标位置 {x, y}
   * @param {number} currentTime - 当前时间（毫秒）
   * @param {Array<Entity>} entities - 实体列表
   * @returns {boolean} 是否成功使用
   */
  tryUseSkillAtPosition(caster, skill, targetPos, currentTime, entities) {
    const combat = caster.getComponent('combat');
    const stats = caster.getComponent('stats');
    const casterTransform = caster.getComponent('transform');
    
    if (!combat || !stats || !casterTransform) return false;
    
    // 检查冷却
    if (!combat.canUseSkill(skill.id, currentTime)) {
      console.log(`技能 ${skill.name} 冷却中`);
      return false;
    }
    
    // 检查魔法值
    if (stats.mp < skill.manaCost) {
      console.log(`魔法值不足，需要 ${skill.manaCost}，当前 ${stats.mp}`);
      return false;
    }
    
    // 检查距离（施法者到目标位置的距离）
    const dx = targetPos.x - casterTransform.position.x;
    const dy = targetPos.y - casterTransform.position.y;
    const distance = Math.sqrt(dx * dx + dy * dy);
    
    if (distance > skill.range) {
      console.log(`目标位置超出技能范围`);
      return false;
    }
    
    // 使用技能
    const usedSkill = combat.useSkill(skill.id, currentTime);
    if (!usedSkill) return false;
    
    // 消耗魔法值
    stats.consumeMana(skill.manaCost);
    
    // 应用AOE技能效果
    this.applyAOESkillEffects(caster, targetPos, skill, currentTime, entities);
    
    console.log(`${caster.name || caster.id} 在位置 (${Math.floor(targetPos.x)}, ${Math.floor(targetPos.y)}) 使用技能 ${skill.name}`);
    return true;
  }

  /**
   * 应用技能效果（单目标）
   * @param {Entity} caster - 施法者
   * @param {Entity} target - 目标
   * @param {Object} skill - 技能数据
   * @param {number} currentTime - 当前时间（毫秒）
   */
  applySkillEffects(caster, target, skill, currentTime) {
    const sprite = caster.getComponent('sprite');
    const casterTransform = caster.getComponent('transform');
    const targetTransform = target ? target.getComponent('transform') : null;
    
    // 播放技能动画
    if (sprite && skill.animation) {
      sprite.playAnimation(skill.animation);
      
      // 技能动画结束后恢复待机动画
      setTimeout(() => {
        if (sprite.currentAnimation === skill.animation) {
          sprite.playAnimation('idle');
        }
      }, skill.castTime * 1000 || 500);
    }
    
    // 特殊技能处理：冲锋
    if (skill.id === 'warrior_charge' && target && targetTransform) {
      // 冲锋技能：快速移动到目标附近
      const casterMovement = caster.getComponent('movement');
      if (casterMovement) {
        // 计算目标附近的位置（保持攻击范围）
        const dx = targetTransform.position.x - casterTransform.position.x;
        const dy = targetTransform.position.y - casterTransform.position.y;
        const distance = Math.sqrt(dx * dx + dy * dy);
        
        if (distance > 0) {
          // 移动到目标前方（保持40像素距离）
          const targetDistance = 40;
          const ratio = (distance - targetDistance) / distance;
          const chargeX = casterTransform.position.x + dx * ratio;
          const chargeY = casterTransform.position.y + dy * ratio;
          
          // 立即移动到目标位置
          casterTransform.setPosition(chargeX, chargeY);
        }
      }
      
      // 创建冲锋特效
      if (this.skillEffects) {
        this.skillEffects.createSkillEffect(skill.id, casterTransform.position, targetTransform.position);
      }
      
      // 应用伤害
      const damage = this.calculateSkillDamage(caster, target, skill);
      this.applyDamage(target, damage);
      return;
    }
    
    // 创建技能特效
    if (this.skillEffects && casterTransform) {
      const targetPos = targetTransform ? targetTransform.position : null;
      
      // 对于抛射物技能，延迟应用伤害直到命中
      if (skill.type === 'physical' || skill.type === 'magic') {
        if (skill.range > 100 && target) {
          // 远程技能，使用抛射物
          this.skillEffects.createSkillEffect(
            skill.id,
            casterTransform.position,
            targetPos,
            () => {
              // 命中回调
              const damage = this.calculateSkillDamage(caster, target, skill);
              this.applyDamage(target, damage);
            }
          );
          return; // 伤害将在命中时应用
        } else {
          // 近战技能，立即创建特效
          this.skillEffects.createSkillEffect(skill.id, casterTransform.position, targetPos);
        }
      } else {
        // 非伤害技能
        this.skillEffects.createSkillEffect(skill.id, casterTransform.position, targetPos);
      }
    }
    
    // 根据技能类型应用效果
    if (skill.type === 'physical' || skill.type === 'magic') {
      // 伤害技能（近战或没有特效系统）
      if (target && skill.range <= 100) {
        const damage = this.calculateSkillDamage(caster, target, skill);
        this.applyDamage(target, damage);
      }
    } else if (skill.type === 'heal') {
      // 治疗技能
      const healTarget = target || caster; // 如果没有目标，治疗自己
      this.applyHeal(healTarget, skill);
    } else if (skill.type === 'buff') {
      // Buff技能
      this.applyBuff(caster, skill);
    }
    
    // 应用额外效果
    if (skill.effects && skill.effects.length > 0) {
      for (const effect of skill.effects) {
        this.applyEffect(caster, target, effect);
      }
    }
  }

  /**
   * 应用AOE技能效果
   * @param {Entity} caster - 施法者
   * @param {Object} targetPos - 目标位置 {x, y}
   * @param {Object} skill - 技能数据
   * @param {number} currentTime - 当前时间（毫秒）
   * @param {Array<Entity>} entities - 实体列表
   */
  applyAOESkillEffects(caster, targetPos, skill, currentTime, entities) {
    const sprite = caster.getComponent('sprite');
    const casterTransform = caster.getComponent('transform');
    
    // 播放技能动画
    if (sprite && skill.animation) {
      sprite.playAnimation(skill.animation);
      
      setTimeout(() => {
        if (sprite.currentAnimation === skill.animation) {
          sprite.playAnimation('idle');
        }
      }, skill.castTime * 1000 || 500);
    }
    
    // 创建技能特效（抛射物飞向目标位置）
    if (this.skillEffects && casterTransform) {
      // 如果有抛射物速度，创建飞行特效
      if (skill.projectileSpeed && skill.projectileSpeed > 0) {
        this.skillEffects.createSkillEffect(
          skill.id,
          casterTransform.position,
          targetPos,
          () => {
            // 命中回调：对范围内所有敌人造成伤害
            this.applyAOEDamage(caster, targetPos, skill, entities);
          }
        );
      } else {
        // 立即生效的AOE技能
        this.skillEffects.createSkillEffect(skill.id, casterTransform.position, targetPos);
        this.applyAOEDamage(caster, targetPos, skill, entities);
      }
    } else {
      // 没有特效系统，直接应用伤害
      this.applyAOEDamage(caster, targetPos, skill, entities);
    }
  }

  /**
   * 应用AOE伤害
   * @param {Entity} caster - 施法者
   * @param {Object} centerPos - 中心位置 {x, y}
   * @param {Object} skill - 技能数据
   * @param {Array<Entity>} entities - 实体列表
   */
  applyAOEDamage(caster, centerPos, skill, entities) {
    // AOE范围（默认150像素）
    const aoeRadius = skill.aoeRadius || 150;
    
    // 查找范围内的所有敌人
    const enemies = entities.filter(e => {
      // 只对敌人造成伤害
      if (e.type !== 'enemy') return false;
      if (e.isDead || e.isDying) return false;
      
      const transform = e.getComponent('transform');
      if (!transform) return false;
      
      // 计算距离
      const dx = transform.position.x - centerPos.x;
      const dy = transform.position.y - centerPos.y;
      const distance = Math.sqrt(dx * dx + dy * dy);
      
      return distance <= aoeRadius;
    });
    
    console.log(`AOE技能 ${skill.name} 命中 ${enemies.length} 个敌人`);
    
    // 对每个敌人造成伤害
    for (const enemy of enemies) {
      const damage = this.calculateSkillDamage(caster, enemy, skill);
      this.applyDamage(enemy, damage);
    }
  }

  /**
   * 计算技能伤害
   * @param {Entity} caster - 施法者
   * @param {Entity} target - 目标
   * @param {Object} skill - 技能数据
   * @returns {number} 伤害值
   */
  calculateSkillDamage(caster, target, skill) {
    const casterStats = caster.getComponent('stats');
    const targetStats = target.getComponent('stats');
    
    if (!casterStats || !targetStats) return 0;
    
    // 获取修改后的属性（考虑状态效果）
    let attack = casterStats.attack;
    let defense = targetStats.defense;
    
    if (this.statusEffectSystem) {
      const modifiedCasterStats = this.statusEffectSystem.getModifiedStats(caster);
      const modifiedTargetStats = this.statusEffectSystem.getModifiedStats(target);
      attack = modifiedCasterStats.attack;
      defense = modifiedTargetStats.defense;
    }
    
    // 应用士气加成（大规模战斗）
    if (casterStats.moraleMultiplier) {
      attack *= casterStats.moraleMultiplier;
    }
    if (targetStats.moraleMultiplier) {
      defense *= targetStats.moraleMultiplier;
    }
    
    // 基础伤害 = 攻击力 * 技能倍率
    let baseDamage = attack * skill.damage;
    
    // 减去防御力
    if (skill.type === 'physical') {
      baseDamage -= defense;
    }
    
    // 最小伤害为1
    baseDamage = Math.max(1, baseDamage);
    
    // 计算兵种相克加成
    const unitDamage = this.unitSystem.calculateUnitDamage(
      casterStats,
      targetStats,
      baseDamage
    );
    
    // 获取技能元素类型（如果技能有元素属性）
    const skillElementType = skill.elementType !== undefined ? skill.elementType : casterStats.getMainElement();
    
    // 计算元素伤害
    const finalDamage = this.elementSystem.calculateElementDamage(
      casterStats,
      targetStats,
      skillElementType,
      unitDamage
    );
    
    // 添加随机波动（±10%）
    const variance = 0.1;
    const randomFactor = 1 + (Math.random() * 2 - 1) * variance;
    const damage = Math.floor(finalDamage * randomFactor);
    
    return Math.max(1, damage);
  }

  /**
   * 应用治疗
   * @param {Entity} target - 目标
   * @param {Object} skill - 技能数据
   */
  applyHeal(target, skill) {
    const stats = target.getComponent('stats');
    const transform = target.getComponent('transform');
    
    if (!stats) return;
    
    // 获取治疗量（支持两种格式）
    let healAmount = 0;
    if (skill.healAmount !== undefined) {
      // 使用 healAmount 属性
      healAmount = skill.healAmount;
    } else if (skill.effects && Array.isArray(skill.effects)) {
      // 使用 effects 数组
      const healEffect = skill.effects.find(e => e.type === 'heal');
      healAmount = healEffect?.value || 0;
    }
    
    // 恢复生命值
    const actualHeal = stats.heal(healAmount);
    
    // 显示治疗数字（绿色）
    if (transform && actualHeal > 0) {
      this.showHealNumber(transform.position, actualHeal);
    }
  }

  /**
   * 显示治疗数字
   * @param {Object} position - 位置 {x, y}
   * @param {number} amount - 治疗量
   */
  showHealNumber(position, amount) {
    const healNumber = {
      x: position.x,
      y: position.y - 20,
      damage: amount,
      life: 1.0,
      maxLife: 1.0,
      velocity: { x: (Math.random() - 0.5) * 20, y: -50 },
      isHeal: true // 标记为治疗数字
    };
    
    this.damageNumbers.push(healNumber);
  }

  /**
   * 应用Buff
   * @param {Entity} target - 目标
   * @param {Object} skill - 技能数据
   */
  applyBuff(target, skill) {
    // 简化实现，实际应该有完整的Buff系统
    console.log(`应用Buff: ${skill.name}`);
  }

  /**
   * 应用效果
   * @param {Entity} caster - 施法者
   * @param {Entity} target - 目标
   * @param {Object} effect - 效果数据
   */
  applyEffect(caster, target, effect) {
    // 简化实现，实际应该有完整的效果系统
    console.log(`应用效果: ${effect.type}`);
  }

  /**
   * 获取技能冷却进度
   * @param {Entity} entity - 实体
   * @param {number} skillIndex - 技能索引
   * @param {number} currentTime - 当前时间（可选，默认使用 performance.now()）
   * @returns {number} 冷却进度 0-1
   */
  getSkillCooldownProgress(entity, skillIndex, currentTime = null) {
    const combat = entity.getComponent('combat');
    if (!combat || skillIndex >= combat.skills.length) return 1;
    
    const skill = combat.skills[skillIndex];
    const lastUseTime = combat.skillCooldowns.get(skill.id) || 0;
    
    // 如果从未使用过，冷却完成
    if (lastUseTime === 0) return 1;
    
    const time = currentTime !== null ? currentTime : performance.now();
    const remaining = combat.getSkillCooldownRemaining(skill.id, time);
    const progress = 1 - (remaining / skill.cooldown);
    
    return Math.max(0, Math.min(1, progress));
  }

  /**
   * 检查死亡
   * @param {Array<Entity>} entities - 实体列表
   */
  checkDeath(entities) {
    for (const entity of entities) {
      const stats = entity.getComponent('stats');
      if (!stats) continue;
      
      // 检查是否死亡
      if (stats.isDead() && !entity.isDying && !entity.isDead) {
        this.handleDeath(entity);
      }
    }
  }

  /**
   * 处理死亡
   * @param {Entity} entity - 实体
   */
  handleDeath(entity) {
    console.log(`${entity.name || entity.id} 死亡`);
    
    // 标记为正在死亡
    entity.isDying = true;
    
    // 播放死亡动画
    const sprite = entity.getComponent('sprite');
    if (sprite) {
      sprite.playAnimation('death');
    }
    
    // 清除战斗目标
    const combat = entity.getComponent('combat');
    if (combat) {
      combat.clearTarget();
    }
    
    // 如果是玩家死亡
    if (entity.type === 'player') {
      this.handlePlayerDeath(entity);
    } else {
      // 敌人死亡，生成掉落物
      this.spawnLoot(entity);
      
      // 延迟移除
      setTimeout(() => {
        this.removeDeadEntity(entity);
      }, 1000); // 等待死亡动画播放完成
    }
  }

  /**
   * 生成掉落物
   * @param {Entity} entity - 死亡的实体
   */
  spawnLoot(entity) {
    const transform = entity.getComponent('transform');
    if (!transform) {
      console.log('CombatSystem: 实体没有 transform 组件，无法掉落');
      return;
    }
    
    console.log(`CombatSystem: 准备生成掉落物，位置: (${transform.position.x}, ${transform.position.y})`);
    
    // 触发掉落事件，让场景处理掉落物生成
    if (this.onLootDrop) {
      const lootItems = this.generateLoot(entity);
      console.log(`CombatSystem: 生成了 ${lootItems.length} 个掉落物`, lootItems);
      this.onLootDrop(transform.position, lootItems);
    } else {
      console.log('CombatSystem: 掉落回调未设置！');
    }
  }

  /**
   * 生成掉落物品列表
   * @param {Entity} entity - 死亡的实体
   * @returns {Array} 掉落物品列表
   */
  generateLoot(entity) {
    const loot = [];
    
    // 随机掉落1个药瓶（50%红瓶，50%蓝瓶）
    if (Math.random() < 0.5) {
      // 掉落红瓶
      loot.push({
        type: 'health_potion',
        name: '生命药水',
        value: 50
      });
    } else {
      // 掉落蓝瓶
      loot.push({
        type: 'mana_potion',
        name: '魔法药水',
        value: 30
      });
    }
    
    return loot;
  }

  /**
   * 设置掉落回调
   * @param {Function} callback - 掉落回调函数
   */
  setLootDropCallback(callback) {
    this.onLootDrop = callback;
  }

  /**
   * 处理玩家死亡
   * @param {Entity} player - 玩家实体
   */
  handlePlayerDeath(player) {
    console.log('玩家死亡，显示复活界面');
    
    // 清除选中的目标
    this.clearTarget();
    
    // 这里应该显示复活界面
    // 实际实现中应该通过事件系统通知UI层
    // 暂时只是标记状态
    player.isDead = true;
    
    // 可以添加复活逻辑
    // 例如：5秒后自动复活
    setTimeout(() => {
      this.revivePlayer(player);
    }, 5000);
  }

  /**
   * 复活玩家
   * @param {Entity} player - 玩家实体
   */
  revivePlayer(player) {
    const stats = player.getComponent('stats');
    if (!stats) return;
    
    console.log('玩家复活');
    
    // 恢复生命值和魔法值
    stats.fullRestore();
    
    // 清除死亡标记
    player.isDying = false;
    player.isDead = false;
    
    // 恢复待机动画
    const sprite = player.getComponent('sprite');
    if (sprite) {
      sprite.playAnimation('idle');
    }
  }

  /**
   * 移除死亡实体
   * @param {Entity} entity - 实体
   */
  removeDeadEntity(entity) {
    entity.isDead = true;
    console.log(`移除死亡实体: ${entity.name || entity.id}`);
    
    // 如果死亡的是当前目标，清除选中
    if (this.selectedTarget === entity) {
      this.clearTarget();
    }
    
    // 实际的实体移除应该由场景管理器处理
    // 这里只是标记为已死亡
  }

  /**
   * 获取死亡实体列表
   * @param {Array<Entity>} entities - 实体列表
   * @returns {Array<Entity>} 死亡的实体列表
   */
  getDeadEntities(entities) {
    return entities.filter(e => e.isDead === true);
  }

  /**
   * 获取存活实体列表
   * @param {Array<Entity>} entities - 实体列表
   * @returns {Array<Entity>} 存活的实体列表
   */
  getAliveEntities(entities) {
    return entities.filter(e => !e.isDead);
  }

  /**
   * 获取攻击冷却进度
   * @param {Entity} entity - 实体
   * @param {number} currentTime - 当前时间（可选，默认使用 performance.now()）
   * @returns {number} 冷却进度 0-1
   */
  getAttackCooldownProgress(entity, currentTime = null) {
    const combat = entity.getComponent('combat');
    if (!combat) return 1;
    
    // 如果从未攻击过，冷却完成
    if (combat.lastAttackTime === 0) return 1;
    
    const time = currentTime !== null ? currentTime : performance.now();
    const remaining = combat.getAttackCooldownRemaining(time);
    const progress = 1 - (remaining / combat.attackCooldown);
    
    return Math.max(0, Math.min(1, progress));
  }

  /**
   * 世界坐标转屏幕坐标
   * @param {Object} worldPos - 世界坐标 {x, y}
   * @returns {Object} 屏幕坐标 {x, y}
   */
  worldToScreen(worldPos) {
    if (!this.camera) {
      return { x: worldPos.x, y: worldPos.y };
    }
    
    const viewBounds = this.camera.getViewBounds();
    return {
      x: worldPos.x - viewBounds.left,
      y: worldPos.y - viewBounds.top
    };
  }

  // ==================== 大规模战斗系统 ====================

  /**
   * 初始化大规模战斗
   * @param {Object} config - 战斗配置
   * @param {Array<Entity>} config.allies - 友军单位列表
   * @param {Array<Entity>} config.enemies - 敌军单位列表
   * @param {Object} config.battleArea - 战场区域 {x, y, width, height}
   */
  initLargeScaleBattle(config) {
    this.largeBattle = {
      active: true,
      allies: config.allies || [],
      enemies: config.enemies || [],
      battleArea: config.battleArea || { x: 0, y: 0, width: 2000, height: 2000 },
      allyMorale: 100,
      enemyMorale: 100,
      battleState: 'ongoing', // 'ongoing', 'ally_victory', 'enemy_victory'
      startTime: performance.now()
    };

    // 为所有单位设置阵营标记
    for (const ally of this.largeBattle.allies) {
      ally.faction = 'ally';
      ally.isAI = true; // 标记为AI控制
    }

    for (const enemy of this.largeBattle.enemies) {
      enemy.faction = 'enemy';
      enemy.isAI = true;
    }

    console.log(`CombatSystem: 初始化大规模战斗 - 友军: ${this.largeBattle.allies.length}, 敌军: ${this.largeBattle.enemies.length}`);
  }

  /**
   * 更新大规模战斗
   * @param {number} deltaTime - 帧间隔时间（秒）
   * @param {number} currentTime - 当前时间（毫秒）
   */
  updateLargeScaleBattle(deltaTime, currentTime) {
    if (!this.largeBattle || !this.largeBattle.active) return;

    // 更新友军AI
    this.updateArmyAI(this.largeBattle.allies, this.largeBattle.enemies, currentTime);

    // 更新敌军AI
    this.updateArmyAI(this.largeBattle.enemies, this.largeBattle.allies, currentTime);

    // 更新战场态势
    this.updateBattleSituation();

    // 更新士气系统
    this.updateMorale(deltaTime);

    // 检查战斗结束条件
    this.checkBattleEndCondition();
  }

  /**
   * 更新军队AI
   * @param {Array<Entity>} army - 军队单位列表
   * @param {Array<Entity>} enemies - 敌军单位列表
   * @param {number} currentTime - 当前时间（毫秒）
   */
  updateArmyAI(army, enemies, currentTime) {
    for (const unit of army) {
      // 跳过死亡单位
      if (unit.isDead || unit.isDying) continue;

      // 跳过玩家控制的单位
      if (unit.type === 'player') continue;

      const combat = unit.getComponent('combat');
      if (!combat) continue;

      // 如果没有目标或目标已死亡，寻找新目标
      if (!combat.hasTarget() || this.isTargetDead(combat.target)) {
        const newTarget = this.findNearestEnemy(unit, enemies);
        if (newTarget) {
          combat.setTarget(newTarget);
        }
      }

      // 如果有目标，尝试攻击
      if (combat.hasTarget()) {
        const target = combat.target;

        // 检查是否在攻击范围内
        if (this.isInRange(unit, target, combat.attackRange)) {
          // 在范围内，尝试攻击
          if (combat.canAttack(currentTime)) {
            this.performAttack(unit, target, currentTime);
          }
        } else {
          // 不在范围内，移动到目标
          this.moveTowardsTarget(unit, target);
        }
      }
    }
  }

  /**
   * 检查目标是否死亡
   * @param {Entity} target - 目标实体
   * @returns {boolean}
   */
  isTargetDead(target) {
    if (!target) return true;
    const stats = target.getComponent('stats');
    return !stats || stats.hp <= 0 || target.isDead;
  }

  /**
   * 查找最近的敌人
   * @param {Entity} unit - 单位
   * @param {Array<Entity>} enemies - 敌军列表
   * @returns {Entity|null}
   */
  findNearestEnemy(unit, enemies) {
    const unitTransform = unit.getComponent('transform');
    if (!unitTransform) return null;

    let nearestEnemy = null;
    let nearestDistance = Infinity;

    for (const enemy of enemies) {
      // 跳过死亡敌人
      if (enemy.isDead || enemy.isDying) continue;

      const enemyStats = enemy.getComponent('stats');
      if (!enemyStats || enemyStats.hp <= 0) continue;

      const enemyTransform = enemy.getComponent('transform');
      if (!enemyTransform) continue;

      const dx = enemyTransform.position.x - unitTransform.position.x;
      const dy = enemyTransform.position.y - unitTransform.position.y;
      const distance = Math.sqrt(dx * dx + dy * dy);

      if (distance < nearestDistance) {
        nearestDistance = distance;
        nearestEnemy = enemy;
      }
    }

    return nearestEnemy;
  }

  /**
   * 移动到目标
   * @param {Entity} unit - 单位
   * @param {Entity} target - 目标
   */
  moveTowardsTarget(unit, target) {
    const unitTransform = unit.getComponent('transform');
    const targetTransform = target.getComponent('transform');
    const movement = unit.getComponent('movement');

    if (!unitTransform || !targetTransform || !movement) return;

    // 计算方向
    const dx = targetTransform.position.x - unitTransform.position.x;
    const dy = targetTransform.position.y - unitTransform.position.y;
    const distance = Math.sqrt(dx * dx + dy * dy);

    if (distance > 0) {
      // 归一化方向
      const dirX = dx / distance;
      const dirY = dy / distance;

      // 设置移动速度
      movement.velocity.x = dirX * movement.speed;
      movement.velocity.y = dirY * movement.speed;
    }
  }

  /**
   * 更新战场态势
   */
  updateBattleSituation() {
    if (!this.largeBattle) return;

    // 统计存活单位数量
    const aliveAllies = this.largeBattle.allies.filter(u => !u.isDead && !u.isDying).length;
    const aliveEnemies = this.largeBattle.enemies.filter(u => !u.isDead && !u.isDying).length;

    // 计算战场态势（-1到1，负数表示敌军优势，正数表示友军优势）
    const totalUnits = aliveAllies + aliveEnemies;
    if (totalUnits > 0) {
      this.largeBattle.situation = (aliveAllies - aliveEnemies) / totalUnits;
    } else {
      this.largeBattle.situation = 0;
    }

    // 存储单位数量
    this.largeBattle.aliveAllies = aliveAllies;
    this.largeBattle.aliveEnemies = aliveEnemies;
  }

  /**
   * 更新士气系统
   * @param {number} deltaTime - 帧间隔时间（秒）
   */
  updateMorale(deltaTime) {
    if (!this.largeBattle) return;

    // 根据战场态势调整士气
    const situation = this.largeBattle.situation || 0;

    // 友军士气变化
    if (situation > 0.3) {
      // 友军优势，士气上升
      this.largeBattle.allyMorale = Math.min(100, this.largeBattle.allyMorale + 5 * deltaTime);
    } else if (situation < -0.3) {
      // 友军劣势，士气下降
      this.largeBattle.allyMorale = Math.max(0, this.largeBattle.allyMorale - 10 * deltaTime);
    }

    // 敌军士气变化
    if (situation < -0.3) {
      // 敌军优势，士气上升
      this.largeBattle.enemyMorale = Math.min(100, this.largeBattle.enemyMorale + 5 * deltaTime);
    } else if (situation > 0.3) {
      // 敌军劣势，士气下降
      this.largeBattle.enemyMorale = Math.max(0, this.largeBattle.enemyMorale - 10 * deltaTime);
    }

    // 应用士气效果到单位
    this.applyMoraleEffects(this.largeBattle.allies, this.largeBattle.allyMorale);
    this.applyMoraleEffects(this.largeBattle.enemies, this.largeBattle.enemyMorale);
  }

  /**
   * 应用士气效果
   * @param {Array<Entity>} army - 军队单位列表
   * @param {number} morale - 士气值（0-100）
   */
  applyMoraleEffects(army, morale) {
    // 士气影响攻击力和防御力
    const moraleMultiplier = 0.5 + (morale / 100) * 0.5; // 0.5x 到 1.0x

    for (const unit of army) {
      if (unit.isDead || unit.isDying) continue;

      const stats = unit.getComponent('stats');
      if (!stats) continue;

      // 存储士气加成（用于伤害计算）
      stats.moraleMultiplier = moraleMultiplier;
    }
  }

  /**
   * 检查战斗结束条件
   */
  checkBattleEndCondition() {
    if (!this.largeBattle || this.largeBattle.battleState !== 'ongoing') return;

    const aliveAllies = this.largeBattle.aliveAllies || 0;
    const aliveEnemies = this.largeBattle.aliveEnemies || 0;

    // 检查友军全灭
    if (aliveAllies === 0) {
      this.largeBattle.battleState = 'enemy_victory';
      console.log('CombatSystem: 战斗结束 - 敌军胜利');
      this.onBattleEnd('enemy_victory');
      return;
    }

    // 检查敌军全灭
    if (aliveEnemies === 0) {
      this.largeBattle.battleState = 'ally_victory';
      console.log('CombatSystem: 战斗结束 - 友军胜利');
      this.onBattleEnd('ally_victory');
      return;
    }

    // 检查士气崩溃
    if (this.largeBattle.allyMorale <= 0) {
      this.largeBattle.battleState = 'enemy_victory';
      console.log('CombatSystem: 战斗结束 - 友军士气崩溃');
      this.onBattleEnd('enemy_victory');
      return;
    }

    if (this.largeBattle.enemyMorale <= 0) {
      this.largeBattle.battleState = 'ally_victory';
      console.log('CombatSystem: 战斗结束 - 敌军士气崩溃');
      this.onBattleEnd('ally_victory');
      return;
    }
  }

  /**
   * 战斗结束回调
   * @param {string} result - 战斗结果 'ally_victory' 或 'enemy_victory'
   */
  onBattleEnd(result) {
    if (!this.largeBattle) return;

    this.largeBattle.active = false;
    this.largeBattle.endTime = performance.now();
    this.largeBattle.duration = (this.largeBattle.endTime - this.largeBattle.startTime) / 1000;

    // 触发战斗结束事件（可以被外部监听）
    if (this.onBattleEndCallback) {
      this.onBattleEndCallback(result, this.largeBattle);
    }
  }

  /**
   * 设置战斗结束回调
   * @param {Function} callback - 回调函数
   */
  setOnBattleEndCallback(callback) {
    this.onBattleEndCallback = callback;
  }

  /**
   * 获取战场态势
   * @returns {Object} 战场态势信息
   */
  getBattleSituation() {
    if (!this.largeBattle) return null;

    return {
      active: this.largeBattle.active,
      aliveAllies: this.largeBattle.aliveAllies || 0,
      aliveEnemies: this.largeBattle.aliveEnemies || 0,
      allyMorale: this.largeBattle.allyMorale,
      enemyMorale: this.largeBattle.enemyMorale,
      situation: this.largeBattle.situation || 0,
      battleState: this.largeBattle.battleState
    };
  }

  /**
   * 渲染战场态势UI
   * @param {CanvasRenderingContext2D} ctx - 渲染上下文
   */
  renderBattleSituation(ctx) {
    if (!this.largeBattle || !this.largeBattle.active) return;

    const situation = this.getBattleSituation();
    if (!situation) return;

    // 战场态势面板位置（屏幕左上角）
    const panelX = 20;
    const panelY = 20;
    const panelWidth = 250;
    const panelHeight = 120;

    ctx.save();

    // 绘制背景
    ctx.fillStyle = 'rgba(0, 0, 0, 0.7)';
    ctx.fillRect(panelX, panelY, panelWidth, panelHeight);

    // 绘制边框
    ctx.strokeStyle = '#ffffff';
    ctx.lineWidth = 2;
    ctx.strokeRect(panelX, panelY, panelWidth, panelHeight);

    // 绘制标题
    ctx.fillStyle = '#ffffff';
    ctx.font = 'bold 16px Arial';
    ctx.textAlign = 'left';
    ctx.fillText('战场态势', panelX + 10, panelY + 25);

    // 绘制单位数量
    ctx.font = '14px Arial';
    ctx.fillStyle = '#00ff00';
    ctx.fillText(`友军: ${situation.aliveAllies}`, panelX + 10, panelY + 50);

    ctx.fillStyle = '#ff0000';
    ctx.fillText(`敌军: ${situation.aliveEnemies}`, panelX + 130, panelY + 50);

    // 绘制士气条
    const moraleBarY = panelY + 65;
    const moraleBarHeight = 15;

    // 友军士气
    ctx.fillStyle = '#333333';
    ctx.fillRect(panelX + 10, moraleBarY, 100, moraleBarHeight);
    ctx.fillStyle = '#00ff00';
    ctx.fillRect(panelX + 10, moraleBarY, situation.allyMorale, moraleBarHeight);
    ctx.fillStyle = '#ffffff';
    ctx.font = '12px Arial';
    ctx.textAlign = 'center';
    ctx.fillText('友军士气', panelX + 60, moraleBarY + 12);

    // 敌军士气
    ctx.fillStyle = '#333333';
    ctx.fillRect(panelX + 130, moraleBarY, 100, moraleBarHeight);
    ctx.fillStyle = '#ff0000';
    ctx.fillRect(panelX + 130, moraleBarY, situation.enemyMorale, moraleBarHeight);
    ctx.fillStyle = '#ffffff';
    ctx.fillText('敌军士气', panelX + 180, moraleBarY + 12);

    // 绘制战场态势指示器
    const indicatorY = panelY + 95;
    const indicatorWidth = 200;
    const indicatorX = panelX + 25;

    // 背景
    ctx.fillStyle = '#333333';
    ctx.fillRect(indicatorX, indicatorY, indicatorWidth, 10);

    // 态势指示器（-1到1映射到0到200）
    const indicatorPos = indicatorX + (situation.situation + 1) * 100;
    ctx.fillStyle = situation.situation > 0 ? '#00ff00' : '#ff0000';
    ctx.beginPath();
    ctx.arc(indicatorPos, indicatorY + 5, 8, 0, Math.PI * 2);
    ctx.fill();

    // 中线
    ctx.strokeStyle = '#ffffff';
    ctx.lineWidth = 1;
    ctx.beginPath();
    ctx.moveTo(indicatorX + 100, indicatorY);
    ctx.lineTo(indicatorX + 100, indicatorY + 10);
    ctx.stroke();

    ctx.restore();
  }

  /**
   * 结束大规模战斗
   */
  endLargeScaleBattle() {
    if (this.largeBattle) {
      this.largeBattle.active = false;
      console.log('CombatSystem: 大规模战斗已结束');
    }
  }
}
