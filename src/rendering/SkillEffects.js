/**
 * SkillEffects.js
 * 技能特效系统 - 为不同技能创建粒子特效
 */

/**
 * 技能特效管理器
 * 负责创建和管理技能相关的粒子特效
 */
export class SkillEffects {
  /**
   * @param {ParticleSystem} particleSystem - 粒子系统
   */
  constructor(particleSystem) {
    this.particleSystem = particleSystem;
    
    // 活跃的发射器列表
    this.activeEmitters = [];
    
    // 抛射物列表（如火球、箭矢等）
    this.projectiles = [];
    
    console.log('SkillEffects: Initialized');
  }

  /**
   * 更新所有特效
   * @param {number} deltaTime - 时间增量（秒）
   */
  update(deltaTime) {
    // 更新发射器
    for (let i = this.activeEmitters.length - 1; i >= 0; i--) {
      const emitter = this.activeEmitters[i];
      this.particleSystem.updateEmitter(emitter, deltaTime);
      
      // 移除不活跃的发射器
      if (!emitter.active) {
        this.activeEmitters.splice(i, 1);
      }
    }
    
    // 更新抛射物
    for (let i = this.projectiles.length - 1; i >= 0; i--) {
      const projectile = this.projectiles[i];
      this.updateProjectile(projectile, deltaTime);
      
      // 移除已完成的抛射物
      if (projectile.completed) {
        this.projectiles.splice(i, 1);
      }
    }
  }

  /**
   * 更新抛射物
   * @param {Object} projectile - 抛射物对象
   * @param {number} deltaTime - 时间增量（秒）
   */
  updateProjectile(projectile, deltaTime) {
    // 更新位置
    projectile.position.x += projectile.velocity.x * deltaTime;
    projectile.position.y += projectile.velocity.y * deltaTime;
    
    // 更新生命周期
    projectile.elapsed += deltaTime;
    
    // 发射尾迹粒子
    if (projectile.trailConfig) {
      this.particleSystem.emit({
        ...projectile.trailConfig,
        position: { ...projectile.position }
      });
    }
    
    // 检查是否到达目标或超时
    if (projectile.target) {
      const dx = projectile.target.x - projectile.position.x;
      const dy = projectile.target.y - projectile.position.y;
      const distance = Math.sqrt(dx * dx + dy * dy);
      
      if (distance < 20 || projectile.elapsed >= projectile.maxLife) {
        // 到达目标，触发命中效果
        if (projectile.onHit) {
          projectile.onHit(projectile.position);
        }
        projectile.completed = true;
      }
    } else if (projectile.elapsed >= projectile.maxLife) {
      projectile.completed = true;
    }
  }

  /**
   * 渲染抛射物
   * @param {CanvasRenderingContext2D} ctx - 渲染上下文
   * @param {Object} camera - 相机对象
   */
  render(ctx, camera) {
    const viewBounds = camera.getViewBounds();
    
    for (const projectile of this.projectiles) {
      // 转换为屏幕坐标
      const screenX = projectile.position.x - viewBounds.left;
      const screenY = projectile.position.y - viewBounds.top;
      
      // 绘制抛射物
      ctx.save();
      ctx.fillStyle = projectile.color || '#ffffff';
      ctx.globalAlpha = 1 - (projectile.elapsed / projectile.maxLife);
      
      if (projectile.shape === 'circle') {
        ctx.beginPath();
        ctx.arc(screenX, screenY, projectile.size || 5, 0, Math.PI * 2);
        ctx.fill();
      } else if (projectile.shape === 'rect') {
        ctx.fillRect(
          screenX - (projectile.size || 5) / 2,
          screenY - (projectile.size || 5) / 2,
          projectile.size || 5,
          projectile.size || 5
        );
      }
      
      ctx.restore();
    }
  }

  /**
   * 创建技能释放特效
   * @param {string} skillId - 技能ID
   * @param {Object} position - 释放位置
   * @param {Object} target - 目标位置（可选）
   * @param {Function} onHit - 命中回调（可选）
   */
  createSkillEffect(skillId, position, target = null, onHit = null) {
    // 根据技能ID创建对应的特效
    switch (skillId) {
      // 通用攻击
      case 'basic_attack':
        this.createSlashEffect(position);
        break;
      
      // 战士技能
      case 'warrior_slash':
        this.createHeavySlashEffect(position);
        break;
      case 'warrior_charge':
        this.createChargeEffect(position, target);
        break;
      case 'warrior_defense':
        this.createShieldEffect(position);
        break;
      
      // 法师技能
      case 'mage_fireball':
        this.createFireballEffect(position, target, onHit);
        break;
      case 'mage_ice_lance':
        this.createIceLanceEffect(position, target, onHit);
        break;
      case 'mage_heal':
        this.createHealEffect(position);
        break;
      
      // 弓箭手技能
      case 'archer_multi_shot':
        this.createMultiArrowEffect(position, target, onHit);
        break;
      case 'archer_poison_arrow':
        this.createPoisonArrowEffect(position, target, onHit);
        break;
      case 'archer_trap':
        this.createTrapEffect(position);
        break;
      
      default:
        console.warn(`SkillEffects: Unknown skill effect: ${skillId}`);
        this.createDefaultEffect(position);
    }
  }

  /**
   * 创建斩击特效
   * @param {Object} position - 位置
   */
  createSlashEffect(position) {
    this.particleSystem.emitBurst(
      {
        position: { ...position },
        velocity: { x: 0, y: 0 },
        life: 300, // 毫秒
        size: 4,
        color: '#ffffff',
        gravity: 0
      },
      8,
      {
        velocityRange: { min: 50, max: 100 },
        angleRange: { min: 0, max: Math.PI * 2 },
        sizeRange: { min: 3, max: 6 }
      }
    );
  }

  /**
   * 创建强力斩击特效
   * @param {Object} position - 位置
   */
  createHeavySlashEffect(position) {
    // 更大更持久的斩击效果
    this.particleSystem.emitBurst(
      {
        position: { ...position },
        velocity: { x: 0, y: 0 },
        life: 500, // 毫秒
        size: 8,
        color: '#ff6600',
        gravity: 0
      },
      15,
      {
        velocityRange: { min: 80, max: 150 },
        angleRange: { min: 0, max: Math.PI * 2 },
        sizeRange: { min: 6, max: 10 }
      }
    );
  }

  /**
   * 创建冲锋特效
   * @param {Object} position - 起始位置
   * @param {Object} target - 目标位置
   */
  createChargeEffect(position, target) {
    if (!target) return;
    
    // 创建冲锋尾迹发射器
    const emitter = this.particleSystem.createEmitter({
      position: { ...position },
      particleConfig: {
        position: { ...position },
        velocity: { x: 0, y: 0 },
        life: 500, // 毫秒
        size: 6,
        color: '#ffaa00',
        gravity: 0
      },
      rate: 30,
      duration: 0.5
    });
    
    this.activeEmitters.push(emitter);
  }

  /**
   * 创建护盾特效
   * @param {Object} position - 位置
   */
  createShieldEffect(position) {
    // 创建环形粒子效果
    const particleCount = 20;
    for (let i = 0; i < particleCount; i++) {
      const angle = (i / particleCount) * Math.PI * 2;
      const radius = 40;
      
      this.particleSystem.emit({
        position: {
          x: position.x + Math.cos(angle) * radius,
          y: position.y + Math.sin(angle) * radius
        },
        velocity: { x: 0, y: 0 },
        life: 1000, // 毫秒
        size: 5,
        color: '#4444ff',
        gravity: 0
      });
    }
  }

  /**
   * 创建火球特效
   * @param {Object} position - 起始位置
   * @param {Object} target - 目标位置
   * @param {Function} onHit - 命中回调
   */
  createFireballEffect(position, target, onHit) {
    if (!target) return;
    
    // 计算方向
    const dx = target.x - position.x;
    const dy = target.y - position.y;
    const distance = Math.sqrt(dx * dx + dy * dy);
    const speed = 300; // 像素/秒
    
    // 创建火球抛射物
    const projectile = {
      position: { ...position },
      velocity: {
        x: (dx / distance) * speed,
        y: (dy / distance) * speed
      },
      target: { ...target },
      elapsed: 0,
      maxLife: distance / speed,
      size: 10,
      color: '#ff4400',
      shape: 'circle',
      trailConfig: {
        position: { ...position },
        velocity: { x: 0, y: 0 },
        life: 400, // 毫秒
        size: 8,
        color: '#ff6600',
        gravity: 0
      },
      onHit: (hitPos) => {
        this.createFireballHitEffect(hitPos);
        if (onHit) onHit(hitPos);
      },
      completed: false
    };
    
    this.projectiles.push(projectile);
  }

  /**
   * 创建火球命中特效
   * @param {Object} position - 命中位置
   */
  createFireballHitEffect(position) {
    // 爆炸效果
    this.particleSystem.emitBurst(
      {
        position: { ...position },
        velocity: { x: 0, y: 0 },
        life: 600, // 毫秒
        size: 10,
        color: '#ff4400',
        gravity: 50
      },
      25,
      {
        velocityRange: { min: 100, max: 200 },
        angleRange: { min: 0, max: Math.PI * 2 },
        sizeRange: { min: 8, max: 12 }
      }
    );
  }

  /**
   * 创建冰枪特效
   * @param {Object} position - 起始位置
   * @param {Object} target - 目标位置
   * @param {Function} onHit - 命中回调
   */
  createIceLanceEffect(position, target, onHit) {
    if (!target) return;
    
    // 计算方向
    const dx = target.x - position.x;
    const dy = target.y - position.y;
    const distance = Math.sqrt(dx * dx + dy * dy);
    const speed = 400; // 冰枪比火球快
    
    // 创建冰枪抛射物
    const projectile = {
      position: { ...position },
      velocity: {
        x: (dx / distance) * speed,
        y: (dy / distance) * speed
      },
      target: { ...target },
      elapsed: 0,
      maxLife: distance / speed,
      size: 8,
      color: '#44ccff',
      shape: 'rect',
      trailConfig: {
        position: { ...position },
        velocity: { x: 0, y: 0 },
        life: 300, // 毫秒
        size: 6,
        color: '#88ddff',
        gravity: 0
      },
      onHit: (hitPos) => {
        this.createIceLanceHitEffect(hitPos);
        if (onHit) onHit(hitPos);
      },
      completed: false
    };
    
    this.projectiles.push(projectile);
  }

  /**
   * 创建冰枪命中特效
   * @param {Object} position - 命中位置
   */
  createIceLanceHitEffect(position) {
    // 冰晶爆裂效果
    this.particleSystem.emitBurst(
      {
        position: { ...position },
        velocity: { x: 0, y: 0 },
        life: 500, // 毫秒
        size: 8,
        color: '#44ccff',
        gravity: 100
      },
      20,
      {
        velocityRange: { min: 80, max: 150 },
        angleRange: { min: 0, max: Math.PI * 2 },
        sizeRange: { min: 6, max: 10 }
      }
    );
  }

  /**
   * 创建治疗特效
   * @param {Object} position - 位置
   */
  createHealEffect(position) {
    // 创建向上飘动的治疗粒子
    const emitter = this.particleSystem.createEmitter({
      position: { ...position },
      particleConfig: {
        position: { ...position },
        velocity: { x: 0, y: -50 },
        life: 1500, // 毫秒
        size: 6,
        color: '#00ff88',
        gravity: -20 // 负重力，向上飘
      },
      rate: 20,
      duration: 1.0
    });
    
    this.activeEmitters.push(emitter);
    
    // 额外的光环效果
    this.particleSystem.emitBurst(
      {
        position: { ...position },
        velocity: { x: 0, y: 0 },
        life: 1000, // 毫秒
        size: 8,
        color: '#00ff88',
        gravity: 0
      },
      15,
      {
        velocityRange: { min: 30, max: 60 },
        angleRange: { min: 0, max: Math.PI * 2 },
        sizeRange: { min: 6, max: 10 }
      }
    );
  }

  /**
   * 创建多重箭矢特效
   * @param {Object} position - 起始位置
   * @param {Object} target - 目标位置
   * @param {Function} onHit - 命中回调
   */
  createMultiArrowEffect(position, target, onHit) {
    if (!target) return;
    
    // 创建3支箭，稍微分散
    const angles = [-0.2, 0, 0.2]; // 弧度偏移
    
    for (const angleOffset of angles) {
      const dx = target.x - position.x;
      const dy = target.y - position.y;
      const baseAngle = Math.atan2(dy, dx);
      const angle = baseAngle + angleOffset;
      const speed = 350;
      
      const projectile = {
        position: { ...position },
        velocity: {
          x: Math.cos(angle) * speed,
          y: Math.sin(angle) * speed
        },
        target: { ...target },
        elapsed: 0,
        maxLife: 1.5,
        size: 6,
        color: '#ffaa00',
        shape: 'rect',
        trailConfig: {
          position: { ...position },
          velocity: { x: 0, y: 0 },
          life: 200, // 毫秒
          size: 4,
          color: '#ffcc44',
          gravity: 0
        },
        onHit: (hitPos) => {
          this.createArrowHitEffect(hitPos);
          if (onHit) onHit(hitPos);
        },
        completed: false
      };
      
      this.projectiles.push(projectile);
    }
  }

  /**
   * 创建箭矢命中特效
   * @param {Object} position - 命中位置
   */
  createArrowHitEffect(position) {
    this.particleSystem.emitBurst(
      {
        position: { ...position },
        velocity: { x: 0, y: 0 },
        life: 300, // 毫秒
        size: 5,
        color: '#ffaa00',
        gravity: 0
      },
      10,
      {
        velocityRange: { min: 50, max: 100 },
        angleRange: { min: 0, max: Math.PI * 2 },
        sizeRange: { min: 3, max: 6 }
      }
    );
  }

  /**
   * 创建毒箭特效
   * @param {Object} position - 起始位置
   * @param {Object} target - 目标位置
   * @param {Function} onHit - 命中回调
   */
  createPoisonArrowEffect(position, target, onHit) {
    if (!target) return;
    
    const dx = target.x - position.x;
    const dy = target.y - position.y;
    const distance = Math.sqrt(dx * dx + dy * dy);
    const speed = 350;
    
    const projectile = {
      position: { ...position },
      velocity: {
        x: (dx / distance) * speed,
        y: (dy / distance) * speed
      },
      target: { ...target },
      elapsed: 0,
      maxLife: distance / speed,
      size: 6,
      color: '#88ff00',
      shape: 'rect',
      trailConfig: {
        position: { ...position },
        velocity: { x: 0, y: 0 },
        life: 400, // 毫秒
        size: 5,
        color: '#66cc00',
        gravity: 0
      },
      onHit: (hitPos) => {
        this.createPoisonHitEffect(hitPos);
        if (onHit) onHit(hitPos);
      },
      completed: false
    };
    
    this.projectiles.push(projectile);
  }

  /**
   * 创建毒素命中特效
   * @param {Object} position - 命中位置
   */
  createPoisonHitEffect(position) {
    // 毒云效果
    const emitter = this.particleSystem.createEmitter({
      position: { ...position },
      particleConfig: {
        position: { ...position },
        velocity: { x: 0, y: 0 },
        life: 1000, // 毫秒
        size: 8,
        color: '#88ff00',
        gravity: -10
      },
      rate: 15,
      duration: 0.8
    });
    
    this.activeEmitters.push(emitter);
  }

  /**
   * 创建陷阱特效
   * @param {Object} position - 位置
   */
  createTrapEffect(position) {
    // 陷阱放置效果
    this.particleSystem.emitBurst(
      {
        position: { ...position },
        velocity: { x: 0, y: 0 },
        life: 500, // 毫秒
        size: 6,
        color: '#996633',
        gravity: 100
      },
      12,
      {
        velocityRange: { min: 40, max: 80 },
        angleRange: { min: 0, max: Math.PI * 2 },
        sizeRange: { min: 4, max: 8 }
      }
    );
  }

  /**
   * 创建默认特效
   * @param {Object} position - 位置
   */
  createDefaultEffect(position) {
    this.particleSystem.emitBurst(
      {
        position: { ...position },
        velocity: { x: 0, y: 0 },
        life: 500, // 毫秒
        size: 5,
        color: '#ffffff',
        gravity: 0
      },
      10,
      {
        velocityRange: { min: 50, max: 100 },
        angleRange: { min: 0, max: Math.PI * 2 }
      }
    );
  }

  /**
   * 清除所有特效
   */
  clear() {
    this.activeEmitters = [];
    this.projectiles = [];
  }
}
