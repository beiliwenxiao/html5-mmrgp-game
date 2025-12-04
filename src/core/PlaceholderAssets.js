/**
 * 占位符资源生成器
 * 用于生成简单的占位符精灵图和UI元素
 */
export class PlaceholderAssets {
    constructor() {
        this.cache = new Map();
    }

    /**
     * 创建角色精灵（不同职业）
     * @param {string} className - 职业名称 ('warrior', 'mage', 'archer')
     * @param {number} size - 精灵大小
     * @returns {HTMLCanvasElement}
     */
    createCharacterSprite(className, size = 64) {
        const key = `character_${className}_${size}`;
        if (this.cache.has(key)) {
            return this.cache.get(key);
        }

        const canvas = document.createElement('canvas');
        canvas.width = size;
        canvas.height = size;
        const ctx = canvas.getContext('2d');

        // 根据职业选择颜色
        const colors = {
            warrior: { primary: '#FF6B6B', secondary: '#C92A2A' },
            mage: { primary: '#4DABF7', secondary: '#1971C2' },
            archer: { primary: '#51CF66', secondary: '#2F9E44' }
        };

        const color = colors[className] || colors.warrior;

        // 绘制身体（圆形）
        ctx.fillStyle = color.primary;
        ctx.beginPath();
        ctx.arc(size / 2, size / 2, size / 3, 0, Math.PI * 2);
        ctx.fill();

        // 绘制头部（小圆）
        ctx.fillStyle = '#FFE0B2';
        ctx.beginPath();
        ctx.arc(size / 2, size / 3, size / 6, 0, Math.PI * 2);
        ctx.fill();

        // 绘制职业标识
        ctx.fillStyle = color.secondary;
        ctx.font = `bold ${size / 3}px Arial`;
        ctx.textAlign = 'center';
        ctx.textBaseline = 'middle';
        const symbols = { warrior: '⚔', mage: '✦', archer: '➶' };
        ctx.fillText(symbols[className] || '?', size / 2, size * 0.65);

        this.cache.set(key, canvas);
        return canvas;
    }

    /**
     * 创建敌人精灵
     * @param {string} enemyType - 敌人类型 ('slime', 'goblin', 'skeleton')
     * @param {number} size - 精灵大小
     * @returns {HTMLCanvasElement}
     */
    createEnemySprite(enemyType, size = 64) {
        const key = `enemy_${enemyType}_${size}`;
        if (this.cache.has(key)) {
            return this.cache.get(key);
        }

        const canvas = document.createElement('canvas');
        canvas.width = size;
        canvas.height = size;
        const ctx = canvas.getContext('2d');

        // 根据敌人类型选择颜色和形状
        const enemies = {
            slime: { color: '#69DB7C', shape: 'blob' },
            goblin: { color: '#8CE99A', shape: 'humanoid' },
            skeleton: { color: '#E9ECEF', shape: 'humanoid' }
        };

        const enemy = enemies[enemyType] || enemies.slime;

        if (enemy.shape === 'blob') {
            // 绘制史莱姆（椭圆形）
            ctx.fillStyle = enemy.color;
            ctx.beginPath();
            ctx.ellipse(size / 2, size * 0.6, size / 3, size / 4, 0, 0, Math.PI * 2);
            ctx.fill();

            // 眼睛
            ctx.fillStyle = '#000';
            ctx.beginPath();
            ctx.arc(size / 2 - size / 8, size * 0.55, size / 16, 0, Math.PI * 2);
            ctx.arc(size / 2 + size / 8, size * 0.55, size / 16, 0, Math.PI * 2);
            ctx.fill();
        } else {
            // 绘制类人形敌人
            ctx.fillStyle = enemy.color;
            ctx.beginPath();
            ctx.arc(size / 2, size / 2, size / 3, 0, Math.PI * 2);
            ctx.fill();

            // 头部
            ctx.fillStyle = enemy.color;
            ctx.beginPath();
            ctx.arc(size / 2, size / 3, size / 6, 0, Math.PI * 2);
            ctx.fill();

            // 敌对标识（红色X）
            ctx.strokeStyle = '#FA5252';
            ctx.lineWidth = 3;
            ctx.beginPath();
            ctx.moveTo(size / 2 - size / 8, size / 2 - size / 8);
            ctx.lineTo(size / 2 + size / 8, size / 2 + size / 8);
            ctx.moveTo(size / 2 + size / 8, size / 2 - size / 8);
            ctx.lineTo(size / 2 - size / 8, size / 2 + size / 8);
            ctx.stroke();
        }

        this.cache.set(key, canvas);
        return canvas;
    }

    /**
     * 创建技能图标
     * @param {string} skillName - 技能名称
     * @param {number} size - 图标大小
     * @returns {HTMLCanvasElement}
     */
    createSkillIcon(skillName, size = 48) {
        const key = `skill_${skillName}_${size}`;
        if (this.cache.has(key)) {
            return this.cache.get(key);
        }

        const canvas = document.createElement('canvas');
        canvas.width = size;
        canvas.height = size;
        const ctx = canvas.getContext('2d');

        // 技能图标配色方案
        const skillColors = {
            attack: { bg: '#FA5252', icon: '#FFF' },
            fireball: { bg: '#FF6B6B', icon: '#FFE066' },
            heal: { bg: '#51CF66', icon: '#FFF' },
            shield: { bg: '#4DABF7', icon: '#FFF' },
            arrow: { bg: '#51CF66', icon: '#FFF' },
            frost: { bg: '#74C0FC', icon: '#FFF' },
            default: { bg: '#868E96', icon: '#FFF' }
        };

        const colors = skillColors[skillName] || skillColors.default;

        // 绘制背景（圆角矩形）
        ctx.fillStyle = colors.bg;
        this.roundRect(ctx, 2, 2, size - 4, size - 4, 8);
        ctx.fill();

        // 绘制边框
        ctx.strokeStyle = '#000';
        ctx.lineWidth = 2;
        this.roundRect(ctx, 2, 2, size - 4, size - 4, 8);
        ctx.stroke();

        // 绘制技能符号
        ctx.fillStyle = colors.icon;
        ctx.font = `bold ${size / 2}px Arial`;
        ctx.textAlign = 'center';
        ctx.textBaseline = 'middle';
        
        const symbols = {
            attack: '⚔',
            fireball: '🔥',
            heal: '✚',
            shield: '🛡',
            arrow: '➶',
            frost: '❄'
        };
        
        ctx.fillText(symbols[skillName] || '?', size / 2, size / 2);

        this.cache.set(key, canvas);
        return canvas;
    }

    /**
     * 创建UI元素图片
     * @param {string} elementType - UI元素类型
     * @param {number} width - 宽度
     * @param {number} height - 高度
     * @returns {HTMLCanvasElement}
     */
    createUIElement(elementType, width = 200, height = 30) {
        const key = `ui_${elementType}_${width}_${height}`;
        if (this.cache.has(key)) {
            return this.cache.get(key);
        }

        const canvas = document.createElement('canvas');
        canvas.width = width;
        canvas.height = height;
        const ctx = canvas.getContext('2d');

        switch (elementType) {
            case 'healthbar_bg':
                // 生命值条背景
                ctx.fillStyle = '#2C2C2C';
                this.roundRect(ctx, 0, 0, width, height, 5);
                ctx.fill();
                ctx.strokeStyle = '#000';
                ctx.lineWidth = 2;
                this.roundRect(ctx, 0, 0, width, height, 5);
                ctx.stroke();
                break;

            case 'healthbar_fill':
                // 生命值条填充
                ctx.fillStyle = '#51CF66';
                this.roundRect(ctx, 2, 2, width - 4, height - 4, 3);
                ctx.fill();
                break;

            case 'manabar_fill':
                // 魔法值条填充
                ctx.fillStyle = '#4DABF7';
                this.roundRect(ctx, 2, 2, width - 4, height - 4, 3);
                ctx.fill();
                break;

            case 'button':
                // 按钮
                ctx.fillStyle = '#495057';
                this.roundRect(ctx, 0, 0, width, height, 8);
                ctx.fill();
                ctx.strokeStyle = '#ADB5BD';
                ctx.lineWidth = 2;
                this.roundRect(ctx, 0, 0, width, height, 8);
                ctx.stroke();
                break;

            case 'panel':
                // 面板背景
                ctx.fillStyle = 'rgba(33, 37, 41, 0.9)';
                this.roundRect(ctx, 0, 0, width, height, 10);
                ctx.fill();
                ctx.strokeStyle = '#495057';
                ctx.lineWidth = 2;
                this.roundRect(ctx, 0, 0, width, height, 10);
                ctx.stroke();
                break;

            default:
                // 默认矩形
                ctx.fillStyle = '#868E96';
                ctx.fillRect(0, 0, width, height);
                break;
        }

        this.cache.set(key, canvas);
        return canvas;
    }

    /**
     * 创建粒子纹理
     * @param {string} particleType - 粒子类型
     * @param {number} size - 粒子大小
     * @returns {HTMLCanvasElement}
     */
    createParticleTexture(particleType, size = 16) {
        const key = `particle_${particleType}_${size}`;
        if (this.cache.has(key)) {
            return this.cache.get(key);
        }

        const canvas = document.createElement('canvas');
        canvas.width = size;
        canvas.height = size;
        const ctx = canvas.getContext('2d');

        switch (particleType) {
            case 'fire':
                // 火焰粒子（渐变圆）
                const fireGradient = ctx.createRadialGradient(
                    size / 2, size / 2, 0,
                    size / 2, size / 2, size / 2
                );
                fireGradient.addColorStop(0, '#FFE066');
                fireGradient.addColorStop(0.5, '#FF6B6B');
                fireGradient.addColorStop(1, 'rgba(255, 107, 107, 0)');
                ctx.fillStyle = fireGradient;
                ctx.beginPath();
                ctx.arc(size / 2, size / 2, size / 2, 0, Math.PI * 2);
                ctx.fill();
                break;

            case 'heal':
                // 治疗粒子（绿色光点）
                const healGradient = ctx.createRadialGradient(
                    size / 2, size / 2, 0,
                    size / 2, size / 2, size / 2
                );
                healGradient.addColorStop(0, '#FFF');
                healGradient.addColorStop(0.3, '#51CF66');
                healGradient.addColorStop(1, 'rgba(81, 207, 102, 0)');
                ctx.fillStyle = healGradient;
                ctx.beginPath();
                ctx.arc(size / 2, size / 2, size / 2, 0, Math.PI * 2);
                ctx.fill();
                break;

            case 'frost':
                // 冰霜粒子（蓝色晶体）
                ctx.fillStyle = '#74C0FC';
                ctx.beginPath();
                for (let i = 0; i < 6; i++) {
                    const angle = (i / 6) * Math.PI * 2;
                    const x = size / 2 + Math.cos(angle) * size / 3;
                    const y = size / 2 + Math.sin(angle) * size / 3;
                    if (i === 0) ctx.moveTo(x, y);
                    else ctx.lineTo(x, y);
                }
                ctx.closePath();
                ctx.fill();
                break;

            case 'spark':
                // 火花粒子（星形）
                ctx.fillStyle = '#FFE066';
                ctx.beginPath();
                for (let i = 0; i < 8; i++) {
                    const angle = (i / 8) * Math.PI * 2;
                    const radius = i % 2 === 0 ? size / 2 : size / 4;
                    const x = size / 2 + Math.cos(angle) * radius;
                    const y = size / 2 + Math.sin(angle) * radius;
                    if (i === 0) ctx.moveTo(x, y);
                    else ctx.lineTo(x, y);
                }
                ctx.closePath();
                ctx.fill();
                break;

            default:
                // 默认圆形粒子
                ctx.fillStyle = '#FFF';
                ctx.beginPath();
                ctx.arc(size / 2, size / 2, size / 2, 0, Math.PI * 2);
                ctx.fill();
                break;
        }

        this.cache.set(key, canvas);
        return canvas;
    }

    /**
     * 辅助方法：绘制圆角矩形
     */
    roundRect(ctx, x, y, width, height, radius) {
        ctx.beginPath();
        ctx.moveTo(x + radius, y);
        ctx.lineTo(x + width - radius, y);
        ctx.quadraticCurveTo(x + width, y, x + width, y + radius);
        ctx.lineTo(x + width, y + height - radius);
        ctx.quadraticCurveTo(x + width, y + height, x + width - radius, y + height);
        ctx.lineTo(x + radius, y + height);
        ctx.quadraticCurveTo(x, y + height, x, y + height - radius);
        ctx.lineTo(x, y + radius);
        ctx.quadraticCurveTo(x, y, x + radius, y);
        ctx.closePath();
    }

    /**
     * 清除缓存
     */
    clearCache() {
        this.cache.clear();
    }

    /**
     * 获取缓存大小
     */
    getCacheSize() {
        return this.cache.size;
    }
}
