import { describe, it, expect, beforeEach, vi } from 'vitest';
import { SkillEffects } from './SkillEffects.js';
import { ParticleSystem } from './ParticleSystem.js';

describe('SkillEffects', () => {
  let particleSystem;
  let skillEffects;

  beforeEach(() => {
    particleSystem = new ParticleSystem(1000);
    skillEffects = new SkillEffects(particleSystem);
  });

  it('应该正确初始化技能特效配置', () => {
    const config = skillEffects.getEffectConfig('fireball');
    expect(config).toBeDefined();
    expect(config.cast).toBeDefined();
    expect(config.projectile).toBeDefined();
    expect(config.hit).toBeDefined();
  });

  it('应该能够播放施法特效', () => {
    const initialCount = particleSystem.getActiveCount();
    
    skillEffects.playCastEffect('fireball', { x: 100, y: 100 });
    
    expect(particleSystem.getActiveCount()).toBeGreaterThan(initialCount);
  });

  it('应该能够创建投射物特效', () => {
    const projectile = skillEffects.createProjectileEffect(
      'fireball',
      { x: 0, y: 0 },
      { x: 100, y: 100 },
      1.0,
      () => {}
    );

    expect(projectile).toBeDefined();
    expect(projectile.active).toBe(true);
    expect(projectile.position).toEqual({ x: 0, y: 0 });
    expect(projectile.target).toEqual({ x: 100, y: 100 });
  });

  it('应该能够更新投射物位置', () => {
    const projectile = skillEffects.createProjectileEffect(
      'fireball',
      { x: 0, y: 0 },
      { x: 100, y: 100 },
      1.0,
      () => {}
    );

    skillEffects.updateProjectileEffect(projectile, 0.5);
    
    // 50% 进度，应该接近中点
    expect(projectile.position.x).toBeGreaterThan(40);
    expect(projectile.position.x).toBeLessThan(60);
  });

  it('投射物到达目标后应该触发回调', () => {
    let callbackCalled = false;
    
    const projectile = skillEffects.createProjectileEffect(
      'fireball',
      { x: 0, y: 0 },
      { x: 100, y: 100 },
      1.0,
      () => { callbackCalled = true; }
    );

    skillEffects.updateProjectileEffect(projectile, 1.0);
    
    expect(projectile.active).toBe(false);
    expect(callbackCalled).toBe(true);
  });

  it('应该能够播放命中特效', () => {
    const initialCount = particleSystem.getActiveCount();
    
    skillEffects.playHitEffect('fireball', { x: 200, y: 200 });
    
    expect(particleSystem.getActiveCount()).toBeGreaterThan(initialCount);
  });

  it('应该能够播放完整技能特效序列', () => {
    const projectile = skillEffects.playSkillEffect(
      'fireball',
      { x: 0, y: 0 },
      { x: 100, y: 100 },
      500
    );

    expect(projectile).toBeDefined();
    expect(particleSystem.getActiveCount()).toBeGreaterThan(0);
  });

  it('没有投射物的技能应该直接播放命中特效', () => {
    vi.useFakeTimers();
    
    const projectile = skillEffects.playSkillEffect(
      'attack',
      { x: 0, y: 0 },
      { x: 100, y: 100 }
    );

    expect(projectile).toBeNull();
    
    vi.advanceTimersByTime(200);
    expect(particleSystem.getActiveCount()).toBeGreaterThan(0);
    
    vi.useRealTimers();
  });

  it('应该能够添加自定义技能特效配置', () => {
    const customConfig = {
      cast: {
        color: '#ff00ff',
        size: 10,
        life: 1000,
        count: 20,
        speed: 100,
        gravity: 0
      }
    };

    skillEffects.addEffectConfig('customSkill', customConfig);
    
    const config = skillEffects.getEffectConfig('customSkill');
    expect(config).toEqual(customConfig);
  });

  it('不存在的技能应该返回null配置', () => {
    const config = skillEffects.getEffectConfig('nonexistent');
    expect(config).toBeNull();
  });

  it('应该支持多种预设技能特效', () => {
    const skills = ['fireball', 'icebolt', 'lightning', 'heal', 'attack', 'heavyStrike', 'arrow', 'shield'];
    
    skills.forEach(skillId => {
      const config = skillEffects.getEffectConfig(skillId);
      expect(config).toBeDefined();
    });
  });
});
